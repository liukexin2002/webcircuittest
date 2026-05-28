/**
 * 几何计算工具
 * 提供向量运算、包围盒计算等几何基础功能
 */

import type { Point, BoundingBox } from '../../domain';

export class GeometryUtils {
  /**
   * 计算两点之间的距离
   */
  static distance(p1: Point, p2: Point): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * 向量加法
   */
  static add(p1: Point, p2: Point): Point {
    return { x: p1.x + p2.x, y: p1.y + p2.y };
  }

  /**
   * 向量减法
   */
  static subtract(p1: Point, p2: Point): Point {
    return { x: p1.x - p2.x, y: p1.y - p2.y };
  }

  /**
   * 向量缩放
   */
  static scale(p: Point, scalar: number): Point {
    return { x: p.x * scalar, y: p.y * scalar };
  }

  /**
   * 判断点是否在包围盒内
   */
  static pointInBounds(point: Point, bounds: BoundingBox): boolean {
    return (
      point.x >= bounds.x &&
      point.x <= bounds.x + bounds.width &&
      point.y >= bounds.y &&
      point.y <= bounds.y + bounds.height
    );
  }

  /**
   * 判断点是否在矩形内
   */
  static pointInRect(point: Point, rect: BoundingBox): boolean {
    return this.pointInBounds(point, rect);
  }

  /**
   * 判断点是否在线段附近
   */
  static isPointNearLine(
    point: Point,
    lineStart: Point,
    lineEnd: Point,
    threshold: number = 5
  ): boolean {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) {
      param = dot / lenSq;
    }

    let xx: number;
    let yy: number;

    if (param < 0) {
      xx = lineStart.x;
      yy = lineStart.y;
    } else if (param > 1) {
      xx = lineEnd.x;
      yy = lineEnd.y;
    } else {
      xx = lineStart.x + param * C;
      yy = lineStart.y + param * D;
    }

    const dx = point.x - xx;
    const dy = point.y - yy;

    return Math.sqrt(dx * dx + dy * dy) <= threshold;
  }

  /**
   * 计算设备的包围盒（简单实现）
   */
  static calculateDeviceBounds(
    position: Point,
    size: { width: number; height: number } = { width: 60, height: 40 }
  ): BoundingBox {
    return {
      x: position.x - size.width / 2,
      y: position.y - size.height / 2,
      width: size.width,
      height: size.height
    };
  }
}
