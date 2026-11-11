# CODELAB 🤖

Aplicación educativa para aprender a programar (12–15 años) guiando al robot **Robi** con bloques visuales.

- **React + TypeScript + Vite + Tailwind CSS**
- **Google Blockly** para la programación con bloques (categorías: Eventos, Movimiento, Control, Condiciones)
- **Phaser 3** para el videojuego: los bloques se compilan a un programa que un intérprete ejecuta paso a paso sobre la escena

## Niveles
1. **Movimiento** – secuencias y orientación (llegar a la estrella)
2. **Repeticiones** – ciclos con `repetir N veces` (recoger 4 estrellas, máx. 8 bloques)
3. **Condiciones** – `si / si no` + `repetir hasta la meta` (esquivar rocas, máx. 7 bloques)

El progreso y los programas se guardan en el navegador (localStorage). No hay backend ni cuentas.

## Uso
```bash
npm install
npm run dev       # desarrollo
npm run verify    # comprueba que los 3 niveles se pueden completar
npm run build     # genera dist/
```

## Publicar en GitHub Pages
`vite.config.ts` usa `base: './'`, así que `dist/` funciona en cualquier ruta. Para publicar:
```bash
npm run build
npx gh-pages -d dist   # o subir dist/ a la rama gh-pages
```
