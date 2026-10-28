# V2 independent manual/digital CV engineering study

Date: 2026-10-08. Status: candidate engineering, NOT an approved or energized circuit.
No KiCad source was modified by this study.

Latest implementation handoff: [MCP4251 independent selector](MCP4251_SELECTOR_2026-10-08.md).
The user-approved MCP4251-503E/SL (dual 50k, SOIC-14) replaces MCP42100 in the
ongoing schematic rework; consult the latest owner export for placement status.
GPIO20 is active-low CV_AUTO_N, driving one independent manual/app selector.
Practical achievable setpoints take priority over eliminating every code gap.
The two-range and op-amp studies below are historical, not permission for extra
GPIOs or an approved alternate implementation. The new handoff includes static
calculations, concrete endpoints and explicit unresolved brownout/receiver gates.

## Earlier increment: manual CV only

The digital alternatives below remain engineering studies. The conservative
increment handed to the schematic owner is the manufacturer-style249k divider
with a bounded mechanical lower leg:

```text
Receiver/output sense -- 249k 0.1% -- FB(pin12)
FB -- 7.50k 0.1% -- RV_CV pins1+2 tied together
RV_CV pin3 -- FBG(pin11)
RV_CV = Bourns3296W-1-503LF, 50k, through-hole screw trimmer
```

Clockwise motion brings the wiper toward pin3, reducing lower resistance and
raising voltage. If the wiper contact opens, the full track remains connected
from pin1 to pin3; this lowers the target instead of opening the divider.
The7.50k fixed resistor bounds the target even with the trimmer shorted.
Retain FBG return here: no logic-domain analog component is connected to it.

Calculated from the BQ equations, including the largest programmable reference:

- Nominal default-reference endpoints, neglecting positive FBG resistance:
  8.1875V at50k to52.5312V at0ohms.
- Nominal12V needs29.0175k trimmer resistance with FBG=33ohms.
- Worst static target: **54.0369V**, using reference1.566V times1.007,
  Rtop249k times1.001 and Rbottom7.50k times0.999, FBG=0.
- A larger positive FBG resistance lowers that bound.
- Trimmer tolerance changes the minimum voltage, not the maximum. Even a40k
  full track permits calibration to12V.
- This is a static setpoint bound, not independent protection against overshoot,
  component shorts elsewhere, faulty wiring, or changing an attached battery's
  target. Mechanical adjustment requires a disconnected receiver and measurement.
- It deliberately does not reach54.6V. Do not claim full13S lithium charging.

The existing50k mechanical current-trimmer family can be reused, simplifying
parts sourcing and hand assembly. Exact precision-resistor sourcing and model
readback are owned by the schematic/parts agents.

## Decisions received

### Simple-divider clarification, 8 October

For an ideal 249k upper resistor and 1.536 V reference,
`Vout = 1.536 * (1 + 249000 / Rbottom)`. Nominal 12 V requires 36.550k
total lower resistance; nominal 55 V requires 7.154k. A fixed approximately
7.15k plus approximately 0-29.4k adjustable portion spans those ideal targets.
This is not a selected 55 V-safe circuit: reference/resistor tolerances,
trim, wiper resistance and the existing 7.50k guard must still be considered.

The 100k MCP range is large enough, but only a fraction of its codes serve
that range in a simple lower-leg rheostat. Uniform resistance steps are not
uniform voltage steps. With 7.50k fixed, ideal zero wiper resistance and
nominal 100k/256 increments, the first two nominal output targets are
52.5312 V and 50.0067 V. Including the complete BQ 1.504-1.566 V reference
trim gives intervals 51.4368-53.5572 V and 48.9649-50.9834 V respectively:
even these ideal intervals leave about 0.4534 V uncovered. This example is
not all code pairs or a guaranteed error bound; tolerance can alter gaps.
It includes fine trim, rather than treating the coarse step alone as decisive.

User asks to prioritize a suitably ranged digipot and the simple protected
manual/digital selector, not assume a second range-control GPIO is necessary.
Using ESP 3V3 as the selector bias is also a candidate, with POR/midscale and
ESP-reset-while-rail-stays-on consequences compared to GPIO selection.

- Keep BQ25756 and the dual MCP42100; channel 1 controls CV, channel 0 stays spare.
- Manual voltage and app voltage must be independent, not additive.
- Manual CV is a screw trimmer, initially calibrated to 12 V.
- Both mechanical end stops must remain within the board's electrical envelope.
- Converter may run autonomously while ESP is off. No dedicated CE GPIO required.
- Extra switching components are acceptable for independent manual/app selection.

