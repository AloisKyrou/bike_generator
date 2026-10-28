# Manual-control model validation

8 October 2026. Model acceptance for schematic study, not board or operating
qualification. Exact datasheet sources and sourcing evidence are maintained in
this folder's research record. No custom symbol or footprint was created.

## Kingbright WP710A10LID

Manufacturer DSAL0510 / 1101029029, Rev.11A, 27 June 2023, p.1.
The side view explicitly identifies the short lead as cathode; the remaining
lead is anode. The manufacturer does not number these two leads. Project numbers
are deliberately assigned by function, not inferred manufacturer numbers:

| Physical lead | Symbol | Stock footprint pad / local coordinate |
|---|---|---|
| Cathode, short lead | Device:LED pin1 K passive | 1 at (0,0) mm |
| Anode, long lead | Device:LED pin2 A passive | 2 at (2.54,0) mm |

`LED_THT:LED_D3.0mm` has two 1.8 mm pads and 0.9 mm plated drills, matching
the manufacturer's recommended 2.54 mm pitch / 0.9 mm drill layout. Fab circle
is 3.0 mm nominal, with cathode flat at pad1; datasheet lens is 2.8-2.9 mm and
flange nominal 3.2 mm, so the stock outline is conservative rather than exact
optical geometry. No mechanical extra pad. F.SilkS cathode marking, F.Fab and
F.CrtYd were inspected on the disposable instance. Confirm mechanical height,
lead fit and case visibility at layout/prototype stage.

## Bourns 3296W-1-503LF

Manufacturer 3296 series PDF, actual retrieved footer REV.02/26, p.1 W drawing
and electrical diagram, p.2 taped front view. Three physical leads, three symbol
pins, three pads. Manufacturer identifies 1=CCW end, 2=wiper, 3=CW end. In the
component-side stock footprint view the adjustment screw is beside pin1.
The p.2 front drawing shows leads 3,2,1 left-to-right with screw at the right;
this agrees with the saved KiCad instance, not a mirrored solder-side mapping.

| Manufacturer lead/function | Device:R_Potentiometer pin | Pad / local coordinate |
|---|---|---|
| 1 CCW | 1 passive | 1 at (0,0) mm |
| 2 wiper | 2 passive | 2 at (-2.54,0) mm |
| 3 CW | 3 passive | 3 at (-5.08,0) mm |

`Potentiometer_THT:Potentiometer_Bourns_3296W_Vertical`: 2.54 mm inline pitch,
0.8 mm drills for nominal 0.51 mm round leads; 1.44 mm pads. Fab rectangle
9.53 by 4.83 mm agrees with the package drawing; screw circle/location follows
the documented 2.19 mm adjustment diameter. Silk and courtyard checked. The
standard courtyard is nominal and must be reviewed against package tolerances
and tool access during layout. No exposed or duplicate pads.

For an intuitive clockwise increase of current in a low-side rheostat,
connect ICHG through the fixed guard resistor to pin3; tie pin2 to pin1 and
return both to ground. Loss of wiper contact leaves the full resistance,
not an open control pin. An open track or solder joint is a separate fault.

Saved placements reuse this accepted model for RV1 and RV2. RV1: pin3 receives
R61; pins1+2 return to PGND. RV2: pins1+2 receive R67; pin3 returns to BQ FBG.
Clockwise raises the corresponding setpoint in both connections. Saved pin
queries and exported connectivity tests verify these distinct endpoint ties.
RV2 is a passive manual divider, not an accepted electronic CV isolation path.

## Generic GPIO Header

`Connector_Generic:Conn_02x05_Odd_Even` and the standard
`Connector_PinHeader_2.54mm:PinHeader_2x05_P2.54mm_Vertical` are generic
provisional connector geometry, not an exact selected manufacturer MPN.
Ten pins/pads: odd 1,3,5,7,9 at X=0; even 2,4,6,8,10 at X=2.54 mm;
row Y=0,2.54,5.08,7.62,10.16 mm. All drills 1 mm, copper 1.7 mm,
pin1 square with fab/silk key. Select and verify the actual header and mating
cable before purchasing/layout; assembly reversal remains possible.

## Saved Evidence

Official Konnect MCP queries `models.json`, scratch placement and independent
pad/pin readback `scratch-models.json` are under
`.konnect-scratch/v2-control-2026-10-08/`. Scratch project is `models/models`.
Native KiCad SVG and inspected `models/footprints-detail.png` show copper,
fab, silk and courtyard; `models/symbols.png` shows all ten/two/three symbol
pins. Responses identify saved-file fallback, no live KiCad IPC board used.
Real V2 PCB is untouched. These checks do not establish circuit fault safety.
