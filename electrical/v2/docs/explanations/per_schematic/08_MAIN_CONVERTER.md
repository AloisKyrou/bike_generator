# Integrated main buck boost

[Guide index](../README.md). Saved page 7, MAIN_CONVERTER_TBD. The historical
filename remains, but the sheet contains the integrated BQ25756 circuit.

## Reading the sheet

Latest same-day change: Q10-Q13 provisionally use AOY66923 three-lead THT,
replacing SiR870 (not AONS DFN). Pins1=gate,2=drain,3=source retain the same
electrical connections. Live drain backs require insulating thermal interfaces
and clamps to the user-requested common heatsink. See [part evidence](../../../../components/aoy66923/README.md)
and [cooling plan](../../SHARED_HEATSINK_2026-10-12.md). No400W qualification
or V2 PCB work accompanies this change.

Latest component change,12 October: C73-C76 and C81-C88 are now twelve
EEU-FR2A101100uF/100V radial electrolytics,5 input/7 output. C77-C80 ceramics
stay unchanged. This saves about EUR21.48 per actual twelve-part basket versus
the polymer selection, at the expense of height and ripple margin. The
[study](../../../../components/panasonic-eeu-fr2a101/README.md) records pin map,
dimensions, calculations and the explicit unqualified high-current cases.
The change is not a400W rating; no V2 PCB work or energization approval.

The upper half is the energy path, read left to right. The lower half is the
controller and its low-power settings; named gate/sense nodes connect these
two areas without running many long wires across the sheet.

| Block | What it does | Important distinction |
|---|---|---|
| JP30, R1 and input capacitors | Admit generator DC, measure input current and supply switching pulses locally | R1's Kelvin pins are sense connections, not extra power terminals |
| Q10/Q11, L3, Q12/Q13 | Switch and transfer energy to step voltage down or up | L3 stores energy; the MOSFETs are actively driven, not linear regulators |
| R75, output capacitors, JP31/J31 | Filter output, measure receiver current and connect the receiver | JP31 is a manual commissioning boundary, not automatic reverse-current protection |
| C62/C63/C64 | Local VAC decoupling at U9 pins 32/33 | All three are in parallel between VAC and GND; none is in series with the supply |
| REGN, DRV_SUP, C60/C61 | Power and bypass the gate drivers | Two tied supply pins still need local decoupling at the PCB pins |
| D10/C65 and D11/C66 | Floating bootstrap supplies for the upper MOSFET gates | Capacitor returns go to SW1/SW2, not GND |
| R80-R83, C67-C72 | Filter small differential shunt measurements | C67/C70 see the shunt difference; the ground-referenced capacitors see full bus voltage |
| RV2/FB/FBG and CC_CONTROL | Select manual or app voltage feedback | Independent voltage settings; the relay selector is on the other sheet |
| RV1/ICHG, R62/ILIM, R60 | Set output-current ceiling, input-current ceiling and switching frequency | I2C may request lower current while pin limits remain enabled |
| R63-R65, TS/J33, CE, I2C | Monitor input range/temperature and provide enable/service control | Detection and stopped switching do not physically disconnect a faulty source |

