import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Static study, not an approved BQ feedback impedance or circuit qualification.
// Relay selects independent manual/digital lower legs. Digital uses W-B rheostat.
export function setting(code, trim, range, options = {}) {
  assert.ok(Number.isInteger(code) && code >= 0 && code <= 255);
  assert.ok(Number.isInteger(trim) && trim >= 0 && trim <= 31);
  assert.ok(range === 'low' || range === 'high');
  const { top = 1e6, series = 30.1e3, offset = 68e3, rab = 100e3,
    wiper = 175, switchOhms = 4.8, errorLsb = 0, referenceError = 0 } = options;
  for (const r of [top, series, offset, rab]) assert.ok(Number.isFinite(r) && r > 0);
  assert.ok(wiper >= 0 && switchOhms >= 0 && Math.abs(errorLsb) <= 1);
  const rheostat = Math.max(0, (code + errorLsb) * rab / 256) + wiper;
  const rangeOhms = range === 'low' ? offset : switchOhms;
  const bottom = series + switchOhms + rheostat + rangeOhms;
  const reference = (1.504 + trim * 0.002) * (1 + referenceError);
  return { code, trim, range, volts: reference * (1 + top / bottom), bottom, rheostat };
}

function gaps(ranges, low, high) {
  let covered = low;
  const result = [];
  for (const r of ranges.sort((a, b) => a.low - b.low)) {
    if (r.high < low || r.low > high) continue;
    if (r.low > covered) result.push({ low: covered, high: Math.min(r.low, high) });
    covered = Math.max(covered, r.high);
  }
  if (covered < high) result.push({ low: covered, high });
  return result;
}

const tested = [];
// Each adjacent-code worst gap uses independently adverse INL extremes. This
// is conservative: those two values need not simultaneously meet DNL <=1 LSB.
for (const rab of [70e3, 100e3, 130e3]) {
  for (const wiper of [0, 250]) {
    for (const rs of [-0.001, 0.001]) {
      for (const rt of [-0.001, 0.001]) {
        for (const ro of [-0.001, 0.001]) {
          for (const referenceError of [-0.007, 0.007]) {
            const opt = { rab, wiper, series: 30.1e3 * (1 + rs),
              top: 1e6 * (1 + rt), offset: 68e3 * (1 + ro), referenceError };
            const ranges = ['low', 'high'].flatMap(range =>
              Array.from({ length: 256 }, (_, code) => ({
                low: setting(code, 0, range, opt).volts,
                high: setting(code, 31, range, opt).volts,
              })));
            const uncovered = gaps(ranges, 12, 52.5);
            assert.equal(uncovered.length, 0);
            tested.push({ ...opt, uncovered });
          }
        }
      }
    }
  }
}

// With DNL +/-1 LSB, adjacent resistance steps are 0..2 LSB. Bounding the
// worst step at the smallest lower resistance suffices: gain sensitivity falls
// monotonically as bottom resistance grows. Fine-trim interval span is 4.122%.
const bottomMinimum = 30.1e3 * 0.999;
const maxStep = 2 * 130e3 / 256;
const topMaximum = 1e6 * 1.001;
const gainFast = 1 + topMaximum / bottomMinimum;
const gainSlow = 1 + topMaximum / (bottomMinimum + maxStep);
const maxAdjacentGainRatio = gainFast / gainSlow;
assert.ok(maxAdjacentGainRatio < 1.566 / 1.504);

const worstStaticSetpoint = 1.566 * 1.007 * (1 + topMaximum / bottomMinimum);
assert.ok(worstStaticSetpoint < 55);
const manualDefaultOhms = 1e6 / (12 / 1.536 - 1) - 30.1e3;
assert.ok(manualDefaultOhms > 0 && manualDefaultOhms < 200e3 * 0.8);
const minimumGuaranteedHigh = setting(0, 31, 'high', {
  top: 1e6 * 0.999, series: 30.1e3 * 1.001, rab: 130e3,
  wiper: 250, referenceError: -0.007, switchOhms: 4.8,
}).volts;
assert.ok(minimumGuaranteedHigh > 52.5);

const result = {
  status: 'PASS arithmetic; NOT an approved schematic, accuracy or dynamic safety claim',
  blockers: [
    'TI checklist explicitly requires 249k top resistor; proposed 1M needs TI clarification/validation.',
    'MOSFET leakage, diode leakage, FB input bias, temperature drift and switching dynamics excluded.',
    'NX6008NBK 4.8-ohm limit is only specified at 25C and VGS=1.5V.',
    'Ground-referenced divider defeats FBG sleep disconnect; manufacturer confirmation remains open.',
  ],
  cornerCount: tested.length,
  continuousTrimCoverageTest: '12..52.5 V, ideal ladders and listed static corners',
  maxAdjacentGainRatio, availableTrimRatio: 1.566 / 1.504,
  worstStaticSetpoint, minimumGuaranteedHigh,
  nominalHighMaximum: setting(0, 31, 'high').volts,
  nominalLowMaximum: setting(0, 31, 'low').volts,
  nominalManualEndpointsAtPorV: [0, 200e3].map(r => 1.536 * (1 + 1e6 / (30.1e3 + r))),
  manualDefaultOhms,
  bleed55VWithManual12V_uA: 55 / (1e6 + 30.1e3 + manualDefaultOhms) * 1e6,
  permanentParallelCounterexample: {
    description: '12V baseline,43k upper,70k rheostat, no series: MCP1mA ceiling forces a baseline gap',
    fallbackMaximumWithTrim: 12 * 1.566 / 1.536,
    enabledMinimumWithTrim: (12 + 1.536 * 43e3 / 70e3) * 1.504 / 1.536,
  },
};
const dir = path.dirname(fileURLToPath(import.meta.url));
fs.writeFileSync(path.join(dir, 'cv-parallel-independent-summary.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
