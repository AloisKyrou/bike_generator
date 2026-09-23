# KiCad workspace

The future KiCad 10 project will live at:

```text
electrical/kicad/bike-generator-controller/
```

The planned project basename is:

```text
bike-generator-controller
```

No `.kicad_*` source has been created yet. Project creation will be performed
through Konnect in a separate step.

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

The initial structure discussed for the controller is:

1. `POWER_PATH`
2. `INA228_SENSE`
3. `MCU`
4. `CC_CONTROL`
5. `CONNECTORS`

These are planned names, not yet-created KiCad sheets. Their final hierarchy
will be confirmed when the schematic work begins.

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
