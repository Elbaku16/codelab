import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Gauge, Lightbulb, Lock, Play, RotateCcw, Square, Star, Target, Trash2 } from 'lucide-react';
import { LEVELS, getLevel } from '../data/levels';
import { BlocklyEditor, type BlocklyEditorHandle } from '../blockly/BlocklyEditor';
import { GameView, type GameViewHandle } from '../game/GameView';
import { runProgram } from '../game/interpreter';
import { parseLevel } from '../game/world';
import { isUnlocked, scoreFor, totalStars, type Progress } from '../lib/progress';
import { Logo } from '../components/Logo';
import { Button, Mascot, StarRating } from '../components/ui';
import { MissionModal, SuccessModal } from '../components/LevelModals';
import { COLORS } from '../blockly/blocks';

type Tone = 'info' | 'success' | 'error' | 'warn';

interface Props {
  levelId: number;
  progress: Progress;
  onComplete: (levelId: number, stars: number) => void;
  onSeenIntro: (levelId: number) => void;
  onChangeLevel: (levelId: number) => void;
  onHome: () => void;
}

const TONE_STYLE: Record<Tone, string> = {
  info: 'bg-white border-violet-100 text-violet-900',
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-rose-50 border-rose-200 text-rose-800',
  warn: 'bg-amber-50 border-amber-200 text-amber-900',
};

