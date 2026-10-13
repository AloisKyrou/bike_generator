# Controller V2 development

## Protection decision, 10 October 2026

Latest clarification selects [one input fuse at RECTIFIED_RAW](docs/SINGLE_INPUT_FUSE_2026-10-10.md),
already present in the saved circuit. F_SRC is removed from the base accessory
BOM; the conditional battery-side fuse remains. F1 does not clear upstream
bridge/input-cable faults, so unfused energy-rich DC sources remain unsupported.
The earlier direction below is superseded on this input-fuse point.

The [minimum-cost protection baseline](docs/MINIMUM_PROTECTION_DECISION_2026-10-10.md)
is selected: retain onboard F1/TVS, use solderable source-adjacent fuses only
where the source requires them, no holders or additional active reverse/backfeed
controller. See the [accessory BOM](bom/protection-accessories.csv). This is a
documented harness/design decision, not a new schematic revision or a safety
qualification. The saved schematic checkpoint below remains unchanged.

## Current 70 V-class prototype

The [authorized input/output revision](docs/VOLTAGE_RANGE_REWORK_2026-10-08.md)
is saved: **146 components, 125 nets, eight sheets**. Start with the
[review PDF](kicad/exports/review-voltage70-2026-10-08/controller-v2.pdf),
[engineering and validation report](docs/SCHEMATIC_VOLTAGE70_2026-10-08.md), and
[cost dashboard](bom/COST_DASHBOARD.md).

Four 100 V power MOSFETs, twelve 100 V bulk capacitors, revised input thresholds,
guarded manual/app voltage dividers and a selector drain clamp are drawn.
The external-converter J2 is removed. Both trimmers, MCP4251 with one spare
channel, GPIO20 selection, BQ current control/telemetry and native USB with
optional protected 1S cell remain. No AUX or internal dump.

**70 V class is not a guaranteed 70 V output.** Nominal app reach with reference
trim is about 67.66 V; modeled worst-corner reach is about 64.37 V. Therefore
67.2 V charging is conditional on each board's range/calibration. Input ACOV
screens about 67.47-69.68 V; it stops switching, not external surge exposure.

ERC and exported-netlist regression checks pass, but this is **not an energization
or fabrication release**. Generator surge and receiver fault protection,
manual/app brownout, thermal/ripple/stability, USB/cell behavior and PCB layout
remain unqualified. L3's terminal limit remains 75 V. Approximately 400 W is
an ambition, not a qualified rating or autonomous power cap.
JP20/JP30/JP31 remain open. V1, firmware and the copied V2 PCB are unchanged.

## Historical 55 V continuation

The 8 October schematic continuation is saved: **142 components, 122 nets,
eight sheets**. Start with the
[review PDF](kicad/exports/review-continuation-2026-10-08/controller-v2.pdf),
[change and validation report](docs/SCHEMATIC_CONTINUATION_2026-10-08.md), and
[review/qualification guide](docs/REVIEW_AND_BRINGUP_2026-10-08.md).
The [BOM dashboard](bom/COST_DASHBOARD.md) tracks component costs and omissions.

Drawn changes include MCP4251 independent manual/app voltage selection with a
spare 50k channel, BQ-only telemetry, a shared 5 mOhm Kelvin input shunt, an
approximately 13.6 A nominal input limit, larger capacitor banks and selected
USB diode/main service terminals. Both manual trimmers, native USB, the five
generic GPIOs and status LED remain. GPIO20 selects app voltage when low and
manual when high/floating. No generator AUX or internal dump is added.

This continuation adds eight bare probe pads, removes the grounded K1.9 idle
contact to avoid one relay pole-skew hazard, and specifies the external 103AT-2
sensor. Eight MLCCs now have exact selected MPNs, with larger hand-solder
footprints on seven positions; R75 uses equivalent FEB reel packaging for
sourcing. The [readiness review](docs/CONTINUATION_READINESS_REVIEW_2026-10-08.md)
explains charger-versus-appliance startup and high-side gate-drive margins.
The preceding adaptive export remains intact for comparison.

Native ERC reports zero under the unchanged inherited ignore settings, with
independent endpoint checks recorded in the report. **Not a build or power-up
release:** receiver-safe power-loss switching, generator overvoltage protection,
thermal/ripple/stability qualification, USB/cell behavior and PCB layout remain
unfinished. Approximately 400 W output is an ambition, not a qualified rating
or autonomous cap. 55 V is a ceiling, not a guaranteed setpoint; full 13S lithium
charging at 54.6 V is not supported by the present range claim.

