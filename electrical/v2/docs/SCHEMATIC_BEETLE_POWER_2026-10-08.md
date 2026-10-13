# Beetle-Derived Logic Power: Saved Schematic Checkpoint

8 October 2026. **Provisional, not for energization or fabrication.**
The user's requirement remains one full-function first physical prototype.
This checkpoint changes its logic-power drawing; it does not approve a separate
fixed-output prototype or complete the BQ25756 control/safety work.

## Result

The active V2 no longer contains BQ24074 or TPS63031. The logic sheet now draws
the DFRobot Beetle C3 TP4057 + diode/PMOS + RT9080 topology with continuous local
wires. USB is the only external logic-power input, with optional protected 1S
backup. No generator auxiliary supply, source mux or internal dump was restored.

The topology provides a proposed USB-only/no-cell path through D20 and U7,
and a cell path through Q20 and U7. Those are **drawn paths, not tested operating
capabilities**: Q20/D20 physical selection, source transitions, USB current and
LDO thermal/dropout qualification remain open. Copying Beetle is not proof that
all the project requirements are met. See the
[power decision and budget study](BEETLE_POWER_DECISION_2026-10-08.md).

## Saved Changes

| References | Change |
|---|---|
| U6 | TP4057-42-SOT26-R, native TP4057 symbol, SOT-23-6; Top Power ordering alias must be confirmed at purchase |
| U7 | RT9080-33GJ5, TSOT-23-5; verified unchanged SparkFun library import, not a custom-created symbol |
| R45 | Beetle 0.8 ohm series charger-input resistor; 1206 candidate with explicit >=0.5 W rating requirement, exact MPN pending |
| R46 / R47 / R48 / R51 | 2 kohm PROG / 2 kohm charge LED / 200 kohm EN pull-up / 10 kohm VBUS pulldown |
| C42 / C45 / C46 / C47 | 10 uF / 10 V nominal 0805 candidates at USB, BAT, SYS and 3V3; exact effective-capacitance selection pending |
| Q20 / D20 | Generic PMOS and diode topology placeholders; no selected MPN or footprint |
| D21 | Single green CHRG LED placeholder; exact part and footprint still open |
| J26 | Prior user-selected JST S2B-PH-K-S(LF)(SN) reused provisionally; pin 1 BAT_1S / pin 2 GND, actual cable polarity must be measured |
| JP20 | Added open-by-default PROG service link, generic 2.54 mm header; no shunt until cell and source qualified |
| Removed | L2, JP21, JP22, R52, C43, C44, C48, C49 from the former logic circuit |

Root, MCU and USB annotations now describe RT9080, no generator AUX and the
absence of an active total USB input-current limiter. USB connector/data/ESD
circuitry, ESP module circuitry, INA238 sensing (historical INA228_SENSE sheet
name), inherited power path, CC control and main BQ study endpoints are unchanged.
The root hierarchy still contains nine sheets. No firmware or PCB was changed.

## Reference Fidelity and Deviations

- Source: DFR0868 C3 V2.0 schematic dated 8 February 2022, already archived.
  R45 is 0.8 ohm, not 8 ohm. TP4057 p. 6 REV_2.2 lists 2 kohm as nominal
  400 mA, not 500 mA. Its p. 5 tolerance test uses 2.2 kohm; no unqualified
  tolerance bound is asserted for 2 kohm.
- JP20 is an intentional additional service interlock. Opening the PROG return
  disables charging according to the charger documentation; it does not limit
  ESP current, negotiate USB current, or isolate the cell from the logic.
- STDBY and RT9080 pin 4 are explicitly NC. No temperature sensor is connected:
  TP4057 does not offer the former charger's NTC function.
- R48 enables the LDO whenever a usable SYS supply is present. There is no
  automatic wake/latch and no retained JP21 manual-enable circuit. Detach the
  cell for storage until a deliberate product switch is designed.
- AOS AO3401A and Vishay SS14 are documented research candidates only, not
  asserted to be Beetle's unidentified Q1/D1. Q20/D20 Candidate_Only fields
  do not select parts or allow a purchasing BOM to treat them as qualified.
- PWR_FLAG symbols identify externally supplied/passive-fed nets for ERC;
  they do not add power sources, current limits or safety protection.

## Models and Evidence

[Manufacturer archive](../../components/beetle-power-v2/README.md) records source
URLs, revisions and SHA-256 hashes. The
[physical model record](../../components/beetle-power-v2/kicad-model-validation-2026-10-08.md)
reconciles all six TP4057 and five RT9080 leads, symbol pins and footprint pads.
Exact-package scratch placement, saved readback and native KiCad rendered
inspection were completed before their active placement. The standard TP4057
symbol's thin TSOT default was explicitly replaced by SOT-23-6.

