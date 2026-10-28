# Future-agent handoff

## Approved changes pending application, 28 October 2026

User confirmed INA237AIDGSR for BOTH U1/U10 on 25 October, after explicitly
reconfirming the choice. Do not ask this selection question again. Also approved
local Harwin header drill changes 1.00 -> 1.05 mm and J26 JST 0.75 -> 0.80 mm,
with unchanged parts/positions and fresh pad-clearance/annulus verification.
These approvals are NOT completed CAD work: saved board remains CC446D8A...
C1468F8D, still INA238 and old holes. USB routing repair remains pending too.
28 October Konnect retry: IPC not_configured, no reachable editor. No native
CAD mutation was attempted. Apply via KiCad/Konnect, sync PCB fields, regenerate
BOM/shopping lists and run checks before release. Firmware remains out of scope;
record INA237 identification/alert differences for later implementation.
User requests Git checkpoint/push and a separate local, uncommitted AI-switch
file. No fabrication/order approval. Previous ZIP remains obsolete.

## External restart review, 24 October 2026

Read electrical/external-converter/FINAL_PHASES_2026-10-24.md first.
Fresh saved ERC0/9sheets; XML81parts84nets287pins unchanged;17fixturesPASS.
Fresh DRC0errors/4knownsilk/0unconnected; parity only H1/H2/H4.
PCB remains CC446D8A...C1468F8D; no CAD edits in this recheck. USB local repair,
connector-fit disposition and final new fabrication package still needed.
Konnect reports no UI and unconfigured IPC; user asked to open exact external
PCB. Procurement recheck found only3 planned INA238AIDGSR vs4needed; do not
blindly use old shopping drafts/prices. New bom/ORDER_READINESS_2026-10-24.md
checks35MPNs: other34stockadequate; INA237AIDGSR pincompatiblecandidate at
DKUSD3.23/11792stock, userapprovalrequested, NOTsubstituted. Driver must handle
absent0x3FdeviceID and lowerprecision. No fabrication/no-order claim changed.
No order/upload. Prototype tests remain separate from pre-order closure.

## Latest full external review, 15 October 2026

Read electrical/external-converter/FULL_PREFAB_REVIEW_2026-10-15.md FIRST.
User requested review beyond ERC/DRC. Preserve user I2C/3V3 edits; current saved
PCB CC446D8A...C1468F8D, 588 tracks/107 vias/84 footprints. Native fill/save,
fresh DRC0 errors/4knownsilk/0unconnected; saved/live trace geometry matches.
Fresh electrical review found no new confirmed schematic pinout defect;17
fixturesPASS. USB longpair crosses bottom-plane slits and lacks continuous
reference on B.Cu: localized reroute/return repair recommended BEFORE order.
Connector finished-hole tolerance needs decision (JST/Harwin/Phoenix); no
proven wrong pinmap. Seven obsolete netclasses/3V3 width appearance are cleanup,
not safety findings. No root routing changes applied in this review.
Older prefab-2026-10-15-final ZIP is now OBSOLETE, do not order it. Review-only
outputs in full-review-2026-10-15/. No upload/order. Independent electrical and
mechanical reports linked in full review. Preserve normal prototype test gates.

## External prototype preparation, latest 15 October 2026

Read electrical/external-converter/PREFAB_CLOSEOUT_2026-10-15.md FIRST.
C42 now TP_VCC afterR45, closeU6.4; no addedparts. OnlyC42.1 net changed.
591segments107vias84footprints; onlyC42/C45 moved; localBATvia moved/newGNDvia.
ERC0,DRC0errors/4historic silkedge warnings/0unconnected,parityH1H2H4.
Direct verifier now17negativefixtures, independent corrected reviewPASS.
User chose5JLCPCB boards /componentsfor2 /2layers2oz1.6mm/selfassembly.
Supplier drafts: bom/shopping-2boards-2026-10-15/. No order/upload/cart.
LATEST Gerber/PTH/NPTH exports: kicad/exports/prefab-2026-10-15-final/.
User recovered/closed schematic: final sync NOOP, nine sheets, zero changes.
User delegated legend choice: refs +19 board labels now1mm/0.15mm. DRC still
0errors/4historicwarnings/0unconnected;17fixturesPASS. Copper/mask/outline/drill
Gerbers identical to prior export ignoring timestamps; only front legend changed.
PreflighttoolREADY is bounded, NOT fullrelease: connectorfit and portalpreview
pending. See JLC_ORDER_REVIEW_2026-10-15.md. JP20OPEN.
KiCad crashed during nativePythonconsoleattempt; recovered by user. Do NOT use
that console again; exactMCPselection plusnativepropertiesUI worked reliably.
Older study-only/unappliedC42 and585track entries below are historical.

## External sourcing and bypass study, latest 15 October 2026

User requested study, not CAD changes. Read
electrical/external-converter/TP4057_INPUT_BYPASS_STUDY_2026-10-15.md:
recommend reconnecting C42 after R45 onto TP_VCC, close to U6.4, following
TP4057 Rev2.2 p9; zero added parts. NOT APPLIED. JP20 remains OPEN; capacitor
bias/USB/charge qualification stays open. Native design unchanged by this study.
bom/SUPPLIER_PLAN_2026-10-15.md and supplier-plan-2026-10-15.csv allocate all
35 MPNs/74 purchased parts to DigiKey29 + LCSC6. Two component suppliers,
plus separate PCB fabrication; accessories not yet fully selected. Exact parts
preserved, no orders/substitutions. Recheck stock/cart/freight; F1 stock indexed.
LCSC INA238 expensive USD8.4027 each; low DigiKey quote remains unavailable.

## External capacitor checkpoint, latest 15 October 2026

Read electrical/external-converter/CAPACITOR_SELECTION_2026-10-15.md FIRST,
then the 2 oz review below. Five 10uF gaps now have PROVISIONAL Murata
GRM21BR61C106KE15L (16V/0805), no missing purchasable MPNs. Native fields/value
sync only: same 585 tracks, 106 vias, 84 footprints, pads and net connectivity.
Fresh ERC0, DRC0errors/4knownsilk warnings/0unconnected; parity only H1/H2/H4;
sync noop, Direct verifier and all12 negative fixtures pass. Visual sheets checked.
Do NOT confuse MPN completion with capacitor/charge qualification. Typical
DC-bias reviewed, but C42 is upstream of R45, NOT directly on TP4057.VCC.
Resolve local VCC bypass before design freeze; JP20 remains OPEN. Five caps
retain PROVISIONAL notes in schematic/PCB/BOM. No fabrication/power approval.
LCSC C77075 observed USD0.0414 each atMOQ10; EUR planning budget unchanged.
Evidence: external-converter/kicad/exports/capacitors-2026-10-15/.
V1/V2/firmware untouched. Older five-missing-MPN entries below are historical.

## External 2 oz checkpoint, 15 October 2026

Read electrical/external-converter/REVIEW_2OZ_2026-10-15.md FIRST.
User-approved local HRO/JST PTH-pad variants applied, holes/positions unchanged.
Actual native stackup is 2 layers / 0.070 mm copper each / 1.600 mm total.
84 footprints, 585 segments, 106 vias; routing preserved. DRC zero errors,
four existing silk-edge warnings, zero unconnected; parity only H1/H2/H4.
ERC zero; Direct verifier and 12 negative fixtures pass; sync noop.
All 58 component PTHs reviewed, minimum annulus now 0.320 mm. Bounded JLC
2 oz geometry screen passes; NOT manufacturer acceptance. PCBWay generic
0.15 mm annulus was misleading: use its detailed 70 um rules, including vias.
Return-plane/spoke calculation complete: no mandatory reroute; retain thermals.
36 BOM MPN gaps filled, FIVE 10 uF caps still awaiting bias qualification.
Budget now 43.96-73.17 EUR planning only; lower end includes unavailable stock.
F1 20 A is not a 10 A limiter; source-specific fault coordination remains open.
Review outputs: external-converter/kicad/exports/review-2oz-2026-10-15/.
No fabrication/power-up release. V1/V2/firmware unchanged by this pass.
Older external entries below are historical where superseded.

## External USB closure, latest 14 October 2026

Read electrical/external-converter/USB_CLOSEOUT_2026-10-14.md FIRST.
J27 now HRO TYPE-C-31-M-12, standard footprint, user-approved USB replacement.
84 footprints (user removedH3/movedH2; preserve),585 tracks455top/130bottom,
106vias.552 previous tracks unchanged;23 removed/33added locally. ERC0,
DRC0errors/4silk warnings/0unconnected;parity onlyH1/H2/H4;syncnoop.
Native UI corrected J27 custom fields that Konnect sync omitted. New review
PDFs/JSON/XML are under external-converter/kicad/exports/usb-closeout-2026-10-14/.
Independent review confirms USB map; HRO fixes JAE NPTH-slot issue but NOT
JLC2oz compatibility: J27/J26 PTHannuli0.20/0.225mm vs0.254 required. No waiver.
User confirmed on14October2026: target2layers/2oz (about70um) for10A.
This approves the design basis, not a fabricator, rule waiver or order.
PCBWay is a lead only. Read CURRENT_AND_FABRICATION_2026-10-14.md.
BOM regenerated; budget43.47-77.89EUR planning only;41 small-part MPN gaps.
INA238 LCSC freshstock469 atUSD8.4027 vs cheaper unavailable DK. See bom/README.
No fabrication/power-up release. V1/V2/firmware untouched by this USB pass.
Older JAE/checkpoint entries below are history, not the current external state.

## External direct-digipot PCB checkpoint, 14 October 2026

