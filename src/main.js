import Phaser from 'phaser';
import { CalibrationScene } from './scenes/CalibrationScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#1b1712',
  scale: {
    // RESIZE fait correspondre le canvas à la taille de son parent en continu.
    // Ne pas combiner avec autoCenter (prévu pour FIT/ENVELOP) : les deux ensemble
    // laissaient le canvas à sa taille initiale, centré, au lieu de remplir l'écran.
    mode: Phaser.Scale.RESIZE,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  scene: [CalibrationScene],
};

const game = new Phaser.Game(config);

window.addEventListener('resize', () => {
  game.scale.resize(window.innerWidth, window.innerHeight);
});
