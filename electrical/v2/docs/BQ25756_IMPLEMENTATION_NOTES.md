# BQ25756 implementation notes

Updated 8 October 2026. Engineering work for the selected controller and 55 V normal
input/output envelope. **No main-stage circuit is qualified by these notes.**
The [overall BOM](../bom/README.md) carries the missing circuitry explicitly.

## Next validation pass: design first, hardware second

Following the Beetle logic-power simplification, the main converter is the next
priority. The saved main stage is still a fixed-setpoint study. Checking that
drawing cannot establish the missing adaptive behavior of the full first PCB.

| Order | Work to close | Acceptance evidence |
|---|---|---|
| 1 | Wide CV selection, useful low-current control and receiver profiles | Complete setpoint circuit; error budget including attached-battery and power-off states; no dependence on an assumed wide-range I2C voltage register |
| 2 | ESP reset/loss, watchdog, receiver disconnect and overvoltage handling | Default-off behavior supplied independently of the dead ESP rail; protection analysis covering BQ register overrides and generator open-circuit voltage |
| 3 | MOSFETs, gate drive, inductor, shunts and capacitor banks | Operating-corner calculations including tolerances, losses and sourcing; exact candidate ratings and complete BOM rather than EVM headline limits |
| 4 | ESP interface and schematic integration | Verified bus/power domains, control and fault connections, fresh hierarchy ERC and endpoint checks; readable local wiring |
| 5 | Physical validation on the full-function first PCB | Staged current-limited bring-up, buck/boost/transition and load-step measurements, thermal limits, fault tests and qualified receiver profiles |

Steps 1 and 2 interact and should be designed together. BQ25756 remains
selected; no different controller, extra logic AUX, internal dump or separate
reduced-function prototype is authorized by this validation pass. The 55 V
ceiling is retained, while lower operating voltage and continuous current/power
ratings remain to be qualified.

## Current and magnetics

The provisional 15 A input / 10 A output / 400 W input limits are independent.
At an assumed 90% converter efficiency:

`Pout = min(0.90 * 400 W, 0.90 * Vin * 15 A, Vout * 10 A)`.

This is power at the converter terminals, after rectifier/wiring losses. It is
not rider mechanical power, a measured efficiency, or a continuous rating.
Receiver acceptance can reduce power further. The generator-powered logic AUX
branch was abandoned on 7 October; controller gate-drive and sensing losses
still belong in the power balance.

[Reproducible calculation](calculations/power-envelope.mjs) and
[result table](calculations/power-envelope.csv) cover representative pairings.
The script checks all 8,281 half-volt pairs from 10 to 55 V against the limits.
Ten volts is a modelling boundary, not a new guaranteed startup specification.

TI's EVM uses a 10 uH IHLP6767GZER100M01 inductor. Its nameplate current is not
enough to qualify our 15 A-input boost corners. Away from transition, a first
ideal CCM ripple estimate is:

`Delta_IL = Vlow * (1 - Vlow/Vhigh) / (L * fsw)`.

At 250 kHz and 10 uH, the largest ideal ripple in the 55 V envelope is 5.5 A
peak-to-peak (27.5 V / 55 V). At 12 -> 54.6 V, a 15 A average input means roughly
16.9 A inductor peak. With an illustrative 6.4 uH effective inductance, that
becomes about 17.9 A. The 6.4 uH case is sensitivity, not a measured part bound.
Check saturation curves, temperature rise, tolerance, DC bias, current-limit
tolerance and controller transition timing before choosing an inductor.
The script uses max(Iin,Iout) as a conservative first DC-current estimate;
it does not model four-switch transition or startup/short-circuit waveforms.

