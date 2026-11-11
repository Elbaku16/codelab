import { Lock, Play, RotateCcw } from 'lucide-react';
import type { LevelDef } from '../types';
import { Button, StarRating } from './ui';

function MiniMap({ level }: { level: LevelDef }) {
  const cell = (ch: string) => {
    switch (ch) {
      case '#':
        return <div className="w-full h-full rounded-[4px] bg-slate-400" />;
      case '*':
        return <div className="w-full h-full grid place-items-center text-[10px] leading-none">⭐</div>;
      case 'G':
        return <div className="w-full h-full grid place-items-center text-[10px] leading-none">🏁</div>;
      case 'R':
        return <div className="w-full h-full rounded-full bg-violet-500 ring-2 ring-violet-200" />;
      default:
        return null;
    }
  };
  return (
    <div
      className="grid gap-[3px] p-2 rounded-2xl bg-white/80"
      style={{ gridTemplateColumns: `repeat(${level.map[0].length}, 1fr)` }}
      aria-hidden
    >
      {level.map.flatMap((row, y) =>
        [...row].map((ch, x) => (
          <div key={`${x}-${y}`} className="aspect-square rounded-[5px] bg-violet-50 p-[2px]">
            {cell(ch)}
          </div>
        )),
      )}
    </div>
  );
}

interface Props {
  level: LevelDef;
  stars: number;
  unlocked: boolean;
  onPlay: () => void;
  delay?: number;
}

export function LevelCard({ level, stars, unlocked, onPlay, delay = 0 }: Props) {
  const done = stars > 0;
  const diffColor = { Fácil: 'bg-green-100 text-green-700', Media: 'bg-amber-100 text-amber-700', Difícil: 'bg-rose-100 text-rose-700' }[
    level.difficulty
  ];

  return (
    <article
      className={`group relative flex flex-col rounded-[2rem] bg-white p-5 shadow-[0_8px_0_0_#ddd6fe] border-2 border-violet-100 transition-transform duration-300 animate-fade-up ${
        unlocked ? 'hover:-translate-y-2' : 'opacity-80'
      }`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className="grid place-items-center w-14 h-14 rounded-2xl text-white font-display text-3xl shadow-md group-hover:animate-wiggle"
          style={{ background: unlocked ? level.color : '#94a3b8' }}
        >
          {unlocked ? level.id : <Lock size={24} />}
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${diffColor}`}>{level.difficulty}</span>
      </div>

      <h3 className="mt-3 font-display text-2xl leading-tight text-indigo-950">
        Nivel {level.id}: {level.title}
      </h3>
      <p className="text-sm font-bold text-slate-500">Aprenderás: {level.concept}</p>

      <div className={`my-4 rounded-2xl p-2 ${unlocked ? '' : 'grayscale'}`} style={{ background: `${level.color}22` }}>
        <MiniMap level={level} />
      </div>

      <div className="mt-auto flex items-center justify-between gap-2">
        <StarRating value={stars} />
        {unlocked ? (
          <Button
            variant={done ? 'white' : 'green'}
            size="sm"
            onClick={onPlay}
            icon={done ? <RotateCcw size={16} /> : <Play size={16} className="fill-current" />}
          >
            {done ? 'Jugar otra vez' : 'Jugar'}
          </Button>
        ) : (
          <span className="flex items-center gap-1 text-xs font-extrabold text-slate-400">
            <Lock size={14} /> Completa el nivel {level.id - 1}
          </span>
        )}
      </div>
    </article>
  );
}
