# Voltage Divider — Bus Voltage Measurement

The ESP32-C3 ADC pins are **3.3V maximum**. The bus runs at **24V**. A resistive voltage divider scales the bus voltage down to a safe level for the ADC.

---

## Circuit

```
Bus (+24V) ──[R1 = 100kΩ]──┬──[R2 = 7.5kΩ]── GND
                            │
                          GPIO1 (ADC)
```

Two resistors in series across the bus. The ADC reads the voltage at the junction between them.

> **⚠️ Avoid GPIO2** on ESP32-C3 — it is a strapping pin with a hardware pull-up that software cannot override, which inflates ADC readings. Use GPIO1 or GPIO3 instead.

---

## How it works

The junction voltage follows the resistor ratio:

$$V_{GPIO} = V_{BUS} \times \frac{R2}{R1 + R2}$$

With R1 = 100kΩ and R2 = 7.5kΩ:

$$V_{GPIO} = V_{BUS} \times \frac{7.5}{107.5} = V_{BUS} \times 0.0698$$

| Bus voltage | GPIO1 voltage |
|-------------|--------------|
| 24V (nominal) | **1.67V** ✅ |
| 30V | 2.09V ✅ |
| 40V (BLUETTI max) | **2.79V** ✅ safe without zener |

The 7.5kΩ / 107.5kΩ ratio stays safely below 3.3V all the way to 40V —
the BLUETTI DC input ceiling — with no zener clamp needed.

---

## Why these values

**R1 = 100kΩ, R2 = 7.5kΩ** is a deliberate choice on two axes:

### 1. Ratio — sets the measurement range

The ratio R2/(R1+R2) must map V_BUS_MAX to ≤ 3.3V.

For headroom up to 40V (BLUETTI DC input ceiling):

    R2 / (R1 + R2) ≤ 3.3 / 40 = 0.0825

100k + 7.5k gives 0.0698 — comfortably under the limit.
At 40V: V_GPIO = 2.79V ✅. No zener clamp required.

### 2. Total resistance — limits current draw

R1 + R2 = 112kΩ means the divider draws:

    I = 24V / 112kΩ ≈ 0.21 mA

Negligible on the bus. Using much lower values (e.g. 1kΩ + 120Ω) would work
electrically but waste power continuously.

---

## Changing the resistors

Edit **only** `VDIV_R1_OHMS` and `VDIV_R2_OHMS` in `config.h`.
The scale factor and maximum measurable voltage are derived automatically:

```c
#define VDIV_R1_OHMS    100000.0f
#define VDIV_R2_OHMS     7500.0f

// Derived — do not edit:
#define VDIV_RATIO      (VDIV_R2_OHMS / (VDIV_R1_OHMS + VDIV_R2_OHMS))
#define VDIV_SCALE      (1.0f / VDIV_RATIO)
```

---

## Calibration

Component tolerance (typically ±1–5%) will introduce a small offset. After wiring:

1. Measure actual bus voltage with a multimeter → note the value
2. Read serial output: `ADC volt: Vpin=2.57V → bus=24.0V`
3. If they differ, adjust `VDIV_OFFSET_V` in `config.h` by the difference

```c
// e.g. set to -0.4 if serial reads 24.4 but multimeter reads 24.0
#define VDIV_OFFSET_V   0.0f
```

---

## What happens at 40V?

At 40V (the BLUETTI DC input ceiling, reachable if the buck loses regulation),
with the **7.5kΩ divider**:

    V_GPIO = 40 × 7.5 / 107.5 = 2.79V  ✅  safe — no zener needed

This is exactly why 7.5kΩ was chosen over the more common 12kΩ. The 12kΩ variant
would produce 4.29V at 40V and destroy the ADC pin instantly.

---

## Safety

> The 7.5kΩ divider stays below 3.3V up to 40V — no additional protection needed
> for normal operation. If you ever swap to higher R2 values (e.g. 12kΩ), add a
> 3.3V zener from GPIO1 to GND.

Standard ¼W resistors are fine — the divider carries no meaningful current.

---

*See also: [Hardware Reference](hardware.md) · [config.h](../config.h)*
