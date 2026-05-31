# Circuit-GUI RLC 编辑器技术实施计划

## 1. 架构设计概览

### 1.1 整体架构（基于现有五层架构）

```
┌─────────────────────────────────────────────────────────────┐
│                    展示层 (Presentation)                     │
│  ┌────────────┐ ┌─────────────┐ ┌────────────────────────┐  │
│  │ Toolbar    │ │ Device      │ │ Canvas (SVG)          │  │
│  │ Component  │ │ Palette     │ │ - DeviceNode          │  │
│  │            │ │             │ │ - ConnectionWire       │  │
│  │            │ │             │ │ - PinHandle            │  │
│  └────────────┘ └─────────────┘ └────────────────────────┘  │
│  ┌────────────┐                                              │
│  │ StatusBar  │                                              │
│  └────────────┘                                              │
└────────────────────────┬────────────────────────────────────┘
                         │ 依赖
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    应用层 (Application)                       │
│  ┌─────────────┐ ┌──────────────┐ ┌──────────────────────┐  │
│  │ Editor      │ │ Selection    │ │ Routing              │  │
│  │ Service     │ │ Manager      │ │ Service (libavoid)   │  │
│  └─────────────┘ └──────────────┘ └──────────────────────┘  │
│  ┌─────────────┐                                              │
│  │ ToolManager │                                              │
│  └─────────────┘                                              │
└────────────────────────┬────────────────────────────────────┘
                         │ 依赖
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      领域层 (Domain)                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐  │
│  │ Circuit  │ │ Device   │ │ Pin      │ │ Connection     │  │
│  │ Entity   │ │ Entity   │ │ Entity   │ │ Entity         │  │
│  └──────────┘ └──────────┘ └──────────┘ └────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ 依赖
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   数据访问层 (Data Access)                    │
│  ┌──────────────┐ ┌──────────────┐ ┌────────────────────┐   │
│  │ Zustand Store│ │ UndoRedo     │ │ Event Emitter       │   │
│  │ (circuitStore)│ │ Manager      │ │ (预留)              │   │
│  └──────────────┘ └──────────────┘ └────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ 依赖
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   基础设施层 (Infrastructure)                  │
│  ┌──────────────┐ ┌──────────────┐ ┌────────────────────┐   │
│  │ libavoid WASM │ │ Geometry Utils│ │ ID Generator        │   │
│  │ (正交布线算法) │ │ (吸附/碰撞检测)│ │ (nanoid)           │   │
│  └──────────────┘ └──────────────┘ └────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 技术栈确认

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19.2.6 | UI 框架 |
| TypeScript | 6.0.2 | 类型安全 |
| Vite | 8.0.12 | 构建工具 |
| Tailwind CSS | 3.4.1 | 样式系统 |
| shadcn/ui | latest | UI 组件库 |
| Zustand | 4.5.0 | 状态管理 |
| immer | 9.x | 不可变更新中间件 |
| libavoid-js | 0.4.5 | 正交布线算法 (WASM) |
| nanoid | 5.x | 唯一 ID 生成 |

---

## 2. 目录结构设计

```
circuit-gui/
├── src/
│   ├── presentation/                 # 展示层
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AppLayout.tsx     # 主布局容器
│   │   │   │   ├── Toolbar.tsx       # 顶部工具栏
│   │   │   │   ├── StatusBar.tsx     # 底部状态栏
│   │   │   │   └── SplitPane.tsx     # 左右分栏组件
│   │   │   ├── canvas/
│   │   │   │   ├── Canvas.tsx        # 画布主组件
│   │   │   │   ├── CanvasGrid.tsx    # 网格背景
│   │   │   │   ├── DeviceNode.tsx    # 器件节点组件
│   │   │   │   ├── PinHandle.tsx     # 引脚连接点
│   │   │   │   └── ConnectionWire.tsx # 连线渲染
│   │   │   └── palette/
│   │   │       ├── DevicePalette.tsx # 器件面板容器
│   │   │       └── PaletteItem.tsx   # 单个器件项
│   │   ├── hooks/
│   │   │   ├── useCanvasEvents.ts   # 画布事件处理
│   │   │   ├── useDragDrop.ts       # 拖拽逻辑
│   │   │   ├── useAutoLayout.ts     # 自动布局（预留）
│   │   │   └── useKeyboardShortcuts.ts # 键盘快捷键
│   │   └── index.ts
│   │
│   ├── application/                  # 应用层
│   │   ├── services/
│   │   │   ├── EditorService.ts     # 编辑器核心服务
│   │   │   ├── SelectionService.ts  # 选择管理服务
│   │   │   └── RoutingService.ts    # 布线服务（libavoid封装）
│   │   ├── managers/
│   │   │   ├── ToolManager.ts       # 工具管理器
│   │   │   └── tools/
│   │   │       ├── SelectTool.ts    # 选择工具
│   │   │       ├── PlaceTool.ts     # 放置工具
│   │   │       └── WireTool.ts      # 连线工具
│   │   └── index.ts
│   │
│   ├── domain/                       # 领域层
│   │   ├── entities/
│   │   │   ├── Device.ts            # 设备实体
│   │   │   ├── Pin.ts               # 引脚实体
│   │   │   ├── Connection.ts        # 连线实体
│   │   │   └── Circuit.ts           # 电路聚合根
│   │   ├── types/
│   │   │   └── index.ts             # 类型导出
│   │   ├── templates/
│   │   │   └── deviceTemplates.ts   # R/L/C 模板配置
│   │   └── index.ts
│   │
│   ├── data/                        # 数据访问层
│   │   ├── stores/
│   │   │   ├── circuitStore.ts      # 电路状态 Store
│   │   │   └── uiStore.ts           # UI 状态 Store（可选）
│   │   ├── managers/
│   │   │   └── UndoRedoManager.ts   # 撤销重做管理器
│   │   └── index.ts
│   │
│   ├── infrastructure/               # 基础设施层
│   │   ├── routing/
│   │   │   ├── libavoid/
│   │   │   │   ├── libavoid.worker.ts   # Web Worker 封装
│   │   │   │   └── libavoidRouter.ts    # 路由计算封装
│   │   │   └── router.ts             # 路由接口定义
│   │   ├── geometry/
│   │   │   └── GeometryUtils.ts      # 几何计算工具
│   │   ├── utils/
│   │   │   ├── IdGenerator.ts        # ID 生成器
│   │   │   └── snapToGrid.ts         # 网格吸附
│   │   └── index.ts
│   │
│   ├── App.tsx                       # 应用入口
│   ├── main.tsx                      # 渲染入口
│   └── index.css                     # 全局样式
│
├── docs/
│   ├── ARCHITECTURE.md               # 总体架构文档
│   ├── PRD-RLC-Editor.md             # 产品需求文档
│   └── IMPLEMENTATION-PLAN.md        # 本文档
│
├── public/
│   └── libavoid.wasm                 # libavoid WASM 文件
│
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

