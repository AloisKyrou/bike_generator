import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { envelope } from './operating-envelope.mjs';

// Ideal pure-mode CCM only. Mode crossover, losses and generator ripple need
// separate evidence; numerical screens must never be presented as ratings.
export function stress({ vin, vout, watts, inductance = 8e-6, frequency = 212e3 }) {
  for (const x of [vin, vout, watts, inductance, frequency])
    assert.ok(Number.isFinite(x) && x > 0, 'Positive finite arguments required');
  assert.ok(vout / vin <= .9 || vout / vin >= 1.1, 'Crossover is not modeled');
  const buck = vin > vout;
  const duty = buck ? vout / vin : 1 - vin / vout;
  const inputA = watts / vin, outputA = watts / vout;
  const meanA = buck ? outputA : inputA;
  const rippleA = (buck ? vin - vout : vin) * duty / (inductance * frequency);
  assert.ok(meanA >= rippleA / 2, 'DCM is not modeled');
  const rmsSquared = meanA ** 2 + rippleA ** 2 / 12;
  const inputCapA = buck
    ? Math.sqrt(duty * rmsSquared - inputA ** 2) : rippleA / Math.sqrt(12);
  const outputCapA = buck
    ? rippleA / Math.sqrt(12) : Math.sqrt((1 - duty) * rmsSquared - outputA ** 2);
  return { vin, vout, watts, mode: buck ? 'buck' : 'boost', duty,
    inputA, outputA, meanA, rippleA, peakA: meanA + rippleA / 2,
    inductorRmsA: Math.sqrt(rmsSquared), inputCapA, outputCapA,
    inductorCopper25C_W: rmsSquared * .012,
    inductorCopper100C_W: rmsSquared * .012 * (1 + .00393 * 75),
    fetConduction25C_W: 2 * rmsSquared * .015,
    inputShuntDC_W: inputA ** 2 * .005,
    outputShuntDC_W: outputA ** 2 * .005 };
}

export function sharing(totalA, local, remote, mismatch = 0) {
  assert.ok(Number.isFinite(totalA) && totalA >= 0);
  assert.ok(Number.isInteger(local) && local > 0 && Number.isInteger(remote) && remote > 0);
  assert.ok(Number.isFinite(mismatch) && mismatch >= 0 && mismatch < 1);
  const low = .084 * (1 - mismatch), high = .084 * (1 + mismatch);
  const remoteOhms = high / remote + .005;
  const voltage = totalA / (1 / low + (local - 1) / high + 1 / remoteOhms);
  return { worstLocalA: voltage / low, otherLocalA: voltage / high,
    remoteEachA: voltage / remoteOhms / remote };
}

export function driverSupplyScreen(vin, gateChargeNC, ntcOhms = 3020) {
  assert.ok(Number.isFinite(vin) && vin > 5);
  assert.ok(Number.isFinite(gateChargeNC) && gateChargeNC > 0);
  assert.ok(Number.isFinite(ntcOhms) && ntcOhms > 0);
  const regn = 5, frequency = 288e3;
  const tsA = regn / (5230 + 1 / (1 / 30100 + 1 / ntcOhms));
  const gatesA = 2 * gateChargeNC * 1e-9 * frequency;
  return { vin, gateChargeNC, tsA, gatesA,
    gateLdoW: (vin - regn) * gatesA, tsLdoW: (vin - regn) * tsA,
    subtotalW: (vin - regn) * (gatesA + tsA),
    perFetChargeBudgetAt1W_NC: (1 / (vin - regn) - tsA) / (2 * frequency) * 1e9 };
}

function scan({ inputAmps, outputAmps, outputWatts, inductance }) {
  const maxima = {}, counts = { evaluated: 0, crossoverExcluded: 0, dcmExcluded: 0 };
  // A 0.5V grid is a sampled screen, not a proof of continuous extrema.
  for (let vin = 10; vin <= 70; vin += .5) {
    for (let vout = 12; vout <= 67; vout += .5) {
      if (vout / vin > .9 && vout / vin < 1.1) { counts.crossoverExcluded++; continue; }
      const limit = envelope({ vin, vout, inputAmps, outputAmps, outputWatts, efficiency: 1 });
      let point;
      try { point = stress({ vin, vout, watts: limit.watts, inductance }); }
      catch (error) {
        if (!error.message.includes('DCM')) throw error;
        counts.dcmExcluded++; continue;
      }
      counts.evaluated++;
      for (const name of ['peakA', 'inductorRmsA', 'inputCapA', 'outputCapA',
        'inductorCopper25C_W', 'inductorCopper100C_W', 'fetConduction25C_W',
        'inputShuntDC_W', 'outputShuntDC_W']) {
        if (!maxima[name] || point[name] > maxima[name].value)
          maxima[name] = { value: point[name], vin, vout, watts: point.watts };
      }
    }
  }
  return { inputAmps, outputAmps, outputWatts, inductance, counts, maxima,
    inputSharing20: sharing(maxima.inputCapA.value, 3, 2, .2),
    outputSharing20: sharing(maxima.outputCapA.value, 5, 2, .2),
    inputRemoteAbsentEachA: maxima.inputCapA.value / 3,
    outputRemoteAbsentEachA: maxima.outputCapA.value / 5 };
}

