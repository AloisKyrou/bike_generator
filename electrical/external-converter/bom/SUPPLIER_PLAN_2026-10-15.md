# Two-supplier study, 15 October 2026

Scope: external-converter controller only. No purchase, substitution, stock
reservation or fabrication approval. The supplier plan does not qualify the design.

## Result

The 74 fitted purchased components, grouped into 35 exact MPNs, can be sourced
from **DigiKey + LCSC** based on the product listings checked today. No third
component supplier is currently necessary. A one-supplier stocked solution for
these exact references has NOT been established. This is not a proof that two
is the global minimum, or a checkout quote for delivery to France.

| Supplier | Distinct MPNs | Fitted parts per board | Allocation |
|---|---:|---:|---|
| DigiKey | 29 | 62 | Bridge, fuse, TVS, shunts, terminals, headers, ESP32, MCP42100, ESD, other passives |
| LCSC | 6 | 12 | USB HRO, TP4057, Richtek RT9080, two INA238, five Murata 10uF, USB CC resistors |

The [line-by-line plan](supplier-plan-2026-10-15.csv) gives exact manufacturer,
MPN, reference designators, fitted quantity, MOQ, order multiple and product URL.
It reconciles with all 74 purchasable rows of controller-external-working.csv.
The seven remaining schematic entries are PCB probe pads/solder jumpers, not
purchased components; the three board-only mounting holes are also not parts.

## Why this split

- DigiKey carries the exact Diotec bridge, Bourns shunts and Espressif module.
  Their earlier Mouser links do not oblige us to place a Mouser order.
- LCSC carries the exact HRO connector and Top Power charger. Put the Richtek
  regulator and Murata caps there too. Do not replace the regulator by similarly
  named RT9080-33GJ5-MS from a different manufacturer.
- INA238AIDGSR is listed in stock at LCSC (333 observed, USD8.4027 each), whereas
  the cheaper DigiKey listing is out of stock. Two cost USD16.8054 before fees.
  [LCSC INA238](https://www.lcsc.com/product-detail/C2868250.html).
- The exact Yageo 5.1k resistors are stocked at LCSC; the direct DigiKey listing
  was unavailable. Avoid adding a Marketplace seller merely for two resistors.
- Littelfuse SMCJ70A is listed at DigiKey (1858 observed), despite contradictory
  older zero-stock results. Keep the specified manufacturer, not an anonymous
  same-name TVS. [DigiKey TVS](https://www.digikey.com/en/products/detail/littelfuse-inc/SMCJ70A/762422).
- F1 availability was visible in the indexed DigiKey product listing (23559);
  the later direct fetch failed. Reconfirm this line at checkout rather than
  treating the index as reserved or guaranteed stock.

## Minimum quantities and price traps

Observed LCSC prices are USD, before transport, tax and possible import fees.
These are dated website observations, not a converted EUR quote.

| MPN / LCSC code | Fitted | Minimum purchase | Observed unit USD | Line USD |
|---|---:|---:|---:|---:|
| GRM21BR61C106KE15L / C77075 | 5 | 10 | 0.0414 | 0.4140 |
| TYPE-C-31-M-12 / C165948 | 1 | 5 | 0.1879 | 0.9395 |
| INA238AIDGSR / C2868250 | 2 | 2 | 8.4027 | 16.8054 |
| TP4057-42-SOT26-R / C12044 | 1 | 5 | 0.1426 | 0.7130 |
| RT9080-33GJ5 / C841192 | 1 | 5 | 0.1207 | 0.6035 |
| RC0805FR-075K1L / C84375 | 2 | 100 | 0.0072 | 0.7200 |
| Total | 12 | 127 | | 20.1954 |

HRO uses the regular price, not the temporary discount. Buying 100 CC resistors
costs USD0.72 total; this is preferable to an additional supplier/shipping fee.
For DigiKey choose Cut Tape, tube or bulk as appropriate, not Digi-Reel, which
adds a reeling fee. Ensure seller/shipping is DigiKey itself, not Marketplace.
Check price breaks: ten 1k resistors cost USD0.34 versus USD0.70 for seven at the
observed unit rate; ten 10k cost USD0.34 versus USD0.60 for six. Ten 100nF Yageo
cost USD0.98 versus USD1.08 for six. The CSV MOQ is not an optimized spare-parts
quantity; it deliberately separates required quantity from purchasing choices.

The older EUR43.96-73.17 planning envelope is unchanged. It is NOT the price of
these two baskets; it includes historical low prices for unavailable stock.
Reprice both carts in the delivery region and compare shipping-inclusive total
before any order. Do not add a supplier just to save cents on individual parts.

## Outside this count

- PCB fabrication is a separate order: **two component suppliers plus one PCB
  manufacturer**, normally three orders for the board itself.
- JP20 shorting cap and the battery mating housing/contacts or cable must still
  be selected. Prefer adding these to DigiKey; they are not in the 74-part BOM.
- Optional qualified protected 1S cell, converter, heatsink, thermal interface,
  source/receiver protection, wiring, USB data cable and workshop supplies are
  not included. Reuse existing stock where appropriate; their supplier count
  cannot be claimed complete before the actual items are chosen.

Supplier links are evidence, not endorsement of substitutions. Keep capacitor
PROVISIONAL flags and JP20 OPEN; see the capacitor and TP4057 studies.
