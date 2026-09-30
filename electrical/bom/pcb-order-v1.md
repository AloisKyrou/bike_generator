# Contrat de commande PCB — contrôleur V1

Décision du 29 septembre 2026. Ce document fixe les paramètres à saisir dans le
devis ; il ne constitue pas encore une autorisation d'envoi en fabrication.

## Configuration retenue

| Paramètre | Valeur |
|---|---|
| Fabricant | **PCBWay** |
| Service | PCB nus, sans assemblage |
| Quantité | **5 cartes** |
| Dimensions nominales | **70 × 110 mm** |
| Matériau | FR-4, Tg ≥ 150 °C |
| Nombre de couches | **2** |
| Épaisseur finie | **1,6 mm** |
| Cuivre fini extérieur | **3 oz / 105 µm**, F.Cu et B.Cu |
| Finition | **ENIG**, or 1 µin standard |
| Masque | Vert, deux faces |
| Sérigraphie | Blanche, deux faces |
| Vias | Métallisés, tentés sur les deux faces suivant les Gerbers |
| Test électrique | Oui, 100 % |
| Panelisation | Aucune ; cartes unitaires |
| Impédance contrôlée | Non |

PCBWay est retenu parce que son offre publiée permet de commander exactement du
cuivre fini 3 oz. L'offre JLCPCB publiée propose actuellement 2,5 oz puis
3,5 oz pour les PCB FR-4 deux couches, pas 3 oz.

ENIG est retenu plutôt que HASL pour obtenir des pads plans sous U1 au pas de
0,5 mm, U4 PowerPAD et les petits passifs. La différence de coût est acceptable
sur cinq prototypes et facilite le dépôt au pochoir et le placement manuel.

## Pochoir

| Paramètre | Valeur |
|---|---|
| Type | Inox découpé laser, **sans cadre** |
| Face | **Dessus uniquement** |
| Épaisseur | **0,12 mm** |
| Quantité | 1 |
| Finition optionnelle | Électropolissage si le supplément est faible |
| Instructions | Reproduire `F.Paste` ; ne pas ajouter d'ouvertures aux pads traversants |

Le PowerPAD de U4 possède déjà quatre fenêtres distinctes dans l'empreinte. Le
Gerber `F.Paste` doit donc être respecté : aucune grande ouverture pleine ne doit
remplacer ce fenêtrage.

## Choix d'assemblage

La V1 est commandée en **PCB nus + pochoir**, sans assemblage partiel. U1 est un
VSSOP-10 au pas de 0,5 mm et U4 possède un pad thermique caché, mais le pochoir,
la pâte Type 4, le flux et l'air chaud déjà disponibles permettent de les monter
sur une première carte, puis de contrôler les soudures avant de poursuivre.

Un assemblage partiel limité à U1/U4 demanderait tout de même une BOM PCBA, un
fichier de placement, la validation des rotations et l'approvisionnement exact
des deux références. Pour seulement cinq prototypes, cette complexité n'est pas
retenue. Elle pourra être réévaluée si le devis complet est étonnamment proche
du coût des PCB nus.

## Compatibilité 3 oz à faire confirmer

Le PCB utilise des pistes routées à partir de 0,25 mm. PCBWay publie pour 3 oz
une recommandation d'environ 0,25 mm de largeur et 0,23 mm d'espacement. Le
VSSOP-10 de U1 présente localement un pas de 0,5 mm : l'acceptation finale des
espacements de pads et des ponts de masque doit donc être confirmée par leur
contrôle CAM. Ne jamais accepter un déplacement automatique de piste ou de pad.

## Écarts entre le fichier KiCad et la commande

Le PCB sauvegardé est bien à deux couches et 1,6 mm, mais son stackup interne
déclare encore 35 µm par face et `copper_finish = None`. Avant l'export final,
ces métadonnées doivent être alignées sur **105 µm + ENIG**, puis le DRC doit
être relancé. Les Gerbers ne codent pas à eux seuls le poids de cuivre : la
valeur saisie dans le devis et confirmée dans la revue de commande fait foi.

## Porte de sortie fabrication

État actuel : **INCOMPLETE — ne pas envoyer au fabricant**.

Avant paiement :

1. aligner le stackup KiCad sur 3 oz et ENIG ;
2. relancer DRC et contrôle de parité sur les fichiers sauvegardés ;
3. produire dans un dossier neuf les Gerbers, perçages PTH/NPTH et `F.Paste` ;
4. vérifier visuellement toutes les couches dans un visualiseur Gerber ;
5. contrôler le contour 70 × 110 mm, les quatre trous M3 et toutes les polarités ;
6. téléverser chez PCBWay et examiner leur aperçu CAM ;
7. faire confirmer le 3 oz autour de U1 avant d'accepter la revue technique.

Le DRC direct du 29 septembre 2026 donne zéro non-connecté et aucune violation
active. Il reste une alerte de sérigraphie exclue sur U2, quatre écarts de parité
attendus pour H1–H4 et trois familles de tests ignorées ; ces points doivent
rester visibles dans le dossier de libération.

## Sources fabricant consultées

Consultation du 29 septembre 2026 :

- [PCBWay — poids de cuivre](https://www.pcbway.com/helpcenter/ordering_parameter_instruction/What_is_the_PCB_Copper_Weight_.html) ;
- [PCBWay — capacités de fabrication](https://www.pcbway.com/capabilities.html) ;
- [PCBWay — largeur/espacement selon le poids de cuivre](https://www.pcbway.com/helpcenter/ordering_parameter_instruction/What_is_the_Min_Track_Spacing_for_1oz__2oz__3oz__Copper_weight_.html) ;
- [PCBWay — pochoirs inox](https://www.pcbway.com/pcb_prototype/SMT_stencil_and_Laser_Stencil.html) ;
- [JLCPCB — poids de cuivre disponibles](https://jlcpcb.com/help/article/jlcpcb-copper-weight), utilisé uniquement pour la comparaison.

Les capacités et tarifs pouvant évoluer, la page de devis et la revue CAM du
jour de commande restent l'autorité finale.
