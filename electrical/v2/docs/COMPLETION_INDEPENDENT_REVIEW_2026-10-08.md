# Independent completion-checkpoint review

8 October 2026. Read-only review of the final saved hierarchy after the sole
schematic owner stopped mutations and exports. No design, PCB or firmware
changes were made by this reviewer. "Completion" names this work increment,
not a completed or fabrication-ready V2.

## Findings, ordered by severity

### Critical release gates, inherited or unfinished

1. **Adaptive CV and its ESP-loss transition are not implemented.** U3 channel
   1 remains on J9, electrically separate from the BQ feedback divider.
   GPIO20 still controls MCP /SHDN. The two mechanical controls and the new
   I2C current-control connection do not fulfil the independent manual/app
   voltage-selection requirement. Complete and qualify that interface before
   claiming the agreed full-function first prototype is designed.

2. **Power/receiver/PC protection and the operating envelope remain
   unqualified.** The inherited SMCJ70A is not a guaranteed 55 V limiter.
   Independent output disconnect, reverse blocking, HV-to-USB fault containment,
   main gate-drive thermal loss, capacitor ripple and PCB current/thermal design
   remain gates. JP30/JP31 are correctly open. R62 remains about a 1 A input
   study ceiling, so this is not a functioning 400 W implementation. Raising
   that limit later requires a coupled voltage/current/power envelope; separate
   mechanical endstop calculations are not whole-board safety qualification.

3. **The USB power-selection diode is still an unselected component.** D20
   remains `DIODE TBD` with no physical footprint. Q20 and D21 now have reviewed
   exact parts, but their selection does not complete source-switching,
   host-off backfeed, USB input-current or optional-cell qualification. Select
   D20 based on forward-drop and reverse-leakage behavior together with R51,
   Q20 and TP4057, then test the complete source transitions. JP20 remains open.

### Warnings requiring bench evidence

4. **New shared I2C has no demonstrated partial-power qualification.** The
   implemented connection matches the reviewed minimal proposal. Missing
   explicit BQ Ioff information is a bench gate, not by itself a discovered
   wiring defect or justification for mandatory isolation hardware. Test
   USB-only/BQ-off, BQ-only/ESP-off, receiver-only and rail-collapse states.
   J32 is correctly marked reference/service only with no external power;
   its 3V3 pin must never be treated as another power input.

5. **CE low is cold-start permission, not a complete fallback mechanism.**
   R71 now holds CE low without an ESP GPIO. EN_CHG, TS, faults and retained
   registers still affect operation. ESP power loss is not BQ POR; watchdog
   resets only selected registers. The service CE node is not a guaranteed
   independent emergency stop because its input function can be bypassed.
   The drawing correctly requires a 1k series test lead for external inhibit.

No new unintended short, disconnected host signal, changed USB polarity,
wrong Q20/LED pin map or unreadable new wire crossing was found in this pass.
The gates above are not newly introduced defects disguised by a zero ERC count.

## Verified implementation

| Function | Saved endpoint evidence |
|---|---|
| Shared clock | U2.13 / U1.5 / R6.2 -> R68.1; R68=0R; R68.2 -> U9.1 / J32.2 |
| Shared data | U2.12 / U1.4 / R4.2 -> R69.1; R69=0R; R69.2 -> U9.2 / J32.3 |
| Bus pull-ups | R4/R6 remain 4.7k to board +3V3; former BQ 10k pull-ups are no longer parallel pull-ups |
| Interrupt | U9.3 / J32.4 / R70.2; R70.1 -> board +3V3; no extra ESP GPIO |
| CE permission | U9.7 / J32.5 / R71.1; R71=10k, R71.2 -> GND; JP32 removed |
| Service reference | J32.1 -> same +3V3 as U2.3 and U7.5; J32.6 -> GND |
| Q20 | AO3401A, stock SOT-23 handsolder: pin1 gate USB VBUS, pin2 source SYS_BAT, pin3 drain BAT_1S |
| D21 | WP710A10LGD, stock 3mm THT LED: pin1 cathode TP4057 CHRG, pin2 anode via R47 to VBUS |
| R45 | CRM1206-FX-R820ELF, 0.82 ohm/0.5W; change from 0.8 ohm adds 8mV at 400mA |
| Guard resistors | R61 RC0805FR-075K49L; R66 RT0805BRD07249KL; R67 RT0805BRD077K5L |
| Service models | Harwin M20-9990246/0346/0646 on the corresponding 2/3/6-pin stock 2.54mm headers |