---

## 3. 核心模块详细设计

### 3.1 状态管理设计（Zustand Store）

```typescript
// data/stores/circuitStore.ts

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { nanoid } from 'nanoid';

// ===== 类型定义 =====
interface CircuitState {
  // 实体数据
  devices: Record<string, Device>;
  connections: Record<string, Connection>;

  // 视口状态
  viewport: {
    offset: { x: number; y: number };
    zoom: number;
  };

  // 选择状态
  selectedDeviceIds: Set<string>;
  selectedConnectionIds: Set<string>;

  // 工具状态
  activeTool: 'select' | 'place' | 'wire';

  // 网格设置
  gridSize: number;
  showGrid: boolean;
}

interface CircuitActions {
  // 设备操作
  addDevice: (type: DeviceType, position: Point) => string;
  removeDevice: (id: string) => void;
  moveDevice: (id: string, position: Point) => void;
  selectDevice: (id: string, multi?: boolean) => void;
  deselectAll: () => void;

  // 连线操作
  addConnection: (source: PinRef, target: PinRef) => string;
  removeConnection: (id: string) => void;
  selectConnection: (id: string, multi?: boolean) => void;

  // 视口操作
  setViewport: (viewport: Partial<CircuitState['viewport']>) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;

  // 工具切换
  setActiveTool: (tool: CircuitState['activeTool']) => void;

  // 批量操作
  deleteSelected: () => void;
}

type CircuitStore = CircuitState & CircuitActions;

// ===== Store 实现 =====
export const useCircuitStore = create<CircuitStore>()(
  immer((set, get) => ({
    // ===== 初始状态 =====
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

    // ===== 设备操作 =====
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
        // 删除关联的连线
        Object.values(state.connections)
          .filter((conn) => conn.sourceDeviceId === id || conn.targetDeviceId === id)
          .forEach((conn) => delete state.connections[conn.id]);

        // 删除设备
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

        // 更新引脚全局坐标
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

        // 更新设备的选中状态
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

    // ===== 连线操作 =====
    addConnection: (source, target) => {
      const id = nanoid();

      set((state) => {
        state.connections[id] = {
          id,
          sourcePinId: source.pinId,
          sourceDeviceId: source.deviceId,
          targetPinId: target.pinId,
          targetDeviceId: target.deviceId,
          waypoints: [],  // 将由 RoutingService 计算
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

    // ===== 视口操作 =====
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

    // ===== 工具切换 =====
    setActiveTool: (tool) =>
      set(() => ({
        activeTool: tool,
      })),

    // ===== 批量操作 =====
    deleteSelected: () =>
      set((state) => {
        // 删除选中的设备及其连线
        state.selectedDeviceIds.forEach((id) => {
          Object.values(state.connections)
            .filter(
              (c) =>
                c.sourceDeviceId === id ||
                c.targetDeviceId === id
            )
            .forEach((c) => delete state.connections[c.id]);
          delete state.devices[id];
        });

        // 删除选中的连线
        state.selectedConnectionIds.forEach((id) => {
          delete state.connections[id];
        });

        state.selectedDeviceIds.clear();
        state.selectedConnectionIds.clear();
      }),
  }))
);

// ===== 辅助函数 =====
function snapToGrid(point: Point, gridSize: number): Point {
  return {
    x: Math.round(point.x / gridSize) * gridSize,
    y: Math.round(point.y / gridSize) * gridSize,
  };
}
```

### 3.2 EditorService 设计

