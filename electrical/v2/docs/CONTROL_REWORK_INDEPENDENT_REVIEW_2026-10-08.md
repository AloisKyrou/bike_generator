# Independent control-rework review

8 October 2026. Reviewer: independent read-only parts/control agent, not the
schematic mutation owner. No KiCad source, PCB, firmware or library changes
were made by this reviewer. This is a review of a saved schematic checkpoint,
not fabrication or energization approval.

## Findings, ordered by severity

### Critical release gates

1. **The agreed adaptive and autonomous controls are still incomplete.**
   In `MAIN_CONVERTER_TBD`, U9 pins 1/2 go to bench connector J32, not the
   ESP/INA I2C bus. U9 CE pin 7 still has the J32/R71/JP32 bench arrangement,
   not a qualified autonomous enable. U3 channel 1 remains only on J9;
   no independent manual/app CV selector is drawn. GPIO20 still controls
   MCP /SHDN. Consequently the saved board cannot yet provide app-controlled
   CV/current/power or the agreed ESP-off fallback. This is explicitly
   unfinished work, not a new accidental disconnect. Qualify and implement
   the independent CV selector, I2C power sequencing and autonomous policy
   before calling V2 functionally complete. Keep JP30/JP31 open meanwhile.

2. **Independent receiver, high-voltage and thermal protection remains
   unqualified.** Inherited D1=SMCJ70A is not a guaranteed 55 V limiter, and
   cannot guarantee INA238 or the 80 V main-stage MOSFETs remain below their
   ratings during generator surges. MAIN_CONVERTER_TBD still lacks qualified
   reverse blocking/output disconnect and fault protection. Shared GND and
   USBLC6 ESD protection do not provide HV-to-PC fault containment. The BQ
   resistor limits are register-overridable; they are not independent safety
   cutoffs. Resolve these architecture and bench gates before real generator,
   receiver/battery or valuable PC connection. No internal dump is required
   by this review; the approved no-internal-dump decision is preserved.

3. **Endstop calculations do not establish the requested whole-board safety.**
   RV1/R61 and RV2/R66/R67 bound nominal programming ranges; they do not prove
   that the power stage survives all control positions, transients or faults.
   Saved R62=20 kohm with R74=5 milliohm currently requests approximately 1 A
   input while pin limiting is enabled. Thus the current study does NOT
   ordinarily deliver 525 W merely by turning both pots fully up. However,
   the future expanded envelope near 53 V and 9.9 A permits about 525 W output,
   beyond the 400 W INPUT architecture target. A future 15 A input limit at
   55 V would permit 825 W, not enforce 400 W. Define a coupled V/I/power/thermal
   envelope with an independent limit or qualify every permitted combination.
   R74's 1 W rating would also be exceeded by 15 A DC (1.125 W before ripple
   and derating). Direct REGN gate drive at 55 V remains a separate U9 thermal
   issue even when average input current is only 1 A. These are inherited or
   future-envelope gates, not evidence of an operating 400 W design.

### Warnings and completion work

4. **Exact guard resistor MPNs are not yet in the frozen schematic.** R61 is
   generic 5.49 kohm 1%; R66/R67 are generic 249 kohm/7.50 kohm 0.1%. The
   arithmetic depends on real tolerance/TCR limits. Qualified sourcing
   candidates are listed below; accepting these fields and their package
   evidence requires the next owner-controlled metadata pass. Do not extend
   candidate-part calculations to any arbitrary 0805 resistor.

5. **The GPIO header has boot and electrical restrictions.** J5 pin pairs
   expose GPIO2/3/4/8/10 with adjacent grounds, each through 1 kohm. GPIO2 and
   GPIO8 have 10 kohm pull-ups and are strapping pins; external circuits can
   still overpower them and prevent boot/download. These are 3.3 V logic pins,
   not universal protected field inputs, power outputs or 5 V-tolerant ports.
   The schematic correctly states these restrictions. Future example profiles
   must preserve reset levels and use external drivers for loads.

