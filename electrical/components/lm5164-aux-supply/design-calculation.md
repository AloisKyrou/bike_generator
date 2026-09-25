# Pré-dimensionnement LM5164 — bus protégé jusqu'à 80 V vers 5 V

Statut : **base de calcul pour le schéma, pas encore une nomenclature prête à
commander**.

Ce document applique les équations de la fiche TI `SNVSAU4D`, révision D de
février 2026, archivée dans ce dossier. Les numéros de pages ci-dessous sont les
pages du PDF.

## Hypothèses V1

| Paramètre | Valeur de calcul | Commentaire |
|---|---:|---|
| Plage vérifiée | 10 à 80 V DC | bus protégé ; démarrage UVLO nominal vers 9 V |
| Plafond de bus | 80 V DC continu, transitoires tolérés compris | fonctionnement durable au-dessus hors spécification |
| Sortie | 5 V | vers l'entrée 5 V du contrôleur |
| Charge continue attendue | 600 mA | ESP32, capteurs et recharge de la batterie |
| Charge de dimensionnement | 1 A | marge pour recharge et pointes radio |
| Fréquence visée | environ 300 kHz | compromis taille, rendement et pertes |
| Ondulation d'inductance visée | environ 30 % à 50 % à 1 A | recommandation TI |
| Méthode d'injection d'ondulation | type 3 | faible ondulation de sortie |

La tension nominale réelle du bus dépendra de la vitesse de pédalage. Les
calculs sont donc vérifiés à 10, 24, 36, 60 et 80 V plutôt qu'à un seul point.

## Valeurs V1 et choix encore ouverts

| Fonction | Valeur / référence | Statut |
|---|---:|---|
| `RRON` | Yageo `RC1206FR-0741K2L`, 41,2 kΩ, 1 %, 250 mW | choix V1 figé |
| `L` | Coilcraft `MSS1038-473MLC`, 47 µH ±20 % | choix V1 validé |
| `RFB1` haut | Yageo `RT0805BRD07316KL`, 316 kΩ, 0,1 % | choix V1 figé |
| `RFB2` bas | Yageo `RT0805BRD07100KL`, 100 kΩ, 0,1 % | choix V1 figé |
| `RA` | Yageo `RC0805FR-07200KL`, 200 kΩ, 1 % | choix V1 figé |
| `CA` | Yageo `CC0805KRX7R9BB332`, 3,3 nF, 50 V, X7R | choix V1 figé |
| `CB` | Yageo `CC0805JRNPO9BN820`, 82 pF, 50 V, C0G/NP0 | choix V1 figé |
| `CBST` | Yageo `CC0805KRX7R9BB222`, 2,2 nF, 50 V, X7R | choix V1 figé |
| `COUT` | 2 × Samsung `CL32B226KOJNNNE`, 22 µF, 16 V, X7R | choix V1 figé ; environ 33,7 µF effectifs au total à 5 V et 25 °C |
| `CIN` HF | 3 × Samsung `CL32Y106KCVZ4NE`, 10 µF, 100 V, X7S | choix V1 corrigé après lecture de la courbe DC-bias à 80 V |
| `CIN` amortissement | environ 10 µF électrolytique, tension adaptée | candidat si câblage d'entrée long |
| `RUV1` | Yageo `RC0805FR-071ML`, 1 MΩ, 1 % | choix V1 figé |
| `RUV2` | Yageo `RC0805FR-07200KL`, 200 kΩ, 1 % | choix V1 figé |
| Pull-up `PGOOD` | Yageo `RC0805FR-0747KL`, 47 kΩ, 1 % | choix V1 figé |

`F_AUX` est figé à 1 A / 125 V. Seule la TVS reste source-spécifique et dépend
des mesures de la génératrice.
Le condensateur d'amortissement est le Panasonic `EEU-FC2A100`, 10 µF / 100 V.

## Fréquence et résistance `RON`

La fiche TI donne, équations 12 et 15, page PDF 17 :

```text
RRON[kΩ] = VOUT[V] × 2500 / FSW[kHz]
```

Pour 5 V et 300 kHz, la valeur théorique est 41,67 kΩ. La valeur E96 de
41,2 kΩ donne environ 303 kHz. La durée de conduction calculée avec l'équation
11 reste comprise entre 1,648 µs à 10 V et 0,206 µs à 80 V, très au-dessus du
minimum contrôlable de 50 ns.

