# Narrow independent review: CV approaches

8 October 2026. Read-only review of proposed circuits, not a review of saved
schematic connectivity. Neither proposal is accepted for energization here.

## Recommendation

Prefer continuing the guarded passive two-range digipot study, accepting one
extra GPIO if needed, over introducing an active op-amp feedback circuit.
The passive approach retains resistor-divider behavior and avoids another
analog loop. It still needs terminal-voltage protection, transition analysis,
calibration and converter-loop verification. Availability of a spare GPIO is
an architectural allocation decision, not a claim made by this review.

## Op-amp proposal findings

The proposed fixed output-voltage divider feeds a non-inverting op-amp.
MCP42100 channel1 forms the amplifier feedback divider: A=op-amp output,
B=ground, W=inverting input. A relay selects manual feedback or this output.
The ideal result is proportional to output voltage, preserving relative charge
thresholds; it does not have the offset-DAC threshold defect. Total MCP track
resistance tolerance largely cancels in the unloaded ratio.

1. **Unresolved stability risk.** A high-resistance pot has large wiper
   Thevenin resistance. At midscale with a 130 kohm track, it is 32.5 kohm.
   An illustrative 10 pF of combined terminal/input capacitance creates a
   490 kHz pole. A 10 MHz unity-gain op-amp at gain two can approach 5 MHz
   crossover, where this additional pole contributes approximately 84 degrees
   of lag. This is not a measured oscillation, but it invalidates assuming
   stability from the DC equations. Compensation across A-W and analysis of
   both the amplifier loop and BQ outer loop are required across all codes.

2. **Power-down output collapse.** An unpowered amplifier can pull BQ feedback
   toward zero before the relay returns to the manual branch. A fast isolator
   with a feedback pull-up is needed, or a rigorously bounded hold-up design.
   A supervisor plus bulk capacitance is only justified for an explicitly
   bounded rail load; it does not cover an abrupt 3.3 V short automatically.

3. **Power-off input injection.** A permanently connected output-monitor
   divider can feed the unpowered amplifier's input clamp. A second relay pole
   can remove this after release, but not during the release delay. Clamps,
   bleed paths, logic thresholds and partial-power states need analysis.

4. **Static resolution is promising, not a full qualification.** For ideal
   ratio beta=D/256 and monitor attenuation alpha, target voltage is
   Vref*D/(256*alpha). The available Vref trim span, 1.504..1.566 V, can bridge
   an illustrative two-code step once D is about 49 or greater. Actual INL,
   endpoint error, resistor tolerances, amplifier offset and discrete trim
   steps still matter. A clamp/isolation MOSFET outside the amplifier loop
   introduces a further load-dependent offset.

TI source for the proposed amplifier's properties:
[TLV9061 official datasheet](https://www.ti.com/lit/ds/symlink/tlv9061.pdf).
This review has not simulated the actual candidate circuit; the 10 pF example
is deliberately illustrative, not an asserted MCP datasheet capacitance.

## Passive alternative still requires checks

- **Coupled power is not bounded by separate voltage/current endstops.**
  Approximately 53 V times 9.9 A is 525 W output, already above the 400 W
  input architecture target before losses. This describes the future expanded
  envelope, NOT the saved study: R62=20 kohm and the 5 milliohm input shunt
  presently request approximately 1 A input while pin limiting is enabled.
  A future fixed 15 A input ceiling at 55 V would permit 825 W input;
  it would not be a 400 W limiter. Consequently these
  individual endstop calculations do not establish the user's requirement
  that turning both controls fully up cannot damage the board. Autonomous
  operation needs a conservative commissioning current guard, independently
  enforced power/thermal limits, or a stage qualified for the entire permitted
  V/I envelope. Firmware-only power limiting cannot qualify ESP-off operation.
- A high-voltage attached battery can raise MCP analog terminals above its
  supply unless the selected resistor network and protection prevent it.
- During power loss, MCP supply clamps can reduce effective feedback
  resistance while the relay is still on the digital path, increasing the
  converter's target. A relay alone is not proven sufficient.
- Break-before-make feedback transfer needs a defined non-runaway state.
- The fixed resistors must bound both manual endstops and digital/range
  extremes, including MCP tolerances, reference trim and resistor drift.
- The high divider impedance relative to TI's reference circuit requires
  explicit bias-current/noise/layout analysis and bench loop testing.

Conclusion: active ratio control is technically interesting, but currently
adds more verification work and components than the user's simplicity goal
justifies. The passive approach is preferred provisionally, not declared safe.
