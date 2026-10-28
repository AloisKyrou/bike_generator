# AONS66923 driver follow-up, 12 October 2026

User-approved candidate direction, NOT yet substituted for Q10-Q13.
This follow-up narrows the gate-drive question without adding another supply,
changing frequency or claiming the existing SiR870 implementation qualified.

## Sources

- [AOS exact datasheet](https://www.aosmd.com/sites/default/files/res/datasheets/AONS66923.pdf),
  Rev1.0 April2018, archived as `AONS66923.pdf`.
  SHA-256 `508DBBD5510BAD1121179984D9F05C8DA1C7FFE21B7C8BEB98C9F94F0F634955`.
  Pages1-3: package/pin map, specifications and typical curves; p6 package.
- Existing `../ti-bq25756/bq25756.pdf`, TI SLUSEN5A August2026,
  pp11-12 REGN/driver/refresh, pp21-22 operating modes, pp62-64 loss equations.
- Existing `../ti-bq25756/power-stage/v1fm10.pdf`, Vishay87557,
  revision13-May-2020 pp1-3; `sir870adp.pdf`, Vishay63657 RevC pp2-3.

## What improved and what did not

AONS has lower gate charge: maximum18nC at4.5V versus38nC for SiR870 under
their specified test conditions. The two-switch-equivalent70V/288kHz REGN
screen drops1.423W to0.674W. But the datasheet does not give a maximum charge
at our actual approximately5V gate waveform and70V drain swing. Its10V/50V
maximum35nC gives a more pessimistic1.310W screen, not a guaranteed70V bound.
The1W REGN plot is TI design guidance, not a universal allowable dissipation.

TI describes alternate SW1/SW2 pulses with interleaved effective frequency in
buck-boost mode. Do not blindly treat four FETs as four simultaneous full-
frequency gate loads; confirm actual per-gate pulse rate at mode transitions.
The existing two-equivalent calculation remains an explicitly scoped screen.

Lower charge trades against resistance: the two-FET15A/25C calculation rises
from4.725W to6.660W using maximum Rds at4.5V. Neither is a hot-board prediction.
Typical Qgd and Qoss also improve, but a total switching-loss calculation must
use comparable conditions. In particular AOS Qrr156nC is measured at500A/us,
while SiR870's76nC typical is at100A/us: their ratio is NOT a valid direct loss
comparison. Switching times likewise depend on drive voltage/resistance.

## Why increasing C65/C66 alone is not a complete fix

Run `node electrical/components/aons66923/driver-screen.mjs`.
With an assumed effective bootstrap capacitance80% of nominal,18nC removes:

| Nominal bootstrap | Charge-step drop | Illustrative resulting voltage |
|---|---:|---:|
| Current100nF | 0.225V | 4.275V |
| 220nF study only | 0.102V | 4.398V |
| 470nF study only | 0.048V | 4.452V |

Last column uses4.8V REGN minus an optimistic assumed0.3V diode drop minus
Qg/C, before driver losses, leakage and SW movement. These are sensitivity
cases, not guaranteed waveforms. AONS Rds is guaranteed at4.5V, not below it.
Thus merely enlarging a bootstrap capacitor does not establish the published
Rds bound. A lower nominal diode drop also needs a guaranteed bound at actual
charge-pulse current and temperature; V1FM10 gives typical low-current curves,
not the desired worst-case guarantee. Cold and high-duty behavior matter.

TI permits bootstrap refresh thresholds from2.7 to3.9V (3.1V typical). This
prevents treating its refresh feature as a guarantee of4.5V on an always-on
high-side FET. Larger capacitance slows droop but does not change that threshold.
VGS threshold is the beginning of conduction at tiny current, not a power-FET
fully-on specification. These issues also affect the currently drawn SiR870.

## Next evidence needed

Before claiming the high-current/high-voltage envelope: establish minimum VGS
including the held-on high side, actual gate current, REGN temperature and
switch-node overshoot across buck/boost/crossover. Use suitable differential
probing; never attach a grounded oscilloscope clip to SW1/SW2. Request TI/AOS
guidance or characterize a constrained prototype before finalizing high-side
Rds assumptions. No bench energization is authorized by this document.

If margins fail, options are a different guaranteed low-VGS100V FET, a supported
driver-bias solution, or a narrower qualified envelope. None is silently chosen
here. Keep the preferred AONS cost projection separate from the actual BOM.
Package pin-map/land acceptance is still pending; no custom footprint created.