## Convergence and next decision

Recommended now: implement the bounded manual divider above and keep the
electronic CV connection physically absent until one complete interface is
reviewed. This is meaningful schematic progress, not completion of adaptive V2.

| Approach | Benefits | Unresolved cost or engineering consequence |
|---|---|---|
| Passive, 249k upper, single 100k rheostat | Fewest parts; matches TI guidance | Coarse worst-case code steps prevent guaranteed arbitrary battery targets at high voltage |
| Passive, 1M upper, two ranges | Same MCP; simple power-loss direction; static 12-52.5V coverage; no active feedback amplifier | Extra range GPIO; TI checklist deviation; input bias/noise/loop and leakage qualification |
| Active ratiometric op amp | Same MCP; RAB tolerance cancels; linear voltage steps; one control GPIO | Adds amplifier compensation, supervisor, power-fall isolation/hold-up and an active feedback loop |

For this user's simplicity priority, the **passive two-range path is the lower
engineering-complexity preference**, conditional on resolving the impedance
recommendation and powered-off interface. The 249k checklist text is a genuine
manufacturer recommendation, not a separately specified electrical absolute
maximum. Increasing it is not automatically prohibited by physics, but the
datasheet does not provide sufficient FB input-bias limits to certify accuracy
or a55V bound at1M. Clarification plus a measured error/stability budget is needed.
At1M, unmodelled FB bias of10nA/100nA/1uA would shift an ideal target by roughly
10mV/100mV/1V respectively. Calibration removes repeatable offsets, not all drift.

In the passive candidate, loss of the isolation-MOSFET gate bias opens the lower
feedback path and lets FB rise, tending to stop conversion until the relay
returns to manual. It does not depend on the ESP commanding a stop. However,
between the MCP leaving its valid supply range and the switch fully opening,
the ladder can change state. The fixed resistor bounds the ideal maximum to
about54V, but this is NOT proof that every20V receiver remains protected during
the transition. Scope testing and appropriate receiver protection remain gates.

The active path's bare output can instead pull FB down during power failure,
which is why it requires additional circuitry. A supervisor such as
TLV803EA30DBZR (3.08V nominal threshold, not3.00V) and a series feedback MOSFET
could force the path open before the MCP becomes invalid. The discussed470uF
3V3 reservoir was only a sizing hypothesis: the50us assertion specification is
tested at10% overdrive, and cannot simply be assumed for arbitrary voltage
ramps. A hard rail short also defeats a simple hold-up assumption. It is not an
approved solution or permission to fit this capacitor to the logic regulator.

The MCP's wiper capacitance and track resistance also create an op-amp feedback
pole. A feedback capacitor around22-100pF may be required; neither the amplifier
loop nor the combined converter loop has been simulated or measured. Do not
select the active path merely because its static voltage equation is attractive.

Neither alternative is installed by this study. Never silently replace the
MCP42100, consume its spare channel, or reduce receiver compatibility without
recording the resulting decision and actual range.

## Important correction to the simple parallel proposal

A permanent 12 V lower divider plus a switched 100k rheostat cannot cover every
voltage immediately above 12 V while respecting MCP terminal current limits.
Raising 12 to 55 V at <=1 mA needs at least 43k upper resistance. Even without
branch series resistance, a 70k ladder then adds about 0.944 V at its highest
resistance. The BQ trim cannot bridge the fallback-to-enabled gap: approximately
12.234 V fallback maximum versus 12.674 V enabled minimum in this example.
This proposal is superseded by independent selection, not ready for wiring.

## Candidate A: passive two-range rheostat

Static endpoint plan, pending the manufacturer-impedance gate below:

```text
RECEIVER+ -- 1M 0.1% -- FB -- K1A COM
                            K1A NC -- 30.1k 0.1% -- RV_CV 200k -- PGND
                            K1A NO -- 30.1k 0.1% -- QP drain

QP gate = 3V3, QP source -- K1B NO
K1B COM -- MCP channel1 W (pin6)
K1B NC -- PGND
MCP channel1 A (pin7): externally unconnected
MCP channel1 B (pin5) -- 68k 0.1% -- PGND
                      |-- QR drain/source -- PGND
QR gate = extra range GPIO with 100k pull-down
```

