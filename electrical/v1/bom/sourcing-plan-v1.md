# Plan d'approvisionnement V1

État au 29 septembre 2026. Objectif : deux commandes de composants maximum,
hors fabrication PCBWay.

## Commande 1 — Mouser France

Fournisseur principal pour les semi-conducteurs, protections, connecteurs de
puissance et passifs disponibles. U1 devient `INA238AIDGSR` ; 82 pièces étaient
affichées en stock lors de la vérification, contre zéro pour `INA228AIDGSR`.
Commander 7 pièces pour cinq cartes et deux rechanges.

L'INA238 conserve le boîtier et le brochage VSSOP-10. Ce n'est toutefois pas un
remplacement logiciel direct : registres 16 bits, facteurs de conversion
différents et absence des accumulateurs matériels énergie/charge.

- [INA238AIDGSR chez Mouser](https://www.mouser.fr/fr/ProductDetail/Texas-Instruments/INA238AIDGSR?qs=DRkmTr78QAQpWvQMAkqDfQ%3D%3D)
- [Fiche technique TI INA238](https://www.ti.com/lit/ds/symlink/ina238.pdf)

## Commande 2 — Farnell

Réserver cette commande aux lignes absentes ou peu pratiques chez Mouser :

- `MSS1038-473MLC`, L1, référence Farnell 2288213 ;
- `PCF0805R-316KBT1`, alternative approuvable à R17, référence 1353261 ;
- `PCF0805R-100KBT1`, alternative approuvable à R18, référence 1160261 ;
- `S2B-PH-K-S(LF)(SN)`, J6, référence 9491902, uniquement si la quantité
  minimale affichée reste acceptable ;
- pâte à braser, interface thermique et visserie lorsque le conditionnement et
  le prix sont meilleurs que chez Mouser.

## Règles avant paiement

1. Importer `controller-v1-order-5pcs.csv` dans le gestionnaire de BOM Mouser.
2. Ne sélectionner que les références fabricant exactes, sauf R17/R18 dont les
   alternatives ci-dessus doivent conserver 0,1 %, 0805 et la même puissance.
3. Vérifier à nouveau le stock de U1 et L1 le jour du paiement.
4. Refuser toute substitution automatique de D2, F1, F2, R1, U4 ou L1.
5. LCSC est exclu pour U1 : `INA228AIDGSR` y est également indisponible.

Ce plan respecte l'objectif de deux commandes sans recourir à un broker non
autorisé. Les frais de port et quantités minimales doivent encore être validés
dans les paniers réels.
