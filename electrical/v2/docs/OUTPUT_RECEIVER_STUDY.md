# V2 output requirements from energy receiver study

Latest direction, 8 October 2026: the user authorized a
[70 V-class input/output rework](VOLTAGE_RANGE_REWORK_2026-10-08.md). The ranges
and architecture comparisons in this earlier study are historical, not the
current selected ceiling. Wider voltage reach alone is not receiver charging
approval; follow the new schematic report and calibration/qualification limits.

Date: 2026-10-05. Status: **PROVISIONAL engineering recommendation**, not a
validated charger specification or permission to connect an untested prototype.

Latest scope update: the user explicitly included used e-bike batteries and
diverse recovered generators. See the [compatibility decision pack](compatibility/README.md)
for the expanded catalogs, 42/54.6/58.8 V pack cases and own-e-bike feasibility.
The narrower buck-only recommendation is not a decision to exclude those cases.

V2 should have a programmable, current-limited output with explicit receiver
profiles. The first priorities are the owner's BLUETTI AC50S and nominal 12 V
camper batteries. A 24 V power-station profile and chemistry-specific battery
charging cover these needs. Study a **10-60 V output stage**, with initial
qualification at 12-30 V; compare its cost and efficiency with a 10-32 V stage
before selecting hardware. The wider range is useful for 48 V battery systems,
not necessary for the AC50S.

This is a representative engineering sample, not a market-share ranking.
Manufacturer input specifications establish candidate compatibility, not proof
that a current-limited generator converter will behave correctly with an MPPT.
Sources were checked on the date above. No receiver or power component is
selected for purchase by this document.

Four source PDFs are archived with SHA-256 checksums in
[`components/energy-receivers`](../../components/energy-receivers/README.md).

## Separate the two interfaces

**Bare battery:** V2 must provide the charging algorithm, current limit,
voltage accuracy, temperature handling and termination/float policy required by
that exact chemistry and model. Nominal battery voltage is not charge voltage.
A BMS is a protection layer, not a substitute for a charger.

**Portable power station:** feed its designated DC/solar charging input. Its
internal charger handles the cells. V2 supplies a bounded DC source and must
cooperate with the station's MPPT. Never connect to its 12 V output socket or
internal battery terminals. A 500 Wh capacity or 300 W AC output rating says
nothing about how much charging power its input will accept.

## Camper battery families

The voltages below are examples from the named sources, not universal presets.
Charge current must also respect battery capacity, condition, temperature, BMS,
cable and connector limits.

| Receiver | Manufacturer evidence | Consequence for V2 |
|---|---|---|
| Reused nominal 12 V automotive lead-acid | Victron's battery-type overview gives approximately 14.4-14.5 V for flooded starter batteries and warns they are unsuitable for deep/frequent discharge [S2]. | Useful low-cost experimental storage if healthy and identified; qualify capacity and self-discharge first. Do not assume every car battery is flooded: AGM/EFB need their own instructions. |
| 12 V deep-cycle AGM | Victron AGM normal-cycle absorption 14.2-14.6 V; float 13.5-13.8 V [S3]. | Multi-stage charging and battery-temperature compensation; 12 V fixed output cannot fully charge it. |
| 12 V gel | Victron gel absorption 14.1-14.4 V; float 13.5-13.8 V [S3]. | Separate profile; an AGM high-voltage setting is not a generic gel setting. |
| 12.8 V LiFePO4 | Victron Lithium Smart recommends 14.2 V absorption and 13.5 V float, with no voltage temperature compensation; charging allowed at +5 to +50 C for this family [S4]. | Require BMS charge permission and temperature gating. Other models may specify different voltages or cold-charge limits. |
| 24 V camper bank | Victron gives 28.4 V absorption / 27 V float for its 25.6 V lithium batteries [S4]. Charger examples include 28.8 V normal and 29.4 V high for nominal 24 V lead-acid [S5]. | A 30-32 V output ceiling covers ordinary 24 V charging, subject to exact battery instructions and regulation margin. Series connection must be permitted by the battery maker. |
| 48 V storage bank | Victron gives 56.8 V absorption / 54 V float for compatible 48 V lithium systems [S4]. | Requires more than a 48 V maximum output. A 60 V-class output envelope is a useful study target, with tolerance/overshoot margin above the selected charge setpoint. |

