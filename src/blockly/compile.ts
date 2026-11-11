import * as Blockly from 'blockly/core';
import type { Condition, Stmt } from '../types';

export interface CompileResult {
  program: Stmt[];
  hasStart: boolean;
  /** Bloques "si" sin pregunta conectada */
  missingCondition: boolean;
}

/**
 * Traduce los bloques conectados bajo "al ejecutar" a un programa
 * que el intérprete puede ejecutar sobre el videojuego.
 */
export function compileWorkspace(ws: Blockly.Workspace): CompileResult {
  const start = ws.getTopBlocks(true).find((b) => b.type === 'codelab_start');
  let missingCondition = false;

  const condOf = (b: Blockly.Block | null): Condition => {
    if (!b || !b.isEnabled()) {
      missingCondition = true;
      return 'none';
    }
    if (b.type === 'codelab_obstacle') return 'obstacle_ahead';
    if (b.type === 'codelab_clear') return 'path_clear';
    return 'none';
  };

  const chain = (first: Blockly.Block | null): Stmt[] => {
    const out: Stmt[] = [];
    for (let b = first; b; b = b.getNextBlock()) {
      if (!b.isEnabled()) continue;
      const id = b.id;
      switch (b.type) {
        case 'codelab_move':
          out.push({ kind: 'move', id });
          break;
        case 'codelab_turn_left':
          out.push({ kind: 'turn', dir: 'left', id });
          break;
        case 'codelab_turn_right':
          out.push({ kind: 'turn', dir: 'right', id });
          break;
        case 'codelab_repeat':
          out.push({
            kind: 'repeat',
            times: Number(b.getFieldValue('TIMES')) || 0,
            body: chain(b.getInputTargetBlock('DO')),
            id,
          });
          break;
        case 'codelab_until_goal':
          out.push({ kind: 'until_goal', body: chain(b.getInputTargetBlock('DO')), id });
          break;
        case 'codelab_if':
          out.push({
            kind: 'if',
            cond: condOf(b.getInputTargetBlock('COND')),
            then: chain(b.getInputTargetBlock('THEN')),
            else: null,
            id,
          });
          break;
        case 'codelab_ifelse':
          out.push({
            kind: 'if',
            cond: condOf(b.getInputTargetBlock('COND')),
            then: chain(b.getInputTargetBlock('THEN')),
            else: chain(b.getInputTargetBlock('ELSE')),
            id,
          });
          break;
      }
    }
    return out;
  };

  return {
    program: start ? chain(start.getNextBlock()) : [],
    hasStart: !!start,
    missingCondition,
  };
}

/** Cuenta los bloques que forman parte del programa (los usados para la puntuación). */
export function countProgramBlocks(ws: Blockly.Workspace): number {
  const start = ws.getTopBlocks(false).find((b) => b.type === 'codelab_start');
  if (!start) return 0;
  return start.getDescendants(false).filter((b) => b.isEnabled()).length;
}
