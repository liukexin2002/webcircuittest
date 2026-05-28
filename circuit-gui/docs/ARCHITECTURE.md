# Circuit-GUI 电路编辑器框架架构设计文档

## 1. 概述

### 1.1 文档目的

本文档旨在为 Circuit-GUI 项目（一款基于 Web 的电路原理图编辑器）制定系统化的软件架构设计方案。通过深入分析业界成功的 EDA（Electronic Design Automation）软件架构，结合现代前端技术生态，为项目选择合适的技术路线、分层方案和模块划分策略，确保项目在保持功能完整性的同时，具备良好的可维护性、可扩展性和低耦合性。

### 1.2 项目背景与目标

Circuit-GUI 项目当前已实现基础的原理图编辑功能，包括设备拖拽、连线绘制和自动布线算法（基于 libavoid）。项目采用 React + SVG + TypeScript 技术栈，使用 Tailwind CSS 进行样式管理，构建于 Vite 开发环境之上。

本项目的核心目标是构建一个高质量的电路原理图编辑框架，具体包括：

**功能目标**：支持设备放置、连线绘制、属性编辑、层次化设计、协同编辑等高级功能。

**质量目标**：代码结构清晰、模块边界明确、接口稳定、测试覆盖率高。

**性能目标**：支持大规模电路（1000+ 设备节点）的流畅编辑和渲染。

**扩展目标**：支持插件化架构，便于功能扩展和第三方集成。

### 1.3 文档结构

本文档按照以下逻辑组织：首先分析当前项目的技术现状和问题；其次研究 KiCAD、Altium Designer 等成功 EDA 软件的架构设计；然后分析现代前端图形编辑技术栈；接着提出本项目的推荐架构方案；最后给出实施建议和路线图。

## 2. 当前项目分析

### 2.1 项目结构概览

当前 Circuit-GUI 项目采用标准的 React + Vite 项目结构，主要代码组织如下：

```
circuit-gui/
├── src/
│   ├── components/        # UI 组件层
│   │   └── ui/           # Radix UI 基础组件库
│   ├── features/          # 功能模块
│   │   └── routing-demo/ # 连线功能演示
│   ├── hooks/             # React 自定义钩子
│   ├── lib/               # 工具函数库
│   ├── routing/           # 布线算法核心
│   │   └── libavoid/     # libavoid WebAssembly 封装
│   ├── App.tsx           # 主应用组件
│   └── main.tsx          # 应用入口
├── public/               # 静态资源
└── scripts/              # 构建脚本
```

### 2.2 当前技术栈

当前项目采用的技术栈具有以下特点：

**框架层**：React 19.2.6 + TypeScript 6.0.2，React 的组件化模型和虚拟 DOM 机制为 UI 开发提供了良好的基础。

**样式层**：Tailwind CSS 3.4.1 + shadcn/ui 组件库，采用原子化 CSS 方案，组件库基于 Radix UI 提供无障碍支持。

**构建层**：Vite 8.0.12 作为构建工具，提供极速的开发服务器启动和热模块替换。

**核心算法层**：libavoid-js 0.4.5，这是一个成熟的正交布线（orthogonal routing）算法库，已编译为 WebAssembly，性能表现优异。

**图形渲染层**：SVG 作为主要的图形渲染技术，利用 SVG 的矢量特性和 DOM 事件系统实现交互。

### 2.3 现有架构的优势

**技术选型合理**：React + SVG + TypeScript 的组合在前端图形编辑领域具有广泛的实践基础，SVG 的矢量缩放能力和 DOM 事件集成是电路图编辑的理想选择。

**依赖管理清晰**：项目使用 pnpm 进行依赖管理，libavoid 算法的集成方式（WebAssembly）确保了核心算法的性能。

**组件化基础良好**：已有的 shadcn/ui 组件体系和功能模块的分离组织方式，为进一步分层奠定了基础。

### 2.4 当前架构存在的问题

**层次边界模糊**：当前项目中，UI 组件（features/routing-demo/RoutingDemo.tsx）直接包含了业务逻辑、渲染逻辑和状态管理，组件文件达到 260 行，承担了过多职责。

**数据模型不明确**：项目尚未建立独立的电路数据模型层，设备信息、连线信息、网络信息等数据与 UI 渲染逻辑耦合在一起。

**状态管理分散**：缺乏统一的状态管理方案，组件间状态同步和共享逻辑的实现方式不明确。

**模块化程度不足**：routing/ 目录下的算法封装与 UI 层直接绑定，未能形成独立的业务逻辑层和接口层。

**扩展性受限**：当前架构难以支持后续的层次化设计、符号库管理、属性面板等高级功能。

这些问题并非致命，但在项目规模扩大时会导致维护成本急剧上升，需要在早期架构设计阶段加以解决。

## 3. 业界 EDA 软件架构研究

### 3.1 KiCAD 架构分析

KiCAD 是开源 EDA 领域的标杆项目，其架构设计对本项目具有重要的参考价值。KiCAD 8.0 的核心架构特点如下：

**3.1.1 分层架构设计**

KiCAD 采用典型的分层架构，从底层到顶层依次为：基础设施层（包括文件 I/O、几何计算、通用算法）、数据模型层（电路板数据、原理图数据、符号库数据）、业务逻辑层（设计规则检查、电气规则检查、自动布线）、UI 交互层（Qt 界面、视图渲染、工具交互）。各层之间通过明确定义的接口进行通信，依赖方向单一从上层指向下层。

**3.1.2 SQLite 嵌入式数据库**

KiCAD 8.0 引入 SQLite 作为嵌入式数据库存储设计元数据，这一设计选择带来了显著优势：ACID 事务保证设计变更的原子性和一致性；SQL 查询能力简化了复杂设计数据的检索；并发读写支持为协同设计奠定了基础；文件格式（.kicad_pcb、.kicad_sch）本质上是一个 SQLite 数据库容器，体积紧凑且可版本控制。

