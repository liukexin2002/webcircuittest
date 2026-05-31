# Circuit GUI 连线功能开发规划书

## 1. 功能概述

### 1.1 目标
基于 libavoid 自动布线库，实现完整的电路原理图连线功能，包括器件引脚定义、网络管理、连线交互、自动布线等核心功能。

### 1.2 范围
- 器件引脚（Pin）属性完善
- 网络（Net）管理
- 连线（Connection）交互与可视化
- libavoid 自动布线集成
- 移动器件时自动重路由
- 完整的撤销/重做支持

---

## 2. 架构设计（5层架构）

### 2.1 架构总览

```
┌─────────────────────────────────────────────────────────┐
│  Presentation Layer (表现层)                             │
│  - 连线渲染组件                                        │
│  - 引脚交互层                                          │
│  - 临时连线绘制                                        │
│  - 工具栏（连线工具）                                   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  Application Layer (应用层)                              │
│  - RoutingService (路由服务)                            │
│  - 连线/网络/引脚管理命令                               │
│  - 事件协调                                             │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  Data Layer (数据层)                                     │
│  - 命令模式实现                                         │
│  - 撤销/重做集成                                        │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  Domain Layer (领域层)                                  │
│  - Pin 实体（增强）                                      │
│  - Net 实体（完善）                                      │
│  - Connection 实体（增强）                               │
│  - 领域事件                                             │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  Infrastructure Layer (基础设施层)                       │
│  - LibavoidRouter (封装)                                 │
│  - 坐标变换工具                                         │
│  - 碰撞检测                                             │
└─────────────────────────────────────────────────────────┘
```

---

## 3. 领域层（Domain Layer）设计

### 3.1 Pin 实体增强

**文件**：`src/domain/entities/Pin.ts`

**当前属性**：
- `id`: Id
- `number`: string - 引脚号
- `name`: string - 引脚名
- `type`: PinType - 引脚类型
- `position`: Point - 相对于器件原点的位置
- `connectedNetId`: Id | null - 连接的网络ID

**需要增加的属性**：

```typescript
// 新增：引脚朝向（用于自动布线时确定线的引出方向）
export enum PinDirection {
  North = 'north',    // 上
  South = 'south',    // 下
  East = 'east',      // 右
  West = 'west'       // 左
}

// 增强的 PinProps
export interface PinProps {
  id: Id;
  number: string;
  name: string;
  type: PinType;
  position: Point;
  connectedNetId: Id | null;
  
  // 新增属性
  direction: PinDirection;  // 引脚朝向
  length: number;           // 引脚伸出长度（默认10px）
  visible: boolean;         // 是否显示引脚
  electricalType: 'digital' | 'analog' | 'power' | 'ground'; // 电气类型
  description?: string;     // 引脚描述
  isClock?: boolean;        // 是否时钟引脚
  isReset?: boolean;        // 是否复位引脚
}
```

### 3.2 Connection 实体增强

**文件**：`src/domain/entities/Connection.ts`

**当前属性**：
- `id`: Id
- `sourceDeviceId/sourcePinId`: 源端
- `targetDeviceId/targetPinId`: 目标端
- `waypoints`: 路径点
- `netId`: 所属网络ID
- `width/style`: 样式

**需要增加的属性**：

```typescript
export interface ConnectionProps {
  id: Id;
  sourceDeviceId: Id;
  sourcePinId: Id;
  targetDeviceId: Id;
  targetPinId: Id;
  waypoints: Waypoint[];
  netId: Id;
  width: number;
  style: 'solid' | 'dashed' | 'dotted';
  
  // 新增属性
  color: string;              // 连线颜色（继承自 Net）
  isLocked: boolean;          // 是否锁定
  isHighlighted: boolean;     // 是否高亮
  routeType: 'auto' | 'manual'; // 布线类型
  junctionPoints: Point[];    // 连接点（与其他线的交叉点）
}
```

### 3.3 Net 实体增强

