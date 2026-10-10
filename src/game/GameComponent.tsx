import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { getGameConfig } from './config';

export function GameComponent() {
  const gameRef = useRef<HTMLDivElement>(null);
  const [game, setGame] = useState<Phaser.Game | null>(null);

  useEffect(() => {
    if (!gameRef.current) return;
    
    // Only initialize once
    if (game) return;

    const newGame = new Phaser.Game(getGameConfig(gameRef.current));
    setGame(newGame);

    return () => {
      // Clean up game instance when component unmounts
      newGame.destroy(true);
      setGame(null);
    };
  }, []);

  return <div id="game-container" ref={gameRef} className="w-full h-full" />;
}
