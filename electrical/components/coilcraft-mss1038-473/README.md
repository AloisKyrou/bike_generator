# Coilcraft MSS1038-473MLC

Statut : **référence L1 validée pour la V1** de l'alimentation auxiliaire
LM5164.

## Affectation KiCad

- valeur : 47 µH ±20 % ;
- référence fabricant : `MSS1038-473MLC` ;
- empreinte : `Inductor_SMD:L_Coilcraft_MSS1038-XXX` ;
- modèle standard KiCad utilisé, sans empreinte personnalisée.

## Caractéristiques utilisées

- DCR maximale : 128 mΩ ;
- saturation : 1,6 A à −10 %, 1,98 A à −20 %, 2,22 A à −30 % ;
- courant thermique : 1,45 A pour +20 °C, 2,20 A pour +40 °C ;
- dimensions du corps : 10,0 × 10,2 × 3,8 mm.

Source officielle :
<https://www.coilcraft.com/en-us/products/power/shielded-inductors/ferrite-drum/mss-mos/mss1038/mss1038-473/>

## Document archivé

| Document | Révision / usage | SHA-256 |
|---|---|---|
| [`coilcraft-mss1038-datasheet.pdf`](./coilcraft-mss1038-datasheet.pdf) | document 378-1/378-2, révision 2022-09-27 ; caractéristiques et land pattern | `4A9750D3C3857C5E8D0C8CC6FCCC9321BA5E0FF2434F5E64D9BE742597EF3959` |

## Variante de réduction de coût

La Bourns `SRP1038C-470M` peut être moins chère et possède aussi une empreinte
KiCad standard. Elle n'est cependant pas recommandée pour les nouvelles
conceptions par Bourns. Elle est donc conservée comme piste d'optimisation BOM,
à réévaluer selon prix, disponibilité et cycle de vie, mais n'est pas montée par
défaut sur la V1.
