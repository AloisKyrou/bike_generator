# V2 working instructions

## JAE USB selection, 14 October 2026

J27 provisionally replaced by JAE DX07S016JA1R1500 with standard footprint.
See `docs/USB_JAE_SELECTION_2026-10-14.md`: pin map, native-UI replacement,
local routing, BOM and manufacturing hold. 1069 tracks/131 vias/149 parts,
16 unrouted;1056 earlier tracks unchanged,9 replaced by13, no placements moved.
ERC0, USB118+5negative tests pass, netlist identical, sync noop. DRC132 = five
oval-NPTH edge-clearance errors+127silk;four intentional hole parity warnings.
No rule relaxation/exclusion. Slot0.6mm is below published JLC1mm/PCBWay0.8mm
NPTH-slot minima; copper gap0.266mm is NOT full fabrication acceptance.
User wants no waiver. Eurocircuits0.5mm slots only a possible process lead.
Native refresh needed to preserve shell-pad mechanical properties: typed sync
had lost these and did not update custom fields; native import/refresh fixed it.

## Input/return routing pass 15, 14 October 2026

Latest `docs/PCB_INPUT_RETURN_ROUTING_PASS15_2026-10-14.md`:1065 tracks,
131 vias/149 parts;36 new tracks,all1029 earlier tracks and placements preserved.
16 remaining connections:8 GND,4 USB,2 VAC,1 main input feed,1 STATUS_LED.
DRC131 unchanged(4 USB holes+127 silk),4 hole parity,sync noop. Input and bank
returns advanced; no zones yet. Do not join power current through quiet ground
branches. Review input/USB placement and short MOSFET neck sizing next.
USB local footprint study exists but is NOT assigned to J27; nominal gap
0.2919mm,holes unchanged. Solder-overlap/fit acceptance required before using.
See `docs/USB4105_LOCAL_FOOTPRINT_STUDY_2026-10-14.md`. No release implied.

## Signal/power routing pass 14, 14 October 2026

Latest: `docs/PCB_SIGNAL_POWER_ROUTING_PASS14_2026-10-14.md`.
1029 tracks/131 vias/149 parts,32 unrouted (was104).194 retained new tracks,
12 replaced,835 unchanged. J5/R7/R8/R9/R10/R34/H1/R70 moved as documented.
DRC131:4 J27 holes+127 silk;4 mounting-hole parity;classes unchanged,sync noop.
Power feed/returns,USB data and STATUS_LED still incomplete. Short1.75/1.8mm
MOSFET approaches do not meet the uniform-trace20C-rise screen at10A; refine
and qualify before assigning a current rating. No fabrication/power-up release.
USB local-footprint study explicitly authorized14 October; do not suppress
the four original errors or treat geometry checks as solder qualification.

## Interface routing pass 13, 13 October 2026

Latest: `docs/PCB_LINK_ROUTING_PASS13_2026-10-13.md`.847 segments/112 vias,
149 unchanged placements.155 added, four old segments replaced (CV_FB,
two local GND, local 3V3),692 preserved. I2C distribution,J32 SCL/SDA/INT,
USB VBUS/CC/GND,spare-pot J7,GPIO8 pull-up,MCU-side USB escapes advanced.
104 unrouted (was130).DRC133 unchanged:4 J27 holes+129 silk;4 hole parity,
sync noop. No new copper/courtyard/mask findings. USB data path,GPIO feeds,
CE/R70 supply,power/planes still open. No decision blocks continuation.
Bottom usage and replacements documented; no fabrication/power-up approval.

## Logic routing pass 12, 13 October 2026

Latest: `docs/PCB_LOGIC_ROUTING_PASS12_2026-10-13.md`.696 segments/85 vias,
149 parts; all471 old tracks preserved,225 added. Only C50(25.9,46.5)/90
and R51(35.5,56.75)/0 moved. Charger/handover,3V3,EN/BOOT,local I2C,
header/LED links advanced;130 unrouted (was199). DRC133:4 known USB holes
and129 silk;no copper/courtyard/mask/dangling-via findings.4 hole parity,
sync noop. User explicitly wants larger multi-block sessions; no blocking
decision currently. Finish interfaces and power/planes, no release implied.

## SPI routing pass 11, 13 October 2026

Latest: `docs/PCB_SPI_ROUTING_PASS11_2026-10-13.md`.471 segments/61 vias,
149 unchanged parts; all440 old tracks preserved,31 added. SPI U2-to-U3 and
CV_AUTO_N U2-to-R87 connected. Six added vias for grouped SPI bottom crossing;
top returns under SOIC body, no vias in solder pads. DRC129 unchanged,
199 unrouted,4 intentional hole parity,sync noop. No new copper/courtyard
errors. Global power/I2C/service links and final signal return/plane review
remain open; no firmware, functional qualification or release implied.

## FBG routing pass 10, 13 October 2026

