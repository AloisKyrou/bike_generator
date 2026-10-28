# Independent electrical review before prototype order

15 October 2026. External-converter controller only. This is a fresh schematic
engineering review, not a repetition of the ERC/DRC closeout. No native CAD,
editor state, firmware, component selection or order was changed. The parent
reviewer owns the independent routing/geometry review and final artifact freeze.

## Result and scope

**No new mandatory schematic correction was identified** in the nine-sheet,
81-component hierarchy reviewed here. Actual manufacturer pin functions,
power-path polarities, interfaces and selected ratings were checked against
fresh connectivity. This conclusion is narrower than a certified product,
universal converter interface or guaranteed computer/battery protection.

The important remaining risks are real but largely belong to the explicitly
accepted prototype architecture. They must accompany the prototype order and
bring-up instructions, not be hidden by a clean ERC:

| Priority | Finding | Required disposition |
|---|---|---|
| Medium pre-order layout correction | USB reference continuity and layer-transition returns do not follow the manufacturer's guidance | Local USB/return-path repair and geometry review before freezing fabrication files; see corroboration below |
| High operating gate | Direct MCP42100 outputs are not safe for arbitrary or unpowered converter controls | Qualify the particular converter before connection; power/init logic first, stop converter before logic loss |
| High operating gate | F1 does not protect all receiver-fed or reversed-DC faults; D1 is not a guaranteed 85V clamp | Use limited bench sources initially; source-specific external protection before energy-rich batteries |
| Medium operating gate | USB total current and self-powered USB/backfeed are not comprehensively managed | JP20 OPEN for first USB tests; qualify before using a valuable PC or enabling charging |
| Medium prototype risk | Linear 3V3 supply has thermal/dropout limits; charger capacitors remain provisional | Measure rail transients/temperature and charge behavior; do not label 600mA or full-cell-range operation validated |
| Medium interface constraint | GPIO8 is also a boot strap; physical UART RX/TX are not both exposed | Disconnect conflicting J5 accessories for recovery; distinguish native USB serial/JTAG from a dedicated UART header |

These do not automatically require another architecture redesign before making
a limited-energy engineering prototype. They do prevent advertising this board
as fail-safe with arbitrary generators, receivers, USB hosts or converter modules.

## Fresh evidence, not prior checkpoints

The current saved schematic was independently exported with native KiCad CLI
`sch export netlist --format kicadxml` into:
`.konnect-scratch/full-review-20261015/independent-netlist.xml`.
SHA-256: `F28B0D0D1F77F3997D49CCBCD0E01D0B6B49CA527DF25DC2233170199D194653`.
It contains 81 components / 84 nets. Every ref.pin membership was compared with
the final pre-fabrication XML: zero changes. The existing Direct verifier was
rerun against this new XML and rejected all 17 negative fixtures.

The owner's earlier file named `netlist.xml` in that scratch directory is
actually a KiCad S-expression export. Its suffix does not establish its format;
it was not treated as successful XML verification. The independent XML above
is the authority for the pin checks in this report.

The final contemporaneous saved-board hash reported by the design owner is
`CC446D8AED03ABE445527A3FD0EE7F5F9E3DA734A938B1D602E7A4B2C1468F8D`.
It preserves the user's 588-track/107-via live routing. The intermediate
B546... saved file still had 591 tracks and is not the final routing authority.
The owner reconciled the final saved GenCAD with live trace evidence. This
schematic review does not replace the owner's complete routing review.

Fresh aggregate review evidence: `run_design_review.json`, `checks.jsonl`,
`find_shorted_nets.json` in the same scratch directory. Coverage reports all
nine sheets and no unresolved symbols/diagnostics; native DRC has no electrical
errors or unconnected items. The reported short detector found zero candidates.
The aggregate heuristic verdict is reconciled below rather than accepted blindly.

## USB and logic power

### Pre-order routing corroboration

The owner's USB finding is independently supported by the exported trace
coordinates and current front/back copper renders. The front pair at
y=38.50/38.95mm crosses the bottom +3V3 trunk at x=90mm. Its clearance cuts
the otherwise bottom ground reference. Other bottom signal crossings also
interrupt this reference locally. After transition to B.Cu, the pair has no
continuous opposing front ground plane in the present artwork. The owner's
nearest-return-via distances are 3.11-6.55mm, not a close pair accompanying
each data-layer transition.

