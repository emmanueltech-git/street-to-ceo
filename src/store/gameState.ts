// ─── INTERFACES ──────────────────────────────────────────────────────────────

export interface PropertyBlueprint {
  id: string;
  name: string;
  type: string;
  category: string;
  constructionCost: number;
  incomePerMinute: number;
  operatingCostPerMinute: number;
  description: string;
  accentColor: number;
  roofColor: number;
  signBgColor: number;
}

export interface BusinessDef {
  id: string;
  name: string;
  type: string;
  category: string;
  price: number;
  incomePerMinute: number;
  operatingCostPerMinute: number;
  description: string;
  worldX: number;
  worldY: number;
  width: number;
  height: number;
  accentColor: number;
  roofColor: number;
  signBgColor: number;
  districtId?: string; // 'district_starter' | 'district_commercial' | 'district_industrial' | 'district_luxury'
  isDevelopmentPlot?: boolean;
  developmentOptions?: PropertyBlueprint[];
}

export interface DistrictDef {
  id: string;
  name: string;
  tagline: string;
  description: string;
  accentColor: string;
  themeColorHex: number;
  groundColor: number;
  unlockCost: number;
  requiredPlayerLevel: number;
  requiredBusinessesOwned: number;
  requiredNetWorth: number;
  worldBounds: { minX: number; maxX: number; minY: number; maxY: number };
}

export interface UpgradeTierDef {
  level: number;
  name: string;
  grossMult: number;
  costMult: number;
}

export interface SkinDef {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  headColor: number;
  bodyTopColor: number;
  bodyBottomColor: number;
  shoesColor: number;
  accentColor: number;
  hatType: 'none' | 'cap' | 'traditional';
  hatColor?: number;
}

export interface MilestoneDef {
  id: string;
  name: string;
  description: string;
  xpReward: number;
  condition: (state: GameState) => boolean;
}

export interface Transaction {
  date: string;
  amount: number;
  description: string;
  type?: 'revenue' | 'expense' | 'purchase' | 'upgrade' | 'skin' | 'system';
  businessId?: string;
}

export interface Waypoint {
  x: number;
  y: number;
  name: string;
  businessId: string;
}

export interface GameState {
  cash: number;
  location: string;
  ownedBusinesses: string[];
  ledger: Transaction[];
  activeInteraction: string | null;
  panelOpen: boolean;
  totalEarnings: number;
  totalExpenses: number;
  suspendedBusinesses: string[];
  businessUpgrades: Record<string, number>;
  businessUpgradeSpend: Record<string, number>;
  businessRevenue: Record<string, number>;
  businessExpenses: Record<string, number>;
  unlockedSkins: string[];
  equippedOutfit: string;
  playerXP: number;
  playerLevel: number;
  completedMilestones: string[];
  pendingMilestoneNotifications: string[];
  targetWaypoint: Waypoint | null;
  // Phase 5 Multi-District & Property Development
  unlockedDistricts: string[];
  developedProperties: Record<string, string>; // plotId -> blueprintId
}

// ─── DISTRICT DEFINITIONS ────────────────────────────────────────────────────

export const DISTRICT_DEFINITIONS: DistrictDef[] = [
  {
    id: 'district_starter',
    name: 'Starter District',
    tagline: 'Old Town Commercial Quarter',
    description: 'The bustling historic street core where every empire begins. Features convenience retail, casual dining, local shops, and neighborhood essentials.',
    accentColor: '#315B43',
    themeColorHex: 0x315b43,
    groundColor: 0x233127,
    unlockCost: 0,
    requiredPlayerLevel: 1,
    requiredBusinessesOwned: 0,
    requiredNetWorth: 0,
    worldBounds: { minX: 0, maxX: 1850, minY: 0, maxY: 1750 },
  },
  {
    id: 'district_commercial',
    name: 'Commercial District',
    tagline: 'Downtown Financial Boulevard',
    description: 'A prestigious high-rise sector of corporate law firms, private banks, media towers, and prime commercial developments.',
    accentColor: '#0284c7',
    themeColorHex: 0x0284c7,
    groundColor: 0x1e293b,
    unlockCost: 100000,
    requiredPlayerLevel: 2,
    requiredBusinessesOwned: 2,
    requiredNetWorth: 150000,
    worldBounds: { minX: 1850, maxX: 3600, minY: 0, maxY: 1750 },
  },
  {
    id: 'district_industrial',
    name: 'Industrial District',
    tagline: 'Midland Logistics Basin & Works',
    description: 'Heavy industrial production, mega-warehouses, solar energy factories, and freight hubs supplying the wider metropolis.',
    accentColor: '#d97706',
    themeColorHex: 0xd97706,
    groundColor: 0x292524,
    unlockCost: 250000,
    requiredPlayerLevel: 3,
    requiredBusinessesOwned: 4,
    requiredNetWorth: 400000,
    worldBounds: { minX: 0, maxX: 1850, minY: 1750, maxY: 3600 },
  },
  {
    id: 'district_luxury',
    name: 'Luxury District',
    tagline: 'Waterfront Heights & Sovereign Enclave',
    description: 'Ultra-exclusive private yacht marina, sky penthouses, gaming palaces, and waterfront reserves for multi-millionaires.',
    accentColor: '#b58a45',
    themeColorHex: 0xb58a45,
    groundColor: 0x064e3b,
    unlockCost: 600000,
    requiredPlayerLevel: 5,
    requiredBusinessesOwned: 7,
    requiredNetWorth: 1200000,
    worldBounds: { minX: 1850, maxX: 3600, minY: 1750, maxY: 3600 },
  },
];

// ─── BUSINESS DEFINITIONS ────────────────────────────────────────────────────

