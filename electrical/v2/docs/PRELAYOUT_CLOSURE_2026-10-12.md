# Pre-layout closure record

## Component placement method and copper check

See [proposed protocol and geometry evidence](PCB_PLACEMENT_ROUTING_METHOD_2026-10-12.md).
User requires component-by-component placement and top-first routing, evaluating
placement/rotation before bottom signal detours. Fresh BQ footprint check shows
0.20mm inner gap; automatic3oz PCBWay standard-process acceptance is not proven.
Two-layer2oz/1.6mm/ENIG is recommended but awaits agreement; whole-board/current
qualification remains separate. No native change or routing started.

## Latest PCB preparation clarification

12 October2026: user retains the70V-class objective and current components.
The proposed55V retreat is rejected; progressive testing determines supported
combinations and may result in lower qualified limits. No native change.

Mechanical face allocation is settled: Q10-Q13 and bridgeD2 underneath facing
the common heatsink; remaining components above. Exact heatsink deferred as
before. Contact stack, lead forming, insulation and clearance checks implement
this arrangement; they are not a request to decide it again.

User requires at most TWO copper layers. Start from the documented V1 baseline:
FR-4,1.6mm,3oz/105um per face,ENIG. See
`../../v1/bom/pcb-order-v1.md`. Its metadata mismatch (35um/no finish) is
documented, not a freshly checked board state. Copper weight and minimum
fabrication geometry need checking against the V2 BQ footprint before adoption;
do not blindly inherit netclasses or the70x110mm V1 outline. No new price,
manufacturer capability, current capacity or stackup qualification is claimed.

Next sequencing: resolve remaining preparation inputs, jointly agree placement
and routing methodology, then execute. User specifically wants critical
positions planned and bounded, verifiable work to avoid the V1 rework experience.
This discussion does not authorize PCB synchronization, placement or routing.

## Later same-day follow-up

Latest user approval: twelveEEU-FR2A101 retained for the prototype; capacitor
selection CLOSED, ripple/thermal qualification deferred to staged tests.
Known sensitivity failures remain documented. No400W qualification, count or
wiring change; derate the envelope or revise the bank if measured margins fail.

Latest user approval: driver ARCHITECTURE CLOSED for the prototype. Keep
AOY66923 and internal REGN drive, no added supply. VGS/thermal measurements
move to staged prototype qualification; their absence alone must not block
prototype routing. Do not reopen without concrete evidence. Other release
gates and unqualified power/voltage ratings remain unchanged.

Latest scoped power review: [margins and validation split](POWER_STAGE_MARGIN_REVIEW_2026-10-12.md).
Fresh saved-file MCP XML/ERC:145 components/125 nets/eight sheets,768 endpoint
assertions pass and no reported ERC violations. New46-check sampled stress
model retains capacitor ripple concerns even with a hypothetical400W cap;
driver proof and thermal rating remain open. No native/BOM/firmware changes.

User defers the exact heatsink: will source a large plate and adapt/drill M4
mounting later. Continue electrical engineering without a heatsink SKU. PCB
contact stack, AOY lead forming, clamp/insulation access and antenna clearance
still need resolving before layout freeze; cooling rating remains unqualified.

User confirmed the existing103AT-2 on the shared heatsink through J33/R72/R73.
Sensor role is decided; attachment, default JEITA effects and physical thermal
coverage remain qualification work. No new analog watt limiter or fake-TS
control added. See `SHARED_HEATSINK_2026-10-12.md`.

Focused selector review: see the follow-up under "Remaining gates" in
`explanations/per_schematic/05_CC_CONTROL.md`. Saved final AOY XML passes54
CV checks and25 negative fixtures after updating the test for compact slash
typography. The actual70V divider's reset-code target is about15.54V nominal.
Crossing2.7V loses the MCP specified analog envelope, not necessarily its
stored code. No new hardware selected; physical failover proof remains open.

User-approved assembly follow-up: Q10-Q13 now provisionally use AOY66923 THT,
not the pending AONS DFN. A large shared passive heatsink on one face is a
requirement. See [cooling plan](SHARED_HEATSINK_2026-10-12.md) and
[part evidence](../../components/aoy66923/README.md). G/D/S equivalence, endpoint
and fault tests and ERC pass. REGN/VGS, short-lead mechanical fit, clamp and
thermal rating remain open. Earlier "MOSFETs unchanged" statements are historical.

