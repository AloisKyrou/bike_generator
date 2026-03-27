// ============================================================
// BICYCLE RUNNER - Phaser 3 (Image-based version)
// Controls: SHIFT = Pedal/Accelerate | SPACE = Jump
// ============================================================

const GAME_WIDTH = 900;
const GAME_HEIGHT = 500;
const GROUND_Y = 400;
const GRAVITY = 1200;
const SEGMENT_WIDTH = 4;

// ============================================================
// SNES-STYLE CHIPTUNE MUSIC ENGINE
// ============================================================
// ============================================================
// SNES-STYLE CHIPTUNE SYNTH - Plays .mid files
// ============================================================
// ============================================================
// SNES-STYLE CHIPTUNE SYNTH - Plays .mid files
// ============================================================
class ChiptunePlayer {
    constructor() {
        this.audioCtx = null;
        this.masterGain = null;
        this.isPlaying = false;
        this.midiPlayer = null;
        this.volume = 0.3;

        // Channel voices (MIDI channels 0-15)
        this.channels = {};

        // SNES-style voice config per channel
        this.channelConfig = {
            0:  { type: 'square',   gain: 0.12 },  // Melody
            1:  { type: 'square',   gain: 0.08 },  // Harmony
            2:  { type: 'square',   gain: 0.06 },  // Arpeggio
            3:  { type: 'triangle', gain: 0.15 },  // Bass
            4:  { type: 'sawtooth', gain: 0.06 },  // Pad
            5:  { type: 'square',   gain: 0.05 },  // Extra
            6:  { type: 'triangle', gain: 0.10 },  // Extra
            7:  { type: 'square',   gain: 0.05 },  // Extra
            8:  { type: 'square',   gain: 0.05 },  // Extra
            9:  { type: 'noise',    gain: 0.10 },  // Drums (GM channel 10)
            10: { type: 'square',   gain: 0.05 },
            11: { type: 'square',   gain: 0.05 },
            12: { type: 'triangle', gain: 0.08 },
            13: { type: 'square',   gain: 0.05 },
            14: { type: 'sawtooth', gain: 0.05 },
            15: { type: 'square',   gain: 0.05 },
        };

        // Active note voices for note-off tracking
        this.activeNotes = {};
    }

    init() {
        if (this.audioCtx) return;
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.value = this.volume;
        this.masterGain.connect(this.audioCtx.destination);

        // Create a compressor for better mix (SNES-like)
        this.compressor = this.audioCtx.createDynamicsCompressor();
        this.compressor.threshold.value = -20;
        this.compressor.knee.value = 10;
        this.compressor.ratio.value = 4;
        this.compressor.attack.value = 0.005;
        this.compressor.release.value = 0.1;
        this.compressor.connect(this.masterGain);

        // Bitcrusher effect for SNES character
        this.createBitcrusher();
    }

    createBitcrusher() {
        // Simple sample-rate reduction via WaveShaperNode for lo-fi SNES feel
        const ctx = this.audioCtx;
        this.crusherGain = ctx.createGain();
        this.crusherGain.gain.value = 1.0;
        this.crusherGain.connect(this.compressor);

        // Subtle waveshaper for warmth
        const curve = new Float32Array(256);
        for (let i = 0; i < 256; i++) {
            const x = (i / 128) - 1;
            curve[i] = Math.tanh(x * 1.5);
        }
        this.waveshaper = ctx.createWaveShaper();
        this.waveshaper.curve = curve;
        this.waveshaper.oversample = 'none';
        this.waveshaper.connect(this.crusherGain);
    }

    getOutputNode() {
        return this.waveshaper || this.compressor;
    }

    noteToFreq(note) {
        return 440 * Math.pow(2, (note - 69) / 12);
    }

    // Create a channel voice with SNES-style oscillator
    getChannelVoice(channel) {
        if (this.channels[channel]) return this.channels[channel];

        const config = this.channelConfig[channel] || { type: 'square', gain: 0.05 };
        const ctx = this.audioCtx;

        if (channel === 9) {
            // Drum channel - no persistent oscillator, handled per-note
            this.channels[channel] = { isDrum: true, config };
            return this.channels[channel];
        }

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const envelope = ctx.createGain();

        osc.type = config.type;
        gain.gain.value = config.gain;
        envelope.gain.value = 0;

        osc.connect(envelope);
        envelope.connect(gain);
        gain.connect(this.getOutputNode());
        osc.start();

        this.channels[channel] = {
            osc,
            gain,
            envelope,
            config,
            isDrum: false
        };

        return this.channels[channel];
    }

    // SNES-style note on
    noteOn(channel, note, velocity) {
        if (!this.audioCtx || !this.isPlaying) return;

        const vel = (velocity || 127) / 127;
        const now = this.audioCtx.currentTime;

        if (channel === 9) {
            this.playDrum(note, vel, now);
            return;
        }

        const voice = this.getChannelVoice(channel);
        if (voice.isDrum) return;

        const freq = this.noteToFreq(note);
        const peak = vel;
        const attack = 0.008;
        const decay = 0.04;
        const sustain = 0.7;

        voice.osc.frequency.setValueAtTime(freq, now);
        voice.envelope.gain.cancelScheduledValues(now);
        voice.envelope.gain.setValueAtTime(0, now);
        voice.envelope.gain.linearRampToValueAtTime(peak, now + attack);
        voice.envelope.gain.linearRampToValueAtTime(peak * sustain, now + attack + decay);

        // Track active note for note-off
        const key = `${channel}-${note}`;
        this.activeNotes[key] = { channel, note, startTime: now };
    }

    // SNES-style note off
    noteOff(channel, note) {
        if (!this.audioCtx || !this.isPlaying) return;
        if (channel === 9) return; // drums don't need note-off

        const key = `${channel}-${note}`;
        if (!this.activeNotes[key]) return;

        const voice = this.getChannelVoice(channel);
        if (voice.isDrum) return;

        const now = this.audioCtx.currentTime;
        const release = 0.06;

        voice.envelope.gain.cancelScheduledValues(now);
        voice.envelope.gain.setValueAtTime(voice.envelope.gain.value, now);
        voice.envelope.gain.linearRampToValueAtTime(0, now + release);

        delete this.activeNotes[key];
    }