export const BUSINESS_DEFINITIONS: BusinessDef[] = [
  // ── STARTER DISTRICT (Original 17 Enterprises Preserved) ───────────────────
  { id:'b_corner',       name:'Corner Shop',            type:'Retail',            category:'Retail & Daily Goods',       price:25000,  incomePerMinute:2000,  operatingCostPerMinute:600,   description:'A neighborhood convenience store stocked with cold beverages, daily groceries, and provisions.',                                     worldX:120,  worldY:120,  width:260, height:120, accentColor:0x315b43, roofColor:0x252923, signBgColor:0x315b43, districtId:'district_starter' },
  { id:'b_restaurant',   name:'Small Restaurant',       type:'Dining',            category:'Food & Hospitality',         price:40000,  incomePerMinute:3500,  operatingCostPerMinute:1100,  description:'A vibrant street diner serving smoky jollof rice, peppered meats, and freshly fried plantains.',                                       worldX:520,  worldY:120,  width:260, height:120, accentColor:0xb58a45, roofColor:0x42281d, signBgColor:0x8b3a2b, districtId:'district_starter' },
  { id:'b_clothing',     name:'Clothing Store',         type:'Retail',            category:'Fashion & Apparel',          price:35000,  incomePerMinute:2800,  operatingCostPerMinute:800,   description:'A contemporary boutique showcasing vibrant native fabrics, streetwear sneakers, and tailoring.',                                       worldX:920,  worldY:120,  width:260, height:120, accentColor:0x3b5266, roofColor:0x22303c, signBgColor:0x2c4a6f, districtId:'district_starter' },
  { id:'b_phone',        name:'Phone Accessories Shop', type:'Tech Retail',       category:'Technology & Gadgets',       price:45000,  incomePerMinute:3600,  operatingCostPerMinute:1200,  description:'Brisk counter selling fast chargers, braided cables, tempered glass shields, and earbuds.',                                             worldX:1320, worldY:120,  width:260, height:120, accentColor:0x0284c7, roofColor:0x0f172a, signBgColor:0x0369a1, districtId:'district_starter' },
  { id:'b_barber',       name:'Barber Shop',            type:'Personal Care',     category:'Local Services',             price:60000,  incomePerMinute:4800,  operatingCostPerMinute:1800,  description:'Trendy neighborhood barbershop humming with Afrobeats, sharp fades, and beard trims.',                                                  worldX:1720, worldY:120,  width:260, height:120, accentColor:0xbe123c, roofColor:0x334155, signBgColor:0x9f1239, districtId:'district_starter' },
  { id:'b_bakery',       name:'Bakery',                 type:'Food Production',   category:'Food & Hospitality',         price:75000,  incomePerMinute:6400,  operatingCostPerMinute:2800,  description:'Commercial bakery oven churning out fluffy Agege loaves, golden meat pies, and donuts.',                                               worldX:120,  worldY:520,  width:260, height:120, accentColor:0xd97706, roofColor:0x451a03, signBgColor:0xb45309, districtId:'district_starter' },
  { id:'b_carwash',      name:'Car Wash',               type:'Auto Services',     category:'Automotive & Logistics',     price:85000,  incomePerMinute:6800,  operatingCostPerMinute:2400,  description:'Active multi-bay jet wash cleaning sedans, commercial minibuses, and luxury SUVs.',                                                    worldX:520,  worldY:520,  width:260, height:120, accentColor:0x0891b2, roofColor:0x164e63, signBgColor:0x0e7490, districtId:'district_starter' },
  { id:'b_farm',         name:'Farm',                   type:'Agriculture',       category:'Agriculture & Food Supply',  price:90000,  incomePerMinute:7200,  operatingCostPerMinute:2800,  description:'Sustainable peri-urban agricultural hub producing organic greens, poultry crates, and tubers.',                                         worldX:920,  worldY:520,  width:260, height:120, accentColor:0x4d7c0f, roofColor:0x27272a, signBgColor:0x3f6212, districtId:'district_starter' },
  { id:'b_gym',          name:'Gym',                    type:'Fitness & Health',  category:'Health & Wellness',          price:100000, incomePerMinute:8000,  operatingCostPerMinute:3200,  description:'Heavy iron fitness center packed with power racks, boxing bags, cardio treadmills, and coaches.',                                        worldX:1320, worldY:520,  width:260, height:120, accentColor:0xeab308, roofColor:0x18181b, signBgColor:0xca8a04, districtId:'district_starter' },
  { id:'b_pharmacy',     name:'Pharmacy',               type:'Healthcare',        category:'Health & Wellness',          price:120000, incomePerMinute:9000,  operatingCostPerMinute:4200,  description:'Certified community chemist dispensing vital prescriptions, supplements, and first-aid supplies.',                                       worldX:1720, worldY:520,  width:260, height:120, accentColor:0x16a34a, roofColor:0x1e293b, signBgColor:0x15803d, districtId:'district_starter' },
  { id:'b_supermarket',  name:'Supermarket',            type:'Grocery Retail',    category:'Retail & Daily Goods',       price:150000, incomePerMinute:12000, operatingCostPerMinute:6000,  description:'Full-service grocery store with checkout scanners, chilled dairy cases, and bulk household aisles.',                                     worldX:120,  worldY:920,  width:260, height:120, accentColor:0x2563eb, roofColor:0x1e3a8a, signBgColor:0x1d4ed8, districtId:'district_starter' },
  { id:'b_electronics',  name:'Electronics Store',      type:'Consumer Tech',     category:'Technology & Gadgets',       price:180000, incomePerMinute:14400, operatingCostPerMinute:6400,  description:'Tech showroom displaying 4K smart screens, solar inverter batteries, laptops, and audio rigs.',                                          worldX:520,  worldY:920,  width:260, height:120, accentColor:0x6366f1, roofColor:0x0f172a, signBgColor:0x4338ca, districtId:'district_starter' },
  { id:'b_delivery',     name:'Delivery Company',       type:'Logistics',         category:'Automotive & Logistics',     price:220000, incomePerMinute:16000, operatingCostPerMinute:8000,  description:'High-speed dispatch depot coordinating motorbikes and courier vans delivering goods citywide.',                                          worldX:920,  worldY:920,  width:260, height:120, accentColor:0xe11d48, roofColor:0x334155, signBgColor:0xbe123c, districtId:'district_starter' },
  { id:'b_fuel',         name:'Fuel Station',           type:'Energy & Fuel',     category:'Infrastructure & Energy',    price:250000, incomePerMinute:20000, operatingCostPerMinute:12000, description:'High-volume petroleum filling station with twin canopy islands, diesel pumps, and mart.',                                                worldX:1320, worldY:920,  width:260, height:120, accentColor:0xd97706, roofColor:0x292524, signBgColor:0xb45309, districtId:'district_starter' },
  { id:'b_realestate',   name:'Real Estate Agency',     type:'Property Brokerage',category:'Corporate & Finance',        price:300000, incomePerMinute:24000, operatingCostPerMinute:10000, description:'Elite property brokerage managing luxury duplex developments, commercial leases, and land deals.',                                       worldX:1720, worldY:920,  width:260, height:120, accentColor:0xb58a45, roofColor:0x1f2937, signBgColor:0x854d0e, districtId:'district_starter' },
  { id:'b_construction', name:'Construction Company',   type:'Civil Works',       category:'Infrastructure & Energy',    price:350000, incomePerMinute:28000, operatingCostPerMinute:16000, description:'Heavy engineering contractor running tower cranes, cement mixing trucks, and roadwork crews.',                                            worldX:120,  worldY:1320, width:260, height:120, accentColor:0xf59e0b, roofColor:0x1c1917, signBgColor:0xd97706, districtId:'district_starter' },
  { id:'b_hotel',        name:'Hotel',                  type:'Hospitality',       category:'Food & Hospitality',         price:400000, incomePerMinute:32000, operatingCostPerMinute:20000, description:'Prestige multi-level hotel palace with luxury suites, banquet halls, and panoramic rooftop dining.',                                     worldX:520,  worldY:1320, width:260, height:130, accentColor:0x315b43, roofColor:0x1e1b4b, signBgColor:0x1e3a8a, districtId:'district_starter' },

  // ── COMMERCIAL DISTRICT (Downtown Financial Boulevard) ────────────────────
  { id:'b_comm_law',     name:'Corporate Law Firm',     type:'Legal Services',    category:'Corporate & Finance',        price:180000, incomePerMinute:16000, operatingCostPerMinute:6800,  description:'Prestige corporate advocacy handling cross-border merger deals, equity agreements, and compliance.',                                    worldX:2050, worldY:150,  width:260, height:120, accentColor:0x0284c7, roofColor:0x0f172a, signBgColor:0x0369a1, districtId:'district_commercial' },
  { id:'b_comm_bank',    name:'Commercial Investment Bank', type:'Banking & Finance', category:'Corporate & Finance',   price:420000, incomePerMinute:34000, operatingCostPerMinute:16000, description:'Full-reserve financial institution offering commercial lines of credit, treasury bonds, and enterprise loans.',                         worldX:2500, worldY:150,  width:260, height:120, accentColor:0x1d4ed8, roofColor:0x1e1b4b, signBgColor:0x1e40af, districtId:'district_commercial' },
  { id:'b_comm_tower',   name:'Metropolitan Media Tower', type:'Media & Tech',    category:'Technology & Media',         price:580000, incomePerMinute:48000, operatingCostPerMinute:22000, description:'Towering headquarters transmitting digital news streams, financial analysis networks, and national advertising.',                        worldX:2950, worldY:150,  width:260, height:120, accentColor:0x6366f1, roofColor:0x0f172a, signBgColor:0x4338ca, districtId:'district_commercial' },
  {
    id:'b_comm_dev',
    name:'Commercial Development Site',
    type:'Development Plot',
    category:'Commercial Development',
    price:150000,
    incomePerMinute:0,
    operatingCostPerMinute:0,
    description:'A surveyed shovel-ready commercial plot in the financial core. Acquire the land to construct an advanced corporate blueprint.',
    worldX:2500, worldY:650, width:260, height:120,
    accentColor:0x475569, roofColor:0x334155, signBgColor:0x1e293b,
    districtId:'district_commercial',
    isDevelopmentPlot:true,
    developmentOptions:[
      { id:'bp_fintech',     name:'Fintech Innovation Hub',  type:'Tech Finance',    category:'Technology & Media',     constructionCost:180000, incomePerMinute:32000, operatingCostPerMinute:12000, description:'High-tech financial incubator operating algorithmic payment switches and crypto settlement rails.', accentColor:0x06b6d4, roofColor:0x0f172a, signBgColor:0x0891b2 },
      { id:'bp_tradecenter', name:'Executive Trade Center',  type:'International Trade', category:'Corporate & Finance', constructionCost:260000, incomePerMinute:42000, operatingCostPerMinute:18000, description:'Global trade clearinghouse coordinating export letters of credit and international commodity swaps.', accentColor:0x2563eb, roofColor:0x1e293b, signBgColor:0x1d4ed8 },
    ]
  },

  // ── INDUSTRIAL DISTRICT (Midland Logistics Basin & Works) ──────────────────
  { id:'b_ind_brewery',   name:'Industrial Beverage Brewery', type:'Heavy Production', category:'Manufacturing & Industrial', price:260000, incomePerMinute:22000, operatingCostPerMinute:10000, description:'High-throughput bottling brewery churning out craft malts, carbonated waters, and bulk beverage kegs.',                                     worldX:150,  worldY:2050, width:260, height:120, accentColor:0xd97706, roofColor:0x292524, signBgColor:0xb45309, districtId:'district_industrial' },
  { id:'b_ind_warehouse', name:'Mega Distribution Warehouse', type:'Logistics Hub',    category:'Automotive & Logistics',    price:380000, incomePerMinute:30000, operatingCostPerMinute:14000, description:'Heavy logistics center with robotic high-bay racking and 18-wheeler cross-docking bays supplying city retail.',                             worldX:600,  worldY:2050, width:260, height:120, accentColor:0x78716c, roofColor:0x1c1917, signBgColor:0x57534e, districtId:'district_industrial' },
  { id:'b_ind_solar',     name:'Solar Assembly Gigafactory',  type:'Clean Energy',     category:'Infrastructure & Energy',   price:650000, incomePerMinute:52000, operatingCostPerMinute:24000, description:'High-tech automated manufacturing plant producing crystalline photovoltaic panels and utility grid batteries.',                           worldX:1050, worldY:2050, width:260, height:120, accentColor:0x059669, roofColor:0x064e3b, signBgColor:0x047857, districtId:'district_industrial' },
  {
    id:'b_ind_dev',
    name:'Industrial Basin Site',
    type:'Development Plot',
    category:'Industrial Development',
    price:200000,
    incomePerMinute:0,
    operatingCostPerMinute:0,
    description:'Heavy-zoned industrial ground ready for specialized manufacturing or high-volume freight logistics infrastructure.',
    worldX:600, worldY:2550, width:260, height:120,
    accentColor:0x57534e, roofColor:0x292524, signBgColor:0x1c1917,
    districtId:'district_industrial',
    isDevelopmentPlot:true,
    developmentOptions:[
      { id:'bp_freight', name:'Intermodal Freight Terminal', type:'Heavy Logistics', category:'Automotive & Logistics', constructionCost:220000, incomePerMinute:38000, operatingCostPerMinute:16000, description:'Rail-to-truck multi-modal logistics terminal expediting container cargo citywide.', accentColor:0x475569, roofColor:0x0f172a, signBgColor:0x334155 },
      { id:'bp_chemlab', name:'Bio-Chemical Refining Plant', type:'Chemical Refining', category:'Manufacturing & Industrial', constructionCost:320000, incomePerMinute:54000, operatingCostPerMinute:22000, description:'Certified industrial plant synthesizing bulk pharmaceutical compounds and specialty agricultural fertilizers.', accentColor:0x059669, roofColor:0x1e1b4b, signBgColor:0x047857 },
    ]
  },

  // ── LUXURY DISTRICT (Waterfront Heights & Sovereign Enclave) ──────────────
  { id:'b_lux_marina',    name:'Royal Yacht Club & Marina', type:'Private Club', category:'Luxury & Leisure', price:850000,  incomePerMinute:68000,  operatingCostPerMinute:30000, description:'Exclusive deepwater private harbor providing luxury superyacht slips, private tender concierge, and waterfront champagne lounge.',               worldX:2050, worldY:2050, width:260, height:120, accentColor:0x0284c7, roofColor:0x082f49, signBgColor:0x0369a1, districtId:'district_luxury' },
  { id:'b_lux_penthouse', name:'Grand Sovereign Penthouse Suites', type:'Ultra Luxury Hospitality', category:'Food & Hospitality', price:1200000, incomePerMinute:96000, operatingCostPerMinute:40000, description:'Top-tier sky suites overlooking the metropolitan skyline with private infinity pools, helicopter pads, and Michelin dining.',    worldX:2500, worldY:2050, width:260, height:120, accentColor:0xb58a45, roofColor:0x1c1917, signBgColor:0x78350f, districtId:'district_luxury' },
  { id:'b_lux_casino',    name:'Crown Royale Casino Palace', type:'Premier Gaming', category:'Luxury & Leisure', price:1800000, incomePerMinute:148000, operatingCostPerMinute:64000, description:'Gleaming palatial private gaming resort frequented by foreign ambassadors, enterprise titans, and high-roller VIPs.',                       worldX:2950, worldY:2050, width:260, height:120, accentColor:0xbe123c, roofColor:0x4c0519, signBgColor:0x9f1239, districtId:'district_luxury' },
  {
    id:'b_lux_dev',
    name:'Waterfront Sovereign Reserve',
    type:'Development Plot',
    category:'Luxury Development',
    price:450000,
    incomePerMinute:0,
    operatingCostPerMinute:0,
    description:'Pristine waterfront shoreline ground reserved for prestigious ultra-high-net-worth leisure and private aviation development.',
    worldX:2500, worldY:2550, width:260, height:120,
    accentColor:0xb58a45, roofColor:0x1c1917, signBgColor:0x78350f,
    districtId:'district_luxury',
    isDevelopmentPlot:true,
    developmentOptions:[
      { id:'bp_islandclub', name:'Private Island Helipad Resort', type:'Ultra Luxury Resort', category:'Luxury & Leisure', constructionCost:600000, incomePerMinute:92000, operatingCostPerMinute:38000, description:'Private island sanctuary with twin helicopter landing pads, private villas, and presidential security.', accentColor:0x0891b2, roofColor:0x064e3b, signBgColor:0x0e7490 },
      { id:'bp_auction',    name:'Sovereign Fine Art Auction House', type:'Fine Art & Rare Assets', category:'Corporate & Finance', constructionCost:850000, incomePerMinute:124000, operatingCostPerMinute:48000, description:'Elite private auction salon orchestrating record-breaking transactions for historic art, rare jewels, and luxury assets.', accentColor:0xb58a45, roofColor:0x292524, signBgColor:0x854d0e },
    ]
  },
];

