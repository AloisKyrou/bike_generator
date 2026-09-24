# Workflow KiCad du contrôleur

Ce document explique les opérations réalisées sur le projet KiCad, leur
équivalent manuel dans l'interface et les contrôles à effectuer pour pouvoir
reproduire ou dépanner le travail.

## Règle de sécurité principale

Les fichiers `.kicad_pro`, `.kicad_sch`, `.kicad_pcb`, `.kicad_sym` et
`.kicad_mod` ne doivent pas être modifiés avec un éditeur de texte. Ils
contiennent des UUID, des références croisées et des données ordonnées que
KiCad doit garder cohérentes.

Pour ce projet :

- les modifications automatisées passent par Konnect ;
- les modifications manuelles passent par l'interface KiCad ;
- Git sert à inspecter et versionner les changements, pas à réécrire les
  fichiers KiCad à la main.

L'éditeur PCB peut être piloté en direct par l'API de KiCad 10. L'éditeur de
schéma ne dispose pas encore de cette API complète : Konnect travaille alors
sur le fichier enregistré. Il faut donc fermer l'éditeur de schéma avant une
modification automatisée, puis le rouvrir après les vérifications.

## Hiérarchie créée

Le schéma racine est :

```text
bike-generator-controller.kicad_sch
```

Il référence cinq feuilles fonctionnelles :

| Page | Feuille | Fichier | Rôle prévu |
|---:|---|---|---|
| 2 | `POWER_PATH` | `power_path.kicad_sch` | trajet 400 W, fusible, shunt, départ buck et branche auxiliaire LM5164 vers 5 V |
| 3 | `INA228_SENSE` | `ina228_sense.kicad_sch` | INA228, filtrage Kelvin, adresse, alertes et découplage |
| 4 | `CONNECTORS` | `connectors.kicad_sch` | écran, debug et interfaces auxiliaires externes |
| 5 | `MCU` | `mcu.kicad_sch` | Beetle ESP32-C3, alimentation logique et bus numériques |
| 6 | `CC_CONTROL` | `cc_control.kicad_sch` | DFR0520, interface du réglage CC et état sûr |

Les connecteurs qui transportent le fort courant resteront probablement dans
`POWER_PATH`, même si les connecteurs de commande sont regroupés dans
`CONNECTORS`. Cela garde le chemin de puissance lisible sur une seule feuille.
Le LM5164 et sa branche depuis `BUS_PROTECTED` resteront également dans cette
feuille : cette alimentation est de faible puissance, mais son entrée appartient
au domaine de tension du bus redressé.

Les ports hiérarchiques des quatre feuilles logiques sont créés et reliés.
Seuls `SHUNT_HI_K`, `SHUNT_LO_K` et `VBUS_SENSE` attendent encore la feuille
`POWER_PATH`. Cette attente est volontaire : leurs connexions dépendent du
shunt, des protections et de la stratégie de masse encore à dimensionner.

## Ce que l'automatisation a réalisé

La séquence employée pour créer la hiérarchie est la suivante :

1. Identifier explicitement le schéma racine du projet.
2. Vérifier que l'éditeur de schéma est fermé.
3. Charger les outils Konnect de hiérarchie et d'export.
4. Lire la hiérarchie existante pour éviter les doublons.
5. Ajouter chaque feuille avec son nom, son fichier, sa position et sa taille.
6. Laisser Konnect créer les cinq fichiers enfants avec des UUID valides.
7. Renuméroter les pages dans l'ordre de la hiérarchie.
8. Relire la hiérarchie enregistrée au lieu de se fier uniquement aux demandes
   envoyées.
9. Vérifier la correspondance entre les ports des blocs parents et les labels
   hiérarchiques des feuilles enfants.
10. Générer une image du schéma racine et l'inspecter visuellement.
11. Exécuter l'ERC KiCad sur toute la hiérarchie.

Résultat initial de cette étape : cinq feuilles relues aux pages 2 à 6, aucun
port incohérent et un rendu contenu dans le cadre A4. Depuis, quatre feuilles
ont été peuplées. L'ERC global ne contient plus que trois erreurs attendues,
correspondant aux trois entrées de mesure laissées en attente de `POWER_PATH`.

## Refaire la même opération manuellement

Dans l'éditeur de schéma KiCad :

1. Ouvrir `bike-generator-controller.kicad_sch`.
2. Choisir **Placer > Ajouter une feuille hiérarchique** ou utiliser l'outil de
   feuille hiérarchique dans la barre de droite.
3. Dessiner un rectangle sur la page racine.
4. Dans les propriétés, renseigner séparément :
   - le nom affiché, par exemple `POWER_PATH` ;
   - le fichier, par exemple `power_path.kicad_sch`.
