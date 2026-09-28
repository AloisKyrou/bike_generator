# Nomenclature de travail — contrôleur V1

Statut : **schéma corrigé, PCB non prêt à commander**. Les composants principaux
sont sélectionnés et RON est corrigé dans le schéma. Le PCB doit encore être
synchronisé après reprise du segment de piste R12, le cuivre de F1 doit être
élargi et les divergences d'empreintes doivent être résolues.

| Références | Qté | Valeur / référence | Empreinte ou état |
|---|---:|---|---|
| U1 | 1 | Texas Instruments `INA228AIDGSR` | `Package_SO:TSSOP-10_3x3mm_P0.5mm` ; Manufacturer/MPN renseignés dans KiCad |
| U2 | 1 | DFR0868 Beetle ESP32-C3 V2.0 | `BikeGenerator:DFR0868_Beetle_ESP32-C3_V2_Socketed` ; deux sockets femelles 1×8, 2,54 mm, entraxe 17,78 mm |
| U2-SKT | 2 | Würth `61300811821`, socket femelle 1×8, 2,54 mm, THT, 3 A | géométrie native KiCad 1×8 intégrée dans l'empreinte U2 ; perçage 1,00 mm |
| U2-HDR | 2 | Würth `61300811121`, barrette mâle 1×8, 2,54 mm, THT | candidate à souder au Beetle ; confirmer l'insertion des broches 0,64 mm dans ses trous Ø0,90 mm |
| U3 | 1 | Microchip `MCP42100-I/SL`, 100 kΩ, double canal CC/CV | `Package_SO:SOIC-14_3.9x8.7mm_P1.27mm` ; décision V1 confirmée |
| R2, R3 | 2 | Yageo `RC0805FR-0710RL`, 10 Ω, 1 % | `Resistor_SMD:R_0805_2012Metric_Pad1.20x1.40mm_HandSolder` |
| R4, R6 | 2 | Yageo `RC0805FR-074K7L`, 4,7 kΩ, 1 % | même empreinte 0805 HandSolder |
| R5, R7, R8, R11, R19 | 5 | Yageo `RC0805FR-0710KL`, 10 kΩ, 1 % | même empreinte 0805 HandSolder |
| R9, R10 | 2 | 1 kΩ, 1 % | même empreinte 0805 HandSolder |
| C1, C2 | 2 | Yageo `CC0805KRX7R9BB104`, 100 nF, 50 V, X7R | `Capacitor_SMD:C_0805_2012Metric_Pad1.18x1.45mm_HandSolder` |
| C3 | 1 | Yageo `CC0805KKX7R7BB105`, 1 µF, 16 V, X7R | même empreinte 0805 HandSolder |
| C4 | 1 | Yageo `CC0805KRX7R9BB104`, 100 nF, 50 V, X7R, découplage local de U3 | `Capacitor_SMD:C_0805_2012Metric_Pad1.18x1.45mm_HandSolder` |
| JP1, JP2 | 2 | cavalier de soudure 3 pads | pont 1–2 fermé par défaut vers GND |
| J7, J9 | 2 | `J_CC_CTRL` / `J_CV_CTRL`, 1×3, 2,54 mm | empreintes génériques ; interfaces du MCP42100 |
| J2 | 1 | `J_DISPLAY_I2C`, 1×4, 2,54 mm | empreinte générique provisoire |
| J3 | 1 | `J_DEBUG_UART`, 1×4, 2,54 mm | empreinte générique provisoire |
| TP1–TP11 | 11 | points de test | empreinte à revoir avant placement PCB |

## Chemin de puissance placé à titre provisoire

