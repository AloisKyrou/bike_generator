# MCP4251-503E/SL Model Validation

Validated for the adaptive V2 schematic on 2026-10-08, before real placement.
This is symbol/package acceptance, not acceptance of the voltage-control circuit.

## Source and Pin Map

Microchip DS22060B (2008), archived as `mcp4251-22060b.pdf`, pages 1,
31-32 and 77. SHA256:
`6C60B083B2EF0A92BFD9D3AE16A1D859663219B4D08F9D0A29C8717DE05C73ED`.
Source: https://ww1.microchip.com/downloads/aemDocuments/documents/OTH/ProductDocuments/DataSheets/22060b.pdf

| Physical Pin | Function | Intended Use |
|---|---|---|
| 1 | CS | ESP SPI chip select, pulled high |
| 2 | SCK | ESP SPI clock |
| 3 | SDI | ESP SPI data out |
| 4 | VSS | GND |
| 5 | P1B | GND |
| 6 | P1W | CV channel wiper, tied to P1A |
| 7 | P1A | Protected CV rheostat terminal |
| 8 | P0A | Spare channel connector |
| 9 | P0W | Spare channel connector |
| 10 | P0B | Spare channel connector |
| 11 | NC / WP discrepancy | VDD |
| 12 | SHDN | VDD |
| 13 | SDO | No connect, write-only host interface |
| 14 | VDD | 3.3 V |

The page-1 drawing and stock KiCad symbol call pin 11 WP, whereas Table 3-1
calls it NC for MCP4251. Section 3.11 explicitly permits NC pins tied to VDD
or VSS. VDD is compatible with both the stated NC treatment and inactive WP;
the discrepancy is retained rather than silently rewriting the manufacturer.

## Model and Physical Inspection

Installed unchanged symbol `Potentiometer_Digital:MCP4251-xxxx-SL` and footprint
`Package_SO:SOIC-14_3.9x8.7mm_P1.27mm` were queried, placed on a disposable
schematic/PCB through Konnect, queried again, and visually inspected. All 14
symbol pins and all 14 physical pads were checked. No custom model was created.

Manufacturer drawing C04-065B: 14 leads, 1.27 mm pitch, 3.90 mm body width,
8.65 mm body length, 6.00 mm overall width and 1.75 mm maximum height.
Pin 1 is upper left in top view; pins 1-7 descend the left and 8-14 ascend
the right. Standard lands are 1.95 x 0.60 mm, centered at x = +/-2.475 mm,
y = -3.81 through +3.81 mm in 1.27 mm steps. The fabrication outline is
3.90 x 8.65 mm, with pin-1 chamfer and visible silkscreen marker. Front copper,
paste and mask pads, courtyard and orientation match the checked package.

Evidence: `.konnect-scratch/v2-adaptive-2026-10-08/model-mcp-result.json`,
`models/mcp-symbol.png`, native KiCad `models/mcp.svg` and inspected
`models/mcp-pads.png`; manufacturer views `mcp-pinmap.png` and
`mcp-package77.png` in the same scratch directory.

## Limits

The part is dual 50 kOhm, volatile, 257 positions, with +/-20% track tolerance.
Analog operation requires the specified supply range; analog terminals are
not high-voltage tolerant and must remain within their permitted rail limits.
MCP power-on midscale is not an approved charging profile. The independent
manual/app switch, power-loss behavior, hot leakage and transient protection
require separate circuit analysis and bench validation.
