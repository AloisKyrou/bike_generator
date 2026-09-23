// ============================================================
// BICYCLE RUNNER — Phaser 3 (Image-based version)
// Controls: SHIFT = Pedal/Accelerate | SPACE = Jump
// ============================================================

// ── Game constants ──────────────────────────────────────────
const GAME_WIDTH  = 900;
const GAME_HEIGHT = 500;
const GROUND_Y    = 400;
const GRAVITY     = 1200;
const SEGMENT_WIDTH = 4;

// ── Gameplay tuning ─────────────────────────────────────────
const MAX_SPEED           = 400;
const BASE_DECELERATION   = 30;
const PEDAL_BOOST         = 25;
const JUMP_VELOCITY       = -500;
const RAPID_PEDAL_WINDOW  = 300;   // ms — fast-pedal bonus window
const RAPID_PEDAL_MIN     = 50;    // ms — debounce
const GAME_OVER_DELAY     = 3000;  // ms stopped before game over
const LEVEL_DISTANCE      = 2500;  // distance units to complete level

// ── Bike trainer ────────────────────────────────────────────
const REAL_MAX_SPEED_KMH  = 30;
const BIKE_SPEED_CONVERGENCE = 4;  // proportional gain for speed tracking

// ── Terrain generation ──────────────────────────────────────
const TERRAIN_LOOK_AHEAD  = 500;
const TERRAIN_PRUNE_BEHIND = 200;
const COIN_SPACING_MIN    = 80;
const COIN_SPACING_RANGE  = 121;   // 80–200 range
const COIN_AIR_HEIGHT_MIN = 60;
const COIN_AIR_HEIGHT_RANGE = 71;
const STAR_CHANCE         = 0.15;
const COIN_VALUE          = 10;
const STAR_VALUE          = 50;

// ── Visual / UI ─────────────────────────────────────────────
const PLAYER_SCREEN_X     = 200;
const CLOUD_COUNT         = 5;
const GAUGE_SCALE         = 0.15;
const UI_DEPTH            = 10;

// ── Blackout scene ──────────────────────────────────────────
const BLACKOUT_GIF_LOOP_MS = 2000;
const BLACKOUT_GIF_LOOPS   = 3;
const REVEAL_TAP_COUNT     = 5;

// ── Common text styles ──────────────────────────────────────
const FONT_FUTURAL = 'futural';
const FONT_MONO    = 'monospace';

function textStyle(overrides = {}) {
    return {
        fontFamily: FONT_FUTURAL,
        fontSize: '18px',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 3,
        ...overrides,
    };
}


// ============================================================
// CHIPTUNE MUSIC ENGINE  (SNES-style synth — plays .mid files)
// ============================================================
class ChiptunePlayer {
    constructor() {
        this.audioCtx    = null;
        this.masterGain  = null;
        this.isPlaying   = false;
        this.midiPlayer  = null;
        this.volume      = 0.6;
        this.midiData    = null;

        this.channelConfig = this._defaultChannelConfig();
        this.activeNotes   = {};   // keyed by "ch-note"
        this._voiceMax     = 24;
    }

    // ── Public API ──────────────────────────────────────────

    /** Call from a user-gesture handler before play(). */
    preinit() {
        if (this.audioCtx) {
            if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
            return;
        }
        this._buildGraph();
        this.audioCtx.resume().catch(() => {});
    }

