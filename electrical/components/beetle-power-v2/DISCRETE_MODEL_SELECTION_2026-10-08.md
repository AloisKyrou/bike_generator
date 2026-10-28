# Discrete Model Selection

These are independently selected candidates, not a claim of the unidentified
Beetle C3 Q1/D1 BOM. Power transitions, reverse leakage, USB current policy,
battery protection and thermal qualification remain open.

## Q20

Alpha & Omega Semiconductor AO3401A, manufacturer `ao3401a.pdf` revision 3.1
(December 2023), package `aos-sot23.pdf` PO-00001 version N, marking document
PD-00660 version C. The manufacturer top-view G/S/D geometry corresponds to
project pads 1=gate, 2=source, 3=drain. The diagram identifies functions rather
than printing numeric lead IDs; the mapping is established by physical view,
not an invented manufacturer pin-number table. Existing Q_PMOS_GSD and native
AO3401A symbols both map 1=G, 2=S, 3=D. Saved circuit: G=VBUS_USB,
S=SYS_BAT, D=BAT_1S, preserving body-diode direction.

`Package_TO_SOT_SMD:SOT-23_Handsoldering` pads are 1.9 x 0.8 mm, centered
at (-1.5,-0.95), (-1.5,+0.95), (+1.5,0). They contain the manufacturer's
0.8 x 0.8 mm recommended lands centered at +/-1.2 mm after rotation into
the same view. The stock fabrication body nominal width is narrower than
the AOS nominal body, but courtyard encompasses the actual maximum body;
land fit is checked, not claimed as an exact vendor fabrication drawing.
No holes. Maximum RDS(on) is 85 milliohms at VGS=-2.5 V; 600 mA gives
30.6 mW at that resistance before temperature increase. Not a transient
or hot switching qualification.

## D21

Kingbright WP710A10LGD, archived official PDF, DSAL0509 / 1101029028,
revision V.9B, 18 April 2020. Low-current green 3 mm through-hole LED,
2.54 mm lead pitch, recommended 0.9 mm holes, short lead is cathode.
Device:LED maps 1=K, 2=A; LED_THT:LED_D3.0mm has pad 1 cathode at (0,0),
pad 2 anode at (2.54,0), 1.8 mm pads and 0.9 mm drills. Polarity/flat and
courtyard were visually checked. At 2 mA VF is 1.9 V typical, 2.25 V max;
the existing 2k resistor draws approximately 1.4-1.55 mA from 5 V depending
on CHRG saturation. This is below the TP4057's 5 mA CHRG test current and
LED 25 mA absolute maximum; brightness remains an enclosure test.

Scratch placements Q1/D1 were queried for all pads and exported through
native KiCad; actual footprint and symbol images were inspected at
`.konnect-scratch/v2-completion-2026-10-08/models/discrete-detail.png`
and `discretes.png`. No PCB changes or custom models were required.

## R45

Bourns CRM1206-FX-R820ELF: 0.82 ohm, 1%, 100 ppm/C, 0.5 W at 70 C,
linearly derated to zero at 155 C; maximum low-ohmic working drop 675 mV.
Source `CRM0805_1206_2010.pdf`, manufacturer page 2 visually inspected.
This intentionally changes the Beetle's 0.8 ohm by +2.5%: at 400 mA the
drop increases by 8 mV, and dissipation becomes 0.1312 W. At an illustrative
460 mA it is 0.1735 W; this is not a guaranteed charge-current bound.

Manufacturer body 3.10 +/-0.15 x 1.60 +/-0.15 mm, termination length
0.50 +/-0.25 mm, height 0.55 +/-0.10 mm. Two interchangeable terminals map
Device:R pins 1/2 to stock pads 1/2. Selected stock handsolder 1206 model
has 1.30 x 1.75 mm lands centered +/-1.55 mm, no holes, appropriate mask,
paste and courtyard. It covers maximum terminal width and provides toe
access; it is not an exact copy of Bourns' 1.30 x 1.80 mm recommendation
with 2.10 mm gap (stock gap is 1.80 mm). Solder-process and thermal copper
qualification remain required, especially before claiming full 0.5 W.
The actual scratch placement and both pad numbers were queried, native
KiCad-exported and visually inspected in `models/crm.png` under the current
completion scratch folder. This is an ordinary current-limiting input
resistor, not a precision Kelvin measurement shunt.
