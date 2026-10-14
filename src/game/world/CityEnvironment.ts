import Phaser from 'phaser';
import { BUSINESS_DEFINITIONS, getActiveBusinessDetails, getGameState } from '../../store/gameState';
import type { BusinessDef } from '../../store/gameState';

interface AmbientCitizen {
  sprite: Phaser.GameObjects.Sprite;
  minVal: number;
  maxVal: number;
  speed: number;
  direction: 1 | -1;
  axis: 'x' | 'y';
  walkTimer: number;
}

export class CityEnvironment {
  private scene: Phaser.Scene;
  public buildings: Phaser.Physics.Arcade.StaticGroup;
  public interactionZones: Phaser.Physics.Arcade.StaticGroup;
  public worldWidth = 3600;
  public worldHeight = 3600;
  private waypointGraphics?: Phaser.GameObjects.Graphics;
  private upgradeBadges: Map<string, Phaser.GameObjects.Text> = new Map();
  private ambientCitizens: AmbientCitizen[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.buildings = this.scene.physics.add.staticGroup();
    this.interactionZones = this.scene.physics.add.staticGroup();
  }

  build() {
    const { scene, worldWidth, worldHeight } = this;

    // Set physics bounds to full expanded city
    scene.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    // ── 1. Base District Ground Surfaces ─────────────────────────────────────
    const bgGraphics = scene.add.graphics();
    const halfW = 1800;
    const halfH = 1800;

    // NW Quadrant: Starter District (Warm lush dark lawn)
    bgGraphics.fillStyle(0x233127, 1);
    bgGraphics.fillRect(0, 0, halfW, halfH);

    // NE Quadrant: Commercial District (Corporate slate asphalt / paved granite)
    bgGraphics.fillStyle(0x1e293b, 1);
    bgGraphics.fillRect(halfW, 0, halfW, halfH);

    // SW Quadrant: Industrial District (Heavy industrial dark asphalt / gravel)
    bgGraphics.fillStyle(0x292524, 1);
    bgGraphics.fillRect(0, halfH, halfW, halfH);

    // SE Quadrant: Luxury District (High-end emerald turf / manicured courtyard)
    bgGraphics.fillStyle(0x064e3b, 1);
    bgGraphics.fillRect(halfW, halfH, halfW, halfH);

    // ── 2. Grid Sidewalks & Roads (400px step across 3600x3600) ──────────────
    const blockSize = 300;
    const roadWidth = 100;
    const sidewalkWidth = 22;

    const roadGraphics = scene.add.graphics();
    const sidewalkGraphics = scene.add.graphics();

    for (let x = 0; x < worldWidth; x += blockSize + roadWidth) {
      // Vertical sidewalks & asphalt
      sidewalkGraphics.fillStyle(0x9ca3af, 1);
      sidewalkGraphics.fillRect(x - sidewalkWidth, 0, roadWidth + sidewalkWidth * 2, worldHeight);
      roadGraphics.fillStyle(0x27272a, 1);
      roadGraphics.fillRect(x, 0, roadWidth, worldHeight);

      // Center dashed road markings
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

      // Center dashed road markings
      roadGraphics.fillStyle(0xfef08a, 0.9);
      for (let markX = 0; markX < worldWidth; markX += 45) {
        roadGraphics.fillRect(markX, y + roadWidth / 2 - 2, 24, 4);
      }
    }

    // ── 3. District Arterial Boundary Portals & Archways ─────────────────────
    this.buildDistrictBoundaryMarkers();

    // ── 4. Build All 29 Businesses ───────────────────────────────────────────
    BUSINESS_DEFINITIONS.forEach((def) => {
      this.createBusinessBuilding(def);
    });

    // ── 5. Civic, Residential & Decorative Urban Blocks ──────────────────────
    this.buildCivicAndResidentialBlocks(blockSize, roadWidth);

    // ── 6. Street Lighting Across All 4 Districts ────────────────────────────
    this.buildStreetDecorations(blockSize, roadWidth);

    // ── 7. Ambient City Pedestrians ──────────────────────────────────────────
    this.initAmbientCitizens();

    // Waypoint Graphic
    this.waypointGraphics = scene.add.graphics();
    this.waypointGraphics.setDepth(15);
  }