// ─── UPGRADE SYSTEM ──────────────────────────────────────────────────────────

export const UPGRADE_TIER_DEFS: UpgradeTierDef[] = [
  { level: 1, name: 'Basic Operation',    grossMult: 1.00, costMult: 1.00 },
  { level: 2, name: 'Improved Equipment', grossMult: 1.25, costMult: 0.95 },
  { level: 3, name: 'Better Facilities',  grossMult: 1.60, costMult: 0.88 },
  { level: 4, name: 'Expanded Capacity',  grossMult: 2.00, costMult: 0.80 },
  { level: 5, name: 'Premium Operation',  grossMult: 2.80, costMult: 0.70 },
];

const UPGRADE_COST_MULT = [0, 0, 0.50, 1.25, 2.75, 5.00];

export function getUpgradeCost(businessId: string, toLevel: number): number {
  const def = BUSINESS_DEFINITIONS.find(b => b.id === businessId);
  if (!def || toLevel < 2 || toLevel > 5) return 0;
  return Math.floor(def.price * UPGRADE_COST_MULT[toLevel]);
}

export function getEffectiveRates(businessId: string, level: number): {
  gross: number;
  cost: number;
  net: number;
  capacity: number;
  tierName: string;
} {
  const def = BUSINESS_DEFINITIONS.find(b => b.id === businessId);
  if (!def) return { gross: 0, cost: 0, net: 0, capacity: 0, tierName: 'Basic Operation' };

  let baseGross = def.incomePerMinute;
  let baseCost = def.operatingCostPerMinute;
  let basePrice = def.price;

  // If developed property, pull rates from the selected blueprint
  const bpId = state.developedProperties?.[businessId];
  if (bpId && def.developmentOptions) {
    const bp = def.developmentOptions.find(o => o.id === bpId);
    if (bp) {
      baseGross = bp.incomePerMinute;
      baseCost = bp.operatingCostPerMinute;
      basePrice = def.price + bp.constructionCost;
    }
  }

  const tierIndex = Math.min(Math.max(level, 1), 5) - 1;
  const tier = UPGRADE_TIER_DEFS[tierIndex];
  const gross = Math.floor(baseGross * tier.grossMult);
  const cost  = Math.floor(baseCost * tier.costMult);
  const baseCap = Math.max(20, Math.floor(basePrice / 1500));
  const capMults = [1, 1.4, 2.0, 3.0, 4.5];
  const capacity = Math.floor(baseCap * capMults[tierIndex]);
  return { gross, cost, net: gross - cost, capacity, tierName: tier.name };
}

