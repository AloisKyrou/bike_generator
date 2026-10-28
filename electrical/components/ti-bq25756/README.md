# TI BQ25756 / BQ25756EVM reference archive

Retrieved 2026-10-06. **BQ25756 selected by the user later on 6 October**, with
55 V normal input/output working ceilings. External power parts remain provisional.
No purchased evaluation board, accepted physical pin map or imported KiCad model.

## Evidence

| Local file | Manufacturer source / revision | Pages used |
|---|---|---|
| [bq25756.pdf](bq25756.pdf) | [TI datasheet](https://www.ti.com/lit/ds/symlink/bq25756.pdf), SLUSEN5A, August 2026 | 1; 7-8 ratings/feedback; 23-25 charging; 42-44 control; application section 7.2.1.2.2 |
| [sluuct7.pdf](sluuct7.pdf) | [TI EVM guide](https://www.ti.com/lit/pdf/sluuct7), SLUUCT7D, May 2025 | 1-6 scope/defaults; 15-25 schematic, layout and BOM |
| [sluaax9.pdf](sluaax9.pdf) | [MOSFET selection](https://www.ti.com/lit/pdf/sluaax9), SLUAAX9, June 2025 | 1 contents; 3-12 loss modelling and selection workflow |
| [sdaa482.pdf](sdaa482.pdf) | [Inductor selection](https://www.ti.com/lit/pdf/sdaa482), SDAA482, September 2026 | 1 contents; 5-12 sizing, loss and BOM workflow |
| [BQ25756-Schematic-And-Layout-Checklist.pdf](BQ25756-Schematic-And-Layout-Checklist.pdf) | [TI engineer's checklist](https://e2e.ti.com/support/power-management-group/power-management/f/power-management-forum/1277772/faq-bq25756-schematic-and-layout-checklist), revision not stated | 1-6; secondary to exact current datasheet |
| [BQ25756EVM_Design_Files.zip](BQ25756EVM_Design_Files.zip) | [TI engineer's design-file release](https://e2e.ti.com/support/power-management-group/power-management/f/power-management-forum/1322329/bq25756evm-gerber-and-schematics-files), BMS042A | ZIP directory inspected, native files not imported |

The guide cover contains a BQ25756E naming inconsistency; its description and
BOM identify BQ25756 and BQ25756RRVT. Do not substitute the BQ25756E variant.
The older design ZIP is not assumed identical to the May 2025 guide or August
2026 silicon documentation. Reconcile revisions before reuse.

## What the reference offers, and what it does not

The IC combines four-switch buck-boost control, I2C current commands, ADC and
internal compensation. Its operating input ceiling is 70 V, not the 85 V absolute
maximum. The EVM itself is limited to 55 V input/output and 10 A charge current.
Neither is evidence for the project's earlier 80 V-input / 60 V-output target.

**Important correction to the earlier conversation:** forward output voltage is
set by an external feedback divider. The I2C feedback target only spans
1.504-1.566 V around 1.536 V. That is approximately -2.08% / +1.95%, not a wide
10-60 V output setting. A nominal 24 V divider permits approximately
23.50-24.47 V by that trim alone, before component tolerances.

For V2, broad software-selected receiver voltages still need reviewed feedback
range selection or an analog setpoint interface. Fixed-voltage assembly variants
could be simpler. Do not delete the DAC/digipot/interface budget on the assumption
that every command is already available over I2C.

The CE function can be disabled by register and the watchdog can restore charge
enable. These controls are not independent protection against arbitrary firmware
faults. Keep a separate hardware safety/disconnect design. MPPT, reverse operation,
precharge, termination and watchdog behavior all require explicit mode review.

Engineering gates before qualifying the implementation:

- Implement and verify the approved lower 55 V source/output envelope, including
  generator open-circuit/overspeed and connected-battery fault cases.
- Prove voltage-range selection is bounded and safe during reset, open circuit,
  wrong profile, communication loss and feedback-switch faults.
- Qualify station-supply behavior separately from battery charging, especially
  load start/restart and charge-state interactions.
- Validate generator-current command resolution, torque slew, source collapse
  and interaction with the receiver's own MPPT/input controller.
- Size FETs, magnetics, capacitors and cooling across actual operating points.
- Retain receiver-specific hardware limits and reverse-current protection.

## Native package inspection

The [manufacturer pin map](manufacturer-pin-map.csv) transcribes SLUSEN5A
Table 4-1, pages 3-5, using Figure 4-1's **top view**. It covers all 36 peripheral
pins plus exposed pad 37. The planned symbol/pad numbers are correspondence
requirements, **not proof of an accepted model**. In particular, pin 17 is PGND;
only 15, 16 and 31 are NC. VAC pins 32 and 33 have distinct described roles.

The package appendix RRV0036A, drawing 4226422/A (November 2020), specifies a
5 x 6 mm body, 0.5 mm lead pitch and nominal 3.6 x 4.6 mm exposed pad. Its board
layout is a top-side board view; the package outline lead view is the underside.
Installed KiCad contains the candidate
`Package_DFN_QFN:QFN-36-1EP_5x6mm_P0.5mm_EP3.6x4.6mm` and a ThermalVias variant.
This is a filename/dimension match only: pad coordinates, numbering, paste,
mask, courtyard, thermal-via fabrication and render still need reconciliation.
Do not select the similarly named 3.6 x 4.1 mm pad version.

No BQ25756 symbol was found in the installed library or the current official
KiCad Battery_Management catalogue searched on 6 October. TI links an actual
Ultra Librarian KiCad model preview, but its download requires registration.
No credentials or license acceptance were supplied. A project-local authored
symbol remains gated on the user's explicit permission.

The ZIP contains `BMS042A.PrjPcb`, four `.SchDoc` files, `BMS042A_PCB.PcbDoc`,
variant/BOM/output-job files, Gerbers, drill files and ODB data. The ODB directory
includes six copper layers. This is a useful editable reference, not proof that
V2 needs six layers or that the design can be reproduced on V1's two-layer PCB.
No executable, installer or macro was run. No files were imported into V2.
Vendor fabrication data are reference material, not project fabrication outputs.
Preserve TI notices and review reuse/redistribution terms before public packaging;
availability online does not establish an open-hardware license.

## SHA-256

```text
bq25756.pdf
75FAF67E43DA19BB009862CE2F33909600B9AED4E2A521134D8BE52686583B0E
sluuct7.pdf
195DE4F3548397F7E63A1C61ABA3958C1E35EE7E82725678CC60A5362C2929BD
sluaax9.pdf
484DACE97C4F85FF6E59945DA046C4D7D843D4A531B16C379B0D044A84967F63
sdaa482.pdf
A5466FE0B14195B889C72319A2EC811E440372D2EC79DE48FC82F7F77BECDB9E
BQ25756-Schematic-And-Layout-Checklist.pdf
767187AD099D41480770AFC7C39A0F79FDCE15F67AAF4902FAEF2A87204B6B59
BQ25756EVM_Design_Files.zip
48F447BC865D2EFF215E7F3361B0A5748873CF01AF4501BA171D89965BC5B995
```

Direct ZIP URL:
[TI attachment](https://e2e.ti.com/cfs-file/__key/communityserver-discussions-components-files/196/BQ25756EVM_5F00_Design_5F00_Files.zip).