6. **USB/optional-cell qualifications remain open, unchanged by this pass.**
   Q20/D20/D21 remain generic placeholders; R45 needs an exact >=0.5 W part.
   TP4057 charge current plus ESP/system load has no managed combined USB
   input limit; no cell NTC is provided. Cell compatibility, LDO dropout/
   thermal behavior, no-cell radio loading and reverse/back-power behavior
   require validation. JP20 remains open. None of these gates was introduced
   by the GPIO or mechanical-control changes.

## Confirmed changes

- RV1: U9.9 -> R61 5.49k -> RV1.3; RV1.1 and RV1.2 -> GND.
  Clockwise increases current; wiper contact loss leaves the full track and
  lowers the programmed ceiling. Nominal endpoint calculation is about
  0.90..9.11 A, not an exact 1..10 A range. The selected candidate tolerances
  give a computed upper bound about 9.93 A with the stated TCR assumptions;
  this excludes lifetime drift and is not thermal qualification.
- RV2: BQ_OUT -> R66 249k -> FB/U9.12 -> R67 7.50k -> RV2.1+2;
  RV2.3 -> FBG/U9.11. Clockwise raises voltage. Wiper contact loss leaves
  full track and lowers target. Initial 12 V requires physical calibration;
  no trimmer is shipped mechanically preset by this schematic.
- The manual CV maximum is approximately 52.31 V at nominal POR reference
  including nominal 33 ohm FBG resistance (52.53 V with ideal zero-ohm FBG).
  With maximum reference trim, +0.7% reference error and resistor initial
  tolerances, the calculated maximum is 54.04 V. Assuming the sourced 25 ppm/C
  resistors and independent worst-sign drift through 130 C from 25 C gives
  about 54.38 V. This does not include unknown feedback bias, aging, layout,
  transient overshoot or a failed fixed resistor.
- J5 odd pins 1/3/5/7/9 map to GPIO2/3/4/8/10; even pins are GND.
  J22 is removed. INA_ALERT stays on U1/R5/TP6 but no longer occupies GPIO2.
- GPIO21 -> R35 1k -> D22 anode; D22 cathode -> GND. J28 is parallel to
  the LED after the shared resistor. Fit D22 OR the remote LED, not both
  for predictable brightness. Boot UART flashes are possible and documented;
  this LED is not an independent safety indication.
- GPIO0/1 I2C, GPIO5/6/7 SPI, GPIO9 BOOT and GPIO18/19 USB remain intact.
  Both MCP channels remain present; channel 0 is still available at J7.
- USB, Beetle-like logic power, inherited main input and MCP connectivity are
  preserved after accounting for deliberately changed GPIO/global-rail loads.
  The sole intentional INA endpoint change is removal of U2 from INA_ALERT.
  USB polarity remains D- -> GPIO18 and D+ -> GPIO19 through 22 ohm resistors.

## Evidence and coverage

Frozen owner export directory:
`../kicad/exports/review-control-2026-10-08/`.

- XML SHA256:
  `84E71E0C649CEE35A2272361CBCE7574158440724C11748FAA7D7A16805B30BD`.
- All 30 entries in `source-hashes.csv` independently matched saved source/
  library files. No KiCad source parsing was used.
- Complete XML inventory reviewed: 136 components, 121 nets, nine sheets.
  Baseline comparison used `.konnect-scratch/v2-control-2026-10-08/baseline/before.xml`.
- Owner native ERC reviewed: zero reported violations over all nine sheets;
  inherited ignored categories are single_global_label, four_way_junction,
  simulation_model_issue and footprint_filter. These were not newly waived.
- Independent Konnect checks on every reachable sheet: zero shorts, zero
  orphans; 25 single-pin candidates all marked cross-sheet. Full hierarchy
  XML confirms their partner endpoints; no unresolved orphan net was found.
