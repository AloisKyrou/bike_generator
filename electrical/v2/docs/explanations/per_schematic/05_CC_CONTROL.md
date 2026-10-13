# Independent manual and app voltage

[Guide index](../README.md). Saved page 5, CC_CONTROL, adaptive checkpoint
8 October 2026. Connectivity-reviewed, not powered or approved for charging.

## Readability update, 12 October 2026

Q22 now reads source-to-drain from left to right; R19 and R87 are repositioned
to remove the crossed supply loop. The two `CV_DRIVE` labels are the same local
net: Q22 drain/R88 input drives Q21 gate/TP46. This one named link avoids crossing
the manual and digital feedback branches, which retain direct wires at K1.
The local +3V3 symbol on U3 pins 11/12 removes three crossings over SPI.
R86 now has a short rail-discharge/leakage-bleed annotation with its 0.33mA load.

Presentation only: a fresh root XML comparison preserves all 145 physical
component records and all 125 named net endpoint groups. Only `cc_control.kicad_sch`
changed among native project files. Root ERC has zero violations with the same
four inherited ignored checks; local connection, short and orphan checks and
the MCU reset regression pass. Final rendered sheet inspected.
[Review PDF](../../../kicad/exports/review-cc-readability-2026-10-12/controller-v2.pdf).
This does not close the hardware qualification gates below.

## Decision: retain relay, 12 October 2026

User confirmed keeping K1, Q22, Q21 and the existing selector circuit for V2.
A transistor-only selector is a deferred cost/power optimization, not an
approved schematic change or an additional prerequisite for this revision.

Future comparison must preserve independent manual/app voltage settings,
manual operation without ESP power and protection of an unpowered digipot.
A deliberate conversion pause of a few seconds during handover is acceptable;
uninterrupted output is not required. This does not permit receiver overvoltage
or remove the existing brownout and transition qualification gates.

Discussion budget, excluding VAT, delivery and assembly: the present K1/Q22/
D23/R19/R87/R88 block is approximately EUR2.74-3.25 (six components).
A not-yet-designed discrete alternative was allocated EUR0.80-2.50 and
8-15 components; a EUR1-2 per-board saving is a study objective, not a
demonstrated result. Both comparisons exclude the digipot, Q21 and common
analog protections. Potential additional benefit: removal of approximately
0.15W coil-drive consumption in app mode. No alternative BOM is validated;
do not subtract prospective savings from current project costs.

## Signal path

U3 is MCP4251-503E/SL, a dual 50k, 257-position digipot in SOIC-14. Channel 1
sets app voltage; channel 0 remains at J7: 1=A, 2=W, 3=B. J9 is removed.
GPIO5/6/7 provide SPI; SDO is unconnected, so this interface is write-only.
Verify actual output through BQ measurements and reference instruments.

The permanent 249k upper feedback resistor remains on MAIN_CONVERTER_TBD.
K1, a TQ2-3V nonlatching DPDT relay, selects independent lower branches:

- De-energized/manual: 5.62k + 200R plus RV2 returns to BQ FBG. Calibrate near 12 V
  initially. App settings do not move the mechanical adjustment.
- Energized/app: separate 5.62k + 200R guard, NX6008NBKR Q21 and channel-1 A/W
  rheostat return to GND. R85 provides a 150k 0.1% parallel bleeder.
- D25 BZX84C27LT1G clamps Q21's drain through the high-impedance feedback
  network. Its low-current 27 V characteristic protects the retained 60 V
  transistor in the static screen; hot leakage and transient behavior need proof.
- The second pole disconnects the NX source from MCP A/W in manual mode.
  Its unused contact K1.9 is explicitly NC, not GND: contact-order skew must
  not deliberately short the digital lower branch. R85 and MCP B define the
  idle node. BAT54SLT1G D24 clamps it to local rails during transitions.

GPIO20 is **CV_AUTO_N**: released/high selects manual; low selects app.
AO3401A Q22 drives the coil. R19 pulls gate to source; R87 is 100 ohm, R88
is the 6.8 ohm coil resistor, D23 is flyback. Q21's gate taps CV_DRIVE before
R88. Prefer open-drain GPIO operation, not an external UART connection.

## Startup and limits

R86 (10k) is a permanent 3V3-to-GND bleeder, not a divider or generator dump
load. It helps discharge the rail after supply removal and sinks small leakage
currents, including possible injection through D24. At 3.3 V it draws 0.33 mA
and dissipates 1.089 mW. It cannot guarantee safe rail voltage under arbitrary
backfeed, nor does it replace brownout/handover validation. With an optional
cell still supplying the rail, it remains a small continuous load. TP47 is the
adjacent bare GND probe pad; it is not an input or an extra circuit branch.