LATEST decision supersedes the relay approval and untouched-PCB notes below.
User accepts prototype-style direct MCP42100 outputs instead of complicated
unpowered mechanical fallback. K1-K3 and eleven related parts removed; GPIO20
NC; /RS and /SHDN high. No automatic manual fallback or guaranteed safe code
with logic off. Power and initialize logic before converter enable; qualify
terminal voltage/current and back-power behavior. Read external-converter
CONTROL_AND_SENSING.md and DIRECT_DIGIPOT_CHECKPOINT_2026-10-14.md.

Schematic: 81 parts/84 nets/9 sheets, ERC0 and 12 negative fixtures pass.
PCB routing COMPLETE: 85 footprints including four retained holes, 575 tracks
(447 top/128 bottom), 104 vias, zero unconnected items. Provisional stepped
outline bounds 80x115mm, with left cell-connector extension and ESP antenna
notch. Saved refilled copper, then final silk-only cleanup: DRC 7 findings,
5 known JAE internal edge errors and 2 U2 antenna-outline silk-edge warnings.
No short/track-clearance/courtyard/library-mismatch or dangling-route findings.
Sync noop, only four board-only holes expected. No exclusions added.
Read electrical/external-converter/PCB_ROUTING_COMPLETE_2026-10-14.md and
INDEPENDENT_REVIEW_2026-10-14.md next. JAE slot tolerance/process remains the
fabrication blocker; current/thermal, USB/1S and RF remain qualification gates.
F1 cannot protect a fault supplied by the receiver battery: fuse near battery.
V1 source manifest hashes verified unchanged; V2/firmware not modified here.
No fabrication or power-up release. Existing project ignored checks retained.

Konnect netclass edits are file-backed: a subsequent live save can overwrite
them with cached project data. Verified workflow: save/close native PCB,
apply classes through Konnect, reopen, save/read back. Do not bypass IPC guards.
Native Update Footprints from Library restored U2/J27/Q20 mechanical properties;
avoid blind typed refresh/sync that reintroduces mismatch.

## External PCB reuse proposal, 14 October 2026

User requested inspection and a minimal-reroute proposal, not implementation.
Read electrical/external-converter/PCB_REUSE_PLAN_2026-10-14.md before layout.
Saved PCB70x110mm,64footprints,429segments(390top/39bottom),53via records;
still byte-identical V1. Current schematic95components/110nets, PCB46nets.
Plan preserves input-power and INA/Kelvin anchors, uses old AUX region for
output sensing/terminals, and rebuilds upper ESP/USB/power/relay circuitry.
No native changes or synchronization dry-run: IPC editor unavailable, evidence
from native saved-file SVG/GenCAD exports. Do not blind-reuse renamed nets or
repurposed references (notablyR19). No fixed new coordinates or outline change.

## External converter three-wire approval, 14 October 2026

Latest user decision: full independent CC and CV A/W/B interfaces, to support
both rheostat and divider configurations. Three TQ2-3V DPDT relays share one
GPIO20/AUTO_N and AO3401A driver; NC external mechanical 100k, NO MCP42100.
All six terminals switch; no A/W straps. Mechanical pots remain external.
GPIO20 low requests digital after initialization, high/released requests manual;
MCP /RS and /SHDN stay high. This supersedes the raw checkpoint below.
Active `cc_selector_3wire.kicad_sch`:95components/110nets, ERC0; independent
ThreeWire netlist checks and9negative fixtures pass. Raw/two-wire sheets inactive.
See CONTROL_AND_SENSING.md for the exact six-pole contract and qualification gates.
Latest report: electrical/external-converter/THREE_WIRE_CHECKPOINT_2026-10-14.md.
Review PDF under external-converter/kicad/exports/three-wire-2026-10-14/.
No universal converter compatibility: terminal range/current, relay skew,
brownout injection and USB/LDO budget remain unqualified. About139mA coil load.
PCB remains unsynchronized; V1/V2 and firmware are outside this change.

## External converter checkpoint, 14 October 2026

New independent variant: `electrical/external-converter/README.md`.
Project `electrical/external-converter/kicad/bike-generator-external-controller/`.
V1 copied/renamed through Konnect; V1 and V2 preserved. Current schematic removes
LM5164, imports V2 ESP32/USB/optional1S/GPIO, and adds a second INA238/shunt for
converter output. Raw V1 MCP42100 100k CC/CV A/W/B headers retained with
GPIO20-to-SHDN. User questioned the assumed two-wire interface: automatic
manual/digital selection is NOT active; `cc_selector.kicad_sch` is an unlinked
two-wire study, not the current circuit. See `CONTROL_AND_SENSING.md`.
82 components/84 nets; fresh hierarchy ERC0; independent raw-netlist checks and
five negative fixtures pass. PCB is still byte-identical V1 and UNSYNCHRONIZED.
No manufacturing/power-up release. INA238 stock and JAE fabrication gates remain.
Prioritize latest user interface decision before activating a selector; a 100k
value alone does not establish two-wire versus three-wire converter control.

## JAE USB selection, 14 October 2026

User provisionally accepted JAE DX07S016JA1R1500; J27 schematic/PCB/BOM updated.
Read `electrical/v2/docs/USB_JAE_SELECTION_2026-10-14.md` before more USB work.
1069 tracks/131 vias/149 parts, 16 unrouted; nine local tracks replaced by13,
1056 preserved, all placements unchanged. ERC0, USB118 checks+5negative cases
pass, nets unchanged, sync noop. DRC132: five J27 oval-NPTH edge errors+127silk;
four intentional mounting-hole parity. No rule changes/exclusions. Important:
0.266mm nominal gap passes hole0.25 but oval uses edge0.50; 0.6mm NPTH slot is
below JLC1mm/PCBWay0.8mm published minima. JAE is NOT fabrication-cleared.
Eurocircuits0.5mm slots is only a lead; full process/cost not checked. No waiver
authorized. Native UI refresh restored mechanical pad properties after typed
sync; avoid reintroducing library mismatch via unsupported footprint updates.
BOM drawn subtotal87.24-109.52 EUR one-off; no ordering/release approval.

## Input/return routing pass 15, 14 October 2026

Latest `electrical/v2/docs/PCB_INPUT_RETURN_ROUTING_PASS15_2026-10-14.md`.
1065 tracks/131 vias/149 parts;36 added,all1029 preceding tracks preserved,
no placement changes.16 unrouted versus32 (104 before pass14).DRC131 remains
4 J27 holes+127 silk;4 hole parity;sync noop. Local input/fuse/TVS and capacitor
ground banks connected, main feed/switching returns/USB/LED still incomplete.
USB local study created and checked separately, NOT applied to J27: see
`USB4105_LOCAL_FOOTPRINT_STUDY_2026-10-14.md`; physical solder-fit gate remains.
`verify-routes15-pass.mjs` PASS. No fabrication/power-up approval.

## Signal/power routing pass 14, 14 October 2026

Read `electrical/v2/docs/PCB_SIGNAL_POWER_ROUTING_PASS14_2026-10-14.md`.
1029 tracks/131 vias/149 parts; 194 new tracks, 12 deliberately replaced,
835 earlier tracks exactly preserved. J5/R7/R8/R9/R10/R34/H1/R70 moved.
32 unrouted versus104; DRC131:4 existing USB holes+127 silk;4 hole parity,
sync noop. GPIO/CE/pull-up, switching and output positive paths advanced.
Input feeds, USB data, STATUS_LED and 20 GND items remain. Short power necks
need current/thermal review; do not declare 400 W or fabrication readiness.
User authorizes local USB footprint study, not a manufacturer qualification.
Verifier `verify-finish14-pass.mjs` PASS. No schematic/value/firmware changes.

## Interface routing pass 13, 13 October 2026

Read `electrical/v2/docs/PCB_LINK_ROUTING_PASS13_2026-10-13.md` first.
847 segments/112 vias/149 unchanged placements.155 segments added, four
deliberately replaced,692 preserved exactly. I2C distribution, J32 SCL/SDA/INT,
USB VBUS/CC/local GND, spare-pot J7 and MCU-side USB escapes connected.
104 unrouted versus130 before. DRC133 unchanged:4 J27 holes+129 silk,
4 mounting-hole parity,sync noop. No new copper/courtyard/mask findings.
USB data path, GPIO feeds, CE/R70 supply and power/planes remain open.
Bottom transitions and four replacements documented; no user blocker.
Verifier `verify-links13-pass.mjs` PASS. No component/config/value changes.

## Logic routing pass 12, 13 October 2026

Read `electrical/v2/docs/PCB_LOGIC_ROUTING_PASS12_2026-10-13.md` first.
Larger autonomous session: 696 segments/85 vias/149 parts; all471 earlier
tracks preserved,225 added (162 top/63 bottom). Only C50/R51 moved. Logic
handover/charger,3V3 distribution,EN/BOOT,local I2C and header/LED branches
advanced.130 unrouted versus199 before. DRC133:4 known J27 holes +129 silk,
no copper/courtyard/mask/dangling-via errors;4 hole parity,sync noop.
Native menu deletion after exact Konnect selection now verified for vias.
Next I2C distribution,USB/GPIO/service,then power copper/planes. No user
decision blocks continuation; do not return to tiny single-net sessions.

## SPI routing pass 11, 13 October 2026

Read `electrical/v2/docs/PCB_SPI_ROUTING_PASS11_2026-10-13.md` first.
471 segments/61 vias/149 unchanged parts; all440 previous tracks preserved,
31 added. POT_CS/SCK/MOSI now connect U2 to U3; CV_AUTO_N U2-to-R87 stays
entirely top. Six SPI vias with bottom passage/under-SOIC escape documented.
DRC129 unchanged(4 USB+125 silk),199 unrouted,4 hole parity,sync noop. No new
copper/courtyard/mask errors. Next global logic power, I2C/service/control,
then power copper/planes. Signal return/clock/noise qualification still open.

