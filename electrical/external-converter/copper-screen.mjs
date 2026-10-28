import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';

// Legacy IPC-2221 external-conductor screen, not a PCB thermal simulation.
export function screen({ amps, widthMm, lengthMm, copperUm, temperatureC = 60 }) {
  for (const x of [amps, widthMm, lengthMm, copperUm]) assert(x > 0 && Number.isFinite(x));
  assert(Number.isFinite(temperatureC));
  const areaMils2 = (widthMm / 0.0254) * (copperUm / 25.4);
  const riseC = (amps / (0.048 * areaMils2 ** 0.725)) ** (1 / 0.44);
  const rho = 1.724e-8 * (1 + 0.00393 * (temperatureC - 20));
  const resistanceOhm = rho * (lengthMm / 1000) / (widthMm / 1000 * copperUm / 1e6);
  return { riseC, resistanceOhm, dropV: amps * resistanceOhm, lossW: amps ** 2 * resistanceOhm };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const a = screen({ amps: 10, widthMm: 3, lengthMm: 63, copperUm: 35 });
  assert(Math.abs(a.riseC - 42.26) < 0.05);
  assert(Math.abs(a.dropV - 0.1197) < 0.0001);
  const twiceLength = screen({ amps: 10, widthMm: 3, lengthMm: 126, copperUm: 35 });
  assert(Math.abs(twiceLength.lossW - 2 * a.lossW) < 1e-12);
  assert.throws(() => screen({ amps: 10, widthMm: 0, lengthMm: 63, copperUm: 35 }));
  const rows = [];
  for (const copperUm of [35, 56, 70, 105]) {
    for (const widthMm of [3, 5]) {
      rows.push({ copperUm, widthMm, ...screen({ amps: 10, widthMm, lengthMm: 63, copperUm }) });
    }
  }
  console.table(rows);
  console.log('PASS numerical checks. Ratings and complete return paths remain unqualified.');
}
