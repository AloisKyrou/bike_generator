# Hypothèses de conception et mesures du premier montage

Ce document sépare les **limites génériques de la carte**, utilisées pour
poursuivre la CAO, des **estimations du premier montage**, qui seront remplacées
par les mesures physiques. Une estimation n'est pas une spécification de la
génératrice.

## Enveloppe générique V1 déjà retenue

| Paramètre | Valeur de conception |
|---|---:|
| Bus protégé utilisable | 10 à 80 V DC |
| Démarrage auxiliaire estimé | 8,56 à 9,46 V, 9,0 V nominal |
| Plafond continu et transitoire toléré | 80 V |
| Courant du trajet principal | 20 A continu, 25 A bref |
| Alimentation logique | 5 V, 600 mA attendu, étage dimensionné jusqu'à 1 A |

La carte n'impose pas une puissance unique. Exemples idéalisés à 400 W :

| Tension bus | Courant correspondant |
|---:|---:|
| 10 V | 40 A, donc hors enveloppe 20 A |
| 20 V | 20 A, limite continue de la carte |
| 36 V | 11,1 A |
| 48 V | 8,3 A |
| 60 V | 6,7 A |
| 80 V | 5,0 A |

La carte couvre donc des sources différentes, mais leur puissance exploitable
reste limitée par la plus faible limite parmi la génératrice, le redresseur, la
carte 20 A, le buck principal et la charge.

## Estimations temporaires du premier montage

| Grandeur | Estimation de travail | Usage immédiat |
|---|---:|---|
| tension chargée | 36 V observés | point d'essai nominal |
| courant vers 350 W | 9,7 A | ordre de grandeur |
| courant vers 400 W | 11,1 A | dimensionnement du premier essai |
| tension à vide à cadence comparable | 45 à 60 V | estimation seulement |
| excursion rapide provisoire | 60 à 70 V | reste sous le plafond carte de 80 V |
| tension du réglage CC | probablement 0 à 1,25/2,5 V | hypothèse de compatibilité, pas autorisation de raccordement |
| courant du réglage CC | probablement quelques dizaines de µA | cohérent avec un potentiomètre de 100 kΩ |

La **tension à vide** signifie : génératrice entraînée, mais sortie électrique
déconnectée. Une génératrice immobile donne bien environ 0 V, mais ce n'est pas
la mesure à vide utile au dimensionnement.

Ces estimations permettent de conserver le schéma 10–80 V, le shunt 2 mΩ et le
LM5164 existants. Elles ne permettent pas de choisir une TVS universelle : la
TVS reste DNP par défaut et sera adaptée à la source après mesure de l'amplitude,
de la durée et de la répétition des pics.

## Mesures à réaliser sur la première génératrice

1. Tension DC au repos, puis à vide en pédalage lent, normal et rapide.
2. Tension chargée aux mêmes allures, avec la charge habituelle.
3. Courant chargé ; préférer une pince DC ou le shunt prévu. Ne pas placer un
   multimètre ordinaire en série sur un trajet proche de 10–20 A sans vérifier
   son calibre, son fusible et ses cordons.
4. Avec un oscilloscope et une sonde adaptés, maximum, durée et répétition des
   pics lors d'un démarrage rapide et d'une déconnexion de charge.

Ces valeurs qualifient la première source et son fusible/sa TVS ; elles ne
redéfinissent pas l'enveloppe générique 10–80 V de la carte.

## Mesures à réaliser sur le réglage CC du buck

Le raccordement direct du MCP4151 est autorisé seulement si les trois bornes du
potentiomètre du buck restent entre 0 et 3,3 V par rapport à `VIN-`, et si le
courant de borne reste largement inférieur à ±2,5 mA.

1. Buck hors tension : résistance entre chaque paire des trois broches du
   potentiomètre, aux positions minimum, milieu et maximum.
2. Buck alimenté sans pédalage puis sous charge : tension de chaque broche par
   rapport à `VIN-`, aux mêmes trois positions.
3. Identifier les deux broches réellement reprises par les deux fils actuels et
   déterminer si le montage utilise le potentiomètre en rhéostat.
4. Vérifier si `VIN-`, la masse logique du réglage CC et `GND` de la carte sont
   réellement communs.

L'hypothèse provisoire est un réglage bas potentiel, 0 à 2,5 V environ, avec un
courant de quelques dizaines de microampères. Si les mesures contredisent cette
hypothèse, `J_CC_CTRL` restera utile mais nécessitera une petite interface
adaptatrice ; le trajet de puissance et l'alimentation auxiliaire ne changent
pas.

## Contrôles mécaniques rapides du Beetle

Les cotes officielles suffisent pour la CAO. Avant fabrication, mesurer une fois
sur le module physique : 20,5 × 25,0 mm, rangées à 17,78 mm, pas de 2,54 mm,
trous proches de Ø0,90 mm et orientation USB-C/antenne. Faire aussi un essai à
blanc avec les broches mâles et sockets 1 × 8 retenus.
