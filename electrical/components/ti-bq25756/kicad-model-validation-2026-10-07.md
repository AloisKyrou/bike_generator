# BQ25756 KiCad model validation, 7 October 2026

## Status

Electrical pin mapping accepted for schematic study only. The user explicitly
authorized this custom symbol. This is not fabrication, thermal, stencil, or
charger-safety approval. No real PCB was changed.

- Symbol: `BikeGeneratorV2:BQ25756RRV`, value `BQ25756RRVR`.
- Library: `electrical/v2/kicad/libraries/symbols/BikeGeneratorV2.kicad_sym`.
- Standard footprint: `Package_DFN_QFN:QFN-36-1EP_5x6mm_P0.5mm_EP3.6x4.6mm`.
- Explicit footprint assignment is required on each placed symbol: Konnect's
  `create_symbol` has no default-footprint property parameter. Library readback
  has an empty default footprint; the validated scratch instance has the exact
  assignment above. Do not silently substitute the similar 3.6 x 4.1 mm EP part.

## Manufacturer Reconciliation

Source is TI `bq25756.pdf`, SLUSEN5A, August 2026, archived here. SHA256:
`75FAF67E43DA19BB009862CE2F33909600B9AED4E2A521134D8BE52686583B0E`.
Figure 4-1 and Table 4-1 on printed pages 3-5 define every lead. The RRV0036A
package appendix, drawing 4226422/A (11/2020), defines body and lands. Package
outline is viewed from underneath; the pin diagram and PCB land pattern are
viewed from above. They were reconciled without mirroring pad numbers.

The [accepted map](accepted-pin-map-2026-10-07.csv) records all 37 physical leads,
symbol pins and footprint copper pads, including coordinates and pad dimensions.
Pad 37 is named Thermal_pad by TI and PGND in the symbol because TI requires its
ground connection. Pins 17 and 22 also connect to PGND. Only 15, 16 and 31 are NC.
Pin 32 is VAC sense and pin 33 is VAC bias despite sharing the displayed name.
Older EVM drawings name lead 17 MODE: the latest datasheet takes precedence.
All physical pins are explicit, with no hidden or stacked pins.

## Footprint Inspection

The installed KiCad 10 footprint was queried and placed unchanged on a disposable
board using Konnect. Library and scratch-pad readbacks agree on all 37 numbered
pads and the placed offset (100, 100 mm), rotation zero. The body is 5 x 6 mm,
pitch 0.5 mm and EP 3.6 x 4.6 mm. Top-view numbering runs counterclockwise from
pin 1 at the upper left. A fabrication chamfer and silkscreen triangle identify
pin 1. There are no drill holes in this plain variant.

Important difference: this standard footprint cites the Analog Devices UHE36
package rather than TI's RRV land drawing. External lands are 0.875 x 0.25 mm
(rotated on top/bottom), versus TI's example 0.6 x 0.25 mm. Their row centers are
2.4375/2.9375 mm from origin versus TI's 2.4/2.9 mm. Electrical numbering, pitch,
body and EP agree, but this is not an exact copy of TI's recommended land pattern.
Copper clearance to EP is 0.2 mm, adjacent external pads have 0.25 mm clearance.
The stepped courtyard extends to +/-3.13 and +/-3.63 mm, leaving about 0.255 mm
beyond external copper ends. Review assembly clearances before layout release.

Pad 37 has copper and mask only; twelve separate, unnumbered paste-only apertures
are each 0.97 x 0.93 mm. Their rectangular-area sum is 65.37% of EP area (actual
rounded aperture area is slightly lower). A thermal-via variant was inspected
but not selected. Thermal vias, paste process, solder mask and board copper
require a PCB-specific review, especially at high input voltage.

Footprint source SHA256:
`5224D07350AB8D7CA7D3341D415AD736071DF3502FD46CEC6EC758F1C698E9A4`.

## Verification Evidence

All model creation and scratch placement used the official Konnect 0.12.1 MCP
stdio transport through `.konnect-scratch/v2-2026-10-06/mcp.cjs`. No generic
editor or serializer wrote KiCad source files. KiCad native SVG export and
Konnect schematic PNG rendering were visually inspected.

- Scratch project: `.konnect-scratch/v2-2026-10-07/bq-model-validation/`.
- Renders: `symbol.png`, `footprint.svg`, `footprint-detail.png` in that directory.
- Executable readback comparison: `../validate-bq-model.cjs` relative to scratch.
- Symbol readback: `1791363335879-get_symbol_info.json` in the October 6 scratch.
- Library pad readback: `1791363159420-get_footprint_info.json`.
- Placed pad readback: `1791363336928-get_component_pads.json`.
- Assertions: 37 manufacturer/symbol names, 37 exact-numbered copper pad
  positions, scratch transforms, dimensions and layers, twelve paste windows,
  no drills. PASS. The original manufacturer CSV remains unchanged.

NC pins use `no_connect`; open-drain status outputs use `open_collector`; the
gate outputs use `output`; boot and switch nodes use `passive`; REGN is
`power_out`, DRV_SUP and PGND/VAC are `power_in`. CE is bidirectional per TI's
I/O designation. ERC types are checking aids, not a substitute for driver and
fault analysis. CE and current-limit pins can be disabled by registers.
