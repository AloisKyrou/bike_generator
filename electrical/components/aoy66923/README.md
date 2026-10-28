# AOY66923 accessible-assembly study

12 October 2026. User approves provisional Q10-Q13 selection and reiterates a
large shared heatsink on one face. Not a 400 W, fabrication or energization
qualification. Do not replace this mechanical requirement with free-air cooling.

Latest user decision, 12 October 2026: retain AOY66923 and stop the alternative
search for now. Try the horizontal lead-form/mount; replace the part only if
that proves unsuitable. This accepts the candidate, not the untested bending
process or vertical footprint for the parallel heatsink. Verify physical fit
before freezing PCB geometry/fabrication; electrical and thermal gates remain.

Subsequent user clarification: the sink is a plate parallel beneath the PCB,
not a vertical side wall. The selected vertical footprint is therefore NOT
mechanically accepted for the intended assembly. Short leads must not be
assumed bendable into a suitable horizontal mount; require a section view and
physical fit review before retaining this package for layout. No native change
or replacement selection was made for this clarification. See
[mechanical requirement](../../v2/docs/SHARED_HEATSINK_2026-10-12.md).

## Primary evidence

| Archived file | Revision / pages used | SHA-256 |
|---|---|---|
| [AOY66923.pdf](AOY66923.pdf) | Rev2.1 February2022, pp1-3 electrical/thermal and views | AA47FE46B5AD0C3CC4EDE925956D3BB0F332AC96DCD5DD01848BB50DD4B2B4C3 |
| [TO251B.pdf](TO251B.pdf) | PO-00187 versionB, p1 complete package drawing | BC3FEC5157993F1532BF752C2B4CB98602DC63D572EC80E75250D8885E072D25 |
| [AOD66923.pdf](AOD66923.pdf) | Rev1.0 April2018, pp1-3 comparison | 0BBB156A23ABB52F4F06CFB3C13C24F5E4A2064DA968CC150B2453D2CE3BB50B |
| [AOSP66923.pdf](AOSP66923.pdf) | Rev2.0 September2019, pp1-3 comparison | 199402611A4EEB2916F94A38AD026C2EC08CCBD122031ACF3D341B1C5AE9219C |

Official URLs: `https://www.aosmd.com/sites/default/files/res/datasheets/`
followed by each part PDF name; package:
<https://www.aosmd.com/sites/default/files/res/packaging_information/TO251B.pdf>.
Manufacturer lists AOY66923 and AOD66923 in Full Production. AOT2910L is Last
Time Buy and is not selected for this new design.

## Electrical and assembly comparison

AOY66923 is 100 V, 15 mOhm maximum at VGS4.5V/20A/25C, Qg18nC maximum at4.5V
under the published test conditions. AONS66923 is14.8mOhm/18nC. The small
resistance difference is acceptable for the same provisional operating study;
these are not guaranteed resistances below4.5V or at a hot junction.

- AOY: three accessible THT leads, 2.29mm pitch, exposed drain back. Max
  junction-to-case1.7K/W; no screw hole. A suitable clamp and electrically
  insulating thermal interface are required for a common metal heatsink.
- AOD: DPAK, accessible gate/source leads but underside drain solder joint.
  Same15mOhm/18nC values; possible fallback only with a qualified PCB-to-heatsink
  thermal path. Its underside drain pad normally faces the PCB; plastic-top
  contact is not equivalent. Hot-air/paste quality still matters.
- AOSP: SO8 gull-wing leads, but steady-state junction-to-ambient75K/W on its
  specified test board and junction-to-lead24K/W. Not selected for this current
  envelope simply because it is easy to solder. Its Qg test current differs.
- Existing SiR870: lower10.5mOhm cold resistance, but38nC maximum at4.5V versus
  AOY18nC. Retaining SiR is not a solution to the existing REGN-loss issue.

The AOY/AOD50K/W and AONS55K/W ambient figures are test-board results, NOT a
prediction for a standing component in our enclosure. The AOY6.2W front-page
ambient rating uses the <=10s thermal value, not continuous free-air operation.
Run `node electrical/components/aoy66923/thermal-screen.mjs` for explicitly
limited conduction/thermal-budget arithmetic. Switching and hot resistance
remain additional losses. The existing bootstrap/minimum-VGS gate applies
unchanged: see [driver study](../aons66923/README.md). No driver rail or
switching-frequency change is included in this substitution.

## Physical pin map and model acceptance

The AOS package drawing left view is the marked/front face, leads down:
left-to-right1=G,2=D,3=S, confirmed against datasheet p1's top/bottom views.
The back tab is drawn as4 in the package drawing and electrically D in the
part datasheet. It is NOT an isolated thermal surface.

| Physical terminal | Function | Standard symbol pin | Standard vertical footprint pad |
|---|---|---:|---:|
| Front left1 | Gate | 1 | 1 |
| Middle2 | Drain | 2 | 2 |
| Front right3 | Source | 3 | 3 |
| Back tab4 | Drain, internally common with2 | 2 electrically | No solder pad in vertical mounting; insulated clamp contact |

Symbol `Transistor_FET:Q_NMOS_GDS` and footprint
`Package_TO_SOT_THT:TO-251-3_Vertical` queried through Konnect. Three pins,
three drilled pads; the exposed back is not a fourth PCB solder connection.
Do not use `TO-251-3-1EP_Horizontal_TabDown` with this three-pin symbol: that
footprint has a separate pad4 and requires both remapping and lead-form review.