MCP /SHDN pin 12 and pin 11 are held at VDD. The manufacturer pin drawing says
/WP at pin 11 while its table says NC; VDD is compatible with inactive /WP
and the documented permitted NC connection. The discrepancy is recorded.

The digipot starts at midscale, **not guaranteed 12 V**. Program and verify
before selecting app mode. BQ fine-reference trim also affects manual voltage;
ESP loss does not reset an independently powered BQ. Firmware is unchanged.

Static resistor/reference/temperature screening bounds the upper voltage below
69.52 V, not a receiver-specific overvoltage limit. Nominal digital maximum
with reference trim is about 67.66 V, but a studied corner only reaches
64.37 V. **67.2 V is conditional on measured per-unit range and calibration,
not guaranteed.** The larger bleed resistor preserves 12 V reach in the studied
track-tolerance range. Frequent effort control uses BQ input-current limits.

## Remaining gates

### Focused follow-up, 12 October 2026

Rechecked the saved AOY review export `review-aoy-mosfets-2026-10-12/final.xml`
(SHA256 `5C9C3304AC220C4156E28775EB116FF5A858F61D9634036298ED1C0840B7DD27`),
not a fresh live-editor export or physical test. The CV audit passes 54 checks
and rejects all 25 deliberately broken XML fixtures. Its value comparison now
accepts the user's compact slash typography; the initial failure was the J7
label `SPARE POT0/50k`, not an electrical difference. No KiCad source changed.
The 70 V static study passes 128 corners and the ideal contact-state model
passes 18 states. Neither model establishes analog transition timing.

Microchip DS22060B pp1-2 and section4.1 distinguish operation down to1.8V
from analog specifications characterized from2.7V. Crossing2.7V does NOT prove
an immediate wiper reset or output surge. Below the lower RAM-retention region,
wiper/TCON contents can be corrupted; recovery reloads defaults, and an
interrupted SPI write can corrupt the addressed location. Do not claim either
guaranteed failure at2.7V or guaranteed correct resistance below it.

With today's nominal divider, a selected, normally conducting digital path at
reset code128 requests about15.54V at default BQ reference, not12V. This is a
static restored-rail example, not a predicted brownout peak. It explains why
startup/recovery must keep the selector manual until the digipot is programmed.
The BQ may retain its I2C trim across an ESP reset; qualify that case as well.

| Event to qualify | Required observation / acceptance |
|---|---|
| Cold logic start or recovery | Manual selection until valid app initialization; no unintended selection of reset code; manual setting itself compatible with receiver |
| Deliberate app/manual transition | Conversion interruption is allowed; output must remain within the configured receiver's allowed transient envelope |
| USB unplug with no backup cell | Capture3V3, CV_DRIVE, MCP A/W and output; establish digital branch cutoff versus loss of valid analog behavior |
| Slow logic-rail fall and recovery | No sustained unintended digital setpoint or repeated unsafe relay cycling |
| ESP reset while3V3 remains present | Default GPIO state returns selector to manual; retained BQ settings included |
| Interrupted SPI update / short supply dip | Recovery does not reselect an uninitialized digipot |

Use the existing approved energy-limited bring-up process and dummy loads,
not a valuable receiver/battery for first fault captures. Timing/probe loading
and receiver-specific voltage limits must be recorded. An arbitrary hard3V3
short is a separate fault case, not equivalent to unplugging USB.
No supervisor, hold-up island or new GPIO has been selected in this follow-up.
The dynamic gate remains open; static success is not a fabrication release.

TP45-47 are bare copper access to MCP A/W, CV_DRIVE and local GND. Keep the
A/W pad directly at its node without a PCB branch and use a low-capacitance
probe. C4 now uses the selected TDK 100 nF/100 V 0805 hand-solder part shared
with six main-stage positions. [Probe details](../../PROBE_ACCESS_2026-10-08.md).

Relay pole skew, brownout, bounce, hot leakage, negative coupling and a high
attached battery on a low-voltage profile require bench proof. Clamps and a
static netlist do not prove safe transients. Do not connect a battery yet.
The spare channel is neither isolated nor field-protected: all terminals must
stay inside actual supply rails, including when unpowered.

[Selector engineering](../../../../components/v2-cv-control/MCP4251_SELECTOR_2026-10-08.md),
[model acceptance](../../../../components/v2-cv-control/SELECTOR_MODEL_VALIDATION_2026-10-08.md),
[control contract](../BQ25756_CONTROL_CONTRACT.md),
[70 V CV study](../../../../components/v2-cv-control/VOLTAGE70_STUDY_2026-10-08.md),
[checkpoint](../../SCHEMATIC_VOLTAGE70_2026-10-08.md).
