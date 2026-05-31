/**
 * 几何计算工具
 * 提供向量运算、包围盒计算等几何基础功能
 */

import type { Point, BoundingBox, Size } from '../../domain';

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
   * 判断点是否在折线附近
   */
  static isPointNearPolyline(
    point: Point,
    polyline: Point[],
    threshold: number = 5
  ): { hit: boolean; segmentIndex?: number; distance?: number } {
    if (polyline.length < 2) {
      return { hit: false };
    }

    let minDistance = Infinity;
    let closestSegment = -1;

    for (let i = 0; i < polyline.length - 1; i++) {
      const start = polyline[i];
      const end = polyline[i + 1];
      const dist = this.pointToLineDistance(point, start, end);

      if (dist < minDistance) {
        minDistance = dist;
        closestSegment = i;
      }
    }

    if (minDistance <= threshold) {
      return {
        hit: true,
        segmentIndex: closestSegment,
        distance: minDistance
      };
    }

    return { hit: false };
  }

  /**
   * 计算点到线段的距离
   */
  static pointToLineDistance(point: Point, lineStart: Point, lineEnd: Point): number {
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

    return this.distance(point, { x: xx, y: yy });
  }

  /**
   * 计算两条线的交点
   */
  static lineIntersection(
    line1Start: Point,
    line1End: Point,
    line2Start: Point,
    line2End: Point
  ): Point | null {
    const x1 = line1Start.x;
    const y1 = line1Start.y;
    const x2 = line1End.x;
    const y2 = line1End.y;
    const x3 = line2Start.x;
    const y3 = line2Start.y;
    const x4 = line2End.x;
    const y4 = line2End.y;

    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

    if (Math.abs(denom) < 1e-10) {
      return null;
    }

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return {
        x: x1 + t * (x2 - x1),
        y: y1 + t * (y2 - y1)
      };
    }

    return null;
  }

  /**
   * 计算设备的包围盒（简单实现）
   */
  static calculateDeviceBounds(
    position: Point,
    size: Size = { width: 60, height: 40 }
  ): BoundingBox {
    return {
      x: position.x - size.width / 2,
      y: position.y - size.height / 2,
      width: size.width,
      height: size.height
    };
  }

  /**
   * 判断点是否在圆内（用于引脚检测）
   */
  static isPointInCircle(
    point: Point,
    center: Point,
    radius: number
  ): boolean {
    return this.distance(point, center) <= radius;
  }

  /**
   * 生成正交路径点（从一个点到另一个点）
   */
  static generateOrthogonalPath(
    start: Point,
    end: Point,
    preferredFirstDirection: 'horizontal' | 'vertical' = 'horizontal'
  ): Point[] {
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;

    if (preferredFirstDirection === 'horizontal') {
      return [
        start,
        { x: midX, y: start.y },
        { x: midX, y: end.y },
        end
      ];
    } else {
      return [
        start,
        { x: start.x, y: midY },
        { x: end.x, y: midY },
        end
      ];
    }
  }

  /**
   * 计算点到点的角度（弧度）
   */
  static angle(from: Point, to: Point): number {
    return Math.atan2(to.y - from.y, to.x - from.x);
  }

  /**
   * 根据角度和距离计算点
   */
  static pointAtAngle(from: Point, angle: number, distance: number): Point {
    return {
      x: from.x + Math.cos(angle) * distance,
      y: from.y + Math.sin(angle) * distance
    };
  }

  /**
   * 判断点是否在引脚范围内
   */
  static isPointNearPin(
    point: Point,
    pinPosition: Point,
    pinRadius: number = 8
  ): boolean {
    return this.isPointInCircle(point, pinPosition, pinRadius);
  }

  /**
   * 获取包围盒的中心点
   */
  static getBoundsCenter(bounds: BoundingBox): Point {
    return {
      x: bounds.x + bounds.width / 2,
      y: bounds.y + bounds.height / 2
    };
  }

  /**
   * 扩展包围盒
   */
  static expandBounds(bounds: BoundingBox, padding: number): BoundingBox {
    return {
      x: bounds.x - padding,
      y: bounds.y - padding,
      width: bounds.width + padding * 2,
      height: bounds.height + padding * 2
    };
  }

  /**
   * 判断两个包围盒是否相交
   */
  static boundsIntersect(a: BoundingBox, b: BoundingBox): boolean {
    return !(
      a.x + a.width < b.x ||
      b.x + b.width < a.x ||
      a.y + a.height < b.y ||
      b.y + b.height < a.y
    );
  }
}
