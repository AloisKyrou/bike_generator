# Nomenclature de travail — contrôleur V1

Statut : **schéma en cours, non prêt à commander**. Le squelette de puissance
est représenté, mais le shunt, les protections, l'alimentation auxiliaire et
les connecteurs de fort courant ne sont pas encore sélectionnés physiquement.

| Références | Qté | Valeur / référence | Empreinte ou état |
|---|---:|---|---|
| U1 | 1 | INA228AIDGSR | `Package_SO:TSSOP-10_3x3mm_P0.5mm` |
| U2 | 1 | DFR0868 Beetle ESP32-C3 V2.0 | `BikeGenerator:DFR0868_Beetle_ESP32-C3_V2_Socketed` ; deux sockets femelles 1×8, 2,54 mm, entraxe 17,78 mm |
| U2-SKT | 2 | Würth `61300811821`, socket femelle 1×8, 2,54 mm, THT, 3 A | géométrie native KiCad 1×8 intégrée dans l'empreinte U2 ; perçage 1,00 mm |
| U2-HDR | 2 | Würth `61300811121`, barrette mâle 1×8, 2,54 mm, THT | candidate à souder au Beetle ; confirmer l'insertion des broches 0,64 mm dans ses trous Ø0,90 mm |
| U3 | 1 | Microchip `MCP4151-104E/SN`, 100 kΩ, simple canal | `Package_SO:SOIC-8_3.9x4.9mm_P1.27mm` |
| R1, R2 | 2 | Yageo `RC0805FR-0710RL`, 10 Ω, 1 % | `Resistor_SMD:R_0805_2012Metric_Pad1.20x1.40mm_HandSolder` |
| R3, R4 | 2 | Yageo `RC0805FR-074K7L`, 4,7 kΩ, 1 % | même empreinte 0805 HandSolder |
| R5, R6 | 2 | Yageo `RC0805FR-0710KL`, 10 kΩ, 1 % | même empreinte 0805 HandSolder |
| C1, C3 | 2 | Yageo `CC0805KRX7R9BB104`, 100 nF, 50 V, X7R | `Capacitor_SMD:C_0805_2012Metric_Pad1.18x1.45mm_HandSolder` |
| C2 | 1 | Yageo `CC0805KKX7R7BB105`, 1 µF, 16 V, X7R | même empreinte 0805 HandSolder |
| C12 | 1 | Yageo `CC0805KRX7R9BB104`, 100 nF, 50 V, X7R, découplage local de U3 | `Capacitor_SMD:C_0805_2012Metric_Pad1.18x1.45mm_HandSolder` |
| JP1, JP2 | 2 | cavalier de soudure 3 pads | pont 1–2 fermé par défaut vers GND |
| J1 | 1 | `J_CC_CTRL`, 1×3, 2,54 mm | empreinte générique provisoire |
| J2 | 1 | `J_DISPLAY_I2C`, 1×4, 2,54 mm | empreinte générique provisoire |
| J3 | 1 | `J_DEBUG_UART`, 1×4, 2,54 mm | empreinte générique provisoire |
| TP1–TP11 | 11 | points de test | empreinte à revoir avant placement PCB |

## Chemin de puissance placé à titre provisoire

| Référence | Qté | Valeur / rôle | État |
|---|---:|---|---|
| J4 | 1 | entrée redressée, Phoenix Contact `MKDS 3/2-5,08`, MPN `1711725`, 24 A / 400 V | `TerminalBlock_Phoenix:TerminalBlock_Phoenix_MKDS-3-2-5.08_1x02_P5.08mm_Horizontal` ; choix V1 figé |
| F1 | 1 | Eaton Bussmann `ABC-V-20-R`, rapide, 20 A, 125 VDC / 250 VAC | `BikeGenerator:Fuse_Eaton_ABC-V-20-R_Axial_P38.10mm` ; fusible axial soudé, choix V1 figé |
| R7 | 1 | Bourns `CSS4J-4026K-2L00F`, 2 mΩ, 4 bornes, 6 W | `Resistor_SMD:R_Shunt_Isabellenhuette_BVR4026` ; land pattern Bourns comparé et identique, choix V1 figé |
| J5 | 1 | départ vers buck CV/CC, Phoenix Contact `MKDS 3/2-5,08`, MPN `1711725`, 24 A / 400 V | même empreinte native que J4 ; choix V1 figé |
| F2 | 1 | Littelfuse `0449001.MR`, 1 A / 125 V Slo-Blo | `BikeGenerator:Fuse_Littelfuse_0449001MR_6.10x2.69mm` ; appel à valider |
| D_TVS | 1 | TVS parallèle, boîtier SMCJ envisagé, référence non figée | transitoires courts seulement ; sélection spécifique à la source après mesure, DNP par défaut |

