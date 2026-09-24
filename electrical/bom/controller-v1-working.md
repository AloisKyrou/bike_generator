# Nomenclature de travail — contrôleur V1

Statut : **schéma en cours, non prêt à commander**. Le squelette de puissance
est représenté, mais le shunt, les protections, l'alimentation auxiliaire et
les connecteurs de fort courant ne sont pas encore sélectionnés physiquement.

| Références | Qté | Valeur / référence | Empreinte ou état |
|---|---:|---|---|
| U1 | 1 | INA228AIDGSR | `Package_SO:TSSOP-10_3x3mm_P0.5mm` |
| U2 | 1 | DFR0868 Beetle ESP32-C3 V2.0 probable | symbole validé, empreinte à confirmer |
| U3 | 1 | DFR0520 / MCP42100 100 kΩ | `BikeGenerator:DFR0520_Dual_Digital_Pot` |
| R1, R2 | 2 | 10 Ω, 1 % | 0402 |
| R3, R4 | 2 | 4,7 kΩ, 1 % | 0402 |
| R5, R6 | 2 | 10 kΩ, 1 % | 0402 |
| C1, C3 | 2 | 100 nF | 0402, tension à confirmer |
| C2 | 1 | 1 µF | 0402, tension à confirmer |
| JP1, JP2 | 2 | cavalier de soudure 3 pads | pont 1–2 fermé par défaut vers GND |
| J1 | 1 | `J_CC_CTRL`, 1×3, 2,54 mm | empreinte générique provisoire |
| J2 | 1 | `J_DISPLAY_I2C`, 1×4, 2,54 mm | empreinte générique provisoire |
| J3 | 1 | `J_DEBUG_UART`, 1×4, 2,54 mm | empreinte générique provisoire |
| TP1–TP11 | 11 | points de test | empreinte à revoir avant placement PCB |

## Chemin de puissance placé à titre provisoire

| Référence | Qté | Valeur / rôle | État |
|---|---:|---|---|
| J4 | 1 | entrée redressée | connecteur et footprint à choisir |
| F1 | 1 | fusible principal, hypothèse 20 A DC | calibre et pouvoir de coupure à confirmer |
| R7 | 1 | shunt quatre bornes, hypothèse 2 mΩ | MPN, puissance et footprint à choisir |
| J5 | 1 | départ vers buck CV/CC externe 400 W | connecteur et footprint à choisir |
| F2 | 1 | `F_AUX` | calibre et pouvoir de coupure DC à choisir |

## Alimentation auxiliaire — première passe placée dans KiCad

| Référence provisoire | Qté | Valeur / référence | État |
|---|---:|---|---|
| U4 | 1 | LM5164DDAT, 6–100 V, 1 A | symbole et footprint standard DDA0008B placés au schéma ; DFM des vias à décider |
| L1 | 1 | 47 µH candidate | `Isat` > 1,75 A, pertes et MPN à vérifier |
| C_IN_AUX | 2 + bulk | 2 × 2,2 µF / 100 V X7R + environ 10 µF électrolytique | capacité effective, tension et MPN à vérifier |
| C_OUT_AUX | 2 | 2 × 22 µF / 10 ou 16 V X7R | capacité effective et MPN à vérifier |
| R_RON | 1 | 41,2 kΩ, 1 % | candidat pour environ 303 kHz |
| R_FB1 / R_FB2 | 2 | 316 kΩ / 100 kΩ, 0,1 % | candidat pour 4,992 V nominal |
| R_UV1 / R_UV2 | 2 | 1 MΩ / 200 kΩ, 1 % | candidat pour démarrage nominal à 9,0 V |
| R_A / C_A / C_B | 3 | 200 kΩ / 3,3 nF / 82 pF C0G | réseau d'ondulation type 3 candidat |
| C_BST | 1 | 2,2 nF / 50 V X7R | valeur imposée par TI |
| R_PGOOD | 1 | 47 kΩ vers 3,3 V | candidat |
| D_AUX | 1 | blocage du courant inverse | technologie et référence à choisir |
| F_AUX | 1 | protection locale de la dérivation | calibre et pouvoir de coupure DC à choisir |
| JP_GEN_5V | 1 | cavalier d'isolation générateur / USB | ouvert en mode USB/service |
| J_BAT_CTRL | 1 | connecteur batterie 1S détrompé | modèle lié à la batterie exacte |
| S_BAT | 1 | interrupteur batterie | courant faible, mécanique à choisir |
| BAT_CTRL | 1 | Li-ion/LiPo 1S protégée, 400–500 mAh | doit autoriser une charge de 400 mA |

Références réellement utilisées dans la première passe KiCad : `JP3` pour
`JP_GEN_5V`, `J6` pour `J_BAT_CTRL`, `S1` pour `S_BAT`, et `TP12` à `TP15` pour
les points de test de l'alimentation auxiliaire. Leurs footprints restent non
assignés tant que les composants mécaniques et la batterie ne sont pas choisis.

La nomenclature d'application 12 V / 1 A publiée par TI n'est pas directement
la nomenclature 5 V du projet. Les valeurs candidates ci-dessus proviennent du
pré-dimensionnement documenté dans
[`../components/lm5164-aux-supply/design-calculation.md`](../components/lm5164-aux-supply/design-calculation.md).
Aucun de ces passifs ne doit être commandé avant vérification avec le
calculateur TI et sélection d'une référence fabricant.

## Affectation des résistances

- `R1`, `R2` : filtre d'entrée différentiel de l'INA228 ;
- `R3`, `R4` : rappels I²C de `SDA` et `SCL` ;
- `R5` : rappel de la sortie open-drain `INA_ALERT` ;
- `R6` : rappel haut de `POT_CS` au démarrage.

## Éléments qui bloquent une commande

1. référence et valeur du shunt quatre bornes ;
2. tension et courant maximaux réellement mesurés ;
3. fusible, TVS, bornier et stratégie de masse du chemin de puissance ;
4. empreinte mécanique du Beetle DFR0868 ;
5. compatibilité électrique mesurée entre `J_CC_CTRL` et le potentiomètre du
   buck ;
6. tension nominale et diélectrique exact des condensateurs ;
7. disponibilité et références fabricant de chaque passif.
8. tension à vide et transitoires permettant de figer le LM5164 et sa protection ;
9. batterie exacte et courant de charge autorisé ;
10. stratégie d'isolation entre alimentation générateur et USB.