```typescript
// application/services/EditorService.ts

import { useCircuitStore } from '../../data/stores/circuitStore';
import type { Device, Connection, Point, DeviceType, PinRef } from '../types';

export class EditorService {
  private store = useCircuitStore;

  /**
   * 添加器件
   */
  addDevice(type: DeviceType, position: Point): string {
    return this.store.getState().addDevice(type, position);
  }

  /**
   * 删除器件
   */
  removeDevice(deviceId: string): void {
    this.store.getState().removeDevice(deviceId);
  }

  /**
   * 移动器件
   */
  moveDevice(deviceId: string, position: Point): void {
    this.store.getState().moveDevice(deviceId, position);
  }

  /**
   * 创建连线（异步，因为需要调用 libavoid）
   */
  async createConnection(source: PinRef, target: PinRef): Promise<string> {
    const connectionId = this.store.getState().addConnection(source, target);

    // 调用路由服务计算路径
    const routingService = new RoutingService();
    const routeResult = await routingService.calculateRoute(source, target);

    // 更新连线路径数据
    // TODO: 实现 updateConnectionPath 方法

    return connectionId;
  }

  /**
   * 删除连线
   */
  removeConnection(connectionId: string): void {
    this.store.getState().removeConnection(connectionId);
  }

  /**
   * 获取器件信息
   */
  getDevice(deviceId: string): Device | undefined {
    return this.store.getState().devices[deviceId];
  }

  /**
   * 获取所有器件
   */
  getAllDevices(): Device[] {
    return Object.values(this.store.getState().devices);
  }

  /**
   * 获取指定位置的器件（命中测试）
   */
  getDeviceAtPoint(point: Point, tolerance = 5): Device | undefined {
    const devices = this.getAllDevices();

    for (const device of devices) {
      const bounds = this.getDeviceBounds(device);
      if (
        point.x >= bounds.x - tolerance &&
        point.x <= bounds.x + bounds.width + tolerance &&
        point.y >= bounds.y - tolerance &&
        point.y <= bounds.y + bounds.height + tolerance
      ) {
        return device;
      }
    }

    return undefined;
  }

  /**
   * 获取器件包围盒
   */
  getDeviceBounds(device: Device): { x: number; y: number; width: number; height: number } {
    return {
      x: device.position.x,
      y: device.position.y,
      width: device.size.width,
      height: device.size.height,
    };
  }

  /**
   * 获取引脚信息
   */
  getPin(pinId: string): Pin | undefined {
    for (const device of this.getAllDevices()) {
      const pin = device.pins.find((p) => p.id === pinId);
      if (pin) return pin;
    }
    return undefined;
  }

  /**
   * 获取最近的引脚（用于吸附）
   */
  getNearestPin(point: Point, maxDistance = 15): { pin: Pin; distance: number } | null {
    let nearest: { pin: Pin; distance: number } | null = null;

    for (const device of this.getAllDevices()) {
      for (const pin of device.pins) {
        const distance = Math.sqrt(
          Math.pow(pin.offset.x - point.x, 2) +
          Math.pow(pin.offset.y - point.y, 2)
        );

        if (distance <= maxDistance && (!nearest || distance < nearest.distance)) {
          nearest = { pin, distance };
        }
      }
    }

    return nearest;
  }
}
```

### 3.3 RoutingService 设计（libavoid 集成）

```typescript
// application/services/RoutingService.ts

import { Router, ConnRef, ShapeRef, Point } from 'libavoid-js';
import type { PinRef } from '../types';

export class RoutingService {
  private router: Router | null = null;
  private isInitialized = false;

  constructor() {
    this.initRouter();
  }

  /**
   * 初始化 libavoid Router
   */
  private async initRouter(): Promise<void> {
    try {
      this.router = new Router({
        // 配置选项
        routingOption: 1,  // Orthogonal routing
        restage: true,
      });
      this.isInitialized = true;
      console.log('[RoutingService] libavoid initialized successfully');
    } catch (error) {
      console.error('[RoutingService] Failed to initialize libavoid:', error);
      this.isInitialized = false;
    }
  }

  /**
   * 计算两点间的最优路径
   */
  async calculateRoute(source: PinRef, target: PinRef): Promise<Point[]> {
    if (!this.isInitialized || !this.router) {
      console.warn('[RoutingService] Router not initialized, using fallback');
      return this.fallbackRoute(source, target);
    }

    try {
      // 获取源和目标引脚的全局坐标
      const sourcePoint = this.getPinPosition(source);
      const targetPoint = this.getPinPosition(target);

      // 创建连接器引用
      const connRef = new ConnRef(this.router, sourcePoint, targetPoint);

      // 处理事务并计算路径
      this.router.processTransactions();

      // 获取计算后的路径点
      const route = this.router.getRoute(connRef);

      // 转换为标准 Point 数组
      const waypoints: Point[] = route.map((pt) => ({
        x: pt.x,
        y: pt.y,
      }));

      console.log(`[RoutingService] Route calculated: ${waypoints.length} waypoints`);

      return waypoints;
    } catch (error) {
      console.error('[RoutingService] Route calculation failed:', error);
      return this.fallbackRoute(source, target);
    }
  }

  /**
   * 获取引脚位置（从 Store 中查询）
   */
  private getPinPosition(pinRef: PinRef): Point {
    const { devices } = useCircuitStore.getState();
    const device = devices[pinRef.deviceId];

    if (!device) {
      throw new Error(`Device not found: ${pinRef.deviceId}`);
    }

    const pin = device.pins.find((p) => p.id === pinRef.pinId);
    if (!pin) {
      throw new Error(`Pin not found: ${pinRef.pinId}`);
    }

    return pin.offset; // 返回全局坐标
  }

  /**
   * 降级方案：简单的直角折线
   */
  private fallbackRoute(source: PinRef, target: PinRef): Point[] {
    const start = this.getPinPosition(source);
    const end = this.getPinPosition(target);

    // 计算中点（简单的 L 型或 Z 型路径）
    const midX = (start.x + end.x) / 2;

    return [
      start,
      { x: midX, y: start.y },
      { x: midX, y: end.y },
      end,
    ];
  }

  /**
   * 更新障碍物（当器件移动时调用）
   */
  updateObstacles(): void {
    if (!this.router || !this.isInitialized) return;

    const { devices } = useCircuitStore.getState();

    // 清除旧障碍物
    this.router.clearObstacles();

    // 为每个器件添加矩形障碍物
    Object.values(devices).forEach((device) => {
      const shapeRef = new ShapeRef(this.router!, {
        x: device.position.x,
        y: device.position.y,
        width: device.size.width,
        height: device.size.height,
      });

      // 可以在这里设置形状的属性
      // shapeRef.setAllocationId(...);
    });
  }
}
```

