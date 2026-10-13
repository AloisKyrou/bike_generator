# Contrôleur V2 intégré — spécification d'architecture

## Active revision: 70 V class, 8 October 2026

The latest authorized scope is the
[70 V-class input/output revision](VOLTAGE_RANGE_REWORK_2026-10-08.md), superseding
the older 55 V target and the historical circuit proposals below. Preserve the
implemented MCP4251 independent manual/app selector, both trimmers, GPIO20,
BQ-only telemetry and Beetle-style USB/optional 1S supply. External-converter
support is dropped; no AUX or internal dump is restored. The achievable working
range must follow the guarded divider, calibration and complete power-stage
qualification, not the headline IC rating. Approximately 400 W remains an
output ambition, not a proven autonomous clamp or continuous rating.

The revision is now saved: 146 components / 125 nets / eight sheets. See
[the schematic report](SCHEMATIC_VOLTAGE70_2026-10-08.md) for the actual selected
parts, guarded range, validation evidence and remaining physical gates. J2 is
removed; nominal app CV reach is about 67.66 V with reference trim, but 67.2 V
is not guaranteed on every board. No PCB or firmware changes are included.

## Historical direction: GPIO externe configurable

Rework important autorise : voir les
[decisions consolidees](CONTROL_REWORK_DECISIONS_2026-10-08.md).
L'utilisateur exige maintenant des reglages tension manuelle/application
INDEPENDANTS, deux trimmers et des fins de course sans depassement des limites
carte. Les notes anterieures de base manuelle partagee sont depassees.

Dernier ajustement du repli : potentiometre mecanique a vis demande, regle
initialement a 12 V, modifiable pour usages autonomes hors velo. Plage bornee,
defaut de curseur et calibration CV numerique a verifier ; pas encore dessine.
Le courant BQ n'est pas uniquement I2C : resistances ICHG et ILIM_HIZ pour
plafonds sortie/entree, limite active la plus basse avec les registres. Courants
de repli definitifs non choisis ; ne pas reutiliser le second canal MCP.

Preference utilisateur ulterieure : conversion autonome au repli fixe ~12 V
avec ESP eteint, branche digipot deconnectee et CE maintenu actif. A qualifier,
pas encore cable. Sans GPIO enable BQ dedie, le budget ci-dessous passe de
4 a 5 GPIO externes. Convertisseur desactive ne signifie pas bypass entree
vers sortie ; le gain vise est autonomie/simplicite, pas une preuve de securite
superieure. Courants par defaut, recepteur compatible, etats I2C conserves et
transitions restent a verifier dans le
[contrat de commande](explanations/BQ25756_CONTROL_CONTRACT.md).

Un seul connecteur GPIO externe regroupe action, Hall, PWM externe, READY et
toutes les broches reellement libres. Roles configurables ; les usages concrets
seront des exemples/tutoriels ulterieurs, pas des fonctions imposees. Ne pas
coupler READY configurable et autorisation interne BQ. GPIO21 reutilisable.
Simplification a verifier : /SHDN MCP fixe inactif, GPIO20 pour le commutateur
analogique protege seul ; INA_ALERT remplace cote ESP par lecture I2C des
mesures/flags. Budget provisoire : 4 GPIO externes apres commande analogique,
enable BQ et LED de statut, aucun autre GPIO libre. Brochage, etats au boot et
protections restent a verifier. Aucun changement de schema dans cette note.
Voir les guides [MCU](explanations/per_schematic/04_MCU_MODULE.md),
[connecteurs](explanations/per_schematic/03_CONNECTORS.md),
[digipot](explanations/per_schematic/05_CC_CONTROL.md) et
[mesure](explanations/per_schematic/06_INPUT_SENSING.md).

## Direction du 8 octobre 2026 : BQ25756 et double digipot conserve

Conserver BQ25756 comme choix de conception V2 et conserver le MCP42100 double
canal. Affectation prevue : canal 1 pour CV interne, canal 0 libre sur J7 pour
une interface externe qualifiee. Ne pas utiliser le canal libre pour une commande
CV grossiere/fine sans nouvel accord. Le courant du BQ se regle par I2C.
Cette decision de conception n'est pas une validation physique du convertisseur.
Le raccordement analogique protege reste a concevoir ; les connexions actuelles
de J7/J9 ne changent pas dans cette etude. La commande SHDN et le reset sont
communs aux deux canaux. Voir le [guide digipot](explanations/per_schematic/05_CC_CONTROL.md)
et les [calculs de faisabilite](BQ25756_IMPLEMENTATION_NOTES.md).
Cette direction remplace les propositions anterieures de suppression du digipot
redondant ou d'utilisation des deux canaux pour CV.

