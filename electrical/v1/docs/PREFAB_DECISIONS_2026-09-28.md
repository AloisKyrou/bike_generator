# Décisions et actions pré-fabrication — 28 septembre 2026

Ce document consolide les décisions prises après l'audit de la BOM, des
empreintes et du routage enregistré. Il ne remplace pas le dernier ERC/DRC.

## Décisions figées

| Bloc | Décision | Source fabricant |
|---|---|---|
| U3 | Conserver `MCP42100-I/SL`, Microchip, SOIC-14, 100 kΩ double canal. Utiliser les deux canaux CC et CV ; SPI en écriture seule, `SO` explicitement non connecté. | Microchip DS11195C, pages PDF 1, 12 et 27. |
| F2 | `0449001.MR`, Littelfuse, 1 A, 125 V, temporisé. L'empreinte validée a un corps 6,10 × 2,69 mm, des pads 1,96 × 3,15 mm et un entraxe calculé de 4,91 mm. | Littelfuse série 449, page PDF 3. |
| J1 | Peupler J1 sur les premiers prototypes, en même temps que J8 et D2, afin de démontrer les deux variantes d'entrée. Ne jamais brancher/alimenter J1 et J8 simultanément. | Décision projet. |
| J5 | Embase JST `S4B-PH-K-S(LF)(SN)`, boîtier câble `PHR-4`, contacts `SPH-002T-P0.5S`. | JST série PH, pages PDF 1 à 3. |
| J6 | Embase JST `S2B-PH-K-S(LF)(SN)`, boîtier câble `PHR-2`, contacts `SPH-002T-P0.5S`. Vérifier la polarité du câble réel : pad 1 = BAT_RAW, pad 2 = GND. | JST série PH, pages PDF 1 à 3. |
| U1 | Fabricant `Texas Instruments`, MPN `INA238AIDGSR`, boîtier DGS/VSSOP-10. Remplacement broche à broche de l'INA228 ; registres et facteurs firmware différents. | TI SLYS025B, brochage p. 3, caractéristiques p. 4 et calculs p. 29. |
| U4 | Fabricant `Texas Instruments`, MPN `LM5164DDAT`, boîtier DDA/PowerPAD-8. | TI SNVSAU4D, pages PDF 3, 28 à 30 et 34. |
| CIN | C5/C7/C8 : Samsung `CL32Y106KCVZ4NE`, 10 µF, 100 V, X7S, 1210. Environ 4,18 µF effectifs au total à 80 V et 25 °C d'après la courbe DC-bias. | Courbe Samsung du `CL32Y106KCVZ4NE` et TI SNVSAU4D page PDF 18. |

## Correction électrique effectuée dans le schéma

Le schéma relie désormais `R12 = 41,2 kΩ` entre `RON_SET` et `GND`. L'ancienne
connexion entre `AUX_IN_PROTECTED` et `RON_SET` a été supprimée. La fiche TI
décrit bien une résistance de programmation entre RON et GND, et la limite
absolue de RON est 5,5 V.

Correction requise :

```text
U4.4 RON ── R12 41,2 kΩ ── GND
```

La valeur 41,2 kΩ reste correcte et donne environ 303 kHz pour une sortie 5 V
(TI, équations 12 et 15, page PDF 17). La synchronisation PCB reste à faire :
Konnect refuse correctement de réaffecter `R12.1` tant que l'ancien petit
segment routé sur `AUX_IN_PROTECTED` est encore présent. Après sa suppression,
raccorder R12 à GND par une liaison très courte, loin de SW, remplir les zones
puis relancer ERC, DRC et contrôle de parité.

## F1 et cuivre de puissance

F1 est le Littelfuse `0456020.ER`. Son land pattern est conforme à la page 3 de
la fiche série 456 : pads 3,25 × 3,43 mm, entraxe 9,35 mm. En revanche, le PCB
enregistré utilise au maximum une piste de puissance de 5 mm alors que le test
thermique Littelfuse à 20 A emploie au moins 100 µm de cuivre et 10 mm de
largeur.

