# Build Your Own Power-Generating Smart Trainer

> Turn a scooter motor and a stationary bike into a real electricity-generating
> smart trainer, compatible with Zwift, GoldenCheetah, TrainerRoad and Rouvy.

This guide walks you through the full build — from sourcing parts to your first
Zwift ride — designed for anyone with basic soldering skills.
The whole project can be built almost entirely from second-hand components.

**Estimated build time:** 2–4 weekends
**Cost (new parts):** ~€150–200
**Cost (second-hand):** ~€50–80
**Required skill level:** Basic soldering, can read a wiring diagram

---

## The Core Idea

Most home trainers consume electricity. This one **generates it**.

You pedal → a motor acts as a generator → a DC/DC converter regulates the output
to 24V → a power station charges. At a steady 100W effort you produce enough to
meaningfully charge a 500Wh battery station.

At the same time, a small microcontroller (ESP32-C3) measures power in real time,
controls resistance electronically, and talks to cycling apps over Bluetooth using
the standard FTMS protocol. From the app's perspective it looks and behaves exactly
like a professional smart trainer.

Surplus power beyond what the battery can absorb is safely burned off by halogen
lamps — which also provide a useful baseline braking force.

---

## 1. Parts List

### Core components

| Component | Role | Where to find second-hand | Approx. new price |
|-----------|------|--------------------------|-------------------|
| Stationary exercise bike | Frame + pedals | Leboncoin, Vinted, FB Marketplace | €0–30 |
| **Brushless scooter motor** 24–36V 250–500W | Generator | Scooter repair shops, Leboncoin | €15–40 |
| **3-phase bridge rectifier** KBPC5010 50A/1000V | AC→DC | AliExpress, eBay | €3–5 |
| **400W CV/CC buck module** | Regulated 24V + current limit | AliExpress | €12–18 |
| **BLUETTI AC50S** or any 24V-input power station | Battery sink | FB Marketplace, eBay | €150–250 s/h |
| **ESP32-C3 Beetle** (DFRobot) | Microcontroller | AliExpress, DFRobot | €8–12 |
| **DFR0520** (MCP42100 digipot breakout) | Programmable resistance | DFRobot | €8 |
| **ACS712 30A** module | Current sensor | AliExpress | €2–3 |
| Resistors **100kΩ + 12kΩ** (¼W) | Voltage divider | Any electronics shop | <€1 |
| **G4 12V/20W halogen capsules** × 4+ | Dump load | Amazon, hardware store | €5–8/pack |
| G4 lamp holders (ceramic) | Lamp mounting | AliExpress | €3–5 |
| **EnOcean PTM215B** BLE button *(optional)* | Wireless resistance control | EnOcean distributors | €25 |
| Small enclosure | Electronics box | Hardware store / 3D printed | €5–10 |
| Wire 1.5mm² (bus) + 0.5mm² (signal) | Wiring | Hardware store | €5 |
| XT60 or Anderson connectors | Bus connections | AliExpress | €3 |
| 10A automotive fuse + holder | Bus protection | Auto shop | €2 |

---

## 2. System Overview

```
[Rider pedaling]
       |
       v
[Scooter motor — 3-phase AC out]
       |
       v
[3-phase bridge rectifier — unregulated DC]
       |
       v
[DC/DC Buck module — 24V regulated]
[Current limit pot = pedaling resistance]
       |
       +-----------------------------+
       v                             v
[BLUETTI DC input — up to 120W]  [Halogen lamps — ~40W/pair]
                                  (dump load + baseline braking)
       |
[ESP32-C3]
  measures V, I, power
  controls resistance via SPI digipot
  streams data over BLE (FTMS protocol)
```

**The resistance mechanism:** the buck module has a CC (constant-current) trim pot
that sets how much current the load can draw — i.e. how hard pedaling feels.
We replace this trim pot with a digital potentiometer (DFR0520) so the ESP32 can
change resistance at any time in response to your app or button press.

---

## 3. Mechanical: Mounting the Motor

This is the most variable part — it depends on your specific bike and motor.

*[Photo placeholder — motor mounted on the bike]*

### Goal

The motor shaft must rotate when you pedal. Common approaches:

- **Belt drive from the flywheel** — timing belt or V-belt from flywheel to motor
  shaft. Works well with hub motors. Requires a printed or machined pulley.
- **Direct coupling** — rigid coupling collar joining motor shaft to flywheel
  spindle. Clean but requires a machined adapter.
- **Chain drive** — sprocket on motor shaft + chain from rear sprocket.

### Key requirements

- **Gear/belt ratio ~3:1 to 5:1** — scooter hub motors are designed for 200–400 RPM;
  a typical flywheel at 70 RPM cadence needs a ratio to reach their generation range.
- **Motor held rigidly** — any wobble causes noise and bearing wear.
- **Phase order doesn't matter** — for a generator you can swap any two of the
  three motor wires without affecting operation.

> Scooter hub motors from scrapped electric kick scooters are ideal —
> common, cheap, robust, right voltage range.

---

## 4. Power Path Wiring

