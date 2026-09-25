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
feuille. `AUX_5V` est maintenant raccordé à la feuille `MCU` ; `AUX_PGOOD`
reste volontairement sans consommateur jusqu'à la conception du verrouillage
matériel de la commande CC.

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
| L1 | Coilcraft `MSS1038-473MLC`, 47 µH ±20 % | Stockage d'énergie | Validée pour la V1 ; `Inductor_SMD:L_Coilcraft_MSS1038-XXX` |
| R8 | 41,2 kΩ, 1 % | Réglage `RON` | Yageo `RC1206FR-0741K2L`, 250 mW, 1206 HandSolder, figée V1 |
| R9 / R10 | 1 MΩ / 200 kΩ, 1 % | Seuil `EN/UVLO` | Yageo `RC0805FR-071ML` / `RC0805FR-07200KL`, figées V1 |
| R11 / R12 | 316 kΩ / 100 kΩ, 0,1 % | Retour 5 V | Yageo `RT0805BRD07316KL` / `RT0805BRD07100KL`, figées V1 |
| R13 | 200 kΩ, 1 % | Injection d'ondulation | Yageo `RC0805FR-07200KL`, figée V1 |
| R14 | 47 kΩ, 1 % | Pull-up `PGOOD` vers 3,3 V | Yageo `RC0805FR-0747KL`, figée V1 |
| C4 / C5 / C13 | 10 µF, 100 V, X7S | Découplage d'entrée | Samsung `CL32Y106KCVZ4NE` ; trois pièces requises par la capacité effective à 80 V, transcrites et raccordées dans KiCad |
| C6 | 10 µF / 100 V | Réservoir d'entrée | Panasonic `EEU-FC2A100`, `Capacitor_THT:CP_Radial_D6.3mm_P2.50mm`, figé V1 |
| C7 / C8 | 22 µF, 16 V | Filtrage de sortie | Samsung `CL32B226KOJNNNE`, figées V1 |
| C9 | 2,2 nF, 50 V | Bootstrap | Yageo `CC0805KRX7R9BB222`, figée V1 |
| C10 | 3,3 nF, 50 V | Condensateur `CA` Type-3 | Yageo `CC0805KRX7R9BB332`, figée V1 |
| C11 | 82 pF, 50 V, C0G | Condensateur `CB` Type-3 | Yageo `CC0805JRNPO9BN820`, figée V1 |

Les résistances et les petits condensateurs utilisent les empreintes KiCad
standard 0805 HandSolder, sauf R8 en 1206 HandSolder pour sa dissipation à
80 V. Les MLCC d'entrée et de sortie utilisent la 1210
HandSolder. `C6` emploie une empreinte traversante native KiCad. Aucun modèle
personnalisé n'a été créé pour ces passifs.

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
- ERC global après raccordement MCU : zéro avertissement et une erreur
  intentionnelle, `AUX_PGOOD` non raccordé sur la feuille racine.

Cette erreur reste visible jusqu'à la conception du verrouillage matériel de
la commande CC. Elle ne doit pas être supprimée avec un marqueur d'exclusion
ou une connexion factice.

## Travail restant avant gel complet de la feuille

1. Rejouer le dimensionnement dans TI/WEBENCH.
2. Les passifs et L1 sont figés pour la V1 ; vérifier leurs limites thermiques
   dans le prototype.
3. Confirmer sur prototype la température des trois condensateurs d'entrée
   désormais corrigés dans KiCad d'après les courbes Samsung.
4. Vérifier le courant de saturation et les pertes de L1.
5. Fixer fréquence, courant cible et comportement à faible charge.
6. Confirmer avec le fabricant l'anneau de 0,15 mm et le traitement des six
   vias thermiques Ø0,60/0,30 mm de la variante locale affectée à U4.
7. Concevoir l'utilisation matérielle de `AUX_PGOOD`.

Source de topologie et de brochage :
[Texas Instruments, fiche LM5164 SNVSAU4D](https://www.ti.com/lit/ds/symlink/lm5164.pdf).