**文件**：`src/domain/entities/Net.ts`

**需要增加的属性**：

```typescript
export interface NetProps {
  id: Id;
  name: string;
  color: string | null;
  pinIds: Array<{ deviceId: Id; pinId: Id }>;
  
  // 新增属性
  isBus: boolean;            // 是否总线
  busWidth?: number;         // 总线宽度
  voltage?: number;          // 电压（用于特殊显示）
  isPowerNet: boolean;       // 是否电源网络
  isGroundNet: boolean;      // 是否地网络
  netClass?: string;         // 网络分类（如信号、时钟、电源等）
  priority?: number;         // 布线优先级
  isVisible: boolean;        // 是否显示
}
```

### 3.4 Device 实体补充

**确保 Device 包含完整的符号和引脚定义**

```typescript
// 新增：器件符号中的引脚定义
export interface SymbolPinDefinition {
  pinId: Id;
  name: string;
  number: string;
  position: Point;  // 相对于符号原点
  direction: PinDirection;
  type: PinType;
}

// Device 应能获取绝对坐标的引脚位置
export class Device {
  // ... 现有代码 ...
  
  /**
   * 获取引脚在画布上的绝对位置
   */
  getPinAbsolutePosition(pinId: Id): Point | null {
    const pin = this.getPinById(pinId);
    if (!pin) return null;
    
    // 根据旋转角度计算实际位置
    return this.rotatePoint(
      pin.position.x, 
      pin.position.y,
      this.rotation
    );
  }
  
  private rotatePoint(x: number, y: number, rotation: DeviceRotation): Point {
    switch (rotation) {
      case DeviceRotation.Deg90:
        return { x: -y, y: x };
      case DeviceRotation.Deg180:
        return { x: -x, y: -y };
      case DeviceRotation.Deg270:
        return { x: y, y: -x };
      default:
        return { x, y };
    }
  }
}
```

### 3.5 领域事件扩展

**文件**：`src/domain/events/index.ts`

```typescript
export enum DomainEventType {
  // ... 现有事件 ...
  
  // 新增事件
  PIN_CONNECTED = 'pin_connected',
  PIN_DISCONNECTED = 'pin_disconnected',
  NET_CREATED = 'net_created',
  NET_REMOVED = 'net_removed',
  NET_UPDATED = 'net_updated',
  CONNECTION_CREATED = 'connection_created',
  CONNECTION_REMOVED = 'connection_removed',
  CONNECTION_UPDATED = 'connection_updated',
  ROUTING_STARTED = 'routing_started',
  ROUTING_COMPLETED = 'routing_completed'
}

// 新增事件类型定义
export interface PinConnectedEvent extends DomainEvent {
  deviceId: Id;
  pinId: Id;
  netId: Id;
}

export interface NetCreatedEvent extends DomainEvent {
  net: Net;
}

export interface ConnectionCreatedEvent extends DomainEvent {
  connection: Connection;
}

export interface RoutingCompletedEvent extends DomainEvent {
  connectionIds: Id[];
}
```

---

## 4. 基础设施层（Infrastructure Layer）设计

### 4.1 Libavoid 适配器

**文件**：`src/routing/libavoidRouter.ts` (增强)

**需要扩展的功能**：

```typescript
export interface RoutingOptions {
  shapeBuffer?: number;        // 器件与线的间距（默认8px）
  lineSpacing?: number;        // 线间距（默认10px）
  hateCrossings?: boolean;     // 是否避免交叉（默认true）
  cornerStyle?: 'round' | 'square'; // 拐角样式
  preferredDirection?: 'horizontal_first' | 'vertical_first';
}

export interface RoutingResult {
  success: boolean;
  connections: Map<Id, Point[]>; // connectionId -> waypoints
  errors?: string[];
}

export class LibavoidRouter {
  // ... 现有代码 ...
  
  /**
   * 为单个连接重新路由
   */
  async routeSingleConnection(
    circuit: Circuit,
    connectionId: Id
  ): Promise<RoutingResult>;
  
  /**
   * 重新路由所有连接
   */
  async routeAll(circuit: Circuit): Promise<RoutingResult>;
  
  /**
   * 增量路由（只重新计算受影响的线）
   */
  async routeIncremental(
    circuit: Circuit,
    changedDeviceIds: Id[]
  ): Promise<RoutingResult>;
  
  /**
   * 将领域模型转换为 libavoid 输入
   */
  private circuitToRouteInput(circuit: Circuit): RouteInput;
}
```

