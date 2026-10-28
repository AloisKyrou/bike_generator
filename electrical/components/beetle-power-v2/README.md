# Beetle-derived V2 logic-power evidence

Retrieved 8 October 2026. This archive supports a provisional schematic study,
not a qualified USB product or battery charger. See
[physical model verification](kicad-model-validation-2026-10-08.md) and the
[schematic checkpoint](../../v2/docs/SCHEMATIC_BEETLE_POWER_2026-10-08.md).

## Manufacturer Documents

| File | Manufacturer source | Revision / use |
|---|---|---|
| [tp4057-rev2.2.pdf](tp4057-rev2.2.pdf) | [Top Power](https://www.toppwr.com/uploadfile/file/20240913/66e3cef054ad8.pdf) | REV_2.2; p. 4 pin map, p. 6 current table, p. 8 SOT-23-6 |
| [rt9080-ds9080-09.pdf](rt9080-ds9080-09.pdf) | [Richtek](https://www.richtek.com/assets/product_file/RT9080/DS9080-09.pdf) | DS9080-09, December 2024; p. 4 top-view pins, p. 17 TSOT-23-5 |
| [ao3401a.pdf](ao3401a.pdf) | [AOS](https://www.aosmd.com/pdfs/datasheet/AO3401A.pdf) | Rev. 3.1, December 2023; research candidate only |
| [aos-sot23.pdf](aos-sot23.pdf) | [AOS](https://www.aosmd.com/sites/default/files/res/package/SOT23.pdf) | PO-00001 N; package and recommended land pattern |
| [ao3401a-marking.pdf](ao3401a-marking.pdf) | [AOS](https://www.aosmd.com/sites/default/files/res/markings/AO3401A.pdf) | PD00660 C; marking document retained, not a completed physical acceptance |
| [ss14.pdf](ss14.pdf) | [Vishay](https://www.vishay.com/docs/88746/ss12.pdf) | 88746, 23 April 2020; electrical data and p. 4 SMA outline/land pattern |

SHA-256:

```text
tp4057-rev2.2.pdf     A522DCACC37484970B0C08A3102AB76AD5798E69A29665E5EC7690EDFE6A727F
rt9080-ds9080-09.pdf  52D09967EF32672003DF93D1382BC249715365406F59D110D9EBAD6D618017D4
ao3401a.pdf          0D8E3261AE280E007B5837FFF60C55142F2D92AF71EDC4D02AEE6F7A760A785C
aos-sot23.pdf        B6FAC64D55F133CE74DD85DDDDC618C3D5408E9531CB21E660F6A8EF3D8C5408
ao3401a-marking.pdf  B722A53DE033360CF81DF567D259E454A19E30302E13CF1875592A2A42EE2C47
ss14.pdf             B32A2D93D2D2CF9F48D6CF678AB03713956B7501029C0424C6A554425DF562DA
```

## Source Circuit and Initial Checkpoint

The remaining-part statements below describe the initial Beetle drawing pass.
For the later sourcing/physical completion work, read
[completion candidates](COMPLETION_PARTS_2026-10-08.md); saved schematic
metadata and the final completion report take precedence over this history.

The archived [DFR0868 C3 schematic V2.0](../dfr0868-beetle-esp32-c3/dfr0868-schematic-v2.0.0.pdf)
dated 8 February 2022 is the topology/value reference. It identifies TP4057 and
RT9080, but not the exact Q1/D1 MPNs. The newer C6 board's AO3407/1N5819W parts
are not proof of the older C3 parts and were not silently substituted.

TP4057 REV_2.2 p. 6 specifies 2 kohm for nominal 400 mA, not 500 mA.
Its p. 5 current tolerance uses a 2.2 kohm test condition: do not silently apply
that tolerance as a guaranteed bound for the 2 kohm design. Charge current and
termination must be measured with the actual cell/source/thermal layout.

AO3401A and SS14 remain research candidates only, with blank schematic MPN and
footprint fields on Q20/D20. AOS's recommended land pattern differs from the
stock SOT-23 land geometry, and the complete physical mapping is not accepted
yet. SS14 has a promising SMA assembly package but its maximum reverse-leakage
specification at 40 V (0.2 mA at 25 C, 6 mA at 100 C) does not guarantee the
actual 4.2 V off-state leakage. Qualify the resulting VBUS voltage and PMOS gate
bias with the 10 kohm pulldown before selecting it. Do not call it ideal blocking.

LiteOn LTST-C170KGKT manufacturer downloads returned HTML or failed in this
session. No valid LED PDF is archived and D21 remains a generic unselected LED.
J26 reuses the prior user-selected JST connector and
[existing manufacturer archive](../jst-ph-battery-connector/README.md), with
physical cable polarity and cell qualification still mandatory.