### 3.4 关键组件实现要点

#### **Canvas.tsx - 画布主组件**

```tsx
// presentation/components/canvas/Canvas.tsx

import React, { useRef, useCallback, useEffect } from 'react';
import { useCircuitStore } from '../../data/stores/circuitStore';
import { CanvasGrid } from './CanvasGrid';
import { DeviceNode } from './DeviceNode';
import { ConnectionWire } from './ConnectionWire';
import { useCanvasEvents } from '../../hooks/useCanvasEvents';

export const Canvas: React.FC = () => {
  const canvasRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const viewport = useCircuitStore((s) => s.viewport);
  const devices = useCircuitStore((s) => s.devices);
  const connections = useCircuitStore((s) => s.connections);
  const gridSize = useCircuitStore((s) => s.gridSize);
  const showGrid = useCircuitStore((s) => s.showGrid);

  // 注册画布事件处理器
  const { handleMouseDown, handleMouseMove, handleMouseUp, handleWheel } =
    useCanvasEvents(canvasRef);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-gray-900"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* SVG 画布 */}
      <svg
        ref={canvasRef}
        className="w-full h-full"
        style={{
          cursor: 'default',
        }}
      >
        {/* 定义滤镜和渐变 */}
        <defs>
          {/* 引脚发光效果 */}
          <filter id="pin-glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* 选中边框虚线图案 */}
          <pattern
            id="selection-dash"
            patternUnits="userSpaceOnUse"
            width="8"
            height="8"
          >
            <path d="M-2,4 l4,0 l0,4" stroke="#00d4ff" strokeWidth="1.5" fill="none" />
          </pattern>
        </defs>

        {/* 视口变换组 */}
        <g
          transform={`translate(${viewport.offset.x}, ${viewport.offset.y}) scale(${viewport.zoom})`}
        >
          {/* 网格背景 */}
          {showGrid && <CanvasGrid size={gridSize} />}

          {/* 连线层（在器件下层） */}
          <g className="connections-layer">
            {Object.values(connections).map((conn) => (
              <ConnectionWire key={conn.id} connection={conn} />
            ))}
          </g>

          {/* 器件层 */}
          <g className="devices-layer">
            {Object.values(devices).map((device) => (
              <DeviceNode key={device.id} device={device} />
            ))}
          </g>

          {/* 编辑覆盖层（正在创建的连线预览等） */}
          <g className="editing-overlay">
            {/* 由 WireTool 动态渲染 */}
          </g>
        </g>
      </svg>
    </div>
  );
};
```

#### **DeviceNode.tsx - 器件节点**

