# Full schematic and routing review

15 October 2026, later review requested after inspecting variable 3V3 widths.
External-converter project only. **NEEDS ATTENTION before PCB order.**
No purchase, manufacturer upload or component substitution performed.

## Findings first

### R1. USB return path and pair geometry need a localized routing pass

Confirmed geometry, not an ERC/DRC violation: the long front USB pair around
y38.5/38.95 crosses bottom-layer tracks and their ground-plane clearances.
Examples are JP20 control at x78, 3V3 at x90, SCL at x96.8 and SDA at x98.
The pair then runs on B.Cu around x100..115, without a continuous F.Cu ground
reference. There is no front ground plane in the inspected export.

Both data paths change layers twice. The nearest GND via to each data
transition is approximately 3.11, 4.69, 5.00 and 6.55 mm away; these are not
paired local return vias. Grounded header pads are not included in those
via-distance figures, and distance alone is not a signal-integrity simulation.

The straight front section uses 0.20 mm traces and approximately 0.25 mm
edge-to-edge spacing. No calculation establishes 90 ohm differential impedance
for the actual 1.6 mm / 2 oz stackup. A netclass width does not establish it.
Measured centreline paths from U8 output to R32/R33 are 61.829 mm D+ and
58.610 mm D-, excluding pad traversal, via barrels and J21 test-header stubs.
The 3.219 mm difference is NOT itself evidence that full-speed USB will fail;
reference continuity and transitions are the more important review concern.

