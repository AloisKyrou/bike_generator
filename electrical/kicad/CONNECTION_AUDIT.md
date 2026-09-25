# Audit des connexions du contrôleur

Dernière vérification : 25 septembre 2026.

Cet audit décrit l'état enregistré dans le schéma KiCad. Il ne remplace pas les
mesures physiques ni la validation des composants encore provisoires.

## Méthode

1. Relire les composants et leurs nets avec Konnect.
2. Valider la correspondance entre labels hiérarchiques et pins de feuilles.
3. Générer la netlist avec `kicad-cli` depuis le schéma racine.
4. Contrôler dans cette netlist les nœuds réellement réunis à travers les
   feuilles.
5. Lancer l'ERC sur le schéma racine.
6. Rendre les feuilles racine et `MCU` pour inspection visuelle.

Les exports de contrôle sont générés dans `kicad/exports/` et restent hors Git.

## Connexions confirmées dans la netlist

| Net | Extrémités principales confirmées |
|---|---|
| `AUX_5V` | sortie du LM5164 et filtrage → `JP3.1` |
| `VIN_5V` | `JP3.2` → `U2.11 VIN_5V` |
| `BAT_RAW` | `J6.1` → `S1.1` |
| `BAT_CTRL` | `S1.2` → `U2.9 BAT` |
| `GND` | `J6.2` → masse commune du contrôleur |
| `I2C_SDA` | `U2 GPIO0` ↔ `U1 SDA` ↔ rappel `R3` ↔ `TP6` ↔ `J2.3` |
| `I2C_SCL` | `U2 GPIO1` → `U1 SCL` ↔ rappel `R4` ↔ `TP7` ↔ `J2.4` |
| `INA_ALERT` | `U1 ALERT` → `U2 GPIO2`, avec rappel `R5` et `TP8` |
| `POT_CS` | `U2 GPIO5` → `U3 CS`, avec rappel haut `R6` |
| `POT_SCK` | `U2 GPIO6` → `U3 SCK` |
| `POT_MOSI` | `U2 GPIO7` → `U3 SDI/SDO`, utilisé en écriture uniquement |
| `CC_A`, `CC_W`, `CC_B` | `U3 P0A/P0W/P0B` → `J1` et points de test dédiés |
| `SHUNT_HI_K`, `SHUNT_LO_K` | shunt quatre bornes → filtre différentiel INA228 |
| `VBUS_SENSE` | `BUS_PROTECTED` → entrée bus de l'INA228 |
| `AUX_IN_PROTECTED` | branche protégée par `F2` → entrée du LM5164 |

## État des validations

- pins hiérarchiques : zéro incohérence ;
- feuilles individuelles : zéro élément orphelin et zéro court-circuit de nets
  lors du contrôle du 25 septembre 2026 ;
- `MCU` : `J6.1 = BAT_RAW`, `J6.2 = GND`, `JP3.1 = AUX_5V`,
  `JP3.2 = VIN_5V` relus après écriture ;
- ERC global : une erreur, zéro avertissement.

`R7` est désormais le Bourns `CSS4J-4026K-2L00F`. Son empreinte native
`Resistor_SMD:R_Shunt_Isabellenhuette_BVR4026` a été comparée au land pattern
Bourns : pads force 1/4 et Kelvin 2/3 concordent. Après affectation, les nets
restent inchangés et la recherche de courts-circuits donne zéro résultat.

L'erreur ERC restante est intentionnelle : la sortie hiérarchique
`AUX_PGOOD` n'alimente pas encore une fonction matérielle. Le signal existe
déjà localement sur `U4.6`, `R14` et `TP14`. Il ne sera pas relié arbitrairement
à `GPIO8` ou `GPIO9_BOOT`, qui participent au démarrage de l'ESP32-C3. La future
destination doit être définie avec l'interverrouillage matériel de la commande
CC.

## Connexions volontairement non finalisées

- `AUX_PGOOD` vers l'autorisation matérielle de charge ;
- `GPIO4`, libéré par la suppression de `POT_MISO` et explicitement non connecté ;
- broches `GPIO8` et `GPIO9_BOOT` du Beetle ;
- insertion mécanique des headers du Beetle et interrupteur `S1` ;
- références physiques des connecteurs et protections de forte puissance ;
- interface analogique finale `CC_A/CC_W/CC_B`, bloquée par les mesures du
  potentiomètre du buck externe.

Ces éléments ne doivent pas être raccordés seulement pour obtenir un ERC vert.
