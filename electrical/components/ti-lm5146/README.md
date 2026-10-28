# TI LM5146 buck reference

Retrieved 2026-10-05 from [TI's EVM page](https://www.ti.com/tool/LM5146-Q1-EVM12V).
See [sources.json](sources.json) for exact URLs, byte sizes and SHA-256 hashes.

| Local file | Document / revision | Pages used |
|---|---|---|
| `snvu591.pdf` | LM5146-Q1EVM user's guide, November 2018 | 1: architecture; later schematic/BOM/layout retained for detailed review |
| `lm5146.pdf` | SNVSBV0A, Rev A, June 2021 | 1, 16-17: controller range and voltage regulation; current-limit section for protection distinction |
| `snvr473.zip` | TI PCB layout package, board BSR049A | ZIP directory inspected; native design not opened or validated |

The ZIP actually contains:

- `BSR049A .zip`: Altium `.PrjPcb`, `.SchDoc`, `.PcbDoc` and output jobs;
- `BSR049A(001)_BOM.xls` and schematic PDF;
- `BSR049A-Gerber.zip`: fabrication layers and drill file;
- two board photographs.

This is genuine editable **Altium** material, not native KiCad. Archives remain
unmodified and unextracted; no CAD import or macro execution was performed.
The exact EVM is LM5146-Q1, while the archived controller datasheet is LM5146;
obtain the Q1 datasheet if selecting the automotive part rather than assuming
every ordering/qualification detail is interchangeable.

The EVM is 15-85 V input, 12 V / 8 A output. It is not a demonstrated 400 W
stage. Retain manufacturer notices and evaluation/reference-design conditions;
public availability is not an unrestricted open-hardware license.