| Référence | Qté | Valeur / rôle | État |
|---|---:|---|---|
| J1 | 1 | entrée génératrice DC, Phoenix Contact `MKDS 3/2-5,08`, MPN `1711725`, 24 A / 400 V | peuplée sur les premiers prototypes ; ne jamais utiliser avec J8 simultanément |
| J8 | 1 | entrée génératrice triphasée, Phoenix Contact `MKDS 3/3-5,08`, MPN `1711738` | peuplée avec D2 sur les premiers prototypes |
| D2 | 1 | Diotec Semiconductor `DBI25-16A`, pont triphasé | `BikeGenerator:Diode_Bridge_Diotec_DBI-A_5Pin_P7.50mm` ; dissipateur/châssis obligatoire au-delà de 4 A prolongés |
| F1 | 1 | Littelfuse `0456020.ER`, série 456, 20 A | `BikeGenerator:Fuse_Littelfuse_456_10.08x3.05mm_P9.35mm` ; cuivre 105 µm et 10 mm équivalents à réaliser |
| R1 | 1 | Bourns `CSS4J-4026K-2L00F`, 2 mΩ, 4 bornes, 6 W | `Resistor_SMD:R_Shunt_Isabellenhuette_BVR4026` ; land pattern Bourns comparé et identique, choix V1 figé |
| J2 | 1 | départ vers buck CV/CC, Phoenix Contact `MKDS 3/2-5,08`, MPN `1711725`, 24 A / 400 V | empreinte native KiCad |
| F2 | 1 | Littelfuse `0449001.MR`, 1 A / 125 V Slo-Blo | `BikeGenerator:Fuse_Littelfuse_0449001MR_6.10x2.69mm` ; choix V1 finalisé |
| D1 | 1 | Littelfuse `SMCJ70A`, TVS unidirectionnelle 70 V, 1500 W | `Diode_SMD:D_SMC` ; montée après `F1` et avant `R1`, protection transitoire best effort |

Le bornier `1711725` accepte les conducteurs rigides jusqu'à 4 mm² et les
conducteurs souples jusqu'à 2,5 mm². Son courant nominal de 24 A laisse une
marge raisonnable sur l'enveloppe V1 de 20 A continus ; cette marge ne remplace
pas le dimensionnement thermique du cuivre du PCB.

Pour `F1`, la référence Littelfuse `0456020.ER` impose une validation thermique
du cuivre : le montage de référence fabricant à 20 A utilise au moins 100 µm
de cuivre et 10 mm de largeur. Le routage actuel de 5 mm doit être élargi avant
fabrication.

## Alimentation auxiliaire — première passe placée dans KiCad

