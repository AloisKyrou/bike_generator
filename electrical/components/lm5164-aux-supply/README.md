# LM5164 — alimentation auxiliaire du contrôleur

Statut : **première passe schématique réalisée ; valeurs de puissance,
références physiques et DFM à valider avant schéma définitif**.

## Rôle dans le système

Le convertisseur auxiliaire alimente le contrôleur indépendamment du buck
principal 400 W. Son entrée est prélevée sur `BUS_PROTECTED`, après le fusible
principal et le shunt de mesure, et avant l'entrée du buck principal.

```text
Redresseur -> fusible -> shunt -> BUS_PROTECTED
                                  +-> buck principal -> sortie 24 V externe
                                  +-> F_AUX -> LM5164 -> 5 V -> Beetle ESP32-C3
```

Ce placement évite de faire dépendre le démarrage du contrôleur de la présence,
de la charge ou du réglage du buck principal. La consommation du contrôleur et
la recharge de sa batterie restent incluses dans la puissance mesurée par
l'INA228.

## Enveloppe de conception retenue

| Paramètre | Cible V1 | Statut |
|---|---:|---|
| Bus protégé | 80 V DC maximum continu | décidé ; fonctionnement durable > 80 V hors spécification |
| Plage vérifiée pour le 5 V | 10 à 80 V DC | le démarrage UVLO reste voisin de 9 V |
| Tenue du circuit intégré | 100 V | candidat LM5164 |
| Sortie | 5 V | décidée |
| Charge continue à garantir | au moins 600 mA | préliminaire |
| Capacité du convertisseur | 1 A maximum | candidat LM5164 |
| Batterie contrôleur | LiPo 1S protégée `801350`, 500 mAh | choisie par l'utilisateur ; fiche à vérifier |
| Chargeur | TP4057 présent sur le Beetle, 400 mA maximum annoncé | documenté DFRobot |

Le budget de 600 mA couvre environ 400 mA de recharge et la logique. Le circuit
est dimensionné autour d'un convertisseur 1 A afin de conserver une marge pour
les pointes radio, les capteurs, les voyants et un écran optionnel. La batterie
retenue devra autoriser explicitement un courant de charge de 400 mA dans sa
fiche technique.

## Candidat LM5164

Le LM5164 est un buck synchrone Texas Instruments :

- entrée spécifiée de 6 à 100 V ;
- courant de sortie jusqu'à 1 A ;
- MOSFETs high-side et low-side intégrés ;
- boîtier `DDA`, HSOIC-8 PowerPAD, environ 4,9 × 6 mm ;
- broches `EN/UVLO` et `PGOOD` ;
- pas de compensation de boucle externe ;
- faible consommation à vide.

La référence `LM5164DDAT` est retenue pour le prototypage : elle utilise le
même silicium et le même boîtier DDA que `LM5164DDAR`, mais en petite bande de
250 pièces au lieu d'une bobine de 2500.

KiCad 10 contient déjà le symbole `Regulator_Switching:LM5164DDA`. Son brochage
concorde avec la fiche TI ; aucun symbole personnalisé n'est nécessaire. Son
footprint associé par défaut présente toutefois un pad thermique plus petit que
le land pattern TI révisé en 2026 et cite un autre composant comme source. Un
autre footprint standard KiCad, explicitement basé sur `DDA0008B`, a donc été
retenu comme référence géométrique, relu avec Konnect et rendu dans un PCB
jetable. Une variante locale V1 conserve cette géométrie mais emploie six vias
Ø0,60 mm percés à Ø0,30 mm. Elle est affectée à U4 et passe le DRC de validation
sans erreur ; l'anneau de 0,15 mm et le traitement des vias sous pad restent à
confirmer avec le fabricant.
La comparaison complète est documentée dans
[`kicad-validation.md`](./kicad-validation.md).

Le pré-dimensionnement du bus protégé jusqu'à 80 V vers 5 V est détaillé dans
[`design-calculation.md`](./design-calculation.md). Les valeurs proposées y sont
explicitement marquées comme candidates jusqu'à validation par le calculateur
TI et sélection de références commandables. Les résistances, les condensateurs
et L1 sont maintenant figés pour la V1.

## Première implémentation KiCad

La feuille `AUX_SUPPLY` est maintenant présente dans le projet principal et
reçoit `AUX_IN_PROTECTED` depuis `POWER_PATH`. `AUX_5V` alimente désormais la
feuille `MCU` à travers `JP3`. `AUX_PGOOD` reste la seule sortie hiérarchique
non consommée.

Cette première passe comprend :

- U4 `LM5164DDAT` et son pad exposé relié à `GND` ;
- le pont UVLO 1 MΩ / 200 kΩ ;
- `RON` 41,2 kΩ en 1206 / 250 mW ;
- l'inductance L1 Coilcraft `MSS1038-473MLC`, 47 µH, avec l'empreinte KiCad
  standard `Inductor_SMD:L_Coilcraft_MSS1038-XXX` ;
- le pont de retour 316 kΩ / 100 kΩ pour la cible 5 V ;
- le bootstrap 2,2 nF ;
- le réseau d'injection Type-3 200 kΩ / 3,3 nF / 82 pF ;
- trois capacités céramiques d'entrée 10 µF / 100 V, corrigées après lecture
  de leur courbe DC-bias à 80 V, et les capacités de sortie validées à 5 V ;
- le condensateur électrolytique `C6`, Panasonic `EEU-FC2A100`, 10 µF / 100 V ;
- le pull-up de `PGOOD` vers 3,3 V ;
- les points de test `AUX_IN`, `AUX_5V`, `AUX_PGOOD` et `GND`.

