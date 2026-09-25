# Shunt de courant quatre bornes

Statut : **référence et empreinte PCB V1 retenues** ; validation thermique du
PCB et configuration INA228 encore requises avant fabrication.

## Référence V1

`Bourns CSS4J-4026K-2L00F`

- 2 mΩ ;
- quatre terminaux Kelvin ;
- tolérance ±1 % ;
- puissance 6 W à 70 °C ;
- TCR ±75 ppm/°C pour la référence 2 mΩ ;
- boîtier CMS 4026.

À 20 A : 40 mV et 0,80 W. À 25 A : 50 mV et 1,25 W. La plage
±163,84 mV de l'INA228 devra être utilisée pour couvrir 25 A.

La référence est indiquée active et disponible en bande coupée chez plusieurs
distributeurs lors de la vérification du 25 septembre 2026. Les prix et stocks
restent volatils ; vérifier de nouveau avant commande.

## Symbole, empreinte et correspondance Kelvin

KiCad 10 ne contient aucune empreinte nommée `CSS4J`. En revanche, son
empreinte native
`Resistor_SMD:R_Shunt_Isabellenhuette_BVR4026` reproduit exactement le land
pattern recommandé par Bourns et est donc réutilisée sans modification :

- pads de puissance : 2,55 × 5,60 mm ;
- pads Kelvin : 2,55 × 0,90 mm ;
- centres des colonnes : `x = ±4,025 mm` ;
- encombrement cuivre : 10,60 × 7,30 mm ;
- corps `F.Fab` : 10,10 × 6,675 mm pour un composant nominal
  10,06 × 6,60 mm ;
- courtyard, sérigraphie et modèle 3D présents.

Le dessin Bourns ne numérote pas les quatre terminaisons. La numérotation est
donc définie par la géométrie de l'empreinte, vue de dessus :

| Pad | Terminal physique | Pin du symbole `Device:R_Shunt` | Net V1 |
|---:|---|---:|---|
| 1 | force gauche | 1 | entrée après `F1` |
| 2 | sense gauche | 2 | `SHUNT_HI_K` |
| 3 | sense droite | 3 | `SHUNT_LO_K` |
| 4 | force droite | 4 | `BUS_PROTECTED` |

Cette correspondance a été relue après affectation à `R7`. Elle conserve les
deux pistes Kelvin séparées des pads de puissance. Le nom Isabellenhütte du
footprint ne désigne pas le composant acheté ; seule sa géométrie identique est
réutilisée pour le Bourns.

## Documentation archivée

| Document | Source | SHA-256 |
|---|---|---|
| [`bourns-css4j-4026.pdf`](./bourns-css4j-4026.pdf) | [Bourns](https://www.bourns.com/docs/product-datasheets/css4j-4026.pdf) | `27BE7941FF95AFC1C0A98AC573D33A987279CE2EE55985ED78308D502543E49D` |

Sources de disponibilité consultées :

- [DigiKey — CSS4J-4026K-2L00F](https://www.digikey.com/en/products/detail/bourns-inc/CSS4J-4026K-2L00F/6023759)
- [Mouser — CSS4J-4026K-2L00F](https://www.mouser.fr/en/ProductDetail/Bourns/CSS4J-4026K-2L00F)
