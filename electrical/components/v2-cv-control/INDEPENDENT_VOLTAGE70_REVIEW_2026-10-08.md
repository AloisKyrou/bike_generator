# Independent 70 V CV review

Read-only review by the CV engineering reviewer; no KiCad files were modified.
The reviewed export is
`electrical/v2/kicad/exports/review-voltage70-2026-10-08/controller-v2.xml`,
dated `2026-10-09T08:02:45`, SHA256
`C94BA60B4DDE5FDD86566964E3B5836A4A9803ECECB7E6B4A1FEE86BAE8B3329`.
It contains 146 components, 125 nets and 8 sheets. Review completed 9 October
2026 after the owner's final presentation-only refresh. The prior `04A6B9E8...`
export is superseded; all checks below were rerun on the hash above.

## Findings

No deterministic CV endpoint or selected-value discrepancy was found.
All 54 static CV assertions pass:

```powershell
powershell -NoProfile -File electrical/v2/docs/calculations/cv-netlist-audit.ps1 -Netlist electrical/v2/kicad/exports/review-voltage70-2026-10-08/controller-v2.xml -Voltage70
```

The explicit `-Voltage70` mode implies an open K1.9 and checks the new series
resistor junctions, zener polarity and unused pin, changed component values,
and D25 SOT-23 assignment. Historical default and `-OpenIdleContact` modes
still pass their adaptive and continuation exports respectively.

All 25 negative XML fixtures were independently rerun and rejected for their
expected errors. New cases cover either added guard being bypassed, the drain
clamp being grounded/reversed, use of its NC pin, the obsolete bleed value and
the wrong clamp footprint. Scratch evidence is retained at
`.konnect-scratch/adaptive-cv-tests-3dcc814de5894758b65f43e200e92c0a`.

```powershell
powershell -NoProfile -File electrical/v2/docs/validation/test-adaptive-cv-regressions.ps1 -Netlist electrical/v2/kicad/exports/review-voltage70-2026-10-08/controller-v2.xml -Voltage70
```

Direct XML inspection additionally confirms these exact MPN assignments:

| References | Manufacturer part | Footprint |
|---|---|---|
| R67, R84 | Yageo RT0805BRD075K62L | 0805 |
| R89, R90 | Yageo RT0805BRD07200RL | 0805 |
| R85 | Yageo RT0805BRD07150KL | 0805 |
| D25 | onsemi BZX84C27LT1G | SOT-23 |

D25 pin 3 is cathode at Q21 drain; pin 1 is grounded anode; pin 2 is explicitly
unconnected. R89 is in series between R67 and the tied manual trimmer wiper/end.
R90 is in series between K1.4 and R84. Both complete guard resistances are
5.82k. GPIO20 remains active-low, the NX gate remains upstream of the coil
resistor, and MCP channel 0 remains the spare external channel.

The [128-corner static calculation](../../v2/docs/calculations/cv-voltage70.mjs)
was rerun. The modeled maximum is 69.519 V, while the lowest modeled upper
endpoint is 64.365 V. Nominal settings can approach 67.2 V, but that endpoint
is not guaranteed for every board. These are conditional model results, not
a qualified operating range or receiver profile.

## Limits

The [engineering study](VOLTAGE70_STUDY_2026-10-08.md) retains the unresolved
hot clamp leakage/knee, loop stability, brownout and contact-transition gates.
The 27 V clamp protects the local transistor drain under the modeled conditions;
it does not disconnect a receiver or cure the undefined MCP brownout interval.
Retained BQ trim affects manual fallback, and high-battery/low-target BAT_OVP
discharge requires thermal qualification. No energization or fabrication
approval follows from these endpoint checks.

The schematic owner maintains the negative-fixture suite; its independent
rerun is recorded above. The broader revision report and native ERC/visual
review remain separate from this CV endpoint audit. No native KiCad CLI was
run by this reviewer during the owner's export/ERC work.
