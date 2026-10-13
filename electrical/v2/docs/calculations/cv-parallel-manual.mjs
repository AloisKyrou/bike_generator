import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function manualCv({ top = 249e3, minimum = 7.5e3, trimmer = 0,
  fbg = 33, reference = 1.536 } = {}) {
  for (const x of [top, minimum, reference]) assert.ok(Number.isFinite(x) && x > 0);
  for (const x of [trimmer, fbg]) assert.ok(Number.isFinite(x) && x >= 0);
  return reference * (1 + top / (minimum + trimmer + fbg));
}

assert.throws(() => manualCv({ minimum: 0 }));
assert.throws(() => manualCv({ trimmer: -1 }));
const trimmerFor12V = 249e3 / (12 / 1.536 - 1) - 7.5e3 - 33;
assert.ok(Math.abs(manualCv({ trimmer: trimmerFor12V }) - 12) < 1e-12);
assert.ok(trimmerFor12V < 40e3);
const worstStaticMax = manualCv({ top: 249e3 * 1.001, minimum: 7.5e3 * 0.999,
  fbg: 0, reference: 1.566 * 1.007 });
assert.ok(worstStaticMax < 55);
let count = 0;
for (const topError of [-0.001, 0.001]) {
  for (const bottomError of [-0.001, 0.001]) {
    for (const trimmer of [0, 40e3, 50e3, 60e3]) {
      for (const fbg of [0, 33, 55]) {
        for (const reference of [1.504 * 0.993, 1.566 * 1.007]) {
          const v = manualCv({ top: 249e3 * (1 + topError),
            minimum: 7.5e3 * (1 + bottomError), trimmer, fbg, reference });
          assert.ok(v <= worstStaticMax);
          count++;
        }
      }
    }
  }
}
// Sensitivity, not accepted resistor sourcing: +/-25ppm/C per resistor,
// independent worst-sign drift over a100C excursion from reference temperature.
const withIllustrativeTcr = manualCv({ top: 249e3 * 1.001 * 1.0025,
  minimum: 7.5e3 * 0.999 * 0.9975, fbg: 0, reference: 1.566 * 1.007 });
assert.ok(withIllustrativeTcr < 55);
const result = {
  status: 'PASS static arithmetic; not transient, charging or hardware approval',
  cases: count,
  topology: '249k0.1% upper;7.50k0.1% plus50k rheostat lower; returnFBG',
  trimmerFor12V, worstStaticMax, headroomTo55V: 55 - worstStaticMax,
  endpointsNominalWith33OhmFbg: [0, 50e3].map(trimmer => manualCv({ trimmer })),
  endpointsNominalWithZeroFbg: [0, 50e3].map(trimmer => manualCv({ trimmer, fbg: 0 })),
  withIllustrativeTcr,
  wiperContactFault: 'Pins1+2 tied; pin3return. Wiper-open leavesfulltrack andlowerstarget.',
  exclusions: 'Converter dynamics, transient overshoot, thermal qualification, FB bias/leakage not explicitly bounded separately; trimmer calibration is mandatory. Component tolerances are assumptions until exactMPNs validated.',
};
const dir = path.dirname(fileURLToPath(import.meta.url));
fs.writeFileSync(path.join(dir, 'cv-parallel-manual-summary.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
