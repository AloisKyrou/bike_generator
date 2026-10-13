# Power placement, first bounded pass

Latest continuation: [support and banks, 13 October](PCB_POWER_PLACEMENT_PASS2_2026-10-13.md).
Counts, R77 placement and DRC below describe this historical first pass.

12 October 2026. PROVISIONAL PLACEMENT, not a routing-ready board.

User now offers to route manually after the assistant places components.
Honor that split: continue deliberate placement and prepare verified netclasses
and routing constraints; do not autonomously route the new converter.

## Implemented

Twenty previously staged parts are now placed in the provisional board outline.
Four MOSFETs stay on B.Cu; the controller, inductor and supporting parts stay on
F.Cu. No schematic, BOM, footprint-library or new copper route changes.

| Reference | X mm | Y mm | Rotation | Role |
|---|---:|---:|---:|---|
| U9 | 84 | 60 | 0 | Controller; drivers right, quiet control left |
| L3 | 108 | 60 | -90 | SW1 terminal above, SW2 below |
| Q10 | 92 | 45 | 0 | Input high-side, bottom |
| Q11 | 92 | 55 | 0 | Input low-side, bottom |
| Q13 | 92 | 65 | 0 | Output low-side, bottom |
| Q12 | 92 | 75 | 0 | Output high-side, bottom |
| C61 | 88.25 | 60.25 | -90 | Closest DRV_SUP/REGN bypass |
| C60 | 90.75 | 60.25 | -90 | Same rail, aligned parallel bypass |
| C63 | 83.75 | 54.3 | 90 | VAC local bypass |
| C64 | 81.25 | 54.3 | 90 | VAC local bypass |
| C62 | 78 | 54.8 | 90 | VAC larger bypass |
| C65 | 88.25 | 56.75 | 90 | Bootstrap 1, near driver pins |
| C66 | 88.25 | 64.75 | -90 | Bootstrap 2, near driver pins |
| C77 | 92.8 | 50 | -90 | Local VAC ceramic between input FET rows |
| C78 | 96.6 | 50 | -90 | Second local VAC ceramic, aligned |
| C79 | 94.29 | 70 | 90 | Local SYS ceramic between output FET rows |
| R76 | 89 | 45 | 0 | Q10 series gate link |
| R77 | 89 | 53.5 | 0 | Q11 gate link; shifted to clear bootstrap |
| R79 | 89 | 67 | 0 | Q13 gate link; shifted to clear bootstrap |
| R78 | 89 | 75 | 0 | Q12 series gate link |

H3 moved from (115,55) to (115,25), aligned with H1's top row. Its inherited
location collided with the inductor. All mounting locations remain provisional;
this is not a frozen heatsink drilling pattern. The other inherited placements
and 17 retained input tracks are unchanged. 120 new parts remain staged left.

## Why this arrangement

Power-stage reference: archived TI BQ25756 SLUSEN5A, section9, pp71-73;
the layout-example image was inspected as well as the text. TI's six-layer
reference is not a transferable two-layer routing solution.

Putting the inductor above the BQ would require rotating the controller and
reorganizing the control/connector regions. The right-side arrangement uses
the BQ's driver-facing side directly, leaves quiet control space to the left,
and reserves upper/lower capacitor banks. All-FETs-in-one-tight-row was rejected
because the provisional vertical footprint hides the bent-body/clamp envelope.

The 10 mm FET-row spacing reserves more than the drawn vertical body. It is
still an engineering allowance, not a validated horizontal AOY land pattern:
the package body length max6.22mm plus tab extension max1.27mm, lead forming,
clamp width, solder access and common contact plane must all be reconciled.
The existing B.Fab/3D model depicts the vertical part, not the intended bent
assembly. Do not infer fit from the small bottom courtyard or render.

C80 is deliberately NOT treated as parallel with C79: it is on BQ_OUT after
R75, whereas C79 is on BQ_SYS before R75. Place R75 and C80 together later.
Gate resistors sit toward the FET gate pads, not beside the controller.
The preliminary longer high-side gate paths and opposite-face power loops
still require a route/return review before these coordinates are frozen.

## Verification

MCP readback assertions:20 placements plus H3, rotations, faces,149 total
footprints,17 original track segments unchanged. Schematic synchronization
remains `noop`, no changes, no unassigned footprints. U9 was refreshed through
native KiCad after movement to restore the library attributes omitted by the
installed IPC movement path; no library mismatch remains in the DRC.

Fresh saved-board DRC:21 violations =4 pre-existing USB hole-clearance findings
and17 silkscreen findings. No shorting-items, copper-clearance, courtyard or
PTH-in-courtyard findings in this pass.326 unrouted items and4 intentional
H1-H4 parity warnings remain. This is NOT a clean full-board DRC pass.
Silkscreen reference positions must be corrected, not hidden/suppressed.

Checked authored courtyard edge gaps: U9/C63=0.19mm; L3/C78=0.97mm.
These are courtyard gaps, not copper-clearance or solder-tool guarantees.
Top and bottom review SVG/PNG were inspected. Bottom view is exported in the
top-coordinate convention (not mirrored as an assembly bottom view).

## Before manual routing

Netclasses are still predominantly V1. Fresh saved-project readback shows
classes targeting removed AUX/INA nets. New BQ power/driver/sense nets do not
have dedicated patterns and fall back to Default0.25mm track/0.20mm clearance.
DO NOT route the converter power path using that fallback. No rules changed
or DRC exclusions added in this pass.

Next: bootstrap diodes and sensing filters/shunts, local bulk banks, then quiet
controls and logic. Preserve component-local bypass priority at each step.
Before handing routing over, update exact net memberships and derive power
copper/via sizing for2oz, signal escape/gate geometry and applicable voltage
clearances. Document what requires copper areas rather than a single trace.

Routing handoff must identify:
- Buck input and boost output commutation loops, including the THT lead path.
- HIDRV1/SW1 and HIDRV2/SW2 paired drive/return paths; short local transitions
  where justified, not repeated layer hops to compensate for placement.
- Low-side gate returns and the DRV_SUP local ground loop.
- R1/R75 Kelvin pickups and filtered pairs away from switching copper.
- Quiet analog return tied appropriately near the BQ exposed ground pad.
- Shared-heatsink body, insulation, clamp and bottom copper restrictions.

Netclasses constrain dimensions; they cannot enforce these loop/return choices.
No claim of70V/400W qualification or fabrication/energization readiness.

## Evidence

Repository-root `.konnect-scratch/`: `pcb-anchor-pass-result.json`,
`pcb-decoupling-pass-result.json`, `pcb-anchor-correction-result.json`,
`pcb-gate-resistors-result.json`, `pcb-placement-checks-result.json`,
`v2-anchor-drc-final.json`, `verify-placement-pass.mjs`,
`v2-anchor-detail-final.png`, `v2-anchor-bottom-detail.png`.
Pre-pass board: `v2-before-anchor-placement.kicad_pcb`.

Saved PCB SHA256:
`CC429587B0A369FCE862394C01567F0E3E936AEFF6E0E3CC58A2786A6453120E`.
