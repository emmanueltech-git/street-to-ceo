import Phaser from 'phaser';
import { SKIN_DEFINITIONS } from '../../store/gameState';
import type { SkinDef } from '../../store/gameState';

// Generates a 32x36 procedural player texture for the given skin.
function buildSkinTexture(scene: Phaser.Scene, skin: SkinDef): void {
  const key = 'player_' + skin.id;
  if (scene.textures.exists(key)) return;

  const g = scene.add.graphics();

  // ── Hat ────────────────────────────────────────────────────────────────────
  if (skin.hatType === 'cap') {
    g.fillStyle(skin.hatColor ?? 0x222222, 1);
    g.fillEllipse(16, 6, 22, 10);          // brim
    g.fillRect(7, 1, 18, 8);              // dome
    g.fillStyle(skin.hatColor ?? 0x222222, 1);
    g.fillRect(7, 7, 18, 4);              // visor stripe
  } else if (skin.hatType === 'traditional') {
    g.fillStyle(skin.hatColor ?? 0xffd700, 1);
    g.fillEllipse(16, 5, 26, 14);          // wide brim
    g.fillEllipse(16, 3, 18, 12);          // crown
  }

  // ── Head ───────────────────────────────────────────────────────────────────
  const headY = skin.hatType !== 'none' ? 12 : 8;
  g.fillStyle(skin.headColor, 1);
  g.fillCircle(16, headY, 8);

  // ── Eyes ───────────────────────────────────────────────────────────────────
  g.fillStyle(0x1a1a1a, 1);
  g.fillCircle(13, headY - 1, 1.5);
  g.fillCircle(19, headY - 1, 1.5);

  // ── Shirt / Jacket ─────────────────────────────────────────────────────────
  g.fillStyle(skin.bodyTopColor, 1);
  g.fillRoundedRect(6, headY + 7, 20, 11, 3);

  // ── Collar / Accent ────────────────────────────────────────────────────────
  g.fillStyle(skin.accentColor, 1);
  g.fillRect(14, headY + 7, 4, 4);

  // ── Trousers ───────────────────────────────────────────────────────────────
  g.fillStyle(skin.bodyBottomColor, 1);
  g.fillRect(7,  headY + 17, 8, 9);
  g.fillRect(17, headY + 17, 8, 9);

  // ── Shoes ──────────────────────────────────────────────────────────────────
  g.fillStyle(skin.shoesColor, 1);
  g.fillRoundedRect(5,  headY + 25, 10, 5, 2);
  g.fillRoundedRect(17, headY + 25, 10, 5, 2);

  g.generateTexture(key, 32, 36);
  g.destroy();
}

export class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd?: {
    up:    Phaser.Input.Keyboard.Key;
    down:  Phaser.Input.Keyboard.Key;
    left:  Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };
  private speed = 200;

  constructor(scene: Phaser.Scene, x: number, y: number, skinId = 'skin_street') {
    super(scene, x, y, 'player_' + skinId);

    // Pre-generate all skin textures so equipping is instant
    SKIN_DEFINITIONS.forEach(skin => buildSkinTexture(scene, skin));

    // Apply the starting skin
    this.setTexture('player_' + skinId);

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(24, 24);
    body.setOffset(4, 8);

    if (scene.input.keyboard) {
      this.cursors = scene.input.keyboard.createCursorKeys();
      this.wasd = scene.input.keyboard.addKeys({
        up:    Phaser.Input.Keyboard.KeyCodes.W,
        down:  Phaser.Input.Keyboard.KeyCodes.S,
        left:  Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D,
      }) as { up: Phaser.Input.Keyboard.Key; down: Phaser.Input.Keyboard.Key; left: Phaser.Input.Keyboard.Key; right: Phaser.Input.Keyboard.Key; };
      scene.input.keyboard.disableGlobalCapture();
    }
  }

  /** Switch to the skin with the given ID immediately. */
  applySkin(skinId: string): void {
    const skin = SKIN_DEFINITIONS.find(s => s.id === skinId);
    if (!skin) return;
    buildSkinTexture(this.scene, skin);
    this.setTexture('player_' + skinId);
  }

  private walkTimer = 0;

  update() {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0);

    let vx = 0, vy = 0;
    if (this.cursors?.left.isDown  || this.wasd?.left.isDown)  {
      vx = -this.speed;
      this.setFlipX(true);
    } else if (this.cursors?.right.isDown || this.wasd?.right.isDown) {
      vx = this.speed;
      this.setFlipX(false);
    }

    if (this.cursors?.up.isDown    || this.wasd?.up.isDown)    vy = -this.speed;
    else if (this.cursors?.down.isDown  || this.wasd?.down.isDown)  vy = this.speed;

    if (vx !== 0 && vy !== 0) {
      body.velocity.normalize().scale(this.speed);
    } else {
      body.setVelocity(vx, vy);
    }

    // Walking animation bob / tilt
    if (vx !== 0 || vy !== 0) {
      this.walkTimer += 0.25;
      this.setAngle(Math.sin(this.walkTimer) * 4);
    } else {
      this.walkTimer = 0;
      this.setAngle(0);
    }
  }
}
