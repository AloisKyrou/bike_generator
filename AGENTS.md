# Repository agent instructions

Start every new session by reading [`AGENT/README.md`](AGENT/README.md). It is
the portable handoff for the current controller V1 work and links to the
authoritative design documents.

For any task under `electrical/`, also read
[`electrical/AGENTS.md`](electrical/AGENTS.md) completely before analysis or
modification.

## KiCad safety rule

Never modify `*.kicad_sch`, `*.kicad_pcb`, `*.kicad_pro`, `*.kicad_sym`,
`*.kicad_mod`, `sym-lib-table`, or `fp-lib-table` with a text editor, generic
script, search/replace, or patch. All KiCad mutations must go through KiCad or
the Konnect MCP tools. Read [`AGENT/KONNECT_WORKFLOW.md`](AGENT/KONNECT_WORKFLOW.md)
before touching the design.

## Working-tree rule

Preserve all existing user changes and untracked material. Stage explicit paths
only. In particular, the local scratch, snapshots, backup project copy, and buck
reference files listed in [`AGENT/LOCAL_ONLY.md`](AGENT/LOCAL_ONLY.md) are not
implicitly authorized for deletion or commit.

## Fabrication rule

Generating review artifacts is allowed when requested, but ordering boards,
submitting files to a manufacturer, or accepting substitutions requires the
user's explicit approval. The current release gate is documented in
[`AGENT/NEXT_STEPS.md`](AGENT/NEXT_STEPS.md).
