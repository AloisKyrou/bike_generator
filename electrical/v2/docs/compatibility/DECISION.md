# Architecture decision for broader reuse

Date: 2026-10-05. **Recommendation for study, not approved architecture/parts.**
Source IDs: [evidence register](../../../components/generator-compatibility/README.md).

Update 2026-10-06: user direction now includes internal-stage fitted / omitted
with external converter variants, and excludes all internal dump hardware.
The [dated architecture requirements](../CONTROLLER_V2_INTEGRATED_SPEC.md)
supersede those assumptions below; component choices and voltage targets remain
provisional. No circuit changes accompany this update.

## 6 October follow-up: useful conversion and asymmetric current limits

This section adds real-use sizing cases after the BQ25756 discussion. It is a
study option, not a selected controller, changed schematic, approved bypass or
new operating rating. Earlier 20 A / 20 A and 80 V / 60 V targets below remain
historical comparison cases. A 55 V-class output does not define the acceptable
generator input voltage or its transient protection.

### AC50S from a regulated 12-14 V source

The [archived AC50S manual](../../../components/energy-receivers/bluetti-ac50s-user-manual.pdf),
printed EN-11 / PDF page 13, specifies 12-40 V input, 120 W maximum, and an
internal 11.1 V nominal battery with a 9.6-12.6 V range. Its internal charging
circuit handles the cells. An external 24 V supply is not required simply
because the receiver contains a battery. The manual does not establish the
internal converter topology or a 120 W acceptance guarantee at every input
voltage.

