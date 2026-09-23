// ============================================================
// GAME SCENE  (main gameplay loop)
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
            this.groundRT.drawFrame('ground_top', undefined, screenX, terrainY - th + 30);
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
