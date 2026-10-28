# Purchase preparation

15 October 2026. No order, account basket, payment, or manufacturer upload.
User confirmed five bare JLCPCB boards and components for TWO assembled
prototypes, two layers / 2 oz / 1.6 mm, self-assembly. No purchase authorized.
The CSVs are shopping inputs, not a guaranteed payable quotation.

Run `prepare-shopping-lists.ps1 -Boards 2` to regenerate the drafts in
`shopping-2boards-2026-10-15/`. These allocate 148 fitted parts: DigiKey
29 MPNs / 124 pieces and LCSC six MPNs / 129 purchased pieces (24 fitted,
105 MOQ spares). Manufacturer and MPN must both match during import.
Optional accessories are separate: two caps, two housings and two precrimped
double-ended wires for two boards if both will receive the battery option.
Do not order five sets of components just because five PCBs are fabricated.

## Components and accessories

[Supplier allocation](supplier-plan-2026-10-15.csv): 35 exact MPNs, 74 fitted
parts per board; DigiKey + LCSC. [Accessories](accessories-2026-10-15.csv)
adds three DigiKey references, NOT three additional board components.

- JP20 cap QPC02SXGN-RC: EUR0.09 exVAT at1, EUR0.25 total at10.
- Battery housing PHR-2: EUR0.09 exVAT at1, contacts not included.
- One double-ended JST ASPHSPH24K305 wire: EUR0.44 exVAT. Cutting it at the
  middle gives two approximately15cm precrimped leads for one PHR-2, without
  needing a crimp tool. Both are black: permanently mark the positive lead,
  verify pin numbering and polarity by meter BEFORE connecting a cell.
  J26.1 is BAT_1S, J26.2 GND. The connector shape does not ensure polarity.
  Insulate any wire splice; do not solder directly to a lithium cell.

All three were listed in stock at DigiKey France on15October. Their URLs and
exact MPNs are in the accessory CSV. Combined allowance EUR0.62 exVAT for one
of each, before shipping. These remain optional for USB-only operation;
qualified cell/charge conditions are separate. Prefer an existing correctly
wired battery lead if available; the15cm lead length is a convenience proposal,
not an enclosure requirement.

F1 0456020.ER stock reconfirmed on the France product page:23213 listed,
EUR6.08 exVAT at1, EUR5.04 each at5. This supersedes the failed direct-fetch
reservation in the earlier supplier study, not the selected fuse or fault
coordination limits. [F1 product page](https://www.digikey.fr/fr/products/detail/littelfuse-inc/0456020-ER/1754634).

## Before accepting supplier baskets

1. Confirm how many populated boards are wanted; do not confuse five bare
   PCBs with five complete sets of components.
2. Choose cut tape/tube/bulk, not custom reels. Keep the exact manufacturer and
   MPN; reject automated substitutions until reviewed.
3. Keep DigiKey as the actual seller rather than third-party Marketplace.
4. Apply LCSC MOQ/multiples in the supplier CSV. For two boards this buys129
   LCSC pieces, largely cheap spares, for the24 fitted LCSC components.
5. Compare delivered EUR total including VAT, shipping and any import charges.
   LCSC observations are USD, not EUR, and are not a France checkout quote.
6. Recheck INA238 availability and price immediately before ordering. Do not
   use the lower historical DigiKey price for an unavailable item.

## Workshop and test equipment not included

USB data cable, solder/flux/wick, tweezers/magnification, insulated small-signal
leads, power wiring and terminal ferrules if appropriate, heatsink/interface
and screws, optional protected1S cell, external converter, source/receiver
fuses appropriate to the actual setup, current-limited bench supply and meter.
These need a stock check, not automatic additional orders. High-current wire,
receiver fuse and thermal hardware are selected for the actual receiver/source;
the small JST leads above must NEVER be used on the10A main power path.

Production approval, safe energization and10A continuous qualification are
distinct. Charge stays disabled via JP20 for first logic-only bring-up.
