# Adaptive V2 power-path review, 8 October 2026

Read-only review of the saved exported power paths, parts and selected renders.
No KiCad mutations, hardware tests, PCB routing review or energization approval.
The reviewer also supplied component-selection research; this is an independent
readback of the owner's saved implementation, not an independent laboratory
qualification of those components.

## Verdict and scope

**NOT READY for energization or manufacture.** The scoped schematic endpoint
checks pass, with no new power-path wiring error found. Important inherited
and newly quantified qualification gates remain below. This report does not
replace the full hierarchy/control review or imply that all fault modes pass.

Reviewed XML: `../kicad/exports/review-adaptive-2026-10-08/controller-v2.xml`,
134 components, 121 nets, eight sheets. SHA256:
`4C34E5957BE489FF833A1DFBE8B8047BD07FE9264C5FAA5A74B9820D31B2F5DB`.
Reviewed PDF `controller-v2-review.pdf`, SHA256:
`694B8AD866B0DA6AF63E853FAAF74C9BFD0C2B57B9B4819E0F1C37A78EEDBA1E`.
The owner produced the export and native ERC. This reviewer independently
recomputed export hashes, inspected the exported endpoints and ran:

```powershell
& electrical/components/ti-bq25756/power-stage/review-power-endpoints.ps1 `
  -Netlist electrical/v2/kicad/exports/review-adaptive-2026-10-08/controller-v2.xml