For reused lead-acid storage, include a terminal fuse, polarity protection,
ventilated installation, battery-temperature sensing and fault rejection. Do not
implement automatic desulphation/equalisation in the first prototype. The exact
battery model and charge instructions remain an acceptance gate.

## Portable power stations

The proposed V2 settings in this table are engineering candidates, not
manufacturer-approved third-party charger settings. All require connector,
polarity and dynamic-load verification on the exact unit.

| Exact receiver | Published charging input | Candidate V2 profile / limitation |
|---|---|---|
| **BLUETTI AC50S**, owner's priority | Official linked manual: **12-40 VDC, 120 W maximum** [S1]. | Start qualification around **24 V**, ramp from low current; eventual power cap no greater than 120 W. At 24 V, 120 W corresponds to 5 A. Set normal operation below the hard cap to allow measurement error. |
| EcoFlow RIVER 2 Max, EFR610 | **11-50 V, 13 A, 220 W maximum** [S6]. | 24 V gives 220 W at about 9.17 A, if the selected cable/input mode permits. Cannot absorb a 400 W sprint. |
| EcoFlow DELTA 2 | Solar **11-60 V, 15 A, 500 W maximum**; car mode supports 12/24 V and defaults to 8 A [S7]. | Candidate 36 V profile: 400 W would require 11.11 A before applying our lower available-output limit. Confirm solar-mode cable identification; car mode may cap intake. |
| BLUETTI AC180 | Solar **12-60 V open circuit, 10 A, 500 W maximum** [S8]. | Candidate 48 V profile: 400 W would require 8.33 A. At 24 V the 10 A input ceiling bounds intake to at most 240 W, possibly lower in car/low-voltage mode. |
| Jackery Explorer 1000 EU/UK, original 1002 Wh model | Regional support states **12-30 V, 7.5 A** [S9]. | Candidate 24 V, no more than 7.5 A; arithmetic ceiling 180 W is not a verified unit intake rating. Product pages disagree on power, so validate the exact label/manual before enabling a profile. Do not substitute Explorer 1000 v2 specifications. |

### AC50S evidence and first test

The manual linked by BLUETTI's own support site is the primary source [S1]. It
specifies 12-40 V / 120 W on printed page 10 (PDF page 12). Some regional product
material quotes a 14-40 V solar window. Use 24 V as a provisional operating
point comfortably inside both; do not design around the disputed lower edge or
the 40 V ceiling. Input current and exact connector/polarity must be confirmed
on the owner's unit; do not infer a 10 A input limit from its output socket.

Test a current-limited bench source and the actual charging lead first. Record
startup voltage, input current, low-power cycling, charge acceptance near full,
and response to abrupt source removal. At 100 W delivered, an hour adds at most
100 Wh before station charging losses: roughly 20% of its nominal 500 Wh.
120 W into a 500 Wh capacity gives a 4.17 h ideal energy bound, not a real full
charge time. Taper and losses extend it.

## What should our maximum be?

Do not choose V2's voltage from the largest number printed on a station. The
required operating point can be substantially below its maximum input voltage.
The AC50S needs neither a 40 V setpoint nor 400 W. The broader reason to study
60 V capability is 48 V batteries and lower cable current at higher output
power.

| Scope option | Coverage | Trade-off |
|---|---|---|
| 10-32 V programmable output | 12/24 V batteries, AC50S, lower-voltage operation of many stations | Lower output-side voltage stress; cannot fully charge 48 V banks and cannot use full available power into a 10 A station input at low voltage. |
| **10-60 V study envelope** | Above plus compatible 48 V storage and 36/48 V station profiles | Wider conversion ratio, greater voltage stress and more demanding protection. 60 V is an upper envelope, not a universal receiver setpoint or component rating. |

**Recommendation:** carry 10-60 V / up to 20 A output as a provisional sizing
case, with receiver-dependent and thermal limits. Compare both options before
committing to the wider hardware. The inherited architecture's **400 W is an
input ceiling**, not a promise of 400 W at the receiver.

```text
Pin <= min(400 W, Vin * 20 A, available generator power)
Pout <= min(eta * (Pin - Paux), Vout * Iout_limit,
            receiver power limit, thermally allowed output power)
Iout_limit <= min(20 A provisional hardware target, receiver current limit,
                  battery charge limit, cable/connector limit)
```

