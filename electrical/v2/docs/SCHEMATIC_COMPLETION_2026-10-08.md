# V2 Solderable Parts and Host Interface Checkpoint

Saved 8 October 2026. This is a schematic engineering checkpoint, **not a
build release or permission to energize**. The first physical prototype
remains the full-function target, not a separate fixed-12-V product.

## Saved Changes

| References | Change |
| --- | --- |
| R61 | Yageo RC0805FR-075K49L, 5.49k 1%, hand-solder 0805 lands |
| R66 / R67 | Yageo RT0805BRD07249KL / RT0805BRD077K5L, 249k / 7.50k 0.1%, hand-solder 0805 lands |
| Q20 | Alpha & Omega Semiconductor AO3401A, SOT-23 handsolder; verified 1=G, 2=S, 3=D |
| D21 | Kingbright WP710A10LGD green low-current 3 mm THT LED; existing 2k drive retained |
| R45 | Bourns CRM1206-FX-R820ELF, 0.82 ohm 1%, 0.5 W at 70 C, hand-solder 1206 lands |
| J20 / J25 / J33 | Harwin M20-9990246, 1x2 service headers |
| J21 / J23 | Harwin M20-9990346, 1x3 service headers |
| J32 | Harwin M20-9990646, 1x6 service header; reference/test only, no external power |
| R68 / R69 | Former 10k pull-ups repurposed as 0R 0805 host rework links |
| R71 | 10k now connects CE to GND rather than pulling CE high |
| JP32 | Removed; redundant with requested default-low CE |

All other inventory is preserved. R45 is an explicit small deviation from
Beetle's 0.8 ohm: +8 mV at 400 mA, 0.1312 W nominal dissipation. Its selected
power rating requires temperature/copper derating, not merely a 1206 body.
Q20 and D21 are independent selections, not claimed as the unidentified
Beetle C3 source BOM. D20 remains unselected, with no accepted footprint.
High-current J30/J31 and JP30/JP31 remain unresolved; no small service-header
model was assigned to them.

## Host Circuit

Root-level continuous wires join the MCU and converter hierarchical I2C
ports. R68.1 joins GPIO1/SCL (U2.13, INA238 U1.5, R6.2); R69.1 joins
GPIO0/SDA (U2.12, U1.4, R4.2). Their other ends join BQ25756 pins 1/2 and
J32 pins 2/3. R4/R6, 4.7k, remain the only bus pull-ups. BQ address is
0x6B; this is distinct from the configured INA238 address. No new ESP GPIO
is consumed. R70 remains the interrupt pull-up to shared 3.3 V, with
interrupt available at J32 only. No INA_ALERT allocation was restored.

J32 pin map: 1=shared 3.3 V reference, 2=BQ SCL, 3=BQ SDA, 4=INT,
5=CE, 6=GND. It is **not an external supply input**. An independent host
requires opening both rework links and disconnecting the ESP rail before
any separate-domain experiment. External CE inhibit requires a 1k series
test lead: a register can change CE into an open-drain output. Neither
CE nor pin-programming resistors are independent protection against
software faults. See the independent
[host-interface review](../../components/ti-bq25756/HOST_INTERFACE_REVIEW_2026-10-08.md),
which cites the manufacturer datasheet; this is not a TI-authored review.

CE default-low implements cold-start manual permission only. A running BQ
can retain host register changes; ESP loss does not guarantee automatic
return to the mechanical settings. Power-off I2C leakage, brownout,
sequencing, USB backfeed and retained-register fallback need bench tests
and a completed control contract. No firmware was changed.

## Physical Model Evidence

Manufacturer drawings, complete pin/pad readbacks, scratch physical
placements and actual rendered footprint inspection precede each accepted
selection. No new custom model was created. Detailed evidence:

- [Guard resistor models](../../components/v2-manual-controls/yageo-model-validation-2026-10-08.md)
- [Logic-power discrete models](../../components/beetle-power-v2/DISCRETE_MODEL_SELECTION_2026-10-08.md)
- [Service header models](../../components/v2-service-headers/MODEL_VALIDATION_2026-10-08.md)

