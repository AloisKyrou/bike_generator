# FBG routing and local current-setting placement, pass 10

13 October 2026. Working layout checkpoint, NOT ready for fabrication/power-up.

## Saved state

- 149 parts, 440 segments, 55 vias.
- 406 of the previous 418 segments preserved exactly, including UUIDs.
- 12 previous segments replaced; 34 final new segments, net increase 22.
- R62 moved from (78,65.5)/180 to (76.7,66.8)/90 degrees.
- R72 moved from (77.5,68.5)/0 to (77.5,69.7)/0 degrees.
- R73 moved from (77.5,71)/180 to (77.5,72)/180 degrees.
- Other 146 placements unchanged. Pad identities, nets, physical sizes, layers
  and shapes verified for all three moved resistors. No component substitution.
- Netclasses and schematic unchanged. Schematic sync dry run: `noop`.

## Why change these placements

The original horizontal R62, the R61 test connection, TS and their ground
tracks constrained the escape from U9. Rotating R62 and moving it slightly
left/down frees a top-layer corridor around y=64.8. R72/R73 were shifted down
to retain assembly clearance and continuity of the thermal-bias circuit.
The altered ILIM path still connects the same IC pin, resistor and test point.

The TS branch and R73 ground return had to move with the resistors. The initial
placement check caught a TS-to-R73-ground short and a REGN/ground clearance;
both were corrected before accepting the result. A subsequent FBG check caught
two local clearances. Moving the ILIM escape from x=80 to x=80.3 and lowering
the short top FBG crossing by 0.1 mm resolved them. No rule was relaxed.

## FBG path

U9.11 now connects to RV2.3 on the correct BQ_FBG net. **FBG is not GND**;
do not replace this connection with a ground-plane attachment.

The path uses 0.25 mm signal traces and four new 0.60/0.30 mm vias:

| Via | Position, mm | Purpose |
|---|---|---|
| 1 | (81.65,64) | Escape the U9 lower pin row without crossing top current-setting tracks |
| 2 | (79.5,63.95) | Return to top before crossing the existing underside TS route |
| 3 | (75.72,64.7) | Finish the short top crossing over TS/R61 routing and cross the local top ground/setting paths underneath |
| 4 | (65.2,43.5) | Return to top near the manual resistor/trimmer group, avoiding the relay contact routes |

The top crossing is (79.5,63.95) -> (78.65,64.8) -> (75.82,64.8) ->
(75.72,64.7). The lower-layer corridor continues via (75.17,65.25),
(67.25,65.25), (66.2,64.2), (66.2,44.5), to (65.2,43.5). It stays west of
the switching stage. The top approach then runs around the existing manual
resistor chain to RV2.3, avoiding the trimmer's other through-hole pins.

Total FBG track length is approximately 68.15 mm (34.68 top, 33.47 bottom).
This is a provisional connection, not a claim of optimal placement or noise
qualification. The long manual-control connection and the adjacent CV_FB path
must be included in the quiet-return/ground-plane review. Do not route power
or switch-node copper underneath them merely because the DRC allows it.

## Verification

Saved-board CLI DRC with schematic parity:

- 129 findings: 4 known J27 hole-clearance errors, 2 silk/edge warnings,
  67 silk overlaps, 56 silk/copper warnings.
- No short, track crossing, copper-clearance, courtyard, library-mismatch or
  solder-mask-bridge finding remains from this pass.
- 203 unconnected items, previously 204; four intentional board-only holes.
- No remaining unconnected finding for BQ_FBG, CV_FB, CV_MANUAL, CV_POT1_AW,
  BQ_REGN, BQ_TS, ICHG or ILIM_HIZ.
- Live readback, preservation assertions, unchanged netclasses and `noop`
  synchronization verified. Rendered front/back copper inspected.

The count decreases by one because this pass completes the FBG net, while most
work reorganizes already-connected local routing. It does not complete global
logic power, the digital interfaces, power paths or planes.

Local evidence (not implicitly authorized for commit):

- `.konnect-scratch/fbg10-before-result.json`
- `.konnect-scratch/fbg10-prepare-result.json`
- `.konnect-scratch/fbg10-fixed-result.json`
- `.konnect-scratch/fbg10-fixed-drc.json`
- `.konnect-scratch/verify-fbg10-pass.mjs`
- `.konnect-scratch/fbg10-detail.png`

## Next work

Continue global 3V3/logic power, SPI and control/service-header links in bounded
groups. Then finish power copper/returns, planes and quiet-signal coverage.
The USB footprint clearance, impedance, EP-via assembly, heatsink/mechanical
fit and final electrical/thermal tests remain release gates. No fabrication,
power-up, 400 W/70 V qualification, commit or push performed in this pass.
