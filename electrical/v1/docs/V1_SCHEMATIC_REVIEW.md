# V1 schematic review

Review date: 2026-09-29

Project: `bike-generator-controller`

Scope: complete seven-sheet hierarchy, component function, connectivity, manufacturer limits, design calculations, and schematic notes. The PCB layout and thermal capability are only covered where they constrain the schematic claims.

## Overall verdict

The schematic is electrically coherent and suitable for a V1 prototype with a specified rectified-bus range of 12 VDC to 70 VDC. ERC, hierarchical pin validation, and the connection audit are clean. It is not yet justified to claim 20 A continuous operation.

The four points that remain conditional are:

1. D2 requires a heatsink above the manufacturer's 4 A free-standing rating and must be validated thermally in the assembled enclosure.
2. D1 is surge mitigation, not a guaranteed 85 V clamp for the INA238. SMCJ70A can clamp as high as 113 V under its specified pulse current.
3. The LM5164 input MLCC bank must be checked for effective capacitance under DC bias and temperature. Its 100 V rating also does not meet TI's preferred 2 x maximum-input-voltage recommendation at a 70 V bus.
4. The MCP42100 CC/CV connections cannot be declared compatible until the external buck's A/W/B terminals have been measured and shown to remain within 0 V to 3.3 V and +/-1 mA relative to controller ground.

## Sheet 1 - Root hierarchy

Purpose: connect the six functional sheets and state the V1 operating envelope.

Verification:

- Six child sheets are present: power path, current/power sense (legacy filename `INA228_SENSE`), connectors, MCU, CC/CV control, and auxiliary supply.
- Every hierarchical label has a matching parent sheet pin: 0 hierarchy issues.
- `UART_TX` is intentionally marked no-connect at the root.
- The old note saying the power path was still open was replaced with the actual V1 limit: rectified bus 12...70 VDC, 400 W peak target, J1 or J8 but never both, and thermal validation required for high continuous current.

## Sheet 2 - POWER_PATH

### J8 and D2 - three-phase input and rectifier

