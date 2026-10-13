# Guide de routage apres implantation

13 octobre 2026. PCB V2, deux couches. Guide de travail, pas une validation
de fabrication. Les composants sont tous places, mais certaines positions
restent a optimiser au passage des pistes. Aucune nouvelle piste ni via ajoute.

## Comment utiliser ce document

Le dessus (`F.Cu`) reste prioritaire. Un passage dessous (`B.Cu`) doit apporter
un trajet plus court ou un meilleur retour, et non simplement compenser un
mauvais placement. Avant chaque passage : regarder si retourner/decaler une
resistance, un connecteur ou un CI resout le croisement sans degrader sa fonction.

Les passages ci-dessous sont des **candidats**, pas des vias deja necessaires
ou traces. Le schema du ratsnest ne prouve pas qu'une piste doit croiser une
autre. Ne pas confondre un segment dessous de signal avec les connexions de
puissance aux MOSFET/bridge montes dessous, ni avec les vias de masse/thermiques.

Pour chaque candidat confirme pendant le routage, noter ici : net, points de
transition, raison, alternative dessus rejetee et verification du retour GND.
Conserver un retour proche; ne pas decouper le plan de masse par une longue
piste dessous inutile. Les trous traversants donnent deja acces aux deux faces.

## Registre des passages a examiner

Les noms courts ci-dessous conservent exactement le suffixe du net KiCad.
`BQ_*`/`CV_FB` appartiennent a `/MAIN_CONVERTER_TBD/`, `POT_*` et
`CV_AUTO_N` a `/CC_CONTROL/`. Les references et pins sont celles du PCB relu.

| Priorite | Net / bornes | Dessous envisage et justification | Alternative dessus / precaution |
|---|---|---|---|
| 1 | USB avant U8 : `Net-(J27-D+-PadA6)` et `Net-(J27-D--PadA7)` | Croisement local probable pour reunir les doubles contacts USB-C. A x=17.68, ordre des pads suivant Y : B7 D- (44.25), A6 D+ (44.75), A7 D- (45.25), B6 D+ (45.75). Les contacts sont entrelaces. | Essayer l'echappement local selon les vraies largeurs/espacements. Ne pas forcer une piste entre pads hors regles. Ne pas mettre un via dans une pastille sans procede approuve. U8 est juste a droite; ne pas rallonger toute la paire pour eviter ce petit croisement. |
| 1 | `USB_DP`, `USB_DM`, U8 -> R32/R33 -> U2.27/.26; derivation J21.1/.2 | Aucun passage dessous impose a ce stade. Reserve de couloir entre USB et ESP, mais ordre des sorties et branches a verifier. | Tracer la paire ensemble avec retour GND continu. J21 est un acces de test, pas une raison de faire un long T. Revoir sa place si la branche devient longue. Pas de promesse d'impedance avant calcul sur le stackup retenu. |
| 1 | `BQ_HIDRV1`, `BQ_SW1`, `BQ_BTST1`, U9.27/.28/.26, C65, R76, Q10 | Possibles croisements locaux dans l'echappement du BQ. Choisir selon boucle gate/source et bootstrap, pas selon le seul nombre de vias. | Essayer dessus d'abord, en ajustant R76/C65 au besoin. Ne pas faire passer le retour SW par le long cuivre de puissance avant de revenir au driver. Ne pas traverser une zone analogique avec SW. |
| 1 | `BQ_HIDRV2`, `BQ_SW2`, `BQ_BTST2`, U9.19/.18/.20, C66, R78, Q12 | Meme examen pour le second demi-pont. Aucun passage deja fixe. | Boucle compacte, retour associe; verifier aussi LODRV1/2 vers R77/R79 et Q11/Q13 avant de bloquer l'echappement. |
| 1 | `BQ_ACP`, `BQ_ACN`, `Net-(R1-Pad3)`, `Net-(R1-Pad2)`; R1 -> R80/R81/C67 -> U9.30/.29 | Ne PAS reserver arbitrairement dessous. Garder la paire Kelvin ensemble; une courte transition peut etre preferable a un contournement pres des grilles. | Partir des vrais pads sense R1.3/.2, pas du cuivre de puissance. Pas de courant de puissance dans ces pistes. R1 est a (81,41), BQ a (84,60). |
| 1 | `BQ_SRP`, `BQ_SRN`, R75 -> R82/R83/C70 -> U9.14/.13 | Meme precaution Kelvin pour le shunt deux bornes R75. | Prelever aux terminaisons du shunt separement du trajet de puissance. Garder les deux chemins proches et hors SW; ne pas les mutualiser avec la sortie vers J31. |
| 2 | `BQ_SCL`, `BQ_SDA`, `BQ_INT`, `BQ_CE`, J32.2/.3/.4/.5 -> U9 et R68/R69/R70/R71 | Courts passages dessous probables au droit des pistes de phases F.Cu conservees. J32 est a x=49; une colonne GEN_W a x=54 barre le trajet direct aux Y concernes. | Comparer avec un chemin au-dessus de J8 (Y inferieur a ~58) ou deplacer J32. Un header de service peut bouger avant d'imposer de longs detours au bus principal. Croiser les phases brievement, sans les longer; retour proche. |
| 2 | `BQ_TS`, J33.1 -> R72/R73/U9.8, et GND J33.2 | Passage dessous probable entre J33 (40,84) et le reseau TS (77.5,68.5/71), a travers le couloir des phases. | Comparer le deplacement de J33 vers le reseau TS avec l'accessibilite du cable radiateur. Acheminer TS avec son retour calme, loin des noeuds SW. Pas de retour de la thermistance par la masse de puissance. |
| 2 | `CV_FB`, K1.3 -> R66.2/U9.12; `BQ_FBG`, U9.11 -> RV2.3 | Trajets analogiques encore a optimiser. Ne pas conclure que K1 impose de traverser les trois phases : K1 se trouve au-dessus du couloir de puissance. | Reserver d'abord un couloir calme vers la gauche du BQ. R66 et les deux trimmers restent deplacables. Ne pas allonger FB autour de la carte pour obtenir un trajet tout-dessus. |
| 2 | `Net-(R61-Pad2)`, R61.2 -> RV1.3 et retour GND RV1.1/.2 | RV1 est provisoirement en haut a (84,25), assez loin de R61 (77.5,62.75). Ce trajet est une reserve de placement, PAS un chemin dessous valide. | Rapprocher RV1 si son retour calme ne peut etre garanti. Son accessibilite au tournevis ne justifie pas de longer SW ou les courants d'entree. R61 doit rester pres d'ICHG. |
| 3 | `POT_CS`, `POT_SCK`, `POT_MOSI`, U2.19/.20/.21 -> U3.1/.2/.3 | Petit croisement local possible autour de U3 : son orientation favorise le canal analogique vers K1 et le canal libre vers J7, mais le SPI arrive du cote oppose a l'ESP. | Essayer couloir a gauche/puis en bas de U3. Si croisement necessaire, privilegier la transition d'une ligne numerique plutot qu'un detour de `CV_POT1_AW`. Verifier le retour et ne pas longer FB. |
| 3 | `CV_AUTO_N`, U2.30 -> R87/Q22; `CV_DRIVE`, Q22 -> Q21/K1 | Dessus prefere; aucune necessite dessous identifiee. | Garder les transistors, diode de roue libre et bobine proches. Ne pas faire partager le retour de bobine au retour de mesure analogique. |
| 3 | `/I2C_SDA`, `/I2C_SCL`, U2 -> R4/R6 -> R69/R68; `/GPIO_EXT*`, `/STATUS_LED` | Dessus prefere dans la zone logique gauche; croisements locaux possibles avec SPI/USB. | Donner la priorite de couloir a USB et aux retours analogiques. Les resistances de J5 peuvent etre decalees plutot que multiplier les transitions. |

