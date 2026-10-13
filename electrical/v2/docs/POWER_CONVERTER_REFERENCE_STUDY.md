# V2 power-converter reference study

Date: 2026-10-05. Status: **PROVISIONAL / architecture not selected**.
Read alongside [receiver requirements](OUTPUT_RECEIVER_STUDY.md) and
[buck-only / pedal-feel trade-offs](BUCK_ONLY_AND_PEDAL_FEEL.md).
Research does not select the main converter. The separate
[first schematic increment](SCHEMATIC_PROGRESS_2026-10-06.md) implements the MCU
foundation only; it does not implement either buck-boost candidate.

## 6 October update: references for the first schematic increment

The user has authorized starting V2 schematics, preserving V1, with documented
AC/DC and internal/external-converter assembly variants and no internal dump.
This does not freeze the main power controller or the earlier 80 V study target.

For the main buck-boost work, compare **TI BQ25756EVM** for integrated digital
current control against **ADI DC2456A / LTC3779** for higher-voltage headroom.
PMP7282 remains the recovered historical **buck-only** reference, not our
buck-boost design. The existing generic external buck remains the first known
source/receiver testbed, not a validated universal charger.

The [BQ25756 archive](../../components/ti-bq25756/README.md) includes official
schematic, BOM and layout PDFs plus a native Altium ZIP with four schematics,
PCB, variants and vendor manufacturing data. Its directory was inspected; it
has not been imported or asserted equivalent to the latest guide revision.

