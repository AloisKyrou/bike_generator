# SPI and mode-control routing, pass 11

13 October 2026. Incremental working layout, not ready for fabrication/power-up.

## Saved result

- 149 unchanged footprints, 471 segments, 61 vias.
- All 440 previous track UUIDs/geometries preserved. 31 new final segments.
- No component, schematic, netclass, footprint or BOM change.
- Native mutations through Konnect live IPC, followed by save and readback.
- Schematic synchronization dry run: `noop`.

## Connections

| Net | Source | Destination | Routing |
|---|---|---|---|
| POT_CS | U2.19, GPIO5 | U3.1, existing R11 pull-up | Top escapes, bottom crossing, top under U3 |
| POT_SCK | U2.20, GPIO6 | U3.2 | Same approach |
| POT_MOSI | U2.21, GPIO7 | U3.3 | Same approach |
| CV_AUTO_N | U2.30, GPIO20 | R87.1, existing transistor command | Entirely top |

These nets now have no DRC unconnected items. This is copper connectivity,
not firmware validation or evidence that the unpowered-to-powered handover
has been tested. Logic supplies and other interfaces remain unfinished.

## Bottom passages

All new signal traces are 0.25 mm. Six new vias are 0.60 mm diameter with
0.30 mm drill. The SPI crosses the USB/pull-up/local-supply neighborhood below
to avoid multiple top crossings or a wide detour through the analog selector.
It returns to top inside the SOIC body outline, NOT inside its solder pads.
No placement change or disturbance of the completed analog routes was needed.

| Net | MCU-side via | U3-side via |
|---|---|---|
| POT_CS | (25.8,33.2) | (39.3,49) |
| POT_SCK | (26.6,33.2) | (39.3,48) |
| POT_MOSI | (27.4,33.2) | (39.3,47) |

The bottom routes have short vertical starts to y=33.6 before diagonal fanout.
Initial diagonals starting immediately at the tightly spaced vias produced
two clearance findings (0.1407 mm versus 0.20 mm). Those six newly added
segments were replaced with nine; the final report has no such violation.
No previous-pass tracks were removed and no rule was relaxed.

The three traces stay together, away from power switching copper. Preserve
ground coverage and examine return continuity when adding the final planes;
the grouped bottom traces must not become a long unbridged slot in the return.
Their present routing does not establish an allowable SPI clock rate.

CV_AUTO_N follows (30.9,26.7) -> (38,26.7) -> (38,33.5) -> (36.5,33.5)
-> R87.1(35,35), on F.Cu. It avoids the USB series resistors and selector
transistor wiring without a layer transition.

## Verification

- Final CLI DRC with schematic parity: 129 findings, unchanged from pass 10.
- Four known J27 hole-clearance errors; 2 silk/edge, 67 silk overlap and
  56 silk/copper warnings. No new short, copper-clearance, courtyard,
  library-mismatch or mask-bridge error.
- 199 unconnected items, previously 203; four intentional board-only holes.
- Preservation checks pass for all 440 old tracks, all 149 placements and
  netclasses. Previously completed CV/FBG/TS/current-setting nets remain joined.
- Saved front/back copper rendering inspected at MCU and SOIC escapes.

Local evidence, not implicitly authorized for commit:

- `.konnect-scratch/spi11-before-result.json`
- `.konnect-scratch/spi11-fixed-result.json`
- `.konnect-scratch/spi11-fixed-drc.json`
- `.konnect-scratch/verify-spi11-pass.mjs`
- `.konnect-scratch/spi11-detail.png`

## Next work

Continue global logic power, I2C and control/service headers, keeping USB and
its return/impedance requirements explicit. Remaining power copper, planes,
quiet analog coverage, silkscreen, USB footprint errors, EP-via assembly,
heatsink fit and final electrical/thermal tests are still release gates.
No firmware change, power-up, rating qualification, fabrication, commit or push.
