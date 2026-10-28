# Interface routing pass 13 - 13 October 2026

## Scope and result

Continued the user's requested multi-block routing pace. No circuit, value,
footprint, placement, netclass or stackup change. All CAD writes through
Konnect; native CLI used for saved-board verification and copper rendering.

- 847 segments, 112 vias, 149 unchanged component placements.
- 155 new segments: 69 front and 86 back; four old segments deliberately
  replaced, with the other 692 preserved exactly, including UUIDs.
- 27 new vias: 22 at 0.6/0.3 mm and five at 0.8/0.4 mm.
- Unconnected DRC items reduced from 130 to 104. This is connectivity
  progress, not a percentage of completed engineering.
- Saved schematic synchronization is `noop`; netclasses unchanged.

## Connections completed

1. ESP-side I2C pull-up networks to J3 and the input sides of R68/R69.
   The existing BQ-side series-resistor connections remain intact.
2. J32 service SCL, SDA and INT to the existing BQ-side networks.
   J32 CE, final ground and the separate R70 supply tap remain open.
3. J27 USB VBUS to J25/D20 and the existing logic supply; both CC pins to
   their resistors; connector ground, shell and CC resistor local returns.
4. All three spare-pot terminals of U3 to J7.
5. GPIO8 to its R37 pull-up, not yet to the external GPIO header resistor.
6. ESP USB data pins to the input sides of R32/R33 only.

USB data from the connector through U8 to the output sides of R32/R33 and
J21 remains open. This pass does NOT establish functional USB/debugging.
Global ground islands and planes also remain unfinished.

## Deliberate changes to existing tracks

| Existing segment | Replacement purpose |
|---|---|
| CV_FB front, (65.5,44.92) to (65.5,73) | Offset its middle to x64.5 between y53 and y64, retaining both endpoints and continuity. Allows short signal layer changes between CV_FB and the separate BQ_FBG route. |
| GND back, (20,43) to (20,60) | Offset middle to x21.5, leaving space for USB VBUS and CC. Reconnect the pre-existing ground tap at (20,45). |
| GND back, (16,39) to (20,43) | Rejoin through the new upper USB ground via/branch, without an isolated old stub. |
| 3V3 front, (36,40) to (36,50) | Offset to x34.5 to allow three short escapes from the spare-pot pins. Endpoints preserved. |

No BQ_FBG segment was changed or tied to GND. The quiet CV/FBG corridor is
still subject to signal-return/noise review when power copper and planes
are completed; clearance and continuity alone do not qualify it.

## Bottom routes and vias

- I2C distribution uses a grouped bottom passage from the ESP/pull-up area
  to J3, avoiding existing top supply/SPI paths. It returns to top for the
  approach to R68/R69, with short bottom crossings under CV_FB. Seven vias.
- J32 SCL/SDA/INT use bottom routes beneath the AC phase top tracks, clear
  of the through-hole J8 pads. Each returns briefly to top to cross the
  existing bottom FBG route, then rejoins the existing BQ-side routing.
  Six vias. These are not Kelvin sense signals, but coupling and return
  continuity still need review against the final power copper.
- USB VBUS uses two 0.8/0.4 mm vias to combine its connector pad groups
  beneath the connector escape area and reach J25. The logic-current
  trunk is 0.75 mm; short pad approaches are 0.4 mm. No converter power
  bus is connected to USB VBUS.
- USB ground uses three 0.8/0.4 mm vias to join the local return trunk.
  CC1 and CC2 each use two 0.6/0.3 mm vias to avoid top connector/data pads
  and supply paths. These are CC signals, not differential USB data.
- Spare-pot terminals use three 0.6/0.3 mm vias and bottom routes through
  the service-header pad gaps/below them. This avoids cutting through the
  supply and USB protection circuitry on top.
- GPIO8 uses two 0.6/0.3 mm vias for its local pull-up connection across
  the existing top GPIO/SPI escape area.
- Short MCU-side USB escapes stay entirely on top. No impedance claim:
  final pair geometry, complete paths and reference plane remain open.

The new vias are signal/local-supply transitions, not qualified high-current
power transitions. Bottom-side routing must not be treated as a substitute
for a continuous return plane; plane continuity is a later explicit gate.

## Verification

Saved-file native KiCad DRC after all three routing batches:

| Finding | Count |
|---|---:|
| Known J27 hole clearance | 4 |
| Silk edge clearance | 2 |
| Silk overlap | 69 |
| Silk over copper | 58 |
| Total non-connectivity findings | 133 |
| Unconnected items | 104 |
| Intentional board-only mounting-hole parity | 4 |

All non-connectivity counts are unchanged from pass 12. No new copper,
courtyard, mask, library-mismatch or dangling-via finding. The four J27
hole-clearance errors are unresolved, not suppressed or accepted for fab.

`verify-links13-pass.mjs` passes: 692 retained segments identical, exactly
four named replacements, 149 identical placements, unchanged netclasses,
sync `noop`, expected DRC counts and no opens on the newly completed I2C,
BQ service signal, spare-pot, VBUS/CC and MCU-side USB nets. Previously
completed control and logic-power nets remain connected. Combined copper
render inspected around the USB, pot, I2C and service routes.

Local-only evidence in `.konnect-scratch/`:

- `links13-before-result.json`: baseline traces and all component pads.
- `links13-bus-result.json`, `links13-service-usb-result.json`,
  `links13-pot-strap-result.json`: applied batches and final readback.
- `links13-bus-drc.json`, `links13-service-usb-drc.json`,
  `links13-final-drc.json`: 126, 110 and 104 unconnected respectively.
- `links13-final.svg`, `links13-detail.svg`, `links13-detail.png`.
- `verify-links13-pass.mjs`: final preservation checks.

Manual route geometry was screened before each batch against readback pads,
tracks and vias. The helper only constructs explicitly planned Konnect
requests; it is not an autorouter or replacement for native DRC. Via
inventory was read from the saved board because MCP trace queries omit it;
no native CAD file was edited as text.

## Next work

1. Complete USB data routing and check pair/reference geometry; external
   GPIO feeds, GPIO2 pull-up and STATUS_LED remain open.
2. Finish J32 CE and R70 3V3, then remaining local supply/ground islands.
3. Finish power trunks, Kelvin/quiet-return review and ground planes,
   reviewing every new bottom passage against continuous return paths.
4. Resolve J27 footprint DFM, silkscreen, outline/mechanics and remaining
   release gates. No blocking user decision for continued routing.

Partial board only: NOT ready for fabrication or energization. No power,
thermal, USB, analog-noise or assembled-operation qualification implied.