    play() {
        if (!this.midiData) { console.warn('No MIDI data loaded'); return; }
        if (!this.audioCtx) this._buildGraph();
        if (this.isPlaying) this.stop();
        this.isPlaying = true;

        const startMidi = () => {
            if (!this.isPlaying) return;
            this.midiPlayer = new MidiPlayer.Player((event) => this._handleMidiEvent(event));
            this.midiPlayer.on('endOfFile', () => {
                if (this.isPlaying) { this.allNotesOff(); this.midiPlayer.stop(); this._startFromData(); }
            });
            this._startFromData();
        };

        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume().then(startMidi).catch(() => startMidi());
        } else {
            startMidi();
        }
    }

    stop() {
        this.isPlaying = false;
        if (this.midiPlayer) { this.midiPlayer.stop(); this.midiPlayer = null; }
        for (const key of Object.keys(this.activeNotes)) {
            const v = this.activeNotes[key];
            try { v.osc.stop(); v.osc.disconnect(); v.env.disconnect(); } catch (_) {}
        }
        this.activeNotes = {};
    }

    allNotesOff() {
        for (const key of Object.keys(this.activeNotes)) this._releaseNote(key, false);
    }

    setVolume(vol) {
        this.volume = vol;
        if (this.masterGain) this.masterGain.gain.setValueAtTime(vol, this.audioCtx.currentTime);
    }

    loadMidi(url) {
        return fetch(url)
            .then(r => { if (!r.ok) throw new Error(r.statusText); return r.arrayBuffer(); })
            .then(buf => { this.midiData = this._arrayBufferToBase64(buf); })
            .catch(e => console.error('MIDI load error:', e));
    }

    // ── Audio graph ─────────────────────────────────────────

    _buildGraph() {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.value = this.volume;
        this.masterGain.connect(this.audioCtx.destination);

        this.compressor = this.audioCtx.createDynamicsCompressor();
        this.compressor.threshold.value = -20;
        this.compressor.knee.value      = 10;
        this.compressor.ratio.value     = 4;
        this.compressor.attack.value    = 0.005;
        this.compressor.release.value   = 0.1;
        this.compressor.connect(this.masterGain);

        const curve = new Float32Array(256);
        for (let i = 0; i < 256; i++) curve[i] = Math.tanh(((i / 128) - 1) * 1.5);
        this.waveshaper = this.audioCtx.createWaveShaper();
        this.waveshaper.curve = curve;
        this.waveshaper.oversample = 'none';
        this.waveshaper.connect(this.compressor);

        this.audioCtx.onstatechange = () => {
            if (this.audioCtx.state === 'suspended' && this.isPlaying) {
                this.audioCtx.resume().catch(() => {});
            }
        };
    }

    _outputNode() { return this.waveshaper || this.compressor; }

    // ── MIDI playback ───────────────────────────────────────

    _startFromData() {
        this.midiPlayer.loadDataUri('data:audio/midi;base64,' + this.midiData);
        // Pre-scan for Set Tempo meta event (FF 51 03 tt tt tt)
        try {
            const raw = atob(this.midiData);
            for (let i = 0; i < raw.length - 5; i++) {
                if (raw.charCodeAt(i) === 0xFF && raw.charCodeAt(i+1) === 0x51 && raw.charCodeAt(i+2) === 0x03) {
                    const uspb = (raw.charCodeAt(i+3) << 16) | (raw.charCodeAt(i+4) << 8) | raw.charCodeAt(i+5);
                    if (uspb > 0) this.midiPlayer.tempo = Math.round(60000000 / uspb);
                    break;
                }
            }
        } catch (_) { /* use player default */ }
        this.midiPlayer.play();
    }

    _handleMidiEvent(event) {
        if (!this.isPlaying) return;
        const ch = (event.channel || 1) - 1;

        if (event.name === 'Note on') {
            event.velocity === 0 ? this.noteOff(ch, event.noteNumber) : this.noteOn(ch, event.noteNumber, event.velocity);
        } else if (event.name === 'Note off') {
            this.noteOff(ch, event.noteNumber);
        } else if (event.name === 'Program Change') {
            this._handleProgramChange(ch, event.value);
        }
    }

    // ── Polyphonic voices ───────────────────────────────────

    noteOn(channel, note, velocity) {
        if (!this.audioCtx || !this.isPlaying) return;
        if (channel === 9) { this._playDrum(note, (velocity || 127) / 127); return; }

        const key = `${channel}-${note}`;
        if (this.activeNotes[key]) this._releaseNote(key, true);

        const keys = Object.keys(this.activeNotes);
        if (keys.length >= this._voiceMax) this._releaseNote(keys[0], true);

        const cfg = this.channelConfig[channel] || { type: 'square', gain: 0.07 };
        const ctx = this.audioCtx;
        const now = ctx.currentTime;
        const vel = (velocity || 127) / 127;

        const osc = ctx.createOscillator();
        const env = ctx.createGain();
        osc.type = cfg.type;
        osc.frequency.value = 440 * Math.pow(2, (note - 69) / 12);
        env.gain.setValueAtTime(0, now);
        env.gain.linearRampToValueAtTime(vel * cfg.gain, now + 0.008);
        env.gain.linearRampToValueAtTime(vel * cfg.gain * 0.7, now + 0.05);
        osc.connect(env);
        env.connect(this._outputNode());
        osc.start(now);

        this.activeNotes[key] = { osc, env, startTime: now };
    }

    noteOff(channel, note) {
        if (!this.audioCtx || !this.isPlaying || channel === 9) return;
        this._releaseNote(`${channel}-${note}`, false);
    }

    _releaseNote(key, immediate) {
        const voice = this.activeNotes[key];
        if (!voice) return;
        delete this.activeNotes[key];

        const now     = this.audioCtx.currentTime;
        const release = immediate ? 0.01 : 0.06;
        voice.env.gain.cancelScheduledValues(now);
        voice.env.gain.setValueAtTime(voice.env.gain.value, now);
        voice.env.gain.linearRampToValueAtTime(0, now + release);

        const { osc, env } = voice;
        setTimeout(() => { try { osc.stop(); osc.disconnect(); env.disconnect(); } catch (_) {} },
            (release + 0.05) * 1000);
    }

    // ── Drum synthesis ──────────────────────────────────────

    _playDrum(note, velocity) {
        const ctx = this.audioCtx;
        const now = ctx.currentTime;
        const vol = velocity * 0.15;
        const out = this._outputNode();

        if (note === 36 || note === 35) {
            this._drumTone(ctx, now, out, vol, { freq: 160, freqEnd: 30, dur: 0.15, gain: 2, type: 'sine' });
        } else if (note === 38 || note === 40) {
            this._drumNoise(ctx, now, out, vol, { dur: 0.1, gain: 1, filterType: 'bandpass', filterFreq: 3500, filterQ: 1 });
            this._drumTone(ctx, now, out, vol, { freq: 200, freqEnd: 80, dur: 0.08, gain: 0.8, type: 'triangle' });
        } else if (note === 42 || note === 44) {
            this._drumNoise(ctx, now, out, vol, { dur: 0.04, gain: 0.4, filterType: 'highpass', filterFreq: 9000 });
        } else if (note === 46) {
            this._drumNoise(ctx, now, out, vol, { dur: 0.15, gain: 0.5, filterType: 'highpass', filterFreq: 7000 });
        } else if (note === 49 || note === 51 || note === 57) {
            this._drumNoise(ctx, now, out, vol, { dur: 0.4, gain: 0.3, filterType: 'bandpass', filterFreq: 6000, filterQ: 0.5 });
        } else {
            this._drumNoise(ctx, now, out, vol, { dur: 0.06, gain: 0.3 });
        }
    }

    _drumTone(ctx, now, out, vol, p) {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = p.type;
        osc.frequency.setValueAtTime(p.freq, now);
        osc.frequency.exponentialRampToValueAtTime(p.freqEnd, now + p.dur);
        gain.gain.setValueAtTime(vol * p.gain, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + p.dur);
        osc.connect(gain); gain.connect(out);
        osc.start(now); osc.stop(now + p.dur);
    }

    _drumNoise(ctx, now, out, vol, p) {
        const bufSize = ctx.sampleRate * p.dur;
        const buf     = ctx.createBuffer(1, bufSize, ctx.sampleRate);
        const data    = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;

        const src  = ctx.createBufferSource(); src.buffer = buf;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(vol * p.gain, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + p.dur);

        if (p.filterType) {
            const flt = ctx.createBiquadFilter();
            flt.type = p.filterType;
            flt.frequency.value = p.filterFreq;
            if (p.filterQ) flt.Q.value = p.filterQ;
            src.connect(flt); flt.connect(gain);
        } else {
            src.connect(gain);
        }
        gain.connect(out);
        src.start(now); src.stop(now + p.dur);
    }

    // ── GM program to oscillator type mapping ───────────────

    _handleProgramChange(channel, program) {
        if (channel === 9) return;
        const map = [
            [0,  'square',   0.10], [8,  'triangle', 0.08], [16, 'square',   0.07],
            [24, 'sawtooth', 0.06], [32, 'triangle', 0.14], [40, 'sawtooth', 0.06],
            [48, 'sawtooth', 0.05], [56, 'sawtooth', 0.08], [64, 'square',   0.07],
            [72, 'sine',     0.09], [80, 'square',   0.10], [88, 'sawtooth', 0.05],
        ];
        let type = 'square', gain = 0.06;
        for (const [start, t, g] of map) {
            if (program >= start && program < start + 8) { type = t; gain = g; break; }
        }
        this.channelConfig[channel] = { type, gain };
    }

    // ── Helpers ──────────────────────────────────────────────

    _defaultChannelConfig() {
        const cfg = {};
        const defaults = [
            [0, 'square', 0.12], [1, 'square', 0.08], [2, 'square', 0.06], [3, 'triangle', 0.15],
            [4, 'sawtooth', 0.06], [5, 'square', 0.05], [6, 'triangle', 0.10], [7, 'square', 0.05],
            [8, 'square', 0.05], [9, 'noise', 0.10], [10, 'square', 0.05], [11, 'square', 0.05],
            [12, 'triangle', 0.08], [13, 'square', 0.05], [14, 'sawtooth', 0.05], [15, 'square', 0.05],
        ];
        for (const [ch, type, gain] of defaults) cfg[ch] = { type, gain };
        return cfg;
    }

    _arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
        return btoa(binary);
    }
}

const chiptunePlayer = new ChiptunePlayer();


// ============================================================
// PRELOAD SCENE
// ============================================================
class PreloadScene extends Phaser.Scene {
    constructor() { super({ key: 'PreloadScene' }); }

    preload() {
        this._createProgressBar();
        this._loadFont();
        this._loadAssets();
    }

    create() {
        this._generateParticleTexture();
        this._loadMidiIntoPlayer();
        this.scene.start('StartScene');
    }