// ─── ACTIVE BUSINESS DETAILS HELPER ──────────────────────────────────────────

export function getActiveBusinessDetails(businessId: string, st: GameState = getGameState()): BusinessDef | null {
  const def = BUSINESS_DEFINITIONS.find(b => b.id === businessId);
  if (!def) return null;
  const bpId = st.developedProperties?.[businessId];
  if (bpId && def.developmentOptions) {
    const bp = def.developmentOptions.find(b => b.id === bpId);
    if (bp) {
      return {
        ...def,
        name: `${def.name} (${bp.name})`,
        type: bp.type,
        category: bp.category,
        incomePerMinute: bp.incomePerMinute,
        operatingCostPerMinute: bp.operatingCostPerMinute,
        description: bp.description,
        accentColor: bp.accentColor,
        roofColor: bp.roofColor,
        signBgColor: bp.signBgColor,
      };
    }
  }
  return def;
}

// ─── SKIN DEFINITIONS ────────────────────────────────────────────────────────

export const SKIN_DEFINITIONS: SkinDef[] = [
  { id:'skin_street',    name:'Street Hustle',    category:'Outfit', price:0,     description:'Start from the streets. Amber and blue with classic sneakers.',  headColor:0xffaa00, bodyTopColor:0x1565c0, bodyBottomColor:0x1a1a2e, shoesColor:0x37474f, accentColor:0xff6600, hatType:'none' },
  { id:'skin_campus',    name:'Campus Fresh',     category:'Outfit', price:0,     description:'Fresh off campus in green varsity jacket and khaki trousers.',     headColor:0xd4956a, bodyTopColor:0x388e3c, bodyBottomColor:0x795548, shoesColor:0x5d4037, accentColor:0x81c784, hatType:'cap', hatColor:0x212121 },
  { id:'skin_casual',    name:'Casual Citizen',   category:'Outfit', price:0,     description:'Laid-back city resident in charcoal polo and relaxed denim.',      headColor:0xd4956a, bodyTopColor:0x475569, bodyBottomColor:0x334155, shoesColor:0x1e293b, accentColor:0x94a3b8, hatType:'none' },
  { id:'skin_agbada',    name:'Agbada King',      category:'Outfit', price:2000,  description:'Traditional royalty in flowing ceremonial gold and ivory weave.',  headColor:0xffb74d, bodyTopColor:0xffd700, bodyBottomColor:0xfffde7, shoesColor:0x795548, accentColor:0xff8f00, hatType:'traditional', hatColor:0xffd700 },
  { id:'skin_sports',    name:'Sports Boss',      category:'Outfit', price:3000,  description:'Athletic track jacket with matched trainers and snapback cap.',   headColor:0xffaa00, bodyTopColor:0xd32f2f, bodyBottomColor:0x212121, shoesColor:0xf44336, accentColor:0xffd740, hatType:'cap', hatColor:0xd32f2f },
  { id:'skin_beach',     name:'Beach Oga',        category:'Outfit', price:4000,  description:'Tropical resort button-up in canary yellow and ocean teal shorts.',headColor:0xffaa00, bodyTopColor:0xfff176, bodyBottomColor:0x0284c7, shoesColor:0xffd54f, accentColor:0x0288d1, hatType:'cap', hatColor:0x0288d1 },
  { id:'skin_suit',      name:'Corporate Suit',   category:'Outfit', price:5000,  description:'Dressed for the boardroom in bespoke navy wool and white tie.',    headColor:0xd4956a, bodyTopColor:0x1a237e, bodyBottomColor:0x283593, shoesColor:0x0d0d0d, accentColor:0xffffff, hatType:'none' },
  { id:'skin_night',     name:'Night Rider',      category:'Outfit', price:8000,  description:'After-hours velvet bomber jacket in obsidian black and violet.',  headColor:0x5d4037, bodyTopColor:0x212121, bodyBottomColor:0x0d0d0d, shoesColor:0x37474f, accentColor:0x7c4dff, hatType:'none' },
  { id:'skin_tech',      name:'Tech Pioneer',     category:'Outfit', price:12000, description:'Futuristic startup mogul look with cyan accents and sleek kicks.', headColor:0xd4956a, bodyTopColor:0x0f172a, bodyBottomColor:0x1e293b, shoesColor:0x0284c7, accentColor:0x38bdf8, hatType:'none' },
  { id:'skin_ceo',       name:'CEO Mode',         category:'Outfit', price:15000, description:'The pinnacle of executive luxury in charcoal pinstripe and gold.',headColor:0xd4956a, bodyTopColor:0x263238, bodyBottomColor:0x37474f, shoesColor:0x0d0d0d, accentColor:0xb58a45, hatType:'none' },
  { id:'skin_sovereign', name:'Gold Sovereign',   category:'Outfit', price:25000, description:'Pure emerald billionaire regalia trimmed with crown gold embroidery.', headColor:0xffb74d, bodyTopColor:0x064e3b, bodyBottomColor:0x065f46, shoesColor:0x92400e, accentColor:0xfbbf24, hatType:'traditional', hatColor:0xfbbf24 },
];