    // SNES-style drum sounds
    playDrum(note, velocity, startTime) {
        const ctx = this.audioCtx;
        const vol = velocity * 0.15;

        // Map GM drum notes to sounds
        if (note === 36 || note === 35) {
            // Bass drum
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(160, startTime);
            osc.frequency.exponentialRampToValueAtTime(30, startTime + 0.1);
            gain.gain.setValueAtTime(vol * 2, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);
            osc.connect(gain);
            gain.connect(this.getOutputNode());
            osc.start(startTime);
            osc.stop(startTime + 0.15);
        } else if (note === 38 || note === 40) {
            // Snare
            const bufSize = ctx.sampleRate * 0.1;
            const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
            const data = buf.getChannelData(0);
            for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;

            const noise = ctx.createBufferSource();
            noise.buffer = buf;
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(vol, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);
            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 3500;
            filter.Q.value = 1;
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.getOutputNode());
            noise.start(startTime);
            noise.stop(startTime + 0.1);

            // Body tone
            const osc = ctx.createOscillator();
            const oscGain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(200, startTime);
            osc.frequency.exponentialRampToValueAtTime(80, startTime + 0.05);
            oscGain.gain.setValueAtTime(vol * 0.8, startTime);
            oscGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08);
            osc.connect(oscGain);
            oscGain.connect(this.getOutputNode());
            osc.start(startTime);
            osc.stop(startTime + 0.08);
        } else if (note === 42 || note === 44) {
            // Closed hi-hat
            const bufSize = ctx.sampleRate * 0.04;
            const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
            const data = buf.getChannelData(0);
            for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;

            const noise = ctx.createBufferSource();
            noise.buffer = buf;
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(vol * 0.4, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.03);
            const filter = ctx.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.value = 9000;
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.getOutputNode());
            noise.start(startTime);
            noise.stop(startTime + 0.04);
        } else if (note === 46) {
            // Open hi-hat
            const bufSize = ctx.sampleRate * 0.15;
            const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
            const data = buf.getChannelData(0);
            for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;

            const noise = ctx.createBufferSource();
            noise.buffer = buf;
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(vol * 0.5, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);
            const filter = ctx.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.value = 7000;
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.getOutputNode());
            noise.start(startTime);
            noise.stop(startTime + 0.15);
        } else if (note === 49 || note === 51 || note === 57) {
            // Crash / ride cymbal
            const bufSize = ctx.sampleRate * 0.4;
            const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
            const data = buf.getChannelData(0);
            for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;

            const noise = ctx.createBufferSource();
            noise.buffer = buf;
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(vol * 0.3, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);
            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 6000;
            filter.Q.value = 0.5;
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.getOutputNode());
            noise.start(startTime);
            noise.stop(startTime + 0.4);
        } else {
            // Generic percussion - short noise burst
            const bufSize = ctx.sampleRate * 0.06;
            const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
            const data = buf.getChannelData(0);
            for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;

            const noise = ctx.createBufferSource();
            noise.buffer = buf;
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(vol * 0.3, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.05);
            noise.connect(gain);
            gain.connect(this.getOutputNode());
            noise.start(startTime);
            noise.stop(startTime + 0.06);
        }
    }

    // Load a MIDI file from a URL (arraybuffer)
    loadMidi(url) {
        return fetch(url)
            .then(response => {
                if (!response.ok) throw new Error(`Failed to load MIDI: ${response.statusText}`);
                return response.arrayBuffer();
            })
            .then(buffer => {
                const uint8 = new Uint8Array(buffer);
                // Convert to base64 for MidiPlayer.js
                let binary = '';
                for (let i = 0; i < uint8.length; i++) {
                    binary += String.fromCharCode(uint8[i]);
                }
                const base64 = btoa(binary);
                this.midiData = base64;
                console.log('MIDI file loaded successfully');
                return true;
            })
            .catch(err => {
                console.error('MIDI load error:', err);
                return false;
            });
    }

    // Start playback
    play() {
        if (!this.midiData) {
            console.warn('No MIDI data loaded');
            return;
        }

        this.init();
        if (this.isPlaying) this.stop();
        this.isPlaying = true;

        // Resume audio context (browser autoplay policy)
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }

        // Create MIDI player
        this.midiPlayer = new MidiPlayer.Player((event) => {
            this.handleMidiEvent(event);
        });

        // Loop the song
        this.midiPlayer.on('endOfFile', () => {
            if (this.isPlaying) {
                // Restart for seamless loop
                this.allNotesOff();
                this.midiPlayer.stop();
                this.midiPlayer.loadDataUri('data:audio/midi;base64,' + this.midiData);
                this.midiPlayer.play();
            }
        });

        this.midiPlayer.loadDataUri('data:audio/midi;base64,' + this.midiData);
        this.midiPlayer.play();
    }

    // Handle MIDI events from the player
    handleMidiEvent(event) {
        if (!this.isPlaying) return;

        const channel = (event.channel || 1) - 1; // MidiPlayer uses 1-based channels

        if (event.name === 'Note on') {
            if (event.velocity === 0) {
                this.noteOff(channel, event.noteNumber);
            } else {
                this.noteOn(channel, event.noteNumber, event.velocity);
            }
        } else if (event.name === 'Note off') {
            this.noteOff(channel, event.noteNumber);
        } else if (event.name === 'Set Tempo') {
            // MidiPlayer handles tempo internally
        } else if (event.name === 'Program Change') {
            // Optionally remap voice type based on GM program
            this.handleProgramChange(channel, event.value);
        }
    }

    // Remap oscillator type based on GM program number
    handleProgramChange(channel, program) {
        if (channel === 9) return; // don't change drum channel

        let type = 'square';
        let gain = 0.08;

        if (program >= 0 && program <= 7) {
            // Piano family -> square
            type = 'square'; gain = 0.10;
        } else if (program >= 8 && program <= 15) {
            // Chromatic percussion -> triangle
            type = 'triangle'; gain = 0.08;
        } else if (program >= 16 && program <= 23) {
            // Organ -> square
            type = 'square'; gain = 0.07;
        } else if (program >= 24 && program <= 31) {
            // Guitar -> sawtooth
            type = 'sawtooth'; gain = 0.06;
        } else if (program >= 32 && program <= 39) {
            // Bass -> triangle
            type = 'triangle'; gain = 0.14;
        } else if (program >= 40 && program <= 47) {
            // Strings -> sawtooth
            type = 'sawtooth'; gain = 0.06;
        } else if (program >= 48 && program <= 55) {
            // Ensemble -> sawtooth
            type = 'sawtooth'; gain = 0.05;
        } else if (program >= 56 && program <= 63) {
            // Brass -> sawtooth
            type = 'sawtooth'; gain = 0.08;
        } else if (program >= 64 && program <= 71) {
            // Reed -> square
            type = 'square'; gain = 0.07;
        } else if (program >= 72 && program <= 79) {
            // Pipe -> sine
            type = 'sine'; gain = 0.09;
        } else if (program >= 80 && program <= 87) {
            // Synth lead -> square
            type = 'square'; gain = 0.10;
        } else if (program >= 88 && program <= 95) {
            // Synth pad -> sawtooth
            type = 'sawtooth'; gain = 0.05;
        } else {
            type = 'square'; gain = 0.06;
        }

        // If voice already exists, update it
        if (this.channels[channel] && !this.channels[channel].isDrum) {
            this.channels[channel].osc.type = type;
            this.channels[channel].gain.gain.value = gain;
            this.channels[channel].config = { type, gain };
        } else {
            // Update config for when voice is created
            this.channelConfig[channel] = { type, gain };
        }
    }

    // Turn off all notes (used when looping/stopping)
    allNotesOff() {
        if (!this.audioCtx) return;
        const now = this.audioCtx.currentTime;

        for (const key in this.activeNotes) {
            const info = this.activeNotes[key];
            const voice = this.channels[info.channel];
            if (voice && !voice.isDrum && voice.envelope) {
                voice.envelope.gain.cancelScheduledValues(now);
                voice.envelope.gain.setValueAtTime(0, now);
            }
        }
        this.activeNotes = {};
    }

    stop() {
        this.isPlaying = false;

        if (this.midiPlayer) {
            this.midiPlayer.stop();
            this.midiPlayer = null;
        }

        this.allNotesOff();

        // Destroy channel oscillators
        for (const ch in this.channels) {
            const voice = this.channels[ch];
            if (!voice.isDrum && voice.osc) {
                try {
                    voice.osc.stop();
                    voice.osc.disconnect();
                    voice.envelope.disconnect();
                    voice.gain.disconnect();
                } catch (e) { /* already stopped */ }
            }
        }
        this.channels = {};
    }

    setVolume(vol) {
        this.volume = vol;
        if (this.masterGain) {
            this.masterGain.gain.setValueAtTime(vol, this.audioCtx.currentTime);
        }
    }
}

