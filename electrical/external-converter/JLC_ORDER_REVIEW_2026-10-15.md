# JLCPCB prototype order record

Latest gate: [full schematic/routing review](FULL_PREFAB_REVIEW_2026-10-15.md).
The ZIP listed below predates current user routing and MUST NOT be ordered.
Resolve USB routing and finished-hole acceptance, then regenerate/review files.

15 October 2026. **REVIEW DRAFT / INCOMPLETE, not an order authorization.**
User confirmed JLCPCB, five bare boards, two layers/2oz/1.6mm and self-assembly.

## Proposed portal settings

| Setting | Selection |
|---|---|
| Service | FR4 bare PCB, standard process; no factory assembly |
| Quantity | 5 separate boards, not a panel |
| Layers / finished outer copper | 2 / 2oz on BOTH faces |
| Thickness | 1.6mm |
| Outline | Routed stepped outline, nominal80x115mm bounding box |
| Finish | Lead-free HASL proposed for budget; confirm at checkout |
| Mask / legend | Green / white proposed |
| Vias | Ordinary plated through; no filled/capped or blind vias |
| Special process | No controlled impedance, castellations or edge plating |
| Stencil | Optional top-only study provided separately, not ordered |

The Gerber job reports80.05x115.05mm including outline stroke,1.6mm and two
0.070mm copper layers. Finish is unset in CAD/job metadata; the proposed portal
finish above must be selected explicitly and reconciled before ordering.

## Published capability screen

Source checked15October2026: [JLCPCB capabilities](https://jlcpcb.com/capabilities/pcb-capabilities).
For two-layer2oz, published trace/space is0.16/0.16mm and component PTH annulus
at least0.254mm. Project uses0.20mm tracks/clearance and at least0.320mm
component rings. Plated slots are0.60mm wide; smallest NPTH is0.65mm. The
nominal fine-pitch pad gap is0.20mm, meeting the stated2oz mask-bridge condition.
Finished PTH/slot tolerance is+0.13/-0.08mm; average barrel copper18um. These
are published capabilities, not a custom guaranteed order contract.

Published legend guidance is at least1.0mm high and0.15mm strokes. Following the
user's delegated decision, reference designators and board labels now use those
dimensions. DRC and rendered review show no new overlap. Standard footprint
outline artwork is retained; fine body-outline strokes may still reproduce less
clearly. No copper-rule waiver or schematic change was needed.

## Fit and preview checks

Local USB/JST variants enlarge copper only. Drawings, pin maps, hole dimensions
and pad annuli were checked in [the footprint audit](LOCAL_FOOTPRINTS_2OZ_2026-10-15.md).
There is no physical connector sample fit result. HRO locator and shield-slot
differences and JST's recommended hole interval remain explicitly documented.
Use `assembly-top-1to1.pdf` at100% print scale, verify the printed pitch with a
ruler and compare the actual connector batch. A paper check cannot establish
finished-hole tolerance or insertion force. Do not claim supplier fit acceptance.

Before payment, the portal must show the intended7 layers plus separate PTH
and NPTH drills, four USB plated slots, two USB round locators and three3.2mm
mounting holes. Verify edge cutouts, board dimensions, copper weight, finish,
tenting/mask and all quoted tolerances. No portal upload or order preview has
been performed. No fabrication-rule waiver is requested.

## Files

The latest files are in `kicad/exports/prefab-2026-10-15-final/gerbers-review/`.
`artifact-manifest.csv` records size/hash of each generated file. The separate
`stencil-review/` files are not included in the bare-board layer list. Assembly
PDF and schematic PDF are documentation, not Gerbers; no CPL is needed for
self-assembly. Final upload/order approval remains with the user.

`REVIEW_ONLY-external-controller-2oz.zip` contains exactly the seven board
Gerbers and two drill files, all non-empty; it excludes the optional paste study,
PDFs and informational Gerber job. It is labelled REVIEW_ONLY intentionally.
GerbView screenshots and source/artifact hash manifests accompany the exports.