Provisional THT capacitor substitution is implemented, with unchanged wiring
and updated BOM. See [review](THT_CAPACITOR_REVIEW_2026-10-12.md).
It does NOT close the full-current ripple gate: the new bank has less individual
ripple margin. The initial "no substitution" statement below describes the
earlier pass only. MOSFETs remain unchanged pending driver/package acceptance.

[AONS driver follow-up](../../components/aons66923/README.md) now quantifies
bootstrap droop and documents why a larger C65/C66 alone does not establish
guaranteed4.5V gate drive. The original SiR870 has the same minimum-VGS question.
No extra driver supply or frequency change selected. USB host protection,
low-rail selector behavior and optional-cell data remain open as below.

12 October 2026. Engineering follow-up to MAIN_CONVERTER review. Not a layout,
fabrication, battery-charging or energization release. No native design or BOM
substitution in this pass. Preserve the user's direct bootstrap wiring.

## Decisions confirmed in this discussion

- Prioritize passive cooling for the bicycle application. A fan may be considered
  later for sustained generic-converter use; no fan supply or fan added now.
  Shorter expected riding effort does not establish a safe continuous rating.
- Retain both independent mechanical trimmers and useful low-voltage current.
  User now accepts that turning both fully up can be outside specification.
  This supersedes the earlier requirement that every knob combination be
  board-safe. Do not add an analog 400 W limiter or reduce all output current
  by default. Manual operating envelope and thermal qualification remain needed.
- Some receiver profiles may require the ESP powered by USB or the optional
  cell to initialize the BQ. Preserve standalone operation where qualified,
  including the aspiration to omit the ESP; do not promise a universal
  autonomous bench supply or assume every station fails without the ESP.
- User accepts that JP20 may need opening for PC service, CONDITIONAL on not
  damaging the USB host. This is not acceptance of host-damage risk or proof
  that the current circuit meets that condition. Keep this protection gate open.
- Preserve USB flashing, bidirectional serial and native JTAG debug. Physical
  UART pins are a different interface: GPIO20 is CV_AUTO_N and GPIO21 is LED;
  an application UART could be assigned to two configurable J5 GPIOs.

## Closure ledger

| Item | Status | Specific next action / acceptance |
|---|---|---|
| Current saved connectivity | Checked | Fresh XML equivalent to user-bootstrap checkpoint; ERC zero; 760 power assertions and reset regression pass |
| USB service wiring | Checked, physical test pending | Dedicated test covers both connector orientations, USBLC6 pin paths, series resistors, GPIO18/19 and recovery header; prove flash/serial/JTAG on prototype |
| REGN and MOSFET drivers | Prototype decision closed, qualification pending | Retain AOY/internal REGN; preserve measurement/rework access; characterize gate drive and heat on prototype, reopen only for concrete evidence |
| Manual combined-power policy | Decision closed, rating open | No hardware constant-power addition now; publish supported V/I/time/temperature combinations after qualification |
| Autonomous receiver scope | Decision closed, profiles open | ESP initialization allowed where needed; test station cold-start and reset separately from direct-battery charging |
| Selector low-rail failover | Open engineering | Establish Q21 inhibit before MCP leaves its specified region, including supply collapse and relay timing; do not re-open accepted relay architecture |
| USB host protection and charge budget | Open engineering | JP20 is not an automatic current limiter; qualify host-off/data injection, normal overload and shared-ground faults separately |
| Optional logic cell | Open data | Exact protected 4.2 V cell, polarity, permitted charge current/temperature; keep JP20 open until qualified |
| Fuse / transient policy | Retain accepted baseline | One onboard F1 at rectified raw; energy-rich source and receiver require appropriate source-adjacent protection; TVS is not a voltage ceiling |
| Thermal sensor roles | Decision closed, qualification open | Existing103AT-2/J33 monitors common heatsink; verify attachment, thermal delay and JEITA behavior; no receiver-battery sensing or guaranteed400W cap |
| High-end telemetry | New documented limitation | BQ voltage ADC published range ends at 65.534 V; do not use an out-of-range value as accurate feedback/power telemetry |
| Mechanical / PCB inputs | Before layout freeze | Exact heatsink deferred for user-adapted plate; establish envelope, connectors, antenna keepout, contact heights, clamp clearances and stackup; no board dimensions selected here |
| Switching/ripple/stability | Layout and bench gates | Design short loops/Kelvin paths; retain provisions to measure VGS, switch excursions, ripple sharing, temperatures and startup |
| Twelve THT bulk capacitors | Prototype decision closed, qualification pending | Keep EEU-FR2A101 and local ceramics; verify per-can ripple/heat and bank stability; restrict operation or revise if margins fail |

