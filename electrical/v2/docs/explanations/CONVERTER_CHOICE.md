# Main converter choice

8 October 2026. BQ25756 remains the selected schematic candidate; this
comparison does not authorize a substitution or a new custom model.

Later 8 October direction: proceed with the BQ25756 baseline and retain the
dual MCP42100, one channel assigned to CV and one spare on its connector.
The [single-channel analysis](../BQ25756_IMPLEMENTATION_NOTES.md) is the next
implementation path. Alternatives below remain background, not a requirement
to redesign around BQ25758 or remove the requested dual potentiometer.

## Why BQ25756 was selected

It combines buck-boost conversion, digital current control, telemetry and
battery-charge functions. Existing TI reference files reduce implementation
uncertainty. Its 70 V controller-level operating ceiling provides more headroom
above the project's 55 V working target than a 60 V controller, without making
our board automatically 70 V capable. Precision feedback is useful for direct
charging, but resistor and system errors must be added to the IC accuracy.
[BQ25756 datasheet](https://www.ti.com/lit/ds/symlink/bq25756.pdf).

The compromise is wide CV selection: I2C adjusts current directly, but voltage
only around the external feedback ratio. We still need an appropriate switched
divider or another qualified setpoint circuit. A direct MCP42100 connection is
not assumed safe or accurate. TI explicitly identifies this distinction and
suggests BQ25758 as an alternative when broad digital voltage selection matters.
[TI application discussion](https://e2e.ti.com/support/power-management-group/power-management/f/power-management-forum/1371530/bq25756-controlling-output-current-and-voltage-of-the-charger-controller-chip).

## Shortlist

| Candidate | Advantage for this project | Main tradeoff |
|---|---|---|
| BQ25756 | Charger functions, digital current, useful input headroom, existing project evidence | Needs extra wide-range CV circuit |
| BQ25758 | Direct I2C voltage from 3.3 to 60 V in 20 mV steps, input/output current control | 60 V operating ceiling, voltage accuracy and charging supervision need scrutiny |
| LM51770 | 78 V input/output capability, analog/PWM voltage tracking, average input/output current monitoring/limiting | Different control interface and compensation design; not the same integrated charger/telemetry solution |
| LM51772 | I2C voltage/current configuration | Standard digital voltage range reaches 48 V; 55 V input ceiling offers little margin at our upper target |
| LT8705 | Wide voltage headroom and four voltage/current regulation loops | Analog setpoint interface and compensation; does not inherently remove external ESP setpoint circuitry |

Sources: [BQ25758](https://www.ti.com/lit/ds/symlink/bq25758.pdf),
[LM51770](https://www.ti.com/lit/ds/symlink/lm51770.pdf),
[LM51772](https://www.ti.com/lit/ds/symlink/lm51772.pdf),
[LT8705](https://www.analog.com/media/en/technical-documentation/data-sheets/8705ff.pdf).
These are IC-level comparisons, not approved board voltage/current ratings.

## The serious alternative is BQ25758

For a broadly programmable source feeding power stations or other receivers
with their own chargers, BQ25758 is an attractive simplification. For direct
battery charging it lacks BQ25756's precharge/termination functionality, so
the overall safety and charging responsibility grows. TI's stated +/-2% output
accuracy also matters: 54.6 V plus 2% is 55.692 V, above our 55 V ceiling and
potentially a pack's permitted voltage. Resolution is not accuracy. Calibration
alone is not independent protection. Verify the exact operating-point error
budget and necessary guard bands before accepting direct-pack profiles.

This is not a drop-in substitution despite the related package: for example,
the feedback interface and pin 17 function differ. Reconcile pins, registers,
capacitors, stability, power-off states and thermal behavior from scratch where
they differ. The saved symbol must not simply be renamed.

## Recommendation and cost

There is no evidence that BQ25756 is universally the best or cheapest complete
solution. It remains a defensible charger-oriented baseline; BQ25758 is the
strongest focused challenger for simpler digital CV. Compare complete costs:
controller, voltage-setting circuit, protection, capacitors, cooling, firmware
and qualification effort. Do not choose from controller unit price alone.

The current BOM's 6 October BQ25756 observation is EUR 7.22 at quantity 1 and
EUR 5.589 at quantity 10; those are dated observations, not a fresh quote.
No refreshed equivalent price/stock comparison for all alternatives is claimed.
[Living pricebook](../../bom/pricebook.csv).

Before freezing the hardware: close the selected BQ25756 + single-channel CV
protection and accuracy gates. Reopen the controller choice only if that work
shows an unacceptable capability, cost or assembly tradeoff, and discuss any
substitution first. Do not silently give up direct-battery support or the spare
digipot channel just to simplify the circuit.
