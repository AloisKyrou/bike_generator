# Audit profond des connexions du contrôleur

Dernière vérification : 28 septembre 2026.

Cet audit décrit l'état réellement enregistré dans les fichiers KiCad. Il se
base sur la netlist XML générée depuis le schéma racine, un export de placement
du PCB, l'ERC et le DRC. Les documents de travail et les anciennes BOM ne sont
pas utilisés comme preuve de connexion.

## Résumé exécutable

- **Schéma corrigé :** `R12` relie maintenant
  `U4.4 RON -> R12 41,2 kΩ -> GND`. La simulation de synchronisation actuelle
  ne signale plus de conflit sur R12.
- La valeur `41,2 kΩ` est correcte pour une sortie de 5 V à environ 300 kHz :
  `RRON[kΩ] = VOUT[V] × 2500 / FSW[kHz]`. Les `100 kΩ` de l'exemple TI
  correspondent à une sortie de 12 V, pas à cette carte.
- `PGOOD` n'est pas en court-circuit ni flottant : `U4.6` possède le pull-up
  `R15` vers 3,3 V et le point de test `TP13` est présent.
- La parité est temporairement rompue de façon contrôlée uniquement par JP4 :
  le schéma remplace S1 par un header 1×2, tandis que le PCB ouvert conserve
  encore l'ancienne empreinte C&K. La simulation de synchronisation signale un
  conflit `footprint_id_changed` et n'applique rien.
- ERC : 0 erreur, 2 avertissements, tous deux dus au label `UART_TX` qui ne
  rejoint aucun autre composant.
- Dernier DRC avant le remplacement de S1 : 0 erreur, 0 non-connecté et
  49 avertissements. Il doit être relancé après remplacement/routage de JP4.

## Connexions critiques relues dans la netlist

### Chemin de puissance et mesure

```text
J1.1 ou D2.5 -> RECTIFIED_RAW -> F1 -> Net-(D1-K)
             -> R1 pad 4 (force entrée)
             -> R1 pad 1 (force sortie) -> VBUS_SENSE -> J2.2

R1 pad 3 -> SHUNT_HI_K -> R2 -> U1.10 IN+
R1 pad 2 -> SHUNT_LO_K -> R3 -> U1.9 IN-
VBUS_SENSE -> U1.8 VBUS
VBUS_SENSE -> F2 -> AUX_IN_PROTECTED -> U4.2 VIN
```

Le sens de mesure positif est donc du pad 4 vers le pad 1 de R1. Le câblage
KiCad est cohérent avec `IN+` côté source et `IN-` côté charge. L'ancienne
documentation qui plaçait l'entrée sur le pad 1 et la sortie sur le pad 4
décrivait l'empreinte dans l'autre orientation et ne doit plus être utilisée.

### LM5164 U4

| Broche | Net actuel | Verdict |
|---:|---|---|
| 1, 9 | `GND` | correct |
| 2 VIN | `AUX_IN_PROTECTED` | correct |
| 3 EN/UVLO | `UVLO`, diviseur 1 MΩ / 200 kΩ | correct, environ 9,0 V ON et 8,4 V OFF |
| 4 RON | `RON_SET`, puis R12 vers `GND` | correct dans le schéma ; synchronisation PCB en attente |
| 5 FB | `FB`, 316 kΩ / 100 kΩ | correct, environ 4,99 V |
| 6 PGOOD | `AUX_PGOOD`, pull-up 47 kΩ vers 3,3 V | électriquement correct mais non consommé |
| 7 BST | `BST`, C9 2,2 nF vers SW | correct |
| 8 SW | `SW`, L1 et réseau Type-3 | correct |

La fiche TI limite RON à 5,5 V absolus. L'ancien raccordement au bus 70–80 V
pouvait détruire U4 ; il a été supprimé du schéma. TI demande aussi une
résistance RON proche du circuit et une capacité parasite RON-GND inférieure à
20 pF. Le futur raccordement PCB à GND doit donc rester très court.

Le réseau Type-3 réellement câblé est cohérent : `R16 200 kΩ` de SW vers
`RIPPLE`, `C11 3,3 nF` de RIPPLE vers AUX_5V et `C10 82 pF C0G` de RIPPLE vers
FB. `C12` et `C13` filtrent la sortie 5 V.

### INA228 U1

