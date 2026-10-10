import { useEffect, useState } from 'react';
import { GameComponent } from './game/GameComponent';
import { getGameState, subscribeToGameState, updateGameState, BUSINESS_DEFINITIONS, buyBusiness } from './store/gameState';
import type { BusinessDef } from './store/gameState';
import './App.css';

// Colors:
// Warm off-white: #F4F1E8
// Charcoal: #252923
// Forest green: #315B43
// Concrete gray: #D5D4CD
// Muted ochre: #B58A45
// White: #FFFFFF

function App() {
  const [gameState, setGameState] = useState(getGameState());
  const [isPaused, setIsPaused] = useState(false);
  const [showDirectory, setShowDirectory] = useState(false);
  const [showLedger, setShowLedger] = useState(false);
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

  // Derived stats
  const totalIncomePerMinute = gameState.ownedBusinesses.reduce((total, id) => {
    const b = BUSINESS_DEFINITIONS.find(def => def.id === id);
    return total + (b?.incomePerMinute || 0);
  }, 0);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#252923] text-[#252923] font-sans">
      {/* Phaser Game Layer */}
      <div className="absolute inset-0 z-0">
        <GameComponent />
      </div>

      {/* HUD Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none p-6 flex flex-col justify-between">
        
        {/* Top HUD */}
        <div className="flex justify-between items-start pointer-events-auto">
          {/* Main Dashboard Card */}
          <div className="flex flex-col gap-4">
            <div className="bg-[#FFFFFF] border-2 border-[#D5D4CD] p-5 rounded shadow-sm w-72">
              <h1 className="text-xl font-bold uppercase tracking-wider text-[#252923] mb-4 border-b-2 border-[#D5D4CD] pb-2">STREET TO CEO</h1>
              <div className="flex flex-col gap-3 text-sm font-medium">
                <div className="flex items-center justify-between">
                  <span className="text-[#252923]/70 uppercase text-xs font-bold">Location</span>
                  <span className="font-semibold text-[#252923]">{gameState.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#252923]/70 uppercase text-xs font-bold">Cash</span>
                  <span className="font-bold text-[#315B43] text-base">₦{gameState.cash.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#D5D4CD]">
                  <span className="text-[#252923]/70 uppercase text-xs font-bold">Income/Min</span>
                  <span className="font-bold text-[#315B43]">₦{totalIncomePerMinute.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#252923]/70 uppercase text-xs font-bold">Total Earnings</span>
                  <span className="font-semibold text-[#252923]">₦{gameState.totalEarnings.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#252923]/70 uppercase text-xs font-bold">Businesses Owned</span>
                  <span className="font-semibold text-[#252923]">{gameState.ownedBusinesses.length}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                className="bg-[#FFFFFF] hover:bg-[#F4F1E8] text-[#252923] font-bold py-2 px-4 rounded border-2 border-[#D5D4CD] transition-colors shadow-sm flex-1 text-xs"
                onClick={() => setShowDirectory(true)}
              >
                BUSINESSES
              </button>
              <button 
                className="bg-[#FFFFFF] hover:bg-[#F4F1E8] text-[#252923] font-bold py-2 px-4 rounded border-2 border-[#D5D4CD] transition-colors shadow-sm flex-1 text-xs"
                onClick={() => setShowLedger(true)}
              >
                LEDGER
              </button>
            </div>
          </div>

          {/* Controls Hint & Pause */}
          <div className="flex flex-col items-end gap-2">
            <button 
              className="bg-[#FFFFFF] hover:bg-[#F4F1E8] border-2 border-[#D5D4CD] px-4 py-2 rounded text-sm font-bold tracking-wide text-[#252923] shadow-sm transition-colors"
              onClick={() => setIsPaused(!isPaused)}
            >
              {isPaused ? 'RESUME' : 'PAUSE'}
            </button>
            <div className="bg-[#FFFFFF] border-2 border-[#D5D4CD] p-3 rounded text-xs font-semibold text-[#252923] shadow-sm text-right max-w-[220px]">
              Move with WASD or Arrow Keys<br/>Press E near a business to interact
            </div>
          </div>
        </div>

        {/* Interaction Prompt (Contextual) */}
        {!gameState.panelOpen && gameState.activeInteraction && activeBusiness && (
          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-[#FFFFFF] border-2 border-[#252923] px-6 py-3 rounded-full shadow-md flex items-center gap-3">
            <div className="bg-[#315B43] text-[#FFFFFF] rounded w-8 h-8 flex items-center justify-center font-bold border-2 border-[#252923]">E</div>
            <span className="font-bold text-[#252923]">Press E to inspect {activeBusiness.name}</span>
          </div>
        )}

        {/* Messages */}
        {message && (
          <div className={`absolute top-10 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded shadow-md font-bold border-2 transition-all pointer-events-none z-50 ${message.type === 'error' ? 'bg-[#FFFFFF] border-[#252923] text-red-700' : 'bg-[#315B43] border-[#252923] text-[#FFFFFF]'}`}>
            {message.text}
          </div>
        )}

        {/* Ledger Overlay */}
        {showLedger && !gameState.panelOpen && !showDirectory && (
          <div className="absolute inset-0 bg-[#252923]/80 flex items-center justify-center z-20 pointer-events-auto">
            <div className="bg-[#FFFFFF] border-2 border-[#D5D4CD] p-6 rounded shadow-lg w-full max-w-lg max-h-[80vh] flex flex-col">
              <div className="flex justify-between items-center mb-4 border-b-2 border-[#D5D4CD] pb-4">
                <h2 className="text-xl font-bold uppercase text-[#252923]">Financial Ledger</h2>
                <button 
                  className="bg-[#D5D4CD] hover:bg-[#F4F1E8] text-[#252923] font-bold px-3 py-1 rounded"
                  onClick={() => setShowLedger(false)}
                >
                  CLOSE
                </button>
              </div>
              <div className="overflow-y-auto flex flex-col gap-2">
                {gameState.ledger.length === 0 ? (
                  <div className="text-center p-8 text-[#252923]/70 font-semibold">No transactions yet.</div>
                ) : (
                  gameState.ledger.map((t, idx) => (
                    <div key={idx} className="bg-[#F4F1E8] border border-[#D5D4CD] p-3 rounded flex justify-between items-center text-sm">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#252923]">{t.description}</span>
                        <span className="text-xs text-[#252923]/60">{new Date(t.date).toLocaleTimeString()}</span>
                      </div>
                      <span className={`font-bold ${t.amount > 0 ? 'text-[#315B43]' : 'text-red-700'}`}>
                        {t.amount > 0 ? '+' : ''}₦{t.amount.toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Business Directory Overlay */}
        {showDirectory && !gameState.panelOpen && !showLedger && (
          <div className="absolute inset-0 bg-[#252923]/80 flex items-center justify-center z-20 pointer-events-auto">
            <div className="bg-[#FFFFFF] border-2 border-[#D5D4CD] p-6 rounded shadow-lg w-full max-w-lg max-h-[80vh] flex flex-col">
              <div className="flex justify-between items-center mb-4 border-b-2 border-[#D5D4CD] pb-4">
                <h2 className="text-xl font-bold uppercase text-[#252923]">City Businesses</h2>
                <button 
                  className="bg-[#D5D4CD] hover:bg-[#F4F1E8] text-[#252923] font-bold px-3 py-1 rounded"
                  onClick={() => setShowDirectory(false)}
                >
                  CLOSE
                </button>
              </div>
              <div className="overflow-y-auto flex flex-col gap-3">
                {BUSINESS_DEFINITIONS.map(b => {
                  const owned = gameState.ownedBusinesses.includes(b.id);
                  return (
                    <div key={b.id} className="bg-[#F4F1E8] border-2 border-[#D5D4CD] p-4 rounded flex justify-between items-center">
                      <div>
                        <div className="font-bold text-[#252923] text-lg">{b.name}</div>
                        <div className="text-sm font-semibold text-[#252923]/80 uppercase">{b.type}</div>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <span className={`text-xs font-bold px-2 py-1 rounded border-2 ${owned ? 'text-[#315B43] border-[#315B43] bg-[#315B43]/10' : 'text-[#252923]/60 border-[#D5D4CD]'}`}>
                          {owned ? 'OWNED' : `₦${b.price.toLocaleString()}`}
                        </span>
                        <button 
                          className="text-xs bg-[#B58A45] hover:bg-[#B58A45]/80 text-[#FFFFFF] font-bold px-3 py-2 rounded"
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
          <div className="absolute inset-0 bg-[#252923]/80 flex items-center justify-center z-20 pointer-events-auto">
            <div className="bg-[#FFFFFF] border-2 border-[#D5D4CD] p-8 rounded shadow-lg text-center min-w-[300px]">
              <h2 className="text-2xl font-bold text-[#252923] mb-2 uppercase">PAUSED</h2>
              <p className="text-[#252923]/80 font-semibold mb-6">Take a break, CEO.</p>
              <button 
                className="w-full bg-[#315B43] hover:bg-[#315B43]/90 text-[#FFFFFF] font-bold py-3 px-4 rounded transition-colors"
                onClick={() => setIsPaused(false)}
              >
                RESUME
              </button>
            </div>
          </div>
        )}

        {/* Business Panel Overlay */}
        {gameState.panelOpen && currentPanelBusiness && (
          <div className="absolute inset-0 bg-[#252923]/80 flex items-center justify-center z-30 pointer-events-auto">
            <div className="bg-[#FFFFFF] border-2 border-[#D5D4CD] p-6 rounded shadow-lg w-full max-w-md pointer-events-auto">
              <div className="flex justify-between items-start mb-4 border-b-2 border-[#D5D4CD] pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#252923] leading-tight uppercase">{currentPanelBusiness.name}</h2>
                  <span className="text-sm font-bold text-[#252923]/70 uppercase tracking-wider">{currentPanelBusiness.type}</span>
                </div>
                <div className={`px-3 py-1 rounded text-xs font-bold border-2 ${isOwned ? 'text-[#315B43] border-[#315B43] bg-[#315B43]/10' : 'bg-[#D5D4CD] text-[#252923] border-[#D5D4CD]'}`}>
                  {isOwned ? 'OWNED' : 'FOR SALE'}
                </div>
              </div>
              
              <div className="bg-[#F4F1E8] p-4 rounded border-2 border-[#D5D4CD] mb-6">
                <p className="text-[#252923] font-medium mb-4 text-sm leading-relaxed">{currentPanelBusiness.description}</p>
                
                {!isOwned ? (
                  <div className="flex flex-col gap-2 pt-3 border-t-2 border-[#D5D4CD]">
                    <div className="flex items-center justify-between">
                      <span className="text-[#252923]/80 font-bold uppercase text-xs">Income Rate</span>
                      <span className="font-bold text-[#315B43]">₦{currentPanelBusiness.incomePerMinute.toLocaleString()} / min</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#252923]/80 font-bold uppercase text-xs">Price</span>
                      <span className="text-xl font-bold text-[#252923]">₦{currentPanelBusiness.price.toLocaleString()}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 pt-3 border-t-2 border-[#D5D4CD]">
                    <div className="flex items-center justify-between">
                      <span className="text-[#252923]/80 font-bold uppercase text-xs">Income Rate</span>
                      <span className="font-bold text-[#315B43]">₦{currentPanelBusiness.incomePerMinute.toLocaleString()} / min</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#252923]/80 font-bold uppercase text-xs">Status</span>
                      <span className="font-bold text-[#315B43] uppercase flex items-center gap-2">
                        <span className="block w-2 h-2 rounded-full bg-[#315B43] animate-pulse"></span>
                        Generating Income
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button 
                  className="flex-1 bg-[#D5D4CD] hover:bg-[#D5D4CD]/80 text-[#252923] font-bold py-3 px-4 rounded transition-colors"
                  onClick={closePanel}
                >
                  {isOwned ? 'CLOSE' : 'CANCEL'}
                </button>
                {!isOwned ? (
                  <button 
                    className="flex-1 bg-[#315B43] hover:bg-[#315B43]/90 text-[#FFFFFF] font-bold py-3 px-4 rounded transition-colors"
                    onClick={() => handleBuy(currentPanelBusiness)}
                  >
                    BUY BUSINESS
                  </button>
                ) : (
                  <button 
                    className="flex-1 bg-[#B58A45] hover:bg-[#B58A45]/90 text-[#FFFFFF] font-bold py-3 px-4 rounded transition-colors"
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