  private buildDistrictBoundaryMarkers() {
    const { scene } = this;
    const g = scene.add.graphics();
    g.setDepth(6);

    // Gateway portals at key boundary crossing roads
    const gateways: Array<{
      x: number;
      y: number;
      w: number;
      h: number;
      title: string;
      subtitle: string;
      accent: number;
      isHoriz: boolean;
    }> = [
      // Starter to Commercial boundary (x = 1800, y = 300 & y = 900)
      {
        x: 1780,
        y: 260,
        w: 140,
        h: 40,
        title: 'COMMERCIAL DISTRICT',
        subtitle: 'CORPORATE TOWERS & BANKING',
        accent: 0x38bdf8,
        isHoriz: false,
      },
      {
        x: 1780,
        y: 860,
        w: 140,
        h: 40,
        title: 'COMMERCIAL DISTRICT',
        subtitle: 'FINANCE & MEDIA HUB',
        accent: 0x38bdf8,
        isHoriz: false,
      },
      // Starter to Industrial boundary (y = 1800, x = 300 & x = 900)
      {
        x: 260,
        y: 1780,
        w: 180,
        h: 40,
        title: 'INDUSTRIAL DISTRICT',
        subtitle: 'MANUFACTURING & LOGISTICS',
        accent: 0xf59e0b,
        isHoriz: true,
      },
      {
        x: 860,
        y: 1780,
        w: 180,
        h: 40,
        title: 'INDUSTRIAL DISTRICT',
        subtitle: 'ENERGY GRID & FREIGHT',
        accent: 0xf59e0b,
        isHoriz: true,
      },
      // Commercial to Luxury boundary (y = 1800, x = 2100 & x = 2700)
      {
        x: 2060,
        y: 1780,
        w: 180,
        h: 40,
        title: 'LUXURY DISTRICT',
        subtitle: 'HARBOR MARINA & CASINO',
        accent: 0xd4af37,
        isHoriz: true,
      },
      {
        x: 2660,
        y: 1780,
        w: 180,
        h: 40,
        title: 'LUXURY DISTRICT',
        subtitle: 'PENTHOUSE SUITES & WATERFRONT',
        accent: 0xd4af37,
        isHoriz: true,
      },
    ];

    gateways.forEach((gw) => {
      // Portal pylons
      g.fillStyle(0x18181b, 1);
      g.fillRect(gw.x - 4, gw.y - 4, gw.w + 8, gw.h + 8);
      g.fillStyle(0x27272a, 1);
      g.fillRect(gw.x, gw.y, gw.w, gw.h);

      // Colored neon trim
      g.lineStyle(2, gw.accent, 0.9);
      g.strokeRect(gw.x, gw.y, gw.w, gw.h);

      // High-contrast Gateway signage
      scene.add
        .text(gw.x + gw.w / 2, gw.y + 12, gw.title, {
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
          fontSize: '11px',
          fontStyle: 'bold',
          color: '#ffffff',
          align: 'center',
        })
        .setOrigin(0.5)
        .setDepth(7);

      scene.add
        .text(gw.x + gw.w / 2, gw.y + 26, gw.subtitle, {
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
          fontSize: '8px',
          fontStyle: 'bold',
          color: '#d5d4cd',
          align: 'center',
        })
        .setOrigin(0.5)
        .setDepth(7);
    });
  }

