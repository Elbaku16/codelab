import Phaser from 'phaser';
import type { Condition, Direction } from '../types';
import type { GameImages } from './art';
import type { RobotExecutor } from './interpreter';
import { World, type ParsedLevel } from './world';

export const TILE = 80;
export const PAD = 24;

const ANGLE: Record<Direction, number> = { right: 0, down: 90, left: 180, up: 270 };

export interface SceneEvents {
  onStar?: (left: number) => void;
}

/**
 * Escena de Phaser: dibuja el escenario cuadriculado y anima al robot.
 * Implementa RobotExecutor para que el intérprete de Blockly la controle.
 */
export class RobotScene extends Phaser.Scene implements RobotExecutor {
  private world: World;
  private images: GameImages;
  private robot!: Phaser.GameObjects.Container;
  private robotSprite!: Phaser.GameObjects.Image;
  private arrow!: Phaser.GameObjects.Container;
  private starSprites: Phaser.GameObjects.Image[] = [];
  private pending = new Set<() => void>();
  private events_: SceneEvents;
  private idleTween?: Phaser.Tweens.Tween;
  speed = 1;
  readyPromise: Promise<void>;
  private resolveReady!: () => void;

  constructor(level: ParsedLevel, images: GameImages, events: SceneEvents = {}) {
    super({ key: 'robot' });
    this.world = new World(level);
    this.images = images;
    this.events_ = events;
    this.readyPromise = new Promise((r) => (this.resolveReady = r));
  }

  static size(level: ParsedLevel) {
    return { width: level.cols * TILE + PAD * 2, height: level.rows * TILE + PAD * 2 };
  }

  private cell(x: number, y: number) {
    return { x: PAD + x * TILE + TILE / 2, y: PAD + y * TILE + TILE / 2 };
  }

