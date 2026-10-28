# Routage local des reglages BQ, passe 4

13 octobre 2026. PCB sauvegarde via Konnect IPC, toujours partiellement route.
Pas de modification du schema, des composants, de leurs positions, des classes
ou du contour. Aucune autorisation de fabrication ou de mise sous tension.

## Connexions ajoutees

- U9.36 FSW_SYNC vers R60.1, puis retour R60.2 a la masse locale du BQ.
- U9.7 CE vers R71.1 et retour R71.2 a la masse.
- U9.9 ICHG vers R61.1, U9.10 ILIM_HIZ vers R62.1; retour R62.2 a la masse.
- U9.8 TS vers R72.2/R73.1; retour R73.2 a la masse.
- TP44 raccorde a ce groupe de masse analogique.
- R63.2 vers R64.1, R64.2 vers R65.1, R65.2 a la masse.
- Prise VAC pour R63.1 depuis la borne force R1.1, distincte de ses prises
  Kelvin. Cette branche de 0.25mm n'alimente que le pont de seuils; elle ne
  doit jamais servir de chemin principal pour la puissance.

37 segments ajoutes : 30 dessus, 7 dessous. Quatre vias 0.60/0.30mm ajoutes.
Total : 203 segments, 20 vias, 149 empreintes. Les 166 segments precedents
sont conserves avec UUID, geometrie et net identiques.

## Justification des passages dessous

La liaison TS passe dessous entre (78.8,61.25) et (78.325,67.7)mm. Elle
franchit les echappements ICHG/ILIM sans deplacer les resistances proches
de leurs broches, sans detour autour du filtre de mesure de sortie et sans
traverser les corridors SW/HIDRV. Deux segments, largeur 0.25mm.

Deux autres vias GND a (78.8,59.225) et (75,61.175)mm rejoignent le retour
deja route sous le BQ via (80,57.5)mm. Cinq segments dessous, largeur 0.60mm.
Les branches dessus de 0.40mm raccordent R60/R71/R62/R73/R65 et TP44.
Les faire rejoindre l'EP entierement dessus croiserait les echappements du CI.
Ces traces ne sont pas des retours de puissance ni un remplacement du futur
plan analogique continu. Reexaminer le tout au moment des plans.

## Ce qui reste ouvert

Ne pas qualifier ces blocs de termines :

- ACUV/ACOV : pont resistif cable, mais liaisons aux broches U9.34/.35 non
  tracees. L'espace entre le rail VAC/C63 et les broches du QFN est insuffisant
  pour un echappement double evident respectant les regles. Revoir ensemble
  position/orientation du decouplage et echappement avant d'ajouter des vias.
  Aucune modification speculative de cette zone n'a ete appliquee.
- ICHG : R61 relie au BQ, mais branche R61.2 vers RV1 et retour du trimmer
  encore ouverts. La position lointaine de RV1 doit etre revue.
- TP41/TP42 : encore non raccordes aux reglages ICHG/ILIM.
- CE : resistance locale raccordee; acces J32 encore ouvert.
- TS : resistances locales raccordees au BQ; alimentation REGN de R72.1
  et liaison au connecteur externe J33 encore ouvertes.
- VAC : ce nouveau depart vers R63 ne complete pas l'alimentation du petit
  groupe C62/C63/C64, ni le bus de puissance.
- I2C/INT, CV/FBG, logique, puissance et plans restent partiellement ou
  totalement non routes. Les limites thermiques/electriques ne sont pas validees.

## Verification

Pastilles relues en IPC avant routage. Relecture des pistes, placements et
classes apres sauvegarde; les 149 placements et toutes les classes sont
identiques. Synchronisation schema/PCB en lecture seule : `noop`.

DRC sauvegarde : 119 violations, types et nombres inchanges : 4 espacements
trou/cuivre J27 et 115 avertissements de serigraphie. Aucun nouveau defaut
cuivre, courtyard ou bibliotheque. 259 connexions non routees, contre 274.
Quatre messages H1-H4 de parite intentionnels. FSW_SYNC n'apparait plus
parmi les nets non connectes; les connexions ouvertes ci-dessus restent visibles.

Export SVG du cuivre sauvegarde inspecte visuellement. Script de comparaison
`verify-settings-pass.mjs` : PASS. Preuves locales dans `.konnect-scratch/` :
`settings-read-result.json`, `settings-extra-read-result.json`,
`settings-final-result.json`, `settings-final-drc.json`, `settings-final.svg`
et `settings-final-detail.png`. Aucun masquage DRC ni relachement de regle.

## Prochaine passe

Traiter l'echappement ACUV/ACOV et les positions/accessibilites RV1 et TP41/42,
puis terminer REGN/TS et les interfaces locales. Revoir F1/JP30 avant les
grosses pistes d'entree. Conserver les protections de prises Kelvin et les
reserves de masse/assemblage/thermique des passes precedentes.