// ─── MILESTONE / PROGRESSION ─────────────────────────────────────────────────

export const MILESTONES: MilestoneDef[] = [
  { id:'ms_first_biz',     name:'First Steps',        xpReward:50,   description:'Purchase your first business.',                condition:(s)=>s.ownedBusinesses.length>=1 },
  { id:'ms_three_biz',     name:'Growing Empire',     xpReward:100,  description:'Own 3 businesses across the city.',             condition:(s)=>s.ownedBusinesses.length>=3 },
  { id:'ms_five_biz',      name:'Business Mogul',     xpReward:200,  description:'Own 5 businesses across different sectors.',    condition:(s)=>s.ownedBusinesses.length>=5 },
  { id:'ms_ten_biz',       name:'City Tycoon',        xpReward:500,  description:'Own 10 commercial enterprises.',               condition:(s)=>s.ownedBusinesses.length>=10 },
  { id:'ms_all_biz',       name:'Empire Complete',    xpReward:2000, description:'Own all 17 businesses in the starter area.',   condition:(s)=>s.ownedBusinesses.filter(id=>{const d=BUSINESS_DEFINITIONS.find(b=>b.id===id);return (d?.districtId||'district_starter')==='district_starter';}).length>=17 },
  { id:'ms_first_upgrade', name:'Improvement Drive',  xpReward:75,   description:'Upgrade any business to Level 2.',              condition:(s)=>Object.values(s.businessUpgrades||{}).some(l=>l>=2) },
  { id:'ms_level3_upgrade',name:'Facility Manager',   xpReward:150,  description:'Upgrade any business to Level 3.',              condition:(s)=>Object.values(s.businessUpgrades||{}).some(l=>l>=3) },
  { id:'ms_level4_upgrade',name:'Capacity Builder',   xpReward:300,  description:'Upgrade any business to Level 4.',              condition:(s)=>Object.values(s.businessUpgrades||{}).some(l=>l>=4) },
  { id:'ms_max_upgrade',   name:'Premium Standard',   xpReward:500,  description:'Upgrade any business to Level 5 (Premium).',    condition:(s)=>Object.values(s.businessUpgrades||{}).some(l=>l>=5) },
  { id:'ms_cash_100k',     name:'Six Figures',        xpReward:100,  description:'Accumulate ₦100,000 cash balance.',            condition:(s)=>s.cash>=100000 },
  { id:'ms_cash_500k',     name:'Half a Million',     xpReward:250,  description:'Accumulate ₦500,000 cash balance.',            condition:(s)=>s.cash>=500000 },
  { id:'ms_cash_1m',       name:'Millionaire',        xpReward:500,  description:'Hold ₦1,000,000 cash balance.',                condition:(s)=>s.cash>=1000000 },
  { id:'ms_networth_2m',   name:'Corporate Titan',    xpReward:750,  description:'Reach ₦2,000,000 total net worth.',             condition:(s)=>getPlayerNetWorth(s)>=2000000 },
  { id:'ms_earnings_1m',   name:'Million Earned',     xpReward:300,  description:'Earn ₦1,000,000 total gross career revenue.',   condition:(s)=>s.totalEarnings>=1000000 },
  { id:'ms_first_skin',    name:'Style Upgrade',      xpReward:50,   description:'Purchase a character outfit from the shop.',    condition:(s)=>(s.unlockedSkins||[]).some(id=>{const sk=SKIN_DEFINITIONS.find(d=>d.id===id);return sk!=null&&sk.price>0;}) },
  { id:'ms_wardrobe_5',    name:'Fashion Connoisseur',xpReward:250,  description:'Unlock 5 different character outfits.',         condition:(s)=>(s.unlockedSkins||[]).length>=5 },
  { id:'ms_all_skins',     name:'Wardrobe Complete',  xpReward:1000, description:'Own all available character outfits.',         condition:(s)=>(s.unlockedSkins||[]).length>=SKIN_DEFINITIONS.length },
  // Phase 5 Multi-District Milestones
  { id:'ms_unlock_commercial', name:'Commercial Expansion', xpReward:150, description:'Unlock the Downtown Commercial District concession.', condition:(s)=>s.unlockedDistricts.includes('district_commercial') },
  { id:'ms_unlock_industrial', name:'Industrial Mogul',     xpReward:250, description:'Unlock the Midland Industrial District concession.', condition:(s)=>s.unlockedDistricts.includes('district_industrial') },
  { id:'ms_unlock_luxury',     name:'High Society',         xpReward:500, description:'Unlock the Waterfront Luxury District charter.',      condition:(s)=>s.unlockedDistricts.includes('district_luxury') },
  { id:'ms_all_districts',     name:'Master of the City',   xpReward:1000, description:'Unlock all 4 connected city districts.',              condition:(s)=>s.unlockedDistricts.length>=4 },
  { id:'ms_first_dev',         name:'Master Developer',     xpReward:200, description:'Complete construction on a property development site.', condition:(s)=>Object.keys(s.developedProperties||{}).length>=1 },
];

export const PLAYER_LEVEL_TITLES: Record<number, string> = {
  1: 'Street Hustler',
  2: 'Local Apprentice',
  3: 'Small Business Owner',
  4: 'Rising Merchant',
  5: 'Commercial Operator',
  6: 'Corporate Director',
  7: 'District Mogul',
  8: 'Industrial Baron',
  9: 'City Tycoon',
  10: 'Street to CEO',
};

export function getPlayerLevelTitle(level: number): string {
  return PLAYER_LEVEL_TITLES[Math.min(10, Math.max(1, level))] ?? 'Entrepreneur';
}

export function xpForLevel(n: number): number {
  if (n <= 1) return 0;
  return 100 * (n - 1) * (n - 1);
}

export function computePlayerLevel(xp: number): number {
  return Math.min(10, Math.max(1, Math.floor(1 + Math.sqrt(xp / 100))));
}

export function getBusinessValuation(businessId: string, st: GameState): number {
  const def = BUSINESS_DEFINITIONS.find(b => b.id === businessId);
  if (!def) return 0;
  const level        = st.businessUpgrades?.[businessId] ?? 1;
  const upgradeSpend = st.businessUpgradeSpend?.[businessId] ?? 0;
  const netCumul     = (st.businessRevenue?.[businessId] ?? 0) - (st.businessExpenses?.[businessId] ?? 0);
  const eff          = getEffectiveRates(businessId, level);

  let assetBase = def.price;
  const bpId = st.developedProperties?.[businessId];
  if (bpId && def.developmentOptions) {
    const bp = def.developmentOptions.find(b => b.id === bpId);
    if (bp) assetBase += bp.constructionCost;
  }

  const assetValue   = Math.floor(assetBase * (1 + 0.4 * (level - 1))) + upgradeSpend;
  const profitValue  = Math.max(0, Math.floor(netCumul * 0.25)) + Math.max(0, eff.net * 5);
  return assetValue + profitValue;
}

export function getPlayerNetWorth(st: GameState): number {
  const bizValue = (st.ownedBusinesses || []).reduce((sum, id) => sum + getBusinessValuation(id, st), 0);
  return st.cash + bizValue;
}

