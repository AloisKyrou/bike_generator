# PCB Reuse Plan

14 October 2026. Proposal only: no native KiCad file changed. Applies to the
external-converter project, not the integrated V2. The user requested review
of existing routing and a minimal-reroute migration proposal.

## Observed Baseline

Read the saved external PCB through Konnect metadata and native KiCad SVG and
GenCAD exports. No live IPC editor was available; a live synchronization dry
run was not performed. The board still matches the V1 PCB byte-for-byte.

- Outline: X=50..120 mm, Y=20..130 mm, 70 x 110 mm, two copper layers.
- 64 footprints: 60 schematic components and four board-only mounting holes.
- GenCAD contains 429 straight track segments: 390 top and 39 bottom;
  53 via records. Bottom copper includes a broad existing ground fill.
- Saved PCB: 46 nets. Current schematic: 95 components and 110 nets.
- By reference, 36 old schematic components still exist: 26 retain their value
  and footprint, ten have a value/footprint change. Another 24 old references
  are absent; 59 references are new. Final PCB count would be 99 including holes.
- This is not a claim that 36 footprints can be updated without rerouting.
  Sheet/symbol identity, pin functions and net names also changed. Reused
  designators such as R19 must not inherit old connectivity blindly.

No percentage of reusable routing is promised from these counts. Segment counts
depend on bends and say little about layout effort. No new copper/current/
thermal rating or fabrication readiness is established by this review.

## Proposed Placement

First try the existing outline. Do not compact the assembly at all costs;
if real courtyard, cable access or antenna checks fail, enlarge toward the
right before moving the preserved power-input assembly. Dimensions and new
component coordinates are not frozen by this proposal.

| Area | Proposal | Routing treatment |
|---|---|---|
| Left and bottom power entry | Keep J8, D2, J1, F1, D1, R1 and J2 at their existing anchors | Preserve AC/DC entry and main input power copper; remove only the old F2/AUX branch |
| Lower-middle input sensing | Keep U1, R2/R3, C1/C2/C3, JP1/JP2 and local sense test points | Preserve local Kelvin/filter/address topology; adapt bus connections where needed |
| Middle-left digital potentiometer | Start with U3 at its existing position; keep J7/J9 if the relay fanout permits | Preserve useful SPI/decoupling approaches, replace direct A/W/B-to-header paths with relay connections |
| Upper-middle, above the digipot | Place K1/K2 close to CC/CV and K3 nearby; driver and coil suppression local | New analog selection routing; keep coil current away from Kelvin/analog returns |
| Former AUX region, middle-right | Place R100/U10 and output filter/decoupling, with J40/J41 on the right edge | New short power-output path and local Kelvin pair; extend the existing I2C bus locally |
| Upper region, former Beetle/accessory area | ESP module at a free antenna edge, USB at an accessible edge, charger/LDO/cell connector nearby | New USB pair and module fanout; reuse surviving bus trunks only where geometrically appropriate |

The former AUX population occupies approximately X=86..110, Y=54..90 mm.
Its removal opens a useful middle-right region, not an automatically empty
placement rectangle: existing through-routes, holes and clearance still matter.
J40/J41 should have cable access without crossing the board to reach a terminal.
Keep converter IN and OUT positive paths separate; returns are common by design.

Useful preserved anchor positions (millimetres, native PCB coordinate system):

| Reference | X | Y |
|---|---:|---:|
| J8 | 59.000 | 61.340 |
| D2 | 70.000 | 97.000 |
| J1 | 59.000 | 120.955 |
| F1 | 79.525 | 125.300 |
| D1 | 82.500 | 117.100 |
| R1 | 94.500 | 123.500 |
| J2 | 111.568 | 125.795 |
| U1 | 92.000 | 107.000 |
| U3 | 76.400 | 62.500 |
| J7 | 84.300 | 66.340 |
| J9 | 68.800 | 66.900 |

Do not infer pin coordinates or new orientations from these reference origins.
Inspect exact pad geometry through Konnect before any routing. D2 currently
belongs to F.Cu in the inherited PCB; a future underside/heatsink arrangement
needs an explicit mechanical/lead-map check, not a blind footprint flip.

## What Must Be Reworked

