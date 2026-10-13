# Shared heatsink and assembly

## Heatsink sourcing deferred by user

User will later find a sufficiently large heatsink plate and adapt/drill its
mounting, including M4 tooling. Do not block schematic engineering or demand
an exact heatsink reference now. Retain the common parallel-plate arrangement,
insulated live MOSFET tabs and103AT-2 plate sensor.

The exact extrusion and plate drilling may follow PCB planning. Before freezing
the PCB, still establish component contact heights, AOY lead-form feasibility,
clamp/tool access, underside electrical clearance and antenna metal keepout.
Reserve suitable mounting areas; do not invent finalized hole locations or
assume a drilled plate resolves incompatible component heights. This deferral
does not qualify cooling performance or authorize fabrication. Validate the
actual assembly thermally before declaring a sustained power rating.

User clarification, 12 October 2026: a common passive heatsink parallel beneath
the PCB, with the contacting hot components on the facing side and screws at
the sides/corners, like the user's photographed buck. This supersedes the
earlier unspecified orientation; a vertical side wall is not the target.
The photo does not show the underside contact or electrical insulation.
Fan remains a later option. Dimensions, pressure and attachment details are
not fixed. Do not freeze routing before resolving the mechanical stack.

## Parallel plate implementation

Target stack: PCB, hot-part thermal surface, electrically insulating thermal
interface where required, common heatsink. Reserve the opposite face for tall
capacitors and other parts not requiring direct contact. Not every hot part
has a usable outward-facing thermal surface or the same height.

Spacers/stops and a suitable clamp arrangement must control contact pressure
without bending the PCB or making solder joints carry the mounting load.
Corner screws alone do not guarantee contact at each component. Resolve height
differences with a documented stack, not an arbitrary thick thermal pad.
Check underside lead/solder clearance, insulation and service access.

The saved AOY vertical footprint is NOT an accepted solution for this parallel
plate. Its short 3.2-3.4 mm leads do not establish that it can be bent and laid
flat beneath the PCB. Keep the electrical selection provisional until a
section view and physical lead-form/assembly check establish a workable mount;
an alternative package may be needed. Do not silently substitute one.
Likewise, DPAK is not automatically a solution: its drain thermal pad normally
faces the PCB, and pressing its plastic top against the plate does not recreate
the specified junction-to-case thermal path.

## Contact priorities

| Part | Intended thermal path | Precaution |
|---|---|---|
| D2 DBI25-16A | Case to common heatsink, priority | Isolated case; specified mounting and thermal interface |
| Q10-Q13 AOY66923 | Drain back, insulating interface, heatsink; priority | No mounting hole; suitable clamp required; tabs are live |
| L3 | PCB copper and air initially; assess additional contact | Do not assume molding is a qualified insulating thermal pad, crush it or surround the magnetic path with metal without checking |
| U9 BQ25756 | Exposed ground pad to PCB copper/vias | Top plastic contact does not replace the underside path; an isolated PCB-to-plate path may be studied |
| R1/R75 | Copper spreading, preserved Kelvin paths | No metal contact that could bridge force/sense pads |
| Logic regulator/charger | Local copper and qualified current | These can heat during USB charging without pedaling |
| Electrolytic capacitors, optional1S cell | Keep away from hot zones | Do not clamp capacitor tops, cover vents or warm the cell against the plate |

The plate is not an intended electrical return. Accessible/floating/bonded
status remains an enclosure decision. MOSFET drain backs are connected to:
Q10=BQ_VAC, Q11=BQ_SW1, Q12=BQ_SYS, Q13=BQ_SW2. Bare contact to one metal plate
would short these nodes. Thermal grease alone is not electrical insulation.
Specify a rated insulating thermal pad/sheet and clamp, including temperature,
working voltage, thickness, pressure and puncture resistance. Check isolation
after mounting. Neither exact interface nor clamp has been selected/priced.

