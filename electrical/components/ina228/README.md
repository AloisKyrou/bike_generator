# INA228AIDGSR — validation du composant KiCad

Statut : **accepté pour le schéma et le PCB V1**.

Cette fiche conserve la preuve utilisée pour relier le composant physique, le
symbole électrique et l'empreinte PCB. Elle devra être relue si la référence
achetée, le boîtier ou la version des bibliothèques KiCad change.

## Référence retenue

| Élément | Valeur |
|---|---|
| Fabricant | Texas Instruments |
| Référence complète | `INA228AIDGSR` |
| Boîtier fabricant | `DGS`, VSSOP-10, 3 × 3 mm, pas de 0,5 mm |
| Dessin mécanique | `DGS0010A`, JEDEC MO-187 variation BA |
| Symbole KiCad | `Sensor_Energy:INA228` |
| Empreinte KiCad | `Package_SO:TSSOP-10_3x3mm_P0.5mm` |
| Broches / pads | 10 / 10, sans pad exposé |

Le nom `TSSOP` de l'empreinte KiCad peut surprendre alors que TI appelle le
boîtier `VSSOP`. La définition KiCad identifie explicitement cette empreinte
comme compatible avec `Texas_DGS0010A` et `Texas_VSSOP-10`.

## Documentation de référence

- [Datasheet TI archivé dans le dépôt](./ti-ina228-slys021a.pdf)
- [Source officielle TI](https://www.ti.com/lit/ds/symlink/ina228.pdf)
- Document : `SLYS021A`, janvier 2021, révision mai 2022
- Pages utilisées : brochage p. 3 ; informations de commande p. 41 ; dessin
  du boîtier et land pattern pp. 45–46 du PDF
- Copie récupérée le 23 septembre 2026
- SHA-256 :
  `A138D39EEEE04F8388426FED204C2F4012E75D36E95B60B0751EF003CD277447`

## Correspondance physique complète

Le brochage TI est présenté en **vue de dessus**. Les coordonnées de pads
ci-dessous sont celles de la vue cuivre supérieure de l'empreinte KiCad, avec
l'origine au centre du boîtier.

| Broche physique | Fonction TI | Type fonctionnel | Pin du symbole | Pad PCB et centre (mm) |
|---:|---|---|---|---|
| 1 | `A1` | entrée numérique d'adresse | `1 — A1` | `1` à `(-2,15 ; -1,00)` |
| 2 | `A0` | entrée numérique d'adresse | `2 — A0` | `2` à `(-2,15 ; -0,50)` |
| 3 | `ALERT` | sortie numérique open-drain | `3 — ~Alert` | `3` à `(-2,15 ; 0,00)` |
| 4 | `SDA` | entrée/sortie I²C open-drain | `4 — SDA` | `4` à `(-2,15 ; 0,50)` |
| 5 | `SCL` | entrée horloge I²C | `5 — SCL` | `5` à `(-2,15 ; 1,00)` |
| 6 | `VS` | alimentation du circuit | `6 — VS` | `6` à `(2,15 ; 1,00)` |
| 7 | `GND` | masse | `7 — GND` | `7` à `(2,15 ; 0,50)` |
| 8 | `VBUS` | mesure analogique de tension bus | `8 — Vbus` | `8` à `(2,15 ; 0,00)` |
| 9 | `IN−` | entrée négative du shunt | `9 — Vin-` | `9` à `(2,15 ; -0,50)` |
| 10 | `IN+` | entrée positive du shunt | `10 — Vin+` | `10` à `(2,15 ; -1,00)` |

Contrôle de cardinalité : 10 broches dans le datasheet, 10 pins dans le
symbole, 10 pads cuivre dans l'empreinte. Il n'y a ni pad thermique exposé, ni
pad mécanique surnuméraire, ni numéro dupliqué.

## Contrôle de l'empreinte

L'empreinte standard utilise :

- un corps nominal de 3 × 3 mm ;
- un pas vertical de 0,50 mm ;
- des pads de 1,45 × 0,30 mm ;
- un repère de broche 1 en haut à gauche en vue de dessus ;
- le modèle 3D
  `${KICAD10_3DMODEL_DIR}/Package_SO.3dshapes/TSSOP-10_3x3mm_P0.5mm.step`.

L'exemple de land pattern TI place les centres des deux rangées à 4,40 mm,
alors que l'empreinte KiCad les place à 4,30 mm. Les pads ont la même taille :
la différence déplace donc chaque rangée de 0,05 mm vers le boîtier. Cette
variation reste couverte par la longueur des pattes du dessin DGS0010A et
l'empreinte KiCad cible explicitement ce boîtier. L'empreinte standard est
donc retenue pour la V1 ; cet écart doit néanmoins rester visible lors de la
revue avant fabrication.

## Contrôles effectués

1. Identification de la référence commandable `INA228AIDGSR` et du boîtier
   `DGS` dans la documentation TI.
2. Relecture par Konnect du symbole `Sensor_Energy:INA228`, de ses dix pins et
   de l'empreinte qui lui est affectée.
3. Relecture de l'empreinte installée : dix pads, dimensions, positions,
   repère de pin 1 et modèle 3D.
4. Placement du symbole dans un schéma jetable, puis relecture des dix pins et
   de leurs coordonnées.
5. Inspection visuelle d'un rendu agrandi du symbole et d'un rendu de
   l'empreinte.
6. Réconciliation du tableau ci-dessus sans ambiguïté restante.

Les rendus et le schéma jetable sont placés dans
`electrical/kicad/exports/` et restent volontairement ignorés par Git.

## Conséquences pour le schéma V1

- `VS` accepte une alimentation de 2,7 à 5,5 V ; la V1 utilisera la logique
  3,3 V de l'ESP32-C3.
- Prévoir le condensateur de découplage de `VS` au plus près de U1.
- `SDA` et `ALERT` sont open-drain : leurs résistances de rappel doivent être
  explicitement prévues ou justifiées par celles déjà présentes sur le bus.
- `A0` et `A1` fixent l'adresse I²C et ne doivent pas flotter.
- Les pistes `IN+` et `IN−` devront rejoindre le shunt en Kelvin, sans faire
  circuler le courant de puissance dans les pistes de mesure.
- `VBUS` mesure la tension du bus ; sa protection et son filtrage seront
  dimensionnés contre les transitoires réels du générateur.

## Circuit implémenté dans `INA228_SENSE`

La feuille V1 contient désormais le circuit complet autour de `U1` :

- `R1` et `R2` : 10 Ω en série dans les deux prises Kelvin ;
- `C3` : 100 nF différentiel entre `IN+` et `IN−` ;
- `C1` : 100 nF et `C2` : 1 µF entre 3,3 V et GND ;
- `R3` et `R4` : rappels I²C de 4,7 kΩ ;
- `R5` : rappel de 10 kΩ sur `ALERT` ;
- `JP1` et `JP2` : cavaliers d'adresse 3 pads, position 1–2 fermée vers GND
  par défaut ;
- `TP1` à `TP8` : points de test sur Kelvin, VBUS, alimentations et bus.

Les trois interfaces `SHUNT_HI_K`, `SHUNT_LO_K` et `VBUS_SENSE` restent
volontairement non raccordées sur la feuille racine tant que le shunt et le
chemin de puissance ne sont pas dimensionnés. L'ERC global signale donc trois
erreurs attendues et explicites ; aucune autre erreur ou alerte n'est masquée.
