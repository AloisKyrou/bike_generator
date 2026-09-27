# Connecteurs et protections — candidats V1

Statut : **choix V1 figés pour le fusible auxiliaire et la TVS ; fusible
principal configurable selon la source**.

| Fonction | Candidat | Motif principal | Condition avant validation |
|---|---|---|---|
| Fusible principal | calibre configurable ≤ 20 A, tension assignée ≥ 125 V DC | protège le trajet V1 limité à 20 A tout en restant compatible avec le plafond garanti de 70 V | choisir la courbe, le pouvoir de coupure et le calibre selon la génératrice |
| Porte-fusible principal | porte-fusible explicitement coté ≥ 125 V DC et compatible avec le fusible retenu | fusible remplaçable dans le faisceau | choisir longueur/section de câble et variante disponible |
| Fusible auxiliaire | Littelfuse `0449001.MR`, 1 A / 125 V, Slo-Blo | protège la branche LM5164 ; le déclassement continu de 25 % reste compatible avec le courant d'entrée calculé du LM5164 | empreinte exacte créée ; valider l'appel au démarrage |
| TVS bus | Littelfuse `SMCJ70A`, unidirectionnelle, 1500 W | écrêtage « best effort » des transitoires courts | `Diode_SMD:D_SMC`, montée après `F1` et avant le shunt ; ne garantit pas un clamp sous 85 V |
| Connecteurs de puissance | Anderson Powerpole PP15/45 | famille documentée, jusqu'à 10 AWG, contacts PCB disponibles | choisir orientation, contacts et architecture faisceau/PCB |
| Câble puissance | 12 AWG minimum proposé, 10 AWG avec marge | enveloppe 20 A continue | longueur, température, groupement et isolant à confirmer |

## Décision V1 — bus 70 V et TVS

- `BUS_PROTECTED` est spécifié à **70 V maximum en continu garanti** ; la plage
  70–80 V est hors spécification et un fonctionnement durable peut endommager
  la TVS ou le reste de la carte ;
- l'INA228, limité à 85 V, reste le composant qui fixe cette enveloppe ;
- la TVS ne remplace ni cette limite d'emploi ni le fusible et n'est destinée
  qu'aux impulsions brèves ; aucun surge-stopper n'est ajouté en V1.

La `SMCJ70A` garantit une tension inverse permanente `VRWM` de 70 V. Son
avalanche est spécifiée entre 77,8 et 86,0 V et sa tension de limitation peut
atteindre 113 V à 13,3 A d'impulsion. Elle absorbera donc de nombreux pics
réels, mais ne constitue pas une garantie absolue de maintenir l'INA228 sous
85 V. Ce compromis maximise la plage commune aux génératrices visées. Une TVS
plus basse protégerait mieux l'INA228 mais réduirait la tension continue
admissible de la carte.

Dans le schéma `POWER_PATH`, `D1` est montée après le fusible principal `F1` et
avant le shunt : cathode côté bus, anode à `GND`. Les autres composants haute
tension restent dimensionnés et vérifiés jusqu'à 80 V afin de conserver une
marge de conception ; cela ne transforme pas 70–80 V en plage d'utilisation
garantie.

Sources fabricants :

- [Littelfuse LP JCASE](https://www.littelfuse.com/~/media/files/littelfuse/technical%20resources/documents/product%20catalogs/lf_aftermarketcatalog_rev1_2015_lowres%20pdf.pdf)
- [Littelfuse HLJC](https://www.littelfuse.com/assetdocs/hljc-series-datasheet?assetguid=c6d82630-330b-41ea-b553-d50c31cd7f8f)
- [Littelfuse 449](https://www.littelfuse.com/assetdocs/fuses-449-datasheet?assetguid=7aef6e93-9808-456e-9bee-fba54271285f)
- [Littelfuse SMCJ](https://www.littelfuse.com/assetdocs/tvs-diodes-smcj-datasheet?assetguid=37388813-0d6d-4329-969b-1aa8b7614ac1)
- [Anderson PP15/45](https://www.andersonpower.com/content/dam/app/ecommerce/product-pdfs/PP1545/DS-PP1545.pdf)

## Documentation archivée

| Document | Usage | SHA-256 |
|---|---|---|
| [`anderson-pp1545-datasheet.pdf`](./anderson-pp1545-datasheet.pdf) | contacts câblés et PCB, courants, calibres de fils et références | `E82C8885EF9BCF147035AF45C575E062AB7A0EA30506E0D7BCACA5E615B6E4AE` |
| [`littelfuse-449-datasheet.pdf`](./littelfuse-449-datasheet.pdf) | caractéristiques électriques, dimensions et land pattern du `0449001.MR` ; copie miroir du document Littelfuse, le serveur fabricant refusant le téléchargement automatisé | `F60276A6F8DCF852C7E5BE37B73296D2B2AD692662B4229295AADC0137C88555` |
| [`littelfuse-smcj-datasheet.pdf`](./littelfuse-smcj-datasheet.pdf) | caractéristiques `SMCJ70A`, boîtier DO-214AB/SMC et limites de clamp | `04C55B5C1641BD74C012EF8B3116444AAB9F5F9C6A11C497BD255BA910C2E172` |

Les PDF LP JCASE et HLJC sont liés ci-dessus, mais leur serveur a refusé
l'archivage automatisé. Ils devront être téléchargés manuellement dans ce
dossier si ces références sont acceptées définitivement.

## Empreinte du fusible auxiliaire

Le land pattern Littelfuse comporte deux pastilles de `1,96 × 3,15 mm`, un
intervalle cuivre de `2,95 mm` et un entraxe de `4,91 mm`. KiCad 10 ne fournit
pas d'empreinte native 6125/2410 exacte. L'empreinte locale
`BikeGenerator:Fuse_Littelfuse_0449001MR_6.10x2.69mm` reprend uniquement ces
dimensions, le corps nominal `6,10 × 2,69 mm` et un courtyard de
`7,37 × 3,65 mm` correspondant à l'enveloppe des pads augmentée de `0,25 mm`.
Elle n'embarque ni repère de polarité, ni modèle 3D. Aucun modèle ECAD exact
téléchargeable n'a été trouvé ; DigiKey ne propose actuellement qu'un modèle
3D pour cette référence.
