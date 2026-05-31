/**
 * 编辑器服务
 * 核心业务服务，协调各种编辑操作
 */

import { type Id, type Point, DeviceRotation } from '../../domain';
import {
  Circuit,
  Device,
  type DeviceProperties,
  Pin,
  PinType,
  Net,
  Connection
} from '../../domain';
import { EventEmitter, IdGenerator } from '../../infrastructure';
import {
  DomainEventType,
  type DomainEvent,
  type DeviceAddedEvent,
  type DeviceRemovedEvent,
  type DeviceMovedEvent
} from '../../domain';
import { UndoRedoManager, type Command } from '../../data';

export class EditorService {
  private circuit: Circuit | null = null;
  private selectedIds: Set<Id> = new Set();
  private eventEmitter: EventEmitter;
  private undoRedoManager: UndoRedoManager;

  constructor(
    eventEmitter: EventEmitter,
    undoRedoManager: UndoRedoManager
  ) {
    this.eventEmitter = eventEmitter;
    this.undoRedoManager = undoRedoManager;
  }

  /**
   * 创建新电路
   */
  createNewCircuit(name: string = 'Untitled'): Circuit {
    const circuit = new Circuit({
      id: IdGenerator.generate(),
      name,
      description: '',
      settings: {
        size: { width: 1000, height: 800 },
        backgroundColor: '#f0f0f0',
        gridSize: 20,
        showGrid: true,
        showHidden: false
      },
      version: 1
    });

    this.circuit = circuit;
    this.clearSelection();
    this.undoRedoManager.clearHistory();

    this.eventEmitter.emit(DomainEventType.CIRCUIT_LOADED, {
      type: DomainEventType.CIRCUIT_LOADED,
      timestamp: Date.now(),
      circuit
    } as DomainEvent);

    return circuit;
  }

  /**
   * 获取当前电路
   */
  getCircuit(): Circuit | null {
    return this.circuit;
  }

  /**
   * 加载电路
   */
  loadCircuit(circuit: Circuit): void {
    this.circuit = circuit.clone();
    this.clearSelection();
    this.undoRedoManager.clearHistory();

    this.eventEmitter.emit(DomainEventType.CIRCUIT_LOADED, {
      type: DomainEventType.CIRCUIT_LOADED,
      timestamp: Date.now(),
      circuit: this.circuit
    } as DomainEvent);
  }

  /**
   * 添加设备
   */
  addDevice(
    type: string,
    symbolId: string,
    position: Point,
    label: string = ''
  ): Device {
    if (!this.circuit) {
      throw new Error('No circuit loaded');
    }

    const deviceId = IdGenerator.generateDeviceId();
    const pins = this.createDefaultPins();

    const device = new Device({
      id: deviceId,
      type,
      symbolId,
      label: label || `${type.toUpperCase()}1`,
      position,
      rotation: DeviceRotation.Deg0,
      pins,
      properties: {},
      locked: false
    });

    const command = this.createAddDeviceCommand(device);
    this.undoRedoManager.executeCommand(command);

    return device;
  }

  /**
   * 移除设备
   */
  removeDevice(deviceId: Id): void {
    if (!this.circuit) {
      throw new Error('No circuit loaded');
    }

    const command = this.createRemoveDeviceCommand(deviceId);
    this.undoRedoManager.executeCommand(command);
  }

  /**
   * 移动设备
   */
  moveDevice(deviceId: Id, newPosition: Point): void {
    if (!this.circuit) {
      throw new Error('No circuit loaded');
    }

    const device = this.circuit.getDevice(deviceId);
    if (!device) {
      return;
    }

    const previousPosition = { ...device.position };

    const command = this.createMoveDeviceCommand(
      deviceId,
      previousPosition,
      newPosition
    );
    this.undoRedoManager.executeCommand(command);
  }

  /**
   * 获取选中的ID
   */
  getSelectedIds(): Set<Id> {
    return new Set(this.selectedIds);
  }

  /**
   * 设置选中项
   */
  setSelection(ids: Id[]): void {
    const previous = new Set(this.selectedIds);
    this.selectedIds = new Set(ids);
    this.emitSelectionChange(previous);
  }

  /**
   * 清除选中
   */
  clearSelection(): void {
    const previous = new Set(this.selectedIds);
    this.selectedIds.clear();
    this.emitSelectionChange(previous);
  }

  /**
   * 撤销
   */
  undo(): void {
    this.undoRedoManager.undo();
  }