Les dix broches correspondent à la fiche TI : A1, A0, ALERT, SDA, SCL, VS,
GND, VBUS, IN− et IN+. Les entrées Kelvin ne transportent pas le courant de
puissance. La limite absolue de mode commun et de VBUS est 85 V ; elle ne doit
pas servir de tension normale de fonctionnement.

### MCP42100 U3 et MCU U2

- SPI écriture seule : `POT_CS`, `POT_SCK`, `POT_MOSI` sont cohérents ; `SO`
  est explicitement non connecté.
- Les deux canaux A/W/B rejoignent correctement J7 et J9.
- Les adresses INA228 JP1/JP2, l'I²C et `INA_ALERT` sont cohérents.
- `GPIO9_BOOT` et `SO` sont les deux non-connexions explicites présentes.
- `UART_TX` est le seul net à une broche non explicitement fermé : décider
  entre un point de test/connecteur et une non-connexion explicite.

## Nomenclature reportée dans KiCad

Les choix ci-dessous ont été reportés dans les champs des symboles :

| Référence | Correction attendue dans KiCad |
|---|---|
| U1 | Manufacturer `Texas Instruments`, MPN `INA228AIDGSR` |
| U4 | Manufacturer `Texas Instruments`, MPN `LM5164DDAT` |
| U3 | Manufacturer `Microchip Technology`, MPN `MCP42100-I/SL` |
| F2 | valeur `0449001.MR / 1A 125V Slo-Blo`, Manufacturer `Littelfuse`, MPN `0449001.MR` |
| J5 | JST `S4B-PH-K-S(LF)(SN)`, boîtier câble `PHR-4` |
| J6 | JST `S2B-PH-K-S(LF)(SN)`, boîtier câble `PHR-2`; polarité à vérifier physiquement |
| J1 | retirer `DNP` du Value et indiquer peuplé sur les premiers prototypes |
| TP12 | remplacer la valeur `~` par `AUX_IN_PROTECTED` |

`controller-v1-current.csv` a été régénéré et reflète TP13 ainsi que les
nouvelles valeurs et champs fabricant. Une nouvelle génération restera à faire
après les éventuels changements issus de la synchronisation PCB.

## Limites système et risques qui ne sont pas des erreurs ERC

1. **Tension :** la carte V1 n'est garantie qu'à 70 V continus. La SMCJ70A a
   un `VRWM` de 70 V et sa tension de clamp ne garantit pas le maintien de
   l'INA228 sous 85 V lors d'une surtension sévère. 70–80 V reste une zone de
   prototype hors spécification.
2. **Sources :** J1 et J8 peuvent être peuplés pour démonstration, mais ne
   doivent jamais être alimentés ou raccordés simultanément.
3. **JP3 :** fermé, il relie directement AUX_5V à l'entrée 5 V/USB du Beetle.
   Ne jamais brancher l'USB lorsque JP3 est fermé sans avoir démontré
   l'absence de retour de courant.
4. **PGOOD :** le pull-up seul est légal, mais il ne réalise aucun verrouillage.
   Si la documentation promet une autorisation matérielle de charge, cette
   fonction reste à concevoir.
5. **D2 et F1 :** les limites thermiques et la largeur de cuivre restent des
   validations physiques ; un DRC vert ne les démontre pas.
6. **J6 :** aucune protection contre l'inversion de batterie n'a été
   identifiée ; la polarité du câble réel est une vérification bloquante.

## Séquence de correction et de preuve

1. [x] Créer un point de restauration avant modification.
2. [x] Remplacer la connexion haute de R12 par GND dans `aux_supply.kicad_sch`.
3. [ ] Mettre à jour le PCB depuis le schéma, supprimer l'ancien cuivre R12–VIN et
   raccorder R12 à la masse analogique locale avec un trajet très court.
4. [x] Ajouter les champs fabricant/MPN ci-dessus et corriger J1, F2 et TP12.
5. [x] Ajouter au minimum un point de test PGOOD si le signal reste volontairement
   non consommé.
6. Vérifier la parité schéma/PCB, remplir les zones, relancer ERC et DRC.
7. [x] Exporter une nouvelle netlist et prouver que R12 ne partage plus aucun
   net avec VIN : `R12 = RON_SET <-> GND`.

Sources principales : fiche TI LM5164 `SNVSAU4D`, sections 5.1, 6.3.5,
6.3.9, 6.3.10, 7.2.2 et 7.4 ; fiche TI INA228 `SLYS021A`, sections 5 et 6.1.
