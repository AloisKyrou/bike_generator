# ESP32-C3-MINI-1-N4X V2 module evidence

Date: 2026-10-06. Accepted for schematic study; not a PCB fabrication release.

- Manufacturer: Espressif. Exact proposed MPN: ESP32-C3-MINI-1-N4X.
- [Official datasheet](https://documentation.espressif.com/esp32-c3-mini-1_datasheet_en.pdf), version 2.2; archived as `esp32-c3-mini-1-datasheet.pdf`.
- Datasheet SHA-256: `DE7361381348D82A1ABD337F10170BE7A420675987568F71FE3C5B100DEED270`.
- Official vendor CAD: [espressif/kicad-libraries](https://github.com/espressif/kicad-libraries/tree/dd76561812ab300351234ba6e0ec1295641796f0), commit `dd76561812ab300351234ba6e0ec1295641796f0`.
- Unmodified downloaded symbol and footprint live in `../../v2/kicad/libraries/vendor-espressif/`, with vendor license. No custom symbol or footprint was created.
- Symbol SHA-256: `5E9785368A1CCCBD904F8CEEAB1C9165A8EF82AB00C99BF21275DC91749356CC`.
- Footprint SHA-256: `F1899B54AB6C007D50E76334F3FB8F340A827BC1D26F1BA24003333C214A7626`.

## Pin-map acceptance

`pin-map.csv` joins every physical lead to the symbol and footprint pad, including all nine copper pieces numbered 49. Datasheet Figure 3-1 (p. 10) explicitly uses **top view**; Table 3-1 (p. 11) defines functions. The 53 physical pin numbers match 53 symbol pin numbers and 61 physical footprint pads: eight extra copper pieces implement the shared ground pad 49. No missing pin numbers or mechanical-only pads.

Konnect `get_symbol_info`, `get_footprint_info(include_pads=true, include_graphics=true)` and saved scratch `get_component_pads` were compared. Dimensions checked against Figures 10-1 and 11-1 (pp. 35/38): body 13.2 x 16.6 mm, perimeter 0.4 x 0.8 mm on 0.8 mm pitch, side centers 11.8 mm apart, corner pads 0.7 mm on 11.9 x 9.9 mm centers, ground pattern 5.4 mm square. Pin 1 is upper-left beneath the antenna, descending down the left edge. Fab and silk show antenna/body and keyed corner; courtyard is a vendor-authored 0.2 mm body allowance, to be rechecked against assembly rules before PCB release. No plated holes; board thermal vias and RF keepout must be designed at layout time.

Disposable symbol was placed and rendered via Konnect. Konnect refused disposable footprint placement because its typed placement path cannot preserve a custom-shape pad. KiCad 10's own `pcbnew.FootprintLoad`, `BOARD.Add`, and `SaveBoard` were therefore used **only in the scratch project**, not V2 or V1. Saved readback confirms 61 pads, 9 pieces for pad 49, and 1 custom chamfered pad preserved. Konnect independently read the saved pads and exported the scratch board; the rendered board and numbered footprint were visually inspected against the datasheet top view. No mirror or numbering discrepancy found.

Evidence and helper scripts are local-only under `.konnect-scratch/v2-2026-10-06/`. The scratch symbol/board, vendor footprint render, manufacturer pages and JSON MCP responses are retained there. The actual V2 PCB remains untouched. Future Konnect PCB placement/synchronization must resolve custom-pad support before use, never replace the chamfer with an invented approximation.

## Circuit constraints

Module supply is 3.0-3.6 V, never 5 V. Use 10 uF plus 100 nF local decoupling; qualify transient capability of the final regulator. EN must not float; 10 kOhm / 1 uF reset timing is an initial manufacturer-pattern choice, not final supervisor validation. GPIO2/8/9 boot straps require system-level reset tests, including connected accessories. GPIO18/19 remain native USB. RF antenna keepout, full USB ESD/power protection, regulator, charger and power mux remain separate V2 work. N4X uses chip revision 1.1; compatible ESP-IDF support must be checked before future firmware work.