[BLUETTI's French AC50S page](https://fr.bluettipower.eu/products/bluetti-ac50s-station-energie-portable),
checked 2026-10-06, lists approximately 15 hours using a 12 V car adapter versus
4-5 hours using a 120 W solar panel. This indicates mode/voltage-dependent
charging performance, not a measured input-current curve. The page has other
inconsistent model imagery/specifications; verify the owner's physical unit.
Do not derive an exact 12 V current limit from these times or its 10 A output
socket rating.

Boosting to 24 V is useful only if it improves receiver acceptance, avoids
input dropout, reduces losses in the cable after the converter, or provides
needed source-loading control. It adds conversion losses and does not reduce
generator-side current for a given delivered power. Compare measured overall
energy delivery rather than asserting that an additional boost is always
better or always redundant with the station's charger.

Illustrative 90% external-converter efficiency, ignoring auxiliary power:

| Delivery target | Source current | Receiver current |
| --- | --- | --- |
| 12 V source -> 24 V / 120 W | 11.11 A | 5 A |
| 14 V source -> 24 V / 120 W | 9.52 A | 5 A |
| 12 V / 10 A-limited source -> 24 V | At most 10 A | At most 4.5 A / 108 W |

These are arithmetic bounds, not promises of AC50S acceptance or actual
efficiency. Generator/rectifier/excitation losses precede the source measurement;
station charging losses follow its input. A hypothetical receiver capped at
5 A would accept at most 60 W at 12 V versus 120 W at 24 V, but 5 A is NOT an
established AC50S input limit.

### Matched alternator and direct charging

A conventional automotive alternator already contains rectification and a
regulator controlling field excitation. See [Denso's manual](https://assets.denso-am.eu/production/attachments/Starter-Alternator-Technical-Manual-English.pdf),
pp6-8. An identified alternator with its correct regulator, excitation, speed
range and matched lead-acid battery can be a no-main-converter assembly. Keep
the proper battery fuse, cabling, polarity/thermal protections and safe stop
behavior. A smart LIN/ECU-dependent alternator is a separate qualification case.

This route offers monitoring and charging, not automatically programmable pedal
resistance. Battery acceptance and alternator regulation determine loading.
Field control could offer another control path only on a documented, qualified
alternator. Never assume a bare alternator behaves like a regulated bench supply
without its expected battery/excitation system; load rejection must be assessed.
Do not use battery disconnection under generation as an improvised stop method.

If a starter/buffer battery is added before a converter, it can supply the
converter while the rider slows or stops. Converter-input current then measures
alternator plus battery contributions, not rider generation alone. Monitor the
branches/net buffer energy separately; converter demand no longer directly
sets instantaneous generator torque.

### Candidate lower-cost envelope

Compare **15 A input / 10 A output**, with a separately qualified power/thermal
ceiling, against the historical 20 A / 20 A option. Do not promise continuous
400 W: it remains only an input-power sizing ceiling. For an illustrative 90%
efficiency, no auxiliary consumption, sufficient source and receiver acceptance:

```text
Pin <= min(400 W study ceiling, 15 A * Vin, available source power)
Pout <= min(0.90 * Pin, 10 A * Vout, receiver acceptance, thermal allowance)
```

| Source / receiver example | Illustrative output ceiling | Meaning |
| --- | --- | --- |
| 12 V source -> AC50S at 24 V | 120 W receiver cap | 15 A input allowance leaves conversion/auxiliary headroom versus a 10 A limit; actual thermal and acceptance tests still govern |
| 36 V source -> 12 V battery at 14.4 V | 144 W | Deliberately reduced low-voltage peak capability; adequate voltage is not a charge-profile approval |
| 36 V source -> 24 V battery at 28.4 V | 284 W | Subject to battery acceptance and thermal qualification |
| 36 V source -> documented 42 V / 2 A charge limit | 84 W | The receiver, not converter size, limits effort |
| 36 V source -> accepting station at 48 V | 360 W | Only if the unqualified 400 W input sizing point, receiver and thermal design all permit it |

At 12 V the candidate input limit gives at most 180 W input / 162 W output
before auxiliary draw; at 14 V, 210 W / 189 W. A 400 W input at 12 V would need
33.3 A, so it is intentionally excluded. A 20 A output at 14.4 V permits 288 W,
but that capability is not useful if the particular battery or rider cannot
supply/accept it. Inductor and MOSFET sizing must still include the greater
relevant current, ripple, transients and conversion ratio; a 10 A output rating
does not mean a 10 A inductor suffices.

Near-equal input/output voltage can still require active conversion to regulate
current and effort. Omit the main stage only in an explicitly qualified
monitoring/direct-charge assembly; do not add an automatic bypass that defeats
current control or protection. Keep no-internal-dump and receiver-limited effort.

### Next measurements

Use a suitable current-limited bench source, not an unqualified bare alternator,
to compare AC50S acceptance at 12, 14, 18 and 24 V. Confirm exact port/cable first;
start at low current. At comparable state of charge and temperature, record
input voltage/current/power, startup, oscillation, near-full taper and response
to source current limits. Compare direct and boosted routes at equal available
source power, including converter losses. Existing hardware is not an approved
test charger for arbitrary batteries.

Select one real alternator and battery before specifying excitation overhead,
cut-in rpm, efficiency or direct-charge wiring. Then choose the board envelope
from useful measured operating points, not the donor's automotive ampere label.

## 1. What changed the recommendation

The earlier buck-only recommendation optimized the owner's working 36 V scooter
generator -> 24 V AC50S installation. That remains correct for that pair.

The new goal includes low-voltage donors and valuable 36/48 V e-bike batteries.
That makes step-up conversion a real use case, not hypothetical feature growth.
A nominal-36 V conventional 10S Li-ion pack's 42 V full-charge example already
exceeds the current loaded generator voltage; 13S and 14S examples reach 54.6 V
and 58.8 V [D15,D16]. A higher-output *buck* still cannot raise a 36 V source.

**For broad direct-DC reuse, lead the study with a single non-inverting
buck-boost converter, roughly 10-80 V rectified input and 10-60 V output.**
These are provisional targets, with input/output current and thermal limits,
not a rectangular full-power promise. Keep 60/72 V nominal traction packs out of
initial direct scope. Retain the existing buck system as the baseline/testbed.

For a fast, low-risk first demonstration of e-bike charging, use a qualified
station/buffer and the original e-bike charger; this does not require immediate
redesign of the current buck. The dedicated own-motor e-bike route is a separate
pilot, not something automatically solved by the generic converter.

## 2. Most promising generator search order

| Order | Target | Why it is smart | What may erase the saving |
|---|---|---|---|
| 1 | Current scooter donor | Already operates in our system | Unknown limits still need measurement |
| 2 | Identifiable hoverboard / stand-up scooter PM hub | Accessible donor family and useful mechanical form | Axle clamp, roller fit, winding damage and speed ratio |
| 3 | Rear direct-drive e-bike hub | Enables own-bike generation experiment | Controller/harness and battery restrictions |
| 4 | Documented brushed PM shaft motor / purpose-sold pedal generator | Simple DC interface and belt-drive options | Brushes, gearing, noise and undocumented seller ratings |
| 5 | Skateboard outrunner | Compact if a suitable transmission exists | High rpm requirement, guarding and acoustic noise |
| 6 | Car alternator | Relevant to a matched lead-acid system and easy to recognize | Excitation, rpm, regulator interface, mass and net losses |

This is engineering priority, not a used-market ranking. Prefer a documented,
functional donor to a cheaper anonymous one. Do not transfer scooter/hoverboard
batteries into the receiver shortlist merely because their motors were useful.

High-Kv example: a 190 rpm/V skateboard motor needs roughly 4,560 rpm for 24 V
back-EMF under a consistent Kv convention; at 300 rpm the estimate is only
1.58 V before load/rectification effects [D08,D01]. Actual rectified output must
be measured. Motor wattage alone says little about usefulness at pedal speed.

A car alternator is not a permanent-magnet motor: field power, rectifier and
regulator are part of its system [D10,D10B]. A 50 W excitation/overhead example
would consume one-third of a 150 W effort before other losses, but **50 W is
only an illustration**, not a claim about a particular alternator. Measure net
output including any battery supplying the field before recommending one.

## 3. Receiver priorities

| Tier | Receiver | Reason / qualification |
|---|---|---|
| First | AC50S, one healthy 12 V battery | Existing useful sink and simple reference battery case |
| High-value expansion | One documented 10S e-bike pack, then 13S | Meaningful second-hand storage and direct evidence for boost |
| Camper expansion | Identified 12/24 V LiFePO4; larger station | Useful real storage with explicit BMS/charge constraints |
| Indirect-first | Bosch/Shimano and other OEM-integrated packs | Keep approved charger and battery interface intact |
| Later | 14S, 48 V camper bank, USB-PD | Adds output/validation scope without blocking first useful tests |
| Reject/defer | Unknown/damaged lithium, high-voltage traction, grid feed | Disproportionate risk or outside the proposed envelope |

A 42 V / 2 A approved charge limit is only 84 W, whereas a station's broad
input-voltage window can hide a different current limit. The [receiver catalog](receivers.csv)
therefore distinguishes voltage, accepted current/power and charging interface.
Neither converter size nor motor rating can force a receiver to accept power.

## 4. Conversion examples and bounds

| Actual source operating point | Selected receiver endpoint | Needed function |
|---:|---:|---|
| 36 V | 24 V AC50S supply | Buck, already demonstrated by user |
| 36 V | 14.2 V LiFePO4 charge example | Buck with battery algorithm |
| 36 V | 42 V 10S charge example | Boost at this operating point |
| 36 V | 54.6 V 13S charge example | Boost at this operating point |
| 12 V | 14.2 V charge example | Boost despite both being called 12 V systems |
| 15-60 V varying source | 42 V endpoint / varying pack voltage | Buck-boost over the full range |

Equal input/output is a regulation/dropout case, not a guarantee that a buck or
boost-only converter can control current there. An actual battery charges below
its final CV endpoint for much of the session; assess the whole battery range.

Provisional bounds, before detailed loss models:

```text
Pin <= min(400 W, 20 A * Vin, measured available generator power)
Pout <= min(eta * (Pin - Paux), 20 A * Vout,
            accepted receiver power, thermal limit)
```

Illustrative 90% converter efficiency, no auxiliary draw, sufficient source power:

| Vin | Input-current/power ceiling | Illustrative Pout ceiling |
|---:|---:|---:|
| 10 V | 200 W | 180 W |
| 12 V | 240 W | 216 W |
| 20 V | 400 W | 360 W |
| 36 V | 400 W | 360 W |

At 360 W output, 14.4 V requires 25 A, exceeding the provisional 20 A output
limit; 42 V needs 8.57 A and 54.6 V needs 6.59 A. Battery limits may be far lower.
The 400 W target is converter INPUT after generation/rectification, not rider
power, continuous qualification or guaranteed receiver delivery.

Increasing voltage via a converter reduces current only on its high-voltage
side. It does not reduce the current already flowing in the low-voltage generator.
No voltage rating guarantees good mechanical efficiency or smooth low-speed torque.

## 5. Architecture options, including cost and risk

| Option | Coverage | Cost / integration judgment | Verdict |
|---|---|---|---|
| A. Buck, output <=32 V | Current setup; selected 12/24 V batteries | Lowest main-stage complexity; excludes full direct charging of conventional 36/48 V e-bike packs | Good narrow product, wrong claim for broad compatibility |
| B. Buck, output to ~60 V | Above plus high-voltage packs only when generator remains higher | Wider output protection but still source-voltage dependent | Not a universal solution to the new goal |
| C. Single four-switch buck-boost, output to ~60 V | Low/high sources and selected 12-52 V nominal storage | Extra bridge/control/validation; one conversion stage | Preferred broad direct-DC study candidate |
| D. Buck plus separate boost charger | Staged proof-of-concept; potentially replaceable modules | More connectors and cascaded losses; competing control loops; boost-only cannot regulate all bypass cases | Bench comparison, not assumed cheapest final design |
| E. Existing generator + station + OEM AC charger | Broad approved battery interface without pack modification | Existing equipment can save development; extra losses and buffer dependence | Best immediate OEM-pack demonstration |
| F. Supported regenerative motor controller | Selected own-motor e-bikes | Can reuse mature torque-control power electronics; model-specific system and BMS work | Separate e-bike pilot; do not duplicate its phase bridge blindly |

Four-switch topology has two half-bridges instead of one and needs crossover
verification [D19]. The earlier 25-40% effort-saving estimate for buck was a
rough planning judgment; it cannot predict these complete architectures.
There is no defensible installed euro saving before candidate BOMs and mechanics.

For scale ONLY, two hypothetical 94%-efficient cascaded stages yield 88.36%
combined efficiency. A hypothetical single 92% stage would save 5.46 W at
150 W input, or 14.56 W at 400 W input. These are arithmetic examples, not
performance claims about our references or a reason to reject all modular designs.

Count total cost: donor acquisition, transport, axle/shaft adapters, frame and
guards, transmission, rectification, converter, protection, harness, heat sink,
qualified receiver/charger, test equipment and possible PCB revisions. A cheap
motor with inaccessible phases or unsuitable gearing can be the expensive choice.

The [existing reference study](../POWER_CONVERTER_REFERENCE_STUDY.md) remains
relevant: PMP7282 is instructional but not a drop-in 80 V-input stage; LTC3779 /
DC2456A is a broad-input buck-boost candidate, not a selected part or finished
charger [D20]. Main converter current-command design remains a selection criterion.

## 6. Trainer behavior and protections are shared requirements

- Hardware current, voltage and temperature limits, independent of firmware.
- Receiver-specific output OVP: a 60 V global ceiling cannot protect AC50S.
- Reverse-current blocking, rated disconnect, connector/profile identification
  and precharge where required; never passive-parallel unrelated packs.
- Input protection for overspeed and receiver loss; no reliance on a TVS to
  dissipate sustained rider energy. Output fault protection must consider input
  voltage reaching a low-voltage receiver.
- Receiver-limited resistance is the baseline, with a defined safe transition
  when charging becomes unavailable. No internal dump stage, even optional.
  An external GPIO-controlled load can extend resistance only while it is ready
  and accepting power. A load behind the converter inherits its dropout limits;
  a generator-bus accessory needs its own appropriate voltage/protection rating.
  Base safety must not rely on an optional accessory being connected.
- Account for starting/low-speed current, generator collapse, torque slew and
  emergency stop. High charging current is not a substitute for calibrated torque.
- Each lithium profile needs correct termination, temperature and BMS behavior.
  Low rider power or pauses must not be misread as end-of-charge taper.

## 7. Concrete next experiments and decision gate

1. Characterize the existing G01 -> R01 pair to establish the reference.
2. Inspect one hoverboard donor and one rear direct-drive e-bike donor. Reuse
   known parts first; no automatic purchases or battery opening.
3. Obtain one healthy, documented 10S pack **with its original charger**, or use
   an owned OEM bike via the indirect route first. No actual pack is selected.
4. Bench-test simulated 12/24/36 V inputs and 14.2/24/42/54.6 V outputs with
   current-limited supplies and suitable dummy loads before any lithium charging.
5. Compare a buck-boost reference approach with the current buck plus external
   approved charger route at 50/100/150 W and separately qualified higher loads.
6. Establish measured donor torque/cadence maps and receiver acceptance; then
   choose output/current scope, cooling and converter architecture with the user.

Do not freeze a 32 V-only PCB while claiming the new direct e-bike charging goal.
Conversely, do not redesign every block for "any generator" without selecting
the first qualified pairs. A useful initial target is current scooter + AC50S,
one 12 V battery, one documented 10S receiver, and one rear direct-drive donor.

No purchase, part selection, firmware change, KiCad mutation or fabrication
release is authorized by this research document.
