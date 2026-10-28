# Selector Physical Models

2026-10-08. Package/pin acceptance for a provisional prototype, not a release
or charging-safety approval. The circuit analysis is in
`MCP4251_SELECTOR_2026-10-08.md`.

## TQ2-3V

The installed libraries do not contain the previously suggested `Relay:TQ2`
or Panasonic TQ2 footprint. Konnect searches and complete Relay library listing
were checked. Instead the unchanged `Relay:G6H-2` symbol has the exact needed
physical numbering: coil 1/10, NC 2/9, common 3/8, NO 4/7; positions 5/6 unused.
The actual selected manufacturer/MPN remains Panasonic Industry / TQ2-3V.

Panasonic archived `../v2-manual-controls/panasonic-tq.pdf`, page 13, bottom
view, was visually compared with the actual symbol and placed footprint.
The drawing specifies ten 1.0 mm holes, 2.54 mm pitch and 7.62 mm row spacing.
Unused positions 5/6 are not switched contacts and must not be connected.
No claim is made that every NC position is an active physical contact.

`Relay_THT:Relay_DPDT_Omron_G6H-2` has that exact ten-position drilling/pad
numbering, with 2.3 x 1.6 mm plated lands and 1.0 mm drills. The Panasonic
14 x 9 mm body fits within the stock approximately 14.224 x 9.144 mm fabrication
outline and larger courtyard. The stock 3D model is not a Panasonic product
model. Its footprint name is retained honestly as a compatible standard land
pattern, not renamed or recreated. Top-view PCB numbering was reconciled with
the manufacturer's bottom-view numbering and the coil-end indication.

## NX6008NBKR and BAT54LT1G

Nexperia `NX6008NBK.pdf`, 19 August 2021, pages 2 and 10: SOT23, 1 gate,
2 source, 3 drain; 1.9 mm pitch, approximately 2.9 x 1.3 mm body. Unchanged
`Transistor_FET:2N7002` is used only as a pin-compatible NMOS drawing, with
exact NX6008NBKR value, MPN, manufacturer and datasheet fields.

onsemi BAT54LT1/D Rev18 November 2024, official PDF pages 1, 4 and 5:
Style 8 SOT23, 1 anode, 2 no connection, 3 cathode. The unchanged installed
`Diode:BAT54W` symbol has this numbering, with an explicit no-connect pin 2.
Its default SOT323 footprint is NOT used. The selected footprint is
`Package_TO_SOT_SMD:SOT-23`, checked against the actual SOT23 package.
The official PDF was reviewed online; no local archive is claimed until
successfully downloaded and hashed by the research owner.

The final analog clamp is BAT54SLT1G, not the single diode: onsemi
BAT54SLT1/D Rev18 May 2021 specifies Style 11, pin 1 lower anode to GND,
pin 2 upper cathode to 3.3 V and pin 3 common junction to MCP A/W.
The unchanged `Diode:BAT54S` symbol and SOT23 footprint were separately
placed and checked in `model-final-result.json` and `models/models-final.png`.
The single BAT54LT1G remains the flyback diode only.

Both standard SOT23 footprints were placed on the disposable PCB, all three
pads queried, and the native KiCad copper/paste/mask/fabrication/silkscreen
render inspected. The NX body diode direction and BAT54 cathode were also
checked on the actual placed schematic symbols. AO3401A reuses the already
accepted pin-1 gate / pin-2 source / pin-3 drain model from the logic supply.

## Evidence and Limits

Scratch directory `.konnect-scratch/v2-adaptive-2026-10-08/`: library queries
`relay-library-result.json`, `relay-candidates-result.json`,
`g6h-footprint-result.json`; actual placements/readbacks `model-place-result.json`;
inspected `models/models-all.png`, native KiCad `models/all.svg` and browser
render `models/all-pads.png`; final dual-diode placement is additionally
inspected in `models/final-pads-full.png`. Manufacturer NX images are `nx-map.png` and
`nx-package.png`; Panasonic drawing is `.konnect-scratch/tq-pinmap.png`.

No new custom symbol or footprint was created. Relay coil polarity/contact
mapping is intentional. Dynamic brownout, relay contact skew/bounce, analog
clamp current, receiver overvoltage and hot leakage remain unqualified.
