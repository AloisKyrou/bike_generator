# V2 overall cost dashboard

## Current cost reading, 12 October 2026

User approved the accessible-assembly AOY66923 THT alternative for Q10-Q13.
It is now drawn provisionally, replacing SiR870; AONS is no longer the pending
default substitution. Shared insulated heatsink/clamps, short-lead mechanical
fit and REGN/bootstrap qualification remain open. No new driver supply selected.

| Cost basis, EUR ex VAT/delivery | One board | Per board in batch of ten |
|---|---:|---:|
| Drawn component subtotal, provisional AOY and THT capacitor bank | 86.36-108.64 | 63.18-80.48 |
| Previous same-day subtotal with SiR870, comparison only | 90.28-112.56 | 65.81-83.11 |
| Complete board-component budget, unresolved reserves retained | 130.00-196.00 | 86.50-146.50 |
| Complete device DIY, PCB/cooling/cell/box/harness and reserves, excluding paid assembly | 185.00-326.00 | 121.50-229.50 |
| Same complete device with paid assembly/programming/test allowance | 225.00-426.00 | 141.50-274.50 |

These rows are alternative totals, NOT additive. Paid assembly allowance is
EUR40-100 one-off /20-45 per board at ten. No confirmed manufacturing quote.
No development labor, bicycle/generator/main receiver, VAT, shipping or margin.
AOY component saving versus earlier SiR prices: EUR3.92 one-off /2.628 per
board at ten. Clamp and insulating-interface cost remains in the cooling
allowance, not a zero-cost assumption. Upper projected budgets
do not fall automatically: unresolved block reserves still govern.

The conservative one-board column prices each component at quantity one.
Twelve provisional EEU-FR2A101 are now drawn. At EUR0.795 each for10 pieces,
their basket costs EUR9.54 instead of the conservative single-part EUR14.88.
Applying ONLY that EUR5.34 correction gives **EUR81.02-103.30 currently drawn**,
before PCB, cooling and reserves.
The ten-board column already includes this tier; do not subtract it again.
The old polymer basket was EUR31.02, hence EUR21.48 basket saving, conditional
on the new bank passing ripple/layout/thermal qualification. DigiKey now shows
zero stock; same-day Mouser search reports4356, direct fetch unavailable.
Stock and real basket price must be reconfirmed before ordering.
See [engineering and model evidence](../../components/panasonic-eeu-fr2a101/README.md).

Distributor observations dated 12 October cover capacitor, BQ and L3 price values.
Other rows retain dated observations or allowances, not a refreshed full quote.
BQ EUR7.22, L3 EUR3.49, rectifier allowance EUR8-11, onboard fuse historical
EUR5.92, four AOY EUR7.32. THT bank single-part allowance is EUR14.88.
AOY observed stock4771; individual priceEUR1.83, ten-unit tierEUR1.167.
Source URLs/dates are in `pricebook.csv`; see the
[MOSFET evidence](../../components/aoy66923/README.md).

Deferred optimization, 2026-10-12: user confirmed retaining the current relay
selector for V2. A transistor-only replacement may reduce cost and app-mode
coil consumption in a later revision. EUR1-2 per-board savings are only a study
objective; no replacement circuit/BOM is validated and no saving is included
in the totals below. See the [selector decision](../docs/explanations/per_schematic/05_CC_CONTROL.md#decision-retain-relay-12-october-2026).

Protection update, 2026-10-10: [one input fuse](../docs/SINGLE_INPUT_FUSE_2026-10-10.md)
at RECTIFIED_RAW; no extra F_SRC in the base BOM. The [conditional battery fuse](protection-accessories.csv)
is EUR2.40 single / EUR1.836 at ten, ex VAT/delivery/assembly/support, within BOX
allowance and not added twice. Unfused energy-rich input sources are unsupported.
F1/TVS and drawn-component totals below are unchanged. Protection
reserves remain pending qualification, not approval for active-disconnect
circuits. See [decision](../docs/MINIMUM_PROTECTION_DECISION_2026-10-10.md).

Generated from a saved schematic XML export; NOT a purchasing or fabrication release.
EUR per board, excluding VAT and delivery. Column 10 means per board in a ten-board batch.

Export: review-aoy-mosfets-2026-10-12/after.xml; SHA-256: 24BF5C51265B1B5F5D4B3A4E5A1A9B00F213FBAB59723561EDB4746228364BB6
Components exported: 145. Fitted entries without price: 0 (includes engineering allowances).

| Block | Drawn parts, 1 board | Complete-block budget, 1 board | Complete-block budget, 10 boards |
|---|---:|---:|---:|
| AC bridge and AC-entry connector | 10.00-14.00 | 10.00-14.00 | 7.00-10.50 |
| Input protection and DC power connectors | 8.16-8.26 | 10.00-18.00 | 7.00-14.00 |
| ESP32 module and module service circuitry | 3.44-5.72 | 4.00-7.00 | 3.50-6.00 |
| USB interface optional-cell charger and 3V3 regulation | 4.11-8.43 | 8.00-16.00 | 6.00-13.00 |
| Protected manual-app CV selection and generic GPIO | 5.50-9.65 | 10.00-18.00 | 7.00-14.00 |
| BQ25756 main converter stage | 55.15-62.58 | 80.00-105.00 | 50.00-75.00 |
| Receiver protection qualification reserve | 0.00-0.00 | 8.00-18.00 | 6.00-14.00 |
| Optional protected logic cell and qualified connection | 0.00-0.00 | 5.00-10.00 | 4.00-8.00 |
| Converter and rectifier cooling hardware | 0.00-0.00 | 10.00-25.00 | 8.00-20.00 |
| Enclosure harness mating plugs and cadence sensor | 0.00-0.00 | 20.00-45.00 | 15.00-35.00 |
| Bare PCB allocation per unit | 0.00-0.00 | 20.00-50.00 | 8.00-20.00 |
| Assembly programming and routine test per unit | 0.00-0.00 | 40.00-100.00 | 20.00-45.00 |

board_components : 1 board 130.00-196.00; 10-board batch per board 86.50-146.50 EUR.
offboard_hardware : 1 board 35.00-80.00; 10-board batch per board 27.00-63.00 EUR.
manufacturing : 1 board 60.00-150.00; 10-board batch per board 28.00-65.00 EUR.
ALL : 1 board 225.00-426.00; 10-board batch per board 141.50-274.50 EUR.

Active architecture: USB-only external logic power, with an optional USB-charged protected 1S cell. No generator AUX 5 V branch or USB/AUX mux. The CELL allowance is included in full totals; subtract only that row for the no-cell variant, not the common charger/regulator circuitry.

Do not add drawn costs to complete-block budgets: they overlap. Projected values are the larger of the complete-block allowance and drawn priced subtotal. Unpriced components are reported, not valued at zero; a block budget is not proof that its missing parts fit.

Scope: 70 V-class AC-capable integrated converter, one receiver, no internal dump. External-converter support has been removed. A qualified DC-only assembly may omit RECTIFIER parts while retaining required input fusing and protection.

Unknowns: high-voltage USB fault containment, independent output protection, CV selection accuracy, magnetics and thermal qualification can increase this estimate. Prices are observations/allowances, not reserved inventory. Read README.md and project-budget.csv for assumptions.

Excluded: bicycle, donor generator, trainer mechanics/guards, main receiver battery, special OEM chargers/adapters, development labor, failed prototypes, compliance/certification, warranty, shipping, VAT and commercial margin. No selling price is inferred.
