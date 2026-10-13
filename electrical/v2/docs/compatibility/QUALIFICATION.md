# Recovered hardware qualification checklist

Date: 2026-10-05. Research intake and test planning, **not a live wiring recipe**.
Use qualified help for high-energy/high-voltage testing or uncertain lithium
condition. Respect the actual prototype limits, not future V2 targets.

## Generator intake

Record one ID per physical donor, even when two labels look identical:

- Manufacturer, full model/revision, donor vehicle, label photographs, source
  and known history; motor type (PM brushed, PM BLDC, wound-field, other).
- Complete included hardware: wheel/shaft, axle hardware, torque arms, belt
  pulleys, controller, sensor harness and documentation.
- Corrosion, water/impact/heat damage, bearing play, rubbing, cable abrasion,
  loose magnets or abnormal noise. Do not test damaged rotating assemblies.
- Does driving the intended wheel/shaft actually rotate the magnetic rotor?
  Identify freewheel/clutch and direction. Do not defeat it as an intake shortcut.
- Manufacturer maximum speed, insulation and temperature information, or mark
  unknown. A vehicle battery label is not a generator-voltage specification.
- Mechanical drive ratio and mounting constraints. Include tire/roller slip,
  belt loads, torque reaction, exposed parts, apartment vibration and noise.
- Whether phases are accessible without bypassing or damaging OEM electronics.
  Sensor-wire colors and connector shape are not trusted pinout evidence.

Useful French search families, not endorsements or availability claims:
`moteur roue trottinette`, `roue hoverboard`, `moteur moyeu direct drive`,
`moteur velo sans engrenage`, `moteur MY1016`, `generatrice aimants permanents`.
Search exact model documentation before paying for a donor. Prefer lawful,
traceable ownership and local inspection over anonymous performance claims.

## Generator measurements to plan

No battery connected initially. Use a reviewed test fixture, guards, appropriate
instrumentation and a load able to dissipate the planned power. De-energize and
stop motion before changing connections. Account for bus-capacitor stored energy.

| Field | Meaning |
|---|---|
| `donor_id`, `test_id`, date | Traceability, never overwrite previous measurements |
| `crank_rpm`, `generator_rpm`, ratio | Distinguish rider speed from rotor speed |
| `open_circuit_dc_v` | After the identified rectifier; do not confuse with AC RMS |
| `loaded_dc_v`, `loaded_dc_a` | At each permitted load and cadence |
| `dc_ripple_min_v`, `transient_max_v` | Headroom and input-protection evidence |
| `crank_power_w` or measured torque | Optional measured quantity; not inferred solely from electrical watts |
| `field_supply_w`, `control_supply_w` | Include auxiliary input, especially for car alternators |
| `motor_temp_c`, `rectifier_temp_c`, `ambient_c` | Duration and steady-state condition required |
| `duration_s`, `noise_notes`, `fault_notes` | Continuous versus short test distinction |

Cover slow/normal/fast cadence and achievable loads progressively. Do not force
every donor to 400 W. Stop within conservative equipment/component limits.
Before deliberately testing receiver disconnection, engineer the overspeed,
overvoltage and braking-loss containment; do not just pull a live cable.
Compare total net output with total human and electrical inputs.

Store raw results under `electrical/measurements/` with revision and donor ID.
No new measurements are claimed by this decision pack.

## Receiver intake

For a station: exact model/region, original charging lead, input specification,
actual input mode, polarity, allowed power, maximum charger output voltage,
startup behavior, full-charge rejection and documented simultaneous AC use.

For a battery: exact chemistry and series count, manufacturer charging profile,
continuous charge current, temperature window, BMS charge permission, connector
pinout and rating, pack-terminal fuse/protection, history and competent state-of-
health assessment. Capacity in Ah does not by itself specify allowed charging.
Prefer an intact healthy used pack with original charger and documentation.

**Reject or quarantine for professional assessment**: swelling, leakage, impact,
water/heat damage, unexplained hot spots, corrosion, missing identity, suspected
cell replacement, incompatible charger, repeated BMS trips or deeply discharged
unknown packs. Do not attempt BMS bypass or forced wake/revival. A low purchase
price is not a reason to make one an apartment charging experiment.

For Bosch/Shimano and other OEM systems, start with the approved charger path.
Do not assume a charging handshake can be omitted or that a discharge port may
accept charge. An OEM pack's suitability for its own bike does not establish
manufacturer approval for second-life stationary storage.

## Pair acceptance

1. Mechanical back-drive works within speed/torque limits.
2. Actual source stays in the qualified converter input envelope under load and
   abnormal receiver states; adequate input current and cooling are available.
3. Output profile matches the exact receiver, including battery state and
   temperature, not only its full-charge endpoint.
4. Charging permissions and receiver-specific protections are effective.
5. Full/absent receiver, BMS opening, sensor failure, software failure and loss of
   control power lead to a defined safe state with no unintended motoring.
6. Torque-versus-cadence and sustained power are measured; a clean electrical
   test alone is not proof of comfortable or stable trainer behavior.
7. Record limits and evidence against the pair ID. "Qualified" is local to that
   hardware/configuration; do not promote the entire motor or battery family.

Do not connect experimental DC output to building mains, a vehicle charging
inlet, or another energy source. Commercial approved chargers/inverters remain
separate enclosed equipment used according to their manufacturers' instructions.
