import Phaser from 'phaser';
import { BUSINESS_DEFINITIONS } from '../../store/gameState';
import type { BusinessDef } from '../../store/gameState';

export class CityEnvironment {
  private scene: Phaser.Scene;
  public buildings: Phaser.Physics.Arcade.StaticGroup;
  public interactionZones: Phaser.Physics.Arcade.StaticGroup;
  public worldWidth = 2000;
  public worldHeight = 2000;
  private waypointGraphics?: Phaser.GameObjects.Graphics;
  private upgradeBadges: Map<string, Phaser.GameObjects.Text> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.buildings = this.scene.physics.add.staticGroup();
    this.interactionZones = this.scene.physics.add.staticGroup();
  }

  build() {
    const { scene, worldWidth, worldHeight } = this;

    // Set bounds
    scene.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    // Base ground / grass texture
    const bgGraphics = scene.add.graphics();
    bgGraphics.fillStyle(0x233127, 1); // Dark forest lawn
    bgGraphics.fillRect(0, 0, worldWidth, worldHeight);

    // Procedural city grid constants
    const blockSize = 300;
    const roadWidth = 100;
    const sidewalkWidth = 22;

    const roadGraphics = scene.add.graphics();
    const sidewalkGraphics = scene.add.graphics();

    // Draw Sidewalks & Roads
    for (let x = 0; x < worldWidth; x += blockSize + roadWidth) {
      // Vertical sidewalks & asphalt
      sidewalkGraphics.fillStyle(0x9ca3af, 1);
      sidewalkGraphics.fillRect(x - sidewalkWidth, 0, roadWidth + sidewalkWidth * 2, worldHeight);
      roadGraphics.fillStyle(0x27272a, 1);
      roadGraphics.fillRect(x, 0, roadWidth, worldHeight);

      // Road markings (vertical dashed center lines)
      roadGraphics.fillStyle(0xfef08a, 0.9);
      for (let markY = 0; markY < worldHeight; markY += 45) {
        roadGraphics.fillRect(x + roadWidth / 2 - 2, markY, 4, 24);
      }
    }

    for (let y = 0; y < worldHeight; y += blockSize + roadWidth) {
      // Horizontal sidewalks & asphalt
      sidewalkGraphics.fillStyle(0x9ca3af, 1);
      sidewalkGraphics.fillRect(0, y - sidewalkWidth, worldWidth, roadWidth + sidewalkWidth * 2);
      roadGraphics.fillStyle(0x27272a, 1);
      roadGraphics.fillRect(0, y, worldWidth, roadWidth);

      // Road markings (horizontal dashed center lines)
      roadGraphics.fillStyle(0xfef08a, 0.9);
      for (let markX = 0; markX < worldWidth; markX += 45) {
        roadGraphics.fillRect(markX, y + roadWidth / 2 - 2, 24, 4);
      }
    }

    // Build all 17 businesses from BUSINESS_DEFINITIONS
    BUSINESS_DEFINITIONS.forEach((def) => {
      this.createBusinessBuilding(def);
    });

    // Build decorative blocks (parks, residential zones, plazas) for blocks not occupied by businesses
    this.buildCivicAndResidentialBlocks(blockSize, roadWidth);

    // Create waypoint marker graphic
    this.waypointGraphics = scene.add.graphics();
    this.waypointGraphics.setDepth(15);
  }

  private createBusinessBuilding(def: BusinessDef) {
    const { scene } = this;
    const { worldX: x, worldY: y, width, height, id, name, type } = def;

    const g = scene.add.graphics();

    // 1. Paved courtyard apron in front of the building
    g.fillStyle(0x4b5563, 1);
    g.fillRect(x - 6, y - 6, width + 12, height + 36);

    // 2. Drop Shadow
    g.fillStyle(0x000000, 0.4);
    g.fillRect(x + 6, y + 6, width, height);

    // 3. Main building facade
    g.fillStyle(def.accentColor, 1);
    g.fillRect(x, y, width, height);

    // 4. Roof surface and inner border
    g.fillStyle(def.roofColor, 1);
    g.fillRect(x + 8, y + 8, width - 16, height - 24);
    g.lineStyle(2, 0x000000, 0.35);
    g.strokeRect(x + 8, y + 8, width - 16, height - 24);

    // 5. Custom Architectural Feature per Business
    this.drawBuildingProps(g, def);

    // 6. Entrance Doorway (bottom center)
    const doorW = 36;
    const doorH = 14;
    const doorX = x + width / 2 - doorW / 2;
    const doorY = y + height - doorH;

    // Door recess
    g.fillStyle(0x18181b, 1);
    g.fillRect(doorX, doorY, doorW, doorH + 2);

    // Welcome mat / entrance runner
    g.fillStyle(def.signBgColor, 0.85);
    g.fillRect(doorX + 3, y + height + 2, doorW - 6, 12);
    g.lineStyle(1, 0xffffff, 0.4);
    g.strokeRect(doorX + 3, y + height + 2, doorW - 6, 12);

    // 7. High-contrast Signboard above door / top of building
    const signW = Math.min(width - 20, 230);
    const signH = 34;
    const signX = x + (width - signW) / 2;
    const signY = y + 12;

    g.fillStyle(0x0f172a, 0.95);
    g.fillRoundedRect(signX, signY, signW, signH, 6);
    g.lineStyle(2, def.accentColor, 1);
    g.strokeRoundedRect(signX, signY, signW, signH, 6);

    // Sign text (Name)
    scene.add
      .text(x + width / 2, signY + 11, name, {
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#ffffff',
        align: 'center'
      })
      .setOrigin(0.5);

    // Sign subtitle (Category / Type)
    scene.add
      .text(x + width / 2, signY + 24, type.toUpperCase(), {
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '9px',
        fontStyle: 'bold',
        color: '#d5d4cd',
        align: 'center'
      })
      .setOrigin(0.5);

    // 8. Physical Collision Body (exact building bounds)
    const buildingZone = scene.add.zone(x + width / 2, y + height / 2, width, height);
    scene.physics.add.existing(buildingZone, true);
    this.buildings.add(buildingZone);

    // 9. Interaction Zone (on sidewalk in front of entrance)
    const zoneW = 80;
    const zoneH = 36;
    const interactZone = scene.add.zone(x + width / 2, y + height + 22, zoneW, zoneH);
    scene.physics.add.existing(interactZone, true);
    interactZone.setData('businessId', id);
    this.interactionZones.add(interactZone);

    // Visual footprint indicator for interaction
    const zoneMarker = scene.add.graphics();
    zoneMarker.lineStyle(2, 0xb58a45, 0.7);
    zoneMarker.strokeRoundedRect(x + width / 2 - 32, y + height + 10, 64, 24, 4);
    zoneMarker.fillStyle(0xb58a45, 0.15);
    zoneMarker.fillRoundedRect(x + width / 2 - 32, y + height + 10, 64, 24, 4);
  }

  private drawBuildingProps(g: Phaser.GameObjects.Graphics, def: BusinessDef) {
    const { worldX: x, worldY: y, width, height, id } = def;

    switch (id) {
      case 'b_corner': // Corner shop striped awning & crates
        // Green and white striped awning over entrance
        for (let i = 0; i < 6; i++) {
          g.fillStyle(i % 2 === 0 ? 0x315b43 : 0xf4f1e8, 1);
          g.fillRect(x + width / 2 - 40 + i * 13, y + height - 20, 13, 8);
        }
        // Fruit & soda crates
        g.fillStyle(0xd97706, 1);
        g.fillRect(x + 20, y + height - 16, 18, 12);
        g.fillRect(x + 42, y + height - 16, 18, 12);
        break;

      case 'b_restaurant': // Outdoor tables with umbrella & diner canopy
        // Red and cream awning
        for (let i = 0; i < 6; i++) {
          g.fillStyle(i % 2 === 0 ? 0xb91c1c : 0xfef08a, 1);
          g.fillRect(x + width / 2 - 40 + i * 13, y + height - 20, 13, 8);
        }
        // Cafe tables with umbrellas
        g.fillStyle(0xd97706, 1);
        g.fillCircle(x + 30, y + height - 10, 8);
        g.fillStyle(0xb91c1c, 1);
        g.fillCircle(x + 30, y + height - 10, 5);

        g.fillStyle(0xd97706, 1);
        g.fillCircle(x + width - 30, y + height - 10, 8);
        g.fillStyle(0xb91c1c, 1);
        g.fillCircle(x + width - 30, y + height - 10, 5);
        break;

      case 'b_clothing': // Fashion boutique display glass showcase
        g.fillStyle(0x38bdf8, 0.4);
        g.fillRect(x + 20, y + height - 20, 50, 14);
        g.fillRect(x + width - 70, y + height - 20, 50, 14);
        g.lineStyle(1, 0xd5d4cd, 0.8);
        g.strokeRect(x + 20, y + height - 20, 50, 14);
        g.strokeRect(x + width - 70, y + height - 20, 50, 14);
        break;

      case 'b_phone': // Neon antenna dish & tech display
        g.fillStyle(0x0ea5e9, 1);
        g.fillRect(x + width / 2 - 2, y + 2, 4, 10);
        g.fillCircle(x + width / 2, y + 2, 5);
        // Neon windows
        g.fillStyle(0x06b6d4, 0.5);
        g.fillRect(x + 25, y + height - 18, 40, 10);
        g.fillRect(x + width - 65, y + height - 18, 40, 10);
        break;

      case 'b_barber': // Barber poles with red/white/blue stripes
        // Barber pole left
        g.fillStyle(0xbe123c, 1);
        g.fillRect(x + width / 2 - 28, y + height - 24, 6, 8);
        g.fillStyle(0xffffff, 1);
        g.fillRect(x + width / 2 - 28, y + height - 16, 6, 8);
        g.fillStyle(0x0284c7, 1);
        g.fillRect(x + width / 2 - 28, y + height - 8, 6, 8);

        // Barber pole right
        g.fillStyle(0xbe123c, 1);
        g.fillRect(x + width / 2 + 22, y + height - 24, 6, 8);
        g.fillStyle(0xffffff, 1);
        g.fillRect(x + width / 2 + 22, y + height - 16, 6, 8);
        g.fillStyle(0x0284c7, 1);
        g.fillRect(x + width / 2 + 22, y + height - 8, 6, 8);
        break;

      case 'b_bakery': // Golden oven canopy & rooftop chimney
        // Chimney
        g.fillStyle(0x78350f, 1);
        g.fillRect(x + width - 36, y - 6, 14, 18);
        g.fillStyle(0xfef08a, 0.8);
        g.fillCircle(x + width - 29, y - 8, 4); // Puff of steam
        // Golden bread awning
        for (let i = 0; i < 6; i++) {
          g.fillStyle(i % 2 === 0 ? 0xd97706 : 0xfef3c7, 1);
          g.fillRect(x + width / 2 - 40 + i * 13, y + height - 20, 13, 8);
        }
        break;

      case 'b_carwash': // Twin wash bays with blue arches & spray lanes
        g.fillStyle(0x0891b2, 0.6);
        g.fillRect(x + 18, y + height - 22, 60, 18);
        g.fillRect(x + width - 78, y + height - 22, 60, 18);
        g.lineStyle(2, 0xfef08a, 0.9);
        g.strokeLineShape(new Phaser.Geom.Line(x + 48, y + height - 22, x + 48, y + height + 10));
        g.strokeLineShape(new Phaser.Geom.Line(x + width - 48, y + height - 22, x + width - 48, y + height + 10));
        break;

      case 'b_farm': // Farm fence & green crop rows
        // Fencing
        g.lineStyle(2, 0x854d0e, 1);
        g.strokeRect(x - 2, y + height - 4, width + 4, 30);
        // Crop rows (cabbages/maize)
        g.fillStyle(0x22c55e, 1);
        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 8; col++) {
            g.fillCircle(x + 16 + col * 32, y + height + 6 + row * 8, 3);
          }
        }
        break;

      case 'b_gym': // Bold hazard athletic stripes & dumbbell detail
        g.fillStyle(0xeab308, 1);
        for (let i = 0; i < 5; i++) {
          g.fillRect(x + 15 + i * 20, y + height - 16, 10, 6);
          g.fillRect(x + width - 105 + i * 20, y + height - 16, 10, 6);
        }
        break;

      case 'b_pharmacy': // Emerald medical cross (+) emblem
        g.fillStyle(0x22c55e, 1);
        // Medical Cross
        g.fillRect(x + width / 2 - 4, y + height - 26, 8, 20);
        g.fillRect(x + width / 2 - 10, y + height - 20, 20, 8);
        break;

      case 'b_supermarket': // Broad double doors & grocery cart bays
        g.fillStyle(0x38bdf8, 0.7);
        g.fillRect(x + width / 2 - 30, y + height - 18, 60, 16);
        // Cart bay
        g.fillStyle(0x94a3b8, 1);
        g.fillRect(x + 15, y + height - 14, 30, 10);
        g.fillRect(x + width - 45, y + height - 14, 30, 10);
        break;

      case 'b_electronics': // Solar panel grid on roof
        g.fillStyle(0x1e3a8a, 0.9);
        for (let i = 0; i < 4; i++) {
          g.fillRect(x + 20 + i * 30, y + 48, 24, 16);
          g.lineStyle(1, 0x38bdf8, 0.8);
          g.strokeRect(x + 20 + i * 30, y + 48, 24, 16);
        }
        break;

      case 'b_delivery': // Industrial loading docks & cargo parcel boxes
        g.fillStyle(0x64748b, 1);
        g.fillRect(x + 20, y + height - 24, 40, 20);
        g.fillRect(x + width - 60, y + height - 24, 40, 20);
        // Brown parcel boxes
        g.fillStyle(0xb45309, 1);
        g.fillRect(x + 26, y + height - 16, 12, 10);
        g.fillRect(x + width - 50, y + height - 16, 12, 10);
        break;

      case 'b_fuel': // Petroleum canopy island with fuel dispensers
        // Yellow pump bollards
        g.fillStyle(0xeab308, 1);
        g.fillRect(x + 30, y + height + 6, 12, 18);
        g.fillRect(x + width - 42, y + height + 6, 12, 18);
        // Pump nozzles
        g.fillStyle(0xd97706, 1);
        g.fillRect(x + 32, y + height + 8, 8, 14);
        g.fillRect(x + width - 40, y + height + 8, 8, 14);
        break;

      case 'b_realestate': // Classic corporate columns with gold trim
        g.fillStyle(0xf1f5f9, 1);
        g.fillRect(x + 25, y + 48, 10, height - 52);
        g.fillRect(x + 45, y + 48, 10, height - 52);
        g.fillRect(x + width - 55, y + 48, 10, height - 52);
        g.fillRect(x + width - 35, y + 48, 10, height - 52);
        g.lineStyle(2, 0xd4af37, 1);
        g.strokeRect(x + 20, y + 48, 40, height - 52);
        g.strokeRect(x + width - 60, y + 48, 40, height - 52);
        break;

      case 'b_construction': // Caution hazard diagonal stripes & steel girder
        g.fillStyle(0xf59e0b, 1);
        for (let i = 0; i < 8; i++) {
          g.fillRect(x + 10 + i * 30, y + height - 16, 14, 6);
        }
        // Steel I-beam girder
        g.fillStyle(0x71717a, 1);
        g.fillRect(x + 20, y + height + 4, 60, 8);
        break;

      case 'b_hotel': // Grand marquee portico with luxury gold poles
        g.fillStyle(0xd4af37, 1);
        g.fillRect(x + width / 2 - 35, y + height - 10, 6, 22);
        g.fillRect(x + width / 2 + 29, y + height - 10, 6, 22);
        // Red carpet runner
        g.fillStyle(0xbe123c, 1);
        g.fillRect(x + width / 2 - 16, y + height - 6, 32, 28);
        break;
    }
  }

  private buildCivicAndResidentialBlocks(blockSize: number, roadWidth: number) {
    const { worldWidth, worldHeight } = this;

    // Decorate the remaining blocks (such as Row 3 parks and Row 4 residential houses)
    for (let x = roadWidth; x < worldWidth; x += blockSize + roadWidth) {
      for (let y = roadWidth; y < worldHeight; y += blockSize + roadWidth) {
        // Check if any business exists in this block
        const hasBusiness = BUSINESS_DEFINITIONS.some(
          (b) => b.worldX >= x && b.worldX < x + blockSize && b.worldY >= y && b.worldY < y + blockSize
        );

        if (!hasBusiness) {
          // If in Row 3 / Col 2: Central City Park Plaza
          if (x === 900 && y === 1300) {
            this.buildCentralPark(x, y, blockSize);
          } else {
            // General urban architecture (residential houses or park squares)
            this.buildUrbanResidentialBlock(x, y, blockSize);
          }
        }
      }
    }
  }

  private buildCentralPark(x: number, y: number, size: number) {
    const g = this.scene.add.graphics();
    // Lush green park grass
    g.fillStyle(0x1e3a29, 1);
    g.fillRect(x + 10, y + 10, size - 20, size - 20);

    // Stone pathway cross
    g.fillStyle(0x9ca3af, 1);
    g.fillRect(x + size / 2 - 16, y + 10, 32, size - 20);
    g.fillRect(x + 10, y + size / 2 - 16, size - 20, 32);

    // Center fountain
    g.fillStyle(0x38bdf8, 1);
    g.fillCircle(x + size / 2, y + size / 2, 28);
    g.lineStyle(4, 0xd1d5db, 1);
    g.strokeCircle(x + size / 2, y + size / 2, 28);

    // Park trees
    const treePositions = [
      { tx: x + 50, ty: y + 50 },
      { tx: x + size - 50, ty: y + 50 },
      { tx: x + 50, ty: y + size - 50 },
      { tx: x + size - 50, ty: y + size - 50 }
    ];

    treePositions.forEach(({ tx, ty }) => {
      g.fillStyle(0x15803d, 1);
      g.fillCircle(tx, ty, 20);
      g.fillStyle(0x166534, 1);
      g.fillCircle(tx - 4, ty - 4, 14);
    });

    // Park label
    this.scene.add
      .text(x + size / 2, y + 36, 'CENTRAL CITY PLAZA', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#f4f1e8'
      })
      .setOrigin(0.5);
  }

  private buildUrbanResidentialBlock(x: number, y: number, size: number) {
    const g = this.scene.add.graphics();
    // Paved lot
    g.fillStyle(0x374151, 1);
    g.fillRect(x + 10, y + 10, size - 20, size - 20);

    // 2 townhouse/commercial units
    const houseColors = [0x475569, 0x52525b, 0x3f3f46];
    const unitW = size - 40;
    const unitH = (size - 60) / 2;

    [y + 20, y + 40 + unitH].forEach((unitY, idx) => {
      const color = houseColors[idx % houseColors.length];
      g.fillStyle(0x000000, 0.3);
      g.fillRect(x + 24, unitY + 4, unitW, unitH);

      g.fillStyle(color, 1);
      g.fillRect(x + 20, unitY, unitW, unitH);

      // Roof trim
      g.lineStyle(2, 0x1f2937, 1);
      g.strokeRect(x + 20, unitY, unitW, unitH);

      // Windows
      g.fillStyle(0x93c5fd, 0.6);
      g.fillRect(x + 35, unitY + 12, 24, 16);
      g.fillRect(x + unitW - 35, unitY + 12, 24, 16);

      // Add collision body
      const bZone = this.scene.add.zone(x + 20 + unitW / 2, unitY + unitH / 2, unitW, unitH);
      this.scene.physics.add.existing(bZone, true);
      this.buildings.add(bZone);
    });
  }

  public updateWaypoint(waypoint: { x: number; y: number; name: string } | null) {
    if (!this.waypointGraphics) return;
    this.waypointGraphics.clear();
    if (!waypoint) return;
    const time = this.scene.time.now;
    const pulseRadius = 24 + Math.sin(time / 200) * 6;
    this.waypointGraphics.lineStyle(3, 0xb58a45, 0.9);
    this.waypointGraphics.strokeCircle(waypoint.x, waypoint.y, pulseRadius);
    this.waypointGraphics.fillStyle(0xb58a45, 0.25);
    this.waypointGraphics.fillCircle(waypoint.x, waypoint.y, pulseRadius);
    this.waypointGraphics.fillStyle(0x315b43, 1);
    this.waypointGraphics.fillCircle(waypoint.x, waypoint.y, 6);
  }

  /**
   * Update or create the upgrade level badge for a business building.
   * Badges show gold star symbols above the entrance for levels 2-5.
   */
  public setUpgradeBadge(businessId: string, level: number): void {
    const def = BUSINESS_DEFINITIONS.find(b => b.id === businessId);
    if (!def) return;

    const stars = level >= 2 ? '★'.repeat(level - 1) : '';
    const bx = def.worldX + def.width / 2;
    const by = def.worldY - 14;

    const existing = this.upgradeBadges.get(businessId);
    if (existing) {
      existing.setText(stars);
      return;
    }

    if (level >= 2) {
      const badge = this.scene.add.text(bx, by, stars, {
        fontSize: '14px',
        color: '#B58A45',
        stroke: '#252923',
        strokeThickness: 3,
        fontStyle: 'bold',
      }).setOrigin(0.5, 1).setDepth(10);
      this.upgradeBadges.set(businessId, badge);
    }
  }
}
