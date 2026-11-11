import type { LevelDef } from '../types';

export const LEVELS: LevelDef[] = [
  {
    id: 1,
    title: 'Movimiento',
    concept: 'Secuencias',
    difficulty: 'Fácil',
    color: '#22c55e',
    map: [
      '.......',
      '#......',
      '...#*..',
      '..#....',
      '.R.....',
      '.....#.',
    ],
    startDir: 'right',
    optimalBlocks: 7,
    maxBlocks: Infinity,
    mission: 'Lleva a Robi hasta la estrella.',
    lesson: {
      title: '¿Qué es una secuencia?',
      text: 'Una computadora sigue tus instrucciones en orden, una por una, de arriba hacia abajo. A esa lista ordenada se le llama secuencia.',
      example: ['Avanzar', 'Avanzar', 'Girar a la izquierda', 'Avanzar'],
    },
    steps: [
      'Arrastra el bloque "Avanzar" debajo de "Al ejecutar".',
      'Usa "Girar" para cambiar hacia dónde mira Robi. La flecha te lo indica.',
      'Presiona el botón verde EJECUTAR.',
    ],
    hint: 'Cuenta las casillas: Robi debe avanzar 3 veces a la derecha, girar a la izquierda y avanzar 2 veces.',
    learned:
      '¡Creaste tu primera secuencia! Las computadoras siguen las instrucciones en el orden exacto en que las escribes.',
  },
  {
    id: 2,
    title: 'Repeticiones',
    concept: 'Ciclos',
    difficulty: 'Media',
    color: '#f59e0b',
    map: [
      '......#',
      '....*..',
      '#..*...',
      '..*....',
      '.*...#.',
      'R..#...',
    ],
    startDir: 'right',
    optimalBlocks: 6,
    maxBlocks: 8,
    mission: 'Recoge las 4 estrellas de la escalera. ¡Solo puedes usar 8 bloques!',
    lesson: {
      title: '¿Qué es un ciclo?',
      text: 'Cuando algo se repite muchas veces, no hace falta escribirlo una y otra vez. El bloque "Repetir" hace que las instrucciones de adentro se ejecuten las veces que tú digas.',
      example: ['Repetir 4 veces:', '   Avanzar', '   Girar a la izquierda', '   Avanzar', '   Girar a la derecha'],
    },
    steps: [
      'Observa el patrón: cada escalón es igual al anterior.',
      'Coloca un bloque "Repetir" y mete adentro los movimientos de UN escalón.',
      'Cambia el número para indicar cuántas veces repetir.',
    ],
    hint: 'Un escalón es: avanzar, girar a la izquierda, avanzar, girar a la derecha. ¡Hay 4 escalones!',
    learned:
      '¡Usaste un ciclo! Con "Repetir" escribiste menos bloques y el programa hizo más trabajo. Los programadores usan ciclos todo el tiempo.',
  },
  {
    id: 3,
    title: 'Condiciones',
    concept: 'Si / Entonces',
    difficulty: 'Difícil',
    color: '#ec4899',
    map: [
      '.......',
      '....#..',
      'G....#.',
      '.###*#.',
      '.....#.',
      'R.*..#.',
    ],
    startDir: 'right',
    optimalBlocks: 6,
    maxBlocks: 7,
    mission: 'Llega a la bandera esquivando las rocas. ¡Solo puedes usar 7 bloques!',
    lesson: {
      title: '¿Qué es una condición?',
      text: 'Una condición es una pregunta que el robot se hace: "¿Hay un obstáculo enfrente?". SI la respuesta es sí, ENTONCES hace una cosa; SI NO, hace otra.',
      example: ['Repetir hasta llegar a la meta:', '   Si hay obstáculo enfrente', '      Girar a la izquierda', '   Si no', '      Avanzar'],
    },
    steps: [
      'Usa "Repetir hasta llegar a la meta" para que Robi no se detenga.',
      'Dentro, coloca "Si ... entonces / si no" y ponle la pregunta "¿hay obstáculo enfrente?".',
      'Decide qué hace Robi cuando hay una roca y qué hace cuando el camino está libre.',
    ],
    hint: 'Si hay obstáculo enfrente → gira a la izquierda. Si no → avanza. ¡Repite hasta la meta!',
    learned:
      '¡Tu robot ahora toma decisiones! Las condiciones permiten que un programa reaccione a lo que pasa a su alrededor, como en los videojuegos y las apps.',
  },
];

export function getLevel(id: number): LevelDef {
  return LEVELS.find((l) => l.id === id) ?? LEVELS[0];
}
