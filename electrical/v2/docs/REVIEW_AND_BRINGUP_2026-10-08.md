# V2 review and qualification guide

8 October 2026. This guide accompanies the adaptive-control schematic rework.
It is a review checklist, not permission to energize, attach a battery, order
boards or use a computer as the first test instrument. The copied V2 PCB is
not synchronized with this schematic.

## What the design is trying to do

- Use a generator-fed BQ25756 buck-boost power stage, independently powered
  from the USB/optional-cell ESP logic.
- Set manual voltage with one screw trimmer. Select an independent digital
  voltage setting through GPIO20 and one MCP4251 channel. Leave its second
  50k channel available at the spare connector.
- Set an output-current ceiling with the other screw trimmer. Use BQ I2C
  current limits for lower operating currents and pedal-effort control.
- Use BQ input/output voltage and current telemetry in the integrated version;
  do not fit an INA simply to duplicate it before testing the BQ readings.
- Keep USB flashing, debugging and serial communication. No generator-derived
  auxiliary supply powers the ESP. This is not galvanic USB isolation.

The [control contract](explanations/BQ25756_CONTROL_CONTRACT.md) explains voltage
divider versus current-resistor/I2C control. The
[selector engineering](../../components/v2-cv-control/MCP4251_SELECTOR_2026-10-08.md)
gives the circuit, GPIO polarity, equations and power-loss limitations. The
[power-stage study](../../components/ti-bq25756/POWER_STAGE_UPRATE_2026-10-08.md)
records component-current, capacitor-ripple and protection calculations.
The [continuation readiness review](CONTINUATION_READINESS_REVIEW_2026-10-08.md)
adds the receiver/default-state matrix, exact NTC accessory and high-side
gate-drive margin checks. No-load, resistive-load and battery startup are
different operating cases.

## Review these points first

| Question | Present engineering answer |
|---|---|
| Does 55 V mean every board can regulate at 55 V? | No. It is the normal operating ceiling under review, not a guaranteed programmable endpoint. The selected CV circuit does not promise full 13S lithium charging at 54.6 V. |
| Is 400 W a proven rating? | No. It is an output-power ambition. Current, voltage, efficiency and thermal limits can reduce it substantially. |
| Is there a hardware 400 W limiter? | No. Input/output current limits do not by themselves impose a constant-power limit. A future app power cap does not operate when the ESP is off. |
| Do both knobs at maximum guarantee board safety? | Not yet. Static voltage/current endpoints are bounded; thermal, switching and fault qualification remains necessary at their combined corners. |
| Does the ESP always run through the lithium cell? | No. The Beetle-style diode/PMOS circuit selects USB or the optional protected cell, followed by the 3.3 V LDO. Charger operation is a separate branch. |
| Does losing USB reset the BQ? | Not necessarily. The generator or connected receiver may keep it powered. Its retained registers, including voltage fine trim, matter. |
| Is manual 12 V automatically safe for every receiver? | No. The trimmer must suit the receiver, retained trim can change the target, and failover transients are unqualified. A high-voltage battery above the selected target also invokes BQ battery-OVP behavior. |
| Can an external converter use the raw-bus connector? | Only as a defined alternative assembly/use case. BQ telemetry does not measure that bypass branch. It is not a second independently regulated receiver output. |
| Does an ESP-off BQ behave like a generic bench supply? | Not at cold start. Trickle/precharge, termination and charge timers are enabled. A load can prevent startup or cause termination/recharge cycling. |
| Is any 10k NTC suitable at J33? | No. Use the specified external Semitec 103AT-2 curve or a separately qualified equivalent; sensor placement still needs approval. |

The present input-divider calculation trips ACOV at about 54.21 V nominal
(53.39-54.59 V including initial comparator/resistor tolerance), and restarts
from undervoltage at about 10.36 V nominal. Thus this drawing does not promise
continuous conversion at 55 V input or low-voltage startup below 10 V. ACOV
inhibits switching; it does not disconnect the generator from exposed input
components. Temperature, leakage and transient effects still need evaluation.
The same divider starts input-voltage current foldback near 10.90 V nominal,
before undervoltage shutdown. It therefore does not promise full current
throughout the interval just above startup. Higher programmed VAC_DPM values
can raise that operating floor.

## Power envelope, without inventing a rating

For an illustrative operating point:

```text
Pout <= min(requested power cap, Vout * output-current limit,
            efficiency * Vin * input-current limit)
```

Run `node electrical/v2/docs/calculations/operating-envelope.mjs` from the
repository root. Its examples use proposed nominal ceilings of about 13.61 A
input and 9.11 A output, with an assumed 90% efficiency. Efficiency has NOT
been measured. Examples are approximately 131 W at 12 V in / 14.4 V out,
219 W at 24 V in / 24 V out, and 383 W at 36 V in / 42 V out. The 55 V
calculation examples illustrate current derating, not CV reachability.

Even an eventual 400 W output operating point needs more than 400 W input.
At the illustrative 90% efficiency it needs about 444 W, dissipating about
44 W across the converter. Rectifier and wiring losses depend on where input
power is measured and must not disappear from the thermal budget.

## Qualification order

These are evidence gates for a qualified bench setup with appropriate
current-limited sources, dummy loads and probing. They are not an instruction
to connect an arbitrary generator or lithium battery to the current drawing.