Here Pin is measured at the rectified input; eta includes downstream conversion
losses after auxiliary consumption Paux. Generator/rectifier losses occur before
that measurement. Use measured efficiency later. Ignoring Paux solely for an
illustrative 90% efficiency case, 400 W input yields at most 360 W output:

| Output operating point | Current for 360 W | Constraint |
|---|---:|---|
| 14.4 V | 25 A | Exceeds proposed 20 A output ceiling; output is at most 288 W before battery/thermal limits. |
| 24 V | 15 A | AC50S profile still limited to 120 W, corresponding to 5 A. |
| 28.4 V | 12.68 A | Suitable sizing case for 24 V batteries; battery/BMS may demand less. |
| 36 V | 10 A | Within DELTA 2 solar current range, not AC50S's allowed power. |
| 48 V | 7.5 A | Within AC180's published voltage/current window; qualification still required. |
| 56.8 V | 6.34 A | Candidate for identified 48 V batteries, with hardware voltage margin. |

For a typical 100-150 W rider input, a 90% illustration gives 90-135 W before
allowing for auxiliary power. Therefore AC50S is a good first receiver but can
limit resistance at stronger riding levels. Actual continuous and timed peak
ratings remain thermal-test results, not these arithmetic bounds.

## Converter and control consequences

1. **Buck versus buck-boost is now an explicit decision.** A buck requires input
   above output with implementation-dependent headroom. It cannot deliver 24 V
   when the generator bus is 15 V. High-voltage charging may therefore work only
   at higher cadence. TI describes buck-boost operation across both sides of the
   output voltage [S10]. Measure the generator curve before deciding whether
   lower-cadence support justifies that architecture. No controller is selected.
2. Measure both input and output voltage/current. Input power governs rider load;
   output limits protect the receiver. Current cannot be prescribed independently
   of what the receiver is willing to absorb.
3. Keep output disabled until a receiver profile is deliberately selected and
   connection checks pass. Do not auto-detect chemistry from terminal voltage.
4. Use hardware OVP, OCP and thermal shutdown, reverse-current blocking and a
   rated output disconnect. Size protection against an 80 V input fault, not
   merely normal 24 V operation. A MOSFET fault must not expose AC50S to the bus.
5. A global 60 V clamp cannot protect a 40 V-rated AC50S. Receiver-specific
   voltage protection needs an independent bounded mechanism, with tolerance
   and transient budgets. Connector/profile identification and wrong-profile
   protection are design requirements still to implement.
6. When the receiver rejects power, stop requesting generator power safely.
   Assess open-circuit generator overshoot and the loss of braking torque.
   Constant training resistance when a battery is full requires a separate dump
   load or another controlled sink. A TVS is not that dump load.
7. Validate MPPT interaction with source current limiting: startup, repeated
   scans, cadence changes, current-limit entry, no-load recovery and reconnect.
   Input-range compatibility alone is insufficient.
8. If multiple receiver ports are eventually fitted, give them independent
   conversion/isolation and a shared power budget. Do not parallel batteries
   or station inputs through passive adapter cables.

## Other useful energy receivers

| Receiver | Assessment for this project |
|---|---|
| Phones, laptops and USB power banks | Useful at modest rider power through a dedicated USB-PD source controller and properly rated cable. USB-IF specifies up to 100 W at 20 V/5 A for the earlier range and EPR levels up to 48 V/240 W [S11]. The USB service input planned for V2 is not automatically a PD power output. |
| Existing camper charger or MPPT feeding its house battery | Potentially reuses an approved chemistry-specific charger. Confirm that its input accepts this source and prove control-loop stability; solar voltage ranges alone do not authorize a regulated-source connection. |
| E-bike/tool batteries | Defer direct charging until exact pack, OEM interface and charging protocol are known. A pack label such as 36 V is not a safe charger setting. Prefer the approved charger fed by a compatible buffered supply; account for conversion losses. |
| 12/24 V lighting, fans or other DC loads | Useful direct consumption with a regulated output and undervoltage behavior; these consume energy rather than store it. Startup surges and interruption during pedalling need consideration. |
| Resistive dump load / useful low-temperature heating | Predictable sink for bench testing and maintaining resistance. Requires independent temperature cutoff, guarded hot parts and sizing for duration/airflow. Illustratively, 100 W for 1 h supplies 360 kJ, enough for about an 8.6 C ideal rise in 10 L of water, ignoring losses. |
| Supercapacitor buffer | Useful for seconds of transition rather than camper energy storage. E = 0.5*C*(Vmax^2-Vmin^2); 10 F between 24 and 12 V stores only 0.60 Wh usable, about 21.6 s at 100 W ideally. Needs balancing, current limiting and protection. |
| Grid export / traction EV charging | Outside this DC prototype's scope; do not treat a grid socket or an EV inlet as a generic DC receiver. |

