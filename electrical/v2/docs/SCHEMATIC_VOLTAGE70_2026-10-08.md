# 70 V-class schematic checkpoint

8 October 2026 design revision; final checks completed 9 October after a host
interruption. Saved hierarchy: **146 components, 125 nets, eight sheets**.
This is a full-function prototype schematic, **not energization or fabrication
approval**. V1, the real PCB, firmware and prior review artifacts are unchanged.

## Saved changes

- Removed J2 and its external-converter branch. Only the integrated BQ25756
  receiver path remains. AC/DC entry options are retained.
- Q10-Q13: selected Vishay SIR870ADP-T1-RE3, 100 V, using the existing verified
  PowerPAK SO-8 model. Lower gate charge trades against higher conduction loss;
  high-voltage thermal operation is not yet qualified.
- Replaced ten 56 uF/80 V bulk parts with twelve Panasonic 100SXV27M,
  27 uF/100 V. Input: C73/C81 upstream, C74/C82/C87 local. Output:
  C75/C83/C84/C85/C88 local, C76/C86 receiver-side. Tolerance plus the stated
  endurance capacitance decline leaves 86.4/120.96 uF in the analytical screen,
  without assuming ceramic contribution. Ripple sharing, temperature and
  compensation/startup behavior still require physical testing.
- R63/R64/R65: exact Yageo 0.1%, 25 ppm/C 1 MOhm /105 kOhm /19.6 kOhm.
  ACOV nominal 68.853 V; studied resistor-temperature corners 67.469-69.675 V.
  ACUV and input-DPM nominal values are 9.928 V and 10.921 V. These thresholds
  stop switching; they do not disconnect or suppress generator surges.
- Independent manual/app guards each become 5.62 kOhm +200 ohm: R67/R89 and
  R84/R90. R85 becomes 150 kOhm 0.1%. Added D25 BZX84C27LT1G, a low-current
  27 V clamp after the digital guard, retaining the low-gate-voltage NX6008.
  D25 pin1 is GND, pin3 is Q21 drain and pin2 is explicitly NC.
- Corrected F1's existing part rating to 20 A/100 VDC and documented its
  interrupting limits. Added explicit mandatory source/receiver external fuse
  requirements and the reversed-J1 bridge path that bypasses F1. No extra
  onboard fuse, active overvoltage disconnect or universal containment claim
  was silently added.
- Updated readable annotations, selected-part metadata, per-sheet explanations,
  current Konnect design rules and live BOM. USB/optional protected 1S Beetle
  power, GPIO allocation, manual current trimmer and I2C input-effort control
  remain unchanged. No AUX and no internal dump.

## What the range means

The static CV screen is below **69.52 V**, including the studied reference,
resistor and temperature corners. Nominal digital maximum with reference trim
is about **67.66 V**, but a modeled corner reaches only **64.37 V**.
**67.2 V is conditional on measured per-unit achievable range and calibration;
calibration cannot guarantee an unavailable endpoint.** Manual initial setting
remains approximately 12 V, with output current initially calibrated near 1 A
for commissioning on this same full-function hardware.

The approximately 13.61 A input and 9.11 A maximum output nominal ceilings are
retained. Approximately 400 W output is an ambition, not an autonomous power
cap. Maximum manual settings can request roughly 610 W nominal. Both-endstop
non-damage behavior remains unqualified until coupled conduction, switching,
REGN, magnetics, rectifier, connector and PCB thermal tests pass. I2C can disable
pin current limits; they are not independent firmware-fault protection.

## Models and verification

[Model acceptance](../../components/ti-bq25756/voltage70/MODEL_ACCEPTANCE_2026-10-08.md)
records manufacturer pin maps, packages, all-pad scratch readback and actual
native rendered inspection. No custom library models were created. Panasonic
standard lands intentionally differ from its recommendation and need mounting
qualification; PowerPAK requires qualified reflow/hotplate assembly.

- Native KiCad hierarchy ERC: **zero violations across eight sheets**. Inherited
  ignored categories are unchanged: single_global_label, four_way_junction,
  simulation_model_issue and footprint_filter. No new suppression was added.
- Konnect on all four changed sheets: zero shorted nets and zero orphan items.
  Root, main, CV and power-entry renders were inspected by owner and parent;
  final field spacing and conditional-range wording were corrected.
- **868 positive assertions:** owner 210, independent power 483, independent
  CV 54, unchanged Beetle power 78 and GPIO 43.
- **61 deliberately broken XML fixtures rejected:** owner voltage revision 12,
  CV 25, power 6 and Beetle power 18. Historical default review modes remain
  available; new voltage expectations require explicit `-Voltage70` switches.