## Two knobs and 400 W

The current control is constant current / constant voltage, not constant power.
At nominal default reference, the existing static model gives approximately
66.88 V and 9.107 A, or 609 W if source and receiver allow it. Retained BQ trim
and tolerances change that number. It is not a demonstrated power capability.

To impose 400 W, current must follow `min(I_manual, 400 / V_actual)`:

| Output | Ideal current ceiling, before tolerances/thermal derating |
|---|---:|
| 12 V | 9.11 A hardware nominal, about 109 W |
| 24 V | 9.11 A, about 219 W |
| 36 V | 9.11 A, about 328 W |
| 48 V | 8.33 A |
| 55 V | 7.27 A |
| 67 V | 5.97 A |

Ordinary independent trimmers do not implement this inverse law. An analog
voltage-dependent current-limit network could approximate an envelope, but
requires extra circuitry and analysis of ICHG loading, startup and faults.
The ESP can implement a profiled limit with existing I2C; this is not an
independent hardware guarantee and is not implemented firmware in this task.
Do not rely on software being able to request zero: use the specified minimum
current range and a separately defined conversion-disable state.

## Autonomous station startup

A station's external input is an electronic load, not direct access to its
cells. If it starts drawing while the BQ is still in low-current precharge,
the output can collapse and retry. This is a circuit inference, not an AC50S
measurement or proof of incompatibility. With a 24 V target, the transition
is around 16-17.1 V according to two contradictory defaults in TI's document.

TI SLUSEN5A table 6-3 says 66.7%, while REG0x14 bits 2:1 POR=0x3 specify
71.4%. Do not silently choose one as proven silicon behavior. Read/configure
the register explicitly and verify cold-reset behavior on the actual device.
The published options to disable precharge, termination and charge timer
permit a profile study; do not disable battery safeguards globally.

## REGN candidates, not substitutions

Follow-up user confirmation: proceed with AONS66923 as the preferred Q10-Q13
direction, without a dedicated driver rail for now. Electrical/bootstrap and
footprint acceptance still precede native substitution. The cost dashboard
records this projection separately from the saved schematic BOM. No purchase
approval or claim of completed thermal qualification.

At 70 V / 288 kHz, the two-gate-equivalent screen using Qg at 4.5 V gives:

| Candidate | Rds max at 4.5 V | Qg at 4.5 V | REGN screen | Package |
|---|---:|---:|---:|---|
| Current SIR870ADP | 10.5 mOhm | 38 nC max | 1.423 W | PowerPAK SO8 |
| AONS66923 | 14.8 mOhm | 18 nC max | 0.674 W | DFN5x6 |
| AOSP66923 | 15 mOhm | 18 nC max | 0.674 W | Leaded SO8, poorer thermal path |
| DMT10H009LPS | 12.5 mOhm | 20.2 nC typical only | 0.756 W typical | PowerDI5060-8 |

AONS is the best candidate to investigate, not a drop-in approved part. Its
two-FET conduction screen at 15 A rises from 4.725 W to 6.66 W at room
temperature. Qg max at actual 5.2 V drive is not provided; its 35 nC max at
10 V gives a conservative 1.310 W screen, not closure. Bootstrap diode/drop,
refresh and VGS/Rds margins must be assessed. Reducing output watts does not
proportionally reduce this gate-drive loss.

Observed distributor prices, 12 October, before tax/delivery: AONS EUR2.05
at one /1.317 at ten, 10,532 in stock; AOSP EUR1.49 /0.946, 7,440 in stock;
Diodes US listing USD1.69 /1.069, 8,425 in stock. These are research entries,
not BOM savings or a purchase authorization. Recheck before purchase.

