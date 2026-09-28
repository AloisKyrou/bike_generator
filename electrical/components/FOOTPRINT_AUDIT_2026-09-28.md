# Audit des empreintes et composants sensibles — 2026-09-28

## Objet et méthode

Cet audit compare la nomenclature réellement enregistrée dans le projet KiCad avec les
fiches constructeur et les notes de validation présentes dans `electrical/components/`.

Sources de l'état KiCad :

- BOM exportée depuis le schéma enregistré avec KiCad CLI 10.0 ;
- positions exportées depuis le PCB enregistré ;
- DRC KiCad CLI exécuté avec les contrôles de parité schéma/PCB ;
- documentation constructeur archivée dans le dépôt ;
- pages officielles constructeur pour les documents pas encore archivés.

Limite de cette passe : l'IPC KiCad/Konnect n'était pas disponible. Les fichiers KiCad
n'ont pas été modifiés directement. Pour les empreintes personnalisées, les dimensions
attendues sont donc données ci-dessous avec une courte vérification finale à faire dans
l'éditeur d'empreinte.

## Conclusion courte

La carte n'est pas encore prête à fabriquer, même si elle est proche d'un état contrôlable.
Les points bloquants sont :

1. L'exception locale de clearance U4 pad 2 ↔ pad 9 a été fixée à 0,45 mm et le
   DRC du 28 septembre 2026 confirme **zéro erreur électrique** et zéro pad non connecté.
2. La décision est désormais de conserver `MCP42100-I/SL` en SOIC-14 et ses deux canaux
   CC/CV. Les anciennes mentions du `MCP4151-104E/SN` sont obsolètes.
3. Le DRC signale **43 empreintes différentes de leur copie de bibliothèque**, dont les
   empreintes sensibles U2, l'ancien S1, F2, R1 et L1. Ce n'est pas la preuve qu'elles sont fausses,
   mais c'est un problème de reproductibilité à résoudre avant fabrication.
4. F2 est définitivement choisi : Littelfuse `0449001.MR`, 1 A / 125 V temporisé. Ses
   champs fabricant/MPN/datasheet restent à reporter dans le schéma enregistré.
5. J1 doit être peuplé sur les premiers prototypes avec J8/D2 pour démontrer les deux
   variantes ; les deux entrées ne doivent jamais être alimentées simultanément.
6. La géométrie de F1 est cohérente avec Littelfuse, mais son utilisation à 20 A impose
   une validation thermique du cuivre. D2 ne peut pas être considéré comme un pont 20 A
   sans solution thermique de boîtier.
7. **Correction RON :** le schéma relie maintenant
   `RON → R12 41,2 kΩ → GND`. Le PCB reste à synchroniser après suppression
   de l'ancien court segment cuivre attaché à `R12.1`.

Le dernier DRC contient 88 avertissements au total :

- 43 avertissements `lib_footprint_mismatch` ;
- 24 avertissements sérigraphie sur cuivre/masque ;
- 18 chevauchements de sérigraphie ;
- 3 sérigraphies trop proches du bord.

Il n'y a aucune erreur DRC ni aucun élément non connecté. L'ERC contient deux
avertissements identiques concernant `UART_TX`, label relié à une seule broche.

## Audit par composant sensible

### F1 — Littelfuse 0456020.ER, série 456, 20 A

