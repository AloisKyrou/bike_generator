# Dual digipot selection

8 October 2026. Component comparison and next-rework recommendation, not a
completed selector, approved CAD model, or permission to energize a board.
No KiCad source, firmware or generated BOM was changed in this pass.

## Recommendation

Subsequent user response approves this choice. Component selection is approved;
the model/interface qualification and schematic replacement below remain open.

Use Microchip **MCP4251-503E/SL**, dual 50k, for the next CV implementation.
The user authorizes a practical equal/lower-cost alternative with available
footprint and stock. This meets that direction without increasing channel count,
adding a range GPIO, or chasing excessive voltage precision. U3 remains the old
MCP42100 in the saved design until the controlled schematic replacement.

Channel 1 remains CV; channel 0 remains spare. BOTH channels become 50k instead
of 100k: document this on the spare connector and external-converter profiles.
Current/effort adjustments remain BQ I2C, not the spare digipot.

## Comparison and sourcing

Prices observed on opened distributor pages, EUR before VAT/shipping, quantity
one; stock is not reserved. Regional listings may differ. Recheck at purchase.

| Part | Nominal resistance step | Package | Price / stock | Assessment |
|---|---:|---|---|---|
| MCP42100-I/SL | 100k / 256 = 390.625 ohm | SOIC-14 | EUR2.48 / 1,451 | Existing baseline; acceptable practical precision but no price advantage |
| MCP4251-503E/SL | 50k / 256 = 195.3125 ohm | SOIC-14 | EUR1.09 / 336 | Preferred: suitable range, half the nominal step, lower price |
| AD5142BRUZ100 | 100k / 256 = 390.625 ohm | TSSOP-16 | EUR5.64 / 198 (indexed listing) | Better specified resistance tolerance and nonvolatile memory, not useful enough here for the extra cost |

Sources:

