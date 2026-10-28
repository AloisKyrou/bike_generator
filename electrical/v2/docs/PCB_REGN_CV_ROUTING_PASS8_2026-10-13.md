# REGN and CV routing, pass 8

13 October 2026. Incremental V2 layout, NOT ready for fabrication or power-up.
Supersedes pass 7 for current routing state, not for electrical specifications.

## Saved result

- 149 footprints, 404 track segments, 47 vias.
- All 297 previous track UUIDs and geometries preserved; 107 segments added.
- Only R67 moved: from (63.5,54)/-90 degrees to (62,33.5)/0 degrees.
- Other 148 component placements/metadata unchanged; netclasses unchanged.
- All native changes through Konnect live IPC, followed by save and readback.
- Schematic synchronization dry run: `noop`; four intentional board-only holes.

## Connections completed locally

REGN now supplies R72. The REGN and TS nets have no remaining DRC unconnected
items. This completes their wiring, not thermistor or thermal qualification.

The following CV subcircuits are now connected:

- RV2 wiper/end tie, R89 and R67 to the manual contact of K1.
- R84/R90 and the corresponding K1 contact.
- Q21 source to K1; Q21 drain to R84 and D25.
- Q22 gate to R87/R19, local R19-to-Q22 source supply tie.
- Q22/Q21 gate-drive node, TP46 and R88 coil-feed branch.
- K1 coil, R88 and D23 flyback path.
- U3 analog A/W tie to R85, D24 and K1; TP45 remains open.
- U3 local supply pins to C4, local ground pins/clamps/relay return,
  CS pull-up R11 and two ground test/clamp connections.

These are local connections, NOT a completed or powered CC_CONTROL block.
The main CV_FB/FBG links, logic interfaces and global supplies are still open.

## Placement and bottom crossings

Top routing remains preferred. R67 was moved beside R89/RV2 before routing,
removing the former long resistor-chain detour. No courtyard violation was
introduced. Eleven new vias use 0.60 mm diameter/0.30 mm drill.

| Branch | New vias (board coordinates, mm) | Reason for bottom routing |
|---|---|---|
| REGN to R72 | (91.25,58.4), (90.4,64.8), (87.5,64.65), (77.25,69.5) | Cross existing driver/return routes without disturbing the critical gate/bootstrap work; a short top bridge between C66 pads avoids underside obstacles |
| CV_MANUAL | (61.1,34.7) | Reach the through-hole K1 manual contact without crossing the top digital resistor chain; K1 needs no additional via |
| CV_DRIVE to R88 | (43.5,42.5), (57.5,55.5) | Cross the local analog/relay paths with a simple lower-layer route outside the switching stage |
| C4 local ground | (33,52.6), (44,50) | Return across the SOIC supply/signal fanout to the local ground connection |
| TP47/D25 ground | (38,43.7), (45,34.9375) | Join the local ground network without cutting across the top transistor/control wiring |

REGN-to-R72 is a 0.25 mm low-current bias branch, not the gate-driver power
feed. Its short top bridge at C66 has nominal 0.20 mm clearance to the pads,
checked by DRC without relaxing rules. The initial trial clipped Q13's gate-pad
clearance; only those newly added trial segments were replaced. Final DRC has
no such violation. There is no change to earlier routed driver tracks.

Control signals use 0.25 mm; local coil/control and supply branches use 0.40 mm;
the new underside ground links use 0.60 mm. These local widths do not establish
main-current capacity. The ground connections are not substitutes for the final
power returns and planes. Review plane continuity around these crossings later.

## Verification

Saved-board CLI DRC with schematic parity:

| Finding | Before | After |
|---|---:|---:|
| Unconnected items | 243 | 208 |
| Known J27 hole clearances | 4 | 4 |
| Silkscreen/edge | 2 | 2 |
| Silkscreen overlaps | 64 | 68 |
| Silkscreen over copper | 50 | 56 |
| Board-only mounting-hole parity | 4 | 4 |

No short, copper-clearance, courtyard, library mismatch or mask-bridge finding.
The additional silkscreen warnings remain visible for the later labeling pass.
This is NOT a clean final DRC: unrouted nets and the four J27 errors remain.

Live readback verifies all old tracks and all unchanged placements. R67's new
placement is verified. Netclasses are identical to pass 7. Rendered front/back
copper crops of the CV block and REGN branch were inspected. The test asserting
the entire CV_POT1_AW net was complete correctly found the still-open TP45;
the final verification explicitly records that remaining connection.

Local evidence, not automatically authorized for Git:

- `.konnect-scratch/regn8-before-result.json` (start baseline).
- `.konnect-scratch/cv8-final-result.json` (saved/live readback and sync).
- `.konnect-scratch/cv8-final-drc.json` (130 findings, 208 unconnected).
- `.konnect-scratch/verify-cv8-pass.mjs` (preservation and connectivity checks).
- `.konnect-scratch/cv8-detail.png`, `regn8-detail.png` (render review).

## Next bounded work

1. Route CV_FB/FBG back to the BQ; review the quiet return corridor first.
2. Connect TP45 and remaining local 3V3/clamp feeds, then SPI/control/service
   links. Q22/R19's local supply tie does not yet reach the real 3V3 source.
3. Continue logic power and USB with their own constraints; USB impedance is
   still unqualified.
4. Finish power copper and source returns, then planes/thermal vias, outline,
   silkscreen and mechanical checks. Preserve separate shunt sense takeoffs.

The EP via assembly concern, J27 footprint clearances, heatsink fit and final
electrical/thermal testing remain release gates. No 400 W or 70 V qualification,
fabrication release, new commit or push is implied by this checkpoint.
