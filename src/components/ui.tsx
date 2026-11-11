import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';
import { useEffect } from 'react';
import { Star } from 'lucide-react';
import { ROBOT_SVG, STAR_SVG } from '../game/art';

// ---------------- Botón ----------------

type Variant = 'green' | 'red' | 'purple' | 'white' | 'yellow' | 'blue';

const VARIANTS: Record<Variant, { cls: string; shadow: string }> = {
  green: { cls: 'bg-green-500 text-white', shadow: '#15803d' },
  red: { cls: 'bg-rose-500 text-white', shadow: '#be123c' },
  purple: { cls: 'bg-violet-600 text-white', shadow: '#4c1d95' },
  blue: { cls: 'bg-sky-500 text-white', shadow: '#0369a1' },
  yellow: { cls: 'bg-amber-400 text-amber-950', shadow: '#b45309' },
  white: { cls: 'bg-white text-violet-900 border-2 border-violet-100', shadow: '#ddd6fe' },
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
}

export function Button({ variant = 'purple', size = 'md', icon, className = '', children, style, ...rest }: ButtonProps) {
  const v = VARIANTS[variant];
  const sizes = {
    sm: 'px-3 py-2 text-sm rounded-xl gap-1.5',
    md: 'px-5 py-3 text-base rounded-2xl gap-2',
    lg: 'px-8 py-4 text-xl rounded-3xl gap-3',
  };
  return (
    <button
      {...rest}
      style={{ ...style, ['--btn-shadow' as string]: v.shadow } as CSSProperties}
      className={`btn-3d inline-flex items-center justify-center font-extrabold select-none cursor-pointer ${v.cls} ${sizes[size]} ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}

// ---------------- Estrellas ----------------

export function StarRating({ value, max = 3, size = 22, animate = false }: { value: number; max?: number; size?: number; animate?: boolean }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${value} de ${max} estrellas`}>
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          size={size}
          strokeWidth={2.5}
          className={`${i < value ? 'fill-amber-400 text-amber-500' : 'fill-slate-200 text-slate-300'} ${animate ? 'animate-pop' : ''}`}
          style={animate ? { animationDelay: `${0.25 + i * 0.22}s` } : undefined}
        />
      ))}
    </div>
  );
}

// ---------------- Barra de progreso ----------------

export function ProgressBar({ value, max, color = '#7c3aed' }: { value: number; max: number; color?: string }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="h-4 w-full rounded-full bg-violet-100 overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div
        className="h-full rounded-full transition-all duration-700 ease-out relative"
        style={{ width: `${Math.max(pct, 4)}%`, background: color }}
      >
        <div className="absolute inset-x-2 top-1 h-1 rounded-full bg-white/40" />
      </div>
    </div>
  );
}

// ---------------- Mascota ----------------

const robotSrc = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(ROBOT_SVG);
const starSrc = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(STAR_SVG);

export function Mascot({ size = 140, float = true, className = '' }: { size?: number; float?: boolean; className?: string }) {
  return (
    <img
      src={robotSrc}
      width={size}
      height={size}
      alt="Robi, el robot"
      draggable={false}
      className={`${float ? 'animate-float' : ''} drop-shadow-xl select-none ${className}`}
    />
  );
}

export function StarArt({ size = 40, className = '' }: { size?: number; className?: string }) {
  return <img src={starSrc} width={size} height={size} alt="" draggable={false} className={`select-none ${className}`} />;
}

export function SpeechBubble({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative bg-white rounded-3xl px-5 py-3 shadow-lg border-2 border-violet-100 font-bold text-violet-900 ${className}`}>
      {children}
      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rotate-45 bg-white border-l-2 border-b-2 border-violet-100" />
    </div>
  );
}

// ---------------- Modal ----------------

export function Modal({ open, onClose, children }: { open: boolean; onClose?: () => void; children: ReactNode }) {
  useEffect(() => {
    if (!open || !onClose) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] grid place-items-center p-4 bg-indigo-950/50 backdrop-blur-sm animate-fade-up" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto bg-white rounded-[2rem] shadow-2xl p-6 sm:p-8 animate-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
