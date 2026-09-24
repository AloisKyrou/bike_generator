# Nomenclature de travail — contrôleur V1

Statut : **schéma logique en cours, non prêt à commander**. Cette liste décrit
les feuilles `INA228_SENSE`, `MCU`, `CC_CONTROL` et `CONNECTORS`. Le chemin de
puissance, le shunt, les protections et les connecteurs de fort courant ne sont
pas encore dimensionnés.

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
