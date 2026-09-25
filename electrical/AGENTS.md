# Instructions agents — partie électrique

Ce fichier s'applique à tout le dossier `electrical/`. Il complète les règles
générales du dépôt et doit être lu avant toute analyse ou modification du
schéma, du PCB, des bibliothèques KiCad, de la nomenclature ou de la
documentation matérielle.

## Principe général

Une solution qui fonctionne sur le prototype n'est pas automatiquement la
bonne solution pour le PCB intégré. Toujours distinguer :

- la reproduction fidèle du prototype existant ;
- une carte porte-module facile à assembler ;
- un PCB intégré destiné à devenir la version de référence.

Avant de conserver un module complet, comparer au minimum son circuit intégré
nu en termes de coût, encombrement, disponibilité, assemblage, documentation,
réparabilité et risque de conception.

## Rechercher avant de créer

Ne jamais créer immédiatement un symbole, une empreinte ou un modèle 3D
personnalisé. Appliquer cet ordre de recherche :

1. confirmer la référence fabricant exacte et le suffixe de boîtier ;
2. rechercher dans les bibliothèques KiCad installées ;
3. rechercher dans les ressources officielles du fabricant ;
4. rechercher chez les distributeurs et fournisseurs de modèles, notamment
   Mouser/SamacSys Component Search Engine, DigiKey, SnapMagic/SnapEDA et Ultra
   Librarian ;
5. comparer les modèles trouvés à la documentation fabricant ;
6. présenter les résultats et les incertitudes à l'utilisateur ;
7. demander une confirmation explicite avant de créer un modèle personnalisé.

Une mention comme « Request Free CAD Models », « Build or request » ou
« Download Library Loader » ne prouve pas qu'un modèle fini existe. Vérifier
s'il existe réellement un fichier téléchargeable, dans quel format, avec
quelle licence et pour quelle révision du composant. Ne pas installer un
chargeur de bibliothèque ou un outil externe sans l'accord de l'utilisateur.

Même téléchargé depuis un distributeur reconnu, un modèle tiers n'est jamais
accepté sans vérification. La fiche fabricant reste la source d'autorité.

## Autorisations obligatoires

Demander l'accord de l'utilisateur avant :

- de créer un symbole, une empreinte ou un modèle 3D personnalisé ;
- d'installer un outil, plugin ou chargeur de bibliothèque externe ;
- de remplacer un module du prototype par un circuit intégré nu, ou l'inverse,
  lorsque cela modifie l'architecture du produit ;
- de figer une dimension mécanique absente de la documentation ;
- de sélectionner définitivement un composant encore incertain ;
- de générer des fichiers de fabrication considérés comme prêts à commander ;
- de lancer une commande ou un envoi vers un fabricant.

Une hypothèse peut être modélisée pour étude uniquement si elle est clairement
marquée `PROVISOIRE` ou `À CONFIRMER`. Elle ne doit jamais être présentée comme
une valeur issue du fabricant.

## Validation d'un symbole et d'une empreinte

Pour chaque composant sensible au brochage ou au boîtier :

1. archiver la documentation dans `electrical/components/<composant>/` ;
2. relever la référence du document, sa révision, les pages utilisées, l'URL
   officielle et le SHA-256 du fichier ;
3. noter explicitement la vue du dessin : dessus, dessous, côté composant,
   côté soudure ou vue d'accouplement ;
4. réconcilier le nombre de broches physiques, de pins du symbole et de pads
   de l'empreinte ;
5. construire une correspondance complète : broche fabricant → fonction → pin
   du symbole → pad de l'empreinte ;
6. vérifier chaque dimension mécanique : corps, pas, entraxe, trous, slots,
   taille des pads, repère de pin 1 et orientation ;
7. vérifier séparément `F.Fab`, `F.SilkS` et `F.CrtYd` ;
8. relire le résultat enregistré avec les outils KiCad/Konnect ;
9. inspecter un rendu ou une instance jetable ;
10. lorsque la documentation est incomplète, effectuer une mesure physique ou
    une impression à l'échelle 1:1 avant acceptation.

