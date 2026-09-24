# LM5164 — alimentation auxiliaire du contrôleur

Statut : **candidat d'architecture retenu, référence commandable et valeurs de
puissance à valider avant schéma définitif**.

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
| Entrée fonctionnelle | 10 à 60 V DC | décidée |
| Tenue du circuit intégré | 100 V | candidat LM5164 |
| Sortie | 5 V | décidée |
| Charge continue à garantir | au moins 600 mA | préliminaire |
| Capacité du convertisseur | 1 A maximum | candidat LM5164 |
| Batterie contrôleur | Li-ion/LiPo 1S protégée, 400 à 500 mAh | décidée |
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

La référence commandable exacte (`LM5164DDAT`, `LM5164DDAR` ou variante Q1)
n'est pas encore figée. Aucun symbole, footprint ou modèle 3D ne doit être créé
avant la recherche prescrite par [`../../AGENTS.md`](../../AGENTS.md) et
l'approbation du composant exact.

## Composants périphériques attendus

Le circuit intégré seul ne constitue pas l'alimentation. Le schéma final devra
comprendre au minimum :

- condensateurs d'entrée céramique 100 V avec déclassement DC vérifié ;
- protection locale `F_AUX` immédiatement au départ de `BUS_PROTECTED` : le
  fusible principal du chemin 20 A ne protège pas une dérivation fine ;
- inductance dont la valeur, le courant de saturation et les pertes sont
  calculés pour 5 V et la fréquence retenue ;
- condensateurs de sortie ;
- pont de retour réglant précisément 5 V ;
- réseau `RON`, `EN/UVLO` et éventuellement filtrage de `PGOOD` ;
- protection contre les transitoires choisie après mesure du bus à vide ;
- blocage du courant inverse vers la source générateur ;
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

Le détail électrique entre `VIN_5V`, `VUSB`, le TP4057 et `BAT` doit encore être
relevé sur le schéma officiel de la révision physique du Beetle. Le circuit
d'isolation ne sera figé qu'après cette vérification et un essai d'absence de
retour de courant.

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

Sources officielles :

- <https://www.ti.com/product/LM5164>
- <https://www.ti.com/lit/ds/symlink/lm5164.pdf>

## Points restant à figer

- tension maximale et transitoires mesurés sur le bus redressé ;
- référence commandable exacte du LM5164 ;
- calcul 5 V / 600 mA à 1 A et fréquence de découpage ;
- inductance, condensateurs, TVS et protection de branche exacts ;
- calibre et pouvoir de coupure DC de `F_AUX` ;
- fonctionnement simultané générateur, USB et batterie ;
- référence de batterie 400–500 mAh et courant de charge admissible ;
- état CC passif lorsque le contrôleur n'est pas encore initialisé.
