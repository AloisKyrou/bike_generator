# Historical INA238 reference

[Guide index](../README.md). Not an active page in the eight-sheet adaptive
checkpoint of 8 October 2026.

The previous INA228_SENSE sheet actually used INA238AIDGSR. Its unreferenced
child file and prior checkpoints are preserved, not fitted in the current
integrated assembly or BOM. Reconnecting it requires a new circuit review.

BQ now supplies default telemetry. R1 is its 5 mOhm Kelvin input shunt on MAIN;
R75 is its output shunt. Shared 4.7k I2C pullups R4/R6 moved to the MCU sheet.

ADC register resolution is not guaranteed accuracy. Compare readback to
reference instruments across voltage/current and warm-up, especially low-current
offset. External-converter J2 bypasses BQ input sensing and needs its own
measurement choice. Restore a precision sensor only if measurements justify it.

[Main stage](08_MAIN_CONVERTER.md), [control contract](../BQ25756_CONTROL_CONTRACT.md),
[historical checkpoint](../../SCHEMATIC_COMPLETION_2026-10-08.md).
