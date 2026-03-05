# BLE API Reference — ESP32 Bike Trainer

How to connect to the bike trainer over Bluetooth and exchange data with it.
Written for hackathon participants building apps, games, or simulations.

The bike implements the **Bluetooth Fitness Machine Service (FTMS)**, a standard
protocol (Bluetooth SIG specification). Any BLE library that can connect to GATT
services will work — Web Bluetooth, bleak (Python), Unity BLE plugins, etc.

---

## Quick Facts

| Property | Value |
|----------|-------|
| **Device name** | `ESP32 Bike Trainer` |
| **BLE role** | Peripheral (server) |
| **Protocol** | FTMS — Bluetooth Fitness Machine Service |
| **Service UUID** | `1826` (0x1826) |
| **Update rate** | Power / speed / cadence pushed every **500 ms** |

---

## Connecting

1. Scan for BLE peripherals advertising the name `ESP32 Bike Trainer`
   or service UUID `0x1826`.
2. Connect and discover the Fitness Machine Service (`0x1826`).
3. Subscribe (enable notifications) on the **Indoor Bike Data** characteristic
   (`0x2AD2`) — without this the bike will not push updates.

---

## Characteristics

| Name | UUID | Properties | Description |
|------|------|-----------|-------------|
| Fitness Machine Feature | `0x2ACC` | Read | Supported features bitmap |
| **Indoor Bike Data** | `0x2AD2` | Notify | Live speed, cadence, power |
| Training Status | `0x2AD3` | Notify | Training state |
| Supported Resistance Range | `0x2AD6` | Read | Min/max/step for resistance |
| Supported Power Range | `0x2AD8` | Read | Min/max/step for power |
| **Fitness Machine Control Point** | `0x2AD9` | Write + Indicate | Send commands |
| Fitness Machine Status | `0x2ADA` | Notify | Mode change notifications |

The two you will use most are **Indoor Bike Data** (reading) and
**Fitness Machine Control Point** (writing).

---

## Indoor Bike Data — Reading Live Values

**UUID:** `0x2AD2`
**Direction:** Bike → your app (notification, every 500 ms)
**Format:** little-endian binary

### Byte layout

| Bytes | Field | Type | Unit | Notes |
|-------|-------|------|------|-------|
| 0–1 | Flags | uint16 LE | — | `0x0024` = cadence + power present |
| 2–3 | Instantaneous Speed | uint16 LE | km/h × 100 | Divide by 100 for km/h |
| 4–5 | Instantaneous Cadence | uint16 LE | RPM × 2 | Divide by 2 for RPM |
| 6–7 | Instantaneous Power | int16 LE | Watts | Signed; always ≥ 0 here |

### Parsing examples

**Python (bleak):**
```python
import struct

def parse_indoor_bike_data(data: bytes) -> dict:
    flags, speed_raw, cadence_raw, power_raw = struct.unpack_from('<HHHh', data)
    return {
        "speed_kmh":   speed_raw / 100.0,
        "cadence_rpm": cadence_raw / 2.0,
        "power_w":     power_raw,
    }
```

**JavaScript (Web Bluetooth):**
```javascript
function parseIndoorBikeData(dataView) {
  return {
    speedKmh:   dataView.getUint16(2, true) / 100,
    cadenceRpm: dataView.getUint16(4, true) / 2,
    powerW:     dataView.getInt16(6, true),
  };
}
```

**C# / Unity:**
```csharp
// data is byte[]
ushort speed = BitConverter.ToUInt16(data, 2);
ushort cad   = BitConverter.ToUInt16(data, 4);
short  power = BitConverter.ToInt16(data, 6);

float speedKmh   = speed / 100f;
float cadenceRpm = cad / 2f;
int   powerWatts = power;
```

**GDScript / Godot:**
```gdscript
func parse_bike_data(data: PackedByteArray) -> Dictionary:
    return {
        "speed_kmh":   data.decode_u16(2) / 100.0,
        "cadence_rpm": data.decode_u16(4) / 2.0,
        "power_w":     data.decode_s16(6),
    }
```

---

## Fitness Machine Control Point — Sending Commands

**UUID:** `0x2AD9`
**Direction:** your app → Bike (write with response)
**Response:** 3-byte indication; byte[2] == 0x01 means success

### Protocol

1. Write `[0x00]` (Request Control) first — always required
2. Write your command
3. Wait for the indication response before sending the next command

### Available commands

#### Request Control (always first)
```
[0x00]
```

#### Set Resistance Level — Manual mode
```
[0x04, level]
```
`level`: uint8, 0 = minimal resistance, 100 = maximum

#### Set Target Power — ERG mode
```
[0x05, watts_low, watts_high]
```
`watts`: int16 little-endian. The bike adjusts resistance to hold this wattage.

#### Set Indoor Bike Simulation — gradient mode
```
[0x11, windSpeed_low, windSpeed_high, grade_low, grade_high, crr, cw]
```

