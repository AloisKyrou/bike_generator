# ESP to BQ25756 control contract

8 October 2026, reconciled with the saved adaptive/continuation schematic.
Design requirements and datasheet audit, not firmware or hardware qualification.
BQ I2C is connected to ESP through removable 0 ohm links R68/R69; R71 (10k)
pulls CE low. Independent manual/app CV is drawn. Its dynamic safety and the
complete application firmware remain unfinished. INA is no longer active.

## Confirmed voltage versus current behavior

Rechecked 8 October against TI SLUSEN5A sections 6.3.4.1.1, 6.5.1, 6.5.2,
6.5.13 and 7.2.1.2.2. Voltage selection uses the FB divider, with limited
I2C adjustment of its internal reference. Current uses a programming resistor
from ICHG to PGND, NOT another output-voltage divider. The lower enabled
hardware/register fast-charge current ceiling applies. Precharge and termination
have separate settings; do not apply this statement to every charging phase.

The saved circuit has independent manual/digital voltage paths,
GPIO20 handover, and a mechanical current trimmer plus fixed guard setting the
output-current ceiling. ESP varies the current register below that ceiling.
Example: manual ceiling 6 A, software request 2 A -> ceiling 2 A; software
request 8 A -> ceiling 6 A. Actual draw may be lower. Keep EN_ICHG_PIN enabled;
it is software-overridable, not an independent firmware-fault protection.
The shunt measures current; the small programming resistor does not carry
the load current. ESP power loss does not itself reset retained BQ settings.

U3 is now MCP4251-503E/SL, placed and connected through the relay/MOSFET selector
to FB. Channel 1 controls CV; channel 0 is spare on J7, both 50k. GPIO20
`CV_AUTO_N` selects app voltage when LOW; high/floating requests manual voltage.
The continuation leaves K1.9 explicitly unconnected to remove the pole-skew
grounding path. This does not qualify low-rail or abrupt-power-loss behavior.
See [part comparison](../../../components/v2-cv-control/DIGIPOT_SELECTION_2026-10-08.md).

The latest power clarification accepts current derating at high output voltage:
approximately 400 W OUTPUT would be an ambitious useful maximum, not 55 V x
10 A simultaneously. At an illustrative 400 W output cap and 10 A current
cap, the usable ceiling is min(10 A, 400 W / Vout), before receiver, input and
thermal limits: 7.27 A at 55 V. This is arithmetic, not a validated board rating
or an implemented BQ power-limit setting. Prior sizing documents used 400 W
INPUT; those cannot establish 400 W output. Losses require additional input
power (about 444 W at an assumed 90% efficiency, not a measured efficiency).
Enforcing the combined operating envelope with ESP absent remains engineering
work; separate current and voltage limits alone do not enforce constant watts.

## Implemented host connection

R68 links ESP SCL to BQ pin 1; R69 links ESP SDA to BQ pin 2. Shared R4/R6
4.7k pull-ups to ESP 3V3 are now on the MCU sheet; the former duplicate BQ
pull-ups are gone. J32 is a service connector, not a logic power input:
1=3V3 reference, 2=BQ SCL, 3=BQ SDA, 4=INT, 5=CE, 6=GND.
Do not inject external power at pin 1 or use external 5 V bus pull-ups.
Removing R68/R69 disconnects data only, not ground or the 3V3 reference.

R71 permits cold-start autonomous operation; redundant bench-enable JP32 is
removed. A CE bench-inhibit source must be current limited, for example with
an external 1k series test lead: software can repurpose CE as an open-drain
output or disable its inhibit function. It is not an emergency-stop input.
R70 keeps INT pulled to ESP 3V3 without consuming another GPIO.

The [independent interface review](../../../components/ti-bq25756/HOST_INTERFACE_REVIEW_2026-10-08.md)
records retained-register behavior, partial-power tests and service restrictions.
No isolator was added merely because the datasheet lacks an explicit Ioff
specification. That does not establish power-off isolation or USB protection.

## Latest operating preference: autonomous fallback, 8 October 2026

The user prefers conversion without ESP power at a hardware setpoint adjusted
by a mechanical screw trimmer, initially calibrated to approximately 12 V,
with the digipot branch disconnected. CE is now held
LOW rather than reserving a dedicated ESP enable GPIO. This supersedes the
earlier blanket requirement for no conversion whenever the ESP is absent;
it does not qualify an unknown receiver for autonomous charging. Both manual
trimmers, the automatic selector and CE pull-down are drawn; receiver-safe
handover and qualified autonomous operation remain unfinished.

