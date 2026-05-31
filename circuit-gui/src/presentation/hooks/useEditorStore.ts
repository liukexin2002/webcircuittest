/**
 * 编辑器状态管理
 * 使用 Zustand 管理编辑器全局状态
 */

import { create } from 'zustand';
import type { Point, Id } from '../../domain';
import {
  Circuit,
  EditorService,
  ToolManager,
  EventEmitter,
  UndoRedoManager,
  Connection,
  Net
} from '../..';
import type { PlacedDeviceData } from '../components/PlacedDevice';

export interface WiringState {
  active: boolean;
  source?: { deviceId: Id; pinId: Id };
  tempPosition?: Point;
  tempWaypoints: Point[];
}

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

  connections: Connection[];
  selectedConnectionId: string | null;
  wiring: WiringState;
  highlightedPin: { deviceId: Id; pinId: Id } | null;
  nets: Net[];

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

  addConnection: (connection: Connection) => void;
  removeConnection: (id: string) => void;
  updateConnection: (id: string, updates: Partial<Connection>) => void;
  selectConnection: (id: string | null) => void;

  startWiring: (deviceId: Id, pinId: Id, position: Point) => void;
  updateWiringPosition: (position: Point) => void;
  addWiringWaypoint: (position: Point) => void;
  finishWiring: () => void;
  cancelWiring: () => void;
  setHighlightedPin: (pin: { deviceId: Id; pinId: Id } | null) => void;

  addNet: (net: Net) => void;
  removeNet: (id: string) => void;

  canUndo: () => boolean;
  canRedo: () => boolean;
  undo: () => void;
  redo: () => void;
}

const calculateOrthogonalPath = (start: Point, end: Point) => {
  const midX = (start.x + end.x) / 2;
  return [
    start,
    { x: midX, y: start.y },
    { x: midX, y: end.y },
    end
  ];
};

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

  connections: [],
  selectedConnectionId: null,
  wiring: {
    active: false,
    tempWaypoints: []
  },
  highlightedPin: null,
  nets: [],

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

  clearSelection: () => set({ selectedDeviceId: null, selectedConnectionId: null }),

  addConnection: (connection) =>
    set((state) => ({
      connections: [...state.connections, connection]
    })),

  removeConnection: (id) =>
    set((state) => ({
      connections: state.connections.filter((c) => c.id !== id),
      selectedConnectionId: state.selectedConnectionId === id ? null : state.selectedConnectionId
    })),

  updateConnection: (id, updates) =>
    set((state) => ({
      connections: state.connections.map((c) =>
        c.id === id ? Object.assign({}, c, updates) : c
      )
    })),

  selectConnection: (id) => set({ selectedConnectionId: id }),

  startWiring: (deviceId, pinId, position) =>
    set({
      wiring: {
        active: true,
        source: { deviceId, pinId },
        tempPosition: position,
        tempWaypoints: [{ ...position }]
      }
    }),

  updateWiringPosition: (position) =>
    set((state) => {
      if (!state.wiring.active || !state.wiring.source) {
        return state;
      }

      const start = state.wiring.tempWaypoints[0];
      if (!start) return state;

      const path = calculateOrthogonalPath(start, position);
      
      return {
        wiring: {
          ...state.wiring,
          tempPosition: position,
          tempWaypoints: path
        }
      };
    }),

  addWiringWaypoint: (position) =>
    set((state) => ({
      wiring: {
        ...state.wiring,
        tempWaypoints: [...state.wiring.tempWaypoints, { ...position }]
      }
    })),

  finishWiring: () =>
    set({
      wiring: {
        active: false,
        tempWaypoints: []
      }
    }),

  cancelWiring: () =>
    set({
      wiring: {
        active: false,
        tempWaypoints: []
      }
    }),

  setHighlightedPin: (pin) => set({ highlightedPin: pin }),

  addNet: (net) =>
    set((state) => ({
      nets: [...state.nets, net]
    })),

  removeNet: (id) =>
    set((state) => ({
      nets: state.nets.filter((n) => n.id !== id)
    })),

  canUndo: () => get().undoRedoManager?.canUndo() ?? false,
  canRedo: () => get().undoRedoManager?.canRedo() ?? false,
  undo: () => get().undoRedoManager?.undo(),
  redo: () => get().undoRedoManager?.redo()
}));
