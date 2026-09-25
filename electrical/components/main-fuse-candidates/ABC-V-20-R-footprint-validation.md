# Validation de l'empreinte Eaton ABC-V-20-R

## Sources

- page produit Eaton `ABC-V-20-R`, consultée le 25 septembre 2026 :
  <https://www.eaton.com/us/en-us/skuPage.ABC-V-20-R.html>
- fiche Eaton série ABC, publication 2000, révision effective novembre 2021 :
  <https://www.eaton.com/content/dam/eaton/products/electronic-components/resources/data-sheet/eaton-abc-fast-acting-ceramic-tube-fuses-data-sheet.pdf>
- dessin mécanique historique de la même série ABC/ABC-V, utilisé pour relever
  les tolérances maximales du boîtier et le diamètre des fils ; la page produit
  Eaton actuelle confirme l'enveloppe hors tout de la version axiale.

## Correspondance physique

| Élément | Donnée fabricant | Géométrie KiCad |
|---|---:|---:|
| corps maximal | 32,82 × 6,76 mm | `F.Fab` 32,82 × 6,76 mm |
| diamètre des fils, version 20 A | 1,02 mm | perçage fini 1,30 mm |
| entraxe de montage | non imposé par Eaton, fils formables | 38,10 mm |
| pads | choix de conception | 4,00 × 5,00 mm, THT |
| courtyard | choix IPC/projet | 43,10 × 7,76 mm, soit 0,50 mm autour de l'enveloppe pads/corps |

L'entraxe de 38,10 mm est donc un **choix de montage de la carte**, pas une cote
de land pattern recommandée par Eaton. Il laisse 2,64 mm de fil horizontal de
chaque côté du corps maximal avant le coude. Les trous de 1,30 mm laissent
0,28 mm de jeu diamétral autour des fils nominaux de 1,02 mm. Les grands pads
favorisent la soudure manuelle et le raccordement au cuivre 20 A ; ils ne
dispensent pas du calcul des pistes, des plans et des éventuels renforts.

## Vérifications ECAD du 25 septembre 2026

- recherche KiCad : aucune empreinte exacte `ABC-V-20-R` ;
- pads : 1 et 2 présents, traversants, non polarisés, perçage 1,30 mm ;
- entraxe : 38,10 mm ;
- `F.Fab` : enveloppe maximale 32,82 × 6,76 mm et fils jusqu'aux pads ;
- `F.SilkS` : contour du corps sans recouvrir les pads ;
- `F.CrtYd` : 43,10 × 7,76 mm ;
- modèle 3D : absent, volontairement ;
- PCB : `F1` à `(43,00 ; 127,00)`, pads à `(23,95 ; 127,00)` et
  `(62,05 ; 127,00)` ;
- score de placement Konnect : 100/100, sans chevauchement de courtyard et
  sans composant hors contour.

L'empreinte locale se trouve dans
`electrical/kicad/libraries/footprints/BikeGenerator.pretty/`.
