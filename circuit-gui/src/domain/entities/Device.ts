/**
 * Device 实体 - 设备实体
 * 代表电路原理图中的元件
 */

import type { Id, Point, DeviceRotation } from '../types';
import { Pin } from './Pin';

export interface DeviceProperties {
  [key: string]: string | number | boolean;
}

export interface DeviceProps {
  id: Id;
  type: string;
  symbolId: string;
  label: string;
  position: Point;
  rotation: DeviceRotation;
  pins: Pin[];
  properties: DeviceProperties;
  locked: boolean;
}

export class Device {
  public id: Id;
  public type: string;
  public symbolId: string;
  public label: string;
  public position: Point;
  public rotation: DeviceRotation;
  public pins: Pin[];
  public properties: DeviceProperties;
  public locked: boolean;

  constructor(props: DeviceProps) {
    this.id = props.id;
    this.type = props.type;
    this.symbolId = props.symbolId;
    this.label = props.label;
    this.position = { ...props.position };
    this.rotation = props.rotation;
    this.pins = props.pins.map(pin => pin.clone());
    this.properties = { ...props.properties };
    this.locked = props.locked;
  }

  /**
   * 克隆设备
   */
  clone(): Device {
    return new Device({
      id: this.id,
      type: this.type,
      symbolId: this.symbolId,
      label: this.label,
      position: { ...this.position },
      rotation: this.rotation,
      pins: this.pins.map(pin => pin.clone()),
      properties: { ...this.properties },
      locked: this.locked
    });
  }

  /**
   * 移动设备
   */
  move(newPosition: Point): void {
    this.position = { ...newPosition };
  }

  /**
   * 旋转设备
   */
  rotate(rotation: DeviceRotation): void {
    this.rotation = rotation;
  }

  /**
   * 根据ID获取引脚
   */
  getPinById(pinId: Id): Pin | undefined {
    return this.pins.find(pin => pin.id === pinId);
  }
}
