# Generator / receiver compatibility evidence

Research date: 2026-10-05. Supports the
[V2 decision pack](../../v2/docs/compatibility/README.md).
These references do not validate an unidentified salvaged component.

## Archive status

[sources.json](sources.json) records attempted downloads, revisions, pages or
sections, byte counts and SHA-256 hashes. Three files were successfully archived:

- [Denso alternator technical manual](denso-alternator-technical-manual.pdf),
  July 2017, pp. 6-8: excitation, rectification and voltage regulation.
- [Cycle Satiator manual](grin-satiator-manual-v1.pdf), firmware 1.0 historical
  edition: example charge profiles. Do not copy its generic presets into V2.
- [ODrive hoverboard guide](odrive-hoverboard-guide.rst), legacy repository
  snapshot: motor wiring/configuration evidence, not current firmware guidance.

GMAC, Phaserunner V6 and Shimano charger PDFs were readable via browser research
but local downloads returned HTTP 401/403. They are **not** archived. Obtain them
before implementation or pin/part validation. No login restrictions were bypassed.
Manufacturer/developer copyright and license terms remain applicable; documents
are evidence, not project-authored or relicensed content. No downloaded software
was executed and no CAD or firmware was changed.

## Source register

IDs below are used in the catalogs; each URL is a primary manufacturer,
developer or public-safety source. Accessed on the research date unless noted.

| ID | Source | Evidence and limitations |
|---|---|---|
| D01 | [Maxon: motors as generators](https://support.maxongroup.com/hc/en-us/articles/360004496254-maxon-Motors-as-Generators) | Speed/voltage, torque/current and loaded voltage drop; BLDC rectification. Not a datasheet for any donor. |
| D02 | [Grin: hub motor construction](https://ebikes.ca/resources/learn/hub-motors.html) | Direct-drive versus freewheeling geared mechanical paths. |
| D03 | [Grin: regenerative braking](https://ebikes.ca/resources/learn/regen.html) | Motor/controller requirements; mid-drive caveat. Manufacturer page updated 2026-09-22. |
| D04 | [Grin: motor options](https://ebikes.ca/resources/getting-a-kit/hub-motor-options.html) | Named examples including RH212/FH212, G310/G311 and GMAC; not local used-market statistics. |
| D05 | [ODrive original hoverboard guide](https://raw.githubusercontent.com/odriverobotics/ODrive/master/docs/hoverboard.rst) | Three phases and Hall signals; typical Kv example explicitly requires donor verification. |
| D06 | [GMAC product](https://ebikes.ca/product-info/grin-kits/gmac.html), [Rev 1 installation guide](https://www.ebikes.ca/documents/GMAC_Install_Rev1.pdf) | Documented locked-clutch exception to ordinary geared-hub behavior. |
| D07 | [Xiaomi Scooter 4 Pro specifications](https://www.mi.com/uk/product/xiaomi-electric-scooter-4-pro/specs/) | Exact DDHBC20NEB example: 42 V max adapter, 1.7 A, 0-40 C charging. Not all Xiaomi generations. |
| D08 | [Flipsky 6374 190KV](https://flipsky.net/products/bldc-belt-motor-6374-190kv-3250w-for-electric-skateboard) | High-Kv skateboard motor example. Advertised motoring power is not our generation rating. |
| D09 | [Pedal Power Generator belt-drive unit](https://www.pedalpowergenerator.com/shop/p/300-watt-bicycle-generator-belt-drive) | Seller/manufacturer explicitly relates its product to a MY1016 PM motor. Independent performance qualification still needed. |
| D10 | [Denso technical manual](https://assets.denso-am.eu/production/attachments/Starter-Alternator-Technical-Manual-English.pdf) | July 2017, pp. 6-8: wound-field alternator and regulator. |
| D10B | [Denso starter/alternator manual](https://assets.denso-am.eu/production/attachments/Starter-Alternator-Manual-English.pdf) | IC-regulator communication and LIN discussion; exact donor may differ. |
| D11 | [Bosch battery care](https://help.bosch-ebike.com/au/connect/help-center/asset-ast-00046), [Bosch second-use guidance](https://help.bosch-ebike.com/lu-fr/connect/help-center/care-for-bosch-ebike-system-2/asset-asf-00846) | Indexed official guidance calls for original chargers and discourages second-life repurposing. Some direct opens redirect to Help Center; recheck exact pack manual. |
| D12 | [Shimano EC-E8004 manual](https://si.shimano.com/en/pdfs/um/7H40B/UM-7H40B-003-ENG.pdf) | UM-7H40B-003, p. 1: specified charger/battery combination and charging conditions. |
| D13 | [Shimano DH-C3000-3N-NT](https://bike.shimano.com/en-SG/products/components/pdp.P-DH-C3000-3N-NT.html) | Lighting dynamo example, nominal 6 V / 3 W. |
| D14 | [Victron Lithium Smart operation](https://www.victronenergy.com/media/pg/Lithium_Battery_Smart/en/operation.html) | Sections 5.2/5.4, charging profiles and temperature restrictions for that family. |
| D15 | [Grin standard Satiator](https://ebikes.ca/satiator-standard-model-8a.html), [historical manual](https://www.ebikes.ca/pub/media/downloadable/SATIATOR/Satiator_Manual_V1.0FW.pdf) | Examples of 36/48/52 V pack charging voltages. Old profile values differ slightly; exact battery specification takes precedence. |
| D16 | [Phaserunner V6 manual](https://ebikes.ca/amfile/file/download/file/252/), [product page](https://ebikes.ca/product-info/grin-products/phaserunner.html) | Rev 2; battery current/voltage limits and independent phase-current control. Short regen peak examples are not continuous stationary charge ratings. |
| D17 | [CPSC: micromobility charger compatibility](https://www.cpsc.gov/Newsroom/News-Releases/2024/CPSC-Urges-Consumers-to-Not-Buy-or-Use-Universal-Chargers-with-Micromobility-Products-Due-to-Fire-Hazard) | 2024-09-05 safety notice; matching connectors alone do not establish safe charging. Not a French compliance assessment. |
| D18 | [USB-IF power delivery](https://www.usb.org/usb-charger-pd) | Negotiated voltage/power and protocol requirements. |
| D19 | [TI four-switch buck-boost control](https://www.ti.com/lit/an/slyt765/slyt765.pdf) | Topology and transition behavior, not a selected V2 controller. |
| D20 | [LTC3779 / DC2456A](https://www.analog.com/en/resources/evaluation-hardware-and-software/evaluation-boards-kits/dc2456a.html) | Candidate wide-input buck-boost reference; see existing converter study for derating and missing archive files. |
| D21 | [ODrive hardware configuration](https://docs.odriverobotics.com/v/latest/manual/hardware-config.html) | Battery charge/discharge current limits and regenerated-energy handling. Not a selected controller or full battery charger. |

`R-S1` through `R-S9` refer to the numbered sources in the
[existing receiver study](../../v2/docs/OUTPUT_RECEIVER_STUDY.md#sources), with
four PDFs already archived under [energy-receivers](../energy-receivers/README.md).
`USER` means the user's current-setup report; `CALC` is arithmetic, and
`JUDGMENT` is a provisional engineering classification rather than vendor data.
