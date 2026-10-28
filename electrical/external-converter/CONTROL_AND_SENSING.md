# External converter control and sensing

## Current decision: direct digipot, 14 October 2026

The user rejected the cost and approximately 139 mA continuous consumption of
three relay coils. Their latest instruction accepts the prototype-style direct
digipot interface if automatic mechanical fallback makes the circuit complex.
The active implementation therefore has NO relay, transistor selector, manual
header or automatic mechanical fallback. The earlier selector checkpoint is
historical: [three-wire study](THREE_WIRE_CHECKPOINT_2026-10-14.md).

Active hierarchy block: `CC_CV_DIGIPOT`. Its existing child filename
`cc_selector_3wire.kicad_sch` is retained to avoid unnecessary file/path churn;
the name does not imply that a selector remains. All six analog connections
are drawn directly, with no A/W strap or forced ground.

| Output | Header pin | MCP42100 pin | Function |
|---|---|---|---|
| CC | J7.1 | U3.8 | PA0, endpoint A |
| CC | J7.2 | U3.9 | PW0, wiper |
| CC | J7.3 | U3.10 | PB0, endpoint B |
| CV | J9.1 | U3.7 | PA1, endpoint A |
| CV | J9.2 | U3.6 | PW1, wiper |
| CV | J9.3 | U3.5 | PB1, endpoint B |

For a qualified two-wire converter use W and the required endpoint. A three-pin
header permits a divider but does not establish compatibility with any converter.
Match terminal functions, not the order of pads on an unknown module.

## Digital control and power states

U3 remains MCP42100-I/SL, dual nominal 100 kOhm, SOIC-14. SPI is write-only:
GPIO5 -> /CS, GPIO6 -> SCK, GPIO7 -> SI; SO is explicitly not connected.
R11 is the 10 kOhm /CS pull-up. Both /RS and /SHDN are tied to 3V3.
GPIO20 is now spare, explicitly NC at the ESP module; no new header is added.

| State | Actual behavior / restriction |
|---|---|
| Logic supply absent | No valid resistance or safe setpoint is guaranteed; converter must be stopped or controls disconnected |
| U3 power-on | Both wiper registers reset to 0x80, not to a receiver-specific safe CC/CV setting |
| Valid 3V3, no SPI command | Last programmed code is retained, or 0x80 if not yet initialized |
| ESP reset with U3 supply stable | Not an automatic mechanical fallback; /CS pull-up discourages unintended communication, but reset behavior needs testing |
| Logic supply decays | Stop converter first; no power-off isolation or safe shutdown guarantee |

The static last-code behavior assumes valid supply and no new SPI command.
A powered firmware hang does not select manual mode. /SHDN is deliberately not
used as a universal safety control: the MCP shutdown state opens A and connects
W to B, which can command an unsafe output on some converters.

Power logic and initialize BOTH codes before enabling the external converter.
Stop the converter before removing its control logic. A depleted optional cell
is also a logic-power-loss case, not a supported autonomous control state.

## Electrical limits and protection boundary

Microchip DS11195C, page 4 (100 kOhm characteristics) specifies analog terminal
voltage between GND and VDD and wiper current within +/-1 mA. The project applies
the conservative +/-1 mA criterion to every exposed terminal. VDD operating
range is 2.7-5.5 V; our circuit uses 3.3 V, subject to LDO/dropout qualification.
The nominal end-to-end resistance is specified 70-130 kOhm at 25 C, so software
code is not an accurate resistance or voltage measurement. Readback/calibration
from the INA monitors remains necessary.

Never energize an unknown external control interface against an unpowered U3.
The allowed terminal domain follows VDD: a terminal that is acceptable at 3.3 V
can inject current/back-power the logic when VDD disappears. This circuit does
not add isolation or injection protection. A series resistor alone would not
establish a safe converter setpoint or universal compatibility.

Independent converter hardware must bound voltage/current for the receiver.
Readback and software do not replace those limits. The simplified architecture
is a prototype control interface, not a universal battery charger or a fail-safe
feedback selector. Do not connect an energy-rich battery or computer for the
first interface qualification tests.

Authority: archived [Microchip datasheet](../components/dfr0520-mcp42100/microchip-mcp41xxx-42xxx-11195c.pdf),
DS11195C pages 1/4/21, SHA-256
`F78338DBF59DDB8738867DA30E644D52942538192BCE9DFF070C4E765B679C1A`;
[official source](https://ww1.microchip.com/downloads/en/DeviceDoc/11195c.pdf).
Page 21 defines reset, shutdown and power-on behavior. No new part or footprint
was selected in this simplification.

## Measurement contract

Two INA238AIDGSR monitors share the existing I2C pull-ups and bus:
input U1 address 0x40, output U10 address 0x41. Each has a 2 mOhm four-terminal
Bourns shunt. Current flows from force pad 4 to pad 1; pads 3 and 2 feed the
positive/negative Kelvin filters independently of the load-current copper.

Output path: J40 converter OUT+ -> R100 pad 4 -> R100 pad 1 -> J41 receiver +.
U10 VBUS senses the receiver side. Both return terminals connect to common GND.
Input VBUS refers to converter input after R1. Positive input and output rails
are not joined by the controller. This arrangement does not preserve isolation
of an otherwise isolated external converter.

At 2 mOhm, 10 A gives 20 mV and 0.20 W; 20 A gives 40 mV and 0.80 W.
These calculations are not qualified board-current ratings. INA238's 5 uV wide
shunt-range step corresponds to 2.5 mA; absolute accuracy also depends on shunt
tolerance, temperature, calibration and layout.

The historical V1 starting configuration uses +/-163.84 mV shunt range,
CURRENT_LSB = 25/32768 A and SHUNT_CAL=1250. These are conversion parameters,
not a 25 A board rating. Calibrate both monitors separately. Source:
[TI INA238 datasheet](https://www.ti.com/lit/ds/symlink/ina238.pdf).

Input electrical watts support generator-load control but are not mechanical
rider watts. Output watts/Wh are measured at the controller's receiver terminal.
Efficiency estimates require time-aligned, averaged steady-state measurements;
instantaneous ratios during capacitor charging can be misleading.

## Qualification sequence

1. Identify the actual converter and map CC/CV functions in every control mode.
2. Measure terminal voltages/currents across operating range, including starts,
   stops and control-logic loss; establish compatible common ground.
3. Establish independent receiver-safe converter limits and calibrate the code
   ranges with a limited bench source and resistive load.
4. Test startup, ESP reset, USB removal, cell removal and cell depletion while
   observing control terminals and converter output. No energized unpowered-U3
   state is approved by the current schematic.
5. Qualify fusing, reverse-current behavior, cooling, USB budget and any battery
   charging requirements separately. JAE connector fabrication remains open.

The saved 81-component/84-net checkpoint passes ERC and the independent Direct
netlist contract with 12 negative fixtures. These prove schematic connectivity,
not safe dynamic behavior or manufacturing readiness. PCB progress is recorded
separately; no PCB completion claim follows from the schematic checks.
