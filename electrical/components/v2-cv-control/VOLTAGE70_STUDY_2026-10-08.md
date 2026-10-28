# CV interface for the 70 V-class revision

Engineering study under the approved
[70 V revision scope](../../v2/docs/VOLTAGE_RANGE_REWORK_2026-10-08.md).
The schematic owner implemented the changes below; the saved endpoints are
checked in the [independent review](INDEPENDENT_VOLTAGE70_REVIEW_2026-10-08.md).
This is not energization approval. The preceding 55 V continuation remains historical.

## Implemented minimal changes

Keep MCP4251-503E/SL, TQ2-3V, NX6008NBKR, AO3401A, both manual knobs,
GPIO20 active-low selection, the dual analog clamp and open K1.9. No extra GPIO,
range switch, op amp or new power supply is needed for the conditional range.

| Item | Change |
|---|---|
| R66 | Retain 249k, 0.1%, 25 ppm/K |
| R67 manual guard | 5.62k 0.1% plus R89 200R 0.1% in series, both 25 ppm/K |
| R84 digital guard | Same 5.62k + R90 200R series pair |
| R85 | 150k 0.1%, 25 ppm/K, replacing 110k |
| D25 drain clamp | onsemi BZX84C27LT1G, 27 V zener, SOT-23 |

Exact connections, with references assigned by the schematic owner:

```text
K1.2 -- R67 5.62k -- R89 200R -- RV2.1 + RV2.2
RV2.3 -- BQ FBG                       (unchanged)
K1.4 -- R90 200R -- R84 5.62k -- Q21.3 drain
D25 pin3 cathode -- Q21.3 drain
D25 pin1 anode -- GND
D25 pin2 -- explicit NC
R85 150k -- between MCP A/W and GND    (existing endpoints)
```

A single 5.83k 0.1% guard gives nearly identical results, but no economical,
stocked 0805 part was confirmed in this pass. Two readily stocked 0805 values
cost less than the scarce precision candidates. Root approved this engineering
direction if the single-value sourcing remains poor. All new model placement,
pin/pad readback and visual acceptance remain with the schematic owner.

## Range and tolerance results

Run [cv-voltage70.mjs](../../v2/docs/calculations/cv-voltage70.mjs).
The 128 endpoint combinations include RAB = 40-60k, Rw = 0-300 ohm, minimum
and maximum BQ trim, reference accuracy +/-0.7%, and fixed-resistor error
`+/- (0.1% + 25 ppm/K * 100 K) = +/-0.35%`. The 100 K excursion bounds resistor
drift from 25 C up to 125 C; it does not qualify the whole board to 125 C.
MCP endpoint specifications apply across its stated temperature range. Typical
track tempco is not treated as a guaranteed additional bound. The separate
profile search enumerates all 32 trim settings and all 257 MCP codes.

| Calculated quantity | Result |
|---|---:|
| Ideal zero-lower-resistance guard maximum, full reference/error/drift | 69.519 V |
| Manual cold-boot maximum, ideal zero FBG resistance | 67.251 V |
| Manual cold-boot maximum with typical 33 ohm FBG resistance | 66.881 V |
| Manual full-trim maximum, ideal zero FBG resistance | 68.565 V |
| Digital code 0, nominal Rw 75 ohm, default 1.536 V reference | 66.364 V |
| Digital code 0, nominal Rw 75 ohm, maximum reference | 67.660 V |
| Digital code 0, Rw 300 ohm, otherwise nominal, maximum reference | 65.256 V |
| Lowest high endpoint among modeled resistor/reference/MCP corners | 64.365 V |
| Highest low endpoint, code 256 with minimum trim | 11.645 V |
| Digital MCP reset code 128, nominal conditions | 15.541 V |
| Manual trimmer resistance for 12 V, default reference, typical FBG | 30.697k |

Consequently 12 V remains reachable, but **67.2 V is not guaranteed on every
board**. Even a mathematically optimized passive guard with no margin below
70 V has only about 64.788 V worst-corner high-end reach in this model. A
different resistor value cannot remove the worst-case wiper-resistance loss.
Keep the economical dual MCP and advertise per-board calibrated settings, not
a universal 67.2 V charger. Neither the 64.365 V span result nor the static guard
number is a qualified product rating: leakage, hot FET behavior, accuracy,
stability and transients remain to be bounded.

The 150k bleed is required to preserve the low end: retaining 110k can put the
40k-track/minimum-reference lower endpoint above 12 V. The manual divider has
ample adjustment with the existing 50k trimmer, even at its -10% resistance
tolerance; its separate setting remains independent of digital settings.
Changing the bleed also changes unpowered node discharge/leakage: a 1 uA
illustrative bounded leakage would give about 0.151 V with the resistor's
worst modeled value, versus about 0.111 V with the earlier 110k part. The dual
rail clamp and rail bleed remain fitted; hot leakage/backfeed is not qualified
by this room-temperature example.

