# TI BMS042A layout reference

Imported on 12 October 2026 with official KiCad 10.0.6 Altium importer.
REFERENCE ONLY: not our V2 layout and not a manufacturing release.

## Provenance

Existing project archive: `../BQ25756EVM_Design_Files.zip`.
Published TI design-file source:
https://e2e.ti.com/support/power-management-group/power-management/f/power-management-forum/1322329/bq25756evm-gerber-and-schematics-files

Archive SHA256:
`48F447BC865D2EFF215E7F3361B0A5748873CF01AF4501BA171D89965BC5B995`.
Extracted `BMS042A_PCB.PcbDoc` SHA256:
`B2C10ACDF8C93A15B11F4DB874A7A2D389A6ADAC7FD6687D3579A33D10D953EA`.
Imported `BMS042A-reference.kicad_pcb` SHA256:
`6D4681C5AA66E050F5706B9A8F9F688B3473FC897F3434C3B7C81CD19E8F1B24`.

Conversion used `kicad-cli pcb import --format altium`, with JSON report in
repository-root `.konnect-scratch/ti-bms042a-import-report.json`.
Source files and accompanying HTML/selected ODB++ metadata are retained here.
Keep TI's original ownership/notices; this import does not relicense their CAD.

## Scope and limitations

The ODB matrix and imported board have SIX copper layers: Top Layer, Layer 2
PGND, Layer 3, Layer 4, Layer 5 PGND and Bottom Layer. KiCad maps these to
F.Cu, In1.Cu, In2.Cu, In3.Cu, In4.Cu and B.Cu.

Importer reports 275 footprints, 1081 tracks, 927 vias and 114 zones. Exit code
was zero. Its console also warned about 16 unmapped Internal Plane names;
the JSON warnings array is empty. Preserve this discrepancy: successful import
does not prove complete layer/geometry/net or design-rule equivalence.

PDF and top SVG are visual reference exports; the PDF overview was inspected.
This is BMS042A revision material, not proof of matching the latest guide or
datasheet revision. Reconcile pin functions against the current BQ datasheet.

Use to study relative controller/driver placement, bootstrap returns, local
ceramic loops, Kelvin sensing and separation of quiet and switching paths.
Do not copy trace widths, thermal capability or multilayer return structures
into the two-layer V2. Our THT MOSFETs, capacitor bank and bottom heatsink
arrangement differ. NO TI copper has been merged into V2.
