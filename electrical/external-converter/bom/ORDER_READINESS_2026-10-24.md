# Order readiness: external converter, 24 October 2026

Independent purchasing and manufacturing review. Target: five bare JLCPCB
boards, two layers / 2 oz / 1.6 mm, components for TWO hand-assembled boards.
No CAD edit, purchase, upload, substitution, basket reservation or fabrication
approval is made by this report. USB routing/release artifacts are reviewed
separately by the lead agent.

## Decision summary

**The unchanged component order cannot currently complete two boards.** The
only stock shortage found across all 35 allocated MPNs is INA238AIDGSR:
four required, only three offered by LCSC. Its price has also risen sharply
from the historical estimate. The other 34 MPNs have enough listed stock.

Keep DigiKey + LCSC for now. Do not replace the sensor automatically or buy
the three expensive pieces just because they exist. A practical decision is
needed: wait for the exact sensor, approve a separately reviewed alternative,
or assemble only one fully sensed board first. The latter could use two LCSC
parts, but their observed subtotal alone is USD47.1414 before tax/shipping.
Starting USB/ESP assembly with U1/U10 unpopulated is a limited bring-up option,
not a completed controller with valid measurements.

This procurement obstacle is distinct from ordering bare PCBs. It need not
force a PCB redesign, nor justify ordering an obsolete fabrication archive.
The lead review must close USB and regenerate/review the final package first.

## INA238: exact reference versus packaging alternative

