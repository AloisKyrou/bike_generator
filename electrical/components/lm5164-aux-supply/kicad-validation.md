# Validation KiCad du LM5164 DDA

Statut : **LM5164DDAT retenu ; symbole standard KiCad validé ; géométrie du
footprint standard relue et rendue dans un PCB jetable ; décision de fabrication
encore requise pour ses vias thermiques de 0,20 mm**.

## Sources

| Élément | Source | Détail utilisé |
|---|---|---|
| Fiche fabricant | `ti-lm5164-snvsa-u4d.pdf` | `SNVSAU4D`, février 2026 |
| Brochage | fiche TI, page PDF 3 | figure 4-1 et table 4-1, vue de dessus |
| Boîtier | fiche TI, pages PDF 28 à 30 | dessin `DDA0008B`, land pattern et stencil |
| Références commandables | fiche TI, page PDF 34 | `DDAT` 250 pièces, `DDAR` 2500 pièces |
| Modèles CAO fabricant | page produit TI | lien TI vers Ultra Librarian, formats KiCad v6+ disponibles |
| Bibliothèque locale | KiCad 10 installé | symbole et footprints inspectés en lecture seule |

Le SHA-256 et l'URL officielle de la fiche archivée sont consignés dans le
[`README.md`](./README.md).

## Référence physique étudiée

- composant : Texas Instruments LM5164 ;
- boîtier : `DDA`, dessin mécanique `DDA0008B`, HSOIC/PowerPAD 8 broches ;
- proposition pour les prototypes : `LM5164DDAT`, même silicium et même boîtier
  que `LM5164DDAR`, mais petite bande de 250 au lieu d'une bobine de 2500 ;
- la proposition `DDAT` reste à confirmer avant de la figer dans la BOM.

## Correspondance des broches

La figure TI est une **vue de dessus**. Les broches 1 à 4 descendent le côté
gauche depuis le repère de broche 1 ; les broches 5 à 8 remontent le côté droit.
Le pad exposé est désigné `9` dans le dessin mécanique et doit être relié à GND,
bien qu'il n'ait aucune connexion électrique interne.

| Broche TI | Fonction TI | Pin du symbole KiCad | Type KiCad observé | Pad attendu |
|---:|---|---:|---|---:|
| 1 | GND | 1 / GND | power input | 1 |
| 2 | VIN | 2 / VIN | power input | 2 |
| 3 | EN/UVLO | 3 / EN/UVLO | input | 3 |
| 4 | RON | 4 / RON | passive | 4 |
| 5 | FB | 5 / FB | input | 5 |
| 6 | PGOOD, sortie open-drain | 6 / PGOOD | open collector | 6 |
| 7 | BST | 7 / BST | passive | 7 |
| 8 | SW | 8 / SW | power output | 8 |
| 9 | EP, pas de connexion interne, à relier à GND | 9 / EP | passive | 9 |

Bilan des nombres : 8 pattes + 1 pad exposé fabricant, 9 pins électriques dans
le symbole KiCad, pads 1 à 8 + pad 9 éventuellement répété pour les vias
thermiques dans le footprint. Les répétitions du numéro 9 sont intentionnelles.

## Symbole KiCad installé

Le symbole existe déjà :

```text
Regulator_Switching:LM5164DDA
```

Son brochage correspond à la table TI. Il n'y a donc aucune raison de recréer
un symbole projet. Son champ footprint pointe actuellement vers :

```text
Package_SO:HSOP-8-1EP_3.9x4.9mm_P1.27mm_EP2.41x3.1mm_ThermalVias
```

Cette association automatique ne vaut pas validation mécanique.

## Comparaison du footprint par défaut

Le footprint installé présente notamment :

- corps nominal 3,9 × 4,9 mm et pas de 1,27 mm ;
- huit pads de 1,60 × 0,60 mm, rangés à `x = ±2,65 mm` ;
- pad exposé de 2,41 × 3,10 mm ;
- six vias thermiques de perçage 0,20 mm ;
- description faisant référence au ST L5973D, et non directement au LM5164.

Le land pattern TI révisé en 2026 indique :

- huit lands de 1,55 × 0,60 mm ;
- pas de 1,27 mm et entraxe de rangées de 5,4 mm, soit `x = ±2,70 mm` ;
- métal du pad exposé de 2,71 × 3,40 mm ;
- vias optionnels de diamètre 0,20 mm ;
- taille du métal susceptible d'être adaptée aux exigences de ligne de fuite.