**3.1.3 三元绑定机制**

KiCAD 的符号-封装-3D 模型三元绑定机制是其数据模型的核心创新。当用户在符号编辑器中修改引脚定义时，关联的封装焊盘和 3D 模型引脚坐标自动同步。这种强关联的数据模型确保了原理图设计和 PCB 设计之间的一致性，避免了传统工具链中网表转换导致的信息丢失。

**3.1.4 视图联动机制**

KiCAD 实现原理图编辑器与 PCB 编辑器的双向联动（cross-probing）：在原理图中选中的网络会高亮显示在 PCB 对应位置；PCB 中高亮的位置也会反馈到原理图。这种跨视图的实时联动极大提升了设计效率，其实现依赖于统一的底层数据模型和发布-订阅模式的事件传播机制。

**3.1.5 约束管理系统**

KiCAD 的设计规则检查（DRC）和电气规则检查（ERC）系统独立于编辑器进程运行，通过规则引擎驱动。这种设计允许规则定义与视图渲染解耦，支持规则的版本化和可配置化。

### 3.2 商业 EDA 软件架构特点

**3.2.1 Altium Designer**

Altium Designer 采用单体式 Win32 原生架构，底层基于自研的 ACCEL 图形引擎与统一数据模型（Unified Data Model）。其核心理念是“单一数据源”：所有设计对象（原理图符号、PCB 封装、3D 模型、物料属性）均以原子化实体存储于同一内存空间。这种设计简化了跨视图数据同步的复杂性，但代价是系统复杂度高、内存占用大。Altium 的架构适合复杂度和性能要求极高的专业场景，但不太适合 Web 化改造。

**3.2.2 Cadence Allegro**

Cadence Allegro 采用分层式约束驱动架构（Constraint-Driven Architecture），核心是独立运行的 Constraint Manager 模块。该模块不依附于 PCB 编辑器进程，而是通过 IPC 通道与 Layout、Router、SI/PI 仿真工具通信。这种设计实现了约束规则的集中管理和复用，各工具可以独立演进。Allegro 的“引导式合规”机制（非强制拦截）在保证设计质量的同时，减少了对设计流畅性的干扰。

**3.2.3 PADS Professional**

PADS Professional 采用模块化微服务架构，Logic（原理图）、Layout（PCB 布局）、Router（自动布线）作为三个独立可执行程序，通过共享的 XML Schema 数据库交换数据。这种设计支持“渐进式功能加载”，降低了入门门槛，同时允许专业用户按需启用高级模块。

### 3.3 架构共性分析

综合分析上述 EDA 软件的架构设计，可以提炼出以下共性模式：

**统一数据模型**：成功的 EDA 软件无一例外地采用统一的数据模型来描述电路设计，避免工具链模式下的数据割裂问题。数据模型是架构的核心，各功能模块围绕数据模型展开。

**层次化设计**：所有 EDA 软件都采用清晰的分层架构，层次边界明确，依赖关系单向。这种设计降低了系统的复杂度，便于独立演进和测试。

**约束与执行分离**：设计规则、电气规则与图形编辑功能解耦，通过独立的规则引擎驱动。这种设计提高了规则的可配置性和可复用性。

**事件驱动联动**：视图间的联动采用发布-订阅模式，数据变更通过事件系统传播，避免紧密耦合。

**持久化优先**：设计数据采用结构化格式（SQLite、XML）存储，支持版本控制和多工具共享。

### 3.4 对 Circuit-GUI 的启示

KiCAD 的架构设计对本项目最具参考价值，其基于分层架构和统一数据模型的设计理念可以直接借鉴。具体启示包括：

**建立独立的数据模型层**：这是最关键的架构决策。电路数据（设备、网络、连线）应作为独立的核心模型，与渲染逻辑和 UI 交互解耦。

**采用五层架构**：参考 KiCAD 的分层实践，结合 Web 前端的特性，建议采用 Presentation Layer（UI 组件）、Application Layer（业务编排）、Domain Layer（领域逻辑）、Data Access Layer（数据持久化）、Infrastructure Layer（基础设施）的五层架构。

**引入事件系统**：实现组件间的松耦合通信，支持撤销/重做、设计变更传播等功能。

**考虑数据持久化**：虽然当前是纯前端项目，但应考虑数据结构化存储的设计，便于后续扩展到云端协同和文件格式支持。

## 4. 前端图形编辑技术栈分析

### 4.1 图形渲染技术对比

Web 前端图形渲染主要有三种技术方案：SVG、Canvas 2D 和 WebGL，每种方案都有其适用场景和优缺点。

**4.1.1 SVG 方案**

SVG（可缩放矢量图形）是基于 XML 的矢量图形格式，具有以下优势： DOM 事件集成天然支持，无需额外的命中测试（hit testing）逻辑； CSS 样式控制灵活，支持动画和交互效果； 矢量特性保证任意缩放下的清晰度； 适合设备、符号、连线的精确绑制和编辑操作； 开发者工具友好，便于调试。

SVG 的主要局限在于渲染性能。当图形数量达到数千个时，DOM 节点数量会成为性能瓶颈；频繁的部分更新会导致重排和重绘开销。因此，SVG 更适合中等规模（设备数量在 1000 以内）的图形编辑场景。

**4.1.2 Canvas 2D 方案**

Canvas 2D 提供基于像素的即时模式渲染，具有以下优势： 渲染性能优异，适合大规模图形的快速绘制； 内存占用相对固定，不随图形复杂度线性增长； 支持复杂的视觉效果和图像处理； 适合需要频繁重绘的场景（如示波器波形、实时动画）。

Canvas 的主要局限在于缺乏原生交互支持，需要自行实现命中测试、事件处理等机制；图形元素的修改通常需要完全重绘；开发调试相对困难。因此，Canvas 更适合不需要精细交互的场景，或作为 SVG 的性能补充。

