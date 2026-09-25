# Feuille de route KiCad — contrôleur du vélo générateur

Cette feuille de route ordonne le passage du prototype sur breadboard à une
première carte vérifiable. Elle ne transforme pas les hypothèses encore ouvertes
en choix de fabrication.

## Principes de travail

- Le buck CV/CC 400 W reste un module externe en V1.
- Le trajet de puissance de la carte est dimensionné provisoirement pour 400 W,
  20 A continus et 25 A transitoires.
- Les observations actuelles sont environ 36 V en charge et plus de 40 V lors
  de démarrages rapides. Elles ne remplacent pas la mesure de tension à vide,
  génératrice entraînée mais sortie déconnectée.
- La dérivation auxiliaire part de `BUS_PROTECTED`, après le fusible principal
  et le shunt, mais possède son propre fusible `F_AUX`.
- Le 5 V auxiliaire alimente `VIN_5V` du Beetle. La LiPo 1S protégée
  `801350`, 500 mAh, est raccordée à `BAT` par un interrupteur mécanique.
- `JP_GEN_5V` permet d'isoler physiquement le 5 V générateur pendant les essais
  USB. Il ne court-circuite aucune source.
- Aucun symbole, footprint ou modèle 3D personnalisé n'est créé sans recherche
  préalable et accord explicite.
- Aucun circuit de sécurité ne repose uniquement sur le firmware.
- Le firmware reste hors périmètre jusqu'à l'existence de la première carte
  physique ; les travaux courants portent uniquement sur le matériel et sa
  validation électrique.

## Ordre de réalisation

### 1. Valider le LM5164 et ses modèles KiCad — CAO et variante V1 validées

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
- [x] placer, relire et rendre le symbole dans un projet jetable ;
- [x] placer, relire et rendre le footprint dans le PCB jetable ; contrôler le
  repère 1, les pads, le masque, la pâte et les huit vias thermiques ;
- [x] créer après accord la variante projet à six vias Ø0,60/0,30 mm, conserver
  le pad exposé, le masque et la pâte validés, puis refaire le DRC ;
- [x] affecter la variante locale à U4 :
  `BikeGenerator:SOIC-8-1EP_DDA_EP2.95x4.9mm_6Vias_D0.30mm`.

Critère de sortie CAO V1 : atteint. Le PCB jetable donne zéro erreur et zéro
violation de règle ; son seul avertissement est l'empreinte volontairement sans
schéma. Avant fabrication, confirmer l'anneau de 0,15 mm et le traitement des
vias sous pad avec le fabricant.

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
- [x] documenter une première présélection : Bourns
  `CSS4J-4026K-2L00F`, `0449001.MR` et Anderson PP15/45 ; le fusible principal
  est désormais spécifié ≤ 20 A / ≥ 125 V DC et reste source-spécifique ;
- [x] retenir `CSS4J-4026K-2L00F` et lui affecter l'empreinte KiCad native
  `Resistor_SMD:R_Shunt_Isabellenhuette_BVR4026`, dont le land pattern est
  identique au dessin Bourns ;
- [x] retenir pour `J4` et `J5` le bornier Phoenix Contact `1711725`, 24 A /
  400 V, avec son empreinte KiCad native MKDS-3 au pas de 5,08 mm ;
- [x] retenir l'Eaton Bussmann `ABC-V-20-R`, créer son empreinte axiale locale
  au pas choisi de 38,10 mm et l'affecter à `F1` ;
- [ ] dimensionner la protection contre inversion et transitoires après les
  mesures de la génératrice.

Le contrôle Konnect du 24 septembre 2026 donne zéro fil flottant, zéro pin non
connectée, zéro élément orphelin et zéro court-circuit de nets. Depuis l'ajout
de `AUX_SUPPLY`, `AUX_IN_PROTECTED` alimente bien le LM5164.

Critère de sortie du squelette : atteint. La sélection physique des composants
reste indispensable avant tout PCB commandable.

### 3. Concevoir le buck auxiliaire sur bus protégé jusqu'à 80 V vers 5 V

- [x] créer la feuille hiérarchique `AUX_SUPPLY` et la relier à
  `AUX_IN_PROTECTED` ;
