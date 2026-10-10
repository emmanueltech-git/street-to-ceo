export interface GameState {
  cash: number;
  location: string;
}

// Very basic global state just for initial HUD without adding complex state management libraries
let state: GameState = {
  cash: 50000,
  location: 'EASTSIDE',
};

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