**4.1.3 WebGL 方案**

WebGL 提供基于 GPU 的硬件加速渲染能力，性能最强，但开发复杂度也最高。适合需要处理海量图形元素（10000+）或复杂视觉效果的专业应用，如 3D PCB 可视化、大规模原理图总览等。

### 4.2 图形编辑库生态

**4.2.1 Fabric.js**

Fabric.js 是功能最完善的 Canvas 2D 图形编辑库之一，提供完整的对象模型、事件处理、序列化等功能。如果选择 Canvas 方案，Fabric.js 是首选。

**4.2.2 Konva.js**

Konva.js 是另一个流行的 Canvas 框架，提供类 DOM 的 API 和良好的 React 集成（react-konva）。其性能优于 Fabric.js，但功能相对精简。

**4.2.3 PixiJS**

PixiJS 是面向游戏和视觉效果的 WebGL 渲染引擎，性能优异，但缺乏原生交互支持，适合作为 Canvas/WebGL 的性能补充层。

**4.2.4 React 生态集成**

对于 React 项目，有几个专门的图形编辑集成方案：react-konva 提供 Konva.js 的 React 绑定；react-svg 提供 SVG 组件化开发支持；react-use-gesture 和 framer-motion 提供手势和动画支持。

### 4.3 当前项目技术选型评估

基于前述分析，对 Circuit-GUI 当前采用的 SVG 方案进行评估：

**优势延续**：SVG 的矢量特性和 DOM 集成非常适合电路原理图的编辑需求，当前项目已经验证了这一选择的可行性。电路图的典型特点（精确绑制、连接点吸附、符号缩放）与 SVG 的能力高度匹配。

**性能优化策略**：对于可能的性能瓶颈，可以采用以下策略：虚拟化渲染，只渲染视口内的元素；分层渲染，将静态元素（网格背景、已完成的连线）和动态元素（正在编辑的设备、新增的连线）分层处理；批量更新，使用 React 的批量更新机制减少重渲染。

**混合方案预留**：架构设计应预留向 Canvas/WebGL 扩展的能力。对于大规模电路的总览视图、3D 可视化等场景，可以引入 Canvas 或 WebGL 作为补充渲染层。

### 4.4 推荐技术路线

**核心渲染层**：继续采用 SVG 作为主要的交互编辑渲染技术，利用其 DOM 事件集成能力和精确的图形编辑支持。

**状态管理层**：引入 Zustand 或 Jotai 作为全局状态管理方案，提供更清晰的状态流转机制和优秀的 TypeScript 支持。

**UI 组件层**：延续 shadcn/ui 组件库，利用其无障碍支持和一致性设计。

**图形交互层**：引入 react-use-gesture 处理复杂手势，引入 @dnd-kit 处理拖拽操作，提供比原生实现更健壮的交互体验。

**性能增强层**：预留 Canvas/WebGL 扩展接口，对于特定场景（如大规模电路总览）可以切换到 Canvas 渲染模式。

## 5. 推荐架构设计方案

### 5.1 整体架构概览

Circuit-GUI 推荐采用五层架构设计，从上到下依次为：展示层（Presentation Layer）、应用层（Application Layer）、领域层（Domain Layer）、数据访问层（Data Access Layer）、基础设施层（Infrastructure Layer）。各层职责明确，依赖单向从上层指向下层。

