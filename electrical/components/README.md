# Component documentation

Store the authoritative documentation for every electrical component here.
Prefer manufacturer datasheets over reseller descriptions. Keep the original
PDF filename when practical and record its revision/date in this index.

Toute documentation utilisée pour confirmer un brochage, un boîtier, une
empreinte ou une limite électrique doit être copiée dans le dossier du
composant concerné. Chaque composant validé reçoit aussi un `README.md` qui
indique la source, la révision, les pages utilisées, le hash du fichier et la
correspondance broche physique → pin du symbole → pad du PCB.

## Prepared folders

| Folder | Component | Current status | Documents to add |
|---|---|---|---|
| [`ina228/`](./ina228/) | Texas Instruments INA228AIDGSR | pinout and footprint accepted for PCB V1 | TI datasheet archived; errata to add if published |
| `current-shunt/` | 2 mΩ four-terminal shunt | preliminary, exact MPN not selected | datasheet, derating curve, recommended footprint |
| [`dfr0868-beetle-esp32-c3/`](./dfr0868-beetle-esp32-c3/) | DFRobot Beetle ESP32-C3 | V2.0 strongly supported; footprint pending physical verification | official schematic, pinout, module datasheet and dimensions archived |
| [`dfr0520-mcp42100/`](./dfr0520-mcp42100/) | DFR0520 / MCP42100 | symbol and custom module footprint accepted for V1 | official module schematic, dimensions and MCP42100 datasheet archived |
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
