# 70 V-class power-stage engineering

8 October 2026. Component-selection study, not a saved-design audit or hardware
qualification. Sole CAD owner implements approved choices. No PCB changes,
energization, procurement or no-fire claim is made here.

## Recommended candidates

- Q10-Q13: Vishay `SiR870ADP-T1-RE3`, 100 V, existing PowerPAK SO-8 physical
  family, subject to owner's exact pad/model acceptance. Pins 1-3 source,
  4 gate, 5 drain (physical drain islands share logical pin 5). Reflow/hotplate
  assembly remains necessary; the manufacturer does not recommend a soldering iron.
- Bulk bank: Panasonic `100SXV27M`, 27 uF/100 V. Initial same-count comparison
  is four input/six output; the final engineering recommendation is five input
  and seven output to cover the specified capacitance endurance shift as below.
  This is preferable to blindly enlarging the bank with 330 uF wet electrolytics.
  Prototype candidate, pending accepted model and effective-capacitance/life tests.
- Retain existing L3 only with measured terminal-to-terminal excursions below
  its 75 V rating. No 100 V insulation rating is claimed for it.

## MOSFET and gate drive

[Vishay datasheet](https://www.vishay.com/docs/63657/sir870adp.pdf), already
archived in `../power-stage/sir870adp.pdf`, Rev C, 4 November 2024: RDS(on)
maximum 10.5 mOhm at 4.5 V; total gate charge typical 25.2/max 38 nC at 4.5 V.
The ordering table's GE3 versus stocked RE3 is reconciled by the manufacturer's
[alternate material-set ordering note](https://www.vishay.com/docs/76151/ordinfopnsaltmatset.pdf),
document 76151, 8 June 2020, page 1. It explicitly maps this exact part.

Fresh opened [DigiKey FR](https://www.digikey.fr/en/products/detail/vishay-siliconix/SIR870ADP-T1-RE3/7566702)
showed 1,929 stock, EUR2.81 single / 1.824 at ten / 1.398 at fifty.

The TI interleaved transition uses two full-rate gate-equivalent pairs, not four
full-frequency FETs. At 70 V and 5 V REGN, 38 nC screening gives 1.235 W gate-LDO
loss at 250 kHz or 1.423 W at 288 kHz. This omits other IC losses and uses a
4.5 V charge bound, NOT a guaranteed 5.2 V charge bound. Two conducting devices
at 15 A give 4.725 W at the 25 C resistance bound; hot resistance and switching
losses increase this. Actual bootstrap VGS, junction temperatures, dead-time,
ringing and switching loss remain measurements, including near-unity conversion.

TI's switch-node capacitance rule gives 160 nF/VIN = 2.286 nF at 70 V. A pair of
719 pF typical Coss values at 50 V totals 1.438 nF, leaving about 0.848 nF for
layout in this rough screen. Typical, voltage-dependent capacitance is not a
guaranteed worst-case nonlinear switching-charge qualification.

## Capacitors and stability

[Panasonic primary SXV table](https://industrial.panasonic.com/cdbs/www-data/pdf/AAB8000/AAB8000C259.pdf)
lists 27 uF +/-20%, 100 V, 30 mOhm, case F12, diameter 10 mm and height 12.6 mm.
Ripple rating is **3 A at <=105 C**, but only **0.94 A above 105 C up to125 C**.
Do not apply the 3 A figure throughout the full temperature range. Polarity mark
identifies negative. Owner must inspect manufacturer dimensions, stock footprint
lands, polarity and saved rendering before assigning the model.

Fresh opened [DigiKey Ireland](https://www.digikey.ie/en/products/detail/panasonic-industry/100SXV27M/10315802)
showed 74 stock, EUR3.80 single, 2.585 at ten, 2.0802 at fifty, 1.9211 at100.
One board consumes ten: EUR25.85 before tax/shipping versus prior TDK bank
EUR12.69, a EUR13.16 increase. Quantity100 pricing would be EUR19.211 per board,
but 74 observed stock does not cover ten boards. Mouser indexed378 stock and
EUR2.50 at ten, but repeated fresh page opens failed; that is NOT confirmed
second-source inventory or a purchasing quote.

Initial -20% capacitance is 86.4 uF input and129.6 uF output, without counting
ceramics. `screen.mjs` reproduces TI's 51 uF and674 uF worked examples, then
scans boost at VIN>=9.8 V, VOUT<=70 V, Lmax12 uH, input14.771 A/output9.91 A
screening ceilings. Maximum default-mode requirement is about113.24 uF just
above16 V output. Thus merely checking the80 uF minimum is insufficient, but
the proposed bank passes this initial analytical screen. Fast-transient mode
is not qualified. These internal compensation parameters are not board R1.

Using Lmin8 uH and fmin212 kHz, half-ratio70 V gives10.318 A peak-to-peak
inductor ripple. Conservative ideal-CCM capacitor RMS screens are5.426 A input
and7.680 A output. Equal30 mOhm ESR and5 mOhm shunt sharing predict1.550 A per
local input can and1.396 A per local output can. These are not guaranteed
sharing: ESR spread/minimum, trace inductance, current waveform and heating
must be checked on the actual PCB.

Endurance permits another +/-20% capacitance change after1000 h at125 C.
Applying a further20% decline gives69.12/103.68 uF, before ceramics, which no
longer independently satisfies the input minimum/worst boost screen. Qualify
temperature, lifetime and effective ceramic contribution; do not call the
initial calculation a lifetime guarantee. Existing C77-C80 TDK10 uF/100 V
ceramics must be evaluated with DC bias, temperature, tolerance and aging.
Startup auto-tuning, input/output steps, mode transition and receiver dynamics
remain required. A battery's capacitance is not assumed available for all loads.

Alternative KEMET `A767MU226M2ALAE038`:22 uF/100 V/2.25 A/38 mOhm/105 C.
Five input plus seven output give88/123.2 uF initial minimum. Fresh DigiKey US
2,934 stock, USD4.07 single /2.755 at ten /2.0397 at100, so twelve parts cost
USD33.06 at the ten-piece tier. Five plus five does NOT clear the worst boost
screen without verified ceramic contribution. This is a fallback, not selected.
Its [primary datasheet](https://content.kemet.com/datasheets/KEM_A4071_A767.pdf)
is archived; no exchange-rate conversion was invented.

### Preferred drift-margin alternative

Five input and seven output Panasonic parts provide initially108/151.2 uF
at -20% tolerance; after a further20% endurance decline they retain86.4/120.96 uF.
That clears the80 uF minimum and113.24 uF boost analytical screen without MLCC
credit. Put three input cans local/two upstream and five output local/two far.
This reduces the equal-ESR per-can ripple screen; it does not add a new control
block. Twelve parts costEUR31.02 at the observed ten-piece tier, EUR18.33 above
the old ten-TDK bank. Stock74 covers six such boards, not ten. Parent favors
this modest count increase while the PCB is still unplaced. Model acceptance,
temperature dependence beyond this drift screen, startup, lifetime and actual
loop/ripple measurements remain gates; this is not a promised service life.

## Inductor and voltage envelope

[Vishay operating-voltage note](https://www.vishay.com/docs/34455/maxoperatingvoltage.pdf),
document34455, 2 October2024, defines75 V across the terminals for this IHLP
material/body family. Existing `IHLP6767GZER100M01` is not a100 V part. At70 V
nominal differential, only5 V remains for switching excursions. Retention is
conditional on measured ringing and finite source limits. Current screen at
14.771 A mean and10.318 A ripple gives approximately19.93 A peak; saturation,
core loss, hot DCR and PCB cooling are not established by the25 A typical
saturation figure. No better stocked100 V inductor has been qualified here.

100 V capacitors/FETs do not change BQ25756's70 V recommended/85 V absolute
limits. Legacy SMCJ70A clamps around113 V at its rated pulse current; it is not
a coordinated85 V protector. ACOV stops switching, not physical input exposure.
Generator overspeed, hot-plug and disconnect excursions remain finite-envelope
qualification gates. Approximately400 W is an app ambition, not a hardware
autonomous clamp; both manual maxima can request over600 W.

## Fuse coverage and accessory shortlist

The pre-revision XML puts J1.1, bridge D2.5 and F1.1 on RECTIFIED_RAW; J1.2
and D2.1 are ground. Reversed direct DC can conduct through bridge diodes and
**bypass F1**. A source-adjacent external fuse protects this harness/fault path;
moving J1 downstream of F1 would create other unprotected paths and is not
recommended. A receiver battery also requires its own source-adjacent fuse:
input F1 does not universally interrupt output-battery fault energy.

Existing F1 is Littelfuse0456020.ER,20 A/100 VDC, not the historical Eaton
candidate. The [primary 456 datasheet](https://www.littelfuse.com/assetdocs/littelfuse_fuse_456_datasheet.pdf?assetguid=d86b18f9-14fa-4764-87ff-8aec12e9a89d),
revision GD 18 September 2025, was independently opened online successfully.
Page 1's exact 20 A row confirms 300 A interrupt at100 VDC,500 A at72 VDC
and1000 A at32 VDC; nominal melting I2t is18 A2s at1 ms. This is not the40 A
variant's80 V limit and not an arbitrary car-battery short rating.

Page 2 requires standard25% derating for continuous operation, plus its
temperature re-rating curve. Thus20 A nominal only yields15 A before additional
temperature derating:14.771 A input screening ceiling has little room at warmer
ambient. Do not present that current as continuously qualified. Page 3 recommends
at least100 um copper and10 mm trace width for20 A; alternative thermal methods
are allowed provided the fuse body stays<=90 C in a25 C environment under normal
operation. These are layout/thermal gates, not a reason to silently enlarge F1.
The filesystem download still failed; the retained error response is not the
successfully viewed online PDF. Existing accepted footprint is not altered.

Economical external candidate: Eaton `BK/ABC-15-R`,15 A ceramic6.3x32 mm,
125 VDC with10 kA interrupt rating per [official ABC datasheet](https://www.eaton.com/content/dam/eaton/products/electronic-components/resources/data-sheet/eaton-abc-fast-acting-ceramic-tube-fuses-data-sheet.pdf),
Technical Data2000, November2021, page1. BK is bulk packaging (page2), not a
different electrical rating. Fresh [DigiKey FR](https://www.digikey.fr/en/products/detail/eaton-electronics-division/BK-ABC-15-R/954134)
showed2,983 stock, EUR1.21 single /0.924 at ten. This is a receiver-branch
candidate, not a universal15 A input fuse:14.77 A sustained input needs thermal
derating, cable sizing and potentially20 A. ABC20 also has10 kA at125 VDC, but
higher typical pre-arc I2t550.8 versus200.2 A2s for15 A. Neither proves board
survival. At200% current the specified opening maximum is120 seconds.

Cheap holder candidate Littelfuse `01500332H`, inline15 A/250 V, fresh
[DigiKey FR](https://www.digikey.fr/en/products/detail/littelfuse-inc/01500332H/3425489)
5,535 stock EUR2.29 single /1.751 at ten, combined candidate costEUR3.50 single.
Exact DC applicability, provided wire gauge/temperature, fuse enclosure and
assembly coordination are NOT yet qualified from a primary electrical drawing.
Do not release it merely because a distributor says250 V. Eaton HFA offers
20 A/250 V crimp construction, but the primary series table omitsAC/DC while
older documents sayVAC; its DC approval also needs resolution. No external
holder has been approved in this study. A source-dependent selection gate is
more honest than a generic automotive32/58 V holder on a70 V-class connection.

Fuse voltage/interrupt rating, clearing energy, cable insulation/ampacity,
prospective short current, charged capacitors, receiver backfeed and fire
containment require coordinated testing. A fuse does not correct moderate-
current overvoltage, a wrong charging profile or slow thermal overload.

## Primary archives

All under this directory; complete URLs above. SHA256:

- `panasonic-sxv.pdf`:96C5C5481D2DD83761E30AF0924FAA9C2567BD5FCBF538C907130D5E0EA61F96
- `kemet-a767.pdf`:7B26E25E243642B193EF98264A390F62C9DB2238820FF12972D54A6586DC1821
- `vishay-alternate-material-ordering.pdf`:A31E6719FFE48B3AB664F2F2827F0DB56BCE30886FCFED8D145E3793EA48C759
- `vishay-ihlp-voltage.pdf`:CAAD08C2D3934C4F1762FF3807400EFE5D0F8DC32D354B3035A9BF8F06FE836A

Eaton primary PDF was read online but its filesystem download timed out.
`littelfuse-456-download-error.txt` is an error response, not technical evidence;
the exact primary revision was nevertheless successfully reviewed online above.