```
┌─────────────────────────────────────────────────────────────┐
│                      展示层 (Presentation)                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐ │
│  │ Toolbar     │ │ Properties  │ │ Canvas (SVG/Canvas)   │ │
│  │ Component   │ │ Panel       │ │ Component             │ │
│  └─────────────┘ └─────────────┘ └─────────────────────────┘ │
└────────────────────────────┬────────────────────────────────┘
                             │ 依赖
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                      应用层 (Application)                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐ │
│  │ Editor      │ │ Selection   │ │ Tool Manager            │ │
│  │ Service     │ │ Manager     │ │                         │ │
│  └─────────────┘ └─────────────┘ └─────────────────────────┘ │
└────────────────────────────┬────────────────────────────────┘
                             │ 依赖
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                      领域层 (Domain)                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐ │
│  │ Circuit     │ │ Device      │ │ Connection              │ │
│  │ Model       │ │ Entity      │ │ Entity                  │ │
│  └─────────────┘ └─────────────┘ └─────────────────────────┘ │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐ │
│  │ Net         │ │ Design      │ │ Validation              │ │
│  │ Entity      │ │ Rules       │ │ Service                 │ │
│  └─────────────┘ └─────────────┘ └─────────────────────────┘ │
└────────────────────────────┬────────────────────────────────┘
                             │ 依赖
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   数据访问层 (Data Access)                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐ │
│  │ Repository  │ │ File        │ │ Undo/Redo               │ │
│  │ Pattern     │ │ Serializer  │ │ Manager                 │ │
│  └─────────────┘ └─────────────┘ └─────────────────────────┘ │
└────────────────────────────┬────────────────────────────────┘
                             │ 依赖
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   基础设施层 (Infrastructure)                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐ │
│  │ libavoid    │ │ Geometry    │ │ Event                   │ │
│  │ WASM        │ │ Utilities   │ │ System                  │ │
│  └─────────────┘ └─────────────┘ └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 各层详细设计

**5.2.1 领域层（Domain Layer）**

领域层是整个架构的核心，定义了电路设计的核心概念和业务规则。本层应完全独立于任何前端框架和外部依赖，仅使用 TypeScript 的基础类型系统。

领域层包含以下核心实体：

**Circuit（电路）**：顶层聚合根，包含设备集合、网络集合、图纸设置等。Circuit 维护设备的添加、删除、移动等操作，并负责设备的唯一标识生成。

**Device（设备）**：代表电路原理图中的元件，如电阻、电容、集成电路等。Device 包含以下关键属性：唯一标识符（id）、设备类型（type）、符号引用（symbolRef）、位置和旋转角度（position, rotation）、引脚列表（pins）、属性映射（properties）。Device 是值对象（Value Object），其状态变更通过领域事件驱动。

**Pin（引脚）**：代表设备的电气连接点，属于 Device 的组成成分。Pin 包含引脚编号、名称、类型（输入、输出、电源、双向）、位置坐标、所属网络引用等信息。

**Net（网络）**：代表电气连接关系，是原理图语义的核心。网络包含网络名称、连接的引脚列表等信息。网络具有唯一性约束：同一网络的引脚在电气上是等价的。

**Connection（连线）**：代表视觉层面的连接线，连接两个引脚或引脚与导线。连线记录路径点（waypoints）用于渲染，可能与 Net 一一对应（简单情况）或多对一对应（总线等复杂情况）。

**Port（端口）**：用于层次化设计，代表子系统对外暴露的连接点。端口引用内部网络，同时在父级图纸中表现为一个连接点。

**Symbol（符号）**：代表设备的图形表示，包括 SVG 路径数据、引脚布局、默认属性等。符号与设备类型关联，支持符号库管理。

领域层还包含以下领域服务和规则：

**DesignRules（设计规则）**：定义电路设计的基本约束，如最小连线间距、网络命名规则、引脚类型兼容性等。设计规则用于后续的 ERC/DRC 功能扩展。

**ValidationService（验证服务）**：提供领域级别的验证逻辑，如检查未连接的引脚、重复的网络名称、无效的设备类型组合等。验证服务通过领域事件与应用层通信。

领域层的设计原则：

**贫血模型 vs 充血模型**：考虑到电路设计的复杂性，建议采用适度的充血模型。实体（Device、Net）包含基本的业务逻辑（如移动时更新引脚位置），但复杂操作（如自动布线、网络合并）放在应用层或专门的领域服务中。

**不可变性原则**：领域对象的状态变更应产生新的对象实例或通过不可变更新操作（Immutable Update）实现。这与 React 的状态管理模式兼容，也有利于撤销/重做功能的实现。

**领域事件驱动**：领域对象的状态变更应发布领域事件（Domain Events），如 DeviceMoved、PinConnected、NetCreated 等。领域事件是层间通信和撤销/重做机制的基础。

**5.2.2 数据访问层（Data Access Layer）**

数据访问层负责领域数据的持久化、检索和缓存，对领域层提供透明的数据存取能力。

**Repository 模式**：为每个聚合根（主要是 Circuit）提供 Repository 接口。Repository 定义标准的 CRUD 操作和查询接口：

```typescript
interface ICircuitRepository {
  getById(id: string): Promise<Circuit | null>;
  save(circuit: Circuit): Promise<void>;
  findByName(name: string): Promise<Circuit[]>;
}
```

**FileSerializer（文件序列化器）**：负责 Circuit 数据与文件格式的双向转换。初期支持 JSON 格式，后续可扩展为 KiCAD 格式、Altium 格式等的导入导出。序列化器应保持格式的可扩展性，使用版本化的 schema 定义。

**UndoRedoManager（撤销重做管理器）**：实现命令模式（Command Pattern）管理撤销/重做栈。每次领域对象的状态变更封装为一个 Command 对象，包含变更前后的状态快照。管理器维护命令历史栈和当前位置，支持任意步的撤销和重做。

```
┌────────────────────────────────────────┐
│           Command History               │
├────────────────────────────────────────┤
│  Command 1: AddDevice                  │
│  Command 2: MoveDevice                 │
│  Command 3: AddConnection      ◀── Current
│  Command 4: (future)                   │
└────────────────────────────────────────┘
         │
         │ undo()
         ▼
