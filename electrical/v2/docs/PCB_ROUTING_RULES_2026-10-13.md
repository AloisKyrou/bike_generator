# V2 routing rules and first routing checkpoint

Latest routing state: [Input/return pass 15](PCB_INPUT_RETURN_ROUTING_PASS15_2026-10-14.md).
The first-pass counts below are historical; netclass rules still apply.

## Scope and authority

User now authorizes deliberate incremental routing, superseding the earlier
placement-only split. Reference commit before routing: `1151aa0`.
One repository may hold several independent KiCad projects. V1 and its old
netclasses are preserved; nine unused legacy classes and their twenty obsolete
assignments were removed from V2 through native Board Setup.

Thirteen V2 classes plus Default remain. All 125 nonempty board nets have an
explicit V2 assignment, recorded in `PCB_NET_ASSIGNMENTS_2026-10-13.csv`.
No active net relies on Default. Native settings were verified after closing
and reopening pcbnew: Save Board alone did not persist the GUI class cleanup
until the standalone editor closed normally.

## Working rules

Values are mm. Widths are routing defaults, NOT enforced minimum power widths
or qualified current ratings. Via diameter/drill applies to individual vias;
it does not make one via suitable for the main power current.

| Class | Width | Clearance | Via/drill | Use |
|---|---:|---:|---:|---|
| V2_SIGNAL | 0.25 | 0.20 | 0.60/0.30 | Logic and unused pins |
| V2_ANALOG | 0.25 | 0.20 | 0.60/0.30 | Quiet control signals |
| V2_KELVIN_HV | 0.25 | 0.20 | 0.60/0.30 | Dedicated sense branches |
| V2_GATE | 0.60 | 0.20 | 0.80/0.40 | Gate/driver paths, short pad escapes |
| V2_BOOTSTRAP | 0.60 | 0.20 | 0.80/0.40 | Bootstrap paths |
| V2_LV_POWER | 0.75 | 0.20 | 0.80/0.40 | Logic supply rails |
| V2_GND_RETURN | 0.75 | 0.20 | 0.80/0.40 | Local returns, not power-ground sizing |
| V2_INPUT_POWER | 8.00 | 0.50 | 1.20/0.60 | Input power trunks |
| V2_OUTPUT_POWER | 5.00 | 0.50 | 1.20/0.60 | Output power trunks |
| V2_VAC_MIXED | 8.00 | 0.20 | 1.20/0.60 | VAC power plus small IC taps |
| V2_SWITCH_MIXED | 10.00 | 0.20 | 1.20/0.60 | Switching power plus driver taps |
| V2_USB_PENDING | 0.25 | 0.20 | 0.60/0.30 | Placeholder, impedance not qualified |
| V2_RELAY_DRIVE | 0.40 | 0.20 | 0.60/0.30 | Relay coil/control |

Global existing minimums remain: clearance/track 0.20, via diameter 0.60,
drill 0.30, hole clearance 0.25. No DRC exclusions added or limits relaxed.
Palette: 0.20/0.25/0.40/0.60/0.75/1/2/3/5/8/10mm, with netclass sentinel;
vias 0.60/0.30, 0.80/0.40 and 1.20/0.60.

VAC and switching nets contain both high-current paths and low-current
controller connections. The class cannot distinguish those branches. Review
each neck explicitly; do not route an 8mm trunk into a QFN sense pin or assume
a 0.25mm sense escape can carry the converter current. Seek >=0.50mm clearance
outside necessary fine-pitch neighborhoods. That additional target is not yet
encoded in location-specific custom rules and is not certified isolation.

## Sizing basis and limits

Working stackup: two layers, nominal 70um copper per side, 1.6mm FR4, ENIG.
`calculations/pcb-copper-screen.mjs` implements the legacy IPC-2221 external
trace screening equation reproduced in TI SNVA766. It includes a 56um copper
sensitivity case, not a guaranteed fabrication minimum. Ambient assumption
40C, allowed screening rise 20C, DC-drop budget 0.10V; resistance at 60C.

| Screen only | Length | Rise at 70/56um | Drop at 70/56um |
|---|---:|---:|---:|
| 15A / 8mm input | 60mm | 6.73/9.73C | 32.1/40.1mV |
| 10A / 5mm output | 50mm | 5.81/8.40C | 28.5/35.6mV |
| 18A / 10mm switching | 25mm | 7.06/10.19C | 12.8/16.0mV |
| 1A / 0.75mm logic | 60mm | 0.71/1.02C | 22.8/28.5mV |

These are assumed routing screens, not new operating-current ratings. They
exclude terminal necks, pads, vias, shunt heating, switching RMS/ripple,
enclosure temperature and adjacent components. Existing input tracks are
still only 3/5mm; the new defaults DO NOT resize or qualify them. Power-ground
geometry, via arrays and every actual trunk remain to be engineered.

Sources consulted 13 October 2026:

- [TI SNVA766](https://www.ti.com/lit/an/snva766/snva766.pdf): screening equation.
- [BQ25756 datasheet](https://www.ti.com/lit/ds/symlink/bq25756.pdf), layout
  section: compact switching loops, local ceramics, Kelvin sensing, quiet
  analog returns, gate paths about 20mil or wider outside short pin escapes.
- [JLCPCB capabilities](https://jlcpcb.com/capabilities/pcb-capabilities/):
  process screen for two-layer 2oz geometry. Not a fabrication order or a
  supplier-approved DFM report. USB pair geometry remains pending; the current
  palette is not an impedance calculation.

## First bounded routing pass

No components moved; schematic, BOM and 17 inherited tracks unchanged.
Added 22 segments: 20 on F.Cu, 2 on B.Cu; 2 ground vias. Total 39 segments.

- U9.13/14 to C70 and the C71/C72/R82/R83 filter nodes are routed at 0.25mm.
  The resistor-to-shunt force/sense takeoffs remain unrouted and must remain
  dedicated Kelvin branches, not join along a high-current trunk.
- C71.2/C72.2 share a 0.60mm local return. Two 0.80/0.40 vias at
  (83.20,70.5375) and (85.25,64.20) connect that return underneath to the U9
  ground-pin/EP connection. This is a quiet return, not a power-ground bridge.
- Bottom justification: the top-side ground path would cross the paired sense
  escape or wrap around the filters. A short underside return keeps the
  filter group intact. No sense signal itself changes layer. Reassess together
  with the eventual ground plane; do not drive power return through this spur.
- No thermal vias were added in the QFN solder pad. EP thermal/assembly design
  remains separate and unfinished. No zones added.

Saved-file DRC: same 118 findings (4 known J27 hole clearances and 114 silk
warnings), 317 unconnected items versus 326 before, 4 intentional mounting-hole
parity findings. No added shorts, copper-clearance or courtyard errors. Copper
render inspected. This is a checked partial route, NOT a fabrication release.

## Next bounded work

1. Revisit the F1/JP30-to-input-bank placement before committing long power
   trunks. Current provisional placement does not justify a long bottom detour.
2. Engineer REGN/DRV_SUP, bootstrap and gate loops together; adjust individual
   passives where useful before accepting a layer change. Observe the bottom
   power-FET/top-support constraint and its loop-inductance implications.
3. Complete input/output Kelvin takeoffs and quiet-control returns.
4. Resolve power copper, USB geometry, RF keepout, outline/heatsink fit and
   known J27 hole-clearance issue. Finish silk after placement stabilizes.

Review artifacts remain local under `.konnect-scratch/`: routing-local-drc.json,
routing-local.svg and routing-local-detail.png, plus official MCP readbacks.
