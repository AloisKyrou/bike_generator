# TP4057 local input bypass study

Update later15October: **APPLIED to schematic and PCB**, local correction
verified with ERC/DRC and independent netlist comparison. See
[closeout](PREFAB_CLOSEOUT_2026-10-15.md). The study below records the original
before/after proposal; its placement coordinates are historical.

15 October 2026. Original study scope is
the external-converter controller, not V1 or integrated V2.

## Evidence and recommendation

Top Power TP4057 Rev2.2, page4 VCC description, requires a 10uF bypass capacitor.
Page9 explicitly shows the application with a series 0.8 ohm dissipation
resistor: VIN -> resistor -> VCC, with 10uF from VCC to ground **after** the
resistor. The application drawing was rendered and visually inspected.

Source: [official PDF](https://www.toppwr.com/uploadfile/file/20240913/66e3cef054ad8.pdf),
archived as [tp4057-rev2.2.pdf](../components/beetle-power-v2/tp4057-rev2.2.pdf).
SHA256: A522DCACC37484970B0C08A3102AB76AD5798E69A29665E5EC7690EDFE6A727F.

The present C42 is before R45, on VBUS_USB. Recommend reconnecting its positive
terminal to TP_VCC, after R45 and close to U6 pin4. **No added component, MPN,
supplier or component cost.** This follows the manufacturer's local bypass
arrangement; it does not prove the existing Beetle-derived circuit unstable.

```text
Present:  VBUS_USB --+-- R45 0.82R -- U6.VCC
                    C42
                    GND

Proposed: VBUS_USB ----- R45 0.82R --+-- U6.VCC
                                   C42
                                   GND
```

## Exact intended change

- Move C42.1 from /USB_INTERFACE/VBUS_USB to /LOGIC_POWER/TP_VCC.
- Leave C42.2 on GND; TP_VCC must join R45.2, U6.4 and C42.1.
- Retain C50 on VBUS, C46 on the system input and C45 on BAT.
- Retain C42 nominal10uF/16V, Murata GRM21BR61C106KE15L, PROVISIONAL status.

The saved placement puts C42 at (67,31), U6 at (71,31) and R45 at (67,25.5)mm.
This suggests a local copper retouch, not a board-wide reroute. Actual pad
orientation, shared VBUS trunk and GND loop must be inspected in KiCad before
editing. Preserve other VBUS branches. Final placement and path are not frozen
by these centre coordinates. Native netlist, ERC, PCB parity, refill/DRC and
visual review are required after implementation; do not change CAD with text.

## What this does not fix

At nominal400mA, R45 drops about0.328V and dissipates0.131W; moving the capacitor
does not change this steady-state loss. Nominal RC is8.2us, not a USB current
limiter or a controlled soft-start.

The selected ceramic's typical capacitance under DC bias is approximately5uF
at5V and5.8uF at4.2V, per the previous Murata curve study. Nominal10uF is not
guaranteed10uF effective. The TP4057 document does not establish an explicit
combined bias/temperature/aging acceptance limit. Retaining this inexpensive
nominal10uF part is a prototype proposal, not closure of charger qualification.
See [capacitor selection](CAPACITOR_SELECTION_2026-10-15.md).

Do not automatically double capacitance: USB inrush and the other downstream
capacitors still matter. This change alone neither establishes USB compliance
nor guarantees PC protection, reverse-current isolation or the combined
ESP/charger current budget. JP20 remains OPEN until cell/source qualification;
opening JP20 disables charge but does not disconnect U6.VCC or C42 from USB.

Use a current-limited bench5V source for initial qualification, not the PC.
With a qualified protected cell, inspect VCC/BAT during start, disconnect,
no-cell operation, charge phases and ESP load bursts; verify charge current,
termination, temperature and backfeed. These tests remain future work.
