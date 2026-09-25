# Passifs figés — contrôleur V1

Date de sélection : 25 septembre 2026.

Cette sélection applique la règle du projet : utiliser en priorité une
empreinte KiCad standard facile à souder à la main, puis retenir une référence
économique et disponible sans sacrifier les caractéristiques nécessaires.
Les prix sont des instantanés indicatifs de la base locale JLCPCB/LCSC.

## INA228, I²C et commande CC

| Références | Fabricant / MPN | LCSC | Caractéristiques | Empreinte KiCad |
|---|---|---|---|---|
| R1, R2 | Yageo `RC0805FR-0710RL` | `C96347` | 10 Ω, 1 %, 125 mW, 150 V | `Resistor_SMD:R_0805_2012Metric_Pad1.20x1.40mm_HandSolder` |
| R3, R4 | Yageo `RC0805FR-074K7L` | `C60816` | 4,7 kΩ, 1 %, 125 mW, 150 V | même empreinte |
| R5, R6 | Yageo `RC0805FR-0710KL` | `C84376` | 10 kΩ, 1 %, 125 mW, 150 V | même empreinte |
| C1, C3 | Yageo `CC0805KRX7R9BB104` | `C49678` | 100 nF, 50 V, X7R, 10 % | `Capacitor_SMD:C_0805_2012Metric_Pad1.18x1.45mm_HandSolder` |
| C2 | Yageo `CC0805KKX7R7BB105` | `C94122` | 1 µF, 16 V, X7R, 10 % | même empreinte |

## Alimentation auxiliaire LM5164

| Références | Fabricant / MPN | LCSC | Caractéristiques | Empreinte KiCad |
|---|---|---|---|---|
| C4, C5, C13 | Samsung `CL32Y106KCVZ4NE` | `C5596909` | 10 µF, 100 V, X7S, 10 % | `Capacitor_SMD:C_1210_3225Metric_Pad1.33x2.70mm_HandSolder` |
| C7, C8 | Samsung `CL32B226KOJNNNE` | `C55530` | 22 µF, 16 V, X7R, 10 % | même empreinte |
| C9 | Yageo `CC0805KRX7R9BB222` | `C107146` | 2,2 nF, 50 V, X7R, 10 % | 0805 condensateur HandSolder |
| C10 | Yageo `CC0805KRX7R9BB332` | `C107149` | 3,3 nF, 50 V, X7R, 10 % | 0805 condensateur HandSolder |
| C11 | Yageo `CC0805JRNPO9BN820` | `C113833` | 82 pF, 50 V, C0G/NP0, 5 % | 0805 condensateur HandSolder |
| R8 | Yageo `RC1206FR-0741K2L` | `C274076` | 41,2 kΩ, 1 %, 250 mW | `Resistor_SMD:R_1206_3216Metric_Pad1.30x1.75mm_HandSolder` |
| R9 | Yageo `RC0805FR-071ML` | `C107700` | 1 MΩ, 1 % | même empreinte |
| R10, R13 | Yageo `RC0805FR-07200KL` | `C114562` | 200 kΩ, 1 % | même empreinte |
| R11 | Yageo `RT0805BRD07316KL` | `C865397` | 316 kΩ, 0,1 %, 25 ppm/°C | même empreinte |
| R12 | Yageo `RT0805BRD07100KL` | `C122537` | 100 kΩ, 0,1 %, 25 ppm/°C | même empreinte |
| R14 | Yageo `RC0805FR-0747KL` | `C126351` | 47 kΩ, 1 % | même empreinte |

### Vérification de la capacité sous polarisation

Les courbes Samsung ont été relues, car la valeur inscrite sur un MLCC n'est
pas sa capacité réellement disponible sous forte tension continue.

- l'ancien `CL32B225KCJSNNE` perd typiquement 76,58 % à 80 V : deux pièces
  de 2,2 µF ne donnent qu'environ 1,03 µF effectif et ne satisfont pas le
  minimum de 2,2 µF demandé près de `VIN` par TI ;
- le `CL32Y106KCVZ4NE` perd typiquement 86,06 % à 80 V, mais sa valeur nominale
  de 10 µF laisse environ 1,394 µF par pièce ; trois pièces donnent environ
  4,18 µF à 25 °C ;
- même en appliquant ensuite une estimation conservatrice combinant la
  tolérance −10 % et l'extrémité négative X7S −22 %, il reste environ 2,94 µF.
  Cette combinaison est une estimation de conception, pas une garantie
  statistique fabricant ; elle sera contrôlée au prototype ;
- les deux `CL32B226KOJNNNE` de sortie perdent typiquement 23,41 % à 5 V et
  donnent encore environ 33,7 µF au total avant tolérance et température :
  leur choix reste valide.

Le remplacement d'entrée conserve exactement la même empreinte 1210 facile à
souder. Il ajoute seulement `C13` en parallèle et évite de faire dépendre la
stabilité du LM5164 du condensateur électrolytique, qui sert principalement à
l'amortissement des câbles.

Les pages fabricant archivées ci-dessous contiennent les données numériques
des courbes affichées :

| Fichier | Usage | SHA-256 |
|---|---|---|
| [`samsung-cl32b225kcjsnn-characteristics.html`](./samsung-cl32b225kcjsnn-characteristics.html) | preuve de l'insuffisance de l'ancien 2,2 µF à 80 V | `1DBA53A854EBFAF748095DAD41A95B7B7149F52A50EFDCFB0997776698457F15` |
| [`samsung-cl32y106kcvz4n-characteristics.html`](./samsung-cl32y106kcvz4n-characteristics.html) | courbe DC-bias du nouveau 10 µF / 100 V | `5BA08E31D29AC8626E4F04B654A8933493DE4228007166485E0A099B5FE8F00A` |
| [`samsung-cl32b226kojnnn-characteristics.html`](./samsung-cl32b226kojnnn-characteristics.html) | courbe DC-bias du 22 µF / 16 V de sortie | `CC36C3795F41E41EDF896F4F254FC2B812162203F7C54DAF8DD770E3CDA7D2AB` |

## Condensateur d'amortissement C6

Le choix V1 est le Panasonic `EEU-FC2A100` : 10 µF / 100 V, Ø6,3 ×
11,2 mm, pas 2,5 mm, 114 mA d'ondulation à 100 kHz et impédance maximale
1,8 Ω. Il utilise l'empreinte native
`Capacitor_THT:CP_Radial_D6.3mm_P2.50mm`, facile à souder à la main. Le Chengx
`KM106M100E11RR0VH2FP0` reste une variante économique possible, non retenue
faute de données fabricant aussi complètes.

## Sources

- [Samsung CL32B225KCJSNNE](https://product.samsungsem.com/mlcc/CL32B225KCJSNN.do)
- [Samsung CL32Y106KCVZ4NE](https://product.samsungsem.com/mlcc/CL32Y106KCVZ4N.do)
- [Samsung CL32B226KOJNNNE](https://product.samsungsem.com/mlcc/CL32B226KOJNNN.do)
- [Panasonic EEU-FC2A100](https://industrial.panasonic.com/ww/products/pt/aluminum-cap-lead/models/EEUFC2A100)
- [Yageo RC1206FR-0741K2L](https://www.digikey.com/en/products/detail/yageo/RC1206FR-0741K2L/731850)
- les URL de fiches Yageo/LCSC sont accessibles à partir des identifiants LCSC
  enregistrés directement dans le schéma KiCad.
