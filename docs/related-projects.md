# Related Open Smart-Trainer Projects

Reviewed 2026-09-23 from the projects' own repositories and documentation.

The three projects below overlap with the bike generator at the FTMS,
calibration, or interoperability layers. None uses the same energy path found in
this project: human power -> electrical generation -> battery/dump load, with
pedaling resistance controlled by the amount of generated energy accepted.

This is a bounded comparison, not proof that no similar project exists anywhere.
Public-facing wording should therefore use "among the projects reviewed" or "I
have not found" rather than claiming absolute uniqueness.

---

## Comparison at a glance

| Project | What it starts from | Power/cadence source | How resistance changes | Main overlap | Main difference |
|---|---|---|---|---|---|
| [Arduino BLE Indoor Bike Fitness Machine](https://github.com/kswiorek/ble-ftms) | Conventional indoor bike | Separate crank ESP32 measures power and cadence | Second ESP32 mechanically turns the resistance screw | FTMS implementation, gradient/resistance mapping, DIY construction | Two controllers and a mechanical brake; no energy generation/storage path |
| [SmartSpin2k](https://github.com/doudar/SmartSpin2k) | Spin bike with resistance knob | External/native power and cadence sensors, or learned estimates | ESP32 drives a stepper on the existing resistance knob | Mature FTMS modes, feedback ERG, homing, calibration, safety limits | Automates an existing brake; it does not turn rider power into stored electricity |
| [Gymnasticon](https://github.com/ptx2/gymnasticon) | Obsolete/proprietary connected bike | Reads the bike's existing proprietary data | Generally does not create or automate physical resistance | Protocol translation, reusable device adapters, BLE/ANT+ interoperability | Raspberry Pi gateway rather than a trainer/brake design |
| **Bike Generator** | Recovered stationary bike + scooter motor | Measures 24V-bus electrical power; speed/cadence currently simulated | ESP32 changes the buck converter's CC setting with a digipot | FTMS, DIY hardware, open interfaces | The generator is both energy source and electromagnetic brake; energy charges a battery and dump loads |

---

## What this project already does

This is not an early trainer mock-up that still needs a resistance mechanism.
The difficult physical integration already works:

```text
rider -> transmission -> scooter motor/generator -> rectifier -> CC/CV buck
      -> 24V bus -> BLUETTI battery + permanent halogen dump loads
                                      ^
                                      |
                  ESP32 -> SPI digipot -> CC setpoint
```

The firmware also already forms a coherent end-to-end system:

| Layer | Current implementation | What that means |
|---|---|---|
| Electrical sensing | `sensors.cpp` averages the ACS712 and voltage-divider ADC readings and calculates `V_bus * I_bus` | The transmitted watts are real electrical output measurements, not invented values |
| Electrical actuation | `resistance.cpp` writes the MCP42100/DFR0520 connected to the buck converter's CC network | Resistance is already controllable electronically, with no motorised friction knob |
| Manual control | A 0-100 command and the EnOcean buttons map across the safe digipot range | The bike remains usable without a training application |
| ERG command | FTMS target watts are converted to a wiper setting using the measured `30 -> 120W` calibration, plus a small 5W margin | It provides useful target-dependent resistance today, although it is feed-forward rather than regulated ERG |
| Simulation command | FTMS grade maps to `80W + 14W/%`, clamped to 0-200W | Zwift can already make climbs harder and descents easier |
| Telemetry | Bus watts plus modelled speed and cadence are sent as FTMS Indoor Bike Data | Applications receive a complete usable packet; only watts are directly measured |
| Compatibility | Control has been exercised with Zwift and TrainerDay | Interoperability is demonstrated, not merely theoretical |
| Safety boundary | Every wiper write is clamped to `POT_SAFE_MAX`, currently derived from the 200W energy-sink budget | A software command cannot directly request the full 0-255 digipot range |

This is already most of the architecture of a smart trainer. The open projects
are useful mainly for making its calibration, feedback, protocol handling and
diagnostics more mature. They do **not** supply the central innovation of this
project: using useful electrical generation as the controllable brake.

### Where the present implementation is deliberately simple

Understanding these boundaries makes the improvement list more precise:

- ERG uses `target watts -> wiper`; measured watts are reported but are not fed
  back into resistance control.
- The single calibration point assumes the same wiper/power relationship at all
  generator speeds and load states.
- Simulation resistance uses only grade. Wind speed, rolling-resistance and
  wind-resistance values are decoded and logged, but not applied to the load.
- Speed is calculated from bus watts and a road model; cadence is a smoothed
  heuristic derived from power. Neither is a shaft or crank measurement.
- `POT_SAFE_MAX` is an actuator clamp, not an independent over-current,
  over-voltage or over-temperature shutdown.
- The FTMS server supports the commands needed for the working modes, but does
  not yet implement a strict control-owner/session state machine. Reset,
  start/resume and stop/pause are acknowledged without changing the physical
  operating state.

Those are refinement opportunities, not evidence that the current concept is
missing. In particular, a mechanical stepper system from another project would
be a regression here: the generator and converter already provide fast, quiet,
wear-free electrical actuation while preserving the harvested energy.

---

## 1. Arduino BLE Indoor Bike Fitness Machine

This is the closest compact reference for the basic FTMS concept. Its README
describes two ESP32 boards: one measures crank power/cadence, while the other
emulates the trainer, forwards data, receives simulation parameters, and moves
the bike's resistance screw. It also supports an SD-card resistance program.

Its most relevant lesson is editorial as well as technical: the author found a
nominally realistic physics conversion difficult to make feel realistic and
added a graphical configurator for a user-defined gradient-to-resistance curve.

### Ideas worth taking

- **Real cadence sensing:** its separate crank sensor confirms that cadence is a
  useful independent input. The local project should use a Hall sensor or other
  direct RPM input, not copy its two-ESP32 layout.
- **A configurable grade curve:** expose the existing
  `FLAT_POWER_TARGET + grade * POWER_PER_GRADE_PERCENT` mapping as a small table
  or curve. This builds directly on working simulation mode and lets the rider
  tune feel where exact road physics cannot reproduce low-speed generator
  braking.
- **A repeatable profile mode:** its SD-card workouts suggest a useful bench-test
  facility. Replaying targets such as 30/60/90/120W would make calibration and
  regression testing much easier, even if profiles are sent over serial rather
  than stored on SD.
- **Separation of concerns:** this is already present locally in
  `ble_ftms.cpp`, `control_modes.cpp`, `resistance.cpp`, `sensors.cpp` and
  `physics.cpp`; retain that separation as feedback control is added.

### Ideas not needed yet

- Two ESP32 boards add communication and maintenance complexity. The current
  ESP32-C3 can remain the single controller unless radio concurrency, pin count,
  or timing measurements demonstrate a need to split the system.
- Mechanically turning a resistance screw would duplicate a function already
  achieved electrically by the digipot.

### Best source locations to study

- [`code/indoorBike`](https://github.com/kswiorek/ble-ftms/tree/master/code/indoorBike)
  for FTMS control and resistance behaviour;
- [`code/configurator`](https://github.com/kswiorek/ble-ftms/tree/master/code/configurator)
  for the user-defined grade curve;
- [`code/powerCrank`](https://github.com/kswiorek/ble-ftms/tree/master/code/powerCrank)
  for direct cadence/power acquisition.

No explicit software license was visible in this repository when reviewed.
That makes it a reference for behaviour and architecture, **not a source from
which code should be copied**, unless the author supplies permission or a
license.

---

## 2. SmartSpin2k

SmartSpin2k is the strongest reference for control quality and productisation.
It uses an ESP32 and stepper motor to automate an existing spin-bike resistance
knob. Its current firmware implements FTMS control modes, sensor connections,
homing, step limits, persistent settings, logging, and a companion interface.

Its ERG controller is particularly relevant. SmartSpin2k learns a power table
indexed by cadence, measured watts, and stepper position. On a large target
change it uses the table for a feed-forward jump, waits for the mechanics and
power reading to settle, then applies bounded feedback correction. It also
handles minimum cadence and physical travel limits.

### Ideas worth taking first

1. **A two-dimensional calibration table**

   Replace the single `wiper -> watts` factor with:

   ```text
   (measured RPM, wiper) -> bus watts
   ```

   Generator loading depends on speed, so a one-dimensional calibration cannot
   represent the system over the full cadence range. In this project, `wiper`
   replaces stepper position and real generator RPM may be a better independent
   variable than crank cadence.

2. **Feed-forward plus feedback ERG**

   Use the calibration table to choose an initial wiper, then correct slowly
   from measured bus-power error. This is more stable than asking a fast PID to
   discover the whole setting from scratch. It also preserves the good part of
   the current implementation: `Resistance_SetFromPower()` already supplies a
   simple, immediate feed-forward estimate.

3. **Explicit limits and safe states**

   Treat minimum/maximum wiper, maximum current/power, minimum cadence, sensor
   validity, disconnect, and thermal limits as controller states rather than
   scattered clamps.

   The existing `POT_SAFE_MAX` remains a valuable final clamp. The improvement
   is to add a limiting reason and measured protections around it, not replace
   it.

4. **Persistent, inspectable calibration**

   Store the calibration version and samples, and allow export/import. Record
   the lamp configuration and load/battery conditions used to create it.

5. **Settling time and logging**

   After a resistance change, wait for electrical and mechanical transients
   before learning a calibration point. Log targets, measurements, wiper, and
   limiting reason together.

6. **FTMS procedure state**

   Track which client owns control, validate command lengths/ranges, make Reset
   restore a defined state, and make Stop/Pause unload the generator safely.
   This is protocol hardening around the already working local control point.

### What must be adapted rather than copied

SmartSpin2k controls a mechanical knob with position and travel endpoints. This
project controls an electrical converter and instead needs voltage, current,
temperature, speed, and safe-power envelopes. Stepper homing logic is therefore
not directly applicable, but its broader concept of known actuator limits is.

Its control loop also assumes that adding mechanical resistance has a broadly
repeatable relationship with cadence and power. Here the battery input,
converter operating region and dump-load temperature can all change that
relationship. A local calibration table should therefore record load state and
reject samples collected during voltage/current transitions rather than copying
the SmartSpin2k table blindly.

### Best source locations to study

- [`src/ERG_Mode.cpp`](https://github.com/doudar/SmartSpin2k/blob/develop/src/ERG_Mode.cpp)
  for the feed-forward/setpoint and bounded feedback sequence;
- [`src/Power_Table.cpp`](https://github.com/doudar/SmartSpin2k/blob/develop/src/Power_Table.cpp)
  and
  [`src/PowerTable_Helpers.cpp`](https://github.com/doudar/SmartSpin2k/blob/develop/src/PowerTable_Helpers.cpp)
  for sample validation, interpolation and monotonic correction;
- [`include/settings.h`](https://github.com/doudar/SmartSpin2k/blob/develop/include/settings.h)
  for control delays, table dimensions and safety/tuning constants;
- [`src/BLE_Fitness_Machine_Service.cpp`](https://github.com/doudar/SmartSpin2k/blob/develop/src/BLE_Fitness_Machine_Service.cpp)
  for a more mature FTMS implementation;
- [`test`](https://github.com/doudar/SmartSpin2k/tree/develop/test) for examples
  of native tests around firmware logic.

SmartSpin2k software is GPL-2.0. Its algorithms and architecture are excellent
study material, but directly copying GPL code would require compatible
licensing of the resulting combined firmware. For this MIT repository, the
safe default is an independent implementation based on the documented control
ideas, unless the project is intentionally relicensed.

---

## 3. Gymnasticon

Gymnasticon reads proprietary bike protocols and re-broadcasts standard BLE/ANT+
power and cadence. Its goal is to free existing bikes from discontinued or
closed software. The Raspberry Pi may act as both Bluetooth client and server,
with distinct adapters when simultaneous roles require it.

Gymnasticon is not close to the generator or resistance principle. It is close
to the project's ambition of keeping physical equipment useful through standard
interfaces.

### Ideas worth taking

- Define a clean sensor/actuator adapter interface so firmware, Web Bluetooth,
  Unity, and future hardware revisions share the same semantic data. The local
  firmware already has good module boundaries; the missing piece is a stable
  data contract that distinguishes measured, derived, target and limiting-state
  values.
- Keep scale and offset calibration explicit.
- Document which devices/apps are actually tested separately from those merely
  expected to work through a standard.
- Make adding a new data source a small, documented extension rather than a
  rewrite of the FTMS server.

### Ideas not needed yet

- A Raspberry Pi gateway is unnecessary for the current ESP32 implementation.
- ANT+ and proprietary-bike adapters should wait for a demonstrated use case.

### Best source locations to study

- [`src/bikes`](https://github.com/ptx2/gymnasticon/tree/main/src/bikes) for
  the replaceable bike-client adapter pattern;
- [`src/app`](https://github.com/ptx2/gymnasticon/tree/main/src/app) for
  configuration and composition;
- [`src`](https://github.com/ptx2/gymnasticon/tree/main/src) for the boundary
  between proprietary input, normalized bike data and standard output.

Gymnasticon is MIT-licensed, so its code is the least problematic to reuse with
the required copyright/license notice. Most of it is Node.js/Raspberry Pi code,
however, so its interfaces are more transferable than its implementation on an
ESP32.

---

## Recommended adoption order

The aim is to strengthen the existing bike incrementally. None of these stages
requires replacing the generator, converter, digipot, FTMS service or modular
firmware structure.

### Stage 0: document and test what already works

1. Add structured serial output containing timestamp, mode, FTMS target, grade,
   wiper, `V_bus`, `I_bus`, bus watts and clamp/limit reason.
2. Add host-side tests for the pure mappings: level-to-wiper, watts-to-wiper,
   grade-to-watts, clamping and FTMS byte parsing.
3. Create a repeatable 30/60/90/120W steady-state test procedure.

This gives the current design a baseline before its behaviour changes.

### Stage 1: measurement before closed-loop control

1. Add real crank cadence or generator RPM.
2. Log rectifier input voltage as well as 24V output voltage/current.
3. Characterise several steady RPM/wiper points.
4. Identify CC, CV, drop-out, and load-transition regions.

The first three measurements should answer whether the observed resistance
"knee" is normal constant-power operation, converter drop-out, BLUETTI input
control, or a combination. See the
[pedaling-resistance physics note](pedaling-resistance-physics.md) for the test.

### Stage 2: closed-loop bus-power ERG

1. Build an RPM/wiper/power calibration surface.
2. Keep the current linear mapping as a fallback feed-forward path.
3. Add slow, bounded correction from measured bus-power error.
4. Add minimum-RPM, sensor-validity, over-voltage, over-current and temperature
   states, plus ramp limits and anti-windup.
5. Offer a tunable grade-to-resistance curve before attempting exact road-load
   simulation.

This creates genuine regulation of **delivered electrical power**. It still
does not claim crank watts, because drivetrain/generator/converter losses have
not been measured.

### Stage 3: FTMS and product maturity

1. Persistent/exportable calibration and configuration.
2. Structured logs and automated test rides.
3. Complete FTMS session/ownership, reset and pause behaviour.
4. Real temperature monitoring and active dump-load control.
5. A hardware abstraction layer for alternate sensors, generators, batteries,
   and loads.

### Stage 4: optional ride-feel hardware

Only after measurements show that software cannot provide acceptable low-speed
torque should the project consider an additional eddy-current brake or flywheel.
That hardware would complement the generator below its useful voltage range;
it would not replace electrical energy recovery.

---

## Practical source-use summary

| Need | Best reference | Reuse approach |
|---|---|---|
| Understand FTMS packets and a simple grade curve | ble-ftms `indoorBike` and `configurator` | Study and independently implement; no explicit license found |
| Add real cadence acquisition | ble-ftms `powerCrank` | Use the sensing concept; a local Hall interrupt will be much smaller |
| Improve ERG response | SmartSpin2k `ERG_Mode.cpp` | Reimplement feed-forward + bounded correction for a digipot/electrical plant |
| Learn an RPM/wiper/power surface | SmartSpin2k power-table files | Adapt the sampling and validation concepts; do not copy GPL code into MIT firmware |
| Harden FTMS behaviour | SmartSpin2k FTMS service | Compare procedure handling and tests; independently implement |
| Add replaceable data sources | Gymnasticon `src/bikes` | Its MIT adapter pattern/code may be reused with attribution, but translate it to embedded C++ |
| Add ANT+/legacy-bike bridges | Gymnasticon | Defer unless a real integration needs them |

---

## Conclusion

The reviewed projects validate the FTMS and open-interoperability parts of the
approach. SmartSpin2k provides the most useful control-system precedent, while
ble-ftms supports configurable feel over overly confident simulated physics.
Gymnasticon validates the value of a clean translation layer.

The bike generator remains materially different in its physical principle: its
controllable load is also an energy destination. The next improvement should not
copy another mechanical trainer; it should apply their calibration and feedback
discipline to this project's electrical energy path.
