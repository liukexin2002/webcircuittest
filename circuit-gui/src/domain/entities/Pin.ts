/**
 * Pin 实体 - 引脚实体
 * 代表设备的电气连接点
 */

import type { Id, Point, PinType } from '../types';
import { PinDirection } from '../types';

export interface PinProps {
  id: Id;
  number: string;
  name: string;
  type: PinType;
  position: Point;
  connectedNetId: Id | null;
  direction?: PinDirection;
  length?: number;
  visible?: boolean;
  electricalType?: 'digital' | 'analog' | 'power' | 'ground';
  description?: string;
  isClock?: boolean;
  isReset?: boolean;
}

export class Pin {
  public id: Id;
  public number: string;
  public name: string;
  public type: PinType;
  public position: Point;
  public connectedNetId: Id | null;
  public direction: PinDirection;
  public length: number;
  public visible: boolean;
  public electricalType: 'digital' | 'analog' | 'power' | 'ground';
  public description?: string;
  public isClock: boolean;
  public isReset: boolean;

  constructor(props: PinProps) {
    this.id = props.id;
    this.number = props.number;
    this.name = props.name;
    this.type = props.type;
    this.position = { ...props.position };
    this.connectedNetId = props.connectedNetId;
    this.direction = props.direction ?? PinDirection.West;
    this.length = props.length ?? 10;
    this.visible = props.visible ?? true;
    this.electricalType = props.electricalType ?? 'digital';
    this.description = props.description;
    this.isClock = props.isClock ?? false;
    this.isReset = props.isReset ?? false;
  }

  /**
   * 克隆引脚
   */
  clone(): Pin {
    return new Pin({
      id: this.id,
      number: this.number,
      name: this.name,
      type: this.type,
      position: { ...this.position },
      connectedNetId: this.connectedNetId,
      direction: this.direction,
      length: this.length,
      visible: this.visible,
      electricalType: this.electricalType,
      description: this.description,
      isClock: this.isClock,
      isReset: this.isReset
    });
  }

  /**
   * 计算相对于设备原点的位置
   */
  getRelativePosition(devicePosition: Point): Point {
    return {
      x: this.position.x + devicePosition.x,
      y: this.position.y + devicePosition.y
    };
  }

  /**
   * 获取引脚端点位置（考虑引脚长度）
   */
  getEndPoint(devicePosition: Point): Point {
    const relativePos = this.getRelativePosition(devicePosition);
    const offset = this.length;
    
    switch (this.direction) {
      case PinDirection.North:
        return { x: relativePos.x, y: relativePos.y - offset };
      case PinDirection.South:
        return { x: relativePos.x, y: relativePos.y + offset };
      case PinDirection.East:
        return { x: relativePos.x + offset, y: relativePos.y };
      case PinDirection.West:
        return { x: relativePos.x - offset, y: relativePos.y };
      default:
        return relativePos;
    }
  }

  /**
   * 连接引脚到网络
   */
  connect(netId: Id): void {
    this.connectedNetId = netId;
  }

  /**
   * 断开引脚连接
   */
  disconnect(): void {
    this.connectedNetId = null;
  }

  /**
   * 检查引脚是否已连接
   */
  isConnected(): boolean {
    return this.connectedNetId !== null;
  }
}
