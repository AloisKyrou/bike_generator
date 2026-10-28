# TI PMP7282 recovered reference

Recovered from TI on 2026-10-05. The original computer's local-only
`buck_inspiration` directory is absent here; these are fresh manufacturer
downloads, not recovery of any personal annotations in that directory.

Official project: https://www.ti.com/tool/PMP7282

| Local file | Document / revision | Pages used |
|---|---|---|
| `sluua30.pdf` | PMP7282 Rev B test results, revised 2012-02-28 | 1-2: ratings and test coverage |
| `slur966.pdf` | Rev B BOM, generated 2012-03-19 | 1-2: devices and ratings |
| `sluua31.pdf` | SLUUA31 PCB layer plots | Reference archive; not layout-audited |
| `slur965.pdf` | SLUR965 schematic | Reference archive; not connectivity-audited |
| `lm5116.pdf` | LM5116 manufacturer datasheet | Archived for next detailed design review |

Exact source URLs, byte sizes and SHA-256 hashes are in [sources.json](sources.json).
`SLUC388.ZIP` is listed by TI but the download returned a login/non-ZIP response.
It is **not** archived here. No editable native CAD source was recovered for
PMP7282. A Gerber package alone would not be an editable schematic/PCB project.

This is a 35-60 V input, fixed 12 V / 50 A reference, not an 80 V-input V2
implementation. Its main MOSFETs are rated 80 V and output ceramics 25 V.
Do not reuse unchanged at our proposed input/output maxima.

Manufacturer copyright and notices remain in the unmodified PDFs. Public
download is not an open-source hardware license. Nothing has been staged,
committed, submitted to fabrication, imported into KiCad, or approved as a V2 part.