Les écarts sur les pads latéraux sont faibles, mais le pad thermique par défaut
est inférieur de 0,30 mm dans chaque axe à la recommandation TI actuelle. La
description provenant d'un autre composant empêche de l'accepter par simple
analogie.

Le footprint historique `Package_SO:TI_SO-PowerPAD-8_ThermalVias` est également
présent, mais sa géométrie vient d'une autre fiche TI et ne doit pas être retenue
sans la même comparaison détaillée.

## Audit du paquet proposé par TI

Le paquet téléchargé le 24 septembre 2026 est conservé localement dans :

```text
electrical/kicad/download/ul_LM5164DDAR/
```

Il contient un symbole et quatre footprints, mais aucun fichier STEP. Son
symbole reprend correctement les neuf pins. Il n'apporte toutefois aucun
avantage sur le symbole standard KiCad et utilise plusieurs types de pins
`unspecified` moins utiles à l'ERC.

Les footprints ne sont pas acceptables tels quels :

- les fichiers `IPC_B`, `IPC_C` et `MFG` déclarent tous en interne le nom
  `DDA0008E-IPC_A`, ce qui créerait des collisions ou une sélection trompeuse ;
- les variantes IPC n'ont ni `F.CrtYd` ni vias thermiques ;
- leur pad exposé mesure seulement 2,025 × 3,10 mm ;
- la variante `MFG` numérote les six vias thermiques de 10 à 15 au lieu de leur
  donner le numéro électrique 9 : ils ne seraient donc pas automatiquement
  reliés au pad exposé et à GND ;
- la variante `MFG` utilise un pad cuivre 2,95 × 4,90 mm, mais sans la définition
  de masque 2,71 × 3,40 mm du land pattern TI actuel ;
- aucun des quatre footprints ne contient de modèle 3D.

Hashes SHA-256 des fichiers électriques reçus :

| Fichier | SHA-256 |
|---|---|
| `2026-09-24_14-56-52.kicad_sym` | `2A9FCCB3A7269095B1B9E39BD30CCF5EA773A0BA56808F4D4674823EBB784E28` |
| `DDA0008E-IPC_A.kicad_mod` | `B306C296C3673E55C947E3D49E2407647C8E338BAB3256AE5C468799E03203C1` |
| `DDA0008E-IPC_B.kicad_mod` | `371293F031BC82E934DC4BF0D780C38C5DE6EAF29AA1560158404C9E6B022E0C` |
| `DDA0008E-IPC_C.kicad_mod` | `798B07EF89449A4D70C94E934DDA374FDE0EE1782EF097807F0BE11347BA237B` |
| `DDA0008E-MFG.kicad_mod` | `39319E2B87051C480B49AB5E38548F64EDF46428BC036736BE3C421C3C6E7D8C` |

Le paquet Ultra Librarian est donc une preuve que des modèles sont proposés,
mais il ne doit pas être importé dans le projet.

Un second export a été effectué en choisissant explicitement le symbole
séquentiel, les unités métriques et `DDA0008E-MFG`. Malgré ces choix, le contenu
électrique obtenu est **strictement identique octet pour octet** au premier
paquet :

- le symbole conserve `DDA0008E-IPC_A` dans son champ footprint ;
- les quatre footprints conservent le nom interne `DDA0008E-IPC_A` ;
- les vias de la variante `MFG` restent numérotés 10 à 15 ;
- aucun STEP n'est inclus.

Ce résultat rend le défaut reproductible et exclut une simple erreur de
sélection lors du premier téléchargement.

Un troisième téléchargement, cette fois pour `LM5164DDAT`, contient le modèle
3D `DDA0008E.stp`. Il est conservé comme aide visuelle uniquement :

| Fichier | SHA-256 | Usage |
|---|---|---|
| `DDA0008E.stp` | `61303330D3383C2A1001C5C56C8834EB66A39135D1D5EF496A460EE145437484` | contrôle 3D, pas preuve des pads |

Le fichier indique une génération Creo datée du 10 juin 2024. Il pourra être
associé plus tard à une empreinte projet si la vue 3D est nécessaire. Le symbole
Ultra Librarian `LM5164DDAT` n'est pas importé : son brochage n'apporte rien au
symbole standard, plusieurs types de pins sont moins précis et son champ
footprint pointe encore vers `DDA0008E-IPC_A`.

## Meilleur footprint existant dans KiCad 10

Une seconde recherche dans les bibliothèques installées a trouvé une empreinte
plus récente et explicitement dérivée du dessin TI `DDA0008B` :

