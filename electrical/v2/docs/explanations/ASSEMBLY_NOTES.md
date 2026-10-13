# Fablab assembly constraints

8 October 2026. Requirements for the next PCB, not an assembly release. The
copied V2 PCB still represents V1 and must not be manufactured as this design.

## Prefer accessible packages

- Keep ordinary low-power resistors and capacitors at 0805 where practical.
  Choose a larger package for voltage, effective capacitance, power or handling
  needs; do not shrink parts merely to reduce board area.
- TP4057 uses leaded SOT-23-6 and RT9080 uses leaded TSOT-23-5. They are more
  accessible to inspection and careful iron rework than the former exposed-pad
  logic-power ICs. Fine tips, flux and magnification are still needed.
- R45 is selected as Bourns CRM1206-FX-R820ELF, 0.82 ohm, 0.5 W, 1%, in
  a hand-solder 1206 footprint. This is an explicit preferred-value deviation
  from Beetle's 0.8 ohm. Package size alone did not establish its power rating;
  operating-temperature derating and charger behavior still need qualification.
- The continuation selects seven TDK 100 nF / 100 V 0805 capacitors and a
  KEMET 1 uF / 100 V 1206 part, replacing six 0603 placements and one 0805
  placement with larger bodies. See the
  [exact MLCC choices](../../../components/ti-bq25756/power-stage/MLCC_SELECTION_2026-10-08.md).
  Other already-selected 0603 bootstrap/filter capacitors and resistors remain.
- J26 reuses the known JST PH two-pin horizontal connector. A keyed connector
  prevents reversed insertion, not a reverse-wired third-party battery cable.
- Keep service jumpers accessible and clearly marked. JP20 is open by default
  and enables charging only after cell/source qualification.

## Do not promise an iron-only whole board

BQ25756 has a fine-pitch VQFN package with an exposed pad. The ESP module has
underbody connections, and the main power MOSFETs need correct thermal solder
coverage. Plan stencil/paste and a controlled reflow or hot-air process, plus
inspection and electrical checks. A larger leaded logic regulator does not
remove these requirements elsewhere on the board.

An economical fablab offering can assemble the difficult core and leave large
connectors or supported options for workshop assembly. That is a future
assembly variant, not a current priced service or approved partial-build BOM.

## Placement rules for the next layout

1. Put USB at one board edge and respect the ESP antenna keepout at the other
   suitable edge. Confirm the final enclosure and cable access before placement.
2. Leave tool access around service links, reset/boot, connectors and test pads.
   Do not bury them between the inductor and tall capacitors.
3. Keep switching loops compact and use the controller's recommended grounding
   and Kelvin sensing. Easy access must not stretch critical power loops.
4. Provide thermal copper and vias based on losses, not just pin current ratings.
   Keep the optional lithium cell away from the converter's hot region.
5. Mark connector polarity, charge permission and supported assembly variant.
   Publish fitted/DNP references only after the electrical variant is qualified.

Q20 is AOS AO3401A in SOT-23, D20 is Vishay SS1H10-E3/61T in SMA, and D21 is
Kingbright WP710A10LGD, a 3 mm through-hole LED. These are selected physical
parts, not generic placeholders; their selection does not settle hot diode
leakage, cell transition or regulator dropout. Use the
[current checkpoint](../../README.md) and
[BOM dashboard](../../bom/COST_DASHBOARD.md) to distinguish drawn parts,
unpriced parts and unfinished functions.

TP40-TP47 are bare copper probe pads, not eight additional purchased pins.
Keep FB/digipot pads directly at the local node; long test-point branches add
capacitance and pick up switching noise. See the
[probe-access map](../PROBE_ACCESS_2026-10-08.md). J33 requires the specified
external Semitec 103AT-2 sensor curve, not an arbitrary 10 kOhm thermistor;
the sensor, insulated harness and mechanical attachment are separate from
the fitted board header.
