# V2 implementation and completion criteria

Updated 8 October 2026 for the adaptive schematic and continuation review.

## What the first prototype must be

One full-function V2 board designed for the agreed generator/receiver envelope,
with ESP-controlled setpoints and accessible programming/debugging. The present
adaptive schematic includes independent manual/app CV and BQ current control.
Initial calibration near 12 V / 1 A is a commissioning setting, not an approved
reduced-function first board. Complete the missing circuits and reviews before
declaring the schematic ready for PCB implementation or fabrication review.

Bring up the resulting board in stages: logic alone, disabled main stage,
low-energy load with a qualified startup sequence, controlled buck/boost corners,
and then qualified receiver profiles. A full dummy load from zero can stall
the default trickle phase: follow the
[review and bring-up guide](../REVIEW_AND_BRINGUP_2026-10-08.md).
Initial conservative settings and removable links are useful
on a full-capability board. They do not require a separate PCB iteration.
Do not rely on discovering obvious protection omissions by damaging the first
board, a computer or a receiver. Rework remains possible, not the safety plan.

## Acceptance checklist

| Function | What completion requires | Present checkpoint |
|---|---|---|
| USB service | Flash, serial TX/RX and debug with stable logic power; startup/recovery states documented | Native data wired; electrical and powered tests pending |
| Logic power | USB-only/no-cell operation and optional-cell operation; qualified charge/current policy | Beetle-style TP4057/PMOS/diode/RT9080 drawn; cell, USB budget and thermal qualification open |
| Voltage selection | Independent manual/app settings; ESP selects supported voltages with qualified accuracy and overshoot | Guarded manual and MCP4251 paths plus relay/MOSFET selector drawn; calibration, handover and brownout unqualified |
| Current control | ESP adjusts draw smoothly within input/output and hardware limits, including a defined off/low-power behavior | Mechanical output ceiling about 0.90-9.11 A, nominal input ceiling about 13.6 A and BQ/ESP I2C drawn; phase limits and powered behavior need qualification |
| Power control | Measured-power feedback adjusts current while respecting CV, receiver and generator limits | Architecture only; firmware unchanged |
| Power envelope | Demonstrated thermal/ripple/saturation limits and published derating across supported voltage pairs | 55 V ceilings and roughly 400 W OUTPUT ambition; neither maximum voltage/current simultaneously nor full 13S charging is promised; thermal, input OV and autonomous power limits unfinished |
| Logic loss/faults | Qualified autonomous manual fallback on ordinary ESP loss, with independent handling of hazardous faults | CE pull-down and automatic selector drawn; open K1.9 removes one pole-skew hazard; brownout, retained-state transitions and independent protection unfinished |
| Receivers | Separate supply and direct-battery profiles, with chemistry, voltage accuracy, temperature and charging termination as appropriate | Compatibility research is not connection approval |
| Accessibility | Fit-for-purpose available parts; complete cost and exact supported assembly variants | Living BOM with unresolved selections |

Do not invent a guaranteed lower voltage, continuous current, accuracy or power
rating from a controller headline. Minimum voltages, setpoint resolution,
low-current behavior and derating must be explicitly closed in the specification.
Firmware and physical measurements will ultimately be needed to validate V2;
this documentation task does not start firmware development or authorize orders.

The user's requirement that either knob can reach either endstop without board
damage includes BOTH knobs at maximum together. The drawn higher-current
design must still resolve the combined power/thermal envelope; separate resistor
bounds below 55 V and 10 A do not establish this. See the
[approved requirements](../CONTROL_REWORK_DECISIONS_2026-10-08.md).

## How adaptive effort should work

The ESP supervises a fast dedicated converter, rather than producing the four
MOSFET gate waveforms itself. Receiver configuration establishes voltage and
charge restrictions. Requested pedal load establishes a power/current demand.
Input/output measurements close the slower supervisory loop. The converter
performs its own fast regulation and the independent protections override both.

An illustrative 100 W electrical input target at 36 V corresponds to 2.78 A
input. That is not an output-current setting or a mechanical torque guarantee.
The controller must account for conversion losses, receiver acceptance and
cadence. If the receiver cannot absorb the demand, reduce electrical braking
and report the limitation; no internal dump is available to preserve it.

## Decisions versus candidates

- USB-only external logic power plus optional protected 1S cell is approved.
- ESP32 module remains fitted; its 3.3 V regulator is external to the module.
- The latest user direction removes TPS63031 and BQ24074 in favor of Beetle's
  TP4057, discrete USB/cell selection and RT9080 LDO, conditional on qualification.
  Do not restore TPS63031 by default. The simpler path sacrifices managed USB
  current allocation and low-cell boost; quantify these limits explicitly.
- BQ25756 remains selected while alternatives are compared. I2C does not by
  itself eliminate the need for wide-range voltage-setting hardware on that IC.
- Latest user direction selects the dual MCP4251-503E/SL: one channel for integrated
  CV, the other unused internally and exposed on its connector. Do not consume
  the spare for coarse/fine CV or delete U3. BQ current control remains I2C.
  The protected analog selector is drawn, not dynamically qualified. This is
  not permission to attach low-voltage pot terminals directly to an energized
  feedback divider or to reuse MCP42100 firmware unchanged.
- No internal dump, no restored generator AUX, no multi-receiver branch expansion.

See [converter comparison](CONVERTER_CHOICE.md) before freezing the main design.
