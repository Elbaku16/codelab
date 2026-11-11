import type { Direction, LevelDef, Point } from '../types';

const DIRS: Direction[] = ['up', 'right', 'down', 'left'];

export const DELTA: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  right: { x: 1, y: 0 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
};

export interface ParsedLevel {
  cols: number;
  rows: number;
  rocks: Point[];
  stars: Point[];
  goal: Point | null;
  start: Point;
  startDir: Direction;
}

export function parseLevel(level: LevelDef): ParsedLevel {
  const rocks: Point[] = [];
  const stars: Point[] = [];
  let goal: Point | null = null;
  let start: Point = { x: 0, y: 0 };
  level.map.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch === '#') rocks.push({ x, y });
      if (ch === '*') stars.push({ x, y });
      if (ch === 'G') goal = { x, y };
      if (ch === 'R') start = { x, y };
    });
  });
  return {
    cols: level.map[0].length,
    rows: level.map.length,
    rocks,
    stars,
    goal,
    start,
    startDir: level.startDir,
  };
}

/**
 * Modelo lógico del mundo: posición del robot, estrellas recogidas,
 * colisiones y condición de victoria. Phaser solo dibuja este estado.
 */
export class World {
  readonly level: ParsedLevel;
  pos: Point;
  dir: Direction;
  collected: boolean[];

  constructor(level: ParsedLevel) {
    this.level = level;
    this.pos = { ...level.start };
    this.dir = level.startDir;
    this.collected = level.stars.map(() => false);
  }

  reset() {
    this.pos = { ...this.level.start };
    this.dir = this.level.startDir;
    this.collected = this.level.stars.map(() => false);
  }

  ahead(): Point {
    const d = DELTA[this.dir];
    return { x: this.pos.x + d.x, y: this.pos.y + d.y };
  }

  isBlocked(p: Point): boolean {
    const { cols, rows, rocks } = this.level;
    if (p.x < 0 || p.y < 0 || p.x >= cols || p.y >= rows) return true;
    return rocks.some((r) => r.x === p.x && r.y === p.y);
  }

  obstacleAhead(): boolean {
    return this.isBlocked(this.ahead());
  }

  /** Mueve una casilla. Devuelve el índice de estrella recogida, -1 si nada o null si choca. */
  move(): { crashed: boolean; star: number } {
    const next = this.ahead();
    if (this.isBlocked(next)) return { crashed: true, star: -1 };
    this.pos = next;
    const star = this.level.stars.findIndex(
      (s, i) => !this.collected[i] && s.x === next.x && s.y === next.y,
    );
    if (star >= 0) this.collected[star] = true;
    return { crashed: false, star };
  }

  turn(side: 'left' | 'right') {
    const i = DIRS.indexOf(this.dir);
    this.dir = DIRS[(i + (side === 'right' ? 1 : 3)) % 4];
  }

  atGoal(): boolean {
    const g = this.level.goal;
    return !!g && g.x === this.pos.x && g.y === this.pos.y;
  }

  allStars(): boolean {
    return this.collected.every(Boolean);
  }

  starsLeft(): number {
    return this.collected.filter((c) => !c).length;
  }

  isWon(): boolean {
    return this.allStars() && (this.level.goal ? this.atGoal() : true);
  }
}
