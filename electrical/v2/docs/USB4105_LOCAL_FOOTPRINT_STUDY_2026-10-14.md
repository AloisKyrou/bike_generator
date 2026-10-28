# USB4105 local footprint study

## Latest direction: standard alternatives, 14 October 2026

User rejects a manufacturer-specific waiver and requests a standard replacement
connector or a fabrication service with published <=0.15mm hole/copper capability.
Do not apply this custom study or relax V2 rules on the basis of the discussion.
Latest user decision: JAE provisionally approved and applied to J27. See
[JAE selection, checks and remaining fabrication hold](USB_JAE_SELECTION_2026-10-14.md).
Its 0.6mm oval NPTH introduces a distinct slot/edge-process constraint; do not
mistake removal of the old GCT errors for fabrication acceptance. The custom
GCT study below remains unassigned and historical.

Konnect read-only screening of installed standard footprints identified:

- JAE `DX07S016JA1R1500`: standard `Connector_USB:USB_C_Receptacle_JAE_DX07S016JA1R1500`.
  Nominal locator-to-outer-GND-land gap is 0.30mm. This is NOT the minimum over
  every pad/hole pair and not a completed DRC/manufacturer drawing validation.
  Check oval locator/shell clearances and the two unnumbered underside SMT lands
  before acceptance; assembly access matters. DigiKey France page displayed
  1.58 EUR/unit cut tape and 6,408 stocked; snapshots vary by locale/cache.
  https://www.digikey.fr/fr/products/detail/jae-electronics/DX07S016JA1R1500/11585731
- HRO `TYPE-C-31-M-12`, LCSC `C165948`: standard
  `Connector_USB:USB_C_Receptacle_HRO_TYPE-C-31-M-12`.
  Calculated locator-to-outer-GND-land gap 0.420mm. Exact current manufacturer
  drawing reconciliation, all other clearances and solder access remain open.
  LCSC page displayed 375,005 stocked, USD0.1729 promotional / 0.1879 regular
  at quantity5; excludes delivery/taxes. Avoid an extra supplier solely for this
  saving if the consolidated basket is elsewhere.
  https://www.lcsc.com/product-detail/C165948.html
  https://en.krhro.com/Product-Details/726.html
- GCT USB4110 repeats the original locator/ground geometry: no solution.
- GCT USB4085 is THT, but standard pads have only 0.15mm copper spacing and
  0.15mm annular rings: not an automatic solution for the intended 2oz process.

OSH Park publishes 0.127mm copper-to-hole clearance for two-layer services:
https://docs.oshpark.com/design-tools/kicad/kicad-design-rules/
Its 2oz offering uses 0.8mm PCB thickness, not the approved 1.6mm, and costs
USD5/square inch for three copies (about USD93.78 for three 110x110mm boards,
calculated before applicable taxes). This is not a drop-in stackup substitution.
https://docs.oshpark.com/services/two-layer-hhdc/

Evidence: `.konnect-scratch/usb16-candidates-result.json` and
`usb16-more-result.json`. These are library-screening candidates, not accepted
substitutions, finished fit checks or whole-board fabrication approval.

**PROVISIONAL. Created and geometrically checked; not assigned to J27.**
User authorized study of a local variant on 14 October 2026, retaining all
hole positions and diameters. This is not manufacturer approval or a
fabrication release. The four original J27 DRC errors remain visible in V2.

## Source and scope