The chosen generic stock footprints are checked for physical compatibility,
not claimed as exact manufacturer land-pattern copies. The documentation
identifies the SOT-23 body-outline nominal difference and Bourns 1206 land
differences. Thermal copper, solder process and finished-hole tolerances
remain layout/fabrication gates. Harwin was preferred over the initially
examined Wurth family because its published lead/hole tolerances fit the
stock 1 mm drill. Service headers are unkeyed and need cable orientation
markings. Header ratings are not field-interface protection.

## Verification

The [independent saved-design audit](COMPLETION_INDEPENDENT_REVIEW_2026-10-08.md)
found no new connectivity, polarity, physical-model or rendering defect.
It does not close the engineering gates listed below.

Final directory: `kicad/exports/review-completion-2026-10-08/`.

- `controller-v2.xml`: **135 components, 120 nets, 9 sheets**.
- `controller-v2.pdf`: native KiCad hierarchy review PDF; five changed-sheet
  PNGs were visually inspected for readable wiring, fields and safety notes.
- `controller-v2-erc.json`: native saved-file ERC, **0 violations**.
- `konnect-review.json`: all nine sheets have **0 shorts and 0 orphan items**;
  hierarchical sheet-pin validation has **0 issues**.
- **246 positive checks**: main 111, Beetle power 77, completion preservation
  16 and existing GPIO/LED 42.
- **42 deliberately broken XML fixtures rejected**: main 21, LV 16,
  completion 5. Saved transcripts are in the export directory.

ERC settings are unchanged from the pre-edit project: inherited ignored
categories are `single_global_label`, `four_way_junction`,
`simulation_model_issue`, and `footprint_filter`. No suppressions were added.
Zero ERC is not analog, thermal, USB-compliance or safety qualification.

`test-completion-netlist.ps1` compares the 136-component pre-edit snapshot
with this checkpoint. Only the declared metadata/value changes, JP32
removal and six host-interface endpoint groups are exempted; all other
component records, net names and complete endpoint records must match.
Existing main/LV tests explicitly assert the new circuit. The GPIO test's
historical `-Before` comparison is now optional; this checkpoint uses the
new full completion comparison instead of incorrectly comparing against
the older 133-component topology.

An interim native export exposed incomplete parent-sheet pin serialization
from Konnect `add_sheet_pin`. The pins were regenerated with
`import_sheet_pins`, read back, and the final native netlist proves actual
MCU/INA/BQ-link connectivity. Duplicate power-symbol annotations and a
leftover wire stub were also corrected before final acceptance. These
observations reinforce that MCP success alone is not the acceptance gate.

XML SHA256:
`1A4587E88D0C0F1F625A2E9906B9AB62896ACC8048C533E8ABC535DA50C122E1`

PDF SHA256:
`289E82BD47EB2B74DA0FEFC239EFFF9EA3E947F853983C2A33E8F5A008A7A7EC`

## Preservation and Open Gates

Pre-edit copy and hashes:
`.konnect-scratch/v2-completion-2026-10-08/baseline/`.
All **22 V1 design/library hashes match** that snapshot. V2 PCB remains
unchanged at SHA256
`B6C1248F91D1D950E8D2141FAA64D977A4DDE9D1C13A673F252443F9A13E9F0F`.
`preservation.json` and `source-hashes.csv` record the final evidence.
No PCB synchronization, firmware modification, installation, purchase,
manufacturing output or commit was performed.

All protected-file edits used the official Konnect 0.12.1 MCP stdio
transport through `.konnect-scratch/v2-2026-10-06/mcp.cjs`. There was no
live KiCad IPC; saved-file mutations and native CLI export/readback were
authoritative. Scratch PCB placements were isolated from the real PCB.
No `save_project` call was used.

Independent app/manual CV selection, GPIO20's future analog switch,
MCP channel-1 integration and /SHDN reassignment remain unfinished.
Mechanical CV/current topology and GPIO allocation were not altered.
R62 still limits the saved study to nominal 1 A input. JP30/JP31 remain
open. Wide-voltage/high-current operation, power/thermal derating at both
knobs' extremes, independent OVP/OCP/disconnect/reverse blocking,
capacitor derating/ripple, driver-regulator losses, high-current connectors
and shunt-package improvements remain qualification gates. There is no
internal dump load, no restored generator AUX supply and no claim of
galvanic or sustained HV-to-PC fault isolation.
