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
