import type { Condition, RunOutcome, Stmt } from '../types';

/** Lo que el intérprete necesita del videojuego (implementado por la escena Phaser). */
export interface RobotExecutor {
  move(): Promise<boolean>; // false = chocó
  turn(side: 'left' | 'right'): Promise<void>;
  check(cond: Condition): boolean;
  atGoal(): boolean;
  isWon(): boolean;
  hasGoal(): boolean;
  starsLeft(): number;
}

export interface RunHooks {
  highlight(blockId: string | null): void;
  isCancelled(): boolean;
}

const MAX_ACTIONS = 200;
const MAX_LOOP_ITERATIONS = 120;

class Halt {
  constructor(public outcome: RunOutcome) {}
}

/**
 * Ejecuta el programa compilado desde Blockly paso a paso,
 * esperando cada animación de Phaser antes de continuar.
 */
export async function runProgram(
  program: Stmt[],
  robot: RobotExecutor,
  hooks: RunHooks,
): Promise<RunOutcome> {
  if (program.length === 0) return { status: 'empty' };
  let actions = 0;

  const guard = () => {
    if (hooks.isCancelled()) throw new Halt({ status: 'stopped' });
  };

  const exec = async (list: Stmt[]): Promise<void> => {
    for (const stmt of list) {
      guard();
      hooks.highlight(stmt.id);
      switch (stmt.kind) {
        case 'move': {
          actions++;
          const ok = await robot.move();
          guard();
          if (!ok) throw new Halt({ status: 'crash' });
          if (robot.isWon()) throw new Halt({ status: 'win' });
          break;
        }
        case 'turn':
          actions++;
          await robot.turn(stmt.dir);
          guard();
          break;
        case 'repeat':
          for (let i = 0; i < stmt.times; i++) {
            await exec(stmt.body);
            hooks.highlight(stmt.id);
          }
          break;
        case 'until_goal': {
          let n = 0;
          while (!robot.atGoal()) {
            if (++n > MAX_LOOP_ITERATIONS || stmt.body.length === 0) {
              throw new Halt({ status: 'timeout' });
            }
            await exec(stmt.body);
            hooks.highlight(stmt.id);
          }
          break;
        }
        case 'if': {
          const result = robot.check(stmt.cond);
          await pause(180);
          if (result) await exec(stmt.then);
          else if (stmt.else) await exec(stmt.else);
          break;
        }
      }
      if (actions > MAX_ACTIONS) throw new Halt({ status: 'timeout' });
    }
  };

  try {
    await exec(program);
  } catch (e) {
    if (e instanceof Halt) return e.outcome;
    throw e;
  } finally {
    hooks.highlight(null);
  }

  if (robot.isWon()) return { status: 'win' };
  if (robot.starsLeft() > 0) return { status: 'incomplete', reason: 'stars' };
  return { status: 'incomplete', reason: robot.hasGoal() ? 'goal' : 'stars' };
}

function pause(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