┌────────────────────────────────────────┐
│           Revert to State 2            │
│  - Restore circuit state                │
│  - Publish reverse event               │
└────────────────────────────────────────┘
```

撤销/重做的实现需要与应用层的事件系统深度集成，确保 UI 层能够响应状态回滚。

**5.2.3 应用层（Application Layer）**

应用层编排领域对象完成具体的设计任务，包含编辑器的核心业务逻辑。本层作为领域层和展示层之间的桥梁，处理用户意图到领域操作的转换。

**EditorService（编辑器服务）**：编辑器的核心服务，协调各种编辑操作。主要职责包括：

- 管理当前编辑的电路文档（Circuit）
- 处理设备操作：添加、删除、移动、旋转、复制、粘贴
- 处理连线操作：创建连线、删除连线、编辑路径点
- 处理选择操作：单个选择、框选、按类型选择、按网络选择
- 提供查询接口：获取选中元素、获取指定位置元素、获取指定网络的所有连接

**ToolManager（工具管理器）**：管理编辑器的各种工具状态，如选择工具、放置工具、连线工具、文本工具等。工具定义了在该工具激活时的鼠标/键盘事件处理逻辑。工具之间可以互相切换，但同一时间只有一个工具处于激活状态。

```
┌────────────────────────────────────────┐
│           Tool Manager                  │
├────────────────────────────────────────┤
│  activeTool: SelectTool                │
│                                         │
│  tools: {                              │
│    select: SelectTool,                 │
│    place: PlaceTool,                   │
│    wire: WireTool,                      │
│    pan: PanTool,                        │
│    zoom: ZoomTool                       │
│  }                                     │
│                                         │
│  activate(toolName): void               │
│  handlePointerEvent(event): void       │
└────────────────────────────────────────┘
```

**SelectionManager（选择管理器）**：管理当前选中的元素集合，支持多种选择模式。选择变更通过事件系统通知展示层更新高亮显示。

**RoutingService（布线服务）**：封装 libavoid 算法，提供自动布线能力。服务接收起点、终点和约束条件，调用 libavoid 计算最优路径，并更新连线数据。服务应处理算法调用的异步性和性能问题，考虑使用 Web Worker 避免阻塞主线程。

**SymbolLibraryService（符号库服务）**：管理设备符号库，提供符号的加载、缓存和检索功能。符号库可以本地存储或从远程服务器获取，服务应提供统一的缓存机制。

**5.2.4 展示层（Presentation Layer）**

展示层负责用户界面的渲染和交互处理，是 React 组件的主要栖身之所。本层严格遵循展示职责，不包含业务逻辑，通过调用应用层服务完成用户意图。

**CanvasComponent（画布组件）**：核心的图形渲染组件，负责将领域数据渲染为可视化的 SVG 或 Canvas 图形。组件接收电路数据作为 props，内部维护视口状态（缩放比例、平移偏移），实现视口内元素的可见性裁剪。

Canvas 组件的关键设计点包括：

**渲染策略**：采用声明式渲染方式，电路数据的变化触发组件重新渲染。内部使用 React.memo 和 useMemo 优化性能，只对变化的图形元素进行更新。

**事件处理**：Canvas 接收原生的指针事件（pointerdown、pointermove、pointerup 等），根据当前激活的工具和选中状态分发事件处理逻辑。事件处理委托给工具对象（Tool），工具对象通过调用 EditorService 完成操作。

**图层管理**：将图形元素按类型分组渲染（背景层、设备层、连线层、选择层、编辑层），支持图层的显示/隐藏控制。

**交互层组件**：

**ToolbarComponent（工具栏组件）**：提供工具切换、常用操作的快捷入口。

**PropertiesPanelComponent（属性面板组件）**：显示选中元素的属性信息，支持属性编辑。属性面板监听选择变更事件，动态渲染对应的属性表单。

**SymbolPaletteComponent（符号面板组件）**：提供符号库的浏览、搜索和拖拽放置功能。

**LayersPanelComponent（图层面板组件）**：管理各图层的可见性和锁定状态。

**StatusBarComponent（状态栏组件）**：显示当前工具、光标位置、缩放比例、设计规则状态等信息。

展示层与下层的通信模式：

**Props 向下传递**：领域数据、视口状态等通过 props 向下传递。

**回调向上通知**：用户操作通过回调函数（onDeviceAdd、onSelectionChange 等）向上传递到应用层处理。

**Context 共享状态**：对于全局状态（如当前工具、编辑器服务实例），通过 React Context 提供，避免 prop drilling。

**5.2.5 基础设施层（Infrastructure Layer）**

基础设施层提供技术层面的通用能力，包括算法实现、几何计算、事件系统等。

**libavoid 封装**：将 libavoid WebAssembly 模块封装为 TypeScript 模块，提供路由计算接口。封装层处理初始化、内存管理和结果解析。

```typescript
// routing/connector.ts
import { Router, Point, ConnRef } from 'libavoid-js';

export class Connector {
  private router: Router;
  
  constructor() {
    this.router = new Router();
  }
  
  setCallbacks(shapeCallback: ShapeCallback, routerCallback: RouterCallback): void {
    this.router.setCallback(shapeCallback, routerCallback);
  }
  
  processTransactions(): void {
    this.router.processTransactions();
  }
  
  getRoute(connectorRef: ConnRef): Point[] {
    return this.router.getRoute(connectorRef);
  }
  
  // ... 其他方法
}
```

**几何计算工具**：提供向量运算、包围盒计算、点在线段上判断、线段交点计算等几何基础操作。

**事件系统**：实现轻量级的事件发布-订阅系统，用于层间通信。事件系统是实现撤销/重做、跨组件联动的关键基础设施。

### 5.3 模块间依赖关系

```
                    ┌─────────────────────────────────────────┐
                    │              Presentation                 │
                    │  ┌─────────┐ ┌─────────┐ ┌───────────┐   │
                    │  │ Canvas  │ │ Toolbar │ │ Properties│   │
                    │  └────┬────┘ └────┬────┘ └─────┬─────┘   │
                    └───────┼───────────┼─────────────┼─────────┘
                            │ 依赖      │ 依赖        │ 依赖
                            ▼          ▼            ▼
                    ┌─────────────────────────────────────────┐
                    │              Application                 │
                    │  ┌─────────┐ ┌─────────┐ ┌───────────┐   │
                    │  │ Editor  │ │ Tool    │ │ Routing   │   │
                    │  │ Service │ │ Manager │ │ Service   │   │
                    │  └────┬────┘ └────┬────┘ └─────┬─────┘   │
                    └───────┼───────────┼─────────────┼─────────┘
                            │ 依赖      │ 依赖        │ 依赖
                            ▼          ▼            ▼
┌─────────────────────────────────────────────────────────────────┐
│                          Domain                                   │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ Circuit │ │ Device  │ │   Net   │ │ Connection│ │ Symbol │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
└─────────────────────────────────────────────────────────────────┘
                            │ 依赖
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Data Access                                 │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐               │
│  │Repository│ │Serializer│ │ UndoRedo│ │ Events  │               │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘               │
└─────────────────────────────────────────────────────────────────┘
                            │ 依赖
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Infrastructure                              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                            │
│  │libavoid │ │Geometry │ │  Utils  │                            │
│  └─────────┘ └─────────┘ └─────────┘                            │
└─────────────────────────────────────────────────────────────────┘
```

依赖规则：

- **单向依赖**：每层只能依赖其下方的层，不能反向依赖或跨层依赖。
- **接口隔离**：层间通信通过接口（Interface）进行，具体实现可替换。
- **依赖注入**：使用 DI 容器或 React Context 注入依赖，便于测试和配置。

### 5.4 关键设计模式应用

**5.4.1 命令模式（Command Pattern）**

撤销/重做功能的实现依赖命令模式。每次用户操作封装为一个 Command 对象：

```typescript
interface Command {
  execute(): void;
  undo(): void;
  getDescription(): string;
}