// Global instance
const chiptunePlayer = new ChiptunePlayer();

// Helper: draw a star path on graphics
function drawStarPath(graphics, cx, cy, points, innerRadius, outerRadius) {
    const step = Math.PI / points;
    graphics.beginPath();
    for (let i = 0; i < points * 2; i++) {
        const angle = i * step - Math.PI / 2;
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        if (i === 0) graphics.moveTo(x, y);
        else graphics.lineTo(x, y);
    }
    graphics.closePath();
}

// ============================================================
// PRELOAD SCENE - Load all image assets
// ============================================================
class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        // Progress bar
        const barW = 400, barH = 30;
        const barX = (GAME_WIDTH - barW) / 2;
        const barY = GAME_HEIGHT / 2;

        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x333333);
        progressBox.fillRect(barX, barY, barW, barH);
        const progressBar = this.add.graphics();

        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0x00ff00);
            progressBar.fillRect(barX + 4, barY + 4, (barW - 8) * value, barH - 8);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            const loadingEl = document.getElementById('loading');
            if (loadingEl) loadingEl.style.display = 'none';
        });

        // Load the font via FontFace API
        const font = new FontFace('futural', 'url(assets/BBB-Herthey-Futural-95.otf)');
        font.load().then((loadedFont) => {
            document.fonts.add(loadedFont);
        }).catch((err) => {
            console.warn('Font load failed:', err);
        });

        // ---- Load images ----
        this.load.image('bike', 'assets/bike.png');
        this.load.image('rider', 'assets/rider.png');
        this.load.image('wheel', 'assets/wheel.png');
        this.load.image('background', 'assets/background.png');
        this.load.image('mountains', 'assets/mountains.png');
        this.load.image('ground_top', 'assets/ground_top.png');
        this.load.image('ground_fill', 'assets/ground_fill.png');
        this.load.image('coin', 'assets/coin.png');
        this.load.image('star', 'assets/star.png');
        this.load.image('cloud', 'assets/cloud.png');

        // ---- Load MIDI file as binary ----
        this.load.binary('music_midi', 'assets/darude-sandstorm.mid');
    }

    create() {
        // Generate particle texture
        const pg = this.add.graphics();
        pg.fillStyle(0xFFFFFF);
        pg.fillCircle(4, 4, 4);
        pg.generateTexture('particle', 8, 8);
        pg.destroy();

        // Load MIDI data into chiptune player
        const midiData = this.cache.binary.get('music_midi');
        if (midiData) {
            // Convert ArrayBuffer to base64
            const uint8 = new Uint8Array(midiData);
            let binary = '';
            for (let i = 0; i < uint8.length; i++) {
                binary += String.fromCharCode(uint8[i]);
            }
            chiptunePlayer.midiData = btoa(binary);
            console.log('MIDI loaded via Phaser binary loader');
        } else {
            console.warn('MIDI file not found in cache, trying fetch...');
            chiptunePlayer.loadMidi('assets/music.mid');
        }

        this.scene.start('GameScene');
    }
}


