# V2 power-stage uprate study, 8 October 2026

Engineering selection evidence, not a manufacturing or energization release.
No hardware tests were performed. The sole schematic owner accepts physical
models and records actual saved substitutions separately. This study supersedes
the old 1 A input study as a design objective, not as permission to energize.

## Scope and operating envelope

Target approximately 15 A input, 10 A output and 400 W output where the voltage
pair permits it. Current, voltage, power and thermal limits must all apply.
400 W is the normal application ambition, not an autonomous analog power clamp.
The two manual knobs can request approximately 500 W near 53 V output; qualify
that bounded V/I corner too. It is not necessarily the maximum-loss corner:
high boost ratio has higher input/inductor current and output-capacitor ripple.

At 90% illustrative conversion efficiency and 13.605 A nominal input limit,
12/24/36/48 V inputs support at most 147/294/441/588 W before the separate
output-current and application limits. These are power-balance examples, not
measured efficiency. Approximately 400 W output requires at least 32.7 V input
under this assumption. A 12 V receiver remains limited to about 109 W at the
9.11 A nominal output-current ceiling, not 400 W.

## Input shunt and limit recommendation

Use R1 `CSS4J-4026K-5L00F`, 5 mOhm, 1%, four-terminal Bourns CSS4J, and remove
the redundant 1 W R74. Preserve force/sense separation and route ACP/ACN as a
Kelvin pair. Saved orientation must be verified by the owner: force pad 4 and
sense pad 3 upstream; force pad 1 and sense pad 2 downstream.

