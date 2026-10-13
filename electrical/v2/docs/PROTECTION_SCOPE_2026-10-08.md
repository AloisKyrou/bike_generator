# Scope freeze and protection comparison

The [10 October minimum-cost decision](MINIMUM_PROTECTION_DECISION_2026-10-10.md)
now selects soldered external fuses where required and retains F1/TVS, without
the proposed active reverse/backfeed stages. Budgets/options below are historical
comparisons, not extra approved BOM requirements. Qualification remains open.

Superseded in part by the later same-day
[70 V-class revision authorization](VOLTAGE_RANGE_REWORK_2026-10-08.md): the
user reopened BOTH voltage ranges and accepts sacrificial board damage after
reverse wiring, prioritizing fault-energy containment and economical fuses.
Do not treat the earlier instruction below to retain the voltage range, or
the preliminary active-protection budgets, as the current approved solution.

8 October 2026, following the user's response to the pre-layout checklist.
Discussion and engineering budgets only. No KiCad source or PCB change in
this pass; no protection candidate below is selected or qualified.

## Accepted direction

- Drop the external-converter assembly option. The integrated BQ stage is the
  sole planned converter. J2 and historical external-mode documentation still
  exist in the saved checkpoint; remove/reconcile them in the next authorized
  schematic pass through Konnect, not by editing native source text.
- DC uses the common power path; AC adds rectification ahead of it. Do not
  invent a separate DC converter. Direct DC bypassing the bridge still needs
  polarity protection. Do not connect AC and DC sources simultaneously.
- Keep the selected components/architecture and publish achievable limits.
  Do not reopen the voltage range to obtain a particular high-voltage pack.
- Manual/app behavior is an agreed design choice, not an open user decision.
  Retain the chosen selector. Its low-rail transition is a specific remaining
  engineering check, not a reason to reopen the whole architecture.
- Standard resistor/trimmer values with guard resistors are preferred. Unused
  digital codes and a less exact achievable endpoint are acceptable; software
  code restriction does not replace the unpowered manual hardware limit.

## Knob limits already calculated

Saved nominal manual CV is about 8.18-52.31 V at the default reference, using
249k above and 7.50k plus 50k below. The studied static upper bound including
reference/initial tolerances is about 54.04 V. Manual output current uses
5.49k plus 50k and is about 0.90-9.11 A nominal. These are already standard
values, not a search for custom potentiometers.

The two manual networks are independent of the chosen digipot resistance.
The fixed guards establish their maximum settings even at zero rheostat
resistance. At both nominal maxima the requested output can approach 476 W;
input-current limits may reduce this at a given generator voltage. Resistor
adjustment can reduce the output-current ceiling without any new component.
For illustration only, a 7.50k current guard instead of 5.49k would give
6.67 A nominal maximum, approximately 349 W at 52.31 V. This is NOT selected
and is not a guaranteed power/thermal bound: redo gain, shunt, temperature and
reference tolerances, and all voltage-ratio loss corners before adoption.

The remaining selector concern is the interval during a collapsing 3V3 rail:
the MCP analog range can become unspecified before the mechanical relay has
released. No extra user functionality is requested. A hardware intervention
is justified only by a bounded timing/fault analysis; see the existing
selector continuation study. The endpoint checks do not test this transient.

## Protection functions are distinct

1. Reversed DC generator leads: negative voltage at the source input.
2. Backfeed: a correctly connected receiver battery supplies the board/generator.
3. Reversed output battery: negative voltage at the receiver terminal while
   the converter may already be generating positive voltage.
4. Overvoltage: excessive source voltage or excessive voltage for the selected
   receiver. Neither a fuse nor simple reverse-polarity protection solves it.

In particular, an output series diode oriented to pass charging current blocks
ordinary battery backfeed but does NOT block a reversed output battery: that
fault forward-biases the diode. A simple source-powered reverse-polarity MOSFET
can also be incorrectly enabled by the charger. The output needs a circuit
specifically suitable for charging, hot-plug and both source-power states.
See [Analog Devices AN171](https://www.analog.com/en/resources/app-notes/an-171.html).
Its example circuits are not drop-in 55 V solutions; higher voltage demands
rechecking gate clamps and summed charger/reversed-battery stress. Two 55 V
sides can put about 110 V across an open blocking path, before transient margin.

## Preliminary budget comparison

Counts include support passives, not just power devices. Costs are engineering
allowances for low quantities, EUR excluding VAT/shipping/PCB/assembly/cooling.
These are alternative approaches, not a list to add cumulatively.

| Function / option | Indicative circuit | Parts | Allowance |
|---|---|---:|---:|
| DC input polarity only | Power MOSFET with gate clamp and bias resistors | 3-5 | 2-5 |
| Combined input protection | Controller, two opposed MOSFETs, threshold/bias/decoupling and transient parts | 10-16 | 7-14 |
| Output backfeed only, lossy alternative | Series power diode | 1 | 1-3, cooling extra |
| Output backfeed plus reverse-battery disconnect | High-side opposed MOSFETs, gate/reverse-current control and charger-compatible polarity detection | 14-24 | 10-18 |
| Receiver fuse and mounting | Appropriately DC-rated fuse and holder/mounting | 1-3 | 1-3 |

Combined input plus output MOSFET protection is provisionally about EUR17-32,
24-40 parts, before an additional output fuse. Do not add this whole estimate
to the dashboard: input/output protection allowances already exist there.
Receiver-specific OVP threshold generation, high-fault-current interrupt rating
and exact surge conditioning can change these budgets. No claim is made that
this allowance buys complete independent protection against every fault.

For a sense of scale, input candidate
[TI LM7480](https://www.ti.com/product/LM7480) integrates reverse-current and
reverse-input control, two external FET drives and overvoltage disconnect.
The 65 V range requires careful coordination near a 55 V normal ceiling;
the special high-surge application is not implicit in its basic connection.
It is a small WSON package, so not an iron-friendly leaded part. No physical
model was accepted or assigned in this pass.

Freshly opened [DigiKey FR LM74800QDRRRQ1](https://www.digikey.fr/en/products/detail/texas-instruments/LM74800QDRRRQ1/13627158)
listed 7,407 stocked, EUR2.79 single / 2.089 at ten. This is the IC only,
not the whole protection path. Power-FET and support-part prices in the
allowances above are not exact verified MPN quotations. Do not reuse this
input circuit unchanged at a reverse-connected output battery.

At 10 A, an illustrative 0.6 V diode drop dissipates 6 W; a complete MOSFET
path with 10 mOhm operating resistance dissipates 1 W. Actual selected hot
resistance/drop, pulse SOA and heat removal must be established. A diode also
changes voltage regulation/measurement placement, not only efficiency.

## Next engineering step

Keep the two mechanical controls and selected converter. Design the input and
output protection blocks against explicit fault states, including generator
open-circuit voltage, powered/unpowered logic, reversed battery, hot-plug and
alternate sensing paths. Choose the least complex circuit that meets those
states, then verify parts, physical models and costs before schematic changes.
No internal dump, external-converter mode or new GPIO is selected by this note.
