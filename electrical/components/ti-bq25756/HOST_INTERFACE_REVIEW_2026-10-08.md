# Proposed BQ host interface: independent review

8 October 2026. Read-only engineering review before schematic implementation.
No KiCad commands or mutations were performed for this proposal review. This
does not approve energization, charging an actual receiver, or manufacturing.

## Recommendation

Proceed with the proposed minimal host interface as a clearly marked prototype
integration: shared ESP/INA 3.3 V I2C through two removable 0 ohm 0805 links;
one existing pair of 4.7 kohm pull-ups; BQ interrupt available at service/test;
CE held low by 10 kohm for cold-start autonomous permission. No added isolator,
always-live REGN logic bias, AUX supply or dedicated BQ-enable GPIO is justified
solely by the absence of an explicit power-off leakage specification.

This is acceptance of a reasonable circuit to draw and test, not proof of all
partial-power states. JP30/JP31 must remain open, R62's approximately 1 A input
limit stays, and the manual/app CV selector and protection gates stay open.

## Findings and conditions

1. **CE low does not guarantee immediate default behavior after ESP loss.**
   This is the most important functional distinction. At POR, EN_CHG=1,
   DIS_CE_PIN=0 and both current-pin limit enables are 1, so a CE pull-down
   supplies the requested permission when other start conditions are valid.
   An already powered BQ is not reset when the ESP loses power. Host settings,
   timer state, faults and receiver voltage may prevent or alter operation.
   Keep schematic wording "autonomous permission" rather than "always runs
   at defaults". The complete return-to-manual transition needs separate
   qualification with the eventual analog selector.

2. **Shared I2C is electrically plausible, not power-off-qualified.** SCL/SDA
   are open-drain; TI specifies 1.3 V minimum input HIGH, 0.4 V maximum LOW,
   output LOW at 5 mA sink, and 1 uA high-level leakage under powered test
   conditions. A 4.7k pull-up to 3.3 V requires at most about 0.70 mA per line,
   below the stated sink test. The absolute voltage limit is -0.3..6 V,
   not expressed as VIN plus a diode drop, but this alone does not guarantee
   Ioff or functional partial-power behavior.

   USB-only/ESP-on with BQ fully unpowered can potentially inject through its
   bus structures. The two pull-ups limit steady DC injection from those
   paths to about 1.4 mA combined, not zero. That can still phantom-power a
   small internal domain, distort logic thresholds or latch SDA low. With no
   VAC and no receiver battery, this is not a high-energy converter-input
   scenario; it remains a logic/backfeed test rather than evidence of a
   mandatory isolation IC. If the BQ is powered and ESP rail is off, its
   open-drain outputs are not intentional sources; pull-ups no longer have
   an independent live supply. Do not assume an unpowered 3V3 rail is exactly
   zero or that powered-output leakage is identically zero.

3. **J32 must stop behaving like an independent supply input.** Once its logic
   rail is connected to board 3V3, label any retained rail pin as
   `3V3 REFERENCE / NO EXTERNAL POWER`, not `BQ_LOGIC_3V3 INPUT`. External host
   cables must not add 5 V or always-on pull-ups. Removing the two 0 ohm links
   isolates SCL/SDA for diagnosis, not the entire board or its common ground.
   It does not authorize feeding J32's 3V3 pin from another supply. Give the
   bus-link references and normal fitted state in the connector documentation.

4. **CE service inhibit is a test input, not an independent safety shutdown.**
   Remove the redundant JP32-to-ground enable link and the previous pull-up;
   connect the 10k pull-down locally to U9 CE and GND. Keep the accessible CE
   node for bench inhibit. A current-limited 3.3 V source can pull it high
   against 10k, drawing about 0.33 mA. Keep total possible fault current below
   5 mA: CE can be repurposed as an open-drain output by register settings,
   so an unrestricted external push-pull source is inappropriate. An external
   1k test-lead resistor is a simple option, without adding a new PCB stage.
   If DIS_CE_PIN has been set, CE high does not inhibit charging. Therefore
   do not label this header as a guaranteed emergency stop.

5. **Polling instead of a dedicated interrupt GPIO is reasonable here.**
   Preserve INT's pull-up to the same ESP 3V3 rail and expose it at J32 or a
   test point. The controller's internal protections do not need the ESP to
   acknowledge INT. A shared-bus fault can, however, block both BQ control and
   INA telemetry; polling/INT are not independent safety protection. Verify
   read-to-clear flag semantics during later firmware work. No firmware change
   is authorized by this review.

