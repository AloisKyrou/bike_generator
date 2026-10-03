# Controller V1 state

Design baseline: commit `aefcb01` from 30 September 2026.

## Electrical envelope

- Input after rectification: **12–70 VDC specified**.
- Architecture target: **400 W peak**.
- Expected real use: typically about **100 W average**, roughly **150 W average**
  for a strong rider, with approximately **250 W peaks**.
- Do not claim 20 A continuous capability until the populated board and enclosure
  pass thermal qualification.

## Input and power path

- `J8` is the default three-phase generator input.
- J8 mapping is `1=W`, `2=U`, `3=V`.
- `D2` is Diotec `DBI25-16A`: pin 1 DC−/GND, pins 2–4 AC, pin 5 DC+.
- `J1` is the direct-DC alternative into `RECTIFIED_RAW`.
- Never energize J1 and J8 simultaneously.
- `F1` is Littelfuse `0456020.ER`, 20 A/80 V.
- `D1` is unidirectional `SMCJ70A`; it is best-effort surge suppression and
  does not guarantee that the INA238 VBUS pin remains below 85 V.
- `R1` is Bourns `CSS4J-4026K-2L00F`, 2 mΩ, four-terminal Kelvin shunt.

## D2 thermal plan for V1

The bridge needs a heatsink for meaningful current. The practical V1 plan is to
fit the heatsink during assembly after the PCBs arrive:

- cut a suitable aluminium extrusion/profile to size;
- drill and tap an M4 hole with the available titanium taps;
- use thermal compound between D2 and the heatsink;
- tighten to the DBI25 datasheet's 1.0 Nm mounting torque;
- ensure the heatsink cannot short exposed copper or connector hardware;
- qualify temperature under staged load in the real enclosure.

Do not treat the bridge's 25 A nameplate as free-air capability. The datasheet
gives about 4 A free-standing at 50 °C ambient; higher current assumes controlled
case temperature.

## Current and power monitor

- U1 is `INA238AIDGSR`, VSSOP-10, not INA228.
- The footprint and pinout are compatible with the original INA228 choice.
- The hierarchy/file name `INA228_SENSE` is intentionally retained as legacy.
- Bus measurement range: 0–85 V.
- Recommended `ADCRANGE=0`: ±163.84 mV.
- Shunt: 2 mΩ.
- Firmware full-scale current: 25 A.
- `CURRENT_LSB = 25 / 2^15 = 762.939 µA`.
- `SHUNT_CAL = 1250`.
- Raw shunt-voltage step: 5 µV, equivalent to 2.5 mA through 2 mΩ.
- INA238 has no INA228-style hardware energy/charge accumulators; firmware must
  integrate current/power if Wh or Ah are required.

The schematic, PCB value, MPN, datasheet, description and grouped BOM were all
aligned to INA238 before the baseline commit.

## Auxiliary supply

- U4 is `LM5164DDAT`, 6–100 V capable, configured for approximately 5 V.
- V1 user input minimum is 12 VDC even though hardware UVLO is approximately
  9.0 V on / 8.4 V off.
- Output divider: 316 kΩ / 100 kΩ, approximately 4.992 V.
- Switching frequency: approximately 303 kHz.
- L1 is Coilcraft `MSS1038-473MLC`, 47 µH.
- Input MLCC effective capacitance and transient margin still require bench
  verification across voltage and temperature.

## Control and MCU

- U2 is the socketed DFR0868 Beetle ESP32-C3 V2 module.
- U3 is `MCP42100-I/SL`, dual 100 kΩ SPI digital potentiometer.
- The V1 exposes CC and CV A/W/B headers.
- Before connecting the external buck, measure every A/W/B terminal and prove it
  remains within 0–3.3 V and ±1 mA relative to controller ground.
- `UART_TX` is intentionally marked no-connect.

## Mechanical and PCB state

- Nominal PCB: 70 × 110 mm, two layers, 1.6 mm FR-4.
- Four M3 mounting holes H1–H4 are board-only by design.
- Intended order copper: 3 oz / 105 µm on both outer layers.
- Intended finish: ENIG.
- The saved KiCad stackup still needs to be changed from 35 µm/unspecified finish
  to the intended 105 µm/ENIG before fabrication output.
- DC input/output polarity markings are present on the PCB.
- D2 is arranged near the board edge for heatsink access.

## Verification baseline

- Root hierarchy: seven sheets total, six child sheets.
- ERC: 0 errors, 0 warnings.
- DRC: 0 design-rule violations, 0 unconnected items.
- Schematic-to-PCB synchronization: no pending changes.
- Expected parity warnings: only H1–H4 as intentional board-only footprints.

Do not convert the four hole messages into blanket exclusions without documenting
the waiver. Any additional parity warning is a new finding.
