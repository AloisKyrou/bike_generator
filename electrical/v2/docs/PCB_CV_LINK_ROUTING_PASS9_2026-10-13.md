# CV link and local supply routing, pass 9

13 October 2026. Working V2 routing checkpoint, not a fabrication release.

## Result

- 149 components, 418 segments, 51 vias.
- 400 of the previous 404 segments preserved exactly, including UUIDs.
- Four old segments replaced: three manual-selector bottom segments and one
  RV1 ground segment. Eighteen new segments; net increase fourteen.
- TP45 moved from (45,58) to (49.2,46.7), unchanged footprint/pad net/rotation.
- All other 148 placements unchanged. No schematic, BOM or netclass change.
- Saved through Konnect live IPC, read back, and checked with saved-board DRC.

## Routed connections

CV_FB now connects K1.3 to the existing R66/U9/TP40 feedback net. TP45 now
connects to the existing CV_POT1_AW branch beside the relay. Both nets have
no remaining DRC unconnected items.

R19/Q22's local 3V3 branch now joins the C4/U3/R11 local supply network. D24's
upper clamp is also connected to this network. This does NOT yet connect the
whole block to the actual 3V3 regulator; the global logic supplies remain open.

## Deliberate route changes

The old manual bottom path ran down the right side of K1, obstructing the
CV_FB contact's exit. It now follows (61.1,34.7) -> (57.5,38.3) ->
(57.5,44.96) -> K1.2(60,47.46), still 0.25 mm on B.Cu with its existing via.
The relay's internal contact behavior and schematic are unchanged.

CV_FB exits K1.3 on B.Cu to a new 0.60/0.30 mm via at (65.5,44.92).
The rest stays on top: (65.5,73) -> (67,74.5) -> (76,74.5) -> R66.2(77.5,76).
Width 0.25 mm, approximately 46.8 mm of added branch. This avoids the switching
region and the dense current-setting cluster. It is a provisional route, not
an optimum established by DRC: reconsider length and ground coverage during
the FBG/quiet-return review, before finalizing planes.

The initial CV_FB route crossed RV1's top ground return. That ground segment
was moved to B.Cu using one new 0.60/0.30 mm via at (70.74,72.76), ending at
the existing RV1 ground through-hole (70.74,76.5). This changes one short
low-current return instead of adding two transitions to the feedback signal.
The final DRC reports no crossing. The global ground/plane work is unfinished.

D24's supply crosses the existing top analog/control paths using two new
0.60/0.30 mm vias, (40.5,41) and (47.9,45.3). The bottom path is
(40.5,41) -> (43.6,41) -> (47.9,45.3), width 0.40 mm. Local top supply paths
also use 0.40 mm. They are not main-current conductors or a rating proof.

TP45's new position allows a short top branch from (49,44.92) through
(49.2,45.12) to the pad, with no added via or courtyard error.

## Checks

CLI DRC with schematic parity: 130 findings, unchanged total; 204 unconnected
items (was 208); four intentional board-only mounting-hole parity findings.
The 130 findings are four known J27 hole-clearance errors, two silk/edge,
67 silk overlaps and 57 silk/copper warnings. No copper-clearance, crossing,
short, courtyard, library mismatch or mask-bridge error remains from this pass.
No rule relaxed and no exclusion added. Synchronization dry run is `noop`.

Preservation tests check track UUIDs/geometries, all placements, TP45 pad
identity/net/geometry, netclasses, selected completed nets and the still-open
FBG net. The final copper rendering was inspected across the CV/BQ corridor.

Local evidence (not implicitly authorized for commit):

- `.konnect-scratch/cv9-before-result.json`
- `.konnect-scratch/cv9-route-result.json`
- `.konnect-scratch/cv9-local-result.json`
- `.konnect-scratch/cv9-local-drc.json`
- `.konnect-scratch/verify-cv9-pass.mjs`
- `.konnect-scratch/cv9-detail.png`

## Next work and limits

**BQ_FBG is still open.** No speculative FBG tracks were added. The direct
western escape is constrained by R61/R62, the ICHG test via, TS and existing
ground/current-setting routes on both layers. Review these local placements
and takeoffs together before adding more layer transitions. Do not solve this
by silently relaxing clearances, treating FBG as GND, or claiming a long detour
is electrically qualified merely because it passes DRC.

After that review, finish global logic supplies, SPI/control/service interfaces,
then power copper/returns and planes. Existing USB footprint errors, impedance,
thermal/EP-via assembly and mechanical checks remain open. No power-up,
400 W/70 V qualification, commit, push or manufacturing release in this pass.