```text
Package_SO:SOIC-8-1EP_3.9x4.9mm_P1.27mm_EP2.95x4.9mm_Mask2.71x3.4mm_ThermalVias
```

Elle présente :

- pads 1 à 8 au pas de 1,27 mm, largeur 0,60 mm ;
- extrémité extérieure des pads à ±3,45 mm, comme le land pattern TI ;
- cuivre frontal du pad 9 de 2,95 × 4,90 mm ;
- ouverture de masque dédiée de 2,71 × 3,40 mm ;
- huit vias thermiques de perçage 0,20 mm, tous numérotés 9 ;
- cuivre arrière de dissipation relié au pad 9 ;
- `F.Fab`, `F.SilkS`, repère de pin 1 et `F.CrtYd` complets ;
- quatre ouvertures de pâte segmentées plutôt qu'une ouverture pleine.

Les pads latéraux sont calculés selon une règle IPC et mesurent 1,775 mm de long
au lieu des 1,55 mm de l'exemple TI. Leur bord externe est identique ; ils
s'étendent davantage vers le boîtier. Cette différence facilite la soudure et
reste cohérente avec l'enveloppe mécanique, mais doit être acceptée comme choix
de conception et non présentée comme une copie exacte du dessin fabricant.

Le footprint référence un STEP portant le même nom, mais ce fichier 3D n'est pas
présent dans l'installation locale actuelle. Cela ne remet pas en cause les
pads ; le modèle 3D reste une vérification visuelle optionnelle à compléter.

## Décision de CAO retenue

1. Utiliser la référence commandable `LM5164DDAT`.
2. Conserver le symbole standard `Regulator_Switching:LM5164DDA` et affecter
   `LM5164DDAT` à son champ `Value`.
3. Rejeter les symboles et footprints Ultra Librarian reçus sans les importer.
4. Utiliser comme référence géométrique le footprint standard KiCad
   explicitement basé sur `DDA0008B` :
   `Package_SO:SOIC-8-1EP_3.9x4.9mm_P1.27mm_EP2.95x4.9mm_Mask2.71x3.4mm_ThermalVias`.
5. Ne pas encore créer de footprint projet personnalisé. Une variante projet ne
   sera créée qu'après choix explicite entre une fabrication acceptant les
   perçages de 0,20 mm et des vias thermiques redimensionnés.
6. Conserver le STEP Ultra Librarian pour la vue 3D, sans l'utiliser comme
   preuve dimensionnelle.

## Relecture structurée Konnect

La relecture du 24 septembre 2026 confirme directement dans les bibliothèques
KiCad 10 installées :

- symbole `Regulator_Switching:LM5164DDA` : 9 pins, numérotées 1 à 9, avec les
  noms et types attendus (`GND`, `VIN`, `EN/UVLO`, `RON`, `FB`, `PGOOD`, `BST`,
  `SW`, `EP`) ;
- footprint retenu : 8 pads latéraux de 1,775 × 0,60 mm au pas de 1,27 mm ;
- pad 9 frontal de 2,95 × 4,90 mm, masque dédié de 2,71 × 3,40 mm et cuivre
  arrière de 1,80 × 4,40 mm ;
- huit vias thermiques traversants de perçage 0,20 mm, tous numérotés 9 ;
- présence de `F.Fab`, `F.SilkS`, `F.CrtYd`, du repère de pin 1 et d'un modèle
  3D déclaré par la bibliothèque.

