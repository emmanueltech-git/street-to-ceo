import Phaser from 'phaser';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd?: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };
  private speed = 200;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');

    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Physics settings
    this.setCollideWorldBounds(true);
    
    // Draw a placeholder texture if 'player' texture doesn't exist
    if (!scene.textures.exists('player')) {
      const graphics = scene.add.graphics();
      graphics.fillStyle(0xffaa00, 1);
      
      // Top-down human silhouette (head + shoulders)
      graphics.fillCircle(16, 16, 10); // Head
      graphics.fillStyle(0x0055ff, 1);
      graphics.fillRoundedRect(4, 20, 24, 12, 4); // Shoulders
      
      graphics.generateTexture('player', 32, 32);
      graphics.destroy();
      this.setTexture('player');
    }

    // Set bounding box to be slightly smaller than the sprite for better collisions
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(24, 24);
    body.setOffset(4, 4);

    // Input setup
    if (scene.input.keyboard) {
      this.cursors = scene.input.keyboard.createCursorKeys();
      this.wasd = scene.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D
      }) as {
        up: Phaser.Input.Keyboard.Key;
        down: Phaser.Input.Keyboard.Key;
        left: Phaser.Input.Keyboard.Key;
        right: Phaser.Input.Keyboard.Key;
      };
      // Prevent Phaser from swallowing keyboard input that might be meant for UI
      scene.input.keyboard.disableGlobalCapture();
    }
  }

  update() {
    const body = this.body as Phaser.Physics.Arcade.Body;
    
    // Reset velocity
    body.setVelocity(0);

    let velocityX = 0;
    let velocityY = 0;

    // Handle horizontal movement
    if (this.cursors?.left.isDown || this.wasd?.left.isDown) {
      velocityX = -this.speed;
    } else if (this.cursors?.right.isDown || this.wasd?.right.isDown) {
      velocityX = this.speed;
    }

    // Handle vertical movement
    if (this.cursors?.up.isDown || this.wasd?.up.isDown) {
      velocityY = -this.speed;
    } else if (this.cursors?.down.isDown || this.wasd?.down.isDown) {
      velocityY = this.speed;
    }

    // Normalize diagonal speed
    if (velocityX !== 0 && velocityY !== 0) {
      body.velocity.normalize().scale(this.speed);
    } else {
      body.setVelocity(velocityX, velocityY);
    }

    // Facing direction (simple rotation towards movement for top down, or flip)
    // Since it's a 3/4 or top down without rotation, let's just use simple orientation 
    // or leave it static for prototype.
  }
}
