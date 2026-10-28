# Independent external-controller review

Read-only engineering review, 14 October 2026. The PCB owner is completing
routing separately. This document does not approve fabrication or power-up.

## Scope and evidence

Reviewed the direct-interface contract, active 81-row working BOM, exported
`ext-direct-current.xml`, prior PCB checkpoint and JAE manufacturer drawing.
Independently reran `verify-netlist.ps1 -SelfTest`: 81 components / 84 nets pass,
including rejection of 11 missing-connection fixtures and one A/W-short fixture.
This confirms the tested schematic contract, not a new full ERC or PCB audit.
No CAD mutation, part substitution, rule waiver or purchase was performed.

## Open fabrication gate: J27

The standard JAE DX07S016JA1R1500 footprint has a locating oval NPTH measuring
0.85 x 0.60 mm. Five reported copper-edge violations concern its own geometry,
not the board outline: moving J27 cannot fix them. Recorded nearest copper gap
is 0.266 mm against the project's 0.50 mm edge rule. Do not exclude these errors
merely because the connector is standard.

The archived manufacturer drawing SJ121836 version 1, page 1, was visually
rechecked at original resolution. Its mounting-side recommended PCB drawing
specifies 0.85 +/-0.03 mm length, 0.60 +/-0.03 mm width and 0.05 mm position
callouts for the oval; the other locator is diameter 0.60 +/-0.03 mm. Source and
SHA-256 are recorded in the [JAE selection evidence](../v2/docs/USB_JAE_SELECTION_2026-10-14.md).
The [manufacturer-authored drawing mirror](https://www.pcb-3d.com/wordpress/wp-content/uploads/JAE_DX07S016JA1_dwg_no_SJ121836_USB_C_Plug_RA_SM.pdf)
was not freshly downloadable during this review; the archived drawing was used.

Published process screening, checked on the review date:

| Process | Published constraint | Result for the unmodified JAE footprint |
|---|---|---|
| [JLCPCB rigid PCB](https://jlcpcb.com/capabilities/pcb-capabilities/) | NPTH slot width >=1.0 mm | Does not meet standard slot width |
| [PCBWay quick-turn](https://www.pcbway.com/helpcenter/drill_hole_or_via_issues/Slots_standard_size___Limited_to_Quick_turn_PCB.html) | NPTH slot width >=0.8 mm | Does not meet standard slot width |
| [Eurocircuits mechanical rules](https://www.eurocircuits.com/technical-guidelines/pcb-design-guidelines/mechanical-layer/) | Finished slot width >=0.50 mm | Nominal width fits, but not a complete process qualification |
| [OSH Park drill slots](https://docs.oshpark.com/submitting-orders/slots/) | Native plated and NPTH drill slots >=0.508 mm | Width lead only; process clearances still matter |

Eurocircuits publishes 0.25 mm outer copper-to-edge / NPTH-to-copper clearance,
which the nominal 0.266 mm gap exceeds. However, its standard slot dimensional
and positional tolerances are +/-0.20 mm, looser than the JAE recommended PCB
callouts. Minimum slot width alone does not prove fit. Tighter tolerances must
be specified and costed; no such process has been selected here.
[Eurocircuits tolerances](https://www.eurocircuits.com/technical-guidelines/understanding-manufacturing-tolerances-on-a-pcb/tolerances-on-a-pcb/).

Closure requires a compatible process with the actual slot tolerances, copper
clearances, stackup and price accepted, followed by rules reflecting that
process and a fresh whole-board DRC. Otherwise choose another standard
connector with user agreement. Do not silently enlarge or plate the locator,
create a custom footprint, or treat a fabrication upload preview as acceptance.

## Electrical operating gates

1. **Direct MCP42100 outputs require powered, qualified interfaces.** The
   current documentation correctly distinguishes powered idle from unpowered
   operation. Both wipers reset to 0x80 on power-on; /CS pull-up and tied-high
   /RS and /SHDN do not create a receiver-safe setpoint or power-off isolation.
   Terminals must stay within GND..actual VDD, with the project's conservative
   +/-1 mA limit. Calibrate and independently bound the external converter;
   stop it before logic loss. A cell does not remove depletion/disconnection
   risk. These are accepted architecture limitations, not grounds to reinstall
   the rejected relays. [Microchip DS11195C](https://ww1.microchip.com/downloads/en/DeviceDoc/11195c.pdf).

2. **F1 does not protect energy entering through the output.** The exported
   netlist places F1 on the generator/input path. J40 positive -> R100 -> J41
   positive contains no series fuse. A battery receiver requires appropriately
   rated external protection near the battery; a PCB or cable short can draw
   energy backwards without passing F1. Fuse current, DC voltage and breaking
   capacity must suit the actual battery, conductors and fault current. A
   current-monitor shunt is not an interrupter. No added protection was ordered
   or silently inserted during this review.

3. **USB/1S qualification remains physical work.** TP4057 charging, RT9080
   temperature/dropout, cell compatibility, source current and hot-plug need
   measurements. Removing the relay load improves the budget but does not
   establish PC-port compliance. Keep JP20 open during initial USB tests;
   opening it disables charging, not all possible USB faults. The inherited
   [power-path guide](../v2/docs/explanations/per_schematic/07_LOGIC_POWER_USB_ONLY.md)
   explains the approximately 400 mA charge setting and missing USB current
   allocation. The [Richtek product specification](https://www.richtek.com/m/Home/Products/Linear%20Regulator/Single%20Output%20Linear%20Regulator/RT9080?ForceDevice=1&devicename=richtekmobile&sc_lang=en)
   gives 600 mA headline capability, not a thermal guarantee on this PCB.

4. **Common ground is not isolation.** Both power return connectors, USB
   ground, logic and the external control interfaces share GND. An isolated
   external converter loses its isolation if wired through this return path.
   The INA238 itself permits monitored bus voltage while its VS supply is off,
   within its specified input limits: do not incorrectly impose the MCP's
   power-sequencing restriction on the sensors. Sensor die temperature is not
   a measurement of the bridge, cable or battery temperature.
   [TI INA238 datasheet, section 6.3.1](https://www.ti.com/lit/ds/symlink/ina238.pdf).

## BOM and documentation

The working BOM matches the 81 retained schematic components and contains no
relay. It is not order-ready: numerous generic passives/headers lack selected
MPNs, INA238 stock must be reconfirmed and J27 is provisional. The sourcing
document still described three relays when first reviewed; the PCB owner was
notified to remove that obsolete purchasing instruction.

## PCB review

### Copper-closure checkpoint

The owner supplied `ext-finish-copper-close-drc.json`, saved/refilled at
18:01:34 on the review date: zero unconnected items and 49 violations, comprising
the five known JAE edge errors and 44 silkscreen findings. Silkscreen and outline
work continued after this checkpoint; these counts are not a final-board claim.
Independent live readback was collected in `ext-independent-read-result.json`.

The filled bottom plot `ext-finish-bottom.svg` was visually reviewed. Main
power-return copper in the lower board is broad and largely uninterrupted,
without an obvious long narrow plane neck between power terminals. The local
thermal spokes at terminal/bridge ground pads still require current/temperature
qualification. Connectivity and plane area do not establish a 10 A or 20 A
rating, and the exact copper weight and thermal geometry matter.

USB ESD-to-series-resistor traces are connected. J21 is now close to R32/R33,
with approximately 3.8 mm test branches, rather than a long remote test-header
branch. The main paths have approximately 6.4 mm length difference; the bottom
portions are approximately 16.3 mm (D-) and 22.1 mm (D+), separated rather than
closely paired over part of that route. This needs layout improvement or an
explicit signal-integrity validation gate, not a USB-qualified claim based on
DRC. Espressif recommends parallel equal-length differential routing, 90 ohm
impedance, continuous reference and ground-return vias at layer transitions.
[ESP32-C3 USB layout guidelines](https://docs.espressif.com/projects/esp-hardware-design-guidelines/en/latest/esp32c3/pcb-layout-design.html#usb).

J26's body reaches Y=16.75 mm and courtyard Y=16.25 mm, while the initial board
edge is Y=20 mm. The owner is considering a left-only outline extension rather
than moving wired parts. U2's antenna is approximately X=97.4..110.6 mm,
Y=19.7..25.1 mm; the initial plane notch is not equivalent to removing the host
PCB beneath that antenna. U2 top-row copper reaches Y=25.4 mm, so a cutout edge
at Y=25.1 mm would violate the existing 0.5 mm copper-edge rule. Y=24.8 mm is a
less intrusive proposed edge with 0.6 mm nominal copper clearance, still leaving
a small substrate strip below the antenna boundary. This is advice, not evidence
that an outline change has been applied. RF range and enclosure clearance remain
unqualified. [Espressif module placement guidance](https://docs.espressif.com/projects/esp-hardware-design-guidelines/en/latest/esp32c3/pcb-layout-design.html#general-principles-of-pcb-layout-for-modules-positioning-a-module-on-a-base-board).

### Final saved routing checkpoint

The owner supplied a newer saved/refilled checkpoint, subsequently inspected
independently. This supersedes the intermediate counts and proposed geometry
above:

| Evidence | Observed result |
|---|---|
| `ext-routing-complete-drc.json`, 18:14:53 | Zero unconnected items; five JAE copper-edge errors; two U2 silk-edge warnings |
| `ext-routing-complete-erc.json`, 18:15:27 | Nine sheets, zero reported errors/warnings under the existing check configuration |
| `ext-routing-complete.xml` | Independent Direct contract rerun passes 81 parts/84 nets and 12 negative fixtures |
| Live Konnect trace readback | 575 tracks: 447 F.Cu, 128 B.Cu |
| Native `ext-routing-complete.cad` export | 104 via records; closed stepped outline |
| Top/bottom native SVGs | Both independently rendered and visually inspected |

No copper short, track/pad clearance, courtyard, dangling-track or library
mismatch finding remains in the supplied final DRC. Existing ignored categories
remain visible in the reports; no blanket zero-DRC assertion is warranted. The
two U2 warnings are the standard module outline silk crossing the new antenna
cutout, not a copper collision or missing circuit connection.

The left outline now extends to Y=15 mm over X=50..80 mm, providing substrate
under J26 without moving its wiring. The RF notch is X=95..113 mm to Y=24.8 mm.
It visibly removes most host substrate below the antenna while preserving
nominal 0.6 mm to the top-row module copper. Enclosure and nearby-metal effects
still require RF testing; this is not a claim of 15 mm clearance in every
direction.

The USB bottom corridor was tightened and return vias added. D+ bottom length
is now approximately 18.61 mm versus D- 16.29 mm; the main ESD-to-resistor
path-length difference is reduced to approximately 3.3 mm. The top pair is
largely parallel. These changes improve the layout, but continuous reference
through the bottom transitions and 90 ohm impedance have not been established
for a selected stackup. USB enumeration/flashing/debug must be tested in both
plug orientations and relevant power states. The test-header branches should
remain unpopulated during normal USB operation.

**Verdict: NOT READY for fabrication or energization release.** Routing
connectivity is complete and the selected saved evidence is consistent; the
JAE manufacturing gate remains an unresolved fabrication blocker. Current,
thermal, USB/1S, RF/enclosure and external converter interface qualification
remain explicit engineering gates. No additional confirmed connectivity defect
was found in this review. This is a targeted independent review, not EMC,
USB-compliance, safety certification or a substitute for physical tests.