Latest: `docs/PCB_FBG_ROUTING_PASS10_2026-10-13.md`.440 segments/55 vias,
149 parts;406 previous tracks preserved,12 replaced,34 new. R62 now
(76.7,66.8)/90,R72(77.5,69.7)/0,R73(77.5,72)/180; pad identities/nets
preserved. FBG now connected to RV2; TS/REGN/ICHG/ILIM remain connected.
Four new vias, reasons recorded. FBG is NOT GND; its68.15mm route and CV_FB
still need quiet-return/plane review. DRC129(4 USB+125 silk),203 unrouted,
4 hole parity,sync noop. Next global supplies and SPI/control/service links.

## CV link routing pass 9, 13 October 2026

Latest: `docs/PCB_CV_LINK_ROUTING_PASS9_2026-10-13.md`.418 segments/51 vias,
149 parts;400 previous segments preserved,4 replaced,18 new. Only TP45 moved
to(49.2,46.7). CV_FB/K1 and TP45 connected; Q22/D24 local 3V3 tied to C4/U3,
but global feed still open. BQ_FBG still OPEN: review the R61/R62/test-via/TS
and ground corridor rather than adding an unexamined long detour. CV_FB length
and ground coverage remain review items. DRC130(4 USB+126 silk),204 unrouted,
4 hole parity,sync noop. No new copper/courtyard errors, no release.

## REGN/CV routing pass 8, 13 October 2026

Latest: `docs/PCB_REGN_CV_ROUTING_PASS8_2026-10-13.md`.404 segments/47 vias,
149 parts; all 297 previous tracks preserved. Only R67 moved to (62,33.5)/0.
REGN-to-R72 now connected, as are local K1/manual/digital/coil subcircuits.
CV_FB/FBG, TP45, global supplies and interfaces still open; do not claim a
completed control block. Eleven added vias documented. DRC130(4 USB holes+
126 silk),208 unrouted,4 hole parity,sync noop. No new copper/courtyard/mask
errors. Next quiet CV/FBG links and remaining local/logic supplies/interfaces.

## Thermal/digital routing pass 7, 13 October 2026

Latest: `docs/PCB_THERMAL_DIGITAL_ROUTING_PASS7_2026-10-13.md`.297 segments,
36 vias,149 parts. J33 now(68.5,69.2)/0; R60(76.8,58.3)/180;
R71(76.75,60.45)/180. TS/J33 ground and U9-to-R68/R69/R70 signals connected.
REGN-to-R72 still OPEN; thermal circuit and digital/header/logic interfaces
not complete.247 earlier track IDs/250 geometries preserved;7 new vias.
DRC120(4 USB holes+116 silk),243 unrouted,4 hole parity,sync noop. No new
copper/courtyard/mask errors. Remaining power, planes and release gates persist.

## Test/feedback routing pass 6, 13 October 2026

Latest: `docs/PCB_TEST_FEEDBACK_ROUTING_PASS6_2026-10-13.md`.257 segments/29
vias,149 parts;228 prior geometries preserved,29 new segments/four vias. Only
TP43 has a final new placement (97.5,57.15). TP41/42 and REGN test point now
connected, as are U9 CV_FB-to-R66/TP40 and the R75-to-R66 output-sense branch.
Six new bottom segments serve two test-pad crossings; other new copper on top.
DRC124 (4 USB holes+120 silk),248 unrouted,4 hole parity,sync noop. Trial
R62/TP41/TP42/J33 placements restored. REGN-to-R72, TS-to-J33, K1/FBG and the
remaining interfaces/power paths/planes are not complete. No rating/release.

## Threshold/RV1 routing pass 5, 13 October 2026

Latest: `docs/PCB_FANOUT_ROUTING_PASS5_2026-10-13.md`.228 segments/25 vias,
149 parts;13 local routes replaced,190 prior tracks preserved. C63/C67
shifted slightly; RV1 now(68.2,76.5)/180, TP43(70,70). ACUV/ACOV and the
R61-RV1 branch connected. ACOV stays top; VAC/ACUV/RV1 bottom reasons recorded.
DRC124 (4 USB holes+120 silk),254 unrouted,4 intentional hole parity, sync
noop. No copper/courtyard/library errors. Test pads/TS/REGN/headers incomplete.

## Local settings routing pass 4, 13 October 2026

Latest: `docs/PCB_SETTINGS_ROUTING_PASS4_2026-10-13.md`.203 segments/20 vias,
149 unchanged footprints.37 segments/4 vias added;166 prior tracks and
classes preserved. Local FSW/CE/ICHG/ILIM/TS and threshold divider chain
connected, but ACUV/ACOV pin escapes, RV1, TP41/42, TS supply/J33 and CE/J32
remain open. Do not claim complete control blocks. New bottom paths are
two TS segments across current-setting escapes and five local GND segments.
DRC119 unchanged,259 unrouted,4 intentional hole parity; sync noop.

## Input sensing routing pass 3, 13 October 2026

