# V2 working instructions

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
