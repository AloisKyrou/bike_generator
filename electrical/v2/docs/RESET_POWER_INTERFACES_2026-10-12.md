# Reset correction and explicit logic-power interfaces

User approved the architecture review corrections on 12 October 2026.
All native changes were made through Konnect, preserving existing user work.
No PCB, firmware, BOM part selection or energization changes.

## Reset correction

The previous saved netlist had R30.2/C32.1 on an isolated RC midpoint, while
MCU_EN contained only U2.8 and J23.1. ERC did not flag this functional omission.
Two continuous wire segments now join the midpoint to MCU_EN. The MCU_EN label
was moved along its existing wire to avoid a text crossing. R30, C32, their
values, and all existing physical component positions are unchanged.

The intended net is exactly U2.8, J23.1, R30.2 and C32.1. R30.1 remains on
3V3; C32.2 remains on GND. See Espressif's
[power-up/reset guidance](https://docs.espressif.com/projects/esp-hardware-design-guidelines/en/latest/esp32c3/schematic-checklist.html).

## Power architecture presentation

Five explicit +3V3 hierarchical interfaces show the source and consumers:

- LOGIC_POWER_USB_ONLY: output from the existing RT9080 rail.
- MCU_MODULE_PROVISIONAL, CC_CONTROL, CONNECTORS and MAIN_CONVERTER_TBD: inputs.

The root connects each interface to a named power symbol with a short wire.
This avoids crossing the existing signal routes. Existing global power symbols
remain; these interfaces document the same rail, not separate or isolated
supplies. The root now explicitly states that GND is common and the design is
not galvanically isolated. MAIN's 3V3 input serves the existing service/pullup
circuitry, not the converter's high-power supply.

## R86 and TP47

R86 is the existing 10k rail bleeder from 3V3 to GND. It helps discharge the
logic rail when no source supplies it and sinks small leakage/injection currents,
including via D24's clamp. At 3.3 V: I=0.33 mA and P=1.089 mW. With a backup
cell still powering the rail it remains a continuous load. It is not a divider,
generator dump load, or independent brownout/backfeed protection. TP47 is the
adjacent ground probe pad. Both are unchanged.

## Verification and scope

- Final saved hierarchy ERC: 0 errors / 0 warnings with inherited settings
  unchanged. validate_sheet_pins: 0 issues.
- Physical component data unchanged: 145 components. Nets: 126 -> 125, solely
  because the isolated RC midpoint now joins MCU_EN. All other named endpoint
  sets, including 3V3 and GND, are unchanged.
- Added `validation/test-mcu-reset-netlist.ps1`: passes on the final XML and
  rejects the actual pre-fix snapshot for the missing RC-to-EN connection.
- Inspected renders of all six edited sheets. Existing physical component
  positions and existing wire segments were not moved; only new routes and
  virtual power/interface objects were added, with the EN label repositioned.
- POWER_PATH, USB_INTERFACE, inactive sheets, project and copied PCB remain
  byte-identical to the turn's starting snapshot.

Review PDF, XML, ERC and comparison report:
`../kicad/exports/review-en-power-2026-10-12/`.
Local starting snapshot: `.konnect-scratch/en-power-20261012/before/`.

This closes the identified reset omission and power-interface readability task,
not the complete power-stage safety review. Surge/receiver protection, handover,
USB/cell behavior, thermal/stability qualification and PCB design remain open.
JP20/JP30/JP31 remain open; no fabrication or power-up approval is implied.