La topologie suit la fiche TI, notamment le réseau Type-3 placé entre `SW`,
`AUX_5V` et `FB`. Le détail des références, des nets et des contrôles est dans
[`schematic-implementation.md`](./schematic-implementation.md).

## Composants périphériques attendus

Le circuit intégré seul ne constitue pas l'alimentation. Le schéma final devra
comprendre au minimum :

- trois condensateurs d'entrée céramique 10 µF / 100 V dont la capacité
  effective estimée reste supérieure au minimum TI à 80 V ;
- protection locale `F_AUX` immédiatement au départ de `BUS_PROTECTED` : le
  fusible principal du chemin 20 A ne protège pas une dérivation fine ;
- inductance dont la valeur, le courant de saturation et les pertes sont
  calculés pour 5 V et la fréquence retenue ;
- condensateurs de sortie ;
- pont de retour réglant précisément 5 V ;
- réseau `RON`, `EN/UVLO` et éventuellement filtrage de `PGOOD` ;
- protection TVS optionnelle choisie après mesure des transitoires ; aucune
  TVS parallèle standard ne peut garantir à la fois l'absence de conduction à
  80 V et un écrêtage sous la limite INA228 de 85 V ;
- aucun composant `D_AUX` séparé en V1 : une diode sur l'arrivée du LM5164
  n'isolerait pas le VBUS USB du Beetle ; l'interverrouillage manuel `JP3`
  reste donc la frontière d'isolation retenue ;
- cavalier `JP_GEN_5V` permettant d'isoler la source générateur pendant la
  programmation USB ;
- points de test `AUX_IN`, `AUX_5V`, `PGOOD` et `GND`.

Le circuit d'application 12 V / 1 A de la fiche TI est une référence de méthode,
pas une nomenclature à recopier aveuglément. L'inductance de 68 µH, les
résistances de retour et les condensateurs doivent être recalculés pour la
sortie 5 V et la charge réelle.

## Batterie, USB et états d'alimentation

- la batterie `BAT_CTRL` est raccordée à `BAT` du Beetle à travers un
  interrupteur mécanique ;
- interrupteur ouvert et vélo immobile : aucune décharge volontaire de la
  batterie ;
- batterie déconnectée et pédalage : l'alimentation auxiliaire peut démarrer le
  contrôleur automatiquement ;
- batterie connectée et pédalage : le générateur alimente la logique et le
  TP4057 peut recharger la batterie ;
- `JP_GEN_5V` est ouvert avant de brancher l'USB au poste de développement ;
- aucune source ne doit être court-circuitée à la masse pour la sélectionner.

Le schéma officiel du Beetle V2.0 confirme que `VIN_5V` et le VBUS USB-C sont
un même net `VUSB`. Une diode uniquement placée sur l'arrivée du LM5164 ne peut
donc pas empêcher le générateur d'élever le VBUS du connecteur. La V1 emploie
un interverrouillage manuel `JP3`, obligatoirement ouvert avant USB. Le détail,
la matrice d'états et les mesures requises sont documentés dans
[`../dfr0868-beetle-esp32-c3/power-input-analysis.md`](../dfr0868-beetle-esp32-c3/power-input-analysis.md).

## Séquence de démarrage et commande CC

L'alimentation auxiliaire doit permettre un démarrage indépendant du buck
principal, mais elle ne suffit pas à rendre la commande CC sûre. La cible est :

1. apparition de `BUS_PROTECTED` ;
2. établissement du 5 V auxiliaire ;
3. validation de `PGOOD` ;
4. établissement du 3,3 V et démarrage de l'ESP32 ;
5. programmation d'une valeur CC de repli sûre ;
6. autorisation matérielle de la commande CC ;
7. seulement ensuite, acceptation d'une consigne BLE.

`PGOOD` et un signal `MCU_READY` pourront participer au verrouillage. La méthode
exacte — `SHDN`, interrupteur analogique, relais ou réseau passif — dépend de la
caractérisation des trois bornes du potentiomètre CC. Une limite de sécurité ne
reposera pas uniquement sur le firmware.

## Documents archivés

| Document | Révision / usage | SHA-256 |
|---|---|---|
| [`ti-lm5164-snvsa-u4d.pdf`](./ti-lm5164-snvsa-u4d.pdf) | `SNVSAU4D`, février 2026 ; limites, boîtier et circuit d'application | `CCE03619FBE13951EEA47458CD45E140361637D8FEF32AE143B82B16D597E32D` |
| [`panasonic-eeu-fc-series.pdf`](./panasonic-eeu-fc-series.pdf) | série FC ; caractéristiques et dimensions de `EEU-FC2A100` | `42D91AE29AB6122DFE20974ABAD2EFD45D91A29337A73C5A5319616301B004F7` |

Sources officielles :

- <https://www.ti.com/product/LM5164>
- <https://www.ti.com/lit/ds/symlink/lm5164.pdf>

## Points restant à figer

- transitoires, énergie et impédance de source mesurés sur le premier bus redressé ;
- acceptation fabricant de l'anneau de 0,15 mm et du traitement des six vias
  thermiques Ø0,60/0,30 mm sous le pad exposé ;
- vérification complémentaire du calcul 5 V / 600 mA à 1 A dans l'outil TI ;
- TVS spécifique à la source et protection de branche exactes ;
- calibre et pouvoir de coupure DC de `F_AUX` ;
- fonctionnement simultané générateur, USB et batterie ;
- fiche de la batterie 801350 / 500 mAh et courant de charge admissible ;
- état CC passif lorsque le contrôleur n'est pas encore initialisé.
