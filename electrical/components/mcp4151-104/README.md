# MCP4151-104 — potentiomètre numérique 100 kΩ

Statut : **référence PCB V1 retenue** pour remplacer le module DFR0520 du
prototype. La référence commandable est `MCP4151-104E/SN` : un canal,
100 kΩ, 257 positions, mémoire volatile, boîtier SOIC-8 étroit.

## Source archivée

| Document | Révision | Usage | SHA-256 |
|---|---|---|---|
| [`microchip-mcp413x-415x-423x-425x-ds22060b.pdf`](./microchip-mcp413x-415x-423x-425x-ds22060b.pdf) | DS22060B, 2008 | brochage, limites électriques, découplage et protocole SPI | `6C60B083B2EF0A92BFD9D3AE16A1D859663219B4D08F9D0A29C8717DE05C73ED` |

Source officielle : <https://ww1.microchip.com/downloads/aemDocuments/documents/OTH/ProductDocuments/DataSheets/22060b.pdf>

Microchip indique le MCP4151-104 comme remplaçant recommandé et compatible en
brochage du MCP41100 pour les nouvelles conceptions :
<https://www.microchip.com/en-us/product/mcp41100>.

## Brochage retenu

| Pad SOIC-8 | Fonction | Net PCB |
|---:|---|---|
| 1 | `~CS` | `POT_CS` |
| 2 | `SCK` | `POT_SCK` |
| 3 | `SDI/SDO` | `POT_MOSI` ; écriture uniquement |
| 4 | `VSS` | `GND` |
| 5 | `P0A` | `CC_A` |
| 6 | `P0W` | `CC_W` |
| 7 | `P0B` | `CC_B` |
| 8 | `VDD` | `+3V3` |

Le symbole KiCad natif est
`Potentiometer_Digital:MCP4151-xxxx-P`. Son empreinte par défaut DIP est
remplacée explicitement par
`Package_SO:SOIC-8_3.9x4.9mm_P1.27mm`, conforme au boîtier `/SN`.

## Validation symbole et empreinte

Référence contrôlée : Microchip `MCP4151-104E/SN`, datasheet `DS22060B`.
Le suffixe `/SN` désigne le boîtier SOIC étroit 150 mil à 8 broches. Le
brochage est donné en **vue de dessus** dans le synoptique des boîtiers en
page 1 ; le dessin mécanique SOIC est en page 67.

| Broche datasheet | Fonction | Pin du symbole | Pad de l'empreinte | Vue / sens |
|---:|---|---:|---:|---|
| 1 | `~CS` | 1 | 1 | vue de dessus, départ au repère de broche 1 |
| 2 | `SCK` | 2 | 2 | côté gauche vers le bas |
| 3 | `SDI/SDO` | 3 | 3 | côté gauche vers le bas |
| 4 | `VSS` | 4 | 4 | côté gauche vers le bas |
| 5 | `P0A` | 5 | 5 | côté droit vers le haut |
| 6 | `P0W` | 6 | 6 | côté droit vers le haut |
| 7 | `P0B` | 7 | 7 | côté droit vers le haut |
| 8 | `VDD` | 8 | 8 | côté droit vers le haut |

Les comptes concordent : 8 broches physiques, 8 pins électriques et 8 pads,
sans pad exposé, doublon ni élément mécanique numéroté. La relecture Konnect
du symbole confirme les noms et numéros ci-dessus.

La relecture de l'empreinte KiCad native confirme :

- pas de 1,27 mm ;
- pads CMS de 1,95 × 0,60 mm ;
- centres des rangées à `x = ±2,475 mm` ;
- corps `F.Fab` de 3,90 × 4,90 mm ;
- encombrement maximal du courtyard : 7,40 × 5,40 mm ;
- repère de broche 1, courtyard et modèle 3D présents.

Cette empreinte standard JEDEC MS-012AA est utilisée telle quelle : **aucun
symbole ou footprint personnalisé n'a été recréé**. Avant fabrication, vérifier
visuellement dans PCB Editor que le repère 1 du composant correspond bien au
pad 1 et conserver la sérigraphie lisible.

## Limites et conditions d'acceptation

- alimentation V1 : 3,3 V ; caractéristiques analogiques spécifiées entre
  2,7 et 5,5 V ;
- `P0A`, `P0W` et `P0B` doivent rester entre `VSS` et `VDD` en fonctionnement ;
- limite absolue sur ces bornes : `-0,3 V` à `VDD + 0,3 V` ;
- courant maximal dans chaque borne analogique : ±2,5 mA ;
- résistance nominale A–B : 100 kΩ ±20 % ;
- résistance de curseur : 75 Ω typique, 300 Ω maximale à 2,7 V ;
- `C12 = 100 nF X7R` doit être placé entre VDD et VSS, à moins de 4 mm de la
  broche VDD lors du placement PCB.

La connexion à `J_CC_CTRL` reste **interdite avant mesure**. Dans tous les états
du buck (éteint, allumé, CC minimum et CC maximum), les trois bornes doivent
rester dans `[0 V; 3,3 V]` et leur courant doit rester très inférieur à la
limite absolue de 2,5 mA. Sinon une interface différente sera nécessaire.

## SPI et logiciel

Le MCP4151 utilise une commande d'écriture 16 bits différente du MCP42100 :
adresse `00h`, commande `00`, puis la donnée. Pour la plage conservée 0–255,
le premier octet vaut `0x00` et le second contient la position du curseur.

La broche 3 multiplexe entrée et sortie. La V1 ne lit aucun registre et ne
route donc pas de `POT_MISO`. Toute future lecture devra gérer le bus
demi-duplex et éviter un conflit de pilotage avec la sortie open-drain du
MCP4151.

Au démarrage, le curseur volatile revient à mi-échelle. Le firmware doit donc
programmer explicitement `POT_INITIAL` dès son initialisation ; l'état sûr
matériel global reste à valider séparément.
