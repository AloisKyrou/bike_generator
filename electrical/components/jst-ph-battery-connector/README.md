# Connecteur batterie JST-PH 2 broches

Statut : **choix CAO provisoire**, à confirmer sur la batterie physique avant
fabrication.

## Choix représenté dans KiCad

La feuille `MCU` utilise pour `J6` l'empreinte standard KiCad :

```text
Connector_JST:JST_PH_S2B-PH-K_1x02_P2.00mm_Horizontal
```

Il s'agit d'une embase JST série PH, deux contacts, pas de 2,00 mm, entrée
latérale. L'entrée latérale est adaptée à une petite batterie LiPo dont les fils
arrivent parallèlement au PCB. Aucun modèle personnalisé n'a été créé.

| Élément | Valeur lue dans la bibliothèque KiCad |
|---|---|
| Nombre de pads | 2 |
| Pas | 2,00 mm |
| Pad 1 | centre `(0,00 ; 0,00)` mm, trou 0,75 mm |
| Pad 2 | centre `(2,00 ; 0,00)` mm, trou 0,75 mm |
| Courtyard | présent |
| Modèle 3D | présent |

Correspondance projet provisoire :

| Pad PCB | Net | Fil attendu |
|---:|---|---|
| 1 | `BAT_RAW` | rouge / positif |
| 2 | `GND` | noir / négatif |

La couleur des fils n'est pas une preuve de l'ordre des contacts dans le
boîtier. Avant branchement, vérifier la polarité au multimètre et comparer la
vue d'accouplement du connecteur réel à la fiche JST.

## Documentation archivée

| Document | Source | Usage | SHA-256 |
|---|---|---|---|
| [`jst-ph-series-eph.pdf`](./jst-ph-series-eph.pdf) | [JST, série PH](https://www.jst-mfg.com/product/pdf/eng/ePH.pdf) | famille PH et embase `S2B-PH-K` | `447624F4F2F7D37C58C1EAA7EE314AD757FE7AFF48F6186491EF6F69FBC00B96` |

## Points à confirmer physiquement

1. Mesurer le pas centre à centre du connecteur de la batterie : 2,00 mm.
2. Vérifier que le boîtier est bien de famille JST-PH et non un connecteur
   visuellement proche au pas de 1,25 mm.
3. Confirmer l'orientation de l'embase : horizontale `S2B-PH-K` ou verticale
   `B2B-PH-K` selon le boîtier final.
4. Vérifier la polarité réelle du câble avant le premier branchement.
5. Confirmer la référence exacte de la cellule, sa protection intégrée et son
   courant de charge admissible.

La cellule visible sur la photo utilisateur est marquée `YK 402535`, `3.7 V`,
`320 mAh`, `1.2 Wh`. Cette identification reste une lecture de photo, pas une
fiche fabricant. À 400 mA, le taux de charge serait de 1,25 C ; cette batterie
ne doit donc pas être acceptée tant que sa documentation n'autorise pas
explicitement ce courant ou que le courant réel du chargeur n'a pas été mesuré
et rendu compatible.
