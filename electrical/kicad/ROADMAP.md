# Feuille de route KiCad — contrôleur du vélo générateur

Cette feuille de route ordonne le passage du prototype sur breadboard à une
première carte vérifiable. Elle ne transforme pas les hypothèses encore ouvertes
en choix de fabrication.

## Principes de travail

- Le buck CV/CC 400 W reste un module externe en V1.
- Le trajet de puissance de la carte est dimensionné provisoirement pour 400 W,
  20 A continus et 25 A transitoires.
- La dérivation auxiliaire part de `BUS_PROTECTED`, après le fusible principal
  et le shunt, mais possède son propre fusible `F_AUX`.
- Le 5 V auxiliaire alimente `VIN_5V` du Beetle. Une LiPo 1S protégée de 400 à
  500 mAh est raccordée à `BAT` par un interrupteur mécanique.
- `JP_GEN_5V` permet d'isoler physiquement le 5 V générateur pendant les essais
  USB. Il ne court-circuite aucune source.
- Aucun symbole, footprint ou modèle 3D personnalisé n'est créé sans recherche
  préalable et accord explicite.
- Aucun circuit de sécurité ne repose uniquement sur le firmware.

## Ordre de réalisation

### 1. Valider le LM5164 et ses modèles KiCad — presque terminé

Objectif : disposer d'une correspondance prouvée entre le composant physique,
le symbole et le footprint avant de placer le régulateur.

- [x] archiver la fiche TI `SNVSAU4D` ;
- [x] relever le brochage `DDA0008B` et sa vue ;
- [x] vérifier la présence du symbole KiCad `Regulator_Switching:LM5164DDA` ;
- [x] comparer son brochage avec la fiche TI ;
- [x] comparer le footprint associé par défaut au land pattern TI révisé ;
- [x] examiner le modèle KiCad v6+ proposé par TI/Ultra Librarian : paquet
  rejeté pour incohérences de noms, vias et géométrie ;
- [x] retenir `LM5164DDAT` pour le prototypage (`LM5164DDAR` ne diffère que par
  le conditionnement en grande bobine) ;
- [x] confirmer le footprint standard KiCad basé sur `DDA0008B`, avec pads IPC
  plus longs et pâte segmentée ;
- [x] relire avec Konnect les 9 pins du symbole et les pads 1 à 9 du footprint
  standard retenu ; les huit vias thermiques portent bien le numéro 9 ;
- [ ] faire l'inspection rendue du symbole et du footprint dans un projet
  jetable avant placement définitif sur le PCB.

Critère de sortie : la table fabricant → symbole → footprint est entièrement
validée, sans ambiguïté de vue ni de pad thermique.

### 2. Construire le trajet de puissance dans `POWER_PATH` — squelette validé

- [x] placer un connecteur d'entrée redressée provisoire ;
- [x] placer le fusible principal provisoire ;
- [x] placer un shunt quatre bornes 2 mΩ provisoire avec sorties Kelvin
  distinctes ;
- [x] créer `BUS_PROTECTED` après le shunt ;
- [x] créer le départ court vers le buck CV/CC externe ;
- [x] raccorder `SHUNT_HI_K`, `SHUNT_LO_K` et `BUS_PROTECTED` aux entrées
  `SHUNT_HI_K`, `SHUNT_LO_K` et `VBUS_SENSE` de la feuille INA228 ;
- [x] créer le départ auxiliaire protégé par `F_AUX` ;
- [ ] choisir les références physiques et footprints du shunt, des fusibles et
  des connecteurs ;
- [ ] dimensionner la protection contre inversion et transitoires après les
  mesures de la génératrice.

Le contrôle Konnect du 24 septembre 2026 donne zéro fil flottant, zéro pin non
connectée, zéro élément orphelin et zéro court-circuit de nets. L'ERC global ne
signale plus qu'un avertissement attendu : `AUX_IN_PROTECTED` n'alimente encore
aucun LM5164.

