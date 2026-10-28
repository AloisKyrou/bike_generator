# V2 Low-Voltage Power Model Evidence

2026-10-06, LV2 checkpoint. These models are accepted for schematic study, not fabrication release. Candidate sources are archived unchanged. No custom symbol or footprint was created.

| Proposed MPN | Native symbol | Native footprint | Manufacturer evidence |
| --- | --- | --- | --- |
| TPS2116DRLR | Power_Management:TPS2116DRL | Package_TO_SOT_SMD:SOT-583-8 | [TI SLVSFG1A](https://www.ti.com/lit/ds/symlink/tps2116.pdf), May 2021, pin map p. 3; DRL0008A pp. 22-24 |
| BQ24074RGTR | Battery_Management:BQ24074RGT | Package_DFN_QFN:VQFN-16-1EP_3x3mm_P0.5mm_EP1.6x1.6mm | [TI SLUS810N](https://www.ti.com/lit/ds/symlink/bq24074.pdf), October 2021, pp. 7-9; separate [RGT0016B 4219033/A](https://www.ti.com/lit/ml/qfnd097q/qfnd097q.pdf), August 2016 |
| TPS63031DSKR | Regulator_Switching:TPS63031DSK | Package_SON:WSON-10-1EP_2.5x2.5mm_P0.5mm_EP1.2x2mm | [TI SLVS696D](https://www.ti.com/lit/ds/symlink/tps63031.pdf), April 2020, p. 3; DSK0010A pp. 24-26 |
| 2N7002,215 | Transistor_FET:2N7002 | Package_TO_SOT_SMD:SOT-23 | [Nexperia Rev. 7](https://assets.nexperia.com/documents/data-sheet/2N7002.pdf), September 2011, pp. 1, 8-9 |
| SRN4018-2R2M | Device:L | Inductor_SMD:L_Bourns-SRN4018 | [Bourns SRN4018](https://www.bourns.com/docs/product-datasheets/srn4018.pdf), Rev. 01/22, p. 1 |

## Physical Acceptance

[pin-map.csv](pin-map.csv) reconciles all 41 electrical leads and pads, including the two exposed thermal pads. The charger and regulator each have four additional unnumbered paste-only apertures, not extra electrical pins. No drill holes or mechanical-only pads occur in these packages.

TPS2116: eight leads, top view, pin 1 upper-left and counterclockwise numbering. Body 1.2 x 2.1 mm nominal, external span 1.6 mm, 0.5 mm pitch. Native lands match TI: 0.67 x 0.30 mm, row centers 1.48 mm apart.

BQ24074: 16 leads plus grounded exposed pad 17. The datasheet pin diagram is top view; the package copper drawing is bottom view and must be reflected for board component-side mapping. Body 3 x 3 mm, pitch 0.5 mm, exposed pad 1.6 x 1.6 mm. The separately archived RGT0016B drawing is used because the current combined datasheet appends RGT0016C, while its BQ24074 pin diagram specifies RGT0016B. Native perimeter lands 0.875 x 0.25 mm at 1.4375 mm radial centers are an IPC-style extension of TI's 0.6 x 0.25 mm / 1.4 mm-center example, not an exact copy; pitch, numbering, body and exposed pad match. Assembly and thermal-via design remain release gates.

TPS63031: ten leads plus PGND exposed pad 11. Top-view function mapping matches the reflected package-bottom drawing. Body 2.5 x 2.5 mm, pitch 0.5 mm, exposed pad 1.2 x 2.0 mm. Native lands 0.825 x 0.25 mm / 1.2125 mm radial centers extend TI's 0.6 x 0.25 mm / 1.15 mm-center example. Numbering, pitch, body and exposed pad match. Four native paste windows are retained; stencil coverage and thermal vias need assembly review.

2N7002: pin 1 G, pin 2 S, pin 3 D; top-view package drawing is rotated to the native footprint's left-pair orientation. Body nominal 1.3 x 2.9 mm, paired-lead spacing 1.9 mm. Native SOT-23 uses larger generic IPC solder lands than Nexperia's compact reflow example; geometry is not mirrored and each land covers the corresponding physical lead.

SRN4018: two nonpolar interchangeable terminals, body 4.0 +/- 0.2 mm square. Native lands exactly match the manufacturer recommendation: 1.5 x 3.6 mm, centers 3.05 mm apart, total span 4.55 mm. The 2R2M variant is 2.2 uH +/-20%, 3.0 A saturation (30% inductance drop), 2.9 A thermal rating and 44 mOhm maximum DCR. Do not substitute the nonexistent 1R5M suffix: the 1.5 uH family variant is 1R5Y.

Each symbol and footprint was queried through Konnect, placed in the disposable `lv2-validation` project, read back and rendered. All saved pad coordinates, dimensions and layers match the queried libraries. F.Fab body/key orientation, F.SilkS and F.CrtYd were inspected separately. Footprints remain unchanged; 3D models were not used as evidence. Scratch files and detailed responses remain local under `.konnect-scratch/v2-2026-10-06/`.

## Electrical Scope

TPS2116 provides priority selection and reverse blocking under its documented low-voltage conditions. Its 5.5 V maximum operating input is not a high-voltage generator-to-PC isolation rating. It has no programmable current limit. USB fault protection, source transient bounds, input fusing and USB current authorization must be reviewed separately.

BQ24074 separates the 1S charge termination from system loading. The backup cell still requires a qualified protected 4.2 V Li-ion pack and temperature sensing; generic cell identity is not approval to charge it. TPS63031 provides fixed 3.3 V, load disconnect in shutdown and a low-power EN interface, but does not itself implement the complete wake/timeout/forced-off policy.

Archived TPS2113A and LPS3015 documents are comparison references only, not selected BOM parts. File hashes are recorded in `sha256.csv`.

## USB2 Models

GCT `USB4105-GF-A-120` uses native `Connector:USB_C_Receptacle_USB2.0_16P` and `Connector_USB:USB_C_Receptacle_GCT_USB4105-xx-A_16P_TopMnt_Horizontal`. The [GCT drawing](https://gct.co/files/drawings/usb4105.pdf), revision B4, 2023-12-18, is archived as `usb4105.pdf`. GF is gold flash, A is tape/reel, 120 is 1.20 mm shell stake length. This suffix does not change the contact land pattern; board thickness/stake protrusion still needs assembly review.

All 16 contacts plus shield match the manufacturer top/component-side map in [usb-pin-map.csv](usb-pin-map.csv). Four coincident A/B power/ground pairs intentionally share larger 0.60 x 1.15 mm lands. Eight signal lands are 0.30 x 1.15 mm, with the manufacturer 0.50 mm central pitch and stated asymmetric end spacing. Four SH plated slots have 0.60 mm drill width, 1.70/1.40 mm lengths and 1.00 x 2.10/1.80 mm copper lands. Two unnumbered 0.65 mm NPTH locating holes are 5.78 mm apart. Body 8.94 x 7.35 mm and pad/body orientation match. These duplicated coincident pads are not extra connectors or missing contacts.

ST `USBLC6-2SC6` uses unchanged `Power_Protection:USBLC6-2SC6` / `Package_TO_SOT_SMD:SOT-23-6`. The authoritative [ST DS4260 Rev. 7](https://www.st.com/resource/en/datasheet/usblc6-2.pdf), December 2021, was read online (pin map p. 1, package pp. 12-13). Direct ST downloads timed out. The archived `usblc6-2-rev2-farnell.pdf` is the older ST June 2005 Rev. 2 document from [Farnell](https://www.farnell.com/datasheets/48344.pdf), used for local diagram inspection, NOT represented as current. Pin mapping and package/land dimensions agree with Rev. 7; Rev. 7 changes A1 maximum, b minimum and L minimum, within the same envelope and solder-land coverage. All six functions were checked: 1/6 I/O1, 2 GND, 3/4 I/O2, 5 VBUS. Native 1.325 x 0.60 mm lands at +/-1.1375 mm centers and 0.95 mm pitch are a generic IPC extension of ST's 1.20 x 0.60 mm example (3.50 mm overall span), not an exact copied recommendation. No exposed pad or mechanical holes.

Both USB models were placed in scratch via Konnect, saved read back, and rendered. All pad dimensions, layers, drills and numbering were compared with library queries and manufacturer documentation. USBLC6 is ESD protection only, not sustained overvoltage containment, galvanic isolation or proof of protection against generator faults. USB current authorization, VBUS OVP, CC protection, power-off data behavior and system-level compliance remain open gates.
