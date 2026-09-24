# Campagne de mesures avant schéma définitif

Cette campagne sert à transformer les hypothèses issues des photos et du code en
entrées de conception vérifiées. Les mesures de résistance et de continuité se
font hors tension. Les mesures sous tension doivent commencer avec une source
limitée en courant et sans connecter la BLUETTI tant que les polarités et limites
ne sont pas confirmées.

## Photos et références

- [ ] recto et verso de la Beetle, sérigraphie lisible ;
- [ ] dessus du module ACS712 et marquage du circuit ;
- [ ] valeurs ou marquages précis des résistances du pont diviseur ;
- [ ] recto et verso du buck, inscriptions et référence du contrôleur visibles ;
- [ ] gros plan sur les fils reliant le DFR0520 au buck ;
- [ ] vue complète du chemin des gros fils rouges et de leurs polarités.

## Mesures hors tension

- [ ] continuité entre négatif du redresseur et IN- du buck ;
- [ ] continuité entre IN- et OUT- du buck ;
- [ ] continuité entre OUT- et GND de l'ESP32 ;
- [ ] identification des bornes A, W et B du réglage CC ;
- [ ] résistance A-B du potentiomètre CC ;
- [ ] résistances A-W et W-B aux positions minimum, milieu et maximum ;
- [ ] bornes PA/PW/PB réellement utilisées sur le DFR0520 ;
- [ ] mode exact du fusible et emplacement dans la chaîne.

## Mesures sous tension, sans pédalage

- [ ] tension d'alimentation réelle de la Beetle ;
- [ ] tension d'alimentation réelle du DFR0520 ;
- [ ] tension d'alimentation réelle de l'ACS712 ;
- [ ] sortie de l'ACS712 à zéro courant ;
- [ ] tensions des bornes CC du buck par rapport à IN- ;
- [ ] mêmes tensions par rapport à OUT- ;
- [ ] comportement de la commande CC si le DFR0520 est débranché ;
- [ ] comportement au reset et à la mise sous tension de l'ESP32.

## Validation de l'alimentation auxiliaire

Ces essais seront réalisés sur alimentation de laboratoire limitée en courant,
avant toute connexion à la génératrice ou à un ordinateur :

- [ ] démarrage du convertisseur auxiliaire à 10 V et établissement du 5 V ;
- [ ] régulation du 5 V aux tensions d'entrée représentatives jusqu'à 60 V ;
- [ ] consommation à vide et rendement à 100, 400 et 600 mA ;
- [ ] courant d'appel permettant de sélectionner `F_AUX` sans déclenchement
      intempestif ;
- [ ] température du LM5164, de l'inductance et des condensateurs ;
- [ ] seuils `EN/UVLO` et comportement de `PGOOD` ;
- [ ] tension résiduelle côté générateur lorsque seul l'USB alimente le Beetle ;
- [ ] absence de retour de courant avec `JP_GEN_5V` ouvert ;
- [ ] comportement avec `JP_GEN_5V` fermé et USB volontairement absent ;
- [ ] bascule générateur vers batterie lorsque l'entrée auxiliaire disparaît ;
- [ ] courant de charge réel et température de la batterie 400–500 mAh ;
- [ ] démarrage automatique en pédalant avec batterie déconnectée ;
- [ ] état de la commande CC avant, pendant et après l'initialisation du MCU.

Ne pas réaliser un essai générateur + USB simultané avant validation de
l'isolation. La batterie utilisée devra posséder une protection intégrée et une
fiche autorisant le courant de charge mesuré.

## Mesures en fonctionnement

Pour chaque point, noter la cadence ou la vitesse de génératrice, la position du
potentiomètre numérique, l'état de la BLUETTI et la configuration des lampes.

| Essai | RPM/cadence | Wiper | V avant buck | I avant buck | V après buck | I après buck | Température buck | Sensation |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| ralenti | | | | | | | | |
| 30 W annoncé | | | | | | | | |
| 60 W annoncé | | | | | | | | |
| 90 W annoncé | | | | | | | | |
| limite actuelle | | | | | | | | |

Mesurer également :

- [ ] tension redressée maximale sans charge, en restant sous une vitesse sûre ;
- [ ] tension et courant juste avant le point où la résistance semble disparaître ;
- [ ] mêmes valeurs juste après ce point ;
- [ ] comportement avec BLUETTI puis avec charge de dissipation connue ;
- [ ] température du buck et des connecteurs après un effort soutenu ;
- [ ] courant maximal raisonnablement observé et courant cible de conception.

## Décisions produites par ces mesures

La campagne doit permettre de figer :

1. la tension nominale et la surtension à supporter ;
2. le courant maximal, le fusible et le connecteur de puissance ;
3. la valeur, la puissance et le boîtier du shunt ;
4. la stratégie de masse ;
5. la protection de l'INA228 contre les transitoires ;
6. les valeurs et références de l'alimentation auxiliaire 5 V ;
7. le brochage de `J_CC_CTRL` ;
8. la valeur de repli sûre de la résistance ;
9. les limites logicielles de tension, courant, puissance et température.