### 4.2 几何工具增强

**文件**：`src/infrastructure/geometry/GeometryUtils.ts`

```typescript
export class GeometryUtils {
  // ... 现有代码 ...
  
  /**
   * 点是否在线段附近（用于点击检测）
   */
  static isPointNearLine(
    point: Point,
    lineStart: Point,
    lineEnd: Point,
    threshold: number = 5
  ): boolean;
  
  /**
   * 点是否在折线附近
   */
  static isPointNearPolyline(
    point: Point,
    polyline: Point[],
    threshold: number = 5
  ): { 
    hit: boolean; 
    segmentIndex?: number; 
    distance?: number 
  };
  
  /**
   * 计算两条线的交点
   */
  static lineIntersection(
    line1Start: Point,
    line1End: Point,
    line2Start: Point,
    line2End: Point
  ): Point | null;
  
  /**
   * 将器件形状转换为 AABB 包围盒
   */
  static getDeviceBoundingBox(device: Device, symbolSize: Size): Rect;
}
```

### 4.3 坐标变换服务

**文件**：`src/infrastructure/geometry/CoordinateTransformer.ts`

```typescript
export class CoordinateTransformer {
  static screenToWorld(
    screenPoint: Point,
    viewport: { offset: Point; scale: number }
  ): Point;
  
  static worldToScreen(
    worldPoint: Point,
    viewport: { offset: Point; scale: number }
  ): Point;
  
  /**
   * 获取引脚在世界坐标系的位置
   */
  static getPinWorldPosition(
    device: Device,
    pin: Pin
  ): Point;
}
```

---

## 5. 应用层（Application Layer）设计

### 5.1 RoutingService（核心路由服务）

**文件**：`src/application/services/RoutingService.ts`

```typescript
export class RoutingService {
  private router: LibavoidRouter;
  private eventEmitter: EventEmitter;
  
  constructor(router: LibavoidRouter, eventEmitter: EventEmitter) {
    this.router = router;
    this.eventEmitter = eventEmitter;
  }
  
  /**
   * 连接两个引脚（自动创建Net和Connection）
   */
  async connectPins(
    circuit: Circuit,
    source: { deviceId: Id; pinId: Id },
    target: { deviceId: Id; pinId: Id }
  ): Promise<{ net: Net; connection: Connection }>;
  
  /**
   * 将引脚添加到现有网络
   */
  async addPinToNet(
    circuit: Circuit,
    netId: Id,
    deviceId: Id,
    pinId: Id
  ): Promise<Connection>;
  
  /**
   * 断开引脚连接
   */
  async disconnectPin(
    circuit: Circuit,
    deviceId: Id,
    pinId: Id
  ): Promise<void>;
  
  /**
   * 删除连接
   */
  async removeConnection(
    circuit: Circuit,
    connectionId: Id
  ): Promise<void>;
  
  /**
   * 移动器件后重新路由
   */
  async rerouteOnDeviceMove(
    circuit: Circuit,
    movedDeviceIds: Id[]
  ): Promise<void>;
  
  /**
   * 手动调整连线后更新路径
   */
  async updateConnectionPath(
    circuit: Circuit,
    connectionId: Id,
    newWaypoints: Waypoint[]
  ): Promise<void>;
  
  /**
   * 创建新网络
   */
  createNet(
    circuit: Circuit,
    name?: string
  ): Net;
  
  /**
   * 合并两个网络
   */
  async mergeNets(
    circuit: Circuit,
    primaryNetId: Id,
    secondaryNetId: Id
  ): Promise<void>;
}
```