R68/R69 are removable rework links, not protection or galvanic isolation.
The converter still uses the manual feedback path and retains both MCP channels.
The existing USB data, reset/boot, five configurable GPIOs and status LED are
preserved. No generator AUX supply, TPS63031 or internal dump was introduced.

The low-power selections were checked against the owner acceptance records,
manufacturer archives and actual scratch footprint images, including pin1,
MOSFET source/drain orientation, LED cathode, resistor lands and header pitch/
drill. No custom model was needed. These are independent selections, not an
assertion that the unidentified Beetle discrete BOM used these same parts.
R45's 0.5 W rating is at 70 C and derates; the footprint alone is not that rating.
Header finished-hole tolerance and cable orientation still belong to fabrication
and assembly checks.

## Independent evidence

Final owner export folder: `../kicad/exports/review-completion-2026-10-08/`.

- XML `controller-v2.xml`: 135 components, 120 nets, nine sheets; SHA256
  `1A4587E88D0C0F1F625A2E9906B9AB62896ACC8048C533E8ABC535DA50C122E1`.
- PDF `controller-v2.pdf`: SHA256
  `289E82BD47EB2B74DA0FEFC239EFFF9EA3E947F853983C2A33E8F5A008A7A7EC`.
  Both hashes independently matched the frozen owner checkpoint.
- Captured all 30 current source/library hashes read-only in
  `independent-source-hashes.csv` in that export folder. Compared with the
  preceding control checkpoint, only five expected schematic files changed:
  root, logic power, main converter, MCU module and USB interface. Project
  settings, libraries, PCB and other schematic files stayed unchanged.
  The owner's later 15-row project-only `source-hashes.csv` matches the same
  15 entries in this independent 30-row capture; the additional entries are
  library sources. Post-review rehash found zero changes.
- All 22 V1 baseline source/library hashes matched. The copied V2 PCB remains
  byte-identical and stale, SHA256
  `B6C1248F91D1D950E8D2141FAA64D977A4DDE9D1C13A673F252443F9A13E9F0F`.
- Independent XML baseline comparison identified only the intended 15 updated
  component records and removal of JP32; no unexpected inventory change.
- Reviewed native ERC: zero violations in all nine sheets. The four inherited
  ignored categories remain `single_global_label`, `four_way_junction`,
  `simulation_model_issue`, `footprint_filter`; none was newly suppressed.
- Independently ran Konnect shorts/orphans/single-pin checks on all nine
  reachable sheets: zero shorts, zero orphans. All 27 single-pin candidates
  were cross-sheet signals and reconciled to their full hierarchy endpoints.
- Hierarchy connection, decoupling and power-rail audits each returned
  `complete`, nine of nine instances, 214 symbol instances including power
  symbols, no coverage diagnostics. Raw evidence:
  `../../components/v2-manual-controls/review-completion-results.json`.
- Reconciled heuristic findings: BQ I2C pull-ups are reached through R68/R69
  and the parent bus; INA VBUS is a measurement input, not its supply; rail
  decoupling/bulk and service test points exist on other sheets. These findings
  do not justify duplicating pull-ups or adding capacitors to measurement nets.
  The power audit is not a physical power-rating assessment.
- Independently reran the completion test: 16 inventory/model/unchanged-net
  assertions and its 42 control-preservation assertions passed. The owner
  reports 246 total positive assertions and 42 rejected negative fixtures;
  those wider totals are not claimed as independently rerun here.
- Inspected all five changed native renders. Their direct local wiring,
  hierarchy bus connection, notes and service pin order are readable. The
  other four sheets are source-identical to the preceding independent review;
  all nine were included in current XML and MCP coverage.

No live hardware measurements, firmware tests, physical routing/clearance/
thermal audit, PCB DRC/parity or manufacturing acceptance was performed.
Full physical qualification is **INCOMPLETE**; this design is **NOT READY for
energization or manufacture**. The current increment provides the intended
host wiring and selected low-power models without a newly found connectivity
regression, but it does not close the full V2 specification.

## References

- [Host-interface engineering review](../../components/ti-bq25756/HOST_INTERFACE_REVIEW_2026-10-08.md)
- [Previous independent control review](CONTROL_REWORK_INDEPENDENT_REVIEW_2026-10-08.md)
- [Discrete model acceptance](../../components/beetle-power-v2/DISCRETE_MODEL_SELECTION_2026-10-08.md)
- [Low-power sourcing and qualification](../../components/beetle-power-v2/COMPLETION_PARTS_2026-10-08.md)
- [Service-header model acceptance](../../components/v2-service-headers/MODEL_VALIDATION_2026-10-08.md)
