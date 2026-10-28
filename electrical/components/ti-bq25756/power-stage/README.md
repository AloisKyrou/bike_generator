# BQ25756 reference power parts

Official Vishay and Panasonic documents retrieved 7 October 2026 for the TI EVM-derived V2
study. These parts are candidates, not a purchasing release or validated power
rating. No manufacturer file has been modified.

| Local file | Official source | Revision and use |
|---|---|---|
| [sir680ldp.pdf](sir680ldp.pdf) | [Vishay 77478](https://www.vishay.com/docs/77478/sir680ldp.pdf) | Rev C, 4 December 2023; pp. 1-2 pinout, exact suffix and electrical limits; following curves for losses |
| [powerpak-so8-package.pdf](powerpak-so8-package.pdf) | [Vishay 71655](https://www.vishay.com/docs/71655/powerpak.pdf) | 13 February 2017; p. 1 package dimensions, backside view |
| [powerpak-so8-land-pattern.pdf](powerpak-so8-land-pattern.pdf) | [Vishay 72599](https://www.vishay.com/docs/72599/landpatternpowerpakso-8single.pdf) | 21 January 2008; p. 1 recommended minimum PCB land pattern |
| [ihlp-6767gz-01.pdf](ihlp-6767gz-01.pdf) | [Vishay 34000](https://www.vishay.com/docs/34000/ihlp-6767gz-01.pdf) | 22 April 2025; pp. 1-2 dimensions, 10 uH ratings and ER ordering suffix; following pages DC-bias/temperature curves |
| [v1fm10.pdf](v1fm10.pdf) | [Vishay 87557](https://www.vishay.com/docs/87557/v1fm10.pdf) | 13 May 2020; pp. 1-2 polarity, ratings and M3/H ordering; p. 4 package/land pattern |
| [panasonic-sxv.pdf](panasonic-sxv.pdf) | [Panasonic SXV catalog](https://industrial.panasonic.com/cdbs/www-data/pdf/AAB8000/AAB8000C259.pdf) | 2 September 2025; p. 1 package/polarity, p. 2 exact 80SXV56M ratings |
| [panasonic-oscon-land-pattern.pdf](panasonic-oscon-land-pattern.pdf) | [Panasonic mounting specifications](https://industrial.panasonic.com/cdbs/www-data/pdf/AAB8000/AAB8000COL10.pdf) | 31 October 2025; p. 1 F12 recommended lands and reflow limits |
| [vishay-wsl.pdf](vishay-wsl.pdf) | [Vishay 30100](https://www.vishay.com/docs/30100/wsl.pdf) | 23 November 2023; p. 1 WSL25125L000FEA decoding/rating, p. 2 dimensions/lands/TCR, p. 3 derating |

## SHA256

```text
sir680ldp.pdf
209DA800BC3CD169339A7A76A3ED1A19D60F1ECC16EB17622A03F1B3DE0D0D30
powerpak-so8-package.pdf
B7D1B36696E8F284E100F02D0CD2EA4CF62886A6E71246ADCE3E35B9CEAFBFBD
powerpak-so8-land-pattern.pdf
047D5C7B1624B45AC97DB8A3F8B39AD40A8430E24E3E38252B01CEB6DD4C92A0
ihlp-6767gz-01.pdf
1BDE9228CE0A33BF95F7223D07C5A3A472D335CC0239A60F8E6820E9280C7649
v1fm10.pdf
EA7745A9C1E4A57C30172752077BB3FF5FDF90D2E6FA16A0DBF0AE9C7B153D4C
panasonic-sxv.pdf
96C5C5481D2DD83761E30AF0924FAA9C2567BD5FCBF538C907130D5E0EA61F96
panasonic-oscon-land-pattern.pdf
CDCF08DD8351B5E568603A781B32938674042151FB58CE77C5347867F4D92B23
vishay-wsl.pdf
96C2DC89AE1E3039815ED6C41F566A6E9F6B53035F8E45EA2ADA1697935A44DC
```

## Screening findings

### Additional candidates checked 8 October 2026

These are candidate improvements, not approval of the power stage. Exact
schematic selection and physical model acceptance belong to the KiCad owner;
this table does not mean a substitution has been made.

| File | Official source | SHA-256 |
|---|---|---|
| [vishay-wslp.pdf](vishay-wslp.pdf) | [Vishay 30122](https://www.vishay.com/docs/30122/wslp.pdf), 9 September 2024 | `D3DD7B4F590E713C84303E32530E8C8C6FD025617896E11D25599521771E4C13` |
| [sir870adp.pdf](sir870adp.pdf) | [Vishay 63657](https://www.vishay.com/docs/63657/sir870adp.pdf) | `39F79A709D623B1C8A175B5560F073C4DB1A7F09E58476D740DE9BE3D4B23CB3` |

WSLP25125L000FEA is 5 mOhm, 1%, 3 W at the specified 70 C reference, with
110 ppm/C component TCR. At 15 A its nominal dissipation is 1.125 W; it removes
the existing 1 W nameplate mismatch but does not prove thermal operation on
our PCB. Compare its value-specific terminal/land dimensions, not only the
2512 package name. A fresh DigiKey FR page on 8 October showed 4,156 stock,
EUR 1.80 at one / EUR 1.227 at ten for cut tape. The page separately showed
cheaper Digi-Reel prices with an additional setup fee; those are not used.
[Exact distributor listing](https://www.digikey.fr/en/products/detail/vishay-dale/WSLP25125L000FEA/9758421).

SIR870ADP-T1-RE3 is a comparison ONLY: 100 V, 4.5 V Rds(on) max 10.5 mOhm,
Qg 25.2 nC typical / 38 nC maximum at 4.5 V under its test conditions. Compared
with SIR680LDP, gate charge is smaller but conduction resistance much larger.
At 55 V and 250 kHz, a two-switch gate-charge screening estimate gives internal
REGN loss about 0.63/0.95 W typical/max versus 1.01/1.55 W for SIR680LDP.
For two fully conducting 10.5 mOhm devices at 15 A, 25 C, the resistive sum alone
is 4.725 W versus 1.5975 W with two 3.55 mOhm devices. Real duty, hot resistance,
ripple and switching losses change these figures. Therefore lower gate charge
is not a sufficient reason to substitute it. Fresh DigiKey FR showed 1,929
stock and EUR 2.81/1.824 at 1/10; pricebook records it only as a comparator.
[Exact distributor listing](https://www.digikey.fr/en/products/detail/vishay-siliconix/SIR870ADP-T1-RE3/7566702).

TI CSD19534Q5A was screened out for this internal approximately 5 V gate-drive
path: the official part page says not logic-level and its datasheet specifies
Rds(on) at 6/10 V, not a guaranteed 4.5 V value. Its low charge alone does not
qualify it. No schematic or BOM substitution is requested for this candidate.

SIR680LDP-T1-RE3 is an 80 V MOSFET. Its pinout is source 1/2/3, gate 4,
drain 5/6/7/8 and associated drain metal. The datasheet shows both top and
bottom views: do not mirror the land pattern from the bottom view. Rds(on)
maximum is 3.55 mOhm at 4.5 V gate drive, 25 C. Qg at 4.5 V is 40.5 nC
typical / 62 nC maximum under the stated 40 V, 20 A test, not the 10 V Qg
figure. Hot resistance and switching losses still require analysis.

IHLP6767GZER100M01 is 10 uH, +/-20%, with 12 mOhm maximum DCR at 25 C.
Its 16.5 A heating figure represents a typical 40 C rise under manufacturer
test conditions; its 25 A saturation figure represents a typical 20%
inductance reduction. Neither is an all-condition continuous-current rating.
Across-inductor operating voltage is specified as 75 V; total part temperature
must stay within its limit. Pad geometry is on p. 1, two terminals with no
electrical polarity. ER identifies reel packaging, not a different inductance.

Exact symbol/pad counts, package orientation and disposable KiCad placement
must be checked by the design owner before real placement. The BQ symbol
authorization does not authorize creation of unrelated custom footprints.

V1FM10-M3/H is a 100 V, 1 A Schottky diode in SMF/DO-219AB, not a
1000 V conventional rectifier. The band identifies the cathode. Bootstrap
use still needs reverse-voltage, leakage, pulse-current and temperature review.

80SXV56M is an 80 V, 56 uF +/-20% polymer capacitor, F12 size, diameter
10 mm and nominal height 12.6 mm. Do not confuse it with 80SXV56MX.
ESR is 28 mOhm maximum; permitted ripple at 100 kHz is 3.1 A up to 105 C
and 0.98 A above 105 C through 125 C. The F12 recommended land dimensions
are 4.3 mm inner gap, 13.1 mm overall span and 1.9 mm width.
Two parts give 112 uF nominal / 89.6 uF at initial -20% tolerance, before
temperature, endurance and ripple qualification. This does not establish a
qualified 55 V capacitor bank.

On 7 October 2026 the exact capacitor showed zero stock at
[DigiKey](https://www.digikey.fr/en/products/detail/panasonic-industry/80SXV56M/10315806)
and [Mouser](https://www.mouser.fr/ProductDetail/Panasonic/80SXV56M?qs=%252B6g0mu59x7J87COhYCK4qQ%3D%3D).
DigiKey listed EUR 3.80 / 2.585 at quantities 1 / 10, excluding VAT.
It remains a reference candidate, not an accessibility-qualified selection.

WSL25125L000FEA is the standard 1 W-at-70-C, 5 mOhm, +/-1% part,
not the higher-power suffix18 version. At 15 A it would dissipate 1.125 W
before tolerances, exceeding its nameplate rating. It is a low-current study
part, not an accepted 15 A input shunt. Ordinary two-terminal 2512 lands
still need comparison with the manufacturer pattern and Kelvin routing review.

The exact TDK C3225X7R2A106K250AC characterization sheet was read through
the web viewer on 7 October 2026 but direct local download returned HTTP403.
No local PDF or SHA claim is made for it:
[TDK characterization, 4 November 2021, p. 1](https://product.tdk.com/system/files/dam/doc/product/capacitor/ceramic/mlcc/charasheet/c3225x7r2a106k250ac_211104.pdf).
It documents 10 uF +/-10%, 100 V, X7R, 1210; bias, temperature and ripple
curves are characterization evidence, not a guaranteed effective capacitance
at our operating corners. Archive and detailed footprint/bias review remain
open. DigiKey's exact-part listing showed zero stock and EUR1.36/0.897
at quantities1/10; the pricebook retains that sourcing warning.
