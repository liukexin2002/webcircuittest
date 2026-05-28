/**
 * 编辑器状态管理
 * 使用 Zustand 管理编辑器全局状态
 */

import { create } from 'zustand';
import type { Point } from '../../domain';
import {
  Circuit,
  EditorService,
  ToolManager,
  EventEmitter,
  UndoRedoManager
} from '../..';

interface EditorState {
  circuit: Circuit | null;
  selectedIds: Set<string>;
  activeTool: string;
  viewport: {
    offset: Point;
    scale: number;
  };
  editorService: EditorService | null;
  toolManager: ToolManager | null;
  eventEmitter: EventEmitter | null;
  undoRedoManager: UndoRedoManager | null;

  setCircuit: (circuit: Circuit) => void;
  setSelectedIds: (ids: Set<string>) => void;
  setActiveTool: (tool: string) => void;
  setViewport: (viewport: Partial<EditorState['viewport']>) => void;
  setEditorService: (service: EditorService) => void;
  setToolManager: (manager: ToolManager) => void;
  setEventEmitter: (emitter: EventEmitter) => void;
  setUndoRedoManager: (manager: UndoRedoManager) => void;

  canUndo: () => boolean;
  canRedo: () => boolean;
  undo: () => void;
  redo: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  circuit: null,
  selectedIds: new Set(),
  activeTool: 'select',
  viewport: {
    offset: { x: 0, y: 0 },
    scale: 1
  },
  editorService: null,
  toolManager: null,
  eventEmitter: null,
  undoRedoManager: null,

  setCircuit: (circuit) => set({ circuit }),
  setSelectedIds: (ids) => set({ selectedIds: ids }),
  setActiveTool: (tool) => set({ activeTool: tool }),
  setViewport: (viewport) =>
    set((state) => ({
      viewport: { ...state.viewport, ...viewport }
    })),
  setEditorService: (service) => set({ editorService: service }),
  setToolManager: (manager) => set({ toolManager: manager }),
  setEventEmitter: (emitter) => set({ eventEmitter: emitter }),
  setUndoRedoManager: (manager) => set({ undoRedoManager: manager }),

  canUndo: () => get().undoRedoManager?.canUndo() ?? false,
  canRedo: () => get().undoRedoManager?.canRedo() ?? false,
  undo: () => get().undoRedoManager?.undo(),
  redo: () => get().undoRedoManager?.redo()
}));