| Source opened 24 October | Observation | Consequence |
| --- | --- | --- |
| [LCSC C2868250](https://www.lcsc.com/product-detail/C2868250.html) | 3 pieces, USD23.5707 each at 1 | Insufficient for four sensors; not the previous USD8.4027 estimate |
| [DigiKey INA238AIDGSR](https://www.digikey.fr/fr/products/detail/texas-instruments/INA238AIDGSR/15857213) | 0 available; 2500 expected 11 January 2027; listed EUR2.86 | Unavailable price is not a usable immediate quote |
| [Mouser INA238AIDGSR](https://www.mouser.fr/en/ProductDetail/Texas-Instruments/INA238AIDGSR?qs=DRkmTr78QAQpWvQMAkqDfQ%3D%3D) | 0 available; incoming estimate 31 December 2026 | An older indexed 82-piece result is stale |
| [TI exact part](https://www.ti.com/product/INA238/part-details/INA238AIDGSR) | Public inventory out of stock | No public immediate supply confirmed |
| [DigiKey INA238AIDGST](https://www.digikey.co.uk/en/products/detail/texas-instruments/INA238AIDGST/15857174) | Obsolete, unavailable; substitute DGSR also 0 | Packaging-only change does not solve sourcing |

TI's [INA238 datasheet packaging table](https://www.ti.com/lit/ds/symlink/ina238.pdf)
identifies DGSR and DGST as the same DGS 10-pin package, 238I marking,
temperature grade and device, supplied in 2500- and 250-piece reels respectively.
However, [TI's DGST lifecycle entry](https://www.ti.com/product/INA238/part-details/INA238AIDGST)
now says obsolete. The older datasheet's last-time-buy designation is not proof
of present stock. No viable stocked DGST source was found in this review.
The [DigiKey Q1 variant](https://www.digikey.fr/fr/products/detail/texas-instruments/INA238AQDGSRQ1/14641449)
also listed zero stock; it is not an immediate sourcing solution either.

## All 35 allocated references

### Credible alternative requiring user approval

**Recommend considering INA237AIDGSR for U1/U10**, without changing copper.
The [opened DigiKey product page](https://www.digikey.com/en/products/detail/texas-instruments/INA237AIDGSR/14004323)
lists 11792 pieces at USD3.23 each (USD12.92 for four, before taxes/shipping).
The France page returned an older cache; do not promise its older EUR2.14
price. LCSC C2864837 fresh JSON shows only two at USD1.9542 each, so DigiKey
is the cleaner four-piece source and keeps the existing two suppliers.
INA228AIDGSR at DigiKey remains unavailable; it is not the immediate fallback.

The [INA237 pin table](https://www.ti.com/document-viewer/INA237/datasheet/GUID-3AAE1266-3623-45F4-A99E-0CA30FF465AE)
and [INA238 pin table](https://www.ti.com/document-viewer/INA238/datasheet/GUID-3AAE1266-3623-45F4-A99E-0CA30FF465AE)
match exactly: 1 A1, 2 A0, 3 ALERT, 4 SDA, 5 SCL, 6 VS, 7 GND,
8 VBUS, 9 IN-, 10 IN+. Both use DGS10 and 2.7-5.5 V logic supply.
Existing shunts, addresses, filtering and PCB footprint can remain.

The [INA237 specifications](https://www.ti.com/lit/ds/symlink/ina237.pdf)
retain 85 V and 16-bit conversion, but maximum offset is 50 uV rather than
5 uV and gain error 0.3% rather than 0.1%. With our 2 milliohm shunt, this
means up to 25 mA offset rather than 2.5 mA. At 10 A, offset plus gain terms
are about 55 mA versus 12.5 mA; these are simplified sensor-only estimates,
not a complete temperature/shunt/layout error budget. This seems acceptable
for an activity controller, subject to the user's precision preference.

**It still computes current and power internally.** The
[INA237 register table](https://www.ti.com/document-viewer/INA237/datasheet/GUID-25B37629-8261-48D8-BE56-62622C36C345)
includes SHUNT_CAL 0x02, CURRENT 0x07 (16-bit), POWER 0x08 (24-bit).
Compared with [INA238 registers](https://www.ti.com/document-viewer/INA238/datasheet/GUID-25B37629-8261-48D8-BE56-62622C36C345),
measurement addresses, VBUS 3.125 mV/LSB, VSHUNT 5/1.25 uV/LSB,
CONFIG and ADC_CONFIG fields/timing match. ADC conversion choices remain
50,84,150,280,540,1052,2074,4120 us and averaging 1..1024.
INA237 does NOT document INA238's DEVICE_ID register at 0x3F: the driver
must not reject it for lacking the INA238 identity. Review alert-status
read/clear handling against the respective revisions; test, do not simply
rename the sensor in firmware. No new mandatory ESP calculation is needed.

Proposed decision: approve INA237AIDGSR for both sensors, accepting the modest
precision downgrade and a small explicit driver adaptation, then update
CAD metadata/BOM/tests through the authorized workflow. **Not applied here.**

Fresh full LCSC product payloads are archived locally in
`.konnect-scratch/lcsc-C2868250-20261024.json` and
`.konnect-scratch/lcsc-C2864837-20261024.json`. They identify the exact MPN,
productCode, stockNumber and price tiers. INA238 tier 1 is explicitly
`usdPrice:23.5707`, `currencySymbol:"$"`, `cnyProductPriceList:null`.
It is not a CNY quote, reel price or related-product SKU.

### Current unchanged allocation

Counts are observations, not reserved inventory. DigiKey values below are
opened supplier-page values, not search-result snippets; cached page dates
vary and checkout must reconfirm them. LCSC values were retrieved directly
from the public product HTML's structured NEXT_DATA payload on 24 October;
see [timestamped LCSC observations](lcsc-observations-2026-10-24.csv).
The [allocation CSV](supplier-plan-2026-10-15.csv) contains the direct product
URL for every row and remains unchanged.

Prices are first listed small-quantity unit tiers, NOT a delivered total.
DigiKey uses USD here except F1 in EUR exVAT. LCSC prices use the indicated
minimum quantity. Lower price breaks can make ten passives cheaper than six.
Select cut tape rather than a custom reel/reeling fee.

| Exact MPN | Supplier | Fitted for 2 boards | Observed stock | Unit price / currency |
| --- | --- | ---: | ---: | --- |
| CC0805KRX7R9BB104 | DigiKey | 12 | 4400670 | 0.18 USD; 0.098 at 10 |
| C2012X7R2A104K125AA | DigiKey | 2 | 411801 | 0.17 USD |
| CC0805KKX7R7BB105 | DigiKey | 6 | 501907 | 0.28 USD; 0.161 at 10 |
| GRM21BR61C106KE15L | LCSC | 10 | 157730 | 0.0415 USD at 10 |
| SMCJ70A | DigiKey | 2 | 1858 | 0.99 USD |
| DBI25-16A | DigiKey | 2 | 364 | 9.93 USD |
| SS1H10-E3/61T | DigiKey | 2 | 37497 | 0.60 USD |
| WP710A10LGD | DigiKey | 2 | 24967 | 0.22 USD |
| WP710A10LID | DigiKey | 2 | 11492 | 0.27 USD |
| 0456020.ER | DigiKey | 2 | 23180 | 6.08 EUR exVAT |
| 1711725 | DigiKey | 8 | 5058 | 1.81 USD |
| M20-9990346 | DigiKey | 8 | 52894 | 0.13 USD |
| M20-9990246 | DigiKey | 6 | 147230 | 0.10 USD |
| S2B-PH-K-S(LF)(SN) | DigiKey | 2 | 617239 | 0.12 USD |
| TYPE-C-31-M-12 | LCSC | 2 | 305665 | 0.1886 USD at 5 |
| M20-9990446 | DigiKey | 2 | 32178 | 0.18 USD |
| M20-9980546 | DigiKey | 2 | 1771 | 0.41 USD |
| 1711738 | DigiKey | 2 | 4556 | 2.72 USD |
| AO3401A | DigiKey | 2 | 327209 | 0.52 USD |
| CSS4J-4026K-2L00F | DigiKey | 4 | 4350 | 2.19 USD |
| RC0805FR-071KL | DigiKey | 14 | 647937 | 0.10 USD; 0.034 at 10 |
| RC0805FR-0710RL | DigiKey | 8 | 670889 | 0.12 USD; 0.054 at 10 |
| RC0805FR-0710KL | DigiKey | 12 | 1319980 | 0.10 USD; 0.034 at 10 |
| RC0805FR-0722RL | DigiKey | 4 | 74905 | 0.10 USD; 0.034 at 10 |
| RC0805FR-074K7L | DigiKey | 4 | 632109 | 0.10 USD; 0.034 at 10 |
| CRM1206-FX-R820ELF | DigiKey | 2 | 43875 | 0.27 USD cut tape |
| RC0805FR-072KL | DigiKey | 4 | 631562 | 0.10 USD; 0.034 at 10 |
| RC0805FR-07200KL | DigiKey | 2 | 237372 | 0.10 USD; 0.034 at 10 |
| RC0805FR-075K1L | LCSC | 4 | 794300 | 0.0072 USD at 100 |
| INA238AIDGSR | LCSC | 4 | 3 | 23.5707 USD; INSUFFICIENT |
| ESP32-C3-MINI-1-N4X | DigiKey | 2 | 1782 | 3.26 USD |
| MCP42100-I/SL | DigiKey | 2 | 1451 | 2.82 USD |
| TP4057-42-SOT26-R | LCSC | 2 | 23535 | 0.1426 USD at 5 |
| RT9080-33GJ5 | LCSC | 2 | 36225 | 0.1207 USD at 5 |
| USBLC6-2SC6 | DigiKey | 2 | 80854 | 0.54 USD |

The five LCSC lines excluding INA total USD3.3945 at the existing purchase
quantities (10, 5, 100, 5, 5). This is not the LCSC delivered order total.
Among the remaining expensive items, the bridge is USD9.93 each, fuse
EUR6.08 each, four Phoenix 2-way terminals USD7.24 per board, two shunts
USD4.38 per board. These are ordinary small-quantity costs, whereas the
INA's current price/shortage dominates the immediate problem. No substitute
is approved here to reduce them.

## Connector fit: proportionate prototype recommendation

This section qualifies, rather than erases, the tolerance reservations in
[the full mechanical review](../FULL_MECHANICAL_REVIEW_2026-10-15.md).
They are not all proven interference defects. Keep nominal current holes
for this five-board prototype unless actual samples demonstrate a problem.
Do not request arbitrary custom precision or a manufacturer waiver solely
from stacking every pessimistic tolerance. Ask the user to accept normal
first-prototype fit risk; check the actual connectors on the first bare board
before populating all boards. Do not force pins or drill plated holes out.

| Connector | Known nominal / recommended dimensions | Interpretation |
| --- | --- | --- |
| JST J26 | Current 0.75 mm hole; manufacturer recommended 0.70 +0.10/-0 mm | Current nominal is inside the recommended interval. JLC's possible 0.67 mm lower finished bound is outside that interval, but this alone does not establish pin interference. |
| Harwin M20 headers | Current 1.00 mm hole; recommended 1.02 +/-0.05 mm | Nominal is within recommendation. Combining a minimum 0.92 mm finished hole with the ideal diagonal of a maximum 0.66 mm square lead gives a pessimistic 0.933 mm envelope; actual corner shape and assembly clearance mean this is not a measured fit failure. |
| Phoenix terminal blocks | Current and recommended nominal hole 1.30 mm | Worst-case square-lead diagonal versus minimum finished hole is a sensitivity check, not proof that a standard manufacturer-recommended nominal fails. No blanket enlargement justified. |
| HRO J27 | Current shield slots 0.60x1.70 / 0.60x1.20 mm, locator holes 0.65 mm; local enlarged copper lands | Existing slot widths and locator nominal are not shown to interfere. The local change increases annular rings, not a different connector. Inspect final drill export and real sample fit. |

Existing manufacturer drawings and their direct source links are preserved
in the full mechanical review. No fresh sample measurement was possible.
Acceptance of this prototype recommendation is not a guarantee of every
combination of manufacturing tolerances.

## Fabrication settings and final handoff

The [JLC capability page](https://jlcpcb.com/capabilities/pcb-capabilities/)
was reopened on 24 October: two-layer 2 oz track/space minimum 0.16/0.16 mm,
component PTH annulus at least 0.254 mm, round NPTH at least 0.50 mm, plated
slots at least 0.50 mm wide and twice as long as wide. General finished PTH
tolerance is +0.13/-0.08 mm. A 2 oz soldermask bridge requires 0.20 mm pad
spacing. The previously audited local annulus minimum 0.320 mm and HRO slots
meet these nominal fabrication limits; final exports still need to match CAD.

Minimum practical order closure:

1. Resolve the sensor purchase decision without silently changing its MPN.
2. Close the lead agent's USB/release review and export a new dated package;
   do not upload the obsolete 15 October ZIP.
3. Check five bare boards / 2 layers / 2 oz / 1.6 mm and final CAM preview,
   including plated slots, NPTH, mask openings, outline and antenna notch.
4. User explicitly approves the final file package and payable totals.
   No automatic substitute or paid process upgrade is authorized by this review.
5. Assemble and inspect one board first. JP20 remains open for first logic-only
   tests; a fabricated board is not automatically approved for battery use or
   continuous 10 A operation.

The optional three battery/jumper accessory references were not included in
this 35-MPN refresh. Their older prices must be checked only if that option is
actually purchased. Existing USB-only operation does not require a cell.
