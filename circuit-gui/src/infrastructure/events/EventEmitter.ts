/**
 * 事件系统 - 轻量级发布订阅模式
 * 用于层间通信和组件间联动
 */

import type { DomainEvent } from '../../domain';

type EventCallback = (data: any) => void;

export class EventEmitter {
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private onceListeners: Map<string, Set<EventCallback>> = new Map();

  /**
   * 订阅事件
   */
  on(eventName: string, callback: EventCallback): () => void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName)!.add(callback);
    return () => this.off(eventName, callback);
  }

  /**
   * 订阅一次性事件
   */
  once(eventName: string, callback: EventCallback): () => void {
    if (!this.onceListeners.has(eventName)) {
      this.onceListeners.set(eventName, new Set());
    }
    this.onceListeners.get(eventName)!.add(callback);
    return () => this.off(eventName, callback);
  }

  /**
   * 取消订阅
   */
  off(eventName: string, callback: EventCallback): void {
    this.listeners.get(eventName)?.delete(callback);
    this.onceListeners.get(eventName)?.delete(callback);
  }

  /**
   * 发布事件
   */
  emit(eventName: string, data: any): void {
    this.listeners.get(eventName)?.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${eventName}:`, error);
      }
    });

    this.onceListeners.get(eventName)?.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in once event listener for ${eventName}:`, error);
      }
    });

    this.onceListeners.delete(eventName);
  }

  /**
   * 发布领域事件
   */
  emitDomainEvent(event: DomainEvent): void {
    this.emit(event.type, event);
  }

  /**
   * 清除所有监听器
   */
  clear(): void {
    this.listeners.clear();
    this.onceListeners.clear();
  }
}

export const globalEventEmitter = new EventEmitter();
