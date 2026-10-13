# V2 adaptive controls: approved rework

8 October 2026. User-approved direction for the current schematic rework.
This records requirements, not completed circuitry, physical qualification or
permission to energize/order the board. Preserve V1 and the copied V2 PCB.

Implementation checkpoint: [saved schematic report](SCHEMATIC_COMPLETION_2026-10-08.md).
Both mechanical trimmers, GPIO consolidation, status LED, direct BQ I2C and
cold-start CE permission are drawn. Independent electronic CV selection and
qualified ESP-loss fallback are not.
The report and per-sheet explanations distinguish saved wiring from requirements.

## Latest clarification: final-current design

Newest user confirmation: approximately 400 W OUTPUT would already be an
excellent maximum; 55 V and 10 A are not required simultaneously. Derate
current with voltage/power/thermal limits. This output ambition differs from
the older 400 W INPUT sizing envelope below and is not a new continuous rating.
Input power must also cover losses; reconcile the design budget accordingly.
The user approves the recommended MCP4251-503E/SL dual 50k for the next rework.
Voltage-divider versus resistor/I2C-current behavior has been rechecked in the
[control contract](explanations/BQ25756_CONTROL_CONTRACT.md).

The user rejects continuing to design around the temporary 1 A input study.
Proceed toward the final schematic with at least approximately 10 A input
capability as a design objective; the prior 15 A input / 10 A output / 400 W
input sizing envelope remains provisional, not a guaranteed simultaneous or
continuous rating. Do not silently interpret this clarification as an exact
10 A ceiling or as permission for 550 W at 55 V.

Select the input shunt, programming resistor, MOSFET/driver, inductor, capacitor
bank, connectors and protection coherently for the final envelope. Low-current
first-power tests belong in commissioning on the full board, not as a permanent
1 A schematic target. The present saved R62 is still 20k; documenting the new
direction does not claim it has already changed. No PCB production is approved.

The user authorizes COMPARISON of higher-resolution dual digipots, while
emphasizing that MCP42100 remains a candidate and the required resistance range
must drive selection. Retain one CV channel and one spare. No replacement is
selected by this approval. Extra CV range GPIO allocation and custom shunt
footprint creation are still unapproved; the user requested explanations.

Review whether BQ input sensing and INA telemetry can share a suitable physical
input shunt before adding redundant hardware. This needs matching current path,
location, Kelvin/filter requirements, scaling and assembly variants. The INA's
I2C data cannot replace BQ's direct analog regulation inputs; BQ output sensing
is a different current and cannot simply reuse the generator-input shunt.

## Approved behavior

Latest researched recommendation under the user's alternative-part permission:
[MCP4251-503E/SL, dual 50k](../../components/v2-cv-control/DIGIPOT_SELECTION_2026-10-08.md),
with existing SOIC-14 footprint, observed stock and lower price, is preferred
for the next rework. Both channels become 50k; one stays spare. MCP42100 remains
the saved schematic/BOM part until replacement and model/interface verification.
No new architecture decision is required to continue; BQ-only telemetry should
be tried on hardware rather than retain INA by default because of uncertainty.

Latest user approval: use GPIO20 for protected manual/app CV selection. This
allows programming a valid digipot code before connecting the electronic path,
and returning to manual while ESP 3V3 stays present. No extra CV range GPIO is
approved. No selector is implemented yet; saved GPIO20 still drives MCP /SHDN.

Keep MCP42100 as the baseline. The requirement is reliable, known achievable
voltage settings and practical readback, not exact coverage of every requested
voltage or excessive decimal precision. Frequent effort adjustments use BQ
I2C current control. Compare alternatives only for concrete benefits, with a
verified available footprint, current stock and similar or lower price. Preserve
one CV channel and one spare. Do not add range switching merely to eliminate
every quantization gap. A coarse setting must nevertheless respect the selected
receiver's voltage limits; measured readback cannot make an unsafe step safe.

