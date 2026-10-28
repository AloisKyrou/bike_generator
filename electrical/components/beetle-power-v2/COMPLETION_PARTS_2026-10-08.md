# Beetle-style power: completion candidates

8 October 2026, follow-on component completion. No new power architecture is
authorized here. Schematic selection/model acceptance is recorded separately
by the sole Konnect owner. These calculations do not qualify USB compliance,
cell charging, whole-board thermal performance or high-voltage fault containment.

## Proposed populated parts

| Ref | Exact manufacturer and part | Reason / remaining checks |
|---|---|---|
| Q20 | Alpha & Omega Semiconductor AO3401A | Leaded SOT-23; RDS(on) specified at -2.5 V gate drive. Verify gate/source/drain mapping against physical package, not just generic symbol. |
| D21 | Kingbright WP710A10LGD | Green low-current 3 mm THT LED, compatible in principle with the present 2k charge-status resistor. Verify polarity and hole/pitch. |
| R45 | Bourns CRM1206-FX-R820ELF | Stocked 0.82 ohm, 1%, 0.5 W at 70 C, 100 ppm/C; explicit small deviation from Beetle's nominal 0.8 ohm. Verify 1206 lands. |

Q20's manufacturer datasheet specifies at most 85 mOhm at VGS=-2.5 V,
TJ=25 C. At 0.6 A that corresponds to about 31 mW conduction loss, before
temperature and operating-point qualification. The 4 A headline is not the
logic system's rating. Low-cell startup/dropout remains a separate constraint.
Use AOS, not an unreviewed same-marking substitute from another manufacturer.

At 400 mA, R45 changes voltage drop from 0.320 to 0.328 V and dissipation from
0.128 to 0.1312 W. The 8 mV additional drop is the electrical cost of choosing a
stocked standard value with an explicit power rating. This does not change the
charger's programming resistor. At a hypothetical 432 mA and +1% resistance,
dissipation is about 0.155 W; actual charger tolerance and thermal conditions
still govern. The resistor is not a fuse or managed USB current limiter.

D21 is specified at 2 mA, with VF typically 1.9 V and maximum 2.25 V at 25 C.
With 5 V, 2k and an illustrative 0.2 V charge-status sink drop, current is about
1.45 mA. Visibility through a future enclosure still needs physical assessment.

## USB blocking diode comparison, not a selection

The existing SS14 candidate offers low forward drop but its reverse leakage
must not be treated as zero. The MOSFET gate/VBUS pull-down and host-off case
must be evaluated together with the charger path.

Two additional manufacturer-documented candidates are archived:

- Diodes Incorporated MBR180S1-7: SOD123, 1 A / 80 V, maximum VF 0.8 V at 1 A,
  room-temperature reverse current 5 uA at rated reverse voltage. Its small
  package's thermal resistance and the document's advanced-information status
  make it less attractive without further review.
- Vishay SS1H10-E3/61T: SMA, 1 A / 100 V, maximum VF 0.77 V at 1 A / 25 C,
  reverse current maximum 1 uA at rated reverse voltage / 25 C, but 0.5 mA at
  125 C. Easier thermal spreading than the SOD123 candidate, but increased
  forward drop reduces low-USB-voltage headroom. The current datasheet's example
  suffix is /6T; the stocked /61T is separately listed in
  [Vishay's product quality table](https://www.vishay.com/en/product/88747/tab/quality/)
  and the manufacturer-indexed ordering table as the 1800-piece reel variant.
  The suffix discrepancy alone is therefore not a rejection of the part.

Neither candidate proves zero backfeed or a guaranteed low VBUS voltage at all
temperatures. Do not turn typical leakage curves into maximum guarantees.
No ideal-diode IC or source-mux architecture has been substituted for Beetle.

## Sourcing observations

EUR before VAT/delivery; stock can change. Observed 8 October 2026. Cut tape
prices exclude Digi-Reel fees. Search-index versus freshly opened page is noted.

| Part | Stock observed | 1 / 10 units, EUR each | Source |
|---|---:|---:|---|
| AO3401A, AOS | 369787, refreshed opened page | 0.46 / 0.283 | [DigiKey France](https://www.digikey.fr/en/products/detail/alpha-omega-semiconductor-inc/AO3401A/1855943) |
| WP710A10LGD | 25580, opened page | 0.19 / 0.133 | [DigiKey France](https://www.digikey.fr/en/products/detail/kingbright/WP710A10LGD/2657762) |
| CRM1206-FX-R820ELF | 43925, opened page | 0.24 / 0.123 | [DigiKey France](https://www.digikey.fr/en/products/detail/bourns-inc/CRM1206-FX-R820ELF/3543251) |
| SS1H10-E3/61T, research only | 27524, indexed page | 0.51 / 0.318 | [DigiKey France](https://www.digikey.fr/fr/products/detail/vishay-general-semiconductor-diodes-division/SS1H10-E3-61T/1091541) |

## Manufacturer archives

| File | Source / revision / relevant pages | SHA-256 |
|---|---|---|
| WP710A10LGD.pdf | [Kingbright](https://www.kingbrightusa.com/images/catalog/spec/wp710a10lgd.pdf), DSAL0509 V9B, 18 April 2020, pp1-2 | 7C9E6196C3BA4F86D0CECAF00BC77578EA27DD76D7AB4341CE104781D6A37CCC |
| CRM0805_1206_2010.pdf | [Bourns](https://www.bourns.com/docs/Product-Datasheets/CRM0805_1206_2010.pdf), electrical table p1, dimensions/derating p2, ordering p3 | 9B12229E55DCBE418D09CDE483BAFD2C4DC287BC0DDB225503234585DDC0DDFF |
| MBR180S1.pdf | [Diodes Incorporated](https://www.diodes.com/assets/Datasheets/MBR180S1.pdf), DS37775 Rev3-2, July2022, pp1-4 | 904FC51BA075BA21A3D75B2E236E708AA8474C3AD43FBDC35AE9FA075BFC554C |
| ss1h9-ss1h10.pdf | [Vishay](https://www.vishay.com/docs/88747/ss1h9.pdf), 88747, 13 November2025, pp1-4 | EAF0F9918D38E62ADA491DEDED3830B70A4E7B4E2C98B95539F5A4BE812583CE |

AO3401A Rev3.1 December2023 and its separate mechanical/marking documents were
already archived in this folder; see the existing README and model record.
