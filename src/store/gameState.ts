export interface BusinessDef {
  id: string;
  name: string;
  type: string;
  price: number;
  incomePerMinute: number; // Gross income per game minute
  operatingCostPerMinute: number; // Operating costs per game minute
  description: string;
  worldX: number;
  worldY: number;
  width: number;
  height: number;
  accentColor: number;
  roofColor: number;
  signBgColor: number;
  category: string;
}

export const BUSINESS_DEFINITIONS: BusinessDef[] = [
  // 3 Original Businesses (Preserved prices & gross incomes, sensible operating costs)
  {
    id: 'b_corner',
    name: 'Corner Shop',
    type: 'Retail',
    category: 'Retail & Daily Goods',
    price: 25000,
    incomePerMinute: 2000, // ₦500 / 15s
    operatingCostPerMinute: 600, // ₦150 / 15s (Net: ₦1,400/min, ₦350/15s)
    description: 'A neighborhood convenience store stocked with cold beverages, daily groceries, and provisions.',
    worldX: 120,
    worldY: 120,
    width: 260,
    height: 120,
    accentColor: 0x315b43,
    roofColor: 0x252923,
    signBgColor: 0x315b43
  },
  {
    id: 'b_restaurant',
    name: 'Small Restaurant',
    type: 'Dining',
    category: 'Food & Hospitality',
    price: 40000,
    incomePerMinute: 3500, // ₦875 / 15s
    operatingCostPerMinute: 1100, // ₦275 / 15s (Net: ₦2,400/min, ₦600/15s)
    description: 'A vibrant street diner serving smoky jollof rice, peppered meats, and freshly fried plantains.',
    worldX: 520,
    worldY: 120,
    width: 260,
    height: 120,
    accentColor: 0xb58a45,
    roofColor: 0x42281d,
    signBgColor: 0x8b3a2b
  },
  {
    id: 'b_clothing',
    name: 'Clothing Store',
    type: 'Retail',
    category: 'Fashion & Apparel',
    price: 35000,
    incomePerMinute: 2800, // ₦700 / 15s
    operatingCostPerMinute: 800, // ₦200 / 15s (Net: ₦2,000/min, ₦500/15s)
    description: 'A contemporary boutique showcasing vibrant native fabrics, streetwear sneakers, and tailoring.',
    worldX: 920,
    worldY: 120,
    width: 260,
    height: 120,
    accentColor: 0x3b5266,
    roofColor: 0x22303c,
    signBgColor: 0x2c4a6f
  },

  // 14 New Businesses (Total 17)
  {
    id: 'b_phone',
    name: 'Phone Accessories Shop',
    type: 'Tech Retail',
    category: 'Technology & Gadgets',
    price: 45000,
    incomePerMinute: 3600, // ₦900 / 15s
    operatingCostPerMinute: 1200, // ₦300 / 15s (Net: ₦2,400/min, ₦600/15s)
    description: 'Brisk counter selling fast chargers, braided cables, tempered glass shields, and earbuds.',
    worldX: 1320,
    worldY: 120,
    width: 260,
    height: 120,
    accentColor: 0x0284c7,
    roofColor: 0x0f172a,
    signBgColor: 0x0369a1
  },
  {
    id: 'b_barber',
    name: 'Barber Shop',
    type: 'Personal Care',
    category: 'Local Services',
    price: 60000,
    incomePerMinute: 4800, // ₦1,200 / 15s
    operatingCostPerMinute: 1800, // ₦450 / 15s (Net: ₦3,000/min, ₦750/15s)
    description: 'Trendy neighborhood barbershop humming with Afrobeats, sharp fades, and beard trims.',
    worldX: 1720,
    worldY: 120,
    width: 260,
    height: 120,
    accentColor: 0xbe123c,
    roofColor: 0x334155,
    signBgColor: 0x9f1239
  },
  {
    id: 'b_bakery',
    name: 'Bakery',
    type: 'Food Production',
    category: 'Food & Hospitality',
    price: 75000,
    incomePerMinute: 6400, // ₦1,600 / 15s
    operatingCostPerMinute: 2800, // ₦700 / 15s (Net: ₦3,600/min, ₦900/15s)
    description: 'Commercial bakery oven churning out fluffy sweet Agege loaves, golden meat pies, and donuts.',
    worldX: 120,
    worldY: 520,
    width: 260,
    height: 120,
    accentColor: 0xd97706,
    roofColor: 0x451a03,
    signBgColor: 0xb45309
  },
  {
    id: 'b_carwash',
    name: 'Car Wash',
    type: 'Auto Services',
    category: 'Automotive & Logistics',
    price: 85000,
    incomePerMinute: 6800, // ₦1,700 / 15s
    operatingCostPerMinute: 2400, // ₦600 / 15s (Net: ₦4,400/min, ₦1,100/15s)
    description: 'Active multi-bay jet wash cleaning sedans, commercial minibuses, and luxury SUVs.',
    worldX: 520,
    worldY: 520,
    width: 260,
    height: 120,
    accentColor: 0x0891b2,
    roofColor: 0x164e63,
    signBgColor: 0x0e7490
  },
  {
    id: 'b_farm',
    name: 'Farm',
    type: 'Agriculture',
    category: 'Agriculture & Food Supply',
    price: 90000,
    incomePerMinute: 7200, // ₦1,800 / 15s
    operatingCostPerMinute: 2800, // ₦700 / 15s (Net: ₦4,400/min, ₦1,100/15s)
    description: 'Sustainable peri-urban agricultural hub producing organic greens, poultry crates, and tubers.',
    worldX: 920,
    worldY: 520,
    width: 260,
    height: 120,
    accentColor: 0x4d7c0f,
    roofColor: 0x27272a,
    signBgColor: 0x3f6212
  },
  {
    id: 'b_gym',
    name: 'Gym',
    type: 'Fitness & Health',
    category: 'Health & Wellness',
    price: 100000,
    incomePerMinute: 8000, // ₦2,000 / 15s
    operatingCostPerMinute: 3200, // ₦800 / 15s (Net: ₦4,800/min, ₦1,200/15s)
    description: 'Heavy iron fitness center packed with power racks, boxing bags, cardio treadmills, and coaches.',
    worldX: 1320,
    worldY: 520,
    width: 260,
    height: 120,
    accentColor: 0xeab308,
    roofColor: 0x18181b,
    signBgColor: 0xca8a04
  },
  {
    id: 'b_pharmacy',
    name: 'Pharmacy',
    type: 'Healthcare',
    category: 'Health & Wellness',
    price: 120000,
    incomePerMinute: 9000, // ₦2,250 / 15s
    operatingCostPerMinute: 4200, // ₦1,050 / 15s (Net: ₦4,800/min, ₦1,200/15s)
    description: 'Certified community chemist dispensing vital prescriptions, supplements, and first-aid supplies.',
    worldX: 1720,
    worldY: 520,
    width: 260,
    height: 120,
    accentColor: 0x16a34a,
    roofColor: 0x1e293b,
    signBgColor: 0x15803d
  },
  {
    id: 'b_supermarket',
    name: 'Supermarket',
    type: 'Grocery Retail',
    category: 'Retail & Daily Goods',
    price: 150000,
    incomePerMinute: 12000, // ₦3,000 / 15s
    operatingCostPerMinute: 6000, // ₦1,500 / 15s (Net: ₦6,000/min, ₦1,500/15s)
    description: 'Full-service grocery store with checkout scanners, chilled dairy cases, and bulk household aisles.',
    worldX: 120,
    worldY: 920,
    width: 260,
    height: 120,
    accentColor: 0x2563eb,
    roofColor: 0x1e3a8a,
    signBgColor: 0x1d4ed8
  },
  {
    id: 'b_electronics',
    name: 'Electronics Store',
    type: 'Consumer Tech',
    category: 'Technology & Gadgets',
    price: 180000,
    incomePerMinute: 14400, // ₦3,600 / 15s
    operatingCostPerMinute: 6400, // ₦1,600 / 15s (Net: ₦8,000/min, ₦2,000/15s)
    description: 'Tech showroom displaying 4K smart screens, solar inverter batteries, laptops, and audio rigs.',
    worldX: 520,
    worldY: 920,
    width: 260,
    height: 120,
    accentColor: 0x6366f1,
    roofColor: 0x0f172a,
    signBgColor: 0x4338ca
  },
  {
    id: 'b_delivery',
    name: 'Delivery Company',
    type: 'Logistics',
    category: 'Automotive & Logistics',
    price: 220000,
    incomePerMinute: 16000, // ₦4,000 / 15s
    operatingCostPerMinute: 8000, // ₦2,000 / 15s (Net: ₦8,000/min, ₦2,000/15s)
    description: 'High-speed dispatch depot coordinating motorbikes and courier vans delivering goods citywide.',
    worldX: 920,
    worldY: 920,
    width: 260,
    height: 120,
    accentColor: 0xe11d48,
    roofColor: 0x334155,
    signBgColor: 0xbe123c
  },
  {
    id: 'b_fuel',
    name: 'Fuel Station',
    type: 'Energy & Fuel',
    category: 'Infrastructure & Energy',
    price: 250000,
    incomePerMinute: 20000, // ₦5,000 / 15s
    operatingCostPerMinute: 12000, // ₦3,000 / 15s (Net: ₦8,000/min, ₦2,000/15s)
    description: 'High-volume petroleum filling station with twin canopy islands, diesel pumps, and mart.',
    worldX: 1320,
    worldY: 920,
    width: 260,
    height: 120,
    accentColor: 0xd97706,
    roofColor: 0x292524,
    signBgColor: 0xb45309
  },
  {
    id: 'b_realestate',
    name: 'Real Estate Agency',
    type: 'Property Brokerage',
    category: 'Corporate & Finance',
    price: 300000,
    incomePerMinute: 24000, // ₦6,000 / 15s
    operatingCostPerMinute: 10000, // ₦2,500 / 15s (Net: ₦14,000/min, ₦3,500/15s)
    description: 'Elite property brokerage managing luxury duplex developments, commercial leases, and land deals.',
    worldX: 1720,
    worldY: 920,
    width: 260,
    height: 120,
    accentColor: 0xb58a45,
    roofColor: 0x1f2937,
    signBgColor: 0x854d0e
  },
  {
    id: 'b_construction',
    name: 'Construction Company',
    type: 'Civil Works',
    category: 'Infrastructure & Energy',
    price: 350000,
    incomePerMinute: 28000, // ₦7,000 / 15s
    operatingCostPerMinute: 16000, // ₦4,000 / 15s (Net: ₦12,000/min, ₦3,000/15s)
    description: 'Heavy engineering contractor running tower cranes, cement mixing trucks, and roadwork crews.',
    worldX: 120,
    worldY: 1320,
    width: 260,
    height: 120,
    accentColor: 0xf59e0b,
    roofColor: 0x1c1917,
    signBgColor: 0xd97706
  },
  {
    id: 'b_hotel',
    name: 'Hotel',
    type: 'Hospitality',
    category: 'Food & Hospitality',
    price: 400000,
    incomePerMinute: 32000, // ₦8,000 / 15s
    operatingCostPerMinute: 20000, // ₦5,000 / 15s (Net: ₦12,000/min, ₦3,000/15s)
    description: 'Prestige multi-level hotel palace with luxury suites, banquet halls, and panoramic rooftop dining.',
    worldX: 520,
    worldY: 1320,
    width: 260,
    height: 130,
    accentColor: 0x315b43,
    roofColor: 0x1e1b4b,
    signBgColor: 0x1e3a8a
  }
];