- [x] placer le LM5164 validé avec la variante locale V1 dérivée de DDA0008B ;
- [x] effectuer un premier calcul sourcé de `RON`, `EN/UVLO`, retour 5 V,
  inductance, réseau d'ondulation et condensateurs pour 600 mA continus avec
  marge jusqu'à 1 A ;
- [x] traduire ce calcul en un premier schéma : UVLO, `RON`, pont de retour,
  bootstrap, inductance, condensateurs et réseau Type-3 ;
- [x] ajouter les points de test `AUX_IN`, `AUX_5V`, `AUX_PGOOD` et `GND` ;
- [x] relire les neuf nets de U4 et vérifier zéro orphelin, zéro court-circuit
  de nets et zéro chevauchement de symboles ;
- [ ] rejouer ce calcul dans le calculateur officiel TI/WEBENCH ;
- [x] sélectionner les références commandables des résistances, MLCC et de L1,
  avec des empreintes KiCad standard favorisant la soudure manuelle ;
- [x] choisir `C6` : Panasonic `EEU-FC2A100`, avec empreinte KiCad native ;
- [x] vérifier les courbes fabricant des MLCC : remplacer les deux 2,2 µF /
  100 V d'entrée insuffisants à 80 V par trois 10 µF / 100 V X7S ; conserver
  les deux 22 µF / 16 V de sortie ;
- [x] reporter cette correction dans `AUX_SUPPLY` : mettre `C4` et `C5` à
  `CL32Y106KCVZ4NE` / 10 µF et ajouter `C13` identique en parallèle, sans
  renuméroter les références existantes ;
- [ ] vérifier les pertes de L1 avec le profil de charge définitif et confirmer
  thermiquement les MLCC d'entrée sur prototype ;
- [x] retenir électriquement `0449001.MR` pour `F_AUX`, créer son land pattern
  Littelfuse exact et l'affecter à `F2` ; retirer `SMCJ48A` comme choix
  générique, incompatible avec 80 V continus ;
- [ ] choisir une TVS source-spécifique après mesure des transitoires ; aucun
  composant parallèle standard ne garantit à la fois veille à 80 V et clamp
  sous 85 V ;
- [x] raccorder `AUX_5V` au bloc d'alimentation du contrôleur ;
- [x] placer l'interverrouillage manuel `JP_GEN_5V` ;
- [ ] raccorder `AUX_PGOOD` à une fonction matérielle justifiée ;
- [ ] valider physiquement l'absence de retour de courant dans tous les états.

Le contrôle du 24 septembre 2026 laisse volontairement une erreur ERC sur la
feuille racine : `AUX_PGOOD` n'est pas encore consommé. Elle disparaîtra par un
raccordement réel au verrouillage matériel, pas par une exclusion ERC.

Critère de sortie : calculs sourcés, composants commandables et démarrage sûr
sur toute l'enveloppe vérifiée 10–80 V, avec un plafond absolu d'usage à 80 V.

### 4. Finaliser les sources du Beetle et de la batterie

- [x] retenir la révision DFR0868 V2.0 à partir des photos et du CAD officiel ;
- [x] créer et affecter à `U2` l'empreinte porte-module socketée, 20,50 ×
  25,00 mm, rangées espacées de 17,78 mm ;
- [x] relever sur le schéma officiel V2.0 les relations entre USB-C, `VIN_5V`,
  TP4057, `BAT` et 3,3 V ;
- [x] documenter que `VIN_5V` et le VBUS USB-C partagent le net `VUSB` ;
- [x] ajouter au schéma le connecteur de la LiPo 1S protégée 801350 / 500 mAh et son
  interrupteur ;
- [x] affecter à `J6` l'embase KiCad standard correspondant à la
  `S2B-PH-K-S(LF)(SN)`, deux contacts au pas de 2,00 mm, et à `JP3` un header
  1 × 2 au pas de 2,54 mm ;
- [x] documenter le côté câble `PHR-2` et les contacts
  `SPH-002T-P0.5S` dans la nomenclature ;
- [x] documenter la matrice générateur/USB/batterie et l'état interdit
  `JP3 fermé + USB branché` ;
- confirmer physiquement l'accessibilité et la polarité du connecteur batterie ;
- vérifier le courant de charge admissible de la batterie ;
- garantir l'absence de retour vers le PC dans tous les états de `JP_GEN_5V`.

Critère de sortie : matrice d'états générateur/USB/batterie vérifiée sur table.

### 5. Finaliser la commande CC et son état de repli

