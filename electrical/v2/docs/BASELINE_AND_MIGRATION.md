# V2 starting baseline and workspace migration

Date: 2026-10-05. Source repository HEAD: `40e9168`; reviewed electrical baseline:
`aefcb01`. KiCad CLI 10.0.6; Konnect 0.12.1.

## Relocation

| Former location | Current location |
|---|---|
| `electrical/kicad/` | `electrical/v1/kicad/` |
| `electrical/bom/` | `electrical/v1/bom/` |
| `electrical/docs/`, except the V2 specification | `electrical/v1/docs/` |
| `electrical/docs/CONTROLLER_V2_INTEGRATED_SPEC.md` | `electrical/v2/docs/CONTROLLER_V2_INTEGRATED_SPEC.md` |

Shared `electrical/components/` and `electrical/measurements/` stayed in place.
All 56 tracked relocated files matched their original SHA-256 immediately after
the move. Documentation links and entry points were then updated. A final
verification confirmed all 35 non-Markdown relocated files still matched their
original hashes, including every V1 KiCad source, library and BOM CSV.

Existing local files within moved directories were preserved, including V1
history and local state. No local-only backup, snapshot or reference was deleted.
The separate Unity working-tree changes were left untouched. Nothing was staged
or committed during this task.

## Independent V2 copy

Copied 33 tracked project/config/library files into `electrical/v2/kicad/` with
SHA-256 verification before renaming. No history, locks, autosaves, generated
exports or local snapshots were copied into V2.

Konnect `rename_project` dry-run and apply renamed the new project and its
directory to `bike-generator-controller-v2`, including schematic project-instance
references. No protected KiCad content was edited with generic scripts.
Both project roots were independently read back through `get_project_info`.

V2 has its own library files. Its existing `${KIPRJMOD}/../libraries/` tables
resolve to those copies. The PCB file remains byte-identical to V1. Its V1
silkscreen, geometry, UUIDs and components are intentional starting content.
The copied Konnect configuration retains inherited rules and now explicitly
marks them as V1 hardware history with provisional V2 targets.

## Verification evidence

Saved-file checks were run sequentially with KiCad CLI. No zone refill or
board save was requested because geometry was unchanged. This is copy validation,
not a manufacturing release.

| Check | Result |
|---|---|
| V1 non-Markdown relocation hashes | 35/35 unchanged |
| V2 versus V1 PCB SHA-256 | Identical |
| Exported XML netlists, `components`, `nets`, `libparts` sections | Identical |
| Components / nets / sheets | 60 / 46 / 7 in both revisions |
| V2 ERC, all severities including exclusions | 0 violations |
| V2 DRC, active design violations | 0 |
| Unconnected items | 0 |
| Schematic parity | Four intentional board-only footprints H1-H4 |
| Excluded DRC findings | One inherited U2 silkscreen/board-edge clearance warning |

The excluded warning is `silk_edge_clearance`, involving the U2 F.Silkscreen
rectangle and an Edge.Cuts segment. No exclusion was added or removed. The
inherited project also disables some check categories, listed in the generated
ERC/DRC reports; these results mean no reported active violations under that
configuration, not that every possible check was enabled.

Detailed hash manifests, XML netlists, JSON reports and migration helpers are
local review artifacts under `.konnect-scratch/v2-start-20261005/`. They are not
part of a manufacturing package and are not implicitly authorized for commit.

## Known inherited portability limitation

Five placed model paths, and the corresponding footprint-library model paths,
still point to the original computer's
`C:/travail/projects/bike_generator/electrical/kicad/libraries/3dmodels/`:

- DFRobot Beetle ESP32-C3;
- Diotec DBI25-16A;
- Littelfuse 0449001;
- Littelfuse 0456020;
- Bourns shunt envelope.

The model files exist in each revision's own `kicad/libraries/3dmodels/`.
The absolute references were already invalid on this checkout before the move.
They were preserved to keep the V1 design unchanged. Repair through KiCad/Konnect
before using 3D rendering as mechanical evidence. Electrical copy checks do not
validate model rendering or enclosure clearances.

The inherited board remains a 12-70 V V1 design. Neither the name change nor
the clean active ERC/DRC establishes an 80 V input or a 10-60 V output capability.