Un modèle 3D est une aide visuelle, pas une preuve du brochage ou des
dimensions cuivre. Un ERC ou un DRC propre ne prouve pas non plus que le modèle
correspond au composant physique.

## Grilles et coordonnées

Choisir la grille d'après les dimensions réelles, pas par habitude :

- connecteurs au pas de 2,54 mm : grille de 2,54 mm ou 1,27 mm
  (`100 mil` ou `50 mil`) ;
- boîtiers métriques : grille métrique adaptée au dessin fabricant ;
- contours et détails : grille plus fine seulement lorsque nécessaire.

Les centres de pads doivent tomber exactement sur les coordonnées calculées.
Les contours peuvent utiliser une autre grille que les pads. Ne jamais
resynchroniser ou déplacer aveuglément un élément correct après un changement
de grille : cela peut introduire un décalage discret.

Pour une cote non explicitement fournie, distinguer clairement :

- valeur documentée ;
- valeur calculée à partir de cotes documentées ;
- valeur déduite visuellement ;
- valeur mesurée sur le composant physique ;
- hypothèse de conception.

## Manipulation des fichiers KiCad

Ne jamais modifier directement les fichiers suivants avec un éditeur de texte
ou un script générique :

- `*.kicad_sch` ;
- `*.kicad_pcb` ;
- `*.kicad_pro` ;
- `*.kicad_sym` ;
- `*.kicad_mod` ;
- `sym-lib-table` et `fp-lib-table`.

Toutes les mutations passent par KiCad ou Konnect. Après chaque modification :

1. relire les objets enregistrés ;
2. vérifier les connexions et les coordonnées ;
3. inspecter les erreurs ERC/DRC sans les masquer ;
4. distinguer les erreurs attendues des erreurs réelles ;
5. conserver une trace des décisions dans la documentation.

Voir aussi [`kicad/WORKFLOW.md`](./kicad/WORKFLOW.md).

## Règles électriques de sécurité

- Une limite de sécurité ne doit pas dépendre uniquement du firmware ou d'un
  potentiomètre numérique.
- Conserver une limitation matérielle sûre pour la tension, le courant et la
  température lorsque cela est applicable.
- Mesurer les tensions et courants présents sur une interface inconnue avant
  de la relier à un microcontrôleur ou un potentiomètre numérique.
- Vérifier la masse commune et le domaine de tension avant toute connexion.
- Ne jamais supposer qu'un module intermédiaire apporte une isolation, une
  adaptation de niveau ou une protection sans preuve dans son schéma.
- Le chemin Kelvin du shunt doit rester séparé du trajet de fort courant.

## Décision actuelle concernant le buck

Pour la V1, l'architecture privilégiée est :

- consigne de tension `CV` réglée à une valeur fixe et sûre pour l'équipement
  connecté en aval ;
- consigne de courant `CC` pilotée dynamiquement pour régler la puissance
  prélevée et donc la résistance au pédalage ;
- INA228 utilisé pour mesurer tension, courant et puissance et permettre une
  boucle de régulation ;
- aucune modification dynamique de `CV` sans cas d'usage explicite et analyse
  de stabilité ;
- aucune connexion au potentiomètre du buck avant mesure de ses trois broches
  dans plusieurs positions et états de fonctionnement.

Une commande numérique de `CV` peut être étudiée pour plusieurs appareils de
sortie, un véritable profil de charge ou un algorithme MPPT. Elle ne doit pas
être utilisée par défaut pour régler la résistance au pédalage.

## Décision actuelle concernant l'alimentation autonome

- prélever l'énergie auxiliaire sur `BUS_PROTECTED`, après le fusible et le
  shunt, avant le buck principal ;
- ne pas dépendre de la sortie 24 V du buck principal pour démarrer la logique ;
- utiliser le LM5164 comme **candidat**, pas encore comme référence commandable
  définitive, pour convertir une entrée fonctionnelle de 10 à 60 V en 5 V ;