Latest: `docs/PCB_INPUT_ROUTING_PASS3_2026-10-13.md`.166 segments/16 vias,
149 unchanged footprints.49 segments/2 ground vias added;117 previous tracks
and all classes preserved. Input filters/VAC local decoupling and both shunt
takeoffs routed. All new non-GND traces are on top. Preserve R1 force/sense
separation and R75 inner-pad takeoffs when adding power copper/planes.
DRC119 unchanged,274 unrouted,4 intentional hole parity; sync noop. No new
copper errors. Power links, final ground regions and ratings are not complete.

## Driver routing pass 2, 13 October 2026

Latest: `docs/PCB_DRIVER_ROUTING_PASS2_2026-10-13.md`.117 segments/14 vias,
149 parts;78 added segments and12 vias, all39 earlier tracks preserved.
Twelve parts moved with verified pad identities/nets. Input RC group relocated
off the underside SW1 corridor; keep subsequent sense routes out of it.
Four gate paths and bootstrap nets connected; main power links and low-side
return loops are unfinished. Do not use0.60mm SW driver returns for power.
One0.30mm-drill via now in U9 EP: assembly/paste wicking and thermal via/plane
design remain unqualified. DRC4 known USB hole+115 silk findings,293 unrouted,
4 intentional hole parity; sync noop. No copper/courtyard/library mismatch.

## Incremental routing checkpoint, 13 October 2026

User now explicitly authorizes assistant routing, superseding the placement-only
split below. Keep deliberate top-first routing and explain each bottom crossing.
Read `docs/PCB_ROUTING_RULES_2026-10-13.md` before continuing. Baseline commit
1151aa0;13 V2 netclasses cover125 nets;9 unused legacy classes/20 patterns removed
only from V2. The future INA/external-converter variant is a separate KiCad
project in this repository, not an architecture change to the integrated V2.
First output-sense filter group routed:22 new segments/2 ground vias;39 total
segments,149 unchanged placements,17 inherited tracks preserved. DRC118 unchanged,
317 unrouted,4 intentional mounting-hole parity. No copper errors introduced.
Power necks/ground sizing and USB impedance are NOT qualified by class defaults.
Next review input-feed placement and critical REGN/bootstrap/gate loops together.

## Complete working placement, 13 October 2026

Read `docs/PCB_FULL_PLACEMENT_PASS4_2026-10-13.md` and the per-net
`docs/PCB_ROUTING_HANDOFF_2026-10-13.md`. All77 remaining parts placed,149 total,
zero staged. Provisional outline110x110mm; D1/H4 also moved.17 retained tracks
unchanged; no autonomous routing. User specifically requests bottom-crossing
intent to be recorded during placement and updated when manually routing.
Distinguish candidate from proven necessity; consider improved placement first.
DRC4 USB hole+114 silk findings,326 unrouted,4 intentional hole parity; sync noop.
No short/courtyard/library mismatch after native refresh of U2/J27/Q20/Q22.
Long F1/JP30 power feed and RV1/CV returns need placement review before route
freeze; netclasses, RF/outline, silkscreen and physical heatsink fit remain open.
Complete provisional placement is not a routing/fabrication release.

## BQ quiet settings checkpoint, 13 October 2026

Read `docs/PCB_QUIET_PLACEMENT_PASS3_2026-10-13.md` for current coordinates.
16 more parts placed,63 new placements in total,77 still staged. C62 moved
0.5mm left. No new routing or outline change. User explicitly confirms the
outline will be reconsidered later. DRC4 USB+60 silk findings,326 unrouted,
4 intentional hole parity findings; sync noop. Next plan the complete relay,
manual trimmer/digipot selector neighborhood before logic and USB placement.

## Roomy placement checkpoint, 13 October 2026

User prioritizes access and routing space over minimum density except where
electrical/mechanical constraints require proximity. Read
`docs/PCB_POWER_PLACEMENT_PASS2_2026-10-13.md` for the latest saved coordinates.
27 more parts placed;47 newly placed in total,93 still staged. No new routing.
Two-layer/top-support/bottom-power allocation unchanged. Keep the70x110mm
outline provisional; do not squeeze logic to preserve an inherited dimension.
DRC:4 existing USB hole errors plus46 silk warnings; no courtyard/short/clearance
findings. Netclasses and silk field positioning remain unfinished.

## Placement/manual-routing split, 12 October 2026

User now offers to route manually after placement. Continue component-by-
component placement and prepare verified netclasses/routing notes, not new
autonomous routing. First20-part power group is provisional;120 parts staged.
Read `docs/PCB_POWER_PLACEMENT_PASS1_2026-10-12.md`. H3 moved to(115,25).
Current V1-based netclasses are not a ready V2 routing contract. Correct the
silkscreen references and finish supporting parts before freezing this group.

## Active PCB checkpoint, 12 October 2026

