// Verifica que los tres niveles se puedan completar con la solución esperada
// y que las soluciones incorrectas fallen. Ejecutar: npm run verify
import { LEVELS } from '../src/data/levels';
import { World, parseLevel } from '../src/game/world';
import { runProgram, type RobotExecutor } from '../src/game/interpreter';
import type { Stmt } from '../src/types';

let n = 0;
const id = () => `b${n++}`;
const mv = (): Stmt => ({ kind: 'move', id: id() });
const L = (): Stmt => ({ kind: 'turn', dir: 'left', id: id() });
const R = (): Stmt => ({ kind: 'turn', dir: 'right', id: id() });

function executor(levelId: number): RobotExecutor {
  const w = new World(parseLevel(LEVELS[levelId - 1]));
  return {
    move: async () => !w.move().crashed,
    turn: async (s) => w.turn(s),
    check: (c) => (c === 'obstacle_ahead' ? w.obstacleAhead() : c === 'path_clear' ? !w.obstacleAhead() : false),
    atGoal: () => w.atGoal(),
    isWon: () => w.isWon(),
    hasGoal: () => !!w.level.goal,
    starsLeft: () => w.starsLeft(),
  };
}

const hooks = { highlight: () => {}, isCancelled: () => false };

const cases: [string, number, Stmt[], string][] = [
  ['Nivel 1 solución', 1, [mv(), mv(), mv(), L(), mv(), mv()], 'win'],
  ['Nivel 1 choque', 1, [L(), mv(), mv(), R(), mv(), mv()], 'crash'],
  ['Nivel 1 incompleto', 1, [mv()], 'incomplete'],
  ['Nivel 2 solución con ciclo', 2, [{ kind: 'repeat', times: 4, body: [mv(), L(), mv(), R()], id: id() }], 'win'],
  ['Nivel 2 pocas repeticiones', 2, [{ kind: 'repeat', times: 2, body: [mv(), L(), mv(), R()], id: id() }], 'incomplete'],
  [
    'Nivel 3 solución con condición',
    3,
    [{ kind: 'until_goal', id: id(), body: [{ kind: 'if', cond: 'obstacle_ahead', then: [L()], else: [mv()], id: id() }] }],
    'win',
  ],
  [
    'Nivel 3 con "camino libre"',
    3,
    [{ kind: 'until_goal', id: id(), body: [{ kind: 'if', cond: 'path_clear', then: [mv()], else: [L()], id: id() }] }],
    'win',
  ],
  [
    'Nivel 3 gira a la derecha (llega sin estrellas)',
    3,
    [{ kind: 'until_goal', id: id(), body: [{ kind: 'if', cond: 'obstacle_ahead', then: [R()], else: [mv()], id: id() }] }],
    'incomplete',
  ],
  ['Nivel 3 sin condición choca', 3, [mv(), mv(), mv(), mv(), mv()], 'crash'],
];

let failed = 0;
for (const [name, lvl, prog, expected] of cases) {
  const out = await runProgram(prog, executor(lvl), hooks);
  const ok = out.status === expected;
  if (!ok) failed++;
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${name}: ${out.status} (esperado ${expected})`);
}
process.exit(failed ? 1 : 0);