## Point de placement a reprendre avant la puissance

Le trajet `BUS_PROTECTED`/`BQ_IN` est actuellement trop long pour etre accepte
sans revue : F1 reste en bas (79.525,125.3), JP30 est a (94,123), alors que
C73/C81 et R1 sont en haut (Y=28/42/41). Le placement a preserve les 17 segments
de V1, pas prouve qu'ils sont optimaux pour V2.

Avant de router ce courant, comparer deux options sur l'ensemble aller/retour :

1. Rapprocher F1/JP30/D1 de l'entree du convertisseur, en reprenant uniquement
   les segments conserves devenus incompatibles.
2. Revoir l'orientation du bloc redressement/entree pour alimenter ce groupe
   plus directement, sans deplacer les decouplages critiques du BQ.

Ne pas decider de faire un grand chemin dessous sous le BQ pour sauver ce
placement. Un trajet court et large, ses goulots et le retour GND doivent etre
etablis avant le routage de puissance. Aucune de ces reprises cuivre n'est faite.

## Ordre pratique

1. Finaliser regles V2 : clearance, largeurs/sections, echappement QFN, vias et
   USB. Les classes heritees de V1 ne qualifient PAS encore les nouveaux nets.
2. Fermer le point du chemin F1/JP30, puis verifier les boucles locales
   C77/C78-Q10/Q11 et C79-Q12/Q13, L3 et les retours associes.
3. Router les drivers/bootstraps et decouplages critiques, puis les deux paires
   Kelvin et les commandes analogiques. Revoir RV1/K1/R66 si besoin.
4. Router USB, puis alimentation logique, I2C/SPI, GPIO et acces de test.
5. Reporter les passages B.Cu effectivement retenus dans le registre ci-dessus.
   Controler aussi les chemins GND; une piste courte sans retour proche ne suffit pas.
6. Finaliser plans, thermique, serigraphie et contour, puis DRC/parite complets.

## Reserves physiques

Le contour de travail fait 110x110mm, pas une dimension de produit figee.
Q10-Q13 et D2 sont dessous, le reste dessus. Les enveloppes de boitiers verticaux
ne prouvent pas le montage couche, les pattes pliees, les isolants ni les brides.
Les queues traversantes des condensateurs/connecteurs doivent rester isolees du
radiateur. Ne pas couvrir l'antenne ESP avec la plaque ou le boitier metallique.

U2 est place au bord haut avec debord d'antenne. Le contour/keepout RF exact
reste a verifier, sans le confondre avec la zone des pads GND du module.
Reference : [guide PCB officiel Espressif ESP32-C3](https://docs.espressif.com/projects/esp-hardware-design-guidelines/en/latest/esp32c3/pcb-layout-design.html).
Le guide prefere l'antenne hors carte; sinon son degagement prescrit doit etre
respecte. Aucune zone RF native ni validation radio n'est apportee par cette passe.

Voir le [checkpoint de placement](PCB_FULL_PLACEMENT_PASS4_2026-10-13.md)
pour les controles et les erreurs encore presentes.
