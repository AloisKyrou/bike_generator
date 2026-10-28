# Selector robustness continuation

Engineering continuation after the frozen adaptive checkpoint. This document
separates the implemented zero-part wiring correction from optional future circuitry.
Only the schematic owner may implement changes. No energization, battery test,
fabrication or new component/model approval is conveyed here.

## Implemented contact correction

The schematic owner disconnected K1 pin 9 from GND and marked it no-connect.
COM8 remains on MCP P1A/P1W, NO7 on Q21 source, MCP P1B grounded, and
R85 = 110 kohm to GND. See the [implementation report](../../v2/docs/SCHEMATIC_CONTINUATION_2026-10-08.md)
and [independent CV review](INDEPENDENT_CONTINUATION_REVIEW_2026-10-08.md)
for the saved implementation and release gates. The earlier adaptive netlist
deliberately has pin 9 grounded; it is a historical checkpoint.

This removes a specific maximum-voltage mechanism at no BOM/GPIO cost:

| Pole A (FB) | Pole B (MCP) | Earlier grounded NC9 | Implemented open NC9 |
|---|---|---|---|
| Manual | Any | Manual divider | Same |
| Between contacts | Any | Lower leg open | Same |
| Digital | Digital | Programmed digital divider | Same |
| Digital | Between contacts | Lower leg open | Same |
| Digital | Manual/NC | MCP end forced to GND: guard maximum if Q21 on | Lower leg open |

This covers either pole order and temporary contact bounce represented by those
states. It does not model an internal contact short or insulation failure.
[cv-selector-continuation.mjs](../../v2/docs/calculations/cv-selector-continuation.mjs)
enumerates 18 ideal states; the only changed state
is the grounded-pot maximum request, now an open lower branch.

In settled manual mode both relay poles isolate the digital path. MCP A/W is
still defined by R85 and its resistor track to grounded B; it is not floating.
In the first milliseconds after logic loss before the relay moves, Q21 and
the rail clamps operate exactly as before, so removing the delayed NC ground
does not remove the protection used during that interval. After disconnection,
R85 alone and an illustrative 215 pF node capacitance give about 24 us time constant,
not milliseconds. The actual capacitance and leakage must be measured.

Q21 source can float while its NO contact is open. Drain/source parasitic charge
can be redistributed when NO reconnects, but no new sustained voltage source
is added. The body diode points source-to-drain, so an off Q21 blocks a positive
drain voltage reaching the source. If source charge subsequently flows through
that body diode, it raises FB rather than pulling it down. Dual D24 clamps
remain necessary; stored-charge spikes are not qualified by this static table.
Keep the MCP terminal bleed and upper FB resistor intact.

The read-only [CV netlist audit](../../v2/docs/calculations/cv-netlist-audit.ps1),
with `-OpenIdleContact`, requires K1.9 to be
a single-node no-connect net. It also checks the specifically named TP40/45/46
endpoints, if present, without accepting arbitrary extra nodes. Legacy adaptive
checks remain available without the switch. Owner fixtures should reject
grounding K1.9 again, tying it to 3V3/AW/NO7, losing R85, swapping relay poles,
or putting a probe pad on the wrong net.

## What the BQ actually does

