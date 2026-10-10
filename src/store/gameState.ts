export interface BusinessDef {
  id: string;
  name: string;
  type: string;
  price: number;
  description: string;
}

export const BUSINESS_DEFINITIONS: BusinessDef[] = [
  { id: 'b_corner', name: 'Corner Shop', type: 'Retail', price: 25000, description: 'A small neighborhood shop.' },
  { id: 'b_restaurant', name: 'Small Restaurant', type: 'Dining', price: 40000, description: 'A cozy diner serving local food.' },
  { id: 'b_clothing', name: 'Clothing Store', type: 'Retail', price: 35000, description: 'A boutique selling trendy clothes.' }
];

export interface Transaction {
  date: string;
  amount: number;
  description: string;
}

export interface GameState {
  cash: number;
  location: string;
  ownedBusinesses: string[];
  ledger: Transaction[];
  activeInteraction: string | null;
  panelOpen: boolean;
}

const DEFAULT_STATE: GameState = {
  cash: 50000,
  location: 'EASTSIDE',
  ownedBusinesses: [],
  ledger: [],
  activeInteraction: null,
  panelOpen: false,
};

let state: GameState = { ...DEFAULT_STATE };

// Save/Load functionality
const SAVE_KEY = 'street_to_ceo_save_v1';

export const loadGame = () => {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      state = { ...DEFAULT_STATE, ...parsed, activeInteraction: null, panelOpen: false };
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
      ledger: state.ledger
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

// Central transaction function
export const buyBusiness = (businessId: string): { success: boolean, message: string } => {
  const def = BUSINESS_DEFINITIONS.find(b => b.id === businessId);
  if (!def) return { success: false, message: 'Business not found.' };

  if (state.ownedBusinesses.includes(businessId)) {
    return { success: false, message: 'You already own this business.' };
  }

  if (state.cash < def.price) {
    return { success: false, message: 'Insufficient funds.' };
  }

  const transaction: Transaction = {
    date: new Date().toISOString(),
    amount: -def.price,
    description: `Purchased ${def.name}`
  };

  updateGameState({
    cash: state.cash - def.price,
    ownedBusinesses: [...state.ownedBusinesses, businessId],
    ledger: [...state.ledger, transaction]
  });
  
  saveGame();

  return { success: true, message: `Successfully purchased ${def.name}!` };
};
