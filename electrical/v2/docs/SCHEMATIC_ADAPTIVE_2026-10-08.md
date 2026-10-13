# V2 Adaptive Schematic Checkpoint

Saved 8 October 2026. **134 components, 121 nets, eight active sheets.**
This is a substantial schematic implementation, not a PCB, manufacturing
release or authorization to energize a generator/battery. First physical
prototype intent remains full adaptive functionality with staged low-current
commissioning on that same board.

## Saved Changes

| Area | Actual saved change |
|---|---|
| Voltage control | U3 becomes MCP4251-503E/SL dual 50k SOIC-14. Channel 1 connects to the protected app CV branch; channel 0 stays at J7. J9 removed. |
| Independent manual/app selection | TQ2-3V DPDT K1 selects the existing manual 7.50k/RV2-to-FBG branch or separate 7.50k/NX6008/MCP branch. Permanent 249k upper feedback resistor retained. |
| Default manual selection | GPIO20 becomes active-low CV_AUTO_N through 100R to AO3401A Q22. External gate pullup selects manual when released. 6.8R coil resistor, flyback diode and NX gate upstream of that resistor are explicit. |
| Analog terminal protection | Relay grounds MCP A/W in manual mode; BAT54SLT1G dual rail clamp, 110k analog bleeder and 10k rail bleeder added. Brownout/transient safety still unqualified. |
| MCP startup | /SHDN pin 12 held high; pin 11 also VDD, compatible with the source /WP-versus-NC discrepancy. Pin 13 SDO explicitly NC. POR midscale is not 12 V. |
| Telemetry | Dedicated INA sheet removed from active hierarchy/BOM. R4/R6 4.7k shared I2C pullups relocated to MCU. Historical child remains unreferenced. |
| Input current | Single R1 CSS4J-4026K-5L00F 5 mOhm four-terminal shunt replaces old 2 mOhm telemetry shunt and redundant R74. Force/Kelvin paths remain separate. R62 becomes 1.47k/1% 0805, nominal 13.605 A ceiling. |
| Generator connection | Root fused BUS_PROTECTED feeds JP30 and the input shunt; redundant bench J30 removed. J2 is external-converter variant feed only, before R1 and outside BQ telemetry. |
| Bulk banks | Ten TDK B40950A0566M000 56 uF/80 V capacitors: input two upstream/two local; output four local/two receiver-side. Local ceramics retained, C79 moved to switching side. |
| Main connectors | J31/JP30/JP31 use Phoenix 1711725 screw terminals. JP30/31 remain open rated-wire commissioning links, not small header shunts. |
| USB/cell supply | Beetle topology retained. D20 selected Vishay SS1H10-E3/61T in hand-solder SMA; R51 changed 10k to 1k to limit leakage-induced gate rise, adding about 5 mA USB draw. |
| Presentation | Direct local wiring, root feedback routes clear of title/labels, readable component fields and explicit physical qualification warnings. Active Konnect project rules updated; historical entries preserved. |

Retained: ESP32-C3-MINI-1-N4X, TP4057/RT9080 supply, native USB/data/ESD,
generic five-GPIO interface, status/remote LED, mechanical CV/current trimmers,
SIR680LDP MOSFETs, 10 uH inductor, 250 kHz, BQ I2C links/CE pull-down and
external NTC intent. No internal dump, AUX supply, additional range GPIO,
dedicated CE GPIO, firmware changes or real PCB changes.

Added references: D23/D24, K1, Q21/Q22, R84-R88, C81-C86. Removed active
references: J9, U1, C1-C3, JP1/JP2, R2/R3/R5, TP1/TP2/TP4/TP5/TP6, J30, R74.
Changed existing parts include U3, R1, R19, R51, R62, C73-C76, D20 and the
three main terminals. R4/R6 are relocated, not deleted.

## Physical Model Evidence

All new models were queried, manufacturer pin maps reconciled, scratch-placed,
read back and visually inspected before active use. No new custom symbol or
footprint was created in this increment. Compatible stock models retain their
honest library names and exact selected MPN/manufacturer fields.

- [MCP4251 acceptance](../../components/v2-cv-control/MCP4251_MODEL_VALIDATION_2026-10-08.md).
- [Relay, MOSFET and clamp acceptance](../../components/v2-cv-control/SELECTOR_MODEL_VALIDATION_2026-10-08.md).
- [Shunt, bulk bank, terminal and USB diode acceptance](../../components/ti-bq25756/power-stage/MODEL_UPRATE_VALIDATION_2026-10-08.md).
- [Power-stage sizing and source evidence](../../components/ti-bq25756/POWER_STAGE_UPRATE_2026-10-08.md).

TQ2 uses the pin-compatible G6H-2 stock model, with unused positions 5/6
explicitly NC. The TDK stock footprint has deliberately larger lands than the
manufacturer recommendation; mounting/stencil evaluation is still required.
The shunt stock footprint's manufacturer name differs, but accepted land
geometry and force/sense mapping are documented. Stock 3D models are not proof.
Some onsemi source PDFs were verified online but not locally archived after
download refusal; the model report records that gap rather than inventing hashes.

## Verification