Reducing switching frequency to 200 kHz is not free: with unchanged L3 the
ripple increases 25%. Extrapolating the 250 kHz frequency tolerance to 200 kHz
is an assumption, not a manufacturer guarantee. No frequency change selected.

## USB, current and host protection

TP4057 current adds to system current. Example with 170 mA ESP demand, nominal
46 mA relay, provisional 10 mA other logic and 5 mA VBUS bleeder: approximately
631 mA with 400 mA charging, 231 mA with JP20 open. A 350 mA ESP scenario
raises those to 811/411 mA. These are scenarios, not total-current bounds or
source authorization. A current-limited host may drop VBUS or disconnect;
its behavior cannot be guaranteed for every PC.

R46 reduction of charging current is a possible zero-extra-component compromise,
not selected. Manufacturer data for 10k gives 100 mA nominal (85-115 mA at
the stated test condition); do not substitute the formula from a TP4056.
It still does not establish enumeration, suspend, inrush or host protection.
RT9080 and TP4057 thermal regulation are not an input-current allocator.

USB serial is CDC-ACM, not a USB-to-UART bridge. JTAG shares the native USB
interface, without extra JTAG probe hardware. Recovery uses GPIO9/RESET;
firmware must not repurpose GPIO18/19 or enter incompatible sleep during
service. Drivers/tools and actual PCB behavior remain to be validated.

## ADC range above 65 V

TI specifies VAC_ADC and VBAT_ADC only up to 65.534 V (2 mV steps). A 70 V
conversion rating does not extend this published telemetry range. The register
description also mixes unsigned wording with two's-complement format wording;
do not invent behavior above range. Firmware must identify invalid/rail readings.

Keep the BQ-only telemetry decision: do not restore INA automatically. A
conservative known voltage upper bound could support a derated power ceiling
at the top of the range; that is an engineering proposal requiring error
margins and does not provide an accurate voltage display. Otherwise restrict
that profile until characterized. VFB/divider inference is not an independent
measurement and needs calibration, selector-state knowledge and valid rails.

## Evidence and sources

- Fresh saved-file XML/ERC: `../kicad/exports/review-prelayout-2026-10-12/`.
- Fresh runs pass: 760 power endpoint assertions, MCU reset regression,
  118 USB service assertions and five deliberately broken USB XML fixtures.
  Full XML equivalence confirms 145 components /125 nets /eight sheets /
  33 library parts unchanged from the user's bootstrap checkpoint. ERC has
  zero reported violations under unchanged inherited ignored categories;
  it is not an all-rules or physical-protection certificate.
- Arithmetic: `calculations/prelayout-closure-screen.mjs`. Tests of equations,
  not evidence of real component timing, thermal safety or USB compliance.
- [TI BQ25756](https://www.ti.com/lit/ds/symlink/bq25756.pdf), SLUSEN5A,
  sections 5.5, 6.3.3, 6.3.4 and REG0x14/ADC register descriptions.
- [AONS66923](https://www.aosmd.com/sites/default/files/res/datasheets/AONS66923.pdf),
  [DigiKey FR](https://www.digikey.fr/en/products/detail/alpha-omega-semiconductor-inc/AONS66923/9974883).
- [AOSP66923](https://www.aosmd.com/sites/default/files/res/datasheets/AOSP66923.pdf),
  [DigiKey FR](https://www.digikey.fr/en/products/detail/alpha-omega-semiconductor-inc/AOSP66923/9974898).
- [DMT10H009LPS](https://www.diodes.com/datasheet/download/DMT10H009LPS.pdf),
  [DigiKey US](https://www.digikey.com/en/products/detail/diodes-incorporated/DMT10H009LPS-13/10295342).
- [TP4057 REV2.2](https://www.toppwr.com/uploadfile/file/20240913/66e3cef054ad8.pdf),
  [RT9080](https://www.richtek.com/assets/product_file/RT9080/DS9080-09.pdf).
- [ESP module](https://www.espressif.com/sites/default/files/documentation/esp32-c3-mini-1_datasheet_en.pdf),
  [native USB service](https://docs.espressif.com/projects/esp-idf/en/stable/esp32c3/api-guides/usb-serial-jtag-console.html).

Verdict: pre-layout closure INCOMPLETE. Native connectivity checks are not a
replacement for the open driver, low-rail and host-protection engineering.
