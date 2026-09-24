# KiCad workspace

The KiCad 10 project lives at:

```text
electrical/kicad/bike-generator-controller/
```

The planned project basename is:

```text
bike-generator-controller
```

The project was created and edited through Konnect. It contains the root
schematic, five hierarchical sheets and the initial PCB file for KiCad 10.0:

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

## Schematic sheets

The initial schematic hierarchy has been created:

1. `POWER_PATH`
2. `INA228_SENSE`
3. `MCU`
4. `CC_CONTROL`
5. `CONNECTORS`

The root schematic contains these five sheets on pages 2 to 6. `INA228_SENSE`,
`MCU`, `CC_CONTROL`, `CONNECTORS` and the provisional `POWER_PATH` are populated
and linked. `POWER_PATH` now contains the 400 W path, the provisional four-wire
shunt, `BUS_PROTECTED`, the external buck connection and the separately fused
auxiliary branch. Its Kelvin and bus outputs feed `INA228_SENSE`. The global ERC
reports no error and one expected warning: `AUX_IN_PROTECTED` does not yet feed
an LM5164 because the auxiliary converter sheet is the next design stage.

Project-owned library items currently include:

- `BikeGenerator:DFR0868_Beetle_ESP32-C3` — schematic symbol only;
- `BikeGenerator:DFR0520_Dual_Digital_Pot` — symbol and through-hole module
  footprint.

See the [KiCad workflow and troubleshooting guide](WORKFLOW.md) for the
creation steps, their manual equivalent and the verification process.
The implementation order and completion gates are tracked in the
[KiCad roadmap](ROADMAP.md).

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
