# Echappement des seuils et potentiometre, passe 5

13 octobre 2026. PCB V2 sauvegarde via Konnect IPC. Travail de routage partiel;
aucune validation de puissance, fabrication ou mise sous tension.

## Resultat

ACUV et ACOV relient maintenant leurs broches BQ au pont R63/R64/R65.
R61.2 rejoint RV1.3; RV1.1/.2 rejoignent la masse analogique locale. Le
potentiometre mecanique de courant n'est plus isole au bord superieur.

228 segments et 25 vias au total. Treize segments locaux VAC/ACP/ACN ont ete
remplaces; les 190 autres segments preexistants sont identiques. Trente-huit
segments sont nouveaux dans l'etat final, soit un gain net de 25. Cinq vias
ajoutes. Les classes, le schema, les composants et le contour sont inchanges.

## Placement ajuste

Coordonnees mm, references d'ancrage KiCad, pas centres des corps :

| Reference | Avant x/y/angle | Apres x/y/angle | Motif |
|---|---|---|---|
| C63 | 81.5/54.3/90 | 81.2/54.3/90 | Degager l'echappement analogique |
| C67 | 84.5/54.65/90 | 84.5/54.15/90 | Degager le raccord VAC pres du BQ |
| RV1 | 84/25/0 | 68.2/76.5/180 | Rapprocher le reglage ICHG et sa masse |
| TP43 | 73.5/73.5/0 | 70/70/0 | Laisser de la place au corps de RV1 |

Les 145 autres placements sont inchanges. Identites/nets/geometries de
pastilles des condensateurs et de RV1 relus et compares. TP43 reste un simple
pad REGN, non raccorde a cette etape, sans ajout de composant a acheter.

RV1 avait d'abord ete envisage 1.2mm plus a gauche : le DRC a detecte une
collision de courtyard avec J8, corrigee. Dans la position finale, l'enveloppe
de RV1 est x65.72..75.76/y73.83..79.16, contre x53.2..65.4/y58.3..74.55 pour
J8. R66 commence a x76.55. Les broches traversantes de RV1 sont a y76.5,
leurs pastilles finissant a y77.22; le courtyard B de D2 commence a y79.
Cela ecarte les broches de l'emprise dessinee du pont, mais ne qualifie pas
le montage reel, la longueur des queues coupees ou le contact au radiateur.

## Strategie de couches

- ACOV reste entierement sur F.Cu. Il contourne le bas du groupe VAC et
  rejoint R64/R65 sans traverser FSW ni les pastilles de decouplage.
- Le petit depart VAC du CI passe sous le PCB entre les vias
  (82.8,54.6) et (84.1,56.15). Il libere la sortie des broches 34/35.
  Largeur 0.40mm dessous, col 0.25mm aux broches VAC : branche du CI,
  jamais trajet principal de puissance. Le cuivre de decouplage reste a
  revoir avec la region de masse finale; ce passage ne qualifie pas la CEM.
- ACUV passe sous le PCB entre (83.5,55.4) et (75.5,48.9), a 0.25mm. Son
  parcours contourne les retours GND deja traces et reste a gauche des
  corridors SW/HIDRV. Ce n'est pas une preuve d'optimum global : conserver
  une reference de masse continue et reexaminer ce voisinage avec les plans.
- R61.2 utilise un seul via a (76.5,64.1), puis rejoint directement la
  pastille traversante RV1.3 a (73.28,76.5) sur B.Cu. Ce passage franchit
  les branches de masse du dessus sans allonger le trajet autour du groupe
  thermique. RV1.1/.2 retournent a TP44/masse locale sur F.Cu.

La solution conserve le groupe de mesure sans le deplacer entierement.
Les liaisons ACP/ACN ont ete retracees autour de C67; elles restent sur F.Cu.
Les prises Kelvin de R1 et R75, et tous les circuits de commande des grilles,
sont preserves. Aucun plan n'est ajoute a ce stade.

## Verification

- Relecture live avant mutation : 203 segments, 149 empreintes.
- Relecture finale et comparaison des 190 traces conservees, 4 placements
  autorises, classes et pastilles : PASS.
- DRC sauvegarde : 124 violations, soit 4 erreurs USB J27 deja connues et
  120 avertissements de serigraphie (2 bord, 66 superpositions, 52 sur cuivre).
  Cinq avertissements de serigraphie de plus que la passe 4; nettoyage reporte
  explicitement, aucun masquage. Aucun court-circuit, espacement cuivre,
  chevauchement de courtyard ou desaccord de bibliotheque restant.
- 254 connexions non routees, contre 259. ACUV, ACOV et Net-(R61-Pad2)
  ne figurent plus parmi les nets non connectes.
- Quatre messages de parite intentionnels H1-H4; synchronisation en lecture
  seule `noop`. Export cuivre final inspecte visuellement.

Pendant la passe, un conflit VAC/ACUV sous le BQ a ete corrige en ecartant
la piste VAC. Le DRC final ci-dessus est posterieur a cette correction et
au deplacement final de RV1. Aucune regle de clearance n'a ete reduite.

Preuves locales dans `.konnect-scratch/` : `fanout-before-result.json`,
`fanout-move-result.json`, `rv-move-result.json`, `fanout-verified-result.json`,
`fanout-verified-drc.json`, `fanout-verified.svg`, `fanout-verified-detail.png`,
`verify-fanout-pass.mjs` (PASS). Les fichiers de requetes MCP enregistrent les
UUID des 13 anciennes pistes retirees et toutes les operations.

## Connexion KiCad

Au debut de cette passe, seul le gestionnaire etait ouvert. Un editeur PCB
lance separement n'etait pas expose au socket utilise par Konnect :
`AS_UNHANDLED/GetOpenDocuments`. Aucun changement CAD n'a alors ete applique.
Fermeture normale des fenetres, puis ouverture seule de pcbnew sur le PCB V2 :
IPC retabli et etat relu avant toute mutation. Pas de reecriture native ni
de contournement d'une protection `unsafe_file_fallback`.

## Suite

Terminer TP41/TP42, REGN vers R72/TP43, TS vers J33 et CE vers J32, puis
les interfaces I2C/INT et le groupe CV/FBG. La thermistance et les acces de
test ne sont pas complets. Revoir le chemin F1/JP30 avant le cuivre de
puissance; garder les reserves de plans, USB, thermique, radiateur et RF.