## Decision du 8 octobre 2026 : alimentation Beetle

L'utilisateur demande de NE PAS utiliser TPS63031 et de reprendre le circuit
Beetle TP4057 + diode/PMOS + RT9080 si les exigences sont satisfaites. Cette
instruction remplace son accord intermediaire pour TPS63031 et la proposition
BQ24074/TPS63031. Conserver module ESP32, USB natif, batterie 1S optionnelle,
aucun AUX et aucun dump interne. Favoriser boitiers a pattes accessibles et
passifs 0805 lorsque les contraintes electriques le permettent. Documenter les
ecarts au circuit source et les MPN inconnus, puis verifier courant USB total,
temperature/charge cellule et pertes/dropout LDO. Voir la
[decision detaillee](BEETLE_POWER_DECISION_2026-10-08.md).

## Clarification du 8 octobre 2026 : premier prototype complet

Le premier PCB physique doit viser toutes les fonctions V2 retenues : consignes
tension/courant/puissance pilotees par ESP, USB programmation/debug/serie et
protections independantes. Le schema fixe 12 V / 1 A est un travail intermediaire,
pas un premier prototype reduit approuve. La mise sous tension progressive se
fera sur la carte complete ; elle ne dispense pas de terminer les circuits avant
la revue de fabrication. La validation finale necessitera mesures et firmware,
sans autoriser leur developpement ni une commande dans cette tache documentaire.

Voir le [guide par feuille](explanations/README.md) et les
[criteres de fin V2](explanations/IMPLEMENTATION_NOTES.md).
BQ25756 reste selectionne, mais sa commande I2C ne supprime pas le circuit de
selection CV large plage. BQ25758 est compare, pas substitue. Retirer le digipot
redondant de la variante integree lorsque la solution de commande est definie.
Le choix du regulateur logique est desormais celui de la derniere decision
ci-dessus, pas une autorisation de remettre TPS63031.

## Decision active du 7 octobre 2026 : USB et batterie logique optionnelle

L'utilisateur abandonne l'alimentation logique 5 V issue de la generatrice et
le mux USB/AUX. Il confirme **USB comme seule entree externe de la logique**,
avec une **batterie lithium 1S protegee optionnelle, rechargee depuis USB**.
Viser le fonctionnement USB sans batterie ainsi que le fonctionnement batterie
sans cable USB. La generatrice reste la source d'energie du convertisseur de
puissance, pas de la logique. Pedaler ne recharge plus la petite batterie.

Le projet precedent est archive avec verification SHA-256 sous
`electrical/archive/v2-abandoned-auxiliary-5v-2026-10-07/`. Continuer V2 dans son
dossier actif. Les references ci-dessous a l'auxiliaire autonome et au mux
USB/AUX sont historiques et ne s'appliquent plus a cette iteration.

Le BQ25756 et les plafonds de travail 55 V restent valides comme choix, pas
comme qualification. L'utilisateur autorise explicitement la creation et la
verification du symbole BQ25756 via Konnect. Le module ESP32 reste en place
pendant la comparaison avec Beetle. Aucun travail PCB/firmware/fabrication n'est
autorise implicitement. Le convertisseur principal doit rester en etat sur
lorsque la logique USB/batterie est absente ; cette protection reste a concevoir.

Le 3V3 buck-boost, le chargeur de secours et la gestion USB sont reevalues selon
cout, courant reel, temperature, autonomie et simplicite. Aucune simplification
ne doit masquer une limite USB ou une fonction de protection manquante.

## Decision active du 6 octobre 2026 : BQ25756 et 55 V

L'utilisateur valide **BQ25756** pour la conversion principale integree et
**55 V** comme plafond de travail. Pour cette iteration, appliquer ce plafond
a l'entree DC redressee et a la sortie normale ; ne pas reprendre les anciennes
hypotheses 80 V entree / 60 V sortie des comparaisons ci-dessous.
Il s'agit d'un objectif de conception, pas d'une qualification du schema actuel.

- Selectionner les composants les moins couteux qui satisfont effectivement les
  contraintes, avec approvisionnement large, documentation et modeles verifies.
- Tenir une [BOM globale vivante](../bom/README.md), avec distinction entre
  composants dessines, candidats et provisions pour les fonctions manquantes.
- Une seule sortie recepteur. Les recepteurs multiples et MPPT partages restent
  de la recherche hors schema, BOM de base et firmware actuels.
- Conserver boost, variantes AC/DC et convertisseur integre/externe qualifie,
  auxiliaire autonome, USB prioritaire et petite batterie de secours.
