import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Static ratio study only. A-W rheostat, B externally open; powered shutdown opens A.
// No model here establishes powered-off isolation, accuracy or loop stability.
export function voltage(code, trim, { top = 499e3, series = 13.7e3,
  rab = 100e3, wiper = 175, errorLsb = 0 } = {}) {
  if (!Number.isInteger(code) || code < 0 || code > 255 ||
      !Number.isInteger(trim) || trim < 0 || trim > 31) throw new Error('Invalid code');
  for (const value of [top, series, rab]) {
    if (!Number.isFinite(value) || value <= 0) throw new Error('Invalid resistor');
  }
  if (!Number.isFinite(wiper) || wiper < 0 || !Number.isFinite(errorLsb) ||
      Math.abs(errorLsb) > 1) throw new Error('Invalid resistance error');
  const rheostat = rab * (256 - code + errorLsb) / 256 + wiper;
  const gain = 1 + top / (series + rheostat);
  return { code, trim, rheostat, gain, volts: (1.504 + 0.002 * trim) * gain };
}

function makeSettings(options, errors = () => 0) {
  const settings = [];
  for (let code = 0; code <= 255; code++) {
    for (let trim = 0; trim <= 31; trim++) {
      settings.push(voltage(code, trim, { ...options, errorLsb: errors(code) }));
    }
  }
  return settings.sort((a, b) => a.volts - b.volts);
}

function nearest(settings, target) {
  let lo = 0, hi = settings.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (settings[mid].volts < target) lo = mid + 1; else hi = mid;
  }
  const candidates = [settings[Math.max(0, lo - 1)], settings[Math.min(lo, settings.length - 1)]];
  return candidates.reduce((a, b) => Math.abs(a.volts - target) <= Math.abs(b.volts - target) ? a : b);
}

function intervals(options, errors = () => 0) {
  return Array.from({ length: 256 }, (_, code) => ({
    low: voltage(code, 0, { ...options, errorLsb: errors(code) }).volts,
    high: voltage(code, 31, { ...options, errorLsb: errors(code) }).volts,
  }));
}

function gaps(ranges, low = 12, high = 55) {
  const result = [];
  let covered = low;
  for (const range of [...ranges].sort((a, b) => a.low - b.low)) {
    if (range.high < low || range.low > high) continue;
    if (range.low > covered) result.push({ low: covered, high: Math.min(range.low, high) });
    covered = Math.max(covered, range.high);
  }
  if (covered < high) result.push({ low: covered, high });
  return result;
}

assert.throws(() => voltage(256, 0), /code/);
assert.throws(() => voltage(0, 32), /code/);
assert.throws(() => voltage(0, 0, { rab: -1 }), /resistor/);
assert.equal(voltage(255, 0, { rab: 100e3, wiper: 0 }).rheostat, 100e3 / 256);
assert.ok(voltage(255, 16).volts > voltage(0, 16).volts);

const profiles = [12, 14.4, 18, 24, 29.4, 36, 42, 54.6, 55];
const rows = [];
const cornerCoverage = [];
for (const rab of [70e3, 100e3, 130e3]) {
  for (const wiper of [0, 250]) {
    const options = { rab, wiper };
    const settings = makeSettings(options);
    const uncovered = gaps(intervals(options));
    assert.equal(uncovered.length, 0, 'Ideal ladder should cover nominal 12-55 V trim intervals');
    cornerCoverage.push({ rab, wiper, lowest: settings[0].volts,
      highest: settings.at(-1).volts, uncovered });
    for (const target of profiles) {
      const best = nearest(settings, target);
      rows.push({ rab, wiper, target, ...best, errorV: best.volts - target });
    }
  }
}

// Counterexample ladder: INL +/-0.5 LSB, a 2-LSB resistance step, DNL <=1 LSB.
// This is an allowed-shape sensitivity example, NOT a measured chip distribution.
const errors = code => code === 253 ? 0.5 : code === 254 ? -0.5 : 0;
const nonlinearOptions = { rab: 130e3, wiper: 250 };
for (let code = 0; code < 255; code++) {
  const stepLsb = 1 + errors(code) - errors(code + 1);
  assert.ok(stepLsb >= 0 && stepLsb <= 2);
}
const nonlinearGaps = gaps(intervals(nonlinearOptions, errors));
assert.ok(nonlinearGaps.some(gap => gap.high - gap.low > 0.5));

const nominal = makeSettings({});
let worstQuantization = { errorV: 0 };
for (let cents = 1200; cents <= 5500; cents++) {
  const target = cents / 100;
  const best = nearest(nominal, target);
  const errorV = Math.abs(best.volts - target);
  if (errorV > worstQuantization.errorV) worstQuantization = { target, ...best, errorV };
}

// Optional numerical fallback: two fixed top-resistor ranges, still ONE pot channel.
// No range switch, protection interface, or resistor network is selected here.
const twoRangeCoverage = [];
for (const rab of [70e3, 100e3, 130e3]) {
  for (const wiper of [0, 250]) {
    for (const nonlinear of [false, true]) {
      const ranges = [499e3, 1e6].flatMap(top => intervals(
        { top, series: 27.4e3, rab, wiper }, nonlinear ? errors : () => 0));
      const uncovered = gaps(ranges);
      assert.equal(uncovered.length, 0);
      twoRangeCoverage.push({ rab, wiper, nonlinear, uncovered });
    }
  }
}

const result = {
  status: 'PASS: arithmetic and stated counterexamples; NOT hardware qualification',
  topology: 'A-W lower-leg rheostat with B externally open; 499k top, 13.7k fixed lower series, ideal PGND return',
  cornerCoverage, worstQuantization, nonlinearGaps, twoRangeCoverage,
  poweredShutdown: 'A open: lower leg open, ideal FB follows output and target tends to Vref. Not isolation or a safe-off guarantee.',
  attached55VAtCode0: {
    feedbackV: 55 / voltage(0, 16).gain,
    potTerminalAV: 55 * voltage(0, 16).rheostat / (499e3 + 13.7e3 + voltage(0, 16).rheostat),
  },
  attached55VPoweredShutdown: 'With A truly open and no protection network, FB and external A both approach 55V. MCP42100 terminal limits are violated even though the ideal converter voltage target is low.',
  caveats: 'Resistor tolerance/drift, reference error, FBG impedance/open state, leakage, wiper-temperature bounds, powered-off behavior and dynamics excluded. The 55V target is a coverage test, not permission to command 55V without headroom. Synthetic DNL example proves ideal-code overlap alone is insufficient.',
};
const dir = path.dirname(fileURLToPath(import.meta.url));
const columns = Object.keys(rows[0]);
fs.writeFileSync(path.join(dir, 'cv-mcp42100.csv'),
  [columns.join(','), ...rows.map(row => columns.map(key => row[key]).join(','))].join('\n') + '\n');
fs.writeFileSync(path.join(dir, 'cv-mcp42100-summary.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
