# USB-only logic and BQ25756 study checkpoint

Date: 7 October 2026. **Not a build release. Do not energize the main stage.**

## Review Files

- [Nine-sheet review PDF](../kicad/exports/review-usb-only-2026-10-07/controller-v2-review.pdf)
- [Saved hierarchy XML](../kicad/exports/review-usb-only-2026-10-07/controller-v2.xml)
- [Native ERC](../kicad/exports/review-usb-only-2026-10-07/controller-v2-erc.json)
- [Independent native ERC](../kicad/exports/review-usb-only-2026-10-07/independent-final-erc.json)
- [Root drawing](../kicad/exports/review-usb-only-2026-10-07/root-final.png)
- [Logic power](../kicad/exports/review-usb-only-2026-10-07/logic-final.png)
- [BQ study](../kicad/exports/review-usb-only-2026-10-07/main-final.png)
- [Module](../kicad/exports/review-usb-only-2026-10-07/mcu-final.png)
- [USB interface](../kicad/exports/review-usb-only-2026-10-07/usb-oct7-first.png)

Final inventory: **138 components, 121 nets, nine sheets**. Physical board layout
remains the unchanged V1-derived baseline and is intentionally out of sync.

## Preserved Baseline

Before editing, the previous V2 was archived as
`electrical/archive/v2-abandoned-auxiliary-5v-2026-10-07/v2-abandoned-auxiliary-5v.zip`.
All 93 files were independently compared by the root agent; the schematic agent
also verified the ZIP hash before mutations:
`ADD6B18AD1F9BB342FFF6F1A4A684E48DA836804C11673605F75668C9FFAE82F`.

No V1, real PCB or firmware mutations were made. Root independently compared
22 V1 design/library files to their pre-migration HEAD blobs and the V2 board
to its archived copy. The unchanged V2 board SHA256 is
`B6C1248F91D1D950E8D2141FAA64D977A4DDE9D1C13A673F252443F9A13E9F0F`.
This uses available earlier evidence, not an invented retrospective baseline.

## USB and Backup Power

The active AUX_SUPPLY hierarchy, F2 auxiliary branch, LM5164 auxiliary function
and TPS2116 source mux are removed. `aux_supply.kicad_sch` is retained as an
unreferenced historical file; it does not appear in the active netlist or BOM.
No generator-derived 5 V logic supply remains. Common power-path protection,
INA238 sensing (historical INA228_SENSE sheet name) and AC/DC assembly boundaries
remain inherited, not requalified.

New `USB_INTERFACE` owns J27, U8, R49/R50, C50 and J25. Its VBUS_USB hierarchy
connection feeds `LOGIC_POWER_USB_ONLY`. USB_DP/DM connect to native MCU USB.
Logic retains BQ24074 and TPS63031, with a directly drawn SYS_BAT rail between
charger and regulator. Optional protected 1S cell and NTC use J26. JP20 remains
open until the cell, NTC and charging limits are qualified. JP21 is a manual
commissioning enable, labeled LOGIC ON. Automatic wake is not required here.

JP22 is a **lab-only USB500 selector**, open by default. SYS_BAT -> R52.1/2
(10k) -> JP22.1; JP22.2 joins U6.6 EN1 and R51.1 (100k), R51.2 is GND.
U6.5 EN2 is GND. Open selects USB100; closed selects USB500. R48 now has
pin 2 at REG_EN and pin 1 at GND, an electrically equivalent layout reversal.
The selector does not negotiate USB current or authorize a PC's 500 mA budget.
USB-only/no-cell ESP32 boot and radio loading remain unqualified at USB100.
USB current policy, suspend behavior, OVP, CC protection and sustained HV fault
containment are unfinished. The ESD array is not galvanic isolation.

## BQ25756 Bench Circuit

U9 is the selected BQ25756RRVR, placed only after custom-symbol authorization,
manufacturer all-pin reconciliation, standard-footprint scratch placement,
pad readback and visual inspection. See the [37-pin model report](../../components/ti-bq25756/kicad-model-validation-2026-10-07.md)
and [power-part report](../../components/ti-bq25756/power-stage/kicad-validation-2026-10-07.md).
The main sheet keeps its historical `_tbd` filename because system integration
and safety are not complete; it is no longer an empty placeholder.

