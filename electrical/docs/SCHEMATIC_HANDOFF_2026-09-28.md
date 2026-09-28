# Handoff schéma — 28 septembre 2026

## État validé automatiquement

- ERC du schéma hiérarchique : **0 erreur**, 2 avertissements, tous deux sur
  `UART_TX` relié à une seule broche.
- Correspondance pins/labels hiérarchiques : **0 problème**.
- Audit de connexions : 7/7 feuilles, 97 instances de symboles, **0 anomalie**.
- Audit BOM : 61 composants, **0 empreinte, valeur ou MPN manquant** selon le
  contrôle Konnect.
- Détection de nets fusionnés : **0 court-circuit** sur les 7 fichiers de
  schéma.
- Netlist indépendante : `R12.1 = GND`, `R12.2 = RON_SET`, `U4.4 = RON_SET`.
- Netlist indépendante : `TP13.1 = AUX_PGOOD`, avec `R15.2` et `U4.6`.

Les alertes automatiques de découplage restantes ne justifient pas de modifier
le circuit : le Beetle U2 est un module avec découplage embarqué et la broche
VBUS de l'INA228 U1 est une entrée de mesure, pas une alimentation. Ces deux
points sont maintenant documentés dans les champs des symboles.

## Modifications schéma terminées

- RON corrigé : `U4.4 RON -> R12 41,2 kΩ -> GND`.
- TP13 ajouté sur `AUX_PGOOD`.
- TP12 renommé `AUX_IN_PROTECTED`.
- Fabricant, MPN et informations de montage complétés pour les références
  critiques, dont F1, F2, D2, J1, J5, J6, U1, U3, U4, C5, C7 et C8.
- Liens officiels de datasheet ajoutés dans KiCad pour F2, J5/J6, U1, U3 et U4.
- `S1` remplacé par `JP4`, jumper 1×2 au pas de 2,54 mm entre `BAT_RAW` et
  `BAT_CTRL` ; métadonnées C&K supprimées.
- BOM courante régénérée dans `electrical/bom/controller-v1-current.csv`.

## Action PCB bloquante — à faire manuellement

Le PCB n'a volontairement pas été modifié. La simulation de synchronisation ne
signale désormais qu'un conflit : l'objet correspondant à `JP4` porte encore
l'ancienne empreinte C&K. À faire :

1. Enregistrer le PCB.
2. Remplacer l'empreinte existante de JP4 par
   `Connector_PinHeader_2.54mm:PinHeader_1x02_P2.54mm_Vertical`.
3. Vérifier pad 1 = `BAT_RAW`, pad 2 = `BAT_CTRL`, puis placer et rerouter JP4.
4. Mettre à jour le PCB depuis le schéma et vérifier que la parité est rétablie.
5. Remplir les zones puis relancer le DRC.

## Contrôles PCB encore nécessaires

- Construire autour de F1 un chemin d'environ 10 mm équivalents en cuivre
  105 µm/3 oz, sans étranglement ; utiliser B.Cu et des vias de couture si
  possible.
- Vérifier/résoudre les divergences entre empreintes placées et bibliothèques,
  particulièrement U2, JP4, F2, R1, L1, C6, J1/J2 et J6.
- Vérifier à l'échelle 1:1 U4, F1, F2, D2, U2, JP4, J1, J2, J5 et J6.
- Pour U4, contrôler pin 1, pads 1–8, EP9, ouverture F.Mask
  `2,71 × 3,40 mm`, six vias thermiques et compatibilité du perçage avec le
  fabricant PCB.
- Vérifier physiquement J6 : pad 1 = `BAT_RAW`, pad 2 = `GND`.
- Confirmer le dégagement USB/antenne et l'ajustement réel du Beetle et de ses
  sockets.
- Matérialiser le refroidissement arrière de D2 : surface plane au moins
  35 × 25 mm, interface thermique et fixation M4.

## Décisions et essais électriques à valider

- Décider le devenir de `UART_TX` : point de test/connecteur ou suppression du
  label avec non-connexion explicite.
- Décider si `AUX_PGOOD` reste un simple point de mesure ou doit commander un
  verrouillage matériel/une entrée MCU.
- Ne jamais alimenter J1 et J8 simultanément.
- Garder JP3 ouvert lorsque l'USB est branché ; ne le fermer qu'après validation
  de l'absence de retour de courant.
- Hors tension : mesurer environ 41,2 kΩ entre RON et GND et vérifier l'absence
  de continuité entre RON et `AUX_IN_PROTECTED`.
- Première alimentation à 10–12 V avec limitation de courant, J8 débranché,
  JP3 ouvert et USB débranché. Vérifier `AUX_5V`, TP13/PGOOD et les seuils UVLO
  proches de 9,0 V à la montée et 8,4 V à la descente.
- À l'oscilloscope, utiliser une connexion de masse très courte ou une sonde
  différentielle ; vérifier environ 300 kHz et les transitoires, sans accrocher
  une longue pince de masse au nœud SW.
- Faire les essais thermiques de U4, L1, C5/C7/C8, F1, F2 et D2. La carte V1
  reste spécifiée à 70 V continus ; 70–80 V est une zone d'essai hors
  spécification tant que les surtensions ne sont pas prouvées maîtrisées.

## Artefacts de preuve

- Netlist : `.konnect-scratch/final-schematic.net`.
- Rapport ERC filtré : `.konnect-scratch/final-erc.json`.
- Snapshot PDF final du schéma :
  `.konnect-scratch/snapshots/bike-generator-controller_after-schematic-ron-metadata_1790592617.pdf`.
