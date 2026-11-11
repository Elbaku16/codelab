import { ArrowRight, BookOpen, Home, Lightbulb, RotateCcw, Sparkles } from 'lucide-react';
import type { LevelDef } from '../types';
import { Button, Mascot, Modal, StarRating } from './ui';

const EXAMPLE_COLOR = (line: string) => {
  const t = line.trim().toLowerCase();
  if (t.startsWith('repetir')) return 'bg-orange-500';
  if (t.startsWith('si')) return 'bg-orange-500';
  return 'bg-blue-500';
};

/** Explicación del concepto del nivel (se muestra al entrar y con el botón "Misión"). */
export function MissionModal({ level, open, onClose }: { level: LevelDef; open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-center gap-4">
        <Mascot size={84} />
        <div>
          <p className="text-sm font-extrabold uppercase tracking-wider" style={{ color: level.color }}>
            Nivel {level.id} · {level.concept}
          </p>
          <h2 className="font-display text-3xl leading-tight text-indigo-950">{level.title}</h2>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-violet-50 p-4 border-2 border-violet-100">
        <p className="font-extrabold text-violet-900 flex items-center gap-2">🎯 Tu misión</p>
        <p className="font-semibold text-slate-700">{level.mission}</p>
      </div>

      <div className="mt-4">
        <p className="font-display text-xl text-indigo-950 flex items-center gap-2">
          <BookOpen size={20} className="text-violet-500" /> {level.lesson.title}
        </p>
        <p className="mt-1 font-semibold text-slate-600">{level.lesson.text}</p>
        <div className="mt-3 rounded-2xl bg-slate-50 p-3 space-y-1.5 border-2 border-dashed border-slate-200">
          <p className="text-xs font-extrabold text-slate-400 uppercase">Ejemplo</p>
          {level.lesson.example.map((line, i) => {
            const indent = line.length - line.trimStart().length;
            return (
              <div
                key={i}
                className={`w-fit rounded-xl px-3 py-1 text-sm font-extrabold text-white ${EXAMPLE_COLOR(line)}`}
                style={{ marginLeft: indent * 8 }}
              >
                {line.trim()}
              </div>
            );
          })}
        </div>
      </div>

      <ol className="mt-4 space-y-2">
        {level.steps.map((s, i) => (
          <li key={i} className="flex gap-3 items-start font-semibold text-slate-700">
            <span className="shrink-0 grid place-items-center w-7 h-7 rounded-full text-white text-sm font-extrabold" style={{ background: level.color }}>
              {i + 1}
            </span>
            {s}
          </li>
        ))}
      </ol>

      <Button variant="green" size="lg" className="mt-6 w-full" onClick={onClose} icon={<Sparkles size={22} />}>
        ¡Entendido, a programar!
      </Button>
    </Modal>
  );
}

interface SuccessProps {
  level: LevelDef;
  open: boolean;
  stars: number;
  blocks: number;
  hasNext: boolean;
  onNext: () => void;
  onRetry: () => void;
  onHome: () => void;
}

/** Mensaje educativo al completar un reto. */
export function SuccessModal({ level, open, stars, blocks, hasNext, onNext, onRetry, onHome }: SuccessProps) {
  return (
    <Modal open={open} onClose={onRetry}>
      <div className="text-center">
        <div className="relative mx-auto w-fit">
          <div className="absolute inset-0 rounded-full bg-amber-200 blur-2xl" />
          <Mascot size={120} className="relative" />
        </div>
        <h2 className="mt-2 font-display text-4xl text-indigo-950">¡Reto completado!</h2>
        <div className="mt-2 flex justify-center">
          <StarRating value={stars} size={48} animate />
        </div>
        <p className="mt-2 font-bold text-slate-500">
          Usaste <b className="text-violet-700">{blocks} bloques</b>.
          {stars < 3 && <> ¡Puedes lograrlo con solo {level.optimalBlocks} para ganar 3 estrellas!</>}
        </p>
      </div>

      <div className="mt-5 rounded-2xl bg-gradient-to-br from-violet-50 to-fuchsia-50 p-4 border-2 border-violet-100">
        <p className="font-extrabold text-violet-900 flex items-center gap-2">
          <Lightbulb size={18} className="text-amber-500" /> Lo que aprendiste
        </p>
        <p className="mt-1 font-semibold text-slate-700">{level.learned}</p>
      </div>

      {!hasNext && (
        <p className="mt-4 text-center font-display text-xl text-fuchsia-600">🏆 ¡Terminaste CODELAB! Ya eres un programador.</p>
      )}

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Button variant="white" className="flex-1" onClick={onRetry} icon={<RotateCcw size={18} />}>
          Mejorar mi solución
        </Button>
        {hasNext ? (
          <Button variant="green" className="flex-1" onClick={onNext} icon={<ArrowRight size={20} />}>
            Siguiente nivel
          </Button>
        ) : (
          <Button variant="purple" className="flex-1" onClick={onHome} icon={<Home size={18} />}>
            Volver al inicio
          </Button>
        )}
      </div>
    </Modal>
  );
}
