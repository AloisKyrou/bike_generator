# Méthodologies possibles pour démarrer le PCB

Plusieurs méthodes sont raisonnables. Elles diffèrent surtout par la quantité de
mesures effectuées avant le premier schéma et par le risque accepté sur la
première fabrication.

## Méthode A — recopier et fiabiliser le prototype

1. Relever fil par fil la breadboard.
2. Dessiner le schéma « tel que construit ».
3. Remplacer ACS712 et pont diviseur par INA228 + shunt.
4. Ajouter connecteurs, protections et points de test.
5. Router puis fabriquer.

**Atout :** passage très direct du montage qui fonctionne vers une carte.

**Limite :** les erreurs et hypothèses implicites du prototype risquent d'être
reproduites. L'interface CC à deux fils doit impérativement être comprise avant
le routage.

## Méthode B — partir des exigences et des fiches techniques

1. Fixer tensions, courants, température, environnement et état sûr.
2. Dessiner l'architecture fonctionnelle cible.
3. Concevoir chaque sous-circuit depuis la fiche de son fabricant.
4. Définir les interfaces avec le buck et les modules existants.
5. Vérifier le résultat sur le prototype avant fabrication.

**Atout :** schéma plus propre, justifiable et reproductible.

**Limite :** risque de concevoir autour de valeurs théoriques qui ne décrivent
pas parfaitement le matériel déjà possédé.

## Méthode C — tester d'abord le INA228 sur une carte d'évaluation

1. Acheter ou assembler un petit module INA228.
2. Le connecter temporairement avant le buck avec un shunt adapté.
3. Valider les lectures I2C et comparer avec le multimètre.
4. Copier le sous-circuit validé dans le PCB définitif.

**Atout :** réduit fortement le risque lié au capteur et permet d'écrire le
pilote avant la réception du PCB.

**Limite :** coût et étape supplémentaires ; les performances du module ne
garantissent pas celles du routage final.

## Méthode D — carte porte-modules minimale

1. Conserver le Beetle sur connecteurs et intégrer le MCP4151 simple canal.
2. Intégrer INA228, shunt, alimentation, protections et connectique.
3. Garder le buck, le redresseur et les charges externes.
4. Prévoir beaucoup de points de test et d'options non montées.

**Atout :** excellente première carte : utile, réparable et d'une complexité
raisonnable.

**Limite :** moins compacte qu'une intégration complète et dépend encore des
modules du commerce.

## Méthode recommandée — hybride par jalons

La meilleure approche pour ce projet combine B, C et D :

### Jalon 1 — caractériser

- effectuer la campagne de mesures ;
- figer tension maximale, courant cible et stratégie de masse ;
- caractériser précisément le réglage CC.

**Sortie :** tableau de mesures complet et aucune interface électrique inconnue.

### Jalon 2 — schéma fonctionnel KiCad

- créer les feuilles `POWER_PATH`, `INA228_SENSE`, `MCU`, `CC_CONTROL` et
  `CONNECTORS` ; le bloc auxiliaire LM5164 reste dans `POWER_PATH` pour garder
  l'origine de son énergie et les protections de bus sur une même feuille ;
- représenter le buck et le redresseur comme blocs externes connectés ;
- inscrire sur le schéma les limites de tension et courant de chaque liaison.

**Sortie :** schéma lisible indépendamment du PCB et nomenclature préliminaire.

### Jalon 3 — preuve de mesure

- tester un INA228 sur module d'évaluation si disponible, ou réaliser d'abord le
  sous-circuit sur une petite carte d'essai ;
- écrire un pilote minimal : identité, tension, courant, puissance et alerte ;
- comparer avec un multimètre et une charge connue.

**Sortie :** valeurs cohérentes et constante de shunt validée.

### Jalon 4 — schéma électrique complet

- intégrer l'alimentation auxiliaire LM5164, la batterie contrôleur,
  `JP_GEN_5V`, les protections, INA228, Beetle, MCP4151 et connecteurs ;
- définir l'état sûr au reset ;
- exécuter l'ERC et justifier explicitement chaque exception.

**Sortie :** revue de schéma validée avant tout routage.

### Jalon 5 — placement et routage

- placer d'abord shunt, connecteurs de puissance et INA228 ;
- router la puissance puis les paires Kelvin ;
- séparer les retours bruyants du buck de la mesure ;
- placer découplages et protections au plus près ;
- terminer par SPI, I2C, voyants et écran optionnel.

**Sortie :** DRC propre, analyse thermique et contrôle des largeurs de piste.

### Jalon 6 — fabrication et bring-up

1. vérifier les courts-circuits sans composants de puissance connectés ;
2. alimenter la logique avec une alimentation limitée en courant ;
3. vérifier 3,3 V et communication I2C ;
4. injecter 10 V sur l'entrée auxiliaire, vérifier 5 V, `PGOOD` et l'absence de
   retour de courant ;
5. valider la bascule entre alimentation générateur et batterie ;
6. tester avec une charge limitée ;
7. intégrer progressivement redresseur, buck, charges puis stockage externe.

**Sortie :** rapport de bring-up et liste des corrections pour V1.1.

## Pourquoi cette méthode convient ici

Elle permet d'apprendre une vraie conception électronique — schéma, composants
CMS, mesure analogique, puissance, implantation et firmware — sans faire du
convertisseur 400 W lui-même le premier exercice. Les modules qui fonctionnent
déjà restent remplaçables, tandis que la partie nouvelle et structurante,
l'INA228 et son shunt, est réellement intégrée au PCB.