6. **I2C timing and address checks are still needed.** BQ uses 7-bit 0x6B,
   distinct from the present INA238 0x40. Existing 4.7k pull-ups are a suitable
   starting point at 100 kHz. Measure rise time after PCB/cable capacitance is
   known before selecting 400 kHz or 1 MHz. With a simple RC bus,
   tr approximately 0.8473*R*C: 4.7k gives about 398 ns at 100 pF. This example
   is not a measured bus capacitance or approval of higher speeds. The links
   add no level shifting, surge protection or galvanic isolation.

## Retained-state checklist

SLUSEN5A, sections 6.4, 6.5.1..6.5.3 and 6.5.10..6.5.13:

| State | POR/default | On watchdog expiry |
|---|---|---|
| Feedback reference VFB_REG | 1.536 V | Not reset; last fine-trim value persists |
| Output current ICHG_REG | 20 A; enabled pin ceiling can be lower | Resets to default |
| Input current IAC_DPM | 20 A; enabled R62 pin ceiling can be lower | Not reset; lower host setting can persist |
| EN_ICHG_PIN / EN_ILIM_HIZ_PIN | Enabled | Reset enabled |
| EN_CHG | Enabled | Resets according to EN_CHG_BIT_RESET_BEHAVIOR |
| EN_CHG_BIT_RESET_BEHAVIOR | Reset enabled | This policy bit itself persists |
| DIS_CE_PIN | CE function enabled | Not reset; disabling CE can persist |
| WATCHDOG | 40 s selection | Selection persists; disabled watchdog stays disabled |

At initial POR the device is already in default mode. A register write enters
host mode and starts the watchdog; reads alone do not create that transition.
Watchdog expiry is a selective register reset, not POR. Later software must
deliberately retain pin limits, CE function and the chosen autonomous fallback
policy and read them back. With a 5 milliohm shunt, the current registers have
50 mA steps but a 400 mA lower clamp: zero-conversion demand uses EN_CHG=0,
not a fictitious zero-amp register code. For this study R62 remains about 1 A,
so raising IAC_DPM above that cannot legitimately expand input current while
the pin limit remains enabled.

Default charging timers, TS conditions, BAT_OVP behavior and higher-voltage
attached-battery response still prevent treating the BQ as a universal supply.
The mechanical CV path is already present, but a future manual/app selector
must handle its own power-down transient independently of I2C availability.

## Required first interface checks

Use current-limited, isolated bench equipment and keep high-energy input and
receiver links open until the wider commissioning procedure permits otherwise.
Do not use a valuable PC as the first protection test instrument.

| Condition | Evidence required |
|---|---|
| USB/logic on, BQ VAC and BAT absent | Measure SCL/SDA HIGH, leakage/injection, unexpected BQ rail rise, INA communication and bus recovery |
| BQ powered, ESP 3V3 absent | Measure 3V3 backfeed, SDA/SCL/INT/CE levels, autonomous permission and current-pin operation |
| Receiver-only BQ power | Repeat logic-off/logic-on cases; receiver-powered BQ is not "BQ unpowered" |
| Both powered; either rail ramps or collapses | No stuck bus, unintended reverse mode, loss of current-pin enables or unexplained gate activity |
| CE forced HIGH through limited bench source | Check inhibit at default configuration and demonstrate that DIS_CE_PIN changes its meaning |
| ESP reset/loss after host writes | Verify immediate behavior, watchdog expiry and retained VFB/IAC_DPM values separately |
| Main input absent then reapplied while receiver remains | Verify retained register policy; do not assume a fresh POR |

If excessive injection or a stuck bus occurs, the removable links provide a
diagnostic point. Select the smallest proven correction from measurements;
do not add a complex isolation/power-multiplexing architecture preemptively.

## Evidence

- Manufacturer authority: TI BQ25756 datasheet SLUSEN5A, revised August 2026,
  archived as `bq25756.pdf` in this directory; pin descriptions pp.4-5,
  absolute limits section5.1, digital electrical table p.13, interface section6.3.10,
  host/default section6.4 and register tables6-9/6-10/6-11/6-18/6-20/6-21.
  [Official TI publication](https://www.ti.com/lit/ds/symlink/bq25756.pdf).
- Saved pre-integration XML reviewed:
  `../../v2/kicad/exports/review-control-2026-10-08/controller-v2.xml`, SHA256
  `84E71E0C649CEE35A2272361CBCE7574158440724C11748FAA7D7A16805B30BD`.
  It proves current separate bus nets, R4/R6 4.7k to ESP3V3, BQ R68/R69 10k
  to the bench rail, R70 INT pull-up, R71 CE pull-up and JP32-to-GND.
- This report reviews the proposed changes, not a subsequently mutated
  schematic. Fresh saved connectivity/ERC/preservation checks are mandatory
  after the owner implements the interface.

Verdict: **reasonable minimal prototype integration, with explicit remaining
power-off and autonomous-transition qualifications; not hardware-safe release**.
