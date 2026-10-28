# 10 A design screen and fabrication contract

Update 15 October: [return-plane and 2 oz follow-up](REVIEW_2OZ_2026-10-15.md).
Native stackup is now 70 um per face. J27/J26 local pad enlargements resolve
their annulus findings. The bounded JLC geometry screen and numerical return
review are complete; no additional mandatory copper repair was found. The
original screen below remains useful, but the pending geometry items below
are historical where explicitly superseded by that follow-up.

User accepts a10A continuous engineering target for EACH input/output path.
It is not a measured rating, not the external converter rating and not a promise
that both sides can carry10A at every input/output voltage pair.

## Copper Screen

Saved routing readback: positive main paths5mm wide; three generator-phase
paths3mm wide. Longest phase route62.73mm. Rectified input route62.19mm plus
fuse/TVS-side12.17mm and post-shunt14.55mm; output force paths13.76+8.11mm.
Small sensing branches are NOT load-current conductors.

Run `node electrical/external-converter/copper-screen.mjs`. Formula is the
legacy external-conductor IPC-2221 screen reproduced in TI SNVA766 section11,
[manufacturer application note](https://www.ti.com/lit/an/snva766/snva766.pdf).
Inputs:10A steady, external layer,40C ambient,20C desired rise,63mm test trace,
0.10V per-trace drop budget, copper resistance evaluated at60C. Copper56um is
a deliberately assumed-20% sensitivity case, NOT a guaranteed fabrication spec.

| Copper | Width | Screened rise | Drop over63mm | Loss over63mm |
|---|---:|---:|---:|---:|
| 35um / 1oz | 3mm | 42.3C | 0.120V | 1.20W |
| 35um / 1oz | 5mm | 18.2C | 0.072V | 0.72W |
| 56um sensitivity | 3mm | 19.5C | 0.075V | 0.75W |
| 56um sensitivity | 5mm | 8.4C | 0.045V | 0.45W |
| 70um / 2oz | 3mm | 13.5C | 0.060V | 0.60W |
| 70um / 2oz | 5mm | 5.8C | 0.036V | 0.36W |

User confirmed on14October2026: **two layers with2oz copper (about70um)** as
the design basis for further qualification. This is not an accepted manufacturer
contract or an order authorization. Native stackup settings still require
verification against that contract. The1oz/3mm case misses the screening budgets.
Both thickness and etch-width tolerance must be included in final acceptance;
the table varies thickness only. Plane, enclosure and nearby bridge heat are
not modeled. AC rectifier pulsed/RMS currents require separate measurement.

The63mm drop is NOT total board drop: sum actual conductors, fuse, terminals,
shunts and returns. Each2mOhm shunt dissipates0.20W and drops20mV at10A.
The bridge requires a heatsink; semiconductor current ratings assume cooling.
The current GND plane, its necks and thermal spokes still need quantitative
return-path review. Connectivity alone does not establish their ampacity.

## What Is Not Closed

- Manufacturer/stackup/finished-copper contract, especially2oz annular rings
  and mask dams. No reduced rule or exclusion was added.
- J27 shield annulus0.20mm and J26 annulus0.225mm are below JLC2oz0.254mm.
  HRO/INA signal pads have0.20mm nominal gaps; mask expansion matters.
  [JLC capabilities](https://jlcpcb.com/capabilities/pcb-capabilities/).
- Correction 15 October: PCBWay's generic 0.15 mm annulus does not establish
  2 oz compatibility. Its detailed 70 um component rings are 12/10 mil for
  normal/medium processes; via and track/space requirements differ too.
  [PCBWay capabilities](https://www.pcbway.com/capabilities.html).
- F1 remains the inherited20A part. It is NOT a10A limiter. No fuse swap is
  justified solely by the continuous target; clearing-time/I2t coordination,
  source fault current and cable protection remain open.
- F1 cannot protect receiver-battery backfeed faults: external fuse near that
  battery remains mandatory. Reversed J1 can feed the bridge upstream of F1;
  energy-rich DC sources require source-side protection too.

## Bench Plan

Start with current-limited low-energy bench sources, no PC or energy-rich
battery. Verify USB/3V3, charge-disable JP20, polarity and no backfeed first.
Qualify converter A/W/B voltage/current and logic-loss behavior before connecting
the MCP42100. Logic must be initialized before the converter is enabled.

Then test input and output paths separately at1/3/5/7.5/10A, only advancing after
stable measurements. Log ambient, connector/shunt/fuse/bridge/plane temperatures,
end-to-end voltage drops and time to steady state. Check worst AC pulsed case,
actual heatsink and enclosure. Use the lowest permitted temperature/current of
all parts and materials as the stop limit; the20C copper-rise budget is a design
target, not a universal touch-temperature or safety limit. Do not test faults by
shorting a battery or reversing a PC-powered assembly.

This document closes the numerical first screen, NOT thermal/fault qualification.