Read `docs/PCB_START_CHECKPOINT_2026-10-12.md` before further placement.
PCB synchronization and native2oz/1.6mm/ENIG metadata are now implemented.
145 parts+4 holes;140 new parts staged left, not final placement. D2 and
Q10-Q13 bottom. Seventeen original input segments retained; no new routing.
USB footprint hole-clearance findings remain explicit. IPC moves caused five
library mismatches, cleared with native KiCad library refresh: check this after
future moves, especially U9/U2/J27/Q20/Q22. Do not force unsupported MCP paths.

## PCB execution authorized, 12 October 2026

User now approves the proposed two-layer2oz/1.6mm/ENIG direction and asks to
update the existing V2 PCB, remove obsolete items, retain useful work and
recover/import TI layout material where useful. This supersedes the pending
approval statements below. Preserve V1 and a pre-update V2 snapshot.
Place by localization necessity: anchor IC/power part with reserved space for
its closest decoupling and critical loop parts before less constrained parts.
Actual placement remains one component at a time, with deliberate rotation,
alignment, readback and review. No global autorouter or blind TI copper merge.
TI archive BMS042A is six copper layers, unlike our two-layer/THT arrangement;
import as a separate reference first and reconcile any proposed reuse.

## Component-by-component method, 12 October 2026

Read `docs/PCB_PLACEMENT_ROUTING_METHOD_2026-10-12.md` before PCB work.
User requires deliberate per-component positioning, rotation and alignment,
top-first routing, and considering better placement BEFORE underside signal
detours. Useful short bottom paths remain allowed instead of excessive top
detours; ground/power/thermal functions are not a blanket via prohibition.
Method is proposed for discussion; no bulk placement or routing authorized.

Fresh U9 library geometry has 0.20mm pad-to-EP gap and0.25mm adjacent-pad gap.
Published PCBWay3oz normal/medium geometry does not establish acceptance.
Two-layer2oz (~70um),1.6mm FR-4/ENIG is now RECOMMENDED, not approved, based on
JLCPCB published geometry. Do not label3oz unconditionally verified or silently
change copper weight; current-path sizing and whole-board DFM remain separate.

## PCB preparation boundary, 12 October 2026

User retains the current70V-class objective and selected parts. No55V revision
is approved; staged prototype tests determine the qualified operating envelope.
Q10-Q13 and rectifierD2 belong underneath facing the shared heatsink; all other
components are intended above. The face allocation is decided, while actual
lead forming, contact heights, insulation and mounting clearances still need
checking. Do not silently move supporting components underneath; explain any
electrical conflict before proposing an exception.

TWO copper layers maximum is an explicit user constraint. The documented V1
baseline is FR-4,1.6mm,3oz/105um on each face,ENIG. Treat copper weight as a
reuse candidate pending V2 fine-pitch fabrication and routing checks, not an
already qualified stackup. V1 documents warn its saved metadata still says
35um/no finish. Do not copy that mismatch or assume V1 netclasses/70x110mm
outline suit the integrated V2 switching converter.

User wants remaining inputs settled, then a jointly reviewed placement and
routing methodology BEFORE execution. No PCB synchronization, placement or
routing is authorized by this discussion. Plan critical placement first and
bounded, inspectable changes with saved checkpoints; do not bulk-route and
leave the user to reconstruct the result as happened on V1.

## Capacitor prototype decision closed, 12 October 2026

User confirms keeping twelveEEU-FR2A101 for the first prototype. No extra
parts or redistribution approved. Retain local ceramics and short shunt-bank
connections; qualify ripple/temperature and stability through staged tests.
Do not repeatedly reopen the selection from the same acknowledged sensitivity
study, but preserve its findings and restrict the operating envelope or revise
the bank if evidence requires. No400W rating, known-overstress permission or
fabrication/energization approval follows from this decision.

## Driver prototype decision closed, 12 October 2026

User approves retaining AOY66923 with internal BQ REGN/DRV_SUP drive for the
first prototype, without an extra supply or speculative bootstrap/frequency
change. Gate-voltage and thermal-margin tests remain required to qualify the
operating envelope, but do not demand physical prototype measurements before
allowing prototype routing. Preserve short loops and measurement/rework access.
Reopen the architecture only for a concrete design contradiction or test
failure, not merely the same acknowledged uncertainty. No70V/400W rating,
fabrication/energization permission or waiver of other gates is implied.
See `docs/POWER_STAGE_MARGIN_REVIEW_2026-10-12.md` for the accepted disposition.

## Consolidated purchasing, 12 October 2026

User reiterates that parts must be easy to order without multiplying suppliers.
Optimize the complete BOM basket, including shipping, VAT where applicable,
minimum quantities and availability, not isolated lowest unit prices. Aim for
one mainstream distributor for most/all components; justify any extra supplier
by a meaningful total-cost or technical benefit. No distributor is mandated yet.
Prefer active production and normal stocked parts over clearance/last-time-buy
inventory. Check purchasable stock at the intended quantity, exact suffix and
package before final selection. Search snippets are provisional evidence, not
confirmed basket availability. Mechanical convenience alone does not justify
a hard-to-source replacement. No purchase is authorized by this instruction.

