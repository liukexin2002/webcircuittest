/**
 * 路由服务
 * 负责处理连线、网络和引脚连接的逻辑
 */

import type { Id, Point } from '../../domain';
import { Connection, ConnectionStyle, Net } from '../../domain';
import type { Waypoint } from '../../domain/entities/Connection';
import { IdGenerator } from '../../infrastructure';
import { getDeviceSymbol } from '../../presentation/lib/DeviceSymbols';

export interface RoutingResult {
  success: boolean;
  waypoints: Point[];
  error?: string;
}

export class RoutingService {
  /**
   * 连接两个引脚
   */
  connectPins(
    source: { deviceId: Id; pinId: Id },
    target: { deviceId: Id; pinId: Id },
    sourcePosition: Point,
    targetPosition: Point,
    netId?: Id
  ): { connection: Connection; netId: Id } {
    const connectionId = IdGenerator.generateConnectionId();
    const finalNetId = netId ?? IdGenerator.generateNetId();

    const waypoints = this.calculateOrthogonalPath(sourcePosition, targetPosition);

    const connection = new Connection({
      id: connectionId,
      sourceDeviceId: source.deviceId,
      sourcePinId: source.pinId,
      targetDeviceId: target.deviceId,
      targetPinId: target.pinId,
      waypoints: waypoints.map(pos => ({
        position: pos,
        mode: 'straight' as const
      })),
      netId: finalNetId,
      width: 1,
      style: ConnectionStyle.Solid
    });

    return { connection, netId: finalNetId };
  }

  /**
   * 计算两个点之间的正交路径
   */
  calculateOrthogonalPath(start: Point, end: Point): Point[] {
    const midX = (start.x + end.x) / 2;

    return [
      { ...start },
      { x: midX, y: start.y },
      { x: midX, y: end.y },
      { ...end }
    ];
  }

  /**
   * 为单个连接重新路由
   */
  rerouteConnection(
    connection: Connection,
    sourcePosition: Point,
    targetPosition: Point
  ): Waypoint[] {
    const waypoints = this.calculateOrthogonalPath(sourcePosition, targetPosition);
    return waypoints.map(pos => ({
      position: pos,
      mode: 'straight' as const
    }));
  }

  /**
   * 验证连接是否有效
   */
  validateConnection(
    sourceDeviceId: Id,
    sourcePinId: Id,
    targetDeviceId: Id,
    targetPinId: Id
  ): { valid: boolean; error?: string } {
    if (sourceDeviceId === targetDeviceId) {
      return { valid: false, error: '不能连接同一器件的两个引脚' };
    }

    if (sourcePinId === targetPinId) {
      return { valid: false, error: '不能连接同一引脚' };
    }

    return { valid: true };
  }

  /**
   * 创建新网络
   */
  createNet(name?: string): Net {
    const netId = IdGenerator.generateNetId();
    const netName = name ?? `N${netId.slice(-4)}`;

    return new Net({
      id: netId,
      name: netName,
      color: null,
      pinIds: []
    });
  }
}
