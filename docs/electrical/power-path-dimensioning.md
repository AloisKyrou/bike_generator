# Dimensionnement du chemin de puissance et mesures restantes

Statut : **propositions de travail, aucune référence de puissance n'est encore
figée pour fabrication**.

Ce document consolide les observations du prototype, les valeurs du firmware et
une première sélection de composants pour une cible de 400 W.

## 1. Ce que les mesures actuelles permettent déjà d'affirmer

- tension observée en charge : environ **36 V** ;
- transitoires observés au démarrage avec un pédalage rapide : **plus de 40 V** ;
- puissance système visée : **400 W** ;
- le buck principal est réglé manuellement à 24 V en sortie ;
- le buck principal semble actuellement limiter la puissance absorbée et donc le
  couple résistant ressenti.

La « tension à vide » n'est pas la tension moteur arrêté. Elle se mesure en
faisant tourner la génératrice avec sa sortie électrique déconnectée : aucun
courant utile ne circule, mais la tension peut être plus élevée qu'en charge.
Moteur arrêté, la tension attendue est effectivement proche de 0 V.

Les valeurs 36 V et 40 V+ ne suffisent donc pas encore à fixer la TVS ou la
tension de service de tous les composants. Il faut relever la tension redressée
à vide à plusieurs cadences, puis son maximum transitoire avec un oscilloscope ou
une fonction peak-hold adaptée.

## 2. Courant de dimensionnement

Le courant dépend à la fois de la charge, du buck, de la vitesse, de la tension
de la génératrice et de sa résistance interne. Le buck peut être le facteur
limitant dans le montage actuel, mais il ne rend pas le courant intrinsèquement
indépendant de la génératrice.

À 400 W, avant pertes :

| Tension considérée | Courant correspondant |
|---:|---:|
| 36 V, entrée observée en charge | 11,1 A |
| 30 V | 13,3 A |
| 24 V, sortie du buck | 16,7 A |
| 20 V | 20,0 A |

La base actuelle de **20 A continus / 25 A transitoires** est donc une enveloppe
prudente couvrant un fonctionnement à tension plus basse. Elle n'est pas encore
une valeur mesurée. Si les essais démontrent que 400 W ne sont atteints qu'au-
dessus de 30 V, elle pourra être réduite.

## 3. Caractérisation de la commande CC du buck

### Pourquoi trois bornes alors que deux fils sont visibles

Un potentiomètre possède trois bornes : les deux extrémités de sa piste, `A` et
`B`, et le curseur `W`. Employé comme rhéostat, il n'utilise que deux connexions :
`W+A` ou `W+B`. Les deux fils visibles sur le prototype sont donc cohérents avec
un usage en rhéostat.

Le connecteur `J_CC_CTRL` conserve provisoirement les trois signaux afin de ne
pas figer une hypothèse et de faciliter les mesures. La version finale pourra ne
peupler que les deux bornes réellement nécessaires.

### Ce que le firmware nous apprend

Dans `config.h`, la calibration empirique actuelle indique :

- valeur de curseur 30 pour environ 120 W ;
- pente utilisée : 0,25 unité de curseur par watt ;
- cible « plat » 80 W, soit une valeur initiale calculée de 20 ;
- cible maximale 200 W, soit une limite logicielle calculée de 50.

Le code suppose donc qu'une valeur de curseur croissante augmente la puissance
absorbée. C'est une information fonctionnelle utile, mais elle ne démontre ni la
tension présente sur les bornes analogiques, ni le courant du curseur, ni leur
référence de masse. Ces grandeurs conditionnent la sécurité électrique du
potentiomètre numérique et doivent être mesurées. Pour le PCB V1, les limites à
appliquer sont celles du `MCP4151-104E/SN` alimenté en 3,3 V.

L'anomalie logicielle de démarrage identifiée sur le prototype est corrigée :
`s_currentDigipotValue` démarre désormais à `-1`, ce qui force
`Resistance_Init()` à transmettre `POT_INITIAL`. Cette correction ne remplace
pas l'état sûr matériel encore à définir pour une perte d'alimentation ou un
microcontrôleur bloqué.

### Mesures minimales, buck hors tension

1. Identifier par continuité les deux bornes du potentiomètre mécanique reliées
   aux deux fils du DFR0520.
2. Mesurer la résistance entre ces deux fils aux positions CC minimale et
   maximale.
3. Vérifier la continuité entre chaque fil et `VIN-`, `OUT-` et la masse ESP32.

### Mesures minimales, buck alimenté

Commencer avec une alimentation limitée en courant et sans charge de forte
puissance :

