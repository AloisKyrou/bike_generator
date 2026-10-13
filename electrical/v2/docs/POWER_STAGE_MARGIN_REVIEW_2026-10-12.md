# Power-stage margin review

12 October 2026, after the heatsink-thermistor decision. Scoped engineering
review, not a full-design audit, fabrication approval or bench authorization.
No native schematic, PCB, firmware, component selection or BOM cost changed.

## Result and disposition

Subsequent capacitor decision: user accepts keeping all twelveEEU-FR2A101
for the first prototype and qualifying ripple/temperature through staged
tests. Component selection is CLOSED for the prototype; the documented
1.5A ripple-margin sensitivities are NOT erased or accepted as a production
overload. Preserve local ceramics and short connections on both sides of the
shunts. If qualification fails, restrict the operating envelope or revise
the bank; no extra parts, redistribution or higher power rating is approved.

Method: calculations and datasheets precede PCB design, followed by bounded
commissioning, measured characterization and only then published ratings.
Identified hard-rating violations must be corrected or excluded from the
test envelope; a prototype is not permission to try known overstress. Define
test conditions, measurement methods and stop criteria before energization.
Passing one unit briefly does not establish production tolerance or lifetime.

Subsequent user approval,12October2026: CLOSE the driver architecture choice
for the first prototype. Retain AOY66923 and internal REGN/DRV_SUP drive,
without an additional supply or speculative bootstrap/frequency change.
Unmeasured VGS and thermal margins are now explicit prototype qualification
tasks, not a demand for measurements before any prototype can be routed.
Preserve short gate/bootstrap loops and practical measurement/rework access.
Only reopen this selection for a concrete design contradiction or observed
test failure. This acceptance does not establish70V/400W capability, waive
other release gates, or authorize fabrication/energization.

Keep AOY66923, existing REGN drive,250kHz nominal,100nF bootstraps, twelve
EEU-FR2A101 and the selected shunts as the provisional prototype baseline.
This is NOT a conclusion that the full70V-class/400W envelope passes. A larger
bootstrap capacitor alone does not resolve minimum high-side VGS; no unproven
extra supply or frequency change is added. Placement studies can use this
baseline; the driver envelope and other existing release gates remain open.

The new sampled screen separates a hypothetical400W controlled envelope from
manual operation without a power cap. It still finds capacitor ripple-margin
issues. Lowering watts alone does not solve high-input-voltage REGN losses.

## Saved-design evidence

Konnect0.12.1 official MCP generated a fresh KiCad XML and ran root ERC on the
saved V2 files. No live editor evidence is claimed. Export:
`.konnect-scratch/power-review-2026-10-12.xml`,2026-10-12T21:14:06 local.
SHA256:`9EDC2B4B0749AE61D841DCE3BAAC323F5EC111661EE66172D292D1EBF9B69CDC`.
145 components,125 nets,eight sheets.768 endpoint/part assertions pass with
`-Voltage70 -ThtBulk -AoyFets`. ERC reports zero errors/warnings with inherited
settings, not all rules enabled. MAIN SHA256 remains
`8BCADB77CE35E0CFB4CFD32D409D0B3524B37684713262A182E25E0661662A49`.

## Driver supply

TI explicitly supports connecting REGN to DRV_SUP. AOY guarantees15mOhm max
at4.5V/20A/25C, not below4.5V. Qg max is18nC at4.5V and35nC at10V, both at
the stated50V drain test condition. Neither is a guaranteed charge at our
actual gate waveform and70V switching excursion.

At70V input,5V REGN and288kHz, two switching-gate equivalents give:

| Charge assumption per switching FET | Gate-load REGN loss | Including TS-divider load near60C |
|---|---:|---:|
| 18nC, published4.5V test point | 0.674W | 0.715W |
| 35nC,10V-charge sensitivity only | 1.310W | 1.351W |

TS uses R72=5.23k,R73=30.1k and an illustrative3.02k NTC near60C. Other IC
loads and loss terms are omitted. TI's SOA plot uses1W REGN loss as guidance,
not an unconditional package allowance. The same screen leaves about25.62nC
per switching FET at70V before other loads. It does not bound the real Qg.