  private createBusinessBuilding(def: BusinessDef) {
    const { scene } = this;
    const { worldX: x, worldY: y, width, height, id } = def;

    // Use active details in case it's a developed property
    const active = getActiveBusinessDetails(def, getGameState());

    const g = scene.add.graphics();

    // 1. Paved courtyard apron
    g.fillStyle(0x4b5563, 1);
    g.fillRect(x - 6, y - 6, width + 12, height + 36);

    // 2. Drop Shadow
    g.fillStyle(0x000000, 0.4);
    g.fillRect(x + 6, y + 6, width, height);

    // 3. Main building facade
    g.fillStyle(active.accentColor, 1);
    g.fillRect(x, y, width, height);

    // 4. Roof surface and inner border
    g.fillStyle(active.roofColor, 1);
    g.fillRect(x + 8, y + 8, width - 16, height - 24);
    g.lineStyle(2, 0x000000, 0.35);
    g.strokeRect(x + 8, y + 8, width - 16, height - 24);

    // 5. Custom Architectural Feature per Business
    this.drawBuildingProps(g, def, active);

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
    const signW = Math.min(width - 20, 240);
    const signH = 34;
    const signX = x + (width - signW) / 2;
    const signY = y + 12;

    g.fillStyle(0x0f172a, 0.95);
    g.fillRoundedRect(signX, signY, signW, signH, 6);
    g.lineStyle(2, active.accentColor, 1);
    g.strokeRoundedRect(signX, signY, signW, signH, 6);

    // Sign text (Name)
    scene.add
      .text(x + width / 2, signY + 11, active.name, {
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#ffffff',
        align: 'center',
      })
      .setOrigin(0.5);

    // Sign subtitle (Category / Type)
    scene.add
      .text(x + width / 2, signY + 24, active.type.toUpperCase(), {
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '9px',
        fontStyle: 'bold',
        color: '#d5d4cd',
        align: 'center',
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

  private drawBuildingProps(
    g: Phaser.GameObjects.Graphics,
    def: BusinessDef,
    active: { name: string; type: string; category: string }
  ) {
    const { worldX: x, worldY: y, width, height, id } = def;

    // Check if this is a development plot (either raw or developed)
    if (def.isDevelopmentPlot) {
      const gs = getGameState();
      const isDeveloped = !!gs.developedProperties[id];

      if (!isDeveloped) {
        // Raw Development Plot: Caution hazard fencing & surveyor markers
        g.lineStyle(2, 0xf59e0b, 1);
        g.strokeRect(x + 10, y + 50, width - 20, height - 70);

        // Yellow-black diagonal hazard stripes
        for (let i = 0; i < 8; i++) {
          g.fillStyle(i % 2 === 0 ? 0xf59e0b : 0x18181b, 1);
          g.fillRect(x + 20 + i * 26, y + height - 20, 26, 8);
        }
        // Surveyor tripod & blueprints table
        g.fillStyle(0x38bdf8, 1);
        g.fillRect(x + 25, y + 55, 36, 20);
        g.lineStyle(1, 0xffffff, 0.8);
        g.strokeRect(x + 25, y + 55, 36, 20);
        return;
      }
    }

    switch (id) {
      // ── STARTER DISTRICT PROPS ─────────────────────────────────────────────
      case 'b_corner':
        for (let i = 0; i < 6; i++) {
          g.fillStyle(i % 2 === 0 ? 0x315b43 : 0xf4f1e8, 1);
          g.fillRect(x + width / 2 - 40 + i * 13, y + height - 20, 13, 8);
        }
        g.fillStyle(0xd97706, 1);
        g.fillRect(x + 20, y + height - 16, 18, 12);
        g.fillRect(x + 42, y + height - 16, 18, 12);
        break;

      case 'b_restaurant':
        for (let i = 0; i < 6; i++) {
          g.fillStyle(i % 2 === 0 ? 0xb91c1c : 0xfef08a, 1);
          g.fillRect(x + width / 2 - 40 + i * 13, y + height - 20, 13, 8);
        }
        g.fillStyle(0xd97706, 1);
        g.fillCircle(x + 30, y + height - 10, 8);
        g.fillStyle(0xb91c1c, 1);
        g.fillCircle(x + 30, y + height - 10, 5);
        g.fillStyle(0xd97706, 1);
        g.fillCircle(x + width - 30, y + height - 10, 8);
        g.fillStyle(0xb91c1c, 1);
        g.fillCircle(x + width - 30, y + height - 10, 5);
        break;

      case 'b_clothing':
        g.fillStyle(0x38bdf8, 0.4);
        g.fillRect(x + 20, y + height - 20, 50, 14);
        g.fillRect(x + width - 70, y + height - 20, 50, 14);
        g.lineStyle(1, 0xd5d4cd, 0.8);
        g.strokeRect(x + 20, y + height - 20, 50, 14);
        g.strokeRect(x + width - 70, y + height - 20, 50, 14);
        break;

      case 'b_phone':
        g.fillStyle(0x0ea5e9, 1);
        g.fillRect(x + width / 2 - 2, y + 2, 4, 10);
        g.fillCircle(x + width / 2, y + 2, 5);
        g.fillStyle(0x06b6d4, 0.5);
        g.fillRect(x + 25, y + height - 18, 40, 10);
        g.fillRect(x + width - 65, y + height - 18, 40, 10);
        break;

      case 'b_barber':
        g.fillStyle(0xbe123c, 1);
        g.fillRect(x + width / 2 - 28, y + height - 24, 6, 8);
        g.fillStyle(0xffffff, 1);
        g.fillRect(x + width / 2 - 28, y + height - 16, 6, 8);
        g.fillStyle(0x0284c7, 1);
        g.fillRect(x + width / 2 - 28, y + height - 8, 6, 8);
        g.fillStyle(0xbe123c, 1);
        g.fillRect(x + width / 2 + 22, y + height - 24, 6, 8);
        g.fillStyle(0xffffff, 1);
        g.fillRect(x + width / 2 + 22, y + height - 16, 6, 8);
        g.fillStyle(0x0284c7, 1);
        g.fillRect(x + width / 2 + 22, y + height - 8, 6, 8);
        break;

      case 'b_bakery':
        g.fillStyle(0x78350f, 1);
        g.fillRect(x + width - 36, y - 6, 14, 18);
        g.fillStyle(0xfef08a, 0.8);
        g.fillCircle(x + width - 29, y - 8, 4);
        for (let i = 0; i < 6; i++) {
          g.fillStyle(i % 2 === 0 ? 0xd97706 : 0xfef3c7, 1);
          g.fillRect(x + width / 2 - 40 + i * 13, y + height - 20, 13, 8);
        }
        break;

      case 'b_carwash':
        g.fillStyle(0x0891b2, 0.6);
        g.fillRect(x + 18, y + height - 22, 60, 18);
        g.fillRect(x + width - 78, y + height - 22, 60, 18);
        g.lineStyle(2, 0xfef08a, 0.9);
        g.strokeLineShape(new Phaser.Geom.Line(x + 48, y + height - 22, x + 48, y + height + 10));
        g.strokeLineShape(new Phaser.Geom.Line(x + width - 48, y + height - 22, x + width - 48, y + height + 10));
        break;

      case 'b_farm':
        g.lineStyle(2, 0x854d0e, 1);
        g.strokeRect(x - 2, y + height - 4, width + 4, 30);
        g.fillStyle(0x22c55e, 1);
        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 8; col++) {
            g.fillCircle(x + 16 + col * 32, y + height + 6 + row * 8, 3);
          }
        }
        break;

      case 'b_gym':
        g.fillStyle(0xeab308, 1);
        for (let i = 0; i < 5; i++) {
          g.fillRect(x + 15 + i * 20, y + height - 16, 10, 6);
          g.fillRect(x + width - 105 + i * 20, y + height - 16, 10, 6);
        }
        break;

      case 'b_pharmacy':
        g.fillStyle(0x22c55e, 1);
        g.fillRect(x + width / 2 - 4, y + height - 26, 8, 20);
        g.fillRect(x + width / 2 - 10, y + height - 20, 20, 8);
        break;

      case 'b_supermarket':
        g.fillStyle(0x38bdf8, 0.7);
        g.fillRect(x + width / 2 - 30, y + height - 18, 60, 16);
        g.fillStyle(0x94a3b8, 1);
        g.fillRect(x + 15, y + height - 14, 30, 10);
        g.fillRect(x + width - 45, y + height - 14, 30, 10);
        break;

      case 'b_electronics':
        g.fillStyle(0x1e3a8a, 0.9);
        for (let i = 0; i < 4; i++) {
          g.fillRect(x + 20 + i * 30, y + 48, 24, 16);
          g.lineStyle(1, 0x38bdf8, 0.8);
          g.strokeRect(x + 20 + i * 30, y + 48, 24, 16);
        }
        break;

      case 'b_delivery':
        g.fillStyle(0x64748b, 1);
        g.fillRect(x + 20, y + height - 24, 40, 20);
        g.fillRect(x + width - 60, y + height - 24, 40, 20);
        g.fillStyle(0xb45309, 1);
        g.fillRect(x + 26, y + height - 16, 12, 10);
        g.fillRect(x + width - 50, y + height - 16, 12, 10);
        break;

      case 'b_fuel':
        g.fillStyle(0xeab308, 1);
        g.fillRect(x + 30, y + height + 6, 12, 18);
        g.fillRect(x + width - 42, y + height + 6, 12, 18);
        g.fillStyle(0xd97706, 1);
        g.fillRect(x + 32, y + height + 8, 8, 14);
        g.fillRect(x + width - 40, y + height + 8, 8, 14);
        break;

      case 'b_realestate':
        g.fillStyle(0xf1f5f9, 1);
        g.fillRect(x + 25, y + 48, 10, height - 52);
        g.fillRect(x + 45, y + 48, 10, height - 52);
        g.fillRect(x + width - 55, y + 48, 10, height - 52);
        g.fillRect(x + width - 35, y + 48, 10, height - 52);
        g.lineStyle(2, 0xd4af37, 1);
        g.strokeRect(x + 20, y + 48, 40, height - 52);
        g.strokeRect(x + width - 60, y + 48, 40, height - 52);
        break;

      case 'b_construction':
        g.fillStyle(0xf59e0b, 1);
        for (let i = 0; i < 8; i++) {
          g.fillRect(x + 10 + i * 30, y + height - 16, 14, 6);
        }
        g.fillStyle(0x71717a, 1);
        g.fillRect(x + 20, y + height + 4, 60, 8);
        break;

      case 'b_hotel':
        g.fillStyle(0xd4af37, 1);
        g.fillRect(x + width / 2 - 35, y + height - 10, 6, 22);
        g.fillRect(x + width / 2 + 29, y + height - 10, 6, 22);
        g.fillStyle(0xbe123c, 1);
        g.fillRect(x + width / 2 - 16, y + height - 6, 32, 28);
        break;

      // ── COMMERCIAL DISTRICT PROPS ──────────────────────────────────────────
      case 'b_comm_bank': // Grand financial pillars & gold vault emblem
        g.fillStyle(0xe2e8f0, 1);
        for (let i = 0; i < 6; i++) {
          g.fillRect(x + 25 + i * 38, y + 50, 12, height - 60);
          g.lineStyle(1, 0x94a3b8, 1);
          g.strokeRect(x + 25 + i * 38, y + 50, 12, height - 60);
        }
        // Gold triangular pediment top
        g.fillStyle(0xd4af37, 1);
        g.fillTriangle(x + width / 2, y + 2, x + 20, y + 22, x + width - 20, y + 22);
        break;

      case 'b_comm_tower': // Glass facade floors & communications antenna dish
        g.fillStyle(0x38bdf8, 0.4);
        for (let floor = 0; floor < 4; floor++) {
          g.fillRect(x + 16, y + 48 + floor * 18, width - 32, 12);
        }
        // Rooftop antenna tower
        g.fillStyle(0x0284c7, 1);
        g.fillRect(x + width / 2 - 3, y - 12, 6, 20);
        g.fillStyle(0xef4444, 1);
        g.fillCircle(x + width / 2, y - 14, 4); // Red beacon light
        break;

      case 'b_comm_auto': // Glass showroom with car display silhouettes
        g.fillStyle(0x0ea5e9, 0.3);
        g.fillRect(x + 15, y + height - 32, width - 30, 22);
        g.lineStyle(1, 0x38bdf8, 0.8);
        g.strokeRect(x + 15, y + height - 32, width - 30, 22);
        // Showroom vehicle shapes
        g.fillStyle(0xef4444, 1);
        g.fillRoundedRect(x + 30, y + height - 26, 34, 14, 3);
        g.fillStyle(0x3b82f6, 1);
        g.fillRoundedRect(x + width - 64, y + height - 26, 34, 14, 3);
        break;

      // ── INDUSTRIAL DISTRICT PROPS ──────────────────────────────────────────
      case 'b_ind_brewery': // Fermentation copper kettles & steam vents
        g.fillStyle(0xb45309, 1);
        g.fillCircle(x + 45, y + height / 2 + 10, 22);
        g.fillCircle(x + width - 45, y + height / 2 + 10, 22);
        g.lineStyle(2, 0xd97706, 1);
        g.strokeCircle(x + 45, y + height / 2 + 10, 22);
        g.strokeCircle(x + width - 45, y + height / 2 + 10, 22);
        // Copper piping
        g.fillStyle(0xd97706, 1);
        g.fillRect(x + 45, y + height / 2 + 6, width - 90, 6);
        break;

      case 'b_ind_warehouse': // Dual roller shutter loading bays & pallet racks
        g.fillStyle(0x475569, 1);
        g.fillRect(x + 22, y + height - 28, 54, 24);
        g.fillRect(x + width - 76, y + height - 28, 54, 24);
        g.lineStyle(1, 0xf59e0b, 1);
        g.strokeRect(x + 22, y + height - 28, 54, 24);
        g.strokeRect(x + width - 76, y + height - 28, 54, 24);
        // Horizontal roll-up slats
        g.fillStyle(0x334155, 1);
        for (let s = 0; s < 4; s++) {
          g.fillRect(x + 24, y + height - 26 + s * 6, 50, 2);
          g.fillRect(x + width - 74, y + height - 26 + s * 6, 50, 2);
        }
        break;

      case 'b_ind_solar': // Blue rooftop photovoltaic cell grids
        g.fillStyle(0x1e3a8a, 0.95);
        for (let col = 0; col < 6; col++) {
          g.fillRect(x + 18 + col * 36, y + 50, 28, height - 64);
          g.lineStyle(1, 0x60a5fa, 0.9);
          g.strokeRect(x + 18 + col * 36, y + 50, 28, height - 64);
        }
        break;

      // ── LUXURY DISTRICT PROPS ──────────────────────────────────────────────
      case 'b_lux_marina': // Marina boardwalk deck & nautical yacht berths
        g.fillStyle(0x0284c7, 0.5); // Water basin
        g.fillRect(x + 10, y + height - 20, width - 20, 28);
        // Wooden slip boardwalk
        g.fillStyle(0xb45309, 1);
        g.fillRect(x + 16, y + height - 12, width - 32, 8);
        // Yacht silhouettes in slip
        g.fillStyle(0xffffff, 1);
        g.fillTriangle(x + 40, y + height - 4, x + 30, y + height + 6, x + 50, y + height + 6);
        g.fillTriangle(x + width - 40, y + height - 4, x + width - 50, y + height + 6, x + width - 30, y + height + 6);
        break;

      case 'b_lux_penthouse': // Glass balcony glass & rooftop pool
        g.fillStyle(0x06b6d4, 0.8); // Infinity pool
        g.fillRect(x + width - 70, y + 50, 50, 24);
        g.lineStyle(2, 0xffffff, 0.9);
        g.strokeRect(x + width - 70, y + 50, 50, 24);
        // Glass balustrades
        g.fillStyle(0x38bdf8, 0.4);
        g.fillRect(x + 20, y + height - 24, width - 40, 12);
        g.lineStyle(1, 0xd4af37, 1);
        g.strokeRect(x + 20, y + height - 24, width - 40, 12);
        break;

      case 'b_lux_casino': // Golden marquee stars & velvet red awning
        g.fillStyle(0xd4af37, 1);
        for (let i = 0; i < 7; i++) {
          g.fillCircle(x + 20 + i * 36, y + 8, 4); // Glowing marquee bulb
        }
        // Regal gold & red entrance canopy
        for (let i = 0; i < 8; i++) {
          g.fillStyle(i % 2 === 0 ? 0x991b1b : 0xd4af37, 1);
          g.fillRect(x + width / 2 - 48 + i * 12, y + height - 18, 12, 10);
        }
        break;
    }
  }

  private buildCivicAndResidentialBlocks(blockSize: number, roadWidth: number) {
    const { worldWidth, worldHeight } = this;

    for (let x = roadWidth; x < worldWidth; x += blockSize + roadWidth) {
      for (let y = roadWidth; y < worldHeight; y += blockSize + roadWidth) {
        // Check if any business exists in this block
        const hasBusiness = BUSINESS_DEFINITIONS.some(
          (b) => b.worldX >= x && b.worldX < x + blockSize && b.worldY >= y && b.worldY < y + blockSize
        );

        if (!hasBusiness) {
          // Quadrant 1 (Starter): Central City Park Plaza at (900, 1300)
          if (x < 1800 && y < 1800) {
            if (x === 900 && y === 1300) {
              this.buildCentralPark(x, y, blockSize);
            } else {
              this.buildUrbanResidentialBlock(x, y, blockSize);
            }
          }
          // Quadrant 2 (Commercial): Corporate Plaza or Modern High-Rise
          else if (x >= 1800 && y < 1800) {
            this.buildCommercialCorporatePlaza(x, y, blockSize);
          }
          // Quadrant 3 (Industrial): Heavy Industrial Rail Yard or Storage Silos
          else if (x < 1800 && y >= 1800) {
            this.buildIndustrialStorageBlock(x, y, blockSize);
          }
          // Quadrant 4 (Luxury): Sunken Marble Fountain Garden
          else {
            this.buildLuxuryPromenade(x, y, blockSize);
          }
        }
      }
    }
  }

  private buildCentralPark(x: number, y: number, size: number) {
    const g = this.scene.add.graphics();
    g.fillStyle(0x1e3a29, 1);
    g.fillRect(x + 10, y + 10, size - 20, size - 20);

    g.fillStyle(0x9ca3af, 1);
    g.fillRect(x + size / 2 - 16, y + 10, 32, size - 20);
    g.fillRect(x + 10, y + size / 2 - 16, size - 20, 32);

    g.fillStyle(0x38bdf8, 1);
    g.fillCircle(x + size / 2, y + size / 2, 28);
    g.lineStyle(4, 0xd1d5db, 1);
    g.strokeCircle(x + size / 2, y + size / 2, 28);

    const treePositions = [
      { tx: x + 50, ty: y + 50 },
      { tx: x + size - 50, ty: y + 50 },
      { tx: x + 50, ty: y + size - 50 },
      { tx: x + size - 50, ty: y + size - 50 },
    ];

    treePositions.forEach(({ tx, ty }) => {
      g.fillStyle(0x15803d, 1);
      g.fillCircle(tx, ty, 20);
      g.fillStyle(0x166534, 1);
      g.fillCircle(tx - 4, ty - 4, 14);
    });

    this.scene.add
      .text(x + size / 2, y + 36, 'CENTRAL CITY PLAZA', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#f4f1e8',
      })
      .setOrigin(0.5);
  }