export interface BusinessFinancialStats {
  purchasePrice: number;
  upgradeSpend: number;
  totalInvestment: number;
  cumulativeGross: number;
  cumulativeOperatingCost: number;
  cumulativeNetProfit: number;
  currentGrossPerMin: number;
  currentOperatingCostPerMin: number;
  currentNetProfitPerMin: number;
  capacity: number;
  level: number;
  tierName: string;
  valuation: number;
  paybackStatus: string;
  paybackMinutes: number | null;
}

export function getBusinessFinancialStats(businessId: string, st: GameState): BusinessFinancialStats {
  const def = BUSINESS_DEFINITIONS.find(b => b.id === businessId);
  const level = st.businessUpgrades?.[businessId] ?? 1;
  const upgradeSpend = st.businessUpgradeSpend?.[businessId] ?? 0;
  const gross = st.businessRevenue?.[businessId] ?? 0;
  const expenses = st.businessExpenses?.[businessId] ?? 0;
  const net = gross - expenses;
  const eff = getEffectiveRates(businessId, level);

  let price = def?.price ?? 0;
  const bpId = st.developedProperties?.[businessId];
  if (bpId && def?.developmentOptions) {
    const bp = def.developmentOptions.find(b => b.id === bpId);
    if (bp) price += bp.constructionCost;
  }

  const totalInvestment = price + upgradeSpend;
  const remainingPayback = totalInvestment - net;

  let paybackStatus: string;
  let paybackMinutes: number | null = null;

  if (net >= totalInvestment && totalInvestment > 0) {
    paybackStatus = 'Recouped (Profitable)';
    paybackMinutes = 0;
  } else if (eff.net > 0) {
    paybackMinutes = Math.ceil(remainingPayback / eff.net);
    paybackStatus = `~${paybackMinutes} mins`;
  } else {
    paybackStatus = def?.isDevelopmentPlot && !bpId ? 'Undeveloped Plot' : 'Operating at loss';
  }

  return {
    purchasePrice: price,
    upgradeSpend,
    totalInvestment,
    cumulativeGross: gross,
    cumulativeOperatingCost: expenses,
    cumulativeNetProfit: net,
    currentGrossPerMin: eff.gross,
    currentOperatingCostPerMin: eff.cost,
    currentNetProfitPerMin: eff.net,
    capacity: eff.capacity,
    level,
    tierName: eff.tierName,
    valuation: getBusinessValuation(businessId, st),
    paybackStatus,
    paybackMinutes,
  };
}

// ─── GAME STATE ──────────────────────────────────────────────────────────────

const DEFAULT_STATE: GameState = {
  cash: 50000,
  location: 'STARTER DISTRICT — OLD TOWN',
  ownedBusinesses: [],
  ledger: [],
  activeInteraction: null,
  panelOpen: false,
  totalEarnings: 0,
  totalExpenses: 0,
  suspendedBusinesses: [],
  businessUpgrades: {},
  businessUpgradeSpend: {},
  businessRevenue: {},
  businessExpenses: {},
  unlockedSkins: ['skin_street', 'skin_campus', 'skin_casual'],
  equippedOutfit: 'skin_street',
  playerXP: 0,
  playerLevel: 1,
  completedMilestones: [],
  pendingMilestoneNotifications: [],
  targetWaypoint: null,
  unlockedDistricts: ['district_starter'],
  developedProperties: {},
};

let state: GameState = { ...DEFAULT_STATE };

// ─── SAVE / LOAD ─────────────────────────────────────────────────────────────

const SAVE_KEY = 'street_to_ceo_save_v2';

export const loadGame = () => {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (!saved) return;
    const p = JSON.parse(saved) as Partial<GameState & Record<string, unknown>>;
    state = {
      ...DEFAULT_STATE,
      ...p,
      totalExpenses:                 typeof p.totalExpenses==='number'           ? p.totalExpenses             : 0,
      suspendedBusinesses:           Array.isArray(p.suspendedBusinesses)        ? p.suspendedBusinesses       : [],
      businessUpgrades:              (p.businessUpgrades && typeof p.businessUpgrades==='object') ? (p.businessUpgrades as Record<string,number>) : {},
      businessUpgradeSpend:          (p.businessUpgradeSpend && typeof p.businessUpgradeSpend==='object') ? (p.businessUpgradeSpend as Record<string,number>) : {},
      businessRevenue:               (p.businessRevenue && typeof p.businessRevenue==='object') ? (p.businessRevenue as Record<string,number>) : {},
      businessExpenses:              (p.businessExpenses && typeof p.businessExpenses==='object') ? (p.businessExpenses as Record<string,number>) : {},
      unlockedSkins:                 Array.isArray(p.unlockedSkins)              ? p.unlockedSkins             : ['skin_street','skin_campus','skin_casual'],
      equippedOutfit:                typeof p.equippedOutfit==='string'          ? p.equippedOutfit            : 'skin_street',
      playerXP:                      typeof p.playerXP==='number'               ? p.playerXP                  : 0,
      playerLevel:                   typeof p.playerLevel==='number'            ? p.playerLevel               : 1,
      completedMilestones:           Array.isArray(p.completedMilestones)       ? p.completedMilestones       : [],
      pendingMilestoneNotifications: Array.isArray(p.pendingMilestoneNotifications) ? p.pendingMilestoneNotifications : [],
      unlockedDistricts:             Array.isArray(p.unlockedDistricts)          ? p.unlockedDistricts         : ['district_starter'],
      developedProperties:           (p.developedProperties && typeof p.developedProperties==='object') ? (p.developedProperties as Record<string,string>) : {},
      // Always reset transient UI state
      activeInteraction: null,
      panelOpen: false,
      targetWaypoint: null,
    };
    // Guarantee free starters
    if (!state.unlockedSkins.includes('skin_street')) state.unlockedSkins.push('skin_street');
    if (!state.unlockedSkins.includes('skin_campus')) state.unlockedSkins.push('skin_campus');
    if (!state.unlockedSkins.includes('skin_casual')) state.unlockedSkins.push('skin_casual');
    if (!state.unlockedDistricts.includes('district_starter')) state.unlockedDistricts.push('district_starter');

    // Prevent legacy lockouts: auto-unlock any district where the player already owns an enterprise
    for (const bId of state.ownedBusinesses) {
      const bDef = BUSINESS_DEFINITIONS.find(b => b.id === bId);
      if (bDef?.districtId && !state.unlockedDistricts.includes(bDef.districtId)) {
        state.unlockedDistricts.push(bDef.districtId);
      }
    }

    // Validate equipped skin
    if (!state.unlockedSkins.includes(state.equippedOutfit)) state.equippedOutfit = 'skin_street';
  } catch (e) {
    console.error('Failed to load save', e);
  }
};

export const saveGame = () => {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      cash: state.cash, location: state.location,
      ownedBusinesses: state.ownedBusinesses,
      ledger: state.ledger.slice(0, 150),
      totalEarnings: state.totalEarnings, totalExpenses: state.totalExpenses,
      suspendedBusinesses: state.suspendedBusinesses,
      businessUpgrades: state.businessUpgrades,
      businessUpgradeSpend: state.businessUpgradeSpend,
      businessRevenue: state.businessRevenue,
      businessExpenses: state.businessExpenses,
      unlockedSkins: state.unlockedSkins, equippedOutfit: state.equippedOutfit,
      playerXP: state.playerXP, playerLevel: state.playerLevel,
      completedMilestones: state.completedMilestones,
      pendingMilestoneNotifications: state.pendingMilestoneNotifications,
      unlockedDistricts: state.unlockedDistricts,
      developedProperties: state.developedProperties,
    }));
  } catch (e) {
    console.error('Failed to save game', e);
  }
};

