# External controller prototype preparation

SUPERSEDED FOR ORDERING by the later [full review](FULL_PREFAB_REVIEW_2026-10-15.md).
User routing changed after this checkpoint; the archive below is historical.
USB return/pair routing and connector finished-hole fit need closure and fresh
fabrication exports. Do not order the older review ZIP.

15 October 2026. User-approved scope: five JLCPCB bare boards, components for
two assembled prototypes, two layers / 2 oz / 1.6 mm, self-assembly.
No order, account basket, manufacturer upload or payment has been made.

Final same-day update: schematic recovery is complete and synchronization is
NOOP (nine sheets, zero changes). User delegated the legend choice: reference
designators and the 19 board labels are now 1.0 x 1.0 mm / 0.15 mm strokes.
No new overlap was introduced. Placement and all 591 track records are unchanged.
The final export directory is `kicad/exports/prefab-2026-10-15-final/`;
the earlier directory is retained as historical evidence, not the latest package.

## C42 correction completed

C42.1 now joins R45.2 and U6.4 on TP_VCC, after the series resistor; C42.2
remains GND. This is the only changed schematic pin-to-net membership.
No part, MPN, supplier or component cost was added.

C42 is at (72.25,33.9) mm, rotation180; C45 at (73,36.5) mm. One existing
battery via moved from (71,35) to (71,35.4) mm; one GND via was added at
(71.3,32.95) mm. Only these two footprints moved. Compared with the preceding
585-track checkpoint, nine segments were removed and fifteen added locally:
591 segments,107 vias,84 footprints. Main power paths and user mounting-hole
placements were preserved. Local reference text was repositioned.

The intermediate C42/U6 courtyard overlap and new silk warnings are resolved.
Independent corrected report: [review](INDEPENDENT_PREFAB_REVIEW_2026-10-15.md).

## Evidence

- Hierarchy ERC: zero violations; native netlist81 components /84 nets.
- Direct connectivity contract passes; all17 negative fixtures are rejected,
  including an intentionally upstream C42 connection.
- Saved PCB DRC: zero errors, zero unconnected items, four existing silk-edge
  warnings. Schematic parity contains only intentional board-only H1/H2/H4.
- Four edge warnings concern shell/antenna outline ink, not copper or pad
  clearance. They remain visible; no exclusion or relaxed copper rule added.
- Native zone-fill command was followed by save and saved-file DRC. The later
  DRC call itself used no refill; do not describe its zones_refilled=false field
  as an independent refill operation.
- Saved PCB SHA256:
  `A8E3FB40DA3EB63AC25F134258657EAB51D37125FFA2EBA8C6E74F186AA07C9A`.
- Konnect manufacturing preflight reports READY within its limited scope:
  outline presence, footprints, coarse routing/rule check and direct DRC.
  This is not acceptance of the complete manufacturer order.
- Final schematic-sync dry-run is NOOP after user recovery/save/close; no
  conflict, unassigned footprint or planned change. Fresh ERC/netlist/DRC
  after recovery and legend edits preserve the results above.

Evidence directory: `kicad/exports/prefab-2026-10-15-final/`. Gerber export contains
seven requested layers, separate PTH/NPTH Excellon files and a Gerber job file.
Files opened in KiCad GerbView: front copper/legend/drills, bottom copper,
mask openings and outline registration inspected. No upload was needed.
The optional top-paste study is in a separate `stencil-review/` directory;
it is NOT an ordered stencil or a qualified paste process.
Ignoring generation timestamps, both copper layers, both masks, outline and
both drill files match the preceding reviewed export exactly. Only front legend
changes. Standard footprint outline artwork is retained, including its finer
lines; enlarging reference text is not a claim that every decorative line is
guaranteed printable. Assembly and local PCB renders were inspected.

Final archive inventory verified: `REVIEW_ONLY-external-controller-2oz.zip`
contains exactly seven board Gerbers and two separate drill files, all non-empty.
No paste, PDF or Gerber job is included. Source and artifact SHA256 manifests,
the final front GerbView capture and two assembly-detail renders accompany it.
Archive SHA256:
`DB75656EE537C74736509BB47F0915ACA5DC35BC36FAD62C76B324C2F7D82B69`.
The saved PCB hash was rechecked after packaging and is unchanged.

## Purchasing

[Purchase preparation](bom/PURCHASE_PREPARATION_2026-10-15.md) and generated
`bom/shopping-2boards-2026-10-15/` drafts cover148 fitted purchased parts.
Two component suppliers: DigiKey29 MPNs/124 pieces; LCSC6 MPNs/129 pieces
including105 MOQ spares. Separate optional battery/jumper accessories are
listed in `bom/accessories-2026-10-15.csv`. JLCPCB is a third order, not a third
component source. Exact MPNs remain selected; prices/freight/VAT need actual
basket review. An import draft is not an accepted or paid basket.

## Remaining release decisions

1. Review the [JLC order record](JLC_ORDER_REVIEW_2026-10-15.md), particularly
   connector fit and finished-hole tolerances.
2. Obtain explicit permission before uploading the review archive for a vendor
   preview/quote. Check that preview and delivered quotes before order approval.
   Only the reviewed manifest belongs in the PCB package.

Electrical operation is a separate prototype test phase, not a prerequisite
that can be magically completed without hardware. Begin with current-limited
bench logic power, JP20 OPEN, no receiver battery and converter controls
disconnected. USB/1S charge, external A/W/B compatibility, backfeed, bridge
cooling and10A continuous capability are not yet qualified. F1 is not a10A
current limiter, and arbitrary source/battery fire protection is not claimed.

The five Murata capacitors retain their documented PROVISIONAL qualification
status. Moving C42 establishes the intended bypass topology, not guaranteed
effective capacitance or charger stability under all conditions.
