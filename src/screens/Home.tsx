import { Blocks, MousePointerClick, Play, RotateCcw, Rocket, Star, Trophy } from 'lucide-react';
import { LEVELS } from '../data/levels';
import { completedCount, isUnlocked, nextLevel, totalStars, type Progress } from '../lib/progress';
import { Logo } from '../components/Logo';
import { LevelCard } from '../components/LevelCard';
import { Button, Mascot, ProgressBar, SpeechBubble, StarArt } from '../components/ui';

interface Props {
  progress: Progress;
  onPlay: (levelId: number) => void;
  onReset: () => void;
}

const HOW_TO = [
  { icon: MousePointerClick, color: 'bg-sky-100 text-sky-600', title: '1. Arrastra', text: 'Toma un bloque con el ratón y suéltalo en el área blanca.' },
  { icon: Blocks, color: 'bg-amber-100 text-amber-600', title: '2. Conecta', text: 'Pega los bloques debajo de "al ejecutar", como piezas de rompecabezas.' },
  { icon: Play, color: 'bg-green-100 text-green-600', title: '3. Ejecuta', text: 'Presiona el botón verde y mira cómo Robi sigue tus órdenes.' },
];

export function Home({ progress, onPlay, onReset }: Props) {
  const done = completedCount(progress);
  const stars = totalStars(progress);
  const maxStars = LEVELS.length * 3;
  const allDone = done === LEVELS.length;

  const handleReset = () => {
    if (window.confirm('¿Seguro que quieres borrar tu progreso y empezar desde cero?')) onReset();
  };

  return (
    <div className="min-h-full dot-bg overflow-x-hidden">
      {/* Encabezado */}
      <header className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 py-4">
        <Logo />
        <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm border-2 border-violet-100 font-extrabold">
          <Star size={18} className="fill-amber-400 text-amber-500" />
          {stars} / {maxStars}
        </div>
      </header>

      {/* Portada */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-10 grid lg:grid-cols-[1.15fr_1fr] gap-10 items-center">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full bg-violet-100 text-violet-700 px-4 py-1.5 text-sm font-extrabold">
            <Rocket size={16} /> Sin experiencia previa · 3 misiones
          </span>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] text-indigo-950">
            ¡Tu aventura como{' '}
            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 bg-clip-text text-transparent">programador</span>{' '}
            comienza aquí!
          </h1>
          <p className="mt-4 text-lg text-slate-600 font-semibold max-w-xl">
            Guía a Robi con bloques de código, recoge estrellas y aprende a pensar como programador. ¡Sin escribir ni una línea!
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-4">
            <Button variant="green" size="lg" onClick={() => onPlay(nextLevel(progress))} icon={<Play size={26} className="fill-current" />}>
              {done === 0 ? 'Comenzar' : allDone ? 'Jugar de nuevo' : 'Continuar'}
            </Button>
            {done > 0 && (
              <Button variant="white" size="sm" onClick={handleReset} icon={<RotateCcw size={16} />}>
                Reiniciar progreso
              </Button>
            )}
          </div>

          {/* Progreso */}
          <div className="mt-8 max-w-md rounded-3xl bg-white p-5 shadow-[0_6px_0_0_#ddd6fe] border-2 border-violet-100">
            <div className="flex items-center justify-between mb-3">
              <span className="font-display text-xl text-indigo-950 flex items-center gap-2">
                <Trophy size={20} className="text-amber-500" /> Tu progreso
              </span>
              <span className="text-sm font-extrabold text-violet-600">
                {done} de {LEVELS.length} niveles
              </span>
            </div>
            <ProgressBar value={done} max={LEVELS.length} color="linear-gradient(90deg,#8b5cf6,#d946ef)" />
            <p className="mt-3 text-sm font-bold text-slate-500">
              {allDone
                ? '🎉 ¡Completaste todas las misiones! Intenta conseguir las 3 estrellas en cada nivel.'
                : done === 0
                  ? 'Aún no empiezas. ¡Presiona Comenzar!'
                  : `¡Vas muy bien! Siguiente misión: Nivel ${nextLevel(progress)}.`}
            </p>
          </div>
        </div>

        {/* Mascota */}
        <div className="relative h-[340px] sm:h-[400px] flex items-center justify-center">
          <div className="absolute w-72 h-72 sm:w-80 sm:h-80 rounded-full bg-gradient-to-br from-violet-300 via-fuchsia-200 to-amber-100 blur-sm" />
          <div className="absolute w-56 h-56 rounded-full border-4 border-dashed border-white/80 animate-[spin_30s_linear_infinite]" />
          <StarArt size={56} className="absolute top-6 left-10 animate-float" />
          <StarArt size={40} className="absolute bottom-10 right-8 animate-float [animation-delay:1s]" />
          <StarArt size={32} className="absolute top-16 right-16 animate-float [animation-delay:2s]" />
          <Mascot size={230} className="relative" />
          <SpeechBubble className="absolute top-2 sm:top-6 right-0 sm:-right-2 max-w-[13rem] text-sm animate-pop [animation-delay:.4s]">
            ¡Hola! Soy <b className="text-fuchsia-600">Robi</b>. ¿Me ayudas a programar?
          </SpeechBubble>
        </div>
      </section>

      {/* Cómo se juega */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10">
        <h2 className="font-display text-3xl text-indigo-950 mb-4">¿Cómo se juega?</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {HOW_TO.map(({ icon: Icon, color, title, text }, i) => (
            <div
              key={title}
              className="flex gap-4 items-start rounded-3xl bg-white p-5 border-2 border-violet-100 animate-fade-up"
              style={{ animationDelay: `${0.1 + i * 0.1}s` }}
            >
              <div className={`shrink-0 grid place-items-center w-12 h-12 rounded-2xl ${color}`}>
                <Icon size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="font-display text-xl text-indigo-950">{title}</h3>
                <p className="text-sm font-semibold text-slate-500">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Niveles */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <h2 className="font-display text-3xl text-indigo-950 mb-4">Misiones</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {LEVELS.map((level, i) => (
            <LevelCard
              key={level.id}
              level={level}
              stars={progress.stars[level.id] ?? 0}
              unlocked={isUnlocked(progress, level.id)}
              onPlay={() => onPlay(level.id)}
              delay={0.1 + i * 0.12}
            />
          ))}
        </div>
      </section>

      <footer className="text-center text-sm font-bold text-slate-400 pb-8 px-4">
        CODELAB · Tu progreso se guarda automáticamente en esta computadora.
      </footer>
    </div>
  );
}
