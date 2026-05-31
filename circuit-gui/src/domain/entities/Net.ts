/**
 * Net 实体 - 网络实体
 * 代表电气连接关系
 */

import type { Id } from '../types';

export interface NetProps {
  id: Id;
  name: string;
  color: string | null;
  pinIds: Array<{ deviceId: Id; pinId: Id }>;
  isBus?: boolean;
  busWidth?: number;
  voltage?: number;
  isPowerNet?: boolean;
  isGroundNet?: boolean;
  netClass?: string;
  priority?: number;
  isVisible?: boolean;
}

export class Net {
  public id: Id;
  public name: string;
  public color: string | null;
  public pinIds: Array<{ deviceId: Id; pinId: Id }>;
  public isBus: boolean;
  public busWidth?: number;
  public voltage?: number;
  public isPowerNet: boolean;
  public isGroundNet: boolean;
  public netClass?: string;
  public priority: number;
  public isVisible: boolean;

  constructor(props: NetProps) {
    this.id = props.id;
    this.name = props.name;
    this.color = props.color;
    this.pinIds = [...props.pinIds];
    this.isBus = props.isBus ?? false;
    this.busWidth = props.busWidth;
    this.voltage = props.voltage;
    this.isPowerNet = props.isPowerNet ?? false;
    this.isGroundNet = props.isGroundNet ?? false;
    this.netClass = props.netClass;
    this.priority = props.priority ?? 0;
    this.isVisible = props.isVisible ?? true;
  }

  /**
   * 克隆网络
   */
  clone(): Net {
    return new Net({
      id: this.id,
      name: this.name,
      color: this.color,
      pinIds: [...this.pinIds],
      isBus: this.isBus,
      busWidth: this.busWidth,
      voltage: this.voltage,
      isPowerNet: this.isPowerNet,
      isGroundNet: this.isGroundNet,
      netClass: this.netClass,
      priority: this.priority,
      isVisible: this.isVisible
    });
  }

  /**
   * 添加引脚连接
   */
  addPin(deviceId: Id, pinId: Id): void {
    const exists = this.pinIds.some(
      p => p.deviceId === deviceId && p.pinId === pinId
    );
    if (!exists) {
      this.pinIds.push({ deviceId, pinId });
    }
  }

  /**
   * 移除引脚连接
   */
  removePin(deviceId: Id, pinId: Id): void {
    this.pinIds = this.pinIds.filter(
      p => !(p.deviceId === deviceId && p.pinId === pinId)
    );
  }

  /**
   * 检查引脚是否在此网络中
   */
  hasPin(deviceId: Id, pinId: Id): boolean {
    return this.pinIds.some(
      p => p.deviceId === deviceId && p.pinId === pinId
    );
  }

  /**
   * 获取连接的引脚数量
   */
  getPinCount(): number {
    return this.pinIds.length;
  }

  /**
   * 检查是否为空网络（没有连接的引脚）
   */
  isEmpty(): boolean {
    return this.pinIds.length === 0;
  }

  /**
   * 更新网络名称
   */
  setName(name: string): void {
    this.name = name;
  }

  /**
   * 设置网络颜色
   */
  setColor(color: string | null): void {
    this.color = color;
  }
}
