# Circuit-GUI 项目分支关系图

## 当前分支状态

```
main (主分支)
  │
  │  - 基础代码
  │  - RoutingDemo 连线演示功能
  │  - libavoid 集成
  │
  ▼
feature/architecture-framework (架构框架分支) ⭐ 当前基础
  │
  │  - 五层架构设计
  │  - 领域层 (Domain)
  │  │   ├── Circuit, Device, Pin, Connection, Net 实体
  │  │   ├── 领域事件系统
  │  │   └── 类型定义
  │  │
  │  - 应用层 (Application)
  │  │   ├── EditorService
  │  │   ├── ToolManager
  │  │   └── 基础工具类
  │  │
  │  - 数据访问层 (Data)
  │  │   ├── Command 模式
  │  │   └── UndoRedoManager
  │  │
  │  - 基础设施层 (Infrastructure)
  │  │   ├── EventEmitter
  │  │   ├── GeometryUtils
  │  │   └── IdGenerator
  │  │
  │  - 展示层 (Presentation)
  │  │   ├── Editor (主编辑器)
  │  │   ├── Canvas (SVG 画布)
  │  │   ├── Toolbar (工具栏)
  │  │   ├── EditorContext (上下文)
  │  │   └── Zustand Store
  │  │
  │  - 文档
  │  │   ├── ARCHITECTURE.md (架构设计文档)
  │  │   └── GETTING_STARTED.md (快速入门)
  │
  ▼
BasicTest (基础测试分支) ⭐ 当前分支
  │
  │  - 基于架构框架
  │  - 目标：实现基础页面
  │  │   ├── 左侧器件栏 (电容、电感、电阻)
  │  │   ├── 右侧画布 (放置器件)
  │  │   └── 简洁的拖放交互
  │  │
  │  - 计划书
  │  │   └── BASIC_TEST_PLAN.md
  │
  ▼
(未来子分支...) 待开发
```

## 分支说明

### 1. main - 主分支（基础代码）
**状态**: 已完成并推送  
**内容**:
- React + Vite 项目基础结构
- RoutingDemo 连线演示（保留原有功能）
- libavoid-js 集成
- Tailwind CSS + shadcn/ui 组件库

### 2. feature/architecture-framework - 架构框架分支 ⭐
**状态**: 已完成并推送  
**父分支**: main  
**内容**: 五层架构完整实现
- 领域层：核心数据模型
- 应用层：业务逻辑服务
- 数据访问层：持久化和历史管理
- 基础设施层：通用工具
- 展示层：React UI 组件

### 3. BasicTest - 基础测试分支 ⭐
**状态**: 已创建，待实现  
**父分支**: feature/architecture-framework  
**计划内容**:
- 器件栏组件（DevicePalette）
- 可拖放的画布（Canvas）
- 三个基础器件：电阻(R)、电容(C)、电感(L)
- 简洁的拖放交互

## 后续开发规划

```
main
  │
  ▼
feature/architecture-framework (已完成)
  │
  ▼
BasicTest (当前，计划中)
  │ - 基础拖放功能
  │ - 器件栏 + 画布
  │
  ▼
BasicTest-WireConnect (未来)
  │ - 连线功能集成
  │ - 保留原有 libavoid
  │
  ▼
BasicTest-PropertiesPanel (未来)
  │ - 属性编辑面板
  │ - 器件属性修改
  │
  ▼
Advanced-Features (未来)
  │ - 层次化设计
  │ - ERC/DRC 规则检查
  │ - 符号库管理
  │
  ▼
Production-Ready (未来)
  │ - 完整功能
  │ - 性能优化
  │ - 测试覆盖
  │
  ▼
 合并回 main
```

## 确认事项

请确认以下分支关系是否正确：

1. ✅ **main** → **feature/architecture-framework** (父 → 子)
2. ✅ **feature/architecture-framework** → **BasicTest** (父 → 子)
3. ✅ BasicTest 的目标是实现基础页面（器件栏 + 画布 + 拖放）
4. ✅ 保留原有的 RoutingDemo 连线功能

确认后我将继续在 BasicTest 分支上实现代码！ 🚀
