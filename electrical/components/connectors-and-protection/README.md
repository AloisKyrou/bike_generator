# Connecteurs et protections — candidats V1

Statut : **candidats de présélection, non figés**.

| Fonction | Candidat | Motif principal | Condition avant validation |
|---|---|---|---|
| Fusible principal | Littelfuse `LJCA020.X`, LP JCASE 20 A / 58 V DC | couvre les 40 V+ déjà observés ; 1000 A à 58 V DC annoncé | mesurer courant continu et appel, relire la courbe temps-courant |
| Porte-fusible principal | Littelfuse HLJC ou porte-fusible LP JCASE équivalent réellement coté 58 V DC | fusible remplaçable dans le faisceau | choisir longueur/section de câble et variante disponible |
| Fusible auxiliaire | Littelfuse `0449001.MR`, 1 A / 125 V, Slo-Blo | protège la branche LM5164 et tolère l'appel des condensateurs | mesurer l'appel ; passer à 1,5 A seulement si justifié |
| TVS bus | Littelfuse `SMCJ48A` | `VRWM` 48 V, limitation max 77,4 V, sous les 85 V INA228 | tension à vide continue strictement inférieure à 48 V |
| Connecteurs de puissance | Anderson Powerpole PP15/45 | famille documentée, jusqu'à 10 AWG, contacts PCB disponibles | choisir orientation, contacts et architecture faisceau/PCB |
| Câble puissance | 12 AWG minimum proposé, 10 AWG avec marge | enveloppe 20 A continue | longueur, température, groupement et isolant à confirmer |

Une TVS ne dissipe pas une surtension permanente. Si la génératrice peut rester
au-dessus de 48 V, il faudra une stratégie d'écrêtage ou de charge de décharge,
pas seulement une TVS plus grosse.

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
| [`littelfuse-smcj-datasheet.pdf`](./littelfuse-smcj-datasheet.pdf) | valeurs `SMCJ48A`, `SMCJ51A` et limites de clamp | `04C55B5C1641BD74C012EF8B3116444AAB9F5F9C6A11C497BD255BA910C2E172` |

Les PDF Littelfuse 449, LP JCASE et HLJC sont liés ci-dessus, mais leur serveur
a refusé l'archivage automatisé. Ils devront être téléchargés manuellement dans
ce dossier si ces références sont acceptées définitivement.
