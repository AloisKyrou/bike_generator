# Interrupteur batterie — candidats

Les petits C&K OS/JS couverts par les empreintes KiCad natives sont écartés :
leur courant assigné de 0,1 à 0,3 A est trop faible face à la recharge et aux
pointes du Beetle.

Le candidat traversant actuel est le C&K `1101M2S3CQE2` : SPDT utilisé comme
SPST, contacts argent, assigné jusqu'à 6 A sous 28 VDC. Il favorise la soudure
manuelle et offre une marge confortable pour la batterie 1S.

Sources consultées le 25 septembre 2026 :

- fiche fabricant 1000 Series : <https://www.ckswitches.com/media/1429/1000.pdf>
- modèle tiers existant :
  <https://www.snapeda.com/parts/1101-M2S3CQE2/C%26K/view-part/>

## Décision V1 et validation ECAD

Le modèle SnapMagic/SnapEDA fourni le 25 septembre 2026 a été importé puis
comparé au dessin fabricant :

| Élément | Fiche C&K | Empreinte relue avec Konnect | Statut |
|---|---:|---:|---|
| Nombre de bornes | 3 | 3 | conforme |
| Entraxe 1–2 et 2–3 | 4,70 mm | 4,70 mm | conforme |
| Perçage | Ø1,85 mm | Ø1,85 mm | conforme |
| Pads | non imposés | Ø2,45 mm, anneau radial 0,30 mm | choix du modèle, acceptable V1 |
| Corps | 6,60 × 12,70 mm | `F.Fab` 6,60 × 12,70 mm | conforme |
| Courtyard | non imposé | 7,10 × 13,20 mm | marge 0,25 mm |

Correspondance retenue :

| Borne physique | Fonction dans le `1101` | Symbole V1 | Net |
|---:|---|---|---|
| 1 | contact position 1 | pin 1 du `SW_SPST` | `BAT_RAW` |
| 2 | commun | pin 2 du `SW_SPST` | `BAT_CTRL` |
| 3 | contact position 3 | absente du symbole fonctionnel | volontairement non connectée |

Le symbole SPST existant est conservé pour représenter l'usage réel. La
différence 2 pins / 3 pads est donc intentionnelle et documentée ; elle évite
de modifier les connexions existantes. L'empreinte est
`BikeGenerator:SW_1101M2S3CQE2`, placée en `S1` à proximité de `J6`.

Fichiers sources et empreintes SHA-256 :

- footprint SnapMagic téléchargé :
  `6D2C9BAED27D4F7CE07E57A597D246ADA6508EA12ECF3EF76EF1B9ABF04E327F` ;
- STEP SnapMagic téléchargé :
  `F010F9AD3A5417424098D642F92D4FEE7A968416C1FB72C95584FFBDA25EBD6B` ;
- symbole SnapMagic téléchargé, non utilisé :
  `96856AB1700C653160555E7C772D58A62BCA0EDB1824816F5BCC23C3E2BC14D3`.

La bibliothèque locale a reçu un `F.Fab` exact, un courtyard propre et
l'association au STEP. La mise à jour automatique d'une instance depuis cette
bibliothèque est actuellement refusée par Konnect à cause du champ historique
`tedit` du fichier SnapEDA. Cela n'affecte ni les pads ni la fabrication ; le
modèle 3D reste une aide visuelle à revalider dans l'éditeur d'empreintes.

La fiche officielle reste accessible par son URL mais son serveur refuse le
téléchargement automatisé (HTTP 403). Elle devra être enregistrée manuellement
dans ce dossier pour compléter l'archive locale.