```tsx
// presentation/components/canvas/DeviceNode.tsx

import React, { memo, useCallback } from 'react';
import { useCircuitStore } from '../../../data/stores/circuitStore';
import type { Device } from '../../../domain/types';
import { PinHandle } from './PinHandle';
import { DEVICE_TEMPLATES } from '../../../domain/templates/deviceTemplates';

interface DeviceNodeProps {
  device: Device;
}

export const DeviceNode: React.FC<DeviceNodeProps> = memo(({ device }) => {
  const template = DEVICE_TEMPLATES[device.type];
  const selectDevice = useCircuitStore((s) => s.selectDevice);
  const moveDevice = useCircuitStore((s) => s.moveDevice);
  const activeTool = useCircuitStore((s) => s.activeTool);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation(); // 阻止事件冒泡到画布
      selectDevice(device.id, e.shiftKey);
    },
    [device.id, selectDevice]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (activeTool !== 'select') return;

      e.stopPropagation();
      e.preventDefault();

      const startX = e.clientX;
      const startY = e.clientY;
      const startPos = { ...device.position };

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const dx = (moveEvent.clientX - startX) / viewport.zoom;
        const dy = (moveEvent.clientY - startY) / viewport.zoom;

        moveDevice(device.id, {
          x: startPos.x + dx,
          y: startPos.y + dy,
        });
      };

      const handleMouseUp = () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [device.id, device.position, activeTool, moveDevice]
  );

  return (
    <g
      transform={`translate(${device.position.x}, ${device.position.y})`}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      className="cursor-pointer"
    >
      {/* 选中边框 */}
      {device.selected && (
        <rect
          x="-4"
          y="-4"
          width={device.size.width + 8}
          height={device.size.height + 8}
          fill="none"
          stroke="#00d4ff"
          strokeWidth="2"
          strokeDasharray="6,4"
          opacity="0.8"
          pointerEvents="none"
        />
      )}

      {/* 器件符号主体 */}
      <g className="device-symbol">
        <path
          d={template.svgPath}
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 器件标签 */}
        <text
          x={device.size.width / 2}
          y={device.size.height + 16}
          textAnchor="middle"
          fill="#e0e0e0"
          fontSize="12"
          fontFamily="'JetBrains Mono', monospace"
          pointerEvents="none"
        >
          {device.label}
        </text>
      </g>

      {/* 引脚 Handles */}
      {device.pins.map((pin) => (
        <PinHandle key={pin.id} pin={pin} deviceId={device.id} />
      ))}
    </g>
  );
});

DeviceNode.displayName = 'DeviceNode';
```

#### **PinHandle.tsx - 引脚连接点**

```tsx
// presentation/components/canvas/PinHandle.tsx

import React, { useState, useCallback } from 'react';
import type { Pin, DeviceType } from '../../../domain/types';

interface PinHandleProps {
  pin: Pin;
  deviceId: string;
}

export const PinHandle: React.FC<PinHandleProps> = ({ pin, deviceId }) => {
  const [isHovered, setIsHovered] = useState(false);
  const activeTool = useCircuitStore((s) => s.activeTool);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (activeTool !== 'wire') return;

      e.stopPropagation();
      e.preventDefault();

      // 开始连线操作
      // TODO: 触发 WireTool.startDrawing(pin)
    },
    [pin.id, deviceId, activeTool]
  );

  // 动态半径：悬停时放大
  const radius = isHovered ? 8 : 5;

  return (
    <circle
      cx={pin.position.x}
      cy={pin.position.y}
      r={radius}
      fill={isHovered ? '#00d4ff' : '#4a90d9'}
      stroke="#ffffff"
      strokeWidth={isHovered ? 2 : 1}
      className="transition-all duration-150 ease-out"
      style={{
        cursor: activeTool === 'wire' ? 'crosshair' : 'default',
        filter: isHovered ? 'url(#pin-glow)' : 'none',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      data-pin-id={pin.id}
      data-device-id={deviceId}
    />
  );
};
```

#### **ConnectionWire.tsx - 连线渲染**

```tsx
// presentation/components/canvas/ConnectionWire.tsx

import React, { useMemo } from 'react';
import type { Connection } from '../../../data/stores/circuitStore';

interface ConnectionWireProps {
  connection: Connection;
}

export const ConnectionWire: React.FC<ConnectionWireProps> = ({ connection }) => {
  // 将路径点转换为 SVG path 的 d 属性
  const pathData = useMemo(() => {
    if (!connection.waypoints || connection.waypoints.length === 0) {
      return '';
    }

    // 生成圆角正交折线路径
    let d = `M ${connection.waypoints[0].x},${connection.waypoints[0].y}`;

    for (let i = 1; i < connection.waypoints.length; i++) {
      const prev = connection.waypoints[i - 1];
      const curr = connection.waypoints[i];

      // 使用二次贝塞尔曲线实现圆角
      if (i < connection.waypoints.length - 1) {
        const next = connection.waypoints[i + 1];
        // 判断转角方向并添加圆角
        d += ` L ${curr.x},${curr.y}`;
      } else {
        d += ` L ${curr.x},${curr.y}`;
      }
    }

    return d;
  }, [connection.waypoints]);

  return (
    <g className={`connection ${connection.selected ? 'selected' : ''}`}>
      {/* 连线主体 */}
      <path
        d={pathData || connection.pathData}
        fill="none"
        stroke={connection.selected ? '#ff9500' : '#4a90d9'}
        strokeWidth={connection.selected ? 3 : 2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="pointer-events-stroke"
      />

      {/* 选中时显示中点控制点（预留） */}
      {connection.selected && (
        <>
          {connection.waypoints?.slice(1, -1).map((point, idx) => (
            <circle
              key={idx}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#ff9500"
              stroke="#ffffff"
              strokeWidth="1"
              className="cursor-move"
            />
          ))}
        </>
      )}
    </g>
  );
};
```

#### **DevicePalette.tsx - 器件面板**