node electrical/components/ti-bq25756/power-stage/uprate-screen.mjs
```

Results: 252 endpoint/part assertions pass; arithmetic screens pass. Assertions
include helper checks for unique part/net lookup, not 252 independent physical
failure modes. No concurrent KiCad CLI was run during the owner's work.

## Findings and remaining gates

1. **Critical before uncontrolled generator use: no qualified input overvoltage
   disconnect/clamp.** D1 remains SMCJ70A, whose 113 V maximum clamp does not
   protect 80 V switches or the 85 V BQ absolute rating. ACOV stops switching,
   but input-connected FETs, capacitors and controller pins remain exposed.
   The 55 V operating ambition is not galvanic isolation, an input disconnect,
   or permission to connect an arbitrary generator. The drawing now says so.

2. **Critical before high-power operation: combined current/thermal and receiver
   protection remain unqualified.** Nominal input ceiling is 13.61 A, with the
   documented static tolerance/TCR screen below 15 A. This is not a thermal
   rating or independent protection against firmware disabling pin limits.
   Both manual knobs can request around 500 W near unity conversion; 400 W
   is an application limit, not an autonomous hardware power clamp. Bridge
   cooling, BQ REGN dissipation, inductor/FET temperature, shunt derating,
   wiring/copper and receiver fault/disconnect behavior need physical proof.

3. **Warning: capacitor ripple and minimum capacitance do not prove stability.**
   The chosen 4+6 bulk count and split are drawn correctly. Sharing calculations
   use equal ESR and ideal CCM; ESR spread, routing impedance, mode transitions,
   startup auto-tuning and real receiver dynamics remain qualification gates.
   Larger stock footprint lands require mounting/stencil evaluation.

4. **Warning: USB protection remains bounded, not universal.** D20 and R51 are
   correctly connected. R51 adds 5 mA USB load. Low USB voltage, high load,
   hot diode leakage, ESP radio peaks and battery switchover still need tests.
   Common ground remains; there is no galvanic isolation or qualified sustained
   high-voltage-to-PC fault protection. No cell-temperature sensor or active
   total USB-current budget was added by this change.

5. **Warning: NTC is required, but thermal coverage is not established.** J33
   really is an external NTC input, not a fixed permissive TS bias. A missing
   sensor inhibits charging with the default configuration. The existing
   battery-temperature window does not establish bridge/heatsink temperature
   coverage; sensor location, attachment lag and threshold policy remain open.

Resolved during review: R75's stale metadata described an input/1 A bench
shunt. The owner corrected it to the actual 5 mOhm, 1 W output shunt with
approximately 0.5 W loss at 10 A and a PCB/hot-temperature qualification gate.
No value or connectivity change was needed.

Resolved presentation observation: C73/C81 reference fields crowded the GND
labels in the initial main-sheet render. The owner moved the fields above the
capacitors. This reviewer viewed the corrected final render and reran all 252
endpoint/part assertions against the refreshed export above; they still pass.

## Verified implementation

### Input shunt and source boundary

- R74 and J30 are absent. R1 `CSS4J-4026K-5L00F` is the sole BQ input shunt,
  local to MAIN_CONVERTER. Its old POWER_PATH location is continuous fused bus.
- F1 output feeds JP30 pin 1. JP30 pin 2 feeds R1 force pad 4. R1 force pad 1
  feeds BQ_VAC and the input switching half-bridge.
- R1 sense pad 3 feeds R80 then U9 ACP pin 30; sense pad 2 feeds R81 then
  U9 ACN pin 29. Separate schematic nets preserve the Kelvin intent. Actual
  PCB routing must still land sense traces on the correct physical terminals.
- J2 is upstream of BQ sensing and labelled external-converter variant. It is
  not a second regulated receiver branch and is not covered by BQ telemetry.
  The POWER_PATH drawing forbids simultaneous internal/J2 operation.
- R62 is `RC0805FR-071K47L`, 1.47 kOhm, with the selected 0805 handsolder
  footprint, between ILIM_HIZ pin 10 and ground. Nominal 13.605 A; initial
  worst-high 14.437 A; conservative initial/TCR screen 14.771 A. Aging,
  transients, layout errors and disabled pin limits are not covered.

### Bulk banks and output sensing

All ten parts are TDK `B40950A0566M000`, 56 uF / 80 V. All negative terminals
are ground. Verified positive-terminal groups:

| Location | Capacitors | Net |
|---|---|---|
| Before R1 | C73, C81 | BQ_IN |
| After R1, local input | C74, C82 | BQ_VAC |
| Before R75, local output | C75, C83, C84, C85 | BQ_SYS |
| After R75, receiver side | C76, C86 | BQ_OUT |

C79's ceramic is local output; C80 is receiver-side. R75 pad 1 is local
BQ_SYS and R82-to-SRP; pad 2 is BQ_OUT and R83-to-SRN. JP31 follows the shunt,
and J31 is downstream of JP31. The output shunt was not bypassed by the bank.

The installed `CP_Elec_10x10.5` footprint is a documented larger-land candidate,
not an exact match to TDK's recommended lands. R1 reuses the accepted BVR4026
four-terminal footprint after the owner's same-family physical inspection.
R75 remains WSL25125L000FEA with its existing 2512 footprint; the alternative
3 W WSLP part was not silently substituted.

### Links, USB and NTC

- J31, JP30 and JP31 have Phoenix 1711725 MPN and the standard MKDS-3-2-5.08
  footprint. JP30/JP31 explicitly represent removable rated wire loops through
  screw terminals, left OPEN before commissioning, not 2.54 mm signal shunts.
  IEC 24 A metadata is not a universal 24 A rating; agency conditions, wire,
  torque, mounting support, copper and temperature matter.
- D20 `SS1H10-E3/61T`: anode pin 2 is USB VBUS; cathode pin 1 is SYS_BAT/LDO
  input. The SMA handsolder footprint matches the selected package candidate.
  R51 is 1 kOhm from VBUS/PMOS gate to ground. No generator AUX was reintroduced.
- R72 5.23 kOhm connects REGN to TS. R73 30.1 kOhm connects TS to ground.
  J33 pin 1 is TS and pin 2 ground. Default open-NTC ratio is about 85.2% REGN,
  outside the allowed window; shorted sensor is also outside the window.

### GPIO and shared bus

R4/R6 remain 4.7 kOhm I2C pull-ups to ESP +3V3. No INA_ALERT/INA228/INA238
net remains in the export. J5's five generic GPIO paths are GPIO2, 3, 4, 8
and 10 through R7/R8/R9/R10/R34 respectively. The INA component and obsolete
R2/R3/TP1/TP2 sensing parts are absent. This verifies the requested generic
interface; it does not waive ESP strapping-pin restrictions or signal limits.

## Autonomous input thresholds

Saved R63/R64/R65 are 1 MOhm / 100 kOhm / 24.9 kOhm, each 0.1%, in series
from BQ_VAC to ground. ACUV is the upper tap, ACOV the lower tap. TI SLUSEN5A
thresholds produce:

| Event | Nominal bus voltage |
|---|---:|
| ACUV falling, suspend | 9.907 V |
| ACUV rising, allow again | 10.357 V |
| Input-voltage current foldback, ACUV pin | 10.898 V |
| ACOV rising, suspend | 54.212 V |
| ACOV falling, allow again | 51.953 V |

Restart figures use typical 50 mV comparator hysteresis. Comparator thresholds
plus initial resistor tolerances give approximately 9.844..9.979 V for UV fall
and 53.385..54.590 V for OV rise, excluding temperature drift, input bias,
noise and overshoot. Thus this drawing does not promise sustained operation
at exactly 55 V or startup near the IC's advertised 4.2 V minimum. ACOV is a
conversion inhibit, not an input disconnection or a replacement for surge control.

The ACUV pin also sets input-voltage regulation using VACUV_DPM = 1.210 V,
not the 1.1 V undervoltage stop reference. Its initial tolerance screen gives
10.771..11.025 V for current foldback. A higher VAC_DPM register setting raises
the effective floor. Passing the startup threshold does not imply full-current
operation at every lower generator voltage.

## Compensation check

TI SLUSEN5A section 6.3.3.3 integrates the compensation and determines its
parameters with approximately 40 ms startup switching. There is no external
COMP RC network to resize. Table 7-4's R1/C1/gm1 are internal parameters:
**that R1 is not this board's current shunt R1.**

Recommended input and output minimum is 80 uF after derating. Bulk-only minima
at -20% are 179.2 uF input and 268.8 uF output. Section 7.2.1.2.9 further
requires boost bandwidth around no more than one third of its right-half-plane
zero, with parameters depending on output voltage and EN_CONV_FAST_TRANSIENT.
Minimum capacitance and ripple checks therefore do not prove stable operation.
Validate cold/hot startup auto-tuning, split-bank impedance, buck/boost boundary,
load/current steps, CC/CV transitions and actual receiver behavior before
releasing operating profiles. No arbitrary external RC substitution is justified.

## Evidence limits

Viewed owner renders `main_converter_tbd-final.png`, `lv_power_usb_tbd-final.png`
and `power_path-final.png` in `.konnect-scratch/v2-adaptive-2026-10-08/`.
Their warnings distinguish provisional capability from qualification. Owner ERC
contains eight sheets and zero reported violations under inherited ignored
categories: single_global_label, four_way_junction, simulation_model_issue and
footprint_filter. Those exclusions were not introduced by this reviewer and
zero ERC does not prove physical models, stability, thermal margins or safety.

The final BOM snapshot agrees with reviewed power-part MPNs/footprints. The
owner added the sourced EUR observations for D20, TDK capacitors and Phoenix
terminals. R1 is correctly grouped MAIN and uses an explicitly labelled EUR
engineering allowance; its underlying USD stock observation is recorded
separately, not misrepresented as an EUR quote or exchange-rate conversion.
Other remaining missing prices are not zero-cost parts.

Manufacturer evidence, archived hashes, stock observations and calculations:
`../../components/ti-bq25756/POWER_STAGE_UPRATE_2026-10-08.md`.
PCB is not synchronized/qualified by this review. No DRC, hardware simulation,
temperature measurements, receiver charging tests or fabrication submission
were performed by this reviewer.