Model pad centers:0/2.29/4.58mm; AOS pitch2.29mm, outside span4.57mm (drawing
rounding). Holes1.1mm; pads1.7175x1.8mm. AOS recommends0.9mm holes, but its
maximum rectangular lead0.85x0.61mm has a1.046mm diagonal. The selected larger
hole has only0.054mm nominal diametral margin at that corner: board-hole
tolerance and a physical sample must be checked before fabrication. Do not
force the wider lead shoulder into a hole. Leads are short, L3.2-3.4mm; body
standoff and board thickness are mechanical gates, not unspecified free space.

Standard F.Fab6.58x2.30mm approximates AOS nominal6.60x2.29mm; AOS maxima
6.73x2.39mm must govern placement. F.CrtYd spans7.08x2.80mm and encloses the
body, but does not represent clamp/insulator/tool access or a guaranteed0.25mm
margin to every maximum-body corner. Reserve at least1mm assembly access
outside the physical envelope, plus the actual clamp envelope, before routing.
F.SilkS and square pad1 identify orientation. Existing 3D geometry is not
accepted as an exact AOY short-lead mechanical model.

Konnect disposable schematic and PCB instance were saved and read back;
KiCad10 CLI PDF and rendered symbol/pad views inspected. This accepts the
electrical map and provisional stock footprint for schematic selection only.
No custom library model or V2 PCB was made. Evidence is copied into this
folder's `model-query.json` and `disposable-query.json`; scratch project/renders
remain under `.konnect-scratch/aoy-model-2026-10-12/` and adjacent PNG/PDF files.

## Longer-lead alternative search, 12 October 2026

User permits changing the provisional selection if a mechanically safer
horizontal-mount candidate has similar cost and electrical capabilities.
This scoped search did not establish a replacement satisfying all criteria;
do not treat that as proof that no such part exists. No native/BOM change.
User additionally reiterates consolidated purchasing: a candidate must fit the
main BOM distributor basket, not just be available from another specialist.
No final supplier basket has been validated by this comparison.

- AOT66920L, TO-220: 100 V, Rds maximum 10.5 mOhm at 4.5 V/20 A,
  Qg maximum 25 nC at 4.5 V versus AOY's 18 nC under the published tests.
  Long-lead/screw-tab package is a more comfortable mechanical direction,
  but still requires lead-form, insulated screw/tab and layout checks.
  AOS lists Last Time Buy; DigiKey reports last-buy date 30 September 2026.
  Reject for a reproducible new reference design despite remaining inventory.
  DigiKey Germany search result: EUR 2.67 excluding VAT singly, 1.730 at ten,
  980 stock; France direct page could not be retrieved. Indicative only.
- AOT66919L and AOT2910L also have manufacturer Last Time Buy status;
  AOT2916L is Obsolete. These are not durable sourcing alternatives.
- IRLB4030PbF, TO-220: 100 V, maximum 4.5 mOhm at 4.5 V/92 A, but
  Qg maximum 130 nC at 4.5 V/110 A/50 V. Its much larger published gate
  charge is unattractive for the existing BQ driver/REGN constraints, not
  a quantified loss ratio at our operating current. DigiKey France search
  result: EUR 4.55 singly, 3.011 at ten, 13024 stock. Reject this substitution
  on cost and drive burden, not on its ability to carry current.

Sources checked online (candidate rejection study, not model qualification):

- [AOT66920L status](https://www.aosmd.com/products/mosfets/medium-voltage-mosfets-40v-400v/aot66920l)
- [AOT66920L datasheet, Rev3.0 June2019, pp1-2](https://www.aosmd.com/res/datasheets/AOT66920L.pdf)
- [AOS TO220 package](https://www.aosmd.com/sites/default/files/res/packaging_information/TO220.pdf)
- [AOT price/status](https://www.digikey.de/en/products/detail/alpha-omega-semiconductor-inc/AOT66920L/9974906)
- [IRLB4030 datasheet, pp1-2](https://www.infineon.com/assets/row/public/documents/24/49/infineon-irlb4030-datasheet-en.pdf)
- [IRLB price](https://www.digikey.fr/en/products/detail/infineon-technologies/IRLB4030PBF/2096639)

Continue AOY mechanical feasibility before freezing its footprint. The earlier
3.3 mm minus 1.6 mm PCB minus 0.5 mm protrusion arithmetic is only a length
budget, not proof of clearance, acceptable bend radius or manufacturer approval.

## AOY cost observation, not order approval

Direct DigiKey France pages on12October2026, EUR excluding VAT/delivery:

| Part | One | Ten unit price | Reported stock |
|---|---:|---:|---:|
| [AOY66923](https://www.digikey.fr/en/products/detail/alpha-omega-semiconductor-inc/AOY66923/9974921) | 1.830 | 1.167 | 4771 |
| [AOD66923](https://www.digikey.fr/en/products/detail/alpha-omega-semiconductor-inc/AOD66923/9974850) | 1.660 | 1.057 | 5981 |

AOY four-part cost7.32EUR (4.668 at the ten-part unit break). Compared with
the BOM's earlier SiR2.81/1.824 observations: savings3.92EUR /2.628EUR per
board respectively. Compared with earlier AONS2.05/1.317: savings0.88/0.60.
Those are component-only differences, not complete assembly savings; clamp,
insulation and shared-heatsink cost are still unpriced. Pricebook records
retain their observation dates. Reconfirm stock and quotes before purchase.