```tsx
// presentation/components/palette/DevicePalette.tsx

import React from 'react';
import { useCircuitStore } from '../../data/stores/circuitStore';
import { PaletteItem } from './PaletteItem';
import { DeviceType } from '../../domain/types';

const PALETTE_ITEMS: { type: DeviceType; label: string; icon: string }[] = [
  { type: DeviceType.RESISTOR, label: '电阻', icon: 'R' },
  { type: DeviceType.INDUCTOR, label: '电感', icon: 'L' },
  { type: DeviceType.CAPACITOR, label: '电容', icon: 'C' },
];

export const DevicePalette: React.FC = () => {
  const setActiveTool = useCircuitStore((s) => s.setActiveTool);

  const handleDragStart = (
    e: React.DragEvent,
    deviceType: DeviceType
  ) => {
    // 设置拖拽数据
    e.dataTransfer.setData('application/x-device-type', deviceType);
    e.dataTransfer.effectAllowed = 'copy';

    // 切换到放置工具模式
    setActiveTool('place');
  };

  return (
    <div className="w-52 bg-gray-800 border-r border-gray-700 flex flex-col h-full">
      {/* 面板标题 */}
      <div className="px-4 py-3 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-gray-200">器件库</h3>
      </div>

      {/* 器件列表 */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {PALETTE_ITEMS.map((item) => (
          <PaletteItem
            key={item.type}
            type={item.type}
            label={item.label}
            icon={item.icon}
            onDragStart={(e) => handleDragStart(e, item.type)}
          />
        ))}
      </div>

      {/* 底部提示 */}
      <div className="px-4 py-2 border-t border-gray-700 text-xs text-gray-500">
        拖拽器件到画布
      </div>
    </div>
  );
};
```

---

## 4. 任务分解与实施步骤

### Phase 1: 基础架构搭建（第 1-2 天）

#### **任务 1.1: 项目结构重组**
- [ ] 创建五层架构目录结构
- [ ] 迁移现有代码到对应目录
- [ ] 配置 TypeScript 路径别名（`@/presentation`, `@/application` 等）
- [ ] 更新 tsconfig.json 和 vite.config.ts

**验证**: `npm run dev` 正常启动，无编译错误

---

#### **任务 1.2: 领域类型定义**
- [ ] 在 `domain/types/index.ts` 中定义所有类型
- [ ] 在 `domain/entities/` 中创建 Device, Pin, Connection 实体类
- [ ] 在 `domain/templates/deviceTemplates.ts` 中配置 R/L/C 模板
- [ ] 编写单元测试验证类型正确性

**关键文件**:
```
src/domain/types/index.ts
src/domain/entities/Device.ts
src/domain/templates/deviceTemplates.ts
```

---

#### **任务 1.3: Zustand Store 实现**
- [ ] 实现 `circuitStore.ts`（完整的状态和 actions）
- [ ] 测试基本的增删改查操作
- [ ] 验证 Immer 中间件正常工作

**验证**: 在浏览器 DevTools 中可以看到 Zustand store 状态变化

---

#### **任务 1.4: 主布局组件**
- [ ] 实现 `AppLayout.tsx`（Toolbar + SplitPane(Canvas + Palette) + StatusBar）
- [ ] 实现 `Toolbar.tsx`（工具按钮、缩放控制）
- [ ] 实现 `StatusBar.tsx`（坐标、缩放比例、器件计数）
- [ ] 实现 `SplitPane.tsx`（可调整宽度的分栏）

**验证**: 页面展示完整的编辑器框架布局

---

#### **任务 1.5: 无限画布基础**
- [ ] 实现 `Canvas.tsx`（SVG 容器、视口变换）
- [ ] 实现 `CanvasGrid.tsx`（网格背景绘制）
- [ ] 实现鼠标滚轮缩放
- [ ] 实现空格+拖拽平移（或中键拖拽）

**验证**: 可以缩放和平移空画布，网格随视口变化

---

### Phase 2: 器件系统（第 3-4 天）

#### **任务 2.1: 器件面板**
- [ ] 实现 `DevicePalette.tsx`
- [ ] 实现 `PaletteItem.tsx`（SVG 符号预览 + Drag 源）
- [ ] 配置 HTML5 Drag & Drop 事件

**验证**: 从左侧拖拽时看到半透明预览

---

#### **任务 2.2: 器件节点渲染**
- [ ] 实现 `DeviceNode.tsx`（SVG 组、符号路径、标签文本）
- [ ] 实现 R/L/C 三种符号的 SVG path
- [ ] 支持选中状态（虚线边框）

**验证**: 代码方式添加器件后可以在画布上看到正确的符号

---

#### **任务 2.3: 拖放放置功能**
- [ ] 在 Canvas 上实现 `onDragOver` 和 `onDrop` 事件监听
- [ ] 解析拖拽数据获取器件类型
- [ ] 调用 `store.addDevice()` 创建实例
- [ ] 实现放置时的网格对齐

**验证**: 从面板拖拽 R/L/C 到画布后自动创建实例并对齐网格

---

#### **任务 2.4: 器件交互**
- [ ] 实现单击选择（点击器件高亮）
- [ ] 实现 Shift+单击多选
- [ ] 实现拖拽移动（mousedown → mousemove → mouseup）
- [ ] 实现点击空白区域取消选择
- [ ] 实现 Delete 键删除选中器件

**验证**: 可以流畅地选择、移动、删除器件

---

#### **任务 2.5: 引脚可视化**
- [ ] 实现 `PinHandle.tsx`（圆形连接端点）
- [ ] 根据 deviceTemplate 配置自动生成引脚位置
- [ ] 实现悬停高亮效果（放大 + 发光）
- [ ] 引脚跟随器件移动更新坐标

**验证**: 每个器件左右两侧显示可交互的引脚

---

