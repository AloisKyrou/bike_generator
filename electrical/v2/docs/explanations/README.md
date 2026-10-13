# V2 design explanations

Updated 8 October 2026. This is the readable guide to what each circuit does,
why it is present, and what remains unfinished. The current schematic is a
development checkpoint, not the completed V2 or a board ready to power.

## Start here

- [Current pre-layout decisions and remaining gates, 12 October](../PRELAYOUT_CLOSURE_2026-10-12.md)
- [Latest saved 70 V-class schematic and validation](../SCHEMATIC_VOLTAGE70_2026-10-08.md)
- [70 V-class scope and actual guarded limits](../VOLTAGE_RANGE_REWORK_2026-10-08.md)
- [Startup profiles, exact sensor and gate-drive findings](../CONTINUATION_READINESS_REVIEW_2026-10-08.md)
- [Probe-access map](../PROBE_ACCESS_2026-10-08.md)
- [Review and bring-up gates](../REVIEW_AND_BRINGUP_2026-10-08.md)
- [Implementation notes and completion criteria](IMPLEMENTATION_NOTES.md)
- [Fablab assembly and solderability](ASSEMBLY_NOTES.md)
- [Main converter choice and alternatives](CONVERTER_CHOICE.md)
- [ESP control, reset behavior and low-effort limits](BQ25756_CONTROL_CONTRACT.md)
- [Latest Beetle power decision](../BEETLE_POWER_DECISION_2026-10-08.md)
- [Logic power and comparison with Beetle](per_schematic/07_LOGIC_POWER_USB_ONLY.md)
- [Integrated main converter and commissioning limits](per_schematic/08_MAIN_CONVERTER.md)
- [USB data and power](per_schematic/09_USB_INTERFACE.md)

## One explanation per schematic page

Numbers match the saved eight-sheet voltage70 review PDF from the 8 October checkpoint, not immutable
KiCad sheet identifiers.

| Page | Saved sheet | Explanation |
|---|---|---|
| 1 | Root | [System connections](per_schematic/01_ROOT.md) |
| 2 | POWER_PATH | [Generator entry, rectifier and protection](per_schematic/02_POWER_PATH.md) |
| 3 | CONNECTORS | [External low-voltage interfaces](per_schematic/03_CONNECTORS.md) |
| 4 | MCU_MODULE_PROVISIONAL | [ESP32 module and service access](per_schematic/04_MCU_MODULE.md) |
| 5 | CC_CONTROL | [Independent manual/app voltage selector](per_schematic/05_CC_CONTROL.md) |
| 6 | LOGIC_POWER_USB_ONLY | [USB and optional logic battery](per_schematic/07_LOGIC_POWER_USB_ONLY.md) |
| 7 | MAIN_CONVERTER_TBD | [Integrated buck-boost](per_schematic/08_MAIN_CONVERTER.md) |
| 8 | USB_INTERFACE | [USB connector, data and ESD](per_schematic/09_USB_INTERFACE.md) |

[Historical INA238 reference](per_schematic/06_INPUT_SENSING.md) is outside the
active hierarchy and BOM. BQ telemetry is the default integrated assembly.

## General rules

The first physical V2 prototype is intended to contain the complete agreed
functionality. Low-power commissioning is a test sequence on that full board,
not a separate fixed-12-V product or a planned series of reduced-function PCBs.
Rework may still be needed after measurements; successful first-spin hardware
cannot be guaranteed.

Two distinct energy paths exist: USB/optional small cell powers the controller;
the generator feeds the main receiver through the power converter. Their
grounds are presently common. Removing AUX is not galvanic isolation.

No internal dump load is planned. External accessories can use logic PWM/ready
signals, with switching and dissipation outside this board. Supported generators,
receivers and assembly variants need documented qualification, not only an app
setting. A full nominal range does not imply maximum power at every voltage.

## Authoritative detail

- [Architecture specification](../CONTROLLER_V2_INTEGRATED_SPEC.md)
- [Saved schematic PDF](../../kicad/exports/review-voltage70-2026-10-08/controller-v2.pdf)
- [Exact checkpoint and verification](../SCHEMATIC_VOLTAGE70_2026-10-08.md)
- [BQ calculations and unresolved circuits](../BQ25756_IMPLEMENTATION_NOTES.md)
- [USB fault review](../USB_AND_LV_FAULT_REVIEW.md)
- [Complete BOM and costs](../../bom/README.md)
- [Generator/receiver compatibility study](../compatibility/README.md)

Existing dated documents, calculations and manufacturer evidence remain at
their original paths so references are not broken. This folder is the current
explanation layer; manufacturer evidence and saved connectivity settle exact
part behavior. Historical AUX proposals do not override the current direction.
