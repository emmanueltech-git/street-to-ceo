import Phaser from 'phaser';
import { Player } from '../objects/Player';
import { CityEnvironment } from '../world/CityEnvironment';
import { updateGameState, getGameState, clearTargetWaypoint } from '../../store/gameState';

export class MainScene extends Phaser.Scene {
  private player!: Player;
  private city!: CityEnvironment;
  private lastWaypointBusinessId: string | null = null;
  private isPanningToWaypoint = false;

  constructor() {
    super({ key: 'MainScene' });
  }

  create() {
    this.city = new CityEnvironment(this);
    this.city.build();

    // Start player on the sidewalk in front of the Corner Shop entrance
    this.player = new Player(this, 250, 270);

    // Collisions with buildings
    this.physics.add.collider(this.player, this.city.buildings);

    // Camera setup
    this.cameras.main.setBounds(0, 0, this.city.worldWidth, this.city.worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
    this.cameras.main.setZoom(1.15);

    // Initial location update
    updateGameState({ location: 'DOWNTOWN COMMERCIAL DISTRICT' });
  }

  update() {
    if (this.player) {
      this.player.update();

      // Check interactions with building entrance zones
      let touchingBusinessId: string | null = null;
      this.physics.overlap(this.player, this.city.interactionZones, (_, zone) => {
        const gameObject = zone as Phaser.GameObjects.GameObject;
        touchingBusinessId = gameObject.getData('businessId');
      });

      const currentState = getGameState();
      if (currentState.activeInteraction !== touchingBusinessId && !currentState.panelOpen) {
        updateGameState({ activeInteraction: touchingBusinessId });
      }

      // Waypoint Handling
      const waypoint = currentState.targetWaypoint;
      this.city.updateWaypoint(waypoint);

      if (waypoint) {
        // If a new waypoint was just requested, smoothly pan camera to show player where it is
        if (waypoint.businessId !== this.lastWaypointBusinessId && !this.isPanningToWaypoint) {
          this.lastWaypointBusinessId = waypoint.businessId;
          this.isPanningToWaypoint = true;
          this.cameras.main.stopFollow();
          this.cameras.main.pan(waypoint.x, waypoint.y, 800, 'Sine.easeInOut', true, (_, progress) => {
            if (progress === 1) {
              // Wait 1.5s then smoothly pan back to player
              this.time.delayedCall(1500, () => {
                this.cameras.main.pan(this.player.x, this.player.y, 800, 'Sine.easeInOut', true, (__, p2) => {
                  if (p2 === 1) {
                    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
                    this.isPanningToWaypoint = false;
                  }
                });
              });
            }
          });
        }

        // Check if player has arrived within 65px of waypoint
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, waypoint.x, waypoint.y);
        if (dist < 65) {
          clearTargetWaypoint();
          this.lastWaypointBusinessId = null;
        }
      } else {
        this.lastWaypointBusinessId = null;
      }

      // Dynamic district name based on player coordinates
      this.updateDistrictName();
    }
  }

  private updateDistrictName() {
    const px = this.player.x;
    const py = this.player.y;
    let district: string;

    if (py < 450) {
      district = px < 1000 ? 'NORTH MARKET AVENUE' : 'UPTOWN RETAIL STRIP';
    } else if (py < 850) {
      district = px < 1000 ? 'MIDTOWN FOOD & AUTO PLAZA' : 'HEALTH & RECREATION QUARTER';
    } else if (py < 1250) {
      district = px < 1000 ? 'CENTRAL COMMERCE BOULEVARD' : 'ENERGY & REAL ESTATE ROW';
    } else {
      district = px < 800 ? 'CIVIC & HOSPITALITY SECTOR' : 'CENTRAL CIVIC PLAZA';
    }

    const state = getGameState();
    if (state.location !== district) {
      updateGameState({ location: district });
    }
  }
}
