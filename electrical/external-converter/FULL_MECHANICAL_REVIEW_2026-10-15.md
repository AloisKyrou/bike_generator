# Independent mechanical, footprint and BOM review

15 October 2026. Read-only design review; no CAD mutation, supplier submission,
order, substitution or fabrication approval. Electrical review is separate.

## Checkpoint and evidence

Reviewed saved external-controller PCB SHA-256
`B546974687C338FAB97A478F9D9CD8D8FE674E68225682BB1D41D52286F4E256`.
This supersedes the A8E3 checkpoint for this review: the user changed the
3V3/I2C routing. Preserve those changes. Do not use the old review ZIP as if
it represented this source without regenerating/comparing exports.

Fresh evidence under `.konnect-scratch/full-review-20261015/`: `board.cad`,
`get_component_list.json`, `geometry.jsonl`, `pads-rest.jsonl`,
`independent-netlist.xml`, `top-detail.png`, `bottom-detail.png`, `drc.json`.
Compared the 81 BOM rows with all 81 exported schematic parts: no MPN or
footprint discrepancy. PCB inventory is 84 including three board-only holes.
The parent owns current ERC/DRC, connectivity and routing evidence.

## Findings requiring closure before an unconditional order approval

### M1. Finished-hole fit is not guaranteed by nominal drill matching

This is a tolerance-contract reservation, not proof that the ordered components
will fail to fit. Standard KiCad footprints and nominal manufacturer drawings
are consistent in most cases. Finished hole tolerance was not included in the
earlier nominal-only acceptance.

