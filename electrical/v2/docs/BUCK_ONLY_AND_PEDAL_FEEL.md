# Buck-only conversion, 30 V output and pedal feel

Date: 2026-10-05. **PROVISIONAL engineering study, not measured performance.**
The user's phrase "30 V capable" is provisionally interpreted as maximum
converter OUTPUT. Generator voltage and maximum INPUT are separate decisions.
See [reference designs](POWER_CONVERTER_REFERENCE_STUDY.md) and
[receiver study](OUTPUT_RECEIVER_STUDY.md).

Subsequent scope clarification: the user now wants broad recovered-generator
and e-bike battery coverage. See the [compatibility decision pack](compatibility/README.md).
This document's buck-only preference concerns the original narrower use case;
the wider study gives voltage step-up a concrete purpose and reopens the choice.

## 1. Quantifying the development difference

Compare one-phase synchronous buck with one-phase four-switch non-inverting
buck-boost at the same current, protections and interface requirements:

| Work item | Buck only | Buck-boost |
|---|---|---|
| Main switch positions / gate-drive channels | 2 | 4 |
| Main inductors | 1 | 1, but size for both operating regions |
| Main switch nodes | 1 | 2 |
| Operating regions to verify | Step-down, including dropout/start/stop | Step-down, crossover, step-up, plus transitions |
| Voltage / current / thermal protection | Required | Required |
| Smooth programmable braking current | Required | Required |
| Receiver and full-battery behavior | Required | Required |

