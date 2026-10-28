# Beetle power model acceptance, 8 October 2026

## Sources and scope

- TP4057: Nanjing Top Power ASIC Corp., REV_2.2, downloaded from
  <https://www.toppwr.com/uploadfile/file/20240913/66e3cef054ad8.pdf> as
  `tp4057-rev2.2.pdf`. Pin map p. 4; package p. 8; current table p. 6.
- RT9080: Richtek DS9080-09, December 2024, downloaded from
  <https://www.richtek.com/assets/product_file/RT9080/DS9080-09.pdf> as
  `rt9080-ds9080-09.pdf`. Top-view pin map p. 4; TSOT-23-5 outline p. 17.
- Circuit reference: existing archived DFRobot DFR0868 schematic V2.0,
  2022-02-08, `../dfr0868-beetle-esp32-c3/dfr0868-schematic-v2.0.0.pdf`.
  Its TP4057 CHRG drives a single green LED; STDBY is unconnected. Q1 and
  D1 are generic, with no exact MPN or physical lead numbers specified.

RT9080 was absent from installed libraries. Ultra Librarian offers a model
behind login; no account or access bypass was used. SparkFun publishes a
native RT9080-3.3 model in its CC-BY-4.0 regulator library. The complete,
unmodified library was downloaded at commit
`3f40e7d08cc23b464203287c9e8f77508bb752bb`, with upstream README/license,
to `../../v2/kicad/libraries/vendor/sparkfun/`. Registration was through
Konnect, project-local with a portable `${KIPRJMOD}` path. No custom model
was created. SparkFun attribution and its requested product-notification
convention are retained in that README.

## Accepted IC maps

Coordinates below are footprint-local millimetres, front/component view,
with KiCad pin 1 at upper left. Rotate the manufacturer top-view drawings
clockwise 90 degrees to align them; do not mirror. TP4057 p. 4 shows the
top marking and pin-1 dot, supporting component-side interpretation even
though the figure does not print the words `TOP VIEW`.

| IC | Physical lead | Function / symbol pin | Pad | X | Y |
|---|---|---|---|---|---|
| TP4057 | 1 | CHRG / 1, open collector | 1 | -1.1375 | -0.95 |
| TP4057 | 2 | GND / 2, power input | 2 | -1.1375 | 0 |
| TP4057 | 3 | BAT / 3, power output | 3 | -1.1375 | 0.95 |
| TP4057 | 4 | VCC / 4, power input | 4 | 1.1375 | 0.95 |
| TP4057 | 5 | STDBY / 5, open collector | 5 | 1.1375 | 0 |
| TP4057 | 6 | PROG / 6, passive | 6 | 1.1375 | -0.95 |
| RT9080-33GJ5 | 1 | VIN / 1, power input | 1 | -1.1375 | -0.95 |
| RT9080-33GJ5 | 2 | GND / 2, power input | 2 | -1.1375 | 0 |
| RT9080-33GJ5 | 3 | EN / 3, input | 3 | -1.1375 | 0.95 |
| RT9080-33GJ5 | 4 | NC / 4, no connect | 4 | 1.1375 | 0.95 |
| RT9080-33GJ5 | 5 | VOUT / 5, power output | 5 | 1.1375 | -0.95 |

TP4057 uses `Battery_Management:TP4057` and the explicitly overridden
`Package_TO_SOT_SMD:SOT-23-6`, not the native symbol's thinner TSOT default.
Manufacturer p. 8 body is 2.82-3.02 by 1.50-1.70 mm, 0.95 mm pitch,
1.05-1.25 mm tall. KiCad F.Fab is nominal 2.9 by 1.6 mm. Six physical leads,
six symbol pins and six pads; no exposed or duplicate pads. Manufacturer
ordering text is `TP4057-42-SOT236`; distributor `TP4057-42-SOT26-R`
is recorded as an ordering alias requiring purchase-time confirmation, not
permission to substitute TP4057X or a different output-voltage variant.

