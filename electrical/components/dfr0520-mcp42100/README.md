# MCP42100 / ancien module DFR0520

Statut : **le PCB V1 intègre maintenant directement un MCP42100-I/SL**. Le
module DFR0520 reste uniquement la référence du prototype sur breadboard.

## Documents archivés

| Document | Usage | SHA-256 |
|---|---|---|
| [`dfr0520-schematic-v1.0.pdf`](./dfr0520-schematic-v1.0.pdf) | schéma du module historique | `49E7C5F02FD9F11FA1A450C2902C5F48A2B5256A5DB370F28553F9005170C8BD` |
| [`dfr0520-dimension-v1.0.pdf`](./dfr0520-dimension-v1.0.pdf) | dimensions du module historique | `396C0786F262C4763191BECBCA93DE936F37B0133F406093201E04881E38D925` |
| [`microchip-mcp41xxx-42xxx-11195c.pdf`](./microchip-mcp41xxx-42xxx-11195c.pdf) | datasheet officielle du MCP42100 | `F78338DBF59DDB8738867DA30E644D52942538192BCE9DFF070C4E765B679C1A` |

Sources officielles : [wiki DFRobot DFR0520](https://wiki.dfrobot.com/dfr0520/)
et [fiche Microchip MCP41xxx/42xxx](https://ww1.microchip.com/downloads/en/DeviceDoc/11195c.pdf).

## Intégration retenue sur le PCB V1

- `U3` : `MCP42100-I/SL`, SOIC-14, 100 kΩ, deux canaux ;
- canal 0 : `PA0/PW0/PB0` vers `CC_A/CC_W/CC_B` sur `J7` ;
- canal 1 : `PA1/PW1/PB1` vers `CV_A/CV_W/CV_B` sur `J9` ;
- SPI écriture seule : `POT_CS`, `POT_SCK`, `POT_MOSI` ; `SO` non connecté ;
- `R11` : rappel haut 10 kΩ sur `POT_CS` ;
- `R19` : rappel bas 10 kΩ sur `POT_SHDN` ;
- `POT_SHDN` est commandé par GPIO20 du Beetle, auparavant réservé à
  `UART_RX` ; l'USB-C reste l'interface de configuration principale ;
- `RS` est maintenu à `+3V3` et `C4` assure le découplage local de `VDD`.

Le rappel bas de `POT_SHDN` place les deux potentiomètres en arrêt tant que
l'ESP32-C3 n'a pas configuré sa sortie. Selon la datasheet, l'arrêt déconnecte
chaque borne A et relie le curseur W à la borne B. Le firmware devra donc
programmer les deux valeurs, puis seulement relâcher `POT_SHDN`.

## Limites à respecter

- alimentation logique : 2,7 à 5,5 V ; V1 en 3,3 V ;
- `PAx`, `PWx` et `PBx` doivent rester entre `GND` et `VDD` ;
- courant dans chaque terminal analogique : inférieur à ±1 mA ;
- au démarrage ou après reset, les registres de curseur reviennent au milieu
  d'échelle (`0x80`) ; la sécurité ne doit donc pas dépendre de cette valeur ;
- ces limites concernent les fils de réglage du buck, pas son chemin de
  puissance.

Avant de raccorder `J7` ou `J9` au buck, mesurer les trois broches de chaque
potentiomètre d'origine dans les états arrêt, minimum et maximum. Une tension
hors de 0–3,3 V ou un courant supérieur à 1 mA impose une interface isolée ou
analogique différente.