The switch-position reduction is **50%**, not a 50% reduction in the complete
board BOM or engineering time. Parallel MOSFETs may change actual part count.
The [TI four-switch control note](https://www.ti.com/lit/an/slyt765/slyt765.pdf)
describes the operating modes and transition-control problem.

Planning estimate only: assign buck power-stage development **1.0 effort unit**
and buck-boost **1.3-1.6 units**, roughly **23-38% less power-stage effort** for
buck. This is engineering judgment, not vendor data or a calendar commitment.
It assumes a usable reference, comparable analog CC work and no extra PCB spin.
If converter work represents half the buck-boost V2 effort, the corresponding total
project saving is only about 12-19%. The share is not yet known.
An extra PCB revision or easier integrated current control can overwhelm this
estimate. Do not infer euro savings or days without a candidate BOM and test plan.

## 2. "Same voltage" still needs headroom

A buck cannot maintain a regulated 24 V output from 24 V input under appreciable
load: conduction losses and maximum duty cycle leave a dropout region. A bypass
path may pass nearly the same voltage, but it does not automatically preserve
CV or commanded-current control. Budget measured headroom and hysteresis.

Illustrative buck duty ratios, ignoring losses: at 36 V input, 24 V output needs
67%, 30 V needs 83%, and 14.4 V needs 40%. Higher duty is not automatically higher
whole-system efficiency, and operation near maximum duty reduces control margin.

The [existing generator notes](../../measurements/first-generator-buck-validation-plan.md)
record a 36 V loaded point, but no cadence/current curve; 45-60 V open-circuit
is explicitly an estimate. This is insufficient to guarantee low-speed braking.

Illustration ONLY, **not our measured generator**: assume loaded bus voltage
scales as 36 V at 80 crank rpm and reserve 2 V converter headroom. Approximate
minimum cadences would be 36 rpm for 14.4 V output, 58 rpm for 24 V, and 71 rpm
for 30 V. Real thresholds change with current, gearing, ripple and temperature.
Higher demanded hill torque causes more voltage sag, so the hardest low-cadence
case can fail even if light-load charging works.

## 3. Physical meaning for resistance and simulated grade

First-order permanent-magnet generator model:

```text
induced voltage E ~= Ke * generator speed
loaded bus V ~= E - I * winding resistance - rectifier losses
electromagnetic resisting torque ~= Kt * generator current
crank torque [N m] = 9.55 * crank power [W] / cadence [rpm]
```

These are conceptual equivalents, not calibrated constants for our rectified
three-phase machine. Maxon explains voltage-speed, voltage sag and torque-current
relations for [motors used as generators](https://support.maxongroup.com/hc/en-us/articles/360004496254-maxon-Motors-as-Generators).
Gearing, waveform, rectifier and mechanical losses must be included in calibration.

At 60 rpm, 100/150/250 W at the crank means approximately 15.9/23.9/39.8 N m.
Those torques do not increase merely because the converter has a 30 V rather
than 60 V maximum rating. Generator CURRENT and the mechanical ratio matter.
Converter OUTPUT current is not generator input current; account for both.

For small road grades, gravitational power is approximately `m * g * v * grade`.
With 90 kg total virtual mass, 15 km/h and 5% grade, the hill term is 184 W,
or 29.3 N m at 60 rpm. Rolling and air resistance add to this. A grade percentage
alone does not specify torque without virtual speed, mass and gearing.

Buck-boost's gain is **a wider usable cadence range**, not free power or extra
torque everywhere. With buck-only, energy transfer to a fixed-voltage receiver
falls away below its voltage threshold; braking via that path consequently
falls too. Buck-boost extends that region, subject to startup, current, thermal
and generator limits. Neither provides generator-powered holding torque at
zero speed. A separate load can provide braking when charging is unavailable,
but its low-speed capability and thermal limits also need validation.

## 4. What limiting OUTPUT to approximately 30 V buys

It narrows qualification and can reduce output capacitor/protection voltage
ratings. In a buck, the main switching MOSFETs still see the INPUT bus, so an
80 V-input design does not suddenly become a 30/40 V MOSFET design. Capacitors
and protection also need transient margin, not operation right at their rating.

At identical delivered power, lower output voltage means MORE output current:

| Output voltage | Current at 150 W | Current at 300 W |
|---|---:|---:|
| 14.4 V | 10.42 A | 20.83 A, exceeds provisional 20 A |
| 24 V | 6.25 A | 12.50 A |
| 30 V | 5.00 A | 10.00 A |
| 60 V | 2.50 A | 5.00 A |

For the same resistance, 30 V instead of 60 V at equal power doubles output
current and quadruples `I^2 R` losses in that path. Conversely, 30 V instead of
24 V reduces current 20% and that path's resistive losses 36%. These are not
whole-converter efficiency predictions and do not automatically reduce generator
winding current. Receiver acceptance comes first.

A 30 V output ceiling covers nominal-12 V battery charging and candidate 24 V
station profiles. It can encompass 28.4/28.8 V nominal-24 V battery profiles,
but offers little headroom for some temperature compensation/equalization modes;
those must be explicitly excluded or qualified. It excludes direct charging of
36/48 V-class batteries. It does not imply universal battery compatibility.

For AC50S, increasing candidate supply from 24 V toward 30 V does not change its
documented 120 W input ceiling; at 120 W the arithmetic is 5 A versus 4 A.
Validate its actual MPPT behavior before enabling either profile. Do not set
the output near the receiver's absolute input ceiling to seek more pedal torque.

## 5. The energy receiver can limit hill feel before the converter does

Conservation of energy applies independently of topology. If 150 W reaches the
converter input and the station accepts 120 W, a hypothetical 90%-efficient
converter would deliver 135 W: a separate path must dispose of roughly 15 W,
or loading must decrease. At 250 W input the same illustrative numbers leave
105 W beyond station acceptance. These examples exclude auxiliaries and use
an assumed efficiency; crank power is higher due to upstream losses.

A full or disconnected station may accept zero. A controlled, independently
protected dump load can preserve braking in that case; merely switching to
buck-boost cannot. Treat torque-loss behavior as a trainer safety requirement.
Do not rely on a TVS as a sustained braking resistor. No dump-load architecture
or rating has been approved in this study.

## 6. If 30 V meant generator voltage or maximum input

A generator producing 30 V at normal cadence is not limited to 30 V at high
cadence or when unloaded. The existing 36 V loaded note already argues against
assuming 30 V maximum input. Reducing the input rating requires measurements,
mechanical speed limits and/or a reviewed clamp/disconnect strategy.

At 150 W electrical output, a 30 V generator bus carries 5 A; a 60 V bus carries
2.5 A. That does not establish that a different winding or higher gear ratio
halves torque or improves efficiency: winding resistance, torque constant,
mechanical speed and losses change. Optimize the measured operating map, not
closeness to a nameplate voltage. A 30 V generator has only modest headroom for
a 24 V buck output, and essentially none for a regulated 30 V output.

## 7. Provisional direction and decision test

User confirmation, 2026-10-05: the current scooter-generator installation
already works with approximately 36 V stepped down to 24 V by a buck, with no
boost needed. Treat this as the established operating baseline, not an
unproven need for buck-boost. The user recalls safety as the reason for the
24 V setting; this does not establish the original protection rationale or
qualify fault protection. Broader generator/receiver coverage is a separate
V2 scope decision.

For this bike, prioritize smooth, repeatable torque over a high universal output
ceiling. Investigate **buck-only, approximately 12-30 V output, with 24 V as the
first AC50S profile** while retaining the proposed input-voltage margin. This
is a study direction, not approval of parts or a changed architecture.

Measure loaded bus voltage/current at 40/50/60/80/100 crank rpm where mechanically
safe, across achievable 50/100/150/250 W input loads. Record gearing, generator
speed, temperature, ripple minima and unloaded/receiver-disconnect peaks. Do not
exceed the current prototype's limits or connect an unqualified receiver.

From that map, document the existing setup's resisting torque versus cadence
and its current/thermal constraints. For any expanded operating requirements,
check whether buck-only still covers the requested profiles and hill torque;
only then compare gearing changes, buck-boost, or a separate controllable dump
load as needed. Retain independent hardware
OVP/OCP/thermal shutdown, safe current-command failure, and input-voltage limiting
to prevent a constant-power command from collapsing/stalling the generator.