// ============================================================
// MAIN GAME SCENE
// ============================================================
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init() {
        this.worldX = 0;
        this.speed = 0;
        this.maxSpeed = 400;
        this.baseDeceleration = 30;
        this.pedalBoost = 25;
        this.isOnGround = true;
        this.score = 0;
        this.distance = 0;
        this.terrainPoints = [];
        this.terrainGenerated = 0;
        this.coinWorldData = [];
        this.coinSprites = [];
        this.pedalCooldown = 0;
        this.lastShiftTime = 0;
        this.pedalIntensity = 0;
        this.alive = true;
        this.hillMultiplier = 1;
        this.comboTimer = 0;
        this.comboCount = 0;
        this.stoppedTime = null;
        this.playerVelY = 0;
        this.wheelAngle = 0;
        this.legAngle = 0;
        this.playerY = GROUND_Y - 30;
        this._lastBikePedalTime = 0; // ms timestamp of last bike-driven pedal stroke
    }

    create() {
        // ---- BACKGROUND (parallax sky) ----
        this.bgSky = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'background')
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(0);

        // ---- MOUNTAINS (parallax mid layer) ----
        this.bgMountains = this.add.tileSprite(0, GAME_HEIGHT - 400, GAME_WIDTH, 400, 'mountains')
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(0.5);

        // ---- CLOUDS ----
        this.clouds = [];
        for (let i = 0; i < 5; i++) {
            const cloud = this.add.image(
                Phaser.Math.Between(0, GAME_WIDTH),
                Phaser.Math.Between(20, 130),
                'cloud'
            );
            cloud.setAlpha(Phaser.Math.FloatBetween(0.5, 0.9));
            const s = Phaser.Math.FloatBetween(0.4, 1.0);
            cloud.setScale(s);
            cloud.setDepth(0.3);
            cloud.setScrollFactor(0);
            this.clouds.push({
                sprite: cloud,
                speed: Phaser.Math.FloatBetween(0.1, 0.4)
            });
        }

        // ---- TERRAIN ----
        // We will use a RenderTexture for the ground and a Graphics overlay
        this.groundRT = this.add.renderTexture(400, 313, GAME_WIDTH, GAME_HEIGHT).setDepth(2).setScrollFactor(0);
        this.terrainMask = this.add.graphics().setDepth(2).setScrollFactor(0);

        this.generateTerrain(0, GAME_WIDTH + 500);

        // ---- COIN CONTAINER (for coin/star image sprites) ----
        this.coinContainer = this.add.container(0, 0).setDepth(4);

        this.generateCoins(100, GAME_WIDTH + 500);

        // ---- PLAYER ----
        this.playerScreenX = 200;
        this.createPlayer();

        // ---- INPUT ----
        this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.input.keyboard.addCapture(['SHIFT', 'SPACE']);

        this.shiftKey.on('down', () => this.onPedal());
        this.spaceKey.on('down', () => this.onJump());

        // ---- UI ----
        this.createUI();

        // ---- PARTICLES ----
        this.dustParticles = this.add.particles(0, 0, 'particle', {
            speed: { min: 20, max: 60 },
            angle: { min: 160, max: 200 },
            scale: { start: 0.8, end: 0 },
            lifespan: 400,
            tint: 0xCCAA77,
            emitting: false
        }).setDepth(3);

        this.pedalParticles = this.add.particles(0, 0, 'particle', {
            speed: { min: 50, max: 120 },
            angle: { min: 120, max: 240 },
            scale: { start: 0.5, end: 0 },
            lifespan: 300,
            tint: 0xFFFF00,
            emitting: false
        }).setDepth(3);

                // ---- CHIPTUNE MUSIC ----
                this.musicStarted = false;
                this.musicMuted = false;
        
                // Start music (delayed slightly for audio context)
                this.time.delayedCall(200, () => {
                    chiptunePlayer.play();
                    this.musicStarted = true;
                });
        
                // Fallback: start on first input if autoplay blocked
                this.input.keyboard.on('keydown', () => {
                    if (!this.musicStarted) {
                        chiptunePlayer.play();
                        this.musicStarted = true;
                    }
                });
        
                // Mute toggle with M key
                this.muteKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
                this.muteKey.on('down', () => {
                    this.musicMuted = !this.musicMuted;
                    chiptunePlayer.setVolume(this.musicMuted ? 0 : 0.3);
                    this.muteText.setText(this.musicMuted ? '♪ M=Unmute' : '♪ M=Mute');
                });
        
                this.muteText = this.add.text(GAME_WIDTH - 10, GAME_HEIGHT - 15, '♪ M=Mute', {
                    fontFamily: 'futural', fontSize: '12px', color: '#FFFFFF',
                    stroke: '#000000', strokeThickness: 2
                }).setOrigin(1, 0.5).setDepth(100).setScrollFactor(0);
        
    }

    // --------------------------------------------------------
    // PLAYER CREATION
    // --------------------------------------------------------
    createPlayer() {
        // Rear wheel
        this.rearWheel = this.add.image(this.playerScreenX + 16, this.playerY + 6, 'wheel')
            .setDepth(5)
            .setScale(0.8);
    
        // Front wheel
        this.frontWheel = this.add.image(this.playerScreenX - 16, this.playerY + 6, 'wheel')
            .setDepth(5)
            .setScale(0.8);
    
        // Bike frame
        this.bikeSprite = this.add.image(this.playerScreenX+10, this.playerY, 'bike')
            .setOrigin(0.5, 0.7)
            .setDepth(6)
            .setScale(0.7);
    
        // Rider on top - adjusted position
        this.riderSprite = this.add.image(this.playerScreenX + 2, this.playerY - 20, 'rider')
            .setOrigin(0.5, 0.5)
            .setDepth(7)
            .setScale(0.6);
    }

    // --------------------------------------------------------
    // UI
    // --------------------------------------------------------
    createUI() {
        const uiDepth = 10;
    
        this.scoreText = this.add.text(GAME_WIDTH - 20, 15, 'Score: 0', {
            fontFamily: 'futural', fontSize: '18px', color: '#FFFFFF',
            stroke: '#000000', strokeThickness: 3
        }).setOrigin(1, 0).setDepth(uiDepth).setScrollFactor(0);
    
        this.distText = this.add.text(GAME_WIDTH - 20, 45, 'Distance: 0m', {
            fontFamily: 'futural', fontSize: '16px', color: '#FFFFFF',
            stroke: '#000000', strokeThickness: 2
        }).setOrigin(1, 0).setDepth(uiDepth).setScrollFactor(0);
    
        this.speedText = this.add.text(20, 15, 'Speed: 0', {
            fontFamily: 'futural', fontSize: '18px', color: '#FFFFFF',
            stroke: '#000000', strokeThickness: 2
        }).setDepth(uiDepth).setScrollFactor(0);
    
        this.speedBarBg = this.add.rectangle(20, 45, 150, 16, 0x333333)
            .setOrigin(0).setDepth(uiDepth).setScrollFactor(0);
        this.speedBarFill = this.add.rectangle(22, 47, 0, 12, 0x00FF00)
            .setOrigin(0).setDepth(uiDepth).setScrollFactor(0);
    
        this.pedalIndicator = this.add.text(GAME_WIDTH / 2, 20, 'Press SHIFT to pedal!', {
            fontFamily: 'futural', fontSize: '20px', color: '#FFFF00',
            stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5).setDepth(uiDepth).setScrollFactor(0);
    
        this.hillWarning = this.add.text(GAME_WIDTH / 2, 50, '', {
            fontFamily: 'futural', fontSize: '16px', color: '#FF4444',
            stroke: '#000000', strokeThickness: 2
        }).setOrigin(0.5).setDepth(uiDepth).setScrollFactor(0);
    
        this.comboText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50, '', {
            fontFamily: 'futural', fontSize: '30px', color: '#FF00FF',
            stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5).setDepth(uiDepth).setScrollFactor(0).setAlpha(0);
    
        this.instructions = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 40,
            'SHIFT = Pédaler plus vite | ESPACE = Sauter | Pédaler plus fort en montée !', {
                fontFamily: 'futural', fontSize: '14px', color: '#FFFFFF',
                stroke: '#000000', strokeThickness: 2
            }).setOrigin(0.5).setDepth(uiDepth).setScrollFactor(0);
    }

    // --------------------------------------------------------
    // TERRAIN
    // --------------------------------------------------------
    generateTerrain(fromX, toX) {
        let x = this.terrainGenerated || fromX;
        if (this.terrainPoints.length === 0) {
            this.terrainPoints.push({ x: x, y: GROUND_Y });
            x += SEGMENT_WIDTH;
        }

        while (x <= toX) {
            const noise1 = Math.sin(x * 0.003) * 40;
            const noise2 = Math.sin(x * 0.008 + 1.5) * 25;
            const noise3 = Math.sin(x * 0.001) * 60;
            const worldProgress = x / 1000;
            const hillWave = Math.sin(x * 0.002) * (50 + worldProgress * 15);

            let y = GROUND_Y + noise1 + noise2 + noise3 + hillWave;
            y = Phaser.Math.Clamp(y, GROUND_Y - 150, GROUND_Y + 50);

            this.terrainPoints.push({ x: x, y: y });
            x += SEGMENT_WIDTH;
        }
        this.terrainGenerated = x;
    }

    getTerrainYAt(worldX) {
        if (this.terrainPoints.length < 2) return GROUND_Y;
        const firstX = this.terrainPoints[0].x;
        const index = Math.floor((worldX - firstX) / SEGMENT_WIDTH);
        if (index < 0) return GROUND_Y;
        if (index >= this.terrainPoints.length - 1) {
            return this.terrainPoints[this.terrainPoints.length - 1].y;
        }
        const p1 = this.terrainPoints[index];
        const p2 = this.terrainPoints[index + 1];
        const t = (worldX - p1.x) / SEGMENT_WIDTH;
        return p1.y + (p2.y - p1.y) * t;
    }

    getTerrainSlopeAt(worldX) {
        const y1 = this.getTerrainYAt(worldX - 10);
        const y2 = this.getTerrainYAt(worldX + 10);
        return (y2 - y1) / 20;
    }

    drawTerrain() {
        // Only redraw when the world has scrolled enough to need an update
        const scrollDelta = Math.abs(this.worldX - (this._lastDrawnWorldX || 0));
        if (scrollDelta < 2 && this._terrainDrawn) return;
        this._lastDrawnWorldX = this.worldX;
        this._terrainDrawn = true;

        this.groundRT.clear();

        // Cache tile dimensions once
        if (!this._tileMetrics) {
            const groundTopImg = this.textures.get('ground_top').getSourceImage();
            const fillImg      = this.textures.get('ground_fill').getSourceImage();
            this._tileMetrics = {
                tw: groundTopImg.width  || 64,
                th: groundTopImg.height || 32,
                fw: fillImg.width       || 64,
                fh: fillImg.height      || 64
            };
        }
        const { tw, th, fw, fh } = this._tileMetrics;

        // How many pixels the world has scrolled within the current tile — this is the
        // sub-tile offset we subtract so tiles stay locked to the world, not the screen.
        const tileOffsetX = this.worldX % tw;
        const fillOffsetX = this.worldX % fw;

        // Draw one extra tile on each side to cover the sub-tile scroll gap.
        // screenX is always in [0, GAME_WIDTH] range after the offset is applied.

        // --- Grass-top strip ---
        for (let col = -1; col * tw < GAME_WIDTH + tw; col++) {
            const screenX  = col * tw - tileOffsetX;
            // Sample terrain at the world position this screen column corresponds to
            const wx       = this.worldX + screenX;
            const terrainY = this.getTerrainYAt(wx);
            // Place tile so its bottom edge sits on the terrain surface
            this.groundRT.drawFrame('ground_top', undefined, screenX, terrainY - th);
        }

        // --- Fill dirt below the grass ---
        for (let col = -1; col * fw < GAME_WIDTH + fw; col++) {
            const screenX  = col * fw - fillOffsetX;
            const wx       = this.worldX + screenX;
            const terrainY = this.getTerrainYAt(wx);
            for (let fy = terrainY; fy < GAME_HEIGHT + fh; fy += fh) {
                this.groundRT.drawFrame('ground_fill', undefined, screenX, fy);
            }
        }
    }

    // --------------------------------------------------------
    // COINS
    // --------------------------------------------------------
    generateCoins(fromX, toX) {
        // Use a seeded step so coins are deterministic and don't overlap previous runs
        let x = fromX;
        const step = 140; // average spacing — avoids Phaser.Math.Between overhead in bulk gen
        while (x < toX) {
            x += 80 + Math.floor(Math.random() * 121); // 80-200 range
            const terrainY = this.getTerrainYAt(x);
            const isAirCoin = Math.random() > 0.5;
            const coinY = isAirCoin ? terrainY - (60 + Math.floor(Math.random() * 71)) : terrainY - 30;
            const isStar = Math.random() > 0.85;

            // Defer sprite creation until the coin is near the viewport (see updateCoins)
            this.coinWorldData.push({
                worldX: x,
                baseY: coinY,
                collected: false,
                type: isStar ? 'star' : 'coin',
                value: isStar ? 50 : 10,
                sprite: null   // created lazily
            });
        }
    }

    // --------------------------------------------------------
    // INPUT
    // --------------------------------------------------------
    onPedal() {
        if (!this.alive) return;

        const now = this.time.now;
        const timeSinceLast = now - this.lastShiftTime;
        this.lastShiftTime = now;

        const slope = this.getTerrainSlopeAt(this.worldX + this.playerScreenX);
        let slopeResistance = 1;
        if (slope < -0.1) {
            slopeResistance = 1 + Math.abs(slope) * 5;
        } else if (slope > 0.1) {
            slopeResistance = 0.5;
        }

        const boost = this.pedalBoost / slopeResistance;
        this.speed = Math.min(this.maxSpeed, this.speed + boost);

        if (timeSinceLast < 300 && timeSinceLast > 50) {
            this.speed = Math.min(this.maxSpeed, this.speed + boost * 0.5);
            this.pedalIntensity = Math.min(1, this.pedalIntensity + 0.2);
        }

        this.pedalParticles.emitParticleAt(this.playerScreenX, this.playerY);
        this.legAngle += 0.8;

        if (slopeResistance > 2) {
            this.cameras.main.shake(50, 0.002);
        }
    }

    onJump() {
        if (!this.alive || !this.isOnGround) return;
        this.playerVelY = -500;
        this.isOnGround = false;
        this.dustParticles.emitParticleAt(this.playerScreenX, this.playerY, 8);
    }

    // --------------------------------------------------------
    // UPDATE
    // --------------------------------------------------------
    update(time, delta) {
        if (!this.alive) return;
        const dt = delta / 1000;

        // ── Bike trainer input ──────────────────────────────────────────────
        // When a BikeTrainerBLE or BikeTrainerMock is connected, cadence drives
        // periodic onPedal() calls and powerW scales the boost magnitude.
        // SHIFT key still works as a keyboard fallback.
        const bi = window.bikeInput;
        if (bi?.connected && bi.cadenceRpm > 15) {
            // One full crank revolution = 2 pedal strokes. Interval in ms:
            const strokeIntervalMs = 60000 / (bi.cadenceRpm * 2);
            if (time - this._lastBikePedalTime >= strokeIntervalMs) {
                this._lastBikePedalTime = time;
                // Scale boost by wattage: 100 W = normal, 200 W = 2× boost (capped at 3×)
                const powerScale = Math.min(3, Math.max(0.5, (bi.powerW || 100) / 100));
                const saved = this.pedalBoost;
                this.pedalBoost = saved * powerScale;
                this.onPedal();
                this.pedalBoost = saved;
            }
        }
        // ───────────────────────────────────────────────────────────────────

        // Cache slope once per frame — reused by physics, visuals, and UI
        this._cachedSlope = this.getTerrainSlopeAt(this.worldX + this.playerScreenX);

        this.updatePhysics(dt);
        this.updateTerrainGeneration();
        this.drawTerrain();
        this.updateCoins(dt);
        this.updateVisuals(dt);
        this.updateParallax(dt);
        this.updateUI();
        this.checkGameOver();
    }

    updatePhysics(dt) {
        const slope = this._cachedSlope !== undefined ? this._cachedSlope : this.getTerrainSlopeAt(this.worldX + this.playerScreenX);
        const slopeForce = slope * 300;
        this.speed += slopeForce * dt;

        const friction = this.baseDeceleration + (this.speed > 200 ? this.speed * 0.05 : 0);
        this.speed -= friction * dt;
        this.speed = Phaser.Math.Clamp(this.speed, 0, this.maxSpeed);

        this.worldX += this.speed * dt;
        this.distance = Math.floor(this.worldX / 10);

        const terrainY = this.getTerrainYAt(this.worldX + this.playerScreenX);

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
                this.dustParticles.emitParticleAt(this.playerScreenX, this.playerY + 15, 5);
            }
        }

        this.pedalIntensity = Math.max(0, this.pedalIntensity - dt * 2);

        if (slope < -0.1) {
            this.hillMultiplier = 1 + Math.abs(slope) * 5;
        } else {
            this.hillMultiplier = 1;
        }
    }

    updateTerrainGeneration() {
        const lookAhead = this.worldX + GAME_WIDTH + 500;
        if (lookAhead > this.terrainGenerated - 200) {
            this.generateTerrain(this.terrainGenerated, lookAhead + 500);
            this.generateCoins(this.terrainGenerated - 500, lookAhead + 300);
        }

        // Prune old terrain points
        while (this.terrainPoints.length > 2 && this.terrainPoints[0].x < this.worldX - 200) {
            this.terrainPoints.shift();
        }
    }

    updateCoins(dt) {
        const now = this.time.now;
        const spawnWindow  = GAME_WIDTH + 200;  // create sprite when within this range ahead
        const destroyBehind = -150;

        for (let i = this.coinWorldData.length - 1; i >= 0; i--) {
            const coin = this.coinWorldData[i];
            if (coin.collected) continue;

            const screenX = coin.worldX - this.worldX;

            // Remove coins well behind the camera
            if (screenX < destroyBehind) {
                if (coin.sprite) { coin.sprite.destroy(); coin.sprite = null; }
                this.coinWorldData.splice(i, 1);
                continue;
            }

            // Skip coins far ahead — don't create sprites yet
            if (screenX > spawnWindow) continue;

            // Lazy-create sprite only when entering the visible window
            if (!coin.sprite) {
                coin.sprite = this.add.image(0, 0, coin.type)
                    .setScale(0.8)
                    .setDepth(4);
            }

            // Position and bob
            const bobY = coin.baseY + Math.sin(now * 0.005 + coin.worldX) * 5;
            coin.sprite.setPosition(screenX, bobY);

            // Animate only when truly on-screen
            if (screenX > -30 && screenX < GAME_WIDTH + 30) {
                coin.sprite.setVisible(true);
                if (coin.type === 'coin') {
                    const sx = Math.abs(Math.cos(now * 0.004 + coin.worldX)) * 0.8 + 0.1;
                    coin.sprite.setScale(sx, 1);
                } else {
                    coin.sprite.setRotation(now * 0.003);
                }
            } else {
                coin.sprite.setVisible(false);
            }

            // Collection check (only coins near the player)
            if (screenX > this.playerScreenX - 25 && screenX < this.playerScreenX + 25) {
                const dy = Math.abs(bobY - this.playerY);
                if (dy < 35) {
                    coin.collected = true;
                    this.score += coin.value;

                    if (this.comboTimer > 0) {
                        this.comboCount++;
                        this.score += this.comboCount * 5;
                    } else {
                        this.comboCount = 1;
                    }
                    this.comboTimer = 2;

                    this.tweens.add({
                        targets: coin.sprite,
                        y: bobY - 50,
                        alpha: 0,
                        scaleX: 1.5,
                        scaleY: 1.5,
                        duration: 400,
                        onComplete: () => { if (coin.sprite) { coin.sprite.destroy(); coin.sprite = null; } }
                    });

                    this.showCollectText(screenX, bobY, coin.value, this.comboCount);
                }
            }
        }

        // Combo decay
        if (this.comboTimer > 0) {
            this.comboTimer -= dt;
            if (this.comboTimer <= 0) this.comboCount = 0;
        }
    }

    showCollectText(x, y, value, combo) {
        const color = combo > 2 ? '#FF00FF' : '#FFD700';
        const text = combo > 1 ? `+${value} x${combo}!` : `+${value}`;
    
        const floatText = this.add.text(x, y, text, {
            fontFamily: 'futural', fontSize: combo > 2 ? '24px' : '18px', color: color,
            stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5).setDepth(8);

        this.tweens.add({
            targets: floatText,
            y: y - 60, alpha: 0, scaleX: 1.5, scaleY: 1.5,
            duration: 800,
            onComplete: () => floatText.destroy()
        });

        if (combo > 2) {
            this.comboText.setText(`COMBO x${combo}!`);
            this.comboText.setAlpha(1).setScale(1);
            this.tweens.add({
                targets: this.comboText,
                alpha: 0, scaleX: 1.5, scaleY: 1.5,
                duration: 1000
            });
        }
    }

    updateVisuals(dt) {
        const slope = this._cachedSlope;
        const tiltAngle = Math.atan(slope) * 0.5;
    
        // Bike frame
        this.bikeSprite.setPosition(this.playerScreenX, this.playerY);
        this.bikeSprite.setRotation(tiltAngle);
    
        // Rider - adjusted position
        this.riderSprite.setPosition(
            this.playerScreenX,
            this.playerY - 10
        );
        this.riderSprite.setRotation(tiltAngle * 0.6);
    
        // Rider lean on uphill
        if (slope < -0.1) {
            this.riderSprite.setRotation(tiltAngle * 0.6 - 0.15);
        }
    
        // Wheels
        const wheelDist = 18;
        this.frontWheel.setPosition(
            this.playerScreenX - wheelDist * Math.cos(tiltAngle),
            this.playerY + 8 - wheelDist * Math.sin(tiltAngle)
        );
        this.rearWheel.setPosition(
            this.playerScreenX + wheelDist * Math.cos(tiltAngle),
            this.playerY + 8 + wheelDist * Math.sin(tiltAngle)
        );
    
        this.wheelAngle += this.speed * dt * 0.03;
        this.frontWheel.setRotation(this.wheelAngle);
        this.rearWheel.setRotation(this.wheelAngle);
    
        // Pedal intensity visual feedback
        if (this.pedalIntensity > 0.5) {
            const tint = Phaser.Display.Color.GetColor(
                255, 255 - Math.floor(this.pedalIntensity * 50),
                255 - Math.floor(this.pedalIntensity * 50)
            );
            this.bikeSprite.setTint(tint);
            this.riderSprite.setTint(tint);
        } else {
            this.bikeSprite.clearTint();
            this.riderSprite.clearTint();
        }
    
        // Dust when moving on ground
        if (this.isOnGround && this.speed > 50) {
            if (Math.random() < this.speed / 500) {
                this.dustParticles.emitParticleAt(this.playerScreenX + 15, this.playerY + 15);
                this.dustParticles.emitParticleAt(this.playerScreenX - 15, this.playerY + 15);
            }
        }
    
        // Speed bobbing
        if (this.isOnGround && this.speed > 100) {
            const bob = Math.sin(this.time.now * 0.015) * (this.speed / 400) * 2;
            this.bikeSprite.y += bob;
            this.riderSprite.y += bob;
        }
    }

    updateParallax(dt) {
        // Scroll background layers at different rates
        this.bgSky.tilePositionX += this.speed * dt * 0.02;
        this.bgMountains.tilePositionX += this.speed * dt * 0.08;

        // Clouds
        for (const cloud of this.clouds) {
            cloud.sprite.x -= cloud.speed + this.speed * 0.02 * dt;
            if (cloud.sprite.x < -100) {
                cloud.sprite.x = GAME_WIDTH + Phaser.Math.Between(50, 150);
                cloud.sprite.y = Phaser.Math.Between(20, 130);
            }
        }
    }

    updateUI() {
        // Throttle text updates to every other frame to cut setText overhead
        this._uiFrame = (this._uiFrame || 0) + 1;
        if (this._uiFrame % 2 === 0) {
            this.scoreText.setText(`Score: ${this.score}`);
            this.distText.setText(`Distance: ${this.distance}m`);
            this.speedText.setText(`Vitesse : ${Math.floor(this.speed/10)} km/h`);
        }

        const speedRatio = this.speed / this.maxSpeed;
        this.speedBarFill.width = 146 * speedRatio;

        const newColor = speedRatio > 0.7 ? 0xFF4444 : speedRatio > 0.4 ? 0xFFAA00 : 0x00FF00;
        if (this.speedBarFill.fillColor !== newColor) this.speedBarFill.fillColor = newColor;

        if (this.speed < 10) {
            this.pedalIndicator.setText('Il faut pédaler !');
            this.pedalIndicator.setColor('#FFFF00');
            this.pedalIndicator.setAlpha(0.5 + Math.sin(this.time.now * 0.005) * 0.5);
        } else if (this.hillMultiplier > 2) {
            this.pedalIndicator.setText('STEEP HILL! Mash SHIFT!');
            this.pedalIndicator.setColor('#FF4444').setAlpha(1);
        } else if (this.hillMultiplier > 1.3) {
            this.pedalIndicator.setText('Hill ahead - pedal faster!');
            this.pedalIndicator.setColor('#FFAA00').setAlpha(1);
        } else {
            this.pedalIndicator.setAlpha(0);
        }

        // Re-use cached slope for the look-ahead check (offset by 200 world units)
        const slopeAhead = this.getTerrainSlopeAt(this.worldX + this.playerScreenX + 200);
        if (slopeAhead < -0.15) {
            this.hillWarning.setText('⚠ STEEP CLIMB AHEAD ⚠').setAlpha(1);
        } else {
            this.hillWarning.setAlpha(0);
        }
    }

    checkGameOver() {
        if (this.speed <= 0 && this.distance > 10) {
            this.speed = 0;
            if (!this.stoppedTime) {
                this.stoppedTime = this.time.now;
            } else if (this.time.now - this.stoppedTime > 3000) {
                this.gameOver();
            }
        } else {
            this.stoppedTime = null;
        }
    }

    gameOver() {
        this.alive = false;
        this.cameras.main.flash(500, 255, 0, 0);

        // Stop the chiptune music
        chiptunePlayer.stop();

        this.time.delayedCall(1000, () => {
            this.scene.start('GameOverScene', {
                score: this.score,
                distance: this.distance
            });
        });
    }
}

