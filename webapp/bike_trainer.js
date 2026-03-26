/**
 * bike_trainer.js — ESP32 Bike Trainer SDK
 *
 * Two classes, identical public API:
 *   BikeTrainerBLE   — talks to the real ESP32 over Web Bluetooth (FTMS profile)
 *   BikeTrainerMock  — fake data + keyboard controls for dev without hardware
 *
 * ── Quick start ──────────────────────────────────────────────────────────────
 *
 *   import { BikeTrainerBLE } from './bike_trainer.js';   // real
 *   import { BikeTrainerMock } from './bike_trainer.js';  // fake
 *
 *   const trainer = new BikeTrainerBLE();
 *
 *   trainer.onData             = ({ speedKmh, cadenceRpm, powerW }) => { ... };
 *   trainer.onConnectionChange = (connected) => { ... };
 *   trainer.onLog              = (msg, type) => { ... }; // optional
 *
 *   await trainer.connect();          // opens browser BLE picker
 *   await trainer.setGrade(3.5);      // simulation mode — 3.5% incline
 *   await trainer.setPower(150);      // ERG mode — 150 W target
 *   await trainer.setResistance(40);  // manual mode — 40/100
 *   await trainer.disconnect();
 *
 * ── Mock keyboard shortcuts (BikeTrainerMock only) ───────────────────────────
 *   ArrowUp / ArrowDown  → grade  ±0.5%
 *   PageUp  / PageDown   → power  ±10 W  (ERG)
 *   +  / -               → resistance ±5 (manual)
 *   Space                → toggle pedalling (cadence on/off)
 *
 * ── onLog type values ────────────────────────────────────────────────────────
 *   'ok'  green   'err' red   'tx' cyan   'rx' purple   'inf' grey
 */

// ─────────────────────────────────────────────────────────────────────────────
// BLE UUIDs (must match ESP32 firmware config.h)
// ─────────────────────────────────────────────────────────────────────────────
const FTMS_SERVICE          = '00001826-0000-1000-8000-00805f9b34fb';
const CHAR_INDOOR_BIKE_DATA = '00002ad2-0000-1000-8000-00805f9b34fb';
const CHAR_CONTROL_POINT    = '00002ad9-0000-1000-8000-00805f9b34fb';
const DEVICE_NAME           = 'ESP32 Bike Trainer';

// ─────────────────────────────────────────────────────────────────────────────
// BikeTrainerBLE
// ─────────────────────────────────────────────────────────────────────────────
export class BikeTrainerBLE {
  constructor() {
    this.device           = null;
    this.server           = null;
    this.service          = null;
    this.bikeDataChar     = null;
    this.controlPointChar = null;

    /** @type {(data: {speedKmh: number, cadenceRpm: number, powerW: number}) => void} */
    this.onData             = null;
    /** @type {(connected: boolean) => void} */
    this.onConnectionChange = null;
    /** @type {(msg: string, type: 'ok'|'err'|'tx'|'rx'|'inf') => void} */
    this.onLog              = null;

    this._connecting  = false;
    this._reconnecting = false;
    this._t0          = 0;
  }

  /** true while the GATT link is alive */
  get connected() {
    return this.device?.gatt?.connected ?? false;
  }

  /** Open the browser BLE picker and complete the full GATT setup */
  async connect() {
    this._connecting = true;
    this._log('Requesting BLE device…', 'inf');
    this.device = await navigator.bluetooth.requestDevice({
      filters: [{ name: DEVICE_NAME }],
      optionalServices: [FTMS_SERVICE],
    });

    this.device.addEventListener('gattserverdisconnected', () => {
      const ms = this._t0 ? `+${Date.now() - this._t0}ms` : 'before connect';
      this._log(`GATT disconnected [${ms}] connecting=${this._connecting}`, 'err');
      this.onConnectionChange?.(false);
      if (!this._connecting) this._reconnect();
    });

    this._log('Connecting to GATT server…', 'inf');
    this._t0 = Date.now();
    this.server = await this.device.gatt.connect();
    this._log(`[+${Date.now() - this._t0}ms] GATT connected — waiting for BLE stack…`, 'inf');
    await _delay(500); // Android drops link if you hit GATT immediately after connect
    if (!this.connected) throw new Error('GATT dropped right after connect — try again');

    this.service = await this.server.getPrimaryService(FTMS_SERVICE);
    this._log(`[+${Date.now() - this._t0}ms] FTMS service found`, 'ok');

    this.bikeDataChar = await this.service.getCharacteristic(CHAR_INDOOR_BIKE_DATA);
    this.bikeDataChar.addEventListener('characteristicvaluechanged', e => this._parseBikeData(e.target.value));
    await this.bikeDataChar.startNotifications();
    this._log(`[+${Date.now() - this._t0}ms] Indoor Bike Data: subscribed`, 'ok');

    this.controlPointChar = await this.service.getCharacteristic(CHAR_CONTROL_POINT);
    this.controlPointChar.addEventListener('characteristicvaluechanged', e => this._parseControlResponse(e.target.value));
    await this.controlPointChar.startNotifications();
    this._log(`[+${Date.now() - this._t0}ms] Control Point: ready`, 'ok');

    await this._write(new Uint8Array([0x00])); // request control
    this._log(`[+${Date.now() - this._t0}ms] Control granted`, 'ok');

    this._connecting = false;
    this.onConnectionChange?.(true);
  }

