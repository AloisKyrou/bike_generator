# MAIN_CONVERTER review, 12 October 2026

## Latest: user bootstrap wiring review

Read-only review of the user's subsequent edits: C65/D10 and C66/D11 now wire
directly to the BQ SW/BTST pins; the relocated manual divider returns directly
to FBG. The bootstrap capacitors remain between BTST and SW, not GND, and the
diode polarities are preserved. SW1/SW2 still use named links to the remote
power bridge. The local BTST and FBG label bridges are eliminated.

Full XML equivalence against `review-main-direct-wiring-2026-10-12` passes:
145 components, 125 named nets, eight sheets and 33 library parts unchanged.
760 endpoint assertions pass; fresh hierarchy ERC zero, same four ignored
categories. Konnect reports zero shorts/orphans. Saved render inspected with
no newly identified connection or layout issue. This is not hardware approval.
No native files modified; MAIN hash stayed
`3513032691DC67840F0E7239D8E7CEDAD84F9626BE723D6B80B6D5E230D050DB`.

[Review image](../kicad/exports/review-user-bootstrap-2026-10-12/main.png),
[XML](../kicad/exports/review-user-bootstrap-2026-10-12/controller-v2.xml),
[ERC](../kicad/exports/review-user-bootstrap-2026-10-12/erc.json).
Drawing methodology updated in `electrical/v2/AGENTS.md`. Ground probe pads
remain unchanged: assess practical access at PCB placement, and do not confuse
physical pads with GND symbols or net/hierarchical labels.

## Follow-up: direct REGN and output-feedback wiring

User requested continuous local wiring instead of repeated BQ_REGN/BQ_OUT
label bridges. On MAIN only, REGN/DRV_SUP now form a continuous rail from U9
through the C60/C61/TP43 block to both bootstrap supply diodes and the
R72/R73/J33 sensor block. R66 connects directly to BQ_OUT, after R75 and before
JP31, along the clear right-hand edge of the output filter. The manual CV block
and supporting component fields were relocated to make space.

One BQ_REGN label and one BQ_OUT label remain solely as node names. ACP/ACN,
driver and switch-node links remain where routing long wires would reduce
clarity. Fresh user edits to the input filter and output capacitor arrangement
were preserved. Two electrically harmless ACP/ACN wire tails left beyond the
relocated junctions were trimmed back to those junctions. JP30's
commissioning/troubleshooting role and its lack of
complete isolation are clarified in the per-sheet guide.

Saved label readback confirms exactly one BQ_REGN and one BQ_OUT label.
Full presentation equivalence passes for 145 components, 125 named nets,
eight sheets and 33 library parts; reset regression also passes. Local
connection, short and orphan checks report zero findings. Only the MAIN native
sheet changed against the fresh pre-edit snapshot.
The final netlist passes 760 endpoint/part assertions. Root ERC reports zero
errors/warnings on all eight sheets with the same four inherited ignored
categories. No PCB or hardware qualification was performed.

Artifacts for this pass:
[`review-main-direct-wiring-2026-10-12`](../kicad/exports/review-main-direct-wiring-2026-10-12/).
Earlier passes below describe their own saved snapshots, not the latest local
REGN wiring. No electrical redesign or additional qualification is implied.

## Follow-up: capacitor-bank presentation

User requested C87 grouped below the rail and equivalent harmonization
elsewhere. All seven child-sheet renders were inspected. The bounded changes
are on MAIN_CONVERTER and MCU_MODULE only:

- C82/C74/C87/C77/C78 form one row below BQ_VAC with one ground return;
  Q10/Q11 and R76/R77 shift right to leave room for the row and its fields.
- C73/C81 share a ground return before the input shunt.
- C30/C31 on MCU_MODULE share a ground return; reset wiring is untouched.
- Already coherent output banks stay above their rails. Other child sheets
  have no comparable outlier justifying a change in this pass.

User edits, including the moved PWR_FLAG, were captured in a fresh snapshot
and preserved. Final renders inspected. Presentation equivalence passes for
145 components, 125 named nets, eight sheets and 33 library parts; MCU reset
test passes. Local connectivity/short/orphan checks report no issues.
The final XML passes 760 endpoint/part assertions. Hierarchy ERC reports zero
errors/warnings with the same four inherited ignored categories. Snapshot
hashes confirm that only MAIN and MCU native sheets changed; project settings,
PCB and all other sheets are unchanged.
No component-data, circuit, BOM or PCB changes.

Follow-up artifacts are in
[`review-capacitor-banks-2026-10-12`](../kicad/exports/review-capacitor-banks-2026-10-12/).
The initial review and its separate artifact hashes below remain historical.

## Initial review

Scope: verify the saved controller circuit, explain its blocks and improve
crossed/long wires on MAIN_CONVERTER only. No new architecture, part selection,
PCB update, firmware implementation or energization approval.

## Conclusions

No new electrical connectivity defect was identified in this scoped review.
The saved netlist agrees with the checked BQ pin functions, including VAC
32/33, grounds 17/22/37, REGN/DRV_SUP, both bootstrap circuits, both current
filters, CE, I2C and the mechanical control connections. This is schematic
verification, not a claim that the full operating envelope is qualified.

