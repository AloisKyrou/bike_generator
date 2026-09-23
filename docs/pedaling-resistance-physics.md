# Why the Generator Resists Pedaling

This note separates what is physically happening in the bike from what the
firmware estimates. It also explains the observed behaviour where a 30W, 60W,
or 90W setting becomes progressively harder to reach, but seems to soften after
a particular pedaling speed.

The short version is:

> A generator only brakes while electrical current is being taken from it.
> The converter controls how much current the loads may receive. Once that
> limit is reached, the system behaves approximately like a constant-power
> load: pedaling faster no longer increases accepted power, so opposing torque
> decreases with speed.

That is the leading explanation for the observed "critical point". It should be
confirmed with the measurements described below because converter drop-out,
the BLUETTI input controller, or a protection cycle could make the transition
sharper.

---

## 1. Energy path

```text
legs -> cranks -> transmission -> scooter motor -> three-phase AC
     -> rectifier -> unregulated DC -> CC/CV buck converter -> 24V bus
     -> BLUETTI + permanently connected halogen loads
```

Energy is conserved across this chain, apart from losses:

```text
P_rider = P_bus + P_mechanical_losses + P_motor_losses
                  + P_rectifier_losses + P_converter_losses
```

The present ACS712 and voltage divider measure the **24V bus output** after the
buck converter:

```text
P_bus = V_bus * I_bus
```

This is real delivered electrical power. It is not exactly crank power. Crank
power is higher because bearings, the transmission, motor windings, rectifier,
and converter all dissipate energy.

If total efficiency is `eta_total`:

```text
P_rider ~= P_bus / eta_total
```

Efficiency has not yet been measured, so the firmware and portfolio should call
the reported value **bus electrical power**, not calibrated human power.

---

## 2. Why drawing electricity creates braking torque

A permanent-magnet motor used backwards behaves as a generator.

Its generated voltage grows approximately with shaft speed:

```text
E ~= k_e * omega_motor
```

When the circuit draws current, the magnetic interaction produces an opposing
torque:

```text
tau_motor ~= k_t * I_motor
```

`k_e` and `k_t` describe the same motor construction in different units. With
the electrical circuit open, voltage may be present but current is almost zero,
so electromagnetic braking is also almost zero. Only bearing friction, belt
losses, cogging, and air drag remain.

When the converter and loads draw more current, generator counter-torque rises.
That counter-torque is transmitted back through the belt/gearing to the cranks,
which is why increasing the electrical load makes pedaling harder.

The DC bus current measured by the ACS712 is not identical to motor phase
current, so it cannot be converted directly into motor torque without also
knowing converter efficiency, rectified input voltage, and the motor constants.

---

## 3. Power, torque, and cadence are different quantities

Mechanical power is:

```text
P = tau * omega
```

At the cranks, using cadence `n` in RPM:

```text
omega_crank = 2*pi*n/60
tau_crank = 60*P_rider/(2*pi*n)
```

For the same power, a slower cadence requires more torque per pedal stroke. The
following values are ideal lower bounds using electrical output power directly;
real crank torque is higher because efficiency is below 100%.

| Bus power | 60 RPM | 90 RPM | 120 RPM |
|---:|---:|---:|---:|
| 30W | 4.8 N·m | 3.2 N·m | 2.4 N·m |
| 60W | 9.5 N·m | 6.4 N·m | 4.8 N·m |
| 90W | 14.3 N·m | 9.5 N·m | 7.2 N·m |

If total efficiency were 70%, for example, all of those crank-torque values
would be about `1/0.70 = 1.43` times higher. This is only an illustration; the
actual efficiency must be measured.

---

## 4. What the CC/CV converter controls

The converter has two feedback limits:

- **CV** sets the maximum output voltage, nominally 24V.
- **CC** sets the maximum output current.

The digital potentiometer modifies the converter's CC setting. At a stable 24V
bus, an output-current ceiling is also approximately a power ceiling:

```text
P_bus,max ~= 24V * I_limit
```

Examples at a true 24V output would be:

| Nominal power ceiling | Approximate bus-current ceiling |
|---:|---:|
| 30W | 1.25A |
| 60W | 2.50A |
| 90W | 3.75A |
| 120W | 5.00A |

The current firmware does not command those currents directly. It assumes a
linear, single-point calibration between digipot position and measured power:

```text
wiper = target_watts * POT_CAL_VALUE / POT_CAL_POWER
```

Consequently, "30W mode" currently means "the wiper position predicted to give
about 30W under calibration conditions." It is not a closed-loop 30W regulator.
The result can change with speed, battery charge state, lamp temperature, and
converter operating region.

---

## 5. The operating regions felt by the rider

### Region A — below generator/converter cut-in

At low speed, generated voltage may be too low for the buck converter to hold a
24V output. A buck converter can only step voltage down; it cannot boost a lower
input to 24V. The electrical load is weak or disconnected and pedaling feels
light.

The precise cut-in speed depends on motor constant, transmission ratio,
rectifier voltage drop, converter minimum input/headroom, and BLUETTI behaviour.

### Region B — loaded, below the current ceiling

Once rectified generator voltage is high enough, current flows to the loads.
With resistive lamps, current and power rise with voltage; generator braking
therefore rises strongly with speed. This is the part that feels progressively
harder.

### Region C — CC ceiling reached: approximately constant power

When bus current reaches the configured CC ceiling while the output remains near
24V, accepted output power stops increasing:

```text
P_bus ~= constant
```