1. mesurer chaque fil CC par rapport à `VIN-` ;
2. mesurer chaque fil CC par rapport à `OUT-` ;
3. mesurer la tension entre les deux fils ;
4. répéter aux réglages CC minimum et maximum ;
5. noter quelle variation de résistance ou de code augmente le courant demandé.

« Identifier le sens augmentant la charge » signifie donc déterminer si une
augmentation de la valeur numérique, ou une augmentation de la résistance entre
les deux fils, augmente le courant imposé par le buck. Le firmware suggère déjà
« valeur numérique croissante = charge croissante », mais un test physique doit
le confirmer.

`VIN-` est un choix plausible de masse commune si le buck est non isolé et si le
circuit de commande y est référencé. Le fait que le prototype fonctionne est un
indice, pas une preuve suffisante. La continuité hors tension puis la différence
de potentiel sous charge doivent confirmer cette référence.

## 4. Propositions de composants de puissance

### Shunt quatre bornes

Choix V1 : **Bourns CSS4J-4026K-2L00F**, 2 mΩ, quatre terminaux, 1 %, 6 W à
70 °C, avec empreinte KiCad native compatible
`Resistor_SMD:R_Shunt_Isabellenhuette_BVR4026`.

| Courant | Chute de tension | Dissipation |
|---:|---:|---:|
| 20 A | 40 mV | 0,80 W |
| 25 A | 50 mV | 1,25 W |

La marge thermique est confortable. Pour couvrir 25 A et 50 mV, l'INA228 devra
utiliser sa plage ±163,84 mV plutôt que ±40,96 mV. L'empreinte exacte sera
La géométrie de l'empreinte native a été comparée au land pattern Bourns : pads
force et Kelvin, entraxes et encombrement cuivre concordent. Aucun footprint
personnalisé n'est nécessaire.

### Fusible principal

Le fusible principal reste **source-spécifique**, de calibre configurable au
plus égal à 20 A, avec une tension assignée d'au moins 125 V DC pour rester
compatible avec le plafond de bus V1 à 80 V. Sa courbe temps-courant, son pouvoir
de coupure et son porte-fusible seront choisis selon la génératrice et le
faisceau réels. Le précédent candidat LP JCASE 58 V n'est pas compatible avec
cette enveloppe générique.

### Fusible auxiliaire

Proposition initiale : **Littelfuse 0449001.MR**, série 449 NANO2 Slo-Blo, 1 A,
125 V AC/DC, monté en surface. Il protège la dérivation LM5164, pas le chemin
400 W. La temporisation évite de confondre la charge des condensateurs d'entrée
avec un défaut. Le calibre sera validé par la mesure d'appel du convertisseur
auxiliaire ; 1,5 A reste une variante si 1 A déclenche intempestivement.

### TVS

La V1 réserve une empreinte SMCJ optionnelle, **DNP par défaut**. Aucune TVS
parallèle standard ne peut à la fois rester garantie inactive jusqu'à 80 V et
garantir un clamp inférieur à la limite 85 V de l'INA228. La référence doit donc
être choisie pour chaque source après mesure de l'amplitude, de la durée, de
l'énergie et de l'impédance des transitoires.

La TVS ne traite que les impulsions brèves. Elle ne rend pas acceptable une
source durablement supérieure à 80 V, situation hors spécification pour
laquelle aucun surge-stopper n'est ajouté en V1. Si elle est peuplée, elle se
place après le fusible principal avec une boucle très courte vers le retour de
puissance.

### Connecteurs de puissance

Proposition documentée : **Anderson Powerpole PP15/45**, contacts PCB 45 A ou
contacts sertis adaptés au câble. La famille accepte des fils de 20 à 10 AWG et
le fabricant propose des contacts PCB verticaux et coudés. Elle est robuste et
modulaire, mais plus volumineuse et plus coûteuse qu'un connecteur de loisir.

Pour la première révision, la solution la plus sûre est de garder fusible et
liaisons 20 A dans un faisceau externe court, puis de faire entrer sur la carte
uniquement le chemin strictement nécessaire au shunt et aux mesures Kelvin.

### Câbles et cuivre

- faisceau court 20 A : **12 AWG (environ 3,3 mm²) minimum proposé** ;
- 10 AWG (environ 5,3 mm²) si le faisceau est plus long, groupé, chaud ou si une
  marge mécanique supplémentaire est souhaitée ;
- fusible toujours inférieur au courant admissible du câble et des connecteurs ;
- pour un chemin intégré : cuivre 2 oz, surfaces très larges et très courtes sur
  deux couches, vias de couture nombreux, shunt et connecteurs au bord de carte,
  calcul thermique IPC-2152 avec le stack-up réel du fabricant ;
- ne pas valider 20 A à partir d'une largeur de piste choisie « à l'œil ».