8 October refinement: the 133 kohm frequency setting has a specified
212 / 250 / 288 kHz minimum / typical / maximum in SLUSEN5A. The calculation
now includes **212 kHz**, as well as nominal frequency, and includes the
27.5 -> 55 V capacitor-screening corner. Over the 8,281-point grid, the largest
estimated inductor peak is 17.75 A at nominal 10 uH / 250 kHz, at 26.5 -> 55 V.
The same corner reaches **20.06 A** with illustrative 6.4 uH / 212 kHz.
These are analytical grid maxima, not guaranteed upper bounds or evidence that
a particular inductor is acceptable. The 6.4 uH assumption is still not a
manufacturer-guaranteed hot/bias value; frequency-resistor tolerance,
current-limit error, startup and fault peaks remain excluded. This reinforces
why a nominal "15 A inductor" label is insufficient for the proposed envelope.
[TI electrical characteristics](https://www.ti.com/lit/ds/symlink/bq25756.pdf),
switching-frequency table and application design equations.

An input 2 mOhm shunt dissipates 0.45 W at 15 A; 5 mOhm dissipates 1.125 W.
A 5 mOhm output shunt dissipates 0.50 W at 10 A. These are I-squared-R losses,
before tolerance, overload and thermal derating. The inherited 2 mOhm INA238
shunt cannot simply replace BQ's specified 5 mOhm battery shunt.

## Bulk capacitor screening

The reference 80SXV56M is 56 uF +/-20%, 80 V, ESR 28 mOhm maximum.
Its 100 kHz ripple rating is 3.1 A at up to 105 C, falling to 0.98 A above
105 C through 125 C. Two parallel parts provide 112 uF nominal / 89.6 uF
at initial negative tolerance, but only an ideal equally shared 6.2 A ripple
allowance in the lower-temperature range. Layout and ESR tolerances prevent
assuming perfect sharing. The current study also splits the bank across each
5 mOhm sense shunt, so those impedances belong in the ripple-sharing model.
Temperature/endurance effects remain to be checked.
[Manufacturer evidence](../../components/ti-bq25756/power-stage/README.md).

Project screening calculation: for an ideal continuous-conduction boost stage,
ignoring inductor ripple, output capacitor RMS current is approximately
`Iout * sqrt(Vout/Vin - 1)`. At 27.5 -> 55 V and 360 W output, that is
6.55 A, already above the ideal combined 6.2 A rating of two reference parts.
This uses an ideal 50% duty approximation at the previously assumed 90%-of-
400-W output; actual losses, controller timing and inductor ripple change it.
Ceramics can carry part of the ripple, but their effective capacitance and
impedance must be modelled before claiming relief. A pair of these polymers
is therefore a bench-study bank, not evidence for the complete envelope.
For a buck input bank the corresponding first estimate is
`Iout * sqrt(D * (1 - D))`, reaching 5 A at 10 A output and 50% duty.

The exact Panasonic part also showed no stock at the two checked distributors
on 7 October 2026. Four parts cost approximately EUR 15.20 at single-unit
pricing or EUR 10.34 using the ten-piece unit price, before ceramics.
Compare complete bank cost, ripple, temperature, lifetime and land patterns
when evaluating alternatives; do not substitute merely on capacitance/voltage.

## Gate drive after removal of auxiliary power

The BQ's gate drivers can use its internal REGN regulator or an external supply.
TI requires external DRV_SUP and bootstrap bias to disappear when conversion is
disabled (SLUSEN5A, section 6.3.3.2). This new datasheet requirement takes
precedence over older forum advice that an always-on external bias is harmless.

The previous LM5164-derived bias proposal is abandoned with AUX power. Use
REGN-derived drive as the EVM-based study baseline and qualify its thermal
envelope. Example only: four switching gates at 30 nC each
and 250 kHz need about 30 mA average. A 55-to-5 V internal linear supply would
lose about 1.5 W in that example, versus about 0.15 W delivered at 5 V by the
external source, plus its conversion/switch losses. Real gate charge and number
of switching gates depend on voltage and mode. A separate efficient gate-bias
supply is a future option only if thermal evidence justifies its cost; it must
not silently restore the abandoned logic AUX branch.

Do not power DRV_SUP from USB merely because USB owns the logic rail. A proposed
independent low-voltage driver-supply switch is not yet a qualified safety
solution: discharge, sequencing and remaining bootstrap energy need analysis.
Turning off switching is not electrical isolation or failed-FET protection.
Use FETs with on-resistance specified at the actual minimum drive voltage;
a 10 V-only Rds(on) rating is not evidence for reliable 5 V gate drive.

The now-archived [SIR680LDP reference](../../components/ti-bq25756/power-stage/README.md)
specifies 40.5 nC typical / 62 nC maximum Qg at a 4.5 V drive under its stated
test conditions. A screening case with two gates switching at 250 kHz draws
20.25 / 31 mA; a 55-to-5 V REGN LDO would dissipate approximately 1.01 / 1.55 W
for that gate charge alone. The BQ datasheet's illustrative SOA curve uses a
1 W loss basis. Actual 5 V charge, mode, frequency, cooling and additional IC
losses must be included. This is a serious high-input-voltage thermal gate,
not proof the EVM-derived stage can run at 55 V continuously. Lower-charge
MOSFETs, lower frequency and a separately justified gate-bias supply are
possible responses; none has been selected by this calculation.

## Wide CV setting is still a real design block

### Selected direction: one MCP42100 channel, second channel spare

Latest 8 October direction retains BQ25756 as the controller baseline and the
dual MCP42100. Channel 1 is allocated to integrated CV; channel 0 remains unused
internally and available on J7. Current limiting uses BQ I2C, not the spare pot.
This supersedes earlier proposals to remove U3 or use both channels for CV.
No analog wiring was changed by the following calculation.

**Decision:** continue with BQ25756 + one protected digipot channel. There is a
credible adjustment path, but the direct resistor-only connection below is
not acceptable as finished hardware. Do not call the complete stage validated.

The first [MCP42100 calculation](calculations/cv-mcp42100.mjs),
[profile table](calculations/cv-mcp42100.csv) and
[machine-readable results](calculations/cv-mcp42100-summary.json) evaluate:

```text
VOUT -- 499k -- FB -- 13.7k -- pot A
                              pot W -- PGND
                              pot B -- no external connection
```

This is an unprotected analytical example, NOT a wiring instruction or a
selected resistor BOM. PGND is an ideal model return; the saved BQ sheet still
uses FBG. Final return/reference and isolation choices remain open.
For pot code D from 0 to 255 and fine-trim code T from 0 to 31:

`R_AW = R_AB * (256 - D) / 256 + R_wiper`

`Vtarget = (1.504 + 0.002*T) * (1 + 499k / (13.7k + R_AW))`

Unlike a B-W rheostat, A-W still contains one ladder segment at code 255.
Do not model the highest code as zero resistance. Tying B externally to W
would change the resistance equation; that connection is not in this model.

Results and limits:

- All 256 pot codes and 32 BQ trim codes are enumerated for each combination
  of 70/100/130 kohm R_AB and 0/250 ohm wiper resistance. With an ideal ladder,
  their continuous fine-trim intervals cover the illustrative 12-55 V range.
  These resistance cases are a partial screening set, not all-temperature bounds.
- At nominal 100 kohm and illustrative 175 ohm wiper resistance, the largest
  nearest-setting quantization error over 4,301 targets at 10 mV spacing is
  about 35.8 mV. This excludes reference accuracy, resistor drift, actual
  nonlinearity, leakage and transients. It is not battery-charge accuracy.
- Microchip specifies rheostat DNL up to +/-1 LSB. A constructed monotonic
  ladder with only +/-0.5 LSB INL and one 2-LSB step leaves a gap from about
  51.25 to 52.52 V in the 130 kohm / 250 ohm example, even including BQ trim.
  This is an allowed-shape counterexample, not a measured part or a predicted
  production failure rate. Calibration cannot create a setpoint inside a gap.
- A numerical fallback with 27.4 kohm series resistance and two top-resistor
  ranges, 499 kohm and 1 Mohm, covers these same ideal and constructed cases
  while using only ONE pot channel. It is not an implemented range switch or
  a complete tolerance proof; its switches, power-off states and costs need
  qualification before selection. The spare channel remains untouched.
- Some raw codes exceed 55 V; the largest ideal value among these one-range
  cases is about 57.49 V. Firmware restricting codes is not an independent
  hardware ceiling. Final nominal targets require accuracy and ripple headroom.

The more immediate obstacle is terminal protection:

- In normal closed-loop operation, FB is near 1.536 V and the pot node can be
  below that. This does not describe every startup or battery-connected state.
- With a 55 V battery, code 0, and the nominal analytical divider, FB is about
  10.22 V and pot A about 8.99 V. Both exceed a 3.3 V MCP42100 supply envelope.
- With powered SHDN asserted, A opens. In this ideal lower-leg arrangement,
  the converter target tends toward Vref rather than maximum voltage, which
  is useful. But an attached 55 V battery pulls the high-impedance FB/A nodes
  toward 55 V in the unclamped model. Actual protection-diode conduction would
  alter those voltages by back-powering or overstressing the low-voltage part;
  it is not a permissible operating mechanism.
- With U3 entirely unpowered, its powered SHDN behavior is not guaranteed.
  A fixed current-limiting resistor alone does not establish safe terminal
  voltages, nor does CE stop an attached battery from energizing its divider.

Next implementation gate: select a protected CV interface that handles powered
shutdown, absent 3V3, hot-plug and an already-charged receiver without altering
the BQ charging/OVP thresholds unintentionally. A normally-open analog isolation
element and correctly referenced limiting network are options to study, not
selected extra parts. Keep any switches, clamps and their leakage within the
complete error budget. Preserve independent receiver protection and safe-off.

The existing dual IC and spare header are already present, so retaining them
does not add a second pot IC to the current BOM. Protection/range components
are not yet counted as fitted; the controls block's existing allowance is not
proof of their final cost. Shared SHDN/reset behavior must be documented for
any future accessory connected to the spare channel.

Sources: [Microchip DS11195C](https://ww1.microchip.com/downloads/en/DeviceDoc/11195c.pdf),
100 kohm characteristics and sections 4/5; and
[TI SLUSEN5A](https://www.ti.com/lit/ds/symlink/bq25756.pdf),
feedback range, FBG behavior and voltage-setting register. Both are archived
in the component references linked below.

### Earlier approaches and background

BQ's I2C target is 1.504-1.566 V in 2 mV increments, around 1.536 V. The external
divider determines the output-voltage range. It is not a 0-55 V I2C DAC.

The inherited MCP42100 is not rejected just because it is old, but neither is
it accepted directly into the feedback divider. Its archived 100 kohm datasheet
specifies **70-130 kohm at 25 C**, up to 250 ohm wiper resistance at 2.7 V,
8-bit steps and terminals restricted to its supply rails. Its reset code is
midscale; shutdown connects the wiper to B and opens A. These states must be
designed, not treated as equivalent to converter off.

Illustrative bottom-leg rheostat: 499 kohm top and 14.3 kohm plus 0-100 kohm
bottom gives roughly 55.1 to 8.2 V at nominal 1.536 V, ignoring wiper/FBG errors.
Near the high end, one ideal pot step changes the setpoint by about 1.4 V.
BQ fine trim might bridge this quantization, but not automatically its error,
temperature, startup and failure cases.

More importantly, a high battery can be present while a low-voltage profile is
selected. In that example, 55 V applied with a 114.3 kohm lower leg places about
10.25 V on FB and potentially the low-voltage pot, even before conversion runs.
Returning through BQ's FBG also needs explicit off-state analysis: FBG disconnects
when the input is absent/outside its window. Do not assume FB-side circuitry is
always at 1.536 V or that a disabled converter isolates its battery terminal.

Paths worth comparing next:

[TI's response on wide output selection](https://e2e.ti.com/support/power-management-group/power-management/f/power-management-forum/1371530/bq25756-controlling-output-current-and-voltage-of-the-charger-controller-chip)
explicitly suggests a digital potentiometer or FET-switched divider for BQ25756.
It does not supply a qualified circuit for our voltage range or MCP42100.
The same response mentions BQ25758 as a wide-programmable DC/DC alternative,
but without the charger's precharge/termination functions. **No substitution is
made:** BQ25756 remains the user's selected controller. Keep that alternative
as a decision to discuss only if the external CV circuit becomes disproportionate;
do not silently trade hardware cost for new battery-safety firmware obligations.

| Approach | Benefit | Gate before drawing as qualified circuitry |
|---|---|---|
| Fixed precision divider for a known bench receiver | Cheapest and easy to measure | Temporary bench configuration only, not the full-function first PCB; does not satisfy automatic broad-profile setup |
| Switched precision resistor ranges plus BQ fine trim | Keeps precision in resistors; can cover common profiles | Switch leakage/on-resistance, all-off default, attached-battery voltage, GPIO/I2C budget and independent limits |
| Buffered DAC/current injection | Broad software selection; potentially fewer range switches | Startup/power-off clamp behavior, reference/error budget, stability and independent OVP |
| Shared MCP42100 with protected analog conditioning | Reuses external-module controls | Prove a genuine useful shared circuit and complete fault/error budget; extra conditioning may erase savings |

No double DAC-plus-digipot assumption is in the overall budget. Do not replace
a model gate with an unchecked direct connection simply to fill the schematic.

### Do not accidentally change the charging thresholds

An offset-injection DAC is not equivalent to changing the divider ratio.
The BQ uses FB not only for CV, but also for precharge transition, recharge and
battery OVP. For example, suppose an ideal injection circuit gives
`Vout = K * Vfb - G * Vdac`, with `K * 1.536 V = 55 V`.
At a 14.4 V target, its default 71.4% precharge threshold would map to
`14.4 - (1 - 0.714) * 55 = -1.330 V`, rather than about 10.28 V.
Its nominal 104% OVP would map to 16.6 V, rather than about 15.0 V.
These are algebraic screening examples, not proposed component values.
The 8 October readback corrected the formerly stated default of 66.7%:
SLUSEN5A register 0x14 resets to 0x0F, selecting 71.4%. 66.7% is another
programmable option, not the power-on default.
The raw-SRN trickle threshold is separate; do not assume every threshold uses FB.

Thus DAC injection requires re-deriving every relevant threshold and proving
that the available register settings can represent the intended battery profile.
It is not currently the preferred simple universal-charger path. A genuine
variable divider ratio preserves the proportional thresholds more naturally.
Neither approach replaces an independent receiver-appropriate protection path.

A resistor-bank study can use a fixed top resistor and binary-weighted
conductance to ground in the bottom leg. Six ideal range bits spanning 12-55 V
have about 0.68 V coarse steps; the BQ's roughly 4% total fine-adjustment span
cannot bridge those steps at the low-voltage end. Seven bits reduce the ideal
step to about 0.34 V and merit calculation, but require seven switches and an
I/O budget. Precision, leakage, switch resistance, code transitions and attached
battery states must still be checked. Returning the bank directly to ground
instead of FBG changes off-state battery drain and needs explicit review; a
bank of ground-referenced MOSFET gates cannot casually float its sources up
with FBG without checking gate-source absolute limits.

### Resistor bank sensitivity study on 7 October

[Executable calculation](calculations/cv-resistor-bank.mjs) and
[profile results](calculations/cv-resistor-bank.csv) evaluate a **non-selected**
PGND-returned bank: 100 kohm top, 14.7 kohm permanent bottom, and switched
453k / 226k / 113k / 56.2k / 28k / 14k / 6.98k parallel legs. These E96 values
are a numerical example, not an approved BOM or circuit.

All 128 range codes and 32 BQ trim codes are enumerated. Ideal trim intervals
overlap between adjacent range codes. Across 4,301 target voltages spaced by
10 mV from 12 to 55 V, the largest nearest-code nominal error is about 28 mV.
This is quantization only, not achievable accuracy. The full code space reaches
56.64 V: software excluding those codes cannot impose a hardware 55 V ceiling.

At 54.6 V, a nominal choice gives 54.593 V. A partial tolerance example using
0.1% resistors, BQ full-temperature 0.7% reference error, 0-10 ohm switch
resistance and 100 nA off-switch leakage spans about 54.065-55.093 V. Those
switch limits are sensitivity assumptions, not guaranteed specifications of
any chosen part. FB bias, resistor temperature drift, calibration residual,
layout and transients are excluded. This confirms that good resolution alone
does not qualify 13S charging within the 55 V envelope.

With every switch off and an attached 55 V receiver, FB is about 7.05 V. Keep
that voltage away from ordinary 3.3 V analog switches or potentiometers. A
suitably rated discrete MOSFET drain can tolerate it in principle, but its
gate-drive guarantee and hot leakage still need an exact-part check. Seven
off switches each leaking 1 uA would raise the commanded voltage by 0.7 V
with a 100 kohm top resistor. Scaling all resistors down by ten reduces that
term to 70 mV but increases switch-resistance sensitivity and standing load.
All-off 55 V receiver bleed is approximately 26 mW, or 264 mW after scaling.

A reset-safe serial output latch could reuse the existing SPI/control pins in
the internal-converter assembly, avoiding seven new ESP pins. Its startup,
unpowered outputs, output-enable pull-up and break-before-change sequencing
need design. This is not a reason to fit both the old digipot and a new bank
in every assembly. No switch or latch has been selected or placed by this study.

### The 55 V ceiling needs tolerance headroom

55 V is an envelope limit, not permission to command a nominal 55 V while
ignoring positive regulation error, divider tolerance, FBG resistance or ripple.
A 13S lithium target of 54.6 V leaves only 0.4 V (about 0.73%) to that ceiling.
BQ's specified feedback accuracy alone is +/-0.5% at 0-85 C and +/-0.7% over
the full rated temperature range. Two independent 0.1% divider resistors add
roughly 0.2% worst-case ratio error before other terms. That already consumes
or exceeds the headroom in some corners. Include setpoint guard-banding,
calibration residual and the permitted receiver charging voltage in the final
error budget. A pack that can be externally charged above 55 V is still not
qualified merely by choosing a lower charging target here.

## Independent protection

CE, ICHG-pin limiting and ILIM_HIZ-pin limiting can each be disabled by register
settings. The power-on current registers default high. Those resistor limits
are valuable defaults, but **not independent protection against firmware faults**.
The watchdog/reset behavior, MPPT-disabled policy and reverse-disabled policy
need explicit review. A hardware receiver disconnect and appropriate voltage,
current and thermal limits remain separate design work.

The inherited SMCJ70A does not impose 55 V. A fuse cannot control sustained
generator overvoltage. With no dump, interruption can unload the generator and
raise its voltage: qualify maximum open-circuit/overspeed voltage and the entire
input path, not just the main controller while loaded.

## Evidence

- [Archived BQ25756 datasheet and EVM documents](../../components/ti-bq25756/README.md):
  SLUSEN5A pins and sections 6.3.3.2, 6.3.5.1.1.1, register 0x00 and application
  divider equations; SLUUCT7D EVM BOM. Authoritative for controller requirements.
- [TI MOSFET selection guide](https://www.ti.com/lit/pdf/sluaax9): design-calculator
  and loss-analysis method, not a project efficiency guarantee.
- [Archived Microchip MCP42100 datasheet](../../components/dfr0520-mcp42100/microchip-mcp41xxx-42xxx-11195c.pdf),
  DS11195C page 4 and reset/shutdown sections. Calculations above are project
  screening examples, not copied application circuits.
