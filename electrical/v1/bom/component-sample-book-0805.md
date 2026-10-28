# Inventaire du livre de composants 0805

Source : formulaire photographié du livre `Resistors and Capacitors Sample Book`.

- Format coché : **0805**.
- Résistances : **69 valeurs, 50 pièces par valeur**.
- Condensateurs : **17 valeurs, 50 pièces par valeur**.
- Date manuscrite du contrôle : `3/5/2026` (format de date non précisé).

La feuille ne précise pas la tolérance, la puissance et la tension de service des
résistances, ni le diélectrique et la tension nominale des condensateurs. Ces
caractéristiques doivent être vérifiées avant utilisation dans un emplacement
critique.

## Résistances disponibles

Valeurs particulières : `0 Ω`, `1 MΩ`, `2 MΩ`.

| Série | Ω | dizaines d'Ω | centaines d'Ω | kΩ | dizaines de kΩ | centaines de kΩ |
|---|---:|---:|---:|---:|---:|---:|
| 1,0 | 1 Ω | 10 Ω | 100 Ω | 1 kΩ | 10 kΩ | 100 kΩ |
| 1,2 | 1,2 Ω | 12 Ω | 120 Ω | 1,2 kΩ | 12 kΩ | 120 kΩ |
| 1,5 | 1,5 Ω | 15 Ω | 150 Ω | 1,5 kΩ | 15 kΩ | 150 kΩ |
| 2,0 | 2 Ω | 20 Ω | 200 Ω | 2 kΩ | 20 kΩ | 200 kΩ |
| 2,7 | 2,7 Ω | 27 Ω | 270 Ω | 2,7 kΩ | 27 kΩ | 270 kΩ |
| 3,3 | 3,3 Ω | 33 Ω | 330 Ω | 3,3 kΩ | 33 kΩ | 330 kΩ |
| 4,3 | 4,3 Ω | 43 Ω | 430 Ω | 4,3 kΩ | 43 kΩ | 430 kΩ |
| 4,7 | 4,7 Ω | 47 Ω | 470 Ω | 4,7 kΩ | 47 kΩ | 470 kΩ |
| 5,1 | 5,1 Ω | 51 Ω | 510 Ω | 5,1 kΩ | 51 kΩ | 510 kΩ |
| 6,8 | 6,8 Ω | 68 Ω | 680 Ω | 6,8 kΩ | 68 kΩ | 680 kΩ |
| 8,2 | 8,2 Ω | 82 Ω | 820 Ω | 8,2 kΩ | 82 kΩ | 820 kΩ |

Total : `66 valeurs du tableau + 0 Ω + 1 MΩ + 2 MΩ = 69 valeurs`.

## Condensateurs disponibles

`15 pF`, `22 pF`, `27 pF`, `33 pF`, `47 pF`, `68 pF`, `82 pF`,
`100 pF`, `120 pF`, `150 pF`, `180 pF`, `220 pF`, `1 nF`, `10 nF`,
`100 nF`, `470 nF`, `1 µF`.

## Correspondance avec le contrôleur V1

### Valeurs présentes dans le livre

- Résistances : `10 Ω`, `1 kΩ`, `4,7 kΩ`, `10 kΩ`, `47 kΩ`, `100 kΩ`,
  `200 kΩ` et `1 MΩ`.
- Condensateurs : `82 pF`, `100 nF` et `1 µF`.

### Conditions avant réutilisation

- `R17 = 316 kΩ` et `R18 = 100 kΩ` forment le diviseur de sortie 5 V et
  doivent rester à **0,1 %**. La résistance 100 kΩ du livre ne remplace donc
  pas automatiquement R18.
- Les résistances `200 kΩ` et `1 MΩ` doivent être confirmées à **1 %** et avec
  une tension de service suffisante avant utilisation dans les réseaux du
  LM5164.
- Le `82 pF` destiné à C10 doit être de type **C0G/NP0**.
- Les `100 nF` et `1 µF` doivent avoir le diélectrique et la tension nominale
  requis par leur emplacement ; ne pas supposer que le contenu du livre est
  X7R/50 V sans fiche ou mesure.

### Valeurs nécessaires mais absentes du livre

- `316 kΩ / 0,1 %` en 0805 pour R17.
- `2,2 nF` en 0805 pour C9.
- `3,3 nF` en 0805 pour C11.
- `41,2 kΩ` en **1206** pour R12.
- Les condensateurs de puissance en 1210 : `10 µF / 100 V` et `22 µF / 16 V`.
