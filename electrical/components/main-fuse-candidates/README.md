# Fusible principal — choix V1

## Référence retenue

Eaton Bussmann `ABC-V-20-R` : fusible axial traversant, rapide, 20 A,
250 VAC / 125 VDC, corps céramique 6,4 × 31,7 mm.

Sources fabricant consultées le 25 septembre 2026 :

- <https://www.eaton.com/us/en-us/skuPage.ABC-V-20-R.html>
- fiche série ABC/ABC-V no 2000 :
  <https://www.cooperindustries.com/content/dam/public/bussmann/Electronics/Resources/product-datasheets/Bus_Elx_DS_2000_ABC_Series.pdf>

Le composant satisfait l'exigence électrique `20 A / au moins 125 VDC` et
évite les petits clips PCB 6,3 × 32 mm couramment limités à 10 A. En revanche,
il est soudé et doit être dessoudé pour être remplacé.

État ECAD : aucune empreinte KiCad native exacte n'a été identifiée. Les
empreintes natives disponibles pour les cartouches 6,3 × 32 mm correspondent à
des clips ou porte-fusibles distincts et ne valident pas leur courant nominal.
Après accord explicite, une empreinte axiale locale a donc été créée et affectée
à `F1` :

`BikeGenerator:Fuse_Eaton_ABC-V-20-R_Axial_P38.10mm`

Le brochage est non polarisé : les pads 1 et 2 sont interchangeables. La
validation mécanique détaillée se trouve dans
[`ABC-V-20-R-footprint-validation.md`](./ABC-V-20-R-footprint-validation.md).
