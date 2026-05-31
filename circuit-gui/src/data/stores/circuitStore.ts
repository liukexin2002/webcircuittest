import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { nanoid } from 'nanoid';
import type { Device, Connection, Point, DeviceTypeValue, PinRef, Pin } from '../../domain/types';
import { DEVICE_TEMPLATES } from '../../domain/templates/deviceTemplates';

interface CircuitState {
  devices: Record<string, Device>;
  connections: Record<string, Connection>;
  viewport: {
    offset: Point;
    zoom: number;
  };
  selectedDeviceIds: Set<string>;
  selectedConnectionIds: Set<string>;
  activeTool: 'select' | 'place' | 'wire';
  gridSize: number;
  showGrid: boolean;
}

interface CircuitActions {
  addDevice: (type: DeviceTypeValue, position: Point) => string;
  removeDevice: (id: string) => void;
  moveDevice: (id: string, position: Point) => void;
  selectDevice: (id: string, multi?: boolean) => void;
  deselectAll: () => void;
  addConnection: (source: PinRef, target: PinRef) => string;
  removeConnection: (id: string) => void;
  selectConnection: (id: string, multi?: boolean) => void;
  setViewport: (viewport: Partial<CircuitState['viewport']>) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
  setActiveTool: (tool: CircuitState['activeTool']) => void;
  deleteSelected: () => void;
  updateConnectionPath: (id: string, waypoints: Point[], pathData: string) => void;
}

type CircuitStore = CircuitState & CircuitActions;

function snapToGrid(point: Point, gridSize: number): Point {
  return {
    x: Math.round(point.x / gridSize) * gridSize,
    y: Math.round(point.y / gridSize) * gridSize,
  };
}

export const useCircuitStore = create<CircuitStore>()(
  immer((set, get) => ({
    devices: {},
    connections: {},
    viewport: {
      offset: { x: 0, y: 0 },
      zoom: 1,
    },
    selectedDeviceIds: new Set(),
    selectedConnectionIds: new Set(),
    activeTool: 'select',
    gridSize: 10,
    showGrid: true,

    addDevice: (type, position) => {
      const id = nanoid();
      const template = DEVICE_TEMPLATES[type];
      const label = `${template.labelPrefix}${Object.keys(get().devices).length + 1}`;

      set((state) => {
        state.devices[id] = {
          id,
          type,
          label,
          position: snapToGrid(position, state.gridSize),
          rotation: 0,
          size: template.size,
          pins: template.pins.map((pin, idx) => ({
            id: `${id}-pin-${idx}`,
            deviceId: id,
            name: pin.name,
            type: pin.type,
            position: pin.position,
            offset: {
              x: position.x + pin.position.x,
              y: position.y + pin.position.y,
            },
          })),
          selected: false,
          properties: { ...template.defaultProperties },
        };
      });

      return id;
    },

    removeDevice: (id) =>
      set((state) => {
        Object.values(state.connections)
          .filter((conn) => conn.sourceDeviceId === id || conn.targetDeviceId === id)
          .forEach((conn) => delete state.connections[conn.id]);
        delete state.devices[id];
        state.selectedDeviceIds.delete(id);
      }),

    moveDevice: (id, position) =>
      set((state) => {
        const device = state.devices[id];
        if (!device) return;

        const snappedPos = snapToGrid(position, state.gridSize);
        const deltaX = snappedPos.x - device.position.x;
        const deltaY = snappedPos.y - device.position.y;

        device.position = snappedPos;

        device.pins.forEach((pin) => {
          pin.offset.x += deltaX;
          pin.offset.y += deltaY;
        });
      }),

    selectDevice: (id, multi = false) =>
      set((state) => {
        if (multi) {
          if (state.selectedDeviceIds.has(id)) {
            state.selectedDeviceIds.delete(id);
          } else {
            state.selectedDeviceIds.add(id);
          }
        } else {
          state.selectedDeviceIds.clear();
          state.selectedDeviceIds.add(id);
          state.selectedConnectionIds.clear();
        }

        Object.values(state.devices).forEach((d) => {
          d.selected = state.selectedDeviceIds.has(d.id);
        });
      }),

    deselectAll: () =>
      set((state) => {
        state.selectedDeviceIds.clear();
        state.selectedConnectionIds.clear();
        Object.values(state.devices).forEach((d) => (d.selected = false));
        Object.values(state.connections).forEach((c) => (c.selected = false));
      }),

    addConnection: (source, target) => {
      const id = nanoid();

      set((state) => {
        state.connections[id] = {
          id,
          sourcePinId: source.pinId,
          sourceDeviceId: source.deviceId,
          targetPinId: target.pinId,
          targetDeviceId: target.deviceId,
          waypoints: [],
          pathData: '',
          selected: false,
        };
      });

      return id;
    },

    removeConnection: (id) =>
      set((state) => {
        delete state.connections[id];
        state.selectedConnectionIds.delete(id);
      }),

    selectConnection: (id, multi = false) =>
      set((state) => {
        if (multi) {
          if (state.selectedConnectionIds.has(id)) {
            state.selectedConnectionIds.delete(id);
          } else {
            state.selectedConnectionIds.add(id);
          }
        } else {
          state.selectedConnectionIds.clear();
          state.selectedConnectionIds.add(id);
          state.selectedDeviceIds.clear();
        }

        Object.values(state.connections).forEach((c) => {
          c.selected = state.selectedConnectionIds.has(c.id);
        });
      }),

    setViewport: (viewport) =>
      set((state) => {
        Object.assign(state.viewport, viewport);
      }),

    zoomIn: () =>
      set((state) => {
        state.viewport.zoom = Math.min(state.viewport.zoom * 1.2, 5.0);
      }),

    zoomOut: () =>
      set((state) => {
        state.viewport.zoom = Math.max(state.viewport.zoom / 1.2, 0.1);
      }),

    resetView: () =>
      set((state) => {
        state.viewport = { offset: { x: 0, y: 0 }, zoom: 1 };
      }),

    setActiveTool: (tool) =>
      set(() => ({
        activeTool: tool,
      })),

    deleteSelected: () =>
      set((state) => {
        state.selectedDeviceIds.forEach((id) => {
          Object.values(state.connections)
            .filter((c) => c.sourceDeviceId === id || c.targetDeviceId === id)
            .forEach((c) => delete state.connections[c.id]);
          delete state.devices[id];
        });

        state.selectedConnectionIds.forEach((id) => {
          delete state.connections[id];
        });

        state.selectedDeviceIds.clear();
        state.selectedConnectionIds.clear();
      }),

    updateConnectionPath: (id, waypoints, pathData) =>
      set((state) => {
        const conn = state.connections[id];
        if (conn) {
          conn.waypoints = waypoints;
          conn.pathData = pathData;
        }
      }),
  }))
);