1. Remove LM5164 U4, L1, F2 and their exclusive passives/test points. The export
   contains 75 segments on AUX-specific nets; these are obsolete. Trim the
   branch from the protected main bus to F2 without deleting its shared feed
   to J2 or the INA voltage measurement.
2. Replace Beetle U2 and its battery/AUX-interlock wiring. USB data never existed
   as a board-level routed pair in this V1 carrier and must be routed anew.
3. Insert relays between MCP42100 and converter headers. The 14 old segments
   directly joining CC/CV terminals cannot all remain electrically intact:
   otherwise the selector would be bypassed. Reuse geometry only after splitting
   and reassigning the actual intended pin-to-contact paths.
4. Replace the shutdown GPIO path with GPIO20/AUTO_N gate drive; /SHDN now stays
   high. R19 is now a PMOS gate pull-up, not the old shutdown pull-down.
5. Rework the generic GPIO connector and resistors. Matching reference or value
   alone does not establish matching pad functions. The long INA_ALERT route
   to the old Beetle can be removed while retaining local U1-to-TP6 access.
6. Reevaluate the ground zone and old Beetle RF keepout. Preserve useful lower
   ground continuity, but recreate antenna exclusions for the actual ESP module
   and refill/verify after placement and routing changes. Do not retain stale
   copper merely because it made the V1 ratsnest disappear.

Input-power/phase/Kelvin nets account for 47 candidate preserved segments,
before ground, address, VBUS, I2C and supply branches. The preserved geometry
matters more than this count: it avoids rebuilding the high-current input and
the sensitive local measurement circuit. I2C, SPI and 3V3 trunks need individual
endpoint review because their sources/destinations changed.

## Migration Sequence

1. Snapshot native project state and export pin/net/placement/track inventories.
   Preserve V1/V2 and the four mounting holes. Do not delete all tracks or zones.
2. Build an explicit old-to-new part and pin-function mapping. Some sheet names
   changed from POWER_PATH/INA228_SENSE to POWER_INPUT/INPUT_SENSE; recognize
   electrical equivalence rather than treating every renamed net as new.
3. Run Konnect schematic-to-PCB synchronization in dry-run mode with the correct
   PCB open. Review every addition/removal/replacement, identity match and net
   assignment. Do not apply a plan that silently discards retained placements.
4. Resolve harmless footprint-name changes on retained hand-solder passives
   deliberately. For example C4/R11 changed to compact 0805 land patterns; a
   schematic choice to retain the previous verified hand-solder pattern could
   avoid moving existing pad endpoints. This is a proposal, not an applied edit.
5. Apply the reviewed synchronization, then prune only obsolete copper using
   identified segments. Check for residual shorts, isolated tails and unintended
   contact bypasses before adding routes.
6. Place constrained items first: USB/ESD, ESP antenna boundary and immediate
   decoupling, R100/U10 Kelvin group, relay contact/coil groups, then generic
   headers and secondary parts. Maintain existing input anchors where possible.
7. Reconcile project netclasses before routing: obsolete AUX classes need not
   remain active here; add mappings for output power/Kelvin, USB and relay power.
   Do not transfer V2 BQ switching classes or assume inherited widths prove a
   current rating. Confirm copper/stackup separately before fabrication.
8. Route complete local blocks, then connect surviving trunks. Prefer top copper;
   a short justified bottom crossover is better than an excessively long detour.
   Record every new bottom transition and why placement could not avoid it.
9. Refill zones; run DRC and schematic parity; inspect renders. Compare protected
   input placements/tracks against the snapshot and explain every intentional
   replacement. A fresh no-op synchronization check closes the software migration,
   not hardware qualification.

## Remaining Gates

USB JAE manufacturing suitability, power/cell budget with three relay coils,
converter-interface transition qualification, source-side protection and actual
thermal/current capability remain open. This plan neither solves nor hides them.

Read-only evidence is in `.konnect-scratch/ext-routing-*`: Konnect responses,
SVG copper plots, rendered `ext-routing-view.png`, native GenCAD, component
comparison and per-net track inventory. The two copper plots use the same
top-view direction; the bottom plot includes front reference labels for locating
parts, not a manufacturing bottom-side silkscreen plot.