## AOY and shared heatsink, 12 October 2026

Latest user decision: keep AOY66923; stop seeking alternatives for now. Test
horizontal bending/mounting and reconsider the part only if unsuitable. Resolve
this physical fit before freezing the PCB footprint/fabrication; approval to
retain the candidate does not qualify the lead-form or electrical envelope.

User approved AOY66923 provisionally for Q10-Q13; substitution is saved through
Konnect, standard Q_NMOS_GDS / TO-251-3_Vertical, same electrical connections.
The previous SiR and pending AONS package statements below are historical.
Read `docs/SHARED_HEATSINK_2026-10-12.md` and `../components/aoy66923/README.md`.
User clarified a shared passive plate parallel beneath the PCB, with hot parts
on the facing side and side/corner screws. AOY drain tabs are live, not
equipotential: insulating thermal interfaces and clamps required. The saved
vertical footprint is NOT accepted for this geometry. Validate the mechanical
stack/short-lead fit before layout; do not assume bending the leads works.
Dimensions and mounting details remain open.
No custom model, V2 PCB, driver supply or power-rating approval. REGN/VGS,
thermal, USB, selector and protection gates remain open. BOM now prices AOY.
Endpoint test uses `-Voltage70 -ThtBulk -AoyFets`; retain historical profiles.

## Practical hand assembly, 12 October 2026

User has a soldering iron and hot-air station, but limited soldering experience.
Minimize the number of hard-to-solder parts, not merely the number of parts.
Do not assume a reflow oven, hot plate, preheater or inspection X-ray is available.
Prefer accessible leads, established hand-solder footprints and 0805 or larger
passives where electrical requirements permit. Preserve access for tweezers,
iron and local rework; mount tall through-hole parts after hot-air work.
Keep unavoidable hidden-pad packages as explicit assembly risks: the BQ QFN
does not justify multiplying other difficult packages. Assess heat spreading,
paste deposition, thermal-pad soldering and any preheat need before layout
release. Do not impair electrical/thermal performance just to enlarge pads.

For Q10-Q13, compare electrically suitable TO-220 or accessible-lead SMD options
against the preferred AONS66923 DFN before freezing the package. This is an
assembly-selection priority, NOT an approved replacement, permission for custom
footprints or a claim that TO-220 is cheaper/better. Retain the low-Qg/low-VGS
driver constraints and thermal checks. Native schematic still uses SiR870.


## Provisional THT bank, 12 October 2026

Latest saved MAIN uses twelveEEU-FR2A101100uF/100V, standard radial10mm/pitch5mm
footprints, with unchanged5-input/7-output wiring. See
`../components/panasonic-eeu-fr2a101/README.md`. Full-current ripple qualification
is OPEN: mismatch/remote-bank sensitivity exceeds individual rating. Retain
C77-C80 ceramics and all current release gates. No V2 PCB synchronization.
New substitution regression passes145 components/125 nets with only approved
fields changed; ERC zero under unchanged inherited settings. BOM refreshed.
Earlier polymer inventory/cost statements below are historical.

## Pre-layout decisions, 12 October 2026

Read `docs/PRELAYOUT_CLOSURE_2026-10-12.md` for current engineering gates.
Passive cooling first; optional fan deferred to sustained generic use.
User accepts simultaneous maximum manual settings outside specification,
superseding the earlier all-knob-combinations-safe requirement. Retain useful
low-voltage current; no analog constant-power circuit selected. Some receivers
may require powered ESP initialization, but retain standalone capability where
qualified. JP20 service restriction is conditional on host safety, not a waiver.
USB native flash/serial/JTAG remains required. No native changes in this pass.
The BQ voltage ADC published range is only 0-65.534 V; respect this in future
telemetry/power-control design without automatically restoring INA.

Latest scoped update, 12 October: see `docs/RESET_POWER_INTERFACES_2026-10-12.md`.
Reset RC midpoint R30.2/C32.1 is now connected to MCU_EN (U2.8/J23.1), with a
dedicated netlist regression check. +3V3 has explicit source/consumer sheet
interfaces; shared power symbols and common GND remain. Current saved count:
145 components / 125 nets / eight sheets; ERC zero under unchanged settings.
No PCB change or hardware qualification. Preserve the user's manual rewiring.

## Active revision: 70 V class

