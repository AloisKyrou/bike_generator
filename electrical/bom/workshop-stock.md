# Stock atelier hors BOM

Ce fichier recense les composants déjà disponibles à l'atelier. Leur présence
ici ne signifie pas qu'ils sont automatiquement approuvés pour la carte.

## Borniers à vis YIXISI YE0001WWA06

- Coffret : **100 borniers traversants verts**.
- Répartition annoncée : **85 × 2 voies, 10 × 3 voies, 5 × 4 voies**.
- Pas annoncé : **5,00 mm**.
- Caractéristiques vendeur : **16 A, 300 V, 14–26 AWG**.
- Accessoire annoncé : un petit tournevis.

### Statut pour le contrôleur V1

**Stock enregistré, mais non validé pour le chemin de puissance.** Les
connecteurs J1, J2 et J8 de la carte utilisent actuellement des empreintes
Phoenix Contact au pas de **5,08 mm** et sont choisis pour **24 A**. Les
YE0001WWA06 sont des borniers génériques au pas de 5,00 mm : ils ne constituent
donc ni une correspondance mécanique exacte, ni un remplacement électrique
qualifié.

Leur usage raisonnable est limité aux prototypes et aux connexions de faible
courant tant que les points suivants n'ont pas été vérifiés :

- pas réel et diamètre des broches au pied à coulisse ;
- dimensions du corps et dégagement du tournevis ;
- marquage porté sur le bornier ;
- qualité du serrage et section de fil réellement acceptée ;
- échauffement sous courant avec le fil prévu.

La valeur **16 A / 300 V** provient d'annonces commerciales ; aucune fiche
technique fabricant suffisamment fiable n'a été trouvée pour qualifier cette
référence dans le trajet principal de 20 A.