La modification retenue est : cuivre nominal 105 µm (3 oz) et largeur
équivalente de 10 mm autour de F1, de préférence au moyen de polygones cuivre
avec raccordement progressif aux pads, sans col étroit. La place existe sur le
PCB actuel, mais D1 et les points de test immédiatement au-dessus de F1 devront
probablement être décalés vers le haut. Ajouter si possible du cuivre B.Cu en
parallèle et des vias de couture hors des zones de soudure. La température du
corps de F1 doit rester ≤ 90 °C à 25 °C ambiant pour revendiquer 20 A continus.

## D2 et refroidissement

Le `DBI25-16A` n'est pas un pont 20 A continu en air libre. La fiche Diotec,
pages PDF 1 et 2, donne 4 A à 50 °C ambiant sans dissipateur, 25 A avec boîtier
maintenu à 115 °C et 40 A avec boîtier maintenu à 85 °C. Le boîtier isolé fait
35 × 25 × 4 mm et se fixe par vis M4 à 1 N·m ±10 %.

Pour le prototype, prévoir dans la BOM mécanique :

- une plaque/dissipateur aluminium à face plane couvrant au moins 35 × 25 mm ;
- une interface thermique mince (pad ou graisse) ;
- une vis M4, rondelle et écrou adaptés ;
- contrôle de température du boîtier pendant les essais.

Aucun MPN de dissipateur n'est figé sans connaître le boîtier mécanique et le
volume d'air disponible. Un courant proche de 20 A reste limité à quelques
secondes tant qu'un essai thermique n'a pas démontré davantage.

## Résistances LM5164

Les contrôles de tension, puissance et tolérance ne sont pas reportés au
prototype : ils sont déjà effectués sur calcul.

| Réseau | Résultat à 80 V / 5 V | Conclusion |
|---|---|---|
| UVLO 1 MΩ / 200 kΩ | démarrage ≈ 9,0 V, arrêt ≈ 8,4 V ; 4,44 mW et 0,89 mW ; tension max ≈ 66,7 V sur la 1 MΩ | 0805 1 %, 150 V/125 mW typiques : marge suffisante. |
| FB 316 kΩ / 100 kΩ | FB ≈ 1,202 V, VOUT ≈ 5,0 V ; puissance < 0,1 mW par résistance | 0,1 % retenu : conforme. |
| RON 41,2 kΩ | ≈ 303 kHz ; faible tension lorsque raccordée correctement à GND | Valeur et schéma corrigés ; PCB à synchroniser. |
| PGOOD 47 kΩ | ≈ 0,23 mW sous 3,3 V | Conforme. |

Le prototype doit encore vérifier les seuils réels sur rampe lente, la stabilité,
les températures et les transitoires ; il ne remplace pas ces calculs.

## État des modifications KiCad

Les champs Manufacturer/MPN, la correction RON, J1/F2/TP12 et le point de test
PGOOD TP13 sont appliqués dans le schéma avec Konnect. Le PCB doit encore être
synchronisé après suppression manuelle du segment routé attaché à `R12.1`.
Le déplacement de D1/des points de test et l'élargissement du cuivre de F1
restent des opérations de routage utilisateur. Ne pas éditer les fichiers
`.kicad_*` à la main.

## Contrôles automatiques du 28 septembre 2026

- DRC : **0 erreur**, **0 pad non connecté**, 88 avertissements.
- Détail DRC : 43 divergences de copie d'empreinte, 24 sérigraphies sur masque,
  18 chevauchements de sérigraphie et 3 sérigraphies trop proches du bord.
- ERC : **0 erreur**, 2 avertissements `UART_TX` relié à une seule broche.
- Cinq contrôles DRC restent ignorés dans le projet, dont l'absence de courtyard
  et la cohérence filtre/type d'empreinte ; ils doivent être réactivés et examinés
  avant fabrication.

Un DRC vert ne détectait pas l'ancienne mauvaise topologie de R12/RON puisque
la netlist correspondait au schéma. Le schéma est corrigé ; le blocage restant
est maintenant explicite et mécanique : retirer l'ancien segment cuivre puis
synchroniser le PCB.