// 示例：添加设备的命令
class AddDeviceCommand implements Command {
  private device: Device;
  
  constructor(
    private circuit: Circuit,
    private symbolLibrary: ISymbolLibrary
  ) {
    this.device = new Device(symbolLibrary.getSymbol('resistor'));
  }
  
  execute(): void {
    this.circuit.addDevice(this.device);
  }
  
  undo(): void {
    this.circuit.removeDevice(this.device.id);
  }
  
  getDescription(): string {
    return `添加设备: ${this.device.type}`;
  }
}
```

命令对象的好处：

- 支持任意步的撤销和重做
- 命令可以序列化，支持操作历史的长久化
- 命令可以组合（Composite Pattern），支持复合操作
- 命令对象可以用于操作日志和审计

**5.4.2 观察者模式（Observer Pattern）**

组件间的联动通过观察者模式实现：

```typescript
// 事件发射器
class CircuitEmitter {
  private listeners: Map<string, Function[]> = new Map();
  
  subscribe(event: string, callback: Function): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
    return () => this.unsubscribe(event, callback);
  }
  
  emit(event: string, data: any): void {
    this.listeners.get(event)?.forEach(cb => cb(data));
  }
}

// 领域事件
type DomainEvent = 
  | { type: 'DEVICE_ADDED'; device: Device }
  | { type: 'DEVICE_MOVED'; deviceId: string; position: Point }
  | { type: 'NET_CREATED'; net: Net }
  | { type: 'SELECTION_CHANGED'; selectedIds: string[] };
```

事件系统用于：

- 撤销/重做栈监听状态变更
- Canvas 组件监听数据变更并重渲染
- 属性面板监听选择变更并显示属性
- 状态栏监听编辑器状态并更新显示

**5.4.3 策略模式（Strategy Pattern）**

工具系统使用策略模式，不同的工具实现共同的接口：

```typescript
interface Tool {
  name: string;
  cursor: string;
  
  onPointerDown(event: PointerEvent, context: EditorContext): void;
  onPointerMove(event: PointerEvent, context: EditorContext): void;
  onPointerUp(event: PointerEvent, context: EditorContext): void;
  onKeyDown(event: KeyboardEvent, context: EditorContext): void;
}

// 选择工具实现
class SelectTool implements Tool {
  name = 'select';
  cursor = 'default';
  
  private selectionStart: Point | null = null;
  
  onPointerDown(event: PointerEvent, context: EditorContext): void {
    const hitElement = context.hitTest(event.position);
    if (hitElement) {
      context.setSelection([hitElement.id]);
    } else {
      this.selectionStart = event.position;
      context.startRubberBand(this.selectionStart);
    }
  }
  
  // ... 其他方法
}
```

策略模式使得工具可以独立演进，新工具的添加不影响现有代码。

## 6. 数据模型设计

### 6.1 核心数据模型定义

以下是领域层核心数据模型的 TypeScript 类型定义：

```typescript
// types/circuit.ts

// 基础类型
type Point = { x: number; y: number };
type Size = { width: number; height: number };
type Id = string;

// 枚举类型
enum PinType {
  Input = 'input',
  Output = 'output',
  Bidirectional = 'bidirectional',
  Power = 'power',
  Passive = 'passive'
}

enum DeviceRotation {
  Deg0 = 0,
  Deg90 = 90,
  Deg180 = 180,
  Deg270 = 270
}

// 引脚
interface Pin {
  id: Id;
  number: string;
  name: string;
  type: PinType;
  position: Point; // 相对于设备原点
  connectedNetId: Id | null;
}

// 设备属性
interface DeviceProperties {
  [key: string]: string | number | boolean;
}

// 设备
interface Device {
  id: Id;
  type: string; // 设备类型，如 'resistor', 'capacitor', 'IC_7400'
  symbolId: string; // 引用的符号 ID
  label: string; // 显示名称，如 'R1', 'C2'
  position: Point;
  rotation: DeviceRotation;
  pins: Pin[];
  properties: DeviceProperties;
  locked: boolean;
}

// 连线路径点
interface Waypoint {
  position: Point;
  mode: 'straight' | 'curve' | 'break';
}

// 连线
interface Connection {
  id: Id;
  sourceDeviceId: Id;
  sourcePinId: Id;
  targetDeviceId: Id;
  targetPinId: Id;
  waypoints: Waypoint[];
  netId: Id;
  width: number;
  style: 'solid' | 'dashed' | 'dotted';
}

// 网络
interface Net {
  id: Id;
  name: string;
  color: string | null;
  pinIds: Array<{ deviceId: Id; pinId: Id }>;
}

// 图纸设置
interface SheetSettings {
  size: Size;
  backgroundColor: string;
  gridSize: number;
  showGrid: boolean;
  showHidden: boolean;
}

// 电路文档
interface Circuit {
  id: Id;
  name: string;
  description: string;
  devices: Map<Id, Device>;
  connections: Map<Id, Connection>;
  nets: Map<Id, Net>;
  settings: SheetSettings;
  version: number;
}
```

### 6.2 状态管理方案

推荐使用 Zustand 作为状态管理方案。Zustand 相比 Redux 更轻量，API 更简洁，与 TypeScript 和 React 的配合良好。

```typescript
// store/circuitStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface CircuitState {
  circuit: Circuit | null;
  selection: Set<Id>;
  activeTool: string;
  viewport: { offset: Point; zoom: number };
  
  // 操作
  loadCircuit: (circuit: Circuit) => void;
  addDevice: (device: Device) => void;
  moveDevice: (id: Id, position: Point) => void;
  deleteDevice: (id: Id) => void;
  setSelection: (ids: Id[]) => void;
  addToSelection: (id: Id) => void;
  clearSelection: () => void;
  setActiveTool: (tool: string) => void;
  setViewport: (viewport: Partial<Viewport>) => void;
}