  private buildUrbanResidentialBlock(x: number, y: number, size: number) {
    const g = this.scene.add.graphics();
    g.fillStyle(0x374151, 1);
    g.fillRect(x + 10, y + 10, size - 20, size - 20);

    const houseColors = [0x475569, 0x52525b, 0x3f3f46];
    const unitW = size - 40;
    const unitH = (size - 60) / 2;

    [y + 20, y + 40 + unitH].forEach((unitY, idx) => {
      const color = houseColors[idx % houseColors.length];
      g.fillStyle(0x000000, 0.3);
      g.fillRect(x + 24, unitY + 4, unitW, unitH);

      g.fillStyle(color, 1);
      g.fillRect(x + 20, unitY, unitW, unitH);

      g.lineStyle(2, 0x1f2937, 1);
      g.strokeRect(x + 20, unitY, unitW, unitH);

      g.fillStyle(0x93c5fd, 0.6);
      g.fillRect(x + 35, unitY + 12, 24, 16);
      g.fillRect(x + unitW - 35, unitY + 12, 24, 16);

      const bZone = this.scene.add.zone(x + 20 + unitW / 2, unitY + unitH / 2, unitW, unitH);
      this.scene.physics.add.existing(bZone, true);
      this.buildings.add(bZone);
    });
  }

