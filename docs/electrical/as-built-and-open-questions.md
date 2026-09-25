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

### Architecture d'alimentation décidée pour le PCB V1

La carte de contrôle ne sera pas alimentée depuis la sortie 24 V du buck
principal. Une branche auxiliaire sera prélevée après le fusible et le shunt,
avant ce buck. Le LM5164 est retenu comme candidat 100 V / 1 A pour produire
5 V à partir d'une entrée fonctionnelle de 10 à 60 V.

Le Beetle pourra ainsi démarrer dès que la génératrice produit une tension
suffisante, indépendamment de la batterie ou de la charge raccordée après le
buck principal. La batterie LiPo 1S protégée 801350 / 500 mAh assurera
la continuité à l'arrêt et sera déconnectable pour éviter la décharge entre les
usages. `JP_GEN_5V` isolera la branche générateur pendant la programmation USB.

La sortie du buck principal reste configurée manuellement à 24 V et appartient
au système externe de stockage ou de charge, pas au PCB contrôleur.

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

Le firmware fournit néanmoins une calibration empirique utile : curseur 30 pour
environ 120 W, cible initiale calculée 20 pour 80 W, limite calculée 50 pour
200 W. Il suppose donc qu'une valeur numérique croissante augmente la charge.
Cela ne remplace pas les mesures de tension, courant de curseur et masse commune.

L'anomalie de démarrage identifiée ici a été corrigée dans le firmware : la
valeur mémorisée démarre à `-1`, ce qui force l'envoi de `POT_INITIAL`. Le PCB V1
emploie désormais un `MCP4151-104E/SN` simple canal, mais les mesures A/W/B
restent indispensables avant connexion au buck.

Enfin, le firmware existant affecte GPIO0 et GPIO1 aux ADC de l'ACS712 et du pont
diviseur, alors que la nouvelle carte les utilise pour l'I2C de l'INA228. Cette
divergence est normale pendant la transition, mais le firmware devra être adapté
avant d'utiliser le PCB V1.

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

## Inconnues bloquantes pour la fabrication V1

1. Référence exacte et version de la Beetle ESP32-C3.
2. Continuité entre négatif redressé, IN-, OUT- et masse de contrôle.
3. Tension maximale à vide après redressement — génératrice entraînée, sortie
   électrique déconnectée — à plusieurs cadences, puis maximum transitoire.
4. Validation thermique de la cible 20 A continus / 25 A transitoires.
5. Fonction des potentiomètres du buck et identification certaine du réglage CC.
6. Bornes du DFR0520 employées et tensions présentes sur ces bornes.
7. État du buck si l'ESP32 ou le DFR0520 est débranché.
8. Fiche exacte de la batterie protégée 801350 / 500 mAh et courant de charge
   admissible à comparer aux 400 mA annoncés par DFRobot.
9. Référence commandable, valeurs et protection d'entrée du LM5164.
10. Relation exacte entre `VIN_5V`, `VUSB`, TP4057 et `BAT` sur la révision
    physique du Beetle.
11. Absence de retour de courant entre la branche générateur et un hôte USB.

La variante de l'ancien ACS712, les valeurs de l'ancien pont diviseur et la
configuration détaillée des lampes restent utiles pour documenter le prototype,
mais ne bloquent plus le schéma de mesure et d'alimentation du PCB V1.

## Sources techniques

- [ACS712, fiche Allegro](https://www.allegromicro.com/-/media/files/datasheets/acs712-datasheet.ashx)
- [DFR0520, documentation DFRobot](https://wiki.dfrobot.com/dfr0520/)
- [ESP32-C3, documentation ADC Espressif](https://docs.espressif.com/projects/esp-idf/en/latest/esp32c3/api-reference/peripherals/adc/index.html)
- [Physique détaillée de la résistance](../pedaling-resistance-physics.md)
- [LM5164, Texas Instruments](https://www.ti.com/product/LM5164)
- [Dimensionnement du chemin de puissance et candidats](power-path-dimensioning.md)