5. Accepter la création du fichier enfant lorsqu'il n'existe pas.
6. Répéter l'opération pour les cinq feuilles du tableau précédent.
7. Double-cliquer sur un bloc pour entrer dans la feuille correspondante.
8. Utiliser le navigateur hiérarchique pour revenir à la racine et contrôler
   l'ordre des pages.
9. Enregistrer le projet, fermer l'éditeur, puis vérifier les nouveaux fichiers
   avec `git status`.

Le placement exact n'est pas électriquement significatif. Il doit seulement
laisser assez de place autour des blocs pour les futurs ports et connexions.

## Ajouter correctement des signaux entre feuilles

Une liaison hiérarchique possède deux représentations qui doivent porter le
même nom :

1. un **label hiérarchique** dans la feuille enfant ;
2. un **port de feuille** sur le bloc correspondant dans la feuille parente.

Le workflow conseillé est :

1. créer et câbler le label hiérarchique dans la feuille enfant ;
2. revenir sur la racine ;
3. sélectionner le bloc et utiliser **Importer les ports de feuille** ;
4. placer les ports importés sur le côté logique du bloc ;
5. vérifier leur direction électrique : entrée, sortie, bidirectionnelle ou
   passive ;
6. lancer l'ERC.

Il vaut mieux importer les ports depuis les labels existants que créer les deux
côtés indépendamment. Cela réduit les erreurs de nom et de direction.

## Dépannage

### Une modification Konnect n'apparaît pas dans KiCad

L'éditeur de schéma avait probablement encore une ancienne copie en mémoire.
Fermer la fenêtre sans écraser le fichier externe, puis rouvrir le schéma. Si
KiCad propose de recharger le fichier modifié sur disque, choisir le rechargement.

### Une feuille ouvre une page vide ou le mauvais fichier

Ouvrir les propriétés du bloc sur la racine et contrôler le champ du fichier.
Le nom affiché et le nom de fichier sont deux propriétés différentes.

### Un port est absent ou signalé comme incohérent

Contrôler l'orthographe et la casse du label dans la feuille enfant. Revenir
ensuite sur le bloc parent et réutiliser l'import des ports de feuille.

### KiCad signale un fichier verrouillé

Vérifier d'abord qu'aucun éditeur KiCad n'utilise encore le projet. Fermer les
fenêtres restantes et redémarrer KiCad avant d'envisager qu'un fichier de verrou
soit réellement obsolète.

### Le projet ne s'ouvre plus après un changement

Ne pas tenter de réparer le S-expression à la main. Conserver les fichiers en
l'état, regarder `git status` et `git diff --stat`, puis comparer avec le dernier
commit fonctionnel. Une réparation doit passer par KiCad ou Konnect.

### L'ERC est propre mais le schéma est faux

L'ERC vérifie surtout les règles de connexion et les types de broches. Il ne
prouve ni les valeurs, ni le brochage physique, ni la tenue en tension, courant
ou température. Ces points doivent être vérifiés contre les références exactes
des fabricants.

## Workflow pour les prochaines étapes

Pour chaque sous-circuit :

1. figer ses exigences et les mesures nécessaires ;
2. confirmer la référence et le boîtier exacts de chaque composant ;
3. chercher d'abord les symboles et empreintes existants dans KiCad ;
4. vérifier chaque numéro de broche contre la fiche technique ;
5. placer les composants sur la feuille fonctionnelle ;
6. ajouter alimentation, découplage, protections et points de test ;
7. câbler puis annoter les références ;
8. relire les connexions, rechercher les éléments orphelins et les courts-circuits
   logiques ;
9. inspecter un rendu de chaque feuille ;
10. exécuter l'ERC sur le schéma racine ;
11. synchroniser le PCB seulement lorsque le schéma est cohérent.

Pour l'INA228AIDGSR et le shunt, le brochage et l'empreinte ne seront acceptés
qu'après constitution d'une table reliant chaque broche de la fiche technique,
chaque broche du symbole et chaque pastille de l'empreinte.

## Valider un composant avant de le placer

La validation de l'INA228 sert de modèle pour les prochains composants :

1. relever la référence commandable complète, y compris le suffixe de boîtier ;
2. télécharger la fiche constructeur et la conserver dans
   `electrical/components/<composant>/` ;
3. noter la référence du document, sa révision, les pages consultées, la date
   de récupération et son hash SHA-256 ;
4. relever toutes les broches dans la vue précisée par le constructeur
   (`top view` ou `bottom view`) ;
5. rechercher le symbole et l'empreinte dans les bibliothèques KiCad ;
6. relire leurs données avec Konnect et construire un tableau reliant chaque
   broche physique à une pin du symbole et à un pad de l'empreinte ;
7. réconcilier séparément le nombre de broches, de pins et de pads, en
   expliquant tout pad exposé ou mécanique ;