### Phase 3: 连线系统（第 5-7 天）

#### **任务 3.1: libavoid 集成**
- [ ] 验证 libavoid WASM 加载成功
- [ ] 实现 `RoutingService` 类
- [ ] 测试基本的两点路由计算
- [ ] 实现降级方案（fallback 直角折线）

**验证**: 控制台输出路由计算结果

---

#### **任务 3.2: 连线工具（WireTool）**
- [ ] 实现 `WireTool` 类（管理连线状态机）
- [ ] 状态: idle → drawing_source → drawing_target → complete
- [ ] 处理 mousedown/mousemove/mouseup 事件序列
- [ ] 实时预览连线（跟随鼠标的动态路径）

**验证**: 从一个引脚拖出可以看到实时预览线

---

#### **任务 3.3: 引脚吸附**
- [ ] 实现 `getNearestPin()` 方法（距离检测）
- [ ] 设置吸附阈值（15px）
- [ ] 吸附时视觉反馈（引脚放大 + 高亮）
- [ ] 只在释放鼠标时执行吸附（非强制）

**验证**: 连线端点靠近引脚时自动吸附

---

#### **任务 3.4: 连线路径计算与渲染**
- [ ] 在连线完成时调用 `RoutingService.calculateRoute()`
- [ ] 将返回的路径点转换为 SVG path data
- [ ] 实现 `ConnectionWire.tsx` 渲染组件
- [ ] 支持圆角正交折线（border-radius: 8px 效果）

**验证**: 创建的连线显示为美观的正交折线

---

#### **任务 3.5: 连线交互完善**
- [ ] 实现连线选中（点击高亮为橙色）
- [ ] 实现 Delete 键删除选中连线
- [ ] 实现器件移动后相关连线自动重新路由
- [ ] 处理边界情况（自连接、重复连接检查）

**验证**: 完整的连线创建、选择、删除流程

---

### Phase 4: 优化与完善（第 8 天）

#### **任务 4.1: 性能优化**
- [ ] 使用 `React.memo` 优化 DeviceNode 和 ConnectionWire
- [ ] 使用 `useMemo` 缓存计算结果
- [ ] 批量更新高频事件（节流 mousemove）
- [ ] 测试 100+ 器件的性能表现

**验证**: 大量器件时仍保持 60fps

---

#### **任务 4.2: 用户体验细节**
- [ ] ESC 键取消当前操作
- [ ] Ctrl+Z / Ctrl+Y 撤销重做（如果时间允许）
- [ ] 右键上下文菜单（删除、属性）
- [ ] 错误提示 Toast（无效操作提示）

**验证**: 操作流畅，反馈及时

---

#### **任务 4.3: 代码质量**
- [ ] 添加必要的代码注释
- [ ] 清理未使用的导入
- [ ] 统一代码风格（ESLint 检查通过）
- [ ] 编写 README.md 使用说明

**验证**: 代码整洁，文档完整

---

## 5. 关键依赖安装命令

```bash
# 安装缺失的依赖
pnpm add immer nanoid

# 验证 libavoid 是否已正确安装
ls node_modules/libavoid-js
# 应该看到 dist/ 目录包含 WASM 文件
```

---

## 6. 开发调试指南

### 6.1 启动开发服务器

```bash
cd circuit-gui
pnpm dev
```

访问 http://localhost:5173

### 6.2 调试技巧

**Zustand DevTools**：
```typescript
// 在 circuitStore.ts 中添加 devtools 中间件
import { devtools } from 'zustand/middleware';

export const useCircuitStore = create<CircuitStore>()(
  devtools(
    immer((set, get) => ({...}))
  )
);
```

**性能分析**：
```javascript
// 在 Chrome DevTools Performance 面板录制操作
// 关注：
// - Rendering 时间
// - Scripting 时间
// - 内存使用情况
```

**libavoid 调试**：
```typescript
// 在 RoutingService 中增加详细日志
console.log('[Libavoid] Input:', { source, target });
console.log('[Libavoid] Output:', waypoints);
console.time('Route calculation');
// ... 计算过程 ...
console.timeEnd('Route calculation');
```

---

## 7. 验收测试用例

### 7.1 功能测试清单

#### **器件放置测试**

| 用例编号 | 测试步骤 | 预期结果 | 优先级 |
|----------|----------|----------|--------|
| TC-001 | 从面板拖拽 R 到画布中央 | 画布上出现电阻符号，标签为 "R1"，对齐网格 | P0 |
| TC-002 | 连续拖拽 3 个不同器件 | 出现 R1, L1, C1，位置各不相同 | P0 |
| TC-003 | 拖拽器件到画布边界外 | 器件被限制在可视区域内或出现滚动条 | P1 |
| TC-004 | 快速连续拖拽 10 个器件 | 所有器件都成功创建，无遗漏 | P0 |

#### **器件交互测试**

| 用例编号 | 测试步骤 | 预期结果 | 优先级 |
|----------|----------|----------|--------|
| TC-005 | 单击器件 R1 | R1 显示蓝色虚线边框，状态栏显示 "已选择: R1" | P0 |
| TC-006 | Shift+单击 R2 | R1 和 R2 都被选中 | P0 |
| TC-007 | 单击空白区域 | 取消所有选择 | P0 |
| TC-008 | 拖拽 R1 到新位置 | R1 平滑移动，始终对齐网格 | P0 |
| TC-009 | 选中 R1 后按 Delete | R1 被删除 | P0 |
| TC-010 | 鼠标悬停 R1 的左引脚 | 引脚放大至 8px，显示发光效果 | P0 |

