# Power placement, support and capacitor banks

Latest continuation: [BQ quiet settings](PCB_QUIET_PLACEMENT_PASS3_2026-10-13.md).
The counts and verification below describe the second pass.

13 October 2026. PROVISIONAL PLACEMENT; not ready for manual routing or fabrication.

## User priority

Do not minimize spacing without an electrical or mechanical reason. Favor
iron/tweezer access, readable references and useful routing corridors.
Keep local bypass, bootstrap and commutation loops compact. The inherited
70x110mm outline is not a fixed enclosure requirement; reconsider it before
squeezing the remaining logic into the power area. No outline change in this pass.

The assistant places components; the user intends to route. No new tracks,
vias, zones, schematic changes, BOM substitutions or netclass edits here.

## Implemented

27 previously staged components placed: D10/D11, C67-C72, R80-R83, R1/R75,
C73-C76, C80-C88. R77 repositioned to clear the input-sense filter.
All these parts are on F.Cu. Q10-Q13 and D2 remain on B.Cu.
47 new parts are now placed across the first two passes; 93 remain staged left.
149 footprints remain in total, including four board-only mounting holes.

Coordinates are footprint anchors, NOT always body centers. In particular,
the radial capacitor body center is 2.5mm right of its pad-1 anchor at rotation0.

| Reference | X mm | Y mm | Rotation |
|---|---:|---:|---:|
| D10 | 94 | 59 | -90 |
| D11 | 97 | 61 | 90 |
| C67 | 86.5 | 54.3 | 0 |
| R80 | 85.5 | 51.5 | -90 |
| R81 | 88 | 51.5 | -90 |
| C68 | 82.5 | 50.5 | 180 |
| C69 | 89.8 | 49.75 | 90 |
| C70 | 83.5 | 65.5 | 180 |
| C71 | 85 | 69.5 | -90 |
| C72 | 81.5 | 69.5 | -90 |
| R82 | 85 | 73 | 90 |
| R83 | 81.5 | 73 | 90 |
| R1 | 81 | 41 | 90 |
| R75 | 84 | 83 | 180 |
| C80 | 81.0375 | 78.25 | 90 |
| C73 | 67.5 | 28 | 0 |
| C81 | 67.5 | 42 | 0 |
| C74 | 94.5 | 30 | 0 |
| C82 | 108.5 | 34 | 0 |
| C87 | 100.5 | 42 | 0 |
| C75 | 95.5 | 83 | 0 |
| C83 | 107.5 | 83 | 0 |
| C84 | 95.5 | 97 | 0 |
| C85 | 107.5 | 97 | 0 |
| C88 | 95.5 | 111 | 0 |
| C76 | 82.5 | 91 | 0 |
| C86 | 82.5 | 105 | 0 |
| R77 | 90.5 | 53.5 | 0 |

Aligned capacitor rows now have14mm center pitch: nominal10mm bodies leave
4mm between bodies (3.5mm between their courtyard bounding boxes).
This applies to C73/C81, C75/C84/C88, C83/C85 and C76/C86; it is not a claim
of uniform spacing for every bank member.

## Electrical placement intent

- C67 sits above the BQ ACP/ACN pins; C70 below SRP/SRN. Series resistors and
  common-mode capacitors have separate input/output neighborhoods.
- R1's dedicated sense pads face toward the controller region. Preserve
  separate Kelvin pickup paths, not shared segments carrying power current.
- R75 is below the output FET group. Pick up its two-terminal shunt with
  dedicated Kelvin traces from the pads, separate from the power copper.
- C79 is BQ_SYS before R75; C80 is BQ_OUT after R75. They are NOT one bank.
- Upstream BQ_IN: C73/C81. Local VAC: C74/C82/C87 plus C77/C78 ceramics.
  SYS: C75/C83/C84/C85/C88 plus C79. OUT: C76/C86 plus C80.
- D10/D11 retain their correct REGN-anode/BTST-cathode orientation.
  Reserve paired drive/return paths, do not route sense pairs through SW copper.
- Tall radial parts are outside the immediate BQ rework area. Assemble the
  small SMD circuitry before fitting these tall parts.

The remote bulk members are not equivalent to the local ceramics at switching
frequency. Ripple sharing, low-impedance bus geometry and heating remain to
be checked. These coordinates are not proof of current capability or loop
stability. Reference remains archived TI SLUSEN5A section9 pp71-73.

The bottom render still depicts vertical AOY footprints, NOT the proposed bent
horizontal bodies/clamps. The heatsink must not touch bare capacitor pins,
solder joints or non-equipotential MOSFET tabs. Mechanical insulation and fit
remain unresolved by this placement image.

## Verification

Saved-board DRC:50 findings =4 existing J27 hole-clearance errors plus46
silkscreen warnings. No shorting-items, copper-clearance, courtyard-overlap,
solder-mask-bridge or library-mismatch findings remain in this checkpoint.
326 unconnected items are expected at this unrouted stage; four parity
findings are the intentional H1-H4. This is NOT a clean full-board DRC pass.

Readback assertions verify all28 changed placements, untouched placements,
149 footprints,93 staged parts and the exact17 original input track objects
unchanged. Schematic-to-PCB dry-run is noop with changes[] across eight sheets.
No DRC rules or exclusions relaxed. No schematic edit, so no new ERC claimed.

Both native top/bottom SVG exports were visually inspected. Bottom export
uses top coordinates, not a mirrored assembly view.
Silkscreen fields around the BQ and R75/C76 still need repositioning.
Installed Konnect edit_component has no field-position parameter;
edit_board_footprint_graphic only edits polygons, not reference fields.
Do not move electrically well-placed parts merely to hide that limitation.

## Next pass

1. Finish BQ quiet settings, compensation, CV/CC control and connector planning.
2. Allocate the USB/ESP/logic region with assembly room; enlarge the provisional
   outline if needed rather than forcing density.
3. Reposition reference fields through a supported KiCad operation.
4. Prepare V2-specific netclasses and a route/return plan before user routing.
   Existing V1 Default0.25mm assignments are NOT suitable power-path defaults.
5. Recheck full placement, bottom mechanical envelope and clearances.

No70V/400W qualification or permission to manufacture/energize is implied.

## Evidence

Repository-root .konnect-scratch:
pcb-support-read-result.json, pcb-support-place-result.json,
pcb-bank-read-result.json, pcb-bank-place-result.json,
pcb-support-final-result.json, pcb-roomy-final-result.json,
v2-roomy-final-drc.json, verify-support-placement.mjs,
v2-roomy-overview.png, v2-roomy-bottom-view.png.
Pre-pass native snapshot: v2-before-support-placement.kicad_pcb.

Saved PCB SHA256:
828A486952BB4CA5C89B3643CB5125DE01E8544B60C9BD31675AA536CC1589F8.