The latest user instruction authorizes input AND output range extension toward
70 V, with lower achievable endpoints accepted after tolerance analysis. See
`docs/VOLTAGE_RANGE_REWORK_2026-10-08.md`. This supersedes older 55 V targets
and the earlier range freeze below. The saved revision now has 146 components,
125 nets and eight sheets; see `docs/SCHEMATIC_VOLTAGE70_2026-10-08.md` and
`kicad/exports/review-voltage70-2026-10-08/controller-v2.pdf`.
J2 is removed. Four SIR870ADP 100 V MOSFETs, five input/seven output 100SXV27M
bulk capacitors, revised CV guards, D25 drain clamp and revised input thresholds
are drawn. Controls, current ceilings and USB/optional cell are unchanged.
Nominal app CV reach with trim is about 67.66 V; modeled worst-corner reach is
about 64.37 V. Do not promise 67.2 V on every board or exact 70 V operation.
ACOV screens about 67.47-69.68 V but does not disconnect the input. Surge,
receiver fault, handover and thermal qualification remain open; L3 is still
75 V rated terminal-to-terminal. Read the report and current cost dashboard.
Preserve the existing architecture and do not infer permission to energize,
manufacture, modify PCB or firmware. JP20/JP30/JP31 remain open.

Read `../AGENTS.md` and `../../AGENT/KONNECT_WORKFLOW.md` first.

## Historical pre-revision scope clarification

External-converter support is dropped. Keep the integrated BQ architecture and
derive published thresholds from the selected hardware. AC adds the rectifier;
DC uses the common downstream circuit. Manual/app selection is settled in
principle; retain the specific low-rail transition check, not an open architecture
decision. Standard guard-resistor choices and unused software codes are acceptable.
See `docs/PROTECTION_SCOPE_2026-10-08.md`. These decisions have not yet removed
J2 or changed native schematics. Protection options remain proposals only.

## Historical continuation direction, 8 October 2026

The adaptive rework and its continuation are saved, not merely proposed. Read
`docs/SCHEMATIC_CONTINUATION_2026-10-08.md` and the eight-sheet PDF under
`kicad/exports/review-continuation-2026-10-08/`. There are 142 components and 122 nets.
Native ERC is zero under unchanged inherited settings; endpoint/fault-fixture
evidence and physical-model qualifications are recorded in the report.

- TP40-TP47 are bare copper pads, not eight purchased connectors. K1.9 is
  explicitly NC; never restore its former ground connection from the adaptive
  baseline. Brownout and transient safety remain unqualified.
- J33's external sensor is Semitec 103AT-2, not an arbitrary 10k NTC. Eight
  previously unspecified MLCC MPNs and R75's equivalent FEB reel packaging
  are selected in this continuation; see its model and sourcing records.
- Read `docs/CONTINUATION_READINESS_REVIEW_2026-10-08.md` for default charging
  phases, separate precharge/termination settings and bootstrap/VGS margins.
  Do not call CE-low operation a universal PSU or disable battery protections
  globally to obtain an appliance profile.

- U3 is MCP4251-503E/SL, dual 50k. Channel 1 is connected to the protected
  independent CV selector; channel 0 alone remains spare on J7. No extra range
  GPIO. GPIO20 `CV_AUTO_N` is active low, with manual selected high/floating.
- Both mechanical trimmers remain. Nominal manual output-current maximum is
  about 9.11 A; BQ current registers can request lower supported ceilings.
  Resistor limits are software-overridable and are not a complete independent
  fault-protection system. Retained BQ settings survive ESP-only power loss.
- Default integrated telemetry is BQ-only: INA is absent from the active
  hierarchy; shared R4/R6 I2C pull-ups are on MCU. Do not restore INA without
  measurement evidence and a new decision.
- R1 is CSS4J-4026K-5L00F, 5 mOhm, locally replacing R74 on MAIN_CONVERTER.
  Preserve force/sense Kelvin separation. R62=1.47k gives about 13.6 A nominal
  input ceiling, no longer the fixed 1 A study. J30 is removed. Four input/six
  output TDK bulk capacitors and current-rated main wire-link terminals are
  selected, with mounting/ripple/thermal qualifications still required.
- USB plus optional protected 1S logic keeps TP4057/PMOS/diode/RT9080, including
  selected D20 SS1H10 and R51=1k. No generator AUX, TPS63031 or internal dump.
  USB data remains wired. J2 is external-converter variant feed only; it bypasses
  BQ telemetry and is not an independently controlled second receiver.
- Preserve JP20/JP30/JP31 open. Do not infer energization, cell charging,
  manufacturing, V1 edits, PCB synchronization or firmware work authorization.
- Approximately 400 W is an OUTPUT ambition, not a guaranteed rating or hardware
  power cap. Both knob extremes together require thermal qualification. 55 V
  is not a guaranteed programmable target: no full 13S/54.6 V charging promise;
  present ACOV trips about 53.4-54.6 V including initial tolerances.
- Receiver-safe relay/brownout behavior, generator overvoltage protection,
  loop stability, thermal/ripple margins, USB/cell behavior and layout remain
  release gates. Read `docs/REVIEW_AND_BRINGUP_2026-10-08.md` before any bench
  proposal. A clean ERC is not physical qualification.

## Historical decisions and checkpoints

The older entries below are retained for traceability. Their "latest", "saved"
and "not implemented" claims are historical where contradicted above. In
particular, do not restore MCP42100, INA, the 1 A input limit or the old 400 W
INPUT interpretation from this history.