Latest explicit request: make the fallback voltage mechanically adjustable
for standalone, non-pedalling uses too. Prefer a screw trimmer with fixed
limiting resistors, not an unrestricted pot as the sole divider leg. The saved
manual path uses 249k / (7.50k + Bourns 3296W 50k) with the wiper tied to an end
terminal. See the [main sheet guide](per_schematic/08_MAIN_CONVERTER.md) for
calculated endpoints and unresolved combined-power limits. 12 V is an initial
calibration, not an immutable safety ceiling. The user explicitly requires
INDEPENDENT manual and app settings; the prior permanent manual divider plus
parallel digipot proposal is superseded. The selected app value must not depend
on the screw position. The drawn independent selector still needs dynamic
qualification. Standalone supply use must qualify BQ charge
termination/recharge, timers, TS and startup behavior;
the battery-charger defaults do not establish a universal bench supply.

Disabling this four-switch converter is NOT a generator-to-output bypass.
Permanent enable therefore provides autonomous availability and a GPIO saving,
not an established improvement in overvoltage safety. A 12 V setpoint neither
forces a connected higher-voltage battery down to 12 V nor charges it normally.
At voltages above the new target, BQ BAT_OVP can stop switching and enable its
output discharge load (SLUSEN5A 6.3.9.1.3); quantify this attached-battery case.
Stored capacitor energy and transition overshoot also need checking.

Define hardware input/output current limits, compatible receiver profiles,
temperature behavior and fixed-divider tolerances before autonomous use. CE
LOW only permits operation: EN_CHG, TS, faults, timers and retained host
registers can still stop or alter it. ESP power loss is not a BQ reset, and
dropping the digipot branch does not reset current limits, operating mode or
the EN_CHG bit. Validate cold startup separately from loss/reset of a running
ESP, watchdog expiry and abrupt high-setpoint-to-fallback transitions.

Keep I2C start/stop for host-controlled operation; do not claim it replaces
independent fault protection. The host-start sequence below remains applicable
to transitions into adaptive control, but its universal inhibit-before-ESP
requirement is superseded for a qualified autonomous fallback profile.

## Register facts

