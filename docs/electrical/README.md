# Dossier électrique et PCB

Ce dossier rassemble l'état des connaissances électriques du vélo générateur et
prépare une première carte électronique sous KiCad.

Les fichiers de travail, datasheets, mesures et le futur projet KiCad sont
rangés dans l'[espace d'ingénierie électrique](../../electrical/).

Il distingue volontairement :

- le prototype actuellement assemblé sur breadboard ;
- les éléments identifiés mais encore à mesurer ;
- la cible décidée pour le PCB V1 ;
- les améliorations reportées à une révision ultérieure.

## Décision actuelle pour le PCB V1

La première carte utilisera un **INA228AIDGSR soudé directement sur le PCB** avec
une résistance shunt dédiée. Elle ne conservera pas l'ACS712 et le pont diviseur
comme chaîne de mesure principale.

Décisions retenues :

- CAO : KiCad ;
- microcontrôleur : carte DFRobot Beetle ESP32-C3 DFR0868 montée sur connecteurs ;
- mesure : INA228, interface I2C, alimentation logique 3,3 V ;
- shunt préliminaire : 2 mΩ, quatre bornes, 1 W minimum et 2 W préféré ;
- emplacement : conducteur positif, après le redresseur et avant le buck ;
- grandeur mesurée : puissance électrique envoyée par la génératrice au buck ;
- convertisseur 400 W : conservé comme module externe ;
- commande CC : DFR0520 conservé comme module pour la V1, après caractérisation ;
- interface principale : BLE ;
- interface locale : voyants et connecteur I2C pour un écran optionnel ;
- écran : non imposé et non soudé directement sur la V1.

La valeur mesurée avant le buck n'est pas exactement la puissance mécanique aux
pédales. Elle exclut les pertes mécaniques, celles de la génératrice et celles du
redresseur. Elle est toutefois mieux corrélée à l'effort produit que la seule
puissance livrée à la batterie après conversion.

## Ce qui ne fait pas partie de la V1

- recréer le convertisseur CV/CC 400 W sur le PCB ;
- intégrer les composants de puissance du buck ;
- réaliser un compteur certifié d'énergie ;
- garantir une estimation exacte de la puissance mécanique du cycliste ;
- intégrer immédiatement un écran couleur ;
- remplacer dès maintenant le DFR0520 par son circuit intégré nu ;
- commuter automatiquement les charges de dissipation.

## Documents

| Document | Contenu |
|---|---|
| [État actuel et questions ouvertes](as-built-and-open-questions.md) | Lecture des photos, références probables, incohérences et risques |
| [Spécification du PCB V1](pcb-v1-ina228.md) | Architecture cible, INA228, shunt, connecteurs et coût indicatif |
| [Campagne de mesures](measurement-campaign.md) | Relevés nécessaires avant de figer le schéma |
| [Méthodologies de conception](design-methodologies.md) | Manières possibles de démarrer et méthode hybride recommandée |

## Statuts employés

- **observé** : visible sur une photo ou mesuré physiquement ;
- **documenté** : présent dans le code ou un document du dépôt ;
- **probable** : identification forte, mais référence à confirmer ;
- **décidé pour V1** : choix de conception, pas encore réalisé ;
- **bloquant** : information requise avant fabrication.
