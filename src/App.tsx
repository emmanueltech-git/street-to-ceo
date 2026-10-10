import { useEffect, useState } from 'react';
import { GameComponent } from './game/GameComponent';
import { getGameState, subscribeToGameState, updateGameState, BUSINESS_DEFINITIONS, buyBusiness } from './store/gameState';
import type { BusinessDef } from './store/gameState';
import './App.css'; // Just for completeness, but we mainly use tailwind now

function App() {
  const [gameState, setGameState] = useState(getGameState());
  const [isPaused, setIsPaused] = useState(false);
  const [showDirectory, setShowDirectory] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToGameState((newState) => {
      setGameState(newState);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'e' && gameState.activeInteraction && !gameState.panelOpen && !isPaused) {
        // Prevent default to stop game from taking this input if it somehow leaks
        e.preventDefault();
        updateGameState({ panelOpen: true });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.activeInteraction, gameState.panelOpen, isPaused]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const activeBusiness = gameState.activeInteraction 
    ? BUSINESS_DEFINITIONS.find(b => b.id === gameState.activeInteraction)
    : null;

  // Derive from the currently selected business in the panel (can be from directory or active interaction)
  const currentPanelBusiness = gameState.panelOpen && activeBusiness ? activeBusiness : null;
  const isOwned = currentPanelBusiness ? gameState.ownedBusinesses.includes(currentPanelBusiness.id) : false;

  const handleBuy = (business: BusinessDef) => {
    const result = buyBusiness(business.id);
    if (result.success) {
      setMessage({ text: result.message, type: 'success' });
    } else {
      setMessage({ text: result.message, type: 'error' });
    }
  };

  const closePanel = () => {
    updateGameState({ panelOpen: false });
  };

  const openDirectoryBusiness = (b: BusinessDef) => {
    updateGameState({ activeInteraction: b.id, panelOpen: true });
    setShowDirectory(false);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-white font-sans">
      {/* Phaser Game Layer */}
      <div className="absolute inset-0 z-0">
        <GameComponent />
      </div>

      {/* HUD Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none p-4 flex flex-col justify-between">
        
        {/* Top HUD */}
        <div className="flex justify-between items-start pointer-events-auto">
          <div className="flex flex-col gap-2">
            <div className="bg-zinc-900/90 backdrop-blur-md border border-zinc-700 p-4 rounded-xl shadow-lg">
              <h1 className="text-xl font-bold tracking-wider text-emerald-400 mb-1">STREET TO CEO</h1>
              <div className="flex flex-col gap-1 text-sm font-medium text-zinc-300">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 uppercase text-xs">Location</span>
                  <span>{gameState.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 uppercase text-xs">Cash</span>
                  <span className="text-emerald-300">₦{gameState.cash.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <button 
              className="bg-indigo-600/90 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-xl transition-colors shadow-lg border border-indigo-500/50"
              onClick={() => setShowDirectory(true)}
            >
              BUSINESS DIRECTORY
            </button>
          </div>

          {/* Controls Hint & Pause */}
          <div className="flex flex-col items-end gap-2">
            <button 
              className="bg-zinc-900/90 hover:bg-zinc-800 transition-colors backdrop-blur-md border border-zinc-700 px-4 py-2 rounded-lg text-sm font-bold tracking-wide"
              onClick={() => setIsPaused(!isPaused)}
            >
              {isPaused ? 'RESUME' : 'PAUSE'}
            </button>
            <div className="bg-zinc-900/90 backdrop-blur-md border border-zinc-700 p-3 rounded-xl text-xs text-zinc-300 shadow-lg text-right max-w-[200px]">
              Move with WASD or Arrow Keys &middot; Press E near a business to interact
            </div>
          </div>
        </div>

        {/* Interaction Prompt (Contextual) */}
        {!gameState.panelOpen && gameState.activeInteraction && activeBusiness && (
          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-zinc-900/95 backdrop-blur-md border border-zinc-600 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3">
            <div className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 rounded-md w-8 h-8 flex items-center justify-center font-bold">E</div>
            <span className="font-medium">Press E to inspect {activeBusiness.name}</span>
          </div>
        )}

        {/* Messages */}
        {message && (
          <div className={`absolute top-10 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-2xl font-bold border transition-all pointer-events-none z-50 ${message.type === 'error' ? 'bg-red-900/95 border-red-500 text-red-100' : 'bg-emerald-900/95 border-emerald-500 text-emerald-100'}`}>
            {message.text}
          </div>
        )}

        {/* Business Directory Overlay */}
        {showDirectory && !gameState.panelOpen && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-20 pointer-events-auto">
            <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">City Businesses</h2>
                <button 
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1 rounded-lg"
                  onClick={() => setShowDirectory(false)}
                >
                  CLOSE
                </button>
              </div>
              <div className="overflow-y-auto flex flex-col gap-3">
                {BUSINESS_DEFINITIONS.map(b => {
                  const owned = gameState.ownedBusinesses.includes(b.id);
                  return (
                    <div key={b.id} className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl flex justify-between items-center">
                      <div>
                        <div className="font-bold text-white text-lg">{b.name}</div>
                        <div className="text-sm text-zinc-400">{b.type} &middot; ₦{b.price.toLocaleString()}</div>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <span className={`text-xs font-bold px-2 py-1 rounded border ${owned ? 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10' : 'text-zinc-500 border-zinc-700'}`}>
                          {owned ? 'OWNED' : 'FOR SALE'}
                        </span>
                        <button 
                          className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded"
                          onClick={() => openDirectoryBusiness(b)}
                        >
                          DETAILS
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Optional Pause Overlay */}
        {isPaused && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20 pointer-events-auto">
            <div className="bg-zinc-900 border border-zinc-700 p-8 rounded-2xl shadow-2xl text-center min-w-[300px]">
              <h2 className="text-2xl font-bold text-white mb-2">PAUSED</h2>
              <p className="text-zinc-400 mb-6">Take a break, CEO.</p>
              <button 
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                onClick={() => setIsPaused(false)}
              >
                RESUME
              </button>
            </div>
          </div>
        )}

        {/* Business Panel Overlay */}
        {gameState.panelOpen && currentPanelBusiness && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-30 pointer-events-auto">
            <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white leading-tight">{currentPanelBusiness.name}</h2>
                  <span className="text-sm font-medium text-zinc-400 uppercase tracking-wider">{currentPanelBusiness.type}</span>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${isOwned ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-zinc-800 text-zinc-300 border-zinc-600'}`}>
                  {isOwned ? 'OWNED' : 'FOR SALE'}
                </div>
              </div>
              
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 mb-6">
                <p className="text-zinc-300 mb-4 text-sm leading-relaxed">{currentPanelBusiness.description}</p>
                
                {!isOwned ? (
                  <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                    <span className="text-zinc-400">Price</span>
                    <span className="text-xl font-bold text-emerald-400">₦{currentPanelBusiness.price.toLocaleString()}</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 pt-3 border-t border-zinc-800">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Current Level</span>
                      <span className="font-bold text-white">1</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Status</span>
                      <span className="font-bold text-emerald-400">Operational</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button 
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 px-4 rounded-lg transition-colors border border-zinc-700"
                  onClick={closePanel}
                >
                  {isOwned ? 'CLOSE' : 'CANCEL'}
                </button>
                {!isOwned ? (
                  <button 
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                    onClick={() => handleBuy(currentPanelBusiness)}
                  >
                    BUY BUSINESS
                  </button>
                ) : (
                  <button 
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-[0_0_15px_rgba(79,70,229,0.4)]"
                    onClick={closePanel}
                  >
                    INSPECT (LATER)
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