  private buildCommercialCorporatePlaza(x: number, y: number, size: number) {
    const g = this.scene.add.graphics();
    // Sleek polished slate courtyard
    g.fillStyle(0x1e293b, 1);
    g.fillRect(x + 10, y + 10, size - 20, size - 20);
    g.lineStyle(2, 0x38bdf8, 0.6);
    g.strokeRect(x + 10, y + 10, size - 20, size - 20);

    // Modern glass high-rise towers
    const unitW = size - 50;
    const unitH = (size - 70) / 2;

    [y + 24, y + 48 + unitH].forEach((unitY) => {
      g.fillStyle(0x0f172a, 1);
      g.fillRect(x + 25, unitY, unitW, unitH);
      g.lineStyle(2, 0x0284c7, 0.8);
      g.strokeRect(x + 25, unitY, unitW, unitH);

      // Glass windows grid
      g.fillStyle(0x38bdf8, 0.5);
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 5; c++) {
          g.fillRect(x + 35 + c * 42, unitY + 12 + r * 28, 28, 16);
        }
      }

      const bZone = this.scene.add.zone(x + 25 + unitW / 2, unitY + unitH / 2, unitW, unitH);
      this.scene.physics.add.existing(bZone, true);
      this.buildings.add(bZone);
    });
  }

  private buildIndustrialStorageBlock(x: number, y: number, size: number) {
    const g = this.scene.add.graphics();
    // Rough gravel & industrial apron
    g.fillStyle(0x292524, 1);
    g.fillRect(x + 10, y + 10, size - 20, size - 20);

    // Twin cylindrical grain / oil silos
    g.fillStyle(0x78716c, 1);
    g.fillCircle(x + 70, y + size / 2, 42);
    g.fillCircle(x + size - 70, y + size / 2, 42);
    g.lineStyle(3, 0xf59e0b, 0.9);
    g.strokeCircle(x + 70, y + size / 2, 42);
    g.strokeCircle(x + size - 70, y + size / 2, 42);

    // Center freight shipping container stack
    g.fillStyle(0xb45309, 1);
    g.fillRect(x + size / 2 - 30, y + size / 2 - 40, 60, 80);
    g.lineStyle(2, 0x18181b, 1);
    g.strokeRect(x + size / 2 - 30, y + size / 2 - 40, 60, 80);

    const bZone = this.scene.add.zone(x + size / 2, y + size / 2, size - 40, size - 40);
    this.scene.physics.add.existing(bZone, true);
    this.buildings.add(bZone);
  }

  private buildLuxuryPromenade(x: number, y: number, size: number) {
    const g = this.scene.add.graphics();
    // Manicured lawn & marble walkways
    g.fillStyle(0x064e3b, 1);
    g.fillRect(x + 10, y + 10, size - 20, size - 20);

    // Ornate marble cross promenade
    g.fillStyle(0xf1f5f9, 1);
    g.fillRect(x + size / 2 - 18, y + 10, 36, size - 20);
    g.fillRect(x + 10, y + size / 2 - 18, size - 20, 36);

    // Center gold tiered fountain
    g.fillStyle(0x0284c7, 1);
    g.fillCircle(x + size / 2, y + size / 2, 34);
    g.lineStyle(4, 0xd4af37, 1);
    g.strokeCircle(x + size / 2, y + size / 2, 34);
    g.fillStyle(0xd4af37, 1);
    g.fillCircle(x + size / 2, y + size / 2, 10);

    // Symmetrical Italian cypresses
    const cypressPos = [
      { cx: x + 40, cy: y + 40 },
      { cx: x + size - 40, cy: y + 40 },
      { cx: x + 40, cy: y + size - 40 },
      { cx: x + size - 40, cy: y + size - 40 },
    ];
    cypressPos.forEach(({ cx, cy }) => {
      g.fillStyle(0x065f46, 1);
      g.fillCircle(cx, cy, 16);
      g.fillStyle(0xd4af37, 0.8);
      g.fillCircle(cx, cy, 4);
    });
  }

  private buildStreetDecorations(blockSize: number, roadWidth: number) {
    const { scene, worldWidth, worldHeight } = this;
    const g = scene.add.graphics();
    g.setDepth(1);

    const step = blockSize + roadWidth;
    for (let x = roadWidth; x < worldWidth; x += step) {
      for (let y = roadWidth; y < worldHeight; y += step) {
        // District-specific lamp color
        let lampColor = 0xfef08a; // Warm yellow default (Starter)
        let haloColor = 0xfef08a;

        if (x >= 1800 && y < 1800) {
          lampColor = 0x38bdf8; // Cool cyan LED (Commercial)
          haloColor = 0x38bdf8;
        } else if (x < 1800 && y >= 1800) {
          lampColor = 0xf97316; // Sodium orange vapor (Industrial)
          haloColor = 0xf97316;
        } else if (x >= 1800 && y >= 1800) {
          lampColor = 0xfef08a; // Ornate gold (Luxury)
          haloColor = 0xd4af37;
        }

        // Lamp post
        g.fillStyle(0x334155, 1);
        g.fillRect(x - 14, y - 14, 4, 18);
        g.fillStyle(lampColor, 1);
        g.fillCircle(x - 12, y - 15, 4);
        g.fillStyle(haloColor, 0.12);
        g.fillCircle(x - 12, y - 15, 20);

        // Additional diagonal corner lamp
        g.fillStyle(0x334155, 1);
        g.fillRect(x + 10, y - 14, 4, 18);
        g.fillStyle(lampColor, 1);
        g.fillCircle(x + 12, y - 15, 4);
        g.fillStyle(haloColor, 0.12);
        g.fillCircle(x + 12, y - 15, 20);
      }
    }
  }

  private initAmbientCitizens() {
    const { scene } = this;

    const makeCitizenTexture = (key: string, shirtCol: number, pantsCol: number) => {
      if (scene.textures.exists(key)) return;
      const g = scene.add.graphics();
      g.fillStyle(0xd4956a, 1);
      g.fillCircle(8, 6, 4);
      g.fillStyle(shirtCol, 1);
      g.fillRect(4, 10, 8, 8);
      g.fillStyle(pantsCol, 1);
      g.fillRect(4, 18, 3, 6);
      g.fillRect(9, 18, 3, 6);
      g.generateTexture(key, 16, 26);
      g.destroy();
    };

    makeCitizenTexture('cit_1', 0x2563eb, 0x1e293b);
    makeCitizenTexture('cit_2', 0x16a34a, 0x475569);
    makeCitizenTexture('cit_3', 0xd97706, 0x27272a);
    makeCitizenTexture('cit_4', 0x9333ea, 0x334155);
    makeCitizenTexture('cit_suit', 0x1e293b, 0x0f172a); // Executive in suit
    makeCitizenTexture('cit_worker', 0xf59e0b, 0x374151); // Worker in hi-vis vest

    const patrolRoutes: Array<{
      key: string;
      startX: number;
      startY: number;
      axis: 'x' | 'y';
      minVal: number;
      maxVal: number;
      speed: number;
    }> = [
      // Starter District Citizens
      { key: 'cit_1', startX: 420, startY: 260, axis: 'x', minVal: 400, maxVal: 760, speed: 38 },
      { key: 'cit_2', startX: 1040, startY: 260, axis: 'x', minVal: 1000, maxVal: 1400, speed: 42 },
      { key: 'cit_3', startX: 340, startY: 600, axis: 'y', minVal: 520, maxVal: 820, speed: 35 },
      { key: 'cit_4', startX: 950, startY: 1240, axis: 'x', minVal: 920, maxVal: 1180, speed: 30 },
      { key: 'cit_1', startX: 1340, startY: 1040, axis: 'y', minVal: 980, maxVal: 1220, speed: 36 },
      { key: 'cit_2', startX: 540, startY: 660, axis: 'x', minVal: 480, maxVal: 820, speed: 40 },
      // Commercial District Citizens (Executives & shoppers)
      { key: 'cit_suit', startX: 2120, startY: 260, axis: 'x', minVal: 2050, maxVal: 2450, speed: 36 },
      { key: 'cit_1', startX: 2520, startY: 860, axis: 'x', minVal: 2450, maxVal: 2850, speed: 34 },
      { key: 'cit_suit', startX: 2350, startY: 420, axis: 'y', minVal: 300, maxVal: 650, speed: 32 },
      // Industrial District Citizens (Logistics workers & engineers)
      { key: 'cit_worker', startX: 420, startY: 2260, axis: 'x', minVal: 350, maxVal: 750, speed: 35 },
      { key: 'cit_worker', startX: 1020, startY: 2260, axis: 'x', minVal: 950, maxVal: 1350, speed: 38 },
      { key: 'cit_3', startX: 740, startY: 2450, axis: 'y', minVal: 2200, maxVal: 2650, speed: 30 },
      // Luxury District Citizens (High net-worth visitors)
      { key: 'cit_suit', startX: 2220, startY: 2260, axis: 'x', minVal: 2100, maxVal: 2500, speed: 32 },
      { key: 'cit_4', startX: 2750, startY: 2850, axis: 'x', minVal: 2650, maxVal: 3050, speed: 30 },
      { key: 'cit_suit', startX: 2450, startY: 2350, axis: 'y', minVal: 2150, maxVal: 2550, speed: 28 },
    ];

    patrolRoutes.forEach((r) => {
      const spr = scene.add.sprite(r.startX, r.startY, r.key);
      spr.setDepth(5);
      this.ambientCitizens.push({
        sprite: spr,
        axis: r.axis,
        minVal: r.minVal,
        maxVal: r.maxVal,
        speed: r.speed,
        direction: 1,
        walkTimer: 0,
      });
    });
  }

  public update(delta: number) {
    const sec = delta / 1000;
    this.ambientCitizens.forEach((c) => {
      c.walkTimer += delta * 0.008;
      const wobble = Math.sin(c.walkTimer) * 3;
      c.sprite.setAngle(wobble);

      if (c.axis === 'x') {
        c.sprite.x += c.speed * c.direction * sec;
        if (c.sprite.x > c.maxVal) {
          c.direction = -1;
          c.sprite.setFlipX(true);
        } else if (c.sprite.x < c.minVal) {
          c.direction = 1;
          c.sprite.setFlipX(false);
        }
      } else {
        c.sprite.y += c.speed * c.direction * sec;
        if (c.sprite.y > c.maxVal) {
          c.direction = -1;
        } else if (c.sprite.y < c.minVal) {
          c.direction = 1;
        }
      }
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

  public setUpgradeBadge(businessId: string, level: number): void {
    const def = BUSINESS_DEFINITIONS.find((b) => b.id === businessId);
    if (!def) return;

    const tierLabels = [
      '',
      'Basic',
      '★ LVL 2: EQUIPMENT',
      '★★ LVL 3: FACILITIES',
      '★★★ LVL 4: CAPACITY',
      '★★★★ LVL 5: PREMIUM',
    ];
    const stars = level >= 2 ? tierLabels[level] || `★ LVL ${level}` : '';
    const bx = def.worldX + def.width / 2;
    const by = def.worldY - 14;

    const existing = this.upgradeBadges.get(businessId);
    if (existing) {
      existing.setText(stars);
      existing.setVisible(level >= 2);
      return;
    }

    if (level >= 2) {
      const badge = this.scene.add
        .text(bx, by, stars, {
          fontSize: '11px',
          color: '#F4F1E8',
          backgroundColor: '#1E293B',
          padding: { left: 6, right: 6, top: 3, bottom: 3 },
          stroke: '#B58A45',
          strokeThickness: 2,
          fontStyle: 'bold',
        })
        .setOrigin(0.5, 1)
        .setDepth(12);
      this.upgradeBadges.set(businessId, badge);
    }
  }
}
