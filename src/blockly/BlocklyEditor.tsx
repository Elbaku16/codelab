import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as Blockly from 'blockly/core';
import type { LevelDef } from '../types';
import { buildToolbox, createTheme, registerBlocks } from './blocks';
import { compileWorkspace, countProgramBlocks, type CompileResult } from './compile';
import { loadWorkspace, saveWorkspace } from '../lib/progress';

export interface BlocklyEditorHandle {
  compile(): CompileResult;
  highlight(id: string | null): void;
  clear(): void;
  blockCount(): number;
}

interface Props {
  level: LevelDef;
  onBlocksChange?: (programBlocks: number, totalBlocks: number) => void;
}

function addStartBlock(ws: Blockly.WorkspaceSvg) {
  const start = ws.newBlock('codelab_start');
  start.setDeletable(false);
  start.initSvg();
  start.render();
  start.moveBy(40, 40);
  return start;
}

/** Editor de bloques Blockly: caja de herramientas (izquierda) + área de programación (centro). */
export const BlocklyEditor = forwardRef<BlocklyEditorHandle, Props>(function BlocklyEditor(
  { level, onBlocksChange },
  ref,
) {
  const host = useRef<HTMLDivElement>(null);
  const wsRef = useRef<Blockly.WorkspaceSvg | null>(null);
  const onChangeRef = useRef(onBlocksChange);
  onChangeRef.current = onBlocksChange;

  useEffect(() => {
    registerBlocks();
    const el = host.current!;
    const ws = Blockly.inject(el, {
      toolbox: buildToolbox(level.id),
      theme: createTheme(),
      renderer: 'zelos',
      media: './blockly-media/',
      trashcan: true,
      sounds: true,
      maxBlocks: Number.isFinite(level.maxBlocks) ? level.maxBlocks : Infinity,
      maxInstances: { codelab_start: 1 },
      move: { scrollbars: true, drag: true, wheel: false },
      zoom: { controls: true, wheel: true, startScale: 0.9, maxScale: 1.6, minScale: 0.5, scaleSpeed: 1.15 },
      grid: { spacing: 28, length: 3, colour: '#e2e8f0', snap: true },
    });
    wsRef.current = ws;

    // Restaurar el programa guardado o crear el bloque inicial
    const saved = loadWorkspace(level.id);
    let restored = false;
    if (saved) {
      try {
        Blockly.serialization.workspaces.load(saved, ws);
        restored = ws.getTopBlocks(false).some((b) => b.type === 'codelab_start');
      } catch {
        ws.clear();
      }
    }
    if (!restored) {
      ws.clear();
      addStartBlock(ws);
    }
    ws.getTopBlocks(false)
      .filter((b) => b.type === 'codelab_start')
      .forEach((b) => b.setDeletable(false));

    // Los bloques sueltos se desactivan (se ven grises) para que sea claro que no se ejecutan
    ws.addChangeListener(Blockly.Events.disableOrphans);

    const notify = () => {
      onChangeRef.current?.(countProgramBlocks(ws), ws.getAllBlocks(false).length);
    };
    ws.addChangeListener((e) => {
      if (e.isUiEvent) return;
      saveWorkspace(level.id, Blockly.serialization.workspaces.save(ws));
      notify();
    });
    notify();

    const ro = new ResizeObserver(() => Blockly.svgResize(ws));
    ro.observe(el);

    return () => {
      ro.disconnect();
      ws.dispose();
      wsRef.current = null;
    };
  }, [level.id, level.maxBlocks]);

  useImperativeHandle(ref, () => ({
    compile: () => compileWorkspace(wsRef.current!),
    highlight: (id) => {
      const ws = wsRef.current;
      if (!ws) return;
      ws.highlightBlock(id);
    },
    clear: () => {
      const ws = wsRef.current;
      if (!ws) return;
      Blockly.Events.setGroup(true);
      ws.getTopBlocks(false).forEach((b) => {
        if (b.type === 'codelab_start') {
          b.getNextBlock()?.dispose(false);
        } else {
          b.dispose(false);
        }
      });
      Blockly.Events.setGroup(false);
      if (!ws.getTopBlocks(false).some((b) => b.type === 'codelab_start')) addStartBlock(ws);
    },
    blockCount: () => (wsRef.current ? countProgramBlocks(wsRef.current) : 0),
  }));

  return <div ref={host} className="absolute inset-0" />;
});