export interface Transaction {
  date: string;
  amount: number;
  description: string;
  type?: 'revenue' | 'expense' | 'purchase' | 'system';
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
  totalEarnings: number; // Cumulative Gross Revenue
  totalExpenses: number; // Cumulative Operating Expenses
  suspendedBusinesses: string[]; // Businesses suspended due to inability to pay operating costs
  targetWaypoint: Waypoint | null;
}

const DEFAULT_STATE: GameState = {
  cash: 50000,
  location: 'DOWNTOWN COMMERCIAL DISTRICT',
  ownedBusinesses: [],
  ledger: [],
  activeInteraction: null,
  panelOpen: false,
  totalEarnings: 0,
  totalExpenses: 0,
  suspendedBusinesses: [],
  targetWaypoint: null
};

let state: GameState = { ...DEFAULT_STATE };

// Save/Load functionality
const SAVE_KEY = 'street_to_ceo_save_v2';

export const loadGame = () => {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure existing saves migrate safely without data loss
      state = {
        ...DEFAULT_STATE,
        ...parsed,
        totalEarnings: typeof parsed.totalEarnings === 'number' ? parsed.totalEarnings : 0,
        totalExpenses: typeof parsed.totalExpenses === 'number' ? parsed.totalExpenses : 0,
        suspendedBusinesses: Array.isArray(parsed.suspendedBusinesses) ? parsed.suspendedBusinesses : [],
        activeInteraction: null,
        panelOpen: false,
        targetWaypoint: null
      };
    }
  } catch (e) {
    console.error('Failed to load save', e);
  }
};