### 5.2 EditorService 集成

**文件**：`src/application/services/EditorService.ts` (扩展)

```typescript
export class EditorService {
  // ... 现有代码 ...
  private routingService: RoutingService;
  
  // 新增方法
  setRoutingService(routingService: RoutingService): void;
  
  async connectPins(
    source: { deviceId: Id; pinId: Id },
    target: { deviceId: Id; pinId: Id }
  ): Promise<void>;
  
  async removeConnection(connectionId: Id): Promise<void>;
  
  async createNet(name?: string): Net;
  
  async addPinToNet(
    netId: Id,
    deviceId: Id,
    pinId: Id
  ): Promise<void>;
  
  /**
   * 当器件移动时自动重路由
   */
  override async moveDevice(deviceId: Id, newPosition: Point): Promise<void>;
}
```

### 5.3 WiringTool（连线工具）

**文件**：`src/application/services/tools/WiringTool.ts`

```typescript
// 连线工具状态
export enum WiringState {
  Idle = 'idle',
  DraggingFromPin = 'dragging_from_pin',
  ConnectingToPin = 'connecting_to_pin'
}

export class WiringTool {
  private state: WiringState = WiringState.Idle;
  private source?: { deviceId: Id; pinId: Id };
  private tempPosition?: Point;
  
  constructor(
    private editorService: EditorService,
    private eventEmitter: EventEmitter
  ) {}
  
  /**
   * 开始连线
   */
  startWiring(deviceId: Id, pinId: Id): void;
  
  /**
   * 更新临时连线位置（拖拽过程中）
   */
  updateTempPosition(position: Point): void;
  
  /**
   * 完成连线
   */
  finishWiring(targetDeviceId: Id, targetPinId: Id): Promise<void>;
  
  /**
   * 取消连线
   */
  cancelWiring(): void;
  
  /**
   * 获取当前状态
   */
  getState(): { state: WiringState; source?: any; tempPosition?: Point };
}
```

### 5.4 Command 模式实现

**文件**：`src/data/managers/ConnectionCommands.ts`

```typescript
export class ConnectPinsCommand implements Command {
  constructor(
    private circuit: Circuit,
    private source: { deviceId: Id; pinId: Id },
    private target: { deviceId: Id; pinId: Id }
  ) {}
  
  execute(): void;
  undo(): void;
  getDescription(): string;
}

export class RemoveConnectionCommand implements Command {
  constructor(
    private circuit: Circuit,
    private connectionId: Id
  ) {}
  
  execute(): void;
  undo(): void;
  getDescription(): string;
}

export class MoveConnectionWaypointCommand implements Command {
  constructor(
    private circuit: Circuit,
    private connectionId: Id,
    private waypointIndex: number,
    private oldPosition: Point,
    private newPosition: Point
  ) {}
  
  execute(): void;
  undo(): void;
  getDescription(): string;
}
```

---

## 6. 表现层（Presentation Layer）设计

### 6.1 连线渲染组件

**文件**：`src/presentation/components/Connection.tsx`

```tsx
interface ConnectionProps {
  connection: Connection;
  net?: Net;
  isSelected: boolean;
  onSelect: (id: Id) => void;
  onWaypointDrag?: (index: number, position: Point) => void;
}

export function Connection({
  connection,
  net,
  isSelected,
  onSelect
}: ConnectionProps) {
  // 渲染连线
  // 渲染拐点（可拖拽）
  // 选中状态高亮
}
```

### 6.2 引脚组件

**文件**：`src/presentation/components/Pin.tsx`

```tsx
interface PinProps {
  pin: Pin;
  device: Device;
  isHighlighted: boolean;
  onMouseDown: (pin: Pin) => void;
  onMouseOver: (pin: Pin) => void;
  onMouseOut: () => void;
}

export function Pin({
  pin,
  device,
  isHighlighted,
  onMouseDown,
  onMouseOver,
  onMouseOut
}: PinProps) {
  // 渲染引脚（小圆圈或方块）
  // 根据方向渲染引脚线
  // 高亮状态
}
```

