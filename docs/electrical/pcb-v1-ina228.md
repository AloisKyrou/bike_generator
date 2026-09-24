# Spécification préliminaire du PCB V1 — INA228

Statut : **architecture décidée, valeurs à confirmer avant routage**.

## Objectif

Créer une première carte de contrôle reproductible qui remplace la breadboard,
mesure la puissance électrique produite avant le buck et conserve les modules
éprouvés pour les autres fonctions.

```text
Redresseur + -> fusible -> shunt 2 mΩ -> BUS_PROTECTED
                              | |             +-> entrée + du buck 400 W
                         pistes Kelvin        +-> LM5164 -> 5 V logique
                              |                                |
                            INA228                         Beetle ESP32-C3
                         V, I, P, énergie                       |
                              +------------- I2C ---------------+

Redresseur - -------------------------------- retour de puissance à confirmer
```

La mesure est placée en **high-side**, dans le conducteur positif, afin de ne pas
ajouter la chute du shunt dans la masse commune du système.

## INA228

Référence envisagée : **INA228AIDGSR**.

- boîtier VSSOP-10, pas de 0,5 mm ;
- soudé directement sur le PCB ;
- alimentation 2,7 à 5,5 V, prévue ici en 3,3 V ;
- interface I2C ;
- tension de mode commun et mesure de bus jusqu'à 85 V ;
- mesure du courant par shunt, de la tension, de la puissance, de l'énergie et de
  la charge ;
- plages différentielles programmables ±40,96 mV et ±163,84 mV ;
- sortie ALERT disponible pour signaler une limite sans attendre la boucle BLE.

Le seuil 85 V n'est pas une protection contre toutes les surtensions. La tension
à vide et les transitoires de la génératrice doivent être mesurés avant de choisir
la protection d'entrée.

## Shunt préliminaire

Choix de départ :

- 2 mΩ ;
- quatre bornes Kelvin ;
- tolérance 1 % ou meilleure ;
- faible coefficient de température ;
- 1 W minimum, 2 W préféré ;
- boîtier et surfaces cuivre compatibles avec le courant et la dissipation.

| Courant | Chute sur 2 mΩ | Dissipation | Lecture en plage ±40,96 mV |
|---:|---:|---:|---:|
| 5 A | 10 mV | 0,05 W | 24 % de l'échelle |
| 10 A | 20 mV | 0,20 W | 49 % de l'échelle |
| 15 A | 30 mV | 0,45 W | 73 % de l'échelle |
| 20 A | 40 mV | 0,80 W | 98 % de l'échelle |

Ce choix couvre donc jusqu'à environ 20 A dans la plage la plus sensible. Il ne
fixe pas pour autant le calibre du fusible ni le courant admissible du PCB.

La cible système est fixée à **400 W**. Le courant ne découle toutefois pas de
la puissance seule : 400 W correspondent à 20 A sous 20 V et 16,7 A sous 24 V.
La base de dimensionnement retenue est donc 20 A continus et 25 A transitoires,
sous réserve de la tension réelle de la génératrice et de la validation
thermique du PCB.

## Alimentation autonome du contrôleur

Le contrôleur ne dépendra pas de la sortie 24 V du buck principal. Une branche
auxiliaire part de `BUS_PROTECTED`, après le fusible et le shunt :

```text
BUS_PROTECTED -> F_AUX -> buck auxiliaire -> 5 V -> VIN_5V du Beetle
                                      +-> chargeur TP4057 du Beetle
BAT_CTRL 1S protégée -> interrupteur -> BAT du Beetle
```

Décisions V1 :

- plage fonctionnelle d'entrée : 10 à 60 V DC ;
- circuit candidat : LM5164, capable de 6 à 100 V et 1 A ;
- sortie : 5 V ;
- charge continue à garantir : au moins 600 mA ;
- batterie : Li-ion/LiPo 1S protégée, 400 à 500 mAh ;
- recharge : TP4057 déjà présent sur le Beetle, 400 mA maximum annoncé ;
- démarrage automatique possible sur l'énergie du générateur même lorsque la
  batterie contrôleur est déconnectée ;
- cavalier `JP_GEN_5V` ouvert pour isoler la source générateur lors d'une
  alimentation ou programmation USB ;
- blocage du courant inverse à prévoir sur la branche 5 V générateur.

`F_AUX` est une protection locale obligatoire : le fusible principal prévu
pour le chemin 20 A laisserait une énergie excessive dans une piste auxiliaire
en cas de court-circuit. Son calibre, son pouvoir de coupure DC et son éventuel
remplacement par une résistance fusible restent à sélectionner.

La référence commandable exacte du LM5164, son inductance, sa fréquence, son
réseau de retour, ses condensateurs et sa protection transitoire restent à
calculer depuis la fiche TI. Les valeurs du circuit d'application 12 V / 1 A ne
seront pas recopiées sans recalcul pour 5 V.

Le signal `PGOOD` du convertisseur et un état `MCU_READY` pourront verrouiller
la commande CC jusqu'à ce que les alimentations soient stables et qu'une valeur
sûre ait été écrite. La sécurité au démarrage devra aussi avoir un repli
matériel indépendant du firmware.

## Sous-circuits attendus

### Mesure INA228

- INA228AIDGSR ;
- condensateur de découplage 100 nF au plus près de VS/GND ;
- emplacement pour un condensateur local supplémentaire ;
- filtrage d'entrée symétrique conforme aux recommandations TI ;
- pistes Kelvin séparées des pistes de puissance ;
- straps d'adresse A0/A1 ;
- pull-up ALERT et point de test ;
- pull-up I2C configurables ou non montées si celles de la Beetle suffisent ;
- test points : IN+, IN-, VBUS, 3V3, GND, SDA, SCL et ALERT.

