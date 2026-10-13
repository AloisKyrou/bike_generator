# V2 schematic presentation checkpoint, 2026-10-06

Presentation-only follow-up to the LV2 checkpoint. This is not a new electrical
design release or hardware qualification.

## V1 reference

Reviewed the schematic diffs in commits `583232d` and `aefcb01`, and rendered
the saved V1 auxiliary supply and MCU sheets. The useful pattern is continuous
local circuits, supporting parts grouped next to their IC, and labels naming
nodes instead of replacing short wires. This records observed history, not an
assumption about who authored each edit.

## Saved changes

Only `mcu_module.kicad_sch` and `lv_power_usb_tbd.kicad_sch` were changed.
All mutations used official Konnect MCP schematic operations through the local
stdio client. No generic script or editor wrote KiCad source files.

- MCU: grouped reset/boot service parts, connected the reset RC network directly,
  and drew USB and accessory GPIO series paths continuously to their test/header
  connectors. Joined the module bypass capacitors and test point to a visible
  3.3 V rail. Removed redundant power symbols and separated text from wires.
- LV: connected mux input capacitors, mode selection and charger-control pullups
  directly; grouped charge-enable parts with the charger; connected regulator
  input capacitors, enable jumper, pulldown and ground returns directly. USB VBUS
  now visibly joins the connector, ESD device and bypass capacitor.
- Enlarged and wrapped LV safety/reference notes without changing their meaning.
  Kept unfinished-design warnings and all service-jumper restrictions visible.

Konnect layout readback counts:

| Sheet | Local labels before | Local labels after | All labels before/after |
| --- | ---: | ---: | ---: |
| MCU module | 21 | 9 | 35 / 21 |
| LV power / USB | 29 | 8 | 32 / 11 |

The remaining `BOOT_N` pair connects opposite sides of the MCU without routing
around the module and crossing other signals. LV `SYS_BAT` and `VBUS_USB` pairs
connect separate functional blocks. The `CHG_DISABLE` pair avoids a long route
back across charger input/status/current-setting wiring. Hierarchical labels and
USB cross-sheet labels remain purposeful. Named nodes were retained so that net
names as well as pin endpoint sets remain equivalent.

## Verification

Artifacts are in `../kicad/exports/review-presentation-2026-10-06/`:

- `before.xml` and `before.pdf`: pre-edit review baseline.
- `after.xml`: final saved hierarchy connectivity.
- `controller-v2-presentation.pdf`: final nine-sheet review PDF.
- `mcu-module.png`, `lv-power-usb.png`: final detailed rendered sheets.
- `erc.json`: native KiCad 10.0.6 hierarchy ERC, zero violations.
- `root-independent-erc.json`: independent final native hierarchy ERC, also zero
  violations under the unchanged project settings.

`validation/test-presentation-equivalence.ps1` passes: all 106 component records
(including values, footprints and custom fields), 90 named nets and full pin
endpoint records, nine sheet identities, and 24 library part definitions are
unchanged. `validation/test-lv-power-netlist.ps1` passes all 48 assertions.
The root reviewer independently repeated both tests, accepted the final MCU/LV
renders, and refreshed the BOM from `after.xml`: its component CSV is byte-identical
to the preceding baseline and costs are unchanged. SHA-256 comparisons confirmed
24 V1 design/library and copied V2 PCB files unchanged.

The comparison caught a temporary U8 VBUS wire stopping short of the actual pin.
An exact Konnect pin-coordinate readback identified the endpoint; it was fixed
before the final comparison and ERC. This illustrates why a visually plausible
wire alone was not accepted as verification.

All nine pages of the exported PDF were visually inspected, including the two
reworked sheets at higher resolution. Other inherited sheets were left unchanged
because this pass targets the newly added blocks. Existing inherited layout
limitations, such as dense power-path annotations near the page boundary, are
not represented as newly corrected here.

ERC retains the inherited ignored categories: `single_global_label`,
`four_way_junction`, `simulation_model_issue`, and `footprint_filter`. No new
suppression was introduced; zero reported violations is not an all-checks safety
certificate. Konnect file-backed writes are the saved schematic state; no live
PCB save or schematic-to-PCB synchronization was performed.

## Unchanged limits

No parts, MPNs, quantities, electrical nets, hierarchy or library definitions were
added or changed. No V1, PCB or firmware files were edited. BOM cost is unchanged.
The main BQ25756 stage remains absent; wake/forced-off and USB fault containment
remain unfinished. The 55 V working ceilings remain unqualified design intent.
No internal dump hardware was added. Previous LV2 component and safety evidence
continues to apply without being upgraded by this presentation pass.