Important constraints from [TI's EVM page](https://www.ti.com/tool/BQ25756EVM)
and [datasheet](https://www.ti.com/lit/ds/symlink/bq25756.pdf):

- EVM: at most 55 V at input/output, 10 A charging. IC: 70 V operating input
  ceiling. Neither validates 80 V input or an unchanged 60 V-output EVM.
- I2C controls current, but forward output-voltage programming is only a narrow
  trim around an external feedback-divider setting. Wide receiver selection
  still needs a reviewed analog or switched-divider interface.
- Startup, watchdog, reverse flow and station-supply behavior need qualification;
  this is not a reason to remove independent receiver protection.

Safest work order: implement the shared controller/interface foundation first,
preserve the upstream auxiliary supply and measurement knowledge, define the
converter boundaries, then implement the main stage after envelope and setpoint
choices are reconciled. An explicit unfinished power sheet is more accurate
than presenting an EVM copy as a qualified product.

The earlier shortlist and narrow-use conclusions below remain historical context.

Latest scope: the [broader compatibility study](compatibility/README.md) adds
direct e-bike pack charging and multiple donor types. Its recommendation to
lead the broad-use comparison with buck-boost supersedes the narrow-use
preference below, without changing the working scooter/buck/AC50S baseline.

## Recovered historical reference

The remembered TI design is **PMP7282**, identified by
[the portable handoff](../../../AGENT/LOCAL_ONLY.md). The old local-only folder
was absent on this computer. Five official PDFs are now archived under
[ti-pmp7282](../../components/ti-pmp7282/README.md), with hashes and URLs.
The original annotations and legacy fabrication ZIP have not been recovered.

## Shortlist: board limits are not controller limits

| Reference | Manufacturer's demonstrated board | Relevance to V2 | Main gap |
|---|---|---|---|
| [TI PMP7282](https://www.ti.com/tool/PMP7282), two LM5116 controllers | 35-60 V input, 12 V / 50 A, two-phase synchronous buck | High-current layout, interleaving, test methodology | Not 80 V input or adjustable 10-30/60 V; not a demonstrated programmable charger |
| [TI LM5146-Q1-EVM12V](https://www.ti.com/tool/LM5146-Q1-EVM12V) | 15-85 V input, 12 V / 8 A | Simpler single-phase buck with editable Altium source | 96 W evaluation point, not 400 W; application CC regulation still required |
| [ADI DC2456A / LTC3779](https://www.analog.com/en/resources/evaluation-hardware-and-software/evaluation-boards-kits/dc2456a.html) | 16-120 V input, 48 V / up to 10 A with derating | Four-switch buck-boost; reference covers input voltages above V2 target | Not a ready 10-60 V / 20 A charger; greater power-stage/control complexity |

The [LM5146 datasheet](https://www.ti.com/lit/ds/symlink/lm5146.pdf), Rev A,
supports 5.5-100 V input and 0.8-60 V output at controller level. Buck operation
still requires input headroom. Its valley-current/hiccup protection must not be
mistaken for our smooth programmable average-current braking loop.

The [LTC3779 datasheet](https://www.analog.com/media/en/technical-documentation/data-sheets/ltc3779.pdf),
Rev A, describes 4.5-150 V input and 1.2-150 V output capability with external
power parts. Its average-current sense loop can be placed at input OR output;
the nominal threshold is 50 mV, not a ready MCU-programmable torque interface.
We still need a reviewed command circuit, simultaneous input/output constraints,
safe default, independent protection and battery-profile supervision.

## Important adaptations

**PMP7282:** its [BOM](https://www.ti.com/lit/pdf/SLUR966), pp. 1-2, specifies
twelve main 80 V MOSFETs, two 6.8 uH inductors and 25 V output ceramics. This
alone rules out copying it unchanged onto an 80 V bus or a 30-60 V output.
The fixed 12 V output is also not a complete nominal-12 V battery charger.
Its high-current two-phase implementation is an example, not evidence that
V2 needs two phases at a provisional 20 A output limit.

**DC2456A:** the [demo manual](https://www.analog.com/media/en/technical-documentation/user-guides/DC2456AF.PDF),
pp. 1-2, qualifies 48 V / 10 A for 21-120 V input with cooling conditions;
below 21 V the stock configuration requires derating. It documents 200 LFM
airflow for the wide-range thermal tests, versus no forced airflow at selected
36-72 V operating points. We cannot carry its peak efficiency into a sealed
bike enclosure. Its BOM includes 63 V output bulk capacitors and 60 V
output-side MOSFETs: a proposed 60 V output needs new voltage-margin analysis.

**TI buck-boost voltage screening:** the current
[LM51770 datasheet](https://www.ti.com/lit/ds/symlink/lm51770.pdf), Rev A,
specifies 78 V maximum operating input (85 V absolute maximum). It is not a
drop-in 80 V-continuous solution. Either keep this family out of that envelope
or explicitly redesign/approve input clamping and the operating limit.

## What we actually have locally

- PMP7282: schematic, BOM, layer plots, test report, LM5116 datasheet.
  Gerber ZIP redirected to login; no native CAD recovered.
- LM5146: user guide, controller datasheet, official ZIP with Altium source,
  BOM, schematic, Gerbers and photographs. Nested archive entries verified.
- LTC3779/DC2456A: source index only; online PDFs read, direct downloads failed.
  Listed design ZIP contents not inspected.

See [TI LM5146 archive](../../components/ti-lm5146/README.md) and
[ADI source index](../../components/adi-ltc3779-dc2456a/README.md).
These vendor packages are references, not our manufacturing outputs; retain
their licenses/notices. No library import, part approval or procurement occurred.

## Next decision

The user confirmed that the existing scooter generator / buck / AC50S setup
already operates at approximately 36 V input and 24 V output without boost.
Use buck-only as the baseline for that application. The comparison below
addresses any expanded V2 operating envelope, not a deficiency in that setup.

For approximately 12-30 V receivers, investigate the simpler single-phase buck
first **if measured loaded generator voltage stays above the required output
through the intended cadence/torque range**. Keep LTC3779 as the wide-input
buck-boost comparator if low-speed operation cannot meet that test.

Before selection, compare current-control implementation as well as topology:
a buck requiring a new analog CC loop may save less engineering than switch
count suggests. Budget a proper loss/thermal model, component availability and
cost check, compensation study, receiver interaction tests and fault analysis.
Neither reference is a substitute for those steps.
