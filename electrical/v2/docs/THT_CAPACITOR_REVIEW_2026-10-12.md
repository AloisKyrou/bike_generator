# THT capacitor implementation review

12 October2026. User requested the cheaper through-hole bank and autonomous
progress on the remaining pre-layout engineering. Not a fabrication, charging
or energization release.

## Implemented

- Only V2 `main_converter_tbd.kicad_sch` changed among production native files.
  All mutations used Konnect MCP. No V1, V2 PCB or firmware modifications.
- C73-C76/C81-C88: twelveEEU-FR2A101100uF/100V, standard radial10mm/pitch5mm
  footprint; original positive/negative connections and5-input/7-output split.
- Value/MPN/footprint/datasheet/description/prototype-status fields and one
  capacitor-bank note updated. User's direct wiring and placement retained.
- C77-C80 local ceramics, power guards and JP20/JP30/JP31 open state retained.
- Manufacturer PDF, polarity/dimension mapping, disposable schematic/PCB
  readback and inspected renders archived in the
  [component study](../../components/panasonic-eeu-fr2a101/README.md).
- BOM CSVs regenerated and cost dashboard reconciled without discarding its
  existing decisions/reserves. EUR9.54 per twelve-part basket versus31.02,
  before tax/shipping, conditional on qualification and supply. Latest DigiKey
  stock zero; Mouser same-day search reports4356, live purchase check pending.

## Evidence

Review directory: `../kicad/exports/review-tht-caps-2026-10-12/`.
[Eight-sheet PDF](../kicad/exports/review-tht-caps-2026-10-12/controller-v2.pdf).
Before/after XML:145 components,125 nets,8 sheets,33 library parts. Only the
twelve allowed component-field sets changed; all endpoint memberships match.
New dedicated regression rejects wrong value/MPN/footprint/polarity and an
unrelated resistor alteration. Existing power-endpoint test now has an explicit
`-Voltage70 -ThtBulk` profile; its historical polymer profile remains unchanged.
Both baselines pass760 endpoint/part assertions; all17 deliberately broken
power-stage XML fixtures are rejected with the THT profile. Reset regression and118 USB
service assertions pass; five broken USB fixtures are rejected.
Root ERC reports zero errors/warnings under the unchanged four ignored
categories. Final MAIN PNG inspected for text fit and preserved wiring.
Cost-tracker regression passes. These tests do not qualify hardware.

Saved MAIN SHA-256:
`27216E400CF7FC247598F8612258962B45A81B4A3D912DBBE4295022F09BC455`.

Useful commands from repository root:

```powershell
node electrical/components/panasonic-eeu-fr2a101/screen.mjs
./electrical/v2/docs/validation/test-tht-cap-substitution.ps1 -Before electrical/v2/kicad/exports/review-tht-caps-2026-10-12/before.xml -After electrical/v2/kicad/exports/review-tht-caps-2026-10-12/after.xml -TestNegative
./electrical/components/ti-bq25756/power-stage/review-power-endpoints.ps1 -Netlist electrical/v2/kicad/exports/review-tht-caps-2026-10-12/after.xml -Voltage70 -ThtBulk
```

## What remains unqualified

The capacitance screen improves, but this is NOT a drop-in full-current
qualification:1.5A individual ripple rating versus approximately1.53/1.57A
in the selected mismatch sensitivity cases; remote-bank loss of participation
is worse. Ceramic sharing/short placement may help, but cannot be assumed.
Temperature, ESR/ESL, AC-generator ripple, startup, inrush and stability must
be reconciled. Stored bulk energy at70V rises from0.794J to2.94J. This makes
the existing fault/connector review more important, not less.

The current selection is for the full-function prototype with its operating
rating still open. If qualification fails, derate or change the bank; do not
call the bank suitable for400W merely because its total capacitance is larger.

Follow-up [AONS driver analysis](../../components/aons66923/README.md) completed:
lower gate charge helps REGN, but bootstrap minimum-VGS and actual conditions
remain open. No unverified MOSFET/native substitution made. Remaining
USB/selector/cell/mechanical gates are in the
[closure ledger](PRELAYOUT_CLOSURE_2026-10-12.md).