## FBG routing pass 10, 13 October 2026

Read `electrical/v2/docs/PCB_FBG_ROUTING_PASS10_2026-10-13.md` first.
440 segments/55 vias/149 parts;406 earlier tracks preserved,12 replaced,
34 new. R62 now(76.7,66.8)/90,R72(77.5,69.7)/0,R73(77.5,72)/180.
BQ_FBG now connected to RV2; TS/REGN/current-setting connectivity preserved.
Four new vias documented. FBG length68.15mm remains a quiet-return/plane
review item, not noise-qualified. DRC129(4 USB+125 silk),203 unrouted,4 hole
parity,sync noop. No new copper/courtyard/mask errors. Next global logic
power and SPI/control/service links, then power copper/planes.

## CV link routing pass 9, 13 October 2026

Read `electrical/v2/docs/PCB_CV_LINK_ROUTING_PASS9_2026-10-13.md` first.
418 segments/51 vias/149 parts;400 previous segments preserved,4 replaced,
18 new. Only TP45 moved to(49.2,46.7). CV_FB/K1 and TP45 now connected;
Q22/D24 local 3V3 ties connected, not global regulator feed. BQ_FBG still OPEN:
review R61/R62/test-via/TS/ground corridor before routing. CV_FB branch remains
provisional pending quiet-return/plane review. DRC130(4 USB+126 silk),204
unrouted,4 hole parity,sync noop. No new copper/courtyard errors.

## REGN/CV routing pass 8, 13 October 2026

Read `electrical/v2/docs/PCB_REGN_CV_ROUTING_PASS8_2026-10-13.md` first.
404 segments/47 vias/149 parts; all 297 earlier tracks preserved. Only R67
moved to (62,33.5)/0. REGN-to-R72 and much of the local manual/digital relay
control are connected; CV_FB/FBG, TP45 and global supplies/interfaces remain
open. Eleven new vias with bottom-crossing reasons recorded. DRC130:4 known
USB holes+126 silk; no copper/courtyard/mask errors.208 unrouted,4 hole parity,
sync noop. Next quiet CV/FBG links and remaining local/logic feeds, then power.

## Thermal/digital routing pass 7, 13 October 2026

Read `electrical/v2/docs/PCB_THERMAL_DIGITAL_ROUTING_PASS7_2026-10-13.md` first.
297 segments/36 vias,149 parts;247 prior IDs/250 geometries preserved. J33 now
(68.5,69.2)/0, R60(76.8,58.3)/180, R71(76.75,60.45)/180. TS/header ground and
U9-to-R68/R69/R70 SCL/SDA/INT connected; REGN-to-R72 still OPEN. Seven new vias,
documented bottom crossings. DRC120:4 known USB holes+116 silk, no copper,
courtyard or mask-bridge errors;243 unrouted,4 hole parity,sync noop. Next REGN
supply, FBG/CV and service/logic links, then remaining power copper/planes.

## Test/feedback routing pass 6, 13 October 2026

Read `electrical/v2/docs/PCB_TEST_FEEDBACK_ROUTING_PASS6_2026-10-13.md` first.
257 segments/29 vias,149 parts. All228 prior track geometries preserved (224
same UUIDs);29 new segments/four vias. Only TP43 finally moved, to(97.5,57.15).
TP41/42/43 connected; U9 CV_FB-to-R66/TP40 and R75-to-R66 sense branch routed
on top. Two test-pad crossings underneath. Trial R62/TP41/TP42/J33 moves rejected
and restored. DRC124:4 known USB holes+120 silk, no copper/courtyard errors;
248 unrouted,4 intentional hole parity, sync noop. REGN-to-R72, TS-to-J33,
K1/FBG/interfaces and main power/planes remain open. No release or rating.

## Threshold fanout and RV1 routing pass 5, 13 October 2026

Read `electrical/v2/docs/PCB_FANOUT_ROUTING_PASS5_2026-10-13.md` first.
228 segments/25 vias,149 parts.13 local VAC/ACP/ACN tracks replaced,190
others preserved;38 final new segments. C63/C67 moved slightly, RV1 moved
to(68.2,76.5)/180 and TP43 to(70,70). ACUV/ACOV and R61-to-RV1 connected.
ACOV top; short VAC crossing, ACUV and RV1 branch bottom. DRC124:4 known
USB holes+120 silk, no copper/courtyard errors;254 unrouted,4 hole parity,
sync noop. Next test pads, REGN/TS/CE headers and local interfaces.
KiCad manager socket conflict resolved by normal close/reopen of pcbnew alone.

## Local BQ settings routing pass 4, 13 October 2026

Read `electrical/v2/docs/PCB_SETTINGS_ROUTING_PASS4_2026-10-13.md` first.
203 segments/20 vias,149 unchanged footprints;37 segments/4 vias added,
all166 earlier tracks and classes preserved. FSW, local CE/ICHG/ILIM/TS
and divider resistor chain connected, NOT complete control blocks. ACUV/ACOV
pin escapes, RV1, test pads, TS REGN/J33 and CE J32 remain open. Two TS
segments and five GND segments added underneath, with documented reasons.
DRC119 unchanged,259 unrouted,4 intentional hole parity; sync noop.
Next local fanout/placement review, then remaining interfaces and power feed.

## Input sensing routing pass 3, 13 October 2026

Read `electrical/v2/docs/PCB_INPUT_ROUTING_PASS3_2026-10-13.md` first.
166 segments/16 vias,149 unchanged footprints;49 segments and2 ground vias
added. All117 previous tracks and netclasses preserved. Input filters and
local VAC decoupling connected; input/output shunt takeoffs routed on top.
R75 remains two-terminal: preserve separate sense branches with future power
copper. DRC119 unchanged (4 USB holes+115 silk),274 unrouted,4 intentional
hole parity; sync noop. Power links, planes and ratings remain incomplete.
Next quiet BQ settings, input-feed placement review, then power loops.

## Driver routing pass 2, 13 October 2026

Read `electrical/v2/docs/PCB_DRIVER_ROUTING_PASS2_2026-10-13.md` first.
117 segments/14 vias,149 footprints;78 segments and12 vias added, all39 prior
segments preserved. Twelve small parts deliberately repositioned, pad nets
unchanged. Four gate paths and bootstrap nets connected; power loops/low-side
source returns NOT complete. Input RC group moved away from underside SW1.
DRC4 known USB hole errors+115 silk warnings,293 unrouted,4 intentional hole
parity; sync noop. No copper/courtyard/library mismatch errors. One ground via
now in U9 EP: solder-wicking/thermal/plane details remain explicit fab gates.
Next input RC/VAC/Kelvin routing, then input-feed placement and power copper.

## Incremental routing authorized, 13 October 2026

User now asks the assistant to try routing, with deliberate top-first planning
and netclasses prepared first. Reference commit `1151aa0` precedes routing.
Read `electrical/v2/docs/PCB_ROUTING_RULES_2026-10-13.md` first. Thirteen V2
classes cover all125 nets;9 obsolete classes/20 patterns removed from V2 only.
First local output-sense filter pass adds22 segments/2 ground vias,39 segments
total;149 placements and17 inherited tracks unchanged. DRC118 unchanged,
317 unrouted,4 intentional hole parity. No new copper errors; routing partial.
Separate future external-converter card belongs in its own KiCad project;
see `electrical/v2/docs/FUTURE_BOARD_VARIANTS.md`. No V1 edits.
Earlier placement-only/no-autonomous-routing entries below are historical.

## Full working placement checkpoint, 13 October 2026

Read `electrical/v2/docs/PCB_FULL_PLACEMENT_PASS4_2026-10-13.md` and
`electrical/v2/docs/PCB_ROUTING_HANDOFF_2026-10-13.md` first. All77 remaining
parts now placed;149 footprints, zero staged. Provisional outline110x110mm.
User will route manually and explicitly requests a record of justified bottom
crossings. Per-net candidates/alternatives are documented, not actual new vias.
Seventeen inherited tracks unchanged; no new routing, no schematic/BOM change.
Saved DRC4 known USB hole errors+114 silk warnings,326 unrouted,4 intentional
hole parity; sync noop. No short/courtyard/library mismatch. Before route freeze,
review the long F1/JP30-to-input-bank path, RV1/CV returns, V2 netclasses,
RF/outline/heatsink geometry and silk. Do not claim routing/fabrication readiness.

## Current PCB placement checkpoint, 13 October 2026

Read `electrical/v2/docs/PCB_QUIET_PLACEMENT_PASS3_2026-10-13.md` first.
63 new parts placed across three bounded passes,77 remain staged.149 total
footprints,17 inherited input track segments unchanged; no autonomous routing.
User wants roomy assembly and confirms outline resizing will follow placement.
Latest DRC4 USB hole-clearance errors+60 silk warnings,326 unrouted,4 intentional
hole parity findings; sync noop. Netclasses, silk positions, CV/logic placement
and the actual bottom heatsink/lead-form envelope remain unfinished.

## First power-placement pass, 12 October 2026

User offers to perform routing; assistant owns placement/rule preparation.
Twenty converter parts placed,120 still staged; H3 moved provisionally to
(115,25) to clear L3. Read `electrical/v2/docs/PCB_POWER_PLACEMENT_PASS1_2026-10-12.md`.
No new routing. DRC4 USB+17 silk findings,326 unrouted; sync noop. Netclasses
still target V1 and new BQ nets lack dedicated rules: NOT ready to route from
current defaults. Physical AOY lead-form/clamp fit is not proven by this pass.

## PCB synchronized checkpoint, 12 October 2026

