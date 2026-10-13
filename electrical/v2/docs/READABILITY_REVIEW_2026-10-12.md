# Sheet-interface review, 12 October 2026

## Approved direction

- Preserve the user's new continuous wiring and component placement.
- Make cross-sheet signal interfaces explicit. USB_DP and USB_DM should have
  bidirectional hierarchical labels, matching USB_INTERFACE and
  MCU_MODULE_PROVISIONAL sheet pins, and two visible root-sheet wires.
- Keep global power symbols for shared rails. Local labels remain appropriate
  where they avoid long crossing routes; they are not hidden sheet interfaces.
- Keep J32's six-pin service-header footprint. The header need not be populated;
  accessible pads can be probed. Preserve its NO EXT POWER warning and all nets.
- Add one GND PWR_FLAG near J1 to declare the externally supplied return to ERC.
  This is a schematic declaration, not a purchased part or protection circuit.
- Clarify J25's VBUS test label and show the nearby power-flag name legibly.
- Retain the existing current ceilings for V2. Consider inexpensive layout
  headroom during future PCB work; do not redesign the converter for higher
  current in this readability pass.

## Review evidence

Reviewed the active eight-sheet saved hierarchy through Konnect and exported
KiCad XML. USB_DP and USB_DM were the only remaining global signal labels;
the other cross-sheet signals already use hierarchical interfaces. GND and
3V3 power symbols intentionally remain global.

The user's direct MCU/control/converter wiring is retained as the presentation
reference. New USB root routes use the clear corridor left of the MCU,
without replacing the existing SPI, CV or I2C wiring.

Fresh baseline: 145 physical components and 126 nets. Earlier checkpoint
counts refer to older schematic versions. The reported ERC error was the GND
power-input declaration at #PWR01, not evidence of an electrically missing
ground connection. New #FLG010 on a short J1-return branch resolves it.

## Completed implementation

The editor-lock interruption was resolved when the user saved and closed the
schematic. The temporary child changes had been restored before that; a fresh
post-close snapshot became the comparison baseline. No lock was deleted.

USB_DP/DM now use bidirectional hierarchical labels and four matching root
sheet pins. Six new wire segments provide separate, non-crossing routes between
USB_INTERFACE and MCU_MODULE_PROVISIONAL. Power rails retain global symbols.
All other signal interfaces were already explicit. J25 now has a visible
VBUS_USB label and a readable PWR_FLAG value. J32 remains physically unchanged,
with its optional header assembly explained in the per-sheet documentation.

Konnect's manual pin-add operation did not orient the new pins for the left
edge. Render review caught this. Re-importing only the new pins using
import_sheet_pins(side=left), then positioning them, corrected the result.
Existing pins and wires were preserved. All native edits used Konnect.

Local evidence and the original snapshot are under
`.konnect-scratch/review-readability-20261012/`. The direct stdio MCP transport
there calls the installed official Konnect server; it does not edit native
KiCad files itself. No PCB, firmware, component selection or cost changes.

## Verification

- Final hierarchy ERC: zero errors and zero warnings, all eight active sheets.
  The four inherited ignored checks are unchanged; no exclusions added.
- validate_sheet_pins: zero issues.
- Independent XML comparison: 145 physical components / 126 nets before and
  after; zero physical-component data differences and zero pin-endpoint-group
  differences. No parts, footprints, ratings or BOM costs changed.
- Exported USB_DM and USB_DP now have the MCU sheet prefix. VBUS_USB's chosen
  canonical prefix moved from LOGIC_POWER_USB_ONLY to USB_INTERFACE following
  the explicit local test label. These three naming changes do not alter nets.
- All pre-existing wire UUIDs and endpoint coordinates are preserved: root
  34 -> 40, USB 21 -> 21, MCU 45 -> 45, power 6 -> 7.
- Only root, USB, MCU and POWER_PATH native files changed. Other schematic
  files, project settings and copied PCB match the post-close snapshot hashes.
- Rendered and visually checked all four edited sheets. Latest root/USB PNGs,
  eight-sheet PDF, XML, ERC and comparison report are in
  `../kicad/exports/review-readability-2026-10-12/`.

A clean ERC will not close the existing thermal, surge, handover or receiver
protection qualification gates. JP20/JP30/JP31 remain open; no power-up or
fabrication approval is implied.
