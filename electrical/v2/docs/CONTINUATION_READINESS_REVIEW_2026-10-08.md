# V2 continuation readiness review

8 October 2026. Independent read-only engineering audit of the 134-part adaptive
checkpoint, beyond matching schematic endpoints to the intended drawing.
The subsequent continuation is independently checked below against its frozen
142-part export. No native design, firmware or PCB was changed by this reviewer.

## New actionable findings

### 1. Cold-start charging is not generic supply mode

**Severity: functional/safety-profile warning.** U9 cold defaults enable trickle,
precharge, termination and the charge timer. The previous generic instruction
to start into a resistive/electronic dummy load did not explain this difference.
A load can prevent the output reaching the transition thresholds. Increasing
the source current limit or declaring the converter defective is not the right
response without checking its charging-state registers first.

The [TI datasheet](https://www.ti.com/lit/ds/symlink/bq25756.pdf), archived as
`../../components/ti-bq25756/bq25756.pdf`, is SLUSEN5A, August 2026. Relevant
sections: 6.3.4.1/6.3.4.1.1, 6.3.4.4/6.3.4.5, and register tables 6-15..6-18.
Exact defaults and important distinctions:

| Quantity | Default or documented behavior |
|---|---|
| EN_PRECHG / EN_TERM | Both 1 after register reset |
| EN_CHG_TMR | 1; nominal fast-charge timer 12 hours |
| Precharge timer | Nominal 2 hours; disabled with EN_PRECHG=0 |
| Trickle exit | Actual SRN output voltage about 3 V, specified 2.8..3.2 V rising |
| Precharge exit | VBAT_LOWV register resets to 71.4% of the selected CV target |
| Hardware precharge limit | 20% of the resistor-programmed ICHG ceiling |
| Hardware termination threshold | 10% of the resistor-programmed ICHG ceiling |
| IPRECHG register | Default 4 A; programmable 0.25..10 A in 50 mA steps |
| ITERM register | Default 2 A; programmable 0.25..10 A in 50 mA steps |
| Recharge threshold | Default approximately 97.6% of the CV target |

The older summary table's 66.7% precharge entry conflicts with the explicit
register reset and recommended Li-ion table. Use the 71.4% reset code and
verify the actual register, not that stale summary entry. Electrical threshold
accuracy is wider than the nominal number.

[TI support on this exact device](https://e2e.ti.com/support/power-management-group/power-management/f/power-management-forum/1372168/bq25756-question-about-ibat_short-and-vbat_short)
identifies trickle current as approximately 150 mA. This is not a datasheet
guaranteed minimum/maximum. [TI startup guidance](https://e2e.ti.com/support/power-management-group/power-management/f/power-management-forum/1451199/bq25756-startup-without-battery)
describes small current pulses and confirms EN_PRECHG=0 disables trickle and
precharge. Do not assign the precise precharge current to the trickle phase.

For a resistor, the simple diagnostic equations are:

```text
Cout * dVout/dt = Icharge - Vout/Rload
Vout_equilibrium = Icharge * Rload
```

At a 12 V target, the nominal precharge exit is 8.57 V. A 12-ohm resistor
intended to test 12 V / 1 A instead equilibrates around 1.8 V at the approximate
150 mA trickle current: it may never leave trickle. Even the nominal 0.2 A
resistor-derived precharge value at a 1 A ceiling would support only 2.4 V
into that resistor. These are diagnostic screens, not measured behavior.
Reproduce the examples with
`node electrical/components/ti-bq25756/power-stage/startup-screen.mjs`.
Its assertions pass. A calculated equilibrium above a phase boundary means
that phase can nominally be exited, not that output exceeds the CV target.

The 250 mA register floor must not be invented as a guaranteed clamp for a
resistor-derived precharge value below it. Likewise a 1 A mechanical ceiling
implies nominal 100 mA termination, below the documented 250 mA register range.
Low-current accuracy/behavior needs measurement before a battery profile can
rely on those values.

**Separate phase settings matter.** Lowering ICHG_REG does not establish the
same fractional change to IPRECHG or ITERM. At the approximately 9.11 A manual
ceiling, hardware precharge is about 1.82 A. A host setting of 1 A fast-charge
current must not be treated as proof that precharge is 0.2 A: set and read back
the separate precharge/termination registers for a qualified battery profile.
Do not generalize the lower-of-two-fast-charge-limits rule to every phase.

### Receiver and reset matrix

| Receiver/state | Cold BQ default | Required review or qualified host profile |
|---|---|---|
| No receiver or disabled electronic load | Can charge output capacitors, then terminate; continuous regulated no-load output is not promised | Observe CHARGE_STAT and output ripple/recharge; do not misdiagnose completion as a fault |
| Resistor drawing substantial current below 3 V | Trickle may never raise voltage enough to start | Initially disable load or use a suitably light diagnostic load; check phase before applying load |
| Electronic constant-current/constant-power load enabled from zero | Can hold output low or cause repeated restarts | Use load undervoltage inhibit/delayed enable and a documented startup sequence |
| Station/MPPT input, for example 12 V minimum with 24 V target | May start drawing before the 17.14 V precharge exit and collapse the limited source | Test receiver startup and source interaction; use a supervised non-battery supply profile only after qualification |
| Direct lithium battery at valid voltage | Autonomous charging phases can operate | Correct chemistry, CV, separate phase-current limits, termination, sensor placement and pack/BMS approval required |
| Direct lead-acid or other chemistry | Lithium defaults are not a qualified charging algorithm | Explicit chemistry-specific profile; do not disable protections or approve charging merely because voltage matches |
| Supercapacitor/non-battery supply profile | POR does not select this profile automatically | TI recommends EN_PRECHG=0, EN_TERM=0, EN_CHG_TMR=0 for supercapacitors; adapt and qualify for a supply load, while retaining current, voltage and TS protections |
| ESP disappears while BQ remains powered | Not a cold reset; selected registers may remain, others can change on watchdog expiry | Check retained values, watchdog reset map and receiver policy; relay-to-manual CV does not restore an entire charging profile |

No raw I2C register writes or firmware changes are authorized by this document.
In particular, the non-battery settings must not become global defaults applied
to a real battery. No resistor-only change makes these volatile mode settings
survive a full BQ power cycle.

### 2. Specify the external NTC, not just its 25 C resistance

**Severity: correctable assembly ambiguity.** J33's 5.23 kOhm / 30.1 kOhm network
uses the TI-recommended **Semitec 103AT-2** curve. An arbitrary 10 kOhm NTC can
shift both temperature thresholds and JEITA transitions. Requested correction:
name 103AT-2 at J33 and in the external-accessory list; keep J33's actual Harwin
connector MPN unchanged. Sensor location and thermal coverage remain unqualified.

Semitec's [AT extract](https://www.semitec-global.com/uploads/2022/01/P12-13-AT-Thermistor.pdf),
pages 12-13, specifies 10 kOhm +/-1% at 25 C, B25/85 3435 K +/-1%, -50..110 C.
Figure 2 shows 2.54 +/-0.25 mm lead pitch, 0.5 mm square leads and 17 +/-1.5 mm
overall length. It is nonpolar and is an external sensor assembly here, not a
new PCB footprint. Keep bends at least 3 mm and solder joints at least 5 mm
from the sensor head; provide insulation and strain relief. Approximate 15 s
air thermal time constant does not qualify its response when attached to a
battery or heatsink. Bare sensor leads are not a qualified mating harness.

The [DigiKey FR observation](https://www.digikey.fr/en/products/detail/semitec-usa-corp/103AT-2/16579059)
on 8 October: 5,634 stocked; EUR 0.60 single / 0.498 at ten, excluding VAT.
One external sensor is separate from the fitted J33 header. Contacts, cable,
attachment and assembly costs are additional, not hidden in that sensor price.

Archived `../../components/ti-bq25756/power-stage/semitec-at-extract.pdf`, SHA256
`389DC527ED8D783CBBF94DB460504E26D17993020D8D3627056499A9264B3262`.
The two-page extract has no explicit revision date; the companion catalogue
129M is dated 2019-08-30 and archived as `semitec-at-thermistors.pdf`, SHA256
`0914F59F843E367F55E9887D3FFC748296EA63D67E1696D7A145AF7429DF5BDB`.
The extract's physical drawing was rendered and viewed. The larger catalogue's
local rendering dropped some dimension fonts, so it was not used to infer
missing geometry.

### 3. High-side gate drive needs its own voltage-margin check

**Severity: thermal-model warning, not a demonstrated switching failure.**
Q10/Q12 high-side gate voltage is not simply REGN. D10/D11 diode drop,
C65/C66 bootstrap droop and gate-driver losses reduce BTST-SW and VGS.
With 62 nC gate charge and nominal 100 nF, Q/C alone is 0.62 V per charging
event; actual effective capacitance, load and recharge timing matter.

SIR680's 3.55 mOhm maximum applies at VGS=4.5 V. REGN's 4.8 V lower value
minus bootstrap losses does not guarantee that gate voltage throughout the
on interval. Thus the prior two-device 1.6 W conduction arithmetic is a screen,
not a guaranteed high-side loss bound. Scope HIDRV-SW and BTST-SW with appropriate
differential probes across operating ratios, especially near unity and high
duty cycle, before assigning continuous current/thermal ratings. Do not connect
an earth-referenced probe ground to a switching node.

No blind bootstrap-capacitor, diode or gate-supply change was selected. Larger
capacitance affects recharge demand; an external driver rail changes cost and
architecture. Archived V1FM10, SIR680 and BQ datasheets are the evidence; the
V1FM10 is a 100 V Schottky, not a 1000 V slow rectifier.

## Rechecked limits and already-known gates

BQ recommended junction limit is 125 C; thermal shutdown is not an operating
rating. The retained 10 uH inductor and 250 kHz setting are inside the published
nominal ranges, and selected bulk minima exceed 80 uF; those facts do not settle
hot DCR, DC-bias inductance, split-bank stability or ripple sharing.

USB logic still has no active total-current limiter or source-contract manager.
The separate 400 mA cell charger can add to ESP/relay load. Keep JP20 open for
USB-only/PC qualification; a 5.1 kOhm Type-C sink termination by itself does not
authorize arbitrary current. Copying Beetle is not compliance proof. This is
an already-known gate, not a newly discovered diode-polarity defect.

Previously documented generator overvoltage/TVS coordination, receiver-safe
relay brownout, common-ground PC exposure, missing output fault disconnect,
thermal design, exact cell charging and unsynchronized PCB remain unresolved.
No new architecture or unknown custom component was silently introduced to
make those issues appear closed. Verdict remains **not ready for energization
or manufacture**; the useful progress is corrected assembly/profile guidance
and explicit measurements that can discriminate real failures.

## Final saved continuation audit

Independently inspected the sole owner's frozen export under
`../kicad/exports/review-continuation-2026-10-08/`:

- XML `controller-v2.xml`, 142 components, 122 nets, eight sheets; SHA256
  `6EBC69D56D811BC8E678B54F1C67C29F1729890CC4B2033891B77555B87F45EA`.
- PDF `controller-v2.pdf`; SHA256
  `71BF77B60FCEBCF0B4BF1051133511F4C826DD6056A5CDF29E9A82A8BCFEC146`.
- Native owner-generated final ERC has zero violations across all
  eight sheets. The unchanged inherited ignores are `single_global_label`,
  `four_way_junction`, `simulation_model_issue`, and `footprint_filter`.
  This reviewer inspected that result but did not launch a competing KiCad CLI.

### Connectivity and preservation

The complete old/new exported endpoint-set comparison is identical after
excluding the eight intentional probe-pad additions and K1 pin 9. It is not
merely a comparison of net names. The only changed existing component records
are C4, C62, C63, C64, C68, C69, C71, C72, J33 and R75. No IC, shunt-value,
current-limit, USB data or USB power connectivity changed.

| New pad | Verified endpoint |
|---|---|
| TP40 | U9.12 FB, permanent R66 upper resistor and relay common |
| TP41 | U9.9 ICHG and R61 |
| TP42 | U9.10 ILIM_HIZ and R62 |
| TP43 | U9.24 REGN / U9.23 DRV_SUP |
| TP44 | Main ground |
| TP45 | U3.6/U3.7 P1W/P1A and clamp/bleeder node |
| TP46 | Q21.1 control gate / Q22 drain, before R88 |
| TP47 | Selector ground |

All eight are `TestPoint:TestPoint_Pad_D1.5mm`, not connectors or fitted power
outputs. Keep FB/AW pads local with no branch trace; a long probe lead or large
probe capacitance can change the circuit being measured. These pads are not
permission to drive the nodes from an external source.

K1.9 is now a singleton `unconnected-(K1-Pad9)` net with no GND connection.
R85 and grounded MCP B still define the idle digital node. This closes the
specific grounded-end/pole-skew mechanism described in the
[selector continuation](../../components/v2-cv-control/SELECTOR_CONTINUATION_2026-10-08.md),
not the pre-release low-rail wiper uncertainty or all contact/transient faults.

Reviewer reruns: 252 power-path/part assertions and 47 CV endpoint assertions
pass on this exact XML; the nominal startup arithmetic script also passes.
The 252 count includes helper uniqueness checks, not 252 independent physical
failure modes. Owner fixture results remain separate evidence; no hardware
tests are implied by any of these checks.

Read-only hashes against the owner's pre-continuation baseline independently
confirm all 22 V1 native/library files and all 27 V2 library files unchanged.
Only `cc_control.kicad_sch` and `main_converter_tbd.kicad_sch` changed among
the saved V2 project files. The copied PCB, project settings, USB, logic-power,
MCU, power-path and connector sheets remain byte-identical.
All 15 entries in the owner's final `source-hashes.csv` independently match
the saved files; `preservation.json` agrees with the independent baseline check.

The two changed source hashes at review are:

| File | SHA256 |
|---|---|
| cc_control.kicad_sch | E10A8CF01E2EFF70FC21545629182F52CB8B02AB2A14E8807DD59B6F15B4CC74 |
| main_converter_tbd.kicad_sch | 79F9EF45808061377FE2A85C2D28A2150FF8E81B4A8EBEA3945372F9AE578EEE |

### Parts and drawing review

J33 now explicitly says `103AT-2 NTC REQUIRED` while its fitted connector MPN
remains `M20-9990246`. The sheet includes the 3435 K curve/tolerance note.
The external sensor is still an accessory; its thermal placement, harness and
fault response need qualification.

C4/C63/C64/C68/C69/C71/C72 are the selected TDK
`C2012X7R2A104K125AA`, 100 nF / 100 V, using stock 0805 hand-solder footprints.
C62 is KEMET `C1206C105K1RACTU`, 1 uF / 100 V, using a stock 1206 hand-solder
footprint. Independently inspected owner Konnect physical-model responses:
two nonpolar symbol pins and two copper pads per part; nominal F.Fab bodies
2.0 x 1.25 and 3.2 x 1.6 mm, matching documented body families. The KEMET
primary dimensional render and disposable footprint render were also viewed.
The disposable footprint value labels overlap, but copper/pad shapes remain
visible; that is not the actual PCB or evidence of PCB-placement acceptance.
Effective capacitance at DC bias, soldering and mounting remain checks, not
benefits established by a 100 V label.

R75 is now `WSL25125L000FEB`, still 5 mOhm / 1% / 1 W on the same 2512
footprint. [Packaging evidence](../../components/ti-bq25756/power-stage/R75_PACKAGING_2026-10-08.md)
establishes the manufacturer-defined EA/EB equivalence and the distributor's
listed stocked alternative. This is not a higher-power substitution. Exact
inventory must be rechecked; a conservative quantity-ten allowance is not a
quoted quantity-ten price.
The regenerated overall BOM matches these selected MLCC, J33 and R75 records;
R75's ten-unit basis is correctly marked conservative rather than quoted.

Viewed both final schematic-sheet renders: local wires and new pad labels are
readable, K1.9's no-connect is visible, and prototype warnings remain present.
The final annotation-only pass separates TP44 from the manual CV label and
explicitly says to begin with the load disabled and follow the startup-profile
review. Its fresh XML/PDF hashes above supersede the earlier same-day export;
252 power and 47 CV checks and the full endpoint-set comparison were rerun.
No new correctable connectivity, polarity or component-family mismatch was
found in this bounded final pass. The three new engineering findings above
remain relevant: startup profiles need qualification, sensor ambiguity is now
corrected, and high-side gate-drive margin still needs measurement.

**Verdict: NOT READY for energization or manufacture.** This is complete
read-only coverage of the continuation's saved changes and whole-hierarchy
endpoint preservation, not a full PCB/fabrication review. PCB DRC, layout,
physical assembly, transient tests, receiver approval and safety qualification
were not performed. The unchanged inherited release gates are not waived by
zero ERC or the now more specific BOM. The reviewer also contributed sourcing
and arithmetic studies; this is independent saved-design readback, not an
independent laboratory certification.
