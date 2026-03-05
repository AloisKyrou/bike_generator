# Bike Generator — Smart Trainer

> Turn a scooter motor and a stationary bike into a real power-generating smart trainer, compatible with Zwift, GoldenCheetah, TrainerRoad and Rouvy.

![Project overview placeholder](docs/images/overview.jpg)
*Photo placeholder — full system: bike, generator, electronics box, BLUETTI*

---

## What is this?

This project converts human pedaling power into usable electrical energy, while also making the bike behave like a **smart trainer** — the kind you would use with a cycling app like Zwift.

The rider pedals, a scooter motor (used as a generator) produces electricity, a DC/DC converter regulates it to 24V, and a **BLUETTI AC50S** power station charges from it.

At the same time, an **ESP32-C3** microcontroller:
- Measures voltage, current and power on the bus
- Controls pedaling resistance via a digital potentiometer on the DC/DC converter
- Exposes all of this over **Bluetooth** using the standard **FTMS protocol**, so any cycling app can connect and control the trainer

Surplus power that the BLUETTI cannot absorb is burned off by halogen lamp dump loads, which also provide a baseline braking torque.

---

## System Overview

```
[Rider] -> [Motor/Generator] -> [Rectifier] -> [DC/DC Buck 24V] -> [BLUETTI AC50S]
                                                     |
                                               [Dump Load 40-80W]
                                                     |
                                              [ESP32-C3 controller]
                                               measures V, I, P
                                               controls resistance via SPI digipot
                                               streams data over BLE (FTMS)
```

![Power path diagram placeholder](docs/images/power-path.png)
*Diagram placeholder — power path schematic*

---

## Features

- **Real power generation** — energy goes into a real battery (BLUETTI AC50S, 500Wh)
- **Smart trainer compatible** — Zwift, GoldenCheetah, TrainerRoad, Rouvy via standard Bluetooth FTMS
- **Three control modes:**
  - **Manual** — set resistance level with a physical BLE button or from the app
  - **ERG** — app sets a target wattage, system holds it
  - **Simulation** — app sends road gradient, system adjusts resistance accordingly
- **Live telemetry** — voltage, current, power streamed over BLE at 2 Hz
- **Dump load management** — halogen lamps absorb surplus power and maintain safe bus voltage
- **Wireless button** — EnOcean PTM215B BLE button for standalone control (no phone needed)

---

## Hardware

| Component | Role |
|-----------|------|
| Scooter motor | Generator (3-phase AC) |
| 3-phase bridge rectifier | AC to DC |
| 400W CV/CC buck module | Regulated 24V bus and current limit |
| **ESP32-C3** (Beetle) | MCU: sensors, BLE, digipot control |
| **DFR0520** (MCP42100) | Digital potentiometer, sets buck current limit via SPI |
| **ACS712 30A** | Hall-effect current sensor |
| Resistive voltage divider (100k + 12k) | Bus voltage measurement |
| **BLUETTI AC50S** | 500Wh power station, primary load |
| G4 12V/20W halogen bulbs (pairs in series) | Dump load (~40W per pair) |
| EnOcean PTM215B | BLE pushbutton for manual resistance control |

See the **[component references](docs/components/README.md)** for datasheets and product links.

---

## Electronics Box

![Electronics box placeholder](docs/images/electronics-box.jpg)
*Photo placeholder — inside the electronics enclosure*

The ESP32-C3, ACS712, and voltage divider live in a small enclosure mounted near the DC/DC buck module. The SPI cable to the DFR0520 digipot connects to the buck current-limit potentiometer terminals.

---

## Getting Started

### 1. Hardware assembly

Follow the wiring guide in **[docs/hardware.md](docs/hardware.md)**.

Key points:
- Wire the ACS712 in-line with the bus current path
- Wire the resistive divider (100k + 12k) from the bus to GPIO1
- Wire the DFR0520 to the ESP32-C3 SPI pins and into the buck CC trim pot network
- Wire halogen pairs (2x G4 12V/20W in series) across the 24V bus

### 2. Configure config.h

Open `config.h` and confirm your values:

```cpp
#define PIN_CURRENT_SENSOR  0       // ACS712 on GPIO0
#define PIN_VOLTAGE_SENSOR  1       // voltage divider on GPIO1

#define POT_CAL_VALUE       30      // wiper position during calibration
#define POT_CAL_POWER       120.0f  // measured watts at that wiper position

#define VDIV_R1_OHMS        100000.0f
#define VDIV_R2_OHMS        12000.0f
```

### 3. Flash the firmware

- Open `bike_esp32.ino` in the **Arduino IDE**
- Select board: **ESP32C3 Dev Module**
- Upload and open Serial Monitor at **115200 baud**

You should see:
```
*** READY TO PAIR ***
Device name: 'ESP32 Bike Trainer'
```

### 4. Connect a cycling app

Open Zwift (or any FTMS-compatible app), scan for **"ESP32 Bike Trainer"** and pair it as your controllable trainer and power meter.

![App pairing placeholder](docs/images/app-pairing.png)
*Screenshot placeholder — device pairing in Zwift*

### 5. Ride

Start pedaling. The app displays your live power and controls resistance based on the virtual road. Surplus power charges the BLUETTI.

---

## Calibration

1. Apply a known voltage to the bus (e.g. bench PSU at 24.0V)
2. Read the Serial Monitor: adjust `VDIV_OFFSET_V` if the reported voltage differs from your multimeter
3. Pedal steadily at wiper `POT_CAL_VALUE = 30`, note the stable watt reading, update `POT_CAL_POWER`

Full procedure: **[docs/hardware.md](docs/hardware.md)**

---

## Documentation

| Document | Contents |
|----------|---------|
| **[docs/build-tutorial.md](docs/build-tutorial.md)** | **Full step-by-step build guide — start here** |
| [docs/ble-api.md](docs/ble-api.md) | BLE API reference for app/game developers |
| [docs/hardware.md](docs/hardware.md) | Power path, wiring, pinout, calibration |
| [docs/firmware.md](docs/firmware.md) | Code architecture, BLE FTMS, control modes |
| [docs/components/README.md](docs/components/README.md) | Datasheets and product links |

---

## Safety Notes

- BLUETTI DC input: **12-40V max, 10A max, 120W max** — do not exceed
- Fuse the 24V bus at **10A**
- Halogen lamps get very hot — use a ventilated non-flammable enclosure
- ACS712 must have **no current flowing at boot** for auto-calibration to work
- ESP32-C3 GPIO pins: **3.3V max**

---

## Roadmap

- [ ] Dump load MOSFET switching with soft-start ramp
- [ ] Bus voltage hysteresis loop for dump load control
- [ ] Separate current metering for BLUETTI vs dump load
- [ ] Temperature sensors on buck and rectifier
- [ ] iOS companion app for Wh session tracking

---

## License

MIT
