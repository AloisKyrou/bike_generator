# Manual Controls and Configurable GPIO Checkpoint

8 October 2026, afternoon. **Provisional; not for energization or fabrication.**
The requirement remains a full-function first physical prototype. This saved
increment implements the certain manual controls and interface changes; it does
not approve a reduced-function board or complete electronic CV/autonomous safety.

## Saved Changes

| References / sheet | Saved change |
|---|---|
| J5 | One generic 2x5 configurable GPIO header: odd pins 1/3/5/7/9 are GPIO2/3/4/8/10; every even pin is GND; no supply output |
| R7/R8/R9/R10/R34 | Five independent 1k series resistors, one per external signal; not field or ESD protection |
| R36/R37 | 10k pull-ups on MCU-side GPIO2/GPIO8 to preserve intended reset/download bias; accessories must not override strap levels |
| J22 | Former dedicated PWM/READY header removed; those uses become future configurable profiles |
| D22/R35/J28 | Kingbright WP710A10LID low-current red 3 mm THT LED, 1k from GPIO21, parallel remote LED connector; fit local OR remote LED |
| J3 | Separate I2C service connector preserved with the same four physical endpoints |
| MCU/root | INA_ALERT no longer allocated to ESP; sensor/testpoint/pull-up retained. SPI and GPIO hierarchy rewired coherently |
| R61/RV1 | 5.49k 1% guard plus Bourns 3296W-1-503LF 50k current-ceiling trimmer; ICHG -> R61 -> RV1.3; RV1.1+2 -> PGND |
| R66/R67/RV2 | Existing 249k 0.1% upper divider, new 7.50k 0.1% lower guard, second 50k 3296W manual-voltage trimmer; R67 -> RV2.1+2; RV2.3 -> FBG |

Direct wires show the series paths and wiper ties. Clockwise increases the
corresponding setpoint. Open wiper contact leaves the full track, lowering the
setpoint; broken tracks, solder faults and shorted guard resistors are separate
unprotected failures. Both trimmers are commissioning controls, not certified
safety devices. R61 and R67 exact MPNs remain unselected in the saved schematic.
The sourced R61 candidate is Yageo `RC0805FR-075K49L`, 0805, 1%, 100 ppm/C, 0.125 W;
its manufacturer specsheet is archived under `components/v2-manual-controls/`.

GPIO allocation is now explicit: GPIO0/1 I2C, 5/6/7 SPI CS/SCK/MOSI,
9 BOOT, 18/19 native USB, 20 existing MCP /SHDN, 21 status LED,
2/3/4/8/10 external. GPIO20 has NOT yet been reassigned to an unqualified CV
selection circuit. GPIO21 may pulse during ROM/UART boot and is not a safety
indicator. The user-approved MCP channel 1 CV / channel 0 spare allocation remains
an integration intention: neither channel is newly connected to BQ here.

## Limits and Deferred Work

- Initially calibrate approximately 12 V and 1 A. RV1's nominal output-ceiling range
  is approximately 0.90-9.11 A. Tolerance means exactly 1.000 A is not guaranteed
  reachable on every unit. R62 remains 20k and limits INPUT to nominal 1 A in this
  saved study; the output-ceiling range is not an available output-current rating.
- RV2 nominal POR endpoints are approximately 8.18-52.31 V using 33 ohm FBG switch
  resistance; the ideal-FBG upper endpoint is 52.53 V. The engineering corner
  calculation gives 54.04 V static maximum with the stated reference/resistor
  tolerances. This does not bound dynamic overshoot, every fault or receiver safety.
- Independent mechanical/app voltage selection is not implemented. Neither an
  unreviewed relay/active servo nor direct low-voltage digipot feedback was drawn.
  BQ power-off feedback can expose analog terminals to attached-battery voltage.
- BQ I2C still ends at its bench header, separate from ESP. Powered-off bus
  injection/back-power evidence is incomplete. Autonomous CE/host-loss behavior,
  retained register limits and independent fault protection remain unfinished.
- JP30/JP31 remain open and JP32 remains the open bench-enable link. No dedicated
  ESP CE GPIO was added. No generator AUX or internal dump was restored.
- Both controls at maximum are NOT a qualified safe operating point. At future
  expanded input current, roughly 53 V x 9.9 A would exceed the 400 W input architecture
  target. The current 1 A input setting limits this saved study but does not close
  the required future power/thermal protection gate.
