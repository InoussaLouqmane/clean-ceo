import Phaser from 'phaser';
import { CameraController } from '../CameraController.js';

// TEMPORAIRE — grille de calibration uniquement.
// Damier de gazon en losanges (palette verrouillée du jeu, mais pas de vrais assets).
// Sert uniquement à valider pan / zoom / inertie de la caméra avant le branchement
// de la vraie carte (voir src/mapLoader.js).

const TILE_WIDTH = 64;
const TILE_HEIGHT = 32;
const GRID_SIZE = 80; // nombre de tuiles par côté — large pour tester le pan sur une bonne distance

const GRASS_COLORS = [0x4c6b3f, 0x6e8f52]; // palette verrouillée (CLAUDE.md)
const GRASS_STROKE = 0x3a5230;
const ORIGIN_COLOR = 0xd05050;

export class CalibrationScene extends Phaser.Scene {
  constructor() {
    super('CalibrationScene');
  }

  create() {
    this._drawCalibrationGrid();
    this._centerCameraOnGrid();

    this.cameraController = new CameraController(this, {
      minZoom: 0.3,
      maxZoom: 2.5,
    });
  }

  update() {
    this.cameraController.update();
  }

  _isoToScreen(col, row) {
    return {
      x: (col - row) * (TILE_WIDTH / 2),
      y: (col + row) * (TILE_HEIGHT / 2),
    };
  }

  // Dessinée une seule fois ici, jamais dans update() : la grille est statique,
  // la redessiner à chaque frame (6400+ losanges) coûterait cher pour rien.
  _drawCalibrationGrid() {
    const graphics = this.add.graphics();

    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const { x, y } = this._isoToScreen(col, row);
        const isOrigin = col === 0 && row === 0;
        const color = isOrigin
          ? ORIGIN_COLOR
          : GRASS_COLORS[(col + row) % 2];

        this._drawDiamond(graphics, x, y, color);
      }
    }
  }

  _drawDiamond(graphics, cx, cy, fillColor) {
    const hw = TILE_WIDTH / 2;
    const hh = TILE_HEIGHT / 2;

    const points = [
      { x: cx, y: cy - hh }, // top
      { x: cx + hw, y: cy }, // right
      { x: cx, y: cy + hh }, // bottom
      { x: cx - hw, y: cy }, // left
    ];

    graphics.fillStyle(fillColor, 1);
    graphics.lineStyle(1, GRASS_STROKE, 0.4);
    graphics.beginPath();
    graphics.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      graphics.lineTo(points[i].x, points[i].y);
    }
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();
  }

  // La projection iso (x = (col-row)*hw, y = (col+row)*hh) est symétrique en x
  // autour de 0, mais PAS en y : y ne prend que des valeurs positives (0 au coin
  // col=0/row=0, jusqu'à 2*(GRID_SIZE-1)*hh au coin opposé). Calculer la bounding
  // box à partir des 4 coins réels plutôt que de supposer un centrage sur (0,0) —
  // sinon les bornes de caméra coupent l'extrémité basse du plateau tout en
  // autorisant un vide au-dessus qui ne contient aucune tuile.
  _computeGridBounds() {
    const hw = TILE_WIDTH / 2;
    const hh = TILE_HEIGHT / 2;
    const corners = [
      this._isoToScreen(0, 0),
      this._isoToScreen(GRID_SIZE - 1, 0),
      this._isoToScreen(0, GRID_SIZE - 1),
      this._isoToScreen(GRID_SIZE - 1, GRID_SIZE - 1),
    ];
    const xs = corners.map((p) => p.x);
    const ys = corners.map((p) => p.y);

    return {
      minX: Math.min(...xs) - hw,
      maxX: Math.max(...xs) + hw,
      minY: Math.min(...ys) - hh,
      maxY: Math.max(...ys) + hh,
    };
  }

  _centerCameraOnGrid() {
    const { minX, maxX, minY, maxY } = this._computeGridBounds();

    this.cameras.main.centerOn((minX + maxX) / 2, (minY + maxY) / 2);

    // Bornes généreuses autour de la grille pour laisser de la marge au pan/inertie.
    const margin = TILE_WIDTH * 6;
    this.cameras.main.setBounds(
      minX - margin,
      minY - margin,
      maxX - minX + margin * 2,
      maxY - minY + margin * 2
    );
  }
}
