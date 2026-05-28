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
import type { PlacedDeviceData } from '../components/PlacedDevice';

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

  placedDevices: PlacedDeviceData[];
  selectedDeviceId: string | null;

  setCircuit: (circuit: Circuit) => void;
  setSelectedIds: (ids: Set<string>) => void;
  setActiveTool: (tool: string) => void;
  setViewport: (viewport: Partial<EditorState['viewport']>) => void;
  setEditorService: (service: EditorService) => void;
  setToolManager: (manager: ToolManager) => void;
  setEventEmitter: (emitter: EventEmitter) => void;
  setUndoRedoManager: (manager: UndoRedoManager) => void;

  addPlacedDevice: (device: PlacedDeviceData) => void;
  removePlacedDevice: (id: string) => void;
  movePlacedDevice: (id: string, position: Point) => void;
  selectDevice: (id: string | null) => void;
  clearSelection: () => void;

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

  placedDevices: [],
  selectedDeviceId: null,

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

  addPlacedDevice: (device) =>
    set((state) => ({
      placedDevices: [...state.placedDevices, device]
    })),

  removePlacedDevice: (id) =>
    set((state) => ({
      placedDevices: state.placedDevices.filter((d) => d.id !== id),
      selectedDeviceId: state.selectedDeviceId === id ? null : state.selectedDeviceId
    })),

  movePlacedDevice: (id, position) =>
    set((state) => ({
      placedDevices: state.placedDevices.map((d) =>
        d.id === id ? { ...d, position } : d
      )
    })),

  selectDevice: (id) => set({ selectedDeviceId: id }),

  clearSelection: () => set({ selectedDeviceId: null }),

  canUndo: () => get().undoRedoManager?.canUndo() ?? false,
  canRedo: () => get().undoRedoManager?.canRedo() ?? false,
  undo: () => get().undoRedoManager?.undo(),
  redo: () => get().undoRedoManager?.redo()
}));
