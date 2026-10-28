# Fresh-session prompt

For current V2 development, read `electrical/v2/README.md`,
`electrical/v2/AGENTS.md` and `electrical/v2/docs/OUTPUT_RECEIVER_STUDY.md` first.
V1 and V2 are separated. V2's adaptive schematic has advanced beyond the
original V1 copy; its copied PCB remains unsynchronized. Follow the latest
checkpoint in `AGENT/README.md`. The prompt below is retained specifically
for resuming the V1 manufacturing release, not current V2 design work.

Copy the block below into a new Codex conversation after cloning or opening the
repository on the other computer.

```text
We are continuing the bike_generator controller PCB project.

Before doing any work:
1. Read the repository AGENTS.md.
2. Read every file in AGENT/, starting with AGENT/README.md.
3. Read electrical/AGENTS.md completely.
4. Run git status -sb and git log -3 --oneline, and report whether the expected
   V1 design and handoff commits are present.
5. Check that KiCad 10 and Konnect are available. Use Konnect for every KiCad
   mutation; never text-edit .kicad_sch, .kicad_pcb, .kicad_pro or libraries.

The reviewed design baseline is commit aefcb01. U1 is INA238AIDGSR; the sheet
name INA228_SENSE is legacy and intentional. The last checks had ERC 0/0 and DRC
0 design violations / 0 unconnected items, with only intentional board-only
mounting holes H1-H4 in parity.

Do not restart the design review from scratch or change architecture without a
new reason. First summarize the state you found and compare it with AGENT/V1_STATE.md.
The next intended work is the manufacturing release gate in AGENT/NEXT_STEPS.md:
align KiCad stackup metadata to 3 oz/105 µm + ENIG, refill zones, run fresh
pre-fab checks, then prepare but do not submit the PCBWay package without my
explicit approval.

Preserve all existing local changes and untracked files. Make small, verified
changes, report evidence, and commit only explicit task files.
```
