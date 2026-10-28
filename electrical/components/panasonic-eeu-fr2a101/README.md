# EEU-FR2A101 prototype substitution, 12 October 2026

Status: accepted pin map / provisional electrical prototype selection.
NOT qualified at full current, not an ordering or energization release.
User requested economical through-hole capacitors and retained the twelve-part
bank. This replaces the bulk technology, not the local ceramic decoupling.

## Manufacturer evidence

- Exact loose straight-lead part: Panasonic Industry EEU-FR2A101
  (manufacturer table spells EEUFR2A101).
- Archived [FR-A datasheet](ABA0000C1259.pdf), revision 01-Sep-25,
  [official URL](https://industrial.panasonic.com/cdbs/www-data/pdf/RDF0000/ABA0000C1259.pdf).
- SHA-256: `47CF18461482E03270F72E475F855080E11E2154E3F343F735E5CB0E61E27DF7`.
- Pages 1, 2, 6: dimensions/endurance/frequency factors, impedance, exact row.
- 100uF/100V, +/-20%; 1.5Arms at 100kHz/105C; impedance <=84mOhm
  at 100kHz/20C, <=336mOhm at -10C. Impedance is NOT a guaranteed ESR.
- Endurance test 10000h at 105C; capacitance may change +/-25% from initial.
  This is not a promised field service life.

## Physical model acceptance

Existing `Device:C_Polarized` and
`Capacitor_THT:CP_Radial_D10.0mm_P5.00mm`; no custom model created.
Manufacturer side view p.1, exact dimensions p.6. Panasonic assigns polarity,
not numeric terminal names; KiCad numbers below are our explicit mapping.

| Physical terminal | Function | Symbol pin/type | Footprint pad/local position | View |
|---|---|---|---|---|
| Positive lead | Positive rail | 1/passive, plus-marked plate | 1, (0,0)mm, roundrect | Component side; plus mark at left |
| Negative lead | Return | 2/passive, opposite plate | 2, (5,0)mm, round | Component side; shaded half at right |

Two physical leads, two symbol pins, two electrical pads; no duplicates or
mechanical-only pins. Identify negative sleeve marking on actual parts before
soldering; lead lengths alone are not reliable after trimming.

Body nominal diameter10mm, maximum10.5mm; nominal length20mm, maximum22mm.
Lead diameter0.60+/-0.05mm; pitch5+/-0.5mm. Standard footprint has 2mm pads,
1mm plated drills, nominal5mm pitch. Lead forming to nominal pitch is normal;
do not force a tolerance-end part into the board. F.Fab diameter10mm,
F.SilkS diameter10.24mm with positive marker/negative hatching;
F.CrtYd diameter10.5mm. The nominal courtyard does not add assembly clearance
outside the maximum body: allow extra placement clearance, above-cap vent
clearance and >=22mm body height in the enclosure. Generic 3D height is not
accepted as mechanical evidence. Physical fit/assembly check before fabrication.

Konnect library query and disposable schematic/PCB instance readback completed.
Placed pads read through IPC at (100,100)/(105,100)mm, drills1mm, size2mm,
through-hole copper/mask; saved through Konnect. CLI PDF layer plot and PNG
inspected: plus/square pad1 left, shaded round pad2 right, no mirror reversal.
Disposable symbol render inspected too. Evidence is in repository-local
`.konnect-scratch/cap-inspect-result.json`, `cap-disposable-result.json`,
`fr-cap-footprint-detail.png`, `fr-cap-symbol.png`. No V2 PCB placement made.

## Electrical screen and limits

Run `node electrical/components/panasonic-eeu-fr2a101/screen.mjs` from repo root.
It reuses the TI SLUSEN5A equations35/36 screen with checked TI worked examples.

| Quantity | Input bank | Output bank |
|---|---:|---:|
| Count (local / beyond shunt) | 5 (3/2) | 7 (5/2) |
| Nominal bulk capacitance | 500uF | 700uF |
| Initial minimum | 400uF | 560uF |
| Initial tolerance plus endurance decline screen | 300uF | 420uF |
| Previous conservative switching RMS envelope | 5.426A | 7.680A |
| Matched resistive-proxy local current, each | 1.133A | 1.132A |
| Assumed +/-20% impedance mismatch, worst local | 1.530A | 1.574A |
| Remote bank ineffective, equally shared locally | 1.809A | 1.536A |

The latter two rows exceed the part's1.5A rating. Therefore twelve nameplate
ratings cannot simply be added to declare the board qualified. The 20% mismatch
is a sensitivity assumption, not a published impedance tolerance. The proxy
uses maximum impedance as resistance; it omits ESL, capacitance dispersion,
temperature dependence and harmonic-by-harmonic ceramic sharing. These results
are a reason for layout/bench qualification or derating, not proof of failure
at a specific operating point, and not proof of full-current suitability.

Capacitance comfortably exceeds the former approximate113.24uF default boost
screen and TI's80uF floor, even ignoring ceramics and allowing endurance drift.
This does NOT establish phase margin: the changed ESR/ESL/anti-resonances and
receiver input behavior require load-step and loop checks. Keep
EN_CONV_FAST_TRANSIENT=0 unless separately qualified. Reverse conversion is not
newly supported by this study.

Retain C77-C80 10uF/100V ceramics immediately at half bridges with short loops.
Both bulk groups must remain physically near their respective shunt, not at
distant connectors. TI recommends equal distribution either side of each shunt;
the existing3/2 and5/2 choices are retained here, not declared optimal. Final
placement must reconcile sharing and Kelvin routing; any redistribution is an
electrical change requiring another netlist check.

Generator-frequency rectifier ripple is additional to switching ripple. At120Hz
the100uF frequency factor is0.70, hence1.05A per capacitor, not1.5A. Reconcile
the squared, frequency-normalized RMS contributions for each supported source;
do not promise arbitrary low-speed AC generator compatibility from this screen.

At70V the banks store1.225J input and1.715J output:2.94J total versus0.7938J
previously, before ceramics. Input capacitors charge ahead of BQ control;
the BQ current limit is not an input hot-plug limiter. Output battery hot-plug
also requires inrush/fault review. No claim of fuse/TVS coordination follows.
An ideal700uF capacitor charged to70V at150mA takes0.327s; this is an illustrative
charge balance, NOT a BQ startup prediction or minimum trickle-current guarantee.
Existing non-battery receiver startup restrictions still apply.

Before a full-current release: measure capacitor RMS and case temperatures,
input/output ripple, cold/hot and minimum/maximum conversion-ratio behavior,
start/stop and receiver disconnect steps, loop response, inrush and fault
coordination. Adjust current rating, capacitance technology/count or placement
if these fail. No fixed400W qualification is inferred.

## Cost and availability

Fresh [DigiKey Portugal listing](https://www.digikey.pt/pt/products/detail/panasonic-industry/EEU-FR2A101/9921030)
now shows **zero stock**, EUR1.24 single /0.795 at10 /0.6108 at50, ex VAT.
This supersedes the earlier1617-stock /0.775 observation. Twelve cost9.54 EUR
at the10-piece tier versus31.02 EUR for the previous polymer bank:21.48 EUR
potential basket saving, before shipping/tax. This is pricing, not supply proof.
[Mouser Europe](https://eu.mouser.com/en/ProductDetail/Panasonic-Industry/EEU-FR2A101?qs=n7vHx8wJlDHCZg6DRLuY%252Bw%3D%3D)
same-day search listing reports4356 stock; direct page fetch failed. Confirm
live stock/price before buying. Do not silently substitute taped suffixes or
generic100uF/100V parts based solely on capacitance and voltage.

## Other through-hole opportunities

Do not convert the whole board to THT. Large electrolytics give the clearest
saving here. Connectors, screw trimmers and relay are already through-hole;
no new saving can be booked there. Ordinary0805 resistors are already cheap;
axial replacements mostly increase area and lead inductance. Keep precision
divider ratings/tolerances rather than replacing by whatever is in a kit.

Keep ceramics, gate resistors and Kelvin shunts close and low-inductance.
TO-220 MOSFETs might ease replacement/heatsink mounting but need a fresh gate-
charge, loss, parasitic and physical-loop study; they are not a cost-only
substitution for the selected compact power-stage package. Leaded fuses were
already studied; voltage, DC interruption and fault energy dominate their cost,
not the presence of a holder. No new qualified cheaper fuse is identified here.

General THT costs: more height/board space, drilling and blocked routing area,
longer parasitic paths, slower automated mixed assembly, and more mechanical
leverage on tall parts. Wet electrolyte versus polymer adds aging/temperature
trade-offs independent of whether the leads are through-hole.