  /** Gracefully close the BLE connection */
  async disconnect() {
    this._reconnecting = false;
    this._connecting   = false;
    if (this.connected) {
      this.device.gatt.disconnect();
      this._log('Disconnected', 'inf');
    }
  }

  /** Manual resistance mode: level 0–100 */
  async setResistance(level) {
    level = Math.max(0, Math.min(100, Math.round(level)));
    this._log(`TX  opCode=0x04  resistance=${level}/100`, 'tx');
    await this._write(new Uint8Array([0x04, level, 0x00]));
  }

  /** ERG mode: target power in watts (0–1000) */
  async setPower(watts) {
    watts = Math.max(0, Math.min(1000, Math.round(watts)));
    const buf = new DataView(new ArrayBuffer(3));
    buf.setUint8(0, 0x05);
    buf.setInt16(1, watts, true);
    this._log(`TX  opCode=0x05  power=${watts}W`, 'tx');
    await this._write(new Uint8Array(buf.buffer));
  }

  /** Simulation mode: grade in percent, e.g. -10.0 to +15.0 */
  async setGrade(gradePercent) {
    gradePercent = Math.max(-20, Math.min(20, gradePercent));
    const raw = Math.round(gradePercent * 100); // unit = 0.01%
    const buf = new DataView(new ArrayBuffer(7));
    buf.setUint8(0, 0x11);
    buf.setInt16(1, 0,   true); // wind speed (unused)
    buf.setInt16(3, raw, true);
    buf.setUint8(5, 0);         // CRR (unused)
    buf.setUint8(6, 0);         // CW  (unused)
    this._log(`TX  opCode=0x11  grade=${gradePercent.toFixed(2)}%`, 'tx');
    await this._write(new Uint8Array(buf.buffer));
  }

  // ── private ─────────────────────────────────────────────────────────────

  async _reconnect() {
    if (this._reconnecting || !this.device) return;
    this._reconnecting = true;
    let attempts = 0;
    await _delay(800);
    while (this._reconnecting && attempts < 5) {
      attempts++;
      this._log(`Reconnecting… attempt ${attempts}/5`, 'inf');
      try {
        this.server           = await this.device.gatt.connect();
        await _delay(500);
        this.service          = await this.server.getPrimaryService(FTMS_SERVICE);
        this.bikeDataChar     = await this.service.getCharacteristic(CHAR_INDOOR_BIKE_DATA);
        this.controlPointChar = await this.service.getCharacteristic(CHAR_CONTROL_POINT);
        this.bikeDataChar.addEventListener('characteristicvaluechanged', e => this._parseBikeData(e.target.value));
        this.controlPointChar.addEventListener('characteristicvaluechanged', e => this._parseControlResponse(e.target.value));
        await this.bikeDataChar.startNotifications();
        await this.controlPointChar.startNotifications();
        await this._write(new Uint8Array([0x00]));
        this._reconnecting = false;
        this._log('Reconnected!', 'ok');
        this.onConnectionChange?.(true);
        return;
      } catch (e) {
        this._log(`Reconnect failed: ${e.message}`, 'err');
        await _delay(2000);
      }
    }
    this._reconnecting = false;
    this._log('Reconnect gave up after 5 attempts', 'err');
  }

  async _write(bytes) {
    if (!this.controlPointChar) throw new Error('Not connected');
    if (!this.connected) {
      this._log('GATT dropped — reconnecting before write…', 'err');
      await this._reconnect();
      if (!this.connected) throw new Error('Could not reconnect');
    }
    await this.controlPointChar.writeValueWithResponse(bytes);
  }

  _parseBikeData(dv) {
    if (dv.byteLength < 8) return;
    this.onData?.({
      speedKmh:   dv.getUint16(2, true) / 100,
      cadenceRpm: dv.getUint16(4, true) / 2,
      powerW:     dv.getInt16(6, true),
    });
  }

  _parseControlResponse(dv) {
    if (dv.byteLength < 3 || dv.getUint8(0) !== 0x80) return;
    const opCode = dv.getUint8(1);
    const result = dv.getUint8(2);
    this._log(`RX  opCode=0x${opCode.toString(16).padStart(2, '0')}  ${result === 1 ? 'OK' : `FAIL(${result})`}`,
              result === 1 ? 'rx' : 'err');
  }

