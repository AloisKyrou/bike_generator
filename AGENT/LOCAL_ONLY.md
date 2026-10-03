# Local-only material at handoff

The following paths were intentionally untracked on 3 October 2026 and were not
included in the reviewed V1 commit:

| Path | Approximate contents | Approximate size |
|---|---|---:|
| `.konnect-scratch/` | temporary reports, renders, audit exports and helper files | 12.5 MB |
| `electrical/docs/buck_inspiration/` | TI PMP7282 PDFs, test results and legacy fabrication package | 5.0 MB |
| `electrical/kicad/bike-generator-controller - Copy/` | large manual project backup/copy | 42.6 MB |
| `electrical/kicad/bike-generator-controller/.konnect/snapshots/` | generated Konnect PDF snapshots | 0.5 MB |

They will not appear on another computer after a normal Git clone.

Do not delete, stage, or commit them automatically. Ask the user whether to:

- copy them separately;
- archive them outside the repository;
- add selected reference documents with provenance and licensing notes; or
- discard generated scratch after a verified backup.

The `buck_inspiration` material may be useful for V2 research but is not a source
of truth for the V1 controller design.