At nominal values, code 0 to code 1 changes output by about 2.073 V. Near code
64 the step is 0.207 V, near code 128 it is 0.073 V. BQ 2 mV reference trim
steps correspond to about 86 mV at code 0 and 31 mV at code 64. Examples of the
nearest *calculated* settings below targets, with nominal RAB/Rw:

| Desired voltage | MCP code | BQ trim index, 0 = 1.504 V | Model result |
|---|---:|---:|---:|
| 12 V | 194 | 8 | 11.9979 V |
| 54.6 V | 7 | 20 | 54.5495 V |
| 58.8 V | 4 | 15 | 58.7481 V |
| 63 V | 1 | 0 | 62.9521 V |
| 67.2 V | 0 | 25 | 67.1420 V |

These are not firmware constants or charging approvals. R-INL, leakage and
measurement error prevent using these decimals as accuracy claims. Runtime
calibration/readback must reject settings that the particular board cannot
reach, or that lack a qualified receiver profile. Retained BQ trim also changes
the manual fallback; ESP reset alone does not reset the BQ.

## Why add one zener rather than replace Q21

Q21 is rated 60 V. When pole A is digital but Q21 is off or pole B is open,
the permanent 249k upper resistor can pull FB and Q21 drain toward an attached
70 V receiver. Keeping the transistor unchanged without a clamp is unsuitable.
Ordinary 100 V SOT-23 MOSFETs reviewed did not preserve the existing low-VGS
on-resistance specification. BSS123/IRLML0100-style parts cannot be substituted
merely because their threshold voltage appears low.

The new BZX84C27LT1G connects AFTER the complete digital guard, directly from
drain to ground. Its low-current specification is especially useful here:
25.0-28.9 V at 0.1 mA and 25.1-28.9 V at 2 mA, at 25 C. At a 70 V receiver,
the self-consistent clamp current is about 0.161-0.177 mA through the upper
resistor and guard. The current lies between those test conditions, so the
monotonic DC zener characteristic provides a useful room-temperature clamp
bound rather than an unsupported extrapolation from a 5 mA-only zener.

At 25 C this holds Q21 drain well below 60 V. The 25.3 mV/K maximum temperature
coefficient gives a 31.43 V upper extrapolation at +125 C, still far below
60 V; however that coefficient is specified at 2 mA, not our 0.16 mA. Verify
the hot low-current knee and hot leakage rather than calling this a guaranteed
full-temperature transient clamp. Q21 source may retain charge when relay
contacts open; original rail clamps and their transient qualification remain.

The reverse leakage limit is 50 nA at 18.9 V and 25 C; in regulation the drain
is around 1.5 V. Using 50 nA conservatively at the lower voltage gives at most
about 12.5 mV additional output offset in the DC model. Leakage to ground
**raises** the output target; hot leakage has no retrieved maximum at our bias
and is not silently zero. The zener's listed 70 pF capacitance also changes the
feedback dynamics and must be included in loop/transition measurements.

Maximum DC feed even with a shorted clamp is 0.276 mA. Maximum possible DC
zener dissipation for any clamp voltage at 70 V is 4.825 mW. R66 DC dissipation
is conservatively below 19.75 mW, less than one quarter of its 125 mW nominal
rating; actual high-temperature derating still applies. The 200R guard piece
has negligible DC heating. These DC results do not rate hot-plug displacement
current or a failed upper resistor short. The clamp is not a main output TVS,
receiver disconnect, or replacement for system fault-energy containment.

With the digital lower leg open, the zener limits FB only when pole A is still
on its digital contact. FB remains far above its roughly 1.66 V OVP threshold,
so this does not restore a false low-feedback/high-drive state. With pole A
itself open, or with manual selected and FBG open, FB can still approach 70 V:
the clamp is deliberately confined to the digital branch. A shorted zener
requests the guard-limited maximum rather than protecting a low-voltage receiver.
The former brownout concern remains and is more severe because that maximum
has increased from about 54 V to about 69.5 V. Receiver-safe fallback is an
explicit release gate, not solved by this component.

The existing BQ BAT_OVP internal discharge issue also grows: its 16 mA typical
SRN discharge at an attached 70 V battery corresponds to about 1.12 W internal
dissipation. This typical calculation is not a maximum-rating proof. A low
manual target with a high battery still requires a separate thermal/standby
qualification; the new Q21 clamp does not intercept that internal load.

## Relay stresses