| Référence provisoire | Qté | Valeur / référence | État |
|---|---:|---|---|
| U4 | 1 | Texas Instruments `LM5164DDAT`, 6–100 V, 1 A | `BikeGenerator:SOIC-8-1EP_DDA_EP2.95x4.9mm_6Vias_D0.30mm` ; Manufacturer/MPN renseignés ; RON corrigé dans le schéma, PCB à synchroniser |
| L1 | 1 | Coilcraft `MSS1038-473MLC`, 47 µH ±20 % | `Inductor_SMD:L_Coilcraft_MSS1038-XXX` ; choix V1 validé |
| C5, C7, C8 | 3 | Samsung `CL32Y106KCVZ4NE`, 10 µF, 100 V, X7S | `Capacitor_SMD:C_1210_3225Metric_Pad1.33x2.70mm_HandSolder` ; environ 4,18 µF effectifs au total à 80 V et 25 °C ; compromis prototype documenté |
| C6 | 1 | Panasonic `EEU-FC2A100`, 10 µF / 100 V, radial | `Capacitor_THT:CP_Radial_D6.3mm_P2.50mm` ; choix V1 figé |
| C12, C13 | 2 | Samsung `CL32B226KOJNNNE`, 22 µF, 16 V, X7R | même empreinte 1210 HandSolder ; choix V1 figé |
| R12 | 1 | Yageo `RC1206FR-0741K2L`, 41,2 kΩ, 1 %, 250 mW | valeur correcte ; relie `RON_SET` à GND dans le schéma, jamais à VIN |
| R17, R18 | 2 | Yageo `RT0805BRD07316KL` / `RT0805BRD07100KL`, 0,1 % | diviseur FB, 0805 HandSolder ; choix V1 figé |
| R13, R14 | 2 | Yageo `RC0805FR-071ML` / `RC0805FR-07200KL`, 1 % | diviseur UVLO, 0805 HandSolder ; choix V1 figé |
| R16, C11, C10 | 3 | Yageo `RC0805FR-07200KL` / `CC0805KRX7R9BB332` / `CC0805JRNPO9BN820` | réseau d'ondulation, 0805 HandSolder ; choix V1 figé |
| C9 | 1 | Yageo `CC0805KRX7R9BB222`, 2,2 nF, 50 V, X7R | 0805 HandSolder ; choix V1 figé |
| R15 | 1 | Yageo `RC0805FR-0747KL`, 47 kΩ, 1 % | pull-up PGOOD, 0805 HandSolder ; choix V1 figé |
| D_AUX | 0 | non montée en V1 | supprimée de la BOM : une diode placée sur l'arrivée du LM5164 n'isolerait pas le VBUS USB du Beetle ; l'isolation V1 repose sur `JP3` ouvert avant toute connexion USB |
| F_AUX | 1 | Littelfuse `0449001.MR`, 1 A / 125 V Slo-Blo | land pattern Littelfuse exact créé et affecté à `F2` |
| JP_GEN_5V | 1 | cavalier d'isolation générateur / USB | `Connector_PinHeader_2.54mm:PinHeader_1x02_P2.54mm_Vertical`, provisoire ; ouvert en mode USB/service |
| J_EXT_GPIO (`J5`) | 1 | JST `S4B-PH-K-S(LF)(SN)`, 4 contacts, pas 2,00 mm, entrée latérale | `Connector_JST:JST_PH_S4B-PH-K_1x04_P2.00mm_Horizontal` ; côté câble `PHR-4` + contacts `SPH-002T-P0.5S` |
| J_BAT_CTRL | 1 | JST `S2B-PH-K-S(LF)(SN)`, 2 contacts, pas 2,00 mm, entrée latérale | `Connector_JST:JST_PH_S2B-PH-K_1x02_P2.00mm_Horizontal` ; vérifier polarité et accès dans le boîtier |
| J_BAT_HOUSING | 1 | JST `PHR-2` | côté câble |
| J_BAT_CONTACT | 2 + rechange | JST `SPH-002T-P0.5S` | sertissage pour calibre de fil compatible AWG 30–24 |
| JP_BAT (`JP4`) | 1 | header 1×2, pas 2,54 mm + cavalier de court-circuit, courant admissible ≥ 1 A | `Connector_PinHeader_2.54mm:PinHeader_1x02_P2.54mm_Vertical` ; relie `BAT_RAW` à `BAT_CTRL` ; cavalier retiré pour stockage ou maintenance |
| BAT_CTRL | 1 | LiPo 1S protégée `801350`, 3,7 V, 500 mAh | sélection utilisateur ; vérifier la fiche et l'autorisation de charge à 400 mA (0,8 C) |
| HS_D2 | 1 | dissipateur/plaque aluminium, face plane ≥ 35 × 25 mm | MPN à choisir avec le boîtier ; interface thermique + vis/rondelle/écrou M4, couple 1 N·m ±10 % |

Références réellement utilisées dans la première passe KiCad : `JP3` pour
`JP_GEN_5V`, `J6` pour `J_BAT_CTRL`, `JP4` pour `JP_BAT`, et `TP12` à `TP15`
pour les points de test de l'alimentation auxiliaire. `JP4` remplace le coûteux
interrupteur C&K de la première proposition et réutilise le même type de header
et de cavalier amovible que `JP3`.

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
2. validation sur prototype de l'écrêtage réel de `D1` et stratégie de masse du chemin de puissance ;
3. compatibilité électrique mesurée entre `J_CC_CTRL` et le potentiomètre du
   buck ;
4. validation sur prototype de la marge des MLCC d'entrée après correction documentée de leur capacité sous polarisation ;
5. tension à vide et transitoires permettant de figer la protection de la
   première source ;
6. fiche exacte de la batterie 801350 et courant de charge autorisé ;
7. stratégie d'isolation entre alimentation générateur et USB.
