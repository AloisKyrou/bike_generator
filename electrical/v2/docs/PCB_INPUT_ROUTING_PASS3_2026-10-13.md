# Routage des mesures et du decouplage VAC, passe 3

13 octobre 2026. PCB V2 sauvegarde via Konnect IPC. Routage partiel uniquement;
aucune autorisation de fabrication ou de mise sous tension.

## Changements

- 49 segments ajoutes : 43 F.Cu et 6 B.Cu, ces derniers exclusivement GND.
- Deux vias GND 0.60/0.30mm ajoutes, hors des pastilles de composants.
- 166 segments et 16 vias au total. Les 117 segments precedents sont preserves.
- 149 empreintes inchangees : aucun deplacement, changement de composant,
  schema, netclass ou contour pendant cette passe.

Les filtres R80/R81, C67/C68/C69 rejoignent maintenant ACP/ACN du BQ.
C62/C63/C64 sont relies entre eux et aux deux broches VAC. Le raccord VAC
comporte un col de 0.25mm au CI, puis 0.40/0.60mm pour le decouplage :
ce n'est PAS une piste de transit de la puissance du convertisseur.
L'alimentation de ce petit reseau depuis le bus VAC reste a router.

## Prises de mesure

R1 utilise ses vraies bornes Kelvin : pad3 vers R80.1, pad2 vers R81.1.
La piste du pad3 passe par le couloir de 0.80mm entre les pastilles force
et sense inferieures, a x=83.35mm, avec une largeur de 0.25mm. Elle ne touche
ni la borne force ni l'autre borne sense. Preserver cette separation lors
du futur routage et des zones; ne pas fusionner force et sense sur le PCB.

R75 est un shunt DEUX bornes, pas un quatre-bornes. Les prises R82/R83
rejoignent directement le cote interieur de ses deux pastilles par des
pistes dediees, separees du futur trajet de puissance. Le couple de pistes
est principalement a x=83.2/84.0mm, soit 0.55mm de separation cuivre,
conformement a la classe sortie existante. Aucun assouplissement des regles.
Amener le courant principal par les cotes exterieurs des pastilles et conserver
les branches de mesure sans courant de charge. L'erreur residuelle des
terminaisons/soudures d'un shunt deux-bornes reste a qualifier.

## Dessous et masse

Les deux nouveaux vias sont a (80,53.2625) et (83.1,49.8)mm. Ils raccordent
les masses des filtres/condensateurs au retour local du BQ, via le point GND
deja present sous son pad expose a (84.6,60)mm.

Ce passage dessous evite de traverser sur le dessus les signaux de mesure,
le rail VAC et les echappements analogiques du QFN. Aucun signal ACP/ACN,
VAC ou prise de shunt ne change de couche dans cette passe. Les traces de
mesure restent a gauche des corridors SW/HIDRV precedemment routes dessous.

Ces pistes GND assurent une connexion explicite tant qu'il n'existe aucun
plan. Elles ne remplacent pas la future region de masse continue a faible
impedance. Reexaminer leur utilite avec les plans, et ne pas y faire passer
le retour de puissance. Le via deja present dans le pad expose reste soumis
aux reserves de soudure/pate et de dimensionnement thermique de la passe 2.

## Verification

- Relecture IPC des pastilles avant routage et des pistes apres sauvegarde.
- Comparaison UUID/geometrie : les 117 anciennes pistes sont identiques.
- Liste des 149 empreintes et classes identiques avant/apres.
- DRC sauvegarde : 119 violations, toutes de types et nombres inchanges :
  4 espacements trou/cuivre USB J27, 115 avertissements de serigraphie.
- Aucun nouveau court-circuit, espacement cuivre, chevauchement de courtyard
  ou desaccord de bibliotheque.
- 274 connexions non routees, contre 293 avant cette passe.
- ACP/ACN et les deux nets Kelvin dedies R1 ne figurent plus parmi les
  connexions non routees. Les nets de puissance restent incomplets.
- Quatre messages de parite H1-H4 intentionnels; synchronisation schema/PCB
  en lecture seule : `noop`, aucune modification prevue.
- Export SVG du cuivre sauvegarde inspecte visuellement, entre R1 et R75.

Des espacements insuffisants observes pendant la passe ont ete corriges par
retouche des pistes : voisinage C69, col VAC et separation des prises R75.
Aucune exclusion DRC ajoutee.

Preuves locales non versionnees dans `.konnect-scratch/` :
`input-pass-read-result.json`, `kelvin-final-result.json`,
`input-final-drc.json`, `input-final.svg`, `input-final-detail.png`,
`verify-input-pass.mjs` (PASS).

## Suite

1. Terminer les reglages/echappements analogiques proches du BQ : ACUV/ACOV,
   FSW, ILIM/ICHG et retours appropries.
2. Revoir la position F1/JP30 avant de tracer leur longue liaison vers R1
   et la banque d'entree; ne pas figer une mauvaise implantation par du cuivre.
3. Router les boucles de puissance et retours des sources basses en preservant
   les prises Kelvin et les retours de commande. Les liaisons SW de 0.60mm
   existantes ne sont pas dimensionnees pour conduire le courant principal.
4. Conserver les controles finaux de plans, thermique, RF/USB, geometrie
   du radiateur, serigraphie et empreinte USB. Aucun courant/puissance nominal
   nouveau n'est valide par cette passe.
