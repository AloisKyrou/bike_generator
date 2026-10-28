# 70 V-class input window

8 October 2026. This is a static engineering screen, not a surge-disconnect or
continuous-power qualification. The selected BQ25756 recommended operating
ceiling remains 70 V; its 85 V absolute maximum is not an operating target.

## Input divider

R63/R64/R65 = 1 MOhm / 105 kOhm / 19.6 kOhm. All use Yageo RT0805, 0.1%,
25 ppm/K, 0.125 W at 70 C, 150 V maximum continuous voltage. Values and body
2.0 +/-0.1 x 1.25 +/-0.1 x 0.5 +/-0.1 mm are verified in exact manufacturer
specifications. Two interchangeable terminations map Device:R pins1/2 to
standard R_0805_2012Metric pads1/2, 1.025 x1.4 mm centered +/-0.9125 mm.
Stock fab/silk/courtyard, scratch placement/readback and native rendering were
checked; no custom model. The approved existing 0805 footprint is retained.

| Reference | MPN | Archived SHA256 |
|---|---|---|
| R63 | RT0805BRD071ML | B775305E68812948A182826C0F40318DA2AA268D92DBA995BFE508F433F23999 |
| R64 | RT0805BRD07105KL | 5EA4A4ACA5ED6264BD7CF869EAF68D05B642208AFEC6B7310D398C1A160CD25A |
| R65 | RT0805BRD0719K6L | 071E678E66AFE413587943538124531D28D43BDBC7A44AC09C4207814DEC539E |

Each PDF was generated 8 October 2026 and retrieved from
`https://yageogroup.com/component-documentation/download/specsheet/<MPN>`.
Manufacturer drawing is a perspective chip view, not a polarized pin map.

The archived BQ datasheet SLUSEN5A, August2026, table5.5 and sections6.3.3.1 /
7.2.1.2.1 provide the comparator thresholds and three-resistor equations.
`acov-screen.mjs` tests128 corners, including independent resistor tolerance
and +/-100 K x25 ppm/K drift:

| Quantity | Nominal | Initial corners | Including temperature screen |
|---|---:|---:|---:|
| Input rising ACOV | 68.853 V | 67.802-69.333 V | 67.469-69.675 V |
| Input UV cutoff | 9.928 V | 9.866-10.000 V | 9.822-10.045 V |
| Input DPM | 10.921 V | 10.794-11.049 V | 10.746-11.098 V |

Typical ACOV hysteresis reflects about2.87 V at the input, not a guaranteed
release threshold. Pin leakage, contamination, aging and dynamic overshoot are
not bounded by this calculation. ACOV stops conversion but does not disconnect
the input from VAC, switching FETs or capacitors. It cannot protect those parts
from a sustained excessive generator voltage or turn a TVS into a70 V clamp.

Stock observations: DigiKeyUS listed1M64,948 and19.6k14,455; an indexed105k
listing showed13,609. USD observations are not converted into EUR quotes.
French direct-page retrieval failed; the cost tracker uses explicit passive
allowances until a current local quote is obtained. These are not reservations.
