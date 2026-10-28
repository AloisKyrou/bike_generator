# Uprated Passive Models

2026-10-08, prototype candidates only. No PCB was changed.

## Input Shunt

Bourns CSS4J-4026K-5L00F uses the same four-terminal land pattern as the
previous 2 mOhm member. The archived `../../current-shunt/bourns-css4j-4026.pdf`
pages 1-2 were visually inspected: 5 mOhm is listed at 4 W at 70 C terminal;
the distributor's 3 W description is conservatively retained for budgeting.
Its maximum height is 2.63 mm (2 mOhm member 2.93 mm), with the same
10.06 x 6.60 mm nominal body and recommended lands.

The stock `Resistor_SMD:R_Shunt_Isabellenhuette_BVR4026` was queried, placed
and rendered on a disposable board. Force lands are 2.55 x 5.60 mm, sense
lands 2.55 x 0.90 mm, column centers +/-4.025 mm. These match the Bourns
land geometry. The stock name is a compatible geometry, not the purchased
manufacturer. Pin convention remains force 4 upstream / 1 downstream and
Kelvin 3 upstream / 2 downstream. Bourns itself does not number these lands.

## Bulk Capacitors

TDK B40950A0566M000: archived `tdk-b40950.pdf`, October 2025, pages 4 and 9.
56 uF / 80 V, 10 mm diameter, 10.2 mm nominal height, 10.3 mm square base.
The manufacturer's recommended pads are 4.1 x 2.0 mm, centered at +/-4.35 mm:
4.6 mm inner gap and 12.8 mm outer span.

Standard `Capacitor_SMD:CP_Elec_10x10.5` has 4.4 x 2.5 mm lands at +/-4.2 mm:
the same 12.8 mm outer span but a 4.0 mm gap and larger wettable area. It is
an explicitly provisional larger-land candidate, NOT an exact manufacturer
recommendation. The manufacturer permits other layouts after mounting
evaluation. Mounting, stencil/paste volume and solder-joint inspection are
required before release. Pin 1 is positive, with plus marking and chamfer;
pin 2 is negative. Actual pads and outline were inspected after placement.

## Service Power Terminals and USB Diode

J31/JP30/JP31 use Phoenix Contact 1711725 and standard
`TerminalBlock_Phoenix:TerminalBlock_Phoenix_MKDS-3-2-5.08_1x02_P5.08mm_Horizontal`.
Official dimensions and the existing family evidence were checked: two physical
leads, 5.08 mm pitch, 10.16 x 11.2 mm body, 1.3 mm PCB holes. Konnect scratch
readback confirms pads 1/2, 2.6 mm lands and 1.3 mm drills, matching top/component
view. Fab body, silk and courtyard were visually inspected in the native export.
JP30/JP31 use open-jumper schematic symbols but this terminal footprint: a rated
removable wire loop, never a small 2.54 mm jumper. IEC/UL/CSA current ratings and
wire/torque/thermal conditions differ; footprint acceptance is not current proof.

D20 is Vishay SS1H10-E3/61T, archived `components/beetle-power-v2/ss1h9-ss1h10.pdf`
(13 November 2025), package drawing page 4. DO-214AC/SMA, cathode marked by band;
body 4.5 x 2.79 mm maximum, lead span 5.28 mm maximum. Stock Device:D has pin
1=K, 2=A; `Diode_SMD:D_SMA_Handsoldering` has pad 1 at the cathode marking.
The exact footprint pads, fabrication body, silk band and courtyard were queried,
scratch-placed and inspected in `models/terminal-pads.png`. Larger hand-solder
lands are a deliberate standard-library choice. Forward drop, hot leakage and
USB-to-cell transitions still require physical tests.

## Saved Model Evidence

`.konnect-scratch/v2-adaptive-2026-10-08/`: `clamp-info-result.json`,
`cap-footprint-result.json`, `model-final-result.json`; source drawings
`css4j.png`, `css4j-dimensions.png`, `tdk-package.png`; native KiCad export
`models/all.svg` and inspected `models/final-pads-full.png`.

Thermal, current-sharing, inrush, control-loop and generator-overvoltage
qualification remain open. Neither pad acceptance nor the nameplate ratings
prove a 400 W converter or safe maximum simultaneous knob settings.
