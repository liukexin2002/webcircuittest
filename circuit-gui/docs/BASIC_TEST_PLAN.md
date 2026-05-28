# BasicTest 分支实现计划书

## 1. 目标概述

在 BasicTest 分支中，实现简洁的电路编辑器基础页面，包含：
- **左侧器件栏**：显示电容、电感、电阻三种器件，支持拖拽放置
- **右侧画布**：空白画布，支持放置器件并显示
- **简洁设计**：界面清晰，交互流畅

## 2. 整体布局

### 2.1 页面结构

```
┌─────────────────────────────────────────────────────────┐
│  Circuit Editor (标题栏)                                  │
├──────────────────┬──────────────────────────────────────┤
│                  │                                      │
│   器件栏 (240px) │           画布区 (flex 1)            │
│                  │                                      │
│  ┌────────────┐ │   ┌──────────────────────────────┐  │
│  │ 电容 (C)    │ │   │                              │  │
│  │ 电感 (L)    │ │   │        空白画布              │  │
│  │ 电阻 (R)    │ │   │                              │  │
│  │            │ │   │                              │  │
│  └────────────┘ │   └──────────────────────────────┘  │
│                  │                                      │
└──────────────────┴──────────────────────────────────────┘
```

### 2.2 技术选择

- **布局**：React + Tailwind CSS (flexbox)
- **画布**：SVG (矢量图形，清晰缩放)
- **拖拽库**：HTML5 Drag and Drop API (轻量级，无需额外依赖)
- **状态管理**：Zustand (已集成)

## 3. 功能模块详解

### 3.1 器件栏 (DevicePalette)

#### 3.1.1 组件位置
```
src/presentation/components/DevicePalette.tsx
```

#### 3.1.2 功能描述
- 垂直列表显示三个器件：电容、电感、电阻
- 每个器件显示 SVG 图标和名称
- 支持从器件栏拖出器件到画布
- 悬停效果：背景色变化，提示可拖拽

#### 3.1.3 器件数据结构
```typescript
interface DeviceItem {
  id: string;
  name: string;
  symbol: string;  // SVG string
  defaultValue: string;
}
```

#### 3.1.4 器件列表
```
- 电阻 (Resistor, R)
- 电容 (Capacitor, C)
- 电感 (Inductor, L)
```

### 3.2 画布区 (Canvas)

#### 3.2.1 组件位置
```
src/presentation/components/Canvas.tsx
```

#### 3.2.2 功能描述
- 白色背景的绘图区域
- 支持拖放放置器件
- 显示已放置的器件
- 支持器件的简单拖拽移动
- 可选的网格背景

#### 3.2.3 画布状态
```typescript
interface CanvasState {
  devices: PlacedDevice[];
  selectedDeviceId: string | null;
  isDragging: boolean;
  dragOffset: { x: number; y: number };
}
```

### 3.3 器件符号 (DeviceSymbols)

#### 3.3.1 SVG 图标设计

**电阻 (Resistor)**
```svg
<svg viewBox="0 0 60 40">
  <line x1="0" y1="20" x2="10" y2="20" stroke="#000" stroke-width="2"/>
  <path d="M10,20 L15,5 L22,35 L29,5 L36,35 L43,5 L50,20" 
        stroke="#000" stroke-width="2" fill="none"/>
  <line x1="50" y1="20" x2="60" y2="20" stroke="#000" stroke-width="2"/>
</svg>
```

**电容 (Capacitor)**
```svg
<svg viewBox="0 0 60 40">
  <line x1="0" y1="20" x2="25" y2="20" stroke="#000" stroke-width="2"/>
  <line x1="25" y1="5" x2="25" y2="35" stroke="#000" stroke-width="2"/>
  <line x1="35" y1="5" x2="35" y2="35" stroke="#000" stroke-width="2"/>
  <line x1="35" y1="20" x2="60" y2="20" stroke="#000" stroke-width="2"/>
</svg>
```

**电感 (Inductor)**
```svg
<svg viewBox="0 0 60 40">
  <line x1="0" y1="20" x2="10" y2="20" stroke="#000" stroke-width="2"/>
  <path d="M10,20 Q15,5 20,20 Q25,35 30,20 Q35,5 40,20 Q45,35 50,20" 
        stroke="#000" stroke-width="2" fill="none"/>
  <line x1="50" y1="20" x2="60" y2="20" stroke="#000" stroke-width="2"/>
</svg>
```

## 4. 文件结构更新

```
src/
└── presentation/
    ├── components/
    │   ├── Editor.tsx              (主编辑器，修改)
    │   ├── Toolbar.tsx             (保留)
    │   ├── Canvas.tsx              (重写，实现拖放)
    │   ├── DevicePalette.tsx       (新增：器件栏)
    │   └── PlacedDevice.tsx        (新增：画布上的器件)
    ├── hooks/
    │   └── useEditorStore.ts       (扩展：添加放置器件状态)
    └── lib/
        └── DeviceSymbols.tsx       (新增：器件 SVG 图标)
```

## 5. 实现步骤

### 步骤 1：准备器件符号
- 创建 `DeviceSymbols.tsx`，定义三个器件的 SVG 图标
- 导出器件数据数组

### 步骤 2：实现器件栏 (DevicePalette)
- 创建垂直列表布局
- 为每个器件实现 draggable 属性
- 实现 dragstart 事件处理，传递器件类型

### 步骤 3：重构画布 (Canvas)
- 实现拖放区域 (dropzone)
- 处理 dragenter, dragover, dragleave, drop 事件
- 显示已放置的器件

### 步骤 4：实现放置器件 (PlacedDevice)
- 显示器件图标和标签
- 支持简单拖拽移动
- 点击选中效果

### 步骤 5：更新状态管理 (useEditorStore)
- 添加 `placedDevices` 状态
- 添加 `addDevice()` action
- 添加 `moveDevice()` action

### 步骤 6：更新主编辑器 (Editor)
- 集成器件栏和新画布
- 调整布局为左右分栏

## 6. 交互细节

### 6.1 拖放流程
1. 用户从器件栏拖出器件 (dragstart)
2. 在画布上方悬停时显示放置提示 (dragover)
3. 用户释放鼠标放置器件 (drop)
4. 器件被添加到画布并显示

### 6.2 器件移动
1. 点击选中器件
2. 拖拽器件到新位置
3. 释放鼠标更新位置

### 6.3 视觉反馈
- 拖拽中：器件半透明，拖拽图标跟随
- 放置区域：拖过时边框高亮
- 选中：器件有蓝色边框

## 7. 简洁设计原则

1. **配色简洁**：主色调为白色背景 + 黑色线条
2. **布局清晰**：明确的左右分隔
3. **交互直观**：器件可拖出，选中可见
4. **避免复杂**：暂不实现连线、属性编辑等复杂功能

## 8. 预览效果目标

启动开发服务器后，应该看到：
- 左侧三个器件垂直排列，有明显的拖拽指示
- 右侧干净的白色画布
- 拖放器件成功放置在画布上
- 已放置的器件可以移动
- 整体界面简洁美观

## 9. 验收标准

- [ ] 器件栏显示电容、电感、电阻三个器件
- [ ] 器件可以从左侧拖到右侧画布
- [ ] 放置的器件在画布上正确显示
- [ ] 器件可以在画布上拖拽移动
- [ ] 界面布局简洁，无多余元素
- [ ] 能正常启动和预览
