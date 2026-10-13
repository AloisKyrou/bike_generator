# V2 component candidates and planning cost

Active decision, 6 October: BQ25756 selected with a 55 V working ceiling. The
[overall tracker](README.md) now supersedes this document's historical complete
cost totals, especially the old ADI power stage and all dump-load allowances.
The historical comparisons below are not an active purchasing list.

Date: 2026-10-05. Status: **PROVISIONAL; no parts approved for purchasing**.
This is a feasibility shortlist and block-level budget, not an orderable BOM,
a production quote, a validated charger or a retail-price commitment.
No KiCad or firmware changes accompany this study.

## Scope update: 2026-10-06

The user has excluded **all internal dump hardware, including optional DNP
footprints**, and requested an external-converter assembly variant with the
internal main stage omitted. See the
[current architecture requirements](../docs/CONTROLLER_V2_INTEGRATED_SPEC.md).
GPIO-level external-load control remains; the accessory contains its own power
switching, load and protection. Exact interface and assembly BOMs are pending.

The tables and dated CSV below are preserved as the **historical 5 October
integrated-plus-dump comparison**, not the current approved scope or a quote.
Rows B07 (dump switching) and B11 (dump bank) are excluded from the base product.
Their combined old allowances were EUR 29-68 / 23-56 / 20-50 per unit at
quantities 1 / 10 / 50. These are gross removed allowances, not guaranteed net
savings: GPIO protection, connectors and revised assembly costs need rebudgeting.
In the external-converter variant, B01 is omitted but a purchased/reused module,
control adapter, harness and its cooling must be accounted for separately.
Do not remove B02 or shared protection/sensing automatically; their scope depends
on the chosen external interface. No revised complete product total is claimed.

Accessibility follow-up: the reference design should also permit a protected
DC-input assembly without the AC rectifier. Rectifier cost is only part of B03;
do not subtract that whole row, which includes shared sensing, fuses and
disconnect protection. Only bridge-specific cooling can be omitted from B10.
Exact savings require variant BOMs, including any replacement polarity protection
and power links. Full reference functionality and a small initial prebuilt range
are separate goals; no stock or commercial variant list is frozen here.

## Scope and assumptions

- Working comparison: approximately 10-80 V rectified input, 10-60 V output,
  up to 20 A at input/output, and 400 W maximum INPUT target, not simultaneous.
  Continuous power and transient profiles remain unqualified. Copied V2 still
  contains V1 circuitry and retains V1's 70 V limit.
- Four-switch, single-inductor non-isolated buck-boost; passive three-phase
  rectifier initially; separate protected auxiliary supply; ESP32 radio module;
  USB service; small logic-backup LiPo; controlled external dump load.
- Initial supported receivers are explicitly qualified models, not arbitrary
  batteries identified from voltage. Own-e-bike phase switching, proprietary
  charging protocols and car-alternator excitation adapters are not included.
- Quantities are 1, 10 and 50 identical controllers. User batch size remains
  unconfirmed. Values below are EUR excluding VAT and freight, per controller.
- Existing design work saves development time, not recurring component cost.
  Do not subtract workshop stock when quoting a repeatable product BOM.

## Main converter candidates

2026-10-06 addition: TI **BQ25756 / BQ25756EVM** is a cost-sensitive comparator
to the ADI paths, with [archived native design evidence](../../components/ti-bq25756/README.md).
It is not selected: the IC's 70 V input ceiling conflicts with the earlier 80 V
target, and the 55 V EVM needs redesign for a 60 V output. Crucially, the
forward-output I2C voltage setting is only a small feedback trim, not wide-range
CV control. Keep an allowance for a qualified voltage-setpoint interface; do
not claim the DAC/digipot cost disappears. No refreshed whole-BOM price is
established by this research.