- Aucun dump interne, meme non monte ; seulement l'interface GPIO externe.
- 15 A entree / 10 A sortie est une **hypothese de dimensionnement a verifier**,
  pas une valeur validee. Le plafond historique 400 W concerne l'entree du
  convertisseur, pas une puissance continue garantie ni la puissance mecanique.
- Une batterie pouvant presenter plus de 55 V reste non qualifiee, meme si
  l'utilisateur ne demande qu'une charge partielle a 55 V. Sa tension apparait
  au connecteur aussi lorsque la conversion est arretee.
- La SMCJ70A heritee, les composants V1 et un reglage logiciel a 55 V ne prouvent
  pas la protection du nouveau systeme. Revoir surtension, retour batterie,
  deconnexion materielle et comportement generatrice a vide.

Les passages historiques ci-dessous restent utiles pour la justification, mais
ne remettent pas en cause cette selection. Les MOSFETs, magnetiques, protections,
refroidissement et circuit de selection CV restent a dimensionner/verifier.

État : **spécification de travail**, aucune référence de puissance ni aucun
land pattern n'est encore figé.

Dernier périmètre demandé : récupération de génératrices variées et de batteries
de VAE, avec étude du vélo rechargeant sa propre batterie par pédalage sur support.
Le [dossier de compatibilité](compatibility/README.md) compare les cas et recommande
de réévaluer un buck-boost jusqu'à environ 60 V de sortie pour ce périmètre élargi.
Ce n'est pas une sélection de composants ni une modification du circuit existant.

Avancement du 6 octobre : voir le
[rapport LV2](SCHEMATIC_LV2_PROGRESS_2026-10-06.md).
Le module MCU, le mux USB/AUX, le chargeur 1S, le regulateur 3V3 et l'USB-C/ESD
sont dessines. Le reveil/arret, la protection USB contre les defauts HV et le
convertisseur principal restent incomplets. Voir aussi les
[calculs et limites BQ25756](BQ25756_IMPLEMENTATION_NOTES.md). La carte
n'est pas prete a construire ou a alimenter depuis la generatrice.

## Décisions du 6 octobre 2026 : variantes et charge externe

Décision utilisateur : **aucune dump load interne, même en option non montée**.
Ne prévoir ni résistance de dissipation, ni étage de commutation de dump, ni
empreintes réservées à cet usage sur la carte principale. Une commande logique
de charge externe appartient à l'interface GPIO générique protégée ; la puissance,
le driver, les protections thermiques et le refroidissement restent externes.
Les protections de la chaîne de conversion restent nécessaires : ce choix ne
supprime ni la protection surtension ni la qualification à vide de la génératrice.

Direction demandée : V2 est un premier prototype de plateforme adaptable, avec
possibilité de ne pas monter le convertisseur principal et d'utiliser un buck,
boost ou buck-boost externe qualifié. Le détail des connecteurs, composants,
liaisons de puissance et variantes de montage reste **PROVISOIRE**.

### Accessibilité fablab et variantes documentées

Précision utilisateur du 6 octobre 2026 : le dessin de référence prévoit le
périmètre fonctionnel le plus complet retenu, mais les constructeurs DIY doivent
pouvoir réduire le coût en ne montant que les blocs utiles à leur installation.
« Complet » signifie dans l'enveloppe qualifiée du projet, pas compatible avec
toute génératrice ou batterie ; cela ne réintroduit aucune dump load interne.
Prévoir les frontières de blocs dès la conception, pas une liste de composants
à retirer après routage sans analyse des dépendances.

Deux axes de variante sont indépendants : type d'entrée et conversion principale.
La matrice suivante est une intention de conception, pas quatre montages validés :

| Entrée qualifiée | Conversion principale | Blocs de puissance propres au montage |
|---|---|---|
| AC/triphasée | Intégrée | Pont redresseur + étage principal intégré |
| DC de polarité connue | Intégrée | Entrée DC protégée + étage principal intégré ; pont omis |
| AC/triphasée | Externe | Pont redresseur + interface de conversion externe ; étage intégré omis |
| DC de polarité connue | Externe | Entrée DC protégée + interface externe ; pont et étage intégré omis |

Exemple DIY demandé : une génératrice fournissant déjà du DC peut utiliser une
entrée DC dédiée et ne pas monter le pont de redressement, ses connexions AC et
les éléments thermiques exclusivement dédiés au pont. Cela évite l'achat de ces
pièces et les pertes de redressement correspondantes, sans chiffrage avant BOM.
Ne pas supprimer le refroidissement partagé encore nécessaire au convertisseur.

