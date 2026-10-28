# Electrical workspace

Hardware revisions have separate design, BOM and documentation directories.
Manufacturer references and physical measurements remain shared.

```text
electrical/
  AGENTS.md
  components/       Shared datasheets, CAD provenance and component evidence
  measurements/     Shared measurements, labelled by hardware revision
  v1/
    README.md
    bom/             V1 purchasing and assembly records
    docs/            V1 reviews and release decisions
    kicad/
      bike-generator-controller/
      libraries/     V1-owned symbols, footprints and models
      exports/       Generated artifacts, ignored by Git
      download/      Local CAD downloads, ignored by Git
  v2/
    README.md
    bom/             V2 selection status, no approved purchasing BOM
    docs/            Architecture and output receiver study
    kicad/
      bike-generator-controller-v2/
      libraries/     Independent copy of V1 libraries
      exports/       Generated artifacts, ignored by Git
```

## Entry points

- [V1 baseline and release status](v1/README.md).
- [V2 development workspace](v2/README.md).
- [External converter controller](external-converter/README.md): V1-derived
  power/sensing with V2 ESP32/USB logic; separate project, PCB not synchronized.
- [V2 output receiver study](v2/docs/OUTPUT_RECEIVER_STUDY.md).
- [Shared component references](components/README.md).
- [Measurement campaign](measurements/README.md).
- [Historical prototype documentation](../docs/electrical/README.md).
- [KiCad operating workflow](../AGENT/KONNECT_WORKFLOW.md).

The V2 project began as a renamed V1 copy. Its current schematic now includes
the integrated BQ25756 stage and adaptive controls; follow the
[current checkpoint](v2/README.md) for what is drawn versus qualified.
The copied V2 PCB is still unsynchronized. V1 check results do not prove V2
target capability, and no V2 fabrication or energization release is implied.

On 2026-10-05, the former KiCad, BOM and V1 document directories moved under
`v1/`; the V2 architecture specification moved into `v2/docs/`. Shared
manufacturer PDFs and measurements stayed in place.

Use KiCad/Konnect for every change to KiCad source content. Keep generated
outputs, locks, history and snapshots out of normal commits. Preserve all
local material and stage explicit paths only.