RV_CV is a rheostat with its wiper tied to the unused track end: contact loss
then leaves the full track rather than an open lower divider. K1 is a DPDT,
non-latching, break-before-make gold-contact signal relay, default NC manual.
The second pole grounds the digipot wiper when manual/off. GPIO20 drives a
separate coil-driver transistor, never the coil directly; include flyback diode.

QP is oriented with drain toward the higher-voltage feedback node and source
toward the digipot. Its body diode points from the low-voltage digipot side
toward FB, not from FB into an unpowered digipot. While powered, elevated FB
puts QP in source-follower operation instead of passing full receiver voltage.
QR only shorts the 68k resistor; its source is grounded. Using W-B gives code0
approximately Rw, not one unavoidable ladder segment. Hardware /SHDN held high;
software channel shutdown shorts W to B, whose maximum target is bounded by
the permanent 30.1k series resistor.

Do NOT mistake this DC reasoning for transient qualification. With relay
contacts still closed during power collapse, MOSFET leakage and capacitive
feedthrough can violate a zero-volt MCP supply's operating limits. A proposed
external low-current Schottky clamp to 3V3 must be checked for actual maximum
forward voltage, leakage, rail backfeed and discharge. It has not been selected.
No unprotected MCP connection is approved by this document.

The BQ divider would return to PGND rather than floating FBG, avoiding receiver
voltage appearing on the ladder while FBG opens. Ground referencing matches
the BQ's FB measurement reference, but bypassing FBG needs manufacturer review.
At 55 V attached output and the manual trimmer calibrated for 12 V, the proposed
permanent divider bleeds approximately 47.96 uA (1.15 mAh/day), excluding the IC.

### Arithmetic results

See [executable calculation](../../v2/docs/calculations/cv-parallel-independent.mjs)
and [generated results](../../v2/docs/calculations/cv-parallel-independent-summary.json).

- 96 static corner combinations cover 12-52.5 V in ideal continuous-trim intervals.
- Upper resistor and fixed lower resistors: +/-0.1%; reference +/-0.7%.
- RAB: 70k, 100k, 130k; wiper: 0 or 250 ohms; MOSFET 4.8 ohms assumption.
- Worst 2-LSB resistance-step gain ratio 1.03276 is smaller than available fine
  trim ratio 1.04122. This bounds adjacent-code interval overlap, not real accuracy.
- Worst static commanded target with even a shorted rheostat: 54.0726 V.
- Worst listed-corner maximum reachable voltage: 52.6738 V.
- Nominal digital maximum with 175-ohm wiper: 53.2754 V.
- Nominal manual POR endpoints: 8.2114-52.5659 V. 12 V requires RV=116.689k.
- A fully charged 13S lithium target, 54.6 V, is NOT supported by this bounded design.
- These are static ratios, not a promise of transient voltage containment.

### Blocking manufacturer recommendation