**Source :** datasheet Littelfuse 456 Series, révision 18 septembre 2025,
[document officiel](https://www.littelfuse.com/assetdocs/littelfuse_fuse_456_datasheet.pdf?assetguid=d86b18f9-14fa-4764-87ff-8aec12e9a89d), page 3.

Le land pattern 20/25/30 A de la page 3 donne :

- corps : 10,08 × 3,05 mm ;
- pads : 3,25 × 3,43 mm ;
- intervalle cuivre intérieur : 6,10 mm ;
- encombrement cuivre total : 12,60 mm ;
- entraxe calculé des pads : 9,35 mm.

L'empreinte projet `Fuse_Littelfuse_456_10.08x3.05mm_P9.35mm` est documentée avec ces
valeurs et F1 ne produit pas d'avertissement de divergence bibliothèque dans le DRC.
La géométrie est donc **acceptée sous réserve du dernier contrôle visuel** : pads centrés
à X = -4,675 mm et +4,675 mm, taille 3,25 × 3,43 mm.

La contrainte critique est thermique, toujours page 3 : pour 20 A, Littelfuse utilise au
minimum 100 µm de cuivre et 10 mm de largeur. Si le PCB fabriqué diffère, le corps du
fusible doit rester à 90 °C maximum dans une ambiance à 25 °C. Une fabrication 1 oz
(environ 35 µm) ou 2 oz (environ 70 µm) ne satisfait pas cette référence sans validation.

À vérifier :

- épaisseur de cuivre commandée ;
- largeur réelle minimale et étranglements aux pads ;
- température du corps à courant continu réel ;
- épaisseur de stencil recommandée de 0,152 mm si assemblage automatisé.

### F2 — fusible auxiliaire Littelfuse 0449001.MR

**Source :** `connectors-and-protection/littelfuse-449-datasheet.pdf`, page 3,
SHA-256 `F60276A6F8DCF852C7E5BE37B73296D2B2AD692662B4229295AADC0137C88555` ;
[document officiel](https://www.littelfuse.com/assetdocs/fuses-449-datasheet?assetguid=7aef6e93-9808-456e-9bee-fba54271285f).

La page 3 donne un corps de 6,10 × 2,69 mm et un land pattern de pads
1,96 × 3,15 mm, séparés par 2,95 mm, soit un entraxe de 4,91 mm.

L'empreinte `Fuse_Littelfuse_0449001MR_6.10x2.69mm` correspond aux dimensions
documentées. Le MPN retenu est `0449001.MR`, Littelfuse, 1 A / 125 V, temporisé.
Le calibre est cohérent avec le LM5164 5 V / 1 A : même au minimum d'entrée, le courant
d'entrée nominal reste inférieur à 1 A et le caractère temporisé laisse une marge à
l'appel de courant. Le DRC indique encore que **la copie placée F2 diffère de la
bibliothèque** ; comparer/synchroniser cette instance avant fabrication.

À faire avant fabrication :

- renseigner `Littelfuse`, `0449001.MR` et la datasheet dans le schéma ;
- comparer F2 à la bibliothèque dans KiCad et décider quelle version est correcte ;
- vérifier la tension assignée et le pouvoir de coupure pour la source réelle.

### D2 — Diotec DBI25-16A, pont triphasé

**Source :** `dbi25-16a/diotec-dbi25005a.pdf`, version 2026-08-18,
pages 1 et 2, SHA-256
`919EDAB72661E2524EBDE2BC1AE93957EFECF27BA54F9ED718451FE71F70EDD0` ;
[page constructeur](https://diotec.com/en/product/DBI25-16A.html).

Le boîtier DBI-A est donné pour 35 × 25 × 4 mm. La vue constructeur de la page 1 donne,
de gauche à droite côté marquage : `-`, `~`, `~`, `~`, `+`. L'empreinte projet utilise
cinq broches au pas de 7,50 mm, aux coordonnées X = -15, -7,5, 0, +7,5 et +15 mm.
D2 ne produit pas d'avertissement de divergence bibliothèque.

La réserve principale n'est pas géométrique mais thermique : la page 1 indique 25 A avec
le boîtier à 115 °C, 40 A avec le boîtier à 85 °C, mais seulement 4 A en montage libre à
50 °C. Le trou M4 appartient au composant pour sa fixation thermique ; ce n'est pas un
trou de connexion PCB.

À vérifier physiquement : sens du marquage, accès à la vis M4, dissipateur ou surface de
montage, isolation électrique et température au courant maximal.

### D1 — Littelfuse SMCJ70A

**Source :** `connectors-and-protection/littelfuse-smcj-datasheet.pdf`, page 4,
SHA-256 `04C55B5C1641BD74C012EF8B3116444AAB9F5F9C6A11C497BD255BA910C2E172`.

Le boîtier est un DO-214AB/SMC. L'empreinte KiCad native `Diode_SMD:D_SMC` est adaptée.
Le contrôle important est la polarité : pour une SMCJ70A unidirectionnelle placée entre
bus et masse, cathode côté bus protégé et anode côté GND. Ajouter le lien de datasheet
dans la BOM, actuellement vide.

### R1 — Bourns CSS4J-4026K-2L00F, shunt Kelvin 2 mΩ

**Source :** `current-shunt/bourns-css4j-4026.pdf`, page 2,
SHA-256 `27BE7941FF95AFC1C0A98AC573D33A987279CE2EE55985ED78308D502543E49D` ;
[document officiel](https://www.bourns.com/docs/product-datasheets/css4j-4026.pdf?sfvrsn=675f9af1_39).

La page 2 donne le corps, le land pattern quatre bornes et les points de mesure Kelvin.
La correspondance de conception est :

- pad 1 : force côté entrée, après F1 ;
- pad 2 : sense `SHUNT_HI_K` ;
- pad 3 : sense `SHUNT_LO_K` ;
- pad 4 : force côté `BUS_PROTECTED`.

Le footprint KiCad natif `R_Shunt_Isabellenhuette_BVR4026` a été retenu car ses cotes
sont très proches du land pattern Bourns. Cependant R1 est signalé comme différent de la
bibliothèque. **Ne pas le mettre à jour aveuglément** : comparer les quatre pads et
conserver le routage Kelvin séparé du courant de puissance.

À contrôler dans l'éditeur : pads force 2,55 × 5,60 mm, pads sense 2,55 × 0,90 mm,
entraxe horizontal des centres ±4,025 mm, et surtout numéros 1–4 conformes au tableau
ci-dessus.

### L1 — Coilcraft MSS1038-473MLC

**Source :** `coilcraft-mss1038-473/coilcraft-mss1038-datasheet.pdf`, page 1,
SHA-256 `4A9750D3C3857C5E8D0C8CC6FCCC9321BA5E0FF2434F5E64D9BE742597EF3959` ;
[page constructeur](https://www.coilcraft.com/en-us/products/power/shielded-inductors/ferrite-drum/mss-mos/mss1038/mss1038-473/).

Le composant est donné pour 10,0 × 10,2 mm et 3,8 mm de haut. La référence exacte
47 µH `MSS1038-473MLC` est donnée à 128 mΩ max ; son courant est nettement inférieur à
20 A car elle appartient seulement au buck auxiliaire.

L'empreinte native `Inductor_SMD:L_Coilcraft_MSS1038-XXX` est appropriée, mais L1 est
signalée différente de la bibliothèque. Comparer avant toute mise à jour et préserver les
dégagements autour du nœud SW.

### U4 — Texas Instruments LM5164DDAT, boîtier DDA

**Source :** `lm5164-aux-supply/ti-lm5164-snvsa-u4d.pdf`, révision D,
pages 3 et 28 à 30, SHA-256
`443013789955216B571204F457FE666BE7ECC641C94B2EABF7ED043F9C175CC5` ;
[datasheet officielle](https://www.ti.com/lit/gpn/lm5164).

La page 3 donne le brochage vu de dessus. La page 29 du document actuel donne le land
pattern DDA0008B :

- pads 1–8 : 1,55 × 0,60 mm ;
- pas vertical : 1,27 mm ;
- entraxe entre centres des deux rangées : 5,40 mm, donc X = ±2,70 mm ;
- pad thermique 9 : 2,95 × 4,90 mm ;
- ouverture F.Mask du pad thermique : 2,71 × 3,40 mm ;
- six vias thermiques proposés, perçage 0,20 mm, pas X 1,10 mm et pas Y 1,30 mm.

La version corrigée par l'utilisateur correspond à ces dimensions, sauf le perçage des
vias porté à 0,30 mm pour rester fabricable. Ce choix est acceptable si les vias sous la
pâte sont bouchés/remplis ou tentés conformément à la note TI, et si le volume de pâte
est maîtrisé.

Le DRC enregistré conserve néanmoins l'erreur entre le pad VIN 2 et l'EP 9. La valeur
locale de 0,45 mm montrée dans l'interface n'est pas présente ou n'est pas effective dans
le fichier enregistré. Action : régler l'exception uniquement pour cette paire, enregistrer
le PCB, puis obtenir zéro erreur. Une règle personnalisée documentée est préférable à
une baisse globale de `AUX_HV_1A`.

Renseigner aussi dans la BOM : fabricant `Texas Instruments`, MPN `LM5164DDAT`.

### U1 — Texas Instruments INA228AIDGSR

**Source :** `ina228/ti-ina228-slys021a.pdf`, pages 3, 45 et 46,
SHA-256 `A138D39EEEE04F8388426FED204C2F4012E75D36E95B60B0751EF003CD277447` ;
[référence officielle](https://www.ti.com/product/INA228/part-details/INA228AIDGSR).

Le suffixe `DGSR` impose le VSSOP-10 DGS. La page 46 donne dix pads 1,45 × 0,30 mm,
pas 0,50 mm et entraxe de rangées 4,40 mm. L'empreinte native
`TSSOP-10_3x3mm_P0.5mm` utilise un entraxe très légèrement inférieur déjà documenté
comme acceptable dans les tolérances des pattes.

À faire : renseigner MPN `INA228AIDGSR` et fabricant TI dans la BOM ; vérifier le repère
pin 1 et le raccordement séparé IN+/IN- aux pads sense du shunt.

### U3 — MCP42100 conservé

**État enregistré :** `MCP42100-I/SL`, empreinte native
`SOIC-14_3.9x8.7mm_P1.27mm`.

**Source de l'état actuel :**
`dfr0520-mcp42100/microchip-mcp41xxx-42xxx-11195c.pdf`, pages 1, 12 et 27,
SHA-256 `F78338DBF59DDB8738867DA30E644D52942538192BCE9DFF070C4E765B679C1A` ;
[page Microchip MCP42100](https://www.microchip.com/en-us/product/mcp42100).

Le suffixe `/SL` correspond bien au SOIC-14 150 mil ; l'empreinte actuelle n'est donc pas
une erreur mécanique en elle-même.

**Décision utilisateur :** conserver le double canal `MCP42100-I/SL`. Le canal 0 sert à
CC, le canal 1 à CV, et le bus SPI fonctionne en écriture seule ; `SO` peut rester
explicitement non connecté. La règle de projet Konnect et la documentation de référence
ont été mises à jour. Les anciens documents parlant d'un remplacement par MCP4151 sont
historiques et ne doivent plus guider la V1.

### U2 — module DFRobot DFR0868 Beetle ESP32-C3 V2

**Sources :** `dfr0868-beetle-esp32-c3/dfr0868-dimension-v1.0.pdf`, page unique,
SHA-256 `DCEF25759DAD3F71CE50D2156F906878A27B3D9E003EB66516BB2BABF3161DD0` ;
`dfr0868-schematic-v2.0.0.pdf`, page unique, SHA-256
`767B6FE71168BF555BA4A948993EE45295E36217E1F26D4C678DEA7BC01528ED` ;
[wiki officiel DFR0868](https://wiki.dfrobot.com/dfr0868/).

Dimensions retenues : carte 20,50 × 25,00 mm, pas longitudinal 2,54 mm, entraxe des
rangées 17,78 mm. Les trous de socket du PCB sont Ø1,00 mm avec pads Ø1,70 mm,
compatibles sur le papier avec le header femelle Würth 61300811821.

Le DRC indique que U2 diffère de la bibliothèque. Comparer la copie PCB à la bibliothèque
avant de décider laquelle conserver.

Vérifications physiques indispensables :

- insertion réelle des pins mâles carrées du Beetle dans le socket retenu ;
- orientation USB-C et pin 1 ;
- espace vertical et accès au connecteur USB ;
- aucun cuivre ou métal gênant dans la zone antenne ;
- impression 1:1 et pose du module réel sur le papier ou le PCB test.

### S1 — C&K / Littelfuse 1101M2S3CQE2 — retiré de la V1

Décision du 28 septembre 2026 : ce composant et son empreinte ne sont plus
utilisés. `JP4`, un header 1×2 au pas de 2,54 mm avec cavalier amovible, reprend
la liaison `BAT_RAW`–`BAT_CTRL`. Les informations ci-dessous restent uniquement
comme trace de l'audit qui a précédé cette décision.

**Source :** datasheet C&K 1000 Series, révision 30 mai 2025,
[document officiel](https://www.ckswitches.com/media/1429/1000.pdf), pages 2 et 4.

La page 2 confirme : `1101` = SPDT On-None-On, `M2` = montage PCB sans pattes de
fixation, `S3` = actionneur 5,08 mm, `C` = broches traversantes. La page 4 donne pour
la terminaison C des trous Ø1,85 mm et un pas de 4,70 mm. Le corps SPDT est indiqué
6,60 × 12,70 mm.

L'empreinte personnalisée documentée utilise trois pads au pas 4,70 mm, perçage 1,85 mm
et pad Ø2,45 mm. L'anneau annulaire n'est que de 0,30 mm ; confirmer qu'il respecte bien
la règle du fabricant PCB. S1 diffère actuellement de la bibliothèque.

À vérifier sur la pièce réelle : orientation de l'actionneur et correspondance
position mécanique ↔ connexion 1-2 / 2-3. Le schéma n'utilise que deux connexions comme
un SPST ; la troisième broche physique reste présente et doit rester sans cuivre voisin
susceptible de la court-circuiter.

### J1, J2 et J8 — borniers Phoenix Contact MKDS 3

**Sources :**

- [1711725, MKDS 3/2-5.08](https://www.phoenixcontact.com/en-de/products/pcb-terminal-block-mkds-3-2-508-1711725), fiche produit et plan de perçage ;
- [1711738, MKDS 3/3-5.08](https://www.phoenixcontact.com/us/products/1711738/pdf), plan coté page 6.

Le fabricant donne un pas de 5,08 mm, des pins 0,9 × 0,9 mm, un trou PCB de 1,30 mm
et un courant nominal de 24 A. Les empreintes natives KiCad sont adaptées.

J1 et J2 diffèrent toutefois de leur bibliothèque ; J8 ne produit pas ce warning. Comparer
J1/J2 avant mise à jour. À 20 A, vérifier aussi les étranglements cuivre autour des trous,
le serrage conducteur et la température du bornier.

**Décision prototype :** J1 doit être peuplé, de même que J8/D2. Changer son texte de
valeur pour supprimer `DNP`. Cette double population démontre les deux variantes mais
n'autorise jamais leur utilisation simultanée.

### J5 et J6 — JST PH horizontal 2,00 mm

**Source :** `jst-ph-battery-connector/jst-ph-series-eph.pdf`, pages 1 à 3,
SHA-256 `447624F4F2F7D37C58C1EAA7EE314AD757FE7AFF48F6186491EF6F69FBC00B96` ;
[catalogue officiel JST PH](https://www.jst-mfg.com/product/index.php?lang=2&series=153).

Les empreintes natives correspondent aux variantes horizontales `S4B-PH-K` et
`S2B-PH-K`. Les références retenues sont `S4B-PH-K-S(LF)(SN)` pour J5 et
`S2B-PH-K-S(LF)(SN)` pour J6. Les boîtiers câble associés sont respectivement `PHR-4`
et `PHR-2`, avec contacts `SPH-002T-P0.5S`. J6 diffère actuellement de la bibliothèque.

À faire :

- renseigner les MPN retenus et la datasheet dans le schéma ;
- pour J6, vérifier physiquement la polarité du câble de batterie : pad 1 = BAT_RAW,
  pad 2 = GND dans la conception, mais les câbles JST de batteries ne sont pas tous
  câblés de façon universelle.

### J3, J7, J9 et JP3 — headers génériques 2,54 mm

Les empreintes sont des empreintes KiCad natives génériques, mais aucun MPN n'est défini.
La géométrie PCB ne garantit donc ni la hauteur, ni le type de détrompage, ni la longueur
de broche. Choisir un header réellement achetable et vérifier son perçage avant commande.
JP3 doit en plus rester un interlock manipulable et clairement sérigraphié.

### JP1 et JP2 — jumpers d'adresse

Ce sont des empreintes officielles de la bibliothèque KiCad :
`SolderJumper-3_P1.3mm_Bridged12_Pad1.0x1.5mm_NumberLabels`. Elles ne viennent pas
d'une création personnalisée. `Bridged12` signifie que l'état par défaut relie 1 et 2.

À vérifier : pad 1 = GND, pad central = A0/A1, pad 3 = +3V3, et l'adresse par défaut
souhaitée. Le net automatique du pad central peut s'afficher `Net-(JPx-C)` ; ce nom n'est
pas à lui seul une erreur.

### C6 — Panasonic EEU-FC2A100

**Source :** `lm5164-aux-supply/panasonic-eeu-fc-series.pdf` et
[fiche produit officielle](https://industrial.panasonic.com/ww/products/pt/aluminum-cap-lead/models/EEUFC2A100),
SHA-256 `42D91AE29AB6122DFE20974ABAD2EFD45D91A29337A73C5A5319616301B004F7`.

La fiche donne Ø6,3 mm, hauteur 11,2 mm et pas de broches 2,5 mm ; l'empreinte native
`CP_Radial_D6.3mm_P2.50mm` convient. C6 diffère toutefois de la version installée de la
bibliothèque : comparer sans déplacer la polarité ni le centre des trous.

### Passifs SMD standards

Les 0805, 1206 et 1210 utilisent des empreintes KiCad standards ; il n'est pas utile de
valider séparément la mécanique de chaque résistance identique. En revanche, une BOM
fabricable exige des MPN exacts.

Priorités électriques :

- C5/C7/C8 : Samsung `CL32Y106KCVZ4NE`, 10 µF / 100 V, X7S, 1210, environ
  4,18 µF effectifs au total à 80 V/25 °C. Ce choix couvre le minimum effectif TI de
  2,2 µF mais pas sa recommandation conservatrice de tension nominale 2 × VIN ; limiter
  le bus protégé, transitoires compris, à 80 V et valider sur prototype ;
- C12/C13 : renseigner tension, diélectrique et MPN ;
- R12–R18 : contrôle calculé effectué. UVLO 1 MΩ/200 kΩ : 9,0 V/8,4 V, 4,44 mW et
  0,89 mW à 80 V ; FB 316 kΩ/100 kΩ : environ 5,0 V, puissance négligeable.
  R12/RON est corrigé vers GND dans le schéma ;
- conserver C9 BST-SW et les condensateurs d'entrée/sortie au plus près des broches
  concernées, conformément aux pages d'implantation du LM5164.

## Traitement des 43 divergences de bibliothèque

Une divergence signifie que la copie placée dans le PCB n'est plus identique à la
bibliothèque actuellement chargée. Les causes possibles sont une modification locale,
une ancienne version de KiCad, un texte déplacé ou une vraie différence de pads.

Ordre conseillé dans l'interface KiCad :

1. Faire une copie/version Git avant toute synchronisation.
2. Traiter d'abord U2, JP4, F2, R1, L1, C6, J1/J2 et J6, une référence à la fois.
3. Utiliser `Outils > Mettre à jour les empreintes depuis les bibliothèques`, filtrer sur la
   référence, puis examiner les changements proposés avant validation.
4. Si la copie PCB contient la correction validée, mettre à jour la bibliothèque depuis
   l'éditeur d'empreinte plutôt que d'écraser la copie PCB.
5. Rerouter ou replacer seulement après avoir compris chaque changement de pad.
6. Relancer DRC et contrôler l'orientation/pin 1 après chaque groupe.

Les 43 warnings ne doivent pas être supprimés globalement ni ignorés avant fabrication.

## Contrôles DRC à réactiver avant fabrication

Le projet ignore actuellement cinq familles de tests. Au minimum, réactiver temporairement
et examiner :

- `Footprint has no courtyard defined` ;
- `Footprint doesn't match symbol's footprint filters` ;
- `Footprint component type doesn't match footprint pads`.

Le contrôle `Track endpoint not centered on via` peut rester un avertissement de qualité,
mais il est utile pour détecter des raccordements fragiles. Les exclusions intentionnelles
doivent être documentées individuellement.

## Checklist manuelle finale

- [x] Enregistrer l'exception U4 pad 2 ↔ pad 9 à 0,45 mm et confirmer 0 erreur DRC.
- [x] Décider MCP42100 et mettre à jour les règles/documentation de référence.
- [~] `RON_SET → R12 → GND` corrigé dans le schéma ; supprimer l'ancien segment
  de piste, synchroniser le PCB et vérifier avant alimentation.
- [ ] Résoudre les divergences U2, JP4, F2, R1, L1, C6, J1/J2 et J6.
- [x] Reporter dans KiCad le MPN définitif de F2 : Littelfuse `0449001.MR`.
- [x] Supprimer `DNP` du texte de J1 et le laisser peuplé pour les premiers prototypes.
- [ ] Choisir les MPN exacts de tous les connecteurs et passifs critiques.
- [ ] Vérifier sur pièce réelle JP4, U2 et la polarité de J6.
- [ ] Prévoir et tester le refroidissement de D2.
- [ ] Valider l'épaisseur/largeur de cuivre et la température de F1 à courant réel.
- [ ] Imprimer les couches fabrication à l'échelle 1:1 et poser les composants sensibles.
- [ ] Nettoyer les 45 avertissements de sérigraphie.
- [ ] Réactiver les contrôles de courtyard et de cohérence d'empreinte.
- [ ] Relancer ERC, DRC avec remplissage des zones, parité schéma/PCB et inspection 3D.

## Documents archivés et traçabilité

Les principaux documents déjà archivés ont été identifiés par les SHA-256 indiqués dans
les sections ci-dessus. Restent à archiver localement avec leur révision et leur SHA-256 :

- Littelfuse 456 Series pour F1 ;
- C&K 1000 Series pour l'ancien S1 (historique, non bloquant) ;
- fiches PDF Phoenix Contact 1711725 et 1711738.

Cette absence d'archive locale ne remet pas en cause les vérifications ci-dessus, mais elle
doit être corrigée pour figer la révision utilisée au moment de la fabrication.
