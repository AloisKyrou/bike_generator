# HRO TYPE-C-31-M-12 USB-C review

Update 15 October 2026: external J27 now uses the user-approved local
`BikeGenerator:USB_C_HRO_TYPE-C-31-M-12_2oz`. Four shield lands are enlarged
to give 0.320 mm annuli; signals, aliases, holes and position are unchanged.
See [full local geometry verification](../../external-converter/LOCAL_FOOTPRINTS_2OZ_2026-10-15.md).
The description below records the original standard-footprint comparison.
Its old 'no custom authorization' and unresolved-annulus statements are
superseded. Physical fit and USB qualification remain open.

Reviewed 14 October 2026 for the external-converter variant only. Not an order
or production acceptance. J27 uses the unmodified installed KiCad footprint
`Connector_USB:USB_C_Receptacle_HRO_TYPE-C-31-M-12` and standard symbol
`Connector:USB_C_Receptacle_USB2.0_16P`.

## Evidence

- Manufacturer drawing: TYPE-C-31-M-12, Rev A, dated 2020-12-08, one page.
- [Distributor-hosted manufacturer PDF](https://www.lcsc.com/datasheet/C165948.pdf),
  archived as `hro-type-c-31-m-12-20201208.pdf`.
- SHA256: `6AE33D50AC47820114661138DC4E4659F40FDC5D4F485B46685DFEC338DA1A9E`.
- [LCSC C165948](https://www.lcsc.com/product-detail/C165948.html): fresh page
  showed 366445 pieces, MOQ/multiple 5, USD0.1879 regular or USD0.1729 promotional
  per piece at five. Observation, not a reserved basket or EUR conversion.
- KiCad library readback, placed-pad IPC readback, native DRC, exported netlist,
  rendered drawing and PCB inspection. Independent reviewer checked mapping.

## Pin Map

Drawing view is the recommended PCB layout, component side. Table coordinates
are BOARD coordinates, with J27 at (53.005,35), rotation -90 degrees, F.Cu.
All 16 contact aliases retain identical symbol/pad numbers. Symbol contacts are
passive; footprint signal lands are SMD. Four pairs share physical solder lands.

| Manufacturer contact / symbol pin / pad | Function | Board X | Board Y |
|---|---|---:|---:|
| A1 | GND | 57.05 | 31.75 |
| B12 | GND, shared land with A1 | 57.05 | 31.75 |
| A4 | VBUS | 57.05 | 32.55 |
| B9 | VBUS, shared land with A4 | 57.05 | 32.55 |
| B8 | SBU2, NC | 57.05 | 33.25 |
| A5 | CC1 | 57.05 | 33.75 |
| B7 | D- | 57.05 | 34.25 |
| A6 | D+ | 57.05 | 34.75 |
| A7 | D- | 57.05 | 35.25 |
| B6 | D+ | 57.05 | 35.75 |
| A8 | SBU1, NC | 57.05 | 36.25 |
| B5 | CC2 | 57.05 | 36.75 |
| A9 | VBUS | 57.05 | 37.45 |
| B4 | VBUS, shared land with A9 | 57.05 | 37.45 |
| A12 | GND | 57.05 | 38.25 |
| B1 | GND, shared land with A12 | 57.05 | 38.25 |

Four physical shield tabs share symbol/pad SH and GND: board X51.955/56.135,
Y30.68/39.32. Two mechanical-only NPTH holes at (55.605,32.11/37.89), diameter
0.65mm, have no symbol pins. Total CAD pad records22:16 contact aliases,
4 shield tabs and2 NPTH. There are12 distinct signal solder-land locations.

D+ joins U8.3/4, then R32 and ESP GPIO19; D- joins U8.1/6, then R33 and GPIO18.
Each CC has its own 5.1k pulldown. SBU contacts remain NC. This retains USB
serial/JTAG/flash wiring; actual enumeration, flashing and debug remain tests.

## Mechanical Comparison

- Body drawing8.94x7.35mm. Standard F.Fab/courtyard and pin1 orientation inspected;
  shell faces outward over the left PCB edge. Two silk lines cross that edge.
- Pitch0.5mm, narrow signal width0.30mm; supply/GND width0.60mm. KiCad signal
  lands1.45mm long versus drawing1.20mm. This is a land extension, not identical
  recommended-pad geometry. No custom shortening applied.
- Round locator holes0.65mm versus drawing0.60+/-0.05mm, peg nominal0.50mm.
  Standard library lies at upper recommended-hole limit; account for finished
  hole tolerance and check fit on the actual connector batch.
- Shield X spacing8.64mm versus drawing8.65mm (0.01mm difference). Rear plated
  slots0.60x1.70mm; front0.60x1.20mm versus drawing0.60x1.10mm recommendation.
  Front slot is deliberately recorded as an oversize discrepancy, not a match.
- Shield pads1.0x2.1/1.6mm give minimum annulus0.20mm. No holes reduced/moved.
- No 3D model or clean DRC substitutes for a physical fit check. A separate
  disposable placement test was not completed: scratch IPC could not bind that
  second document. Production acceptance remains incomplete; live instance and
  native exported renders were inspected instead, not claimed as that test.

## Fabrication Boundary

The previous JAE narrow NPTH slots are gone. HRO uses round NPTH holes0.65 and
plated slots0.60 wide. These exceed JLC's published0.50 minimum round NPTH and
0.50 minimum plated slot widths. However JLC's2oz PTH annulus minimum0.254mm
is NOT met by the standard HRO0.20mm annulus (nor J26's0.225mm). Therefore this
is not a blanket JLC2oz clearance. No waiver or custom footprint authorized.
See [JLC capabilities](https://jlcpcb.com/capabilities/pcb-capabilities/).

Correction 15 October: PCBWay's generic 0.15 mm minimum is insufficient evidence
for 2 oz. Its detailed 70 um rules specify larger component rings and different
via requirements. Verify the combined process; no PCBWay clearance is claimed.
[PCBWay capabilities](https://www.pcbway.com/capabilities.html).

Assembly: four soldered shield tabs and one accessible fine-pitch row. Flux,
magnification and continuity checks are still needed; not a through-hole-only
connector. No purchase or manufacturer submission was performed.