V2 PCB now updated:145 schematic parts+4 holes,17 retained input segments,
old zones/vias removed. D2 and Q10-Q13 are B.Cu;140 new parts are staged left
of the provisional outline, NOT finally placed. Native stackup now2oz/1.6mm/
ENIG; saved-file export confirms it. Sync noop. DRC4 USB hole-clearance
findings,326 unrouted,4 intentional hole parity warnings. Read
`electrical/v2/docs/PCB_START_CHECKPOINT_2026-10-12.md` before continuation,
especially the IPC move/library-attribute limitation and native refresh.
TI six-layer reference imported separately. V1 untouched; no new routed tracks.

## PCB start authorized, 12 October 2026

User approves two-layer2oz/1.6mm/ENIG and execution of the proposed incremental
PCB method: update V2, remove obsolete items and reuse sound work. Localization
priority is explicit: reserve/place critical decoupling immediately with its
anchor before less constrained components. Previous approval-pending entries
below are historical. V1 must remain untouched. TI BMS042A six-layer PCB has
been imported separately through KiCad CLI for reference, not merged into V2.
See `electrical/v2/docs/PCB_PLACEMENT_ROUTING_METHOD_2026-10-12.md`.

## Placement method and copper check, 12 October 2026

User mandates component-by-component, aligned/intentionally oriented placement
and intelligent top-first routing; bottom transitions need actual benefit,
not compensation for poor placement. Proposed protocol and fresh U9 footprint
check: `electrical/v2/docs/PCB_PLACEMENT_ROUTING_METHOD_2026-10-12.md`.
Current0.20mm pad-to-EP gap does not support automatic reuse of PCBWay3oz
normal-process assumptions. Two-layer2oz is recommended but NOT yet approved;
no native files or fabrication settings changed. Do not claim the3oz reserve
unconditionally lifted, and do not start layout before the method is agreed.

## PCB preparation constraints, 12 October 2026

User explicitly retains the current70V-class objective and selected components;
the discussed55V retreat is NOT approved. Staged tests will determine the
qualified V/I/power envelope, not guarantee70V or400W.
Mechanical face allocation is settled: Q10-Q13 and D2 underneath facing the
shared heatsink, other components above. Do not re-ask the overall arrangement.
User requires TWO copper layers maximum. Reuse the documented V1 fabrication
baseline where suitable, not its stale stackup metadata. Before PCB mutations,
settle remaining inputs and agree a placement/routing methodology together;
no autonomous bulk routing or V2 PCB synchronization is authorized here.
See `electrical/v2/docs/PRELAYOUT_CLOSURE_2026-10-12.md`.

## Capacitor selection closed for prototype, 12 October 2026

User confirms twelveEEU-FR2A101, with ripple/thermal/stability qualification
on the prototype. No extra parts or wiring change. Preserve documented margin
uncertainties; test within a controlled envelope, then derate or revise if
needed. See `electrical/v2/docs/POWER_STAGE_MARGIN_REVIEW_2026-10-12.md`.
This closes the component decision, not the400W rating or fabrication release.

## Driver architecture closed for prototype, 12 October 2026

User accepts AOY66923 plus internal BQ gate supply for the first prototype.
No added driver supply; do not keep reopening the same selection. VGS/thermal
proof remains prototype qualification, not a prerequisite measurement before
prototype routing. Preserve test/rework access and other release gates; no
power rating or fabrication/energization permission. Current disposition:
`electrical/v2/docs/POWER_STAGE_MARGIN_REVIEW_2026-10-12.md`.

## Power-margin follow-up, 12 October 2026

Read `electrical/v2/docs/POWER_STAGE_MARGIN_REVIEW_2026-10-12.md`. Fresh MCP
saved-file XML/ERC retains145 components/125 nets/eight sheets;768 endpoint
assertions pass. New reproducible46-check stress screen separates400W cases
from manual uncapped operation and models inductance-bias sensitivity.
Capacitor ripple remains marginal, REGN/minimum-VGS proof remains open; do
not turn arithmetic or the accepted heatsink sensor into a400W release.
No native, PCB, firmware, BOM or architecture change. Exact heatsink deferred.

## Heatsink thermistor decision, 12 October 2026

Subsequent user decision: exact heatsink sourcing is deferred; user plans to
adapt/drill a large plate with available M4 tooling. Do not re-ask its reference
or block schematic work. Preserve PCB contact-stack/lead-form/insulation and
antenna-clearance checks before layout freeze; see the shared-heatsink document.

User confirms Semitec103AT-2 on the shared heatsink, connected to existing
J33/R72/R73. No extra analog watt limiter, deliberate heater or ESP-controlled
fake-temperature circuit. See the thermal-sensor section in
`electrical/v2/docs/SHARED_HEATSINK_2026-10-12.md`. This selects the sensor role,
not its final attachment or a validated thermal/power rating. Default BQ JEITA
behavior remains relevant even without ESP; no firmware/native changes here.

## Purchasing constraint, 12 October 2026

User reiterates easy ordering and few suppliers: target a consolidated BOM
basket at one mainstream distributor, compare delivered basket cost, and
justify extra suppliers. Prefer active, stocked exact parts, not last-time-buy
clearance. See `electrical/v2/AGENTS.md`. Longer-lead MOSFET screening found no
accepted substitute yet; AOT66920L is electrically interesting but Last Time Buy.
User subsequently confirmed keeping AOY and trying the horizontal mount;
stop alternative searches unless the mechanical trial fails. Resolve the fit
before freezing the PCB footprint/fabrication. Electrical gates remain open.

## AOY substitution and shared heatsink, 12 October 2026

Q10-Q13 now provisionally use user-approved AOY66923 THT, replacing SiR870.
Standard GDS symbol and vertical TO-251 footprint accepted for provisional
schematic use; short-lead fit/clamp/envelope remain mechanical gates. User
clarified a common passive plate parallel beneath the PCB, hot parts on the
facing side, side/corner screws and insulated live drain tabs. The saved
vertical AOY footprint is NOT mechanically accepted for this mounting;
short-lead forming and the contact stack need checking before layout. See
`electrical/v2/docs/SHARED_HEATSINK_2026-10-12.md` and the AOY part
folder. G/D/S-normalized equivalence, six substitution fixtures,768 power
assertions,17 power fixtures, reset/USB and ERC pass; BOM updated. No V2 PCB
or driver-rail change; no400W/energization/fabrication release. Older AONS/SiR
statements below are historical. Latest PDF is under
`electrical/v2/kicad/exports/review-aoy-mosfets-2026-10-12/`.

## Assembly constraint, 12 October 2026

User has hot air and a soldering iron, with limited experience. Minimize hard-
to-solder packages and hidden joints; do not assume a preheater/oven available.
See `electrical/v2/AGENTS.md` for the practical assembly criteria. Compare
accessible-lead SMD or TO-220 power MOSFET options before freezing AONS DFN;
retain electrical/thermal requirements and do not infer a replacement approval.
The unavoidable BQ QFN is not a reason to dismiss the benefit of simplifying
four other packages. No native/BOM change in this clarification.

## Provisional THT capacitor substitution, 12 October 2026

User requested cheaper through-hole capacitors and authorized implementation.
MAIN now contains twelveEEU-FR2A101100uF/100V, with the original5-input/7-output
wiring and local ceramics retained. Standard polarity/footprint model checked
through Konnect and disposable schematic/PCB renders. Study and explicit
full-current ripple limitations:
`electrical/components/panasonic-eeu-fr2a101/README.md`. Mismatch and isolated-
local-bank screens exceed1.5A: this remains a prototype selection, NOT400W
qualification. Actual twelve-part basket estimate9.54EUR vs31.02EUR previously;
stock needs reconfirmation. BOM and dashboard updated. Wiring equivalence,
five substitution fixtures,17 power-stage fixtures, reset/USB assertions and
ERC pass. No V2 PCB edits. AONS driver/bootstrap follow-up is saved under
`electrical/components/aons66923/README.md`: larger bootstrap capacitance alone
does not prove minimum4.5V VGS; MOSFET substitution remains pending.
Native MCP tools still fail to appear dynamically in Codex; official installed
Konnect0.12.1 JSON-RPC stdio works using `.konnect-scratch/konnect-mcp-call.mjs`.
All native mutations continue through Konnect, never generic text edits.

## MOSFET direction and BOM refresh, 12 October 2026

User confirmed AONS66923 direction for Q10-Q13, retaining internal gate supply
for now. Do not re-ask this preference; electrical/bootstrap and footprint
acceptance still precede native substitution. Saved schematic remains SiR870.
BOM CSVs refreshed from the 145-component prelayout export; dashboard separates
actual drawn cost from pending AONS savings and capacitor basket pricing.
See `electrical/v2/bom/COST_DASHBOARD.md` and the prelayout closure record.
Native files unchanged; no purchase, layout or energization release.

## Pre-layout closure, 12 October 2026

See [closure ledger](../electrical/v2/docs/PRELAYOUT_CLOSURE_2026-10-12.md).
User prioritizes passive bicycle cooling; fan later if needed. Both manual
knobs fully up may now be outside specification: retain low-voltage current,
no automatic analog power-limiter addition. ESP initialization is accepted
for receiver profiles that require it, while standalone use remains desirable.
JP20 opening for PC service is acceptable ONLY conditional on host safety,
not permission to risk USB damage. USB flash/serial/JTAG remains required;
GPIO20/21 are not spare physical UART pins. No native or BOM change this pass.
REGN and low-rail selector safety remain engineering gates. BQ voltage ADC
published range ends at 65.534 V; no assumption of accurate 70 V telemetry.
Record TI precharge-default table/register discrepancy, do not silently choose.
New arithmetic and USB endpoint regressions accompany the closure record.

## User bootstrap wiring review, 12 October 2026

