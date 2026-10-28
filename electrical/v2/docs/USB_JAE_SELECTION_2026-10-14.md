# J27 JAE USB-C provisional selection

User decision, 14 October 2026: retain JAE for now. No fabrication or order
approval. No manufacturing-rule relaxation and no custom GCT footprint.

## Physical pin-map acceptance

- Manufacturer / MPN: JAE `DX07S016JA1R1500` (0.9mm shell stakes).
- Drawing: `SJ121836`, version 1, title `DX07S016JA1`, original 5 December
  2019, sheet stamp 27 December 2019, page 1. Manufacturer-authored drawing
  obtained from [PCB-3D mirror](https://www.pcb-3d.com/wordpress/wp-content/uploads/JAE_DX07S016JA1_dwg_no_SJ121836_USB_C_Plug_RA_SM.pdf).
- Source SHA256: `B2D7F3B13582272BA5A3D406804EEA1FBEC2F534C8F9720EAE15899A8B2D6993`.
- This is an archived drawing, not a claim of the latest revision. JAE's
  [February 2026 material PCN](https://www.tti.com/content/dam/ttiinc/products/PCN/JAE/JAE-MB-500.pdf)
  concerns recycled housing material, plating outside functional contacts and
  contact-material supplier; no pin-layout change is described.
- Symbol: `Connector:USB_C_Receptacle_USB2.0_16P`.
- Footprint: `Connector_USB:USB_C_Receptacle_JAE_DX07S016JA1R1500`.

All rows below use the drawing's **connector mounting-side PCB view**, rear
terminal row at top, receptacle mouth at bottom. Walk left to right from PCB
land 1 (not the connector's mating-front view). Coordinates are KiCad local mm,
rotation zero; every contact row is at Y=-3.05. Drawing note 8 maps PCB land
numbers 1-12 to the USB contact numbers used by the symbol and footprint.

| Physical contact | Function / symbol name | Symbol type | Footprint pad | X | PCB land |
|---|---|---|---|---:|---:|
| A1 | GND | passive | A1 | -3.10 | 1 |
| B12 | GND | passive | B12 | -3.10 | 1 |
| A4 | VBUS | passive | A4 | -2.35 | 2 |
| B9 | VBUS | passive | B9 | -2.35 | 2 |
| A5 | CC1 | bidirectional | A5 | -1.75 | 3 |
| B8 | SBU2 | bidirectional | B8 | -1.25 | 4 |
| B7 | D- | bidirectional | B7 | -0.75 | 5 |
| A6 | D+ | bidirectional | A6 | -0.25 | 6 |
| B6 | D+ | bidirectional | B6 | 0.25 | 7 |
| A7 | D- | bidirectional | A7 | 0.75 | 8 |
| B5 | CC2 | bidirectional | B5 | 1.25 | 9 |
| A8 | SBU1 | bidirectional | A8 | 1.75 | 10 |
| A9 | VBUS | passive | A9 | 2.35 | 11 |
| B4 | VBUS | passive | B4 | 2.35 | 11 |
| A12 | GND | passive | A12 | 3.10 | 12 |
| B1 | GND | passive | B1 | 3.10 | 12 |

Mechanical and shell reconciliation, same mounting-side view:

| Feature | Symbol / pad | Local X/Y mm | Geometry |
|---|---|---|---|
| Left rear shell stake | SH / SH, passive | -4.32/-2.675 | 0.6x1.6mm plated slot, 1.3x2.3mm copper |
| Right rear shell stake | SH / SH, passive | 4.32/-2.675 | Same |
| Left front shell stake | SH / SH, passive | -4.32/1.15 | 0.6x1.9mm plated slot, 1.3x2.6mm copper |
| Right front shell stake | SH / SH, passive | 4.32/1.15 | Same |
| Left bottom-shell land | No symbol / unnumbered | -1.4/1.15 | 1x2mm SMT, mechanical reinforcement |
| Right bottom-shell land | No symbol / unnumbered | 1.4/1.15 | Same |
| Left locating peg | None / NPTH | -3/-1.95 | Diameter 0.6mm |
| Right locating peg | None / NPTH | 3/-1.95 | 0.85x0.6mm oval |

16 functional contacts form 12 physical terminal lands; four coincident pad
pairs intentionally represent internally common GND/VBUS contacts. Symbol:
17 pins including one SH. Footprint: 24 pad records = 16 contact records,
4 SH, 2 mechanical shell lands and 2 NPTH. The eight SuperSpeed contact
positions have no functional pin or PCB land in this USB2 part.

Small contact lands are 0.27x1mm, power/ground lands 0.52x1mm. Coordinates,
slots, peg sizes and orientation match the manufacturer's recommended layout.
Standard footprint uses rounded copper corners and enlarged copper around
shell slots. Note 6 recommends soldering the two bottom-shell lands for
mechanical strength: use solder paste/hot air, not an assumption of iron-only
assembly. Four side stakes and the rear contact row remain accessible.

Konnect symbol/footprint queries, disposable instance readback and rendered
symbol/PCB inspection completed. Evidence in `.konnect-scratch/jae16-*`.
The symbol test was created outside the repository after Konnect correctly
refused ambiguous ownership inside a scratch directory containing old projects.

## Clearance evidence

Native KiCad 10.0.6 DRC on one isolated standard-footprint instance reports
0.2660mm from the oval locator to a shell land, 0.3000mm to outer GND, and
0.4000mm to nearby VBUS. Thus the limiting reported NPTH/copper gap exceeds
V2's 0.25mm requirement. This is nominal CAD clearance, not tolerance analysis.

The disposable project's default edge-clearance rule is 0.5mm, so its report
contains five edge-clearance findings at those measured distances; it is NOT
a zero-DRC coupon. Eight additional clearance/mask findings are the four
intentional duplicate GND/VBUS pad pairs with no nets assigned in the coupon.
Whole-board DRC with real pad nets and V2 rules is still required after swap.

## Sourcing

[DigiKey France](https://www.digikey.fr/fr/products/detail/jae-electronics/DX07S016JA1R1500/11585731)
displayed EUR1.58 at quantity1 and EUR1.344 at quantity10, excluding applicable
tax/shipping; 6,408 stocked at lookup. This is provisional sourcing, not a
reserved quote. Prefer consolidated distributor orders.

## Implementation status

J27 replaced in schematic and PCB; position 14/45mm, rotation -90 degrees,
unchanged. Native KiCad Change Footprints was required because Konnect's
schematic sync explicitly refuses a footprint-ID substitution. Native netlist
import then synchronized custom fields, and native library refresh restored
the standard shell-pad mechanical attributes omitted by the typed IPC update.
Do not assume a successful typed sync preserves every unsupported pad property.
Final native DRC has no library mismatch or J27 schematic-parity warning.

Nine affected local segments replaced by thirteen; 1056 previous segments
preserved exactly, no footprint moved, no via added. 1069 tracks, 131 vias,
149 footprints. Existing D- bottom bridge is retained for crossing the D+
terminal group; all thirteen new segments are on F.Cu. USB from the ESD
device to the MCU still has the previous unfinished connections.

Checks:

- All 125 exported net names and pin memberships unchanged; 145 components.
- Native ERC: zero violations. USB service checks: 118 assertions passed;
  all five deliberately broken regression fixtures rejected.
- Final DRC: 132 findings = five oval-NPTH edge-clearance errors plus the
  previous 127 silkscreen warnings. 16 unconnected items remain, as before.
  Four intentional board-only mounting-hole parity findings; sync dry run noop.
- No new track clearance, short, dangling-track, courtyard or mask finding.
- Rendered USB schematic and local PCB inspected. BOM and cost-tracker tests
  updated/passed. Historical BQ24074 `test-usb-only-*` is not the current
  Beetle-style power-path acceptance suite and was not silently rewritten.

## Fabrication hold: not solved by the nominal hole gap

Important correction to the initial clearance screening: KiCad applies the
board's **0.50mm copper-to-edge rule to the oval NPTH**, whereas its circular
peg is checked using the 0.25mm hole rule. This generates five findings at
0.266/0.300/0.400mm. Neither limit has been relaxed, and no exclusion added.

The slot is **0.60mm wide and 0.85mm long**. This is not just a DRC display
issue: [JLCPCB's published rigid-board capabilities](https://jlcpcb.com/capabilities/pcb-capabilities)
state 1.0mm minimum non-plated slot width; [PCBWay](https://www.pcbway.com/pcb_prototype/Plated_through_slots.html)
states 0.8mm. Thus do NOT claim this exact standard footprint is accepted by
their standard processes, or silently enlarge/plate the locating hole.

[Eurocircuits](https://www.eurocircuits.com/technical-guidelines/pcb-design-guidelines/mechanical-layer/)
publishes slots down to 0.50mm; this is a possible process lead, NOT a validated
whole-board or cost-compatible supplier selection. Copper clearance, exact
short-slot capability/tolerances, 2oz/1.6mm stackup and cost still need checking.
Keeping JAE provisionally does not close the USB manufacturing gate. Resolve
with published compatible capability, or change connector with user agreement;
no manufacturer waiver is authorized.

Final evidence: `.konnect-scratch/jae16-final-drc.json`, `jae16-erc.json`,
`jae16-before.xml`, `jae16-after.xml`, `jae16-verify-result.json`,
`jae16-usb-sheet-final.png`, `jae16-final-local.png`, `jae16-import-report.txt`.