export const saveGame = () => {
  try {
    const toSave = {
      cash: state.cash,
      location: state.location,
      ownedBusinesses: state.ownedBusinesses,
      ledger: state.ledger.slice(0, 150), // Keep recent transactions
      totalEarnings: state.totalEarnings,
      totalExpenses: state.totalExpenses,
      suspendedBusinesses: state.suspendedBusinesses
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.error('Failed to save game', e);
  }
};

// Initial load
loadGame();

type Listener = (state: GameState) => void;
const listeners = new Set<Listener>();

export const getGameState = () => state;

export const updateGameState = (newState: Partial<GameState>) => {
  state = { ...state, ...newState };
  listeners.forEach((listener) => listener(state));
};

export const subscribeToGameState = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

// Waypoint Navigation helpers
export const setTargetWaypoint = (businessId: string) => {
  const def = BUSINESS_DEFINITIONS.find((b) => b.id === businessId);
  if (!def) return;
  const waypoint: Waypoint = {
    x: def.worldX + def.width / 2,
    y: def.worldY + def.height + 25,
    name: def.name,
    businessId: def.id
  };
  updateGameState({ targetWaypoint: waypoint });
};

export const clearTargetWaypoint = () => {
  updateGameState({ targetWaypoint: null });
};

// Central transaction function
export const buyBusiness = (businessId: string): { success: boolean; message: string } => {
  const def = BUSINESS_DEFINITIONS.find((b) => b.id === businessId);
  if (!def) return { success: false, message: 'Business not found.' };

  if (state.ownedBusinesses.includes(businessId)) {
    return { success: false, message: 'You already own this business.' };
  }

  if (state.cash < def.price) {
    const shortfall = def.price - state.cash;
    return { success: false, message: `Insufficient funds. You need ₦${shortfall.toLocaleString()} more.` };
  }

  const transaction: Transaction = {
    date: new Date().toISOString(),
    amount: -def.price,
    description: `Purchased ${def.name}`,
    type: 'purchase',
    businessId
  };

  updateGameState({
    cash: state.cash - def.price,
    ownedBusinesses: [...state.ownedBusinesses, businessId],
    ledger: [transaction, ...state.ledger].slice(0, 150)
  });

  saveGame();

  return { success: true, message: `Successfully purchased ${def.name} for ₦${def.price.toLocaleString()}!` };
};

// Passive Income & Economy Loop
let incomeInterval: number | null = null;

export const startIncomeLoop = () => {
  if (incomeInterval !== null) {
    clearInterval(incomeInterval);
    incomeInterval = null;
  }

  // Payment interval: exactly 15 seconds (15,000ms)
  // Each 15-second payment calculates:
  // 1. tickGross = incomePerMinute / 4
  // 2. tickExpense = operatingCostPerMinute / 4
  // 3. tickNet = tickGross - tickExpense
  incomeInterval = window.setInterval(() => {
    const currentState = getGameState();
    if (!currentState.ownedBusinesses || currentState.ownedBusinesses.length === 0) {
      return;
    }

    let deltaCash = 0;
    let deltaGross = 0;
    let deltaExpenses = 0;
    const newTransactions: Transaction[] = [];
    let currentCash = currentState.cash;
    let currentSuspended = [...(currentState.suspendedBusinesses || [])];

    currentState.ownedBusinesses.forEach((id) => {
      const def = BUSINESS_DEFINITIONS.find((b) => b.id === id);
      if (!def) return;

      const tickGross = Math.floor(def.incomePerMinute / 4);
      const tickExpense = Math.floor(def.operatingCostPerMinute / 4);
      const tickNet = tickGross - tickExpense;
      const isSuspended = currentSuspended.includes(id);

      if (isSuspended) {
        // Business was suspended due to lack of funds.
        // Check if player now has sufficient cash to cover the operating costs.
        if (currentCash >= tickExpense) {
          // Player can now afford operating expenses: resume business!
          currentSuspended = currentSuspended.filter((sId) => sId !== id);
          currentCash += tickNet;
          deltaCash += tickNet;
          deltaGross += tickGross;
          deltaExpenses += tickExpense;

          newTransactions.push({
            date: new Date().toISOString(),
            amount: 0,
            description: `${def.name} Resumed Operations`,
            type: 'system',
            businessId: id
          });
          newTransactions.push({
            date: new Date().toISOString(),
            amount: tickGross,
            description: `${def.name} Revenue`,
            type: 'revenue',
            businessId: id
          });
          newTransactions.push({
            date: new Date().toISOString(),
            amount: -tickExpense,
            description: `${def.name} Operating Cost`,
            type: 'expense',
            businessId: id
          });
        }
        // If still cannot afford, do not generate income or expense.
      } else {
        // Active business:
        // Policy: Protect against negative cash.
        // If the transaction would cause cash to drop below zero:
        if (currentCash + tickNet < 0) {
          // Suspend operations with visible notice and explanation
          currentSuspended.push(id);
          newTransactions.push({
            date: new Date().toISOString(),
            amount: 0,
            description: `${def.name} Suspended: Insufficient funds for ₦${tickExpense.toLocaleString()} operating costs`,
            type: 'system',
            businessId: id
          });
        } else {
          // Normal profitable operation
          currentCash += tickNet;
          deltaCash += tickNet;
          deltaGross += tickGross;
          deltaExpenses += tickExpense;

          newTransactions.push({
            date: new Date().toISOString(),
            amount: tickGross,
            description: `${def.name} Revenue`,
            type: 'revenue',
            businessId: id
          });
          newTransactions.push({
            date: new Date().toISOString(),
            amount: -tickExpense,
            description: `${def.name} Operating Cost`,
            type: 'expense',
            businessId: id
          });
        }
      }
    });

    if (newTransactions.length > 0 || currentSuspended.length !== (currentState.suspendedBusinesses || []).length) {
      updateGameState({
        cash: currentState.cash + deltaCash,
        totalEarnings: (currentState.totalEarnings || 0) + deltaGross,
        totalExpenses: (currentState.totalExpenses || 0) + deltaExpenses,
        suspendedBusinesses: currentSuspended,
        ledger: [...newTransactions, ...currentState.ledger].slice(0, 150)
      });
      saveGame();
    }
  }, 15000);
};

// Start the loop initially
startIncomeLoop();
