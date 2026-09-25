# Connecteurs et protections — candidats V1

Statut : **candidats de présélection, non figés**.

| Fonction | Candidat | Motif principal | Condition avant validation |
|---|---|---|---|
| Fusible principal | calibre configurable ≤ 20 A, tension assignée ≥ 125 V DC | protège le trajet V1 limité à 20 A tout en restant compatible avec le plafond 80 V | choisir la courbe, le pouvoir de coupure et le calibre selon la génératrice |
| Porte-fusible principal | porte-fusible explicitement coté ≥ 125 V DC et compatible avec le fusible retenu | fusible remplaçable dans le faisceau | choisir longueur/section de câble et variante disponible |
| Fusible auxiliaire | Littelfuse `0449001.MR`, 1 A / 125 V, Slo-Blo | protège la branche LM5164 ; le déclassement continu de 25 % reste compatible avec le courant d'entrée calculé du LM5164 | empreinte exacte créée ; valider l'appel au démarrage |
| TVS bus | référence non figée ; empreinte SMCJ possible | écrêtage de transitoires courts uniquement | mesurer amplitude, durée, énergie et impédance de source ; DNP tant que la source n'est pas qualifiée |
| Connecteurs de puissance | Anderson Powerpole PP15/45 | famille documentée, jusqu'à 10 AWG, contacts PCB disponibles | choisir orientation, contacts et architecture faisceau/PCB |
| Câble puissance | 12 AWG minimum proposé, 10 AWG avec marge | enveloppe 20 A continue | longueur, température, groupement et isolant à confirmer |

## Décision V1 — bus 80 V et TVS

- `BUS_PROTECTED` est spécifié à **80 V maximum en continu**, transitoires
  tolérés compris dans ce plafond ; un fonctionnement durable au-dessus de
  80 V est hors spécification et peut endommager la carte ;
- l'INA228, limité à 85 V, reste le composant qui fixe cette enveloppe ;
- la TVS ne remplace ni cette limite d'emploi ni le fusible et n'est destinée
  qu'aux impulsions brèves ; aucun surge-stopper n'est ajouté en V1.

Il n'existe pas de TVS avalanche parallèle standard qui satisfasse
simultanément les deux contraintes très proches suivantes : rester garantie
quasi inactive jusqu'à 80 V et garantir un écrêtage inférieur à 85 V. À titre
de contrôle, une `SMCJ80A` admet 80 V de tension inverse permanente, mais son
avalanche ne commence qu'à 88,9 V minimum et sa tension de limitation annoncée
atteint 129 V au courant d'impulsion nominal : elle intervient trop tard pour
protéger l'INA228. À l'inverse, une `SMCJ51A` peut limiter à 82,4 V, mais n'est
prévue que pour 51 V permanents.

La `SMCJ48A` est donc retirée comme choix générique et aucune référence
universelle trompeuse ne la remplace. La V1 conserve un emplacement de TVS
optionnel ; sa référence sera adaptée à la première source après mesures. Une
source qui peut produire durablement plus de 80 V reste interdite, conformément
à la spécification acceptée.

Sources fabricants :

- [Littelfuse LP JCASE](https://www.littelfuse.com/~/media/files/littelfuse/technical%20resources/documents/product%20catalogs/lf_aftermarketcatalog_rev1_2015_lowres%20pdf.pdf)
- [Littelfuse HLJC](https://www.littelfuse.com/assetdocs/hljc-series-datasheet?assetguid=c6d82630-330b-41ea-b553-d50c31cd7f8f)
- [Littelfuse 449](https://www.littelfuse.com/assetdocs/fuses-449-datasheet?assetguid=7aef6e93-9808-456e-9bee-fba54271285f)
- [Littelfuse SMCJ](https://www.littelfuse.com/assetdocs/tvs-diodes-smcj-datasheet?assetguid=37388813-0d6d-4329-969b-1aa8b7614ac1)
- [Anderson PP15/45](https://www.andersonpower.com/content/dam/app/ecommerce/product-pdfs/PP1545/DS-PP1545.pdf)

## Documentation archivée

| Document | Usage | SHA-256 |
|---|---|---|
| [`anderson-pp1545-datasheet.pdf`](./anderson-pp1545-datasheet.pdf) | contacts câblés et PCB, courants, calibres de fils et références | `E82C8885EF9BCF147035AF45C575E062AB7A0EA30506E0D7BCACA5E615B6E4AE` |
| [`littelfuse-449-datasheet.pdf`](./littelfuse-449-datasheet.pdf) | caractéristiques électriques, dimensions et land pattern du `0449001.MR` ; copie miroir du document Littelfuse, le serveur fabricant refusant le téléchargement automatisé | `F60276A6F8DCF852C7E5BE37B73296D2B2AD692662B4229295AADC0137C88555` |
| [`littelfuse-smcj-datasheet.pdf`](./littelfuse-smcj-datasheet.pdf) | comparaison `SMCJ48A`, `SMCJ51A`, `SMCJ80A` et limites de clamp | `04C55B5C1641BD74C012EF8B3116444AAB9F5F9C6A11C497BD255BA910C2E172` |

Les PDF LP JCASE et HLJC sont liés ci-dessus, mais leur serveur a refusé
l'archivage automatisé. Ils devront être téléchargés manuellement dans ce
dossier si ces références sont acceptées définitivement.

## Empreinte du fusible auxiliaire

Le land pattern Littelfuse comporte deux pastilles de `1,96 × 3,15 mm`, un
intervalle cuivre de `2,95 mm` et un entraxe de `4,91 mm`. KiCad 10 ne fournit
pas d'empreinte native 6125/2410 exacte. L'empreinte locale
`BikeGenerator:Fuse_Littelfuse_0449001MR_6.10x2.69mm` reprend uniquement ces
dimensions, le corps nominal `6,10 × 2,69 mm` et un courtyard de
`7,37 × 3,65 mm` correspondant à l'enveloppe des pads augmentée de `0,25 mm`.
Elle n'embarque ni repère de polarité, ni modèle 3D. Aucun modèle ECAD exact
téléchargeable n'a été trouvé ; DigiKey ne propose actuellement qu'un modèle
3D pour cette référence.