The [TI datasheet SLUSEN5A](https://www.ti.com/lit/ds/symlink/bq25756.pdf),
section 6.3.9.1.3, states that excessive FB voltage stops switching and prevents
high-side turn-on, with a one-cycle response. The OVP threshold is at most
105.5% of the reference; the falling threshold is lower. Consequently the
safe-direction inference requires the permanent 249 kohm upper resistor to remain
connected: opening the *lower leg* pulls FB upward. A disconnected FB pin is
not the same condition and must not be described as safe.

With a 12 V output and initial FB of 1.536 V, a conservative OVP threshold using
maximum reference/accuracy is about 1.664 V. An illustrative 100 pF effective FB
capacitance rises there through 249 kohm in approximately 0.31 us. This is a calculated
example, not a bound: relay/Q21/parasitic capacitance and the BQ input behavior
matter. If the output starts near 0 V, the open lower leg requests roughly the
reference voltage, not an ideal zero-volt disconnect. Stored inductor/output
energy and battery backfeed do not disappear when switching is inhibited.

BAT_OVP also activates the internal SRN discharge load; the table gives 16 mA
typical, not a guaranteed maximum. A high attached battery and manual 12 V target
can therefore cause sustained internal dissipation; this is distinct from
mechanical handover and must be qualified separately.

ESP reset is not BQ reset. Section 6.4 and register 0x00 show VFB_REG reset by
REG_RESET, not WATCHDOG. Watchdog resets only listed fields; a retained trim
can alter manual fallback. For example, 1.566/1.536 turns calibrated 12 V into
about 12.234 V. Hardware lower-leg handover does not clear this. Current/enable
registers must likewise be treated according to their individual reset flags,
not a blanket claim that host loss restores all defaults.

## Remaining brownout problem

MCP4251 analog characteristics are specified from 2.7 V; its BOR is far below
that. A slow or abrupt rail collapse can cross an unspecified interval while
the relay is still digital. Opening NC9 removes pole-skew maximum demand, but
does not prevent an undefined wiper value while both NO contacts remain made.

An inexpensive supervisor is useful but not a complete timing proof. The
[TLV803E/809E/810E datasheet](https://www.ti.com/lit/ds/symlink/tlv803e.pdf)
gives up to 50 us reset assertion for the stated 10% undervoltage step and a
defined output only down to 0.7 V for the active-low versions. The 3.08 V option
has +/-2% threshold tolerance; its 3.0184 V lower threshold leaves only 0.3184 V to
the MCP minimum. Even treating 60 us as a provisional total reaction budget
would require rail descent below about 5.3 V/ms. This is not guaranteed during
an abrupt short. A 400 mA load on 10 uF drops about 40 V/ms, and a direct short can
be substantially faster. Resetting ESP adds its own GPIO-release latency.

## Bounded option comparison

| Option | Cost/parts direction | What it improves | What remains |
|---|---|---|---|
| Open K1 NC9 | Zero parts, zero GPIO | Removes the exact grounded-rheostat pole-skew maximum | MCP low-rail undefined state, converter dynamics |
| Supervisor on ESP EN | One small IC plus bypass; roughly sub-EUR 1 study allowance | Earlier reset on slow rail fall | Supervisor delay, GPIO reset semantics, hard short |
| Supervisor directly inhibits Q21 | Supervisor plus gate-isolation/driver passives or transistor; about EUR 0.5-1.5 study allowance | Avoids relying on firmware to stop the digital lower leg | Defined gate-low/high bounds, assertion delay, source charge, hard short |
| Local MCP hold-up plus hardware inhibit | Several parts, approximately EUR 1-3 allowance depending on reverse isolation | Can keep MCP valid until Q21 is off, including a main 3V3 short | Must prove reverse-short charge loss, GPIO/backfeed loading, comparator timing and recovery |
| Faster relay release clamp | One zener plus changed flyback arrangement | Reduces coil-current decay time | Does not prevent pre-release wiper corruption; negative NX gate stress and contact mechanics |

Prices above are budgeting allowances, not sourced BOM rows or selected parts.
No supervisor/ideal-diode/new flyback component is approved for drawing here.

The credible next architecture, if measurements show it is needed, is a small
isolated MCP supply reserve plus a hardware undervoltage inhibit of Q21. Hold
only the digipot/control island, not ESP or the 46 mA relay coil. As an example,
1.1 mA bounded island load for 100 us with 0.25 V usable margin needs 0.44 uF effective
capacitance. A nominal 4.7 uF part could give comfortable margin after real bias/
tolerance checks. That current budget must include SPI pullups feeding dead
ESP pins, local bleeds, diode leakage and any permitted spare-channel loading.
Move the upper analog clamp and tied MCP logic pins to the held rail together;
leaving the clamp on the collapsed main rail defeats the analysis.

A capacitor placed directly across main 3V3 does not isolate a hard short.
A diode reserve must have a guaranteed forward drop compatible with the
supervisor threshold; room-temperature BAT54 drop alone is not an all-temperature
proof. An ideal-diode IC reduces drop but its reverse blocking dynamics must
also be bounded. For example [MAX40200](https://www.analog.com/media/en/technical-documentation/data-sheets/MAX40200.pdf)
has a solderable SOT23-5 option and useful low-drop/DC-leakage specifications,
but the retrieved table does not give the reverse-short charge-loss bound
needed to size this reserve. Its typical waveforms are not that guarantee.
Do not add this IC and declare the abrupt-short problem solved.

Faster flyback can be evaluated without changing GPIO. For an illustrative
release at 10% of initial current, a 0.4 V flyback clamp gives 1.58*(L/R) decay,
while a 3.3 V zener plus 0.4 V diode gives 0.51*(L/R), about three times faster
electrically. Neither coil inductance nor mechanical release/bounce is bounded
by this calculation. Our NX gate shares the coil drive node and has an 8 V
absolute VGS limit: a larger negative clamp plus positive source voltage can
violate it. No zener change is recommended before observing the actual waveform.

## Recommendation and next evidence

The open-NC9 correction preserves all existing components and guarded manual
settings. Retain the dynamic release
gate. Do not select another protection topology merely to hide the unknowns.
The new FB/AW/gate/GND probe pads make the next evidence cheap to obtain:
capture rail loss and recovery with both low- and high-output dummy-load
profiles, and measure when MCP reaches 2.7 V versus when Q21 stops conducting.
Use only the separately approved, energy-limited commissioning process.

If the measured unsafe interval is real, use the isolated-MCP-reserve plus
hardware-inhibit option above and establish worst-case charge/timing bounds
before integration. This is a concrete route with a small load and plausible
small capacitor; it is not the earlier large ESP/relay hold-up scheme. Exact
parts and models still require approval. Receiver-safe brownout is not closed
by the open-contact correction alone.