- Owner comparison checks every unchanged component and all common-pin
  connection pairs. Exactly three old pairings disappear, corresponding to
  the two added series guards; no unintended common-pin joins appear.
- CV 128-corner, ACOV 128-corner and power capacitance/ripple calculations pass.
  They are arithmetic screens, not transient, lifetime or thermal simulation.
- Cost-tracker tests pass, including manufacturer-aware pricing, unknowns,
  DNP, copper-only features and no double-counting.

[Independent power review](VOLTAGE70_POWER_REVIEW_2026-10-08.md),
[independent CV review](../../components/v2-cv-control/INDEPENDENT_VOLTAGE70_REVIEW_2026-10-08.md),
[saved verification log](../kicad/exports/review-voltage70-2026-10-08/verification.txt).

## Cost effect

The live tracker has 146 rows and zero unpriced fitted entries, **with explicit
engineering allowances still present**. Board-component planning is
EUR139.79-196.00 one-off, or EUR100.07-146.50 per board at ten. Including the
separate PCB, assembly, cooling, optional cell and enclosure/harness budgets:
EUR234.79-426.00 one-off, EUR155.07-274.50 per board at ten, excluding VAT,
delivery and engineering. These are not quotations or retail prices.

Using the same current pricebook and per-part tier convention on both saved
inventories, drawn-part cost changes from EUR97.96-120.07 to EUR121.09-143.37
one-off; the ten-board columns change from EUR71.38-88.55 to EUR87.35-104.66.
That is about EUR23.13-23.30 or EUR15.98-16.11 respectively. Block budgets also
retain additional unfinished-protection/cooling allowances.

An actual single-board capacitor basket qualifies for the observed ten-piece
tier: twelve Panasonic parts EUR31.02 versus the prior ten TDK parts EUR12.69,
an **EUR18.33 capacitor-basket increase**. This is a different convention from
the dashboard's conservative individual-unit column. Only 74 Panasonic parts
were observed available, insufficient for ten boards; inventory is not reserved.
USD-only resistor/shunt observations were not converted into invented EUR quotes.

## Remaining gates

JP20/JP30/JP31 stay OPEN. No battery or arbitrary generator energization approval.
The inherited SMCJ70A can clamp near 113 V, above BQ's 85 V absolute limit and
the new 100 V FETs. ACOV does not isolate those parts. F1 is not protection for
every source fault; external fuse voltage, interrupt rating, prospective fault
current, cable sizing and thermal coordination must be established for each setup.

L3 still has a 75 V terminal-to-terminal rating and needs measured switching
excursion margin. REGN loss can exceed 1 W at high input; high-side gate margin,
hot FET loss and current capability remain PCB/bench gates. The 100 V bank
does not make the BQ pins surge-immune. Capacitor ripple rating falls above105 C.
CV clamp hot leakage, loop dynamics, relay skew and power-loss brownout remain
unqualified. A roughly 69.5 V static ceiling is not protection for a 12 V receiver.
Reverse blocking, independent receiver OVP/OCP/disconnect, USB fault containment
and charger startup/profile behavior remain unresolved release gates.

## Frozen artifacts and preservation

[Review PDF](../kicad/exports/review-voltage70-2026-10-08/controller-v2.pdf)
and [XML](../kicad/exports/review-voltage70-2026-10-08/controller-v2.xml).

- XML SHA256: `C94BA60B4DDE5FDD86566964E3B5836A4A9803ECECB7E6B4A1FEE86BAE8B3329`.
- PDF SHA256: `BF0AEB691519C6CB35F097AAD11249C5BE25F82D5D436F996E49EAAC5BB91403`.
- 22 V1 files, 27 V2 library files and all16 prior continuation review artifacts
  match their pre-change hashes. Of15 protected project files, only root,
  POWER_PATH, MAIN_CONVERTER and CC_CONTROL changed.
- Real V2 PCB SHA256 remains
  `B6C1248F91D1D950E8D2141FAA64D977A4DDE9D1C13A673F252443F9A13E9F0F`;
  it is intentionally out of sync with the schematic. No PCB save/sync occurred.

The new review folder includes `source-hashes.csv`, `preservation.csv` and
`manufacturer-source-hashes.csv`. Baseline copies and complete official MCP
JSON request/readback evidence remain under
`.konnect-scratch/v2-voltage70-2026-10-08/`. All native mutations used Konnect's
file-backed transport; no generic source rewrite, install or purchase occurred.
