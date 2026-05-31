/**
 * Connection 实体 - 连线实体
 * 代表视觉层面的连接线
 */

import type { Id, Point } from '../types';
import { ConnectionStyle } from '../types';

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
  width?: number;
  style?: ConnectionStyle;
  color?: string;
  isLocked?: boolean;
  isHighlighted?: boolean;
  routeType?: 'auto' | 'manual';
  junctionPoints?: Point[];
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
  public style: ConnectionStyle;
  public color: string;
  public isLocked: boolean;
  public isHighlighted: boolean;
  public routeType: 'auto' | 'manual';
  public junctionPoints: Point[];

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
    this.width = props.width ?? 1;
    this.style = props.style ?? ConnectionStyle.Solid;
    this.color = props.color ?? '#000000';
    this.isLocked = props.isLocked ?? false;
    this.isHighlighted = props.isHighlighted ?? false;
    this.routeType = props.routeType ?? 'auto';
    this.junctionPoints = (props.junctionPoints ?? []).map(p => ({ ...p }));
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
      style: this.style,
      color: this.color,
      isLocked: this.isLocked,
      isHighlighted: this.isHighlighted,
      routeType: this.routeType,
      junctionPoints: this.junctionPoints.map(p => ({ ...p }))
    });
  }

  /**
   * 更新路径点
   */
  updateWaypoints(waypoints: Waypoint[]): void {
    if (this.isLocked) {
      return;
    }
    this.waypoints = waypoints.map(wp => ({
      ...wp,
      position: { ...wp.position }
    }));
    this.routeType = 'manual';
  }

  /**
   * 添加路径点
   */
  addWaypoint(index: number, waypoint: Waypoint): void {
    if (this.isLocked) {
      return;
    }
    this.waypoints.splice(index, 0, {
      ...waypoint,
      position: { ...waypoint.position }
    });
    this.routeType = 'manual';
  }

  /**
   * 移除路径点
   */
  removeWaypoint(index: number): void {
    if (this.isLocked) {
      return;
    }
    this.waypoints.splice(index, 1);
    this.routeType = 'manual';
  }

  /**
   * 获取路径点数量
   */
  getWaypointCount(): number {
    return this.waypoints.length;
  }

  /**
   * 获取所有路径点的坐标数组
   */
  getPoints(): Point[] {
    return this.waypoints.map(wp => ({ ...wp.position }));
  }

  /**
   * 设置高亮状态
   */
  setHighlighted(highlighted: boolean): void {
    this.isHighlighted = highlighted;
  }

  /**
   * 锁定连线
   */
  lock(): void {
    this.isLocked = true;
  }

  /**
   * 解锁连线
   */
  unlock(): void {
    this.isLocked = false;
  }

  /**
   * 设置颜色
   */
  setColor(color: string): void {
    this.color = color;
  }

  /**
   * 检查是否连接到指定引脚
   */
  connectsToPin(deviceId: Id, pinId: Id): boolean {
    return (
      (this.sourceDeviceId === deviceId && this.sourcePinId === pinId) ||
      (this.targetDeviceId === deviceId && this.targetPinId === pinId)
    );
  }
}