Critère de sortie du squelette : atteint. La sélection physique des composants
reste indispensable avant tout PCB commandable.

### 3. Concevoir le buck auxiliaire 10–60 V vers 5 V

- placer le LM5164 validé ;
- calculer `RON`, le pont `EN/UVLO`, le pont de retour 5 V, l'inductance et les
  condensateurs pour 600 mA continus avec marge jusqu'à 1 A ;
- choisir `F_AUX`, TVS et filtrage après les mesures du générateur ;
- ajouter les points de test `AUX_IN`, `AUX_5V`, `PGOOD` et `GND` ;
- prévoir le blocage de retour de courant et `JP_GEN_5V`.

Critère de sortie : calculs sourcés, composants commandables et démarrage sûr
sur toute l'enveloppe 10–60 V.

### 4. Finaliser les sources du Beetle et de la batterie

- confirmer la révision physique exacte du DFR0868 ;
- relever les relations réelles entre USB-C, `VIN_5V`, TP4057, `BAT` et 3,3 V ;
- ajouter le connecteur LiPo 1S protégée 400–500 mAh et son interrupteur ;
- vérifier le courant de charge admissible de la batterie ;
- garantir l'absence de retour vers le PC dans tous les états de `JP_GEN_5V`.

Critère de sortie : matrice d'états générateur/USB/batterie vérifiée sur table.

### 5. Finaliser la commande CC et son état de repli

- mesurer les trois bornes du potentiomètre CC du buck dans plusieurs états ;
- confirmer plage, polarité, masse commune et courant de curseur ;
- choisir MCP41010 ou MCP42100 selon le besoin réel ;
- définir une valeur passive sûre au démarrage ;
- autoriser la commande seulement lorsque `PGOOD` et une condition matérielle
  cohérente avec `MCU_READY` sont satisfaits.

Critère de sortie : perte d'alimentation, reset ou firmware bloqué ne peut pas
imposer une charge dangereuse.

### 6. Vérifier le schéma complet

- relire tous les composants et leurs pins avec Konnect ;
- valider les pins de feuilles et la netlist ;
- lancer ERC, recherche de nets courts, nets à une pin et éléments orphelins ;
- rendre chaque feuille et effectuer une inspection visuelle ;
- documenter séparément erreurs réelles et limites encore intentionnelles.

Critère de sortie : aucune erreur inexpliquée et aucune validation reposant
uniquement sur un rapport ERC vert.

### 7. Préparer puis router le PCB

- figer les connecteurs, fusibles, shunt et dimensions mécaniques ;
- définir les règles du domaine 20–25 A avant placement ;
- placer d'abord le trajet fort courant et le shunt Kelvin ;
- placer ensuite LM5164, INA228, logique et interfaces ;
- séparer nœud `SW`, analogique sensible, radio et cuivre de puissance ;
- calculer les largeurs de cuivre, échauffements, vias et éventuels renforts ;
- exécuter DRC et revue de fabrication.

Critère de sortie : revue pré-fabrication explicite, sans lancer de commande.

### 8. Prototyper et qualifier

- alimenter d'abord la branche auxiliaire avec une alimentation de laboratoire
  limitée en courant ;
- vérifier 5 V, `PGOOD`, UVLO et températures ;
- valider l'absence de retour USB ;
- tester ensuite à courant croissant le trajet principal et les mesures INA228 ;
- comparer mesures électriques, puissance mécanique ressentie et télémétrie.

Critère de sortie : mesures archivées et décision documentée avant une révision
destinée à la fabrication.

## Blocages connus avant un PCB commandable

- pics réels de tension du générateur non mesurés ;
- références exactes du shunt, des fusibles, de la TVS et des connecteurs non
  figées ;
- inspection rendue du symbole et du footprint LM5164 standard encore à faire
  dans un projet jetable ;
- alimentation interne du Beetle et retour USB non validés sur la révision
  physique ;
- interface du potentiomètre CC encore à caractériser ;
- dimensions mécaniques du Beetle et du buck externe non figées.
