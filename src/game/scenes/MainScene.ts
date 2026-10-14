import Phaser from 'phaser';
import { Player } from '../objects/Player';
import { CityEnvironment } from '../world/CityEnvironment';
import { updateGameState, getGameState, clearTargetWaypoint } from '../../store/gameState';

export class MainScene extends Phaser.Scene {
  private player!: Player;
  private city!: CityEnvironment;
  private lastWaypointBusinessId: string | null = null;
  private isPanningToWaypoint = false;
  private lastEquippedSkin = '';
  private lastUpgradeSnapshot = '';

  constructor() {
    super({ key: 'MainScene' });
  }

  create() {
    const gs = getGameState();

    this.city = new CityEnvironment(this);
    this.city.build();

    this.player = new Player(this, 250, 270, gs.equippedOutfit || 'skin_street');
    this.lastEquippedSkin = gs.equippedOutfit || 'skin_street';

    this.physics.add.collider(this.player, this.city.buildings);
    this.cameras.main.setBounds(0, 0, this.city.worldWidth, this.city.worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
    this.cameras.main.setZoom(1.15);

    updateGameState({ location: 'DOWNTOWN COMMERCIAL DISTRICT' });

    // Apply initial upgrade badges
    this.syncUpgradeBadges(gs.businessUpgrades || {});
    this.lastUpgradeSnapshot = JSON.stringify(gs.businessUpgrades || {});
  }

  update() {
    if (!this.player) return;
    this.player.update();
    this.city.update(this.game.loop.delta);

    // ── Interaction zone detection ────────────────────────────────────────────
    let touchingBusinessId: string | null = null;
    this.physics.overlap(this.player, this.city.interactionZones, (_, zone) => {
      touchingBusinessId = (zone as Phaser.GameObjects.GameObject).getData('businessId') as string;
    });

    const gs = getGameState();
    if (gs.activeInteraction !== touchingBusinessId && !gs.panelOpen) {
      updateGameState({ activeInteraction: touchingBusinessId });
    }

    // ── Skin changes ─────────────────────────────────────────────────────────
    if (gs.equippedOutfit && gs.equippedOutfit !== this.lastEquippedSkin) {
      this.lastEquippedSkin = gs.equippedOutfit;
      this.player.applySkin(gs.equippedOutfit);
    }

    // ── Upgrade badge sync (check snapshot to avoid per-frame work) ──────────
    const upgradeSnapshot = JSON.stringify(gs.businessUpgrades || {});
    if (upgradeSnapshot !== this.lastUpgradeSnapshot) {
      this.lastUpgradeSnapshot = upgradeSnapshot;
      this.syncUpgradeBadges(gs.businessUpgrades || {});
    }

    // ── Waypoint handling ─────────────────────────────────────────────────────
    const waypoint = gs.targetWaypoint;
    this.city.updateWaypoint(waypoint);

    if (waypoint) {
      if (waypoint.businessId !== this.lastWaypointBusinessId && !this.isPanningToWaypoint) {
        this.lastWaypointBusinessId = waypoint.businessId;
        this.isPanningToWaypoint = true;
        this.cameras.main.stopFollow();
        this.cameras.main.pan(waypoint.x, waypoint.y, 800, 'Sine.easeInOut', true, (_, progress) => {
          if (progress === 1) {
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
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, waypoint.x, waypoint.y);
      if (dist < 65) { clearTargetWaypoint(); this.lastWaypointBusinessId = null; }
    } else {
      this.lastWaypointBusinessId = null;
    }

    // ── Dynamic district name ─────────────────────────────────────────────────
    this.updateDistrictName();
  }

  private syncUpgradeBadges(upgrades: Record<string, number>) {
    Object.entries(upgrades).forEach(([id, level]) => {
      this.city.setUpgradeBadge(id, level);
    });
  }

  private updateDistrictName() {
    const px = this.player.x;
    const py = this.player.y;
    let district: string;

    if (px < 1800 && py < 1800) {
      if (py < 450)       district = px < 1000 ? 'STARTER: NORTH MARKET AVENUE' : 'STARTER: UPTOWN RETAIL STRIP';
      else if (py < 850)  district = px < 1000 ? 'STARTER: MIDTOWN FOOD & AUTO PLAZA' : 'STARTER: HEALTH QUARTER';
      else if (py < 1250) district = px < 1000 ? 'STARTER: CENTRAL COMMERCE BOULEVARD' : 'STARTER: REAL ESTATE ROW';
      else                district = 'STARTER: CENTRAL CIVIC PLAZA';
    } else if (px >= 1800 && py < 1800) {
      if (py < 900)       district = 'COMMERCIAL: FINANCIAL TOWERS';
      else                district = 'COMMERCIAL: CORPORATE BOULEVARD';
    } else if (px < 1800 && py >= 1800) {
      if (py < 2700)      district = 'INDUSTRIAL: APEX LOGISTICS BASIN';
      else                district = 'INDUSTRIAL: POWER & GRID SECTOR';
    } else {
      if (py < 2700)      district = 'LUXURY: WATERFRONT MARINA';
      else                district = 'LUXURY: SOVEREIGN CASINO STRIP';
    }

    const st = getGameState();
    if (st.location !== district) updateGameState({ location: district });
  }
}
