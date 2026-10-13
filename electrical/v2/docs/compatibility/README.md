# Generator and receiver decision pack

Date: 2026-10-05. **Research / PROVISIONAL, not a connection authorization.**

This study answers the expanded goal: reuse multiple donor motor families and
store pedal energy in useful second-hand or camper batteries, including e-bike
packs. It supersedes the *narrow-scope recommendation* to limit V2 to 12-32 V;
it does not change the proven scooter / buck / AC50S setup or approve hardware.

## Files

- [Generator catalog](generators.csv): 18 donor families, mechanical obstacles,
  electrical interfaces, acquisition priorities and verification requirements.
- [Receiver catalog](receivers.csv): 26 receiver families / exact examples,
  charging requirements and access restrictions.
- [Pairing cases](pairings.csv): 36 concrete conversion and integration cases,
  covering every catalog entry at least once, including exclusions. This is not
  an exhaustive Cartesian product or a count of qualified products.
- [E-bike charging feasibility](EBIKE_SELF_CHARGING.md): own-motor versus
  external-generator routes, with limits of the "any e-bike" idea.
- [Architecture decision](DECISION.md): recommendation, calculations, cost/risk
  comparison and staged proof-of-concept plan.
- [Donor qualification checklist](QUALIFICATION.md): what to inspect and measure
  before accepting any recovered generator or battery.
- [Sources and archive](../../../components/generator-compatibility/README.md).

CSV files are UTF-8, comma-delimited and fully quoted. Open in a spreadsheet;
use the IDs to link generators (`Gxx`), receivers (`Rxx`) and cases (`Cxx`).

## Main conclusions

1. Prioritize permanent-magnet scooter/hoverboard motors, direct-drive bicycle
   hubs, and documented brushed-PM generators. Rank the *whole installation*,
   including mounts, transmission, wiring, cooling and donor condition.
2. Freewheeling geared hubs and typical mid-drives are poor first choices for
   using an intact bike's own motor as a generator. More converter voltage
   range cannot fix a disconnected mechanical path.
3. Nominal-36 V e-bike packs commonly require 42 V for full charge; conventional
   48 V and 52 V Li-ion examples require 54.6 V and 58.8 V. These are chemistry
   examples, not presets inferred from labels. A 32 V output excludes them.
4. The expanded goal now gives **buck-boost and an approximately 60 V output
   envelope a concrete purpose**. Study this as the broad-compatibility V2
   candidate, while preserving the buck-only prototype for comparison.
5. Compatibility must be a list of qualified combinations, not "any motor / any
   battery". OEM e-bike packs should initially use their approved chargers via
   a compatible buffered AC source, not an unqualified direct DC connection.
6. A dump load or another accepting sink remains necessary if constant training
   resistance is required when a battery is full or disconnects. The user decision
   of 2026-10-06 is **no internal dump hardware**: the baseline accepts reduced
   resistance, with GPIO control of an external accessory when fitted. See the
   [current architecture requirements](../CONTROLLER_V2_INTEGRATED_SPEC.md), also
   covering internal versus external main-converter assembly variants.

## How to read the evidence

- **Documented:** exact example supported by linked manufacturer/developer data.
- **User confirmed:** present scooter setup, approximately 36 V to 24 V by buck.
- **Calculated:** arithmetic under explicitly stated assumptions, not test data.
- **Engineering judgment:** priorities, integration difficulty and architecture.
- **Unqualified:** actual donor / battery still needs identification and testing.

"Common" here means recognizable reuse families, not measured French market
share. No second-hand listing census, availability guarantee or price quote was
performed. Example model names identify search targets, not interchangeable
parts. Anonymous marketplace power ratings are not evidence of generator output.
Every entry remains subject to exact model, revision, condition and documentation.

The copied V2 circuit remains V1 hardware with its existing 70 V limit. None of
the proposed 80 V-input / 60 V-output functionality has been implemented.