- [MCP42100 DigiKey France](https://www.digikey.fr/en/products/detail/microchip-technology/MCP42100-I-SL/362091).
- [MCP4251 DigiKey Italy, opened](https://www.digikey.it/it/products/detail/microchip-technology/MCP4251-503E-SL/1635693).
  French product page failed retrieval; do not call this a French checkout quote.
- [AD5142 DigiKey Belgium, indexed](https://www.digikey.be/fr/products/detail/analog-devices-inc/AD5142BRUZ100/3777413).
- [Microchip MCP4251 product](https://www.microchip.com/en-us/product/MCP4251): in production.
- [ADI AD5142 product](https://www.analog.com/en/products/ad5142.html): dual,
  256 positions, 10k/100k, +/-8% resistance tolerance, SPI/nonvolatile,
  TSSOP/LFCSP. Its 10k option is too short for this direct lower-leg study.

The expected IC-only saving versus today's MCP42100 listing is EUR1.39 per
board. This is not yet a change to the as-drawn BOM or total project budget.

## Why 50k fits

Using the existing study's 249k upper resistor, 7.50k fixed lower guard and
nominal 1.536 V reference, ignoring switch/FBG/wiper resistance:

`Vout = 1.536 * (1 + 249000 / (7500 + Rpot))`

12 V needs Rpot = 29.0505k. The new device's specified 40k-60k full-track
range therefore has ample nominal reach to 12 V even at the low track corner.
This is a resistance-range check, not final tolerance/transient qualification.
The 5k and 10k options do not span this direct-divider adjustment requirement.
The 100k option sacrifices useful step size unnecessarily for this CV use.

Ideal first-code voltage difference falls from about 2.525 V with 100k to
1.294 V with 50k. It is still nonlinear and not a uniform 0.16 V per code.
BQ reference trim can refine selected voltages. No guarantee of continuous
coverage at every component corner is made or required by the latest user
direction. Report achievable settings honestly and never round upward beyond
a receiver limit. Readback/calibration does not replace safe hardware bounds.
The existing guarded divider does not establish full 54.6 V charging support;
55 V remains a working ceiling, not guaranteed setpoint coverage.

## Electrical integration

Manufacturer source: [DS22060B](https://ww1.microchip.com/downloads/aemDocuments/documents/OTH/ProductDocuments/DataSheets/22060b.pdf),
2008, 88 pages, downloaded from the current manufacturer's product-page link.
Archived [PDF](mcp4251-22060b.pdf), SHA256
`6C60B083B2EF0A92BFD9D3AE16A1D859663219B4D08F9D0A29C8717DE05C73ED`.
Relevant pages: 1, 3-6, 31-33, 35-38, 42 onwards, package section.

- Use 3.3 V; analog specifications apply at 2.7-5.5 V. Do not treat the
  lower serial-interface operating voltage as full analog qualification.
- 257 tap positions, volatile midscale startup, +/-20% track resistance.
- A/W/B remain within the actual VSS/VDD rails. Higher-voltage DIGITAL-input
  tolerance does not make the analog terminals battery-voltage tolerant.
- Powered-off protection and GPIO20-controlled manual/app handover are still
  required; terminal-disconnect commands are not off-state high-voltage isolation.
- Command format differs from MCP42100. Keep existing three write-side SPI
  GPIOs; no firmware edits in this schematic/research task.
- Register readback uses separate SDO. The existing design does not wire an
  ESP MISO input; do not claim it gains register readback for free. BQ I2C
  output-voltage telemetry is the intended physical readback, not SDO.
- Hold /SHDN inactive when the qualified selector replaces its GPIO function;
  define CS/startup levels and confirm reset behavior during integration.

## Installed KiCad model check

Read-only Konnect queries found:

- `Potentiometer_Digital:MCP4251-xxxx-SL`, 14 symbol pins.
- `Package_SO:SOIC-14_3.9x8.7mm_P1.27mm`, 14 unique SMD pads,
  1.27 mm pitch; existing footprint, no new footprint required for the candidate.
- Pads 1-7 are at x=-2.475 mm, y=-3.81 through +3.81 mm; pads 8-14
  at x=+2.475 mm, y=+3.81 through -3.81 mm. Lands 1.95 x 0.60 mm.
  F.Fab body 3.90 x 8.65 mm; silk pin-1 marker and courtyard present.

Top-view datasheet mapping and stock symbol agree on CS1, SCK2, SDI3, VSS4,
P1B5, P1W6, P1A7, P0A8, P0W9, P0B10, /SHDN12, SDO13 and VDD14.
Pin 11 has a manufacturer-document discrepancy: page 1 and stock symbol call
it /WP, but Table 3-1 calls it NC; section 3.11 says NC may be tied to VDD or
VSS. A VDD tie is compatible with both descriptions (inactive /WP versus NC),
but record/resolve the label before claiming complete model acceptance.
Do not silently connect it as MCP42100's reset input or claim drop-in firmware
compatibility. No custom symbol or footprint was created.

Complete manufacturer mechanical-drawing reconciliation, disposable placement/
render and pin-11 disposition during the schematic replacement before accepting
the model for release. The current comparison verifies model availability and
the functional-pin map except the documented discrepancy, not full CAD release.

Raw MCP search/symbol/footprint responses are timestamped in
`.konnect-scratch/v2-2026-10-06/`; query arguments are the three
`.konnect-scratch/digipot-*-2026-10-08.json` files.

## Remaining decisions versus engineering

No new user architecture decision is required to continue. BQ-only prototype
telemetry is accepted for measurement testing, not a reason to retain duplicate
INA by default. GPIO20, independent manual/app voltage settings, two mechanical
controls, one spare digipot, USB/optional 1S and no internal dump remain fixed.

Engineering to finish: protected selector and startup/ESP-loss behavior; final
input path for at least approximately 10 A objective; shunt reuse, switch/inductor/
capacitor ratings and cooling; combined autonomous voltage/current/thermal
bounds; then fresh schematic checks, readable exports and as-drawn cost update.
Do not claim 55 V x 10 A continuous from a provisional 400 W input target.
Bring any demonstrated cost/capability conflict back with numbers, not another
open-ended request for the user to design the circuit.