- viser au moins 600 mA continus et utiliser la capacité 1 A du candidat pour
  la marge de recharge et les transitoires de charge ;
- utiliser la batterie LiPo 1S protégée `801350`, 500 mAh, dont la fiche doit
  encore autoriser explicitement le courant de charge réel du TP4057 ;
- prévoir un interrupteur mécanique de batterie et `JP_GEN_5V` pour isoler la
  branche générateur lors de l'usage USB ;
- protéger localement la dérivation auxiliaire : le fusible principal 20 A ne
  suffit pas à protéger ses pistes et composants de faible courant ;
- ne jamais sélectionner une source en court-circuitant l'USB ou une
  alimentation à la masse ;
- vérifier l'absence de retour de courant avant tout essai générateur + USB ;
- faire dépendre l'autorisation CC de rails stables, d'une valeur de repli sûre
  et d'une condition matérielle, pas seulement du démarrage du firmware.

Les valeurs du circuit d'application LM5164 de la fiche TI ne sont pas des
valeurs projet par défaut. Recalculer inductance, fréquence, retour 5 V,
condensateurs et `EN/UVLO`, puis valider avec l'outil et les équations TI.

## DFR0520 et MCP42100

Le module DFR0520 a été modélisé initialement pour reproduire le prototype.
Son empreinte `BikeGenerator:DFR0520_Dual_Digital_Pot` est personnalisée et a
été créée dans ce dépôt, pas importée d'une bibliothèque standard.

État de validation actuel de cette empreinte :

- dimensions du corps 20 × 18 mm : documentées ;
- entraxe des deux rangées 12,70 mm : documenté ;
- pas horizontal 2,54 mm : fortement probable mais non coté explicitement dans
  le PDF DFRobot, à confirmer physiquement ;
- perçage 1,0 mm et diamètre de pad 1,8 mm : choix de conception à confirmer
  avec les broches physiques ;
- `F.Fab` : dimensions extérieures correctes mais contour simplifié ;
- `F.CrtYd` actuelle : incorrecte et trop petite ;
- `F.SilkS` actuelle : simplifiée et non représentative du contour complet ;
- empreinte interdite pour une fabrication tant que ces points ne sont pas
  corrigés et revérifiés.

Pour un PCB intégré, préférer a priori le composant nu si l'analyse le confirme.
KiCad 10 fournit déjà :

```text
Potentiometer_Digital:MCP42100
Package_SO:SOIC-14_3.9x8.7mm_P1.27mm
```

Vérifier le suffixe de boîtier Microchip avant association définitive. Si un
seul canal est nécessaire, comparer également le MCP41010. Le second canal du
MCP42100 ne justifie son maintien que si une utilisation future crédible est
documentée.

## État actuel des autres blocs

- `DFR0868 Beetle ESP32-C3` : symbole documenté, mais aucune empreinte ne doit
  être créée avant confirmation de la version et mesures de la carte physique.
- `POWER_PATH` : ne pas finaliser avant choix du shunt, mesure des limites de
  tension/courant, stratégie de masse, protections et connecteurs.
- Les erreurs ERC intentionnelles doivent rester visibles et documentées ; ne
  pas ajouter d'exclusions uniquement pour obtenir un rapport vert.

## Documentation et Git

- Les fiches fabricant et preuves techniques vont dans `components/`.
- Les mesures brutes vont dans `measurements/` et ne sont jamais écrasées.
- La nomenclature de travail va dans `bom/` et doit indiquer ce qui bloque une
  commande.
- Les exports générés vont dans `kicad/exports/` et restent hors Git sauf
  décision explicite.
- Préserver toutes les modifications utilisateur déjà présentes dans le dépôt.
- Ne pas inclure dans un commit les fichiers non liés à la tâche.
- Avant commit : relire `git status`, contrôler les fichiers indexés et signaler
  clairement les changements utilisateur laissés intacts.