  /**
   * 重做
   */
  redo(): void {
    this.undoRedoManager.redo();
  }

  /**
   * 检查是否可以撤销
   */
  canUndo(): boolean {
    return this.undoRedoManager.canUndo();
  }

  /**
   * 检查是否可以重做
   */
  canRedo(): boolean {
    return this.undoRedoManager.canRedo();
  }

  /**
   * 创建默认引脚
   */
  private createDefaultPins(): Pin[] {
    return [
      new Pin({
        id: IdGenerator.generatePinId(),
        number: '1',
        name: 'Pin1',
        type: PinType.Passive,
        position: { x: -30, y: 0 },
        connectedNetId: null
      }),
      new Pin({
        id: IdGenerator.generatePinId(),
        number: '2',
        name: 'Pin2',
        type: PinType.Passive,
        position: { x: 30, y: 0 },
        connectedNetId: null
      })
    ];
  }

  /**
   * 发布选择变化事件
   */
  private emitSelectionChange(previous: Set<Id>): void {
    this.eventEmitter.emit(DomainEventType.SELECTION_CHANGED, {
      type: DomainEventType.SELECTION_CHANGED,
      timestamp: Date.now(),
      selectedIds: new Set(this.selectedIds),
      previousSelectedIds: previous
    } as DomainEvent);
  }

  /**
   * 创建添加设备命令
   */
  private createAddDeviceCommand(device: Device): Command {
    const self = this;
    return {
      execute(): void {
        if (!self.circuit) return;
        self.circuit.addDevice(device);
        self.eventEmitter.emit(DomainEventType.DEVICE_ADDED, {
          type: DomainEventType.DEVICE_ADDED,
          timestamp: Date.now(),
          device
        } as DeviceAddedEvent);
      },

      undo(): void {
        if (!self.circuit) return;
        self.circuit.removeDevice(device.id);
        self.eventEmitter.emit(DomainEventType.DEVICE_REMOVED, {
          type: DomainEventType.DEVICE_REMOVED,
          timestamp: Date.now(),
          deviceId: device.id
        } as DeviceRemovedEvent);
      },

      getDescription(): string {
        return `Add ${device.label}`;
      }
    };
  }

  /**
   * 创建移除设备命令
   */
  private createRemoveDeviceCommand(deviceId: Id): Command {
    const self = this;
    const device = this.circuit?.getDevice(deviceId);

    if (!device) {
      throw new Error('Device not found');
    }

    const deviceCopy = device.clone();

    return {
      execute(): void {
        if (!self.circuit) return;
        self.circuit.removeDevice(deviceId);
        self.selectedIds.delete(deviceId);
        self.eventEmitter.emit(DomainEventType.DEVICE_REMOVED, {
          type: DomainEventType.DEVICE_REMOVED,
          timestamp: Date.now(),
          deviceId
        } as DeviceRemovedEvent);
      },

      undo(): void {
        if (!self.circuit) return;
        self.circuit.addDevice(deviceCopy.clone());
        self.eventEmitter.emit(DomainEventType.DEVICE_ADDED, {
          type: DomainEventType.DEVICE_ADDED,
          timestamp: Date.now(),
          device: deviceCopy
        } as DeviceAddedEvent);
      },

      getDescription(): string {
        return `Remove ${device.label}`;
      }
    };
  }

  /**
   * 创建移动设备命令
   */
  private createMoveDeviceCommand(
    deviceId: Id,
    previousPosition: Point,
    newPosition: Point
  ): Command {
    const self = this;
    return {
      execute(): void {
        const device = self.circuit?.getDevice(deviceId);
        if (!device) return;

        device.move(newPosition);
        self.eventEmitter.emit(DomainEventType.DEVICE_MOVED, {
          type: DomainEventType.DEVICE_MOVED,
          timestamp: Date.now(),
          deviceId,
          position: newPosition,
          previousPosition
        } as DeviceMovedEvent);
      },

      undo(): void {
        const device = self.circuit?.getDevice(deviceId);
        if (!device) return;

        device.move(previousPosition);
        self.eventEmitter.emit(DomainEventType.DEVICE_MOVED, {
          type: DomainEventType.DEVICE_MOVED,
          timestamp: Date.now(),
          deviceId,
          position: previousPosition,
          previousPosition: newPosition
        } as DeviceMovedEvent);
      },

      getDescription(): string {
        return 'Move Device';
      }
    };
  }
}
