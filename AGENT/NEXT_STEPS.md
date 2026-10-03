# Next steps and release gates

The V1 design is reviewed, but it is not yet released for manufacture.

## 1. Make the repository available on the other computer

At handoff creation, local `main` was eight commits ahead of `origin/main` before
this documentation commit. The user must explicitly push the branch, or transfer
the repository another way, before a fresh checkout can contain the work.

Recommended checks:

```text
git status -sb
git log --oneline origin/main..HEAD
git push origin main
```

Do not push automatically without the user's approval.

The local-only files in [`LOCAL_ONLY.md`](LOCAL_ONLY.md) are not part of Git and
will not follow a normal clone.

## 2. Align KiCad manufacturing metadata

Through Konnect/KiCad only:

1. set the two outer copper layers to 105 µm / 3 oz;
2. set the finish/stackup metadata to ENIG where KiCad supports it;
3. save the board;
4. refill zones;
5. run a fresh saved-file DRC;
6. run schematic-to-PCB dry-run and require no changes;
7. document any intentional parity waiver for H1–H4.

Do not direct-edit the `.kicad_pro` or `.kicad_pcb` files.

## 3. Run the pre-fabrication review

Use the `kicad-review` and `kicad-manufacture` workflows. The review must include:

- ERC on the full hierarchy;
- DRC after zone refill;
- 70 × 110 mm board outline confirmation;
- four M3 mounting holes and edge clearance;
- J1/J2 polarity markings;
- J8 phase mapping and D2 pinout;
- F1/F2, D1, C6 and J6 polarity/orientation;
- U4 exposed-pad paste windows and thermal vias;
- 3 oz manufacturability around U1's 0.5 mm pitch;
- silkscreen readability and no text over pads;
- BOM value/footprint/MPN completeness;
- 3D/mechanical collision review.

## 4. Generate a fresh manufacturing package

Only after the review passes, create a new dated output directory under
`electrical/kicad/exports/` containing:

- Gerbers for all required copper, mask, silkscreen and edge layers;
- plated and non-plated drill files;
- top `F.Paste` for the stencil;
- fabrication and assembly drawings;
- a rendered Gerber review or screenshots;
- the exact grouped BOM used for purchasing;
- checksums or a manifest tying outputs to the Git commit.

Review the package in an independent Gerber viewer before upload.

## 5. PCB order contract

Current intended order, subject to a fresh quote and explicit user approval:

- PCBWay;
- 5 bare boards;
- 70 × 110 mm;
- 2 layers;
- 1.6 mm FR-4, Tg ≥150 °C;
- 3 oz finished copper both sides;
- ENIG;
- green solder mask, white silkscreen;
- 100% electrical test;
- one unframed, top-only 0.12 mm laser-cut stainless stencil;
- no assembly service for V1.

Inspect PCBWay's CAM preview and explicitly confirm 3 oz compatibility around
the VSSOP-10 before accepting the engineering review or paying.

## 6. Component orders

The current two-order strategy is Mouser plus Farnell. Before payment:

- recheck U1 and L1 stock;
- reject automatic substitutions for D2, F1, F2, R1, U4 and L1;
- verify the R17/R18 0.1% alternatives;
- confirm J6 quantity/minimum order;
- include Type 4 solder paste, thermal compound/interface and mechanical
  hardware outside the electronic BOM.

Use the five-board purchasing BOM and the sourcing plan linked from
[`README.md`](README.md).

## 7. Assembly and bring-up

Recommended first-board sequence:

1. inspect bare-board dimensions, drills, finish and continuity;
2. stencil/reflow the small SMD parts, paying special attention to U4's exposed
   pad and U1's 0.5 mm pitch;
3. inspect under magnification and test for shorts before fitting modules;
4. bring up the LM5164 from a current-limited 12 V bench supply;
5. verify 5 V, 3.3 V, PGOOD and quiescent current;
6. verify INA238 address 0x40 and calibration against a meter;
7. measure external-buck A/W/B levels before attaching J7/J9;
8. fit the D2 heatsink with thermal compound and 1.0 Nm M4 torque;
9. increase voltage/current in stages while logging D2, F1, R1, connector and
   copper temperatures;
10. test J1 and J8 variants separately, never together.

## 8. V2 direction, not a V1 change

V2 is expected to integrate the main buck and arrange heat-generating components
against one cooling face with a shared larger heatsink. Do not redesign V1 around
that concept unless the user explicitly reopens the architecture.
