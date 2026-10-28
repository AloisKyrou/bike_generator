# Working BOM and cost

Latest: [purchase preparation](PURCHASE_PREPARATION_2026-10-15.md) for user-selected
5 bare PCBs /2 populated boards. `shopping-2boards-2026-10-15/` contains checked
DigiKey/LCSC import drafts and fitted/spare quantities. C42 bypass correction
is applied and verified; no BOM parts/cost added. No order or live basket.

Latest: [two-supplier study](SUPPLIER_PLAN_2026-10-15.md) and
[shopping allocation CSV](supplier-plan-2026-10-15.csv). All35 MPNs /74 fitted
purchased parts have a DigiKey or LCSC allocation, no substitution. This is a
dated sourcing study, not executable carts or approval to order. Accessories,
shipping, tax and PCB fabrication remain separate. C42 bypass correction is
[applied](../PREFAB_CLOSEOUT_2026-10-15.md).

15 October 2026.81 schematic entries;7 PCB-only features (five probe pads and
two solder jumpers) are not purchased parts. Three mounting holes are separate.
Current [BOM](controller-external-working.csv) reflects HRO J27, direct dual
digipot, two INA238 monitors and no relays. No purchase or assembly release.

## Budget

Run `powershell -File electrical/external-converter/bom/estimate-cost.ps1`.
[Per-component cost lines](cost-lines.csv) total **EUR43.96-73.17** for one
drawn board's components, before VAT, PCB, freight, MOQ surplus, cell, harness,
cooling, external converter and assembly supplies. This is a planning envelope,
NOT two executable supplier carts. The low end includes unavailable stock.

The estimator reuses dated matching MPN observations from the V2 pricebook
without changing that file. Generic0805/header entries get explicit allowances;
unknown packages throw an error instead of silently becoming free. INA238 has
an expanded budget allowance because the low EUR observation is out of stock,
whereas LCSC currently lists USD8.4027 each. No invented currency conversion.

Largest contributors: bridge allowance8-11EUR; twoINA monitors5.72-18EUR;
four two-pole power terminals6.36EUR; F1 historical5.92EUR; two shunts3.68-4.40EUR.
These dominate more than the USB connector's0.20-0.50EUR budget allowance.

## Purchasing Work Still Open

All 41 formerly missing MPNs are now populated in schematic and PCB: 23
resistors, twelve capacitors and six headers. **Zero missing purchasable MPNs**.
C30/C42/C45/C46/C47 are provisionally GRM21BR61C106KE15L, 10uF/16V, 0805.
This is a prototype selection, not completion of their operating qualification.
See [capacitor calculations and the TP4057 bypass reservation](../CAPACITOR_SELECTION_2026-10-15.md).
Do not mistake an estimate with81 lines for a complete procurement basket.

The revised range replaces generic allowances with existing pricebook matches;
it is not a new negotiated price or a physical cost-reduction change. BOM now
exports Datasheet and DesignStatus so qualification notes are not silently lost.
Add JP20 jumper cap and battery mating housing/contacts to the actual basket;
these are accessories, not additional schematic symbols.

For minimum sourcing effort, retain matching Yageo RC0805FR1% resistor families
and already-qualified100nF/1uF families where voltage ratings suffice. C101 needs
100V; TDK C2012X7R2A104K125AA is an existing project candidate. The five Murata
10uF/16V capacitors have reviewed typical bias curves, not a guaranteed combined
bias/temperature/aging bound. C42 is now after R45, directly on TP4057.VCC;
qualify charging before enabling JP20. Harwin families or
cut-to-length stock must match pin geometry and be identified in the basket.

Prefer one broad-line supplier plus LCSC for HRO/TP4057 if needed. INA238 from
LCSC is a stocked but expensive fallback, not a reason to silently redesign the
measurement circuit. Exact cart/lifecycle/packaging must be rechecked before
ordering. See [sourcing observations](../SOURCING_CHECK.md).

Murata C77075 stock observed 15 October: 295590 at LCSC, USD0.0414 each at
MOQ10. Five fitted parts cost USD0.207, ten purchased USD0.414 before freight
and tax. The EUR planning range above retains its conservative allowances;
it is not a conversion of that USD observation. No purchase was made.