| Field | Type | Unit | Typical value |
|-------|------|------|---------------|
| windSpeed | int16 LE | m/s × 1000 | `0x0000` |
| grade | int16 LE | % × 100 | `0x0000` flat, `0x01F4` = +5%, `0xFF9C` = -1% |
| crr | uint8 | × 10000 | `40` |
| cw | uint8 | kg/m × 100 | `51` |

Only `grade` has an effect — wind, crr and cw are accepted but ignored.

#### Reset
```
[0x01]
```

---

## Full Code Examples

**Python — subscribe + ERG mode:**
```python
import asyncio, struct
from bleak import BleakClient, BleakScanner

BIKE_DATA = "00002ad2-0000-1000-8000-00805f9b34fb"
CTRL_PT   = "00002ad9-0000-1000-8000-00805f9b34fb"

def on_data(sender, data):
    _, speed, cad, pwr = struct.unpack_from('<HHHh', data)
    print(f"Power={pwr}W  Speed={speed/100:.1f}km/h  Cadence={cad/2:.0f}rpm")

async def main():
    device = await BleakScanner.find_device_by_name("ESP32 Bike Trainer")
    async with BleakClient(device) as client:
        await client.start_notify(BIKE_DATA, on_data)
        await client.write_gatt_char(CTRL_PT, bytes([0x00]), response=True)  # request control
        cmd = struct.pack('<Bh', 0x05, 150)  # ERG: 150W target
        await client.write_gatt_char(CTRL_PT, cmd, response=True)
        await asyncio.sleep(60)

asyncio.run(main())
```

**JavaScript — resistance slider:**
```javascript
let ctrlChar;

async function connect() {
  const device = await navigator.bluetooth.requestDevice({
    filters: [{ name: "ESP32 Bike Trainer" }],
    optionalServices: ["00001826-0000-1000-8000-00805f9b34fb"]
  });
  const server  = await device.gatt.connect();
  const service = await server.getPrimaryService("00001826-0000-1000-8000-00805f9b34fb");

  const dataChar = await service.getCharacteristic("00002ad2-0000-1000-8000-00805f9b34fb");
  await dataChar.startNotifications();
  dataChar.addEventListener("characteristicvaluechanged", e => {
    const dv = e.target.value;
    console.log("Power:", dv.getInt16(6, true), "W");
  });

  ctrlChar = await service.getCharacteristic("00002ad9-0000-1000-8000-00805f9b34fb");
  await ctrlChar.writeValueWithResponse(new Uint8Array([0x00]));
}

async function setResistance(level) {
  await ctrlChar.writeValueWithResponse(new Uint8Array([0x04, level]));
}

async function setTargetPower(watts) {
  const buf = new ArrayBuffer(3);
  new DataView(buf).setUint8(0, 0x05);
  new DataView(buf).setInt16(1, watts, true);
  await ctrlChar.writeValueWithResponse(new Uint8Array(buf));
}

async function setGrade(gradePercent) {
  const raw = Math.round(gradePercent * 100);
  const buf = new ArrayBuffer(7);
  const v = new DataView(buf);
  v.setUint8(0, 0x11);
  v.setInt16(1, 0, true);    // wind = 0
  v.setInt16(3, raw, true);  // grade
  v.setUint8(5, 40);
  v.setUint8(6, 51);
  await ctrlChar.writeValueWithResponse(new Uint8Array(buf));
}
```

---

## Control Modes Summary

| Mode | OpCode | What the bike does | Best for |
|------|--------|--------------------|---------|
| **Manual** | `0x04` | Fixed resistance 0–100 | Free riding, warmup |
| **ERG** | `0x05` | Holds target wattage | Power-based games, intervals |
| **Simulation** | `0x11` | Resistance from road slope | Terrain / racing games |

---

## Value Ranges

| Parameter | Min | Max | Resolution |
|-----------|-----|-----|-----------|
| Power (received) | 0 W | ~200 W | 1 W |
| Speed (received) | 0 km/h | ~35 km/h | 0.01 km/h |
| Cadence (received) | 0 RPM | 120 RPM | 0.5 RPM |
| Resistance (sent) | 0 | 100 | 1 |
| Target power (sent) | 0 W | 200 W | 1 W |
| Grade (sent) | -10% | +12.5% | 0.01% |

---

## Tips for Game Developers

- **Poll rate is 500 ms** — smooth your display with interpolation, not raw values.
- **Speed and cadence are simulated** — derived from power by the firmware, not
  measured by a sensor. Treat as reasonable approximations.
- **ERG mode has latency** — resistance change takes 1–3 pedal strokes to settle.
  Do not send commands faster than once per second.
- **Power fluctuates** — expect ±10 W from pedaling rhythm. Use a rolling average
  of 3–5 samples for display and game logic.
- **No pairing required** — the device is open; no PIN or bonding needed.
- **Give the ESP32 ~2 seconds after power-on** before connecting.

---

*See also: [Build Tutorial](build-tutorial.md) · [Firmware Architecture](firmware.md) · [Component References](components/README.md)*