Ignoring losses, converter input current then behaves approximately as:

```text
I_in ~= P_bus / (eta_converter * V_in)
```

Generator voltage increases with speed. Therefore, above the power ceiling,
input current and generator counter-torque decrease approximately as speed
increases:

```text
tau_generator proportional to I_in proportional to 1 / speed
```

The rider first climbs toward a peak load, reaches the ceiling, and then finds
that pedaling faster does not demand proportionally more effort. Subjectively it
can feel like the resistance "lets go" or disappears. A higher 60W or 90W
ceiling moves this transition to a higher effort, matching the observation.

This is not how a purely frictional brake behaves. It is a natural consequence
of limiting **power** rather than maintaining **torque**.

### Region D — another device changes state

The transition can be more abrupt than the constant-power model predicts if:

- the buck enters/exits voltage regulation or drop-out;
- the BLUETTI changes its accepted input current or MPPT-like operating point;
- its input temporarily disconnects;
- the converter reaches thermal or over-current protection;
- hot halogen resistance changes the load sharing;
- the digipot/CC network is nonlinear near that setting.

These possibilities cannot be distinguished using only output watts.

---

## 6. How to identify the real transition

Measure at least these five values at the same time:

1. crank or generator speed (RPM);
2. rectified voltage **before** the buck (`V_in`);
3. current **before** the buck (`I_in`), if a suitable sensor is available;
4. 24V bus voltage after the buck (`V_bus`);
5. 24V bus current after the buck (`I_bus`).

Also record wiper position, lamp configuration, BLUETTI state of charge, and
whether the BLUETTI is connected.

For each wiper setting, hold several steady speeds from easy pedaling through the
softening point. Do not test by accelerating continuously: steady points make
the converter's operating regions visible.

Suggested table:

| Wiper | RPM | V_in | I_in | V_bus | I_bus | P_in | P_bus | Felt behaviour |
|---:|---:|---:|---:|---:|---:|---:|---:|---|
| | | | | | | `V_in*I_in` | `V_bus*I_bus` | |

Interpretation:

| Observation at the softening point | Likely explanation |
|---|---|
| `I_bus` plateaus and `V_bus` stays near 24V | Normal CC / constant-power ceiling |
| `V_bus` falls while `I_bus` is limited | Source voltage/drop-out or converter current limiting |
| `V_in` rises while `I_in` falls and `P_bus` stays flat | Constant-power behaviour confirmed |
| Voltage/current repeatedly jump or pulse | BLUETTI or converter protection/control cycling |
| Behaviour changes greatly without the BLUETTI | BLUETTI input control is part of the knee |
| Behaviour changes as lamps warm | Nonlinear lamp resistance/load sharing |

Run a comparison with the BLUETTI disconnected and a known, safely rated dump
load only. Keep the 10A fuse, remain below component ratings, and do not perform
this test without a guaranteed load for generated energy.

---

## 7. Consequences for control software

### Current firmware

- `Resistance_SetFromPower()` is feed-forward/open-loop.
- One calibration point assumes wiper-to-power is linear.
- Electrical power is measured, but it is not used to correct the wiper.
- Cadence and speed are simulated, so the controller cannot know actual shaft
  speed or actual crank torque.

### Recommended next control step

Build a two-dimensional calibration map:

```text
(real RPM, wiper position) -> measured bus power
```

Then add a slow, bounded feedback correction around that feed-forward map:

```text
error = target_bus_power - measured_bus_power
wiper = feed_forward(RPM, target) + bounded_feedback(error)
```

Required safeguards:

- real cadence or generator-speed sensor;
- minimum cadence before resistance is increased;
- wiper, power, voltage, current, and temperature limits;
- ramp-rate limits so resistance cannot jump;
- anti-windup when the requested power is physically unreachable;
- immediate safe minimum on sensor failure or disconnect.

This would make ERG genuinely closed-loop for **bus electrical power**. Calling
it crank-power ERG would additionally require a crank power meter or a measured
efficiency model.

### Simulation mode is a different problem

A road gradient is not a fixed wattage. Required road power depends on speed:

```text
P_road = (Crr*m*g + m*g*grade + 0.5*rho*CdA*v^2) * v
```

To reproduce that behaviour, the system needs real speed and a feedback loop.
A simpler, honest alternative is a user-tuned `grade -> resistance` curve. This
may feel better than claiming exact road physics before sufficient sensing and
low-speed braking authority exist.

---

## 8. Claims that are safe today

- Pedaling drives a motor used as a generator.
- Drawing more electrical current produces more opposing generator torque.
- The CC setting controls the maximum electrical load and therefore the felt
  resistance range.
- Bus voltage, current, and electrical output power are measured in real time.
- FTMS commands select calibrated resistance settings.

Claims to qualify:

- "30W resistance" means an approximate calibrated bus-output target.
- ERG is currently open-loop, not a guaranteed held power.
- Speed and cadence are simulated, not sensed.
- Bus electrical power is not identical to human mechanical power.

---

## References

- [maxon: Motor constants](https://support.maxongroup.com/hc/en-us/articles/360005873794-Motor-constants) — torque/current and generated voltage/speed relationships.
- [Texas Instruments: Constant-current/constant-voltage buck converter](https://www.ti.com/lit/an/snva829/snva829.pdf) — operation of CC and CV feedback loops.
- [Texas Instruments: DC/DC converter current limits](https://www.ti.com/lit/ta/ssztax7/ssztax7.pdf) — approximate input/output power relationship in switching converters.
