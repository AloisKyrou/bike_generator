# External controller sourcing check

## Latest: Two-Supplier Allocation, 15 October 2026

Read [the current supplier plan](bom/SUPPLIER_PLAN_2026-10-15.md) and its
[35-line CSV](bom/supplier-plan-2026-10-15.csv) before the historical notes below.
DigiKey29 MPNs plus LCSC6 cover74 fitted purchased parts without substitutions;
no Mouser order is required by this plan. Stock must be rechecked at checkout.
Five10uF capacitors are now PROVISIONAL Murata GRM21BR61C106KE15L, not the
earlier Yageo candidate. C42 local-bypass correction is now applied/verified;
see [purchase preparation](bom/PURCHASE_PREPARATION_2026-10-15.md) for two boards.
No purchase or fabrication release. Older missing-MPN/stock/footprint entries
below describe their dated checkpoints and are not the current sourcing plan.

## 15 October Update

The HRO MPN remains unchanged, but its footprint and the battery JST footprint
now have approved local PTH-pad enlargements for the 2 oz study. No additional
supplier is needed for that geometric change. See
[the latest review](REVIEW_2OZ_2026-10-15.md).
36 missing MPNs are filled; five 10 uF caps remain provisional. Exact part
selections, manufacturer evidence and representative LCSC alternatives are in
[the passive record](../components/external-controller-passives/README.md).
The 10 uF Yageo candidate is stocked but its DC-bias qualification is not closed.
Historical prices below are not a current payable cart.

Observed 14 October 2026. No purchase, stock reservation or complete BOM quote.
Search/index caches disagree on some inventory; a live cart check is required
before ordering. Keep the existing verified parts for schematic engineering
rather than silently substituting a different package or device.
The latest user decision removes automatic selection: direct CC/CV A/W/B
outputs remain, with no relay. Prices below are dated observations, not a live
cart. The earlier three-relay quote is retained only as historical evidence.

| Part | Intended count | Observation | Purchasing status |
|---|---:|---|---|
| INA238AIDGSR | 2 | DigiKey fresh page: 0 stocked, EUR2.86 each ex VAT; Mouser also 0. Older indexed results show stock and are not reliable confirmation. | Availability open |
| MCP42100-I/SL | 1 | DigiKey page: 1451 stocked, EUR2.48 each listed | Recheck cart |
| TQ2-3V | 0 | Historical quote: EUR2.07 each ex VAT, EUR6.21 for three | Removed; do not order for this variant |
| CSS4J-4026K-2L00F | 2 | Mouser Europe: 3323 stocked, EUR1.88 each listed | Recheck cart/lifecycle |

Sources:

- [INA238 DigiKey](https://www.digikey.fr/fr/products/detail/texas-instruments/INA238AIDGSR/15857213)
- [INA238 Mouser](https://www.mouser.com/en/ProductDetail/Texas-Instruments/INA238AIDGSR?qs=DRkmTr78QAQpWvQMAkqDfQ%3D%3D)
- [MCP42100 DigiKey](https://www.digikey.fr/fr/products/detail/microchip-technology/MCP42100-I-SL/362091)
- [TQ2 DigiKey](https://www.digikey.fr/fr/products/detail/panasonic-industry/TQ2-3V/274749)
- [Bourns Mouser Europe](https://eu.mouser.com/en/ProductDetail/Bourns/CSS4J-4026K-2L00F?qs=Uem7cGQRk%252Bq7upK2SNL%252BgA%3D%3D)

Do not replace the INA238 automatically with an INA228/INA239 or different
package. INA238AIDGST is not an established purchasing fallback: distributor
pages include discontinuance/restricted-availability information for that reel
option. A common-supplier basket is preferred; none is complete yet.

Some distributors describe the Bourns 2 mOhm shunt as 4 W. The current official
[Bourns datasheet](https://www.bourns.com/docs/product-datasheets/css4j-4026.pdf),
revision 01/26, specifies 6 W at 70 C terminal temperature for the 2 mOhm member.
Keep manufacturer conditions authoritative; neither rating determines the
finished PCB's continuous current capability.

## Later USB and INA update, 14 October 2026

User approved replacing JAE to seek standard fabrication. External J27 is now
HRO TYPE-C-31-M-12, LCSC C165948; stock366445, MOQ5, USD0.1879 regular unit price
at five, observed on the [fresh product page](https://www.lcsc.com/product-detail/C165948.html).
The HRO uses an unmodified standard KiCad footprint. Read the
[part review](../components/hro-type-c-31-m-12/README.md): the old narrow NPTH
slots disappear, but JLC2oz annulus compatibility is NOT established.

INA238AIDGSR exact part is listed469 in stock at USD8.4027 each on the
[fresh LCSC page](https://www.lcsc.com/product-detail/C2868250.html).
Older search results reporting USD1.77/4.60/5.87 are not the current quote.
This is a costly stock fallback, not an approved purchase. DigiKey remained
out of stock in the fresh check; contradictory Mouser indexes are unconfirmed.

LCSC also lists TP4057 C12044, so HRO need not add a supplier beyond that charger.
The [budget and remaining MPN gaps](bom/README.md) are explicit; no complete
single/two-supplier cart has been validated. Do not silently substitute INA228.