RT9080 uses `SparkFun-Regulator:RT9080-3.3` with explicit
`Package_TO_SOT_SMD:TSOT-23-5`. Manufacturer body length 2.692-3.099 mm,
width 1.397-1.803 mm, height 0.7-1.0 mm; KiCad nominal body 2.9 by 1.6 mm
and 0.95 mm pitch fit the TSOT drawing. All five leads/pins/pads accounted
for. No exposed pad. Pin 4 is NC on this exact fixed-output MPN, not SNS.
Outdated imported description/voltage range must be overridden on the real
instance using the current manufacturer document.

Both standard footprints have 1.325 by 0.6 mm pads, F.Cu/F.Paste/F.Mask,
front fab outlines, silk pin-1 triangle and courtyard. Courtyard reaches
0.25 mm beyond outer copper in the pad direction. Native KiCad SVG export
and rendered inspection confirm numbering, no mirrored instance, and
five versus six-pad distinction. This is model acceptance, not thermal,
assembly-process or fabrication acceptance.

## Recorded readback and rendered evidence

Official Konnect 0.12.1 stdio `tools/call` was used, with no live IPC editor.
Source was saved-file readback. All active schematic writes remain Konnect
operations; only the disposable validation PCB was populated.

- `.konnect-scratch/v2-2026-10-08/model-info.json`: model/footprint queries.
- `.konnect-scratch/v2-2026-10-08/scratch.json`: exact scratch operations.
- `.konnect-scratch/v2-2026-10-08/model-validation/symbols.png`.
- `.konnect-scratch/v2-2026-10-08/model-validation/footprints.svg` and PNG.
- Timestamped responses under `.konnect-scratch/v2-2026-10-06/` include
  independent placed-pin/pad reads; six and five pad counts respectively.

Q1/D1 from the C3 drawing remain unqualified generic circuit symbols in V2
(Q20/D20): no assigned MPN, footprint, physical pin-map or fabrication
acceptance. The C6 AO3407/1N5819W choices are not silently imported.
Green LED selection is still open. The candidate AOS/Vishay data are archived
but do not constitute a completed Q20/D20 model acceptance.

## Connector Reuse and Disposable Discrete Study

J26 reuses the previously user-selected V1 JST `S2B-PH-K-S(LF)(SN)` and
`Connector_JST:JST_PH_S2B-PH-K_1x02_P2.00mm_Horizontal`; no new connector
geometry was invented. The existing source and polarity qualification record
is in `../jst-ph-battery-connector/README.md`. Its two symbol pins map to pads
1 and 2 at (0,0) and (2,0) mm, front/component view, through holes 0.75 mm,
copper 1.2 by 1.75 mm. Project pad 1 is BAT_1S and pad 2 GND, not a claim that
every commercial JST battery cable follows that polarity. The archived PDF's
Japanese CMap fonts were unavailable to the local PDF renderer; this session
does not claim a new complete visual acceptance of that document. The prior
connector decision is reused provisionally with physical cable verification.

JP20 uses the generic standard `PinHeader_1x02_P2.54mm_Vertical` footprint:
two symbol pins and two 1.7 by 1.7 mm pads at (0,0) and (0,2.54), holes 1 mm.
Exact header/shunt MPN remains unspecified. Pin 1 is the PROG resistor return,
pin 2 GND; omit the shunt by default. Neither connector is a storage switch.

Konnect placed these parts plus candidate SOT-23/SMA/0805 footprints only on
the disposable validation PCB. The saved pad queries and native KiCad SVG
`model-validation/discretes.svg` / PNG were inspected for numbering, copper,
silk/fab and courtyard. They establish what the stock libraries contain, not
acceptance of the still-unselected Q20/D20/D21 MPNs. No candidate footprint was
assigned to those three real schematic placeholders.

R45 uses the standard 1206 footprint as a provisional layout requirement and
explicitly requires a selected >=0.5 W rated 0.8 ohm part with thermal derating.
Package size alone is not a power rating. All other ordinary resistors remain
0805 candidates and capacitors require actual effective-capacitance selection.
