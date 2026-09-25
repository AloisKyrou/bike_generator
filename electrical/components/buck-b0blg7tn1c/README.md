# Buck CV/CC externe — Amazon B0BLG7TN1C

Statut : **module présent dans le prototype, circuit intégré exact inconnu**.

Référence commerciale communiquée :
[Amazon B0BLG7TN1C](https://www.amazon.fr/dp/B0BLG7TN1C).

## Données connues

- fonction : buck CV/CC externe annoncé pour environ 400 W ;
- entrée annoncée : environ 10–60 V DC ;
- sortie utilisée dans le projet : réglage manuel à 24 V ;
- dimensions indiquées par l'image utilisateur : environ **60 × 60 × 45 mm**,
  dissipateur compris ;
- deux fils du DFR0520 semblent remplacer ou compléter le réglage CC sous forme
  de rhéostat.

Les dimensions servent uniquement à l'intégration mécanique : volume du
boîtier, ventilation du dissipateur, accès aux réglages, passages de câbles et
éloignement de l'antenne ESP32. Le module reste externe au PCB contrôleur V1.

## Fichiers encore à ajouter

- `module-dimensions-source-image.*` : copie originale de l'image 60 × 60 ×
  45 mm fournie dans la conversation ;
- photos recto et verso avec inscriptions lisibles ;
- référence ou photo nette du circuit de contrôle ;
- relevé du potentiomètre CC et mesures des deux fils de commande.

Ne pas déduire le brochage interne depuis une annonce de revendeur. Les mesures
à effectuer sont décrites dans
[`../../../docs/electrical/power-path-dimensioning.md`](../../../docs/electrical/power-path-dimensioning.md).