export function selfTest() {
  let checks = 0;
  const near = (a, b, tolerance = 1e-9) => { assert.ok(Math.abs(a - b) < tolerance, `${a} != ${b}`); checks++; };
  const buck = stress({ vin: 48, vout: 24, watts: 192, inductance: 10e-6, frequency: 250e3 });
  near(buck.meanA, 8); near(buck.rippleA, 4.8); near(buck.peakA, 10.4);
  near(buck.inputCapA ** 2, 16.96); near(buck.outputCapA ** 2, 1.92);
  const boost = stress({ vin: 24, vout: 48, watts: 192, inductance: 10e-6, frequency: 250e3 });
  near(boost.inputCapA, buck.outputCapA); near(boost.outputCapA, buck.inputCapA);
  near(boost.inductorRmsA, buck.inductorRmsA);
  // Independently integrate the piecewise switch-port waveform over a cycle.
  for (const [vin, vout] of [[48, 24], [24, 48], [60, 18], [18, 60]]) {
    const p = stress({ vin, vout, watts: 180 });
    let inSum = 0, outSum = 0;
    const count = 100000;
    for (let i = 0; i < count; i++) {
      const t = (i + .5) / count;
      const on = t < p.duty;
      const il = p.meanA - p.rippleA / 2 + p.rippleA *
        (on ? t / p.duty : 1 - (t - p.duty) / (1 - p.duty));
      const input = p.mode === 'buck' ? (on ? il : 0) : il;
      const output = p.mode === 'boost' ? (on ? 0 : il) : il;
      inSum += (input - p.inputA) ** 2;
      outSum += (output - p.outputA) ** 2;
    }
    near(Math.sqrt(inSum / count), p.inputCapA, 1e-4);
    near(Math.sqrt(outSum / count), p.outputCapA, 1e-4);
  }
  for (const mismatch of [0, .2]) {
    const s = sharing(6, 3, 2, mismatch);
    near(s.worstLocalA + 2 * s.otherLocalA + 2 * s.remoteEachA, 6);
  }
  for (const key of ['vin', 'vout', 'watts', 'inductance', 'frequency']) {
    for (const value of [0, -1, NaN, Infinity]) {
      assert.throws(() => stress({ vin: 48, vout: 24, watts: 180, [key]: value })); checks++;
    }
  }
  assert.throws(() => stress({ vin: 24, vout: 24, watts: 100 })); checks++;
  assert.throws(() => stress({ vin: 48, vout: 24, watts: 1 })); checks++;
  assert.throws(() => sharing(1, 0, 2)); checks++;
  assert.throws(() => sharing(1, 3, 2, 1)); checks++;
  near(driverSupplyScreen(70, 18).gateLdoW, .67392);
  assert.ok(driverSupplyScreen(70, 18).subtotalW < 1); checks++;
  assert.ok(driverSupplyScreen(70, 35).subtotalW > 1); checks++;
  assert.throws(() => driverSupplyScreen(5, 18)); checks++;
  return checks;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const tests = selfTest();
  const cases = [
    { name: 'nominal400W', inputAmps: 20 / 1.47, outputAmps: 50 / 5.49, outputWatts: 400 },
    { name: 'tolerance400W', inputAmps: 14.771, outputAmps: 9.91, outputWatts: 400 },
    { name: 'manualNoPowerCap', inputAmps: 14.771, outputAmps: 9.91, outputWatts: 1000 },
  ].flatMap(c => [8e-6, 6.4e-6].map(inductance => ({ name: c.name, ...scan({ ...c, inductance }) })));
  for (const inductance of [8e-6, 6.4e-6]) {
    const capped = cases.find(c => c.name === 'tolerance400W' && c.inductance === inductance);
    const manual = cases.find(c => c.name === 'manualNoPowerCap' && c.inductance === inductance);
    for (const key of Object.keys(capped.maxima)) {
      assert.ok(capped.maxima[key].value <= manual.maxima[key].value + 1e-9);
    }
  }
  console.log(JSON.stringify({ status: 'SCREEN_ONLY_NOT_A_RATING', tests, cases,
    driverSupply: [24, 36, 48, 60, 70].flatMap(vin => [18, 35].map(q => driverSupplyScreen(vin, q))),
    assumptions: ['Ideal CCM, efficiency=1; real loss raises input current for a given output power.',
      'Pure buck or boost only; 0.9<Vout/Vin<1.1 excluded, not validated.',
      '10-70V input/12-67V output are analysis bounds, not guaranteed control reach.',
      '6.4uH is an extra20% DC-bias sensitivity after initial8uH, not a guaranteed minimum.',
      'Shunt figures are DC loss only. FET figures assume guaranteed15mOhm at4.5V/25C.',
      '400W cap is hypothetical active control; absent from autonomous hardware.',
      '84mOhm sharing is a resistive proxy, not guaranteed ESR; no ceramic or ESL model.',
      'No generator rectifier ripple, core/switching losses, hot-plug or thermal validation.'] }, null, 2));
}
