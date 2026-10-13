# Can an e-bike charge its own battery on a trainer?

Date: 2026-10-05. **Feasibility study, not wiring instructions or approval to
charge a salvaged lithium pack.** Source IDs resolve in the
[evidence register](../../../components/generator-compatibility/README.md).

## Short answer

**Yes for selected compatible bikes; no as a universal own-motor adapter.**
Human pedalling supplies the energy. The motor runs as a generator while the
wheel rotates in its normal direction: "reverse the motor" means reversing
energy flow, not necessarily rotating the wheel backwards.

The easiest own-motor candidate is a **rear direct-drive PM hub**, with an
accessible supported electrical interface and a healthy battery whose approved
charging path can accept the generated energy. A stand must restrain the axle
and frame under braking torque, not merely lift the wheel off the ground.

## Mechanical compatibility comes first

| Bike arrangement | Can normal stationary pedalling drive its motor? | Initial verdict |
|---|---|---|
| Rear direct-drive hub | Usually yes: chain drives rear wheel and rotor | Best own-motor pilot candidate |
| Front direct-drive hub on rear-wheel-only stand | No: front wheel remains stationary | External drive/coupled rollers needed |
| Ordinary freewheeling geared rear hub | Wheel turns but clutch commonly leaves rotor disengaged | Not a simple own-motor adapter |
| Documented non-freewheeling geared hub, e.g. GMAC | Yes, subject to installation | Technically attractive exception |
| Conventional mid-drive | Pedalling does not establish a back-drive path through motor freewheels | External generator preferred unless exact model proves otherwise |

Grin documents the hub mechanisms and regenerative-controller requirement
[D02-D04]; GMAC specifically supplies a locked clutch [D06]. These are family
distinctions, not a substitute for inspecting the actual drivetrain. Do not
modify or lock a clutch merely to make a donor fit this project.

## Route A: use supported regenerative motor control

```text
pedals -> rear wheel -> mechanically engaged motor
       -> compatible regenerative controller -> approved battery/BMS path
```

A suitable existing controller may already regulate braking torque and return
energy to the battery. In this architecture, V2 could supervise/measure rather
than duplicate the motor power bridge. It is an alternative to our rectifier
plus DC/DC architecture, not another box automatically connected in parallel.

The Phaserunner manual distinguishes motor phase-current limits from battery
charge-current and voltage limits [D16]. This is valuable for trainer control,
but its examples of brief road-regeneration currents must **not** become our
continuous charging limits. Use the exact battery's continuous charging rating,
temperature constraints and supported regen path. Controller regeneration alone
does not establish a complete, approved charge-to-full algorithm.

Any powered controller also creates accidental-motoring risk. Training mode
needs an independently enforced no-assist state, safe startup, loss-of-command
behavior and an emergency stop. A software slider set to zero is not sufficient
proof that an unknown controller cannot accelerate the wheel.

## Route B: external rectifier and charger using the bike motor

```text
pedals -> rear wheel -> accessible motor phases
       -> rectifier -> protected buck-boost charger
       -> approved battery charging interface
```

Use a reviewed, interlocked selection between riding and generation modes.
The original controller must not remain connected to the same phases by an
improvised Y-cable: its MOSFET body diodes or drive commands can create an
uncontrolled battery path. Selection must occur with motion stopped and stored
energy made safe; do not design around hot-unplugging motor phases.

The pack can be the same pack that powers this motor during normal riding.
In generator mode it is only a receiver, apart from accounted control power.
Its BMS must remain effective. A separate charge port may have a much smaller
current rating than the discharge connector; charging through the discharge
port is forbidden unless explicitly supported by that pack/BMS.

A motor sold for a nominal-36 V bike does not deliver regulated 36 V when
pedalled. At a given speed its rectified voltage may be below the pack's present
voltage, and full charging may need 42 V [D01,D15]. This makes voltage step-up
useful. The complete speed/battery-state range may cross both sides of the
required output, making buck-boost preferable to a boost-only circuit.

## Route C: external generator and original charger

```text
ordinary bike or e-bike, assistance disabled
  -> external roller/belt generator -> qualified station/buffer
  -> compatible enclosed AC inverter/output -> original approved e-bike charger
  -> original battery
```

This reaches many bikes whose own motors cannot generate, without opening their
motor or battery electronics. It is the preferred first route for OEM systems
with unsupported direct charging. Bosch guidance calls for its original charger;
Shimano likewise specifies charger/battery combinations [D11,D12]. Do not treat
nominal voltage matching as manufacturer approval.

Use a commercial compatible AC output; designing a mains inverter is outside
this V2 study. Verify output waveform/power, charger startup and whether the
station permits charging while supplying AC. If not, collect energy first and
charge the e-bike afterwards. A buffer handles pauses and a charger drawing more
than instantaneous rider output, but it cannot fix a sustained energy deficit.

With the owner's AC50S, a charger drawing above its accepted charging input
will deplete the station even while the rider pedals. Log net energy in both
devices, not just the e-bike's increasing state of charge.

This route has more conversion losses and equipment, but less uncertainty about
the battery interface. It still does not guarantee mechanical fit for every bike,
and it does not authorize charging a damaged or unidentified pack.

## Realistic energy and resistance

Illustrative assumptions, not measurements: 150 W at the cranks and 60-80%
overall efficiency gives **90-120 Wh stored in one hour**. Replacing 500 Wh then
takes an ideal 4.2-5.6 riding hours, with taper, breaks and standby losses adding
time. A used pack's actual capacity may be lower than its label.

If a qualified 42 V pack permits only 2 A continuous charging, its electrical
intake is at most 84 W at that voltage and less earlier in the charge. It cannot
absorb every 150-250 W effort. Stronger training resistance needs another sink;
it is not a reason to exceed the pack's charging limit. At full charge, charging
stops and resistance must transition safely to a dump load or decrease smoothly.

Pedalling with battery-powered assistance enabled and routing generator power
back into the same battery is a lossy loop, not extra generation. Disable assist
and account for every supply, including excitation/control power.

## Apartment use and used batteries

Charging compatibility and fire protection are prerequisites, not later polish.
CPSC warns that chargers marketed for broad micromobility categories can still
be incompatible even when their plugs fit [D17]. V2 must use a verified profile
and connection for each accepted pack, not a "universal 36 V" adapter.

Reject packs with swelling, impact/water/heat damage, unknown repair history,
missing identification or unexplained faults. Do not bypass a BMS, open packs
to repurpose loose cells, or attempt revival of a deeply discharged pack as part
of this project. Use the original approved charger and competent condition
assessment before admitting a used pack to testing. No unattended indoor
experimental lithium charging; keep escape routes clear and follow the battery
maker's location and temperature rules.

Also evaluate roller noise, floor vibration, tire wear, exposed rotating parts,
stability and hot dump-load surfaces. Electrical compatibility alone does not
make a useful apartment trainer.

## First e-bike experiment

1. Identify one healthy, documented rear direct-drive bike/kit and its battery,
   charger and controller. Do not buy solely because a listing says "36 V".
2. Verify the mechanical back-drive path with assistance disabled and safe
   electrical separation; establish a low-energy test procedure.
3. Measure motor voltage versus wheel/crank speed into appropriate test loads,
   not directly into the lithium battery.
4. Select Route A or B only after controller and pack interfaces are validated.
   Otherwise use Route C with the original charger.
5. Test continuous charge limits, full-battery behavior, disconnection and
   emergency stop before evaluating simulated hills.

No actual bike/pack has yet been identified for this experiment.