Le bornier `1711725` accepte les conducteurs rigides jusqu'à 4 mm² et les
conducteurs souples jusqu'à 2,5 mm². Son courant nominal de 24 A laisse une
marge raisonnable sur l'enveloppe V1 de 20 A continus ; cette marge ne remplace
pas le dimensionnement thermique du cuivre du PCB.

Pour `F1`, l'Eaton Bussmann `ABC-V-20-R` évite un porte-fusible PCB dont le
courant admissible ne serait pas démontré. Son empreinte locale utilise
l'enveloppe maximale 32,82 × 6,76 mm, des fils Ø1,02 mm, un entraxe de montage
choisi de 38,10 mm, des trous Ø1,30 mm et des pads 4,00 × 5,00 mm. Le fusible
est soudé : son remplacement impose un dessoudage.

## Alimentation auxiliaire — première passe placée dans KiCad

| Référence provisoire | Qté | Valeur / référence | État |
|---|---:|---|---|
| U4 | 1 | LM5164DDAT, 6–100 V, 1 A | `BikeGenerator:SOIC-8-1EP_DDA_EP2.95x4.9mm_6Vias_D0.30mm` ; six vias Ø0,60/0,30 mm, DRC validé |
| L1 | 1 | Coilcraft `MSS1038-473MLC`, 47 µH ±20 % | `Inductor_SMD:L_Coilcraft_MSS1038-XXX` ; choix V1 validé |
| C4, C5, C13 | 3 | Samsung `CL32Y106KCVZ4NE`, 10 µF, 100 V, X7S | `Capacitor_SMD:C_1210_3225Metric_Pad1.33x2.70mm_HandSolder` ; environ 4,18 µF effectifs au total à 80 V et 25 °C selon la courbe fabricant ; transcrit et raccordé dans KiCad |
| C6 | 1 | Panasonic `EEU-FC2A100`, 10 µF / 100 V, radial | `Capacitor_THT:CP_Radial_D6.3mm_P2.50mm` ; choix V1 figé |
| C7, C8 | 2 | Samsung `CL32B226KOJNNNE`, 22 µF, 16 V, X7R | même empreinte 1210 HandSolder ; choix V1 figé |
| R8 | 1 | Yageo `RC1206FR-0741K2L`, 41,2 kΩ, 1 %, 250 mW | `Resistor_SMD:R_1206_3216Metric_Pad1.30x1.75mm_HandSolder` ; choix V1 figé pour 80 V max |
| R11, R12 | 2 | Yageo `RT0805BRD07316KL` / `RT0805BRD07100KL`, 0,1 % | 0805 HandSolder ; choix V1 figé |
| R9, R10 | 2 | Yageo `RC0805FR-071ML` / `RC0805FR-07200KL`, 1 % | 0805 HandSolder ; choix V1 figé |
| R13, C10, C11 | 3 | Yageo `RC0805FR-07200KL` / `CC0805KRX7R9BB332` / `CC0805JRNPO9BN820` | 0805 HandSolder ; choix V1 figé |
| C9 | 1 | Yageo `CC0805KRX7R9BB222`, 2,2 nF, 50 V, X7R | 0805 HandSolder ; choix V1 figé |
| R14 | 1 | Yageo `RC0805FR-0747KL`, 47 kΩ, 1 % | 0805 HandSolder ; choix V1 figé |
| D_AUX | 0 | non montée en V1 | supprimée de la BOM : une diode placée sur l'arrivée du LM5164 n'isolerait pas le VBUS USB du Beetle ; l'isolation V1 repose sur `JP3` ouvert avant toute connexion USB |
| F_AUX | 1 | Littelfuse `0449001.MR`, 1 A / 125 V Slo-Blo | land pattern Littelfuse exact créé et affecté à `F2` |
| JP_GEN_5V | 1 | cavalier d'isolation générateur / USB | `Connector_PinHeader_2.54mm:PinHeader_1x02_P2.54mm_Vertical`, provisoire ; ouvert en mode USB/service |
| J_BAT_CTRL | 1 | JST `S2B-PH-K-S(LF)(SN)`, 2 contacts, pas 2,00 mm, entrée latérale | `Connector_JST:JST_PH_S2B-PH-K_1x02_P2.00mm_Horizontal` ; vérifier polarité et accès dans le boîtier |
| J_BAT_HOUSING | 1 | JST `PHR-2` | côté câble |
| J_BAT_CONTACT | 2 + rechange | JST `SPH-002T-P0.5S` | sertissage pour calibre de fil compatible AWG 30–24 |
| S_BAT (`S1`) | 1 | C&K / Littelfuse `1101M2S3CQE2`, SPDT ON-ON utilisé en SPST, 6 A sous 28 VDC | `BikeGenerator:SW_1101M2S3CQE2` ; pads 1–2 utilisés, pad 3 volontairement libre ; choix V1 figé sous réserve de l'accès mécanique du boîtier |
| BAT_CTRL | 1 | LiPo 1S protégée `801350`, 3,7 V, 500 mAh | sélection utilisateur ; vérifier la fiche et l'autorisation de charge à 400 mA (0,8 C) |