Latest user confirmation approves MCP4251-503E/SL and accepts high-voltage
current derating: approximately 400 W OUTPUT would be an ambitious maximum,
not 55 V x 10 A simultaneously. Older 400 W INPUT sizing is not proof of that
output rating. Reconcile losses and autonomous combined-power/thermal limits.
See `docs/explanations/BQ25756_CONTROL_CONTRACT.md` for the rechecked voltage
divider versus ICHG resistor/I2C behavior. Saved schematic remains unchanged.

Newest sourcing recommendation: MCP4251-503E/SL dual 50k for the next CV rework,
under the user's alternative-part permission; see
`../components/v2-cv-control/DIGIPOT_SELECTION_2026-10-08.md`. Lower observed
price, suitable range, existing SOIC-14 footprint. Preserve one spare (now 50k),
GPIO20 selector and no extra range GPIO. Resolve the documented pin-11 label
discrepancy/model acceptance and command-format change before replacement.
MCP42100 is still the saved schematic/BOM part. BQ-only telemetry is accepted
for prototype measurement testing; no renewed INA-default argument is needed.

Newest user approval: GPIO20 may control the protected manual/app CV selector.
Keep MCP42100 baseline; practical known voltage settings/readback and smooth
BQ I2C current control take priority over exact voltage-code coverage. Compare
dual alternatives only for concrete benefit, verified footprint/stock and
similar or lower cost. No additional range GPIO is approved.
Use BQ telemetry by default in the integrated assembly; omit INA unless actual
measurement testing justifies it. ADC resolution is not guaranteed accuracy.
External-converter sensing remains a separate variant question. This decision
has not yet changed schematic/BOM flags: U1 is still present, GPIO20 still
drives /SHDN. Preserve shared R4/R6 pull-ups and resolve R1/BQ shunt reuse before
changing power-path components. See the approved-rework document below.

Latest user clarification supersedes treating the 1 A drawing as an ongoing
design target: advance the final current-capable schematic, at least about
10 A input objective, with low-current commissioning on that full board.
R62 remains 20k in the saved checkpoint until a coherent power-stage revision.
Higher-resolution DUAL digipot comparison is now approved; MCP42100 remains
the baseline until an actual selection, with one CV channel and one spare.
Extra range GPIO and custom shunt footprint are still unapproved. Evaluate
whether INA/BQ can share input-shunt hardware without impairing either circuit.
Read the latest section of `docs/CONTROL_REWORK_DECISIONS_2026-10-08.md`.

Latest saved status: `docs/SCHEMATIC_COMPLETION_2026-10-08.md` and
`kicad/exports/review-completion-2026-10-08/`. Both manual trimmers, consolidated
five-GPIO J5 and GPIO21 status LED are drawn. 135 components / 120 nets;
246 assertions, 42 negative fixtures, ERC zero under inherited settings.
BQ shares ESP/INA I2C via removable 0 ohm R68/R69; R71 pulls CE low for cold-start
permission, JP32 removed. J32 3V3 is reference only: no external power injection.
Q20/D21/R45 and service-header parts/models are selected; R45 is 0.82 ohm /0.5 W.
Electronic CV selector, qualified partial-power and ESP-loss fallback remain
unfinished; GPIO20 still controls MCP /SHDN. D20 and high-current boundary
models are not selected. R62 remains approximately 1 A input study limit.
Separate knob bounds do not yet satisfy combined-power board-safety requirements.
V1, V2 PCB and firmware remain untouched. Older checkpoint counts below are
historical, not the latest design inventory.

Latest user-approved substantial rework is documented in
`docs/CONTROL_REWORK_DECISIONS_2026-10-08.md`. Two mechanical voltage/current
trimmers with board-safe endpoints; autonomous manual fallback; INDEPENDENT
manual/app voltage selection; digital current via I2C with input-current effort
control; one MCP CV channel and one spare; one configurable external GPIO
connector and enclosure-visible status LED. Do not restore the superseded
shared-baseline voltage circuit. Preserve native USB and existing power choice.

Scope clarification, 8 October: the first physical prototype must contain the
full agreed adaptive functionality. The fixed 12 V / 1 A study is a temporary
drawing configuration, not an approved reduced-function first PCB. Complete
ESP voltage/current/power control, USB flash/debug/serial and independent safety
before claiming the design complete; validate hardware through staged bring-up.
See `docs/explanations/IMPLEMENTATION_NOTES.md` and maintain the corresponding
`docs/explanations/per_schematic/` page when decisions change.
Latest control direction, 8 October: retain BQ25756 as the design baseline and
keep the dual MCP42100. Reserve channel 1 for integrated CV; channel 0 remains
unused by the integrated converter and available at J7. Do not consume the
spare channel for coarse/fine CV or remove U3 without a new user decision.
BQ input/output current uses I2C. A protected CV interface is still required;
selection is not hardware qualification. See the single-channel study in
`docs/BQ25756_IMPLEMENTATION_NOTES.md`. Existing analog nets are not yet connected
to BQ; do not imply the new channel assignment has completed that integration.
Latest user instruction on 8 October supersedes the earlier regulator choice:
DO NOT use TPS63031. Reproduce Beetle's TP4057 + diode/PMOS + RT9080 power
circuit if it satisfies the requirements. Keep native USB service and the ESP
module. Verify USB current, cell charge/temperature limits and LDO thermal/
dropout behavior; do not imply complete USB compliance from copying Beetle.
Prefer leaded, accessible packages and 0805 passives where electrically suitable.
Keep local power/feedback wiring continuous. Document exact-copy deviations and
unknown Beetle discrete MPNs rather than silently inventing them. See
`docs/BEETLE_POWER_DECISION_2026-10-08.md`.

