/**
 * 连线工具状态机
 * 管理用户连线交互的状态和流程
 */

import type { Id, Point } from '../../../domain';

export enum WiringState {
  Idle = 'idle',
  DraggingFromPin = 'dragging_from_pin',
  ConnectingToPin = 'connecting_to_pin'
}

export interface WiringContext {
  deviceId: Id;
  pinId: Id;
  position: Point;
}

export class WiringTool {
  private state: WiringState = WiringState.Idle;
  private source: WiringContext | null = null;
  private tempPosition: Point | null = null;
  private tempWaypoints: Point[] = [];

  /**
   * 开始连线
   */
  startWiring(context: WiringContext): void {
    if (this.state !== WiringState.Idle) {
      this.cancelWiring();
    }
    
    this.state = WiringState.DraggingFromPin;
    this.source = context;
    this.tempPosition = { ...context.position };
    this.tempWaypoints = [{ ...context.position }];
  }

  /**
   * 更新临时连线位置
   */
  updateTempPosition(position: Point): void {
    if (this.state !== WiringState.DraggingFromPin && 
        this.state !== WiringState.ConnectingToPin) {
      return;
    }

    this.tempPosition = position;
    
    if (this.source) {
      const midX = (this.source.position.x + position.x) / 2;
      this.tempWaypoints = [
        { ...this.source.position },
        { x: midX, y: this.source.position.y },
        { x: midX, y: position.y },
        { ...position }
      ];
    }
  }

  /**
   * 添加临时拐点
   */
  addWaypoint(position: Point): void {
    if (this.state !== WiringState.DraggingFromPin && 
        this.state !== WiringState.ConnectingToPin) {
      return;
    }

    this.tempWaypoints.push({ ...position });
    this.tempPosition = position;
  }

  /**
   * 完成连线
   */
  finishWiring(targetContext: WiringContext): {
    source: WiringContext;
    target: WiringContext;
    tempWaypoints: Point[];
  } | null {
    if (!this.source || this.state === WiringState.Idle) {
      return null;
    }

    const result = {
      source: this.source,
      target: targetContext,
      tempWaypoints: [...this.tempWaypoints]
    };

    this.reset();
    return result;
  }

  /**
   * 取消连线
   */
  cancelWiring(): void {
    this.reset();
  }

  /**
   * 重置状态
   */
  private reset(): void {
    this.state = WiringState.Idle;
    this.source = null;
    this.tempPosition = null;
    this.tempWaypoints = [];
  }

  /**
   * 获取当前状态
   */
  getState(): WiringState {
    return this.state;
  }

  /**
   * 获取源引脚信息
   */
  getSource(): WiringContext | null {
    return this.source;
  }

  /**
   * 获取临时位置
   */
  getTempPosition(): Point | null {
    return this.tempPosition;
  }

  /**
   * 获取临时路径点
   */
  getTempWaypoints(): Point[] {
    return [...this.tempWaypoints];
  }

  /**
   * 是否正在连线
   */
  isActive(): boolean {
    return this.state !== WiringState.Idle;
  }

  /**
   * 是否可以完成连线（已选择源和目标）
   */
  canFinish(): boolean {
    return this.state === WiringState.ConnectingToPin && this.source !== null;
  }

  /**
   * 检查是否正在连线到指定引脚
   */
  isConnectingTo(deviceId: Id, pinId: Id): boolean {
    return this.source !== null && 
           !(this.source.deviceId === deviceId && this.source.pinId === pinId);
  }
}