TI specifies the VAC, REGN/DRV_SUP, bootstrap and current-filter connections in
the [BQ25756 datasheet](https://www.ti.com/lit/ds/symlink/bq25756.pdf), sections
4, 6.3.3.2 and 7.2.2. Two parallel 100 nF capacitors are not electrically two
different voltage stages; their practical benefit depends on short local PCB
connections. Removing them is not justified merely because their nets match.

## Readability and verification, 12 October 2026

Latest user refinement: bootstrap C65/D10 and C66/D11 now connect by visible
wires to the BQ SW/BTST pins, with one BTST label per net. SW1/SW2 retain links
to the distant power bridge. RV2 and its guard resistors are now next to U9
with a direct FBG connection. This user layout supersedes the earlier separate
bootstrap branches/manual-block positions described below and is a reference
for future drawing work. Review against the previous export confirms unchanged
component data and named net endpoints; no native edits made during the review.

Follow-up capacitor-bank harmonization: C82/C74/C87/C77/C78 now form one
aligned row below BQ_VAC with a shared ground return. C87 is no longer an
isolated above-rail branch. Q10/Q11 and their gate resistors were shifted right
on the drawing to make room without crowding capacitor fields. C73/C81 also
share a clearly drawn ground return. The coherent five- and two-capacitor
output banks remain above their rails; moving them below would crowd the
switching and output-sense circuits. These are drawing choices, not PCB
placement instructions or changes to capacitor roles.

The VAC decoupling group now sits left of both supply-pin feeds, with a ground
return that no longer crosses those feeds. The long C80 return loop is replaced
by a short local branch, still before JP31. In the subsequent direct-wiring
pass, REGN/DRV_SUP are wired continuously from U9 to C60/C61 and TP43, both
bootstrap supply diodes and R72/R73/J33. Only one BQ_REGN label remains to name
the rail, not to bridge disconnected drawing blocks. Driver pin text is clear
of the short REGN/DRV_SUP tie. R66 is now visibly wired to BQ_OUT after R75 and
before JP31, with only the output-node label retained. The manual CV block was
moved right to keep these wires clear. Sense/gate/switch-node links remain
where they avoid long crossings of the power stage. Component fields were
repositioned away from the new wiring.

No component, value, footprint or electrical connection was intentionally
changed. Keep the gate 0-ohm resistors as bring-up tuning locations, the two
shunts for the two BQ measurements, and the present decoupling. No component
removal or BOM saving is claimed. See the scoped
[review and remaining gates](../../MAIN_CONVERTER_REVIEW_2026-10-12.md).

## Controls

| Control | Saved network | Calculated nominal range |
|---|---|---|
| Manual RV2 voltage | Permanent 249k upper; relay-selected 5.62k + 200R + 50k lower to FBG | Calibrate12 V initially; upper POR endpoint about66.88 V with typical FBG |
| App voltage | Independent guarded MCP4251 channel-1 branch on CC_CONTROL | Nominal maximum with trim67.66 V; studied corner64.37 V |
| RV1 output-current ceiling | 5.49k + 50k from ICHG to GND | About 0.90-9.11 A with 5 mOhm shunt |
| Fixed input-current ceiling | R62 1.47k at ILIM_HIZ | About 13.605 A nominal; studied tolerance/TCR upper 14.77 A |

Calibrate manual voltage/output current near 12 V/1 A for initial commissioning.
This is a low-power test setting on the full prototype, not a permanent 1 A
input limitation or separate fixed-voltage PCB. Guard resistors and tied wipers
bound static travel and the studied open-wiper failure; they do not cover every
fault. Both knobs at maximum can request roughly 610 W nominal. Approximately 400 W
output is a planned app limit, not an independent analog cap or proven rating.

While their functions are enabled, the lower resistor/I2C current limit applies.
Frequent effort commands use input current. The 5 mOhm input shunt preserves
400 mA minimum / 50 mA register steps. I2C can disable pin limits and override
CE behavior: these are not independent protection against arbitrary firmware.

## Power path

BUS_PROTECTED enters through open screw-wire link JP30. R1 is now a single
CSS4J-4026K-5L00F four-terminal input shunt, replacing the old 2 mOhm telemetry
part and redundant R74. Force pads 4/1 carry upstream/downstream current;
Kelvin pads 3/2 reach ACP/ACN through R80/R81, without shared force traces.
R75 remains the 5 mOhm/1 W output shunt: about 0.5 W nominal at 10 A, requiring
PCB/hot-temperature proof. JP31 leads to the actual receiver connector J31.

Q10-Q13 SIR870ADP-T1-RE3 (100 V) and L3 10 uH implement buck/boost switching. R60 retains
250 kHz. D10/D11 and C65/C66 bootstrap the high-side drivers; REGN supplies
DRV_SUP directly. There is no abandoned generator AUX supply.

Twelve provisional Panasonic EEU-FR2A101100uF/100V THT bulk capacitors are drawn:
input C73/C81 before R1, C74/C82/C87 local after it; output C75/C83/C84/C85/C88
local before R75, C76/C86 receiver-side. Initial tolerance plus the specified
endurance capacitance decline leaves300/420uF in the analytical screen,
without MLCC credit. Individual ripple rating is1.5Arms at100kHz/105C.
Local ceramics remain. Summed ratings do not prove sharing across shunts;
the mismatch and remote-bank sensitivity cases exceed the individual rating.
Ripple, startup/inrush, loop stability and thermal behavior still need
qualification or derating. BQ compensation is internal, not an omitted COMP RC.
Allow maximum22mm body height and extra spacing beyond the nominal courtyard.

JP30/JP31 use actual Phoenix 1711725 screw terminals with removable rated wire
loops, not 2.54 mm shunts. Their open symbols are commissioning boundaries, not
automatic isolation. Current ratings depend on standard, wiring and temperature.
J2 and the external-converter variant are removed.

JP30's removable wire is mainly for commissioning and troubleshooting: it
separates the upstream rectifier/protection circuit from the BQ input stage.
In a commissioned assembly it would normally be closed. Remove or install the
wire only with sources disconnected and capacitors discharged, not under load.
Opening JP30 alone does not make the board safe or fully isolated: a receiver
battery can still energize the output side, and logic power/common ground can
remain connected. It is not a substitute for source disconnection or fusing.

## Host and autonomous operation

R68/R69 join BQ I2C to the MCU bus. R4/R6 on MCU are the sole pullups. J32 is
reference/service only: 1=3V3, 2=SCL, 3=SDA, 4=INT, 5=CE, 6=GND. No external
power injection. External CE tests require a 1k series lead because registers
can change CE to an open-drain output. R71 pulls CE low for autonomous cold-start
permission; no dedicated ESP enable pin exists.

J32 keeps its existing six-pin through-hole header footprint. The header can
be left unpopulated and its pads used for service probing, or fitted when
repeated wired access is useful. This assembly choice does not create a new
power input; keep the NO EXT POWER restriction. No blanket DNP/BOM change was
made in the 12 October readability pass.

GPIO20 release de-energizes the relay to manual voltage, but ESP loss does not
reset retained BQ registers or guarantee a harmless receiver transient. Setpoint
handover, watchdog behavior and receiver-specific protection need verification.
J33/R72/R73 require external Semitec 103AT-2, 10k +/-1%, B25/85 3435 K +/-1%,
not an arbitrary 10k NTC. User confirmed mounting this sensor on the common
heatsink on12October2026, not on the receiver battery. Existing circuitry stays;
exact attachment, location and thermal coverage remain unqualified. Default
JEITA warm-zone voltage reduction and cold/hot suspension still apply; this is
not an autonomous watt limiter. See the [sensor decision](../../SHARED_HEATSINK_2026-10-12.md#thermal-sensor-decision-12-october-2026).
Autonomous cold start is charger-state-machine permission, not an always-on PSU
profile. Precharge is not automatically 20% of a subsequently selected ICHG_REG.
The [startup/profile review](../../CONTINUATION_READINESS_REVIEW_2026-10-08.md)
and control contract document phase-specific limits and retained registers.

## Continuation Details

TP40-44 provide local FB, ICHG, ILIM, REGN and GND probe access. They are bare
copper, not connectors or inputs. FB probing needs a short, low-capacitance
probe at the actual node without a PCB branch stub; no switch-node pads were
added. See [probe access](../../PROBE_ACCESS_2026-10-08.md).

C63/C64/C68/C69/C71/C72 now use selected TDK 100 nF/100 V 0805 parts;
C62 uses selected KEMET 1 uF/100 V 1206. Standard hand-solder lands were checked
against manufacturer body/termination data. Existing selected 0603 parts
remain unchanged. R75 now uses the electrically identical FEB reel suffix,
not a higher-power resistor. [MLCC evidence](../../../../components/ti-bq25756/power-stage/MLCC_SELECTION_2026-10-08.md)
and [R75 packaging evidence](../../../../components/ti-bq25756/power-stage/R75_PACKAGING_2026-10-08.md).

## Release gates

User also closes the twelveEEU-FR2A101 selection for the first prototype.
Keep the current bank and ceramics; ripple/temperature/stability qualification
remains a staged-test requirement, with operating limits or bank changes if
needed. The sensitivity-study overloads are not validated continuous ratings.

Subsequent12October user approval closes the AOY/internal REGN driver choice
for the prototype. Keep this circuit; verify gate waveforms and temperatures
during staged prototype qualification. Missing physical measurements alone
do not block prototype routing. Preserve short loops and probe/rework access;
this does not validate the full operating range or waive other release gates.

Latest scoped follow-up: [power-stage margins](../../POWER_STAGE_MARGIN_REVIEW_2026-10-12.md).
The400W sampled screen does not close capacitor ripple, bootstrap or REGN
thermal qualification. R1's current5mOhm part is4W under its specified terminal
conditions, not the old2mOhm part's6W. Existing values remain provisional;
no new driver supply, frequency change or capacitor substitution was made.

JP30/JP31 remain OPEN. Do not energize a battery or arbitrary generator.
Static CV guard below69.52 V is not12 V receiver protection. 67.2 V output is
conditional on measured per-unit range/calibration, not guaranteed. ACOV is
screened67.47-69.68 V with resistor temperature corners:70 V is a class target,
not continuous-input headroom. Inherited TVS clamp is too high for BQ/FET limits.
L3 remains rated75 V terminal-to-terminal and needs switching-excursion proof.
REGN gate-drive heat at high input voltage, full bounded V/I stress, rectifier
cooling, reverse current/disconnect, output protection and PCB layout remain
unfinished qualification. Native ERC does not resolve these physical gates.

[Power engineering](../../../../components/ti-bq25756/power-stage-70v/README.md),
[control contract](../BQ25756_CONTROL_CONTRACT.md),
[bring-up review](../../REVIEW_AND_BRINGUP_2026-10-08.md),
[saved checkpoint](../../SCHEMATIC_VOLTAGE70_2026-10-08.md).
