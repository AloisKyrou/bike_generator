import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Screening equations, not a regulator transient model or a USB compliance test.
export function budget({ usbV, diodeV, logicA, chargeA, batteryV, chargeSeriesOhm = 0.8,
  overheadA = 0.002, ambientC = 40, thetaJA = 189.4 }) {
  for (const [key, value] of Object.entries({ usbV, diodeV, logicA, chargeA, batteryV,
    chargeSeriesOhm, overheadA, thetaJA })) {
    if (!Number.isFinite(value) || value < 0) throw new Error(`Invalid ${key}`);
  }
  if (!Number.isFinite(ambientC) || usbV - diodeV < 3.3) throw new Error('Invalid operating point');
  const inputA = logicA + chargeA + overheadA;
  const ldoW = (usbV - diodeV - 3.3) * logicA;
  const diodeW = diodeV * logicA;
  const chargeResistorW = chargeA ** 2 * chargeSeriesOhm;
  const chargerW = (usbV - batteryV) * chargeA - chargeResistorW;
  if (chargerW < 0) throw new Error('Insufficient charger headroom');
  return { inputA, ldoW, diodeW, chargeResistorW, chargerW,
    estimatedJunctionC: ambientC + thetaJA * ldoW,
    source100mAMarginA: 0.1 - inputA,
    source500mAMarginA: 0.5 - inputA,
    source1AMarginA: 1 - inputA };
}

const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`);
const base = { usbV: 5, diodeV: 0.3, logicA: 0.1, chargeA: 0.4, batteryV: 3.7 };
const example = budget(base);
close(example.inputA, 0.502);
close(example.ldoW, 0.14);
close(example.diodeW, 0.03);
close(example.chargeResistorW, 0.128);
close(example.chargerW, 0.392);
close(example.estimatedJunctionC, 66.516);
close(budget({ ...base, chargeA: 0 }).inputA, 0.102);
assert.ok(budget({ ...base, diodeV: 0.2 }).ldoW > example.ldoW);
assert.ok(budget({ ...base, batteryV: 3 }).chargerW > example.chargerW);
assert.throws(() => budget({ ...base, logicA: -1 }), /Invalid/);
assert.throws(() => budget({ ...base, usbV: NaN }), /Invalid/);
assert.throws(() => budget({ ...base, diodeV: 2 }), /operating/);
assert.throws(() => budget({ ...base, batteryV: 6 }), /headroom/);

const rows = [];
for (const usbV of [4.75, 5, 5.25]) {
  for (const diodeV of [0.2, 0.5]) {
    for (const logicA of [0.1, 0.2, 0.375, 0.5]) {
      for (const chargeA of [0, 0.1, 0.4]) {
        for (const thetaJA of [100.7, 189.4]) {
          const inputs = { usbV, diodeV, logicA, chargeA, batteryV: 3.7, ambientC: 40, thetaJA };
          rows.push({ ...inputs, ...budget(inputs) });
        }
      }
    }
  }
}
const columns = Object.keys(rows[0]);
const csv = [columns.join(','), ...rows.map(row => columns.map(key => row[key].toFixed(6)).join(','))].join('\n') + '\n';
fs.writeFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'beetle-power-budget.csv'), csv);
const radioScreen = budget({ ...base, logicA: 0.375 });
assert.ok(radioScreen.source500mAMarginA < 0);
assert.ok(budget({ ...base, logicA: 0.375, chargeA: 0 }).source500mAMarginA > 0);
console.log(JSON.stringify({
  status: 'PASS: arithmetic and invalid-input tests; NOT hardware qualification',
  cases: rows.length, radioScreen,
  note: 'Logic currents, diode drops and 2mA overhead are scenarios, not guaranteed load bounds. Junction estimates assume sustained current, not short radio bursts. Thermal values refer to manufacturer test boards, not our PCB. Charge current tolerance, USB inrush/enumeration/suspend and transient response are excluded.',
}, null, 2));