- User approved USB as the only external logic-power input, with an optional
  protected 1S lithium backup cell charged from USB. Target both USB-only
  operation without a cell and cell-powered operation with USB unplugged.
- Abandon generator-derived auxiliary 5 V logic power and the USB/AUX mux.
  The prior proposal is preserved under
  `../archive/v2-abandoned-auxiliary-5v-2026-10-07/` with verified source hashes.
- User explicitly approved authoring and verifying a project-local BQ25756
  schematic symbol through Konnect. All physical-pin/model validation rules
  still apply. This permission does not waive verification or approve other
  custom models, part substitutions, PCB layout or manufacturing.
- BQ25756 and the 55 V working ceilings remain selected; no internal dump.
  Main converter work must address safe unpowered-logic behavior. Do not keep
  an assumed external DRV_SUP feed from the abandoned auxiliary supply.
- Keep the ESP32 module pending the module-versus-Beetle comparison. Connector
  placement and antenna placement remain schematic/architecture intentions,
  not a newly approved PCB or enclosure dimension.

- V2 work must not change V1 unless explicitly requested.
- Copied hardware retains V1's 70 V limitation until protection and sensing
  are redesigned and verified. Architecture targets are not capabilities.
- Read `docs/OUTPUT_RECEIVER_STUDY.md` before selecting output limits.
  The 400 W architecture target is input power.
- Distinguish station supply profiles from battery charging algorithms.
  Do not infer chemistry from terminal voltage.
- Use this revision's `kicad/libraries/`. Shared references remain in
  `../components/`, measurements in `../measurements/` with revision identified.
- Inherited V1 rules in `.konnect/project.json` describe the copied circuit.
  Update through Konnect as blocks are redesigned; they do not freeze V2 parts.
- Do not infer purchasing or fabrication readiness from the starting copy.

## Schematic presentation

User's 12 October bootstrap rewiring is a concrete reference: C65/D10 and
C66/D11 now connect directly to the BQ SW/BTST pins, and RV2's FBG return is
drawn directly. Preserve this arrangement rather than restoring isolated
matching-label blocks. When replacing labels, first reposition and rotate
supporting components to reveal the actual circuit, instead of merely adding
long wires between the old islands. A single label may still name a continuous
net; SW1/SW2 links to the distant power stage remain intentional.

Ground test pads are physical probe-access features, not logical connectors.
User questions their utility: justify them by a concrete accessible measurement
location during PCB planning, not by convention alone, and avoid multiplying
them unnecessarily. TP44/TP47 have NOT been authorized for deletion by this
discussion. Global GND symbols and passive hierarchical labels are separate
schematic conventions, not extra probe pads or components.

User preference, 12 October 2026: compact slash-separated component values
and short labels without spaces around the separator, e.g. `1uF/10V`,
`20A/100VDC`. Preserve the actual values, units and ratings.

Follow the user's V1 readability corrections, especially commit `583232d`
(local label links replaced with connected circuits) and `aefcb01` (grouping
and annotation placement). The saved V1 auxiliary supply is the visual reference.

- Draw continuous wires within a functional block. Move nearby supporting
  components into that block instead of joining isolated pieces with repeated
  net labels.
- Show series paths, feedback dividers, enable/reset networks and local bypass
  capacitors explicitly. Prefer left-to-right signal/power flow and clear ground
  returns where the symbol pin arrangement allows it.
- Keep labels to name meaningful nodes, cross-sheet connections, shared rails,
  and connections whose wires would genuinely reduce clarity. A named signal
  is not, by itself, a reason to replace its local wire with matching labels.
- Keep references, values and concise safety notes readable and clear of wires,
  symbols and other text. Preserve provisional-design warnings.
- Group parallel capacitors belonging to the same functional bank and use
  consistent ground-return presentation. Avoid isolated above-rail additions
  like the former C87 arrangement when the bank can be drawn coherently below.
  Preserve visible separation across current shunts and local decoupling roles;
  schematic alignment does not prescribe physical PCB placement.
- For presentation-only changes, compare saved before/after XML net names and
  pin endpoint sets plus component inventory/fields; run hierarchy ERC and
  inspect rendered sheets. Do not change circuitry, part selection or BOM cost.