Manufacturer [CSS4J datasheet](https://www.bourns.com/docs/product-datasheets/css4j-4026.pdf)
is archived at `../current-shunt/bourns-css4j-4026.pdf`. The current table gives
5 mOhm **4 W at 70 C terminal**, not the 2 mOhm variant's 6 W. Distributor
metadata still says 3 W; use a conservative 3 W thermal screening budget until
the ordered lot and specification are reconciled. Component TCR is 75 ppm/C,
not the resistance-alloy-only 50 ppm/C. The 5 mOhm height differs; same family
does not replace the owner's exact physical check.

[DigiKey exact part](https://www.digikey.com/en/products/detail/bourns-inc/CSS4J-4026K-5L00F/6229301)
was freshly observed with 4,462 units, USD 2.41 at one and 1.604 at ten.
Prices exclude shipping/taxes and are observations, not quotations.

5 mOhm preserves BQ input regulation's 400 mA minimum / 50 mA step. Reusing
the old 2 mOhm part instead would give 1 A minimum / 125 mA step, less useful
for gentle resistance. At 15 A, nominal shunt loss is 1.125 W versus 0.45 W
for 2 mOhm. This is a deliberate control-resolution/heat tradeoff.

Proposed R62 = 1.47 kOhm, 1%, 100 ppm/C or better. BQ input-limit gain at
5 mOhm is 20 A*kOhm nominal, scaled from the datasheet's 50 A*kOhm at 2 mOhm.
Nominal ceiling: 20/1.47 = 13.605 A. Initial worst high corner uses 20.8 gain,
R62 -1%, shunt -1%: 20.8/(1.47*0.99*0.99) = 14.437 A. Including independent
negative 100 ppm/C resistor and 75 ppm/C shunt drift over a conservative
130 C change gives 14.771 A. This covers initial tolerance/TCR only, not
aging, layout error, transients, or software disabling the pin limit.
Exact resistor candidate `RC0805FR-071K47L` uses the existing Yageo RC0805
family model. Arithmetic is reproducible with `node power-stage/uprate-screen.mjs`.

## Output shunt

R75's existing `WSL25125L000FEA`, 5 mOhm, 1 W, dissipates approximately 0.5 W
at 10 A. Unlike the old 15 A input application, it does not exceed nameplate
power, but PCB and hot-temperature derating remain necessary.

Possible headroom upgrade: `WSLP25125L000FEA`, 5 mOhm, 1%, 3 W at 70 C,
110 ppm/C, official [Vishay 30122](https://www.vishay.com/docs/30122/wslp.pdf)
archived in `power-stage/vishay-wslp.pdf`. Exact value-dependent lands require
owner acceptance before substitution; sharing the 2512 name is insufficient.
[DigiKey FR](https://www.digikey.fr/en/products/detail/vishay-dale/WSLP25125L000FEA/9758421)
freshly showed 4,156 stock, EUR 1.80 single / 1.227 at ten, cut tape.
Its load-life tolerance is not silently included in the initial current guard.

## Inductor and switch stress

Existing `IHLP6767GZER100M01`: 10 uH +/-20%, 12 mOhm maximum DCR at 25 C,
typical 16.5 A heating current for 40 C rise and typical 25 A saturation at
20% inductance loss. See archived `power-stage/ihlp-6767gz-01.pdf`.
At 55 V bus, half-ratio boost, L=8 uH and f=212 kHz, triangular ripple is
8.11 A peak-to-peak. At 14.771 A average the peak is 18.82 A and RMS 14.96 A;
25 C copper loss alone is approximately 2.68 W. Hot DCR, DC-bias loss of L,
core loss, airflow and PCB heat coupling remain qualification items.

Existing `SIR680LDP-T1-RE3` has guaranteed 3.55 mOhm maximum at 4.5 V/25 C.
Two conducting devices at 15 A imply 1.60 W resistive loss before hot Rds(on),
inductor ripple, duty sharing and switching loss. Qg at 4.5 V is 40.5 nC
typical / 62 nC maximum under the specified 40 V/20 A test condition.

Gate-drive screening must include buck-boost transition. BQ datasheet section
6.3.3.3 and Table 6-1 describe interleaved SW1/SW2 pulses: all four gates switch,
but each pair operates at half the effective switching rate. Approximately
two full-rate gate-charge equivalents therefore give 31 mA / 1.55 W REGN loss
at 55 V and 250 kHz, rising to 1.79 W at the oscillator's 288 kHz maximum.
The previous four-full-rate calculation, 62 mA / 3.1 W, is a pessimistic screen,
not the predicted transition dissipation. More importantly, the 62 nC maximum
is specified at 4.5 V, not the actual REGN upper tolerance of 5.2 V: these
numbers are not a guaranteed worst-case gate-current bound. BQ figure 6-2's
REGN safe-operating plot assumes 1 W dissipation. PCB cooling, actual gate
charge, converter mode and BQ junction temperature remain release gates.
Reducing frequency to 200 kHz reduces nominal gate loss by 20% but increases
inductor/capacitor ripple by 25%; retain 250 kHz for this prototype selection.

[TI engineering support](https://e2e.ti.com/support/power-management-group/power-management/f/power-management-forum/1605301/bq25756-inquiry-about-inductor-overheating-and-switching-waveforms-in-bq25756)
confirms the interleaving and recommends balanced capacitance on both sides
of each shunt. It also identifies L/DCR < 1.26 uH/mOhm for internal sensing.
Checking this with maximum DCR is not conservative: high inductance and cold,
low DCR must be checked. The inductor's guaranteed minimum DCR is not supplied
here; cold-start/switching-waveform qualification remains necessary.

Lower-charge `SIR880BDP-T1-RE3` was screened: Qg 19.5/30 nC typical/maximum
at 4.5 V and Rds(on) 8 mOhm maximum at 4.5 V. It trades lower BQ heating for
approximately 3.6 W two-device conduction loss at 15 A/25 C. Both DigiKey and
Mouser freshly showed zero stock, so retain SIR680 rather than substitute an
unavailable part. Archived `power-stage/sir880bdp.pdf` is Vishay 63031 revision
18 January 2021; its 4.5 V Qg bound likewise is not a 5.2 V guarantee.
TI's archived June 2025 `ti-mosfet-selection-sluaax9.pdf` compares these devices
with external 10 V gate drive; those efficiency results are not measurements
of this board's 5 V REGN drive.

The 100 V `SIR870ADP-T1-RE3` comparator reduces gate charge (25.2/38 nC) but
raises 4.5 V Rds(on) to 10.5 mOhm, around 4.73 W for two devices at 15 A/25 C.
It is not an automatic improvement. Neither 80 V nor 100 V FET ratings prove
the generator load-dump/clamping solution.

## Capacitor bank

Two existing `80SXV56M` per rail provide 112 uF nominal, 89.6 uF initially
at -20%. Each allows 3.1 A RMS at 100 kHz through 105 C, falling to 0.98 A
above 105 C through 125 C. A two-part 6.2 A sum cannot automatically support
the high-current half-ratio boost corner: ideal output-capacitor RMS reaches
Iin/2, approximately 7.39 A at the high input-limit corner, before triangular
inductor ripple. Do not credit ceramic current sharing without an impedance
and layout calculation or measurement. Likewise do not count an input bulk
capacitor isolated by a long trace/shunt as a local switching-loop capacitor.

Fresh pages must override stale search snippets: `80SXV56M` and cheap KEMET
`A768MS566M1KLAE034` returned zero stock at DigiKey on this study date.

Stocked comparator `B40950A0566M000` from TDK: 80 V, 56 uF, 1.7 A RMS at
100 kHz, 33 mOhm, 10,000 h at 105 C. Five in parallel sum to 8.5 A and
280 uF before sharing/tolerance qualification. This costs more PCB area but
less than three scarce Panasonic parts at observed quantity-ten prices.
[TDK datasheet](https://product.tdk.com/system/files/dam/doc/product/capacitor/aluminum-electrolytic/hybrid-polymer/data_sheet/20/30/db/aec/b40950.pdf).
[DigiKey FR](https://www.digikey.fr/en/products/detail/tdk/B40950A0566M000/21671578)
showed 14,139 stock, EUR 1.93 single / 1.269 at ten. Parent approved four input
and six output parts for owner implementation, subject to standard-footprint
physical acceptance and the remaining qualification gates. Input bank is
224 uF / 6.8 A nameplate; output bank is 336 uF / 10.2 A nameplate. At the
screening half-ratio corner, including triangular ripple gives output-capacitor
RMS 7.569 A, and input-capacitor RMS 5.267 A for 10 A output buck operation.
These are ideal CCM calculations, not measured branch sharing. Place two input
parts on each side of the input shunt, four output parts on the switching side
and two on the receiver side. An equal-33-mOhm-ESR screen including the 5 mOhm
shunt predicts 1.37 A per local output capacitor and 1.49 A per local input
capacitor. Five output parts split three/two would predict 1.67 A per local
part, barely below 1.7 A before ESR spread and layout. This is the reason for
the sixth output part. ESR minimum/spread, trace inductance, heating, switching
mode, endurance and actual ripple still require validation; summed ratings
alone are not qualification. Capacitance changes require stability, internal
loop auto-tuning, startup and inrush validation, not an assumed external COMP
resistor change.

Official PDF successfully archived as `power-stage/tdk-b40950.pdf`, October
2025, SHA256 `961CB0A712ED82B08E37C9AEA0A31EF2039CF7F7BB3FA21CEFA64430EBC34873`.
Download used the manufacturer's alternate host after its main host returned
403: [TDK mirror](https://www.tdk-electronics.tdk.com.cn/inf/20/30/db/aec/b40950.pdf).
Page 4 shows standard design and lands, page 9 confirms exact 80 V A0566 rating
at **105 C ambient**. It must not operate above 105 C. The newer C0107 100 uF
4 A variant is not substituted: its fresh DigiKey page showed zero stock,
400 expected on 26 October, while Mouser required factory reels.

Owner inspection found manufacturer lands 4.1 x 2.0 mm at +/-4.35 mm versus
installed `CP_Elec_10x10.5` lands 4.4 x 2.5 mm at +/-4.2 mm. Both have 12.8 mm
outer span and the 10.3 mm body fits. TDK permits a different layout after
mounting evaluation. This standard footprint is consequently a prototype
candidate with mounting/stencil qualification, not an exact-recommended-land
claim or automatic assembly approval.

Existing TDK 10 uF/100 V ceramics `C3225X7R2A106K250AC` remain sourcing-gated
at DigiKey. Other authorized distributors list them, but small-quantity stock
was not freshly confirmed here. Retain the exact part pending procurement
recheck rather than silently substituting a different DC-bias characteristic.

### Compensation and stability gate

BQ25756 SLUSEN5A section 6.3.3.3 integrates compensation and uses approximately
40 ms of startup switching to determine its values. There is no external COMP
RC network in this design. Table 7-4's R1/C1/gm1 are internal control parameters,
not the board's shunt R1. Its recommended minimum input and output capacitance
is 80 uF after derating. The selected bulk banks alone supply initially at
least 179.2 uF input and 268.8 uF output at -20%, before ceramic contribution.
That minimum check is necessary but not sufficient for stability.

Section 7.2.1.2.9 also requires boost unity-gain bandwidth around no more than
one third of the right-half-plane zero. The internal parameters depend on
output voltage and EN_CONV_FAST_TRANSIENT; do not enable fast-transient mode
without evaluating its larger capacitance requirements. Validate startup
auto-tuning, cold/hot component tolerances, split-bank impedance across both
shunts, buck/boost transition, input-current steps, output-current steps,
CV/CC transitions and receiver input behavior. The 336 uF output bank's ripple
capacity does not establish loop stability or authorize an arbitrary battery
or MPPT receiver. No external compensation resistor change was proposed.

## USB diode selection

Parent accepts D20 `SS1H10-E3/61T` plus R51 changed from 10 kOhm to 1 kOhm,
subject to owner's SMA physical acceptance. This retains the Beetle topology.
Manufacturer PDF `../beetle-power-v2/ss1h9-ss1h10.pdf`, revision 13 November
2025, specifies maximum reverse leakage 1 uA at 25 C and 0.5 mA at 125 C
under rated reverse-voltage conditions. The latter gives approximately 0.5 V
on the unplugged VBUS/PMOS gate with 1 kOhm; include resistor tolerance and
other leakage paths in the test. This does not prove zero reverse current.
The pulldown adds 5 mA from a 5 V USB source, around 25 mW resistor loss.

Maximum forward drop is 0.77 V at 1 A/25 C. RT9080 maximum dropout is 0.53 V
at 600 mA/25 C. Thus 4.75 V board-input USB has headroom in that screen,
whereas 4.4 V cannot guarantee exactly 3.3 V at the full 600 mA corner.
Test low USB voltage, actual ESP radio peaks, battery switchover and hot
unplugged VBUS. Typical curves are not a worst-case rail guarantee.

SS14 was rejected as the default candidate because its 6 mA hot reverse
leakage bound provides a much weaker PMOS-gate bound. PMEG4010CEJ offers lower
forward drop but a smaller SOD323F package and no guaranteed hot leakage value
in its electrical table; it was not selected as an unqualified improvement.
[Fresh DigiKey FR SS1H10 listing](https://www.digikey.fr/en/products/detail/vishay-general-semiconductor-diodes-division/SS1H10-E3-61T/1091541)
showed 26,707 stock, EUR 0.53 single / 0.327 at ten.

## Bridge, TVS and power terminals

The archived Diotec DBI25 family PDF, revision 18 August 2026, specifies only
4 A free-standing at 50 C with its lead-temperature condition. The 25 A
rating requires a heatsink and case temperature of 115 C. Two diode drops
give roughly 25..32 W at 13.6..15 A depending on waveform/temperature, not a
small PCB heat source. The 1.05 V maximum is specified at 12.5 A per diode,
not a guaranteed 15 A bound. A DC-motor variant omitting the bridge avoids
this loss. BQ die-temperature protection does not sense bridge temperature.

D1 `SMCJ70A` is not accepted protection for a 55 V working power stage.
The [Vishay SMCJ table](https://www.vishay.com/docs/88394/smcj.pdf) gives 70A
breakdown 77.8..86 V and clamp 113 V; 58A clamp 93.6 V; 54A clamp 87.1 V.
Those clamp maxima exceed the 80 V FET or 85 V BQ absolute limits. 48A clamp
77.4 V is lower but its 48 V working standoff conflicts with normal 55 V use.
Clamping voltage also depends on current/temperature and pulse energy.
No simple TVS swap proves arbitrary generator-overspeed protection. Require
an externally voltage-limited/current-limited DC source for initial tests;
generator operation needs separately qualified load-rejection/clamp/disconnect
behavior. The manual output-voltage endstop is unrelated to input protection.

The existing Phoenix `1711725` MKDS 3/2-5.08 family is a reasonable candidate
for main power screw terminals, subject to exact saved footprint acceptance.
The [current manufacturer page](https://www.phoenixcontact.com/en-pc/products/pcb-terminal-block-mkds-3-2-508-1711725)
states 24 A nominal IEC rating but different UL/CSA ratings (15/10 A under
their conditions). Do not label 24 A universal. Torque, wire gauge, PCB copper,
support during tightening and temperature derating matter. Main commissioning
links must not use ordinary 2.54 mm signal-header jumpers at 15 A; leaving the
links open pending a selected current-rated connector is preferable to a
misleading footprint. No high-current terminal substitution is made by this
study.

Fresh [DigiKey FR terminal listing](https://www.digikey.fr/en/products/detail/phoenix-contact/1711725/260395)
showed 5,701 stock, EUR 1.59 single / 1.306 at ten. Manufacturer body is
10.16 x 11.2 mm, installed height 18 mm, 5.08 mm pitch, 0.9 mm square pins and
1.3 mm recommended holes; tightening torque is 0.5..0.6 Nm. Owner checks the
exact installed model. A rated wire loop through two screw terminals is a
possible removable commissioning link; an ordinary signal shunt is not.

### Future input disconnect, not selected

`LM5069MM-1/NOPB` was screened as a potential overvoltage-disconnect controller,
not placed. [TI datasheet](https://www.ti.com/lit/ds/symlink/lm5069.pdf), archived
`power-stage/ti-lm5069.pdf`, revision G January 2020, specifies 9..80 V operation
and 100 V absolute maximum under its restricted transient/disabled conditions.
It needs a pass MOSFET with verified SOA, current shunt, timer, PWR resistor,
UV/OV divider and decoupling. OVLO threshold is 2.4..2.6 V, typical delay 11 us,
with 2 mA gate discharge; threshold tolerance, gate charge and overshoot prevent
claiming an exact 55 V clamp. It loses the BQ's sub-9-V operating range.
Its power limit controls pass-FET dissipation, not receiver output watts.
A single pass FET is not reverse-current isolation, and the circuit does not
absorb arbitrary generator overspeed energy. Upstream voltage still needs a
bounded envelope. No rushed replacement of the TVS with this circuit is made.

[DigiKey FR](https://www.digikey.fr/en/products/detail/texas-instruments/LM5069MM-1-NOPB/1200192)
showed zero stock, 1,000 expected January 2027, EUR 4.37 single / 3.33 at ten.
MMX reel variant also showed zero stock. Rough additional BOM of EUR 7..12
including pass parts is an engineering budget, not a qualified supplier quote.

## Temperature and autonomous operation

BQ TS can monitor a remote power-stage NTC with its REGN-biased divider and
no independent controller. Datasheet 6.3.4.6 provides autonomous suspension
outside T1/T5 and JEITA current/voltage changes inside warm/cool regions.
The default battery-temperature 0..60 C network should not silently be used
as a heatsink-temperature network. Calculate appropriate thresholds, sensor
tolerance, attachment thermal lag and open/short behavior. Once TS monitors
the power stage it does not measure receiver battery temperature. EN_TS is
software-disableable; host policy must preserve it. A sensor at one location
does not establish safe temperatures for every bridge, shunt, inductor and FET.

The existing saved completion checkpoint already implements an external NTC
interface: J33 is labelled `10k NTC - REQUIRED`, R72 is 5.23 kOhm from REGN
to TS, R73 is 30.1 kOhm from TS to ground, and J33 connects TS/ground. It is
not a fixed in-window TS bias. With no NTC attached, the approximately 85.2%
REGN level inhibits charging. Owner must preserve this required-sensor intent.

The corresponding TI reference is a 103AT-2 10 kOhm NTC, RT1 = 5.24 kOhm
from REGN to TS and RT2 = 30.31 kOhm from TS to ground, with NTC in parallel
with RT2. Nominal sensor-open TS is 85.3% of REGN and sensor-short TS is zero,
both outside the allowed window. This is the datasheet's approximately 0..60 C
battery window, not a selected power-stage window. Using it unchanged as a
heatsink monitor would stop cold outdoor operation and apply JEITA voltage
reduction at approximately 45 C even before the high-temperature stop. Do not
silently repurpose those behaviors as a qualified heatsink controller. Sensor
placement and threshold policy remain undecided. Do not replace the required
NTC with a fixed in-window resistor and then claim external thermal protection.

## Remaining release gates

Both manual end stops must be screened together across input/output ratios,
including the approximately 500 W near-unity corner. Application 400 W
limiting is not an autonomous hardware cap. Design adequate current/cooling
headroom instead of silently reducing the output knob to about 6.5 A.
Main voltage-clamp/load-dump behavior, bridge heat sinking, output disconnect
and receiver protection, current-rated connectors, PCB copper/loop placement,
loop stability, startup and USB-ground interactions remain unqualified.

## Archived source integrity

Additional official PDFs downloaded for this study, SHA256:

- `power-stage/sir880bdp.pdf`: `C6AFCA1BDDB646DD5CE62777DBA4A21704646ED7454324815C24995E949EF6B4`
- `power-stage/ti-mosfet-selection-sluaax9.pdf`: `484DACE97C4F85FF6E59945DA046C4D7D843D4A531B16C379B0D044A84967F63`
- `power-stage/ti-lm5069.pdf`: `D60D8106A6E8113900FF8B9576DD959942FA7169742BAF0BEEB30684D4D64681`

Stock/price observations are dated 8 October 2026 and must be rechecked before
procurement. Arithmetic tests passed on that date. They are not simulation,
hardware tests, physical-model acceptance, or permission to energize.
