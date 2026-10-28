# Netclasses PCB V1

Définition appliquée dans `bike-generator-controller.kicad_pro` le 26 septembre 2026.

## Contraintes globales

| Contrainte | Valeur |
|---|---:|
| Clearance minimale | 0,20 mm |
| Largeur minimale de piste | 0,20 mm |
| Via minimal | 0,60 / 0,30 mm |
| Distance trou à trou minimale | 0,25 mm |

## Classes

| Classe | Piste | Clearance | Via | Usage |
|---|---:|---:|---:|---|
| `Default` | 0,25 mm | 0,20 mm | 0,60 / 0,30 mm | Signaux numériques ordinaires |
| `POWER_20A` | 5,00 mm | 0,20 mm | 2,00 / 1,00 mm | Chemin positif principal |
| `HV_AUX` | 0,75 mm | 0,20 mm | 0,80 / 0,40 mm | Alimentation auxiliaire haute tension après `F2` |
| `GROUND_PLANE` | 1,00 mm | 0,20 mm | 0,80 / 0,40 mm | Masse, destinée principalement aux plans |
| `LV_POWER` | 0,75 mm | 0,20 mm | 0,80 / 0,40 mm | 3,3 V, 5 V et batterie LiPo |
| `MEASUREMENT` | 0,25 mm | 0,20 mm | 0,60 / 0,30 mm | Kelvin et mesure INA228 |
| `ANALOG_CTRL` | 0,25 mm | 0,20 mm | 0,60 / 0,30 mm | Boucles analogiques LM5164 et commande CC |
| `SW_NODE` | 1,00 mm | 0,20 mm | 0,80 / 0,40 mm | Nœud commuté du LM5164, à garder très court |
| `HV_FLOATING` | 0,25 mm | 0,20 mm | 0,60 / 0,30 mm | Bootstrap `BST`, référencé au nœud `SW` |

## Affectations particulières

- `POWER_20A` : `Net-(J4-Pin_1)`, `Net-(F1-Pad2)`, `/INA228_SENSE/VBUS_SENSE`.
- `HV_AUX` : `/AUX_SUPPLY/AUX_IN_PROTECTED`.
- `GROUND_PLANE` : `GND`.
- `LV_POWER` : `+3V3`, `/AUX_SUPPLY/AUX_5V`, `/MCU/BAT_CTRL`, `/MCU/BAT_RAW`, `/MCU/VIN_5V`.
- `MEASUREMENT` : les deux connexions Kelvin du shunt et les entrées différentielles INA228.
- `ANALOG_CTRL` : `CC_A/W/B`, `FB`, `RIPPLE`, `RON_SET`, `UVLO`.
- `SW_NODE` : `/AUX_SUPPLY/SW`.
- `HV_FLOATING` : `/AUX_SUPPLY/BST`.

## Limites et règles de routage

La largeur de 5 mm de `POWER_20A` est un minimum pratique pour le routage et les étranglements locaux, pas la validation thermique définitive du chemin 20 A. Le chemin principal devra utiliser des surfaces de cuivre aussi larges et courtes que possible, idéalement sur les deux faces. Un via isolé de 2,00 / 1,00 mm ne doit pas être considéré comme capable de transporter 20 A ; éviter tout changement de couche ou utiliser un réseau de vias dimensionné après choix du cuivre et du fabricant.

Le net `GND` mélange retours logique et puissance. Sa netclass ne peut donc pas garantir seule le retour 20 A : la liaison directe entre les connecteurs de puissance devra être réalisée et vérifiée comme un plan/chemin de cuivre dédié, tandis que les masses sensibles seront raccordées sans partager les chutes de tension du courant principal.

La clearance de 0,20 mm est volontairement compatible avec les land patterns validés du LM5164, de l'INA228 et du shunt. Des valeurs globales de 0,3 à 1,0 mm provoquent des violations internes aux empreintes. Hors des boîtiers, viser au routage au moins 0,60 mm autour des conducteurs pouvant atteindre le bus 80 V, et 1,00 mm lorsque l'espace le permet. Cette séparation renforcée devra être contrôlée pendant le routage et revue avant fabrication.

## Validation

- Les neuf classes ont été relues dans le projet ; aucune affectation n'est orpheline.
- Après routage du chemin principal, du filtre Kelvin INA228 et du bloc auxiliaire LM5164 : 86 erreurs, dont 72 connexions non routées et 14 erreurs connues sur les jumpers `JP1`/`JP2`. Aucune collision nouvelle n'a été introduite par ces pistes.
- Le LM5164 a désormais ses boucles `BST`/`SW`, son réseau d'injection `RIPPLE`, sa boucle `FB`, `UVLO`, `RON_SET`, `PGOOD`, les condensateurs d'entrée/sortie et le point de test 5 V routés. Les signaux sensibles qui changent de couche utilisent des vias 0,60 / 0,30 mm ; le condensateur traversant `C6` a été rapproché de l'entrée.
- La palette de largeurs prédéfinies de l'éditeur reste à ajouter lorsque le PCB sera fermé, car KiCad écraserait une modification externe effectuée pendant que le PCB est ouvert.
