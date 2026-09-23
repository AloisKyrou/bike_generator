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