export function CodeLab({ levelId, progress, onComplete, onSeenIntro, onChangeLevel, onHome }: Props) {
  const level = getLevel(levelId);
  const totalLevelStars = parseLevel(level).stars.length;

  const editor = useRef<BlocklyEditorHandle>(null);
  const game = useRef<GameViewHandle>(null);
  const cancelRef = useRef(false);

  const [running, setRunning] = useState(false);
  const [fast, setFast] = useState(false);
  const [starsLeft, setStarsLeft] = useState(totalLevelStars);
  const [blocks, setBlocks] = useState({ program: 1, total: 1 });
  const [message, setMessage] = useState<{ tone: Tone; text: string }>({
    tone: 'info',
    text: '¡Arma tu programa con bloques y presiona EJECUTAR!',
  });
  const [fails, setFails] = useState(0);
  const [showMission, setShowMission] = useState(!progress.seenIntro[levelId]);
  const [success, setSuccess] = useState<{ stars: number; blocks: number } | null>(null);

  const nextId = LEVELS.find((l) => l.id === levelId + 1)?.id;

  useEffect(() => {
    const scene = game.current?.scene();
    if (scene) scene.speed = fast ? 2 : 1;
  }, [fast, running]);

  const closeMission = () => {
    setShowMission(false);
    onSeenIntro(levelId);
  };

  const resetGame = useCallback(() => {
    cancelRef.current = true;
    game.current?.scene()?.resetLevel();
    editor.current?.highlight(null);
    setStarsLeft(totalLevelStars);
  }, [totalLevelStars]);

  const fail = (text: string) => {
    const n = fails + 1;
    setFails(n);
    setMessage({ tone: 'error', text: n >= 2 ? `${text} 💡 Pista: ${level.hint}` : text });
  };

  const run = async () => {
    const scene = game.current?.scene();
    const ed = editor.current;
    if (running || !scene || !ed) return;

    const { program, missingCondition } = ed.compile();
    if (program.length === 0) {
      setMessage({ tone: 'warn', text: 'Tu programa está vacío. Arrastra bloques y pégalos debajo de "al ejecutar".' });
      return;
    }
    if (missingCondition) {
      setMessage({ tone: 'warn', text: 'Un bloque "si" no tiene pregunta. Arrastra una condición morada a su hueco.' });
      return;
    }

    scene.resetLevel();
    scene.speed = fast ? 2 : 1;
    setStarsLeft(totalLevelStars);
    cancelRef.current = false;
    setRunning(true);
    setMessage({ tone: 'info', text: 'Robi está siguiendo tus instrucciones… 👀' });

    const outcome = await runProgram(program, scene, {
      highlight: (id) => ed.highlight(id),
      isCancelled: () => cancelRef.current,
    });
    setRunning(false);

    switch (outcome.status) {
      case 'win': {
        const used = ed.blockCount();
        const stars = scoreFor(used, level.optimalBlocks);
        scene.celebrate();
        onComplete(levelId, stars);
        setFails(0);
        setMessage({ tone: 'success', text: '¡Lo lograste! 🎉' });
        setTimeout(() => setSuccess({ stars, blocks: used }), 900);
        break;
      }
      case 'crash':
        fail('¡Ups! Robi chocó con un obstáculo. Revisa hacia dónde mira la flecha antes de avanzar.');
        break;
      case 'incomplete':
        fail(
          outcome.reason === 'stars'
            ? `Robi terminó, pero aún faltan ${scene.starsLeft()} estrella(s). ¡Agrega más instrucciones!`
            : 'Robi recogió las estrellas, pero no llegó a la bandera 🏁.',
        );
        break;
      case 'timeout':
        fail('Robi se quedó dando vueltas sin llegar. Revisa tus condiciones y repeticiones.');
        break;
      case 'stopped':
        setMessage({ tone: 'warn', text: 'Programa detenido. Puedes cambiar tus bloques y volver a intentarlo.' });
        break;
      case 'empty':
        setMessage({ tone: 'warn', text: 'Tu programa está vacío.' });
        break;
    }
  };

  const stop = () => {
    cancelRef.current = true;
  };

  const restart = () => {
    resetGame();
    setMessage({ tone: 'info', text: 'Nivel reiniciado. Robi volvió a la salida.' });
  };

  const clearBlocks = () => {
    if (running) return;
    editor.current?.clear();
    resetGame();
    setMessage({ tone: 'info', text: 'Bloques borrados. ¡Empieza de nuevo!' });
  };

  const limited = Number.isFinite(level.maxBlocks);
  const nearLimit = limited && blocks.total >= level.maxBlocks;

  return (
    <div className="h-full flex flex-col bg-violet-50 dot-bg">
      {/* Barra superior */}
      <header className="shrink-0 flex flex-wrap items-center gap-3 px-3 sm:px-5 py-3 bg-white/90 backdrop-blur border-b-2 border-violet-100">
        <Button variant="white" size="sm" onClick={onHome} icon={<ArrowLeft size={18} />} aria-label="Volver al inicio">
          <span className="hidden sm:inline">Inicio</span>
        </Button>
        <Logo compact />
        <div className="min-w-0">
          <p className="text-xs font-extrabold uppercase tracking-wider" style={{ color: level.color }}>
            Nivel {level.id} · {level.difficulty}
          </p>
          <h1 className="font-display text-xl sm:text-2xl leading-none text-indigo-950 truncate">{level.title}</h1>
        </div>

        <nav className="flex items-center gap-1.5 ml-auto" aria-label="Niveles">
          {LEVELS.map((l) => {
            const unlocked = isUnlocked(progress, l.id);
            const active = l.id === levelId;
            return (
              <button
                key={l.id}
                disabled={!unlocked || running}
                onClick={() => onChangeLevel(l.id)}
                title={unlocked ? `Nivel ${l.id}: ${l.title}` : `Completa el nivel ${l.id - 1} para desbloquear`}
                className={`relative grid place-items-center w-10 h-10 rounded-xl font-display text-lg transition-all cursor-pointer disabled:cursor-not-allowed ${
                  active ? 'text-white scale-110 shadow-md' : unlocked ? 'bg-violet-100 text-violet-700 hover:bg-violet-200' : 'bg-slate-100 text-slate-400'
                }`}
                style={active ? { background: l.color } : undefined}
              >
                {unlocked ? l.id : <Lock size={16} />}
                {(progress.stars[l.id] ?? 0) > 0 && (
                  <Star size={14} className="absolute -top-1.5 -right-1.5 fill-amber-400 text-amber-500" />
                )}
              </button>
            );
          })}
        </nav>
        <div className="hidden md:flex items-center gap-1.5 rounded-full bg-amber-50 border-2 border-amber-200 px-3 py-1.5 font-extrabold text-amber-800">
          <Star size={16} className="fill-amber-400 text-amber-500" /> {totalStars(progress)}
        </div>
      </header>

      {/* Contenido: [Bloques | Área de programación] [Videojuego] */}
      <main className="flex-1 min-h-0 grid gap-3 p-3 sm:p-4 lg:grid-cols-[minmax(0,1fr)_minmax(360px,42%)] overflow-y-auto lg:overflow-hidden">
        {/* Editor Blockly */}
        <section className="order-2 lg:order-1 flex flex-col min-h-[520px] lg:min-h-0 rounded-3xl bg-white border-2 border-violet-100 shadow-[0_6px_0_0_#ddd6fe] overflow-hidden">
          <div className="shrink-0 flex flex-wrap items-center gap-2 px-4 py-2.5 border-b-2 border-violet-50">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-500">
              {Object.entries({ Eventos: COLORS.events, Movimiento: COLORS.motion, Control: COLORS.control, Condiciones: COLORS.logic }).map(
                ([name, c]) => (
                  <span key={name} className="hidden xl:inline-flex items-center gap-1 mr-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: c }} /> {name}
                  </span>
                ),
              )}
              <span className="xl:hidden">⬅ Elige bloques · Arma tu programa ➡</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-extrabold border-2 ${
                  nearLimit ? 'bg-rose-50 border-rose-200 text-rose-700 animate-wiggle' : 'bg-violet-50 border-violet-100 text-violet-700'
                }`}
                title="Bloques en el área de programación"
              >
                🧩 Bloques: {blocks.total}
                {limited ? ` / ${level.maxBlocks}` : ''}
              </span>
              <Button variant="white" size="sm" onClick={clearBlocks} disabled={running} icon={<Trash2 size={16} />}>
                <span className="hidden sm:inline">Borrar bloques</span>
              </Button>
            </div>
          </div>
          <div className="relative flex-1 min-h-0">
            <BlocklyEditor
              ref={editor}
              level={level}
              onBlocksChange={(program, total) => setBlocks({ program, total })}
            />
            {running && (
              <div className="absolute inset-0 z-10 cursor-not-allowed bg-violet-500/5" title="Detén el programa para editar los bloques">
                <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-violet-600 text-white text-xs font-extrabold px-4 py-1.5 shadow-lg">
                  Ejecutando… presiona DETENER para editar
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Videojuego */}
        <section className="order-1 lg:order-2 flex flex-col gap-3 min-h-0">
          {/* Misión */}
          <div className="shrink-0 flex items-center gap-3 rounded-3xl bg-white border-2 border-violet-100 p-3 pr-4">
            <div className="shrink-0 grid place-items-center w-11 h-11 rounded-2xl text-white" style={{ background: level.color }}>
              <Target size={22} />
            </div>
            <p className="flex-1 text-sm font-bold text-slate-700 leading-snug">{level.mission}</p>
            <Button variant="white" size="sm" onClick={() => setShowMission(true)} icon={<Lightbulb size={16} />}>
              <span className="hidden sm:inline">¿Cómo?</span>
            </Button>
          </div>

          {/* Escenario Phaser */}
          <div className="relative flex-1 min-h-[300px] sm:min-h-[380px] lg:min-h-0 rounded-3xl bg-gradient-to-b from-indigo-100 to-violet-200 border-2 border-violet-100 shadow-[0_6px_0_0_#ddd6fe] overflow-hidden p-2">
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-sm font-extrabold text-amber-700 shadow-sm">
              <Star size={16} className="fill-amber-400 text-amber-500" />
              {totalLevelStars - starsLeft} / {totalLevelStars}
            </div>
            <div className="absolute top-3 right-3 z-10">
              <StarRating value={progress.stars[levelId] ?? 0} size={18} />
            </div>
            <GameView ref={game} level={level} onStar={setStarsLeft} />
          </div>

          {/* Mensaje de Robi */}
          <div className={`shrink-0 flex items-center gap-3 rounded-3xl border-2 p-2 pr-4 transition-colors ${TONE_STYLE[message.tone]}`}>
            <Mascot size={44} float={false} className={message.tone === 'error' ? 'animate-wiggle' : ''} />
            <p key={message.text} className="text-sm font-bold leading-snug animate-fade-up" aria-live="polite">
              {message.text}
            </p>
          </div>

          {/* Controles */}
          <div className="shrink-0 grid grid-cols-[1fr_auto_auto] gap-2">
            {running ? (
              <Button variant="red" size="lg" onClick={stop} icon={<Square size={22} className="fill-current" />}>
                DETENER
              </Button>
            ) : (
              <Button variant="green" size="lg" onClick={run} icon={<Play size={24} className="fill-current" />}>
                EJECUTAR
              </Button>
            )}
            <Button variant="yellow" onClick={restart} icon={<RotateCcw size={20} />} title="Reiniciar nivel" aria-label="Reiniciar nivel">
              <span className="hidden sm:inline">Reiniciar</span>
            </Button>
            <Button
              variant={fast ? 'blue' : 'white'}
              onClick={() => setFast((f) => !f)}
              icon={<Gauge size={20} />}
              title="Cambiar velocidad"
              aria-pressed={fast}
            >
              {fast ? '2x' : '1x'}
            </Button>
          </div>
        </section>
      </main>

      <MissionModal level={level} open={showMission} onClose={closeMission} />
      <SuccessModal
        level={level}
        open={!!success}
        stars={success?.stars ?? 0}
        blocks={success?.blocks ?? 0}
        hasNext={!!nextId}
        onRetry={() => {
          setSuccess(null);
          restart();
        }}
        onNext={() => {
          setSuccess(null);
          if (nextId) onChangeLevel(nextId);
        }}
        onHome={onHome}
      />
    </div>
  );
}
