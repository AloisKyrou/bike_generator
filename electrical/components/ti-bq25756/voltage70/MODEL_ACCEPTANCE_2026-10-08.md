# Voltage70 prototype model acceptance

8 October 2026 design checkpoint, finalized 9 October after a host interruption.
Only standard library models were reused; no custom symbols or footprints were
created. This is schematic/model acceptance, not mounting, thermal or fabrication
release. Sole CAD owner used official Konnect MCP file-backed tools.

## SIR870ADP

Q10-Q13 use `Transistor_FET:Q_NMOS_SSSGD_AvalancheRated` with
`Package_SO:PowerPAK_SO-8_Single`. Selected manufacturer is Vishay Siliconix,
MPN `SIR870ADP-T1-RE3`. Datasheet63657 Rev C4-Nov-2024 and package71655
Rev L13-Feb-2017 were read and rendered. The primary alternate-material note
76151 maps the datasheet GE3 ordering suffix to RE3. Sources are archived in
`../power-stage/` and `../power-stage-70v/` with the sourcing study.

- Pins1/2/3 source,4 gate,5 logical drain. Physical drain leads5/6/7/8 and
  exposed drain metal map to the repeated pad5 islands, not invented NC pins.
- Stock footprint has nine copper islands, five logical pins. Source/gate
  lands are1.27 x0.61 mm at1.27 mm pitch. Main drain land3.81 x3.91 mm plus
  four drain tabs. Body5.89 x4.9 mm matches the primary package drawing;
  courtyard7.1 x5.5 mm and pin1 chamfer checked.
- Scratch native placement, all-pad readback, native SVG rendering and schematic
  symbol rendering passed. Active four-device pin readback matches the old
  connectivity. No real PCB footprints were placed or updated.
- Leadless PowerPAK requires qualified reflow/hotplate assembly; the manufacturer
  does not recommend ordinary soldering-iron assembly. Higher100 V rating does
  not qualify ringing, REGN heat, bootstrap voltage or hot RDS(on).

## BZX84C27LT1G

D25 uses existing `Diode:BZX84Cxx` with `Package_TO_SOT_SMD:SOT-23`.
The generic library's Diotec description/datasheet was replaced by the exact
onsemi MPN,250 mW description and manufacturer URL on the instance.
Manufacturer Style8:1 anode,2 no connection,3 cathode. All three pins and pads
were checked, including explicit NC2 in the active schematic.

The archived distributor mirror is the older onsemi Rev20 December2014 PDF;
the current primary web PDF was separately checked by the CV reviewer. A failed
HTML download is not represented as an archived datasheet. Source details/hashes
are in `../../v2-cv-control/VOLTAGE70_STUDY_2026-10-08.md`.

Body2.80-3.04 x1.20-1.40 mm,1.90 mm nominal lead pitch. Stock lands1.475 x0.6 mm
at x+/-0.9375, y+/-0.95 for pins1/2 and y0 for pin3. They are not identical to
the manufacturer's illustrative0.9 x0.8 mm pattern, but overlap the terminal
envelope with clearance. Native scratch-pad/symbol query and actual rendered
placement inspected. Stencil/mounting remain prototype qualification items.

## Precision resistors

R63/64/65: Yageo RT0805BRD071ML / RT0805BRD07105KL / RT0805BRD0719K6L.
R67/R84: RT0805BRD075K62L; R89/R90: RT0805BRD07200RL;
R85: RT0805BRD07150KL. Exact primary spec sheets are archived here and in
`../../v2-cv-control/`. They specify0.1%,25 ppm/C,0.125 W at70 C and150 V.

Two passive pins are interchangeable. `Device:R` plus
`Resistor_SMD:R_0805_2012Metric` uses2.0 x1.25 mm body and lands1.025 x1.4 mm
at+/-0.9125 mm, checked against2.0+/-0.1 x1.25+/-0.1 mm body and
0.35+/-0.2 mm terminations. Scratch placement and rendered pad geometry inspected.
The two series guard pairs are real components, not a renamed single resistor.

## Panasonic100SXV27M

All twelve C73-C76/C81-C88 use `Device:C_Polarized` and stock
`Capacitor_SMD:CP_Elec_10x12.5`. Exact part is Panasonic Industry100SXV27M,
not100SXV27MX. The archived primary SXV table dated2-Sep-2025 identifies
F12,27 uF/100 V,30 mOhm,3 Arms only at <=105 C; above105 C the rating is0.94 A.
Body diameter10+/-0.5 mm, height12.6 +0.1/-0.4 mm, base10.3+/-0.2 mm,
overall terminals11.0+/-0.2 mm, terminal width0.8-1.1 mm. Negative marking
and positive chamfer were visually reconciled with symbol pin1+ / pin2-.

**Explicit standard-land deviation:** Panasonic's31-Oct-2025 F12 recommendation
is4.4 x1.9 mm pads at+/-4.35 mm (gap4.3 mm). Stock lands are4.4 x2.5 mm at
+/-4.2 mm (gap4.0 mm). They overlap the terminal envelope; the larger paste
area and0.15 mm center difference require mounting/stencil evaluation.
The stock3D height12.5 mm is approximate, not actual12.6 mm clearance approval.
Courtyard/base/polarity/all pads were read back from a native scratch placement
and visually inspected. No false exact-recommended-pattern claim is made.

## Evidence location

Local validation transport, JSON requests/results, manufacturer-page images,
native scratch models and actual rendered symbol/pad images:
`.konnect-scratch/v2-voltage70-2026-10-08/`. Key groups are `models*`,
`resistor-model*`, `zener-query*`, `cv-inspect*`, `cv-preflight*`, `cap-model*`.
The saved active XML and PDF live in the new `review-voltage70-2026-10-08`
directory; prior review artifacts are preserved byte-for-byte.
