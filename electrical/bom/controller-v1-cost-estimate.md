# Estimation de coût — contrôleur V1

Date : 2026-09-27  
Révision Git de référence : `8e6562a`, avec modifications locales non commitées  
Source : schéma KiCad sauvegardé, export regroupé `controller-v1-current.csv`

## Périmètre

Estimation pour un prototype, composants achetés à l'unité, hors frais de port.
Les prix sont indicatifs et principalement exprimés hors TVA.

Inclus : composants montés sur la carte, connecteurs côté carte et barrettes nécessaires
au montage enfichable du Beetle ESP32-C3.

Exclus : PCB nu, assemblage, batterie LiPo, câblage et contacts côté câble, buck CV/CC
principal externe, génératrice et mécanique.

## Synthèse

| Ensemble | Estimation unitaire HT |
|---|---:|
| Composants de la carte complète | 46 à 60 € |
| Valeur centrale de travail | environ 52 € |
| Bloc U4 sans F2 | 12 à 13,5 € |
| Bloc U4 avec F2 | 14,5 à 16 € |

Avec 20 % de TVA, la valeur centrale des composants de la carte est d'environ 62 € TTC,
hors port. Un panier prototype réel peut être plus cher à cause des frais de port,
des conditionnements minimaux et de l'achat auprès de plusieurs distributeurs.

## Bloc U4 — alimentation auxiliaire LM5164

| Fonction | Références actuelles | Estimation HT |
|---|---|---:|
| Convertisseur | U4, LM5164DDAT | 4,52 € |
| Inductance 47 µH | L1, MSS1038-473MLC | 2,04 € |
| Entrée haute tension | C5, C7, C8, 3 × 10 µF / 100 V | 3,0 à 3,5 € |
| Réservoir électrolytique | C6, 10 µF / 100 V | 0,42 € |
| Sortie 5 V | C12, C13, 2 × 22 µF | environ 0,88 € |
| Réglage, UVLO, ripple, bootstrap et PGOOD | C9–C11, R12–R18 | 1,0 à 1,8 € |
| Fusible auxiliaire | F2, Littelfuse 0449001.MR | environ 2,8 € |
| **Total sans F2** |  | **12 à 13,5 €** |
| **Total avec F2** |  | **14,5 à 16 €** |

## Principaux postes du reste de la carte

| Poste | Estimation HT |
|---|---:|
| Beetle ESP32-C3 DFR0868 | environ 6,9 € |
| INA228AIDGSR | environ 4,0 € |
| MCP42100-I/SL | prix à rafraîchir avant commande |
| Shunt CSS4J-4026K-2L00F | environ 1,84 € |
| Deux borniers Phoenix 1711725 | environ 3,1 € |
| TVS SMCJ70A | environ 0,65 à 0,75 € |
| Fusible principal Littelfuse 0456020.ER | prix à rafraîchir avant commande |
| Interrupteur 1101M2S3CQE2 | environ 5 à 6,5 € |
| Autres connecteurs, barrettes, sockets et passifs | environ 5 à 10 € |

## Limites

Cette nomenclature correspond à l'état sauvegardé actuel, qui reste en développement et
n'est pas encore une BOM de commande libérée. Les désignations génériques des résistances,
condensateurs et barrettes devront être enrichies avec leurs MPN définitifs avant achat.
