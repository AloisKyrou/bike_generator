# Beetle power-path sourcing and cost

8 October 2026. No purchases made. Prices exclude delivery, VAT and assembly.
This records evidence and allowances, not permission to substitute parts.

| Part | Evidence | Accounting |
|---|---|---|
| RT9080-33GJ5, Richtek | DigiKey France EUR 0.25 at 1, EUR 0.169 at 10; 99,919 displayed | Exact EUR observation added to pricebook |
| TP4057-42-SOT26-R, Nanjing Top Power ASIC | LCSC C12044 USD 0.1424 each at MOQ 5, 23,365 displayed | EUR 0.20-0.50 at 1 / 0.15-0.40 at 10 engineering allowance, NOT an FX conversion or quote |
| PMOS and diode | C3 schematic does not state exact fitted MPNs | Remain provisional; no assertion of identical Beetle BOM |

Sources: [Richtek listing](https://www.digikey.fr/fr/products/detail/richtek-usa-inc/RT9080-33GJ5/6161634),
[TP4057 listing](https://www.lcsc.com/product-detail/C12044.html).
MOQ means a one-board purchaser buys spares; shipping can exceed the small IC
prices. Do not present the per-board consumption allowance as checkout cost.

The former BQ24074, TPS63031 and SRN4018 alone total EUR 4.59 at the old
single-unit observations, or EUR 3.436 at the old ten-unit observations.
The replacement requires RT9080, TP4057, diode, PMOS and their support, not just
the EUR 0.25 regulator. Compare complete LV blocks after fresh netlist export.
Historical pricebook entries stay available, but removed parts must not appear
as fitted in the active inventory.

Fresh 8 October export: 133 components, 28 fitted entries without a price.
The priced drawn USB/LV subtotal is EUR 2.63-7.12, but excludes unpriced
placeholders and unfinished requirements. The complete-block planning budget
is now EUR 8-16 one-off and EUR 6-13 per board at ten units, versus the former
EUR 11-20 and EUR 8-16. This EUR 3-4 one-off reduction is a budget revision,
not a proved exact BOM saving or an order quote. Main converter and protection
allowances are not reduced to make the total look cheaper.

The cost script now limits its generic three-pin SOT-23 transistor allowance to
Q references. A charger or regulator in a similarly named package must not
inherit that allowance. Regression fixtures cover both the reference prefix
and package suffix. Missing prices remain visibly UNPRICED, not zero.

See [overall dashboard](COST_DASHBOARD.md) for the active generated budget and
[power qualification](../docs/BEETLE_POWER_DECISION_2026-10-08.md) for remaining
electrical limits. Main converter costs are unchanged by this simplification.