// ============================================================
// GAME OVER SCENE
// ============================================================
class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.finalScore = data.score || 0;
        this.finalDistance = data.distance || 0;
    }

    create() {
        // Use background image if available
        if (this.textures.exists('background')) {
            this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'background')
                .setDisplaySize(GAME_WIDTH, GAME_HEIGHT)
                .setTint(0x333355);
        } else {
            this.cameras.main.setBackgroundColor('#1a1a2e');
        }

        // Dark overlay
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6);

        this.add.text(GAME_WIDTH / 2, 80, 'GAME OVER', {
            fontFamily: 'futural', fontSize: '52px', color: '#FF4444',
            stroke: '#000000', strokeThickness: 6
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 150, 'Your bicycle ran out of steam!', {
            fontFamily: 'futural', fontSize: '18px', color: '#AAAAAA'
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 220, `Distance: ${this.finalDistance}m`, {
            fontFamily: 'futural', fontSize: '28px', color: '#FFFFFF',
            stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 270, `Score: ${this.finalScore}`, {
            fontFamily: 'futural', fontSize: '34px', color: '#FFD700',
            stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5);

        const restartText = this.add.text(GAME_WIDTH / 2, 370, '[ Press SHIFT or SPACE to Restart ]', {
            fontFamily: 'futural', fontSize: '22px', color: '#AAFFAA',
            stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5);

        this.tweens.add({
            targets: restartText,
            alpha: 0.3, duration: 600, yoyo: true, repeat: -1
        });

        const tips = [
            'Tip: Mash SHIFT rapidly to climb steep hills!',
            'Tip: Jump with SPACE to collect airborne items!',
            'Tip: Collect items in quick succession for combo bonuses!',
            'Tip: Downhill sections give you free speed!',
        ];

        this.add.text(GAME_WIDTH / 2, 430, Phaser.Utils.Array.GetRandom(tips), {
            fontFamily: 'futural', fontSize: '15px', color: '#8888CC',
            stroke: '#000000', strokeThickness: 2
        }).setOrigin(0.5);
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
    scene: [PreloadScene, GameScene, GameOverScene]
};

const game = new Phaser.Game(config);
