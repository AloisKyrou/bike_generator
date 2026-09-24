# Validation KiCad du LM5164 DDA

Statut : **symbole standard trouvé et brochage concordant ; footprint non encore
accepté pour fabrication**.

## Sources

| Élément | Source | Détail utilisé |
|---|---|---|
| Fiche fabricant | `ti-lm5164-snvsa-u4d.pdf` | `SNVSAU4D`, février 2026 |
| Brochage | fiche TI, page PDF 3 | figure 4-1 et table 4-1, vue de dessus |
| Boîtier | fiche TI, pages PDF 28 à 30 | dessin `DDA0008B`, land pattern et stencil |
| Références commandables | fiche TI, page PDF 34 | `DDAT` 250 pièces, `DDAR` 2500 pièces |
| Modèles CAO fabricant | page produit TI | lien TI vers Ultra Librarian, formats KiCad v6+ disponibles |
| Bibliothèque locale | KiCad 10 installé | symbole et footprints inspectés en lecture seule |

Le SHA-256 et l'URL officielle de la fiche archivée sont consignés dans le
[`README.md`](./README.md).

## Référence physique étudiée

- composant : Texas Instruments LM5164 ;
- boîtier : `DDA`, dessin mécanique `DDA0008B`, HSOIC/PowerPAD 8 broches ;
- proposition pour les prototypes : `LM5164DDAT`, même silicium et même boîtier
  que `LM5164DDAR`, mais petite bande de 250 au lieu d'une bobine de 2500 ;
- la proposition `DDAT` reste à confirmer avant de la figer dans la BOM.

## Correspondance des broches

La figure TI est une **vue de dessus**. Les broches 1 à 4 descendent le côté
gauche depuis le repère de broche 1 ; les broches 5 à 8 remontent le côté droit.
Le pad exposé est désigné `9` dans le dessin mécanique et doit être relié à GND,
bien qu'il n'ait aucune connexion électrique interne.

| Broche TI | Fonction TI | Pin du symbole KiCad | Type KiCad observé | Pad attendu |
|---:|---|---:|---|---:|
| 1 | GND | 1 / GND | power input | 1 |
| 2 | VIN | 2 / VIN | power input | 2 |
| 3 | EN/UVLO | 3 / EN/UVLO | input | 3 |
| 4 | RON | 4 / RON | passive | 4 |
| 5 | FB | 5 / FB | input | 5 |
| 6 | PGOOD, sortie open-drain | 6 / PGOOD | open collector | 6 |
| 7 | BST | 7 / BST | passive | 7 |
| 8 | SW | 8 / SW | power output | 8 |
| 9 | EP, pas de connexion interne, à relier à GND | 9 / EP | passive | 9 |

Bilan des nombres : 8 pattes + 1 pad exposé fabricant, 9 pins électriques dans
le symbole KiCad, pads 1 à 8 + pad 9 éventuellement répété pour les vias
thermiques dans le footprint. Les répétitions du numéro 9 sont intentionnelles.

## Symbole KiCad installé

Le symbole existe déjà :

```text
Regulator_Switching:LM5164DDA
```

Son brochage correspond à la table TI. Il n'y a donc aucune raison de recréer
un symbole projet. Son champ footprint pointe actuellement vers :

```text
Package_SO:HSOP-8-1EP_3.9x4.9mm_P1.27mm_EP2.41x3.1mm_ThermalVias
```

Cette association automatique ne vaut pas validation mécanique.

## Comparaison du footprint par défaut

Le footprint installé présente notamment :

- corps nominal 3,9 × 4,9 mm et pas de 1,27 mm ;
- huit pads de 1,60 × 0,60 mm, rangés à `x = ±2,65 mm` ;
- pad exposé de 2,41 × 3,10 mm ;
- six vias thermiques de perçage 0,20 mm ;
- description faisant référence au ST L5973D, et non directement au LM5164.

Le land pattern TI révisé en 2026 indique :

- huit lands de 1,55 × 0,60 mm ;
- pas de 1,27 mm et entraxe de rangées de 5,4 mm, soit `x = ±2,70 mm` ;
- métal du pad exposé de 2,71 × 3,40 mm ;
- vias optionnels de diamètre 0,20 mm ;
- taille du métal susceptible d'être adaptée aux exigences de ligne de fuite.

Les écarts sur les pads latéraux sont faibles, mais le pad thermique par défaut
est inférieur de 0,30 mm dans chaque axe à la recommandation TI actuelle. La
description provenant d'un autre composant empêche de l'accepter par simple
analogie.

Le footprint historique `Package_SO:TI_SO-PowerPAD-8_ThermalVias` est également
présent, mais sa géométrie vient d'une autre fiche TI et ne doit pas être retenue
sans la même comparaison détaillée.

## Modèle proposé par TI

La page produit TI renvoie bien vers un modèle Ultra Librarian du
`LM5164DDAR`, comprenant symbole, footprint et modèle 3D, avec export KiCad v6+.
Le téléchargement requiert l'acceptation des conditions Ultra Librarian et une
inscription ; il ne doit donc pas être automatisé silencieusement.

Ce modèle est un candidat à vérifier, pas une autorité. Après téléchargement,
il faudra comparer chaque pad au dessin `DDA0008B` de février 2026 : le modèle
peut avoir été généré à partir d'une révision antérieure.

## Décision provisoire et prochaine action

1. Conserver le symbole standard `Regulator_Switching:LM5164DDA`.
2. Ne placer aucun footprint définitif tant que le modèle Ultra Librarian n'a
   pas été importé et comparé.
3. Si ce modèle correspond au land pattern 2026, l'utiliser dans une bibliothèque
   projet après validation et relecture Konnect.
4. S'il ne correspond pas, présenter l'écart et demander l'autorisation avant
   de créer un footprint projet `DDA0008B` conforme à la fiche TI.

## Validation encore requise dans KiCad

La session Konnect a chargé les toolsets de bibliothèque, mais le client courant
n'expose pas encore les appels dynamiques `get_symbol_info` et
`get_footprint_info`. L'inspection ci-dessus repose donc sur les bibliothèques
KiCad 10 installées, en lecture seule. L'acceptation finale exige encore :

- relecture structurée du symbole et du footprint par Konnect ;
- placement jetable ;
- rendu et contrôle du repère 1, du sens de numérotation, de `F.Fab`,
  `F.SilkS`, `F.CrtYd`, du masque et de la pâte ;
- confirmation qu'aucune donnée ne provient d'un cache ou d'un autre boîtier.
