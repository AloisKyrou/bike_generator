# Prototype continuation checkpoint

8 October 2026. Saved schematic only: **142 components, 122 nets, eight sheets**.
This continues the preserved adaptive checkpoint without changing the real PCB,
V1, firmware or main power architecture. **Not for battery energization.**

## Changes

- TP40-47: eight stock bare 1.5 mm copper probe pads for FB, ICHG, ILIM, REGN,
  main ground, MCP A/W, CV_DRIVE and selector ground. No fitted-part cost and
  no switch-node/bootstrap probes. FB/A/W pads require placement directly at
  their local nodes, without branch traces. [Probe constraints](PROBE_ACCESS_2026-10-08.md).
- K1.9: unused NC throw disconnected from GND and explicitly marked NC.
  This removes the hard-ground lower-divider state during relay contact skew.
  R85 and the MCP B connection still define the idle node. It does not solve
  the milliseconds of supply collapse before relay release or prove safe handover.
- J33: explicitly requires external Semitec 103AT-2, 10k +/-1%, B25/85 3435 K
  +/-1%. Its Harwin header MPN/footprint are unchanged. Sensor placement and
  thermal coverage still need qualification; no extra PCB sensor was invented.
- C4/C63/C64/C68/C69/C71/C72: TDK C2012X7R2A104K125AA, 100 nF/100 V X7R10%,
  stock 0805 hand-solder footprint. Six formerly 0603 positions become 0805;
  C4 was already 0805. C62: KEMET C1206C105K1RACTU, 1 uF/100 V X7R10%,
  stock 1206 hand-solder footprint instead of generic 0805.
- R75: WSL25125L000FEB replaces FEA only as a packaging suffix. Same Vishay
  Dale 5 mOhm/1%/1 W device and unchanged 2512 footprint; this is not a power upgrade.
- Probe notes and startup annotation now specify initially disabled load and
  the phase-specific startup review. TP44 text was separated from CV_MANUAL.

## Model Evidence

All mutations used the official Konnect MCP stdio transport through
`.konnect-scratch/v2-2026-10-06/mcp.cjs`. No live IPC was available. Saved-file
readback and native KiCad exports were authoritative; no `save_project` was used.

Device:C has two passive pins, 1/2, matching the interchangeable terminations
of both selected MLCCs. The installed 0805 hand-solder footprint has two
1.175 x 1.45 mm pads centered +/-1.0375 mm, 2.0 x 1.25 mm fab body and
3.76 x 1.96 mm courtyard. The 1206 has two 1.325 x 1.80 mm pads centered
+/-1.5625 mm, 3.2 x 1.6 mm fab body and 4.96 x 2.30 mm courtyard.
Both include copper, mask, paste, silk, fab and courtyard layers.

Manufacturer body/termination dimensions were checked against the official TDK
product page and the archived KEMET PDF, including its actual page drawing.
These deliberately elongated stock hand-solder lands are not represented as
the exact manufacturer reflow recommendation. Scratch physical placement,
pad readback and a native KiCad copper/mask/fab/silk/courtyard render were
inspected before active assignment. Device:C was not recreated or renumbered.
No custom libraries were introduced. The existing qualified WSL physical model
was retained after primary Vishay ordering note 2 confirmed EB/EA equivalence.

[MLCC sourcing and primary documents](../../components/ti-bq25756/power-stage/MLCC_SELECTION_2026-10-08.md),
[R75 packaging proof](../../components/ti-bq25756/power-stage/R75_PACKAGING_2026-10-08.md).
Scratch evidence: `.konnect-scratch/v2-continuation-2026-10-08/`, especially
`cap-models-result.json`, `models/cap-pads.png`, `models/kemet.png`, and the
testpoint model evidence identified in the probe document. Effective capacitance,
mounting/stencil behavior, ripple and thermal qualification remain separate.

## Verification

- Native hierarchy ERC: zero violations over eight sheets. Four inherited
  ignored categories remain unchanged: single_global_label, four_way_junction,
  simulation_model_issue and footprint_filter. No new suppression was added.
