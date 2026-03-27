// ============================================================
// BICYCLE RUNNER - Phaser 3 (Image-based version)
// Controls: SHIFT = Pedal/Accelerate | SPACE = Jump
// ============================================================

const GAME_WIDTH = 900;
const GAME_HEIGHT = 500;
const GROUND_Y = 400;
const GRAVITY = 1200;
const SEGMENT_WIDTH = 4;

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
    }

    create() {
        // Generate a small particle texture programmatically (too small for an image file)
        const pg = this.add.graphics();
        pg.fillStyle(0xFFFFFF);
        pg.fillCircle(4, 4, 4);
        pg.generateTexture('particle', 8, 8);
        pg.destroy();

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
    }

    create() {
        // ---- BACKGROUND (parallax sky) ----
        this.bgSky = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'background')
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(0);

        // ---- MOUNTAINS (parallax mid layer) ----
        this.bgMountains = this.add.tileSprite(0, GAME_HEIGHT - 300, GAME_WIDTH, 300, 'mountains')
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
            fontSize: '22px', fontFamily: 'Arial', color: '#FFFFFF',
            stroke: '#000000', strokeThickness: 3
        }).setOrigin(1, 0).setDepth(uiDepth).setScrollFactor(0);

        this.distText = this.add.text(GAME_WIDTH - 20, 45, 'Distance: 0m', {
            fontSize: '16px', fontFamily: 'Arial', color: '#FFFFFF',
            stroke: '#000000', strokeThickness: 2
        }).setOrigin(1, 0).setDepth(uiDepth).setScrollFactor(0);

        this.speedText = this.add.text(20, 15, 'Speed: 0', {
            fontSize: '18px', fontFamily: 'Arial', color: '#FFFFFF',
            stroke: '#000000', strokeThickness: 2
        }).setDepth(uiDepth).setScrollFactor(0);

        this.speedBarBg = this.add.rectangle(20, 45, 150, 16, 0x333333)
            .setOrigin(0).setDepth(uiDepth).setScrollFactor(0);
        this.speedBarFill = this.add.rectangle(22, 47, 0, 12, 0x00FF00)
            .setOrigin(0).setDepth(uiDepth).setScrollFactor(0);

        this.pedalIndicator = this.add.text(GAME_WIDTH / 2, 20, 'Press SHIFT to pedal!', {
            fontSize: '20px', fontFamily: 'Arial', color: '#FFFF00',
            stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5).setDepth(uiDepth).setScrollFactor(0);

        this.hillWarning = this.add.text(GAME_WIDTH / 2, 50, '', {
            fontSize: '16px', fontFamily: 'Arial', color: '#FF4444',
            stroke: '#000000', strokeThickness: 2
        }).setOrigin(0.5).setDepth(uiDepth).setScrollFactor(0);

        this.comboText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50, '', {
            fontSize: '30px', fontFamily: 'Arial', color: '#FF00FF',
            stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5).setDepth(uiDepth).setScrollFactor(0).setAlpha(0);

        this.instructions = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 40,
            'SHIFT = Pedal Faster  |  SPACE = Jump  |  Pedal harder on hills!', {
                fontSize: '14px', fontFamily: 'Arial', color: '#FFFFFF',
                stroke: '#000000', strokeThickness: 2
            }).setOrigin(0.5).setDepth(uiDepth).setScrollFactor(0);

        this.time.delayedCall(5000, () => {
            this.tweens.add({ targets: this.instructions, alpha: 0, duration: 1000 });
        });
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
            fontSize: combo > 2 ? '24px' : '18px',
            fontFamily: 'Arial', color: color,
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
            this.speedText.setText(`Speed: ${Math.floor(this.speed/10)} km/h`);
        }

        const speedRatio = this.speed / this.maxSpeed;
        this.speedBarFill.width = 146 * speedRatio;

        const newColor = speedRatio > 0.7 ? 0xFF4444 : speedRatio > 0.4 ? 0xFFAA00 : 0x00FF00;
        if (this.speedBarFill.fillColor !== newColor) this.speedBarFill.fillColor = newColor;

        if (this.speed < 10) {
            this.pedalIndicator.setText('Press SHIFT to pedal!');
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
            fontSize: '52px', fontFamily: 'Arial', color: '#FF4444',
            stroke: '#000000', strokeThickness: 6
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 150, 'Your bicycle ran out of steam!', {
            fontSize: '18px', fontFamily: 'Arial', color: '#AAAAAA'
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 220, `Distance: ${this.finalDistance}m`, {
            fontSize: '28px', fontFamily: 'Arial', color: '#FFFFFF',
            stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 270, `Score: ${this.finalScore}`, {
            fontSize: '34px', fontFamily: 'Arial', color: '#FFD700',
            stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5);

        const restartText = this.add.text(GAME_WIDTH / 2, 370, '[ Press SHIFT or SPACE to Restart ]', {
            fontSize: '22px', fontFamily: 'Arial', color: '#AAFFAA',
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
            fontSize: '15px', fontFamily: 'Arial', color: '#8888CC',
            stroke: '#000000', strokeThickness: 2
        }).setOrigin(0.5);

        this.time.delayedCall(500, () => {
            this.input.keyboard.once('keydown-SHIFT', () => this.scene.start('GameScene'));
            this.input.keyboard.once('keydown-SPACE', () => this.scene.start('GameScene'));
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
    scene: [PreloadScene, GameScene, GameOverScene]
};

const game = new Phaser.Game(config);