- Existing 1 W WSL input shunt cannot support the 15 A candidate merely by nominal
  power arithmetic. WSLP25125L000FEA, 3 W, is a researched replacement, NOT selected:
  its 5 milliohm recommended 2.11 x 3.68 mm lands / 3.18 mm gap differ from stock 2512 pads.
  No matching installed footprint or legitimately downloadable verified vendor
  model was obtained. No custom footprint permission was inferred.
- Existing FET gate-drive loss, capacitive ripple/effective capacitance, inductor,
  HV protection, USB fault containment and Beetle discrete-selection gates remain.

See [manual-control evidence](../../components/v2-manual-controls/README.md),
[model acceptance](../../components/v2-manual-controls/kicad-model-validation-2026-10-08.md),
[CV study](../../components/v2-cv-control/README.md), and the
[control contract](explanations/BQ25756_CONTROL_CONTRACT.md).

## Verification

The [independent full-hierarchy review](CONTROL_REWORK_INDEPENDENT_REVIEW_2026-10-08.md)
found no new wiring, pin-map or rendering defect and confirmed unchanged source
hashes. It separately lists the unfinished functionality and inherited release
gates. Parent reran all 214 assertions / 39 negative fixtures on the final XML.
The refreshed [cost dashboard](../bom/COST_DASHBOARD.md) contains 136 component
rows and 27 unpriced fitted entries; cost-tracker regression tests also pass.

Saved hierarchy: **136 components, 121 nets, nine sheets**, from 133/116 before
this increment. Native KiCad ERC reports zero violations under unchanged project
settings. The inherited ignored categories remain `single_global_label`,
`four_way_junction`, `simulation_model_issue`, and `footprint_filter`; no new
suppression was added. ERC is not physical or electrical safety qualification.

- 95 main-study assertions and 15 deliberately broken fixtures: trimmer guards,
  wiper ties, physical footprint, all 37 BQ pins, power-stage endpoints and open links.
- 45 control assertions and 11 broken fixtures: all five GPIO paths, grounds,
  boot pull-ups, LED polarity/remote path, preserved /SHDN, exact inventory delta,
  and unchanged component records/connectivity partitions outside declared edits.
- 74 Beetle/USB/model assertions and 13 broken fixtures, without the historical
  whole-non-LV freeze option because this task intentionally changes non-LV blocks.
- Total 214 assertions and 39 rejected negative fixtures. Tests operate on exported
  XML, never mutate KiCad source. Existing main tests were explicitly updated for
  the intended R61/R67/RV1/RV2 changes, not weakened to ignore their endpoints.
- Konnect saved-file checks: zero shorts, floating wires or unconnected pins on
  all four changed sheets; hierarchy pin validation zero issues. Actual root,
  MCU, connector and main renders were inspected for wiring and text collisions.
- All 22 pre-session V1 protected-file hashes match. V2 PCB and project file are
  byte-identical; USB, logic power, CC, INA238 and inherited power-path sheets are
  byte-identical. PCB intentionally remains out of sync; no firmware work occurred.

## Artifacts and Provenance

Review folder: [`review-control-2026-10-08`](../kicad/exports/review-control-2026-10-08/).
It contains `controller-v2.xml`, `controller-v2-review.pdf`,
`controller-v2-erc.json`, `source-hashes.csv` and four changed-sheet PNGs.

| Artifact | SHA-256 |
|---|---|
| controller-v2.xml | 84E71E0C649CEE35A2272361CBCE7574158440724C11748FAA7D7A16805B30BD |
| controller-v2-review.pdf | CFA02643EF57D835888F77A69EAC8A12FDC7B8948F7C90E45C5CBC16C99C819F |
| Unchanged V2 PCB | B6C1248F91D1D950E8D2141FAA64D977A4DDE9D1C13A673F252443F9A13E9F0F |

Pre-change project/library snapshots, 22-file V1 manifest and `before.xml` are in
`.konnect-scratch/v2-control-2026-10-08/baseline/`. All design mutations used the
official Konnect 0.12.1 executable MCP `tools/call` transport through the existing
`mcp.cjs` helper. Saved-file fallback was explicit; no live PCB save or schematic
sync occurred. Request scripts and timestamped tool readbacks are retained in
scratch. Invalid request schemas failed before their requested operation;
execution resumed only from the failed operation after inspecting applied work.
KiCad 10.0.6 generated native netlist/PDF/ERC. No source text patch or custom model
creation was used. Parent owns the refreshed BOM and independent review.
