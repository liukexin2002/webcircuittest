/**
 * Connection 实体 - 连线实体
 * 代表视觉层面的连接线
 */

import type { Id, Point } from '../types';

export interface Waypoint {
  position: Point;
  mode: 'straight' | 'curve' | 'break';
}

export interface ConnectionProps {
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

export class Connection {
  public id: Id;
  public sourceDeviceId: Id;
  public sourcePinId: Id;
  public targetDeviceId: Id;
  public targetPinId: Id;
  public waypoints: Waypoint[];
  public netId: Id;
  public width: number;
  public style: 'solid' | 'dashed' | 'dotted';

  constructor(props: ConnectionProps) {
    this.id = props.id;
    this.sourceDeviceId = props.sourceDeviceId;
    this.sourcePinId = props.sourcePinId;
    this.targetDeviceId = props.targetDeviceId;
    this.targetPinId = props.targetPinId;
    this.waypoints = props.waypoints.map(wp => ({
      ...wp,
      position: { ...wp.position }
    }));
    this.netId = props.netId;
    this.width = props.width;
    this.style = props.style;
  }

  /**
   * 克隆连线
   */
  clone(): Connection {
    return new Connection({
      id: this.id,
      sourceDeviceId: this.sourceDeviceId,
      sourcePinId: this.sourcePinId,
      targetDeviceId: this.targetDeviceId,
      targetPinId: this.targetPinId,
      waypoints: this.waypoints.map(wp => ({
        ...wp,
        position: { ...wp.position }
      })),
      netId: this.netId,
      width: this.width,
      style: this.style
    });
  }
}