  _log(msg, type = 'inf') {
    const ts = new Date().toLocaleTimeString('en-GB', { hour12: false });
    this.onLog?.(`[${ts}] ${msg}`, type);
    console.log(`[BikeTrainerBLE] ${msg}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// BikeTrainerMock  — same API, no hardware needed
// ─────────────────────────────────────────────────────────────────────────────
export class BikeTrainerMock {
  constructor() {
    /** @type {(data: {speedKmh: number, cadenceRpm: number, powerW: number}) => void} */
    this.onData             = null;
    /** @type {(connected: boolean) => void} */
    this.onConnectionChange = null;
    /** @type {(msg: string, type: string) => void} */
    this.onLog              = null;

    // Internal simulated state
    this._grade      = 0;    // %
    this._targetPower = 100; // W (ERG)
    this._resistance = 50;   // 0-100 (manual)
    this._power      = 100;  // W  (current simulated)
    this._cadence    = 80;   // rpm
    this._speed      = 20;   // km/h
    this._pedalling  = true;

    this._connected  = false;
    this._ticker     = null;
    this._keyHandler = null;
  }

  get connected() { return this._connected; }

  async connect() {
    this._connected = true;
    this._log('Mock connected', 'ok');
    this.onConnectionChange?.(true);
    this._startTicker();
    this._bindKeys();
  }

  async disconnect() {
    this._connected = false;
    this._stopTicker();
    this._unbindKeys();
    this._log('Mock disconnected', 'inf');
    this.onConnectionChange?.(false);
  }

  async setResistance(level) {
    this._resistance = Math.max(0, Math.min(100, Math.round(level)));
    this._log(`[MOCK] resistance=${this._resistance}/100`, 'tx');
  }

  async setPower(watts) {
    this._targetPower = Math.max(0, Math.min(1000, Math.round(watts)));
    this._log(`[MOCK] target power=${this._targetPower}W`, 'tx');
  }

  async setGrade(gradePercent) {
    this._grade = Math.max(-20, Math.min(20, gradePercent));
    this._log(`[MOCK] grade=${this._grade.toFixed(1)}%`, 'tx');
  }

  // ── private ─────────────────────────────────────────────────────────────

  _startTicker() {
    this._ticker = setInterval(() => this._tick(), 1000);
  }

  _stopTicker() {
    clearInterval(this._ticker);
    this._ticker = null;
  }

  _tick() {
    if (!this._pedalling) {
      this._power   = 0;
      this._cadence = 0;
      this._speed   = Math.max(0, this._speed - 0.5);
    } else {
      // Drift power toward target with some noise
      const noise = (Math.random() - 0.5) * 10;
      this._power = Math.round(Math.max(0, this._targetPower + noise));

      // Cadence: lower on steeper grade
      const baseCadence = 90 - this._grade * 2;
      this._cadence = Math.round(Math.max(0, baseCadence + (Math.random() - 0.5) * 4));

      // Speed: rough physics — flat ~25 km/h at 150W, grade shifts it
      const baseSpeed = Math.sqrt(Math.max(0, this._power)) * 1.5 - this._grade * 0.8;
      this._speed = Math.round(Math.max(0, baseSpeed) * 10) / 10;
    }

    this.onData?.({
      speedKmh:   this._speed,
      cadenceRpm: this._cadence,
      powerW:     this._power,
    });
  }

  _bindKeys() {
    this._keyHandler = (e) => {
      switch (e.key) {
        case 'ArrowUp':    this._grade = Math.min(20, this._grade + 0.5);
                           this._log(`[MOCK] grade → ${this._grade.toFixed(1)}%`, 'inf'); break;
        case 'ArrowDown':  this._grade = Math.max(-20, this._grade - 0.5);
                           this._log(`[MOCK] grade → ${this._grade.toFixed(1)}%`, 'inf'); break;
        case 'PageUp':     this._targetPower = Math.min(1000, this._targetPower + 10);
                           this._log(`[MOCK] target power → ${this._targetPower}W`, 'inf'); break;
        case 'PageDown':   this._targetPower = Math.max(0, this._targetPower - 10);
                           this._log(`[MOCK] target power → ${this._targetPower}W`, 'inf'); break;
        case '+':          this._resistance = Math.min(100, this._resistance + 5);
                           this._log(`[MOCK] resistance → ${this._resistance}`, 'inf'); break;
        case '-':          this._resistance = Math.max(0, this._resistance - 5);
                           this._log(`[MOCK] resistance → ${this._resistance}`, 'inf'); break;
        case ' ':          this._pedalling = !this._pedalling;
                           this._log(`[MOCK] pedalling → ${this._pedalling}`, 'inf'); break;
      }
    };
    window.addEventListener('keydown', this._keyHandler);
  }

  _unbindKeys() {
    if (this._keyHandler) window.removeEventListener('keydown', this._keyHandler);
    this._keyHandler = null;
  }

  _log(msg, type = 'inf') {
    const ts = new Date().toLocaleTimeString('en-GB', { hour12: false });
    this.onLog?.(`[${ts}] ${msg}`, type);
    console.log(`[BikeTrainerMock] ${msg}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
const _delay = ms => new Promise(r => setTimeout(r, ms));