À 80 V, la résistance voit environ 79 V puisque la broche RON est voisine de
1 V. Sa dissipation est donc d'environ 151 mW. Le passage du boîtier 0805
125 mW au `RC1206FR-0741K2L` 250 mW est nécessaire ; il laisse environ 40 % de
marge à température ambiante. Le déclassement thermique devra encore être
contrôlé avec la température réelle de la carte.

## Inductance

Les équations 18 à 20, page PDF 18, donnent :

```text
ΔIL = VOUT / (FSW × L) × (1 − VOUT / VIN)
IL_peak = IOUT_max + ΔIL / 2
```

Avec 47 µH et un calcul conservateur à 300 kHz :

| `VIN` | `tON` | `ΔIL` | Pic à 1 A |
|---:|---:|---:|---:|
| 10 V | 1,648 µs | 0,177 A | 1,089 A |
| 24 V | 0,687 µs | 0,281 A | 1,140 A |
| 36 V | 0,458 µs | 0,305 A | 1,153 A |
| 60 V | 0,275 µs | 0,325 A | 1,163 A |
| 80 V | 0,206 µs | 0,332 A | 1,166 A |

La limite de courant de crête minimale spécifiée est 1,25 A et sa valeur
maximale 1,75 A, page PDF 6. Une inductance de 47 µH conserve plus de marge
qu'une 33 ou 39 µH lorsque sa tolérance et sa baisse à chaud sont prises en
compte. La référence V1 retenue est la Coilcraft `MSS1038-473MLC` : DCR maximale
128 mΩ, courant de saturation 1,6 A à −10 %, 1,98 A à −20 % et 2,22 A à −30 %,
et courant thermique 1,45 A pour une élévation de 20 °C. Elle couvre donc le
pic calculé de 1,166 A et reste exploitable face à la limite haute de 1,75 A du
LM5164.

Critères conservés pour une éventuelle substitution :

- courant de saturation supérieur à 1,75 A, avec une préférence autour de 2 A
  ou davantage ;
- courant thermique efficace compatible avec 1 A continu ;
- valeur encore suffisante à chaud et sous courant ;
- pertes cuivre et noyau vérifiées vers 300 kHz.

L'empreinte standard retenue est
`Inductor_SMD:L_Coilcraft_MSS1038-XXX`. La Bourns `SRP1038C-470M`, également
couverte par une empreinte KiCad standard, reste une option de réduction de
coût à réévaluer, mais son statut « not recommended for new designs » empêche
de la retenir comme référence V1.

## Retour 5 V

L'équation 10, page PDF 12, donne :

```text
RFB2 = 1,2 V / (VOUT − 1,2 V) × RFB1
```

Avec `RFB1 = 316 kΩ` entre la sortie et FB et `RFB2 = 100 kΩ` entre FB et GND,
la consigne nominale vaut 4,992 V. En combinant les limites de la référence
interne TI et les tolérances des résistances :

- résistances 1 % : environ 4,839 à 5,145 V ;
- résistances 0,1 % : environ 4,906 à 5,075 V.

Le 0,1 % est donc préféré. La compatibilité de cette plage avec l'entrée 5 V et
le chargeur du Beetle doit encore être confirmée sur le schéma exact de sa
révision.

## Réseau d'ondulation type 3

Le LM5164 utilise une commande COT et demande une ondulation en phase d'au
moins 20 mV au point typique, avec au moins 12 mV à l'entrée minimale. Les
équations 24 à 26 sont détaillées pages PDF 18 et 19.

Avec `RFB1 = 316 kΩ`, `RFB2 = 100 kΩ` et 300 kHz :

- la capacité `CA` minimale calculée est environ 439 pF ;
- `CA = 3,3 nF` maintient `RA` dans une plage pratique ;
- `RA = 200 kΩ` donne environ 12,5 mV à 10 V, 19,8 mV à 24 V et
  22,9 mV à 60 V, puis 23,4 mV à 80 V ;
- pour un objectif de stabilisation de 75 µs, `CB` calculé vaut environ 79 pF,
  d'où la valeur standard 82 pF en C0G/NP0.

