# V2 PCB synchronization checkpoint

12 October 2026. Work in progress, NOT an implanted/routed or fabrication-ready board.

## Saved result

Active file: `../kicad/bike-generator-controller-v2/bike-generator-controller-v2.kicad_pcb`.

- 145 schematic components plus the four preserved board-only mounting holes.
- Native KiCad netlist import completed with zero import errors/warnings.
- Subsequent Konnect schematic synchronization: `status: noop`, `changes: []`,
  all eight schematic files covered, no unassigned footprints.
- Removed 55 obsolete footprint instances and 412 obsolete track segments.
- Preserved J1, J8, F1, D1, D2 and H1-H4; same XY coordinates as before.
- Preserved exactly 17 original segments on RECTIFIED_RAW and the three phases;
  geometry, widths, layers and net names match the pre-cleanup live readback.
  Their current capability with 2 oz copper is NOT yet qualified.
- Removed old zones and vias through native KiCad Global Deletions, retaining
  the outline and the selected tracks. Removed the obsolete board text R10 and
  the old output polarity labels; retained J1 polarity labels.
- D2 is on B.Cu, rotation 90 degrees. Native flip followed by rotation restores
  each original pad coordinate: pad1=(70,112), 2=(70,104.5), 3=(70,97),
  4=(70,89.5), 5=(70,82), in mm. Existing phase/raw tracks therefore still match.
- Q10-Q13 are also on B.Cu. All 140 newly imported footprints remain in a
  staging area to the left of the board. This is NOT final component placement.
- Native Board Setup now records two copper layers, 0.070 mm copper per face,
  1.440 mm FR4 core, two 0.010 mm masks, total 1.600 mm, ENIG. Independently
  confirmed through the KiCad IPC-2581 export, not merely the GUI inputs.
  These are design metadata, not an accepted fabricator stackup contract.

V1 untouched. Pre-change V2 project snapshot:
`.konnect-scratch/pcb-v2-before-sync-2026-10-12/` at repository root.
The original 70 x 110 mm outline and hole positions remain provisional for V2.
Do not force the integrated converter into them to preserve an old dimension.

## Checks and real remaining findings

Fresh saved-board KiCad DRC after the final cleanup:

- 4 violations: J27 USB connector NPTH-to-pad hole clearance, actual 0.1944 mm
  versus inherited 0.2500 mm project constraint (A1/A12/B1/B12).
- 326 unconnected items, expected for an unrouted/staged board.
- 4 schematic parity warnings, exclusively the intentional H1-H4.
- No shorting-items violations or footprint-library mismatches remain.

The USB finding is internal to its footprint: moving the connector will NOT
fix it. Confirm the actual fabrication contract and vendor hole/land geometry
before choosing a qualified footprint/rule solution. Do not suppress the four
messages or globally relax the rule just to obtain a clean report.

No claim of full layout DRC success, mechanical fit, 70 V/400 W capability,
USB safety qualification, energization permission or fabrication release.
The bent AOY body/clamp envelope and shared-heatsink insulation still need the
documented mechanical treatment; a bottom-side flag does not solve them.
D2's inherited placed 3D model still references an old absolute checkout path;
repair the model association through supported KiCad/library tools before
using a 3D assembly view as evidence. No new footprint/model was authored.

## Konnect limitations encountered

The typed schematic-to-PCB placement rejected custom-shape pads without
mutation. Used native KiCad Import Netlist with the freshly exported netlist,
UUID linking and board-only deletion disabled. Native import preserved all
footprint details and subsequent MCP sync independently confirms parity.

After IPC staging moves, DRC reported library mismatches on Q20, Q22, U9, J27
and U2. Native Update Footprints from Library, individually filtered to these
five references, cleared them. Konnect's typed refresh refused unsupported
custom/property/unlocked clauses; it was not forced. Treat future moves of
these footprints cautiously: verify library parity afterward and use the native
refresh if required. Do not assume an IPC move preserves every library attribute.

## Next bounded placement increment

1. Reserve the coupled Q10-Q13 / L3 / U9 arrangement, input/output ceramics,
   shunts and complete current-return paths. Compare actual pad geometry and
   bottom-body envelope before committing coordinates.
2. Place one anchor with its required local bypass space, then its decouplers,
   bootstrap/gate components, and Kelvin filters. Do not park unrelated parts
   in this space first. Re-read every placement and inspect both faces.
3. Review that group before spreading the remaining controls and logic.
   No new tracks were added at this checkpoint, and no global placement or
   autorouting was performed.

Follow `PCB_PLACEMENT_ROUTING_METHOD_2026-10-12.md`. TI reference is now
available at `../../components/ti-bq25756/layout-reference-2026-10-12/`.
It is six-layer reference material, never merged into this two-layer PCB.

## Evidence

Repository-root `.konnect-scratch/`:
`pcb-v2-cleanup-result.json`, `pcb-v2-staging-result.json`,
`pcb-v2-d2-orientation-result.json`, `pcb-v2-final-clean-result.json`,
`v2-layout-start-drc.json`, `v2-after-import-ipc2581.xml`.

Saved V2 PCB SHA256 at this checkpoint:
`EA3F7F98ACA0A81D4B418C6E396DEAA9475CA278DAA6A45E0A714B69FFA3AE8D`.
V1 and pre-change V2 PCB SHA256:
`B6C1248F91D1D950E8D2141FAA64D977A4DDE9D1C13A673F252443F9A13E9F0F`.
