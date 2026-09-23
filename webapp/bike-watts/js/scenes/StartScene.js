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