Cette relecture provient du fichier standard résolu sous
`C:\Program Files\KiCad\10.0\share\kicad\footprints\Package_SO.pretty\` et non
d'un cache Ultra Librarian ou d'une bibliothèque projet.

## Validation dans le PCB jetable

Un projet jetable a été créé dans :

```text
electrical/kicad/exports/lm5164-validation/
```

Le symbole y a été placé avec `Value = LM5164DDAT` et le footprint standard
retenu comme référence géométrique. La relecture de l'instance confirme les
neuf pins et le rendu du symbole montre la vue fonctionnelle attendue : VIN,
EN/UVLO et RON à gauche ; BST, SW, FB et PGOOD à droite ; GND et EP en bas.

Le footprint a ensuite été placé à `(100 mm, 100 mm)` dans le PCB jetable et
entouré d'un contour temporaire de 20 × 20 mm. La relecture du fichier fermé par
Konnect confirme :

- huit pads latéraux 1 à 8 au pas de 1,27 mm ;
- pad exposé 9, ouverture de masque dédiée, cuivre arrière et huit vias tous
  affectés au même numéro 9 ;
- quatre fenêtres de pâte segmentées ;
- repère de broche 1, `F.SilkS`, `F.Fab` et `F.CrtYd` présents.

Le rendu supérieur généré par KiCad confirme visuellement le repère de broche 1,
le sens des deux rangées, la segmentation de pâte et les vias thermiques. Il ne
montre aucun corps 3D : le footprint déclare un STEP standard absent de
l'installation locale. Le STEP Ultra Librarian reste donc une aide visuelle
optionnelle, sans effet sur la validation du cuivre.

Le DRC du PCB jetable donne huit erreurs identiques : chaque via thermique a un
perçage de 0,20 mm, inférieur au minimum de 0,30 mm défini par les contraintes
actuelles. Les autres avertissements proviennent du caractère volontairement
isolé du test : le footprint a été placé directement pour l'inspection et n'a
pas été synchronisé avec le symbole ni raccordé à des nets.

Conclusion : la correspondance boîtier, pins, pads, masque et pâte est validée.
Le footprint n'est toutefois **pas encore validé pour fabrication**. Avant son
placement définitif, il faut soit confirmer qu'un fabricant accepté prend en
charge les trous finis de 0,20 mm, soit autoriser la création d'une variante de
projet avec des vias compatibles avec ses règles, puis refaire le DRC.

## Clarification : « 0,20 mm contre 0,30 mm »

Il ne s'agit pas de choisir entre des **pads** de 0,20 et 0,30 mm. Trois objets
différents interviennent :

1. le grand pad exposé `EP`/9 sous le LM5164, qui évacue la chaleur et relie le
   boîtier à GND ;
2. les petits pads annulaires des vias thermiques, c'est-à-dire le cuivre autour
   de chaque trou ;
3. le perçage métallisé de ces vias.

Deux valeurs de 0,30 mm sont apparues dans l'analyse, sans désigner la même
chose :

- l'ancien footprint par défaut avait un grand pad thermique inférieur de
  **0,30 mm dans chaque axe** au land pattern TI actuel. Ce problème est réglé :
  ce footprint a été rejeté ;
- le footprint standard finalement retenu possède huit **perçages de via de
  0,20 mm**, tandis que la règle DRC actuelle impose un perçage minimal de
  **0,30 mm**. Ce second point reste ouvert et produit huit erreurs DRC.

### Pourquoi conserver 0,20 mm

- c'est le diamètre optionnel indiqué par le dessin TI ;
- huit petits vias tiennent facilement sous le pad exposé ;
- les trous plus petits limitent la quantité de pâte aspirée pendant la refusion ;
- on conserve sans modification le footprint standard KiCad déjà relu.

Cette solution exige cependant un fabricant garantissant les trous métallisés
finis de 0,20 mm, éventuellement avec un supplément de prix ou des contraintes
de rapport d'aspect.

### Pourquoi passer à 0,30 mm

- compatibilité plus large avec les procédés PCB standards ;
- fabrication et contrôle plus simples pour une première carte ;
- disparition de l'exception DRC si 0,30 mm reste le minimum général du projet.

En contrepartie, il ne suffit pas d'agrandir le trou. Le diamètre du pad de via
doit aussi respecter l'anneau minimal du fabricant :

```text
diamètre_pad_via >= diamètre_perçage + 2 × anneau_minimal
```

Par exemple, avec un trou de 0,30 mm et un anneau exigé de 0,15 mm, le pad doit
faire au moins 0,60 mm. Il faut ensuite vérifier que huit pads de ce diamètre
tiennent sous le pad thermique avec les espacements requis. Sinon, une matrice
de six vias de 0,30 mm peut être préférable. Les trous plus grands augmentent
aussi le risque d'aspiration de soudure ; le procédé de bouchage, remplissage ou
tente des vias doit être défini avec l'assembleur.

### Recommandation pour cette V1

Ne pas abaisser globalement la règle DRC à 0,20 mm uniquement pour faire
disparaître les erreurs. Choisir d'abord le fabricant et le procédé
d'assemblage :

- s'il garantit 0,20 mm sans contrainte gênante, conserver le footprint KiCad
  standard et créer une règle locale documentée pour les seuls vias du pad 9 ;
- sinon, créer après accord une variante de footprint projet à vias de 0,30 mm,
  avec diamètre de pad et nombre de vias calculés depuis les règles du
  fabricant, puis refaire DRC et revue thermique.

Pour une première carte et tant que le fabricant n'est pas choisi, l'option
0,30 mm est la direction la plus robuste, mais elle n'est pas encore appliquée.
