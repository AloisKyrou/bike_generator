# Logic routing pass 12 - 13 October 2026

## Scope and result

User requested larger autonomous routing sessions. This pass covers several
logic blocks together, without changing the circuit, values, libraries,
netclasses, two-layer stackup or power-stage placement.

- 696 segments and 85 vias; 149 components.
- All 471 pre-existing segments preserved with their UUIDs and geometry.
- 225 segments added: 162 front, 63 back; net increase of 24 vias.
- Unconnected DRC items reduced from 199 to 130. This is a connectivity
  progress count, not a percentage of completed engineering.
- Only C50 and R51 moved. All other placements preserved.
- Saved schematic-to-PCB synchronization remains `noop`.

## Work completed

- D20/Q20 source handover connections, SYS_BAT regulator input and REG_EN.
- U7 output/C47 and 3V3 distribution to the ESP decoupling, reset/strap
  pull-ups, I2C pull-ups, existing CV control supply, J3 and J32.
- BAT_1S connections among Q20, U6, C45 and J26.
- Charger TP_VCC feed, programming resistor and JP20 link; local returns.
- Charge-indicator D21 connections and its supply resistor.
- USB-rail distribution between C50/U8, D20/Q20, R51 and charger feed.
  The USB connector itself is NOT yet connected to this distribution.
- ESP MCU_EN network and BOOT_N pull-up/service-header connections.
- I2C module-to-pull-up connections only. J3/BQ bus distribution is open.
- Five J5 series-resistor-to-header connections and local ground column.
  These are not yet connected back to their ESP GPIOs.
- D22 resistor/remote-indicator-header connections; STATUS_LED feed remains
  open, as do final ground connections between some local islands.

DRC confirms no remaining opens on BAT_1S, SYS_BAT, REG_EN, TP_VCC,
U6-PROG, JP20-B, MCU_EN, BOOT_N, the D21 nets, D22-A or the five resistor-side
J5 nets. Earlier completed CV/SPI/BQ setting nets remain connected.

## Placement changes

| Part | Previous position / angle | Current position / angle | Reason |
|---|---|---|---|
| C50 | (26.5,45) / 0 | (25.9,46.5) / 90 | Preserve a short U8 supply connection while separating its ground pad from the 3V3 transition; clear J7 courtyard. |
| R51 | (36,58.5) / 0 | (35.5,56.75) / 0 | Separate the USB pull-down from the CV supply transition without moving Q20 or the CV ICs. |

Coordinates in mm. Pad positions read back after moves. Footprints, values,
layers and schematic linkage unchanged. No new courtyard or library mismatch
finding. Silkscreen is not yet cleaned up.

## Bottom-side routes and vias

- 3V3 uses a bottom trunk from C47 past the USB circuitry to C30/C31 and
  the ESP, plus branches toward the pull-ups and CV supply. This avoids
  crossing the USB/source-handover paths on top or taking a large perimeter
  detour. Width is 0.75 mm on the trunk, 0.6/0.4 mm on branches/short pad
  approaches, within the existing logic-current screening assumptions.
- Local regulator/charger/capacitor ground returns use bottom links with
  0.8/0.4 mm vias. They are NOT the final converter power return or a completed
  ground plane. ESP local ground islands still require the planned plane.
- The D21 cathode uses one 0.6/0.3 mm transition and a bottom route to its
  through-hole pad, avoiding the battery rail and charger ground on top.
- SDA/SCL use four 0.6/0.3 mm vias between ESP south pins and R6/R4, beneath
  the service/pull-up area and clear of the previously routed SPI bundle.
  Return-plane continuity and full bus routing remain to be reviewed.
- One short 0.6/0.3 mm ground transition joins ESP ground pads locally.
- J3-to-J32 3V3 uses the header pads themselves for the bottom transition.
- All new bottom routes are low-voltage logic/control or local returns.
  No new bottom power-stage trunk, zone or rated high-current via was added.

The 24 retained new vias comprise 18 power/ground vias at 0.8/0.4 mm and
6 signal/local-ground vias at 0.6/0.3 mm. No new via is intentionally in an
assembly solder pad. Final assembly/plane/EMI review is still required.

## Verification

Saved-file KiCad CLI DRC, after the last native save:

| Finding | Count |
|---|---:|
| Known J27 hole clearance | 4 |
| Silk edge clearance | 2 |
| Silk overlap | 69 |
| Silk over copper | 58 |
| Total non-connectivity findings | 133 |
| Unconnected items | 130 |
| Intentional board-only mounting-hole parity | 4 |

No copper short, track crossing, copper-clearance, courtyard, mask-bridge,
library-mismatch or dangling-via findings remain. The four J27 errors are
still real unresolved footprint/DFM work, not suppressed. Four additional
silkscreen warnings compared with pass 11 remain for the later text cleanup.

`verify-logic12-pass.mjs` passes: all previous tracks preserved, 147 unchanged
placements, two explicitly allowed passive moves, 149 parts, unchanged
netclasses, earlier completed nets preserved, schematic sync `noop`.
Combined front/back copper render inspected for local routing geometry.
This does not validate assembled operation, USB integrity, analog noise,
thermal performance or power ratings.

## Evidence and tool notes

Local-only evidence under `.konnect-scratch/`:

- `logic12-before-result.json`: live baseline/pads.
- `logic12-route-result.json`, `logic12-fix-result.json`,
  `logic12-bus-result.json`, `logic12-finish-result.json`: applied batches
  and readback. Intermediate DRCs captured and corrected before acceptance.
- `logic12-saved-result.json`: final native-save readback.
- `logic12-final-drc.json`, `logic12-detail.png`, `logic12-final.svg`.
- `verify-logic12-pass.mjs`: preservation/connectivity checks.

All CAD mutations used Konnect or the native KiCad UI. For four obsolete vias,
Konnect exact-UUID selection was followed by the native Edit > Delete command
through its observed Windows menu ID. Keyboard attempts had no effect; this
was detected by saved readback before continuing. All four UUIDs are proven
absent in the saved board. No CAD text editing or direct IPC client was used.
For future via removal, select exact IDs with Konnect, use the native menu,
save and prove absence plus preservation. Do not assume a sent key applied.

## Next work, no user decision required

1. Complete I2C distribution to J3/R68/R69 and the service header J32,
   preserving the existing BQ-side series resistors.
2. Complete USB connector CC/VBUS/GND and data routing, checking pair
   geometry and return continuity; impedance remains unqualified.
3. Route the external GPIO and STATUS_LED feeds, spare-pot connector and
   remaining supply taps/returns.
4. Complete power trunks and Kelvin/quiet-return review, then ground planes,
   stitching and thermal/assembly review.
5. Resolve J27 DFM, silkscreen, outline/mechanics and all remaining DRC/ERC
   gates before any fabrication package or power-up approval.

Board remains partially routed, NOT ready for fabrication or energization.
