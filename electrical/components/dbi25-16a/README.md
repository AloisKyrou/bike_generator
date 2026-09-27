# Diotec DBI25-16A — pont redresseur triphasé

## Référence retenue

- fabricant : Diotec Semiconductor ;
- référence : `DBI25-16A` ;
- boîtier : `DBI-A`, 5 broches en ligne, pas de 7,50 mm ;
- fonction : pont redresseur triphasé ;
- tension répétitive inverse : 1600 V ;
- courant annoncé : 25 A à `TC = 115 °C`, 40 A à `TC = 85 °C` ;
- limite sans dissipateur : 4 A à `TA = 50 °C`.

La tenue en courant dépend donc du montage thermique. Pour le chemin générique
20 A de la carte, le boîtier doit être placé près d'un bord et fixé à un
dissipateur ou au châssis. La présence du composant seul sur le PCB ne valide
pas 20 A continus.

## Source fabricant archivée

- fichier : [`diotec-dbi25005a.pdf`](./diotec-dbi25005a.pdf) ;
- URL officielle : <https://diotec.com/files/diotec/productfiles/datasheet/dbi25005a.pdf> ;
- révision indiquée dans le PDF : `2026-03-24` ;
- pages utilisées : 1 et 2 ;
- SHA-256 : `919EDAB72661E2524EBDE2BC1AE93957EFECF27BA54F9ED718451FE71F70EDD0`.

Le dessin du fabricant est une vue du côté du marquage. De gauche à droite,
les broches sont `-`, `~`, `~`, `~`, `+`.

## Correspondance symbole / empreinte

| Broche fabricant | Fonction | Pin symbole | Pad empreinte | Position X locale |
|---:|---|---:|---:|---:|
| 1 | DC- | 1 | 1 | -15,00 mm |
| 2 | AC1 | 2 | 2 | -7,50 mm |
| 3 | AC2 | 3 | 3 | 0,00 mm |
| 4 | AC3 | 4 | 4 | +7,50 mm |
| 5 | DC+ | 5 | 5 | +15,00 mm |

- symbole : `BikeGenerator:DBI25-16A` ;
- empreinte : `BikeGenerator:Diode_Bridge_Diotec_DBI-A_5Pin_P7.50mm` ;
- cinq broches physiques, cinq pins et cinq pads électriques ;
- le trou M4 du boîtier sert à la fixation thermique verticale et n'est pas un
  trou du PCB ;
- pad 1 carré et repère sérigraphique côté `DC-`.

Le symbole et l'empreinte ont été relus avec Konnect puis placés dans un projet
jetable. Les entraxes de pads, le contour `F.Fab`, la sérigraphie, le courtyard
et l'identification du pad 1 ont été contrôlés sur le rendu. Il n'y a pas de
modèle 3D associé.

## Variante d'entrée de la carte

La variante montée par défaut utilise `J8` et `D2` :

```text
J8 (U/V/W) -> D2 -> RECTIFIED_RAW -> F1
```

La variante pour génératrice DC utilise `J1` directement sur
`RECTIFIED_RAW`. `J1` est DNP par défaut et sa polarité doit être respectée.
Il ne faut jamais raccorder simultanément une source à `J1` et à `J8`.

Aucun cavalier de soudure n'est placé dans le trajet de puissance : la variante
est choisie par la nomenclature et le montage des connecteurs, pas par un petit
pad de sélection incompatible avec le courant visé.
