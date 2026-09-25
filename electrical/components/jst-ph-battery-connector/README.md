# Connecteur batterie JST-PH 2 broches

Statut : **famille et embase choisies par l'utilisateur**, polarité et câble à
confirmer sur la batterie physique avant fabrication.

## Choix représenté dans KiCad

La feuille `MCU` utilise pour `J6` l'empreinte standard KiCad :

```text
Connector_JST:JST_PH_S2B-PH-K_1x02_P2.00mm_Horizontal
```

Il s'agit de l'embase **`S2B-PH-K-S(LF)(SN)`**, série PH, deux contacts, pas de
2,00 mm, entrée latérale. L'entrée latérale est adaptée à une petite batterie
LiPo dont les fils arrivent parallèlement au PCB. Aucun modèle personnalisé n'a
été créé.

Le côté câble complet doit aussi apparaître dans la liste de courses :

| Élément | Référence proposée | Quantité utile |
|---|---|---:|
| Embase PCB | `S2B-PH-K-S(LF)(SN)` | 1 + rechange |
| Boîtier côté câble | `PHR-2` | 1 + rechange |
| Contacts à sertir | `SPH-002T-P0.5S` | 2 + plusieurs rechanges |
| Fils | compatibles AWG 30 à 24 et diamètre d'isolant de la fiche JST | 2 |

Un faisceau préserti JST-PH 2,00 mm est acceptable pour un premier montage si sa
référence, son calibre de fil et surtout sa polarité sont vérifiés. Les mots
« mâle » et « femelle » sont ambigus dans de nombreuses annonces : commander par
référence JST évite cette erreur.

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
3. Confirmer que l'entrée latérale de la `S2B-PH-K-S(LF)(SN)` reste accessible
   dans le boîtier final.
4. Vérifier la polarité réelle du câble avant le premier branchement.
5. Confirmer la référence exacte de la cellule, sa protection intégrée et son
   courant de charge admissible.

La batterie désormais retenue par l'utilisateur est une LiPo protégée `801350`,
`3,7 V`, `500 mAh`. À 400 mA, le taux de charge serait de 0,8 C. La protection
intégrée contre surcharge et décharge profonde ne remplace pas la vérification
du courant de charge normal admissible dans la fiche de la cellule. Vérifier
aussi la polarité du connecteur : elle n'est pas normalisée entre tous les
faisceaux vendus sous le nom JST-PH.