export const useCircuitStore = create<CircuitState>()(
  immer((set, get) => ({
    circuit: null,
    selection: new Set(),
    activeTool: 'select',
    viewport: { offset: { x: 0, y: 0 }, zoom: 1 },
    
    loadCircuit: (circuit) => set({ circuit }),
    
    addDevice: (device) => set((state) => {
      if (state.circuit) {
        state.circuit.devices.set(device.id, device);
      }
    }),
    
    moveDevice: (id, position) => set((state) => {
      if (state.circuit) {
        const device = state.circuit.devices.get(id);
        if (device) {
          device.position = position;
        }
      }
    }),
    
    // ... 其他操作
  }))
);
```

Zustand 的中间件机制（如 immer、persist）可以简化不可变更新和数据持久化。

### 6.3 数据流设计

数据流动遵循单向数据流（Unidirectional Data Flow）原则：

```
用户操作 → Canvas 组件
    ↓
工具处理 (Tool.onPointerDown)
    ↓
EditorService 执行操作
    ↓
领域层状态更新 (Circuit.addDevice)
    ↓
领域事件发布 (DEVICE_ADDED)
    ↓
UndoRedoManager 记录命令
    ↓
Store 状态更新 (useCircuitStore)
    ↓
React 组件重渲染
    ↓
Canvas 组件重新绘制 SVG
```

撤销操作的反向流程：

```
撤销命令 → UndoRedoManager
    ↓
执行 Command.undo()
    ↓
领域层状态回滚 (Circuit.removeDevice)
    ↓
领域事件发布 (DEVICE_REMOVED)
    ↓
Store 状态回滚
    ↓