    _createProgressBar() {
        const barW = 400, barH = 30;
        const barX = (GAME_WIDTH - barW) / 2;
        const barY = GAME_HEIGHT / 2;

        const box = this.add.graphics();
        box.fillStyle(0x333333);
        box.fillRect(barX, barY, barW, barH);
        const bar = this.add.graphics();

        this.load.on('progress', (v) => {
            bar.clear();
            bar.fillStyle(0x00ff00);
            bar.fillRect(barX + 4, barY + 4, (barW - 8) * v, barH - 8);
        });
        this.load.on('complete', () => {
            bar.destroy(); box.destroy();
            const el = document.getElementById('loading');
            if (el) el.style.display = 'none';
        });
    }

    _loadFont() {
        const font = new FontFace(FONT_FUTURAL, 'url(assets/BBB-Herthey-Futural-95.otf)');
        font.load().then(f => document.fonts.add(f)).catch(e => console.warn('Font load failed:', e));
    }

    _loadAssets() {
        const images = [
            'welcome_screen', 'maison', 'velo', 'light_on', 'phone_off', 'phone_on',
            'bike', 'rider', 'wheel', 'background', 'mountains',
            'ground_top', 'ground_fill', 'coin', 'star', 'cloud',
            'gauge_fill', 'gauge_frame',
        ];
        for (const name of images) this.load.image(name, `assets/${name}.png`);
        this.load.binary('music_midi', 'assets/darude-sandstorm.mid');
    }

    _generateParticleTexture() {
        const g = this.add.graphics();
        g.fillStyle(0xFFFFFF);
        g.fillCircle(4, 4, 4);
        g.generateTexture('particle', 8, 8);
        g.destroy();
    }

    _loadMidiIntoPlayer() {
        const data = this.cache.binary.get('music_midi');
        if (data) {
            chiptunePlayer.midiData = chiptunePlayer._arrayBufferToBase64(data);
        } else {
            console.warn('MIDI not in cache, fetching fallback');
            chiptunePlayer.loadMidi('assets/music.mid');
        }
    }
}


// ============================================================
// START SCENE
// ============================================================
class StartScene extends Phaser.Scene {
    constructor() { super({ key: 'StartScene' }); }

    create() {
        this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'welcome_screen')
            .setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

        const prompt = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 50,
            'Pédalez, appuyez sur ESPACE ou touchez l\'écran pour commencer',
            textStyle()
        ).setOrigin(0.5).setDepth(10);

        this.tweens.add({ targets: prompt, alpha: 0.1, duration: 700, yoyo: true, repeat: -1 });

        const go = () => this.scene.start('BlackoutScene');

        this.input.keyboard.once('keydown-SPACE', go);
        this.input.keyboard.once('keydown-ENTER', go);
        this.input.once('pointerdown', () => { chiptunePlayer.preinit(); go(); });
        this.input.keyboard.once('keydown', () => chiptunePlayer.preinit());

        this._gone = false;
    }

    update() {
        if (this._gone) return;
        const bi = window.bikeInput;
        if (bi?.connected && bi.cadenceRpm > 15) {
            this._gone = true;
            this.scene.start('BlackoutScene');
        }
    }
}


// ============================================================
// BLACKOUT SCENE  (intro cutscene → house reveal → game launch)
// ============================================================
class BlackoutScene extends Phaser.Scene {
    constructor() { super({ key: 'BlackoutScene' }); }

    init(data) {
        this._skipToLaunch = !!(data?.skipToLaunch);
        this._phoneOn      = !!(data?.phoneOn);
    }

    create() {
        this._gifEl           = null;
        this._waitingForInput = false;
        this._goingToHouse    = false;
        this._pedalTime       = 0;
        this._revealLocked    = false;
        this._pressCount      = 0;
        this._skipFn          = null;
        this._promptInterval  = null;
        this._revealTimeout   = null;
        this._waitingForLaunch = false;
        this._launchPedalTime = 0;

        this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000).setOrigin(0);

        // Persistent tap handler — delegates to current phase callback
        this.input.on('pointerdown', () => {
            if (this._skipFn) { const fn = this._skipFn; this._skipFn = null; fn(); }
        });

        if (this._skipToLaunch) {
            this._setupHouseImages();
            this._blackOverlay.setAlpha(0);
            this._goToGame(this._phoneOn);
            return;
        }

