# Nomenclature de travail — contrôleur V1

Statut : **schéma logique en cours, non prêt à commander**. Cette liste décrit
les feuilles `INA228_SENSE`, `MCU`, `CC_CONTROL` et `CONNECTORS`. Le chemin de
puissance, le shunt, les protections, l'alimentation auxiliaire et les
connecteurs de fort courant ne sont pas encore dimensionnés.

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

## Alimentation auxiliaire planifiée, pas encore placée dans KiCad

| Référence provisoire | Qté | Valeur / référence | État |
|---|---:|---|---|
| U4 | 1 | LM5164DDAT, 6–100 V, 1 A | MPN et footprint standard DDA0008B retenus ; relecture Konnect restante |
| L1 | 1 | inductance du buck auxiliaire | valeur, pertes et courant de saturation à calculer |
| C_IN_AUX | plusieurs | céramique 100 V | valeur et boîtier après calcul et déclassement DC |
| C_OUT_AUX | plusieurs | sortie 5 V | valeur et boîtier après calcul |
| R_FB, R_RON, R_UVLO | plusieurs | réseaux LM5164 | valeurs à calculer pour 5 V et 10–60 V |
| D_AUX | 1 | blocage du courant inverse | technologie et référence à choisir |
| F_AUX | 1 | protection locale de la dérivation | calibre et pouvoir de coupure DC à choisir |
| JP_GEN_5V | 1 | cavalier d'isolation générateur / USB | ouvert en mode USB/service |
| J_BAT_CTRL | 1 | connecteur batterie 1S détrompé | modèle lié à la batterie exacte |
| S_BAT | 1 | interrupteur batterie | courant faible, mécanique à choisir |
| BAT_CTRL | 1 | Li-ion/LiPo 1S protégée, 400–500 mAh | doit autoriser une charge de 400 mA |

La nomenclature d'application 12 V / 1 A publiée par TI n'est pas directement
la nomenclature 5 V du projet. Aucun de ces passifs ne doit être commandé avant
le calcul et la vérification du schéma de référence adapté.

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