- Independent connection, decoupling and power-rail audits each returned
  `complete`, nine of nine sheet instances, 213 symbol instances (including
  power symbols), no diagnostics. Results and read-only runner are archived
  in `../../components/v2-manual-controls/review-readonly-results.json` and
  `review-readonly.cjs`.
- Reconciled heuristic false positives: U9 BQ_SCL/BQ_SDA do have R68/R69
  pull-ups to the bench logic rail; INA VBUS is a measurement input, not its
  supply; 3V3 decoupling/bulk and service points exist elsewhere in hierarchy
  (C1/C3/C4/C30/C31/C47/J20), and VBUS has C42/C50/J25. The power audit recognizes
  only GND on the main sheet, so its zero findings do not validate BQ power.
- Independently reran 45 control/preservation assertions: PASS. Owner reports
  95 main-study and 74 Beetle assertions plus 39 negative fixtures; those
  broader test counts are owner evidence, not independently rerun here.
- Visually inspected all nine sheets: root, POWER_PATH, CONNECTORS,
  MCU_MODULE_PROVISIONAL, CC_CONTROL, INA228_SENSE, LOGIC_POWER_USB_ONLY,
  MAIN_CONVERTER_TBD and USB_INTERFACE. Changed local series paths are readable;
  no new text overlap or ambiguous wire crossing was found in reviewed renders.

No PCB DRC, routing/parity, clearance/thermal-layout, manufacturing audit,
physical measurements or dynamic simulation was performed. The copied PCB is
known stale and unchanged (SHA256
`B6C1248F91D1D950E8D2141FAA64D977A4DDE9D1C13A673F252443F9A13E9F0F`).
Full physical qualification is therefore **INCOMPLETE**. The narrow saved
schematic review found no new unintended short or pin-map defect, but V2 is
**NOT READY for manufacture or energization** and does not yet meet the full
approved functional specification.

## Candidate resistor evidence

Manufacturer generated part sheets, 8 October 2026, are archived under
`../../components/v2-manual-controls/`; both precision parts are nonpolar
0805, 2.0 +/-0.1 by 1.25 +/-0.1 mm, 0.125 W at 70 C, 150 V maximum continuous.
Standard KiCad 0805 footprints already exist; no custom model is needed.

| Ref | Candidate | Initial tolerance / TCR | Dated price/stock observation |
|---|---|---|---|
| R61 | Yageo RC0805FR-075K49L | 1% / 100 ppm/C | USD0.10 one-off; 53,119 observed |
| R66 | Yageo RT0805BRD07249KL | 0.1% / 25 ppm/C | USD0.10 @1, 0.083 @10; 2,982 observed |
| R67 | Yageo RT0805BRD077K5L | 0.1% / 25 ppm/C | USD0.10 @1, 0.083 @10; 10,576 observed |

Stock observations are not reservations or purchasing approval.
[R66 distributor](https://www.digikey.com/en/products/detail/yageo/RT0805BRD07249KL/1075740),
[R67 distributor](https://www.digikey.com/en/products/detail/yageo/RT0805BRD077K5L/5139422),
[R61 distributor](https://www.digikey.com/en/products/detail/yageo/RC0805FR-075K49L/730946).
Manufacturer technical authority:
[R66](https://yageogroup.com/component-documentation/download/specsheet/RT0805BRD07249KL),
[R67](https://yageogroup.com/component-documentation/download/specsheet/RT0805BRD077K5L),
[R61](https://yageogroup.com/component-documentation/download/specsheet/RC0805FR-075K49L).

R66 PDF SHA256: `7219D65DD19C1D4235F89FE6B158B96CC0A3D30F011C5D29A34D24E7CACD538B`.
R67 PDF SHA256: `3A8A48825A55AE917BA0A5741924867D32E84976305DD0B65407B1C9F73943FE`.
See the shared controls [qualification notes](../../components/v2-manual-controls/README.md)
for Bourns, LED, R61, shunt, current equations and power-off I2C limitations.