- Part: GCT `USB4105-GF-A-120`, 16-contact USB 2.0 receptacle, 1.20 mm shell stakes.
- Manufacturer drawing: USB4105, revision B4, 18 December 2023, page 1/2.
- [Official drawing](https://gct.co/files/drawings/usb4105.pdf).
- Archived: `electrical/components/ti-lv-power-v2/usb4105.pdf`.
- SHA-256: `FB331FBABEE8392ED2937ED757C1610CB0F174B84625147C0B580A18EEA8C0E5`.
- Drawing view: recommended PCB layout **viewed from component side**.
- Standard symbol: `Connector:USB_C_Receptacle_USB2.0_16P`.
- Standard footprint:
  `Connector_USB:USB_C_Receptacle_GCT_USB4105-xx-A_16P_TopMnt_Horizontal`.
- Study file: `../kicad/libraries/footprints/BikeGenerator.pretty/USB_C_GCT_USB4105_16P_HoleClearance_Study.kicad_mod`.

The standard footprint was imported and exported under a new filename using
KiCad's native Footprint Editor, then modified through Konnect. The original
system library was not changed. Only four logical GND pad records and the
description were edited. No generic script edited native CAD.

## What changes

Four reported errors represent **two physical ground lands**, each having
two USB contact numbers: A1/B12 and A12/B1. VBUS is not affected.

| Feature | Standard | Study |
|---|---|---|
| Ground-land width | 0.60 mm | Unchanged |
| Ground-land length | 1.15 mm | 1.05 mm |
| Ground-land centre Y | -3.680 mm | -3.730 mm |
| Outer, accessible land edge Y | -4.255 mm | Unchanged |
| Inner, hole-facing land edge Y | -3.105 mm | -3.205 mm |
| Rounded-corner radius | 0.15 mm | Unchanged |
| Calculated nearest hole/copper gap | 0.1944 mm | 0.2919 mm |
| Project minimum hole/copper gap | 0.25 mm | Unchanged |

The 0.10 mm reduction is on the hole-facing side only; land length decreases
by 8.7%. This deliberately departs from GCT's recommended land pattern.
It is **not** evidence that solder-joint strength or contact overlap at all
part/placement tolerances is equivalent to the manufacturer's pattern.

Calculation for the rounded corner and 0.65 mm hole:
`sqrt(0.160^2 + 0.750^2) - 0.150 - 0.325 = 0.291877 mm`.
This is nominal CAD spacing, not a worst-case manufacturing guarantee.

All other pad coordinates, shapes, drills, layer sets and numbering are
unchanged. F.Fab, F.SilkS, F.CrtYd and Dwgs.User graphics are unchanged.
The standard 3D model association and its transforms are preserved.

## Pin and mechanical mapping

Coordinates are footprint-local mm, component-side view, same orientation
as the standard footprint. Every electrical symbol pin uses the pad number
in the first column. Ground/VBUS/SHIELD are passive symbol pins; other
electrical pins are bidirectional. Names and numbers read back from KiCad.

| Manufacturer lead / symbol pin / pad | Function | X | Study Y |
|---|---|---:|---:|
| A1 | GND | -3.20 | -3.730 |
| B12 | GND, same land as A1 | -3.20 | -3.730 |
| A4 | VBUS | -2.40 | -3.680 |
| B9 | VBUS, same land as A4 | -2.40 | -3.680 |
| B8 | SBU2 | -1.75 | -3.680 |
| A5 | CC1 | -1.25 | -3.680 |
| B7 | D- | -0.75 | -3.680 |
| A6 | D+ | -0.25 | -3.680 |
| A7 | D- | +0.25 | -3.680 |
| B6 | D+ | +0.75 | -3.680 |
| A8 | SBU1 | +1.25 | -3.680 |
| B5 | CC2 | +1.75 | -3.680 |
| B4 | VBUS | +2.40 | -3.680 |
| A9 | VBUS, same land as B4 | +2.40 | -3.680 |
| B1 | GND | +3.20 | -3.730 |
| A12 | GND, same land as B1 | +3.20 | -3.730 |
| Left rear shell stake / SH | Shield | -4.32 | -3.105 |
| Right rear shell stake / SH | Shield | +4.32 | -3.105 |
| Left front shell stake / SH | Shield | -4.32 | +1.075 |
| Right front shell stake / SH | Shield | +4.32 | +1.075 |
| Left locator / no electrical pin | NPTH | -2.89 | -2.605 |
| Right locator / no electrical pin | NPTH | +2.89 | -2.605 |

Counts: 16 electrical contacts, 12 physical signal/power lands, four shell
stakes and two locators. Symbol: 17 pins including common SH. Footprint:
22 pad records (16 contact records, four SH, two unnumbered NPTH). Four
coincident pairs are intentional, not shorts between different functions.

Unchanged mechanical geometry checked against drawing page 1:

- Locator holes 0.65 mm diameter, 5.78 mm centre spacing; posts nominal 0.50 mm.
- Rear shell slots 0.60 x 1.70 mm, lands 1.00 x 2.10 mm.
- Front shell slots 0.60 x 1.40 mm, lands 1.00 x 1.80 mm.
- Shell stake columns 8.64 mm apart, rows 4.18 mm apart.
- Body 8.94 x 7.35 mm; standard board-edge indication Y=3.675 mm.
- Outer electrical land centres 6.40 mm apart; VBUS centres 4.80 mm apart.
- Eight small lands 0.30 x 1.15 mm, pitch 0.50 mm; unchanged.

## Checks and remaining gate

Konnect readback proves all 22 pads and five graphic primitives match the
standard except the requested four GND records. A disposable, single-instance
KiCad board has **zero hole-clearance findings at 0.25 mm**. Its eight other
findings are the four intentionally coincident pad pairs left without nets:
four copper-clearance and four mask-bridge reports. This unnetted coupon is
not reported as a clean electrical board.

A first two-instance comparison coupon retained duplicate library item UUIDs
through the closed-board placement tool, making DRC object attribution
ambiguous. It is not used as DRC acceptance evidence. The subsequent
single-instance coupon is the hole-clearance evidence. Comparison SVG/PNG
was inspected for orientation, holes, slots and changed ground lands.

Before replacing J27: inspect a real USB4105-GF-A-120 against a 1:1 print or
obtain adequate manufacturer solder-tail/tolerance confirmation. Verify
remaining contact overlap and solder access, not just nominal hole spacing.
Then update both the schematic footprint field and PCB through KiCad/Konnect,
preserving placement/nets/routes, and rerun full-board DRC and synchronization.
No hole was shrunk, no DRC exclusion was added, and no PCB process limit was
relaxed. This fit check does not block unrelated routing work.

Local evidence: `.konnect-scratch/usb15-*-result.json`,
`usb15-single-drc.json`, `usb15-coupon.png`, `verify-routes15-pass.mjs`.