        this._showIntroCard(0,
            "Sacha vit dans une maison où tout est géré par un assistant électrique.\n" +
            "Suite à une panne générale de la centrale, tout s'éteint, plus rien ne fonctionne.",
            () => this._showIntroCard(1,
                "Heureusement, Martine, le cousin de Sacha a un jour créé un super vélo " +
                "qui génère de l'électricité.\nÇa tombe bien, Sacha avait en plus besoin de faire du sport.\n" +
                "Aide le à recharger sa maison !",
                () => this._startGif()
            )
        );
    }

    // ── Intro text cards ────────────────────────────────────

    _showIntroCard(_index, text, onDone) {
        const t = this.add.text(Math.round(GAME_WIDTH / 2), Math.round(GAME_HEIGHT / 2), text,
            textStyle({ fontFamily: FONT_MONO, fontSize: '22px', strokeThickness: 4, align: 'center',
                wordWrap: { width: GAME_WIDTH - 100 } })
        ).setOrigin(0.5).setDepth(10).setAlpha(0);

        let holdTimer = null, activeTween = null;

        const doSkip = () => {
            if (activeTween) { this.tweens.remove(activeTween); activeTween = null; }
            if (holdTimer)   { holdTimer.remove(); holdTimer = null; }
            t.destroy();
            onDone();
        };
        this._skipFn = doSkip;

        activeTween = this.tweens.add({ targets: t, alpha: 1, duration: 1000, onComplete: () => {
            activeTween = null;
            holdTimer = this.time.delayedCall(5000, () => {
                holdTimer = null;
                activeTween = this.tweens.add({ targets: t, alpha: 0, duration: 1000, onComplete: () => {
                    activeTween = null; this._skipFn = null; onDone();
                }});
            });
        }});
    }

    // ── GIF overlay ─────────────────────────────────────────

    _startGif() {
        this._gifEl = document.createElement('img');
        this._gifEl.src = 'assets/eyes.gif';
        this._gifEl.style.cssText =
            'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);' +
            'max-width:100%;max-height:100%;pointer-events:none;z-index:100';

        const container = document.getElementById('game-container');
        container.style.position = 'relative';
        container.appendChild(this._gifEl);

        const gifTimer = this.time.delayedCall(BLACKOUT_GIF_LOOP_MS * BLACKOUT_GIF_LOOPS, () => {
            this._removeGif();
            this._skipFn = null;
            this._showText();
        });

        this._skipFn = () => { gifTimer.remove(); this._removeGif(); this._showText(); };
    }

    _removeGif() {
        if (this._gifEl) { this._gifEl.remove(); this._gifEl = null; }
    }

    // ── Narrative text + reveal ──────────────────────────────

    _showText() {
        const lines = [
            "Panne de courant...",
            "Je dois retrouver le vélo qui fait de la lumière !",
            "Pédalez pour y voir plus clair.",
        ];

        this._setupHouseImages();

        this._textObjects = [];
        lines.forEach((line, i) => {
            const t = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50 + i * 55, line,
                textStyle({ fontFamily: FONT_MONO, fontSize: '20px', strokeThickness: 4, align: 'center' })
            ).setOrigin(0.5).setDepth(20);
            this._textObjects.push(t);
        });

        this._skipFn = null;

        this._promptText = this.add.text(
            Math.round(GAME_WIDTH / 2), Math.round(GAME_HEIGHT * 0.80),
            'Tapez l\'écran pour révéler  ✨',
            textStyle({ fontFamily: FONT_MONO, strokeThickness: 4, align: 'center' })
        ).setOrigin(0.5).setDepth(25);

        let blink = true;
        this._promptInterval = setInterval(() => {
            if (this._promptText?.scene) {
                this._promptText.setAlpha(blink ? 1 : 0.3);
                blink = !blink;
            } else {
                clearInterval(this._promptInterval);
            }
        }, 500);

        this._revealClickHandler = () => this._onRevealPress();
        this.input.keyboard.on('keydown-SPACE', this._revealClickHandler);

        this._revealTimeout = setTimeout(() => {
            this._pressCount = 0;
            this._waitingForInput = true;
            document.addEventListener('click', this._revealClickHandler);
        }, 600);
    }

    _setupHouseImages() {
        this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'maison')
            .setDisplaySize(GAME_WIDTH, GAME_HEIGHT).setDepth(15);
        this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'velo')
            .setDisplaySize(GAME_WIDTH, GAME_HEIGHT).setDepth(17);
        this._blackOverlay = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000)
            .setOrigin(0).setDepth(18).setAlpha(1);
    }

    _removeRevealListeners() {
        if (this._revealClickHandler) {
            document.removeEventListener('click', this._revealClickHandler);
            this._revealClickHandler = null;
        }
        this.input.keyboard.off('keydown-SPACE');
    }

    _onRevealPress() {
        if (!this._waitingForInput || this._goingToHouse) return;
        this._pressCount++;

        const alpha = Math.max(0, 1 - this._pressCount / REVEAL_TAP_COUNT);
        this._blackOverlay.setAlpha(alpha);
        if (this._textObjects) this._textObjects.forEach(t => t.setAlpha(alpha));

        if (this._promptText) {
            if (this._pressCount < REVEAL_TAP_COUNT) {
                this._promptText.setText(`Encore ${REVEAL_TAP_COUNT - this._pressCount} fois... ✨`);
            } else {
                if (this._promptInterval) { clearInterval(this._promptInterval); this._promptInterval = null; }
                this._promptText.setAlpha(0);
            }
        }

        if (this._pressCount >= REVEAL_TAP_COUNT && !this._revealLocked) {
            this._revealLocked    = true;
            this._waitingForInput = false;
            this._removeRevealListeners();
            if (this._promptInterval) { clearInterval(this._promptInterval); this._promptInterval = null; }
            if (this._revealTimeout)  { clearTimeout(this._revealTimeout);   this._revealTimeout = null; }
            this._goToGame();
        }
    }

    // ── Launch into game ────────────────────────────────────

    _goToGame(phoneOn = false) {
        if (this._goingToHouse) return;
        this._goingToHouse    = true;
        this._waitingForInput = false;
        this._removeRevealListeners();

        const lightImg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'light_on')
            .setDisplaySize(GAME_WIDTH, GAME_HEIGHT).setDepth(25).setAlpha(0);
        this.tweens.add({ targets: lightImg, alpha: 1, duration: 2000 });

        this.time.delayedCall(2000, () => {
            const phoneImg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, phoneOn ? 'phone_on' : 'phone_off')
                .setDisplaySize(GAME_WIDTH, GAME_HEIGHT).setDepth(26).setAlpha(0);
            this.tweens.add({ targets: phoneImg, alpha: 1, duration: 2000 });

            this.time.delayedCall(2000, () => {
                const prompt = this.add.text(Math.round(GAME_WIDTH / 2), GAME_HEIGHT - 40,
                    'ESPACE / Frein avant / cliquez pour aider Sacha à recharger son téléphone',
                    textStyle({ fontFamily: FONT_MONO, fontSize: '15px', color: '#CCCCCC' })
                ).setOrigin(0.5).setDepth(30).setAlpha(0);
                this.tweens.add({ targets: prompt, alpha: 1, duration: 500 });
                this.tweens.add({ targets: prompt, alpha: 0.3, duration: 600, yoyo: true, repeat: -1, delay: 600 });

                const launch = () => {
                    this.tweens.killTweensOf(prompt);
                    prompt.setAlpha(0);
                    this.cameras.main.fade(1000, 0, 0, 0);
                    this.time.delayedCall(1000, () => this.scene.start('GameScene'));
                };

                this.time.delayedCall(3000, () => {
                    this._waitingForLaunch = true;
                    this.input.keyboard.once('keydown-SPACE', launch);
                    this.input.once('pointerdown', launch);
                });
            });
        });
    }

    // ── Update (bike trainer input) ─────────────────────────

    update() {
        const bi = window.bikeInput;
        if (!bi?.connected || bi.cadenceRpm <= 25) {
            this._pedalTime = 0;
            this._launchPedalTime = 0;
            return;
        }

        const dt = this.game.loop.delta / 1000;

        if (this._waitingForInput && !this._goingToHouse) {
            this._pedalTime = (this._pedalTime || 0) + dt;
            if (this._pedalTime >= 1.0) { this._pedalTime = 0; this._onRevealPress(); }
        }

        if (this._waitingForLaunch) {
            this._launchPedalTime = (this._launchPedalTime || 0) + dt;
            if (this._launchPedalTime >= 1) {
                this._waitingForLaunch = false;
                this.input.keyboard.off('keydown-SPACE');
                this.input.off('pointerdown');
                this.cameras.main.fade(1000, 0, 0, 0);
                this.time.delayedCall(1000, () => this.scene.start('GameScene'));
            }
        }
    }

    shutdown() {
        this._removeGif();
        this._removeRevealListeners();
        if (this._promptInterval) { clearInterval(this._promptInterval); this._promptInterval = null; }
        if (this._revealTimeout)  { clearTimeout(this._revealTimeout);   this._revealTimeout = null; }
    }
}


// ============================================================
// GAME SCENE
// ============================================================
class GameScene extends Phaser.Scene {
    constructor() { super({ key: 'GameScene' }); }

    init() {
        this.worldX          = 0;
        this.speed           = 0;
        this.isOnGround      = true;
        this.score           = 0;
        this.distance        = 0;
        this.terrainPoints   = [];
        this.terrainGenerated = 0;
        this.coinWorldData   = [];
        this.lastShiftTime   = 0;
        this.pedalIntensity  = 0;
        this.alive           = true;
        this.hillMultiplier  = 1;
        this.comboTimer      = 0;
        this.comboCount      = 0;
        this.stoppedTime     = null;
        this.playerVelY      = 0;
        this.wheelAngle      = 0;
        this.legAngle        = 0;
        this.playerY         = GROUND_Y - 30;
        this._lastBikePedalTime = 0;
        this._levelComplete  = false;
        this._uiFrame        = 0;
    }

