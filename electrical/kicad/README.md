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
`MCU`, `CC_CONTROL` and `CONNECTORS` are populated and linked. `POWER_PATH`
remains empty while the shunt, protection, maximum current, connector ratings
and LM5164 auxiliary power stage are unresolved. The future sheet will contain
both the short 400 W path and the low-power branch from `BUS_PROTECTED` to 5 V.
The global ERC consequently reports exactly three intentional unconnected
inputs: `SHUNT_HI_K`, `SHUNT_LO_K` and `VBUS_SENSE`.

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
