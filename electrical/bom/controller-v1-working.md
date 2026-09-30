# Nomenclature de travail — contrôleur V1

État du 29 septembre 2026. Cette nomenclature est liée au schéma sauvegardé :

- base Git : `f62b31f`, avec modifications locales non commitées ;
- schéma racine SHA-256 :
  `A643805C638FCFA996CB3FE4A5D83431BC33254EB9DC4E425F7D0C1CC098E9A2` ;
- PCB SHA-256 :
  `15F5B04D5D8B51043990368CF8B01EFDB8E9FC774056987863253BFC23A8F35D`.

## Fichiers de référence

- [`controller-v1-current.csv`](./controller-v1-current.csv) : export brut et
  regroupé du schéma KiCad sauvegardé, sans composants DNP ;
- [`controller-v1-order-5pcs.csv`](./controller-v1-order-5pcs.csv) : quantités
  d'achat pour cinq cartes, rechanges comprises ;
- [`assembly-supplies-v1.md`](./assembly-supplies-v1.md) : pâte à braser,
  refroidissement et visserie hors BOM électronique ;
- [`pcb-order-v1.md`](./pcb-order-v1.md) : contrat de commande des PCB nus et du
  pochoir.

Le schéma contient **60 références** regroupées en 49 lignes. Sept points de
test sont de simples pads et `JP1`/`JP2` sont des cavaliers de soudure : ils ne
créent aucune ligne d'achat. Les sockets et headers du module U2, le boîtier et
les contacts du câble batterie sont ajoutés à la BOM d'achat parce qu'ils sont
nécessaires au montage sans être des symboles distincts dans le schéma.

## Corrections apportées à la nomenclature

- J5 est bien un header mâle `1×4` au pas de 2,54 mm, et non l'ancien JST-PH.
- J8 est bien documenté dans l'ordre physique `1=W, 2=U, 3=V`.
- TP13 n'existe plus ; les points de test actuels sont TP1, TP2, TP4, TP5,
  TP6, TP12 et TP14.
- C4 utilise la même référence `CC0805KRX7R9BB104` que C1/C2.
- R7/R8/R19 utilisent la même référence `RC0805FR-0710KL` que R5/R11.
- R9/R10 sont fixées à `RC0805FR-071KL`.
- U1 est remplacé par `INA238AIDGSR` : même brochage et même empreinte
  VSSOP-10 que l'INA228 indisponible, mais résolution 16 bits et facteurs de
  conversion firmware différents. Pour 25 A et 2 mOhm :
  `CURRENT_LSB = 762,939 uA`, `SHUNT_CAL = 1250`, `ADCRANGE = 0`.
- Les headers génériques sont standardisés sur la série Würth WR-PHD :
  `61300411121` (1×4), `61300311121` (1×3) et `61300211121` (1×2).
- Aucun substitut électrique n'est approuvé automatiquement. Une alternative
  doit conserver valeur, tolérance, tension, puissance, boîtier et land pattern.

Ces compléments sont présents dans la BOM d'achat. Les champs encore génériques
du schéma devront être resynchronisés plus tard ; l'export brut reste volontairement
une image fidèle de ce que contient KiCad aujourd'hui.

## Politique de rechange pour cinq cartes

- passifs CMS : quantité exacte pour cinq cartes plus cinq pièces ;
- U1, U3 et composants de puissance sensibles : deux pièces de rechange ;
- U4 : trois pièces de rechange, car son PowerPAD est le montage manuel le plus
  risqué ;
- U2 et D2 : une pièce de rechange ;
- fusibles : cinq pièces de rechange pour permettre les essais destructifs ;
- connecteurs et contacts : au moins deux ensembles ou contacts supplémentaires.

La colonne `Qty_to_order` du CSV est la quantité à mettre au panier, pas la
quantité réellement montée.

## Éléments volontairement hors BOM électronique

Le dissipateur de D2, l'interface thermique, la visserie M4, les entretoises M3,
la pâte à braser et le pochoir sont des éléments de fabrication ou de montage.
Ils sont suivis séparément afin de ne pas polluer la BOM issue du schéma.

## État de validation

Le DRC direct du PCB sauvegardé, exécuté avec KiCad CLI 10.0.6 le 29 septembre
2026, rapporte zéro pad non connecté et aucune violation active. Il conserve :

- une alerte de sérigraphie exclue sur le contour de U2 ;
- quatre avertissements de parité attendus pour les trous mécaniques H1 à H4 ;
- trois familles de contrôles ignorées dans le projet.

Ce résultat valide la cohérence interne actuelle, pas encore l'acceptation du
cuivre 3 oz par le fabricant. La commande reste `INCOMPLETE` jusqu'au contrôle
Gerber, à l'aperçu CAM du fabricant et à l'alignement des métadonnées de stackup
du PCB avec la spécification de commande.