#### **连线功能测试**

| 用例编号 | 测试步骤 | 预期结果 | 优先级 |
|----------|----------|----------|--------|
| TC-011 | 切换到连线工具，从 R1 左引脚拖到 C1 左引脚 | 创建一条蓝色正交连线，路径避开中间器件 | P0 |
| TC-012 | 连线过程中经过 L1 上方 | 连线自动绕过 L1（不重叠） | P0 |
| TC-013 | 连线端点距离目标引脚 10px 时释放 | 自动吸附到目标引脚 | P0 |
| TC-014 | 点击已有连线 | 连线变为橙色，线宽加粗 | P0 |
| TC-015 | 选中连线后按 Delete | 连线被删除 | P0 |
| TC-016 | 移动 R1 后查看相关连线 | 连线路径重新计算并更新 | P0 |
| TC-017 | 尝试从同一引脚连向自身 | 操作被拒绝或给出提示 | P1 |

#### **画布操作测试**

| 用例编号 | 测试步骤 | 预期结果 | 优先级 |
|----------|----------|----------|--------|
| TC-018 | 鼠标滚轮向上滚动 | 画布放大（最大 300%） | P0 |
| TC-019 | 鼠标滚轮向下滚动 | 画布缩小（最小 50%） | P0 |
| TC-020 | 空格+拖拽画布 | 画布平移 | P0 |
| TC-021 | 点击工具栏"适应窗口"按钮 | 所有器件居中显示 | P1 |

---

## 8. 风险应对预案

### 8.1 技术风险

**风险 1: libavoid WASM 兼容性问题**
- **症状**: 控制台报错 "WebAssembly.instantiate() failed"
- **原因**: WASM 文件路径错误或 MIME 类型配置问题
- **解决方案**:
  1. 检查 `public/libavoid.wasm` 文件是否存在
  2. 在 `vite.config.ts` 中配置 WASM 资源处理：
     ```ts
     export default defineConfig({
       optimizeDeps: {
         exclude: ['libavoid-js']
       },
       server: {
         headers: {
           'WASM-Content-Type': 'application/wasm'
         }
       }
     })
     ```
  3. 如果仍失败，启用降级方案（手动直角折线）

**风险 2: 拖拽事件在不同浏览器行为不一致**
- **症状**: Firefox 无法触发 drop 事件
- **解决方案**: 使用 `@dnd-kit/core` 库替代原生 D&D API
  ```bash
   pnpm add @dnd-kit/core @dnd-kit/utilities
   ```

**风险 3: 大量器件导致性能下降**
- **症状**: 操作延迟 > 200ms，帧率 < 30fps
- **解决方案**:
  1. 实施 React.memo 和 useMemo
  2. 使用 CSS transform 替代 DOM 位置更新
  3. 考虑虚拟化渲染（只渲染视口内元素）
  4. 限制最大器件数（如 500 个）并给出提示

### 8.2 进度风险

**风险**: 某个阶段耗时超出预期
- **应对策略**:
  1. 优先保证 P0 功能完成
  2. 降低 P1 功能的实现精度（如简化动画效果）
  3. 并行开发：一人负责器件系统，一人负责连线系统（如果有团队）

---

## 9. 成功标准总结

### ✅ MVP 完成标志

当以下所有条件满足时，视为项目成功：

1. **功能完整性**
   - [x] 可以从左侧面板拖拽 R/L/C 到右侧画布
   - [x] 器件自动对齐网格（10px）
   - [x] 可以选择、移动、删除器件
   - [x] 器件显示正确的 IEEE 电路符号
   - [x] 可以从引脚 A 拖拽连线到引脚 B
   - [x] 连线端点自动吸附到最近引脚
   - [x] 连线路径采用 libavoid 正交算法
   - [x] 连线以美观的 SVG path 形式渲染

2. **性能指标**
   - [x] ≤50 个器件时保持 60fps
   - [x] 器件放置延迟 < 100ms
   - [x] 连线路径计算 < 50ms

3. **代码质量**
   - [x] TypeScript 严格模式无错误
   - [x] ESLint 检查通过
   - [x] 主要组件有 JSDoc 注释
   - [x] 目录结构符合五层架构规范

4. **用户体验**
   - [x] 操作直观，学习成本 < 5 分钟
   - [x] 视觉反馈清晰及时
   - [x] 无明显 bug 或崩溃

---

## 10. 后续扩展路线图

完成 MVP 后，建议按以下顺序迭代：

### **短期（1-2 周）**
- 元件属性编辑面板
- 撤销/重做功能
- 导出 PNG/SVG/JSON
- 键盘快捷键系统

### **中期（1 个月）**
- 更多器件库（二极管、三极管、运放、IC）
- 元件旋转功能
- 复制/粘贴/多选批量操作
- 子电路/层次化设计支持

### **长期（3 个月+）**
- ERC/DRC 电气规则检查
- SPICE 网表导出
- 云端协同编辑
- PCB 布局数据交换