Fresh IC-only price observation on 2026-10-06:
[BQ25756RRVR at DigiKey France](https://www.digikey.fr/fr/products/detail/texas-instruments/BQ25756RRVR/21442001)
shows EUR 7.22 at 1, 5.589 at 10 and 5.182 at 25, excluding VAT/freight.
This supersedes the earlier conversational EUR 6.21 observation for current
planning; no inventory is reserved. The IC price does not include four switching
FETs, magnetics, setpoint circuitry, protection or cooling.

| Candidate | Why investigate | Limitation / decision gate |
|---|---|---|
| ADI LTC3779EFE#PBF or qualified I-grade variant | 4.5-150 V controller input range; significant headroom above proposed 80 V; DC2456A reference already studied | Average-current loop senses input OR output, not both independently; command circuitry and second current constraint remain; EFE distributor stock issue |
| ADI LT8705AEFE#PBF | Separate input voltage/current and output voltage/current loops fit generator loading plus receiver limiting | 80 V is its operating ceiling, not comfortable overspeed headroom; requires proven protection/margins or an explicitly lower source envelope; not a drop-in substitution |
| TI LM51770 | 78 V operating range; mature four-switch reference family; potentially useful for a deliberately lower-voltage product | Fails an unmodified 80 V continuous requirement; no I2C or ready analog ISET pin per device comparison table; current-command implementation still required |
| TI LM51772 | I2C voltage/current configuration could remove some external setpoint circuitry | 55 V input/output family does not cover the proposed 80 V input / 60 V output scope; do not trade away compatibility silently |

Historical 5 October recommendation: compare **LTC3779 against LT8705A first**, including current-loop
implementation and protection costs, not only IC price. Neither is selected.
For a strict 80 V source envelope, LTC3779 is the stronger voltage-headroom
comparator. LT8705A is particularly interesting if characterization supports a
lower guaranteed input ceiling. No loop permits arbitrary excess rider power
to be forced into a battery; remaining power needs a qualified alternate sink.

Primary evidence:
[LTC3779](https://www.analog.com/en/products/ltc3779.html),
[LT8705A](https://www.analog.com/en/products/lt8705a.html),
[LT8705A datasheet, current/voltage loops](https://www.analog.com/media/en/technical-documentation/data-sheets/8705af.pdf),
[LM51770 datasheet, device comparison](https://www.ti.com/lit/gpn/LM51770),
[LM51772](https://www.ti.com/product/LM51772).

Another accessible reference exists: [DC1924A](https://www.analog.com/en/resources/evaluation-hardware-and-software/evaluation-boards-kits/dc1924a.html)
uses the older LT8705, with 36-80 V input and 48 V / 5 A nominal output. Its
page lists schematic, manual, design ZIP and an LT8705A LTpowerCAD project.
The ZIP has not been downloaded/inspected; no native CAD format is claimed.
It is not a demonstrated 10-60 V / 20 A adjustable project design.

## Supporting candidates and what we reuse

| Function | Candidate / existing part | Remaining work |
|---|---|---|
| Main switches | Infineon BSC093N15NS5ATMA1, 150 V, pricing comparator | Gate-drive compatibility, hot RDS(on), switching loss and overshoot; four devices is a budget assumption, paralleling may be needed |
| Main inductor | Coilcraft SER2918H-103KL, 10 uH comparison point | Calculate ripple, peak current, hot saturation, loss and frequency before selecting any value; not approved simply because its current looks sufficient |
| Main capacitors | Exact MPNs TBD | Voltage derating, ripple current, effective capacitance, lifetime, transient envelope; not generic 63 V caps for a 60 V output |
| CC/CV digital command | Existing MCP42100-I/SL OR TI DAC60502DRXT | Digipot is cheaper and already documented; DAC has finer resolution/reference but requires analog scaling; choose one reviewed command approach |
| Auxiliary generator supply | Existing LM5164DDAT; DDAR packaging comparator | Reuse topology/library; recheck V2 input network, protection, startup, load and thermal margin; DDAT/DDAR availability differs |
| Radio | ESP32-C3-MINI-1-N4X; MINI-1U-N4X if external antenna | Espressif v2.21 recommends X variants; older N4 marked NRND; antenna layout, GPIO allocation and procurement check still required |
| USB/AUX selection | TPS2121RUXR | Low-voltage source priority and reverse blocking; verify switchover, current-limit tolerance and all powered/unpowered states |
| Small LiPo charging | BQ24074RGTR | Power-path charger for logic cell only; exact cell current/temperature qualification, USB input budget, thermal and discharge isolation |
| Logic 3.3 V | TPS63031DSKR candidate | Buck-boost permits a stable 3.3 V logic rail across cell discharge; verify radio bursts, low-cell current capability and quiescent budget |
| Wake/auto-on | LTC2955 family, exact polarity/package TBD | Button, generator/USB presence, forced-off and battery isolation; not a direct HV-bus part |
| USB connector/data ESD | USB4105-GF-A-120 and USBLC6-2SC6, screening candidates | Mechanical fit and full USB protection circuit unvalidated; add CC resistors, VBUS protection/current limiting and safe unpowered I/O behaviour |
| Current sensing | Reuse INA238 on protected <=60 V output; compare INA296A on generator side | INA296A tolerates 110 V common mode but needs ADC/reference/filtering and voltage divider; choose gain/shunts and independently protect the bus |
| High-side disconnect | TPS48110-Q1 family screening candidate plus external FETs | Datasheet operating max 80 V despite 100 V headline; unsuitable as an assumed unlimited input protector; output-side protection is a useful study case |
| Rectifier | Existing Diotec DBI25-16A | Reuse footprint/knowledge; heatsinking and low-voltage losses remain; active rectification excluded from baseline budget |
| Dump stage | Rated resistor bank plus MOSFET/driver, comparator and thermal cutoff, MPNs TBD | Dissipation, touch protection, overspeed, battery-full behaviour, fault independence; never use a TVS as the sustained sink |

Supporting primary sources:
[Infineon](https://www.infineon.com/part/BSC093N15NS5),
[Coilcraft](https://www.coilcraft.com/en-us/products/power/shielded-inductors/high-current-flat-wire/ser/ser29xx/ser2918h-103/),
[existing MCP42100 evidence](../../components/dfr0520-mcp42100/README.md),
[DAC60502](https://www.ti.com/product/DAC60502),
[LM5164](https://www.ti.com/product/LM5164),
[Espressif v2.21, pp. 3-4](https://documentation.espressif.com/esp32-c3-mini-1_datasheet_en.pdf),
[TPS212x](https://www.ti.com/lit/ds/symlink/tps2121.pdf),
[BQ24074](https://www.ti.com/product/BQ24074),
[TPS63031](https://www.ti.com/product/TPS63031),
[LTC2955](https://www.analog.com/en/products/ltc2955.html),
[INA296A](https://www.ti.com/product/INA296A),
[TPS4811 Rev E, pp. 1 and 7](https://www.ti.com/lit/ds/symlink/tps4811-q1.pdf),
[existing rectifier evidence](../../components/dbi25-16a/README.md).
New manufacturer references above were consulted online, not archived/validated
for pin mapping. Full document archival, hash/revision capture and library
verification are required before schematic implementation.

### Smart auxiliary architecture

```text
Protected generator bus -> LM5164 -> AUX_5V -------+
USB-C -> USB input protection --------------------+-> TPS2121 -> SOURCE_5V
                                                               |
                                                       BQ24074 power path
                                                        |             |
                                                  protected 1S     SYS_LV
                                                                     |
                                                        wake-controlled supply
                                                                     |
                                                          TPS63031 -> 3V3
```

This is a functional proposal, not a wireable schematic. `SYS_LV` is not a
guaranteed 5 V rail: it follows the charger power-path behaviour and battery.
An ESP32 radio module takes regulated 3.3 V, not USB 5 V. Preserve physical
battery isolation for service; implement the agreed bidirectional off-state
isolation separately from charger enable. Do not assume a wake IC alone stops
all battery leakage. Charging the LiPo must not brown out the logic or exceed
USB-negotiated/advertised current; reduce charge current on weak generation.
Keep main-stage enable hardware-gated until supplies and safety checks are valid.
Main power-stage gate drivers may require another bias voltage; no assumption
that AUX_5V directly drives their gates is made in this budget.

This architecture prevents normal source backfeed when properly implemented;
it is NOT galvanic isolation or proof of PC safety under a high-voltage-to-logic
fault. USB fault containment must include the auxiliary converter failure case.
USB-PD output/phone charging and isolated USB are not included in the baseline.

### Setpoint decision

The dual MCP42100 remains a reasonable prototype comparator, but it is not a
mandatory part of the integrated V2. Its terminals must remain in its supply
domain with current within the established limits; 100 kohm tolerance, wiper
resistance and 8-bit steps must be included in the error budget. DAC60502 is a
12-bit dual voltage DAC with an internal reference, not a drop-in resistor.
Two channels cover two commands only: independently commanding input current,
output current AND output voltage may require another channel or a different
partition between fixed hardware limits and programmable limits. Both choices
require validated startup, output disconnect and independent hardware ceilings.

## Observed price anchors

[Price evidence CSV](candidate-prices-2026-10-05.csv) contains URLs, currency,
packaging, quantity tiers and caveats. These are public web observations, not
supplier quotes or reserved inventory. Direct FR retrieval supersedes older
search snippets, which showed different EUR prices and stock. No USD conversion
or thousand-piece headline price is used for the pilot BOM.

| Part | 1 component | 10 components | 50 components |
|---|---:|---:|---:|
| LTC3779EFE#PBF | 17.23 | 13.73 | 12.33 |
| LT8705AEFE#PBF, less-fresh EU listing | 16.80 | 13.38 | 12.02 |
| BSC093N15NS5ATMA1, EACH | 4.55 | 3.01 | 2.34 |
| ESP32-C3-MINI-1-N4X | 2.86 | 2.48 | 2.34 |
| MCP42100-I/SL, alternative | 2.48 | 2.48 | 2.07 |
| DAC60502DRXT, alternative | 6.88 | 5.32 | 4.93 |
| LM5164DDAR | 4.36 | 3.32 | 3.06 |
| TPS2121RUXR | 2.14 | 1.59 | 1.45 |
| BQ24074RGTR | 2.13 | 1.59 | 1.45 |

Where no 50-piece break exists, the 25-piece price is used; MCP42100 has no
10-piece discount in the observed table. Four main MOSFETs per board means
4/40/200 transistors for 1/10/50 boards, respectively: approximately
18.20/12.02/8.52 EUR per board using the observed eligible tiers. Protection
MOSFETs are additional and are not counted in those four devices.

Supply flags: LTC3779EFE#PBF and ESP32-C3-MINI-1-N4X showed zero stock at the
observed FR distributor. LM5164DDAR also showed zero; DDAT was listed as an
alternative. Incoming dates and other-country search results conflict and are
not purchasing evidence. Check exact MPNs across authorized suppliers before
selecting parts; do not infer that the whole family is unavailable.

## Historical per-unit block budget (superseded scope)

Every row below is an **engineering allowance**, informed by price anchors
where available. It is not a summation of a complete fitted-component BOM.
The [budget CSV](budget-blocks-2026-10-05.csv) separates categories and avoids
counting the DAC and digipot together or counting auxiliary fusing twice.

| Board components | One-off | Batch 10 | Batch 50 |
|---|---:|---:|---:|
| Main buck-boost power stage | 65-100 | 45-70 | 37-60 |
| CC/CV command and analog interface | 9-15 | 7-12 | 6-10 |
| Rectification, protection and sensing | 35-60 | 25-45 | 20-38 |
| Complete auxiliary 5 V branch | 14-20 | 10-16 | 8-13 |
| ESP32 module and 3.3 V supply | 6-10 | 5-8 | 4-7 |
| USB, charger, source mux and wake | 12-20 | 9-15 | 7-12 |
| Onboard dump switching | 4-8 | 3-6 | 2-5 |
| Remaining connectors/passives | 8-15 | 6-12 | 5-10 |
| **Board components total** | **153-248** | **110-184** | **89-155** |

Additional per-unit allowances:

| Item | One-off | Batch 10 | Batch 50 |
|---|---:|---:|---:|
| Small protected logic battery | 5-10 | 4-8 | 3-7 |
| Power-stage cooling | 10-25 | 8-20 | 6-16 |
| Guarded/cooled dump resistor bank | 25-60 | 20-50 | 18-45 |
| Enclosure, harness, mating plugs, cadence sensor | 20-45 | 15-35 | 12-30 |
| Bare PCB | 20-50 | 8-20 | 5-12 |
| Assembly, programming, basic production test | 40-100 | 20-45 | 12-30 |
| **Controller box total, including board components** | **273-538** | **185-362** | **145-295** |

PCB and assembly numbers are not factory quotes: board area, copper, stackup,
placement count, setup charges and test time are unknown. Revisit these once a
draft schematic and thermal layout exist. Dump-load cost is especially uncertain
until its continuous power and duration are fixed. A resistor's nameplate rating
requires its specified mounting/cooling; this budget does not qualify 400 W heat
dissipation. Assembly includes recurring basic test, not development validation.

For a 10-unit pilot, those estimates mean 1,100-1,840 EUR of board components,
or 1,850-3,620 EUR of controller boxes before tax/freight. An explicit 20% cash
contingency makes the latter 2,220-4,344 EUR, still excluding engineering effort.
This contingency is a budgeting choice, not a statistical confidence interval.
Failed development boards and repeated prototype fabrication are separate NRE.

Excluded throughout: bicycle, donor motor/alternator, main storage battery,
stand/roller/belt/gearing/guards for rotating machinery, special OEM battery
adapters/chargers, test equipment, firmware/app engineering, certification,
shipping/taxes, warranty, customer support, packaging and commercial margin.
No recommended retail price is inferred from this material estimate.

## Historical budget interpretation (before the 6 October decisions)

- For discussions with interested people, use roughly **110-185 EUR board
  components** or **190-365 EUR assembled controller box** at ten units,
  excluding tax/freight and before contingency. These are provisional ranges.
- The [older V1 estimate](../../v1/bom/controller-v1-cost-estimate.md) was
  46-60 EUR of components and excluded its external main buck, PCB, assembly,
  LiPo and harness. It is not a like-for-like price comparison with this box.
- Replacing the Beetle does not save its entire price: radio-module cost is
  only part of the replacement; regulation, charger, USB and wake remain.
- At ten pieces the DAC versus MCP42100 IC difference is about 2.84 EUR.
  That is not the complete interface delta, but it is too small to justify
  compromising precision or safe control. At first pilot scale development
  effort and thermal/protection choices dominate that difference.
- Boost's recurring cost cannot be isolated reliably before equivalent buck
  and buck-boost designs exist. Two additional example main FETs alone are
  about 6 EUR per board at the eligible 40-piece tier for ten boards, but that
  is NOT the complete boost premium; controller, magnetics, capacitors, layout
  and cooling also change. Do not promise a precise percentage saving.
- A passive bridge keeps initial design effort lower but can lose substantial
  power at low voltage/high current. Active rectification is a later comparison,
  not a free efficiency upgrade hidden inside these figures.

## Next selection gates

1. Confirm batch size, continuous trainer power and acceptable box temperature.
2. Characterize generator loaded voltage and overspeed; decide whether a true
   80 V input ceiling is necessary before committing to the converter family.
3. Compare current-command/error budgets and fault states for the two ADI paths;
   prototype with dummy loads before connecting an actual lithium battery.
4. Size magnetics, MOSFETs, capacitors, disconnects and dump load; request real
   PCB/assembly quotations only after geometry and BOM are known.
5. Approve exact parts explicitly, archive manufacturer documents, then verify
   symbols/footprints through the prescribed library and Konnect workflow.

This study authorizes no purchase, fabrication submission or V1 substitution.
