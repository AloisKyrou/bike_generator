import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// DC sensitivity model only. No selected switches, FBG approval or safety rating.
const top = 100e3;
const bottom = 14.7e3;
const bank = [453e3, 226e3, 113e3, 56.2e3, 28e3, 14e3, 6.98e3];
const nominalFb = 1.536;
const fb = Array.from({ length: 32 }, (_, i) => 1.504 + i * 0.002);

export function output(code, reference, {
  scale = 1, topError = 0, bottomError = 0, ron = 0, offLeak = 0,
} = {}) {
  if (!Number.isInteger(code) || code < 0 || code > 127) throw new Error('Invalid bank code');
  if (![reference, scale].every(x => Number.isFinite(x) && x > 0)) throw new Error('Positive reference and scale required');
  if (![topError, bottomError, ron, offLeak].every(Number.isFinite)
      || Math.abs(topError) >= 1 || Math.abs(bottomError) >= 1 || ron < 0 || offLeak < 0) {
    throw new Error('Invalid sensitivity parameters');
  }
  let conductance = 1 / (bottom * scale * (1 + bottomError));
  let off = 0;
  bank.forEach((r, bit) => {
    if (code & (1 << bit)) conductance += 1 / (r * scale * (1 + bottomError) + ron);
    else off++;
  });
  return reference * (1 + top * scale * (1 + topError) * conductance)
    + top * scale * (1 + topError) * offLeak * off;
}

export function nearest(target) {
  let best;
  for (let code = 0; code < 128; code++) {
    fb.forEach((reference, trim) => {
      const voltage = output(code, reference);
      const error = voltage - target;
      if (!best || Math.abs(error) < Math.abs(best.error)) best = { target, code, trim, reference, voltage, error };
    });
  }
  return best;
}

const almost = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`);
almost(output(0, nominalFb), nominalFb * (1 + top / bottom));
almost(output(1, nominalFb) - output(0, nominalFb), nominalFb * top / bank[0]);
almost(output(0, nominalFb, { offLeak: 1e-6 }) - output(0, nominalFb), 0.7);
almost(output(127, nominalFb, { offLeak: 1e-6 }), output(127, nominalFb));
almost(output(127, nominalFb, { scale: 0.1 }), output(127, nominalFb));
assert.ok(output(127, nominalFb, { ron: 10 }) < output(127, nominalFb));
assert.throws(() => output(128, nominalFb), /code/);
assert.throws(() => output(0, nominalFb, { scale: 0 }), /Positive/);
assert.throws(() => output(0, nominalFb, { offLeak: -1 }), /parameters/);
for (let code = 1; code < 128; code++) assert.ok(output(code, nominalFb) > output(code - 1, nominalFb));

const rows = [12, 13.8, 14.4, 14.6, 18, 20, 24, 25.2, 29.2, 36, 42, 48, 50.4, 54.6, 55].map(target => {
  const p = nearest(target);
  // Partial error envelope: excludes FB bias, aging, temperature drift and dynamics.
  return { ...p,
    partialLow: output(p.code, p.reference * 0.993, { topError: -0.001, bottomError: 0.001, ron: 10 }),
    partialHigh100nA: output(p.code, p.reference * 1.007, { topError: 0.001, bottomError: -0.001, offLeak: 100e-9 }),
    partialHigh1uA: output(p.code, p.reference * 1.007, { topError: 0.001, bottomError: -0.001, offLeak: 1e-6 }),
  };
});
let worstNominalError = 0;
for (let centivolt = 1200; centivolt <= 5500; centivolt++) {
  const p = nearest(centivolt / 100);
  worstNominalError = Math.max(worstNominalError, Math.abs(p.error));
}
const positiveGaps = [];
for (let code = 0; code < 127; code++) {
  const gap = output(code + 1, fb[0]) - output(code, fb.at(-1));
  if (gap > 0) positiveGaps.push({ code, gap });
}
const columns = Object.keys(rows[0]);
const csv = [columns.join(','), ...rows.map(row => columns.map(key => row[key].toFixed(6)).join(','))].join('\n') + '\n';
const dir = path.dirname(fileURLToPath(import.meta.url));
fs.writeFileSync(path.join(dir, 'cv-resistor-bank.csv'), csv);
console.log(JSON.stringify({
  status: 'PASS: arithmetic and parameter tests; NOT hardware qualification',
  nominalLowest: output(0, fb[0]), nominalHighest: output(127, fb.at(-1)),
  positiveGaps, worstNominalError, sample54p6: rows.find(p => p.target === 54.6),
  attached55VallOffFb: 55 / (1 + top / bottom),
  attached55VallOffBleedW: 55 ** 2 / (top + bottom),
  attached55VallOffBleedAtTenthResistanceW: 55 ** 2 / ((top + bottom) * 0.1),
  note: 'RON and leakage are sensitivity assumptions, not guaranteed component limits.',
}, null, 2));
