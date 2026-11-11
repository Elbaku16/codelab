import * as Blockly from 'blockly/core';
import * as Es from 'blockly/msg/es';

export const COLORS = {
  events: '#eab308',
  motion: '#3b82f6',
  control: '#f97316',
  logic: '#a855f7',
};

let registered = false;

/** Registra los bloques personalizados de CODELAB, el idioma y el tema. */
export function registerBlocks() {
  if (registered) return;
  registered = true;

  Blockly.setLocale(Es as unknown as Record<string, string>);

  Blockly.common.defineBlocksWithJsonArray([
    {
      type: 'codelab_start',
      message0: '▶  al ejecutar',
      nextStatement: null,
      style: 'events_blocks',
      tooltip: 'Todo lo que conectes debajo se ejecutará al presionar EJECUTAR.',
    },
    {
      type: 'codelab_move',
      message0: '⬆  avanzar',
      previousStatement: null,
      nextStatement: null,
      style: 'motion_blocks',
      tooltip: 'Robi avanza una casilla hacia donde mira.',
    },
    {
      type: 'codelab_turn_left',
      message0: '↺  girar a la izquierda',
      previousStatement: null,
      nextStatement: null,
      style: 'motion_blocks',
      tooltip: 'Robi gira un cuarto de vuelta a su izquierda.',
    },
    {
      type: 'codelab_turn_right',
      message0: '↻  girar a la derecha',
      previousStatement: null,
      nextStatement: null,
      style: 'motion_blocks',
      tooltip: 'Robi gira un cuarto de vuelta a su derecha.',
    },
    {
      type: 'codelab_repeat',
      message0: '🔁  repetir %1 veces',
      args0: [{ type: 'field_number', name: 'TIMES', value: 3, min: 1, max: 20, precision: 1 }],
      message1: '%1',
      args1: [{ type: 'input_statement', name: 'DO' }],
      previousStatement: null,
      nextStatement: null,
      style: 'control_blocks',
      tooltip: 'Repite los bloques de adentro el número de veces indicado.',
    },
    {
      type: 'codelab_until_goal',
      message0: '🔁  repetir hasta llegar a la meta 🏁',
      message1: '%1',
      args1: [{ type: 'input_statement', name: 'DO' }],
      previousStatement: null,
      nextStatement: null,
      style: 'control_blocks',
      tooltip: 'Repite los bloques de adentro hasta que Robi esté en la bandera.',
    },
    {
      type: 'codelab_if',
      message0: '❓  si %1 entonces',
      args0: [{ type: 'input_value', name: 'COND', check: 'Boolean' }],
      message1: '%1',
      args1: [{ type: 'input_statement', name: 'THEN' }],
      previousStatement: null,
      nextStatement: null,
      style: 'control_blocks',
      tooltip: 'Solo ejecuta los bloques de adentro SI la condición es verdadera.',
    },
    {
      type: 'codelab_ifelse',
      message0: '❓  si %1 entonces',
      args0: [{ type: 'input_value', name: 'COND', check: 'Boolean' }],
      message1: '%1',
      args1: [{ type: 'input_statement', name: 'THEN' }],
      message2: 'si no',
      message3: '%1',
      args3: [{ type: 'input_statement', name: 'ELSE' }],
      previousStatement: null,
      nextStatement: null,
      style: 'control_blocks',
      tooltip: 'SI la condición es verdadera hace lo de arriba; SI NO, hace lo de abajo.',
    },
    {
      type: 'codelab_obstacle',
      message0: '¿hay obstáculo enfrente?',
      output: 'Boolean',
      style: 'logic_blocks',
      tooltip: 'Es verdadero cuando hay una roca o un borde justo frente a Robi.',
    },
    {
      type: 'codelab_clear',
      message0: '¿camino libre enfrente?',
      output: 'Boolean',
      style: 'logic_blocks',
      tooltip: 'Es verdadero cuando Robi puede avanzar sin chocar.',
    },
  ]);
}

export function createTheme() {
  return Blockly.Theme.defineTheme('codelab', {
    name: 'codelab',
    base: Blockly.Themes.Classic,
    blockStyles: {
      events_blocks: { colourPrimary: COLORS.events, colourSecondary: '#fde047', colourTertiary: '#a16207', hat: 'cap' },
      motion_blocks: { colourPrimary: COLORS.motion, colourSecondary: '#93c5fd', colourTertiary: '#1d4ed8' },
      control_blocks: { colourPrimary: COLORS.control, colourSecondary: '#fdba74', colourTertiary: '#c2410c' },
      logic_blocks: { colourPrimary: COLORS.logic, colourSecondary: '#d8b4fe', colourTertiary: '#7e22ce' },
    },
    categoryStyles: {
      events_category: { colour: COLORS.events },
      motion_category: { colour: COLORS.motion },
      control_category: { colour: COLORS.control },
      logic_category: { colour: COLORS.logic },
    },
    componentStyles: {
      workspaceBackgroundColour: '#f8fafc',
      toolboxBackgroundColour: '#ffffff',
      toolboxForegroundColour: '#1e293b',
      flyoutBackgroundColour: '#eef2ff',
      flyoutOpacity: 0.97,
      scrollbarColour: '#c4b5fd',
      scrollbarOpacity: 0.6,
      insertionMarkerColour: '#7c3aed',
      insertionMarkerOpacity: 0.35,
    },
    fontStyle: { family: 'Nunito, system-ui, sans-serif', weight: '800', size: 13 },
    startHats: true,
  });
}

type ToolboxItem = Record<string, unknown>;

const lockLabel = (level: number): ToolboxItem => ({
  kind: 'label',
  text: `🔒 Se desbloquea en el nivel ${level}`,
});

/** Caja de herramientas: las categorías se van llenando conforme avanzan los niveles. */
export function buildToolbox(levelId: number) {
  const block = (type: string, extra: ToolboxItem = {}): ToolboxItem => ({ kind: 'block', type, ...extra });

  const control: ToolboxItem[] = [];
  if (levelId >= 2) control.push(block('codelab_repeat', { fields: { TIMES: levelId === 2 ? 4 : 3 } }));
  if (levelId >= 3) control.push(block('codelab_until_goal'), block('codelab_if'), block('codelab_ifelse'));
  if (levelId < 2) control.push(lockLabel(2));

  const logic: ToolboxItem[] =
    levelId >= 3 ? [block('codelab_obstacle'), block('codelab_clear')] : [lockLabel(3)];

  return {
    kind: 'categoryToolbox',
    contents: [
      { kind: 'category', name: 'Eventos', categorystyle: 'events_category', contents: [block('codelab_start')] },
      {
        kind: 'category',
        name: 'Movimiento',
        categorystyle: 'motion_category',
        contents: [block('codelab_move'), block('codelab_turn_left'), block('codelab_turn_right')],
      },
      { kind: 'category', name: 'Control', categorystyle: 'control_category', contents: control },
      { kind: 'category', name: 'Condiciones', categorystyle: 'logic_category', contents: logic },
    ],
  };
}