### Contrôle

- empreinte ou connecteurs pour la Beetle ESP32-C3 ;
- empreinte ou connecteurs pour le module DFR0520 ;
- connecteur documenté vers la commande CC du buck ;
- alimentation auxiliaire 10–60 V vers 5 V autour du LM5164 ;
- batterie contrôleur 1S protégée de 400 à 500 mAh ;
- interrupteur de déconnexion de la batterie ;
- cavalier d'isolation `JP_GEN_5V` ;
- prévention du retour de courant lorsque l'USB-C et l'alimentation externe sont
  présents simultanément ;
- verrouillage matériel de la commande CC pendant le démarrage ;
- points de test SPI et I2C.

### Interface locale

- voyant alimentation ;
- voyant connexion/activité ;
- voyant défaut ou limitation ;
- connecteur I2C pour écran optionnel : 3V3, GND, SDA, SCL ;
- éventuellement un bouton utilisateur.

Le BLE reste l'interface complète. L'écran local est destiné aux valeurs
instantanées et au diagnostic : puissance produite, énergie de session, consigne,
état BLE et défaut. Il pourra être ajouté sans réviser la carte.

## Connecteurs fonctionnels proposés

| Nom | Fonction | Remarque |
|---|---|---|
| J_BAT_CTRL | batterie Li-ion/LiPo 1S protégée | 400–500 mAh, polarité détrompée |
| J_RECTIFIED_IN | arrivée positive/négative après redressement | zone puissance |
| J_BUCK_IN | départ vers IN+/IN- du buck | zone puissance |
| J_CC_CTRL | interface vers potentiomètre CC | brochage bloqué par les mesures |
| J_DISPLAY | 3V3, GND, SDA, SCL | écran optionnel |
| J_DEBUG | UART et signaux utiles | débogage et bring-up |
| JP_GEN_5V | isolement alimentation générateur / USB | ouvert en mode USB/service |

Des connecteurs de puissance traversants, vissés ou câblés peuvent être préférés
à de petits borniers PCB selon le courant final.

## Conséquences firmware

Le firmware actuel lit deux ADC : ACS712 sur GPIO0 et pont diviseur sur GPIO1.
La V1 demandera :

1. un pilote I2C INA228 ;
2. la configuration de la plage shunt ;
3. la constante de calibration correspondant à 2 mΩ ;
4. la lecture de tension, courant, puissance, énergie et alertes ;
5. la détection d'une absence ou erreur du capteur ;
6. un état sûr si la mesure n'est plus fiable ;
7. une séquence de démarrage qui initialise une consigne CC sûre avant
   d'autoriser la commande ;
8. une couche `Sensors` conservant autant que possible l'API actuelle.

Les GPIO0 et GPIO1 pourront rester disponibles comme entrées analogiques de test
ou de secours, mais la puissance publiée par BLE viendra de l'INA228.

## Coût indicatif de la mesure

Prix unitaires indicatifs relevés en septembre 2026, hors port, taxes éventuelles,
PCB et assemblage :

| Élément | Estimation |
|---|---:|
| INA228AIDGSR | environ 4,02 € |
| shunt adapté | environ 0,70 à 3,20 € |
| découplage, filtres, pull-up et straps | environ 0,40 à 0,80 € |
| **Sous-total mesure** | **environ 5,10 à 8,00 €** |

Une chaîne analogique discrète avait été estimée à environ 3,80–7,30 €, avant
l'ajout éventuel d'un ADC externe. L'économie n'était donc pas suffisante pour
justifier sa complexité sur la V1. Elle reste une piste pédagogique pour une
révision ultérieure.

## Vérifications avant fabrication

- [ ] tension maximale à vide et en charge mesurée avant le buck ;
- [x] cible système fixée à 400 W ;
- [x] base préliminaire fixée à 20 A continus et 25 A transitoires ;
- [ ] fusible et section des conducteurs justifiés ;
- [ ] continuité ou isolation des masses confirmée ;
- [ ] shunt exact sélectionné avec empreinte issue de sa fiche technique ;
- [ ] calcul thermique du shunt, des pistes et des connecteurs effectué ;
- [ ] interface CC caractérisée ;
- [x] architecture d'alimentation décidée : branche avant buck principal,
      LM5164 candidat, 5 V puis 3,3 V via le Beetle ;
- [ ] calcul et références exactes du convertisseur auxiliaire validés ;
- [ ] batterie 400–500 mAh exacte choisie avec charge 400 mA autorisée ;
- [ ] absence de retour de courant entre générateur, USB et batterie vérifiée ;
- [ ] état de sécurité au démarrage et en panne défini ;
- [ ] schéma revu puis ERC sans erreur non justifiée ;
- [ ] empreintes imprimées à l'échelle 1:1 et vérifiées avec les composants.

## Sources

- [INA228 chez Texas Instruments](https://www.ti.com/product/INA228)
- [Fiche technique INA228](https://www.ti.com/lit/ds/symlink/ina228.pdf)
- [INA228AIDGSR chez Mouser](https://www.mouser.fr/en/ProductDetail/Texas-Instruments/INA228AIDGSR)
- [LM5164 chez Texas Instruments](https://www.ti.com/product/LM5164)
- [Fiche technique LM5164](https://www.ti.com/lit/ds/symlink/lm5164.pdf)