    create() {
        this._createBackground();
        this._createTerrain();
        this._createPlayer();
        this._createInput();
        this._createUI();
        this._createParticles();
        this._createMusic();
    }

    // ── Setup helpers ───────────────────────────────────────

    _createBackground() {
        this.bgSky = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'background')
            .setOrigin(0, 0).setScrollFactor(0).setDepth(0);

        this.bgMountains = this.add.tileSprite(0, GAME_HEIGHT - 400, GAME_WIDTH, 400, 'mountains')
            .setOrigin(0, 0).setScrollFactor(0).setDepth(0.5);

        this.clouds = [];
        for (let i = 0; i < CLOUD_COUNT; i++) {
            const sprite = this.add.image(
                Phaser.Math.Between(0, GAME_WIDTH),
                Phaser.Math.Between(20, 130),
                'cloud'
            ).setAlpha(Phaser.Math.FloatBetween(0.5, 0.9))
             .setScale(Phaser.Math.FloatBetween(0.4, 1.0))
             .setDepth(0.3)
             .setScrollFactor(0);

            this.clouds.push({ sprite, speed: Phaser.Math.FloatBetween(0.1, 0.4) });
        }
    }

    _createTerrain() {
        this.groundRT = this.add.renderTexture(
            GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT
        ).setDepth(2).setScrollFactor(0);

        this.generateTerrain(0, GAME_WIDTH + TERRAIN_LOOK_AHEAD);
        this.generateCoins(100, GAME_WIDTH + TERRAIN_LOOK_AHEAD);
    }

    _createPlayer() {
        const px = PLAYER_SCREEN_X;
        const py = this.playerY;

        this.rearWheel  = this.add.image(px + 16, py + 6, 'wheel').setDepth(5).setScale(0.8);
        this.frontWheel = this.add.image(px - 16, py + 6, 'wheel').setDepth(5).setScale(0.8);
        this.bikeSprite = this.add.image(px + 10, py, 'bike').setOrigin(0.5, 0.7).setDepth(6).setScale(0.7);
        this.riderSprite = this.add.image(px + 2, py - 20, 'rider').setOrigin(0.5, 0.5).setDepth(7).setScale(0.6);
    }

    _createInput() {
        this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.input.keyboard.addCapture(['SHIFT', 'SPACE']);

        this.shiftKey.on('down', () => this.onPedal());
        this.spaceKey.on('down', () => this.onJump());

        // Touch: left half = pedal, right half = jump
        this.input.on('pointerdown', (ptr) => {
            if (ptr.x < GAME_WIDTH / 2) this.onPedal(); else this.onJump();
        });
    }

    _createUI() {
        this.scoreText = this.add.text(GAME_WIDTH - 20, 15, 'Score: 0',
            textStyle({ fontSize: '18px' })).setOrigin(1, 0).setDepth(UI_DEPTH).setScrollFactor(0);

        this.distText = this.add.text(GAME_WIDTH - 20, 45, 'Distance: 0m',
            textStyle({ fontSize: '16px', strokeThickness: 2 })).setOrigin(1, 0).setDepth(UI_DEPTH).setScrollFactor(0);

        this.pedalIndicator = this.add.text(GAME_WIDTH / 2, 20, 'Il faut pédaler !',
            textStyle({ fontSize: '20px', color: '#FFFF00' })).setOrigin(0.5).setDepth(UI_DEPTH).setScrollFactor(0);

        this.hillWarning = this.add.text(GAME_WIDTH / 2, 50, '',
            textStyle({ fontSize: '16px', color: '#FF4444', strokeThickness: 2 }))
            .setOrigin(0.5).setDepth(UI_DEPTH).setScrollFactor(0);

        this.comboText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50, '',
            textStyle({ fontSize: '30px', color: '#FF00FF', strokeThickness: 4 }))
            .setOrigin(0.5).setDepth(UI_DEPTH).setScrollFactor(0).setAlpha(0);

        this.instructions = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 40,
            'SHIFT = Pédaler plus vite | ESPACE = Sauter | Pédaler plus fort en montée !',
            textStyle({ fontSize: '14px', strokeThickness: 2 }))
            .setOrigin(0.5).setDepth(UI_DEPTH).setScrollFactor(0);

        this.bikeText = this.add.text(10, GAME_HEIGHT - 20, '',
            textStyle({ fontFamily: FONT_MONO, fontSize: '13px', color: '#22c55e', strokeThickness: 2 }))
            .setOrigin(0, 1).setDepth(UI_DEPTH).setScrollFactor(0).setAlpha(0);

        this._createGauge();
    }

    _createGauge() {
        const gaugeX = GAME_WIDTH - 50;
        const gaugeY = GAME_HEIGHT - 80;

        this.gaugeFill = this.add.image(gaugeX, gaugeY, 'gauge_fill')
            .setScale(GAUGE_SCALE).setOrigin(0.5, 1).setDepth(UI_DEPTH).setScrollFactor(0);
        this.gaugeFillFullH = this.gaugeFill.displayHeight;

        this.gaugeFrame = this.add.image(gaugeX, gaugeY, 'gauge_frame')
            .setScale(GAUGE_SCALE).setOrigin(0.5, 1).setDepth(UI_DEPTH + 1).setScrollFactor(0);

        const src = this.textures.get('gauge_fill').getSourceImage();
        this.gaugeTexW = src.width;
        this.gaugeTexH = src.height;
        this.gaugeFill.setCrop(0, this.gaugeTexH, this.gaugeTexW, 0);
    }

    _createParticles() {
        this.dustParticles = this.add.particles(0, 0, 'particle', {
            speed: { min: 20, max: 60 }, angle: { min: 160, max: 200 },
            scale: { start: 0.8, end: 0 }, lifespan: 400, tint: 0xCCAA77, emitting: false,
        }).setDepth(3);

        this.pedalParticles = this.add.particles(0, 0, 'particle', {
            speed: { min: 50, max: 120 }, angle: { min: 120, max: 240 },
            scale: { start: 0.5, end: 0 }, lifespan: 300, tint: 0xFFFF00, emitting: false,
        }).setDepth(3);
    }

    _createMusic() {
        this.musicMuted = false;
        chiptunePlayer.play();

        const startOnInput = () => { if (!chiptunePlayer.isPlaying) chiptunePlayer.play(); };
        this.input.keyboard.once('keydown', startOnInput);
        this.input.once('pointerdown', startOnInput);

        this.muteKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
        this.muteKey.on('down', () => {
            this.musicMuted = !this.musicMuted;
            chiptunePlayer.setVolume(this.musicMuted ? 0 : 0.6);
            this.muteText.setText(this.musicMuted ? '♪ M=Unmute' : '♪ M=Mute');
        });

        this.muteText = this.add.text(GAME_WIDTH - 10, GAME_HEIGHT - 15, '♪ M=Mute',
            textStyle({ fontSize: '12px', strokeThickness: 2 }))
            .setOrigin(1, 0.5).setDepth(100).setScrollFactor(0);
    }

    // ── Terrain ─────────────────────────────────────────────

    generateTerrain(fromX, toX) {
        let x = this.terrainGenerated || fromX;
        if (this.terrainPoints.length === 0) {
            this.terrainPoints.push({ x, y: GROUND_Y });
            x += SEGMENT_WIDTH;
        }
        while (x <= toX) {
            const noise1 = Math.sin(x * 0.003) * 40;
            const noise2 = Math.sin(x * 0.008 + 1.5) * 25;
            const noise3 = Math.sin(x * 0.001) * 60;
            const hillWave = Math.sin(x * 0.002) * (50 + (x / 1000) * 15);
            const y = Phaser.Math.Clamp(GROUND_Y + noise1 + noise2 + noise3 + hillWave, GROUND_Y - 150, GROUND_Y + 50);
            this.terrainPoints.push({ x, y });
            x += SEGMENT_WIDTH;
        }
        this.terrainGenerated = x;
    }

    getTerrainYAt(worldX) {
        if (this.terrainPoints.length < 2) return GROUND_Y;
        const firstX = this.terrainPoints[0].x;
        const idx = Math.floor((worldX - firstX) / SEGMENT_WIDTH);
        if (idx < 0) return GROUND_Y;
        if (idx >= this.terrainPoints.length - 1) return this.terrainPoints[this.terrainPoints.length - 1].y;
        const p1 = this.terrainPoints[idx];
        const p2 = this.terrainPoints[idx + 1];
        return p1.y + (p2.y - p1.y) * ((worldX - p1.x) / SEGMENT_WIDTH);
    }

    getTerrainSlopeAt(worldX) {
        return (this.getTerrainYAt(worldX + 10) - this.getTerrainYAt(worldX - 10)) / 20;
    }

    drawTerrain() {
        const scrollDelta = Math.abs(this.worldX - (this._lastDrawnWorldX || 0));
        if (scrollDelta < 1 && this._terrainDrawn) return;
        this._lastDrawnWorldX = this.worldX;
        this._terrainDrawn = true;

        this.groundRT.clear();

        if (!this._tileMetrics) {
            const topImg  = this.textures.get('ground_top').getSourceImage();
            const fillImg = this.textures.get('ground_fill').getSourceImage();
            this._tileMetrics = {
                tw: topImg.width || 64, th: topImg.height || 32,
                fw: fillImg.width || 64, fh: fillImg.height || 64,
            };
        }
        const { tw, th, fw, fh } = this._tileMetrics;
        const tileOffsetX = this.worldX % tw;
        const fillOffsetX = this.worldX % fw;

        for (let col = -1; col * tw < GAME_WIDTH + tw; col++) {
            const screenX = col * tw - tileOffsetX;
            const terrainY = this.getTerrainYAt(this.worldX + screenX);
            this.groundRT.drawFrame('ground_top', undefined, screenX, terrainY - th);
        }

        for (let col = -1; col * fw < GAME_WIDTH + fw; col++) {
            const screenX = col * fw - fillOffsetX;
            const terrainY = this.getTerrainYAt(this.worldX + screenX);
            for (let fy = terrainY; fy < GAME_HEIGHT + fh; fy += fh) {
                this.groundRT.drawFrame('ground_fill', undefined, screenX, fy);
            }
        }
    }

    // ── Coins ───────────────────────────────────────────────

    generateCoins(fromX, toX) {
        let x = fromX;
        while (x < toX) {
            x += COIN_SPACING_MIN + Math.floor(Math.random() * COIN_SPACING_RANGE);
            const terrainY = this.getTerrainYAt(x);
            const isAir    = Math.random() > 0.5;
            const coinY    = isAir
                ? terrainY - (COIN_AIR_HEIGHT_MIN + Math.floor(Math.random() * COIN_AIR_HEIGHT_RANGE))
                : terrainY - 30;
            const isStar   = Math.random() > (1 - STAR_CHANCE);

            this.coinWorldData.push({
                worldX: x, baseY: coinY, collected: false,
                type: isStar ? 'star' : 'coin',
                value: isStar ? STAR_VALUE : COIN_VALUE,
                sprite: null,
            });
        }
    }

    updateCoins(dt) {
        const now = this.time.now;
        const spawnWindow   = GAME_WIDTH + 200;
        const destroyBehind = -150;

        for (let i = this.coinWorldData.length - 1; i >= 0; i--) {
            const coin = this.coinWorldData[i];
            if (coin.collected) continue;

            const screenX = coin.worldX - this.worldX;

            if (screenX < destroyBehind) {
                if (coin.sprite) { coin.sprite.destroy(); coin.sprite = null; }
                this.coinWorldData.splice(i, 1);
                continue;
            }
            if (screenX > spawnWindow) continue;

            if (!coin.sprite) {
                coin.sprite = this.add.image(0, 0, coin.type).setScale(0.8).setDepth(4);
            }

            const bobY = coin.baseY + Math.sin(now * 0.005 + coin.worldX) * 5;
            coin.sprite.setPosition(screenX, bobY);

            if (screenX > -30 && screenX < GAME_WIDTH + 30) {
                coin.sprite.setVisible(true);
                if (coin.type === 'coin') {
                    coin.sprite.setScale(Math.abs(Math.cos(now * 0.004 + coin.worldX)) * 0.8 + 0.1, 1);
                } else {
                    coin.sprite.setRotation(now * 0.003);
                }
            } else {
                coin.sprite.setVisible(false);
            }

            // Collection check
            if (screenX > PLAYER_SCREEN_X - 25 && screenX < PLAYER_SCREEN_X + 25 &&
                Math.abs(bobY - this.playerY) < 35) {
                coin.collected = true;
                this.score += coin.value;

                if (this.comboTimer > 0) { this.comboCount++; this.score += this.comboCount * 5; }
                else { this.comboCount = 1; }
                this.comboTimer = 2;

                this.tweens.add({
                    targets: coin.sprite, y: bobY - 50, alpha: 0, scaleX: 1.5, scaleY: 1.5,
                    duration: 400,
                    onComplete: () => { if (coin.sprite) { coin.sprite.destroy(); coin.sprite = null; } },
                });
                this._showCollectText(screenX, bobY, coin.value, this.comboCount);
            }
        }

        if (this.comboTimer > 0) {
            this.comboTimer -= dt;
            if (this.comboTimer <= 0) this.comboCount = 0;
        }
    }

    _showCollectText(x, y, value, combo) {
        const color = combo > 2 ? '#FF00FF' : '#FFD700';
        const text  = combo > 1 ? `+${value} x${combo}!` : `+${value}`;

        const ft = this.add.text(x, y, text,
            textStyle({ fontSize: combo > 2 ? '24px' : '18px', color, strokeThickness: 3 })
        ).setOrigin(0.5).setDepth(8);

        this.tweens.add({
            targets: ft, y: y - 60, alpha: 0, scaleX: 1.5, scaleY: 1.5,
            duration: 800, onComplete: () => ft.destroy(),
        });

        if (combo > 2) {
            this.comboText.setText(`COMBO x${combo}!`).setAlpha(1).setScale(1);
            this.tweens.add({ targets: this.comboText, alpha: 0, scaleX: 1.5, scaleY: 1.5, duration: 1000 });
        }
    }

    // ── Input handlers ──────────────────────────────────────

    onPedal() {
        if (!this.alive) return;
        const now  = this.time.now;
        const dt   = now - this.lastShiftTime;
        this.lastShiftTime = now;

        const slope = this.getTerrainSlopeAt(this.worldX + PLAYER_SCREEN_X);
        let resist = 1;
        if (slope < -0.1)     resist = 1 + Math.abs(slope) * 5;
        else if (slope > 0.1) resist = 0.5;

        const boost = PEDAL_BOOST / resist;
        this.speed = Math.min(MAX_SPEED, this.speed + boost);

        if (dt < RAPID_PEDAL_WINDOW && dt > RAPID_PEDAL_MIN) {
            this.speed = Math.min(MAX_SPEED, this.speed + boost * 0.5);
            this.pedalIntensity = Math.min(1, this.pedalIntensity + 0.2);
        }

        this.pedalParticles.emitParticleAt(PLAYER_SCREEN_X, this.playerY);
        this.legAngle += 0.8;

        if (resist > 2) this.cameras.main.shake(50, 0.002);
    }

    onJump() {
        if (!this.alive || !this.isOnGround) return;
        this.playerVelY = JUMP_VELOCITY;
        this.isOnGround = false;
        this.dustParticles.emitParticleAt(PLAYER_SCREEN_X, this.playerY, 8);
    }

    // ── Main update loop ────────────────────────────────────

    update(_time, delta) {
        if (!this.alive) return;
        const dt = delta / 1000;

        this._cachedSlope = this.getTerrainSlopeAt(this.worldX + PLAYER_SCREEN_X);

        this._updatePhysics(dt);
        this._updateTerrainGeneration();
        this.drawTerrain();
        this.updateCoins(dt);
        this._updateVisuals(dt);
        this._updateParallax(dt);
        this._updateUI();
        this._checkGameOver();
    }

    _updatePhysics(dt) {
        const slope = this._cachedSlope;
        this.speed += slope * 300 * dt;

        const friction = BASE_DECELERATION + (this.speed > 200 ? this.speed * 0.05 : 0);
        this.speed -= friction * dt;

        // Real bike speed tracking
        const bi = window.bikeInput;
        if (bi?.connected) {
            const target = Math.min(MAX_SPEED, (bi.speedKmh / REAL_MAX_SPEED_KMH) * MAX_SPEED);
            this.speed += (target - this.speed) * Math.min(1, dt * BIKE_SPEED_CONVERGENCE);
        }

        this.speed = Phaser.Math.Clamp(this.speed, 0, MAX_SPEED);
        this.worldX += this.speed * dt;
        this.distance = Math.floor(this.worldX / 10);

        const terrainY = this.getTerrainYAt(this.worldX + PLAYER_SCREEN_X);

        if (this.isOnGround) {
            this.playerY = terrainY - 20;
            this.playerVelY = 0;
        } else {
            this.playerVelY += GRAVITY * dt;
            this.playerY += this.playerVelY * dt;
            if (this.playerY >= terrainY - 20) {
                this.playerY = terrainY - 20;
                this.playerVelY = 0;
                this.isOnGround = true;
                this.dustParticles.emitParticleAt(PLAYER_SCREEN_X, this.playerY + 15, 5);
            }
        }

        this.pedalIntensity = Math.max(0, this.pedalIntensity - dt * 2);
        this.hillMultiplier = slope < -0.1 ? 1 + Math.abs(slope) * 5 : 1;
    }

    _updateTerrainGeneration() {
        const lookAhead = this.worldX + GAME_WIDTH + TERRAIN_LOOK_AHEAD;
        if (lookAhead > this.terrainGenerated - 200) {
            this.generateTerrain(this.terrainGenerated, lookAhead + TERRAIN_LOOK_AHEAD);
            this.generateCoins(this.terrainGenerated - TERRAIN_LOOK_AHEAD, lookAhead + 300);
        }
        while (this.terrainPoints.length > 2 && this.terrainPoints[0].x < this.worldX - TERRAIN_PRUNE_BEHIND) {
            this.terrainPoints.shift();
        }
    }

    _updateVisuals(dt) {
        const slope     = this._cachedSlope;
        const tiltAngle = Math.atan(slope) * 0.5;
        const px        = PLAYER_SCREEN_X;
        const py        = this.playerY;

        this.bikeSprite.setPosition(px, py).setRotation(tiltAngle);
        this.riderSprite.setPosition(px, py - 10)
            .setRotation(slope < -0.1 ? tiltAngle * 0.6 - 0.15 : tiltAngle * 0.6);

        const wd = 18;
        this.frontWheel.setPosition(px - wd * Math.cos(tiltAngle), py + 8 - wd * Math.sin(tiltAngle));
        this.rearWheel.setPosition(px + wd * Math.cos(tiltAngle), py + 8 + wd * Math.sin(tiltAngle));

        this.wheelAngle += this.speed * dt * 0.03;
        this.frontWheel.setRotation(this.wheelAngle);
        this.rearWheel.setRotation(this.wheelAngle);

        // Pedal intensity tint
        if (this.pedalIntensity > 0.5) {
            const c = Math.floor(this.pedalIntensity * 50);
            const tint = Phaser.Display.Color.GetColor(255, 255 - c, 255 - c);
            this.bikeSprite.setTint(tint);
            this.riderSprite.setTint(tint);
        } else {
            this.bikeSprite.clearTint();
            this.riderSprite.clearTint();
        }

        // Dust particles
        if (this.isOnGround && this.speed > 50 && Math.random() < this.speed / 500) {
            this.dustParticles.emitParticleAt(px + 15, py + 15);
            this.dustParticles.emitParticleAt(px - 15, py + 15);
        }

        // Speed bobbing
        if (this.isOnGround && this.speed > 100) {
            const bob = Math.sin(this.time.now * 0.015) * (this.speed / 400) * 2;
            this.bikeSprite.y += bob;
            this.riderSprite.y += bob;
        }
    }

    _updateParallax(dt) {
        this.bgSky.tilePositionX += this.speed * dt * 0.02;
        this.bgMountains.tilePositionX += this.speed * dt * 0.08;

        for (const cloud of this.clouds) {
            cloud.sprite.x -= cloud.speed + this.speed * 0.02 * dt;
            if (cloud.sprite.x < -100) {
                cloud.sprite.x = GAME_WIDTH + Phaser.Math.Between(50, 150);
                cloud.sprite.y = Phaser.Math.Between(20, 130);
            }
        }
    }

    _updateUI() {
        this._uiFrame++;
        if (this._uiFrame % 2 === 0) {
            this.scoreText.setText(`Score: ${this.score}`);
            this.distText.setText(`Distance: ${this.distance}m`);
        }

        if (this.speed < 10) {
            this.pedalIndicator.setText('Il faut pédaler !').setColor('#FFFF00')
                .setAlpha(0.5 + Math.sin(this.time.now * 0.005) * 0.5);
        } else if (this.hillMultiplier > 2) {
            this.pedalIndicator.setText('ÇA MONTE ! PÉDALE !').setColor('#FF4444').setAlpha(1);
        } else if (this.hillMultiplier > 1.3) {
            this.pedalIndicator.setText('Ça va monter, pédale plus fort !').setColor('#FFAA00').setAlpha(1);
        } else {
            this.pedalIndicator.setAlpha(0);
        }

        const slopeAhead = this.getTerrainSlopeAt(this.worldX + PLAYER_SCREEN_X + 200);
        if (slopeAhead < -0.15) {
            this.hillWarning.setText('⚠ Aaahhh, ça va monter !!! ⚠').setAlpha(1);
        } else {
            this.hillWarning.setAlpha(0);
        }

        // Bike trainer HUD
        const bi = window.bikeInput;
        if (bi?.connected) {
            const g  = bi.gradePercent ?? 0;
            const gS = (g >= 0 ? '+' : '') + g + '%';
            this.bikeText
                .setText(`🚴 ${bi.speedKmh.toFixed(1)} km/h  •  ${Math.round(bi.cadenceRpm)} rpm  •  ${bi.powerW} W  •  ${gS}`)
                .setAlpha(1);
        } else {
            this.bikeText.setAlpha(0);
        }

        // Level gauge
        const distRatio = Phaser.Math.Clamp(this.distance / LEVEL_DISTANCE, 0, 1);
        const cropH = Math.round(this.gaugeTexH * distRatio);
        this.gaugeFill.setCrop(0, this.gaugeTexH - cropH, this.gaugeTexW, cropH);

        if (distRatio >= 1 && !this._levelComplete) {
            this._levelComplete = true;
            this._triggerLevelComplete();
        }
    }

    _checkGameOver() {
        if (this.speed <= 0 && this.distance > 10) {
            this.speed = 0;
            if (!this.stoppedTime) {
                this.stoppedTime = this.time.now;
            } else if (this.time.now - this.stoppedTime > GAME_OVER_DELAY) {
                this._gameOver();
            }
        } else {
            this.stoppedTime = null;
        }
    }

    _gameOver() {
        this.alive = false;
        this.cameras.main.flash(500, 255, 0, 0);
        chiptunePlayer.stop();
        this.time.delayedCall(1000, () => {
            this.scene.start('GameOverScene', { score: this.score, distance: this.distance });
        });
    }

    _triggerLevelComplete() {
        this.alive = false;
        chiptunePlayer.stop();
        this.cameras.main.flash(600, 255, 215, 0);
        this.time.delayedCall(800, () => {
            this.scene.start('LevelCompleteScene', { score: this.score, distance: this.distance });
        });
    }
}