8. comparer dimensions, pas, orientation et repère de pin 1 au dessin du
   fabricant ;
9. placer le symbole dans un schéma jetable, le relire et inspecter un rendu ;
10. inspecter aussi un rendu de l'empreinte avant de l'utiliser dans le vrai
    projet ;
11. conserver la conclusion dans le `README.md` du composant ;
12. seulement ensuite, placer le composant dans la feuille fonctionnelle.

Pour l'INA228, la fiche de preuve se trouve dans
[`../components/ina228/README.md`](../components/ina228/README.md). Elle
documente notamment l'écart de 0,10 mm entre l'entraxe des rangées de pads de
l'empreinte KiCad et l'exemple de land pattern TI, ainsi que la raison pour
laquelle l'empreinte standard reste retenue.

Après cette validation, `U1` a d'abord été placé seul, relu et rendu. Le circuit
complet a ensuite été ajouté : filtre Kelvin 10 Ω / 100 nF, découplages,
rappels I²C et ALERT, cavaliers d'adresse et points de test. Les valeurs et les
choix sont consignés dans
[`../components/ina228/README.md`](../components/ina228/README.md).

## Création des modules DFR0868 et DFR0520

La bibliothèque standard ne décrit pas exactement les deux cartes de
développement utilisées. La procédure automatisée a donc reproduit le travail
qui serait fait dans les éditeurs de symboles et d'empreintes :

1. télécharger le schéma, le dessin mécanique et la fiche du circuit central ;
2. archiver les fichiers et calculer leur SHA-256 ;
3. établir un tableau de brochage depuis la vue explicitement indiquée par le
   fabricant ;
4. créer les symboles dans `libraries/symbols/BikeGenerator.kicad_sym` ;
5. créer l'empreinte traversante du DFR0520 dans
   `libraries/footprints/BikeGenerator.pretty/` ;
6. enregistrer les deux bibliothèques dans les tables locales du projet ;
7. relire le symbole, ses pins, l'empreinte, ses pads et ses dimensions ;
8. placer les éléments dans une vraie feuille puis relire leurs coordonnées ;
9. inspecter un rendu avant de les accepter.

L'empreinte du DFR0520 est validée à partir du dessin de dimensions officiel.
Le symbole DFR0868 est validé, mais son empreinte reste absente tant que la
version exacte et les dimensions de la carte physique ne sont pas vérifiées.

Dans KiCad, l'équivalent manuel se fait avec **Éditeur de symboles > Fichier >
Nouvelle bibliothèque de projet**, puis **Éditeur d'empreintes > Nouvelle
bibliothèque de projet**. Après toute modification de bibliothèque, utiliser
**Outils > Mettre à jour les symboles depuis la bibliothèque** dans le schéma.

## Construction d'une feuille fonctionnelle

Pour `MCU`, `CC_CONTROL` et `CONNECTORS`, les opérations ont suivi le même
ordre :

1. placer le symbole ou le module ;
2. relire les coordonnées exactes de toutes ses pins ;
3. ajouter les composants auxiliaires ;
4. câbler uniquement entre des coordonnées relues, pas estimées ;
5. ajouter un marqueur de non-connexion sur chaque pin volontairement libre ;
6. ajouter les labels hiérarchiques avec leur direction électrique ;
7. vérifier les pins non connectées, les fils flottants et les chevauchements ;
8. importer les ports dans la feuille racine ;
9. relier les blocs et exécuter l'ERC depuis le schéma racine.

Point de dépannage important : importer un port directement sur le bon côté du
bloc. Déplacer ensuite un port du côté droit au côté gauche peut conserver son
orientation interne. Visuellement le port semble bien placé, mais l'ERC voit
alors le fil comme non connecté. La réparation consiste à supprimer seulement
ce port, le réimporter sur le bon côté, puis le repositionner verticalement.

## État vérifié du contrôleur logique

- correspondance labels enfants / ports parents : aucune incohérence ;
- pins de composants non traitées : aucune ;
- extrémités de fils flottantes : aucune ;
- courts-circuits logiques détectés : aucun ;
- ERC global : trois erreurs, toutes attendues sur les entrées de mesure de la
  feuille de puissance encore vide ;
- `MCU`, `CC_CONTROL` et `CONNECTORS` : connectés entre eux par I²C, SPI, UART
  et `INA_ALERT` ;
- alimentation logique : USB-C du DFR0868, 3,3 V distribué aux modules, masse
  déclarée comme source par un `PWR_FLAG` pour l'ERC.

Il ne faut pas ajouter d'exclusions ERC pour les trois erreurs restantes. Elles
constituent un rappel visible que le schéma n'est pas encore prêt pour une
fabrication tant que `POWER_PATH` n'est pas conçu.