Before release, establish actual driver-supply current and IC temperature
across buck/boost/crossover. The held-on high side refreshes intermittently;
two gate equivalents is an analytical approximation, not a measurement of
all refresh and crossover pulses. Small output watts do not proportionally
reduce driver loss while PWM frequency remains fixed.

## Bootstrap margin

Existing sensitivity:4.8V REGN minus assumed0.3V diode drop minus18nC/80nF
leaves4.275V, before other losses. This is neither a guaranteed minimum nor a
prediction that the actual board fails. Increasing nominal100nF to470nF only
raises that example to4.452V. BQ refresh threshold itself spans2.7-3.9V; it
does not guarantee4.5V on the held-on MOSFET.

Do not convert missing low-VGS specifications into a guaranteed Rds or silently
assume the MOSFET becomes completely off below4.5V. Keep the uncertainty explicit.
Minimum-VGS/current/hot behavior needs TI/AOS clarification or constrained
physical characterization. An external4.5-12V driver supply is TI-supported,
but must be disabled with conversion and must not back-drive REGN. It remains
a fallback, not an approved additional circuit or a complete refresh fix.

## Reproducible current screen

Run `node electrical/v2/docs/calculations/power-stress-screen.mjs`.
46 focused self-checks include independent numerical integration of buck and
boost capacitor waveforms. Six sweeps each evaluate11707 pure-CCM operating
points;1724 near-unity-ratio points per sweep are deliberately excluded.
Additional cap-vs-manual consistency assertions run in the complete script.

Input10-70V/output12-67V at0.5V grid spacing are analysis bounds, NOT guaranteed
reachable settings. Some high-end input points exceed a given board's ACOV.
Nominal ceilings are13.605A input/9.107A output; previous tolerance screens
use14.771A/9.91A. Ideal efficiency=1, no generator ripple, no ceramic-sharing
credit, no core/switching losses. Real losses alter duty/current and reduce
output power at an input-current limit. The sampled maxima are not bounds.

| Hypothetical400W cap case | Peak inductor A | Inductor RMS A | Input-bank ripple A RMS | Output-bank ripple A RMS |
|---|---:|---:|---:|---:|
| Nominal current ceilings,8uH | 18.45 | 13.89 | 5.03 | 7.03 |
| Tolerance current ceilings,8uH | 19.52 | 15.02 | 5.40 | 7.56 |
| Tolerance ceilings,6.4uH sensitivity | 20.71 | 15.16 | 5.64 | 7.66 |

8uH is initial10uH minus20%;6.4uH adds a separate assumed20% DC-bias loss,
not a guaranteed hot/bias minimum. Manual uncapped6.4uH reaches20.94A peak
and7.81A output-bank ripple in this grid. A400W cap is not present in hardware
and firmware is not implemented by this work.

## Capacitors

For the tolerance400W/8uH case, the existing84mOhm resistive sharing proxy with
assumed+/-20% mismatch gives1.522A in the worst input can and1.550A in the
worst output can. Both exceed the exact part's1.5A/100kHz/105C rating. At6.4uH
the proxy gives1.590A/1.571A. These are sensitivity results, not proof of
failure: impedance is not ESR and actual frequency-dependent sharing differs.

Even nominal ceilings do not remove placement sensitivity: with the remote
input bank ineffective, equal sharing in three local cans gives1.678A each
at8uH. Consequently retain short loops and useful connections to BOTH sides
of each shunt. Do not rely on adding twelve nameplate ratings together.
Generator-frequency ripple must consume its own frequency-corrected budget.

Capacitance quantity remains comfortable (300uF input/420uF output after the
documented tolerance/endurance screen). Ripple, cold impedance and stability
are the unresolved questions, not merely capacitance in uF. No new expensive
polymer substitution or additional can is justified without resolving them.

## Inductor and shunts

