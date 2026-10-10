import Phaser from 'phaser';
import { Player } from '../objects/Player';
import { CityEnvironment } from '../world/CityEnvironment';
import { updateGameState, getGameState } from '../../store/gameState';

export class MainScene extends Phaser.Scene {
  private player!: Player;
  private city!: CityEnvironment;

  constructor() {
    super({ key: 'MainScene' });
  }

  create() {
    this.city = new CityEnvironment(this);
    this.city.build();

    // Start player somewhat near the middle of a road block
    this.player = new Player(this, 150, 150);

    // Collisions
    this.physics.add.collider(this.player, this.city.buildings);

    // Camera
    this.cameras.main.setBounds(0, 0, this.city.worldWidth, this.city.worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
    this.cameras.main.setZoom(1.2);

    // Initial HUD update
    updateGameState({ location: 'DOWNTOWN EAST' });
  }

  update() {
    if (this.player) {
      this.player.update();

      // Check interactions
      let touchingBusinessId: string | null = null;
      this.physics.overlap(this.player, this.city.interactionZones, (_, zone) => {
        const gameObject = zone as Phaser.GameObjects.GameObject;
        touchingBusinessId = gameObject.getData('businessId');
      });

      const currentState = getGameState();
      if (currentState.activeInteraction !== touchingBusinessId && !currentState.panelOpen) {
        updateGameState({ activeInteraction: touchingBusinessId });
      }
    }
  }
}
