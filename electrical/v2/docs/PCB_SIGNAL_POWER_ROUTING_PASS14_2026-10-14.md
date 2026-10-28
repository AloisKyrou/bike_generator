# Signal and power routing, pass 14

Work started 13 October, checked 14 October 2026. Partial routing only:
**not released for fabrication or energization; no 400 W qualification.**

## Saved outcome

- 149 components, 1029 trace segments, 131 vias, no copper zones yet.
- 104 -> 32 unconnected DRC items. These are connectivity items, not a
  percentage of engineering completion.
- 194 retained new segments: 120 front, 74 back. Twelve earlier segments
  replaced deliberately; the other 835 baseline segments preserved exactly.
- Final saved-file DRC: 131 findings, comprising four existing J27
  hole-clearance errors and 127 silkscreen findings (2 edge, 69 overlap,
  56 over copper). Four intentional mounting-hole parity findings.
- Newly introduced via clearance, courtyard and output-taper clearance
  findings corrected. No new copper/courtyard/mask findings remain.
- Schematic synchronization: `noop`; netclasses unchanged.
- No schematic values, architecture, BOM, firmware or V1 changes.

## Placement changes

| Reference | Final X/Y mm | Rotation | Reason |
|---|---|---|---|
| J5 | 40/24.8 | 90 | Bring configurable GPIO header near ESP |
| R7 | 40/28.5 | 90 | Align with header signal |
| R8 | 42.54/28.5 | 90 | Align with header signal |
| R9 | 45.08/28.5 | 90 | Align with header signal |
| R10 | 47.62/28.5 | 90 | Align with header signal |
| R34 | 50.8/28.5 | 0 | Preserve RV2 courtyard clearance |
| H1 | 57/24 | 0 | Clear J5 courtyard; hole pattern still provisional |
| R70 | 45.5/70 | 0 | INT pull-up beside service header and 3V3 feed |

All other placements unchanged. Component values and footprint selections
unchanged. J27, U2, Q20 and Q22 were not moved by this pass.

## Connections completed or advanced

- Local ESP ground lattice and GPIO2 pull-up; all five configurable GPIO
  feeds now reach J5, with much shorter paths than the former lower header.
- J27 paired USB contact connections and connections to U8 inputs. The
  U8-to-series-resistor data path is still unfinished.
- CE service connection and R70 3V3/INT pull-up connections.
- Local logic, battery connector, LED and service-header ground branches.
- Output capacitor banks, output shunt force connections and JP31/J31
  positive path. The shunt's separate sense takeoffs were preserved.
- SW1/SW2 power connections between MOSFETs and L3; input capacitor-bank
  interconnections and local switching ground connections.

Bottom copper is used for grouped GPIO escapes/crossings, the CE crossing,
local ground stitches, the low-side switching connections and the output
path from the through-hole capacitor bank to JP31. The last path uses
existing through-hole pads, not an unqualified signal-via power transfer.
Thin bootstrap/SW sensing routes are not counted as power conductors.

## Deliberate replacements

Nine old J5 segments removed: five resistor-to-header signal connections and
four ground-column segments. Two old R70/INT segments and the obsolete INT
via were removed after relocating R70. One local GND segment at X=75 was
replaced by a small offset to make room for CE. A trial CE via was also
replaced after native DRC detected insufficient via clearance.

Via deletions used exact Konnect selection followed by KiCad's native
Delete command; no native CAD text edits. Final inventory: 131 vias versus
112 at entry (20 new retained, one old removed).

## Remaining connectivity

Final 32 items: 20 GND and 12 non-GND. Principal unfinished work:

- BUS_PROTECTED: F1, D1 and JP30 positive feed.
- BQ_IN: JP30 to input capacitor bank and R1 force connection.
- BQ_VAC: shunt/threshold branch, U9 supply and power capacitor bank.
- USB_DP/DM: U8 outputs, J21 test header and series resistors.
- STATUS_LED: ESP to R35.
- Ground islands: C4/U3, logic-to-converter reference, input/rectifier and
  output power returns, capacitor banks and driver/power ground connection.

Do not merely pour GND and count the resulting connections. Review return
current paths, switching loops, analog references and antenna keepout.
The long lower-input-to-upper-bank feed requires a placement/corridor review.

## Power copper limitation

Wide 3/5/8 mm sections have short 1.75/1.8 mm MOSFET-pad approaches. They are
**not yet accepted at full current**. With the existing IPC-2221 screening
helper, 56 um copper, 40 C ambient and 10 A, uniform 1.75/1.8 mm traces imply
approximately 47/45 C rise, exceeding the provisional 20 C rise budget.
For a 5 mm length the corresponding resistance loss is about 0.10 W.
Actual approaches are shorter and benefit from spreading, but this is not
proof of temperature or current capacity. Refine tapers/local copper and
returns, and qualify experimentally before freezing a current rating.
The wider tracks alone do not demonstrate 10 A continuous or 400 W.

## Evidence

Local-only records in `.konnect-scratch/`:

- `finish14-before-result.json`, `finish14-finalfix-result.json`.
- `finish14-final-drc.json`: completed saved-file CLI check.
- `verify-finish14-pass.mjs`: PASS, including exact preservation of 835
  tracks, eight expected placement changes, class equality and sync noop.
- `finish14-*-result.json`: bounded apply/readback batches.
- `finish14-final.svg`, `finish14-power-detail.svg`: review exports.

The route screening helper is only a preflight aid. It does not replace
native DRC, via-to-via checks, power-net clearance or courtyard checks.
USB footprint study authorization received 14 October; see the separate
USB4105 study report. No error exclusion was added.