Primary reference: TI BQ25756 datasheet SLUSEN5A, revised August 2026,
[official PDF](https://www.ti.com/lit/ds/symlink/bq25756.pdf), pin descriptions
and sections 6.3.3.2, 7.2.2 and layout guidance. Existing manufacturer records,
models and calculation assumptions remain in
[`power-stage-70v`](../../components/ti-bq25756/power-stage-70v/README.md).

## Presentation changes

- VAC C62/C63/C64 remain parallel. Their ground bar no longer crosses the
  two VAC feed columns. Added a short placement note for U9 pins 32/33.
- REGN and DRV_SUP remain tied explicitly. One justified local BQ_REGN label
  removes the long bypass wire crossing printed driver pin names.
- C60/C61 and VAC capacitor field positions are clearer.
- C80 keeps its receiver-side-of-R75, pre-JP31 connection with a shorter branch.
- No components removed, no new parts, no BOM price change.

## Electrical checks and tests

Fresh final XML passes 760 endpoint/part assertions. The unchanged baseline
passes before all 17 deliberately broken fixtures are rejected. Full
presentation equivalence passes for 145 component records, 125 named nets,
eight sheet records and 33 library-part records; the MCU reset regression
also passes. Project snapshot hashes show only `main_converter_tbd.kicad_sch`
changed among native project files. No PCB synchronization was performed.
Hierarchy ERC reports zero errors/warnings with the same four inherited
ignored check categories. Konnect reports no local floating wires, unconnected
pins, shorts or orphan labels. Final rendered sheet was visually inspected.

Artifacts: [full review PDF](../kicad/exports/review-main-converter-2026-10-12/controller-v2.pdf),
[sheet image](../kicad/exports/review-main-converter-2026-10-12/main-converter.png),
[netlist](../kicad/exports/review-main-converter-2026-10-12/controller-v2.xml),
[ERC](../kicad/exports/review-main-converter-2026-10-12/erc.json).
Native MAIN sheet SHA-256:
`6BC7C4A2786679B71F0B4D0D71FB39D1D52889D60F9702591AB1DA5390E959D4`.

The power endpoint audit now additionally covers U9's local supply, bootstrap,
sense filters, control values, grounds, unused pins and separation of all
functional controller nets. Test expectations accept the approved compact
`20A/100VDC` notation. The user's exchange of identical R4/R6 pullup reference
assignments is electrically equivalent: require one 4.7k pullup on each bus
line and retain SDA GPIO0 / SCL GPIO1, rather than requiring an arbitrary
reference order. No MCU circuit modification was made for this test update.

The negative audit first requires the unmodified baseline to pass. It then
rejects deliberately broken XML fixtures; it never edits native KiCad files.
Added cases include a disconnected VAC/driver pin, wrong bypass return,
reversed bootstrap diode, grounded bootstrap/differential capacitor, underrated
common-mode capacitor, bypassed current guard, CE pullup, grounded NC and
disconnected exposed ground pad.

Re-run existing analytical screens:

- `power-stage-70v/screen.mjs`: TI worked examples pass; modeled minimum
  input/output bulk after tolerance/endurance drift is 86.4/120.96 uF versus
  the screened output requirement about 113.24 uF. This does not prove actual
  ripple sharing, DC bias, thermal operation or stability.
- `voltage70/acov-screen.mjs`: all 128 resistor/reference corners pass the
  script's range checks; ACOV approximately 67.47-69.67 V under its model.
  Leakage, aging and transient overshoot are not included.

## Remaining gates before release

| Priority | Observation | Next engineering action |
|---|---|---|
| High | REGN gate-drive loss screens around 1.235 W at 70 V/250 kHz, 1.423 W at the 288 kHz frequency corner, before other IC heat | Resolve the thermal budget and actual gate-drive margin before freezing layout/rating; do not silently add an auxiliary supply |
| High | SMCJ70A's published clamp can exceed both BQ absolute maximum and 100 V MOSFET ratings; ACOV only stops switching | Define supported source excursions and fault coordination; no claim of arbitrary-generator surge protection |
| High | Output remains connected to an energy-rich receiver; a fuse is not active reverse blocking | Retain external battery-fuse requirement and complete fault/cable coordination |
| High | Both manual knobs at maximum can request roughly 610 W; 400 W is not a hardware cap | Establish bounded V/I/temperature operating combinations and their enforcement before a board-safe-endpoint claim |
| Medium | L3 is rated 75 V terminal-to-terminal; high-side VGS depends on bootstrap losses | Verify switching excursions and hot operation; review margin at the top of the voltage range |
| Medium | Current-loop stability, effective capacitance, unequal ripple sharing and thermal sensor placement depend on implementation | Qualify PCB placement, Kelvin routing, cooling and staged bench behavior |
| Medium | ESP loss does not reset BQ registers; charger phases differ from a universal PSU | Verify handover, partial-power I2C and receiver-specific configuration using the existing control contract |

These are existing open qualification items, not defects introduced by the
presentation edits. The especially important MAIN-specific next study is the
REGN/driver thermal budget. Keep JP30/JP31 open and preserve the schematic's
commissioning warnings. No fabrication or battery charging approval follows
from a clean ERC.