- mesurer les trois bornes du potentiomètre CC du buck dans plusieurs états ;
- confirmer plage, polarité, masse commune et courant de curseur ;
- [x] intégrer le `MCP4151-104E/SN` simple canal et son découplage 100 nF ;
- [x] vérifier le brochage `/SN`, le symbole KiCad natif et l'empreinte SOIC-8
  native sans recréer de modèle ECAD ;
- [x] adapter le firmware au protocole d'écriture MCP4151, supprimer `POT_MISO`
  et forcer l'écriture de `POT_INITIAL` au démarrage ;
- vérifier par mesure que `CC_A`, `CC_W` et `CC_B` restent entre 0 et 3,3 V et
  sous 2,5 mA dans tous les états ;
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

Audit intermédiaire du 25 septembre 2026 : pins hiérarchiques cohérentes,
netlist complète générée, liaisons principales relues et ERC à une erreur
intentionnelle (`AUX_PGOOD`) sans avertissement. Voir
[`CONNECTION_AUDIT.md`](./CONNECTION_AUDIT.md).

Critère de sortie : aucune erreur inexpliquée et aucune validation reposant
uniquement sur un rapport ERC vert.

Inventaire des empreintes du 25 septembre 2026 : les 61 références du PCB ont
une empreinte. `J4` et `J5` utilisent le bornier Phoenix Contact `1711725` et son
empreinte KiCad native. `S1` utilise désormais le C&K / Littelfuse
`1101M2S3CQE2`, 6 A sous 28 VDC. Le symbole SPST existant conserve les nets sur
les bornes physiques 1 et 2 ; la borne 3 du SPDT reste volontairement libre.
`F1` utilise l'empreinte locale validée
`BikeGenerator:Fuse_Eaton_ABC-V-20-R_Axial_P38.10mm`.

### 7. Préparer puis router le PCB

- figer les connecteurs, fusibles, shunt et dimensions mécaniques ;
- [x] définir et affecter les netclasses de la V1 ; voir
  [`NETCLASSES.md`](NETCLASSES.md) ;
- placer d'abord le trajet fort courant et le shunt Kelvin ;
- placer ensuite LM5164, INA228, logique et interfaces ;
- séparer nœud `SW`, analogique sensible, radio et cuivre de puissance ;
- calculer les largeurs de cuivre, échauffements, vias et éventuels renforts ;
- exécuter DRC et revue de fabrication.

Critère de sortie : revue pré-fabrication explicite, sans lancer de commande.

État intermédiaire du 25 septembre 2026 : contour provisoire 100 × 115 mm,
61 empreintes synchronisées et placées, sans chevauchement de courtyard ni
composant hors contour ; le score de placement Konnect est 100/100. Ce score
valide la géométrie générale, pas les boucles de courant, le routage Kelvin ni
la thermique. Le fusible `F1` est placé horizontalement sous les borniers et
`J5` a été rapproché du nouveau bord inférieur.

État du 26 septembre 2026 : huit netclasses sont définies et relues sans
affectation orpheline. Le DRC retrouve l'état préalable du PCB non routé :
112 connexions manquantes et 14 erreurs connues appartenant aux empreintes
`JP1`/`JP2`. Le routage doit maintenant commencer par le chemin positif 20 A,
son retour de masse, puis les prises Kelvin du shunt.

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

- tension en charge observée à 36 V et pics supérieurs à 40 V, mais tension à
  vide et pics réels non encore mesurés avec un instrument adapté ;
- référence exacte de la TVS non figée ; le fusible principal `F1`, les
  connecteurs `J4`/`J5` et le shunt `R7` sont figés ;
- traitement des six vias thermiques Ø0,60/0,30 mm du LM5164, anneau de
  0,15 mm et procédé d'assemblage à confirmer auprès du fabricant ;
- alimentation interne du Beetle et retour USB non validés sur la révision
  physique ;
- polarité JST-PH et fiche de la cellule protégée 801350 / 500 mAh non encore
  validées ;
- interface du potentiomètre CC encore à caractériser ;
- insertion physique des headers du Beetle à confirmer sur table ; ses cotes
  officielles et son empreinte sont désormais archivées et figées pour la V1 ;
- dimensions nominales du buck externe enregistrées à 60 × 60 × 45 mm, mais
  fixation et source image non archivées.
