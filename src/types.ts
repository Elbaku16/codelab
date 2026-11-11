export type Direction = 'up' | 'right' | 'down' | 'left';

export interface Point {
  x: number;
  y: number;
}

export type Difficulty = 'Fácil' | 'Media' | 'Difícil';

export interface LevelDef {
  id: number;
  title: string;
  concept: string;
  difficulty: Difficulty;
  color: string;
  /** Mapa: . vacío, # roca, * estrella, G meta, R robot */
  map: string[];
  startDir: Direction;
  /** Bloques mínimos (incluye "Al ejecutar") para obtener 3 estrellas */
  optimalBlocks: number;
  /** Límite de bloques en el área de trabajo (Infinity = sin límite) */
  maxBlocks: number;
  mission: string;
  lesson: {
    title: string;
    text: string;
    example: string[];
  };
  steps: string[];
  hint: string;
  learned: string;
}

/** Programa compilado a partir de los bloques */
export type Condition = 'obstacle_ahead' | 'path_clear' | 'none';

export type Stmt =
  | { kind: 'move'; id: string }
  | { kind: 'turn'; dir: 'left' | 'right'; id: string }
  | { kind: 'repeat'; times: number; body: Stmt[]; id: string }
  | { kind: 'until_goal'; body: Stmt[]; id: string }
  | { kind: 'if'; cond: Condition; then: Stmt[]; else: Stmt[] | null; id: string };

export type RunOutcome =
  | { status: 'win' }
  | { status: 'crash' }
  | { status: 'incomplete'; reason: 'stars' | 'goal' }
  | { status: 'stopped' }
  | { status: 'timeout' }
  | { status: 'empty' };
