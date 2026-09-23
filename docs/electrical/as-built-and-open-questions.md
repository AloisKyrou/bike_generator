# État actuel et questions ouvertes

## Architecture documentée du prototype

```text
Pédalage
  -> moteur de trottinette utilisé comme génératrice triphasée
  -> pont redresseur triphasé
  -> convertisseur buck CV/CC
  -> ACS712 et bus continu régulé
       +-> BLUETTI AC50S
       +-> lampes halogènes de dissipation

ESP32-C3
  +-> ADC courant : ACS712
  +-> ADC tension : pont diviseur
  +-> SPI : DFR0520
              -> réglage CC du buck
  +-> BLE FTMS : applications connectées
```

La documentation actuelle place l'ACS712 après le buck, avant les charges. Le
PCB V1 déplacera la mesure principale avant le buck afin de mesurer la puissance
électrique produite et absorbée par le convertisseur.

## Identification à partir des photos

| Élément | Identification | Confiance | Commentaire |
|---|---|---:|---|
| Carte de contrôle | DFRobot Beetle ESP32-C3 DFR0868, probablement V2.0 | forte | Forme, USB-C, module blindé et boutons concordants ; vérifier la sérigraphie au dos |
| Potentiomètre numérique | DFR0520, MCP42100, deux canaux de 100 kΩ | confirmée | Module et sérigraphie visibles |
| Capteur bleu | module ACS712 | confirmée | La variante 5/20/30 A n'est pas lisible sur les photos |
| Convertisseur | buck CV/CC générique vendu comme 400 W, 10,5–60 V vers 0–45 V | probable | La référence Amazon ne fournit pas un schéma électrique exploitable |
| Résistances sur breadboard | probablement le pont diviseur de tension | probable | Les valeurs ne doivent pas être déduites des couleurs sur ces photos |

Références communiquées :

- [Buck Amazon, ASIN B0BLG7TN1C](https://www.amazon.fr/dp/B0BLG7TN1C)
- [DFR0520 chez Gotronic](https://www.gotronic.fr/art-double-potentiometre-digital-dfr0520-27852.htm)
- [Beetle ESP32-C3 DFR0868](https://www.dfrobot.com/product-2566.html)

## Conclusions tirées du montage

### ACS712

L'ACS712 n'est pas une simple résistance shunt amplifiée. Le courant traverse un
conducteur cuivre interne de faible résistance et un capteur à effet Hall mesure
le champ magnétique associé. Cette architecture isole le conducteur de puissance
de la sortie analogique.

Le composant ACS712 classique est spécifié avec une alimentation de 5 V et une
sortie centrée autour de VCC/2. Le dépôt décrit actuellement une alimentation à
3,3 V et un zéro proche de 1,65 V : cette configuration doit être vérifiée sur le
module réel avant de continuer à la présenter comme valide.

Le PCB V1 remplace cette chaîne par un shunt et un INA228. L'ACS712 reste la
description du prototype existant, pas celle de la nouvelle carte.

### Potentiomètre numérique et commande CC

Les photos et la description indiquent deux fils allant du DFR0520 au réglage du
buck. Cela évoque un usage en rhéostat, entre le curseur et une extrémité, ou une
mise en parallèle du potentiomètre mécanique. Le tutoriel existant décrit au
contraire un remplacement à trois fils A/W/B.

Cette divergence est bloquante pour le schéma. Les bornes analogiques du
MCP42100 doivent rester entre GND et VCC et leur courant doit rester très faible.
Il faut relever les deux connexions exactes et leurs tensions avant de figer
l'interface.

### Breadboard et puissance

Les gros fils rouges semblent faire passer le courant dans le module ACS712 sans
utiliser les rails de puissance de la breadboard. C'est préférable, mais le
montage reste provisoire : vibrations, fils non retenus, soudures exposées,
bruit analogique et absence de détrompage.

Le PCB de commande ne doit pas faire transiter arbitrairement tout le courant de
puissance dans de petites pistes. Le shunt et ses connexions nécessiteront une
zone dédiée, de larges surfaces cuivre, des connexions Kelvin et une analyse
thermique.

## Explication du changement de résistance ressenti

La génératrice produit une tension liée à sa vitesse et un couple résistant lié
au courant qui lui est demandé. En augmentant la charge électrique, on augmente
donc le freinage ressenti.

Lorsque la limite CC du buck est atteinte, la puissance acceptée cesse de croître
proportionnellement à la vitesse. À puissance approximativement constante :

```text
I_entree ~= P_limitee / (rendement * V_entree)
```

Si la vitesse et la tension augmentent encore, le courant d'entrée peut diminuer.
Le couple résistant cesse alors d'augmenter et peut sembler « lâcher ». Une
consigne plus haute déplace ce point vers un effort supérieur. Les protections
du buck, le comportement d'entrée de la BLUETTI et l'échauffement des lampes
peuvent rendre la transition plus brutale.

## Inconnues bloquantes

1. Référence exacte et version de la Beetle ESP32-C3.
2. Variante exacte du module ACS712, pour documenter correctement l'ancien montage.
3. Valeurs réellement montées dans le pont diviseur.
4. Continuité entre négatif redressé, IN-, OUT- et masse de contrôle.
5. Tension maximale à vide après redressement, à la cadence maximale plausible.
6. Courant continu maximal réellement visé : 10 A, 15 A ou autre.
7. Fonction des potentiomètres du buck et identification certaine du réglage CC.
8. Bornes du DFR0520 employées et tensions présentes sur ces bornes.
9. État du buck si l'ESP32 ou le DFR0520 est débranché.
10. Nombre, raccordement et mode de commande actuels des lampes de dissipation.

## Sources techniques

- [ACS712, fiche Allegro](https://www.allegromicro.com/-/media/files/datasheets/acs712-datasheet.ashx)
- [DFR0520, documentation DFRobot](https://wiki.dfrobot.com/dfr0520/)
- [ESP32-C3, documentation ADC Espressif](https://docs.espressif.com/projects/esp-idf/en/latest/esp32c3/api-reference/peripherals/adc/index.html)
- [Physique détaillée de la résistance](../pedaling-resistance-physics.md)
