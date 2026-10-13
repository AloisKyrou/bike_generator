# 70 V-class revision: approved scope

8 October 2026. This records the new requirement, not completed hardware
qualification. The previous 55 V requirement is superseded for the active
revision. Follow the subsequent saved schematic report for actual values.

## User decision

The user authorizes engineering and schematic changes toward 70 V-class input
AND output using the selected BQ25756. A lower usable endpoint resulting from
component tolerances is acceptable. Approximately 67.2 V is a useful receiver
target, but is not a guaranteed capability until the whole adjustment range,
reference trim, tolerances and operating states support it.

70 V is the controller's maximum recommended input/battery operating voltage,
not a tolerance-free nominal setpoint or a guaranteed board rating. Its 85 V
absolute maximum does not authorize operation there. Higher-rated external
parts do not increase the IC's rating. Product documentation must distinguish
the design class, guaranteed working range and tested transient withstand.

Primary source: [TI BQ25756, sections 5.1 and 5.3](https://www.ti.com/lit/ds/symlink/bq25756.pdf).

TI engineering also explicitly confirms that 16S lithium-ion operation is
possible; the advertised 14S limit leaves headroom for hot-plug transients.
That statement does not qualify this board's divider or protection:
[TI maximum-cell-count clarification](https://e2e.ti.com/support/power-management-group/power-management/f/power-management-forum/1375540/bq25756-maximum-cell-count-for-li-ion-battery).

## Retain

- Integrated BQ converter, independent mechanical/app CV, GPIO20 selection,
  two mechanical trimmers, MCP4251 with one spare channel, BQ I2C current and
  telemetry, native USB and optional protected 1S logic cell.
- No generator AUX, internal dump, external converter, new range GPIO, or INA.
- Approximately 400 W output ambition, with input/output current and thermal
  limitations; this is not an established autonomous power clamp.
- Hand-solderable choices where feasible, standard footprints verified against
  exact manufacturer packages, clear direct local schematic wiring, living BOM.
- Preserve V1, PCB, firmware, prior exports and unrelated user material.
  Commissioning links remain open; no energization or fabrication approval.

## Required checks

Recalculate voltage guards and programmable codes, input UV/OV network,
manual/app transitions, powered/unpowered selector stresses, power MOSFETs,
bulk and ceramic capacitors, inductor insulation/ripple/saturation, shunts,
gate-drive losses, connectors and fuse voltage/interrupt ratings. Changes
to passives alone do not qualify the whole board for the higher voltage.

Both manual maxima must be evaluated together. The existing approximately
9.11 A output maximum could request over 600 W near the new upper voltage.
Do not silently reduce useful low-voltage current or call app power limiting
an autonomous safeguard. The user has been asked whether a simpler globally
lower current ceiling is acceptable versus investigating hardware reduction
at high voltage. Until answered, preserve the current setting and document the
combined-power gate, rather than claim either alternative approved.

400 W is an ambition, not a new mandatory hard power ceiling. Engineering the
existing current limits for the higher-voltage corner is also a valid path if
losses, cooling and fault behavior support it. Do not add a hardware power
limiter merely because V times I exceeds 400 W: calculate losses first.
Conversely, neither limited human effort nor app derating proves that maximum
manual settings are safe with a sufficiently powerful external source.

## Protection priorities

The user accepts board damage after reversed wiring but prioritizes preventing
fire and damage to connected equipment. Prefer economical fault-energy
containment and justify additional active protection by the specific fault it
addresses. This is not a waiver of thermal/fault testing and not proof that a
fuse alone can make a sacrificial failure safe.

Investigate a correctly DC-rated fuse close to the receiver battery source,
with interrupt rating matched to prospective fault current. Check generator
fuse coverage: in the previous checkpoint the fitted rectifier can carry a
reversed direct-DC fault before F1. Fuse current alone does not establish
protection, and moderate-current overvoltage or overheating may not open it.

Backfeed is not synonymous with normal BQ battery standby. Intentional reverse
conversion requires EN_REV=1 (reset default 0). Verify startup, stopping,
ESP-off and fault states before adding a reverse-blocking circuit solely on
the basis that the controller is bidirectional. A rectifier-fed AC generator
and a direct DC motor do not have identical reverse-power paths.

The generic board need not know the generator model. Its specified voltage,
current and source-fault envelope must nevertheless be finite; no protection
against unlimited generator overspeed is claimed. Receiver charging settings
must be configured, not inferred from battery terminal voltage alone.

## Status

The schematic revision is saved: 146 components, 125 nets, eight sheets. Read
[the revision report](SCHEMATIC_VOLTAGE70_2026-10-08.md),
[review PDF](../kicad/exports/review-voltage70-2026-10-08/controller-v2.pdf), and
[cost dashboard](../bom/COST_DASHBOARD.md). The 142-component continuation is
historical. J2 is removed; the 100 V MOSFET/capacitor bank, CV guards/clamp and
revised input thresholds are drawn. Controls and current ceilings remain.

Nominal app CV reach with trim is about 67.66 V; modeled worst-corner reach is
about 64.37 V, so 67.2 V is conditional, not guaranteed per unit. Static CV guard
screening gives about 69.52 V maximum under its stated assumptions; ACOV screens
about 67.47-69.68 V. Neither calculation qualifies transient or fault protection.
ERC and connectivity tests pass. Hardware surge/receiver protection, handover,
thermal/ripple/stability and USB/cell qualification remain open. No PCB change,
energization, purchasing or fabrication was performed.
