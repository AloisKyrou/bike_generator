# DFR0868 Beetle ESP32-C3

Statut : **identification de travail fortement probable : DFR0868 V2.0**.
Les photos, le brochage visible et le schéma officiel concordent. La référence
sérigraphiée sur le module physique devra encore être photographiée avant de
figer son empreinte PCB.

## Documents archivés

| Document | Usage | SHA-256 |
|---|---|---|
| [`dfr0868-schematic-v2.0.0.pdf`](./dfr0868-schematic-v2.0.0.pdf) | schéma du module V2.0 | `767B6FE71168BF555BA4A948993EE45295E36217E1F26D4C678DEA7BC01528ED` |
| [`dfr0868-schematics-v1.0.zip`](./dfr0868-schematics-v1.0.zip) | archive DFRobot des schémas | `2E60C6A825E8BDF85AD5E3A55CC0F10560F1D623CAF93B299538CBD22D1ADCDF` |
| [`dfr0868-dimension-v1.0.pdf`](./dfr0868-dimension-v1.0.pdf) | dessin mécanique | `DCEF25759DAD3F71CE50D2156F906878A27B3D9E003EB66516BB2BABF3161DD0` |
| [`esp32-c3-mini-1-datasheet-v1.0.pdf`](./esp32-c3-mini-1-datasheet-v1.0.pdf) | module radio ESP32-C3-MINI-1 | `FA120B90244544BEF0188204AEB37434068E2F8066DAB4A1C23AFDB4E5B44E9A` |

Sources officielles : [wiki DFRobot DFR0868](https://wiki.dfrobot.com/dfr0868/)
et [schéma V2.0](https://dfimg.dfrobot.com/nobody/wiki/d0e8b7f0f042c14f6959c3edc748053b.pdf).

## Brochage du symbole projet

Vue de dessus du module, USB-C en haut :

| Pads symbole | Rangée | Signaux |
|---|---|---|
| 1 à 8 | gauche, de haut en bas | `GND_L`, `3V3`, `GPIO0`, `GPIO1`, `GPIO4`, `GPIO6`, `GPIO5`, `GPIO7` |
| 9 à 16 | droite, de haut en bas | `BAT`, `GND_R`, `VIN_5V`, `GPIO20_RX`, `GPIO21_TX`, `GPIO8`, `GPIO9_BOOT`, `GPIO2` |

Le symbole `BikeGenerator:DFR0868_Beetle_ESP32-C3` est validé pour le schéma,
mais n'a volontairement **aucune empreinte**. Il faut d'abord confirmer sur la
carte réelle la version, l'entraxe entre rangées, le diamètre des trous et la
position mécanique de l'USB-C.

## Affectation V1

| Fonction | GPIO |
|---|---:|
| `I2C_SDA` | 0 |
| `I2C_SCL` | 1 |
| `POT_MISO` | 4 |
| `POT_SCK` | 6 |
| `POT_CS` | 5 |
| `POT_MOSI` | 7 |
| `UART_RX` | 20 |
| `UART_TX` | 21 |
| `INA_ALERT` | 2 |

La V1 est alimentée par l'USB-C du Beetle. Sa sortie 3,3 V alimente l'INA228,
le DFR0520 et les petits connecteurs logiques. `BAT`, `VIN_5V`, `GPIO8` et
`GPIO9_BOOT` sont explicitement non connectés. Un `PWR_FLAG` sur la masse
indique à l'ERC que l'alimentation arrive par le module USB.