### 6.3 临时连线渲染

**文件**：`src/presentation/components/TempWiringLine.tsx`

```tsx
interface TempWiringLineProps {
  source: Point;
  target: Point;
  isValidTarget: boolean;
}

export function TempWiringLine({
  source,
  target,
  isValidTarget
}: TempWiringLineProps) {
  // 实时渲染临时连线（正交线）
  // 显示目标是否有效（颜色变化）
}
```

### 6.4 Canvas 组件增强

**文件**：`src/presentation/components/Canvas.tsx` (扩展)

```tsx
export function Canvas() {
  // ... 现有代码 ...
  
  // 连线交互状态
  const [wiringState, setWiringState] = useState<{
    active: boolean;
    source?: { deviceId: Id; pinId: Id };
    tempPosition?: Point;
  }>({ active: false });
  
  // 处理引脚点击
  const handlePinMouseDown = (deviceId: Id, pinId: Id) => {
    if (currentTool === 'wire') {
      // 开始连线
    }
  };
  
  // 处理画布点击（如果在连线中且点击空白，则加拐点）
  const handleCanvasClick = (e) => {
    if (wiringState.active) {
      // 添加临时拐点
    }
  };
  
  return (
    <div>
      {/* ... 现有代码 ... */}
      
      {/* 渲染连线层（在器件层下面） */}
      <svg>
        {placedConnections.map(conn => (
          <Connection key={conn.id} ... />
        ))}
      </svg>
      
      {/* 临时连线层 */}
      {wiringState.active && (
        <TempWiringLine ... />
      )}
      
      {/* 器件层（包含引脚） */}
      <svg>
        {placedDevices.map(device => (
          <PlacedDevice key={device.id} ...>
            {/* 渲染引脚 */}
            {device.pins.map(pin => (
              <Pin key={pin.id} ... />
            ))}
          </PlacedDevice>
        ))}
      </svg>
    </div>
  );
}
```

### 6.5 useEditorStore 扩展

**文件**：`src/presentation/hooks/useEditorStore.ts`

```typescript
export interface EditorState {
  // ... 现有状态 ...
  
  // 新增状态
  activeTool: 'select' | 'wire' | 'delete' | 'text';
  wiring: {
    active: boolean;
    source?: { deviceId: Id; pinId: Id };
    tempPosition?: Point;
    tempWaypoints: Point[];
  };
  highlightedPins: Set<Id>;
}
```

### 6.6 工具栏组件

**文件**：`src/presentation/components/Toolbar.tsx` (增强)

```tsx
export function Toolbar() {
  return (
    <div>
      {/* 现有按钮 */}
      <button active={activeTool === 'select'}>选择</button>
      <button active={activeTool === 'wire'}>连线</button>
      <button active={activeTool === 'delete'}>删除</button>
    </div>
  );
}
```

---

## 7. 器件符号与引脚定义

### 7.1 DeviceSymbols 增强

**文件**：`src/presentation/lib/DeviceSymbols.tsx`

```typescript
export interface PinDefinition {
  id: string;
  number: string;
  name: string;
  position: Point;
  direction: PinDirection;
  type: PinType;
  length?: number;
}

export interface DeviceSymbol {
  id: string;
  name: string;
  nameCn: string;
  prefix: string;
  svg: string;
  width: number;
  height: number;
  pins: PinDefinition[];  // 新增：引脚定义
}

// 示例：电阻
export const RESISTOR_SYMBOL: DeviceSymbol = {
  id: 'resistor',
  name: 'Resistor',
  nameCn: '电阻',
  prefix: 'R',
  width: 60,
  height: 40,
  pins: [
    {
      id: 'pin1',
      number: '1',
      name: 'Terminal 1',
      position: { x: -30, y: 0 },
      direction: PinDirection.West,
      type: PinType.Passive,
      length: 10
    },
    {
      id: 'pin2',
      number: '2',
      name: 'Terminal 2',
      position: { x: 30, y: 0 },
      direction: PinDirection.East,
      type: PinType.Passive,
      length: 10
    }
  ],
  svg: `...`
};
```

