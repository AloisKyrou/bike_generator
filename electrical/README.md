# Electrical workspace

This directory contains the engineering workspace for the electrical part of
the bike generator. It is kept separate from the firmware, web application and
public build documentation at the repository root.

The KiCad 10 project has been created through Konnect under
[`kicad/bike-generator-controller/`](kicad/bike-generator-controller/). It is
still an empty design: the electrical architecture and components have not yet
been placed.

## Directory map

```text
electrical/
├── components/                 Component references and downloaded datasheets
├── measurements/               Raw measurements, photos and processed results
├── bom/                        Working bills of materials and sourcing notes
└── kicad/
    ├── bike-generator-controller/  KiCad project sources
    ├── libraries/                  Project-owned symbols, footprints and 3D models
    └── exports/                    Generated review/fabrication outputs
```

## Existing design documentation

The current analysis remains in [`docs/electrical/`](../docs/electrical/) so it
stays visible from the main project documentation:

- [Electrical decisions and scope](../docs/electrical/README.md)
- [Observed prototype and open questions](../docs/electrical/as-built-and-open-questions.md)
- [INA228 PCB V1 specification](../docs/electrical/pcb-v1-ina228.md)
- [Measurement campaign](../docs/electrical/measurement-campaign.md)
- [Design methodologies](../docs/electrical/design-methodologies.md)

## Working rules

- Component PDFs and manufacturer files belong in `components/`, not beside the
  KiCad sources.
- Raw readings are never overwritten; corrected or transformed data goes into
  `measurements/processed/`.
- Generated Gerbers, PDFs and manufacturing archives belong in
  `kicad/exports/` and are ignored by Git by default.
- KiCad sources will be versioned, but must only be created or changed through
  KiCad/Konnect to preserve their internal references.