Le chemin DC doit rejoindre les protections et mesures communes par une liaison
de puissance définie au schéma, pas par un court-circuit improvisé des pads du pont.
Conserver fusible, protection contre inversion de polarité/retour batterie,
surtension, limites de courant et protections thermiques applicables. Le sens de
rotation peut inverser la polarité d'une génératrice DC : qualifier les deux sens
ou empêcher mécaniquement/électriquement le sens incompatible. Un moteur BLDC
dont on récupère les phases fournit de l'AC en génératrice malgré son nom ; ne pas
l'assimiler au profil DC sans redresseur externe identifié.

Chaque variante publiée devra fournir :

- identifiant de montage et révision, BOM exacte avec références montées/DNP ;
- liaisons et connecteurs requis, dépendances et éléments de sécurité non omissibles ;
- coût comparé du système complet, y compris modules externes et refroidissement ;
- limites propres, profil logiciel correspondant et fonctions indisponibles ;
- procédure d'assemblage, contrôles avant alimentation, calibration et essais
  de défaut adaptés à ce montage.

Le profil logiciel doit correspondre à l'identifiant physique du montage ; aucun
changement dans l'application ne restaure un bloc absent. Les variantes DIY
documentées ne deviennent pas toutes des références commerciales. L'offre montée
doit rester limitée à quelques configurations testées ; une version montée au
périmètre complet pourra être proposée plus tard selon l'intérêt et la validation.
Le nombre et le contenu des premières versions vendues ne sont pas encore figés.

### Deux variantes de conversion, un même contrôleur

| Variante envisagée | Étage principal | Fonctions communes conservées |
|---|---|---|
| `INTERNAL` | Convertisseur intégré monté, famille encore à choisir | ESP32, auxiliaire génératrice, USB protégé, mesures et protections |
| `EXTERNAL` | Étage intégré non monté ; convertisseur externe qualifié | Même logique et mêmes limites de sécurité communes |

Le bloc omis comprend le contrôleur de puissance, ses MOSFETs, inductance et
composants locaux dédiés. La liste exacte DNP doit être revue : ne pas retirer
un condensateur, une alimentation ou une protection partagé avec le contrôleur.
L'auxiliaire HV reste alimenté en amont du convertisseur principal ; la logique
doit démarrer et rester utilisable sans l'étage principal monté ou activé.

Organisation fonctionnelle proposée, pas un schéma câblable :

```text
Génératrice -> redressement/protection -> mesure entrée -> bus protégé
                                                           |       |
                                                           |       +-> AUX -> logique
                                                           |
                               UN chemin de conversion assemblé
                                intégré OU départ/retour externe
                                                           |
                              mesure sortie + protections récepteur
                                                           |
                                                        récepteur
```

Les mesures d'entrée et de sortie doivent couvrir les deux variantes. La mesure
d'entrée décrit la charge génératrice ; celle de sortie vérifie ce que reçoit
effectivement la batterie ou la station. Leurs références et placements restent
à concevoir, sans supposer qu'une télémétrie de module suffit à la sécurité.

La sélection de chemin doit être physique, documentée et vérifiable à
l'assemblage, sans mise en parallèle des sorties ni réinjection dans un étage
inactif. Ne pas utiliser un petit cavalier de signal comme liaison de puissance.
La configuration logicielle décrit le montage ; elle ne remplace pas cette
sélection. Pas de commutation interne/externe à chaud prévue pour le prototype.
Le retour externe doit rester soumis aux limites et protections du récepteur.

### Profil de convertisseur et adaptation logicielle

Le premier démarrage sélectionnera un profil de module qualifié, pas seulement
une étiquette « buck » ou une puissance publicitaire. Le profil doit décrire :

- variante physique, modèle et révision, topologie buck/boost/buck-boost ;
- plages Vin/Vout, limites Iin/Iout, puissance continue, durée des pointes,
  refroidissement, UVLO et marge de régulation ;
- commandes réellement disponibles : aucune, enable seul, CC/CV analogiques,
  potentiomètre adapté, ou protocole numérique documenté ;
- échelles, polarités, calibration, états au reset et en perte de communication,
  limites de vitesse de commande et télémétrie disponible ;
- passage direct éventuel, blocage inverse et déconnexion réelle à l'arrêt ;
- usages autorisés : alimentation de station ou profils batterie explicitement
  qualifiés, jamais charge lithium générique déduite de la seule tension.