The archived Diotec DBI datasheet (24March2026,pp1-2) specifies isolated case,
terminal-to-case isolation>2500V, M4 torque1Nm +/-10%, typical RthJC4.3K/W per
diode and0.7K/W per complete device under its stated conditions. Do not apply
the per-diode value to total bridge heat or infer overload immunity.
[Official datasheet](https://diotec.com/files/diotec/productfiles/datasheet/dbi25005a.pdf).

## Heat budget, not rating

The bridge conducts through two diodes at a time. Assuming1V per diode gives
about20W at10A DC output as an order-of-magnitude example, not a worst-case
bound: generator waveform/current pulses/temperature matter. D2 can dominate
loss. Normal J1 DC input bypasses D2, so AC and DC thermal budgets differ.

The [AOY arithmetic screen](../../components/aoy66923/thermal-screen.mjs) uses
triangular CCM ripple at8uH/212kHz, ideal duty and assumed95% boost efficiency:

| Converter point | Four-FET conduction at15mOhm | Assumed hot30mOhm |
|---|---:|---:|
| 36V to24V,150W output | 1.23W | 2.45W |
| 12V to24V,120W output | 3.36W | 6.71W |
| 36V to48V,400W output | 4.17W | 8.35W |
| 60V to48V,400W output | 2.16W | 4.33W |

Hot factor2 is a sensitivity, not guaranteed Rds at our actual gate waveform.
Switching/diode, inductor/core, shunt, controller and bridge losses are omitted.
These are not measured efficiency values or a400W qualification.

Example:30W of heat into40C air with a75C sink requires sink-to-air resistance
no more than1.17K/W;40W requires0.875K/W. These are illustrative heat budgets,
not a complete loss calculation. Junctions are hotter still:
Tj=Tsink+Plocal*(Rjc+Rinterface), with additional local plate gradients.
75C is NOT an accepted touch-temperature limit; enclosure guards matter.
"Large" alone does not establish thermal resistance.

## Thermal sensor decision, 12 October 2026

User confirms the existing external Semitec103AT-2 thermistor on the common
heatsink, using J33/R72/R73 and BQ TS. No additional GPIO, IC, deliberate heater
or analog constant-power limiter is selected. Existing board circuitry remains
unchanged; the remote sensor, insulated wiring and attachment must be included
in the assembly accessories without double-counting the J33 board connector.

Keep the real temperature measurement. This is heatsink monitoring, NOT
receiver-battery temperature monitoring or a guaranteed400W cap. Direct battery
charging profiles still need appropriate battery-temperature protection; the
small optional logic cell is also outside this sensor's coverage.

With default EN_TS/EN_JEITA enabled and this near-TI divider, approximate
forward-mode zones are: below0C suspended,0-10C20% current,10-45C normal,
45-60C97.6% voltage target with100% current, above60C suspended. Component
tolerances shift thresholds. BQ resumes when TS crosses its recovery threshold
and other operating conditions permit. These are charger defaults, not a newly
validated heatsink thermostat profile. No register/firmware change is made.
Source: TI BQ25756 SLUSEN5A, sections6.3.4.6.1 and REG0x1C.

Before thermal qualification, select a secure electrically insulated mounting
with good thermal coupling; establish location from bridge/FET hot spots and
verify response delay, sensor detachment, lead open/short and real component
temperatures. One plate sensor does not establish inductor/BQ/individual die
protection. TS suspension removes generator loading and can abruptly reduce
pedaling resistance; verify generator no-load voltage and restart behavior.
Retain existing no-energization/no-fabrication gates.

## Before routing

Confirm parallel-plate envelope, short-lead fit, clamp access and insulation
cost. Preserve short switching loops and local capacitors; do not move FETs
far from them just to reach a remote sink. Keep the ESP antenna clear of metal
according to its module requirements. BQ TS/J33 now monitors the heatsink under
the decision above, not the receiver battery or every hot component. Cooling does not replace
fault protection, REGN/VGS proof or independent thermal coverage.

## Implemented

Q10-Q13 provisionally use AOY66923 with standard GDS symbols and vertical
TO-251-3 footprints. No wire, driver supply or V2 PCB change. Sheet note now
requires insulated drain tabs and shared-sink clamps. Full qualification open.
Evidence: `../kicad/exports/review-aoy-mosfets-2026-10-12/`. Substitution test:
145 components/125 nets/eight sheets equivalent after explicit G/D/S mapping;
six broken fixtures rejected. Power test768 assertions and17 fault fixtures,
reset and118 USB connectivity assertions pass. ERC0 with unchanged inherited
exclusions; rendered sheet inspected. These checks do not prove400W operation.
