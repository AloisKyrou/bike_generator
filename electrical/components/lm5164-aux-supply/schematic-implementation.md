# LM5164 — première implémentation schématique

Date de contrôle : 24 septembre 2026.

Cette note décrit l'état réellement enregistré dans la feuille KiCad
`electrical/kicad/bike-generator-controller/aux_supply.kicad_sch`. Il s'agit
d'une première passe calculée et vérifiable, pas encore d'une nomenclature de
fabrication.

## Interface de la feuille

| Signal | Direction | Rôle |
|---|---|---|
| `AUX_IN_PROTECTED` | entrée | Bus redressé protégé provenant de `POWER_PATH` |
| `AUX_5V` | sortie | Alimentation 5 V auxiliaire |
| `AUX_PGOOD` | sortie | Indication power-good du LM5164 |

La branche d'entrée porte un `PWR_FLAG` parce que la source est externe à la
feuille. Les sorties ne sont volontairement pas marquées comme alimentant une
charge tant que le bloc USB/batterie n'existe pas.

## Brochage de U4 relu dans la netlist

| Broche | Nom TI | Net KiCad |
|---:|---|---|
| 1 | GND | `GND` |
| 2 | VIN | `AUX_IN_PROTECTED` |
| 3 | EN/UVLO | `UVLO` |
| 4 | RON | `RON_SET` |
| 5 | FB | `FB` |
| 6 | PGOOD | `AUX_PGOOD` |
| 7 | BST | `BST` |
| 8 | SW | `SW` |
| 9 | EP | `GND` |

## Valeurs placées

| Référence | Valeur schématique | Fonction | Statut |
|---|---:|---|---|
| U4 | LM5164DDAT | Buck synchrone 100 V | Référence retenue |
| L1 | 47 µH | Stockage d'énergie | Candidate |
| R8 | 41,2 kΩ, 1 % | Réglage `RON` | Candidate calculée |
| R9 / R10 | 1 MΩ / 200 kΩ, 1 % | Seuil `EN/UVLO` | Candidates calculées |
| R11 / R12 | 316 kΩ / 100 kΩ, 0,1 % | Retour 5 V | Candidates calculées |
| R13 | 200 kΩ, 1 % | Injection d'ondulation | Candidate calculée |
| R14 | 47 kΩ | Pull-up `PGOOD` vers 3,3 V | Candidate |
| C4 / C5 | 2,2 µF, 100 V | Découplage d'entrée | Candidates |
| C6 | 10 µF | Réservoir d'entrée | Candidate, technologie à choisir |
| C7 / C8 | 22 µF | Filtrage de sortie | Candidates |
| C9 | 2,2 nF, 50 V | Bootstrap | Candidate |
| C10 | 3,3 nF | Condensateur `CA` Type-3 | Candidate calculée |
| C11 | 82 pF, C0G | Condensateur `CB` Type-3 | Candidate calculée |

Les footprints des passifs ne sont pas assignés : taille, tension, tenue au
courant, saturation, ESR et déclassement doivent d'abord être figés à partir de
références commandables. Aucun modèle personnalisé n'a été créé.

## Topologie du réseau Type-3

Le réseau d'ondulation suit la topologie de la fiche TI :

```text
SW -- R13 -- RIPPLE -- C10 -- AUX_5V
               |
              C11
               |
               FB
```

`C9` relie `BST` à `SW`. L1 relie `SW` à `AUX_5V`. Le pont R11/R12 relie
`AUX_5V`, `FB` et `GND`.

## Contrôles effectués avec Konnect

- neuf broches de U4 reliées aux nets attendus ;
- zéro élément orphelin ;
- zéro court-circuit entre noms de nets ;
- zéro chevauchement de symboles détecté ;
- une seule alerte de net à une broche dans la feuille : `+3V3`, classée
  `cross_sheet_unverified`, ce qui est normal pour le pull-up global de R14 ;
- ERC global : zéro avertissement et deux erreurs intentionnelles,
  `AUX_5V` et `AUX_PGOOD` non raccordés sur la feuille racine.

Ces deux erreurs restent visibles jusqu'à la conception du bloc
USB/batterie/sélection de source. Elles ne doivent pas être supprimées avec des
marqueurs d'exclusion ou des connexions factices.

## Travail restant avant assignation des footprints

1. Rejouer le dimensionnement dans TI/WEBENCH.
2. Choisir des références physiques pour L1 et tous les condensateurs.
3. Vérifier le déclassement DC des céramiques à 60 V et à 5 V.
4. Vérifier le courant de saturation et les pertes de L1.
5. Fixer fréquence, courant cible et comportement à faible charge.
6. Décider le fabricant et le traitement des vias thermiques de 0,20 mm.
7. Concevoir le raccordement de `AUX_5V` et `AUX_PGOOD` au bloc contrôleur.

Source de topologie et de brochage :
[Texas Instruments, fiche LM5164 SNVSAU4D](https://www.ti.com/lit/ds/symlink/lm5164.pdf).