[Espressif's USB layout guidance](https://docs.espressif.com/projects/esp-hardware-design-guidelines/en/latest/esp32c3/pcb-layout-design.html#usb),
checked 15 October 2026, calls for paired routing, a continuous reference,
controlled differential impedance and nearby ground returns at layer changes.
The current geometry does not meet all those recommendations. It may work at
12 Mbit/s, but that possibility is not a clean pre-order justification.

**Recommended disposition:** local reroute of J27/U8 to R32/R33, minimizing
layer changes, establishing ground continuity and local return stitching, and
checking the pair geometry against the actual two-layer stackup. Preserve the
power/sense routing and the user's placements. Keep J21 branches short and
unpopulated for ordinary operation. This does not require a four-layer redesign
or a new USB controller. Do not claim 90 ohm compliance without calculation.

### M1. Connector finished-hole tolerances need an explicit decision

No wrong connector pin map was found. However, nominal library drill agreement
does not guarantee the full finished-hole tolerance interval. Examples:
JST J26 0.75 mm can finish at 0.67 mm under the published JLC lower tolerance,
below JST's recommended 0.70 mm minimum. Harwin 1.00 mm can finish at 0.92 mm,
below its recommended 0.97 mm minimum. Actual pin shape matters: this does not
prove that any particular sample will fail to fit.

See [the independent mechanical review](FULL_MECHANICAL_REVIEW_2026-10-15.md)
for drawings, Phoenix/HRO details, candidate drills and annulus checks.
Resolve with a documented finished-hole process/fit acceptance or reviewed
local footprint adjustments. Changing holes is not covered by the user's prior
pad-only enlargement approval. A printed 1:1 drawing cannot verify hole fit.
Do not drill plated holes larger after fabrication.

### D1. The preceding manufacturing ZIP is obsolete

The user's recent I2C/3V3 edits are preserved. The previous
`prefab-2026-10-15-final/REVIEW_ONLY-external-controller-2oz.zip` represents
the older A8E3 source, not the source reviewed here. Do not order that ZIP.
Regenerate the entire fabrication package after the routing/fit decisions,
then inspect the Gerber/drill viewer and actual vendor preview before ordering.

## The widths shown in the screenshots

The first thin bridge is 6.00 mm long and 0.25 mm wide, between (92,93.5)
and (98,93.5), within the low-current INA/address/pull-up distribution.
It is not a 10 A power-path bottleneck or the ESP's main supply feed.
At 70 um copper, copper resistivity evaluated at 60 C gives about 6.84 mOhm.
At an illustrative 10 mA its drop is 68 uV; even a hypothetical 500 mA would
give 3.42 mV and 1.71 mW. These are resistive estimates, not thermal validation.

The second screenshot contains 0.25 mm pull-up branches and a 0.75 mm local
INA supply route. Low-current branches need not match a power trunk width.
The appearance is inconsistent, but widening everything is not electrically
necessary. The initial screenshot-only suggestion was therefore a readability
judgement, not evidence of a hazardous neck. Standardize only where useful.

There is also an overlapping 3V3 B.Cu segment at x90, y36.5..42.5, within
the longer x90, y36.5..55.5 segment. It is redundant, not a short. Remove it
as part of the nearby USB cleanup, not as an independent safety repair.

## Fresh evidence and coverage

Authoritative saved PCB SHA256:
`CC446D8AED03ABE445527A3FD0EE7F5F9E3DA734A938B1D602E7A4B2C1468F8D`.
84 footprints, 588 track segments, 107 vias; 81 schematic components and
84 nets over nine sheets. Three board-only holes H1/H2/H4 are intentional.

An initial synchronized DRC/refill request returned AS_BUSY with an uncertain
outcome. It was not treated as a successful verification. Native editor state
and saved files were inspected. A subsequent saved/live comparison identified
an unsaved user simplification of the 3V3 trunk: 591 saved vs 588 live tracks.
The live board was saved; native Fill All Zones was invoked, followed by save.
Fresh GenCAD and live IPC then match all 588 trace geometry records exactly
at 0.0001 mm comparison resolution. Fresh saved-file DRC follows that save.
No deliberate rerouting, component move, native library edit or rule relaxation
was made during this review.

| Area | Evidence and disposition |
|---|---|
| Formal checks | Fresh ERC zero; DRC zero errors / four known silk-edge warnings / zero unconnected. Parity only H1/H2/H4. |
| Connectivity | Fresh full-hierarchy XML independently checked: 81 components / 84 nets and 17 negative fixtures pass. No changed pin-net membership from the preceding reviewed schematic. Root short query reports zero; full XML supplies cross-sheet evidence. |
| Aggregate audit | All nine sheets and six audit categories completed without coverage diagnostics. Six electrical errors and several warnings were individually reconciled with direct evidence, not blindly accepted or hidden. |
| USB/logic | Pinout, USB polarity, CC pulldowns, ESD, series resistors, LDO and charger topology reviewed. Routing concern R1 remains. No unconditional PC fault-safety or USB compliance claim. |
| ESP | Module supply/EN/boot wiring and native USB pins reviewed. GPIO2/GPIO8 external accessories can interfere with boot straps. Disconnect such loads for initial programming. |
| Digipot | Dual SOIC-14 MCP42100 pins and direct A/W/B routing reviewed. Short local analog routes; no mechanical fallback. Powered-logic/domain restrictions remain mandatory. |
| Input/output sensing | Separate four-terminal shunts; correct force/sense pairing, 10 ohm filter legs, differential capacitors, supply decoupling and different addresses. No main load current through Kelvin traces. |
| Decoupling placement | C30/C31 near ESP supply, C4 near U3 VDD, C1/C3 near U1, C102/C103 near U10, C46/C47 near LDO, C42 after R45 near U6 VCC. Continuous local supply branches inspected by pad readback and renders. |
| Power copper | Input/output positive trunks 5 mm; phase tracks 3 mm; high-current positive paths stay on top, not on a single small via. Thin VBUS measurement branches are not power trunks. |
| Return plane | Fresh bottom render inspected. Lower/right power return is a broad continuous plane with thermal spokes at power terminals. No new narrow return choke from the user's I2C edit. USB reference continuity is a different issue. |
| Manufacturing geometry | Existing local USB/JST enlarged PTH pads retained; DRC reports no clearance/courtyard/library mismatch. Finished-hole tolerance remains M1. |
| BOM | Independent comparison: 81/81 MPN/footprint fields agree with exported schematic. Two-supplier allocation exists, but stock/cart/freight/VAT have not been reserved or finally quoted. |
| Assembly | Iron/hot-air assembly feasible, with 0.5 mm-pitch INA/USB and underside ESP pads requiring care. No new hidden QFN converter. Polarity and connector access reviewed. |
| RF/mechanical | Antenna notch and no-copper area retained. A 0.30 mm substrate remnant, enclosure/metal proximity and actual RF range remain documented reservations, not proven RF failure. Do not shrink copper-edge clearance blindly. |

See [independent electrical review](FULL_ELECTRICAL_REVIEW_2026-10-15.md)
and [independent mechanical review](FULL_MECHANICAL_REVIEW_2026-10-15.md).
The electrical review explains the heuristic false positives: INA VBUS is a
measurement input, not VS, and shared capacitors/pull-ups cross sheet boundaries.
No added capacitor is justified solely by those heuristic messages.

## Power, protection and prototype limits

Using the repository's explicitly limited legacy IPC-2221 screening calculation,
70 um external copper, 10 A, and an isolated conductor assumption gives about
5.8 C rise for 5 mm and 13.5 C for 3 mm. The longest phase's resistive loss
at 10 A RMS is about 0.60 W; the input positive route is about 0.51 W.
These estimates do not qualify an enclosure, bridge, connector contacts, copper
tolerance or total board temperature. The prior return-plane calculation remains
applicable to the unchanged power geometry. The 10 A target still needs tests.

F1 is a 20 A fault fuse, not an operational 10 A limit. Output battery faults
do not pass through it. Reversed energy-rich DC input can feed the bridge before
F1. Source-side and receiver-side fusing remain required as documented; arbitrary
battery connection and no-fire guarantees are not established by this design.

USB and optional 1S remain the accepted simple topology. JP20 OPEN for initial
PC/logic tests; no combined USB-current manager was added. Qualify backfeed,
dropout and charger thermal/current behaviour with a protected cell and a
current-limited source, before risking a PC or connecting the power harness.
The five Murata capacitors have reviewed typical bias curves, not a guaranteed
all-condition capacitance/stability result.

The external converter must independently limit the receiver and expose
compatible A/W/B voltages/currents. MCP terminals must remain within its supply
rails and the project +/-1 mA bound. Logic power and safe code initialization
must precede converter enable; power-off is not a safe mechanical fallback.

## Evidence files and next action

Review-only outputs: `kicad/exports/full-review-2026-10-15/`.
Detailed working evidence: `.konnect-scratch/full-review-20261015/` including
live trace/pad queries, native GenCAD, aggregate findings, current top/bottom
renders and `routing-analysis.json`. The accidentally named `netlist.xml` in
scratch is a KiCad S-expression export; use `independent-netlist.xml`, the
verified native XML. This format mismatch was diagnosed, not a circuit defect.

Recommended next pass: localized USB routing/return repair, deliberate decision
on finished connector holes, optional harmless width/duplicate cleanup, then
fresh sync/refill/ERC/DRC and manufacturing exports. No wholesale board or
architecture redesign is indicated by this review. Prototype testing remains
necessary after fabrication; it is not substituted by this document.