Reviewed the user's direct SW1/BTST1 and SW2/BTST2 bootstrap connections and
direct RV2-to-FBG arrangement without editing native files. Full equivalence
against the previous direct-wiring export passes: 145 components, 125 nets,
eight sheets, 33 library parts unchanged. 760 endpoint checks pass; ERC zero
with the same four ignored categories. No local shorts/orphans; render inspected.
Evidence: `electrical/v2/kicad/exports/review-user-bootstrap-2026-10-12/`.
MAIN hash: `3513032691DC67840F0E7239D8E7CEDAD84F9626BE723D6B80B6D5E230D050DB`.
This user layout is the new presentation reference in `electrical/v2/AGENTS.md`.
Ground pads require a practical measurement justification, not automatic
proliferation; TP44/TP47 remain unchanged, no deletion decision yet. Existing
physical qualification gates remain open.

## Direct MAIN wiring, 12 October 2026

User requested fewer local logical bridges. MAIN REGN/DRV_SUP now visibly feeds
C60/C61/TP43, D10/D11 bootstrap supplies and R72/R73/J33 on one continuous rail.
R66 is wired directly to BQ_OUT after R75/before JP31; CV block moved right.
Exactly one BQ_REGN and one BQ_OUT label remains, solely for naming. Preserve
this direct wiring rather than restoring the prior fragmented label version.
Fresh user filter/output-capacitor edits preserved; two harmless ACP/ACN wire
tails trimmed. Only MAIN native changed. 145 components/125 nets unchanged,
full presentation equivalence/reset/760 endpoint checks pass. ERC zero with
the same four ignored checks. JP30's service role is documented; no PCB change.
See [review](../electrical/v2/docs/MAIN_CONVERTER_REVIEW_2026-10-12.md) and
[latest PDF](../electrical/v2/kicad/exports/review-main-direct-wiring-2026-10-12/controller-v2.pdf).

## Capacitor-bank harmonization, 12 October 2026

C87 now joins C82/C74/C77/C78 in a row below BQ_VAC with a common ground return.
Q10/Q11 and gate resistors moved on the drawing to create room; C73/C81 and
MCU C30/C31 ground returns are also harmonized. All seven child sheets inspected;
already coherent output banks retained above their rails. User edits preserved.
Only MAIN and MCU native sheets changed. Full equivalence: 145 components,
125 nets, eight sheets, 33 library parts; 760 endpoint checks and reset test pass.
ERC zero with unchanged four ignored categories; no PCB/electrical/BOM change.
See [review](../electrical/v2/docs/MAIN_CONVERTER_REVIEW_2026-10-12.md) and
[latest PDF](../electrical/v2/kicad/exports/review-capacitor-banks-2026-10-12/controller-v2.pdf).

## MAIN_CONVERTER review, 12 October 2026

VAC bypass ground/feed crossings, REGN driver-pin text crossings and C80's
long loop are cleaned up through Konnect. Only MAIN native sheet changed;
145 components / 125 nets / eight sheets and all component fields remain
identical to the pre-edit snapshot. ERC zero with the same four ignored checks;
760 endpoint/part assertions, 17 negative XML fixtures, presentation equivalence
and MCU reset checks pass. No electrical substitution, BOM saving or PCB work.
See [review and remaining gates](../electrical/v2/docs/MAIN_CONVERTER_REVIEW_2026-10-12.md)
and [latest PDF](../electrical/v2/kicad/exports/review-main-converter-2026-10-12/controller-v2.pdf).
Prioritize REGN/driver thermal margin before layout freeze; surge, receiver
fault protection and combined manual-knob power qualification remain open.