// ============================================================
// LEVEL COMPLETE SCENE
// ============================================================
class LevelCompleteScene extends Phaser.Scene {
    constructor() { super({ key: 'LevelCompleteScene' }); }

    init(data) {
        this.finalScore    = data.score || 0;
        this.finalDistance  = data.distance || 0;
    }

    create() {
        if (this.textures.exists('light_on')) {
            this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'light_on').setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
        }
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.45);

        this.add.text(GAME_WIDTH / 2, 75, 'BRAVO !',
            textStyle({ fontSize: '60px', color: '#FFD700', strokeThickness: 6 })).setOrigin(0.5);
        this.add.text(GAME_WIDTH / 2, 155, 'La maison de Sacha est rechargée !',
            textStyle({ fontSize: '20px', color: '#AAFFAA' })).setOrigin(0.5);
        this.add.text(GAME_WIDTH / 2, 225, `Distance : ${this.finalDistance} m`,
            textStyle({ fontSize: '26px' })).setOrigin(0.5);
        this.add.text(GAME_WIDTH / 2, 275, `Score : ${this.finalScore}`,
            textStyle({ fontSize: '34px', color: '#FFD700', strokeThickness: 4 })).setOrigin(0.5);

        const ct = this.add.text(GAME_WIDTH / 2, 375,
            '[ Appuyez sur ESPACE ou touchez l\'écran pour continuer ]',
            textStyle({ color: '#AAFFAA' })).setOrigin(0.5);
        this.tweens.add({ targets: ct, alpha: 0.2, duration: 650, yoyo: true, repeat: -1 });

        this.time.delayedCall(600, () => {
            const next = () => this.scene.start('BlackoutScene', { skipToLaunch: true, phoneOn: true });
            this.input.keyboard.once('keydown-SHIFT', next);
            this.input.keyboard.once('keydown-SPACE', next);
            this.input.once('pointerdown', next);
        });
    }
}