1. Freeze the schematic and verify its exported nets, ERC, part pin maps and
   visible wiring. Complete PCB layout, Kelvin routing, switching-loop layout,
   creepage/clearance, copper-current and thermal design before fabrication.
2. Qualify USB-only logic separately, with no generator or receiver connected.
   Check flashing, debugging, serial, reset and SPI/I2C idle states. Check
   current draw, LDO temperature and rail droop during radio activity and relay
   operation. Preserve JP20 open until the chosen protected cell's charge
   current and temperature requirements are approved.
3. Qualify optional-cell logic power: cell polarity/protection, charge behavior,
   plug/unplug transitions, USB backfeed, low-cell dropout and slow/abrupt rail
   collapse. A protected cell is not a substitute for charger qualification.
4. With the power stage still isolated, verify selector truth table: GPIO20
   high/floating selects manual; low selects digital. Verify reset leaves
   manual selected, code directions, spare-channel independence and no
   unexpected voltage at unpowered MCP/ESP pins.
5. Review a bounded-source, low-current first-power procedure for the full
   hardware. Use a dummy load, not a battery, initially disabled or sufficiently
   light to observe startup. Read BQ charging state and faults before demanding
   current. A 12-ohm resistor intended for 12 V / 1 A can stall in the default
   approximately 150 mA trickle phase around 1.8 V; do not increase source
   limits to force it through. Verify manual voltage, current ceilings and
   switching with a documented non-battery test profile before increasing
   power. Low-current commissioning does not mean a separate 1 A prototype.
6. Scope intentional manual/app changes and asynchronous ESP power loss at
   each intended receiver voltage. Monitor output, FB, 3V3, relay drive and
   the protected MCP terminal. Include reset, slow brownout, abrupt collapse,
   relay settling and relevant temperature corners. Demonstrate receiver
   voltage limits, not just survival of the MCP.
7. Characterize buck, boost and transition operation across the intended
   operating envelope. Measure inductor current/temperature, gate drive,
   MOSFET temperature, both shunts, capacitor ripple and BQ REGN/die heating.
   Measure high-side HIDRV-SW and BTST-SW differentially: bootstrap diode drop
   and Q/C droop mean high-side VGS is not simply REGN. Do not assume the
   SIR680 4.5 V Rds(on) guarantee applies throughout the on interval. Never
   clip an earth-referenced probe ground onto either switching node.
   Increase power only after the preceding point is understood and stable.
8. Qualify load rejection, overspeed/open-circuit generator voltage and
   input/output connection faults with a deliberately controlled test setup.
   Do not perform the first load-rejection experiment by disconnecting an
   unknown generator under load or attaching a valuable receiver.
9. Only then qualify a particular receiver profile, including its permitted
   voltage/current, chemistry, charge termination, temperature sensing and
   reverse-current behavior. Station DC-input power supply and direct lithium
   charging are different use cases. The BQ charger is not a battery BMS.

## Receiver profile and sensor checks

Preserve battery protections by default. For a supervised, battery-free supply
test, TI's supercapacitor guidance is EN_PRECHG=0, EN_TERM=0 and EN_CHG_TMR=0;
these are candidate non-battery profile settings, not permission to disable
those functions for an attached battery. Keep hardware/I2C current limits,
voltage limits and TS protection active. Confirm settings by readback and
record watchdog/reset behavior. No firmware was implemented by this review.

For battery profiles, program precharge and termination separately: lowering
ICHG_REG alone is not proof of matching IPRECHG/ITERM limits. The default
precharge transition is 71.4% of the voltage target and its hardware current
limit is 20% of the mechanical ceiling. With the ceiling at 9.11 A, this is
approximately 1.82 A even when a lower fast-charge command is intended. The
documented precharge/termination register minimum is 250 mA; do not claim
guaranteed precision for lower resistor-derived values without measurements.

J33 requires an external **Semitec 103AT-2**, 10 kOhm at 25 C, B25/85 = 3435 K,
or a curve-equivalent sensor independently approved for this assembly. J33's
board header is not the sensor or its harness. Verify sensor-open and
sensor-short suspension, ambient resistance, lead insulation, strain relief
and attachment. Record whether it measures a battery or a power-stage location;
one sensor does not establish protection of both. Do not replace it with a
fixed permissive resistor and claim thermal protection.

## Release gates that ERC cannot settle

- **Generator overvoltage:** the inherited TVS is not a proven clamp for the
  new 55 V operating envelope and downstream absolute maxima. An unloaded
  generator may rise above the operating limit. No internal dump is included.
- **Receiver failover:** relay contact timing and MCP brownout behavior can
  transiently request a higher voltage. The approximately 54 V static guard
  does not prove a 12/20/24 V receiver survives the event.
- **Continuous power and temperature:** the bridge needs dedicated cooling;
  converter bulk-capacitor ripple, REGN gate-drive losses and inductor behavior
  need verification. BQ die shutdown does not protect every remote component.
- **Autonomous current and power:** verify enabled resistor limits, retained
  I2C values and watchdog behavior. Neither a future software cap nor the
  nominal current settings independently proves safe combined power.
- **Lithium and USB:** approve the actual cell and charging conditions, and
  test the actual cable/source/load combinations. Copying Beetle does not
  automatically establish USB compliance or glitch-free low-cell operation.

Record measurements under `electrical/measurements/` with the actual schematic
revision, assembly variant, instrument settings and temperature. Preserve
failed tests: they are useful evidence for the next revision.
