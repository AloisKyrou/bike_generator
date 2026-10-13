import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Planning model, not a switching simulation or a thermal/current rating.
export function operatingPoint(vin, vout, {
  efficiency = 0.90, inputLimit = 15, outputLimit = 10, inputPowerLimit = 400,
  inductance = 10e-6, frequency = 250e3,
} = {}) {
  for (const value of [vin, vout, efficiency, inputLimit, outputLimit, inputPowerLimit, inductance, frequency]) {
    if (!Number.isFinite(value) || value <= 0) throw new Error('All parameters must be finite and positive');
  }
  if (efficiency > 1 || vin > 55 || vout > 55) throw new Error('Outside this 55 V planning envelope');
  const pin = Math.min(inputPowerLimit, vin * inputLimit, vout * outputLimit / efficiency);
  const pout = pin * efficiency;
  const iin = pin / vin;
  const iout = pout / vout;
  const low = Math.min(vin, vout);
  const high = Math.max(vin, vout);
  const ripple = low * (1 - low / high) / (inductance * frequency);
  const dc = Math.max(iin, iout);
  return { vin, vout, pin, pout, iin, iout, ripple,
    estimatedPeak: dc + ripple / 2,
    estimatedRms: Math.sqrt(dc ** 2 + ripple ** 2 / 12),
    modeCaveat: Math.abs(vin / vout - 1) < 0.15 ? 'Transition region: pure-mode ripple formula not valid' : 'Pure-mode approximation; actual controller timing must be checked',
  };
}

const points = [[12,14.4],[12,24],[12,42],[12,54.6],[14,24],[24,42],[27.5,55],[36,14.4],[36,24],[36,42],[36,54.6],[55,14.4],[55,54.6]];
assert.equal(operatingPoint(12,24).pout,162);
assert.equal(operatingPoint(36,14.4).iout,10);
assert.equal(operatingPoint(36,42).pin,400);
assert.throws(() => operatingPoint(12,58.8), /55 V/);
assert.throws(() => operatingPoint(12,24,{efficiency:0}), /positive/);
assert.throws(() => operatingPoint(12,24,{efficiency:1.1}), /55 V/);
assert.ok(operatingPoint(12,54.6,{frequency:212e3}).ripple > operatingPoint(12,54.6).ripple);
const frequencyMin = 212e3; // SLUSEN5A: minimum with nominal 133 kohm FSW resistor.
let highestNominalPeak = {estimatedPeak: 0};
let highestSensitivityPeak = {estimatedPeak: 0};
for (let vin=10; vin<=55; vin+=0.5) {
  for (let vout=10; vout<=55; vout+=0.5) {
    const p=operatingPoint(vin,vout);
    assert.ok(p.iin<=15+1e-9 && p.iout<=10+1e-9 && p.pin<=400+1e-9);
    assert.ok(Math.abs(p.pout/p.pin-0.9)<1e-12);
    assert.ok(p.estimatedPeak>=p.estimatedRms);
    const sensitivity=operatingPoint(vin,vout,{inductance:6.4e-6,frequency:frequencyMin});
    assert.ok(sensitivity.estimatedPeak>=p.estimatedPeak);
    if (p.estimatedPeak>highestNominalPeak.estimatedPeak) highestNominalPeak=p;
    if (sensitivity.estimatedPeak>highestSensitivityPeak.estimatedPeak) highestSensitivityPeak=sensitivity;
  }
}
const rows = points.map(([vin,vout]) => {
  const nominal = operatingPoint(vin,vout);
  // 6.4 uH is a sensitivity example: -20% tolerance and another -20% bias drop.
  const sensitivity = operatingPoint(vin,vout,{inductance:6.4e-6});
  const lowFrequency = operatingPoint(vin,vout,{inductance:6.4e-6,frequency:frequencyMin});
  return {...nominal, peakAt6p4uH:sensitivity.estimatedPeak,
    peakAt6p4uH212kHz:lowFrequency.estimatedPeak};
});
const columns=Object.keys(rows[0]);
const csv = [columns.join(','), ...rows.map(row => columns.map(key =>
  typeof row[key]==='number' ? row[key].toFixed(4) : JSON.stringify(row[key])).join(','))].join('\n')+'\n';
const dir=path.dirname(fileURLToPath(import.meta.url));
fs.writeFileSync(path.join(dir,'power-envelope.csv'),csv);
console.log('PASS: envelope checks over 8,281 voltage pairs; wrote power-envelope.csv. Not a hardware qualification.');
console.log(JSON.stringify({highestNominalPeak,highestSensitivityPeak,
  caveat:'Grid maxima of a pure-mode approximation, not guaranteed hardware bounds. 6.4uH is illustrative; frequency-resistor tolerance, current-limit error, transition, startup, faults and thermal bias are excluded.'},null,2));
