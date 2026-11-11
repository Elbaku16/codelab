import { useCallback, useEffect, useState } from 'react';
import { LEVELS } from '../data/levels';

const KEY = 'codelab-progress-v1';

export interface Progress {
  /** estrellas obtenidas por nivel (0 = no completado) */
  stars: Record<number, number>;
  seenIntro: Record<number, boolean>;
}

const empty = (): Progress => ({ stars: {}, seenIntro: {} });

function read(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const p = JSON.parse(raw) as Partial<Progress>;
    return { stars: p.stars ?? {}, seenIntro: p.seenIntro ?? {} };
  } catch {
    return empty();
  }
}

function write(p: Progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* almacenamiento no disponible: el progreso vive solo en memoria */
  }
}

export function isUnlocked(p: Progress, levelId: number) {
  return levelId === 1 || (p.stars[levelId - 1] ?? 0) > 0;
}

export function totalStars(p: Progress) {
  return Object.values(p.stars).reduce((a, b) => a + b, 0);
}

export function completedCount(p: Progress) {
  return LEVELS.filter((l) => (p.stars[l.id] ?? 0) > 0).length;
}

/** Siguiente nivel recomendado: el primero sin completar que esté desbloqueado. */
export function nextLevel(p: Progress) {
  return LEVELS.find((l) => !(p.stars[l.id] > 0) && isUnlocked(p, l.id))?.id ?? LEVELS[LEVELS.length - 1].id;
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(read);

  useEffect(() => write(progress), [progress]);

  const completeLevel = useCallback((levelId: number, stars: number) => {
    setProgress((p) => ({ ...p, stars: { ...p.stars, [levelId]: Math.max(p.stars[levelId] ?? 0, stars) } }));
  }, []);

  const markIntro = useCallback((levelId: number) => {
    setProgress((p) => ({ ...p, seenIntro: { ...p.seenIntro, [levelId]: true } }));
  }, []);

  const resetProgress = useCallback(() => {
    try {
      LEVELS.forEach((l) => localStorage.removeItem(workspaceKey(l.id)));
    } catch {
      /* ignorar */
    }
    setProgress(empty());
  }, []);

  return { progress, completeLevel, markIntro, resetProgress };
}

export const workspaceKey = (levelId: number) => `codelab-workspace-${levelId}`;

export function loadWorkspace(levelId: number): object | null {
  try {
    const raw = localStorage.getItem(workspaceKey(levelId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveWorkspace(levelId: number, state: object) {
  try {
    localStorage.setItem(workspaceKey(levelId), JSON.stringify(state));
  } catch {
    /* ignorar */
  }
}

export function scoreFor(blocks: number, optimal: number) {
  if (blocks <= optimal) return 3;
  if (blocks <= optimal + 2) return 2;
  return 1;
}