Use the **PC board terminal** table for the actual TQ2-3V. The July 2025
Panasonic catalog, PDF index 5 / printed page 5, specifies 110 V DC maximum
switching voltage, 30 W maximum DC switching power and 1 A maximum current.
The familiar 1 A at 30 V contact rating is not its maximum voltage. The 220 V
DC / 2 A table on PDF index 7 belongs to surface-mount TQ variants, not this one.

Worst attached-receiver/open-FBG conditions can put up to 70 V across a contact
gap or between a contact and the coil/other pole, including when the local
zener is disconnected by pole A. This remains below the THT 110 V maximum
switching voltage; feedback current is less than 0.28 mA. Initial dielectric
tests are 750 Vrms between open standard contacts, and 1000 Vrms between
contact/coil and between contact sets, each one minute. These tests are not
PCB creepage approval or a qualified isolation barrier to USB.

The THT ambient specification is -40 to +70 C, not the SMD table's +85 C.
Keep the relay away from power-stage heat. Existing 3 V coil drive and resistor
are unchanged. The minimum-load reference is 10 uA / 10 mV, expressly subject
to actual load/environment/reliability validation. Contact bounce, capacitive
discharge, skew and release delay with the flyback diode remain unqualified.

## Sources and sourcing evidence

Checked 8 October 2026; stock and prices are observations, not reservations.

| Proposed part | Source observation |
|---|---|
| RT0805BRD075K62L, two | [DigiKey](https://www.digikey.com/en/products/detail/yageo/RT0805BRD075K62L/6617079): 1,482; USD 0.10 at one / 0.08 at ten |
| RT0805BRD07200RL, two | [DigiKey](https://www.digikey.com/en/products/detail/yageo/RT0805BRD07200RL/1075701): 23,898; USD 0.10 / 0.08 |
| RT0805BRD07150KL, one | [DigiKey France](https://www.digikey.fr/fr/products/detail/yageo/RT0805BRD07150KL/5139232): 8,836; EUR 0.09 / 0.073 excluding VAT |
| BZX84C27LT1G, one | [DigiKey France](https://www.digikey.fr/fr/products/detail/onsemi/BZX84C27LT1G/918395): 52,324; EUR 0.14 / 0.086 excluding VAT |

Manufacturer sources: [TI BQ25756](https://www.ti.com/lit/ds/symlink/bq25756.pdf),
[Microchip DS22060B](https://ww1.microchip.com/downloads/aemDocuments/documents/OTH/ProductDocuments/DataSheets/22060b.pdf),
[onsemi BZX84 family](https://www.onsemi.com/download/data-sheet/pdf/bzx84c2v4lt1-d.pdf),
[Panasonic TQ catalog](https://industry.panasonic.com/ac/cdn/e/control/relay/signal/catalog/mech_eng_tq.pdf).
The Panasonic catalog is readable through its identical
[distributor copy](https://mm.digikey.com/Volume0/opasdata/d220001/medias/docus/7330/mech_eng_tq.pdf).

The onsemi official PDF was inspected online; direct local download returned
403. The local distributor archive is older Rev.20, December 2014, obtained
from [Distrelec](https://media.distrelec.com/Web/Downloads/_t/ds/BZX84C10LG_eng_tds.pdf),
and corroborates the relevant electrical/pin table. Do not confuse its revision
with the current online document. Pin map is 1 anode, 2 NC, 3 cathode, top-view
CASE318 style8; a standard SOT-23 footprint/native BZX84 symbol is a candidate
pending owner's exact physical acceptance, not a newly created model.

Yageo generated manufacturer sheets dated 8 October 2026 are archived here:
0805 body 2.00 +/-0.10 by 1.25 +/-0.10 mm, 0.5 +/-0.1 mm height, 0.1%,
25 ppm/K, 125 mW at 70 C, 150 V maximum working voltage. All three sheets were
downloaded using `https://yageogroup.com/component-documentation/download/specsheet/`
followed by the exact MPN. Physical pad acceptance remains with the owner.

| Local archive | SHA256 |
|---|---|
| bzx84c2v4lt1-d-distributor.pdf | 70F5917F30962E3BE0112981E5533AD277CF27BC47DC87D35FC7498E767A5D05 |
| rt0805brd075k62l.pdf | 0126DC8D0022856D7DE37D72CECD4F347A70EF93DC6AF68B40A9FD61B6B86FD1 |
| rt0805brd07200rl.pdf | 4DFC14EE5DDBB512C6EDD34B3BF462869DA94D65912609720320B23A6E480BCC |
| rt0805brd07150kl.pdf | 42BA5CC87A13DE5E1864172941753EAD23E193B4A2E80DAC1D4426EF407B2D17 |

The failed Mouser PDF download was HTML and is explicitly retained as
`bzx84c2v4lt1-download-error.html`, not treated as a datasheet.
