"""
bike_bridge.py — BLE ↔ UDP bridge for the ESP32 Bike Trainer.

Connects to the bike over BLE, then:
  - Forwards Indoor Bike Data as 6-byte UDP packets to Unity on port 5700
  - Listens on port 5701 for 3-byte command packets from Unity and writes
    them to the FTMS Control Point characteristic.

Packet formats (little-endian):
  Data (bridge → Unity, port 5700):
    [speed_u16 × 100][cadence_u16 × 2][power_i16]   = 6 bytes

  Commands (Unity → bridge, port 5701):
    [0x04][level_u8][0x00]              Manual resistance (0–100)
    [0x05][watts_low][watts_high]       ERG target power (int16 LE)
    [0x11][grade_low][grade_high]       Simulation grade (int16 LE, % × 100)

Requirements:
  pip install bleak

Usage (auto-launched by BikeManager.cs, or run manually for testing):
  python bike_bridge.py
"""

import asyncio
import socket
import struct
import sys

try:
    from bleak import BleakClient, BleakScanner
except ImportError:
    print("[bridge] ERROR: bleak not installed. Run: pip install bleak")
    sys.exit(1)

DEVICE_NAME    = "ESP32 Bike Trainer"
BIKE_DATA_UUID = "00002ad2-0000-1000-8000-00805f9b34fb"
CTRL_PT_UUID   = "00002ad9-0000-1000-8000-00805f9b34fb"
UNITY_HOST     = "127.0.0.1"
DATA_PORT      = 5700
CMD_PORT       = 5701

# UDP socket for sending data to Unity (fire and forget)
_data_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

# Global BLE client reference so the command protocol can reach it
_ble_client = None


class _CmdProtocol(asyncio.DatagramProtocol):
    """Receives command packets from Unity and forwards them to the bike."""

    def datagram_received(self, data, addr):
        if _ble_client is None or not _ble_client.is_connected:
            return
        if len(data) < 3:
            return
        # Build full FTMS Control Point payload depending on opcode
        opcode = data[0]
        if opcode == 0x04:
            payload = bytes([0x04, data[1]])          # resistance
        elif opcode == 0x05:
            payload = bytes([0x05, data[1], data[2]])  # ERG watts
        elif opcode == 0x11:
            # Simulation: wind(2) + grade(2) + crr(1) + cw(1)
            grade_raw = struct.unpack_from('<h', data, 1)[0]
            payload = struct.pack('<BhhBB', 0x11, 0, grade_raw, 40, 51)
        else:
            payload = bytes(data)  # pass through unknown opcodes

        asyncio.ensure_future(_send_ble_command(payload))


async def _send_ble_command(payload):
    global _ble_client
    try:
        await _ble_client.write_gatt_char(CTRL_PT_UUID, payload, response=True)
    except Exception as e:
        print(f"[bridge] command error: {e}")


def _on_bike_data(sender, raw):
    """Handle FTMS Indoor Bike Data notification and forward to Unity."""
    if len(raw) < 8:
        return
    speed   = struct.unpack_from('<H', raw, 2)[0]   # km/h × 100
    cadence = struct.unpack_from('<H', raw, 4)[0]   # RPM × 2
    power   = struct.unpack_from('<h', raw, 6)[0]   # Watts (signed)
    packet  = struct.pack('<HHh', speed, cadence, power)
    _data_sock.sendto(packet, (UNITY_HOST, DATA_PORT))


async def main():
    global _ble_client

    print(f"[bridge] Scanning for '{DEVICE_NAME}'...")
    device = await BleakScanner.find_device_by_name(DEVICE_NAME, timeout=15)
    if device is None:
        print(f"[bridge] ERROR: '{DEVICE_NAME}' not found. Is the bike powered on?")
        sys.exit(1)

    print(f"[bridge] Found {device.name} ({device.address}) — connecting...")

    loop = asyncio.get_event_loop()

    # Start UDP command listener
    transport, _ = await loop.create_datagram_endpoint(
        _CmdProtocol,
        local_addr=(UNITY_HOST, CMD_PORT),
        family=socket.AF_INET,
    )

    async with BleakClient(device) as client:
        _ble_client = client

        # Subscribe to Indoor Bike Data notifications
        await client.start_notify(BIKE_DATA_UUID, _on_bike_data)

        # FTMS requires Request Control before any command
        await client.write_gatt_char(CTRL_PT_UUID, bytes([0x00]), response=True)

        print(f"[bridge] Ready — streaming to Unity :{DATA_PORT}, commands on :{CMD_PORT}")
        print("[bridge] Press Ctrl+C to stop")

        try:
            while client.is_connected:
                await asyncio.sleep(1)
        except asyncio.CancelledError:
            pass
        finally:
            _ble_client = None
            transport.close()
            print("[bridge] Disconnected")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("[bridge] Stopped by user")
