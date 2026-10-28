# Local 2 oz connector footprints

User explicitly approved enlarging PTH pads only, retaining connector MPNs,
positions, hole centres and drills. Applied to the external variant only.

## USB J27

`BikeGenerator:USB_C_HRO_TYPE-C-31-M-12_2oz`, derived from installed
`Connector_USB:USB_C_Receptacle_HRO_TYPE-C-31-M-12` through KiCad/Konnect.
Exact MPN remains HRO TYPE-C-31-M-12. Four SH pads:

| Pair | Drill / slot mm | Old copper mm | New copper mm | Minimum new ring |
|---|---|---|---|---:|
| Rear | 0.60 x 1.70 | 1.00 x 2.10 | 1.24 x 2.34 | 0.320 mm |
| Front | 0.60 x 1.20 | 1.00 x 1.60 | 1.24 x 1.84 | 0.320 mm |

Ring = half the copper-minus-drill difference on each axis. No signal land,
physical contact alias, NPTH locator, slot, pad number, 3D model or graphical
outline was changed. Placement remains (53.005, 35) mm / -90 degrees / F.Cu.
The 22 pad records comprise 16 contact aliases, four SH lands and two locators.
See the complete component-side pin map and Rev A manufacturer drawing/hash in
[the HRO review](../components/hro-type-c-31-m-12/README.md).

## Battery J26

`BikeGenerator:JST_PH_S2B-PH-K_1x02_2oz`, derived from installed
`Connector_JST:JST_PH_S2B-PH-K_1x02_P2.00mm_Horizontal` through Konnect.
Exact MPN remains S2B-PH-K-S(LF)(SN). Two pads remain at local (0,0) and
(2,0) mm, with 0.75 mm round drills. Copper is now 1.40 x 1.75 mm instead
of 1.20 x 1.75 mm; minimum ring rises from 0.225 to 0.325 mm. Inter-pad
copper gap is 0.60 mm. Pin 1 BAT_1S and pin 2 GND are unchanged.

The original shell/body outlines on F.Fab, F.SilkS and F.CrtYd were copied
and compared independently as geometry sets; no body geometry or 3D model
change. See the [JST drawing and validation](../components/jst-ph-battery-connector/README.md).
The current PH manufacturer layout explicitly uses the connector mounting
surface view (page 1): compare component-side geometry without mirroring.
Its through-hole recommendation is 0.70 +0.10/-0.00 mm; the unchanged nominal
0.75 mm drill lies within that interval, subject to finished-hole tolerances.
The fresh manufacturer PDF is archived separately as
`../components/jst-ph-battery-connector/jst-ph-series-eph-20261015.pdf`; the older
PDF could not render its dimension fonts with the installed PDF tool.
The download is byte-identical to the prior archive, SHA-256
`447624F4F2F7D37C58C1EAA7EE314AD757FE7AFF48F6186491EF6F69FBC00B96`;
the manufacturer web PDF extraction supplied the legible layout note.
Actual mating cable polarity must be checked, not inferred from connector style.

## Readback And Limits

Native library replacement retained all existing signal nets, positions and
routing. Final IPC pad readback and saved-file DRC verify the enlarged geometry;
no library mismatch remains. Geometry screening alone does not prove physical
fit. Check actual connector samples or a 1:1 print before fabrication approval.

A native library-cache trap was observed: Change Footprints initially changed
J27's library ID but retained an older cached pad size. GUI Compare reported
no relevant differences while saved-file DRC reported mismatch. Save/close and
reopen followed by native Update Footprints from Library loaded the correct
pads. Always read actual placed-pad dimensions and run saved-file DRC; a new
library ID or a GUI comparison alone is not sufficient evidence.
