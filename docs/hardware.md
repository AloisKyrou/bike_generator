# Hardware Reference

This document covers the full power path, wiring, pinout and calibration procedure for the bike generator system.

---

## 1. Power Path Overview

```
[Rider pedaling]
      │
      ▼
[Scooter motor used as generator — 3-phase AC]
      │
      ▼
[3-phase bridge rectifier — DC output]
      │
      ▼
[DC/DC Buck module — CV/CC 400W class]
  Sets regulated 24V bus + current limit (= pedaling resistance)
  Current limit driven by DFR0520 digital potentiometer via SPI
      │
      ├──────────────────────────────┐
      ▼                              ▼
[BLUETTI AC50S DC input]     [Dump load — halogen lamps G4 12V/20W]
  Up to ~120W charging          Surplus power + baseline braking torque
```

The DC bus nominally runs at **24V**. The BLUETTI is the primary sink (up to ~120W / ~5A). Halogen lamps on the bus act as a permanent dump load to absorb excess power and provide baseline braking torque even when the BLUETTI is not charging.

---

## 2. Component Map & Pinout

### ESP32-C3 (Beetle variant)

| GPIO | Function | Notes |
|------|----------|-------|
| 0 | ACS712 current sensor (ADC) | `ADC_11db`, 12-bit |
| 1 | Voltage divider (ADC) | `ADC_11db`, 12-bit |
| 4 | DFR0520 MISO | Optional / not used |
| 5 | DFR0520 CS | Chip Select, active LOW |
| 6 | DFR0520 SCK | SPI clock |
| 7 | DFR0520 MOSI / SI | SPI data |

> ⚠️ ESP32-C3 ADC pins are 3.3V max. Never exceed this voltage on any ADC input.

---

## 3. Current Sensing — ACS712 30A

The ACS712 outputs a voltage proportional to current, centered at Vcc/2 (~1.65V at 3.3V supply) with no current flowing.

**Calibration formula:**
```
I (A) = |V_adc - V_midpoint| / sensitivity
```

- `sensitivity` = 39 mV/A (calibrated; nominal for 30A variant is 66 mV/A — adjust in `config.h`)
- `V_midpoint` is measured at boot with no current flowing (auto-calibration in `Sensors_Calibrate()`)

**Wiring:**
```
Bus current path ──► [IP+] ACS712 [IP-] ──► load
                          │
                        [VIOUT] ──► GPIO0 (ADC)
                        [VCC]  ──► 3.3V
                        [GND]  ──► GND
```

> ⚠️ At boot, make sure no current is flowing through the ACS712. The firmware takes a zero-current baseline for ~1 second during `setup()`.

---

## 4. Voltage Sensing — Resistive Divider

To measure the ~24V bus with the 3.3V ADC, a resistive divider scales the voltage down.

**Circuit:**
```
V_BUS ──[R1 = 100kΩ]──┬──[R2 = 12kΩ]── GND
                       └──► GPIO1 (ADC)
```

**Scaling:**
```
V_ADC = V_BUS × R2 / (R1 + R2)
      = V_BUS × 12k / 112k
      = V_BUS × 0.1071

V_BUS (max measurable) = 3.3V / 0.1071 ≈ 30.8V  ✅ covers 24V bus with margin
```

**To change resistor values:** only edit `VDIV_R1_OHMS` and `VDIV_R2_OHMS` in `config.h`. The scale factor and max voltage are derived automatically.

**Software calibration trim:** after wiring, measure a known voltage on the bus with a multimeter and compare to the serial log output `ADC volt: Vpin=X.XXV → bus=XX.XXV`. Adjust `VDIV_OFFSET_V` by the difference.

---

## 5. Digital Potentiometer — DFR0520 (MCP42100)

The DFR0520 breakout embeds an MCP42100: dual 100kΩ digital pot, 256 taps, SPI interface.

Only **POT0** is used. It is wired into the buck module's CC (constant current) feedback network, replacing or paralleling the manual trim pot. Moving the wiper increases or decreases the current limit setpoint → changes how hard the rider must pedal.

**SPI protocol:**
```
CS LOW → send 0x11 (write POT0) → send value (0–255) → CS HIGH
```

**Wiper-to-power mapping (linear, single-point calibrated):**
```
wiper = target_power × (POT_CAL_VALUE / POT_CAL_POWER)
      = target_power × (30 / 120)
      = target_power / 4
```

Update `POT_CAL_VALUE` and `POT_CAL_POWER` in `config.h` after measuring your actual system.

**Safe operating ceiling:** `POT_SAFE_MAX = HILL_POWER_TARGET / 4 = 50`. The wiper is never sent above this value, capping bus power at 200W (120W BLUETTI + 2×40W halogen).

---

## 6. Dump Load — G4 Halogen Lamps

**Configuration:** pairs of G4 12V/20W bulbs wired **in series** across the 24V bus.

```
24V bus ──[bulb A 12V/20W]──[bulb B 12V/20W]── GND
```

Each pair dissipates ~40W at 24V (once filaments are hot). Multiple pairs can be wired in parallel to increase dump power in ~40W steps.

| Pairs | Dump power |
|-------|-----------|
| 1 | ~40W |
| 2 | ~80W |
| 3 | ~120W |

> ⚠️ Cold filament resistance is much lower than hot — expect inrush current spikes when switching lamps. The lamps get very hot; ensure ventilation and keep away from plastics.

---

## 7. BLUETTI AC50S DC Input

- Input range: **12–40V OCV**
- Max current: **10A**
- Max power: **120W**

At 24V, the BLUETTI will absorb up to ~5A. If the generator produces more than 120W, the surplus must go to the dump load to prevent bus overvoltage.

**DC input connector:** XT60 or barrel (check your unit). Wire bus positive/negative with correct polarity — there is no reverse polarity protection on the BLUETTI input.

---

## 8. Wiring Safety Checklist

- [ ] Fuse the bus at 10A (protects BLUETTI and wiring)
- [ ] ACS712 in the current path — rated 30A, continuous
- [ ] Resistor divider: R1/R2 must be rated for the voltage (standard ¼W fine for voltage sensing only)
- [ ] Halogen lamps: mounted on ceramic/metal base, ventilated enclosure
- [ ] Buck module: heatsink + airflow for sustained operation
- [ ] All high-current connections: short, thick wire (≥ 1.5mm² / AWG14 for bus)
- [ ] ESP32-C3 powered from 3.3V regulated supply — not directly from 24V bus

---

## 9. Calibration Procedure (First Boot)

1. **Do not connect the bus / generator yet.**
2. Flash the firmware, open Serial Monitor at 115200 baud.
3. Power the ESP32-C3 from USB only. Observe the ACS712 midpoint calibration log:
   ```
   [SENSORS] ACS712 midpoint: 1650 mV (1.650V)
   ```
4. Connect the voltage divider to a known reference (e.g. bench PSU at 24.0V).
5. Observe the serial log:
   ```
   ADC volt: Vpin=2.571V → bus=24.0V (divider x9.33)
   ```
   If the bus reading differs from your multimeter, adjust `VDIV_OFFSET_V` in `config.h`.
6. Connect the full system and verify power readings at a steady pedaling effort.
7. Update `POT_CAL_VALUE` and `POT_CAL_POWER` in `config.h` with your measured wiper/power pair.

---

*See also: [Firmware Architecture](firmware.md) · [Component References](components/)*
