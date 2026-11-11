import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import Phaser from 'phaser';
import type { LevelDef } from '../types';
import { loadGameImages } from './art';
import { RobotScene } from './RobotScene';
import { parseLevel } from './world';

export interface GameViewHandle {
  scene(): RobotScene | null;
}

interface Props {
  level: LevelDef;
  onStar?: (left: number) => void;
}

/** Contenedor React del videojuego Phaser 3. */
export const GameView = forwardRef<GameViewHandle, Props>(function GameView({ level, onStar }, ref) {
  const host = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<RobotScene | null>(null);
  const onStarRef = useRef(onStar);
  onStarRef.current = onStar;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let game: Phaser.Game | null = null;
    let cancelled = false;
    setLoading(true);

    loadGameImages().then((images) => {
      if (cancelled || !host.current) return;
      const parsed = parseLevel(level);
      const scene = new RobotScene(parsed, images, { onStar: (left) => onStarRef.current?.(left) });
      const { width, height } = RobotScene.size(parsed);
      game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: host.current,
        width,
        height,
        transparent: true,
        antialias: true,
        scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
        scene,
        banner: false,
        audio: { noAudio: true },
      } as Phaser.Types.Core.GameConfig);
      scene.readyPromise.then(() => {
        if (cancelled) return;
        sceneRef.current = scene;
        if (import.meta.env.DEV) (window as unknown as { __scene: RobotScene }).__scene = scene;
        setLoading(false);
      });
    });

    return () => {
      cancelled = true;
      sceneRef.current = null;
      game?.destroy(true);
    };
  }, [level]);

  useImperativeHandle(ref, () => ({ scene: () => sceneRef.current }));

  return (
    <div className="relative h-full w-full">
      <div ref={host} className="h-full w-full" />
      {loading && (
        <div className="absolute inset-0 grid place-items-center text-violet-500 font-bold animate-pulse">
          Cargando escenario…
        </div>
      )}
    </div>
  );
});
