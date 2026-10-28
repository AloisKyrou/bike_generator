# External converter PCB: migration and direct-digipot pass

Historical intermediate checkpoint. Its unfinished-routing counts are
superseded by [routing completion](PCB_ROUTING_COMPLETE_2026-10-14.md).

## Current state

This supersedes the initial PCB reuse proposal and relay-placement checkpoint.
The active schematic is the direct MCP42100 variant: 81 parts, 84 nets, nine
sheets. See [schematic evidence](DIRECT_DIGIPOT_CHECKPOINT_2026-10-14.md).
There is no relay, manual-pot selector, generator-powered auxiliary supply or
integrated BQ converter. USB and optional protected 1S power are retained.

| Saved PCB item | Result |
|---|---|
| Provisional outline | 80 x 110 mm, two copper layers |
| Footprints | 85: 81 schematic parts + H1-H4 |
| Tracks | 268: 249 F.Cu, 19 B.Cu |
| Vias | 37, from native GenCAD export |
| Original V1 track geometries retained | 126 of 429, including lower power/sense routes |
| Unconnected items | 90; routing is incomplete |
| Schematic synchronization | No changes, no conflicts; four board-only holes |

V1 hashes match the complete source manifest. V2 and firmware were outside this
pass. No fabrication files, ordering or energization approval were issued.

## Changes

- Preserved generator input, rectifier, fuse, TVS, input shunt and INA anchors.
- Removed the old auxiliary supply and Beetle-related copper/parts that no
  longer match the new architecture. No blanket deletion of retained routing.
- Placed module ESP32, USB/ESD, charger, LDO, cell connector and generic GPIO.
- Added output terminals J40/J41, R100 Kelvin shunt and U10 INA238 with filters.
- Removed K1-K3, Q22, R19/R87-R90, D23-D25, J42/J43 after the latest decision.
- Routed all six independent CC/CV terminals directly on F.Cu. No A/W straps.
- Routed SPI, local digipot supply, output force/sense/filter paths, and part
  of the ESP reset, decoupling, LDO and optional-cell power path.
- Refreshed U2/J27/Q20 from their libraries using native KiCad; the earlier
  library mismatches no longer appear in DRC.
- Extended the bottom GND zone with a notch under the ESP antenna region.

The antenna/notch, cell connector overhang and final enclosure clearances still
need mechanical/RF review. D2 is still in its inherited top-side placement;
the final heatsink-side arrangement is not established by this layout pass.

## Bottom-layer decisions

Top routing is preferred, but these local transitions avoid crossings:

- R100 low Kelvin sense crosses beneath the other Kelvin path/filter.
- U10 VBUS sense crosses beneath the filter without carrying load current.
- The cell-positive link crosses beneath the USB/battery selection and LDO
  enable traces. Two vias, short bottom run; no main generator current here.
- SCK and MOSI use short bottom escapes near U3 to cross the CS/pull-up region.
  CS and the long SPI runs remain on top. Four SPI vias total.
- Local GND vias connect decoupling/IC returns to the bottom plane; they are
  not a substitute for checking the eventual power return geometry.

No main load current was intentionally assigned to the small signal vias.
Ground-plane necks and connector thermal spokes still require current review.

## Rules and checks

Classes distinguish signal, USB, logic power, analog, sense and output power.
SPI and all six CC/CV nets were re-assigned after their schematic names changed.
The inherited power geometry and 5 mm output traces are layout starting points,
not validated continuous-current ratings. USB 0.2 mm routing is provisional,
not a controlled-impedance claim. Fabricator, stackup and copper weight remain
release gates. Historical inactive AUX/relay class patterns remain to clean up;
they do not mean those circuits still exist.

Final saved-file DRC after native zone fill and save:

| Finding | Count | Meaning |
|---|---:|---|
| Copper edge clearance | 5 | Known internal JAE footprint slot/pad geometry |
| Dangling track ends | 4 | Retained input sense/supply bus tails to finish/trim |
| Silkscreen edge clearance | 11 | Presentation cleanup still required |
| Silkscreen overlaps | 16 | Presentation cleanup still required |
| Silkscreen over copper | 20 | Presentation cleanup still required |
| Unconnected items | 90 | Not included in the 56 violations above |

No shorts, track/pad clearance, courtyard overlaps or library mismatch findings
remain in that report. Existing ignored checks were not changed; this is not an
unqualified clean-DRC or fabrication-ready assertion. ERC is zero and sync is
noop. Exact source: saved refilled board, not a proposed placement simulation.

The JAE DX07S016JA1R1500 remains provisional: its internal oval NPTH geometry
cannot be fixed by moving the connector. The earlier small-slot fabrication
gate still applies. No relaxed rule or manufacturer waiver was introduced.

## Next work

1. Finish USB power/data/CC/ESD routing, including sensible ESD flow-through
   placement and the optional USB test header stub assessment.
2. Complete charger programming/LED and power distribution to all logic blocks.
3. Complete I2C distribution, GPIO/header/LED and reset/boot connections.
4. Reassess ground return capacity, rectifier/heatsink mechanics and antenna
   keepout, then clean silkscreen and obsolete project-class patterns.
5. Refill/save, fresh ERC/DRC/sync and visual review before any release decision.

Do not infer safety from a powered-off digipot: all analog terminals must obey
its actual supply rails. Configure and power logic before enabling a qualified
external converter, and stop it before logic loss. Receiver protection belongs
to the converter's independently bounded hardware, not this SPI interface.

## Evidence

Local scratch evidence, not manufacturing files:
`ext-direct-current.xml`, `ext-pass-final-drc.json`, `ext-sync-direct-result.json`,
`ext-final-read-result.json`, `ext-direct-layout.cad`, `ext-layout-pass1.svg/png`.
The PCB was updated through native netlist import because Konnect deliberately
refused routed-net renames. All part deletions/routes were through Konnect;
no native CAD source was rewritten with text tools. Readback and fresh sync
verified the resulting identities, connectivity and preserved mounting holes.