loadGame();

// ─── REACTIVE STATE ──────────────────────────────────────────────────────────

type Listener = (state: GameState) => void;
const listeners = new Set<Listener>();

export const getGameState  = () => state;
export const updateGameState = (patch: Partial<GameState>) => {
  state = { ...state, ...patch };
  listeners.forEach(fn => fn(state));
};
export const subscribeToGameState = (listener: Listener) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};

// ─── MILESTONE CHECKING ──────────────────────────────────────────────────────

function applyMilestoneCheck(): void {
  const cur = getGameState();
  const newlyCompleted: string[] = [];
  let xpGained = 0;
  for (const m of MILESTONES) {
    if (!cur.completedMilestones.includes(m.id) && m.condition(cur)) {
      newlyCompleted.push(m.id);
      xpGained += m.xpReward;
    }
  }
  if (newlyCompleted.length > 0) {
    const newXP = cur.playerXP + xpGained;
    updateGameState({
      completedMilestones:           [...cur.completedMilestones, ...newlyCompleted],
      pendingMilestoneNotifications: [...cur.pendingMilestoneNotifications, ...newlyCompleted],
      playerXP: newXP,
      playerLevel: computePlayerLevel(newXP),
    });
  }
}

// ─── NAVIGATION ──────────────────────────────────────────────────────────────

export const setTargetWaypoint = (businessId: string) => {
  const def = BUSINESS_DEFINITIONS.find(b => b.id === businessId);
  if (!def) return;
  updateGameState({ targetWaypoint: { x: def.worldX + def.width/2, y: def.worldY + def.height + 25, name: def.name, businessId: def.id } });
};
export const clearTargetWaypoint = () => updateGameState({ targetWaypoint: null });

export const dismissMilestoneNotification = (id: string) => {
  const cur = getGameState();
  updateGameState({ pendingMilestoneNotifications: cur.pendingMilestoneNotifications.filter(m => m !== id) });
  saveGame();
};

// ─── BUY BUSINESS ────────────────────────────────────────────────────────────

export const buyBusiness = (businessId: string): { success: boolean; message: string } => {
  const def = BUSINESS_DEFINITIONS.find(b => b.id === businessId);
  if (!def) return { success:false, message:'Business not found.' };

  // Check district unlock status
  const districtId = def.districtId || 'district_starter';
  if (!state.unlockedDistricts.includes(districtId)) {
    const distDef = DISTRICT_DEFINITIONS.find(d => d.id === districtId);
    return { success:false, message:`District Locked: Acquire the ${distDef?.name || 'district'} concession first.` };
  }

  if (state.ownedBusinesses.includes(businessId)) return { success:false, message:'You already own this business.' };
  if (state.cash < def.price) return { success:false, message:`Need ₦${(def.price-state.cash).toLocaleString()} more.` };

  const newXP = state.playerXP + 15;
  updateGameState({
    cash:            state.cash - def.price,
    ownedBusinesses: [...state.ownedBusinesses, businessId],
    ledger:          [{ date:new Date().toISOString(), amount:-def.price, description:`Purchased ${def.name}`, type:'purchase' as const, businessId }, ...state.ledger].slice(0,150),
    playerXP:        newXP,
    playerLevel:     computePlayerLevel(newXP),
  });
  applyMilestoneCheck();
  saveGame();
  return { success:true, message:`Purchased ${def.name} for ₦${def.price.toLocaleString()}!` };
};

// ─── DISTRICT UNLOCK ─────────────────────────────────────────────────────────

export const unlockDistrict = (districtId: string): { success: boolean; message: string } => {
  const dist = DISTRICT_DEFINITIONS.find(d => d.id === districtId);
  if (!dist) return { success: false, message: 'District not found.' };
  if (state.unlockedDistricts.includes(districtId)) {
    return { success: false, message: `${dist.name} is already unlocked.` };
  }

  // Check requirements
  if (state.playerLevel < dist.requiredPlayerLevel) {
    return { success: false, message: `Requires Player Level ${dist.requiredPlayerLevel} (Current: Lvl ${state.playerLevel}).` };
  }
  if (state.ownedBusinesses.length < dist.requiredBusinessesOwned) {
    return { success: false, message: `Requires owning ${dist.requiredBusinessesOwned} businesses (You own ${state.ownedBusinesses.length}).` };
  }
  const netWorth = getPlayerNetWorth(state);
  if (netWorth < dist.requiredNetWorth) {
    return { success: false, message: `Requires ₦${dist.requiredNetWorth.toLocaleString()} Net Worth (Current: ₦${netWorth.toLocaleString()}).` };
  }
  if (state.cash < dist.unlockCost) {
    return { success: false, message: `Need ₦${(dist.unlockCost - state.cash).toLocaleString()} more cash for the district concession.` };
  }

  const xpReward = 150 + dist.requiredPlayerLevel * 40;
  const newXP = state.playerXP + xpReward;
  const newCash = state.cash - dist.unlockCost;
  const newLedger: Transaction[] = dist.unlockCost > 0
    ? [{ date: new Date().toISOString(), amount: -dist.unlockCost, description: `Acquired ${dist.name} Commercial Concession`, type: 'purchase' as const }, ...state.ledger]
    : state.ledger;

  updateGameState({
    cash: newCash,
    unlockedDistricts: [...state.unlockedDistricts, districtId],
    ledger: newLedger.slice(0, 150),
    playerXP: newXP,
    playerLevel: computePlayerLevel(newXP),
  });
  applyMilestoneCheck();
  saveGame();
  return { success: true, message: `Concession Acquired: ${dist.name} Unlocked! (+${xpReward} XP)` };
};

// ─── PROPERTY DEVELOPMENT ───────────────────────────────────────────────────

export const developProperty = (plotId: string, blueprintId: string): { success: boolean; message: string } => {
  const plot = BUSINESS_DEFINITIONS.find(b => b.id === plotId);
  if (!plot) return { success: false, message: 'Property site not found.' };
  if (!state.ownedBusinesses.includes(plotId)) {
    return { success: false, message: 'You must purchase this development site first.' };
  }
  if (state.developedProperties?.[plotId]) {
    return { success: false, message: 'This property has already been developed.' };
  }

  const bp = plot.developmentOptions?.find(o => o.id === blueprintId);
  if (!bp) return { success: false, message: 'Blueprint not found.' };

  if (state.cash < bp.constructionCost) {
    return { success: false, message: `Need ₦${(bp.constructionCost - state.cash).toLocaleString()} more for construction.` };
  }

  const newXP = state.playerXP + 120;
  const newDeveloped = { ...(state.developedProperties || {}), [plotId]: blueprintId };
  updateGameState({
    cash: state.cash - bp.constructionCost,
    developedProperties: newDeveloped,
    ledger: [{ date: new Date().toISOString(), amount: -bp.constructionCost, description: `Developed ${plot.name}: Constructed ${bp.name}`, type: 'purchase' as const, businessId: plotId }, ...state.ledger].slice(0, 150),
    playerXP: newXP,
    playerLevel: computePlayerLevel(newXP),
  });
  applyMilestoneCheck();
  saveGame();
  return { success: true, message: `Construction Complete: ${bp.name} is now operating!` };
};

// ─── UPGRADE BUSINESS ────────────────────────────────────────────────────────