JLC publishes PTH tolerance +0.13/-0.08 mm and hole-position tolerance +/-0.075 mm.
The lower limits below are calculated using that standard service, not a
confirmed production coupon. Press-fit precision is not the default two-layer
service. [JLC capabilities](https://jlcpcb.com/capabilities/pcb-capabilities/).

| Part | Current nominal hole | Manufacturer recommendation | Calculated JLC lower limit | Conclusion |
|---|---:|---:|---:|---|
| J26 JST PH | 0.75 mm | 0.70 to 0.80 mm | 0.67 mm | Can fall below recommended minimum |
| Harwin M20 headers, including J5 | 1.00 mm | 1.02 +/-0.05 mm | 0.92 mm | Can fall below recommended 0.97 mm |
| Phoenix J1/J2/J8/J40/J41 | 1.30 mm | 1.30 mm nominal | 1.22 mm | Nominal matches; guaranteed physical fit unresolved |
| D21/D22 Kingbright | 0.90 mm | 0.90 mm nominal on LID drawing | 0.82 mm | Nominal matches; no demonstrated assembly failure |

[JST PH drawing, page 1](https://www.jst-mfg.com/product/pdf/eng/ePH.pdf)
specifies the mounting-surface view and reference PCB dimensions. The PH
nominal 1.6 mm board is supported; a positive finished-thickness tolerance
extends beyond its stated 1.6 mm upper applicability and should be included in
physical seating inspection, not silently treated as an exact 1.6 mm board.

[Harwin M20-998 drawing](https://content.harwin.com/asset/1590d228-db5c-4836-ab0c-0f146730b624/DRG-00478-Technical-Drawing-Datasheet-M20-998-pdf.pdf)
and [M20-999 drawing](https://content.harwin.com/asset/640f59f4-1860-40fe-82ef-f2a104ffa7d8/DRG-00479-Technical-Drawing-Datasheet-M20-999-pdf.pdf)
show 0.64 +/-0.02 mm square pins. An ideal sharp-corner maximum square has
0.9334 mm diagonal, versus the calculated 0.92 mm hole. This is a conservative
envelope comparison, NOT evidence that actual chamfered pins cannot fit.
Both drawings confirm the selected tin-finish, 3 mm tail variants and J5's
2.54 mm row spacing. The selected M20-99805XX family is listed active.

[Phoenix 1711725](https://www.phoenixcontact.com/en-au/products/printed-circuit-board-terminal-mkds-3-2-508-1711725)
specifies 0.9 x0.9 mm pins and 1.3 mm holes. The ideal square diagonal is
1.273 mm; actual corner geometry/tolerance was not established, so a 1.22 mm
lower hole is a reservation rather than confirmed interference. Hold the
terminal housing while tightening wires; the two-pin solder joints must not
take the full screwdriver torque.

**Practical closure:** inspect real samples against a finished-hole gauge or
obtain the actual finished-hole interval before claiming guaranteed assembly.
A 1:1 print checks pitch/orientation, not hole fit. If changing drills is chosen,
Harwin 1.05 mm gives a calculated 0.97 mm lower limit and 0.325 mm ring with
the existing 1.70 mm pads. JST 0.80 gives a 0.72 lower limit and 0.30 mm ring
with existing 1.40 mm width. Neither makes the full JLC interval identical to
the manufacturer's recommendation: check maximum clearance and seating too.
These are candidates for approval, not changes authorized by this review.
Do not enlarge holes after fabrication by drilling away their plating.

### M2. HRO fits the nominal drawing; physical fit remains unproven

J27 is the exact HRO TYPE-C-31-M-12, not the former JAE or GCT. The local
variant changes only four shield lands; pads remain 1.24 x2.34 /1.24 x1.84 mm,
with 0.60 x1.70 /0.60 x1.20 mm slots and 0.320 mm minimum nominal annuli.
Two 0.65 mm circular NPTH locators replace the old JAE narrow NPTH problem.

The [HRO manufacturer drawing hosted by LCSC](https://www.lcsc.com/datasheet/C165948.pdf),
Rev A 2020-12-08, recommends 0.60 +/-0.05 mm locators, nominal 0.50 mm pegs,
and a 0.60 x1.10 mm front slot. Current locator diameter is at that drawing's
upper bound; current front slot is 0.10 mm longer. Signal lands are 1.45 mm
long versus 1.20 mm recommended. These are documented differences, not
wrong-position or wrong-pin findings. The drawing is component-side; no
mirroring error was found. Four alias pairs share lands as intended.

No explicit separate diameter tolerance for circular NPTH was established
from JLC's published table. Do not substitute its NPTH *slot* tolerance or
pretend a sample fit closes production tolerances. Check a connector sample,
the manufactured locator holes and all four shell tabs before soldering.
The plug mouth intentionally overhangs the left board edge; body/artwork
crossing that edge is not a misplaced connector.

### M3. Antenna edge geometry is an avoidable RF reservation

U2 is the correct ESP32-C3-MINI-1-N4X and vendor footprint. The notch at
x95..113 /y24.8 removes most substrate under its antenna, whose marked area
ends at y25.1. Therefore approximately 0.30 mm of base-board substrate remains
under its lower strip. Nearest module copper starts around y25.4: extending
the notch by 0.30 mm would reduce nominal copper-edge clearance from 0.60 to
0.30 mm, and must be reviewed against routing tolerance and board rules.
Do not make that outline edit blindly or call the present strip an RF failure.

[Espressif module-placement guidance](https://docs.espressif.com/projects/esp-hardware-design-guidelines/en/latest/esp32c3/pcb-layout-design.html)
prefers antenna overhang and recommends removing base-board material beneath
and beside an antenna that cannot overhang fully. Nearby metal, the future
heatsink and enclosure must remain clear; its enclosure recommendation is
15 mm. The present notch is not evidence of a 15 mm all-direction keepout.
BLE range in the assembled enclosure remains a prototype test. No PCB RF
matching network needs to be invented for this already integrated module.

## Footprint and polarity checks without new mismatches

| Block | Current evidence |
|---|---|
| J27 USB | 16 symbol contact aliases, 12 physical signal lands, four shell tabs, two mechanical holes. D+ A6/B6 to U8.3/4 then R32/ESP GPIO19; D- A7/B7 to U8.1/6 then R33/GPIO18. CC1/CC2 independent pulldowns; SBU NC. |
| J26 battery | Pin 1 at (74,23) BAT_1S, pin 2 at (72,23) GND. Housing and 2 mm pitch correct. Keying does not guarantee a purchased cable's polarity; meter-check it. |
| U1/U10 | INA238AIDGSR corresponds to DGSR TSSOP-10, 0.5 mm pitch, not a QFN substitute. Pins 6/7 are supply/GND; 9/10 are sense minus/plus. |
| U3 | MCP42100-I/SL is SOIC-14. Supply 14, ground 4, controls 1/2/3; both A/W/B interfaces retained. No relay/bypass should be inferred from this BOM. |
| U6/U7/U8 | TP4057 SOT-23-6, RT9080-33GJ5 TSOT-23-5 and USBLC6-2SC6 SOT-23-6 agree with populated footprints and exported pin functions. |
| D20 | SMA cathode pad 1 on SYS_BAT, anode pad 2 on USB VBUS. Stripe belongs to SYS_BAT side. |
| D21/D22 | 3 mm LED footprint, 2.54 mm pitch, square pad 1 is cathode. Verify the actual package cathode; do not infer solely from trimmed lead length. |
| D2 | DBI25-16A uses the selected DBI-A five-pin 7.50 mm pattern, not a four-pin single-phase bridge. Exact supplier suffix matters. |
| R1/R100 | Bourns CSS4J-4026K-2L00F, despite the inherited Isabellenhuette footprint name. Large force pads 2.55 x5.60, small sense pads 2.55 x0.90; each force/sense pair stays on one physical end. R1 pads4/3 are upstream and1/2 downstream. R100 pads4/3 are converter side and1/2 receiver side. |

The [Bourns drawing](https://www.bourns.com/docs/product-datasheets/css4j-4026.pdf)
does not assign the CAD terminal numbers. The current exported pad pairing is
the authority for assembly; old documents with reversed IN/OUT numbering must
not override it. The selected [Diotec bridge](https://diotec.com/en/product/DBI25-16A.html)
is active; its manufacturer's bulk MOQ is not the two-board distributor order.

## Assembly and fabrication boundaries

- This is practical hot-air/iron assembly, not a beginner all-through-hole
  board. U2 has underside pads, including a subdivided exposed ground area;
  solder paste/stencil and controlled heating are appropriate. Inspect shorts
  before applying USB. U1/U10 and J27 have 0.5 mm pitch. Most other passives
  are 0805; no 0201 requirement was introduced.
- Assemble/reflow low SMT first, then connector plastics and through-hole LEDs.
  Kingbright explicitly excludes through-hole LEDs from reflow. Use its
  lead-bending/seating precautions, especially if extending LEDs to a case.
  [WP710A10LGD handling](https://www.kingbrightusa.com/images/catalog/SPEC/WP710A10LGD.pdf).
- J26 is now inside the upper-left outline extension; no previous y16.6 body
  overhang remains. J27's plug overhang and U2's antenna overhang are intentional.
  H1/H2/H4 remain user-owned mechanical placements. No case model, cable bend
  envelope, heatsink model or screw/washer stack has been signed off.
- D2 is currently on F.Cu in this variant. Do not promise the V2 concept of all
  hot components underneath a common plate. Its mounting/heatsink must fit the
  actual upright bridge and keep leads/copper isolated from metal. Its free-air
  thermal rating is not its headline heatsink-assisted current rating.
- The local J27/J26 annuli exceed JLC's 0.254 mm two-ounce PTH requirement.
  Existing 0.60/0.30 vias use the separate via rule, not the component-hole
  annulus rule. The 0.60 mm plated slots and 0.65 mm round NPTH meet published
  minimum sizes. This says nothing about accepting a whole uploaded job.
- The 0.5 mm-pitch INA/USB lands have 0.20 mm copper gaps and approximately
  0.10 mm mask dams with current expansion, at the published two-ounce mask
  pad-gap threshold. Inspect the actual manufacturer's mask preview; do not
  silently drop dams or narrow copper. Lead-free HASL is a cost proposal;
  ENIG improves planarity but is not imposed by this review.

## BOM and documentation disposition

All 81 current schematic/BOM MPN and footprint entries matched in this pass;
35 purchasable MPN groups and 74 purchased components per board are recorded.
The supplier plan retains DigiKey plus LCSC. Exact suffixes matter especially
for ESP, INA, TP4057 and RT9080; equivalent-looking substitutions are not
approved. Current manufacturer pages corroborate the selected product families,
but this review did not create a live basket or independently reserve every
commodity line. Stock, MOQ, freight and price require final basket confirmation.
The five 10 uF Murata parts remain explicitly provisional electrically.

Stale text to correct without changing architecture: `bom/README.md` and
`components/external-controller-passives/README.md` still describe C42 upstream
of R45. Current netlist places it on TP_VCC after R45. Common historical shunt
audits disagree on IN/OUT numbering; use the current pairing above.

## Verdict

**NEEDS ATTENTION, not fabrication approval.** No confirmed wrong footprint
pinout or missing purchasable MPN was found in the inspected blocks. Concrete
remaining order-side decisions are finished-hole fit acceptance and the small
antenna-edge reservation, followed by fresh outputs from the current source.
Physical connector samples, enclosure/heatsink fit and complete purchasing
availability were not proven. Those coverage limits must remain explicit.