---

## 8. 核心功能流程

### 8.1 连线创建流程

```
用户操作流程：
1. 点击工具栏「连线」按钮
2. 鼠标悬停到源器件引脚（引脚高亮）
3. 点击源引脚（开始连线）
4. 拖拽鼠标（显示临时连线）
5. 鼠标悬停到目标引脚（目标高亮）
6. 点击目标引脚（完成连线）

内部流程：
1. WiringTool.startWiring()
2. 渲染 TempWiringLine
3. WiringTool.finishWiring()
4. RoutingService.connectPins()
5. libavoid 计算路径
6. 创建 Connection 和 Net（如需要）
7. 触发 CONNECTION_CREATED 事件
8. UI 更新
```

### 8.2 器件移动时自动重路由

```
1. 用户移动器件
2. DeviceMoved 事件触发
3. RoutingService 检测相关连接
4. 调用 libavoid 重新计算路径
5. 更新 Connection.waypoints
6. UI 更新连线位置
```

### 8.3 手动调整连线

```
1. 用户选中连线
2. 显示可拖拽的拐点
3. 用户拖拽拐点
4. MoveConnectionWaypointCommand 执行
5. 可选择是否重新计算相邻线段
```

---

## 9. 数据流转

### 9.1 完整数据结构示例

```typescript
// 放置器件时创建 Device，包含 Pin 定义
{
  id: 'device1',
  type: 'resistor',
  pins: [
    { id: 'pin1', number: '1', position: { x: -30, y: 0 }, ... },
    { id: 'pin2', number: '2', position: { x: 30, y: 0 }, ... }
  ]
}

// 连接两个引脚后
{
  net: {
    id: 'net1',
    name: 'N1',
    pinIds: [
      { deviceId: 'device1', pinId: 'pin1' },
      { deviceId: 'device2', pinId: 'pin3' }
    ]
  },
  connection: {
    id: 'conn1',
    sourceDeviceId: 'device1',
    sourcePinId: 'pin1',
    targetDeviceId: 'device2',
    targetPinId: 'pin3',
    netId: 'net1',
    waypoints: [ 
      { position: {x, y}, mode: 'straight' }, 
      ... 
    ]
  }
}
```

---

## 10. 开发阶段规划

### Phase 1: 领域层完善（1-2天）
- [ ] 增强 Pin/Net/Connection 实体
- [ ] 定义领域事件
- [ ] 更新 DeviceSymbols 加入引脚定义

### Phase 2: 基础设施层（1天）
- [ ] 增强 LibavoidRouter
- [ ] 实现几何工具
- [ ] 坐标变换服务

### Phase 3: 应用层（2天）
- [ ] 实现 RoutingService
- [ ] 实现 WiringTool
- [ ] 命令模式实现
- [ ] 集成到 EditorService

### Phase 4: 表现层（2-3天）
- [ ] Connection 组件
- [ ] Pin 组件
- [ ] 临时连线渲染
- [ ] 交互逻辑
- [ ] 工具栏集成

### Phase 5: 测试与优化（1天）
- [ ] 功能测试
- [ ] 性能优化
- [ ] Bug 修复

---

## 11. 关键技术点

1. **正交布线**：利用 libavoid 的 OrthogonalRouting
2. **实时反馈**：拖拽时显示临时连线
3. **坐标变换**：正确处理视口缩放/平移
4. **自动重路由**：器件移动时触发
5. **撤销/重做**：所有连线操作支持
6. **性能优化**：增量路由、避免全量重算

---

## 12. 后续扩展

- 总线支持
- 差分对布线
- 网络高亮
- 连线样式自定义
- 导出网表
