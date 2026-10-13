import assert from 'node:assert/strict';

// Review arithmetic only; no firmware, transient model or hardware qualification.
function nonnegative(values) {
  for (const [key, value] of Object.entries(values)) {
    if (!Number.isFinite(value) || value < 0) throw new Error(`Invalid ${key}`);
  }
}
function regnLoss(inputV, gateSupplyV, gateChargeNC, frequencyKHz) {
  nonnegative({ inputV, gateSupplyV, gateChargeNC, frequencyKHz });
  if (inputV < gateSupplyV) throw new Error('Not an LDO operating point');
  return (inputV - gateSupplyV) * 2 * gateChargeNC * frequencyKHz * 1e-6;
}
function currentForPower(voltageV, powerW, manualCurrentA) {
  nonnegative({ voltageV, powerW, manualCurrentA });
  if (voltageV === 0) throw new Error('Voltage must be positive');
  return Math.min(manualCurrentA, powerW / voltageV);
}
function usbScreen(espA, chargeA) {
  nonnegative({ espA, chargeA });
  const relayA = .04636;
  const otherLogicAllowanceA = .01;
  const vbusBleedA = 5 / 1000;
  const logicA = espA + relayA + otherLogicAllowanceA;
  return { espA, chargeA, relayA, otherLogicAllowanceA, vbusBleedA,
    inputA: logicA + chargeA + vbusBleedA,
    ldoW_ifSustained: (5 - .3 - 3.3) * logicA,
    chargerW_at3VCell: (5 - 3) * chargeA - .82 * chargeA ** 2 };
}
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`);
close(regnLoss(70, 5, 38, 288), 1.42272);
close(regnLoss(70, 5, 18, 288), .67392);
close(currentForPower(48, 400, 9.11), 400 / 48);
close(currentForPower(12, 400, 9.11), 9.11);
close(usbScreen(.17, .4).inputA, .63136);
assert.ok(usbScreen(.35, .4).inputA > .5);
assert.ok(usbScreen(.35, 0).inputA < .5);
assert.throws(() => regnLoss(4, 5, 38, 288));
assert.throws(() => regnLoss(70, 5, NaN, 288));
assert.throws(() => currentForPower(0, 400, 9.11));
assert.throws(() => usbScreen(-1, 0));

const manualCurrentA = 50000 / 5490;
const manualMaxV = 1.536 * (1 + 249000 / (5620 + 200 + 33));
console.log(JSON.stringify({
  status: 'PASS arithmetic checks; NOT a hardware rating',
  manual: { manualCurrentA, manualMaxV,
    combinedPowerW: manualCurrentA * manualMaxV,
    note: 'Nominal default reference and typical 33 ohm FBG; no tolerance bound.' },
  illustrative400WEnvelope: [12, 24, 36, 48, 55, 60, 67].map(voltageV => ({
    voltageV, maxCurrentA: currentForPower(voltageV, 400, manualCurrentA),
  })),
  regn250k: { sir870_38nC: regnLoss(70, 5, 38, 250),
    aons66923_18nC: regnLoss(70, 5, 18, 250) },
  regn288k: { sir870_38nC: regnLoss(70, 5, 38, 288),
    aons66923_18nC: regnLoss(70, 5, 18, 288),
    aons66923_35nC_screen: regnLoss(70, 5, 35, 288) },
  usbScenarios: [.17, .34, .35].flatMap(espA => [0, .1, .4].map(chargeA => usbScreen(espA, chargeA))),
  adcPublishedFullScaleV: 65.534,
  exclusions: [
    'Gate charge at 4.5 V is not a maximum at actual REGN drive; 35 nC is specified at 10 V.',
    'No switching, diode, temperature-dependent resistance, bootstrap or PCB thermal model.',
    '400 W table is ideal arithmetic, before current/voltage tolerance and thermal derating.',
    'USB load examples use published ESP peak scenarios, nominal relay and a provisional 10 mA allowance.',
    'USB source permission, inrush, suspend, charge-current tolerance and dynamic loads are not proved.',
    'Published ADC full scale does not specify behavior beyond range or prove accurate high-voltage telemetry.',
  ],
}, null, 2));
