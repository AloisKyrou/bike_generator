# Generator power entry

[Guide index](../README.md). Saved page 2, POWER_PATH.

## Current protection choice, 10 October

The latest [single-input decision](../../SINGLE_INPUT_FUSE_2026-10-10.md) keeps
one F1 after RECTIFIED_RAW, as already wired, with no F_SRC base accessory.
F1/D1 are unchanged. The conditional receiver-battery fuse is still separate.
F1 cannot clear internal bridge/input-cable shorts or the reverse-J1 bridge
loop; an unfused energy-rich DC source is not supported. Existing source
protection must be verified before crediting it. No holder or active reverse
controller is added. Fuses do not block ordinary backfeed or regulate voltage.

## Saved circuit

J1 accepts direct DC. J8 and D2 provide three-phase rectification. Both reach
the same F1 fuse and inherited SMCJ70A D1. Never connect two sources at J1/J8.
A DC-only assembly can omit D2/J8 while keeping the fused J1 route;
reverse-polarity protection is not qualified merely by doing so.

R1 moved to MAIN_CONVERTER_TBD and became a 5 mOhm four-terminal Bourns shunt.
Separate force/Kelvin paths serve BQ input regulation and telemetry. Redundant
R74 and dedicated INA assembly are removed; R4/R6 pullups remain on MCU.
There is no generator-derived logic AUX branch.

J2 and external-converter support are removed. The integrated converter is the
only intended receiver path. Required DC source-adjacent fusing must cover a
reversed J1 fault through D2 that occurs **before F1**. A receiver battery also
requires a nearby fuse. Select voltage, DC interrupt rating and cable protection
for the actual source fault current; no universal cartridge or no-fire guarantee
is implied. F1 remains 0456020.ER, 20 A/100 VDC, interrupt 300 A at100 VDC or
500 A at72 VDC. Its continuous-current/copper/temperature coordination is open.

This is not a qualified arbitrary-generator input. SMCJ70A can clamp near
113 V, above the new 100 V MOSFET and 85 V BQ limits. F1 does not regulate sustained
overvoltage. Open-circuit speed, polarity, faults, bridge cooling, fuse
coordination and an overvoltage disconnect remain unresolved. With no internal
dump, removing load removes braking and may raise generator voltage.

[Main stage](08_MAIN_CONVERTER.md),
[donor qualification](../../compatibility/QUALIFICATION.md),
[70 V power engineering](../../../../components/ti-bq25756/power-stage-70v/README.md).
