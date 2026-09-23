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
