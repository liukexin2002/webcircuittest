/**
 * Circuit 实体 - 电路实体
 * 顶层聚合根，管理整个电路文档
 */

import type { Id, Point, Size } from '../types';
import { Device } from './Device';
import { Connection } from './Connection';
import { Net } from './Net';

export interface SheetSettings {
  size: Size;
  backgroundColor: string;
  gridSize: number;
  showGrid: boolean;
  showHidden: boolean;
}

export interface CircuitProps {
  id: Id;
  name: string;
  description: string;
  settings: SheetSettings;
  version: number;
}

export class Circuit {
  public id: Id;
  public name: string;
  public description: string;
  public settings: SheetSettings;
  public version: number;
  public devices: Map<Id, Device>;
  public connections: Map<Id, Connection>;
  public nets: Map<Id, Net>;

  constructor(props: CircuitProps) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.settings = {
      size: { ...props.settings.size },
      backgroundColor: props.settings.backgroundColor,
      gridSize: props.settings.gridSize,
      showGrid: props.settings.showGrid,
      showHidden: props.settings.showHidden
    };
    this.version = props.version;
    this.devices = new Map();
    this.connections = new Map();
    this.nets = new Map();
  }

  /**
   * 克隆电路
   */
  clone(): Circuit {
    const circuit = new Circuit({
      id: this.id,
      name: this.name,
      description: this.description,
      settings: {
        size: { ...this.settings.size },
        backgroundColor: this.settings.backgroundColor,
        gridSize: this.settings.gridSize,
        showGrid: this.settings.showGrid,
        showHidden: this.settings.showHidden
      },
      version: this.version
    });

    this.devices.forEach((device, id) => {
      circuit.devices.set(id, device.clone());
    });

    this.connections.forEach((connection, id) => {
      circuit.connections.set(id, connection.clone());
    });

    this.nets.forEach((net, id) => {
      circuit.nets.set(id, net.clone());
    });

    return circuit;
  }

  /**
   * 添加设备
   */
  addDevice(device: Device): void {
    this.devices.set(device.id, device);
  }

  /**
   * 移除设备
   */
  removeDevice(deviceId: Id): void {
    this.devices.delete(deviceId);
  }

  /**
   * 根据ID获取设备
   */
  getDevice(deviceId: Id): Device | undefined {
    return this.devices.get(deviceId);
  }

  /**
   * 获取所有设备
   */
  getAllDevices(): Device[] {
    return Array.from(this.devices.values());
  }

  /**
   * 添加连线
   */
  addConnection(connection: Connection): void {
    this.connections.set(connection.id, connection);
  }

  /**
   * 移除连线
   */
  removeConnection(connectionId: Id): void {
    this.connections.delete(connectionId);
  }

  /**
   * 根据ID获取连线
   */
  getConnection(connectionId: Id): Connection | undefined {
    return this.connections.get(connectionId);
  }

  /**
   * 添加网络
   */
  addNet(net: Net): void {
    this.nets.set(net.id, net);
  }

  /**
   * 移除网络
   */
  removeNet(netId: Id): void {
    this.nets.delete(netId);
  }

  /**
   * 根据ID获取网络
   */
  getNet(netId: Id): Net | undefined {
    return this.nets.get(netId);
  }

  /**
   * 清空电路
   */
  clear(): void {
    this.devices.clear();
    this.connections.clear();
    this.nets.clear();
    this.version++;
  }
}
