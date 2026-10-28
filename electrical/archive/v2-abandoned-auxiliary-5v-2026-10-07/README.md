# V2 abandoned auxiliary 5 V checkpoint

Saved 7 October 2026 at the user's request, before simplifying active V2 to USB
logic power with an optional USB-charged protected 1S lithium backup cell.

`v2-abandoned-auxiliary-5v.zip` preserves all 93 files in `electrical/v2/` at
that point, including the KiCad project, project libraries, BOM, design notes,
and review exports. Every file inside the archive was read back and its SHA-256
compared to the original. `source-manifest.csv` records relative paths, sizes
and source hashes. No source files were rewritten to make this archive.

Archive SHA-256:
`ADD6B18AD1F9BB342FFF6F1A4A684E48DA836804C11673605F75668C9FFAE82F`

The ZIP contains a `v2/` directory. Its project-to-library relative paths are
preserved. Manufacturer reference PDFs in `electrical/components/` are shared
repository dependencies, not duplicated in this archive. KiCad's installed
standard libraries remain external dependencies too.

This is the former USB/AUX/battery proposal, not a fabrication release. Its
copied PCB is V1 and does not match its V2 schematic. BQ25756 main conversion,
wake/forced-off and USB high-voltage fault containment were unfinished.

Continue work in `electrical/v2/`, not in this historical checkpoint.
