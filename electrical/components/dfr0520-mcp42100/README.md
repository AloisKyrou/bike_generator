# DFR0520 / MCP42100-100 kΩ

Statut : **module accepté pour le prototype PCB V1**. Le potentiomètre 0 est
utilisé pour remplacer le potentiomètre de réglage de courant du buck. Le
potentiomètre 1 reste disponible mais non connecté.

## Documents archivés

| Document | Usage | SHA-256 |
|---|---|---|
| [`dfr0520-schematic-v1.0.pdf`](./dfr0520-schematic-v1.0.pdf) | schéma du module et brochage | `49E7C5F02FD9F11FA1A450C2902C5F48A2B5256A5DB370F28553F9005170C8BD` |
| [`dfr0520-dimension-v1.0.pdf`](./dfr0520-dimension-v1.0.pdf) | dimensions et entraxes | `396C0786F262C4763191BECBCA93DE936F37B0133F406093201E04881E38D925` |
| [`microchip-mcp41xxx-42xxx-11195c.pdf`](./microchip-mcp41xxx-42xxx-11195c.pdf) | limites électriques du MCP42100 | `F78338DBF59DDB8738867DA30E644D52942538192BCE9DFF070C4E765B679C1A` |

Sources officielles : [wiki DFRobot DFR0520](https://wiki.dfrobot.com/dfr0520/)
et [fiche Microchip MCP41xxx/42xxx](https://ww1.microchip.com/downloads/en/devicedoc/11195c.pdf).

## Brochage retenu dans la bibliothèque KiCad

Le symbole et l'empreinte projet utilisent une numérotation unique de 1 à 12.
En regardant le module par-dessus, texte lisible :

| Position physique | Pads KiCad | Signaux |
|---|---|---|
| rangée haute, de gauche à droite | 6, 5, 4, 3, 2, 1 | `VCC`, `GND`, `SI`, `CS`, `SCK`, `SO` |
| rangée basse, de gauche à droite | 7, 8, 9, 10, 11, 12 | `PA0`, `PW0`, `PB0`, `PA1`, `PW1`, `PB1` |

L'empreinte `BikeGenerator:DFR0520_Dual_Digital_Pot` est un module traversant
de 20 × 18 mm, avec deux rangées au pas de 2,54 mm séparées de 12,70 mm. Elle
comporte 12 pads de 1,8 mm percés à 1,0 mm, une cour et un repère de pad 1.

## Limites à respecter

- alimentation logique : 2,7 à 5,5 V ; V1 en 3,3 V ;
- `PAx`, `PWx` et `PBx` doivent rester entre `GND` et `VCC` ;
- courant dans chaque terminal analogique : inférieur à ±1 mA ;
- le module possède déjà ses condensateurs de découplage et maintient les
  entrées `RS` et `SHDN` à l'état haut ;
- ces limites concernent les trois fils de réglage, pas le chemin de puissance
  du générateur.

Avant de relier `J_CC_CTRL` au buck, mesurer les trois broches de son
potentiomètre d'origine dans les états arrêt, minimum et maximum. Une tension
hors de 0–3,3 V ou un courant supérieur à 1 mA imposera une interface isolée ou
analogique différente : le DFR0520 ne devra alors pas être raccordé directement.

## Intégration V1

- `U3` : module DFR0520 / MCP42100 100 kΩ ;
- `R6` : rappel de 10 kΩ sur `POT_CS` afin de garder le module désélectionné au
  démarrage ;
- SPI : `POT_MOSI`, `POT_MISO`, `POT_SCK`, `POT_CS` ;
- `J1` : broche 1 `CC_A`, broche 2 `CC_W`, broche 3 `CC_B` ;
- `TP9`, `TP10`, `TP11` : points de test des trois lignes analogiques ;
- `PA1`, `PW1`, `PB1` : explicitement non connectées.