Saved-file native KiCad 10.0.6 ERC: **zero violations across eight sheets**.
Inherited ignored categories remain single_global_label, four_way_junction,
simulation_model_issue and footprint_filter. The project ERC configuration is
unchanged; no exclusions or reduced severity were introduced to clear checks.

Konnect coverage: all eight sheets have zero detected shorts and zero orphan
items; full root sheet-pin validation has zero issues. All eight rendered sheets
were inspected. Parent independently reviewed root/MCU/control/main/LV/power
drawings and requested the final field/route cleanup, which was completed.

Final XML regression results:

- Main endpoint/model/default checks: 148; 27 deliberately broken fixtures rejected.
- Beetle/USB/model checks: 78; 18 broken fixtures rejected.
- GPIO/status interface checks: 43.
- Independent CV endpoint checks: 46; 13 new broken CV fixtures rejected.
- Total: 315 positive checks and 58 XML-only negative fixtures. These are circuit
  intent regressions, not analog simulation, firmware tests or hardware proof.
- BOM regression suite passes manufacturer-aware pricing, unknown/DNP handling,
  duplicate rejection and non-double-counted block budgets.

The active tests intentionally supersede old assertions that GPIO20 drives
/SHDN, INA remains fitted and R62 stays at 1 A. Historical checkpoint tests are
not relabelled as current. New tests enforce the replacement topology, Kelvin
separation, shunt-bank allocation, default-open links and analog selector pins.

Independent CV review:
[report](../../components/v2-cv-control/INDEPENDENT_NETLIST_REVIEW_2026-10-08.md).
Power reviewer checked shunt polarity, capacitor allocation, current limits,
terminals, USB diode and NTC without mutating the design.
Its [final report](ADAPTIVE_POWER_PATH_REVIEW_2026-10-08.md) records 252
independent endpoint/part assertions on the final XML. Parent reran these and
the 46 CV assertions and confirmed the final PDF has eight pages.

## Artifacts And Preservation

Review directory: `electrical/v2/kicad/exports/review-adaptive-2026-10-08/`.

- [Eight-sheet PDF](../kicad/exports/review-adaptive-2026-10-08/controller-v2-review.pdf).
- [Hierarchy XML](../kicad/exports/review-adaptive-2026-10-08/controller-v2.xml).
- [Native ERC](../kicad/exports/review-adaptive-2026-10-08/controller-v2-erc.json).
- `konnect-final-checks.json`, `source-hashes.csv`, `artifact-hashes.csv`,
  `preservation.json`, main/LV/CV regression logs and GPIO/BOM test logs.

XML SHA256:
`4C34E5957BE489FF833A1DFBE8B8047BD07FE9264C5FAA5A74B9820D31B2F5DB`

PDF SHA256:
`694B8AD866B0DA6AF63E853FAAF74C9BFD0C2B57B9B4819E0F1C37A78EEDBA1E`

Pre-edit snapshot: `.konnect-scratch/v2-adaptive-2026-10-08/baseline/`.
All 22 V1 design/library hashes match. All 27 V2 library files match. USB,
CONNECTORS, inactive INA/AUX children and the project file match byte-for-byte.
V2 PCB remains the unchanged copied baseline, intentionally out of sync:
`B6C1248F91D1D950E8D2141FAA64D977A4DDE9D1C13A673F252443F9A13E9F0F`.

All native mutations used official Konnect 0.12.1 MCP stdio via
`.konnect-scratch/v2-2026-10-06/mcp.cjs`. No live IPC was available; saved-file
readback/native CLI exports were authoritative. No `save_project`, PCB sync,
installation, order, fabrication output or commit was performed.

## Costs And Remaining Gates

[Living BOM](../bom/controller-v2-overall-bom.csv): 134 rows, nine unpriced.
[Dashboard](../bom/COST_DASHBOARD.md): board-component planning EUR111.82-161
one-off / EUR80.92-126.50 per board at ten. Full planning envelope including
optional cell, cooling, enclosure, bare PCB and paid assembly is EUR206.82-391
/ EUR135.92-254.50 respectively, excluding VAT, shipping and engineering.
These are observations/allowances, not quotes or a selling price. R1 uses an
explicit EUR allowance with a separate USD observation, not an invented FX rate.

Critical release gates remain: generator surge/disconnect and reverse polarity;
receiver-specific OVP/reverse blocking/disconnect; CV relay brownout/pole skew;
retained BQ register behavior; USB current budget and HV-to-PC fault containment;
cell charge qualification; capacitor mounting/inrush/ripple/loop tests; REGN/FET,
shunt, rectifier and full bounded V/I thermal qualification; real PCB design.

55 V is a ceiling, not guaranteed continuous input: ACOV initially spans about
53.4-54.6 V. Static CV ceiling near 54.04 V is not safe protection for a 12 V
receiver. Digital high-end reach varies; no full 54.6 V charge promise. The
approximately 400 W output ambition is not an autonomous cap; both manual knobs
at maximum need coupled stress qualification. CE and resistor pin limits remain
register-overridable. Keep JP20/JP30/JP31 open. **Do not energize a battery.**

[Current per-sheet guide](explanations/README.md) and
[review/bring-up order](REVIEW_AND_BRINGUP_2026-10-08.md).
