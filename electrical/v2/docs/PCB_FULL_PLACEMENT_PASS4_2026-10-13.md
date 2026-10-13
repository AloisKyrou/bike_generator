# Implantation complete de travail

13 octobre 2026. Suite de la [passe 3](PCB_QUIET_PLACEMENT_PASS3_2026-10-13.md).
Toutes les positions restent revisables pendant la preparation du routage.

## Resultat

- Les 77 composants encore en attente ont une position dans la carte.
- 149 empreintes au total : 145 composants du schema et quatre fixations.
- D2 et Q10-Q13 restent dessous; tous les autres composants sont dessus.
- 17 segments d'entree conserves strictement inchanges; aucune nouvelle piste,
  aucun via ni plan de cuivre ajoute.
- Contour provisoire agrandi vers la gauche : X=10..120, Y=20..130mm,
  soit 110x110mm. Ce n'est pas une dimension mecanique definitive.
- Aucun changement de schema, BOM, firmware, bibliotheque ou stackup.

Voir le [guide de routage et registre des passages dessous](PCB_ROUTING_HANDOFF_2026-10-13.md).
Les [coordonnees completes](PCB_PLACEMENT_PASS4_2026-10-13.csv) sont issues de
la relecture IPC finale; elles ne constituent pas un fichier de fabrication.

## Logique d'implantation

ESP au bord haut gauche, USB-C au bord gauche avec U8 immediatement en sortie.
R32/R33 restent proches du module. Reset/boot accessibles sous le module.
Alimentation USB/cellule en colonne a gauche, regulateur et ses condensateurs
groupes, connecteur cellule au bord. LEDs accessibles sur le cote gauche.

U3 est retourne pour presenter son canal CV a K1 et son canal libre a J7.
Q21/Q22 et leurs protections occupent l'espace au-dessus de U3; les trimmers
restent accessibles au tournevis. Leur distance au BQ reste une reserve de
routage analogique, notamment RV1 : ne pas figer cette place sans ses retours.

J5 regroupe les GPIO sous la logique. J32 et J33 sont a gauche de l'entree
redressee, avec croisements a examiner explicitement dans le guide. J31 est
au bord droit; JP30/JP31 restent accessibles en bas.

H4 deplace provisoirement a (15,125), D1 a (87.3,116) pour degager les
connecteurs. Pas de segments conserves attaches a ces objets. Les trois autres
fixations restent a leur position precedente. Les quatre fixations ne sont pas
encore un plan mecanique de bridage du radiateur valide.

Corrections apres DRC : J21 a (33,45), C42 a (31,82), R51 a (36,58.5).
J26 rentre dans le contour a (17,82), R47 a (24,87), J31 a (113,111).
Ces corrections eliminent les collisions de composants constatees pendant la
passe, y compris le contact provisoire J21/TP47; elles ne changent aucun net.

## Controles

Relecture de 149 empreintes et de leurs pads via IPC. Verification des 79
placements modifies (77 nouveaux + D1/H4), et des positions non modifiees.
Une tolerance de 2nm couvre la conversion de coordonnees IPC, pas une tolerance
d'assemblage. Comparaison avant/apres des numeros de pads et nets des 77
empreintes nouvellement placees : identique. Les 17 pistes sont identiques
aux donnees de la passe 3.

Synchronisation schema -> PCB : `noop`, `changes: []`, huit feuilles.
Les quatre fixations hors schema sont preservees. Aucun composant ajoute/perdu.

DRC final sur fichier sauvegarde : **118 constats** :

- 4 erreurs connues de clearance de trous internes a J27 : 0.1944mm mesure,
  contre 0.25mm dans les contraintes actuelles. Deplacer J27 ne les corrige pas.
- 114 avertissements de serigraphie : 64 chevauchements, 48 sur cuivre et
  deux au bord, ces derniers lies au debord de U2.
- 326 connexions non routees et quatre constats de parite H1-H4 intentionnels.
- Aucun court-circuit, conflit de clearance cuivre entre composants,
  chevauchement de courtyards, pont de masque ou difference de bibliotheque.

Les pertes d'attributs de bibliotheque liees aux deplacements IPC de U2,
J27, Q20 et Q22 ont ete restaurees avec la commande native KiCad, limitee a
chaque reference. Textes/positions de champs non reinitialises. Le DRC final
confirme l'absence de mismatch, et la relecture confirme les positions/nets.

Vues dessus/dessous inspectees. La serigraphie reste a disposer proprement;
ne pas cacher les references ou accepter ces avertissements comme un DRC vert.
Le modele 3D du pont conserve un ancien chemin absolu : cette passe ne valide
pas la 3D. Le contour RF, les fils de puissance et le radiateur restent ouverts.

## Prochaine revue

Priorite au trajet F1/JP30 vers le banc d'entree, actuellement trop long,
aux retours analogiques RV1/CV, puis aux netclasses V2. Le placement complet
ne signifie pas que la carte est prete a router sans ces ajustements.
Pas de validation 70V/400W, mise sous tension, fabrication ou commande.

## Preuves locales

Dans `.konnect-scratch/` :

- `v2-before-rest-placement.kicad_pcb` : snapshot avant modifications.
- `pcb-rest-read-result.json`, `pcb-rest-cv-result.json`,
  `pcb-rest-logic-result.json` : lecture et poses initiales.
- `pcb-rest-correct-result.json`, `pcb-rest-edge-result.json` : corrections.
- `pcb-rest-verified-result.json`, `verify-rest-placement.mjs` : verification.
- `v2-rest-verified-drc.json` : dernier DRC.
- `v2-rest-verified-top.svg/.png`, `v2-rest-bottom.svg/.png` : vues; la vue
  dessous precede seulement les derniers deplacements J26/R47/J31 dessus.

SHA256 du PCB sauvegarde :
`5F906073E8FCF1618B214D85F78D62E0E9C4C04E4AFB36D95C02C10A2DC7A783`.
