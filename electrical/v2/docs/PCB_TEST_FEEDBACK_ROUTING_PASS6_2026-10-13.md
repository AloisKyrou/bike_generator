# PCB V2 - test points and feedback, pass 6

13 October 2026. Incremental routing only; not a fabrication or power-up release.

## Result

- TP41 (ICHG) and TP42 (ILIM_HIZ) now connect to their existing setting nodes.
- TP43 now sits at (97.5,57.15), beside D11, and connects to REGN on top.
- U9 pin 12 connects to R66 pin 2 and TP40 through top-side CV_FB tracks.
- R66 pin 1 takes output-voltage feedback from R75 pad 2 on top. This 0.25 mm
  branch is a sense connection, not an output-current conductor.
- 257 segments / 29 vias / 149 footprints, no zones. Net gain: 29 segments and
  four vias. All 228 previous track geometries survive; four locally removed
  segments were recreated with new UUIDs. The other 224 retain their UUIDs.
- Only TP43 has a final changed placement. No schematic, BOM or netclass change.

## Placement And Crossings

A trial bringing TP41/TP42 and J33 closer was rejected by the authored
courtyard checks. The trial R62, TP41, TP42 and J33 placements and their temporary
routes were reverted through Konnect, not by restoring a board file. Original
geometry and placements were independently compared afterward. No temporary
vias were created in that trial.

The retained test pads keep their probe-access space. Their two short bottom
sections cross existing top-side settings/ground routes without moving the
already placed filters. All other new copper remains on top.

| Net | Transition coordinates | Reason |
|---|---|---|
| ICHG | (77.6,63.9) and (72.3,63) | Reach TP41 across the local ground/settings routes; closer pad placement infringed assembly/probe courtyards. |
| ILIM_HIZ | (75.8,67.3) and (72.3,66.1) | Reach TP42 across the local ground trunk; top approach remains clear of the TS via and RV1 branch. |

Both pairs use 0.60/0.30 mm vias and 0.25 mm tracks. They carry test-node signals,
not power. Six new segments are on B.Cu. Final ground-plane continuity still
needs review with the rest of routing; this pass does not prove it.

TP43's first proposed position at (100,60) overlapped L3's courtyard and was
discarded. Its final position clears L3 and both bootstrap diodes. The CV_FB
test branch was moved outward to honor the 0.50 mm output-net clearance near
R66; the rule was not relaxed.

## Verification

Saved-file KiCad DRC after final save:

- 124 findings: four pre-existing J27 hole-clearance errors, two silkscreen-edge
  warnings, 65 silkscreen-overlap warnings and 53 silkscreen-over-copper warnings.
- No copper-clearance, short-circuit, courtyard-overlap or library-mismatch
  findings remain from this pass.
- 248 unconnected items, down from 254; four intentional board-only hole parity
  findings. Schematic-to-PCB synchronization dry run remains `noop`.
- Readback verifies all previous trace geometries, all 149 component identities
  and unchanged positions except TP43, and unchanged netclasses. ICHG and ILIM_HIZ
  no longer appear in the unconnected-item report.
- The final two-layer SVG detail was visually inspected, including the feedback
  branch around R66 and the test-pad transitions.

Local evidence (not for bulk staging): `.konnect-scratch/interface-before-result.json`,
`interface-verified-result.json`, `interface-verified-drc.json`,
`interface-verified.svg`, `interface-verified-detail.png`, and
`verify-interface-pass.mjs` (PASS).

## Still Open

REGN-to-R72 and TS-to-J33 remain unrouted. J33 is back at (40,84)/90 degrees.
Do not infer a working thermal circuit from the completed local TS divider.
CV_FB still needs its connection to K1, and FBG/manual/digital control branches
remain incomplete. I2C/INT/CE headers, logic, power feed, low-side source returns,
main power copper and final ground planes are still pending.

Before routing distant headers, review their location against the inherited
phase bus and final power corridors. Do not trade a short remaining airwire for
a long route around the switching stage just to reduce the unconnected count.
The previously documented mechanical, assembly, USB-footprint and thermal gates
still apply. No 400 W or voltage-range qualification follows from this pass.
