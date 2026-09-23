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
        const font = new FontFace(FONT_FUTURAL, 'url(assets/fonts/BBB-Herthey-Futural-95.otf)');
        font.load().then(f => document.fonts.add(f)).catch(e => console.warn('Font load failed:', e));
    }

    _loadAssets() {
        const assets = {
            'player':  ['bike', 'rider', 'wheel'],
            'world':   ['background', 'mountains', 'ground_top', 'ground_fill', 'cloud'],
            'items':   ['coin', 'star'],
            'ui':      ['welcome_screen', 'gauge_fill', 'gauge_frame'],
            'story':   ['maison', 'velo', 'light_on', 'phone_off', 'phone_on'],
        };
        for (const [folder, names] of Object.entries(assets)) {
            for (const name of names) this.load.image(name, `assets/${folder}/${name}.png`);
        }
        this.load.binary('music_midi', 'assets/audio/darude-sandstorm.mid');
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
            chiptunePlayer.loadMidi('assets/audio/darude-sandstorm.mid');
        }
    }
}