Evidence: `query_traces.json`, `routing-analysis.json`, `top-current.png` and
`bottom-current.png` in `.konnect-scratch/full-review-20261015/`. Inspection
of the bottom-current render confirms the long clearance slit; the trace
export establishes the crossing rather than relying on image alignment alone.
The owner's centreline lengths are 61.829mm D+ and 58.610mm D- from U8 to the
series resistors, excluding pad travel, via barrels and J21 branches. These
figures are not a signal-integrity simulation or an automatic USB failure test.

Espressif calls for a continuous reference, close ground-return vias at layer
changes, parallel matched routing and 90ohm +/-10% differential impedance.
The present 0.20mm widths/0.25mm long-section edge gap have no documented
impedance calculation for this two-layer 1.6mm/2oz stackup.
[Espressif ESP32-C3 USB layout guidance](https://docs.espressif.com/projects/esp-hardware-design-guidelines/en/latest/esp32c3/pcb-layout-design.html#usb).

**Disposition:** repair the avoidable reference interruption and layer-change
returns locally before ordering, and document the selected pair geometry.
There is no basis to claim USB will necessarily fail, nor does this finding
itself mandate four layers or an expensive fabrication service. Short full-speed
USB can tolerate imperfections, but a clean DRC cannot establish that tolerance.
This is a concrete PCB follow-up, separate from the accepted USB power-path
limitations below and from the no-new-schematic-defect conclusion above.

### Confirmed circuit

| Item | Fresh netlist check and engineering interpretation |
|---|---|
| USB-C CC | J27.A5 -> R49 5.1k -> GND and J27.B5 -> R50 5.1k -> GND, separately; correct passive sink arrangement, no PD negotiation implied |
| USB data | A6/B6 -> U8.3/4 -> R32 22R -> U2.27 GPIO19 D+; A7/B7 -> U8.1/6 -> R33 22R -> U2.26 GPIO18 D- |
| USB ESD | U8 USBLC6-2SC6 pin5 VBUS, pin2 GND; C50 100nF bypasses connector VBUS; channel pairing agrees with ST's internal circuit |
| USB feed | D20 anode pin2 on VBUS, cathode pin1 on SYS_BAT; no direct USB-to-3V3 short |
| Battery switch | Q20 AO3401A gate1 VBUS, source2 SYS_BAT, drain3 BAT_1S; the reversed-to-load source/drain orientation is intentional for this load-sharing arrangement |
| Charger | U6 pin4 TP_VCC, pin3 BAT, pin2 GND, pin6 PROG; C42.1/R45.2/U6.4 share TP_VCC and C42.2 is GND |
| Charge enable | U6.PROG -> R46 2k -> JP20 -> GND; open JP20 removes the programming return and disables charging, not all USB input consumption |
| Regulator | U7 RT9080-33GJ5 VIN1 SYS_BAT, GND2, EN3 through R48 200k to VIN, NC4 open, VOUT5 +3V3; C46/C47 on input/output respectively |

AO3401A's body diode initially permits BAT -> SYS_BAT when USB is absent;
the negative gate-source voltage then enables the channel. With healthy USB,
D20 supplies the system and the PMOS is off, so the cell does not have to carry
the system's normal load while charging. This is a discrete arrangement, not a
managed source mux. Weak USB and hotplug transient cases still need measurement.

R51 is a 1k VBUS bleeder/gate pull-down, approximately 5mA at 5V. D20 is a
low-leakage Schottky selected for this purpose. Neither is galvanic isolation.
The actual AO3401A gate limits and normal 1S/USB voltages are compatible;
no source/drain reversal defect was found.

**USB caveat:** USBLC6 includes steering paths toward VBUS. A battery-powered
USB PHY can therefore have a path into an absent/unpowered host's VBUS through
the data protection structure if its pull-up/transmitter remains enabled.
This is a circuit-level possibility, not a measured failure or a quantified
damaging current. The schematic has no MCU VBUS-sense input and no total USB
input-current manager. D20 blocking the direct power path does not settle all
data-line or fault paths. ST's protection circuit is shown in
[USBLC6-2 DS4260](https://www.st.com/resource/en/datasheet/usblc6-2.pdf).

Charging around 400mA plus ESP activity can exceed a 500mA source budget; it
also does not implement USB pre-configuration/suspend budgeting. JP20 OPEN is
an appropriate first-test restriction, not a statement of full USB compliance.
Keep generator/converter and cell disconnected for initial USB-only bring-up;
test with a current-limited source before an ordinary PC. Test battery-powered
USB connection/disconnection separately before approving that combination.

### Charger and regulator checks

TP4057 Rev2.2 pins and page9 series-resistor bypass topology match the corrected
schematic. R45 0.82ohm dissipates about 0.131W at nominal 400mA; its 0.5W nominal
rating is reasonable subject to temperature derating. The TP4057 document's
2k/400mA reference table does not make current exact: another table lists 2.2k
for 400mA and there is thermal regulation. Measure actual charge current rather
than qualifying a cell from a nominal value alone.

C42/C45 are 10uF nominal; their effective capacitance under bias is lower.
The existing explicit provisional qualification remains justified. This review
does not reinterpret the charger's 10uF guidance as guaranteed met under every
condition, nor add bulk capacitance without considering USB inrush. Initial
prototype use can leave recharge disabled. No cell-temperature sensing exists.

RT9080 pin mapping, nominal voltage and input range fit USB/1S service. Its
200k EN resistor drops only about 20mV at the datasheet's 0.1uA input-current
bound. C46/C47 nominal 10uF provide margin over its stated effective output
capacitance requirement. NC4 may legitimately remain open.

It remains a linear regulator: at an illustrative SYS_BAT=4.7V and 350mA,
loss is 0.49W. The datasheet's JEDEC thermal resistance would imply a substantial
rise, but is not a temperature prediction for this PCB. Radio bursts differ
from continuous load. On a depleted cell, dropout can push the ESP below its
operating range before the protected cell disconnects. Do not promise full
cell-capacity use or 600mA continuous rail delivery without testing.
[Richtek DS9080-09](https://www.richtek.com/assets/product_file/RT9080/DS9080-09.pdf).

## ESP32 and control interfaces

Module pin mapping was compared with ESP32-C3-MINI-1 datasheet v2.2. U2.3 is
3V3 with C30/C31; EN has R30 10k and C32 1uF; BOOT GPIO9 has R31 10k and
J23 access. GPIO2 and GPIO8 have R36/R37 10k pull-ups. Those strap defaults
support ordinary boot and recovery when external accessories are not overriding
them. Native USB serial/JTAG flashing/debug is connected on GPIO18/19.
[Espressif module datasheet](https://documentation.espressif.com/esp32-c3-mini-1_datasheet_en.pdf).

J5.7 reaches GPIO8 through R10 1k. A grounded accessory creates about 0.3V at
that strap against its 10k pull-up; this is low and can prevent joint-download
boot when GPIO9 is pulled low. J5.1/GPIO2 has the analogous loading. For first
flash/recovery, leave J5 accessories disconnected. These are not five arbitrary
5V-tolerant GPIOs; series 1k resistors do not supply level conversion or a safe
power-off interface.

GPIO20/U0RXD is explicitly NC. GPIO21/U0TXD drives the status LED through R35
and is shared with the remote LED header. Therefore there is **no dedicated
accessible RX/TX pair**. Native USB serial/JTAG remains available; the two are
not equivalent physical interfaces. This reflects the accepted pin allocation,
not a hidden USB flashing failure. Avoid promising a UART service header.

The remote LED shares the resistor and node with D22; it is an LED connection,
not a generic power output. Two different LEDs in parallel need not share
brightness equally. J3 exposes the native 3V3/I2C domain; do not externally
drive 5V or power the 3V3 rail while the regulator input is absent.

MCP42100-I/SL pin map matches the Microchip SOIC-14 drawing: SPI1/2/3,
ground4, supply14, reset11/shutdown12 high, SO13 intentionally unused.
CC J7 A/W/B maps to U3.8/9/10; CV J9 to U3.7/6/5. All six terminals remain
independent, without accidental endpoint straps. R11 holds chip-select high.

The device powers up at midscale; that is not a known-safe converter output.
Its analog operating domain is GND..VDD and 100k version wiper current is
limited to +/-1mA. No analog terminal isolation or automatic mechanical fallback
was found or expected. Qualify an actual converter's terminals, including
startup and logic-off states, before connecting them. Nominal 100k does not
alone establish compatibility. Source: archived Microchip DS11195C pages1/4/21,
[manufacturer PDF](https://ww1.microchip.com/downloads/en/DeviceDoc/11195c.pdf).

## Dual current and voltage sensing

Both INA238 symbols match the manufacturer pin functions: 1 A1, 2 A0, 3 ALERT,
4 SDA, 5 SCL, 6 VS, 7 GND, 8 VBUS, 9 IN-, 10 IN+.
VS is +3V3, not the measured bus. Their high-side measurement inputs may remain
energized while logic is off within specified ratings; a missing supply alone
does not imply a backfeed fault. [TI INA238 Rev B, sections4/6.1/7.3](https://www.ti.com/lit/ds/symlink/ina238.pdf).

| Path | Force current and sense topology checked in fresh XML |
|---|---|
| Input | F1 -> R1.4 -> R1.1 -> J2.2; R1.3 -> R2 10ohm -> U1.10; R1.2 -> R3 10ohm -> U1.9; C2 100nF across IN+/IN-; U1.8 senses R1.1 |
| Output | J40.1 -> R100.4 -> R100.1 -> J41.1; R100.3 -> R101 10ohm -> U10.10; R100.2 -> R102 10ohm -> U10.9; C101 100nF across IN+/IN-; U10.8 senses receiver side |

No force/sense short or polarity inversion appears in the schematic. Actual
Kelvin copper is the routing review's responsibility. The differential RC
corner calculated from 20ohm and 100nF is about 79.6kHz, not the software sample
rate. These values are within TI's recommended filter range.

R4/R6 are shared 4.7k SCL/SDA pull-ups. U1 address straps select GND via the
default bridged12 jumpers; U10 A1=GND/A0=3V3 is 0x41. Check bridge integrity
after assembly; modifying U1's A0 to 3V3 would create an address conflict.
Input ALERT is only pulled up/test-accessible, not a closed-loop safety signal;
output ALERT is intentionally NC. Polling is possible but not hardware protection.

At 10A each 2mohm shunt dissipates 0.20W with 20mV drop. The 6W resistor rating
is its own allowed dissipation under documented terminal-temperature conditions,
not a 6W bus-power limit. C2's differential location means it does not normally
see the 70V common-mode bus across its dielectric. Fault/transient limits remain
separate. INA telemetry is not a substitute for source current limiting.

Start I2C conservatively; 4.7k pull-ups do not guarantee 400kHz with arbitrary
external cable capacitance. Measure rise times before faster operation. The two
meters are not automatically time-synchronized for instantaneous efficiency.

## Main path, ratings and fault boundaries

D2's marking-side pin sequence is DC-, AC, AC, AC, DC+. Fresh connectivity
uses pin1 GND, pin5 RECTIFIED_RAW and pins2/3/4 as phases. DC J1 connects directly
to that raw bus, before F1. This is intentional, not DC reverse-polarity
protection. Do not energize J1 and J8 simultaneously.

The Diotec DBI25-16A's 1600V reverse rating is ample for the intended bus, but
its high current rating requires heat removal. Its free-standing specification
is only 4A at 50C ambient. No 10A rectified operation without qualified cooling
is approved. The exact manufacturer's thermal/case drawing was re-read from
`components/dbi25-16a/diotec-dbi25005a.pdf`, pages1-2.

D1 SMCJ70A is cathode to the fused bus, anode to GND. Its archived Littelfuse
table gives 70V stand-off, 77.8-86.0V breakdown and 113V specified peak clamp.
It therefore does **not** guarantee protection of the INA's 85V ceiling. This
matches the accepted best-effort transient policy; it is not permission to use
overvoltage as a continuous operating point. Receiver-side overvoltage is also
not controlled by this board's direct digipot outputs alone.

F1 0456020.ER stays 20A. Fresh manufacturer documentation confirms four-hour
minimum hold at rated current and up to 60s opening at twice rating. Its listed
interrupting capabilities are finite, not arbitrary-battery guarantees. The
manufacturer also specifies a thermal mounting recommendation unlike this
70um/5mm board, while permitting alternate thermal management subject to
temperature limits. There is no basis here to claim F1 limits a 10A overload.
[Littelfuse 456, revision18Sep2025](https://www.littelfuse.com/assetdocs/fuse-456-datasheet?assetguid=d86b18f9-14fa-4764-87ff-8aec12e9a89d).

An output battery can feed a board fault without passing through F1. Reversed
J1 can feed the populated bridge upstream of F1. Both need source-side
protection when using energy-rich sources, as already required. Damage accepted
by the user is not evidence of guaranteed no-fire behavior. Do not test battery
shorts/reversal experimentally as a way to close this design review.

Phoenix 1711725/1711738 terminal specifications (24A nominal, 400V III/2) do not
set a lower nominal component rating than the 10A/70V prototype objective.
Wire section, stripping, 0.5-0.6Nm screw torque and PCB soldering still matter.
The current paths cannot be rated from the terminal's catalog current alone.
[1711725](https://www.phoenixcontact.com/en-pc/products/pcb-terminal-block-mkds-3-2-508-1711725),
[1711738](https://www.phoenixcontact.com/en-pc/products/pcb-terminal-block-mkds-3-3-508-1711738).

## Reconciliation of all returned heuristic errors and warnings

The fresh aggregate reports six errors and fifteen warnings, despite complete
sheet coverage. They are not all electrical defects. Direct global connectivity
and exact IC functions take precedence:

| Returned group | Count | Disposition and evidence |
|---|---:|---|
| U1/U10 VBUS missing decoupling | 2 errors | False classification: VBUS is a measurement input. Actual VS pin6 has C1/C3 and C102/C103 respectively. No datasheet basis for the suggested mandatory 100nF VBUS capacitor |
| VBUS_SENSE missing decoupling | 1 error | Same measured-bus confusion; not an IC supply rail needing another generic bypass |
| Root and GPIO +3V3 missing decoupling | 2 errors | Cross-sheet false positives: C1/C3/C30/C31/C4/C47/C102/C103 are on the same exported +3V3 net |
| LOGIC_POWER VBUS_USB missing decoupling | 1 error | C50 is on VBUS_USB on the USB sheet; C42 correctly bypasses the separate TP_VCC after R45 |
| U1/U10 SDA/SCL pull-ups missing | 4 warnings | R6/R4 4.7k connect those same global nets to +3V3; adding one pair per INA is unnecessary |
| +3V3 bulk missing on input/CCCV/output sheets | 3 warnings | Shared C30/C47 nominal10uF exist; no requirement for a separate10uF on each sheet. Physical local bypass placement remains the routing review's check |
| VBUS_USB bulk >=10uF missing | 1 warning | Generic heuristic is not a USB design requirement. Downstream capacitance exists and adding direct bulk can worsen inrush. Do not add a capacitor just to silence this warning |
| U2/J27 silk-edge clipping | 4 warnings | Real known footprint-artwork warnings, left explicit; parent inspects final manufacturing clipping |
| H1/H2/H4 extra footprints | 3 warnings | Intentional board-only mounting holes; preserve them |

No rule exclusions or changes were made to suppress these reports. The
aggregate's six-error NOT READY label is not a reliable schematic verdict after
this reconciliation. Conversely, this reconciliation does not grant power,
thermal, USB compliance or manufacturer approval.

## Before order versus after fabrication

Before the prototype order: bind the package to the latest user-edited saved
PCB; complete the parent's routing/clearance/return-plane review, final Gerber
and drill checks, connector fit assessment and manufacturer preview/quote.
Keep the prototype restrictions above in the assembly and bring-up instructions.

After assembly, in increasing energy order: inspect soldering/polarities and
shorts; power logic from a limited 5V source without cell/converter; verify 3V3,
USB and boot recovery; check INA addresses/calibration and MCP SPI; qualify the
external converter's controls on a limited source/resistive load; then qualify
optional-cell charging and USB handover; finally evaluate progressive power-path
current and bridge cooling. Advance only after the previous stage is stable.

This is a proportionate route to an engineering prototype. Unmeasured behavior
is not marked passed, but tests that require hardware are not treated as a
reason to endlessly postpone making that hardware.