Ces valeurs doivent encore être vérifiées dans le calculateur LM5164 de TI et
sur prototype. Le nœud FB devra rester très court et éloigné de `SW`.

## Condensateurs

### Sortie

L'équation 21 limite l'ondulation capacitive à 0,5 % de 5 V, soit 25 mV. Avec
47 µH, la capacité effective minimale calculée varie d'environ 3,0 µF à 10 V
d'entrée à 5,5 µF à 80 V. La courbe Samsung indique −23,41 % à 5 V : deux
condensateurs de 22 µF donnent environ 33,7 µF effectifs au total à 25 °C,
avant tolérance et température. La marge reste très supérieure au minimum
calculé.

### Entrée

TI impose au moins 2,2 µF de céramique haute fréquence près de VIN et GND.
Les deux MLCC initialement choisis (`CL32B225KCJSNNE`, 2,2 µF / 100 V) ne sont
pas conservés : la courbe Samsung indique −76,58 % à 80 V, soit seulement
1,03 µF effectif au total. La V1 emploie trois `CL32Y106KCVZ4NE`, 10 µF /
100 V, X7S. La courbe fabricant indique −86,06 % à 80 V, soit environ 4,18 µF
pour trois pièces à 25 °C. Après une estimation conservatrice ajoutant la
tolérance −10 % et la variation X7S −22 %, il reste environ 2,94 µF, au-dessus
du minimum TI de 2,2 µF. Les données brutes sont archivées dans
`../controller-passives-v1/` ; cette estimation devra encore être confirmée
sur prototype. La protection doit empêcher que les transitoires tolérés
dépassent eux aussi le plafond de 80 V ; une simple TVS parallèle ne peut pas
le garantir universellement avec seulement 5 V de marge jusqu'à l'INA228.

La fiche recommande aussi environ 10 µF électrolytique avec ESR modéré lorsque
la source est éloignée de plus de 5 cm, afin d'amortir la résonance formée par
les câbles et les céramiques. Le vélo entre clairement dans ce cas probable.

## Démarrage `EN/UVLO`

Les équations 13 et 14, page PDF 14, donnent les seuils de démarrage et d'arrêt.
Avec `RUV1 = 1 MΩ` et `RUV2 = 200 kΩ` :

- démarrage nominal : 9,0 V ;
- arrêt nominal : 8,4 V ;
- avec seuils TI et résistances 1 %, démarrage approximatif entre 8,56 et
  9,46 V, arrêt entre 7,97 et 8,79 V.

Le convertisseur est ainsi démarré avant 10 V dans le pire cas estimé, tout en
restant au-dessus de sa limite fonctionnelle minimale de 6 V. Ce choix devra
être testé sur une montée lente de la génératrice pour vérifier l'absence de
cycles marche/arrêt gênants.

## Contraintes de placement à reporter au PCB

- `CIN` au plus près des pins VIN, GND et du pad exposé ;
- boucle `VIN → MOSFET interne → SW → retour CIN` minimale ;
- `CBST` directement entre BST et SW ;
- inductance collée au nœud SW, avec surface SW minimale ;
- `RRON`, diviseur FB et réseau type 3 proches du circuit ;
- masse analogique des réseaux FB, RON et UVLO ramenée sans courant commuté ;
- pad exposé 9 relié à GND avec la variante locale V1 à six vias thermiques
  Ø0,60/0,30 mm ; anneau de 0,15 mm et traitement des vias sous pad à confirmer
  avec le fabricant ;
- éloigner les pistes Kelvin INA228, l'antenne ESP32 et les signaux numériques
  du nœud SW.

## Vérifications avant placement définitif

1. Rejouer le calcul avec le calculateur officiel LM5164 ou WEBENCH.
2. Les références de CIN, COUT, C6, des résistances et de L1 sont figées pour
   la V1.
3. Vérifier courant d'ondulation, saturation et pertes ; les capacités
   effectives des MLCC sont désormais calculées depuis les courbes Samsung.
4. Mesurer les pics, leur durée et l'impédance de source, puis choisir la TVS
   spécifique à cette source et confirmer `F_AUX`.
5. Confirmer le schéma d'alimentation interne du Beetle et l'absence de retour
   vers l'USB.
6. Prototyper avec une alimentation de laboratoire limitée en courant avant la
   génératrice.