## First V2 work packages

1. Preserve V1 and copy its project/libraries into an isolated V2 workspace.
   The copy remains V1 hardware until explicitly redesigned.
2. Characterize the owner's AC50S input and charging lead; qualify the 24 V /
   <=120 W profile on a bench source before generator operation.
3. Identify one real reused 12 V battery and one camper LiFePO4 candidate. Obtain
   exact charge profiles, temperature rules and BMS interfaces.
4. Measure rectified generator voltage versus cadence under 100/150/250 W loads
   plus open-circuit and load-disconnect transients. Compare buck and buck-boost.
5. Decide 32 V versus 60 V output scope, continuous current, peak duration and
   enclosure cooling. Do not select power parts before this review.
6. Design and simulate main conversion, receiver disconnect/protection and
   optional dump load; only then replace inherited V1 blocks in KiCad.

## Sources

- **S1:** [BLUETTI official user-guide index](https://www.bluettipower.ph/pages/user-guides), AC50S link to [500Wh Portable Power Station User Manual](https://cdn.shopifycdn.net/s/files/1/0370/4986/0229/files/User_Manual-AC50S.pdf?v=1605513303), printed p. 10 / PDF p. 12, input specification. Revision not stated in the extracted text.
- **S2:** [Victron, types of lead-acid batteries](https://www.victronenergy.com/knowledge-articles/2026/8/10/types-of-lead-acid-batteries), automotive/deep-cycle comparison. General orientation, not a reused battery's datasheet.
- **S3:** [Victron, GEL and AGM Batteries datasheet](https://www.victronenergy.com/upload/documents/Datasheet-GEL-and-AGM-Batteries-EN.pdf), p. 4, recommended charge-voltage table.
- **S4:** [Victron Lithium Smart Battery Manual, Operation](https://www.victronenergy.com/media/pg/Lithium_Battery_Smart/en/operation.html), sections 5.2 and 5.4.
- **S5:** [Victron Blue Smart IP65 230 V manual, Operation](https://www.victronenergy.com/media/pg/Blue_Smart_IP65_Charger_230V_manual/en/operation---bsc---psc.html), section 4.2.1. Charger examples, not a universal battery specification.
- **S6:** [EcoFlow RIVER 2 Max manual](https://websiteoss.ecoflow.com/cms/upload/2022/10/13/147935299_1665626253979.pdf), English specifications, PDF p. 9, EFR610.
- **S7:** [EcoFlow DELTA 2 manual](https://manuals.ecoflow.com/us/product/delta-2-portable-power-station?lang=en_US), specifications; [manufacturer product specifications](https://za.ecoflow.com/products/ecoflow-delta-2-solar-generator) corroborate 11-60 V / 15 A / 500 W solar input.
- **S8:** [BLUETTI AC180 English/German manual](https://s4.bluettipower.com/bluetti_lgf/support/2025/08/18511b5c-56c0-496e-98a8-6b779dd06344.pdf), specifications and section 4.3.2; [official product specifications](https://www.bluettipower.com/products/ac180?variant=44868697620699).
- **S9:** [Jackery Europe, Explorer 1000 Basic Information](https://helpcenter.eu.jackery.com/hc/en-gb/articles/52682932614171-Explorer-1000-Basic-Information), original EU/UK model; [UK product page](https://uk.jackery.com/products/explorer-1000-portable-power-station?country=GB) illustrates inconsistent 126/163 W claims. Power remains unresolved.
- **S10:** [TI, Power Topologies Handbook, buck-boost discussion](https://www.ti.com/document-viewer/lit/html/SLVAFJ5), topology principle only, not a selected design.
- **S11:** [USB-IF, USB Charger / Power Delivery](https://www.usb.org/usb-charger-pd), voltage and power levels. A conforming protocol controller is required.