// ============================================================
// GAME OVER SCENE
// ============================================================
class GameOverScene extends Phaser.Scene {
    constructor() { super({ key: 'GameOverScene' }); }

    init(data) {
        this.finalScore   = data.score || 0;
        this.finalDistance = data.distance || 0;
    }

    create() {
        if (this.textures.exists('background')) {
            this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'background')
                .setDisplaySize(GAME_WIDTH, GAME_HEIGHT).setTint(0x333355);
        } else {
            this.cameras.main.setBackgroundColor('#1a1a2e');
        }

        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6);

        this.add.text(GAME_WIDTH / 2, 80, 'GAME OVER',
            textStyle({ fontSize: '52px', color: '#FF4444', strokeThickness: 6 })).setOrigin(0.5);
        this.add.text(GAME_WIDTH / 2, 150, 'Le vélo de Sacha s\'est arrêté !',
            textStyle({ color: '#AAAAAA' })).setOrigin(0.5);
        this.add.text(GAME_WIDTH / 2, 220, `Distance : ${this.finalDistance} m`,
            textStyle({ fontSize: '28px' })).setOrigin(0.5);
        this.add.text(GAME_WIDTH / 2, 270, `Score : ${this.finalScore}`,
            textStyle({ fontSize: '34px', color: '#FFD700', strokeThickness: 4 })).setOrigin(0.5);

        const rt = this.add.text(GAME_WIDTH / 2, 370, '[ Appuyez sur SHIFT ou ESPACE pour recommencer ]',
            textStyle({ fontSize: '22px', color: '#AAFFAA' })).setOrigin(0.5);
        this.tweens.add({ targets: rt, alpha: 0.3, duration: 600, yoyo: true, repeat: -1 });

        const tips = [
            'Astuce : Appuie vite sur SHIFT pour grimper les côtes !',
            'Astuce : Saute avec ESPACE pour attraper les objets en l\'air !',
            'Astuce : Ramasse vite les objets pour des bonus combo !',
            'Astuce : Les descentes donnent de la vitesse gratuite !',
        ];
        this.add.text(GAME_WIDTH / 2, 430, Phaser.Utils.Array.GetRandom(tips),
            textStyle({ fontSize: '15px', color: '#8888CC', strokeThickness: 2 })).setOrigin(0.5);

        this.time.delayedCall(500, () => {
            const restart = () => this.scene.start('BlackoutScene', { skipToLaunch: true });
            this.input.keyboard.once('keydown-SHIFT', restart);
            this.input.keyboard.once('keydown-SPACE', restart);
            this.input.once('pointerdown', restart);
        });
    }
}


// ============================================================
// LAUNCH
// ============================================================
const config = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#87CEEB',
    parent: 'game-container',
    render: {
        powerPreference: 'high-performance',
        antialias: false,
        roundPixels: true,
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [PreloadScene, StartScene, BlackoutScene, GameScene, LevelCompleteScene, GameOverScene],
};

const game = new Phaser.Game(config);
