import Phaser from 'phaser';
import { MainScene } from './scenes/MainScene';

export const getGameConfig = (parent: HTMLDivElement): Phaser.Types.Core.GameConfig => ({
  type: Phaser.AUTO,
  width: parent.clientWidth,
  height: parent.clientHeight,
  parent: parent,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0, x: 0 },
      debug: false
    }
  },
  scene: [MainScene],
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  render: {
    pixelArt: true,
    antialias: false
  }
});
