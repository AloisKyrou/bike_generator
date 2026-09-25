# DFR0868 V2.0 — USB, VIN et batterie

Date d'analyse : 24 septembre 2026.

## Conclusion

Sur le schéma officiel du DFR0868 V2.0, la broche externe appelée `VIN_5V`
dans notre symbole correspond au net `VUSB`. Ce net est directement commun au
VBUS du connecteur USB-C.

Il ne faut donc jamais fermer le cavalier générateur `JP3` pendant que le port
USB-C est relié à un ordinateur. Le 5 V du LM5164 pourrait sinon être renvoyé
vers le VBUS du PC, tandis que l'alimentation USB et le LM5164 seraient reliés
en parallèle sans partage de courant maîtrisé.

## Chemin interne démontré par le schéma DFRobot

```text
USB-C VBUS ---- VUSB ----+---- TP4057 ---- BAT ---- Q1 PMOS ----+---- RT9080 ---- 3V3
                         |                                      |
                         +---------------- D1 -------------------+

Broche VIN_5V ----------- VUSB
Broche BAT -------------- BAT
```

- Le TP4057 charge la cellule raccordée à `BAT` depuis `VUSB`.
- D1 alimente le régulateur 3,3 V depuis `VUSB` lorsqu'une source 5 V est
  présente.
- Q1 permet à la batterie d'alimenter le régulateur lorsque `VUSB` est absent
  et limite le conflit entre le chemin batterie et le chemin USB.
- Le circuit interne ne distingue pas un 5 V provenant du connecteur USB-C
  d'un 5 V injecté sur la broche `VIN_5V`.

Les fonctions de Q1 et D1 ci-dessus sont une interprétation du schéma de
commutation publié par DFRobot. Elles devront être confirmées sur la révision
physique par des mesures de tension et de courant avant validation produit.

## Architecture V1 placée dans KiCad

```text
AUX_5V ---- JP3 ---- VIN_5V / VUSB du DFR0868

LiPo 1S protégée ---- S1 ---- BAT du DFR0868
```

`JP3` est un cavalier amovible à deux broches. La CAO lui affecte
provisoirement un header traversant 1 × 2 au pas de 2,54 mm. Son rôle n'est pas
de sélectionner automatiquement la meilleure source : il isole physiquement
le générateur pendant le service USB.

`S1` déconnecte la borne positive de la batterie. Lorsqu'il est ouvert, la
batterie ne peut ni alimenter le contrôleur ni être rechargée. Cette propriété
répond à l'objectif d'éviter une décharge entre deux utilisations, au prix de
devoir fermer `S1` pour charger.

## Matrice d'utilisation

| Générateur | JP3 | USB-C | S1 / batterie | Résultat |
|---|---|---|---|---|
| arrêté | ouvert | débranché | fermé | fonctionnement sur batterie |
| arrêté | ouvert | branché | fermé | fonctionnement USB et recharge batterie |
| en marche | fermé | débranché | fermé | fonctionnement générateur et recharge batterie |
| en marche | fermé | débranché | ouvert | fonctionnement générateur, batterie isolée |
| en marche | ouvert | branché | quelconque | fonctionnement USB, générateur isolé du Beetle |
| quelconque | fermé | branché | quelconque | **état interdit** |

## Pourquoi une diode série simple ne suffit pas

Une diode orientée de `AUX_5V` vers `VIN_5V` empêcherait le courant de revenir
de l'USB vers le LM5164. Elle n'empêcherait pas le courant du LM5164 de traverser
la broche `VIN_5V`, d'élever `VUSB`, puis d'atteindre le VBUS du connecteur USB.

Une commutation automatique sûre nécessiterait un accès séparé au VBUS situé
avant sa jonction avec `VIN_5V`, ou une modification du module, ou un chemin USB
de données dont le VBUS est physiquement coupé. Ces solutions sont conservées
comme évolutions possibles, mais ne sont pas supposées en V1.

## Batterie à sélectionner

- chimie : Li-ion/LiPo 1S, 3,7 V nominal, 4,2 V pleine charge ;
- protection intégrée contre surcharge, décharge profonde et court-circuit ;
- cellule choisie par l'utilisateur : LiPo protégée `801350`, 500 mAh ;
- courant de charge continu autorisé : au moins 400 mA ;
- connecteur détrompé et polarité documentée ;
- dimensions mécaniques et plage de température compatibles avec le boîtier.

`J6` est associé à l'embase JST-PH horizontale `S2B-PH-K-S(LF)(SN)`, deux
contacts au pas de 2,00 mm. Le faisceau utilise un boîtier `PHR-2` et des
contacts `SPH-002T-P0.5S`. La vérification de la polarité reste obligatoire.

DFRobot annonce un courant de charge maximal de 400 mA. Pour la cellule 500 mAh
choisie, cela correspond à 0,8 C. La capacité seule ne suffit pas : la fiche de
la cellule doit autoriser ce régime, puis le courant réel doit être mesuré.

## Vérifications physiques obligatoires

1. Confirmer la sérigraphie et la révision du module réellement utilisé.
2. Mesurer la continuité entre `VIN_5V` et le VBUS USB-C, module hors tension.
3. Vérifier `JP3` ouvert qu'aucune tension générateur n'atteint le connecteur
   USB-C.
4. Vérifier `JP3` fermé et USB débranché la tension `VUSB`, `BAT` et `3V3`.
5. Mesurer le courant de charge réel avec la batterie définitive.
6. Vérifier que `S1` ouvert supprime bien charge et décharge de la cellule.

Sources officielles :

- [schéma DFR0868 V2.0](https://dfimg.dfrobot.com/nobody/wiki/d0e8b7f0f042c14f6959c3edc748053b.pdf) ;
- [wiki DFR0868 — caractéristiques électriques](https://wiki.dfrobot.com/dfr0868/).