Une architecture hybride reste recommandée pour la V1 : logique, INA228 et
Kelvin sur le PCB ; chemin de puissance très court et clairement séparé, voire
sur un petit sous-ensemble dédié.

## 5. Batterie et connecteur JST-PH

La batterie choisie par l'utilisateur est une LiPo protégée **801350, 3,7 V,
500 mAh**. Le code 801350 suggère environ 8 × 13 × 50 mm, mais les dimensions et
le courant de charge autorisé doivent être confirmés sur la fiche du fabricant
ou par mesure de la cellule réelle.

Le connecteur retenu est :

- embase PCB : `S2B-PH-K-S(LF)(SN)` ;
- boîtier côté câble : `PHR-2` ;
- contacts à sertir : `SPH-002T-P0.5S`, pour fils compatibles AWG 30 à 24 ;
- prévoir des contacts de rechange ou acheter un faisceau préserti JST-PH 2,00
  mm dont la polarité aura été vérifiée au multimètre.

La nomenclature doit comprendre les deux côtés de la liaison : l'embase PCB, le
boîtier câble, deux contacts sertis, les fils et des pièces de rechange. « Mâle »
et « femelle » sont souvent employés de façon ambiguë dans les annonces ; les
références JST ci-dessus sont plus sûres.

Le Beetle annonce jusqu'à 400 mA de charge. Pour 500 mAh, cela représente 0,8 C,
ce qui paraît plausible mais doit être explicitement autorisé par la fiche de la
cellule. La présence d'un circuit de protection ne définit pas le courant de
charge normal admissible.

## 6. Dimensions, interrupteur et boîtier

Le module buck externe est donné, d'après l'image fournie, pour environ
**60 × 60 × 45 mm**. Cette dimension ne change pas le schéma électrique puisqu'il
reste externe au PCB, mais elle sert à :

- réserver son volume dans le boîtier ;
- garder une circulation d'air autour du dissipateur ;
- placer les passages de câbles sans rayon de courbure excessif ;
- conserver l'accès aux vis, potentiomètres et borniers ;
- éviter de placer l'antenne ESP32 contre le dissipateur ou une masse métallique.

L'image elle-même n'est pas encore présente comme fichier dans le dépôt. Sa
valeur dimensionnelle est enregistrée ici ; le fichier source pourra être ajouté
dès qu'il sera copié dans `electrical/components/buck-b0blg7tn1c/`.

`S1`, les connecteurs et les points de fixation ne bloquent pas la validation du
principe électrique. Ils bloquent en revanche le PCB final : le type de S1 fixe
son empreinte ou impose un connecteur vers un interrupteur de panneau ; les
connecteurs imposent leurs trous, leurs dégagements et leur position au bord ;
le boîtier impose le contour de carte et les trous de fixation. Ils peuvent donc
être reportés jusqu'à la phase de placement PCB, mais pas jusqu'après la
fabrication.

## 7. Décisions encore nécessaires avant routage

1. mesurer la tension redressée à vide à plusieurs cadences et le vrai pic de la
   première source, afin de vérifier qu'elle respecte l'enveloppe 80 V et de
   choisir sa TVS éventuelle ;
2. mesurer courant continu, courant d'appel et températures à 200, 300 et 400 W ;
3. caractériser les deux fils de commande CC comme décrit plus haut ;
4. confirmer la sérigraphie exacte du DFR0868 physique ;
5. obtenir la fiche ou mesurer le courant de charge de la batterie 801350 ;
6. décider si le fusible principal et les connecteurs de puissance restent dans
   le faisceau ou sont montés sur une carte de puissance dédiée ;
7. choisir le type physique de `S1` et le boîtier avant de figer le PCB.

## Sources fabricants

- [Bourns CSS4J-4026](https://www.bourns.com/docs/product-datasheets/css4j-4026.pdf)
- [Littelfuse Low Profile JCASE](https://www.littelfuse.com/~/media/files/littelfuse/technical%20resources/documents/product%20catalogs/lf_aftermarketcatalog_rev1_2015_lowres%20pdf.pdf)
- [Littelfuse série 449 NANO2 Slo-Blo](https://www.littelfuse.com/assetdocs/fuses-449-datasheet?assetguid=7aef6e93-9808-456e-9bee-fba54271285f)
- [Littelfuse SMCJ](https://www.littelfuse.com/assetdocs/tvs-diodes-smcj-datasheet?assetguid=37388813-0d6d-4329-969b-1aa8b7614ac1)
- [Anderson Powerpole PP15/45](https://www.andersonpower.com/content/dam/app/ecommerce/product-pdfs/PP1545/DS-PP1545.pdf)
- [JST série PH](https://www.jst-mfg.com/product/pdf/eng/ePH.pdf)
- [DFRobot DFR0868](https://wiki.dfrobot.com/dfr0868/)
