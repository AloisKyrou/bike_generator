import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';

// Arithmetic screening only: the power cap is a requested limit, not circuitry.
export function envelope({ vin, vout, inputAmps, outputAmps, outputWatts, efficiency }) {
  for (const value of [vin, vout, inputAmps, outputAmps, outputWatts, efficiency]) {
    assert.ok(Number.isFinite(value) && value > 0, 'Inputs must be finite and positive');
  }
  assert.ok(efficiency <= 1, 'Efficiency cannot exceed unity');
  const limits = {
    requestedPowerCap: outputWatts,
    outputCurrentCap: vout * outputAmps,
    availableInput: efficiency * vin * inputAmps,
  };
  const watts = Math.min(...Object.values(limits));
  return {
    vin, vout, watts, outputAmps: watts / vout,
    inputAmps: watts / (efficiency * vin),
    limitingFactors: Object.keys(limits).filter(key => Math.abs(limits[key] - watts) < 1e-9),
  };
}

export function selfTest() {
  const example = { vin: 55, vout: 55, inputAmps: 15, outputAmps: 10,
    outputWatts: 400, efficiency: 0.9 };
  const high = envelope(example);
  assert.equal(high.watts, 400);
  assert.ok(Math.abs(high.outputAmps - 400 / 55) < 1e-12);
  assert.deepEqual(high.limitingFactors, ['requestedPowerCap']);
  assert.equal(envelope({ ...example, vout: 12 }).watts, 120);
  assert.equal(envelope({ ...example, vin: 12 }).watts, 162);
  for (const key of Object.keys(example)) {
    for (const invalid of [0, -1, NaN, Infinity]) {
      assert.throws(() => envelope({ ...example, [key]: invalid }));
    }
  }
  assert.throws(() => envelope({ ...example, efficiency: 1.01 }));
  let corners = 0;
  for (const vin of [12, 14, 18, 24, 36, 48, 55]) {
    for (const vout of [12, 14.4, 24, 36, 42, 48, 55]) {
      for (const efficiency of [0.8, 0.9, 1]) {
        const result = envelope({ ...example, vin, vout, efficiency });
        assert.ok(result.watts <= example.outputWatts + 1e-9);
        assert.ok(result.outputAmps <= example.outputAmps + 1e-9);
        assert.ok(result.inputAmps <= example.inputAmps + 1e-9);
        assert.ok(result.watts <= vin * result.inputAmps + 1e-9);
        corners++;
      }
    }
  }
  return { corners, invalidInputsRejected: 25 };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const tests = selfTest();
  // Proposed resistor values, not a tolerance-qualified or measured rating.
  const assumptions = {
    inputAmps: 20 / 1.47,
    outputAmps: 50 / 5.49,
    outputWatts: 400,
    efficiency: 0.9,
  };
  const examples = [
    [12, 14.4], [24, 24], [36, 24], [36, 42], [36, 55], [48, 55],
  ].map(([vin, vout]) => envelope({ ...assumptions, vin, vout }));
  console.log(JSON.stringify({
    status: 'ILLUSTRATIVE_ONLY_NOT_A_BOARD_RATING_OR_HARDWARE_POWER_LIMIT',
    tests, assumptions, examples,
  }, null, 2));
}
