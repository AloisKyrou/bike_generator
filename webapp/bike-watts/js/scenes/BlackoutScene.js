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
        this._gifEl.src = 'assets/story/eyes.gif';
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
            'Pédalez ou touchez l\'écran pour allumer la lumière 💡',
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
            if (this._pressCount >= REVEAL_TAP_COUNT) {
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
