# Firmware Architecture

The firmware runs on an **ESP32-C3** using the Arduino framework. It is split into small, focused modules — each with a `.h` interface and `.cpp` implementation.

---

## 1. File Map

```
bike_generator/
├── bike_esp32.ino          Main entry point (setup / loop)
├── config.h                All constants, pins, calibration values
│
├── hardware.cpp/h          ADC + SPI peripheral setup
├── sensors.cpp/h           ACS712 current + voltage divider reading
├── resistance.cpp/h        DFR0520 digital potentiometer control
├── physics.cpp/h           Speed & cadence simulation
├── control_modes.cpp/h     Manual / ERG / Simulation mode state machine
├── ble_ftms.cpp/h          BLE FTMS GATT service (server)
├── button_scanner.cpp/h    BLE central: EnOcean PTM215B button scanner
└── utils.cpp/h             ADC averaging, low-pass filter, map helpers
```

---

## 2. Module Responsibilities

### `config.h`
Central header included by all modules. Defines:
- GPIO pin numbers
- Sensor calibration constants (`ACS712_SENSITIVITY`, `VDIV_R1_OHMS`, etc.)
- Digipot calibration and safe range (`POT_CAL_VALUE`, `POT_SAFE_MAX`)
- Physics tuning parameters
- BLE UUIDs and FTMS flags
- Timing constants

**This is the only file you should need to edit for hardware changes or recalibration.**

---

### `hardware.cpp`
Initialises ADC resolution (12-bit) and pin attenuation (`ADC_11db` = 0–3.3V range) for both sensor pins, and sets up the SPI bus for the digipot.

Called once from `setup()`.

---

### `sensors.cpp`
Reads the two ADC sensors and computes bus power.

| Function | Description |
|----------|-------------|
| `Sensors_Init()` | Runs `Sensors_Calibrate()` to zero the ACS712 baseline |
| `Sensors_Calibrate()` | Averages 8192 ADC samples at no-load to set midpoint |
| `Sensors_ReadCurrent()` | Returns current (A) from ACS712 |
| `Sensors_ReadVoltage()` | Returns bus voltage (V) from resistive divider |
| `Sensors_Update()` | Calls both reads, computes `power = V × I` |
| `Sensors_GetAll()` | Returns full `SensorData` struct (V, I, P, debug ADC values) |

**`SensorData` struct:**
```cpp
typedef struct {
  float voltage;               // Bus voltage (V)
  float current;               // Bus current (A)
  float power;                 // Bus power (W)
  int   rawADC;                // Raw ADC count — current sensor (debug)
  float adcVoltage;            // ADC pin voltage — current sensor (V, debug)
  float adcVoltageDivider;     // ADC pin voltage — voltage divider (V, debug)
} SensorData;
```

---

### `resistance.cpp`
Translates a target power or resistance level into a wiper position and writes it to the DFR0520 via SPI.

**Wiper mapping (linear through origin):**
```
wiper = target_power × (POT_CAL_VALUE / POT_CAL_POWER)
```

| Function | Description |
|----------|-------------|
| `Resistance_Set(value, reason)` | Write wiper directly, clamped to `[POT_MIN, POT_SAFE_MAX]` |
| `Resistance_Increase()` | +1 step (button press) |
| `Resistance_Decrease()` | −1 step (button press) |
| `Resistance_SetFromPower(W)` | Used by ERG mode |
| `Resistance_SetFromGrade(%)` | Used by Simulation mode |
| `Resistance_SetFromLevel(0–100)` | Used by Manual mode |

---

### `physics.cpp`
Computes simulated speed and cadence from measured power. These values are sent to the cycling app via BLE — the app uses them to animate the rider and compute gradient effects on screen.

- **Speed:** `speed = SPEED_POWER_COEFF × ∛power − grade_penalty`
- **Cadence:** piecewise linear target + exponential smoothing + ±2 RPM noise (intentional, for realism)

> These are *simulated* values — there is no actual wheel speed or crank sensor. The physics are tuned for a plausible feel, not strict accuracy.

---

### `control_modes.cpp`
State machine with three modes, set by the connected app (or physical button when disconnected):

| Mode | Trigger | Behaviour |
|------|---------|-----------|
| `MODE_MANUAL` | Button press or FTMS opcode `0x04` | Direct resistance level (0–100) |
| `MODE_ERG` | FTMS opcode `0x05` | Hold a target power (W) — open loop |
| `MODE_SIMULATION` | FTMS opcode `0x11` | Set resistance proportional to slope gradient (%) |