JP20/JP30/JP31 remain open. V1, firmware and the copied V2 PCB are unchanged;
the PCB is not synchronized with this schematic. Per-sheet decisions are in
the [explanation guide](docs/explanations/README.md).

## Historical development notes

The following chronology is retained for context. Older "latest" and "saved"
statements, counts and review links do not supersede the adaptive checkpoint
above. In particular, MCP42100, INA and the fixed 1 A input study are no longer
the active V2 assembly.

Start with the [design explanation guide](docs/explanations/README.md): general
implementation notes, converter alternatives and one page per schematic sheet.
Scope clarification (8 October): the first physical prototype must target the
full agreed adaptive functionality, not a separate fixed 12 V / 1 A board.
The existing study is unfinished design work. Low-power commissioning belongs
on the eventual full-function board; it does not replace the completion criteria.
See [implementation and acceptance](docs/explanations/IMPLEMENTATION_NOTES.md).

Latest control direction (8 October): retain BQ25756 and the dual MCP42100.
Allocate channel 1 to a protected CV interface; leave channel 0 spare on J7.
The [single-channel feasibility study](docs/BQ25756_IMPLEMENTATION_NOTES.md)
has started, but the analog connection is not yet implemented or qualified.
No schematic change is claimed by that study.

Active selection (7 October 2026): **BQ25756**, with **55 V normal input/output
working ceilings**, supersedes the earlier 80 V / roughly 60 V comparisons below.
Follow the [overall BOM/cost tracker](bom/README.md) for current inventory and
unfinished-block allowances. One receiver output; no internal dump circuitry.
These are design decisions, not verified hardware ratings.

Status: **USB/optional-cell power, manual controls and BQ host interface drawn;
electronic CV, main-power qualification and protection unfinished, not build-ready**.

Open the [latest 8 October review PDF](kicad/exports/review-completion-2026-10-08/controller-v2.pdf)
and [progress report](docs/SCHEMATIC_COMPLETION_2026-10-08.md).
The saved hierarchy contains 135 components and 120 nets. Native ERC has zero
violations under inherited settings; 246 endpoint/model/preservation checks
pass, and 42 deliberately broken netlist fixtures are rejected. This is a
schematic checkpoint, not permission to energize the new main stage.
BQ I2C now connects to ESP/INA through R68/R69; R71 pulls CE low for cold-start
permission without using another GPIO. This does not reset retained BQ settings
when the ESP stops. The independent manual/app CV selector is still missing.

The active MCU sheet uses ESP32-C3-MINI-1-N4X with reset/boot, native USB and
five configurable external GPIOs on J5 and a GPIO21 status LED. USB is the only external logic-power input, with
an optional protected USB-charged 1S cell. The generator AUX 5 V circuit and
TPS2116 source mux have been removed from the active hierarchy. USB has its
own interface sheet. The 8 October user direction replaces BQ24074/TPS63031
with Beetle's TP4057 charger, diode/PMOS selection and RT9080 3.3 V LDO.
Local wiring is continuous; the charger and LDO use leaded SOT/TSOT packages.
Q20 is AOS AO3401A, D21 Kingbright WP710A10LGD, and R45 a rated Bourns 0.82 ohm
0.5 W resistor. D20's exact diode remains unresolved. JP20 leaves charging
disabled until the protected cell, source budget and temperature conditions
are qualified. There is no cell NTC input, JP21 logic switch or JP22 USB100/500
selector in this topology. Disconnect the optional cell for storage.
J20 is a test header, not an external 3.3 V input. USB-only radio startup,
source-current policy and main-converter protection remain unqualified. Read
the [latest Beetle power decision](docs/BEETLE_POWER_DECISION_2026-10-08.md)
and [assembly constraints](docs/explanations/ASSEMBLY_NOTES.md).
The user-approved BQ25756 symbol has been created and verified against all
37 pins. The main sheet now contains its support, four MOSFETs, inductor,
shunts, filters, bootstrap circuits and provisional capacitor banks. It uses
a fixed approximately 12 V / 1 A study configuration with open commissioning
boundaries, not the future universal voltage/current profile. Main-stage work
remains isolated until its safety gates close.

