# KiCad workspace

The KiCad 10 project lives at:

```text
electrical/kicad/bike-generator-controller/
```

The planned project basename is:

```text
bike-generator-controller
```

The project was created through Konnect. It currently contains the initial
empty project, root schematic and PCB files generated for KiCad 10.0:

- `bike-generator-controller.kicad_pro`
- `bike-generator-controller.kicad_sch`
- `bike-generator-controller.kicad_pcb`

## Layout

```text
kicad/
├── bike-generator-controller/  Project sources created by KiCad/Konnect
├── libraries/
│   ├── symbols/                 Project-owned custom symbol libraries
│   ├── footprints/              Project-owned `.pretty` libraries
│   └── 3d-models/               STEP/WRL models owned by the project
└── exports/                     Generated PDFs, Gerbers, drills, BOM and CPL
```

Manufacturer PDFs do not belong here; store them under
[`../components/`](../components/).

## Planned schematic sheets

The initial schematic hierarchy has been created:

1. `POWER_PATH`
2. `INA228_SENSE`
3. `MCU`
4. `CC_CONTROL`
5. `CONNECTORS`

The root schematic contains these five sheets on pages 2 to 6. The first
validated component, `U1` (`INA228AIDGSR`), is now placed on `INA228_SENSE`;
the other sheets and all inter-sheet ports are still empty. See the
[KiCad workflow and troubleshooting guide](WORKFLOW.md) for the creation steps,
their manual equivalent and the verification process.

## Source and generated files

Version in Git:

- KiCad project, schematic and PCB sources;
- project-local library tables and custom libraries;
- explicit design-rule files;
- human-written design notes.

Keep outside Git by default:

- lock, autosave and backup files;
- temporary plots;
- generated fabrication outputs under `exports/`.