### 4.1 Motor → Rectifier

Connect the 3 motor wires to the 3 AC inputs of the bridge rectifier.

```
Motor wire 1 --> AC1
Motor wire 2 --> AC2    (KBPC5010 3-phase bridge)
Motor wire 3 --> AC3
                 (+) --> Bus positive
                 (-) --> Bus ground
```

Mount the rectifier on a metal surface or add a heatsink — it gets warm.

### 4.2 Rectifier → Buck Module

```
Rectifier (+) --[10A fuse]-- Buck IN+
Rectifier (-) -------------- Buck IN-
```

**Set the buck module output to 24V** using the CV trim pot before connecting
anything to the output. Measure with a multimeter — 24.0V ±0.2V with no load.

> ⚠️ Do this before connecting the BLUETTI. Overvoltage on its DC input is bad.

### 4.3 Buck Module → Loads

```
Buck OUT+ --+-- XT60 connector --> BLUETTI DC input (+)
            +-- Dump load chain --> Bus ground

Buck OUT-  --> BLUETTI DC input (-) / Dump load chain end
```

Use 1.5mm² wire minimum for the bus. Keep runs short.

### 4.4 Dump Load — Halogen Lamps

Each pair = 2× G4 12V/20W capsules **in series** across 24V:

```
Bus+ --[lamp A 12V/20W]--[lamp B 12V/20W]-- Bus-
```

Each pair dissipates ~40W. Wire pairs in parallel to increase dump power:

| BLUETTI max | Halogen pairs | Total headroom |
|-------------|--------------|---------------|
| 120W | 2 pairs (80W) | 200W |
| 120W | 3 pairs (120W) | 240W |

Mount lamps in **ceramic G4 holders**. Surface temperature ~250°C — keep away
from plastics. Ensure airflow.

---

## 5. The Tricky Part: Modifying the Buck Converter

This is the most demanding step. Read all the way through before starting.

*[Photo placeholder — buck module PCB with CC pot marked]*

### Why

The buck module has two trim pots:
- **CV pot** — sets output voltage → leave at 24V, never touch it again
- **CC pot** — sets the current limit → this becomes our resistance control

By replacing the CC pot with the DFR0520 digital potentiometer, the ESP32 can
change resistance in real time.

### Step 1 — Identify the CC pot

Two small blue multi-turn trimmer pots on the PCB. The CC one is usually labeled.
If unlabeled: carefully turn one to minimum — if the bike becomes very easy to
pedal (low current limit), that is the CC pot. If output voltage drops, put it
back — that was the CV pot.

*[Photo placeholder — CC pot identified with arrow]*

### Step 2 — Desolder the CC trimpot

Use solder wick or a desoldering pump to cleanly remove the 3-pin trimpot.
The three pads exposed are:
- **A** — one end of the resistive track
- **W** — wiper (center tap)
- **B** — other end of the resistive track

*[Photo placeholder — desoldered pads labeled A/W/B]*

### Step 3 — Wire the DFR0520

The DFR0520 has two pots (POT0 and POT1). We use **POT0**:
`A0, W0, B0` pins on the breakout.

```
Buck PCB pad A --> DFR0520 POT0 A0
Buck PCB pad W --> DFR0520 POT0 W0
Buck PCB pad B --> DFR0520 POT0 B0
```

Use short wires (5–10 cm).

> **Low-invasive alternative:** leave the original pot in place and wire the
> DFR0520 in parallel with it. This changes the effective resistance range —
> adjust `POT_CAL_POWER` in `config.h` after measuring real watts.

### Step 4 — Bench test

Before closing everything up:
- Power the ESP32 from USB only
- Open Serial Monitor at 115200 baud
- Check for `[DIGIPOT]` messages confirming SPI writes
- Spin the motor by hand and verify that changing the digipot value
  changes the braking torque you feel

---

## 6. Sensor Wiring

### 6.1 ACS712 — Current Sensor

Wire in-line with the bus current path (all load current passes through it):

```
Buck OUT+ --> [ACS712 IP+]--[ACS712 IP-] --> loads

ACS712 VCC  --> 3.3V (ESP32)
ACS712 GND  --> GND
ACS712 OUT  --> GPIO0 (ESP32)
```

> ⚠️ At first boot the firmware spends ~1 second calibrating the zero-current
> baseline. Make sure **no current is flowing** through the ACS712 at that moment
> (bus disconnected from loads). If current flows during calibration, all power
> readings will be offset.

### 6.2 Voltage Divider — Bus Voltage Sensor

Two resistors scale 24V down to ≤3.3V for the ADC. See
[voltage-divider.md](voltage-divider.md) for the full explanation.

```
Bus (+) --[R1 = 100kΩ]--+--[R2 = 12kΩ]-- GND
                         |
                       GPIO1 (ESP32)
```

- At 24V → GPIO1 = 2.57V ✅
- At 30V → GPIO1 = 3.21V ✅ (safe margin)

Build on a small perfboard strip inside the electronics box.

---

## 7. Electronics Box

All control electronics in one small enclosure near the buck module.

