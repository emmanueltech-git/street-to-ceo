import Phaser from 'phaser';

export class CityEnvironment {
  private scene: Phaser.Scene;
  public buildings: Phaser.Physics.Arcade.StaticGroup;
  public worldWidth = 2000;
  public worldHeight = 2000;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.buildings = this.scene.physics.add.staticGroup();
    this.interactionZones = this.scene.physics.add.staticGroup();
  }

  public interactionZones: Phaser.Physics.Arcade.StaticGroup;

  build() {
    const { scene, worldWidth, worldHeight } = this;
    
    // Set bounds
    scene.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    // Create a base texture for grass/ground
    const bgGraphics = scene.add.graphics();
    bgGraphics.fillStyle(0x2a3d32, 1);
    bgGraphics.fillRect(0, 0, worldWidth, worldHeight);

    // Draw some roads
    const roadGraphics = scene.add.graphics();
    roadGraphics.fillStyle(0x333333, 1);
    
    // Sidewalks
    const sidewalkGraphics = scene.add.graphics();
    sidewalkGraphics.fillStyle(0x777777, 1);

    // Procedural simple city grid
    const blockSize = 300;
    const roadWidth = 100;
    const sidewalkWidth = 20;

    for (let x = 0; x < worldWidth; x += blockSize + roadWidth) {
      // Vertical roads and sidewalks
      sidewalkGraphics.fillRect(x - sidewalkWidth, 0, roadWidth + sidewalkWidth * 2, worldHeight);
      roadGraphics.fillRect(x, 0, roadWidth, worldHeight);
      
      // Road markings
      roadGraphics.fillStyle(0xffffff, 1);
      for (let markY = 0; markY < worldHeight; markY += 40) {
        roadGraphics.fillRect(x + roadWidth / 2 - 2, markY, 4, 20);
      }
      roadGraphics.fillStyle(0x333333, 1);
    }

    for (let y = 0; y < worldHeight; y += blockSize + roadWidth) {
      // Horizontal roads and sidewalks
      sidewalkGraphics.fillRect(0, y - sidewalkWidth, worldWidth, roadWidth + sidewalkWidth * 2);
      roadGraphics.fillRect(0, y, worldWidth, roadWidth);
      
      // Road markings
      roadGraphics.fillStyle(0xffffff, 1);
      for (let markX = 0; markX < worldWidth; markX += 40) {
        roadGraphics.fillRect(markX, y + roadWidth / 2 - 2, 20, 4);
      }
      roadGraphics.fillStyle(0x333333, 1);
    }

    // Build regular commercial buildings and shops in the blocks
    // Also place our 3 specific businesses at known locations
    let placedCorner = false;
    let placedRest = false;
    let placedCloth = false;

    for (let x = roadWidth; x < worldWidth; x += blockSize + roadWidth) {
      for (let y = roadWidth; y < worldHeight; y += blockSize + roadWidth) {
        // We are inside a block. Let's create a few buildings
        if (!placedCorner && x > 200 && y > 200) {
          this.createSpecificBusiness(x + 20, y + 20, blockSize - 40, blockSize / 2 - 30, 'Corner Shop', 'b_corner');
          placedCorner = true;
        } else if (!placedRest && x > 600 && y > 200) {
          this.createSpecificBusiness(x + 20, y + 20, blockSize - 40, blockSize / 2 - 30, 'Small Restaurant', 'b_restaurant');
          placedRest = true;
        } else if (!placedCloth && x > 200 && y > 600) {
          this.createSpecificBusiness(x + 20, y + 20, blockSize - 40, blockSize / 2 - 30, 'Clothing Store', 'b_clothing');
          placedCloth = true;
        } else {
          this.createBuilding(x + 20, y + 20, blockSize - 40, blockSize / 2 - 30);
        }
        
        this.createBuilding(x + 20, y + blockSize / 2 + 10, blockSize - 40, blockSize / 2 - 30);
      }
    }
  }

  private createSpecificBusiness(x: number, y: number, width: number, height: number, name: string, id: string) {
    this.createBuilding(x, y, width, height, 0xf4a261); // Special color
    
    // Add a text label
    this.scene.add.text(x + width / 2, y + height / 2, name, {
      fontFamily: 'sans-serif',
      fontSize: '16px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    // Add interaction zone near the entrance (bottom)
    const zoneWidth = 80;
    const zoneHeight = 40;
    const interactZone = this.scene.add.zone(x + width / 2, y + height + zoneHeight / 2, zoneWidth, zoneHeight);
    this.scene.physics.add.existing(interactZone, true);
    
    // Add ID to data so we know which business it is
    interactZone.setData('businessId', id);
    this.interactionZones.add(interactZone);
  }

  private createBuilding(x: number, y: number, width: number, height: number, forceColor?: number) {
    const bGraphics = this.scene.add.graphics();
    // Shadow
    bGraphics.fillStyle(0x000000, 0.3);
    bGraphics.fillRect(x + 5, y + 5, width, height);
    
    // Main building color (randomized a bit for variety)
    const colors = [0x5c6b73, 0x8f9b9f, 0x3d5a80, 0x98c1d9];
    const color = forceColor !== undefined ? forceColor : colors[Math.floor(Math.random() * colors.length)];
    bGraphics.fillStyle(color, 1);
    bGraphics.fillRect(x, y, width, height);
    
    // Roof detail
    bGraphics.lineStyle(2, 0x000000, 0.2);
    bGraphics.strokeRect(x + 10, y + 10, width - 20, height - 20);
    
    // Entrance representation (usually facing nearest road)
    bGraphics.fillStyle(0x293241, 1);
    bGraphics.fillRect(x + width / 2 - 15, y + height - 5, 30, 5); // Bottom entrance

    // Convert to texture/sprite so physics can be applied (simple way without saving to cache, or just use Zone)
    // Using a physics zone for collision is cheaper
    const buildingZone = this.scene.add.zone(x + width / 2, y + height / 2, width, height);
    this.scene.physics.add.existing(buildingZone, true);
    this.buildings.add(buildingZone);
  }
}
