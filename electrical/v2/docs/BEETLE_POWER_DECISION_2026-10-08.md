# Beetle-derived logic power decision

8 October 2026. The user explicitly requests **no TPS63031** and the exact
Beetle power circuit if it meets the project requirements. This supersedes the
brief earlier approval to retain TPS63031 and the BQ24074/TPS63031 proposal.
Keep the ESP32 module and native USB service; do not restore generator AUX.

## Circuit to reproduce

```text
USB VBUS ---- diode ----------------------+---- RT9080-33 ---- 3V3
    |                                    |
    +---- 0.8 ohm ---- TP4057 ---- BAT ---- PMOS
                                  |
                            protected 1S cell
```

The C3 drawing sets the charger with 2 kohm, uses a 10 kohm USB gate pull-down,
a 200 kohm regulator-enable pull-up, and 10 uF local capacitors. TP4057 and
RT9080 are different functions, not alternatives to each other. The PMOS must
be oriented to block system-to-battery current when USB supplies the system;
its body diode first admits battery-to-system current before the channel turns
on. Neither the PMOS nor the charger makes an arbitrary cell safe.
[Official C3 schematic](https://dfimg.dfrobot.com/nobody/wiki/d0e8b7f0f042c14f6959c3edc748053b.pdf).

Use the source's connections and values as the baseline. Exact C3 diode/PMOS
MPNs are not identified in that published drawing. A similar DFRobot product
is not proof of those fitted parts. Document any selected equivalents and any
service disconnect explicitly; do not call an inferred BOM an exact clone.

## Requirement assessment

| Requirement | Assessment before physical validation |
|---|---|
| USB operation without a cell | Supported by the diode-to-LDO path; USB source and thermal budget still limit load |
| Operation from optional cell | Supported by the PMOS path; low-cell dropout and battery protection can end operation before all stored energy is used |
| USB charging while running | Supported with a sufficient source; total USB draw is the system current plus charging current |
| Stable 3.3 V over every cell state | Not guaranteed by an LDO; qualify a usable cell-voltage range and shutdown behavior |
| Flash, debug, serial TX/RX | Native USB data connections are retained; this power change does not remove those functions |
| No intentional generator backfeed into USB | AUX is absent; this does not isolate shared grounds or HV sensing/control fault paths |
| Arbitrary PC-port compliance | Not established; no hardware source-current negotiation or total-input-current limiter in the Beetle circuit |
| Automatic cell-temperature-qualified charging | Not provided by TP4057; die thermal regulation is not a cell NTC function |
| Easier manual assembly | SOT/TSOT leaded logic-power parts improve access compared with the former exposed-pad ICs; the rest of V2 still includes reflow-dependent parts |

**Verdict:** suitable topology for the intended simpler logic supply, subject to
source, cell and load qualification. It is not yet proof that the entire V2
meets every USB, temperature or battery-runtime requirement. Preserve visible
test/charging gates rather than silently relaxing requirements.

## Charging current correction

The manufacturer's TP4057 Rev 2.2 application table lists **2 kohm for about
400 mA**, consistent with DFRobot's product description. Do not apply the
simple low-current `1000/R` equation at all currents and claim 500 mA here.
The same datasheet's electrical table specifies 400 mA at 2.2 kohm, so the
document is not internally exact; the actual chosen variant, resistor and
thermal condition need measurement. The 0.8 ohm input resistor is not a
USB total-current limiter. There is no BQ24074-style system-load priority.
[TP4057 manufacturer datasheet](https://www.toppwr.com/uploadfile/file/20240913/66e3cef054ad8.pdf).

## Source and heat screening

[Reproducible calculation](calculations/beetle-power-budget.mjs) generates
[144 scenario rows](calculations/beetle-power-budget.csv). These are analytical
screens, not SPICE results, measured loads or USB compliance evidence.

Example: 350 mA radio peak plus an illustrative 25 mA of other logic, 400 mA
charging and 2 mA miscellaneous overhead totals **777 mA** from USB. With
charging disabled the same scenario is 377 mA. Neither number includes all
tolerances or proves current authorization by a PC. A qualified 5 V source
with adequate current is the bench route; a Type-C connector alone does not
grant permission to draw a particular current.

At 5 V USB and an illustrative 0.3 V diode drop, LDO dissipation is
`(4.7 - 3.3) * Ilogic`: 0.14 W at 100 mA, 0.28 W at 200 mA, or 0.525 W at
375 mA. Sustaining the last load at 40 C ambient gives about 93 C or 139 C
junction using two different manufacturer test-board thermal resistances.
Those are not our board temperatures and must not be applied to a brief RF
burst as steady-state heating. They show why layout and duty cycle matter.

RT9080-33GJ5 is the leaded TSOT-23-5 option. The manufacturer specifies up to
600 mA, but the thermal and dropout conditions remain applicable. Its maximum
specified dropout at 600 mA is 0.53 V, not the 0.31 V typical headline. The
module's minimum allowed supply and regulator transient response must be met
at the actual radio/peripheral load; no exact battery cutoff/runtime follows
from those two numbers alone.
[Richtek DS9080-09](https://www.richtek.com/assets/product_file/RT9080/DS9080-09.pdf).

## Bring-up on the full-function board

1. Check assembly and polarity with no cell, generator or receiver attached.
2. Check logic from a suitable current-limited USB source; measure source
   current, 3V3, programming/recovery and radio load steps.
3. With charging disabled, test a qualified protected cell and source changes
   at full/low cell voltage. Check startup, brownout and sleep leakage.
4. Enable charging only after cell charge-current/temperature limits and USB
   source budget are established. Measure termination and charger heat.
5. Verify battery-only USB data/VBUS behavior and unpowered-host leakage.
6. Integrate main power only after its independent safe-off and protection
   gates close. Low-energy tests use the same full-function first PCB.

No battery charging, generator connection or manufacturing approval follows
from copying Beetle. See the [completion criteria](explanations/IMPLEMENTATION_NOTES.md).