L3 IHLP6767GZER100M01:12mOhm maximum DCR at25C. At the tolerance400W/6.4uH
point, copper loss alone is2.76W at25C, or3.57W using a copper-temperature
estimate at100C. Core losses are additional.16.5A heat-current and25A
20%-inductance-drop figures are typical manufacturer test results, not
unconditional ratings. Its75V terminal-to-terminal limit still needs measured
switching-excursion margin. A heatsink sensor does not directly measure L3.

TI support also flags L/DCR<1.26uH/mOhm for internal control behavior. At
10uH/11.6mOhm typical our ratio is0.862; at12uH it is1.034 at25C. Minimum DCR
is unspecified, so this does not prove cold/tolerance compliance. Retain the
existing cold-start/crossover validation gate; do not add a lossy resistor
solely from a typical-value forum comparison.

R1 CSS4J-4026K-5L00F is4W at its specified70C terminal condition, NOT the old
2mOhm variant's6W. DC dissipation at14.771A is1.091W at nominal resistance.
R75 WSL25125L000FEB is1W at70C reference ambient; at9.91A, DC loss is0.491W.
Vishay's ambient derating leaves0.65W at105C, before accounting for actual
resistance and RMS ripple. Neither shunt shows a DC-nameplate mismatch here;
neither is thermally qualified on an unrouted PCB. Preserve Kelvin routing.

## Before PCB freeze versus prototype tests

| Before freezing layout/fabrication | Required prototype evidence, not claimed now |
|---|---|
| Driver architecture accepted for prototype; preserve probe/rework access and a staged validation plan, no full-range claim | Differential VGS/BTST-SW waveforms, REGN current/temperature at buck, boost and near-unity ratio |
| Preserve local ceramics, short gate loops, access for probes, thermal pad copper/vias | Ripple sharing, cap temperatures, load/start-stop response and generator low-frequency ripple |
| Check contact stack and AOY lead forming; exact heatsink SKU remains deferred | Actual plate/component temperatures and thermistor trip/recovery |
| Review cold L/DCR and75V inductor margin; no arbitrary snubber added | L3 waveform/core heating and switching overshoot, including crossover and no-load |
| Keep existing source/receiver fault, USB and selector gates visible | Receiver disconnect/backfeed and reset tests under a separate safe bring-up plan |

Questions for TI/AOS if physical evidence is unavailable (draft only, not sent):
Can AOY66923 be qualified at the BQ's held-on bootstrap refresh voltage for our
current range, and what minimum gate waveform/Rds envelope should be used?
What REGN current and recommended operating margin apply at70V/250kHz with
this exact charge/driver network? Do not imply manufacturer approval exists.

## Primary references

- [TI BQ25756](https://www.ti.com/lit/ds/symlink/bq25756.pdf), SLUSEN5A, sections5.5,6.3.3.2-3,7.2.2; archived under `electrical/components/ti-bq25756/`.
- [AOY66923](https://www.aosmd.com/sites/default/files/res/datasheets/AOY66923.pdf), Rev2.1, pp1-3; archived exact part.
- TI SLUAAX9, June2025, sections2-3; local `electrical/components/ti-bq25756/sluaax9.pdf`. Loss models omit some physical losses and are not a thermal guarantee.
- [Panasonic FR-A](https://industrial.panasonic.com/cdbs/www-data/pdf/RDF0000/ABA0000C1259.pdf),01-Sep-25, exact100uF/100V row and frequency correction.
- [Vishay IHLP](https://www.vishay.com/docs/34000/ihlp-6767gz-01.pdf),22-Apr-2025, pp1-2; archived exact part family.
- [Vishay WSL](https://www.vishay.com/docs/30100/wsl.pdf),23-Nov-2023, pp1-3; [Bourns CSS4J](https://www.bourns.com/docs/product-datasheets/css4j-4026.pdf), exact5mOhm row, see prior power-stage uprate record.
- [TI support on crossover/L-DCR and capacitor distribution](https://e2e.ti.com/support/power-management-group/power-management/f/power-management-forum/1605301/bq25756-inquiry-about-inductor-overheating-and-switching-waveforms-in-bq25756), engineer responses, not qualification of our board. Customer observations are not treated as manufacturer specifications.
