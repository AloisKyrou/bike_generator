# Component documentation

Store the authoritative documentation for every electrical component here.
Prefer manufacturer datasheets over reseller descriptions. Keep the original
PDF filename when practical and record its revision/date in this index.

## Prepared folders

| Folder | Component | Current status | Documents to add |
|---|---|---|---|
| `ina228/` | Texas Instruments INA228AIDGSR | selected for PCB V1 | datasheet, package drawing, land pattern, errata |
| `current-shunt/` | 2 mΩ four-terminal shunt | preliminary, exact MPN not selected | datasheet, derating curve, recommended footprint |
| `esp32-c3-beetle-dfr0868/` | DFRobot Beetle ESP32-C3 | probable physical board | schematic, pinout, mechanical dimensions |
| `dfr0520-mcp42100/` | DFR0520 / MCP42100 | present on prototype | module schematic, MCP42100 datasheet, dimensions |
| `buck-b0blg7tn1c/` | generic CV/CC buck, Amazon B0BLG7TN1C | present, exact controller unknown | listing copy, board photos, controller datasheet when identified |
| `acs712-legacy/` | ACS712 module | legacy prototype measurement | Allegro datasheet, module schematic, exact variant photo |
| `rectifier/` | three-phase bridge rectifier | exact reference to confirm | datasheet, pinout, thermal data |
| `bluetti-ac50s/` | BLUETTI AC50S | external energy sink | user manual, DC-input limits, connector information |
| `dump-load/` | G4 halogen branches | present or planned | lamp ratings, holders, thermal notes |
| `connectors-and-protection/` | fuses, terminals, TVS and power connectors | to be selected | datasheets and current/voltage ratings |

## Known online references

- INA228: <https://www.ti.com/product/INA228>
- INA228 datasheet: <https://www.ti.com/lit/ds/symlink/ina228.pdf>
- Beetle ESP32-C3: <https://www.dfrobot.com/product-2566.html>
- DFR0520: <https://wiki.dfrobot.com/dfr0520/>
- ACS712: <https://www.allegromicro.com/-/media/files/datasheets/acs712-datasheet.ashx>
- Buck listing: <https://www.amazon.fr/dp/B0BLG7TN1C>

## Naming convention

Use names such as:

```text
manufacturer_part-number_document_revision.pdf
manufacturer_part-number_land-pattern.pdf
module_front.jpg
module_back.jpg
measurements.md
```

Do not place credentials, order invoices or personal delivery information in
this versioned directory.
