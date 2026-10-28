# Continuation MLCC selection

8 October 2026. Eight previously unspecified capacitor MPNs are now selected
for the schematic continuation. This is not a production release or proof of
effective capacitance at operating DC bias. Physical-model checks and the final
saved inventory belong to the continuation schematic report.

## Selected parts

| References | Exact part | Electrical / package | Sourcing snapshot, EUR excluding VAT |
|---|---|---|---|
| C4, C63, C64, C68, C69, C71, C72 | TDK C2012X7R2A104K125AA | 100 nF, 100 V, X7R, 10%, 0805 | 414,460 stocked; 0.150 single / 0.084 at ten / 0.05960 at fifty |
| C62 | KEMET C1206C105K1RACTU | 1 uF, 100 V, X7R, 10%, 1206 | 17,459 stocked; 0.710 single / 0.442 at ten |

TDK dimensions: 2.00 +/-0.20 by 1.25 +/-0.20 mm, height 1.25 +/-0.20 mm.
Its official page lists Production status. The seven-position common SKU
reduces inventory variety; C4 does not need the full 100 V rating. Six positions
move from 0603 to 0805; C4 was already 0805. KEMET C62 moves from 0805 to 1206,
with 3.2 +/-0.3 by 1.6 +/-0.2 mm body and 1.6 +/-0.2 mm height. Use verified
stock hand-solder footprints, not newly drawn pads.

- [TDK primary product data](https://product.tdk.com/en/search/capacitor/ceramic/mlcc/info?part_no=C2012X7R2A104K125AA), also successfully rechecked through its [German primary page](https://product.tdk.com/de/search/capacitor/ceramic/mlcc/info?part_no=C2012X7R2A104K125AA).
- [TDK fresh distributor observation](https://www.digikey.fr/fr/products/detail/tdk/C2012X7R2A104K125AA/569044).
- [KEMET primary specification](https://search.kemet.com/component-documentation/download/specsheet/C1206C105K1RACTU), archived version generated 8 October 2026.
- [KEMET fresh distributor observation](https://www.digikey.fr/fr/products/detail/kemet/C1206C105K1RACTU/5119826).

The KEMET PDF is archived beside this note as `kemet-c1206c105k1ractu.pdf`,
SHA256 `575FD7504871C9F83D47454CF0D4966565EBD58D65C0E45D5E939383FC4094B3`.
The TDK catalogue download returned HTTP 403; no successful local PDF archive
is claimed. The primary product page supplied its dimensional/electrical data.

## Alternatives and boundaries

KEMET C0805C104K1RACTU is a compatible-value candidate but its observed single
price was EUR 0.40 versus TDK's EUR 0.15. The cheaper 1 uF TDK
[C3216X7R2A105K160AM](https://product.tdk.com/en/search/capacitor/ceramic/mlcc/info?part_no=C3216X7R2A105K160AM)
is marked Production (NRND), so it was not selected for this new design.

All eight selected capacitors total EUR 1.76 at single-unit component pricing,
or EUR 1.03 per board using the conservative ten-piece unit tiers. Actual
seven-per-board batching can improve the 100 nF tier. These prices exclude
shipping, VAT, assembly and spares. They replace previously missing price rows,
not a demonstrated EUR 1.76 increase in an already-complete BOM.

No capacitor value, bootstrap capacitor, gate-drive topology or loop-compensation
value was changed. Already-selected 0603 bootstrap/filter parts and resistors
remain; this pass does not claim every component is now large-package. Larger
MLCC bodies and 100 V labels do not prove DC-bias, ripple or thermal margins.
The unsynchronized V2 PCB was not edited.