User accepts BQ-only telemetry as the default integrated-version direction:
omit the INA and its dedicated support parts from that assembly, unless tests
demonstrate a need for better accuracy. An external-converter version without
BQ needs a separate sensing decision; it does not justify fitting both sensors
by default. This approval is not evidence of BQ measurement accuracy.
The BQ ADC register steps are
2 mV for input/output voltage, 2 mA input with 2 mOhm (0.8 mA with 5 mOhm),
and 2 mA output with 5 mOhm. These are resolution, NOT guaranteed accuracy.
TI's datasheet supplies no ADC accuracy bound, and its
[BQ25756 support response](https://e2e.ti.com/support/power-management-group/power-management/f/power-management-forum/1594102/bq25756-bq25756-current-sensing-inaccurate)
explicitly confirms this. Current/voltage regulation accuracy is a separate
specification. Do not claim a percent wattmeter accuracy without measurement
and an error budget. Compare input voltage/current against reference instruments
across operating points, including low current and warmed-up operation; record
offset, gain and residual errors before deciding whether calibration suffices.
Do not use ADC readback as the only independent safety limit.

Implementation remains pending: the saved schematic and generated BOM still
include INA U1. R4/R6 on its sheet are shared I2C pull-ups and must remain for
the BQ/ESP bus. Do not delete R1 merely because INA telemetry is omitted; settle
its reuse versus R74 in the final BQ input power path first. The current Konnect
field-edit API exposes no native DNP flag; a custom property named DNP is not a
verified substitute. No schematic or BOM assembly flags were changed in this
decision-record update.

- Retain BQ25756 and 55 V normal input/output envelope; current/power ratings
  remain provisional until power-stage and thermal qualification.
- Two mechanical screw trimmers: autonomous output voltage and output-current
  ceiling. Initially calibrate to approximately 12 V / 1 A for commissioning.
  Approximately 12-55 V / 1-10 A are study ranges, not mandatory exact endstops.
- Both extremes of each trimmer must remain within the board's qualified
  operating limits, including component tolerances and relevant drift. A
  nominal 55 V endpoint with positive error is not acceptable. This does not
  mean every trimmer position is safe for every connected receiver.
- User explicitly requires INDEPENDENT manual and application voltage
  selection. Moving the manual screw must not alter the app's voltage map or
  minimum setting. The earlier permanent-divider/parallel-branch proposal is
  superseded; use a qualified selector between independent settings.
- Retain dual MCP42100 as the current baseline: channel 1 for electronic voltage
  selection, channel 0 spare. Later clarification permits comparing other dual
  parts, not silently replacing it or consuming both channels for CV.
- Use BQ I2C voltage fine trim where useful for calibration/quantization;
  this is not wide-range voltage selection and is not an accuracy guarantee.
- Mechanical output-current setting establishes the ceiling; the ESP uses
  I2C output-current settings below it. Keep the hardware limit enabled in the
  intended operating profile; software can bypass it, so do not call it an
  independent protection against arbitrary software faults.
- Adjust generator loading chiefly with I2C INPUT-current control, respecting
  the receiver output-current/voltage ceiling and available power. Off is a
  separate state; the current register does not provide continuous control
  down to zero. Firmware implementation remains outside this schematic task.
- Prefer autonomous conversion at the mechanical setting without ESP power,
  with the electronic CV path disconnected and CE held permitted. Qualify
  cold startup separately from ESP power loss with BQ registers retained.
- No internal dump, no generator-derived logic AUX, no multi-receiver output.
  Keep USB plus optional protected 1S and the Beetle-style TP4057/RT9080 path.

## GPIO and accessibility

- One configurable external GPIO connector consolidates action, Hall, PWM,
  READY and any additional available pins. Example uses become later profiles
  and tutorials, not permanent hardware assignments.
- Never couple an externally configurable signal to internal converter enable.
- GPIO21 may be used. Preserve native USB and boot recovery. Respect all
  strapping, startup-UART, analog and current restrictions per exposed pin.
- Prefer holding MCP /SHDN inactive and reusing GPIO20 for protected CV mode
  selection, if verified sufficient. Isolation cannot be replaced by /SHDN.
- Reclaim INA_ALERT from the ESP for I2C-polled telemetry unless the final
  protection design supplies a concrete reason to retain its GPIO.
- Add an ESP-controlled status LED visible from a future enclosure aperture,
  light pipe or remote LED connection. Charging LED is a separate indication.
- Provisional budget is five external GPIOs before any extra CV range-select
  control. An additional range control may reduce it; do not promise both five
  free pins and a new internal function using one of those same pins.

## Implementation quality

Prefer available economical fit-for-purpose parts, THT trimmers/connectors,
accessible leaded IC/discrete packages and 0805 passives where suitable.
Verify exact MPN, current availability, physical pin mapping and existing
footprint before placement. Search manufacturer/distributor models before any
new custom model; obtain required approval if creation is actually necessary.

Use continuous local wires, grouped support parts and clear signal flow. Keep
labels mainly at sheet boundaries or where wires would genuinely harm
readability. All KiCad mutations through Konnect with one schematic owner.

Save/export the complete hierarchy, run ERC and endpoint/model regression
checks, inspect rendered affected sheets, and obtain independent review before
claiming completion. Keep unfinished engineering and energization warnings
visible. Regenerate the overall BOM from the final fresh XML, not old exports.

## Open engineering questions

Additional questions were sent during the completion pass; latest status:

- Whether a CV range-select function may consume one external GPIO (four left
  instead of five). The current board still exposes five; no reassignment made.
- Whether a verified project-local footprint may be created for the candidate
  higher-power WSLP shunt if no suitable existing/vendor model is available.
  No custom footprint was created by this pass.
- Comparison of a higher-resolution dual digipot is now APPROVED, retaining one
  CV channel and one spare. Required resistance range, voltage/current limits,
  resolution, assembly and cost govern; no replacement is selected.

No preselected response is treated as approval. These questions do not reopen
the confirmed independent manual/app settings or the two mechanical trimmers.

Independent selector topology, protected MCP terminals, digital code coverage,
manual endstop tolerances, transition behavior, hotplug/attached battery,
power-off I2C, board thermal envelope and receiver-specific protection remain
engineering tasks. BQ25756 is a charger controller; unqualified standalone
operation must not be advertised as an unrestricted bench supply.

Datasheet correction: SLUSEN5A recommended maximum RICHG is 100 kOhm;
ILIM_HIZ's programming resistor maximum is 50 kOhm. Do not confuse the two.

### Combined endpoint requirement

Bounding each knob separately does NOT yet satisfy the user's board-safe
endstop requirement. Approximately 53 V times 9.9 A is 525 W at the output,
already greater than the provisional 400 W INPUT target before conversion
losses. A fixed 15 A input ceiling also does not impose a 400 W limit across
the whole input-voltage range. Firmware power limiting cannot establish the
required autonomous, ESP-unpowered behavior.

This is a constraint on the intended expanded-power design, not a claim that
the present isolated checkpoint can deliver 525 W. Its R62 = 20k with a 5 mOhm
input shunt still sets approximately 1 A input current while pin limiting is
enabled. That conservative study limit remains in place; it does not establish
the desired full-power capability or eliminate the later combined-limit task.

The drawn trimmer ranges are engineering candidates, not qualified operating
ranges. Before release, resolve the combined voltage/current/temperature
envelope through adequate power-stage qualification, a conservative hardware
current cap, or a suitable independent limiting strategy. Do not claim that
all knob combinations are safe based only on the resistor calculations.

See [control contract](explanations/BQ25756_CONTROL_CONTRACT.md),
[MCU guide](explanations/per_schematic/04_MCU_MODULE.md), and
[main-stage notes](BQ25756_IMPLEMENTATION_NOTES.md).