Actual connections now include four SIR680LDP MOSFETs, IHLP 10 uH inductor,
two 5 mOhm shunts, 10 ohm / 470 nF differential / 100 nF common-mode sense
filters, external bootstrap diodes and capacitors, separate VAC decoupling,
direct REGN-to-DRV_SUP supply, and fixed programming networks. Physical lead
17 is PGND per the August 2026 TI datasheet, not MODE as in older EVM material.

The selected study resistors target approximately 12.005 V nominal CV,
1.002 A output limit, 1 A input limit and 250 kHz. Input UV threshold is about
9.91 V, DPM about 10.90 V and OV about 54.21 V nominal. These are calculation
targets, not measured limits or a safe battery profile. VFB trim and tolerances
change CV; firmware can disable CE and both pin-programmed current limits.
J33 requires a qualified 10k NTC network; an open sensor inhibits normal charging.

JP30 and JP31 stay **OPEN**, separating external input/output connectors from
the study power path. Their connector/jumper ratings and footprints are not
selected. They are commissioning boundaries, not an independent active safety
system. J32 is a separate bench-control port; no direct ESP32 I2C or 3V3 wiring
was added. It does not provide galvanic isolation. CE pull-up depends on this
external bench logic rail and is explicitly not a logic-absent safety guarantee.

No battery may be attached or power applied before protection and commissioning
review. Output reverse blocking, physical fault isolation, independent default
off, OVP/OCP, thermal shutdown and wide-range CV control remain unfinished.
The MCP42100 external-converter interface is preserved but not connected to BQ
feedback. No digipot or DAC shortcut was invented. No internal dump was added.

The 55 V input/output architecture ceiling and 15 A / 10 A sizing candidates
are **not operating ratings**. At 55 V, direct REGN drive with these EVM FETs can
exceed 1 W IC dissipation before other losses. The two 56 uF plus two 10 uF
nominal capacitors on each side need effective-capacitance, ESR, ripple and
layout verification. Both exact bulk and large-MLCC candidates lack stock at
checked distributors; they are costly reference selections, not the final
accessible BOM. Manufacturer TDK characterization download was blocked and is
an explicit remaining archive/DC-bias validation gate, not claimed complete.

## Component Delta

Compared with the October 6 presentation export, 63 components were added and
31 removed, for a net increase of 32. Existing retained component values and
footprints are unchanged except JP21's descriptive value.

- Added logic: JP22, R51, R52.
- Added main: U9; Q10-Q13; L3; D10/D11; C60-C80; R60-R83; J30-J33; JP30-JP32.
- Removed active AUX: U4, L1, C5-C13, R12-R18, TP12, TP14, F2.
- Removed mux/aux interface: U5, Q1, C40/C41, R40-R44, J24.
- Moved between sheets without changing MPNs: J27, U8, R49/R50, C50, J25.

Exact MPNs and unresolved selections are in the ongoing overall BOM, maintained
from the final XML. Unpriced HV capacitors, connectors and support parts are
not assigned fictitious inexpensive LV allowances.

## Verification and Process

- Native KiCad hierarchy ERC: zero violations under unchanged inherited rules.
  Existing ignored categories are single_global_label, four_way_junction,
  simulation_model_issue and footprint_filter; no new suppression was added.
- Konnect hierarchy pin validation: zero issues.
- Independent USB regression: 52 physical endpoint/component assertions pass.
- Independent main regression: 85 endpoint/model/default assertions pass.
- Root reports 19 deliberately corrupted XML fixtures correctly rejected.
- BQ model: all 37 symbol and footprint copper pads reconciled, including EP37;
  12 paste-only apertures preserved. FET, inductor, diode and bulk-capacitor
  scratch models read back and native rendered output visually inspected.
- Actual root, MCU, USB, logic and main drawings were visually reviewed;
  common local rails are continuous, source/receiver boundaries remain visible,
  and safety notes remain inside the page. Interblock driver, Kelvin-sense,
  feedback and bench-control labels avoid a tangle across the large main IC.

All KiCad writes used official Konnect 0.12.1 MCP via the repository scratch
stdio helper, with saved-file readback. KiCad CLI generated only review exports.
No generic source editing, board sync, manufacturing, orders or firmware work
occurred. The MCP session had no live KiCad IPC; disk files are authoritative.
No `save_project` call was made against an unrelated open board. Working-tree
material, old exports, snapshots and source references were preserved.
