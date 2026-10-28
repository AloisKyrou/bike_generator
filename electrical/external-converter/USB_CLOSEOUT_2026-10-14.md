# USB routing closeout, 14 October 2026

Supersedes the JAE fabrication/error status in PCB_ROUTING_COMPLETE and the
earlier independent review. Applies ONLY to external-converter, not V2.

## Changes

- J27 replaced by HRO TYPE-C-31-M-12, unmodified standard KiCad footprint,
  USB2 data and5V supply retained. No custom connector footprint or rule waiver.
- Local placement now(53.005,35),-90 degrees. Other83 footprints unchanged from
  session start. User removal of H3 and H2 placement(59.55,111.6) preserved.
- Of575 previous tracks,552 preserved byte-for-byte in queried geometry,
 23 local USB/GND segments removed,33 added. Final585 tracks:455 top/130 bottom.
- Four new vias and two obsolete local vias removed; final106 vias. Short
  bottom crossovers join the interleaved duplicate USB contacts without shorts.
- Schematic/PCB value, MPN, manufacturer, datasheet, LCSC and Design_Status
  reconciled. Konnect sync alone did not update custom fields; native KiCad
  field edits plus fresh parity check were necessary.
- BOM regenerated; export script default-path initialization corrected for
  Windows PowerShell. No firmware, V1 or integrated V2 change in this pass.

## Evidence

Final native saved-board DRC: **0 errors,4 silk-edge warnings,0 unconnected**.
Warnings are two original U2 antenna-outline segments and two J27 shell-outline
segments crossing the board boundary. They remain visible; no exclusions added.
Only parity findings: expected board-only H1/H2/H4. No metadata mismatch.
Existing project ignored-check configuration is unchanged, not claimed absent.

Root hierarchy ERC:0 findings. Direct-interface netlist verifier passes81
components/84 nets, with11 broken-connectivity cases and an A/W-short fixture
rejected. Schematic-to-PCB dry-run is noop across9 sheets,3 board-only holes
preserved. Native GenCAD reports106 VIA records. Full top-layer SVG inspected.

Independent read-only review confirmed both USB orientations, CC pulldowns,
SBU NC, supply/ground aliases, ESD/22ohm paths to GPIO19/18 and final DRC/parity.
Its useful new findings are captured in the fabrication document below.

Local evidence: `kicad/exports/usb-closeout-2026-10-14/` contains current
[top PDF](kicad/exports/usb-closeout-2026-10-14/top-review.pdf),
[bottom PDF](kicad/exports/usb-closeout-2026-10-14/bottom-review.pdf),
[schematic PDF](kicad/exports/usb-closeout-2026-10-14/schematic-review.pdf),
DRC/ERC JSON and XML netlist. These are review artifacts, not fabrication files.
Raw Konnect readbacks and pre-change backup remain in `.konnect-scratch/`.

## Remaining Gates

1. Select and qualify the actual fabrication contract. HRO removes the JAE
   NPTH-slot problem, but JLC2oz annular rings are not met by J27/J26. PCBWay
   is a lead, not an approved quote. Do not equate project DRC with fab approval.
2. Finish the component basket:41 purchasable small-part references still lack
   MPNs. INA238 availability/cost differs strongly between suppliers.
3. Close complete power-return, thermal, fault/fuse and USB/1S qualification.
   The10A target is a design objective, not a measured rating.
4. Check physical HRO fit and solderability; standard land dimensions differ
   slightly from the manufacturer recommendation. Separate scratch placement
   acceptance was unavailable, as recorded in the part review.

Read [HRO pin/mechanical record](../components/hro-type-c-31-m-12/README.md),
[10A/fabrication screen](CURRENT_AND_FABRICATION_2026-10-14.md), and
[BOM budget](bom/README.md). No production, purchase or power-up release.