RT9080 was unavailable in installed libraries; commercial download routes were
login-gated. The entire unchanged SparkFun regulator library at commit
`3f40e7d08cc23b464203287c9e8f77508bb752bb` was legitimately imported with CC-BY-4.0
attribution. Project-local registration uses a portable `${KIPRJMOD}` path.
Library SHA-256: `A79F4E9F19496063A83FE2E7B8E45395AAD09B87FEBE6A6741C08B3333F7E5E6`.
No new custom model was created. LED manufacturer retrieval failed; no false
claim of an archived LED datasheet or physical acceptance is made.

All active KiCad mutations used official Konnect 0.12.1 MCP `tools/call`, through
the existing stdio helper. The source was saved-file mode, not live editor IPC.
No `save_project` or schematic-to-PCB sync was called against the unrelated
open board. Scratch PCB operations were confined to disposable validation.
Baseline snapshots are under `.konnect-scratch/v2-2026-10-08/baseline/`.

## Verification

- Saved export: **133 components / 116 nets / 9 sheets**, down from 138 components.
- Native KiCad 10.0.6 hierarchy ERC: **zero violations** under unchanged inherited
  settings. Ignored categories remain `single_global_label`, `four_way_junction`,
  `simulation_model_issue`, `footprint_filter`; no new suppression was added.
- Konnect LV wire check: zero floating endpoints; component check: zero
  unconnected pins; orphan check: zero; distinct-net short check: zero.
- `test-beetle-power-netlist.ps1`: **75** model/endpoint/default/preservation
  assertions pass, including complete non-LV component and endpoint comparison
  against the pre-edit XML. **14** deliberately broken XML fixtures are rejected.
- Existing main-study checks: **85** assertions and **10** negative fixtures pass.
  The obsolete LV-boundary reference U6.13 was updated to USB J27.A4, without
  altering main-stage expectations.
- Root, MCU, USB and logic PNGs were visually inspected. Local wires remain
  continuous; annotations fit the page and preserve incomplete-design warnings.
- **22/22** V1 protected-source hashes match the pre-session baseline. Copied
  V2 PCB is unchanged, SHA-256
  `B6C1248F91D1D950E8D2141FAA64D977A4DDE9D1C13A673F252443F9A13E9F0F`.
  PCB remains intentionally out of sync and is not a V2 layout.

Review artifacts (not fabrication outputs):

- [Hierarchy PDF](../kicad/exports/review-beetle-2026-10-08/controller-v2-review.pdf)
- [Saved XML](../kicad/exports/review-beetle-2026-10-08/controller-v2.xml)
- [Native ERC](../kicad/exports/review-beetle-2026-10-08/controller-v2-erc.json)
- [Logic render](../kicad/exports/review-beetle-2026-10-08/logic-final.png)

XML SHA-256: `2637D5862DAFD6BCB19B3C61AC074F66F4FDC1A66BBCC129FCC5C6F2EE3FAD99`.
PDF SHA-256: `F6700F3CC527D5E197A2D6C3521A9A34D812DE21C76C81029CD2FA2A62B7A0E5`.

## Required Before Energization

1. Select and verify Q20/D20/D21. Specifically qualify diode reverse leakage
   versus temperature and resulting VBUS/PMOS gate bias; low forward drop alone
   is insufficient. Do not infer physical lead order from a generic symbol.
2. Qualify USB current, startup/inrush, enumeration/suspend policy and no-cell
   radio peaks. Approximately 400 mA charging is additive to system load, not
   a total USB input limit. Keep JP20 open until cell and source are qualified.
3. Confirm cell charge rating, protection, temperature handling and cable
   polarity. A protected cell is not automatically approved for 400 mA charge.
4. Check RT9080 startup/transients, dropout through the usable cell range and
   USB-powered dissipation. Its 600 mA headline does not guarantee continuous
   operation at every input/ambient/layout. Do not externally back-power the
   3V3 test connector while VIN is off; reverse-voltage limits still apply.
5. Select rated R45 and actual capacitors; test thermal margins, effective
   capacitance, source transitions and reverse current on a safe isolated bench.
6. Complete main converter wide CV/ESP control, independent safe-off and fault
   protection, and USB-to-HV fault containment. Main links remain OPEN. The
   unchanged temporary ~12 V / ~1 A divider and clean ERC are not a finished
   universal charger or a qualified 55 V / 400 W rating.