- J8 is the default generator input. Its displayed mapping was corrected to match the actual nets: pin 1 = W, pin 2 = U, pin 3 = V.
- J8 is Phoenix Contact 1711738, rated 24 A nominal and 400 V in overvoltage category III/2. This is adequate electrically for the V1 envelope; PCB copper and thermal limits remain separate constraints. [Phoenix Contact 1711738](https://www.phoenixcontact.com/fr-fr/produits/borne-de-circuit-imprime-mkds-3-3-508-1711738)
- D2 is a Diotec DBI25-16A three-phase bridge. Pin 1 is DC-, pins 2/3/4 are the three AC inputs, and pin 5 is DC+. The schematic nets match that pinout. [Diotec DBI25 datasheet](https://diotec.com/files/diotec/files/pdf/datasheets/dbi25005a.pdf)
- The 25 A figure is conditional on case temperature. The manufacturer gives 4 A free-standing at 50 C ambient, 25 A with the case held at 115 C, and an M4 mounting torque of 1.0 Nm. Two diodes conduct at once, so a useful first-order loss estimate is `P_D2 ~= 2 x VF x I_DC`; with `VF <= 1.05 V` at 12.5 A per diode, losses become substantial well before 20 A.

Status: correct, but heatsink and thermal test are mandatory for operation above a few amperes.

### J1 - direct DC alternative

- J1 feeds `RECTIFIED_RAW` directly and bypasses D2. Pin 1 is positive and pin 2 is ground.
- J1 uses Phoenix Contact 1711725, rated 24 A nominal. [Phoenix Contact 1711725](https://www.phoenixcontact.com/en-in/products/printed-circuit-board-terminal-mkds-3-2-508-1711725)
- J1 and J8 must never be connected to live sources simultaneously. This is now stated once, prominently, on the sheet.

Status: correct as an assembly/use variant.

### F1 - main fuse

- F1 is Littelfuse 0456020.ER, a very-fast 20 A, 80 V fuse. Its nominal cold resistance is about 1.3 mOhm. At rated current it is allowed to remain closed for at least four hours; therefore it must not be treated as a 20 A current limiter. [Littelfuse 456 series](https://www.littelfuse.com/assetdocs/fuse-456-datasheet?assetguid=d86b18f9-14fa-4764-87ff-8aec12e9a89d)
- The sheet now says explicitly that 20 A continuous is not validated and requires the intended >=100 um copper, >=10 mm-equivalent current path, and a thermal test.

Status: part selection is consistent with the 70 V bus, but continuous-current capability belongs to the PCB/thermal qualification.

### R1 - four-terminal shunt

- R1 is Bourns CSS4J-4026K-2L00F, 2 mOhm, four-terminal, 6 W at 70 C. Pads 4 and 1 carry the load current; pads 3 and 2 are the Kelvin sense pair. [Bourns CSS4J-4026](https://www.bourns.com/docs/product-datasheets/css4j-4026.pdf)
- At 20 A: `V_SHUNT = 20 A x 0.002 ohm = 40 mV`; `P_SHUNT = 20^2 x 0.002 = 0.80 W`. This is comfortably below the resistor's nominal power rating, though local PCB heating still needs measurement.

Status: correct and well within the electrical range.

### D1 - bus TVS

- D1 is the unidirectional Littelfuse SMCJ70A with cathode on the protected bus and anode to ground. Orientation is correct. [Littelfuse SMCJ series](https://www.littelfuse.com/assetdocs/littelfuse_tvs_diode_smcj_datasheet?assetguid=37388813-0d6d-4329-969b-1aa8b7614ac1)
- Key limits are `VRWM = 70 V`, `VBR = 77.8...86 V`, and `VC = 113 V` at the specified pulse current. Because the INA238 bus input is rated to 85 V, D1 cannot guarantee that the INA238 remains below its absolute bus limit during a severe surge.

Status: acceptable as best-effort transient suppression, not as a hard overvoltage guarantee.

### J2 and F2 - protected auxiliary branch

- J2 exports `BUS_PROTECTED` and ground to the external buck/load connector; it uses the same 24 A Phoenix 1711725 terminal block.
- F2 is Littelfuse 0449001.MR, a 1 A, 125 V slow-blow fuse. It isolates the low-power LM5164 branch from the main bus. [Littelfuse 449 series](https://www.littelfuse.com/assetdocs/fuses-449-datasheet?assetguid=7aef6e93-9808-456e-9bee-fba54271285f)

Status: correct.

## Sheet 3 - CURRENT/POWER SENSE (`INA228_SENSE` legacy filename)

### U1 - current, bus-voltage and power monitor

- U1 is INA238AIDGSR, powered at 3.3 V. The device supports a 2.7 V to 5.5 V supply, 0 V to 85 V bus measurement, and shunt ranges of +/-163.84 mV or +/-40.96 mV. It uses the same VSSOP-10 pinout and footprint as the unavailable INA228 originally selected. [TI INA238 datasheet](https://www.ti.com/lit/ds/symlink/ina238.pdf)
- The 2 mOhm shunt produces 40 mV at 20 A. `ADCRANGE=0` (+/-163.84 mV) is therefore recommended, giving ample transient headroom.
- For a firmware full-scale current of 25 A: `CURRENT_LSB = 25 / 2^15 = 762.939 uA`; with `RSHUNT = 0.002 ohm`, TI's equation `SHUNT_CAL = 819.2e6 x CURRENT_LSB x RSHUNT` gives `SHUNT_CAL = 1250` for `ADCRANGE=0`.
- The raw shunt-voltage step is 5 uV, equivalent to 2.5 mA through 2 mOhm. The 25 A firmware scaling therefore does not limit the useful hardware resolution.
- Unlike INA228, INA238 has no hardware energy or charge accumulation registers. Firmware must integrate measured power/current over time if those values are required.
- The firmware should also configure sensible bus/shunt overvoltage limits; the hardware TVS alone is not an 85 V guarantee.

Status: electrically correct and synchronized to INA238 in both the schematic
and PCB metadata. The legacy sheet filename is retained to avoid unnecessary
hierarchy and net-name churn.

### R2, R3 and C2 - differential input filter

- R2 and R3 are matched 10 ohm series resistors and C2 is 100 nF across the INA inputs.
- TI recommends equal input resistors no greater than 100 ohm and a differential capacitor in the 0.1 uF to 1 uF range. The chosen network complies and has an approximate differential pole of `1 / (2*pi*(10+10)*100 nF) = 79.6 kHz`.
- The inputs originate from the dedicated R1 Kelvin pads, as TI recommends.

Status: correct.

### C1 and C3 - supply bypass

- C1 = 100 nF and C3 = 1 uF are in parallel from 3.3 V to ground near U1. TI calls for a local 100 nF bypass; the added 1 uF supplies lower-frequency local energy.

Status: correct.

### R4, R6, R5, JP1 and JP2 - I2C and alert configuration

- R4/R6 = 4.7 kOhm pull SDA/SCL to 3.3 V; R5 = 10 kOhm pulls the open-drain ALERT output high.
- JP1/JP2 are bridged 1-2 by default, tying A1/A0 to ground. The resulting 7-bit address is `0x40`, matching TI table 7-2.
- TP1/TP2 expose the Kelvin pair; TP4/TP5 expose SDA/SCL; TP6 exposes ALERT.

Status: correct.

## Sheet 4 - CONNECTORS

### J3 - display I2C

- Pinout is 1 = 3.3 V, 2 = ground, 3 = SDA, 4 = SCL. The old text incorrectly called this J2; it is corrected.

### J5, R7-R10 - external Hall/action interface

- J5 is now correctly documented as 1 = ground, 2 = 3.3 V, 3 = Hall/GPIO4, 4 = Action/GPIO8.
- R9/R10 = 1 kOhm limit transient/input current. R8/R7 = 10 kOhm provide defined high states.
- J3 and J5 have no dedicated TVS/ESD array. They are acceptable as short internal/bench connections, not yet as exposed field wiring.

Status: electrically coherent; field hardening is a V2 item.

Metadata note: J3 and J5 remain generic pin-header choices rather than procurement-locked manufacturer parts.

## Sheet 5 - MCU

### U2 - DFR0868 Beetle ESP32-C3

- U2 is a complete DFRobot module, so its regulator, USB circuitry, ESP32 decoupling, boot switch, and Li-ion charger are internal to the module. This explains automated audit warnings that otherwise look like missing local MCU decoupling. [DFRobot DFR0868 documentation](https://wiki.dfrobot.com/dfr0868/) and [Espressif ESP32-C3 datasheet](https://www.espressif.com/sites/default/files/documentation/esp32-c3_datasheet_en.pdf)
- DFRobot specifies 5 V at VIN/USB, 3.3 V I/O, a 400 mA maximum charging current, and a -10 C to 60 C module operating range.
- GPIO map: GPIO0/1 I2C; GPIO2 INA_ALERT; GPIO4 Hall; GPIO5/6/7 MCP42100 CS/SCK/MOSI; GPIO8 Action; GPIO20 POT_SHDN; GPIO21 UART_TX intentionally unused.
- GPIO2, GPIO8 and GPIO9 are ESP32-C3 strapping pins. R5 keeps GPIO2 high at reset; GPIO8 has a pull-up; GPIO9/BOOT is handled on the DFR0868. This is compatible with normal SPI boot, but external circuits must not force an invalid strap state during reset.

Status: correct, with the module's -10 C to 60 C temperature envelope recorded.

### JP3 - generator/USB power interlock

- `AUX_5V -> JP3 -> VIN_5V/VUSB`. JP3 must be closed only when USB is disconnected and opened before USB-C is attached. This prevents two 5 V sources from being directly paralleled.

Status: correct but procedural; a future automatic power mux would be safer.

### J6 and JP4 - battery

- J6 is JST S2B-PH-K-S(LF)(SN), a 2 mm PH-series connector. [JST PH series](https://order.jst-mfg.com/InternetShop/app/pdf_show.php?kbn=1&key=ePH.pdf)
- JP4 open isolates the protected 1S LiPo from both charging and load. The selected 400-500 mAh cell must have its own protection circuit and must tolerate the module's maximum 400 mA charge current.

Status: correct under the stated battery requirement.

## Sheet 6 - CC_CONTROL

### U3 - dual digital potentiometer

- U3 is MCP42100-I/SL: two volatile 100 kOhm, 8-bit potentiometers controlled by SPI. [Microchip MCP41/42xxx datasheet](https://ww1.microchip.com/downloads/en/DeviceDoc/11195c.pdf)
- Ideal step size is `100 kOhm / 256 = 390.6 ohm`. The end-to-end resistance tolerance is +/-30%, so commanded codes must be calibrated against the real buck setpoints.
- The analog A/W/B terminals must remain within the U3 supply rails in normal operation and wiper current must remain within +/-1 mA. The external buck therefore must not be connected before measurement.
- SO is intentionally unused because the firmware only writes the potentiometer.

Status: correct internally; external-buck compatibility remains an explicit bench gate.

### R11, R19 and C4 - deterministic startup

- R11 = 10 kOhm pulls `/CS` high, keeping SPI commands inactive during reset.
- R19 = 10 kOhm pulls `/SHDN` low. In shutdown the MCP42100 disconnects A and connects W to B, giving a deterministic safe state until GPIO20 goes high.
- C4 = 100 nF X7R is the local 3.3 V bypass capacitor.

Status: correct.

### J7 and J9

- J7 exposes CC A/W/B on pins 1/2/3. J9 exposes CV A/W/B on pins 1/2/3.
- These headers remain generic procurement items.

## Sheet 7 - AUX_SUPPLY

### U4 - LM5164 12...70 V bus to 5 V auxiliary supply

- U4 is LM5164DDAT, a 6 V to 100 V, 1 A synchronous buck with a 1.2 V feedback reference. [TI LM5164 datasheet, Rev. D](https://www.ti.com/lit/ds/symlink/lm5164.pdf)
- Pin 9 exposed pad is tied to ground and the footprint includes thermal vias, matching TI's grounding/thermal requirement.

Status: topology and pin connections are correct.

### R17/R18 - output divider

- R17 = 316 kOhm and R18 = 100 kOhm, both 0.1%.
- `VOUT = 1.2 x (1 + 316/100) = 4.992 V`.

Status: correct for a nominal 5 V rail.

### R13/R14 - UVLO divider

- R13 = 1 MOhm and R14 = 200 kOhm.
- TI's typical thresholds give `VIN_ON = 1.5 x (1 + 1M/200k) = 9.0 V` and `VIN_OFF = 1.4 x 6 = 8.4 V`. These are hardware protection thresholds; the specified V1 operating minimum is 12 VDC after rectification.

Status: correct. The 12 VDC user limit leaves about 3 V of startup margin above the typical UVLO turn-on threshold.

### R12 - switching frequency

- R12 = 41.2 kOhm.
- `fSW = VOUT x 2500 / RON = 4.992 x 2500 / 41.2 = 303 kHz`.

Status: correct and below the 1 MHz maximum.

### L1 - buck inductor

- L1 is Coilcraft MSS1038-473MLC, 47 uH, DCR <=128 mOhm. Ratings are 1.6 A at 10% inductance drop, 2.0 A at 20% drop, and 1.5 A for 20 C temperature rise. [Coilcraft MSS1038-473](https://www.coilcraft.com/en-us/products/power/shielded-inductors/ferrite-drum/mss-mos/mss1038/mss1038-473/)
- At 70 V in, 5 V out, 303 kHz and 1 A load: `deltaIL ~= 0.33 A`, so normal `Ipeak ~= 1.17 A`.
- TI's maximum current-limit threshold is 1.75 A. The 1.6 A/10% saturation point is not "well above" that limit, although the 20% drop point is 2.0 A. Startup, overload and hot operation therefore need bench validation.

Status: normal operation is credible; transient saturation margin is limited.

### C5, C7, C8 and C6 - input network

- C5/C7/C8 are Samsung CL32Y106KCVZ4NE, 10 uF, 100 V, X7S. [Samsung CL32Y106KCVZ4N](https://product.samsungsem.com/mlcc/CL32Y106KCVZ4N.do)
- TI requires at least 2.2 uF effective high-frequency input capacitance and recommends a voltage rating of twice maximum VIN after DC-bias effects are considered. The three 100 V parts do not satisfy the preferred 140 V rating for a 70 V bus; their combined effective capacitance must also be confirmed from Samsung's bias data or measurement.
- C6 is Panasonic EEU-FC2A100, 10 uF/100 V electrolytic. Its ESR provides the input-cable resonance damping TI recommends. [Panasonic EEUFC2A100](https://industrial.panasonic.com/ww/products/pt/aluminum-cap-lead/models/EEUFC2A100)

Status: electrically plausible for V1; validation required and a higher-voltage MLCC strategy is preferred for V2.

### C9, R16, C11 and C10 - bootstrap and Type-3 ripple injection

- C9 = 2.2 nF/50 V from BST to SW, exactly the capacitance required by TI.
- R16 = 200 kOhm, C11 = 3.3 nF and C10 = 82 pF form the Type-3 ripple network.
- With the selected feedback divider and 303 kHz, TI equation 24 gives `CA(min) ~= 0.44 nF`; C11 = 3.3 nF passes.
- `R16 x C11 = 660 us`. The estimated FB ripple is about 11 mV at 9 V input and rises above TI's 12 mV minimum near 10 V. Because V1 now specifies a 12 VDC minimum input, the intended operating range is above this marginal region; startup at 12 V should still be confirmed during bring-up.

Status: suitable for the specified 12...70 VDC V1 range; verify the 12 V boundary during bring-up.

### C12/C13 - output capacitors

- C12/C13 are Samsung CL32B226KOJNNNE, 22 uF, 16 V, X7R each. [Samsung CL32B226KOJNNN](https://product.samsungsem.com/mlcc/CL32B226KOJNNN.do)
- For `deltaIL ~= 0.33 A`, 303 kHz, and 25 mV ripple, `COUT(min) = deltaIL/(8 x fSW x deltaV) ~= 5.5 uF`. The nominal 44 uF bank has ample nominal margin; combined effective capacitance under 5 V bias and temperature must remain above 5.5 uF.

Status: correct with normal MLCC derating verification.

### R15 and test points

- R15 = 47 kOhm pulls the open-drain PGOOD output to 3.3 V; TI recommends 10 kOhm to 100 kOhm.
- TP12 exposes protected input and TP14 exposes the regulated 5 V output for bring-up measurements.

Status: correct.

## Generic and procurement-unlocked parts

The circuit values are reviewable, but an exact manufacturer-datasheet comparison is not possible until an MPN is assigned for C4, R7-R10, R19, the generic headers J3/J5/J7/J9, the solder jumpers, and test points. Their electrical roles and footprints are valid; this is a BOM/procurement completeness issue rather than a connectivity error.

## Required V1 bring-up tests

1. Power U4 from a current-limited supply at the specified 12 V minimum, then sweep to 70 V; verify 5 V regulation, PGOOD, startup and SW-node behavior.
2. Repeat startup at 12 V under cold, warm and representative load conditions; look for pulse skipping, chatter or unstable output.
3. Verify INA238 address 0x40, set `ADCRANGE=0`, `CURRENT_LSB=762.939 uA`, and `SHUNT_CAL=1250`; compare current against a calibrated meter.
4. Measure the external buck's CC/CV A/W/B terminal voltages and worst-case wiper currents before fitting J7/J9.
5. Fit the D2 heatsink, apply thermal compound and 1.0 Nm M4 torque, then perform staged load tests while monitoring D2, F1, R1, copper and connector temperatures.
6. Test both source variants separately; never energize J1 and J8 together.

## Automated verification record

- ERC: 0 errors, 0 warnings.
- Hierarchical pin validation: 0 issues.
- Connection audit: 7/7 sheets, 95 symbol instances, 0 findings.
- BOM structural audit: 60 fitted electrical components, no missing value or footprint.
- PCB DRC: 0 design-rule violations and 0 unconnected items.
- PCB/schematic parity: J8 is synchronized. The only remaining parity messages are the intentional board-only mounting holes H1-H4.