- Konnect short, orphan and sheet-pin checks: all 24 checks across eight active
  sheets return zero issues. Final CC/main renders were inspected by owner
  and independent reviewers; unchanged sheets retain the prior reviewed layout.
- 394 positive assertions: main148, Beetle power78, GPIO43, CV47, continuation78.
- 80 XML-only negative fixtures: main27, Beetle18, CV18, continuation17.
- Continuation comparison verifies each allowed change, then proves complete
  unchanged-remainder equivalence: 134 original component records, 121 net
  records, eight sheet identities and 31 library definitions. The single new
  net is the explicitly unconnected K1.9 pin, not an added power/control net.
- Independent CV47 and power252 reviews pass. These overlap owner checks and
  are not inflated into the owner assertion total. BOM regression tests pass.

The continuation comparison explicitly checks MLCC MPN, manufacturer, value,
package and datasheet before restoring only those approved fields in XML copies.
It also checks R75's exact EA-to-EB change and removes only the verified probe
endpoints and relay NC change before comparing. An XML attribute-shadowing bug
in this test was corrected using XmlElement.LocalName; no design exception or
test suppression was added to hide a circuit mismatch.

## Saved Artifacts

[Review PDF](../kicad/exports/review-continuation-2026-10-08/controller-v2.pdf),
[netlist](../kicad/exports/review-continuation-2026-10-08/controller-v2.xml),
[native ERC](../kicad/exports/review-continuation-2026-10-08/controller-v2-erc.json).
The same directory contains regression logs, Konnect checks, final two renders,
source/artifact hash manifests and `preservation.json`.

XML SHA256: `6EBC69D56D811BC8E678B54F1C67C29F1729890CC4B2033891B77555B87F45EA`.

PDF SHA256: `71BF77B60FCEBCF0B4BF1051133511F4C826DD6056A5CDF29E9A82A8BCFEC146`.

Pre-edit snapshot: `.konnect-scratch/v2-continuation-2026-10-08/baseline/`.
All 22 V1 design/library files and 27 V2 library files remain byte-identical.
Only `cc_control.kicad_sch` and `main_converter_tbd.kicad_sch` changed in the
project. Project settings, other sheets and prior adaptive XML/PDF remain intact.
V2 PCB still hashes `B6C1248F91D1D950E8D2141FAA64D977A4DDE9D1C13A673F252443F9A13E9F0F`.
It is intentionally not synchronized. No manufacture, purchase, install or commit.

## Cost And Release Boundaries

The [living BOM](../bom/controller-v2-overall-bom.csv) now has 142 rows and zero
unpriced fitted entries. **Zero unpriced does not mean zero estimates**: generic
part allowances, missing protection blocks and physical engineering remain.
Eight pads are PCB features, not free purchased testpoint components. The eight
MLCCs total EUR1.76 at single component pricing / EUR1.03 at ten-piece tiers.
R75 FEB uses observed EUR1.87 single; the same value at ten is a conservative
allowance, not an observed quantity discount. Dedicated FEB page access failed;
availability came from the opened FEA page's alternate-packaging listing.

Board-component planning: EUR115.30-163.56 one-off / EUR83.74-126.50 per board
at ten. Full planning envelope: EUR210.30-393.56 / EUR138.74-254.50, excluding
VAT, delivery and engineering. [Dashboard](../bom/COST_DASHBOARD.md).

Keep JP20/JP30/JP31 open. No arbitrary battery/generator connection is approved.
Important gates include generator surge/disconnect, receiver-specific OVP and
reverse blocking, relay/brownout transients, charger startup and retained
registers, USB power budgeting and high-voltage fault containment, cell charging,
NTC placement, effective capacitance/ripple/stability and full PCB thermal design.
An approximately 54 V static CV guard is not 12 V receiver protection. A 400 W
app ambition is not an autonomous power cap. Cold-start permission is not a
fully qualified always-on PSU profile or automatic ESP-loss fallback.

[Startup/profile findings](CONTINUATION_READINESS_REVIEW_2026-10-08.md),
[bring-up order](REVIEW_AND_BRINGUP_2026-10-08.md),
[per-sheet guide](explanations/README.md).