Références réellement utilisées dans la première passe KiCad : `JP3` pour
`JP_GEN_5V`, `J6` pour `J_BAT_CTRL`, `S1` pour `S_BAT`, et `TP12` à `TP15` pour
les points de test de l'alimentation auxiliaire. `S1` est maintenant affecté
au C&K `1101M2S3CQE2` et placé près de `J6`. Son empreinte téléchargée a été
comparée au dessin C&K : trois perçages Ø1,85 mm espacés de 4,70 mm, corps
6,60 × 12,70 mm et courtyard de 7,10 × 13,20 mm.

La nomenclature d'application 12 V / 1 A publiée par TI n'est pas directement
la nomenclature 5 V du projet. Les valeurs ci-dessus proviennent du
pré-dimensionnement documenté dans
[`../components/lm5164-aux-supply/design-calculation.md`](../components/lm5164-aux-supply/design-calculation.md).
Les références et empreintes des passifs de cette feuille sont figées pour la V1.
Le calcul TI/WEBENCH et la vérification des courbes de capacité sous tension
restent des contrôles de conception à effectuer avant commande.

### Variante économique pour L1

La Bourns `SRP1038C-470M` peut réduire légèrement le coût de la BOM et dispose
de l'empreinte KiCad native `Inductor_SMD:L_Bourns_SRP1038C_10.0x10.0mm`.
Elle n'est toutefois pas recommandée pour les nouvelles conceptions par le
fabricant : elle reste une variante de réduction de coût à réévaluer selon le
prix et la disponibilité, pas la référence V1.

## Affectation des résistances

- `R1`, `R2` : filtre d'entrée différentiel de l'INA228 ;
- `R3`, `R4` : rappels I²C de `SDA` et `SCL` ;
- `R5` : rappel de la sortie open-drain `INA_ALERT` ;
- `R6` : rappel haut de `POT_CS` au démarrage.

## Éléments qui bloquent une commande

1. transitoires et impédance de la première génératrice réellement mesurés ;
2. référence source-spécifique de la TVS et stratégie de masse du chemin de puissance ;
3. compatibilité électrique mesurée entre `J_CC_CTRL` et le potentiomètre du
   buck ;
4. validation sur prototype de la marge des MLCC d'entrée après correction documentée de leur capacité sous polarisation ;
5. tension à vide et transitoires permettant de figer la protection de la
   première source ;
6. fiche exacte de la batterie 801350 et courant de charge autorisé ;
7. stratégie d'isolation entre alimentation générateur et USB.
