// ============================================================
// BICYCLE RUNNER — Shared constants & helpers
// ============================================================

// ── Game dimensions ─────────────────────────────────────────
const GAME_WIDTH  = 900;
const GAME_HEIGHT = 500;
const GROUND_Y    = 400;
const GRAVITY     = 1200;
const SEGMENT_WIDTH = 4;

// ── Gameplay tuning ─────────────────────────────────────────
const MAX_SPEED           = 400;
const BASE_DECELERATION   = 30;
const PEDAL_BOOST         = 25;
const JUMP_VELOCITY       = -500;
const RAPID_PEDAL_WINDOW  = 300;   // ms — fast-pedal bonus window
const RAPID_PEDAL_MIN     = 50;    // ms — debounce
const GAME_OVER_DELAY     = 3000;  // ms stopped before game over
const LEVEL_DISTANCE      = 2500;  // distance units to complete level

// ── Bike trainer ────────────────────────────────────────────
const REAL_MAX_SPEED_KMH  = 30;
const BIKE_SPEED_CONVERGENCE = 4;  // proportional gain for speed tracking

// ── Terrain generation ──────────────────────────────────────
const TERRAIN_LOOK_AHEAD  = 500;
const TERRAIN_PRUNE_BEHIND = 200;
const COIN_SPACING_MIN    = 80;
const COIN_SPACING_RANGE  = 121;   // 80–200 range
const COIN_AIR_HEIGHT_MIN = 60;
const COIN_AIR_HEIGHT_RANGE = 71;
const STAR_CHANCE         = 0.15;
const COIN_VALUE          = 10;
const STAR_VALUE          = 50;

// ── Visual / UI ─────────────────────────────────────────────
const PLAYER_SCREEN_X     = 200;
const CLOUD_COUNT         = 5;
const GAUGE_SCALE         = 0.15;
const UI_DEPTH            = 10;

// ── Blackout scene ──────────────────────────────────────────
const BLACKOUT_GIF_LOOP_MS = 2000;
const BLACKOUT_GIF_LOOPS   = 3;
const REVEAL_TAP_COUNT     = 10;

// ── Common text styles ──────────────────────────────────────
const FONT_FUTURAL = 'futural';
const FONT_MONO    = 'monospace';

function textStyle(overrides = {}) {
    return {
        fontFamily: FONT_FUTURAL,
        fontSize: '18px',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 3,
        ...overrides,
    };
}
