# Prototype probe access

Schematic-only continuation of 8 October 2026. No real PCB has been updated.
These are bare copper pad provisions, not fitted connectors or power inputs.
They do not authorize energizing the unfinished converter.

| Pad | Node | Reference endpoint |
|---|---|---|
| TP40 | BQ feedback | U9.12 / R66.2 / relay common K1.3 |
| TP41 | Output-current programming | U9.9 / R61.1 |
| TP42 | Input-current programming | U9.10 / R62.1 |
| TP43 | Internal driver regulator | U9.24 / C60.1 / C61.1 |
| TP44 | Main control ground | U9.17/22/37 |
| TP45 | MCP channel-1 tied A/W | U3.6/7 / R85.1 / D24.3 |
| TP46 | Selector drive before coil resistor | Q22.3 / Q21.1 / R88.1 |
| TP47 | Selector ground | U3.4/5 / R86.2 |

Existing J20, J25, J32 and J33 already provide 3V3, VBUS, I2C/CE/status and
temperature-interface access. No redundant pad bank was added there. No switch
node or bootstrap pad is added: high-frequency measurements need a separately
qualified probing method and physical layout.

## Physical model

Installed stock `Connector:TestPoint` has one passive pin numbered 1 at its
anchor. Stock `TestPoint:TestPoint_Pad_D1.5mm` has one circular 1.5 mm pad 1
on F.Cu/F.Mask, no paste and no drill. Silk radius is 0.95 mm, courtyard
radius 1.25 mm. There is no fitted component, manufacturer package or 3D model;
these are PCB design dimensions, not guessed dimensions of a purchased part.

Konnect queried both models and placed a disposable symbol/footprint. Saved pad
readback confirmed the physical pin/pad mapping and dimensions. Native KiCad SVG
and rendered copper/mask/silk/courtyard were inspected. Evidence lives under
`.konnect-scratch/v2-continuation-2026-10-08/models/`, with `model-result.json`
and `inspect-result.json` in its parent directory. No custom library was made.

## Layout and measurement constraints

TP40 and TP45 must be directly at their existing local nodes, with no branch
trace. Added pad/probe capacitance and leakage can disturb high-impedance feedback;
this needs qualification, not merely a passing netlist. Use appropriately rated,
low-capacitance probing and a short local return. The eventual layout must make
the ground access practical without lengthening sensitive or Kelvin paths.

Node names do not establish safe voltage under every power-off, attached-battery
or fault state. Do not inject a source into a pad. Grounds are common with USB,
not galvanically isolated. Scope/USB grounding and fault paths must be reviewed
before measurement; the pads are not touch-safe interfaces or isolation points.

The schematic pads sit on existing wire nodes; no new circuit branch or electrical
net is introduced by the pads themselves. PCB area and probe clearance still cost
space even though the fitted-component BOM cost is zero.
