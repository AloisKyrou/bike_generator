# Input and return routing, pass 15

**Partial board, not released for fabrication or energization.**
Continues [pass 14](PCB_SIGNAL_POWER_ROUTING_PASS14_2026-10-14.md).

## Saved state

1065 segments,131 vias,149 components; no zones. All1029 earlier tracks,
all placements and netclasses preserved.36 segments added:14 front/22 back;
no new via, component or schematic change. Sync `noop`.

Saved-file CLI DRC:131 findings (four original J27 hole clearances,127 silk),
16 unconnected items versus32 at entry; four intentional mounting-hole parity
findings. No new copper/courtyard/mask errors. Verifier
`.konnect-scratch/verify-routes15-pass.mjs`: PASS.

## Added copper

- F1 output to JP30 input and D1 cathode:8 mm main section,6 mm approaches.
- C73/C81 positive bank and R1 input force pad:6 mm local trunk,3 mm
  capacitor-only spurs. The JP30-to-bank feed is still missing; future DC
  feed must enter the trunk, not run through a capacitor-only spur.
- Output-bank ground connections on B.Cu:5 mm, including the two columns
  at X=100.5/112.5 and their cross-link at Y=90; J31 negative included.
- C76/C86 ground column joined to that output bank;3 mm short approach at
  C86 avoids the adjacent BQ_OUT power track.
- C88 ground has a3 mm short approach to avoid the BQ_OUT lower branch.
- Input-bank ground links and inter-bank connection:5/6 mm on B.Cu.
- C4/U3 local ground island joined to the logic ground on F.Cu, passing
  between the existing VBUS and3V3 paths without moving components.

Bottom use is deliberate: the capacitor positive trunks are already on top;
through-hole capacitor grounds provide direct layer connections. This does
not transfer main power through small signal vias. These are bank connections,
not a completed switching return or proof of a low-inductance power loop.

## Width checks

Existing screening assumptions retained:2-layer70 um nominal copper,
56 um sensitivity,40 C ambient,20 C rise budget, copper resistance at60 C.
Using `calculations/pcb-copper-screen.mjs`:

| Uniform-trace screen | Rise at56 um | Drop |
|---|---:|---:|
| 15 A,6 mm,40 mm | 15.62 C | 35.6 mV |
| 15 A,8 mm,4.3 mm | 9.73 C | 2.87 mV |
| 10 A,3 mm,3 mm | 19.48 C | 3.56 mV |
| 10 A,5 mm,50 mm | 8.40 C | 35.6 mV |

Capacitor-only spurs still need actual ripple-current assessment; these
numbers do not establish capacitor sharing or switching RMS current.
The short MOSFET necks identified in pass14 remain unresolved. Ground-plane
integration, power-loop geometry, fault-current/fuse coordination and thermal
tests remain necessary; no continuous-current or400 W rating is granted.

## Sixteen remaining items

Eight signal/power-feed items:

- Four USB_DP/DM items between U8,J21 and R32/R33.
- One STATUS_LED connection between ESP and R35.
- One BQ_IN connection between JP30 and the input bank.
- Two BQ_VAC items connecting shunt/threshold branch, U9 supply and MOSFET bank.

Eight ground items:

- Logic/service ground to converter reference.
- D2 negative to J1 negative and to D1 anode.
- D1 anode to output ground bank.
- Input ground bank to local BQ filter/reference ground.
- C80 ground to local filter/reference ground and output bank.
- Driver reference to low-side MOSFET source return.

Do not resolve these by joining all nearest DRC endpoints blindly. In
particular, avoid steering switching/load current through the Kelvin/filter
ground branches. Revisit the lower input connector/fuse/isolation-point
placement and USB corridor before adding long detours or repeated layer hops.
A trial STATUS_LED route and unsuccessful local candidates were screened
only, never applied.

## USB study

User-authorized local footprint candidate exists; see
[USB4105 study](USB4105_LOCAL_FOOTPRINT_STUDY_2026-10-14.md).
Its nominal hole gap improves from0.1944 to0.2919 mm without moving/shrinking
holes. Disposable single-instance DRC reports no hole-clearance issue, but
contact-overlap/solderability acceptance is still open. **Not assigned to
J27**, so the four original full-board errors are not falsely marked solved.

## Evidence

Local-only `.konnect-scratch/` files:
`routes15-before-result.json`, `routes15-input-result.json`,
`routes15-grounds-result.json`, `routes15-ties-result.json`,
`routes15-final-drc.json`, `routes15-final.svg`, `routes15-power.png`.
Final power-layer rendering inspected. No manufacturing files, order,
automatic autorouting, commit or push performed.