UI 更新
```

## 7. 性能优化策略

### 7.1 渲染性能优化

**7.1.1 虚拟化渲染**

对于大型电路，SVG 元素数量可能达到数千个。虚拟化渲染策略只渲染视口（viewport）内可见的元素：

```typescript
// hooks/useVirtualization.ts
export function useVirtualization(
  items: Device[],
  viewport: Viewport,
  buffer: number = 100 // 视口缓冲区
): Device[] {
  const viewBounds = {
    left: viewport.offset.x - buffer,
    right: viewport.offset.x + viewport.width / viewport.zoom + buffer,
    top: viewport.offset.y - buffer,
    bottom: viewport.offset.y + viewport.height / viewport.zoom + buffer,
  };
  
  return items.filter(item => {
    const bounds = getDeviceBounds(item);
    return (
      bounds.right >= viewBounds.left &&
      bounds.left <= viewBounds.right &&
      bounds.bottom >= viewBounds.top &&
      bounds.top <= viewBounds.bottom
    );
  });
}
```

**7.1.2 分层渲染**

将图形按更新频率分层：

| 图层 | 内容 | 更新频率 | 渲染技术 |
|------|------|----------|----------|
| 背景层 | 网格、图纸边框 | 低 | 静态 SVG |
| 设备层 | 元件符号 | 中 | 动态 SVG |
| 连线层 | 导线、网络 | 中 | 动态 SVG |
| 编辑层 | 正在创建的连线 | 高 | 动态 SVG |
| 覆盖层 | 选择框、高亮 | 高 | 动态 SVG |

分层渲染的好处是静态层可以使用 CSS transform 优化，而动态层使用 React 状态驱动。

**7.1.3 批量更新**

使用 requestAnimationFrame 批量处理高频事件（如鼠标移动）：

```typescript
// hooks/useBatchedUpdates.ts
export function useBatchedUpdates<T>(
  callback: (value: T) => void,
  delay: number = 16
) {
  const pendingRef = useRef<T | null>(null);
  const timeoutRef = useRef<number>();
  
  useEffect(() => {
    const flush = () => {
      if (pendingRef.current !== null) {
        callback(pendingRef.current);
        pendingRef.current = null;
      }
    };
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [callback]);
  
  return (value: T) => {
    pendingRef.current = value;
    if (!timeoutRef.current) {
      timeoutRef.current = window.setTimeout(() => {
        flush();
        timeoutRef.current = undefined;
      }, delay);
    }
  };
}
```

### 7.2 内存和计算优化

**7.2.1 Web Worker 卸载**

将密集计算任务移到 Web Worker：

- libavoid 路由计算
- 批量选择检测
- DRC/ERC 检查
- 文件序列化和反序列化

```typescript
// workers/routing.worker.ts
import { Router } from 'libavoid-js';

const router = new Router();

self.onmessage = (event) => {
  const { type, payload, id } = event.data;
  
  switch (type) {
    case 'CALCULATE_ROUTE':
      const route = router.getRoute(payload.connectorRef);
      self.postMessage({ type: 'ROUTE_RESULT', payload: route, id });
      break;
  }
};
```

**7.2.2 记忆化和缓存**

```typescript
// 设备包围盒缓存
const deviceBoundsCache = new Map<Id, BoundingBox>();

function getDeviceBounds(device: Device): BoundingBox {
  if (deviceBoundsCache.has(device.id)) {
    return deviceBoundsCache.get(device.id)!;
  }
  
  const bounds = calculateBounds(device);
  deviceBoundsCache.set(device.id, bounds);
  return bounds;
}

// 符号路径缓存
const symbolPathCache = new Map<string, string>();

function getSymbolPath(symbolId: string): string {
  if (symbolPathCache.has(symbolId)) {
    return symbolPathCache.get(symbolId)!;
  }
  
  const path = loadSymbolFromLibrary(symbolId);
  symbolPathCache.set(symbolId, path);
  return path;
}
```

### 7.3 交互响应优化

**7.3.1 节流和防抖**

对于非关键路径的事件处理（如状态栏更新）使用节流或防抖：

```typescript
import { throttle } from 'lodash-es';

// 节流：状态栏位置显示（每秒最多更新 10 次）
const updateCursorPosition = throttle((position: Point) => {
  setCursorPosition(position);
}, 100);

// 防抖：属性面板搜索（停止输入 300ms 后执行）
const debouncedSearch = debounce((query: string) => {
  performSearch(query);
}, 300);
```

**7.3.2 即时反馈**

在操作完成前提供视觉反馈，提升感知性能：

```typescript
async function handleDeviceMove(deviceId: Id, newPosition: Point) {
  // 即时更新视觉位置
  setDevicePosition(deviceId, newPosition);
  
  // 显示临时高亮
  showPlacementPreview(deviceId);
  
  // 异步执行完整更新（可能涉及网络请求或复杂计算）
  await editorService.moveDevice(deviceId, newPosition);
  
  // 确认后移除临时效果
  hidePlacementPreview(deviceId);
}
```

## 8. 未来扩展方向

### 8.1 层次化设计

层次化设计允许原理图嵌套，支持模块化和复用：

```
顶层图纸
├── Device A (子图纸)
│   ├── 子设备 1
│   └── 子设备 2
├── Device B
└── 顶层设备
```

实现要点：

- Port（端口）和 Pin（引脚）的映射关系
- 层次间的事件传播
- 子图纸的按需加载
- 层次导航（进入/退出子图纸）

### 8.2 符号库管理

符号库系统需要支持：

- 符号的分类浏览和搜索
- 符号的创建、编辑和删除
- 符号的导入/导出（KiCAD 符号格式兼容）
- 符号版本管理
- 远程符号库（HTTP API）

### 8.3 协同编辑

云端协同是现代 EDA 的趋势，需要：

- 实时同步机制（WebSocket/CRDT）
- 操作变换（Operational Transformation）
- 冲突解决策略
- 权限控制

### 8.4 ERC/DRC 集成

电气规则检查和设计规则检查：

- 规则定义引擎
- 违规高亮显示
- 自动修复建议
- 规则报告导出

### 8.5 PCB 导出

与 PCB 设计工具的数据交换：

- 网表导出（SPICE, KiCAD Netlist）
- 制造文件导出（Gerber, IPC-2581）
- IPC-7351 封装库兼容

## 9. 实施路线图

### 9.1 第一阶段：架构基础设施（第 1-2 周）

**目标**：建立清晰的架构层次和核心基础设施。

**任务清单**：

1. 重构项目目录结构，按五层架构组织代码
2. 实现领域层核心数据模型（Device, Net, Connection, Circuit）
3. 实现轻量级事件系统
4. 实现 UndoRedoManager
5. 配置 Zustand 状态管理
6. 编写领域层单元测试

**交付物**：

- 新的项目目录结构
- 领域模型 TypeScript 定义
- 事件系统和 UndoRedoManager 实现
- 核心领域逻辑测试覆盖

### 9.2 第二阶段：编辑器核心（第 3-5 周）

**目标**：实现基础的电路编辑功能。

**任务清单**：

1. 实现 EditorService（设备添加、删除、移动）
2. 实现 SelectionManager
3. 重构 Canvas 组件，集成新的状态管理
4. 实现 ToolManager 和基础工具（选择、移动）
5. 实现设备拖放放置功能
6. 实现符号库服务和符号面板
7. 集成属性面板

**交付物**：

- 可运行的设备放置和编辑功能
- 完整的工具切换机制
- 符号库浏览和放置

### 9.3 第三阶段：连线系统（第 6-7 周）

**目标**：完善连线和网络功能。

**任务清单**：

1. 实现连线工具（创建、编辑、删除连线）
2. 优化 libavoid 集成，支持 Web Worker
3. 实现自动布线功能
4. 实现网络管理和网络高亮
5. 连线相关的撤销/重做支持

**交付物**：

- 完整的连线编辑功能
- 自动布线能力
- 网络管理界面

### 9.4 第四阶段：完善和优化（第 8-10 周）

**目标**：完善功能、提升性能和用户体验。

**任务清单**：

1. 实现键盘快捷键系统
2. 性能优化（虚拟化、批量更新）
3. 实现复制/粘贴和撤销/重做 UI
4. 完善错误处理和用户提示
5. 文件保存和加载（JSON 格式）
6. 端到端测试

**交付物**：

- 完整功能的电路编辑器
- 性能基准测试报告
- 可用的保存/加载功能

### 9.5 持续改进

**代码质量**：

- 保持 80% 以上的测试覆盖率
- 定期代码审查
- 文档更新

**功能迭代**：

- 层次化设计
- ERC/DRC 规则引擎
- 云端协同

## 10. 结论

本文档为 Circuit-GUI 项目制定了系统化的架构设计方案。核心建议包括：

**架构选择**：采用五层架构（展示层、应用层、领域层、数据访问层、基础设施层），通过明确的层次边界和单向依赖关系，确保代码的可维护性和可测试性。

**技术路线**：延续 SVG 作为主要渲染技术，结合 Zustand 状态管理和 React 组件化能力，通过分层渲染和虚拟化技术解决性能瓶颈。

**数据模型**：建立以 Circuit-Device-Net-Connection 为核心的领域模型，通过 Repository 模式和事件系统实现清晰的数据流转。

**关键模式**：命令模式支撑撤销/重做，策略模式支撑工具系统，观察者模式支撑组件联动。

**实施策略**：分四个阶段逐步构建，从架构基础设施到核心功能再到优化完善，降低实施风险。

本架构设计充分借鉴了 KiCAD 等成熟 EDA 软件的最佳实践，同时结合了现代前端技术的特点，为 Circuit-GUI 的长期发展奠定了坚实基础。建议在第一阶段实施前，进行详细的评审和确认，确保方案得到团队的充分理解和支持。
