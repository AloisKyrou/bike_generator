# Measurements workspace

Use this directory for the characterization campaign that must precede the
final schematic and PCB routing.

- `raw/`: immutable source readings, serial captures and instrument exports;
- `photos/`: wiring, markings, probe locations and thermal-test photos;
- `processed/`: cleaned tables, plots and derived results.

The required measurement list is maintained in
[`docs/electrical/measurement-campaign.md`](../../docs/electrical/measurement-campaign.md).
The provisional values that allow PCB work to continue, plus the short
validation checklist for the first generator/buck pair, are in
[`first-generator-buck-validation-plan.md`](./first-generator-buck-validation-plan.md).

Each measurement set should state:

- date and test configuration;
- instrument and range;
- probe locations and polarity;
- battery and dump-load state;
- digipot/wiper setting;
- cadence or generator speed when applicable;
- raw value, unit and estimated uncertainty.
