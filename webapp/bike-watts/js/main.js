// ============================================================
// BICYCLE RUNNER — Phaser 3 launch config
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
