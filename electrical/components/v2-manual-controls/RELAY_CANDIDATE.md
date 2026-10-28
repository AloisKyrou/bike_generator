# Independent CV path selector: relay research only

8 October 2026. Not selected or inserted by this research pass.

Panasonic `TQ2-3V` / Japanese order code `ATQ201` is a plausible hand-solderable
candidate. Standard THT, non-latching DPDT, BBM, silver/gold-clad contacts.
Manufacturer lists 10 uA / 10 mV minimum switching load as a reference value,
not a guarantee for every installation. Validate actual low-current feedback
contacts and contact resistance over life. Omron G5V-1's 1 mA / 5 V reference
minimum is less appropriate for this microcurrent path.

Source: [Panasonic product](https://na.industrial.panasonic.com/products/relays-contactors/mechanical-signal-relays/lineup/signal-relays/series/119572/model/119866),
[official PDF](https://industry.panasonic.com/ac/cdn/e/control/relay/signal/catalog/mech_eng_tq.pdf),
[manufacturer PDF mirrored by DigiKey](https://mm.digikey.com/Volume0/opasdata/d220001/medias/docus/7330/mech_eng_tq.pdf).
Archived `panasonic-tq.pdf`, ASCTB14E 202507. PDF p5 gives coil data; p13
gives bottom-view pinout and drill pattern. Local MiKTeX rendering/text extraction
lost text because Adobe-Japan1 mapping is missing; do not use those broken
renders as acceptance evidence. Web PDF extraction is readable.

Coil: 3 V, 64.3 ohm +/-10%, 140 mW nominal. Maximum allowable voltage is
150% at 20 C; temperature-dependent operation still needs checking.
Our calculation at 3.3 V: 51.3 mA typical, 56.9 mA at -10% resistance,
169 mW typical. This is a significant addition to the RT9080/USB budget,
although the relay itself is inexpensive. Driver and flyback diode are required;
do not drive the coil directly from an ESP pin.

[Fresh DigiKey France page](https://www.digikey.fr/en/products/detail/panasonic-industry/TQ2-3V/274749)
showed 1,222 in stock, EUR2.07 at one and EUR1.846 at ten, excluding VAT/shipping.
Earlier search-index prices were lower; use the freshly opened observation.

The relay does not alone solve: feedback continuity during BBM transfer,
MCP terminal voltage while connected, selection during logic brownout,
contact welding/open failure, or high-voltage feedback limits. Those remain
the CV engineering circuit's responsibilities. Standard KiCad model search,
complete pin-map verification and disposable placement render remain with the
sole schematic owner before any use.
