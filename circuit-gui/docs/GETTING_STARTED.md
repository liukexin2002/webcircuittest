# Circuit-GUI 快速入门指南

## 项目概述

Circuit-GUI 是一个基于 Web 的电路原理图编辑器框架，采用现代化的五层架构设计，
参考了 KiCAD 等专业 EDA 软件的架构理念。

## 目录结构

```
circuit-gui/
├── src/
│   ├── domain/              # 领域层（核心数据模型）
│   │   ├── entities/       # 实体类
│   │   │   ├── Circuit.ts
│   │   │   ├── Device.ts
│   │   │   ├── Pin.ts
│   │   │   ├── Connection.ts
│   │   │   └── Net.ts
│   │   ├── events/         # 领域事件
│   │   ├── types/          # 类型定义
│   │   └── index.ts
│   ├── application/         # 应用层（业务逻辑）
│   │   ├── managers/       # 管理器类
│   │   ├── services/       # 服务类
│   │   ├── types/          # 应用类型
│   │   └── index.ts
│   ├── data/               # 数据访问层
│   │   ├── managers/
│   │   │   ├── Command.ts
│   │   │   └── UndoRedoManager.ts
│   │   └── index.ts
│   ├── infrastructure/     # 基础设施层
│   │   ├── events/
│   │   │   └── EventEmitter.ts
│   │   ├── geometry/
│   │   │   └── GeometryUtils.ts
│   │   ├── utils/
│   │   │   └── IdGenerator.ts
│   │   └── index.ts
│   ├── presentation/       # 展示层（React 组件）
│   │   ├── components/
│   │   │   ├── Canvas.tsx
│   │   │   ├── Toolbar.tsx
│   │   │   └── Editor.tsx
│   │   ├── context/
│   │   │   └── EditorContext.tsx
│   │   ├── hooks/
│   │   │   └── useEditorStore.ts
│   │   └── index.ts
│   ├── components/         # 现有 UI 组件库
│   ├── App.tsx
│   ├── main.tsx
│   └── index.ts
├── docs/
│   └── ARCHITECTURE.md
└── package.json
```

## 架构说明

### 五层架构

1. **领域层 (Domain)**: 核心数据模型和业务实体
   - Circuit, Device, Pin, Connection, Net
   - 领域事件定义

2. **应用层 (Application)**: 业务逻辑编排
   - EditorService, ToolManager
   - 工具类实现

3. **数据访问层 (Data)**: 持久化和历史管理
   - UndoRedoManager, Command 模式

4. **基础设施层 (Infrastructure)**: 通用工具
   - EventEmitter, GeometryUtils, IdGenerator

5. **展示层 (Presentation)**: React UI
   - Canvas, Toolbar, Editor
   - Zustand 状态管理

### 依赖规则

```
Presentation → Application → Domain
               ↓
            Data → Infrastructure
```

## 开发指南

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建项目

```bash
npm run build
```

## 基础使用

### 1. 创建电路

```typescript
import { EditorService, EventEmitter, UndoRedoManager } from 'circuit-gui';

const emitter = new EventEmitter();
const undoManager = new UndoRedoManager();
const editor = new EditorService(emitter, undoManager);

editor.createNewCircuit('My Circuit');
```

### 2. 添加设备

```typescript
const device = editor.addDevice(
  'resistor',           // 设备类型
  'resistor-symbol',    // 符号 ID
  { x: 100, y: 100 },   // 位置
  'R1'                  // 标签
);
```

### 3. 撤销/重做

```typescript
editor.undo();
editor.redo();
```

## 核心概念

### 领域事件

系统通过事件进行松耦合通信：

```typescript
emitter.on('device:added', (event) => {
  console.log('Device added:', event.device);
});
```

### 命令模式

所有编辑操作通过 Command 执行，支持撤销：

```typescript
interface Command {
  execute(): void;
  undo(): void;
  getDescription(): string;
}
```

## 下一步

查看完整的 [架构设计文档](./ARCHITECTURE.md) 了解更多细节。
