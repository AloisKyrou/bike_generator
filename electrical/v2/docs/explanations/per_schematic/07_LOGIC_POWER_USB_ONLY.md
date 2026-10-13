# USB power and optional protected cell

[Guide index](../README.md). Saved page 6, LOGIC_POWER_USB_ONLY.
Updated 8 October 2026: the user selected the Beetle-style circuit instead of
BQ24074/TPS63031, subject to meeting the requirements below.

## Same topology as Beetle

```text
USB VBUS ------> D20 --------> SYS_BAT --> U7 RT9080 --> 3V3 logic
   |                             ^
   +--> R45 --> U6 TP4057 --> BAT_1S --> Q20 PMOS
                              |
                         protected 1S cell
```

With USB present, D20 supplies the system and the VBUS-driven PMOS gate turns
Q20 off. TP4057 charges the optional cell independently when charging is enabled.
The ESP does not run through the battery while USB is supplying it. Without USB,
the gate pull-down turns Q20 on and the cell supplies the system. Without a cell,
USB can still supply the logic. Without either source, logic is off.

RT9080 is the external 3.3 V LDO used by Beetle; a bare ESP32 module does not
generate its own 3.3 V from 5 V. This version has no logic buck-boost regulator
or logic inductor. It does not boost a nearly empty cell, so low-cell runtime
and radio-burst stability need measurement. No generator AUX remains: pedaling
does not recharge this small logic cell.

The circuit copies the official C3 topology, not a fully identified Beetle
manufacturing BOM: its diode and PMOS references were not published. The
completion pass selects AOS AO3401A in hand-solder SOT-23 and Kingbright
WP710A10LGD in 3 mm THT. D20 is Vishay SS1H10-E3/61T in hand-solder SMA.
R51 is now 1k instead of 10k, adding about 5 mA USB draw while limiting
hot reverse-leakage-induced PMOS gate rise. R45 is a stocked 0.82 ohm
0.5 W Bourns part instead of nominal 0.8 ohm, an explicit minor value change.
Their system behavior still needs qualification. A removable charge-enable link is an
intentional commissioning addition, not a Beetle feature.
[Official schematic](https://dfimg.dfrobot.com/nobody/wiki/d0e8b7f0f042c14f6959c3edc748053b.pdf).

## Components and operation

| Item | Purpose |
|---|---|
| J26 | Two-pin protected 4.2 V-charge 1S lithium cell; verify actual cell polarity |
| U6 TP4057 | Linear cell charger, not a system-current allocator or BMS |
| R45, CRM1206-FX-R820ELF | 0.82 ohm, 0.5 W at 70 C, hand-solder 1206; 400 mA dissipates about 0.131 W; not a fuse or USB current controller |
| R46, 2 kohm | Approximately 400 mA charge setting according to the manufacturer application table; verify exact fitted part and thermal behavior |
| JP20 | Open disconnects PROG from ground and disables charging; close only after cell/source/thermal qualification |
| D21 WP710A10LGD and R47 | Green low-current 3 mm THT charging indicator; unused STDBY output remains unconnected |
| D20 SS1H10-E3/61T and Q20 AO3401A | Discrete USB/cell selection; leakage, dropout and partial-power transitions require tests |
| U7 RT9080-33GJ5 | Fixed 3.3 V LDO, enabled from the system node through 200 kohm |

The previous JP21 logic-enable and JP22 USB100/USB500 links are removed. There
is no automatic wake controller or finished storage switch. Disconnect the
optional cell for storage; an always-connected LDO is not a zero-drain off state.

## Requirements still to prove

- USB input current is approximately logic current plus charge current. The
  charger does not reduce charge current to reserve a negotiated USB allowance
  for the ESP. A 400 mA charge setting plus active radio can exceed 500 mA.
- No claim of unrestricted PC-port or USB suspend compliance is made. Qualify
  a supported source policy; JP20 is a service link, not USB negotiation.
- RT9080 heating matters: at 5 V USB, a 0.3 V diode drop and 375 mA sustained
  load, it dissipates about 0.525 W. RF peak current is not automatically a
  sustained thermal load. Test both heating and short load steps.
- TP4057 has no cell-temperature input. Its die-temperature regulation does
  not measure the cell, and a protected cell is not automatically temperature
  protected. Define the allowed cell and ambient/charging conditions.
- Verify hot-plug, weak USB, empty cell, brownout recovery, diode leakage and
  battery-powered USB data backfeed. Discrete selection is not managed power
  prioritization, galvanic isolation or guaranteed computer protection.

See [decision and calculations](../../BEETLE_POWER_DECISION_2026-10-08.md),
[USB fault review](../../USB_AND_LV_FAULT_REVIEW.md), and
[USB interface](09_USB_INTERFACE.md). This is a drawn replacement, not yet a
measured demonstration that every full-board requirement is met.
