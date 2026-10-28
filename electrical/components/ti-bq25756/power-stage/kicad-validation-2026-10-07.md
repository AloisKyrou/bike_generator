# Power-stage study models, 7 October 2026

Status: electrically mapped standard-library candidates, not released for PCB
assembly or full-envelope operation. Source URLs and hashes are in [README](README.md).
All scratch placements and library queries used official Konnect MCP; native
KiCad SVG exports were visually inspected. No real board was modified.

## SIR680LDP-T1-RE3

Vishay 77478 Rev C identifies physical source leads 1/2/3, gate 4 and drain
5/6/7/8 plus the exposed drain metal. The top and underside views were reconciled.
Standard `Transistor_FET:Q_NMOS_SSSGD_AvalancheRated` represents all three source
leads explicitly at one stacked endpoint, gate 4 and the common drain as pin 5.
`Package_SO:PowerPAK_SO-8_Single` deliberately has nine pad shapes with numbers
1,2,3,4,5,5,5,5,5: the four physical drain contacts and center copper are all net 5.
This is intentional, not four missing drain pins. See [all-lead map](sir680ldp-pin-map.csv).

The footprint cites Vishay 71655 and 72599. Its source/gate lands are 1.27 x
0.61 mm at x=-2.67 mm, y=-1.905/-0.635/0.635/1.905 mm (1.27 mm pitch).
Common drain copper is 3.81 x 3.91 mm at x=0.69 mm; four drain extensions are
1.02 x 0.61 mm at x=2.795 mm. Overall land extent 6.61 x 4.42 mm agrees with
the manufacturer's recommended minimum pattern; source-to-drain gap is 0.82 mm.
Courtyard is +/-3.55 x +/-2.75 mm. Pin 1 has a top-left silkscreen triangle.
Mask and paste are on all nine lands; no holes. Full drain paste coverage,
thermal copper and stencil require assembly review, not assumed acceptable.

Scratch Q1 at (120,100) was read back: all nine pad numbers, transformed
positions, dimensions and layers match the library. The four real-stage
instances must all connect stacked source pins 1/2/3 in the XML export.

## IHLP6767GZER100M01

Vishay 34000 (22 April 2025), 10 uH, +/-20%, DCR 12 mOhm maximum. The native
`Device:L` symbol has two nonpolarized pins. Standard footprint
`Inductor_SMD:L_Vishay_IHLP-6767` cites the related -11 series, but its dimensions
were compared to the selected -01 document: body 17.15 x 17.15 mm, 7 mm maximum
height. Two 2.875 x 12.45 mm lands at x=+/-7.6425 mm provide outer span 18.16 mm
and inner gap 12.41 mm, matching the -01 recommended pad layout. No drills;
both lands have copper, mask and paste. Native scratch L1 at (150,100) preserves
both pad numbers/positions/dimensions/layers. Nonpolarized physical terminals
map to schematic 1/2 respectively.

The 16.5 A figure is typical 40 C rise and 25 A is typical 20% inductance loss,
not approved project ratings. Ripple, saturation, board temperature and DC loss
must be checked. The selected footprint does not confer a 15 A operating rating.

## V1FM10-M3/H

Vishay 87557 Rev 13 May 2020: 100 V, 1 A Schottky, SMF/DO-219AB. Color band is
cathode. Standard `Device:D_Schottky` maps pin 1 to cathode, pin 2 to anode;
`Diode_SMD:D_SMF` places cathode at x=-1.45 and anode at x=1.45 mm, each land
1.3 x 1.4 mm. These agree with the PDF page 4 recommended layout (1.6 mm gap).
Fab and silk mark the cathode end, courtyard +/-2.35 x +/-1.15 mm. No drills,
both pads have copper/mask/paste. Scratch D1 at (120,120) readback preserves
both numbers, locations, dimensions and layers. Bootstrap anodes go to REGN;
cathodes go to BTST1/2, never the reverse.

## 80SXV56M Bulk Capacitor

Panasonic SXV catalog (2 September 2025) identifies the exact 80SXV56M as
56 uF, 80 V, F12, 10 mm diameter and 12.6 mm height. Do not confuse the MX
suffix, which has a different package. The October 2025 mounting document
gives F12 lands with 4.3 mm inner gap, 13.1 mm outer span and 1.9 mm width.
Standard `Capacitor_SMD:CP_Elec_10x12.6` explicitly names Panasonic F12 and
matches: two 4.4 x 1.9 mm lands centered +/-4.35 mm, positive pad 1 on the
chamfer/plus-marked side, negative pad 2 opposite. `Device:C_Polarized` maps
positive to 1, negative to 2. Both pads have copper/mask/paste; no drills.
The stepped courtyard extends +/-6.8 mm over terminals and +/-5.4 mm around
the body. Scratch C1 at (150,130) readback and native SVG visually confirm
pad mapping, body and polarity markings. This is a provisional EVM reference
part with zero stock at the checked distributors, not the final accessible BOM.

## Evidence and Limits

Scratch project and SVG/PNG evidence:
`.konnect-scratch/v2-2026-10-07/bq-model-validation/`, plus `power-models.png`
in the parent scratch directory. Comparison script `validate-power-models.cjs`
passed 9 FET and 2 inductor pad-preservation checks. Full tool readbacks are in
the October 6 scratch log directory. Diode readback was compared directly.

At 4.5 V drive, SIR680 Qg is 40.5 nC typical / 62 nC maximum. Two gates at
250 kHz already imply approximately 20.25/31 mA, or 1.01/1.55 W of REGN loss
at 55 V input before other IC losses. Four-switch operation can be worse.
Direct REGN drive is an EVM-derived bench baseline, NOT approval for 55 V
continuous operation. No abandoned auxiliary supply is restored.