Source: TI SLUSEN5A, sections 6.4 and 6.5, checked against the
[archived datasheet](../../../components/ti-bq25756/bq25756.pdf) and
[current TI publication](https://www.ti.com/lit/ds/symlink/bq25756.pdf).
Register words store their low byte at the lower address.

| Function | Address | Relevant behavior |
|---|---|---|
| I2C | 7-bit 0x6B | SCL pin 1; SDA pin 2; interrupt pin 3 |
| Voltage trim | 0x00 | 1.504-1.566 V feedback reference, 2 mV steps; default 1.536 V |
| Output charge current | 0x02 | 400 mA minimum, 50 mA steps with 5 mOhm; default 20 A; watchdog resets it |
| Input current DPM | 0x06 | Same current scaling; default 20 A; register reset, not watchdog reset |
| Watchdog | 0x15 | Default selection 40 s; first register write enters host mode |
| Charge enable | 0x17 | Enabled by default; watchdog behavior defaults to enabled; CE can be bypassed |
| Pin limits | 0x18 | Enabled by default; software can disable them |
| Reverse / MPPT | 0x19 / 0x1A | Both disabled at reset |

ESP reset is not BQ reset. The BQ can retain power from its input or receiver.
Watchdog expiry selectively resets registers, not the whole chip. Default
precharge transition is 71.4% of the voltage target, not 66.7%.

## Proposed division of responsibility

### Hardware and I2C current limits

Current control is NOT I2C-only. TI SLUSEN5A section 6.3.4.1.1 and the
ICHG/ILIM_HIZ pin descriptions specify hardware limits in addition to registers:

- ICHG pin 9 -> resistor to PGND sets output charge-current limit.
- ILIM_HIZ pin 10 -> resistor to PGND sets input-current limit.
- With both respective controls enabled, the lower hardware/register limit
  applies; actual current can be lower due to other regulation or receiver load.
- For the specified 5 mOhm output shunt, nominal ICHG_MAX = 50 A*kOhm / RICHG.
  Thus 50 kOhm -> 1 A, 10 kOhm -> 5 A and 5 kOhm -> 10 A. These are datasheet
  examples/calculations, NOT selected production defaults or board ratings.
- At cold reset the register defaults to 20 A so the enabled hardware setting
  can establish the lower limit. ESP loss alone does not restore cold defaults.
- EN_ICHG_PIN / EN_ILIM_HIZ_PIN can disable the pin limits through I2C. These
  are useful hardware-programmed ceilings, not tamper-proof independent safety.

Keep hardware current limits in the design and use I2C for dynamic adjustment
below them. The user subsequently APPROVED a second mechanical trimmer for
output current: RV1 is now 50k in series with a fixed 5.49k guard. Calibrate near
1 A initially; the nominal full adjustment is about 0.90-9.11 A, not a board
rating. Do not consume the spare MCP channel for current. R62 is now 1.47k,
establishing about 13.6 A nominal input ceiling with the selected 5 mOhm R1.
The earlier 1 A input study is superseded. This is a programming ceiling,
not proof that the bridge, converter or PCB can continuously carry that current.

### Charging phases versus appliance supply

Read the [continuation readiness review](../CONTINUATION_READINESS_REVIEW_2026-10-08.md)
for the sourced startup/reset matrix and calculations. Cold defaults include
trickle/precharge, termination and timers. A substantial resistor or MPPT load
can hold the output below a startup threshold; CE low alone does not select
generic power-supply behavior. A non-battery profile must deliberately configure
the relevant modes, without applying those changes blindly to a battery.

At a 9.11 A mechanical maximum, nominal resistor-derived precharge is about
1.82 A. An ICHG_REG request of 1 A does not by itself establish 0.2 A precharge:
set and verify IPRECHG and ITERM separately for a qualified battery profile.
ESP loss can retain mode settings; a full BQ power cycle can restore defaults.
Relay-to-manual voltage does not restore a whole charging configuration.

### Control roles

- Receiver profile: supported voltage, chemistry if relevant, current limit,
  charging behavior, temperature conditions and allowed operating range.
- Dedicated converter: fast switching and current/voltage regulation.
- ESP: choose valid profile, read telemetry and adjust input-current demand to
  achieve requested electrical power while respecting every receiver limit.
- Independent hardware: prevent unsafe energy transfer without relying on a
  successful ESP boot, I2C transaction or correct programmable register.

There is no promise of three independent knobs. Power equals voltage times
current. A constant-power request changes current as voltage changes; a receiver
limit or low available generator power can reduce the achievable pedal load.
The app must show that limitation, since there is no internal dump load.

## Startup sequence to design for

1. Hold power transfer inhibited independently of MCU firmware. USB connection
   must not by itself connect a receiver to an uncontrolled power stage.
2. Identify the populated converter variant and receiver profile. Unknown,
   inconsistent or corrupted configuration must not enable energy transfer.
3. Check logic supply, generator voltage, receiver voltage and temperatures;
   distinguish a battery already holding voltage from an initially unpowered
   appliance input. Do not use the latter's startup sequence for the former.
4. Configure and read back permitted mode, input/output limits, watchdog
   behavior and wide-range CV selection while the stage remains inhibited.
5. Validate the voltage selection and hardware protection state, then enable
   controlled startup. Ramp load demand and verify actual current/voltage.
6. On stale telemetry, bus failure, unexpected register reset, unplugging or
   profile change, inhibit transfer before attempting recovery. Do not enable
   reverse operation or MPPT as a recovery shortcut.

This sequence describes required behavior; it does not claim those independent
inhibits or measurements have already been implemented. CE and current-setting
pins remain useful operational controls, but their software-overridable nature
means they are not the complete independent safety system.

## Low effort and zero are different states

The 400 mA register floor is the lowest programmable current ceiling, not a
promise that the converter always draws at least that current. Receiver taper,
available energy and other regulation loops can make actual draw smaller.
However, a host request below the supported current-code range cannot simply
be encoded as a smaller number and assumed effective.

With a 5 mOhm input shunt, a 400 mA setting corresponds to a nominal input
power ceiling of 4.8 W at 12 V, 14.4 W at 36 V, and 22 W at 55 V. Off must be
a separate state. Arbitrary gentle load below this range needs a specifically
qualified method; do not introduce untested burst control, shunt substitution
or an internal dump to claim continuous smooth adjustment to zero.

## Integration work still required

The schematic host connection and CV selector are implemented; neither a clean
netlist nor a connected J32 proves partial-power behavior. Qualify off-state
injection, bus capacitance and recovery, relay/MCP brownout, receiver profiles,
retained-register behavior, and independent protection. BQ-only telemetry is
the accepted prototype baseline, but ADC resolution is not guaranteed accuracy.

Firmware must use MCP4251 commands, not the old MCP42100 format. Its SDO is
unconnected in this implementation; verify actual output through BQ telemetry
and calibrated instrumentation rather than claiming digipot register readback.
The one spare channel remains unused by the integrated converter. Test buck,
boost, transition and low-load regions before qualifying the assembly.

See [completion criteria](IMPLEMENTATION_NOTES.md),
[converter alternatives](CONVERTER_CHOICE.md) and
[main schematic explanation](per_schematic/08_MAIN_CONVERTER.md).