export const upgradeBusinessLevel = (businessId: string): { success: boolean; message: string } => {
  const def = BUSINESS_DEFINITIONS.find(b => b.id === businessId);
  if (!def)                                       return { success:false, message:'Business not found.' };
  if (!state.ownedBusinesses.includes(businessId)) return { success:false, message:'You do not own this business.' };

  // If un-developed plot, prompt development instead of upgrade
  if (def.isDevelopmentPlot && !state.developedProperties?.[businessId]) {
    return { success: false, message: 'You must construct a development blueprint before upgrading operations.' };
  }

  const currentLevel = state.businessUpgrades?.[businessId] ?? 1;
  if (currentLevel >= 5) return { success:false, message:'Already at maximum level (Premium Operation).' };

  const toLevel = currentLevel + 1;
  const cost    = getUpgradeCost(businessId, toLevel);
  if (state.cash < cost) return { success:false, message:`Need ₦${cost.toLocaleString()} (have ₦${state.cash.toLocaleString()}).` };

  const tierDef   = UPGRADE_TIER_DEFS[toLevel - 1];
  const xpRewards = [0, 0, 15, 25, 40, 75];
  const xpGain    = xpRewards[toLevel] ?? 15;
  const newXP     = state.playerXP + xpGain;

  const newUpgrades     = { ...(state.businessUpgrades     || {}), [businessId]: toLevel };
  const newUpgradeSpend = { ...(state.businessUpgradeSpend || {}) };
  newUpgradeSpend[businessId] = (newUpgradeSpend[businessId] || 0) + cost;

  updateGameState({
    cash:                 state.cash - cost,
    businessUpgrades:     newUpgrades,
    businessUpgradeSpend: newUpgradeSpend,
    ledger:               [{ date:new Date().toISOString(), amount:-cost, description:`Upgraded ${def.name} to Level ${toLevel} (${tierDef.name})`, type:'upgrade' as const, businessId }, ...state.ledger].slice(0,150),
    playerXP:             newXP,
    playerLevel:          computePlayerLevel(newXP),
    suspendedBusinesses:  state.suspendedBusinesses.filter(id => id !== businessId),
  });
  applyMilestoneCheck();
  saveGame();
  return { success:true, message:`${def.name} upgraded to Level ${toLevel}: ${tierDef.name}!` };
};

// ─── SKIN SYSTEM ─────────────────────────────────────────────────────────────

export const buySkin = (skinId: string): { success: boolean; message: string } => {
  const skin = SKIN_DEFINITIONS.find(s => s.id === skinId);
  if (!skin)                                  return { success:false, message:'Skin not found.' };
  if (state.unlockedSkins.includes(skinId))   return { success:false, message:'You already own this outfit.' };
  if (skin.price > 0 && state.cash < skin.price) return { success:false, message:`Need ₦${skin.price.toLocaleString()} (have ₦${state.cash.toLocaleString()}).` };

  const newXP = state.playerXP + 10;
  const newCash = skin.price > 0 ? state.cash - skin.price : state.cash;
  const newLedger: Transaction[] = skin.price > 0
    ? [{ date:new Date().toISOString(), amount:-skin.price, description:`Purchased outfit: ${skin.name}`, type:'skin' as const }, ...state.ledger]
    : state.ledger;

  updateGameState({
    cash:          newCash,
    unlockedSkins: [...state.unlockedSkins, skinId],
    ledger:        newLedger.slice(0, 150),
    playerXP:      newXP,
    playerLevel:   computePlayerLevel(newXP),
  });
  applyMilestoneCheck();
  saveGame();
  return { success:true, message:`Outfit "${skin.name}" unlocked!` };
};

export const equipSkin = (skinId: string): { success: boolean; message: string } => {
  if (!state.unlockedSkins.includes(skinId)) return { success:false, message:'You do not own this outfit.' };
  updateGameState({ equippedOutfit: skinId });
  saveGame();
  return { success:true, message:'Outfit equipped!' };
};

// ─── PASSIVE INCOME LOOP ─────────────────────────────────────────────────────

let incomeInterval: ReturnType<typeof setInterval> | null = null;

export const startIncomeLoop = () => {
  if (incomeInterval !== null) { clearInterval(incomeInterval); incomeInterval = null; }

  incomeInterval = setInterval(() => {
    const cur = getGameState();
    if (!cur.ownedBusinesses || cur.ownedBusinesses.length === 0) return;

    let deltaCash = 0, deltaGross = 0, deltaExpenses = 0;
    const newTx: Transaction[] = [];
    let curCash      = cur.cash;
    let curSuspended = [...(cur.suspendedBusinesses || [])];
    const perBizRev: Record<string,number> = {};
    const perBizExp: Record<string,number> = {};

    cur.ownedBusinesses.forEach(id => {
      const def = BUSINESS_DEFINITIONS.find(b => b.id === id);
      if (!def) return;

      const level     = cur.businessUpgrades?.[id] ?? 1;
      const eff       = getEffectiveRates(id, level);

      // Undeveloped plot generates no cashflow
      if (eff.gross === 0 && eff.cost === 0) return;

      const tGross    = Math.floor(eff.gross / 4);
      const tExpense  = Math.floor(eff.cost  / 4);
      const tNet      = tGross - tExpense;
      const suspended = curSuspended.includes(id);

      if (suspended) {
        if (curCash >= tExpense) {
          curSuspended = curSuspended.filter(s => s !== id);
          curCash += tNet; deltaCash += tNet; deltaGross += tGross; deltaExpenses += tExpense;
          perBizRev[id] = tGross; perBizExp[id] = tExpense;
          newTx.push({ date:new Date().toISOString(), amount:0,        description:`${def.name} Resumed Operations`,                    type:'system',  businessId:id });
          newTx.push({ date:new Date().toISOString(), amount:tGross,   description:`${def.name} Revenue`,                               type:'revenue', businessId:id });
          newTx.push({ date:new Date().toISOString(), amount:-tExpense, description:`${def.name} Operating Cost`,                       type:'expense', businessId:id });
        }
      } else {
        if (curCash + tNet < 0) {
          curSuspended.push(id);
          newTx.push({ date:new Date().toISOString(), amount:0, description:`${def.name} Suspended — need ₦${tExpense.toLocaleString()} for ops`, type:'system', businessId:id });
        } else {
          curCash += tNet; deltaCash += tNet; deltaGross += tGross; deltaExpenses += tExpense;
          perBizRev[id] = tGross; perBizExp[id] = tExpense;
          newTx.push({ date:new Date().toISOString(), amount:tGross,    description:`${def.name} Revenue`,       type:'revenue', businessId:id });
          newTx.push({ date:new Date().toISOString(), amount:-tExpense, description:`${def.name} Operating Cost`, type:'expense', businessId:id });
        }
      }
    });

    if (newTx.length > 0 || curSuspended.length !== (cur.suspendedBusinesses||[]).length) {
      const newBizRev = { ...(cur.businessRevenue  || {}) };
      const newBizExp = { ...(cur.businessExpenses || {}) };
      Object.entries(perBizRev).forEach(([id,v]) => { newBizRev[id] = (newBizRev[id]||0) + v; });
      Object.entries(perBizExp).forEach(([id,v]) => { newBizExp[id] = (newBizExp[id]||0) + v; });

      updateGameState({
        cash:               cur.cash + deltaCash,
        totalEarnings:      (cur.totalEarnings||0) + deltaGross,
        totalExpenses:      (cur.totalExpenses ||0) + deltaExpenses,
        businessRevenue:    newBizRev,
        businessExpenses:   newBizExp,
        suspendedBusinesses: curSuspended,
        ledger:             [...newTx, ...cur.ledger].slice(0, 150),
      });
      applyMilestoneCheck();
      saveGame();
    }
  }, 15000);
};

startIncomeLoop();
