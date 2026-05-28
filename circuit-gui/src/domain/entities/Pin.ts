/**
 * Pin 实体 - 引脚实体
 * 代表设备的电气连接点
 */

import type { Id, Point, PinType } from '../types';

export interface PinProps {
  id: Id;
  number: string;
  name: string;
  type: PinType;
  position: Point;
  connectedNetId: Id | null;
}

export class Pin {
  public id: Id;
  public number: string;
  public name: string;
  public type: PinType;
  public position: Point;
  public connectedNetId: Id | null;

  constructor(props: PinProps) {
    this.id = props.id;
    this.number = props.number;
    this.name = props.name;
    this.type = props.type;
    this.position = { ...props.position };
    this.connectedNetId = props.connectedNetId;
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
      connectedNetId: this.connectedNetId
    });
  }

  /**
   * 计算相对于设备原点的位置
   */
  getRelativePosition(devicePosition(devicePosition: Point): Point {
    return {
      x: this.position.x + devicePosition.x,
      y: this.position.y + devicePosition.y
    };
  }
}
