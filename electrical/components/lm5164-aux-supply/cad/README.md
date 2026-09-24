# Modèles CAO LM5164

Déposer ici, sans renommer les fichiers internes, le paquet **KiCAD v6+** obtenu
depuis le lien Ultra Librarian de la page produit officielle TI :

<https://vendor.ultralibrarian.com/TI/embedded/?gpn=LM5164&package=DDA&pin=8>

Procédure :

1. vérifier que la page affiche `Texas Instruments - LM5164DDAR`, boîtier DDA,
   8 broches ;
2. choisir `KiCAD v6+` et, si proposé dans le même paquet, le modèle `STEP` ;
3. accepter les conditions et télécharger le ZIP avec ton propre compte ;
4. extraire le ZIP dans un sous-dossier `ultralibrarian-original/` ici ;
5. ne pas importer immédiatement le footprint dans le projet : il sera d'abord
   comparé au dessin TI `DDA0008B` révision 2026 ;
6. conserver le ZIP d'origine jusqu'à la fin de la validation pour pouvoir
   calculer son SHA-256 et tracer sa provenance.

Le contenu tiers n'est pas validé par le seul fait qu'il est proposé depuis la
page TI. Les pads, le masque, la pâte, le repère 1, la vue et le modèle 3D doivent
être contrôlés comme indiqué dans [`../kicad-validation.md`](../kicad-validation.md).

Avant de publier les fichiers tiers dans le dépôt, vérifier leurs conditions de
redistribution. Leur utilisation dans le projet et leur redistribution comme
bibliothèque générique ne sont pas nécessairement couvertes de la même façon.