Selector decision, 12 October 2026: user retains K1/Q22/Q21 and the current V2
circuit. Record transistor-only selection as a future cost/power optimization,
not work to implement now. Controlled pauses of a few seconds are acceptable;
independent settings, manual operation without ESP power and receiver/digipot
protection remain required. Prospective EUR1-2 savings are unvalidated and
must not reduce the current BOM. See the
[sheet decision](../electrical/v2/docs/explanations/per_schematic/05_CC_CONTROL.md#decision-retain-relay-12-october-2026).

## CC_CONTROL readability, 12 October 2026

R86 now carries a short bleeder annotation. Q22/R19/R87 were rearranged to
remove the supply loop crossing; one local CV_DRIVE label pair removes two
crossings across relay feedback branches. U3 pins 11/12 have a local +3V3
symbol instead of a wire across SPI. Electrical connectivity and all physical
component records are unchanged (145 components / 125 nets). Root ERC zero,
same four ignored checks; local connection/short/orphan and reset checks pass.
Only CC_CONTROL changed among native files. No PCB or hardware qualification.
See [sheet notes](../electrical/v2/docs/explanations/per_schematic/05_CC_CONTROL.md)
and [latest PDF](../electrical/v2/kicad/exports/review-cc-readability-2026-10-12/controller-v2.pdf).

## Reset and power interfaces, 12 October 2026

Latest correction: R30.2/C32.1 now joins U2.8/J23.1 (MCU_EN). The preceding
ERC-clean snapshot had an isolated reset RC midpoint. A dedicated netlist test
passes on the fix and rejects that snapshot. Explicit +3V3 sheet interfaces
now show the regulator source and four consumers; GND remains common.
R86 is the unchanged 10k rail bleeder; TP47 is a ground probe pad.
See [report](../electrical/v2/docs/RESET_POWER_INTERFACES_2026-10-12.md) and
[latest PDF](../electrical/v2/kicad/exports/review-en-power-2026-10-12/controller-v2.pdf).
Current saved hierarchy: 145 components / 125 nets / eight sheets; ERC zero
under unchanged settings. No PCB work or power-up approval.

## Sheet readability review, 12 October 2026

Follow-up cosmetic pass: slash-separated component values/short labels now
omit surrounding spaces (`1uF/10V`). Seven remaining fields normalized through
Konnect; user-updated capacitor formatting and wiring preserved. Fresh ERC zero,
net connections unchanged. Updated PDF: `controller-v2-compact-values.pdf` in
the same review export directory. Convention recorded in `electrical/v2/AGENTS.md`.

User approved explicit USB sheet interfaces, the missing GND ERC flag and
clearer service labeling, while preserving their manual rewiring. Keep J32's
header footprint, optionally unpopulated. See the
[completed review](../electrical/v2/docs/READABILITY_REVIEW_2026-10-12.md) and
[review PDF](../electrical/v2/kicad/exports/review-readability-2026-10-12/controller-v2.pdf).
USB_DP/DM now use bidirectional hierarchical interfaces and visible root wires;
the GND flag resolves the reported ERC error. J25's VBUS and flag are named.
Saved hierarchy ERC: zero errors/warnings under unchanged inherited settings.
Physical component data and net endpoint groups are unchanged; three exported
net names changed hierarchy prefixes. All pre-existing wires are preserved.
Current snapshot: 145 components / 126 nets / eight sheets. No PCB work.

## Latest decision: economical protection, 10 October 2026

Latest same-day clarification: user requests ONE input fuse at RECTIFIED_RAW.
The [single-input decision and bridge fault analysis](../electrical/v2/docs/SINGLE_INPUT_FUSE_2026-10-10.md)
supersedes the earlier F_SRC baseline below. Fresh KiCad XML confirms this is
already the circuit: D2/J1 -> RECTIFIED_RAW -> F1 -> TVS/converter. Remove F_SRC
from base accessory BOM; keep F1 0456020.ER pending replacement coordination.
Unfused energy-rich DC input is NOT supported: reverse J1 and internal bridge
faults can bypass F1. F_BAT remains separate. No native design changes.

Earlier same-day decision, retained for history:
User authorized settling the minimum-cost protection approach and proceeding.
Read [the decision](../electrical/v2/docs/MINIMUM_PROTECTION_DECISION_2026-10-10.md)
and [conditional accessory BOM](../electrical/v2/bom/protection-accessories.csv).
Retain F1/D1. Required external fuses use solderable axial leads, no holders:
F_SRC 0324020.MX280P 20 A and F_BAT 0324015.MXP 15 A. They are conditional
source-adjacent harness parts, NOT two mandatory additions to every generator.
No active reverse/backfeed controller or series power diode is selected.
EUR4.69 for both single / EUR3.592 at ten, ex VAT/shipping/assembly/support.
Fault/cable/temperature coordination remains open; no KiCad/PCB/firmware edits
or release. This is not replacing F1 or proving no fire/receiver protection.

## Current saved revision: 70 V class

The user has now authorized a wider INPUT AND OUTPUT range, superseding the
55 V design target. Read the [new scope](../electrical/v2/docs/VOLTAGE_RANGE_REWORK_2026-10-08.md).
The saved revision has **146 components, 125 nets and eight sheets**. Start with
the [revision report](../electrical/v2/docs/SCHEMATIC_VOLTAGE70_2026-10-08.md),
[review PDF](../electrical/v2/kicad/exports/review-voltage70-2026-10-08/controller-v2.pdf)
and [cost dashboard](../electrical/v2/bom/COST_DASHBOARD.md).
It uses 100 V power MOSFETs and twelve 100 V bulk capacitors, revised CV guards
and input thresholds, and a selector drain clamp. J2 is removed. Core controls,
USB/optional 1S, no-dump/no-AUX, and current ceilings are retained.

70 V class is not a guaranteed 70 V setpoint or a qualified board rating.
Nominal app CV reach is about 67.66 V with reference trim; modeled worst-corner
reach is about 64.37 V, so 67.2 V charging remains conditional per board.
Input ACOV screens about 67.47-69.68 V; it is not physical input disconnection.
The conditional static CV upper-bound screen is about 69.52 V, not a transient
or single-fault guarantee. See the report for calculation assumptions.

ERC is zero under inherited settings; exported-netlist regression tests pass.
No hardware tests or PCB work were performed. Generator surge coordination,
receiver fault protection, low-rail handover, thermal/ripple/stability and
USB/cell qualification remain gates. L3 retains a 75 V terminal limit.
Reverse-wiring damage to our board is acceptable to the user; fire containment
and connected-equipment protection remain requirements, not proven by a fuse.
JP20/JP30/JP31 remain open. Preserve V1, copied PCB, firmware and prior exports.

## Historical pre-revision scope clarification

The user has dropped the external-converter option and accepts the achievable
thresholds of the selected hardware rather than expanding its range. Manual/app
selection is an agreed architecture; its remaining low-rail check is engineering
validation, not an unanswered user choice. Read
[scope and protection discussion](../electrical/v2/docs/PROTECTION_SCOPE_2026-10-08.md).
The saved schematic below is unchanged by this decision: J2/historical external
variant provisions still need reconciliation in a later Konnect pass. Protection
component counts/prices in the discussion are preliminary, not approved BOM items.

## Historical V2 checkpoint: continuation, 8 October 2026

Read [the continuation schematic report](../electrical/v2/docs/SCHEMATIC_CONTINUATION_2026-10-08.md)
and [review PDF](../electrical/v2/kicad/exports/review-continuation-2026-10-08/controller-v2.pdf)
first. Saved hierarchy: **142 components, 122 nets, eight sheets**. The prior
134-component adaptive checkpoint and earlier completion reports are historical.
The continuation adds eight bare probe pads, leaves K1.9 explicitly NC,
specifies the external Semitec 103AT-2, selects eight MLCC MPNs with larger
footprints where appropriate, and changes R75 only to equivalent FEB reel
packaging. These are schematic changes, not physical qualification.

MCP4251-503E/SL is now drawn and connected: one 50k channel controls CV through
the protected independent manual/app selector; channel 0 remains spare on J7.
GPIO20 `CV_AUTO_N` is **active low**: high/floating selects manual. Both manual
trimmers remain. BQ I2C controls input/output current limits and supplies
telemetry; INA is removed from the active hierarchy, with R4/R6 pull-ups moved
to MCU. R1 is now the sole local BQ input shunt, 5 mOhm four-terminal; R74 and
J30 are removed. R62 is 1.47k, about 13.6 A nominal input ceiling, not 1 A.
Four input and six output bulk capacitors are drawn. J2 is an external-converter
variant feed before BQ sensing, not a second regulated receiver output.

USB/optional protected 1S logic retains the Beetle-style TP4057, diode/PMOS and
RT9080 topology, with selected SS1H10 diode and 1k pulldown. No generator AUX,
TPS63031 or internal dump. Native USB remains connected. JP20/JP30/JP31 remain
open for commissioning; closing them is not implicitly authorized.

Native ERC is zero under the unchanged inherited ignore settings. Independent
CV and power endpoint checks pass; see the report for final hashes, fixture
tests, physical-model evidence and preservation checks. V1, copied V2 PCB,
firmware and manufacturing are outside this change. No hardware testing or
energization/fabrication approval is claimed.

Important remaining gates: generator overvoltage/TVS coordination, receiver-safe
brownout/relay handover, continuous thermal/ripple/stability qualification,
USB/cell operation and PCB layout. Approximately 400 W is an OUTPUT ambition,
not an autonomous power clamp. 55 V is a ceiling, not guaranteed CV reach or
continuous input operation: this selector does not promise full 13S/54.6 V
charging, and ACOV trips about 53.4-54.6 V with initial tolerances.
Start review with the [qualification guide](../electrical/v2/docs/REVIEW_AND_BRINGUP_2026-10-08.md)
and [current cost dashboard](../electrical/v2/bom/COST_DASHBOARD.md).
The [continuation readiness review](../electrical/v2/docs/CONTINUATION_READINESS_REVIEW_2026-10-08.md)
adds charger-versus-supply startup, separate precharge/termination settings,
exact NTC curve and high-side gate-drive margin. Do not assume CE low gives
universal standalone supply behavior. Open K1.9 removes a pole-skew path,
not the remaining low-rail MCP/relay brownout problem.

## Historical handoff entries

The entries below retain the decision history. Statements about what is
"latest", "saved" or "not yet wired" below are superseded by the checkpoint
above when they conflict. They must not restore the old INA, MCP42100 or 1 A
study to the active V2 design.

Latest user confirmation: MCP4251-503E/SL choice approved. Approximately 400 W
OUTPUT is an ambitious maximum, with current derated at high voltage; do not
interpret 55 V / 10 A as simultaneous capability. Older budgets used 400 W
INPUT, so reconcile losses before claiming output capability. Voltage uses the
FB divider; output current uses the lower enabled ICHG programming-resistor
and I2C limits, not a second voltage divider. See the rechecked
[control contract](../electrical/v2/docs/explanations/BQ25756_CONTROL_CONTRACT.md).
No schematic replacement or power-rating qualification yet.

Newest digipot comparison recommends **MCP4251-503E/SL**, dual 50k SOIC-14,
under the user's equal/lower-cost alternative permission. Read the
[selection evidence](../electrical/components/v2-cv-control/DIGIPOT_SELECTION_2026-10-08.md)
for pricing/stock, range calculations, SPI differences and pin-11 documentation
discrepancy. Existing KiCad footprint/symbol found; no replacement or custom
model yet. Below, MCP42100 describes the saved baseline, not the new preferred
part. BQ-only prototype telemetry remains accepted for physical testing.

## Latest decision: simple controls and BQ telemetry, 8 October 2026

GPIO20 is now explicitly approved for the protected manual/app CV selector.
Keep MCP42100 as baseline: practical known voltage settings and readback matter
more than fine decimal resolution; frequent effort control uses BQ I2C current.
Only replace the dual digipot for a concrete benefit with verified footprint,
stock and similar/lower cost, retaining one spare channel. No extra range GPIO
is approved. Default integrated assembly should omit INA unless measured BQ
telemetry performance proves insufficient. TI does not guarantee ADC accuracy;
resolution is not accuracy. External-converter sensing is a separate variant.
These are saved requirements, not new wiring: GPIO20 still drives /SHDN and
INA remains in the schematic/BOM. Preserve shared R4/R6 I2C pull-ups and settle
R1/BQ input-shunt reuse before altering the main power path. See the latest
[control decisions](../electrical/v2/docs/CONTROL_REWORK_DECISIONS_2026-10-08.md).

## Latest saved checkpoint: host interface and parts, 8 October 2026

Newest user clarification: stop progressing around a 1 A study target; design
the final current-capable schematic (at least about 10 A input objective), with
low-current testing reserved for commissioning. R62 is still 20k in the saved
checkpoint below, not silently changed by this instruction. Comparison of
higher-resolution dual digipots is approved, with MCP42100 still a candidate
and one CV channel/one spare retained. Extra range GPIO and custom shunt model
are not approved yet. Explain BQ versus INA sensing and evaluate possible input
shunt sharing rather than assume duplication is required. See the latest
[decision clarification](../electrical/v2/docs/CONTROL_REWORK_DECISIONS_2026-10-08.md).

Read the [completion report](../electrical/v2/docs/SCHEMATIC_COMPLETION_2026-10-08.md)
before historical states below. The prior [control rework](../electrical/v2/docs/SCHEMATIC_CONTROL_REWORK_2026-10-08.md)
remains the manual/GPIO baseline. Both Bourns mechanical trimmers are drawn:
guarded manual voltage and output-current ceiling, initially calibrated near
12 V / 1 A. J5 is the single five-GPIO connector; GPIO21 drives a status LED
or alternative remote LED; INA_ALERT no longer consumes an ESP pin.
Saved hierarchy: 135 components / 120 nets / nine sheets. Native ERC zero under
unchanged inherited settings; 246 assertions and 42 negative fixtures pass.
All 22 V1 files, the V2 PCB/project and untouched child sheets are preserved.
BQ now shares ESP/INA I2C through 0 ohm R68/R69; R71 pulls CE low for cold-start
autonomous permission, JP32 is removed. J32 is service/reference only, NOT an
external power input. Exact Q20/D21/R45, guard-resistor and low-voltage service
header parts/footprints are selected. R45 is explicitly 0.82 ohm / 0.5 W rather
than Beetle's 0.8 ohm. D20 and high-current connector/commissioning-link models
remain unfinished. Read the [host review](../electrical/components/ti-bq25756/HOST_INTERFACE_REVIEW_2026-10-08.md)
and [final independent saved-design review](../electrical/v2/docs/COMPLETION_INDEPENDENT_REVIEW_2026-10-08.md)
alongside the schematic report. The review found no new wiring/model/render
defect, verified all nine sheets and confirmed preserved source hashes.

This is NOT completed adaptive V2 or an energization approval. Independent
manual/app CV switching and qualified ESP-loss/retained-register fallback remain
unimplemented; GPIO20 still drives MCP /SHDN. BQ/ESP partial-power behavior is
not qualified by the new I2C connection. R62 still sets about 1 A INPUT
for the isolated study. Do not claim the two knobs at maximum are board-safe:
the future higher-current design must resolve the combined power/thermal limit.
Manual voltage endpoints are nominally about 8.18-52.31 V, not guaranteed 55 V
or 54.6 V battery charging. Wide CV alternatives and their unresolved risks are
in [the CV study](../electrical/components/v2-cv-control/README.md).

Start review with [the new PDF](../electrical/v2/kicad/exports/review-completion-2026-10-08/controller-v2.pdf)
and [cost dashboard](../electrical/v2/bom/COST_DASHBOARD.md): 135 BOM rows,
18 unpriced fitted entries; component budget about EUR101-163 one-off or EUR76-128
per board at ten, excluding PCB/assembly/cooling/enclosure/VAT/shipping.
These are allowances, not a purchasing quote. No firmware, PCB synchronization,
ordering or fabrication was performed.

## Scope clarification: 8 October 2026

Active substantial schematic rework authorized. Read the
[approved control rework](../electrical/v2/docs/CONTROL_REWORK_DECISIONS_2026-10-08.md)
before older discussion below. User confirmed TWO mechanical trimmers,
board-safe endstops, and INDEPENDENT manual/app voltage settings. The prior
shared-baseline/parallel-digipot proposal is superseded. One schematic owner
is implementing through Konnect; no V1, PCB, firmware or manufacturing changes.

Latest fallback refinement: user explicitly wants a mechanical screw trimmer,
initially adjusted to 12 V, allowing other standalone/non-pedalling uses.
Design bounded adjustment and wiper-fault behavior; no range/MPN selected or
schematic change yet. It changes the digital CV mapping in the proposed
parallel branch, so recalibration is required. BQ current is not I2C-only:
retain resistor-programmed ICHG/output and ILIM_HIZ/input limits; lower enabled
hardware/register limit wins. Final default currents remain undecided. See
the [control contract](../electrical/v2/docs/explanations/BQ25756_CONTROL_CONTRACT.md).

Newest operating preference: investigate autonomous approximately 12 V fixed
fallback when ESP is off, with the digipot branch disconnected and BQ CE held
enabled. This supersedes the prior default-OFF preference, not fault protection
or receiver qualification. It would free the dedicated BQ-enable GPIO and
raise the provisional configurable external count from 4 to 5. Disabled
conversion is not a 40 V generator bypass, so do not justify always-enabled
operation as automatically safer. Current limits, retained BQ host settings,
BAT_OVP with higher-voltage batteries and transition behavior remain unresolved.
See the newest [control-contract section](../electrical/v2/docs/explanations/BQ25756_CONTROL_CONTRACT.md).
No schematic change is implied; older 4-pin counts below describe the prior
proposal with a dedicated BQ enable GPIO.

Latest GPIO/accessibility direction: ONE configurable external GPIO connector
for former action, Hall, accessory PWM and READY plus all truly free GPIOs;
those functions are future example profiles/tutorials, not fixed assignments.
GPIO21 is available for reassignment. Do not share user-configurable READY
with internal converter enable. Prefer replacing dedicated MCP /SHDN control
with the protected analog-switch control if verified sufficient; /SHDN then
held inactive. INA_ALERT can be reclaimed for I2C-polled telemetry, subject
to protection review. Provisional budget leaves 4 configurable external pins,
zero additional spares after switch, BQ enable and status LED. These are notes,
NOT schematic changes or a validated pin map. See the latest sections of the
[MCU guide](../electrical/v2/docs/explanations/per_schematic/04_MCU_MODULE.md)
and [connector guide](../electrical/v2/docs/explanations/per_schematic/03_CONNECTORS.md).

Latest control decision: retain BQ25756 as the design baseline and keep the
dual MCP42100. Channel 1 is allocated to the future protected CV path; channel
0 stays unused internally on J7. Do not delete U3 or consume the spare for
coarse/fine CV. BQ current control uses I2C. The saved schematic remains
unchanged by this feasibility pass: J9 is not yet connected to BQ. See
[channel allocation](../electrical/v2/docs/explanations/per_schematic/05_CC_CONTROL.md)
and the new MCP calculation section in
[BQ implementation notes](../electrical/v2/docs/BQ25756_IMPLEMENTATION_NOTES.md).
Nominal range works; nonlinear-code gaps and powered-off/attached-battery
protection are unresolved. Controller selection is not hardware validation.

The user wants one full-function first physical V2 prototype, with ESP-controlled
voltage/current/power and USB flash/debug/serial access. The fixed 12 V / 1 A
study is an unfinished schematic checkpoint, not an approved separate prototype
PCB. Bring up the completed board in stages; do not remove safety warnings while
circuits are missing. Read the new [explanation guide](../electrical/v2/docs/explanations/README.md)
and [completion criteria](../electrical/v2/docs/explanations/IMPLEMENTATION_NOTES.md).
Nine sheet-specific explanations are under its `per_schematic/` folder.
BQ25756 remains selected, but I2C alone does not provide broad CV adjustment.
BQ25758 is a serious comparison candidate, not an approved substitution.
Latest instruction on 8 October supersedes the intermediate TPS63031 approval:
remove TPS63031 and use Beetle's TP4057 + diode/PMOS + RT9080 power circuit if
requirements are met. Prefer solderable leaded packages and direct local wiring.
Read the [new power decision](../electrical/v2/docs/BEETLE_POWER_DECISION_2026-10-08.md).
The 8 October [schematic pass](../electrical/v2/docs/SCHEMATIC_BEETLE_POWER_2026-10-08.md)
implements that topology with direct local wiring, TP4057 in SOT-23-6 and
RT9080-33GJ5 in TSOT-23-5. No TPS63031/BQ24074/logic inductor remains. The
saved hierarchy has 133 components / 116 nets; native ERC has zero violations
under inherited settings. 75 Beetle/model/preservation and 85 main-study checks
pass, plus 24 deliberately broken fixtures are rejected. Q20/D20/D21 remain
generic placeholders pending accepted parts; R45 needs a rated >=0.5 W part.
JP20 defaults open; JP21/JP22 are removed. No NTC input or managed combined USB
current limit is provided by TP4057. Cell/source/thermal and USB backfeed
qualification remain open. V1 and the copied V2 PCB remain unchanged.
The regenerated BOM has 133 rows / 28 unpriced entries; the full USB/LV allowance
is EUR8-16 one-off, not a complete purchasing quote. See the
[fresh PDF](../electrical/v2/kicad/exports/review-beetle-2026-10-08/controller-v2-review.pdf),
[cost dashboard](../electrical/v2/bom/COST_DASHBOARD.md), and
[ESP/BQ control contract](../electrical/v2/docs/explanations/BQ25756_CONTROL_CONTRACT.md).
Main adaptive CV, ESP integration and independent protection are still unfinished;
the logic simplification does not establish full V2 readiness.

## Previous checkpoint: 7 October 2026

The user approved simplifying V2 to **USB as the only external logic-power
input, plus an optional USB-charged protected 1S lithium cell**. Generator AUX
5 V and USB/AUX source selection are abandoned. The former V2 is preserved in
[the verified source archive](../electrical/archive/v2-abandoned-auxiliary-5v-2026-10-07/README.md).
Active work remains in `electrical/v2/`. The user explicitly approved creation
and verification of the missing BQ25756 symbol through Konnect. Main buck-boost
work may advance on its separate sheet within established BQ25756/55 V/single
receiver/no-internal-dump requirements. Keep ESP32 module provisionally while
comparing Beetle cost, GPIO exposure and USB/antenna placement flexibility.
Read `electrical/v2/AGENTS.md` and the newest architecture section first.
The saved 7 October checkpoint has **138 components / 121 nets** across nine
sheets. USB and logic power are separated; the verified 37-pin BQ symbol and
four-FET converter are drawn as an isolated fixed approximately 12 V / 1 A
study, not a usable charger. JP30/JP31 remain open. No direct BQ-to-MCU control
connection or independent main-power protection has been qualified.
Start with the [current progress report](../electrical/v2/docs/SCHEMATIC_USB_ONLY_BQ_STUDY_2026-10-07.md)
and [review PDF](../electrical/v2/kicad/exports/review-usb-only-2026-10-07/controller-v2-review.pdf).
Saved-file native ERC reports zero violations under inherited settings;
52 USB and 85 main-study assertions pass, with 19 deliberately broken XML
fixtures rejected. These do not establish power ratings or fabrication readiness.
The [BOM dashboard](../electrical/v2/bom/COST_DASHBOARD.md) tracks 29 unpriced
entries and a revised reference-stage allowance after pricing the capacitor bank.
V1's 22 source/library files still match their pre-migration HEAD blobs; the
copied V2 PCB remains byte-identical to the pre-session archive and out of sync.
Next: USB current/back-power policy, independent safe-off/output protection,
wide CV selection, and power-stage thermal/ripple plus sourcing qualification.
Do not reopen the abandoned AUX branch or implement firmware to conceal these gates.
The 6 October descriptions below document the archived proposal; they are not
instructions to restore AUX power or treat the old model-approval gate as open.

## Current workspace update: 6 October 2026

Latest user approval: **BQ25756 selected**, with **55 V normal input/output
working ceilings** for this iteration. Supporting power parts and continuous
ratings remain unqualified. Prior 80 V input / roughly 60 V output comparisons
are historical, not the active target. User requested a long V2 schematic
session and an overall living BOM, prioritizing widely available economical
fit-for-purpose parts. Keep a single receiver output; multiple receivers remain
research-only. See the active decision at the top of the
[V2 architecture](../electrical/v2/docs/CONTROLLER_V2_INTEGRATED_SPEC.md).

The user requested revision-separated electrical work and a V2 starting copy.
V1 now lives in `electrical/v1/`; V2 lives in `electrical/v2/`. Shared references
and measurements remain in `electrical/components/` and `electrical/measurements/`.
Start V2 work from [its README](../electrical/v2/README.md) and
[output receiver study](../electrical/v2/docs/OUTPUT_RECEIVER_STUDY.md).
The latest request expands reuse to scooter/hoverboard/e-bike motors, alternators
and e-bike/camper batteries. Read the
[compatibility decision pack](../electrical/v2/docs/compatibility/README.md):
18 generator families, 26 receivers, 36 pairings and own-e-bike feasibility.
The wider use case reopens buck-boost / approximately 60 V output research;
the working scooter -> buck -> AC50S path still needs no boost.
The V2 KiCad project now contains the **LV2 schematic checkpoint**, not a
completed integrated design. ESP32-C3-MINI-1-N4X, USB-C/ESD, USB/AUX source
mux, protected-cell charger interface and a 3.3 V regulator are drawn.
JP21 is an interim service enable; JP20 defaults open to disable battery charging
pending cell/NTC qualification. J20 is now a test header, NOT a 3.3 V supply input.
Wake/forced-off, HV-to-USB fault containment and the main BQ stage remain open.
Read the [LV2 progress report](../electrical/v2/docs/SCHEMATIC_LV2_PROGRESS_2026-10-06.md),
[overall cost dashboard](../electrical/v2/bom/COST_DASHBOARD.md), and
[BQ implementation notes](../electrical/v2/docs/BQ25756_IMPLEMENTATION_NOTES.md).
The [USB/LV fault review](../electrical/v2/docs/USB_AND_LV_FAULT_REVIEW.md)
lists the unfinished source, data-backpower and high-voltage fault cases.
The saved checkpoint has 106 components; 48 endpoint/MPN assertions pass and
native hierarchy ERC reports zero violations under inherited settings.
This does not qualify hardware, USB compliance or fabrication. A verified BQ
symbol is still unavailable; explicit permission to author a custom symbol
was requested asynchronously and has not yet been received.
V1 files, the copied V2 PCB and firmware remain unchanged by this work.
The subsequent 6 October presentation pass applies the user's V1 drawing style
(`583232d`, `aefcb01`) to the new MCU/LV sheets: continuous local wires, grouped
passives and fewer repeated labels. The
[current review PDF](../electrical/v2/kicad/exports/review-presentation-2026-10-06/controller-v2-presentation.pdf)
supersedes the LV2 PDF for presentation only. Before/after XML comparison proves
106 component records, 90 nets, 9 sheet identities and 24 library-part records
unchanged; the 48 targeted assertions and fresh native ERC pass. BOM rows and
costs are unchanged. Read `electrical/v2/AGENTS.md` for the drawing conventions.
Inherited power-path limits remain V1's until redesigned; they do not qualify
the incomplete V2 system for operation. The V1 release gate below
still applies to V1; manufacturing work is not the current V2 task.

Latest component/cost research: [V2 candidate and cost study](../electrical/v2/bom/CANDIDATES_AND_COST.md)
compares LTC3779, LT8705A and the new BQ25756 cost candidate, the recommended ESP32-C3-MINI-1-N4X variant,
digital setpoint options and protected USB/auxiliary power management. It has
dated EUR price observations and separate block allowances for 1/10/50 units,
not an approved BOM or supplier quote. No components have been purchased.

The remaining handoff records the earlier V1 baseline with relocated links.

User decisions on **6 October 2026**: no internal dump load, not even an optional
unpopulated dump stage. Keep external-load PWM/ready-fault control in the generic
GPIO interface; power switching and dissipation belong to the external accessory.
V2 should also support an external buck/boost/buck-boost with the integrated main
converter omitted, while retaining auxiliary power, sensing and protection.
Qualified converter profiles determine available software functions; arbitrary
modules are not plug-and-play. See the dated section in the
[V2 architecture](../electrical/v2/docs/CONTROLLER_V2_INTEGRATED_SPEC.md).
The first schematic increment implements only logic-level PWM/ready access;
it does not implement an external power stage, finished converter adapter or
qualified assembly variants. Firmware has not been changed. The 5 October
cost model still includes superseded dump allowances and is historical, not the
current product quote.

Fablab/accessibility clarification: the full-scope V2 reference must support
documented lower-cost DIY assembly variants, including protected DC input with
the AC rectifier omitted, independently of the main converter fitted/omitted
choice. Preserve required protections and publish exact variant BOMs, links,
limits, profiles and tests. Offer only a few qualified prebuilt configurations
initially; a full-feature prebuilt version may follow later. This is a product
direction, not implemented build instructions or a universal compatibility claim.

Handoff prepared on **3 October 2026** for continuing the bike-generator
controller work in a fresh Codex conversation or on another computer.

This folder is a compact navigation and operating layer. It does not replace the
KiCad design, manufacturer datasheets, BOM, or review records. Follow the links
to the canonical files whenever a value matters.

## Start here in a fresh session

1. Read the repository-level [`AGENTS.md`](../AGENTS.md).
2. Read [`electrical/AGENTS.md`](../electrical/AGENTS.md) completely.
3. Read [`KONNECT_WORKFLOW.md`](KONNECT_WORKFLOW.md) before any KiCad action.
4. Read [`V1_STATE.md`](V1_STATE.md) for the current electrical baseline.
5. Read [`NEXT_STEPS.md`](NEXT_STEPS.md) before preparing fabrication files.
6. Run `git status -sb` and `git log -3 --oneline` before changing anything.
7. Report any local changes or missing tools before proceeding.

A ready-to-copy conversation starter is available in
[`FRESH_SESSION_PROMPT.md`](FRESH_SESSION_PROMPT.md).

## Repository and design baseline

- Repository: `AloisKyrou/bike_generator`.
- Primary branch at handoff: `main`.
- Reviewed controller-design baseline: commit `aefcb01`
  (`feat(controller): finalize V1 design and sourcing`).
- At handoff creation, local `main` was **8 commits ahead of `origin/main`**.
  A fresh computer will not see those commits until they are pushed.
- KiCad project root:
  `electrical/v1/kicad/bike-generator-controller/`.
- KiCad project file:
  `electrical/v1/kicad/bike-generator-controller/bike-generator-controller.kicad_pro`.
- Toolchain used: KiCad 10.0.6 plus Konnect 0.12.1.

Do not assume the commit count or tool versions are still current. Recheck them
on the new machine.

## Current outcome in one paragraph

Controller V1 is fully routed and electrically coherent for a **12–70 VDC
rectified bus**, with a 400 W peak architecture target but a much more typical
100–150 W operating region and approximately 250 W rider peaks. The schematic
uses the pin-compatible `INA238AIDGSR`, not the unavailable INA228, and the PCB
metadata/BOM match. The last recorded ERC had 0 errors and 0 warnings. The last
saved-file DRC had 0 design-rule violations and 0 unconnected items; its only
four parity messages were intentional board-only mounting holes H1–H4. Thermal
capability at high current is not yet qualified, and fabrication release remains
blocked until the KiCad stackup metadata is aligned to the intended 3 oz copper
and the formal manufacturing package is regenerated and reviewed.

## Canonical documents

| Topic | Source of truth |
|---|---|
| Complete sheet-by-sheet electrical review | [`electrical/v1/docs/V1_SCHEMATIC_REVIEW.md`](../electrical/v1/docs/V1_SCHEMATIC_REVIEW.md) |
| Pre-fabrication decisions | [`electrical/v1/docs/PREFAB_DECISIONS_2026-09-28.md`](../electrical/v1/docs/PREFAB_DECISIONS_2026-09-28.md) |
| PCB order contract and release gate | [`electrical/v1/bom/pcb-order-v1.md`](../electrical/v1/bom/pcb-order-v1.md) |
| Current grouped schematic BOM | [`electrical/v1/bom/controller-v1-current.csv`](../electrical/v1/bom/controller-v1-current.csv) |
| Five-board purchasing BOM | [`electrical/v1/bom/controller-v1-order-5pcs.csv`](../electrical/v1/bom/controller-v1-order-5pcs.csv) |
| Two-supplier sourcing plan | [`electrical/v1/bom/sourcing-plan-v1.md`](../electrical/v1/bom/sourcing-plan-v1.md) |
| Assembly supplies outside the BOM | [`electrical/v1/bom/assembly-supplies-v1.md`](../electrical/v1/bom/assembly-supplies-v1.md) |
| Existing workshop stock | [`electrical/v1/bom/workshop-stock.md`](../electrical/v1/bom/workshop-stock.md) |
| KiCad workflow and troubleshooting | [`electrical/v1/kicad/WORKFLOW.md`](../electrical/v1/kicad/WORKFLOW.md) |
| Connection audit | [`electrical/v1/kicad/CONNECTION_AUDIT.md`](../electrical/v1/kicad/CONNECTION_AUDIT.md) |
| Project net classes and limits | [`electrical/v1/kicad/NETCLASSES.md`](../electrical/v1/kicad/NETCLASSES.md) |
| V2 integrated-controller direction | [`electrical/v2/docs/CONTROLLER_V2_INTEGRATED_SPEC.md`](../electrical/v2/docs/CONTROLLER_V2_INTEGRATED_SPEC.md) |

## Source-of-truth hierarchy

When documents disagree, resolve them in this order:

1. exact manufacturer datasheet and the selected orderable MPN;
2. saved KiCad schematic/PCB plus direct ERC/DRC/connectivity evidence;
3. current exported BOM;
4. the dated V1 review and pre-fabrication decision documents;
5. older audits, roadmaps, prototype notes, screenshots, and conversation memory.

Some older files still use `INA228` because they document the original part or
because the hierarchical sheet deliberately retains the legacy name
`INA228_SENSE`. Do not mass-rename it: that would churn hierarchy paths and net
names without improving the V1 hardware.

## Communication style that worked well

- Lead with the concrete result and evidence.
- Explain electrical trade-offs plainly; the user is learning PCB design but is
  comfortable with detailed engineering reasoning.
- Make safe, reversible progress autonomously.
- Ask only when a decision changes architecture, cost, manufacturer submission,
  or physical assumptions.
- For visual/manual KiCad steps, give exact menu or key instructions and then
  verify the saved file independently.
- Never claim “clean” merely because a GUI looks right; confirm with saved-file
  ERC/DRC and parity evidence.