**Contents:**
- ESP32-C3 Beetle
- DFR0520 breakout
- ACS712 board
- Voltage divider (2 resistors on a perfboard strip)
- Screw terminals or JST connectors for external wires

**Internal wiring:**

| Signal | From | To |
|--------|-----|----|
| 3.3V | ESP32 3V3 | ACS712 VCC, DFR0520 VCC |
| GND | ESP32 GND | ACS712 GND, DFR0520 GND, R2 bottom |
| GPIO0 | ESP32 | ACS712 OUT |
| GPIO1 | ESP32 | R1/R2 junction |
| GPIO5 CS | ESP32 | DFR0520 CS |
| GPIO6 SCK | ESP32 | DFR0520 SCK |
| GPIO7 MOSI | ESP32 | DFR0520 SI |

External cables out of the box:
- Bus V+ and V− for voltage divider
- ACS712 current path (bus current through sensor)
- SPI cable to DFR0520 → to buck CC pads
- USB-C for flashing and serial monitor

*[Photo placeholder — inside electronics box]*

---

## 8. Flashing the Firmware

### Install Arduino IDE + ESP32 support

1. Download **Arduino IDE** from arduino.cc
2. Preferences → add to "Additional boards manager URLs":
   `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
3. Tools → Boards Manager → search "esp32" → install **esp32 by Espressif Systems**

### Flash

1. Board: **ESP32C3 Dev Module**
2. Select the COM port that appears when plugging in via USB-C
3. Upload → open Serial Monitor at **115200 baud**

Expected output:
```
[SENSORS] ACS712 midpoint: 1650 mV (1.650V)
[RESISTANCE] Ready
[BLE] FTMS service started. Advertising as "ESP32 Bike Trainer"
[BUTTON] Scanning started
```

---

## 9. EnOcean Button Pairing (Optional)

The **PTM215B** is a self-powered (no battery) BLE button for wireless resistance
control — press left (-) or right (+) without a phone.

**Find its MAC address:**
1. Install **nRF Connect** (free, iOS / Android)
2. Press either button → it appears in the scan list
3. Note the MAC address (format: `XX:XX:XX:XX:XX:XX`)

**Set it in config.h:**
```c
#define ENOCEAN_MAC_0   0xAB   // replace with your actual bytes
#define ENOCEAN_MAC_1   0xCD
// ... etc
```
Reflash after editing.

---

## 10. Calibration

### Voltage divider

With bus powered, compare Serial Monitor vs multimeter:
```
ADC volt: Vpin=2.57V  bus=24.0V
```
If they differ by more than 0.5V, adjust `VDIV_OFFSET_V` in `config.h`.

### Wiper-to-power (most important for ERG accuracy)

1. Temporarily fix the digipot: add `Resistance_Set(30, "cal");` in `setup()`
2. Flash. Ride steadily for 30 seconds. Note stable power in Serial Monitor:
   `Power: 118.3W`
3. Update `config.h`:
   ```c
   #define POT_CAL_VALUE   30
   #define POT_CAL_POWER   118.0f
   ```
4. Remove the temporary line and reflash.

---

## 11. First Ride — Connecting an App

**Zwift:** Pair Devices → search "ESP32 Bike Trainer" → pair as Power Source
and Controllable Trainer.

**GoldenCheetah / TrainerRoad / Rouvy:** all support FTMS natively — pair the
same way.

**Without an app:** bike stays in Manual mode. Use the EnOcean button to step
resistance up/down. Status is logged every 10 seconds on Serial Monitor.

---

## 12. Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Power reads 0W | Voltage divider not wired | Wire R1+R2 to GPIO1 |
| Power reads wrong | ACS712 calibrated with current flowing | Restart ESP32 with bus disconnected |
| BLE not visible | ESP32 not running | Check Serial Monitor for errors |
| Resistance doesn't change | SPI issue | Check GPIO5/6/7 wiring; look for [DIGIPOT] in serial |
| Buck shuts down | Overcurrent | Reduce digipot value; check 10A fuse |
| Lamps flicker | Cold filament inrush | Normal — stabilizes after ~5s |

---

## 13. Extending the System

- **Real cadence sensor** — reed switch or Hall sensor on the crank
- **More dump load** — add halogen pairs in 40W steps for stronger riders
- **OLED display** — I2C screen showing live V, I, W, BLE status
- **Game / simulation** — the BLE API is fully open. See [ble-api.md](ble-api.md)

---

## 14. Safety

- **Always fuse the bus at 10A**
- **Halogen lamps run at ~250°C** — ceramic holders, metal panels, ventilation
- **ACS712 must have no current at boot** for auto-calibration
- **GPIO pins: 3.3V absolute maximum** — the voltage divider is sized for 30V max
- **BLUETTI DC input: check polarity** — no reverse polarity protection
- **24V bus is not mains-isolated** — do not touch bus wiring and mains simultaneously

---

*See also: [Hardware Reference](hardware.md) · [Firmware Architecture](firmware.md) · [BLE API Reference](ble-api.md) · [Component References](components/README.md)*
