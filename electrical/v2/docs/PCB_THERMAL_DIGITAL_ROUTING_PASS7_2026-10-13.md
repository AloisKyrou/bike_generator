# PCB V2 - thermal connector and digital fanout, pass 7

13 October 2026. Partial PCB routing, not fabrication or energization approval.

## Completed Connections

- J33 moved from (40,84)/90 degrees to (68.5,69.2)/0 degrees, between R70 and
  RV1. This avoids carrying TS across the inherited phase-input corridor.
- J33 pin 1 now joins the local TS divider/U9 signal; pin 2 joins local GND.
  REGN-to-R72 is still OPEN, so this does not complete the thermal circuit.
- U9 SCL/SDA/INT now reach R68/R69/R70 respectively. Their remaining connections
  to the service header, logic side and pull-up supply are not complete.
- R60 is now horizontal at (76.8,58.3)/180 degrees. R71 shifted 0.20 mm to
  (76.75,60.45)/180 degrees. Existing CE/GND endpoints remain inside R71 pads.
- FSW and R60's ground approach were rerouted. The ICHG test branch underneath
  was shifted slightly to provide clearance for the digital bundle. ACOV's
  three trial replacement segments ultimately returned to their prior geometry.

No schematic, component selection, BOM or netclass changes.

## Bottom-Layer Record

| Net | Transitions (mm) | Reason |
|---|---|---|
| TS | Via (75.5,72.525), then J33 through-hole pad 1 | Short crossing of the top ground return; relocated connector keeps this away from the phase-power corridor. |
| SCL | (79,57.75) and (72.25,58.5) | Escape beside U9 after moving R60, then cross the local bias/ground routes. |
| SDA | (79.8,59.4) and (72.1,60.7) | Cross existing top CE/ground routing without a large top detour. |
| INT | (80.45,59.9) and (70.5,64.3) | Continue beside SDA towards R70 while keeping the TS via and ICHG test branch separate. |

New vias are 0.60/0.30 mm; signal tracks 0.25 mm. The new J33 ground branch and
R60 ground approach are 0.40 mm top tracks, not main power returns. These widths
do not qualify a current rating. Ground-plane continuity is still a later check.

R60's first trial position infringed C62's courtyard and its associated ACOV
route; an INT escape also violated the unused STAT1 pad's clearance. The final
horizontal R60 placement and revised fanout resolve these findings. No rules,
footprints, pad functions or exclusions were relaxed to make the routes pass.

## Saved Verification

- 149 footprints, 297 track segments, 36 vias; no zones. Net addition since
  pass 6: 40 segments and seven vias.
- 247 of the previous 257 track UUIDs are unchanged. Ten deliberately selected
  tracks were replaced; 250 previous geometries remain (including restored
  ACOV geometry). Fifty final segments have new UUIDs.
- Only J33, R60 and R71 have changed placement. Pad identities, pad nets and
  footprints checked against the live before-state. Netclasses unchanged.
- Saved-file DRC: 120 findings, consisting of four pre-existing J27 hole-clearance
  errors, two silk-edge warnings, 64 silk-overlap warnings and 50 silk-over-copper
  warnings. No short, copper-clearance, mask-bridge, courtyard or library mismatch
  remains from this pass.
- 243 unconnected items (previously 248). TS, FSW, ICHG and ILIM_HIZ have no
  remaining unconnected-item findings. Four intentional mounting-hole parity
  findings; schematic synchronization dry-run `noop`.
- Final F.Cu/B.Cu SVG detail visually inspected. Local checker
  `.konnect-scratch/verify-thermal7-pass.mjs` reports PASS.

Evidence: `thermal7-before-result.json`, `thermal7-verified-result.json`,
`thermal7-verified-drc.json`, `thermal7-verified.svg`, `thermal7-detail.png` under
`.konnect-scratch/`. Scratch is not implicitly authorized for commit.

## Next Work

REGN-to-R72 still needs a deliberate route/placement solution; do not add a long
loop around the switching stage merely to close it. FBG/K1/manual/digital CV,
service-header connections, logic routing and power paths remain open. The new
J33 position is provisional relative to the eventual housing and sensor cable.
Complete power copper, source returns and ground regions before judging overall
loop integrity. Mechanical contact stack, USB footprint and fabrication/thermal
qualification gates remain unchanged.
