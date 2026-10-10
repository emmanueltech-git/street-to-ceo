import { useEffect, useState } from 'react';
import { GameComponent } from './game/GameComponent';
import { getGameState, subscribeToGameState } from './store/gameState';
import './App.css'; // Just for completeness, but we mainly use tailwind now

function App() {
  const [gameState, setGameState] = useState(getGameState());
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToGameState((newState) => {
      setGameState(newState);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-white font-sans">
      {/* Phaser Game Layer */}
      <div className="absolute inset-0 z-0">
        <GameComponent />
      </div>

      {/* HUD Layer - Pointer events none so it doesn't block game clicks */}
      <div className="absolute inset-0 z-10 pointer-events-none p-4 flex flex-col justify-between">
        
        {/* Top HUD */}
        <div className="flex justify-between items-start pointer-events-auto">
          <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-700 p-4 rounded-xl shadow-lg">
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

          {/* Controls Hint & Pause */}
          <div className="flex flex-col items-end gap-2">
            <button 
              className="bg-zinc-900/80 hover:bg-zinc-800 transition-colors backdrop-blur-md border border-zinc-700 px-4 py-2 rounded-lg text-sm font-bold tracking-wide"
              onClick={() => setIsPaused(!isPaused)}
            >
              {isPaused ? 'RESUME' : 'PAUSE'}
            </button>
            <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-700 p-3 rounded-xl text-xs text-zinc-400 shadow-lg text-right">
              <span className="block mb-1 text-zinc-300 font-semibold">Controls</span>
              W A S D or Arrows to move
            </div>
          </div>
        </div>

        {/* Optional Pause Overlay */}
        {isPaused && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20 pointer-events-auto">
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
      </div>
    </div>
  );
}

export default App;