The [TI schematic checklist](https://e2e.ti.com/cfs-file/__key/communityserver-discussions-components-files/196/BQ25756-Schematic-Checklist.pdf)
explicitly says the FB upper resistor needs to be 249k. The current datasheet's
example also selects 249k, though it does not give an explicit general resistor
range or FB input-bias error bound. **The 1M candidate is therefore not approved.**
Do not wire it as a validated full-range interface merely because its static
ratio works. Obtain TI clarification or redesign to meet the recommendation.
With 249k upper and about 7.5k minimum lower resistance, the 100k 8-bit rheostat's
worst code steps are too coarse for guaranteed overlap at the high-voltage end.

## Candidate B: buffered ratiometric feedback

An alternative retains MCP42100 but uses all three terminals as a ratio divider
in an op-amp feedback loop rather than as a resistance. Divide receiver voltage
by about 34.2 with a 249k/7.5k divider; feed a rail-to-rail op-amp noninverting
input. MCP A connects to op-amp output, B to ground and W to its inverting input.
Then the ideal output target is Vref * 34.2 * code/256. RAB tolerance cancels;
voltage steps are linear, and codes roughly 58-255 cover about12-53 V. A 10MHz
RRIO op amp such as TLV9061 in SOT-23-5 is a candidate, not a selected part.
The op-amp output would become the BQ feedback signal only in digital mode.

This preserves proportional feedback, unlike injecting a constant DAC offset,
so it does not intrinsically distort percentage-based charging thresholds.
However, it adds an active pole and requires loop-stability qualification.

**Do not connect a bare op-amp output to FB through the relay.** On power loss,
the op amp can pull FB low milliseconds before the relay returns to manual.
The BQ could increase output during that interval. A fast brownout-qualified
disconnect, safe pull-up behavior, and guaranteed power-fall sequencing are
required, not yet designed. This is an alternate engineering path, not a ready
netlist or permission to energize a board.

## MOSFET candidate evidence

Nexperia **NX6008NBKR**, SOT23, is preferable to assuming an ordinary 2N7002 is
fully enhanced by only about 1.5-1.8 V gate-source bias in this application.

- Official archived [datasheet](NX6008NBK.pdf): 19 August 2021, 14 pages.
- [Manufacturer URL](https://assets.nexperia.com/documents/data-sheet/NX6008NBK.pdf).
- SHA256: `4387821E63FFE31050B5D573B12CA492953188310F76306E8D67FBC03E1D2AE0`.
- Page2 pinout top-view: 1 gate, 2 source, 3 drain; SOT23 body2.9x1.3mm.
- Page3 limits: VDS60V, VGS+/-8V. 60V is not authorization for >55V operation.
- Page6 RDSmax4.8ohms atVGS1.5V, ID10mA,25C;3.9ohms at1.8V/50mA/25C.
- Page6 threshold0.4-0.9V at250uA/25C; not a maximum on-resistance guarantee.
- Page6 drain leakage max1uA at60V/25C; no hot maximum given.
- Page6 gate leakage max100nA at+/-2.5V;1uA at+/-4.5V,25C.
- Page10 mechanical outline; page11 solder land recommendation. Full standard
  footprint comparison and model acceptance remain the schematic owner's task.
- Standard symbol candidate `Transistor_FET:2N7002` has the correct G1/S2/D3
  mapping if independently verified; generic `Device:Q_NMOS_GSD` also possible.
- Footprint candidate `Package_TO_SOT_SMD:SOT-23`, subject to normal pin/land check.
- [DigiKey France observation](https://www.digikey.fr/en/products/detail/nexperia-usa-inc/NX6008NBKR/15777929)
  on2026-10-08:45,630stock;EUR0.16@1,0.099@10, beforeVAT. Not a purchase quote.

## Other references

- [BQ25756 datasheet](https://www.ti.com/lit/ds/symlink/bq25756.pdf), SLUSEN5A,
  August2026: FB/FBG pin descriptions, voltage accuracy and FB reference range.
- [TI engineer on FB measurement reference](https://e2e.ti.com/support/power-management-group/power-management/f/power-management-forum/1452562/bq25756-batteries-don-t-reach-its-top-set-voltage):
  FB is measured with respect to GND; FBG adds approximately33ohms when on.
- [MCP manufacturer datasheet](https://ww1.microchip.com/downloads/en/DeviceDoc/11195c.pdf),
  DS11195C: terminal voltage/current, RAB tolerance, DNL/INL, wiper and shutdown.
- [Relay/trimmer sourcing](../v2-manual-controls/README.md) is maintained separately.

Additional archived references, not selected BOM parts:

- [TI checklist local copy](BQ25756-Schematic-Checklist.pdf), undated,
  output-power checklist page: R28 requires249k. SHA256
  `3B9E0E8EBEE8226F15B6C16633AE5843F546D45E9C73A1B00ED6C38B6EA54E85`.
- [TLV9061 datasheet](tlv9061.pdf), SBOS839N, revised July2026;
  [manufacturer URL](https://www.ti.com/lit/ds/symlink/tlv9061.pdf). SHA256
  `7A5517D7F74BEDDDF4B8404FCE93E21100D2833A6F4AE16A93F934EAF0C6477C`.
  [DigiKey observation](https://www.digikey.fr/fr/products/detail/texas-instruments/TLV9061IDBVR/9771970):
  EUR0.61@1/0.43@10, stock10,973 observed2026-10-08. SOT-23-5.
- [TLV803E datasheet](tlv803e.pdf), SLVSES2J, revised May2021;
  [manufacturer URL](https://www.ti.com/lit/ds/symlink/tlv803e.pdf). SHA256
  `8C0E1447E9F5EDFC933912D7F30D3A11867D052B43B3FF75E45309AA461A651B`.
  [DigiKey observation](https://www.digikey.fr/fr/products/detail/texas-instruments/TLV803EA30DBZR/16553863):
  EUR0.44@1/0.307@10, stock2,431 observed2026-10-08. SOT-23-3.