The previous AUX-powered proposal is preserved in the
[verified abandoned-AUX archive](../archive/v2-abandoned-auxiliary-5v-2026-10-07/README.md).
The historical 6 October presentation pass follows the V1 corrections in `583232d` and
`aefcb01`: direct local wiring, grouped supporting parts and fewer repeated
labels on the MCU/LV sheets. Its 106-component/90-net evidence applies only to
that archived circuit, not the electrically changed USB-only revision. See the
[presentation report](docs/SCHEMATIC_PRESENTATION_2026-10-06.md); its drawing
conventions remain recorded in [AGENTS.md](AGENTS.md).
The [first increment report](docs/SCHEMATIC_PROGRESS_2026-10-06.md) is historical.
V1 and the copied V2 PCB remain unchanged; no firmware work was performed.

Latest research scope (2026-10-05): the user wants broad second-hand generator
and receiver coverage, including e-bike batteries and an own-motor trainer.
Start with the [compatibility decision pack](docs/compatibility/README.md).
Its broad-use recommendation reopens buck-boost / approximately 60 V output;
the earlier 12-32 V buck recommendation applied to the narrower current setup.
The earlier study does not select components or implement circuitry.

User direction (2026-10-06): support an integrated-converter assembly and an
external-converter assembly with the internal main stage omitted. External buck,
boost and buck-boost modules need qualified hardware/control profiles; software
cannot make an arbitrary module compatible. **No internal dump load or optional
dump-stage footprints**: external-load control belongs to the generic GPIO
interface only. See the dated decisions in the
[architecture specification](docs/CONTROLLER_V2_INTEGRATED_SPEC.md).
These remain design requirements, except for the first unqualified logic-level
PWM/ready interface. No external accessory power stage is on the mainboard.

Fablab/accessibility requirement: design one full-scope reference with documented
lower-cost assembly variants. A qualified DC generator can use a protected DC
entry with the AC rectifier omitted; this is independent of internal/external
converter selection. Publish exact fitted/DNP BOMs, required links, limitations,
configuration and tests for each supported build. Keep only a few tested prebuilt
versions initially; the full-feature prebuilt offering can follow later. The
reference scope is not a promise of universal compatibility or an internal dump.

User-confirmed operating baseline (2026-10-05): the scooter generator produces
approximately 36 V and the existing buck supplies 24 V to the AC50S. Boost is
unnecessary for this working setup. V2 starts from that buck-only use case;
buck-boost research concerns optional broader source/receiver compatibility,
not a missing function in the current installation. The final V2 scope remains
open; this confirmation is not a full cadence/thermal qualification.

Open [bike-generator-controller-v2.kicad_pro](kicad/bike-generator-controller-v2/bike-generator-controller-v2.kicad_pro).

- [Integrated architecture](docs/CONTROLLER_V2_INTEGRATED_SPEC.md).
- [Output receiver study](docs/OUTPUT_RECEIVER_STUDY.md).
- [Existing converter reference designs](docs/POWER_CONVERTER_REFERENCE_STUDY.md).
- [BQ25756 implementation calculations and gates](docs/BQ25756_IMPLEMENTATION_NOTES.md).
- [USB and logic-power fault cases](docs/USB_AND_LV_FAULT_REVIEW.md).
- [Buck-only effort, 30 V output and pedal feel](docs/BUCK_ONLY_AND_PEDAL_FEEL.md).
- [Copy provenance and verification](docs/BASELINE_AND_MIGRATION.md).
- [BOM status](bom/README.md).
- [Component candidates and pilot cost](bom/CANDIDATES_AND_COST.md).
- [Shared manufacturer references](../components/README.md).
- [Shared measurements](../measurements/README.md).

The project and libraries were copied from V1 on 2026-10-05. Konnect renamed
the project and updated hierarchical project-instance references. The first
schematic increments change the MCU and low-voltage subsystems. The inherited
input path, sensing and external CC/CV control still need V2 qualification. Routing
is still V1 and does not match the new schematic. The old 80 V target is
superseded. There is no qualified integrated power converter or USB fault
barrier. Automatic soft power is not a requirement added by this simplification.

Each revision owns its libraries. The inherited `INA228_SENSE` name and V1
silkscreen remain; U1 is INA238. A module's own V2 suffix is not our PCB revision.

Next tasks: qualify remaining power-part models, CV range selection and USB current /
fault behavior; define independent output protection and converter
interfaces. Select representative donor motors and one documented e-bike
battery/charger. Measure generator voltage versus cadence and receiver
acceptance before finalizing the operating envelope.
No V2 manufacturing or purchasing release exists.
