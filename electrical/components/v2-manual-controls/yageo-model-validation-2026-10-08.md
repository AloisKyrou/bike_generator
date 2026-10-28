# Yageo Guard Resistor Model Acceptance

8 October 2026, completion pass. Exact manufacturer spec sheets, generated
10/08/2026, one page each, are archived in this directory:

| MPN / intended reference | Resistance / tolerance / TCR | SHA-256 |
|---|---|---|
| RC0805FR-075K49L / R61 | 5.49k / 1% / 100 ppm/C | FD52E8D37026CFC79366AAC8212791FDEC88F512585A19AEEB94CC809B4669F1 |
| RT0805BRD07249KL / R66 | 249k / 0.1% / 25 ppm/C | 7219D65DD19C1D4235F89FE6B158B96CC0A3D30F011C5D29A34D24E7CACD538B |
| RT0805BRD077K5L / R67 | 7.50k / 0.1% / 25 ppm/C | 3A8A48825A55AE917BA0A5741924867D32E84976305DD0B65407B1C9F73943FE |

Official source pattern:
`https://yageogroup.com/component-documentation/download/specsheet/<MPN>`.
All three specify 2.0 +/-0.1 by 1.25 +/-0.1 mm body, 0.5 +/-0.1 mm height,
0.35 +/-0.2 mm end metallization, 0.125 W at 70 C and 150 V maximum working
voltage. Power dissipation and temperature derating still constrain allowable
voltage; 150 V is not permission to exceed 0.125 W.

Two interchangeable, unnumbered physical terminations; no polarity or keyed
orientation. Project numbering is arbitrary and consistent with the stock model:

| Physical termination | Device:R symbol | Footprint pad / local coordinate |
|---|---|---|
| First end, component-side view | 1 passive | 1 at(-1.0,0) mm |
| Opposite end | 2 passive | 2 at(+1.0,0) mm |

Selected stock footprint:
`Resistor_SMD:R_0805_2012Metric_Pad1.20x1.40mm_HandSolder`.
Two roundrect SMD pads, 1.20 x 1.40 mm, front copper/paste/mask, no drill.
Nominal 2.0 x 1.25 mm fab outline matches the package. Silk does not overlap
the pad openings; courtyard encloses the body and pads. These are KiCad's
hand-solder lands, not claimed manufacturer-specified stencil geometry.
Two physical terminals = two symbol pins = two pads; no duplicate or mechanical
pad. No mirror ambiguity for this nonpolar part.

Konnect symbol/footprint query, disposable placement and independent instance
pad/pin readback passed. Native KiCad SVG copper/fab/silk/courtyard and rendered
symbol were inspected under `.konnect-scratch/v2-completion-2026-10-08/models/`.
No custom model or real PCB change. R66 moves from the prior standard 0805 lands
to enlarged hand-solder 0805 lands; R61/R67 already used these hand-solder lands.

Electrical screening: at 55 V across the complete feedback divider, the 249k
upper resistor dissipates less than 55^2/249000 =12.2 mW, below 125 mW nominal.
The low-leg guard operates at the regulated feedback voltage in normal service;
its worst faults and temperature drift remain covered by system qualification,
not by model acceptance. The current guard is a signal-programming resistor,
not a power shunt. Exact part selection does not make BQ register-overridable
limits independent safety protection.