  create() {
    for (const [key, img] of Object.entries(this.images)) {
      if (!this.textures.exists(key)) this.textures.addImage(key, img);
    }
    this.makeSparkTexture();

    const { cols, rows, rocks, stars, goal } = this.world.level;
    const w = cols * TILE;
    const h = rows * TILE;

    // Tablero
    const g = this.add.graphics();
    g.fillStyle(0x312e81, 0.25);
    g.fillRoundedRect(PAD - 10, PAD - 4, w + 20, h + 20, 22);
    g.fillStyle(0xede9fe, 1);
    g.fillRoundedRect(PAD - 10, PAD - 10, w + 20, h + 20, 22);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const light = (x + y) % 2 === 0;
        g.fillStyle(light ? 0xffffff : 0xf5f3ff, 1);
        g.fillRoundedRect(PAD + x * TILE + 3, PAD + y * TILE + 3, TILE - 6, TILE - 6, 12);
        g.lineStyle(2, 0xddd6fe, 1);
        g.strokeRoundedRect(PAD + x * TILE + 3, PAD + y * TILE + 3, TILE - 6, TILE - 6, 12);
      }
    }

    // Meta
    if (goal) {
      const p = this.cell(goal.x, goal.y);
      const glow = this.add.circle(p.x, p.y, 30, 0xf9a8d4, 0.45);
      this.tweens.add({ targets: glow, scale: 1.25, alpha: 0.15, yoyo: true, repeat: -1, duration: 900 });
      this.add.image(p.x + 4, p.y - 2, 'flag').setDisplaySize(64, 64);
    }

    // Rocas
    rocks.forEach((r) => {
      const p = this.cell(r.x, r.y);
      this.add.image(p.x, p.y, 'rock').setDisplaySize(66, 66);
    });

    // Estrellas
    this.starSprites = stars.map((s, i) => {
      const p = this.cell(s.x, s.y);
      const img = this.add.image(p.x, p.y, 'star').setDisplaySize(52, 52);
      this.tweens.add({
        targets: img,
        y: p.y - 6,
        angle: { from: -6, to: 6 },
        yoyo: true,
        repeat: -1,
        duration: 1000 + i * 120,
        ease: 'Sine.easeInOut',
      });
      return img;
    });

    // Robot + flecha de orientación
    this.arrow = this.add.container(0, 0);
    const arrowG = this.add.graphics();
    arrowG.fillStyle(0x7c3aed, 0.9);
    arrowG.fillTriangle(34, -11, 34, 11, 50, 0);
    this.arrow.add(arrowG);

    this.robotSprite = this.add.image(0, 0, 'robot').setDisplaySize(70, 70);
    this.robot = this.add.container(0, 0, [this.arrow, this.robotSprite]);
    this.placeRobot();
    this.startIdle();

    this.resolveReady();
  }

  private makeSparkTexture() {
    if (this.textures.exists('spark')) return;
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(8, 8, 8);
    g.generateTexture('spark', 16, 16);
    g.destroy();
  }

  private startIdle() {
    this.idleTween?.stop();
    this.robotSprite.y = 0;
    this.idleTween = this.tweens.add({
      targets: this.robotSprite,
      y: -3,
      yoyo: true,
      repeat: -1,
      duration: 700,
      ease: 'Sine.easeInOut',
    });
  }

  private placeRobot() {
    const p = this.cell(this.world.pos.x, this.world.pos.y);
    this.robot.setPosition(p.x, p.y);
    this.arrow.setAngle(ANGLE[this.world.dir]);
    this.robotSprite.setFlipX(this.world.dir === 'left');
    this.robotSprite.setAngle(0);
    this.robotSprite.clearTint();
  }

  private tween(config: Phaser.Types.Tweens.TweenBuilderConfig): Promise<void> {
    return new Promise((resolve) => {
      const done = () => {
        this.pending.delete(done);
        resolve();
      };
      this.pending.add(done);
      this.tweens.add({ ...config, duration: (config.duration as number) / this.speed, onComplete: done });
    });
  }

  /** Vuelve el nivel a su estado inicial. */
  resetLevel() {
    this.tweens.killTweensOf([this.robot, this.robotSprite, this.arrow]);
    this.pending.forEach((fn) => fn());
    this.pending.clear();
    this.world.reset();
    this.starSprites.forEach((s) => s.setVisible(true).setAlpha(1).setScale(52 / 128));
    this.placeRobot();
    this.startIdle();
  }

  // ---------- RobotExecutor ----------

  async move(): Promise<boolean> {
    const from = this.cell(this.world.pos.x, this.world.pos.y);
    const result = this.world.move();
    if (result.crashed) {
      await this.bump(from);
      return false;
    }
    const to = this.cell(this.world.pos.x, this.world.pos.y);
    await Promise.all([
      this.tween({ targets: this.robot, x: to.x, y: to.y, duration: 380, ease: 'Quad.easeInOut' }),
      this.tween({ targets: this.robotSprite, scaleY: this.robotSprite.scaleY * 0.9, yoyo: true, duration: 190 }),
    ]);
    if (result.star >= 0) this.collectStar(result.star);
    return true;
  }

  async turn(side: 'left' | 'right'): Promise<void> {
    this.world.turn(side);
    const current = this.arrow.angle;
    const delta = side === 'right' ? 90 : -90;
    await Promise.all([
      this.tween({ targets: this.arrow, angle: current + delta, duration: 300, ease: 'Back.easeOut' }),
      this.tween({ targets: this.robotSprite, angle: side === 'right' ? 10 : -10, yoyo: true, duration: 150 }),
    ]);
    this.arrow.setAngle(ANGLE[this.world.dir]);
    this.robotSprite.setFlipX(this.world.dir === 'left');
  }

  check(cond: Condition): boolean {
    const result =
      cond === 'obstacle_ahead' ? this.world.obstacleAhead() : cond === 'path_clear' ? !this.world.obstacleAhead() : false;
    // Muestra visualmente la casilla que el robot "mira"
    const a = this.world.ahead();
    const p = this.cell(a.x, a.y);
    const ring = this.add.circle(p.x, p.y, 30, this.world.obstacleAhead() ? 0xef4444 : 0x22c55e, 0.35);
    this.tweens.add({ targets: ring, alpha: 0, scale: 1.4, duration: 450, onComplete: () => ring.destroy() });
    return result;
  }

  atGoal() {
    return this.world.atGoal();
  }
  isWon() {
    return this.world.isWon();
  }
  hasGoal() {
    return !!this.world.level.goal;
  }
  starsLeft() {
    return this.world.starsLeft();
  }

  // ---------- Efectos ----------

  private async bump(from: { x: number; y: number }) {
    const a = this.world.ahead();
    const dx = Math.sign(a.x - this.world.pos.x) * 14;
    const dy = Math.sign(a.y - this.world.pos.y) * 14;
    this.robotSprite.setTint(0xfca5a5);
    this.cameras.main.shake(220, 0.008);
    await this.tween({ targets: this.robot, x: from.x + dx, y: from.y + dy, yoyo: true, duration: 140, ease: 'Quad.easeOut' });
    await this.tween({ targets: this.robotSprite, angle: { from: -12, to: 12 }, yoyo: true, repeat: 2, duration: 70 });
    this.robotSprite.setAngle(0);
  }

  private collectStar(i: number) {
    const s = this.starSprites[i];
    this.burst(s.x, s.y, [0xfacc15, 0xfde047, 0xf59e0b]);
    this.tweens.add({
      targets: s,
      scale: s.scale * 1.8,
      alpha: 0,
      y: s.y - 30,
      duration: 400,
      onComplete: () => s.setVisible(false),
    });
    this.events_.onStar?.(this.world.starsLeft());
  }

  private burst(x: number, y: number, tint: number[], quantity = 18) {
    const emitter = this.add.particles(x, y, 'spark', {
      speed: { min: 80, max: 220 },
      scale: { start: 0.7, end: 0 },
      lifespan: 650,
      tint,
      quantity,
      emitting: false,
    });
    emitter.explode(quantity);
    this.time.delayedCall(900, () => emitter.destroy());
  }

  celebrate() {
    const { x, y } = this.robot;
    this.burst(x, y, [0xec4899, 0x8b5cf6, 0x22c55e, 0xfacc15, 0x38bdf8], 40);
    this.tweens.add({ targets: this.robotSprite, y: -24, yoyo: true, repeat: 2, duration: 220, ease: 'Quad.easeOut' });
  }
}
