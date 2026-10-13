# Root schematic

[Guide index](../README.md). Saved page 1, adaptive checkpoint 8 October 2026.

The eight-sheet hierarchy separates generator power from USB/optional-cell
logic power, with common GND. It is not galvanically isolated.

POWER_PATH feeds MAIN_CONVERTER_TBD through BUS_PROTECTED. MAIN contains the
single Kelvin input shunt and BQ stage. MCU and BQ share I2C, with R4/R6
pullups now on MCU_MODULE_PROVISIONAL. Dedicated INA circuitry is outside
the active hierarchy. CC_CONTROL receives SPI and GPIO20 and returns the
independent manual/app feedback connections to MAIN.

USB_INTERFACE feeds LOGIC_POWER_USB_ONLY. Since the 12 October readability
pass, native USB_DP/USB_DM use explicit bidirectional sheet pins and two
continuous root wires to MCU_MODULE_PROVISIONAL, not global signal labels.
The 3V3 distribution also has explicit hierarchical interfaces: one output on
LOGIC_POWER_USB_ONLY and inputs on MCU, CC_CONTROL, CONNECTORS and MAIN.
Root power symbols join these short branches without long crossing wires.
Global 3V3 symbols remain within sheets, and GND remains common throughout;
the root explicitly states that the circuit is not galvanically isolated.
CONNECTORS exposes five configurable GPIOs and service connections,
not load-driving power outputs.

JP20/JP30/JP31 remain open commissioning boundaries. The first prototype is
intended to contain full adaptive control, with low-current commissioning on
that same hardware, not a separate fixed-voltage PCB. Receiver transients,
generator overvoltage, USB faults, thermals and PCB layout remain release gates.

70 V is a class target, not continuous input permission: the guarded ACOV
screen is about 67.47-69.68 V including resistor temperature corners. Output
67.2 V is conditional on per-unit range and calibration, not guaranteed.
Approximately 400 W output is an app ambition, not a validated rating or
autonomous power limiter. J2 and external-converter support are removed.
No internal dump or generator-derived AUX supply is present. Required external
source/receiver fuses need source-specific voltage, interrupt and cable sizing.

[Checkpoint and verification](../../SCHEMATIC_VOLTAGE70_2026-10-08.md).
