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
| [`current-shunt/`](./current-shunt/) | Bourns CSS4J-4026K-2L00F, 2 mΩ four-terminal shunt | référence et footprint natif figés pour PCB V1 | datasheet archivée ; land pattern et brochage Kelvin vérifiés |
| [`dfr0868-beetle-esp32-c3/`](./dfr0868-beetle-esp32-c3/) | DFRobot Beetle ESP32-C3 | V2.0 retenu ; empreinte porte-module socketée créée et affectée à U2 | schéma, datasheet, dimensions et CAD V1/V2 officiels archivés |
| [`dfr0520-mcp42100/`](./dfr0520-mcp42100/) | DFR0520 / MCP42100 | prototype breadboard historique, retiré du PCB V1 | documentation du module conservée |
| [`mcp4151-104/`](./mcp4151-104/) | Microchip `MCP4151-104E/SN` | référence PCB V1 retenue ; symbole et empreinte KiCad natifs | datasheet officielle archivée ; compatibilité avec le buck à mesurer |
| [`lm5164-aux-supply/`](./lm5164-aux-supply/) | Texas Instruments LM5164 | standard KiCad symbol pinout matches the datasheet; `LM5164DDAT` proposed; footprint not yet accepted | official TI datasheet archived; structured Konnect readback, Ultra Librarian package and power-stage values pending |
| [`jst-ph-battery-connector/`](./jst-ph-battery-connector/) | JST-PH 2 contacts, `S2B-PH-K-S(LF)(SN)` + `PHR-2` | famille choisie et empreinte KiCad standard affectée à `J6` | fiche JST archivée ; confirmer polarité et accessibilité physique |
| [`buck-b0blg7tn1c/`](./buck-b0blg7tn1c/) | generic CV/CC buck, Amazon B0BLG7TN1C | present, 60 × 60 × 45 mm recorded, exact controller unknown | source image, board photos, controller datasheet when identified |
| `acs712-legacy/` | ACS712 module | legacy prototype measurement | Allegro datasheet, module schematic, exact variant photo |
| `rectifier/` | three-phase bridge rectifier | exact reference to confirm | datasheet, pinout, thermal data |
| `bluetti-ac50s/` | BLUETTI AC50S | external energy sink | user manual, DC-input limits, connector information |
| `dump-load/` | G4 halogen branches | present or planned | lamp ratings, holders, thermal notes |
| [`connectors-and-protection/`](./connectors-and-protection/) | fuses, TVS and power connectors | provisional candidates documented | final choice after voltage/current measurements |

## Known online references

- INA228: <https://www.ti.com/product/INA228>
- INA228 datasheet: <https://www.ti.com/lit/ds/symlink/ina228.pdf>
- Beetle ESP32-C3: <https://www.dfrobot.com/product-2566.html>
- DFR0520: <https://wiki.dfrobot.com/dfr0520/>
- MCP4151: <https://www.microchip.com/en-us/product/MCP4151>
- LM5164: <https://www.ti.com/product/LM5164>
- LM5164 datasheet: <https://www.ti.com/lit/ds/symlink/lm5164.pdf>
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
