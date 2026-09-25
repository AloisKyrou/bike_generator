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

La feuille KiCad `MCU` raccorde maintenant :

- `AUX_5V` à `VIN_5V` par le cavalier amovible `JP3`, représenté
  provisoirement par un header traversant 1 × 2 au pas de 2,54 mm ;
- une batterie Li-ion/LiPo 1S protégée de 400 à 500 mAh à `BAT` par `S1` ;
- la sortie 3,3 V du Beetle à l'INA228, au DFR0520 et aux interfaces logiques.

Le connecteur batterie `J6` utilise provisoirement l'empreinte KiCad standard
`Connector_JST:JST_PH_S2B-PH-K_1x02_P2.00mm_Horizontal`. Le pad 1 est relié à
`BAT_RAW` et le pad 2 à `GND`. Le pas, l'orientation et surtout la polarité du
connecteur réel restent à vérifier. Voir
[`../jst-ph-battery-connector/README.md`](../jst-ph-battery-connector/README.md).

Le schéma officiel V2.0 montre que la broche externe `VIN_5V` est le même net
que `VUSB`, donc que le VBUS du connecteur USB-C. `VUSB` alimente à la fois le
chargeur TP4057 et, par D1, le régulateur 3,3 V. La batterie rejoint ce même
régulateur par le PMOS Q1. Ce point est détaillé dans
[`power-input-analysis.md`](./power-input-analysis.md).

Conséquence : `JP3` doit être **ouvert avant de connecter un PC en USB-C**. Une
diode ajoutée uniquement en série entre le LM5164 et `VIN_5V` ne supprimerait
pas le retour vers le connecteur USB, puisque le 5 V générateur continuerait à
élever le rail `VUSB` partagé. La V1 utilise donc un interverrouillage manuel
explicite, à valider physiquement avant tout essai simultané.

DFRobot annonce une charge maximale de 400 mA. La batterie choisie devra
autoriser explicitement ce courant : 400 mA représente 1 C pour 400 mAh et
0,8 C pour 500 mAh. Pour la cellule 320 mAh visible sur la photo, cela
représenterait 1,25 C : elle reste donc une candidate non validée tant que sa
fiche ou une mesure du courant réel ne permet pas de conclure.