`ControlMode_UpdateResistance()` is called every 100ms when an app is connected, dispatching to the appropriate `Resistance_SetFrom*()` call.

---

### `ble_ftms.cpp`
Implements the **Bluetooth FTMS (Fitness Machine Service, UUID 0x1826)** GATT server. This makes the device visible and controllable in **Zwift, GoldenCheetah, TrainerRoad, Rouvy**, and any other FTMS-compatible app.

**Characteristics exposed:**

| UUID | Name | Properties | Notes |
|------|------|-----------|-------|
| 0x2ACC | Fitness Machine Feature | Read | Reports supported features |
| 0x2AD2 | Indoor Bike Data | Notify | Speed + Cadence + Power @ 2Hz |
| 0x2AD6 | Supported Resistance Range | Read | 0–100, step 1 |
| 0x2AD8 | Supported Power Range | Read | 0–200W, step 1 |
| 0x2AD9 | Fitness Machine Control Point | Write + Indicate | Receives mode/target commands |
| 0x2ADA | Fitness Machine Status | Notify | Status echoes |

**Indoor Bike Data packet** (flags = `0x0024`):
```
[flags 2B][speed 2B][cadence 2B][power 2B]  = 8 bytes
```

**Supported FTMS opcodes:**

| Opcode | Name |
|--------|------|
| `0x00` | Request Control |
| `0x01` | Reset |
| `0x04` | Set Target Resistance Level → `MODE_MANUAL` |
| `0x05` | Set Target Power → `MODE_ERG` |
| `0x07` | Start / Resume |
| `0x08` | Stop / Pause |
| `0x11` | Indoor Bike Simulation Parameters → `MODE_SIMULATION` |

---

### `button_scanner.cpp`
While no app is connected, the ESP32-C3 runs as a **BLE central** and scans for advertisement packets from a specific **EnOcean PTM215B** Bluetooth button (identified by MAC address).

On button press, the manufacturer data byte is decoded and `Resistance_Increase()` or `Resistance_Decrease()` is called.

> When an app connects (FTMS server role), button scanning is stopped to free the radio. It resumes automatically on disconnect.

**To change the target button:** update `ENOCEAN_MAC_0` through `ENOCEAN_MAC_5` in `config.h`.

---

### `utils.cpp`
Shared helpers:

| Function | Description |
|----------|-------------|
| `Utils_ReadMilliVoltsAvg(pin, N)` | Average N ADC readings in mV |
| `Utils_LowPassFilter(in, out, α)` | IIR low-pass: `out + α(in − out)` |
| `Utils_MapFloat(x, ...)` | Float version of Arduino `map()` |
| `Utils_Constrain(val, min, max)` | Float constrain |

---

## 3. Main Loop Flow

```
loop()
  │
  ├─ FTMS_HandleConnectionChange()    handle connect/disconnect, restart advertising
  │
  ├─ [if connected]
  │     ButtonScanner_Stop()
  │
  ├─ [if disconnected]
  │     ButtonScanner_Update()        poll EnOcean scan results, restart scan if needed
  │
  ├─ updateBikeData()                 every 100ms:
  │     Sensors_Update()              → read V, I, compute P
  │     ControlMode_UpdateResistance() → write digipot if connected
  │     Physics_CalculateSpeed()
  │     Physics_CalculateCadence()
  │
  ├─ [if connected, every 500ms]
  │     FTMS_SendBikeData()           → BLE notify Indoor Bike Data
  │
  └─ logStatus()                      every 10s: full status dump to Serial
```

---

## 4. Timing Constants (config.h)

| Constant | Default | Description |
|----------|---------|-------------|
| `BIKE_DATA_UPDATE_MS` | 100ms | Sensor read + digipot update rate |
| `BLE_NOTIFY_INTERVAL_MS` | 500ms | BLE notification rate (2Hz) |
| `STATUS_LOG_INTERVAL_MS` | 10000ms | Serial status dump interval |
| `SCAN_RESTART_INTERVAL_MS` | 1000ms | Button scanner restart period |

---

## 5. Adding a New Control Mode

1. Add a new value to the `ControlMode` enum in `control_modes.h`
2. Add a handler function `ControlMode_HandleXxx()` in `control_modes.cpp`
3. Add a case in `ControlMode_UpdateResistance()` dispatching to the correct `Resistance_SetFrom*()` call
4. If triggered via BLE, add the corresponding opcode handler in `ble_ftms.cpp`'s `FitnessMachineControlPointCallbacks::onWrite()`

---

*See also: [Hardware Reference](hardware.md) · [Component References](components/)*
