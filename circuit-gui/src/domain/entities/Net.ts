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
}

export class Net {
  public id: Id;
  public name: string;
  public color: string | null;
  public pinIds: Array<{ deviceId: Id; pinId: Id }>;

  constructor(props: NetProps) {
    this.id = props.id;
    this.name = props.name;
    this.color = props.color;
    this.pinIds = [...props.pinIds];
  }

  /**
   * 克隆网络
   */
  clone(): Net {
    return new Net({
      id: this.id,
      name: this.name,
      color: this.color,
      pinIds: [...this.pinIds]
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
}
