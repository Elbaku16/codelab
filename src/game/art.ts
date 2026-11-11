/** Ilustraciones vectoriales del videojuego (se convierten en texturas de Phaser). */

export const ROBOT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="160" height="160">
  <ellipse cx="60" cy="112" rx="34" ry="6" fill="#1e1b4b" opacity=".18"/>
  <rect x="57" y="6" width="6" height="18" rx="3" fill="#6d28d9"/>
  <circle cx="60" cy="8" r="7" fill="#facc15" stroke="#ca8a04" stroke-width="2"/>
  <rect x="22" y="22" width="76" height="52" rx="20" fill="#a78bfa" stroke="#4c1d95" stroke-width="4"/>
  <rect x="31" y="31" width="58" height="34" rx="14" fill="#1e1b4b"/>
  <circle cx="47" cy="48" r="8" fill="#5eead4"/>
  <circle cx="73" cy="48" r="8" fill="#5eead4"/>
  <circle cx="49" cy="45" r="3" fill="#fff"/>
  <circle cx="75" cy="45" r="3" fill="#fff"/>
  <rect x="14" y="40" width="10" height="18" rx="5" fill="#7c3aed" stroke="#4c1d95" stroke-width="3"/>
  <rect x="96" y="40" width="10" height="18" rx="5" fill="#7c3aed" stroke="#4c1d95" stroke-width="3"/>
  <rect x="32" y="74" width="56" height="28" rx="10" fill="#8b5cf6" stroke="#4c1d95" stroke-width="4"/>
  <circle cx="60" cy="88" r="6" fill="#facc15" stroke="#ca8a04" stroke-width="2"/>
  <rect x="26" y="98" width="22" height="12" rx="6" fill="#334155"/>
  <rect x="72" y="98" width="22" height="12" rx="6" fill="#334155"/>
</svg>`;

export const STAR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="128" height="128">
  <path d="M50 6l12.6 27.2 29.7 3.3-22.1 20.2 6.1 29.3L50 71.2 23.7 86l6.1-29.3L7.7 36.5l29.7-3.3z" fill="#facc15" stroke="#d97706" stroke-width="5" stroke-linejoin="round"/>
  <path d="M50 18l8 17 18 2" fill="none" stroke="#fef9c3" stroke-width="5" stroke-linecap="round"/>
  <circle cx="41" cy="50" r="4" fill="#78350f"/>
  <circle cx="59" cy="50" r="4" fill="#78350f"/>
  <path d="M43 60q7 6 14 0" fill="none" stroke="#78350f" stroke-width="3.5" stroke-linecap="round"/>
</svg>`;

export const ROCK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="128" height="128">
  <ellipse cx="50" cy="88" rx="38" ry="7" fill="#1e1b4b" opacity=".18"/>
  <path d="M14 82 22 44 42 22 66 26 84 46 88 82z" fill="#94a3b8" stroke="#475569" stroke-width="5" stroke-linejoin="round"/>
  <path d="M42 22 50 50 84 46M50 50 36 82M50 50 70 82" fill="none" stroke="#64748b" stroke-width="4" stroke-linejoin="round"/>
  <path d="M28 46 40 30" stroke="#e2e8f0" stroke-width="5" stroke-linecap="round"/>
</svg>`;

export const FLAG_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="128" height="128">
  <ellipse cx="34" cy="90" rx="20" ry="5" fill="#1e1b4b" opacity=".18"/>
  <rect x="28" y="10" width="7" height="80" rx="3.5" fill="#475569"/>
  <path d="M35 14h46l-10 15 10 15H35z" fill="#ec4899" stroke="#9d174d" stroke-width="4" stroke-linejoin="round"/>
  <circle cx="31.5" cy="10" r="6" fill="#facc15" stroke="#ca8a04" stroke-width="2"/>
</svg>`;

export function svgToImage(svg: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });
}

export type GameImages = Record<'robot' | 'star' | 'rock' | 'flag', HTMLImageElement>;

let cache: Promise<GameImages> | null = null;

export function loadGameImages(): Promise<GameImages> {
  if (!cache) {
    cache = Promise.all([
      svgToImage(ROBOT_SVG),
      svgToImage(STAR_SVG),
      svgToImage(ROCK_SVG),
      svgToImage(FLAG_SVG),
    ]).then(([robot, star, rock, flag]) => ({ robot, star, rock, flag }));
  }
  return cache;
}
