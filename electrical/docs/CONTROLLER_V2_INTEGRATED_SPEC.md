# Contrôleur V2 intégré — spécification d'architecture

État : **spécification de travail**, aucune référence de puissance ni aucun
land pattern n'est encore figé.

La V2 ne doit pas être une simple réduction du PCB V1. Elle intègre le buck
principal, sécurise l'USB et formalise les états d'alimentation. La V1 reste le
prototype porte-module destiné à qualifier la génératrice, les mesures et les
limites thermiques.

## Enveloppe électrique cible

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
        +-----------------------> buck CC/CV intégré -> sortie utilisateur
        |
        +-> alimentation auxiliaire HV -> SYSTEM_5V

USB-C -> protection ESD + power-path ----^----> chargeur LiPo 1S
                                                |
batterie protégée -> interrupteur bidirectionnel+-> domaine logique
```

Le buck principal sera conçu autour d'un contrôleur et de MOSFETs externes,
pas autour d'un petit convertisseur monolithique. Ses limites de tension,
courant et température doivent exister matériellement. L'ESP peut ajuster les
consignes mais ne doit jamais constituer l'unique protection.

À basse tension et fort courant, les pertes du pont de diodes peuvent devenir
dominantes. La V2 comparera explicitement :

- pont triphasé passif avec transfert thermique vers le boîtier ;
- redressement actif à MOSFET si les essais V1 montrent des pertes excessives.

Une TVS ne doit pas être considérée comme une charge de décharge permanente.
Si une génératrice compatible peut maintenir une tension supérieure à la
limite lorsque la charge est retirée, il faudra ajouter une coupure contrôlée
et/ou une résistance de décharge dimensionnée en énergie.

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
| V1 | interrupteur mécanique `S1` | connexion ou isolation manuelle de la batterie ; aucune temporisation |
| V2 | bouton momentané `WAKE/STATUS` + interrupteur électronique bidirectionnel | réveil d'environ 10 min, maintien par génératrice/USB et extinction automatique |

Sur la V2, la batterie reste normalement branchée physiquement au connecteur.
La coupure de veille est réalisée électroniquement par des MOSFETs dos à dos.
Un moyen de déconnexion physique pour stockage, maintenance ou défaut batterie
doit néanmoins rester prévu : connecteur batterie accessible, languette de
transport ou sectionneur de maintenance selon le boîtier final.

Sur la V1, `S1` reste un moyen utile d'isolation complète. Il ne doit pas être
supprimé uniquement parce que J6 permet de débrancher la batterie : une embase
JST n'est pas l'organe de commande quotidien et les manipulations répétées
fatiguent le câble et le connecteur. Remplacer `S1` par un cavalier à deux
broches serait électriquement possible pour un prototype, mais n'améliorerait
ni l'usage ni la sécurité et imposerait une nouvelle modification PCB.

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
                                                                    +-> ESP32
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