Le logiciel limite les fonctions à l'intersection des capacités génératrice,
carte, convertisseur et récepteur. Un buck ne gagne pas le boost par configuration ;
un boost seul n'assure pas la régulation lorsque Vin dépasse la tension voulue.
Un module manuel peut servir en mode mesure/supervision, avec protections
matérielles validées, mais sans promettre une résistance de pédalage programmable.
Une commande CC qualifiée permet d'étudier cette régulation ; sa stabilité et
sa réponse doivent être mesurées, et non déduites de la présence d'un potentiomètre.

Prévoir une interface de commande séparée des conducteurs de puissance. Un
adaptateur propre au module peut assurer échelle analogique, masse ou isolation,
polarité enable et état sûr. Ne jamais relier les bornes d'un potentiomètre
inconnu directement à l'ESP32 ou au MCP42100. Le profil ne peut pas remplacer
cette adaptation électrique, ni augmenter les plafonds matériels de la carte.
Un profil absent, incompatible ou non validé interdit l'activation de puissance.

Attention : désactiver un boost peut laisser un chemin entrée-sortie par diode.
L'arrêt sûr doit donc être qualifié avec une vraie déconnexion si nécessaire,
y compris batterie présente et logique éteinte. Voir la
[note TI sur l'arrêt des boosts](https://www.ti.com/lit/an/slvafo4/slvafo4.pdf).

### Charge externe via GPIO uniquement

Prévoir une commande PWM logique et un retour ready/fault dans l'interface
générique, avec état matériel inactif au reset ou si la logique n'est pas alimentée.
Broches, niveaux, protection et connecteur restent à figer avec le budget GPIO ;
aucune broche ESP32 n'est encore affectée définitivement.

Sans accessoire externe, la résistance de pédalage est limitée par l'acceptation
réelle du récepteur, qui peut être inférieure au maximum configuré ou nulle.
Signaler cette saturation ; ne pas forcer la charge et ne pas promettre de freinage
constant lorsque la batterie est pleine ou déconnectée.

Avec accessoire qualifié, augmenter progressivement la consigne de puissance
externe, en priorité après la charge utile et selon la puissance disponible.
Une rampe PWM seule ne garantit pas le maintien du courant batterie : il faut
mesurer et coordonner les deux charges. L'accessoire gère courant crête,
température, défauts et compatibilité de tension ; il doit éviter de vider la
batterie à l'arrêt. Il ne constitue pas la protection surtension obligatoire
de la carte, qui doit rester sûre sans accessoire ni application mobile.

Avant validation, tester au minimum : mauvais profil/montage, conversion externe
absente, perte de commande, démarrage sur USB seul, récepteur déconnecté ou plein,
retour batterie, génératrice à vide et dépassement de tension. Un couple qui ne
peut pas rester sûr sans dump interne est exclu du profil de base, pas accepté
sur la seule promesse d'une coupure logicielle. Les parties restant reliées à la
génératrice doivent supporter sa tension à vide même après une coupure aval.

Ces décisions remplacent les anciennes hypothèses de dump interne et d'étage
principal nécessairement monté. Elles n'autorisent ni fabrication ni modification
du firmware avant le jalon déjà prévu de disponibilité de la carte physique.

## Démarrage V2 du 5 octobre 2026

Le projet de départ est désormais
[`bike-generator-controller-v2.kicad_pro`](../kicad/bike-generator-controller-v2/bike-generator-controller-v2.kicad_pro),
copié depuis la V1 et renommé par Konnect. Le circuit reste celui de la V1 :
aucun buck principal intégré ni aucune nouvelle protection n'est encore réalisé.

L'[étude des récepteurs](OUTPUT_RECEIVER_STUDY.md) précise les premières cibles :
BLUETTI AC50S, batteries de camping-car 12/24 V et extension possible aux systèmes
48 V. Proposition **PROVISOIRE** : étudier une sortie réglable 10-60 V, jusqu'à
20 A sous limites de puissance et thermiques, puis comparer avec une réalisation
10-32 V plus limitée. Les 400 W restent une limite d'entrée, avant les pertes.
Le profil AC50S envisagé est 24 V avec au plus 120 W, à qualifier sur banc.

Confirmation utilisateur du 5 octobre 2026 : le montage actuel fonctionne avec
environ 36 V issus de la génératrice scooter, abaissés à 24 V par le buck pour
l'AC50S. Le boost n'est pas nécessaire à ce montage. Le buck reste la base de
travail ; un buck-boost concerne une éventuelle extension à d'autres couples
génératrice/récepteur, pas une fonction manquante du montage actuel. Cette
confirmation ne fige ni les composants ni le périmètre élargi de la V2.
Les profils batterie et alimentation d'une station avec chargeur interne sont
distincts. Les mesures V1 et l'accord sur le périmètre final précèdent le
dimensionnement et la modification du schéma.

La V2 ne doit pas être une simple réduction du PCB V1. Elle prévoit une variante
à convertisseur principal intégré et une variante externe, sécurise l'USB et
formalise les états d'alimentation. La V1 reste le
prototype porte-module destiné à qualifier la génératrice, les mesures et les
limites thermiques.

## Enveloppe électrique cible

### Ordre de conception du premier prototype

Travail de schéma demandé le 6 octobre 2026. Conserver V1 intacte et avancer par
blocs vérifiables, sans assimiler une étape de schéma à une carte prête à alimenter.

| Bloc V1 | Réutilisation V2 / travail nécessaire |
|---|---|
| J1 DC, J8 triphasé et pont D2 | Conserver le principe ; documenter pont monté/omis et qualifier l'entrée DC protégée |
| Fusibles, shunt Kelvin et INA238 | Réutiliser le travail de mesure ; revoir la marge surtension et ajouter la mesure de sortie nécessaire |
| LM5164 auxiliaire | Conserver la branche en amont du convertisseur ; requalifier démarrage, charge et transitoires |
| MCP42100 et commandes externes | Conserver comme interface candidate qualifiée, pas comme adaptateur universel |
| Hall/action et I2C | Conserver les fonctions ; vérifier straps de boot et protection des câbles externes |
| Beetle et interverrouillage USB manuel | Remplacer par module ESP32, support reset/boot, régulation 3,3 V et power-path USB dédié |
| Batterie logique | Ne pas réutiliser implicitement le chargeur du Beetle après son retrait ; nouveau bloc à concevoir |

Le premier incrément peut utiliser une entrée de laboratoire 3,3 V régulée,
explicitement marquée provisoire, tant que la régulation et le power-path ne sont
pas implémentés. Ce montage n'est alors ni autonome sur génératrice ni alimenté
par USB ; ne pas relier AUX_5V, VBUS ou une LiPo directement au module.

Références de travail : [étude des convertisseurs](POWER_CONVERTER_REFERENCE_STUDY.md),
TI BQ25756EVM pour la comparaison économique et ADI DC2456A/LTC3779 pour la marge
haute tension. BQ25756 nécessite encore une solution de consigne CV large plage
et un périmètre d'entrée compatible ; aucune de ces références n'est figée.

### Cibles encore à arbitrer

Les trois maxima ne sont pas simultanés :

```text
VRECTIFIED <= 80 VDC
IIN        <= 20 A
PIN        <= 400 W
```

À chaque point de fonctionnement :

```text
IIN <= min(20 A, 400 W / VRECTIFIED)
```

Exemples : 20 A à 20 V, 11,1 A à 36 V, 8,3 A à 48 V et 5 A à 80 V.

Avant de dimensionner le buck, il reste obligatoire de définir :

- si 80 V désigne la tension DC après redressement, la tension AC efficace
  entre phases, une tension à vide ou un transitoire ;
- la puissance continue et sa durée, ainsi que les profils 10/60 secondes ;
- si la limite 20 A s'applique à l'entrée, à la sortie ou aux deux ;
- la plage CC/CV de sortie et la tension minimale de génératrice utilisable ;
- la température ambiante et le refroidissement permis par le boîtier.

La première hypothèse de conception est **80 VDC maximum après redressement**,
et non 80 VAC RMS. Les interrupteurs de puissance devront conserver une marge
sur les transitoires ; une classe 150 V est le point de départ à étudier, pas
une référence déjà validée.

## Chaîne de puissance proposée

```text
J8 triphasé / J1 DC
        |
redressement + fusible + protection surtension
        |
mesure courant/tension
        +-> convertisseur intégré OU externe -> mesures/protections sortie
        |
        +-> alimentation auxiliaire HV -> SYSTEM_5V

USB-C -> protection ESD + power-path ----^----> chargeur LiPo 1S
                                                |
batterie protégée -> interrupteur bidirectionnel+-> domaine logique
```

Dans la variante intégrée, le convertisseur principal sera conçu autour d'un contrôleur et de MOSFETs externes,
pas autour d'un petit convertisseur monolithique. Ses limites de tension,
courant et température doivent exister matériellement. L'ESP peut ajuster les
consignes mais ne doit jamais constituer l'unique protection.

À basse tension et fort courant, les pertes du pont de diodes peuvent devenir
dominantes. La V2 comparera explicitement :

- pont triphasé passif avec transfert thermique vers le boîtier ;
- redressement actif à MOSFET si les essais V1 montrent des pertes excessives.

Une TVS ne doit pas être considérée comme une charge de décharge permanente.
Une génératrice qui dépasse les limites à vide exige une protection/coupure
matérielle qualifiée, avec tous les éléments amont dimensionnés pour cette
situation, ou doit être exclue. Aucune résistance de dump interne n'est prévue ;
un accessoire externe facultatif ne peut pas être requis pour la sécurité de base.

## États d'alimentation et bouton

La V2 conserve le comportement décidé :

| État | Déclenchement | Comportement |
|---|---|---|
| `OFF` | aucune source | batterie isolée, consommation de quelques µA |
| `CONFIG` | appui bref | logique alimentée par batterie pendant environ 10 min |
| `GENERATOR` | génératrice présente | démarrage automatique, maintien actif et recharge |
| `USB_SERVICE` | USB présent | maintien actif, programmation et recharge |
| `GRACE` | disparition génératrice/USB | maintien 30 à 120 s, sauvegarde puis arrêt |
| `FAULT` | surtension, surcourant ou surchauffe | état matériel sûr et indication visible |

La présence génératrice force l'état actif ; il ne s'agit donc pas d'un vrai
arrêt de la chaîne de puissance pendant le pédalage. Le bouton est un bouton
`WAKE/STATUS`, pas un sectionneur 80 V.

Architecture de commande envisagée :

- contrôleur micropuissance de type LTC2955 ou fonction équivalente ;
- bouton-poussoir momentané ;
- connexion batterie bidirectionnelle par MOSFETs dos à dos ;
- `AUX_PGOOD` et `USB_PRESENT` comme causes de maintien ;
- commande `KILL` par le microcontrôleur après temporisation ;
- arrêt forcé matériel par appui long ou watchdog, même si le firmware bloque.

Le contrôleur de bouton ne remplace pas le chargeur. Lorsque la batterie est
connectée et que `SYSTEM_5V` vient de la génératrice ou de l'USB, le chargeur
LiPo réalise la recharge.

### Frontière explicite entre V1 et V2

La gestion par bouton-poussoir appartient à la V2 et ne doit pas être ajoutée
à la V1 en fin de routage.

| Révision | Commande batterie | Comportement |
|---|---|---|
| V1 | cavalier amovible `JP4` | connexion ou isolation manuelle de la batterie ; aucune temporisation |
| V2 | bouton momentané `WAKE/STATUS` + interrupteur électronique bidirectionnel | réveil d'environ 10 min, maintien par génératrice/USB et extinction automatique |

Sur la V2, la batterie reste normalement branchée physiquement au connecteur.
La coupure de veille est réalisée électroniquement par des MOSFETs dos à dos.
Un moyen de déconnexion physique pour stockage, maintenance ou défaut batterie
doit néanmoins rester prévu : connecteur batterie accessible, languette de
transport ou sectionneur de maintenance selon le boîtier final.

Sur la V1, l'isolation complète est finalement confiée à `JP4`, un cavalier à
deux broches placé entre `BAT_RAW` et `BAT_CTRL`. Ce choix réduit fortement le
coût du prototype et évite d'utiliser J6 comme commande répétitive. Il ne doit
pas être interprété comme l'interface utilisateur définitive : la V2 remplace
`JP4` par le bouton momentané et la coupure électronique décrits ci-dessus.

## ESP32 et antenne

La préférence V2 est d'intégrer un **module radio certifié**, par exemple une
variante active de l'`ESP32-C3-MINI-1`, et non le silicium ESP32-C3 nu.

Cette option évite de redessiner le quartz, le réseau RF et l'adaptation
d'antenne. L'intégration reste raisonnable à condition de respecter exactement
les recommandations Espressif : module au bord du PCB, zone d'antenne sans
cuivre, piste, plan ni composant sur toutes les couches, et éloignement du
nœud de commutation, de l'inductance et des conducteurs 20 A.

Deux variantes mécaniques restent ouvertes :

- `ESP32-C3-MINI-1` à antenne PCB, si le bord de carte et le boîtier plastique
  permettent une zone RF dégagée ;
- `ESP32-C3-MINI-1U` à connecteur d'antenne externe si le boîtier est métallique
  ou si la carte ne permet pas un bon dégagement.

Le document fabricant à utiliser pour le placement, le land pattern et la zone
RF est la fiche Espressif `ESP32-C3-MINI-1 & ESP32-C3-MINI-1U`, notamment les
sections 10 et 11. Un module à antenne intégrée n'est donc pas particulièrement
« chiant », mais son bord de carte et son keepout deviennent des contraintes
mécaniques non négociables.

## USB sécurisé

La V2 n'utilisera pas la liaison interne non contrôlée VBUS/VIN du Beetle.
Elle recevra son propre connecteur USB-C, accessible depuis l'extérieur du
boîtier et idéalement soudé directement au bord du PCB principal.

Les données et l'alimentation suivent deux chemins distincts :

```text
USB-C D+ / D-
      |
protection ESD faible capacité
      |
USB natif de l'ESP32-C3

USB-C VBUS -> protection + limitation + blocage inverse --+
                                                          +-> power-mux -> SYSTEM_5V
AUX_5V venant du buck auxiliaire génératrice -------------+
                                                                    |
                                                                    +-> régulation 3,3 V -> ESP32
                                                                    +-> chargeur LiPo
```

Le connecteur comprendra :

- résistances CC conformes au rôle périphérique ;
- ESD sur USB D+/D- et VBUS ;
- limitation d'appel de courant si nécessaire ;
- power-path empêchant tout retour de `SYSTEM_5V` vers le PC ;
- détection `USB_PRESENT` ;
- recharge LiPo autorisée depuis USB ;
- USB natif de l'ESP32-C3 pour programmation et diagnostic.

`VBUS_USB`, `AUX_5V` et `SYSTEM_5V` resteront trois nets distincts. Leur
jonction ne sera réalisée qu'à l'intérieur d'un power-mux ou d'une combinaison
d'interrupteurs avec blocage du courant inverse. Une simple piste commune ou
deux diodes non vérifiées ne sont pas considérées comme une solution complète.

Lorsque USB et génératrice sont présents simultanément, le comportement de
référence est :

- priorité à l'USB pour alimenter la logique pendant la programmation et le
  diagnostic ;
- isolement de `AUX_5V` afin qu'aucun courant ne reparte vers le port du PC ;
- maintien de la détection génératrice et du fonctionnement de la chaîne de
  puissance principale ;
- batterie connectée et rechargeable depuis la source sélectionnée ;
- transition sans reset entre sources, dans la limite de la réserve d'énergie
  prévue sur `SYSTEM_5V`.

L'ESP32-C3 dispose d'un contrôleur USB Serial/JTAG natif. Pour les variantes
actuelles, USB D- et D+ sont normalement portés par GPIO18 et GPIO19 ; ce
brochage devra être relu dans la fiche de la référence exacte avant création du
schéma et du footprint. Le routage devra être court, symétrique, traité comme
paire différentielle et éloigné du buck, de son nœud SW et du trajet 20 A.

La solution mécanique préférée est, par ordre décroissant :

1. USB-C directement au bord du PCB, aligné avec une ouverture du boîtier ;
2. petite carte USB déportée reliée par une interconnexion interne prévue pour
   USB, si le boîtier impose une autre position ;
3. câble interne uniquement en dernier recours, avec blindage, masse et
   intégrité du signal validés.

Un connecteur USB supplémentaire autour d'un Beetle resterait possible, mais
il conserverait deux cartes, deux chaînes d'alimentation et la liaison interne
du module à contourner. Pour la V2 intégrée, le module ESP32-C3 et un USB-C
conçu sur notre PCB constituent l'option de référence.

## Buck CC/CV intégré

Le buck V2 doit :

- respecter l'enveloppe 80 V / 20 A / 400 W ;
- fournir une sortie CC/CV dont la plage reste à définir ;
- démarrer dans un état passif sûr avant le boot du microcontrôleur ;
- posséder des seuils matériels de surtension, surcourant et surchauffe ;
- rester sûr si le bus numérique, le potentiomètre ou le firmware tombe en
  panne ;
- mesurer courant et tension sans placer un composant 85 V à seulement 5 V de
  sa limite ;
- publier une zone de fonctionnement sûre en fonction de Vin, Vout, Iout,
  température et durée.

Les essais V1 serviront à figer la plage de sortie, les transitoires réels, le
profil thermique et l'intérêt éventuel d'un redressement actif.

## Jalons V2

1. Mesurer sur V1 les tensions à vide/en charge et les transitoires.
2. Mesurer les pertes et températures du pont, du fusible et du shunt.
3. Figer Vin/Vout/Iin/Iout, puissance continue et profils temporels.
4. Choisir l'architecture de redressement et de protection surtension.
5. Choisir le contrôleur buck et simuler les pires cas.
6. Concevoir le power-path USB/génératrice/batterie et le soft-power.
7. Placer le module ESP32 au bord de la carte et valider le boîtier/antenne.
8. Réaliser une carte de puissance et une carte logique de validation avant de
   fusionner, si le risque du premier prototype intégré est trop élevé.
