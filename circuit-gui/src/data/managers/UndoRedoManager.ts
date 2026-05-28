/**
 * 撤销重做管理器
 * 使用命令模式管理操作历史
 */

import type { Command } from './Command';

export interface UndoRedoManagerConfig {
  maxHistorySize?: number;
}

export class UndoRedoManager {
  private history: Command[];
  private currentIndex: number;
  private maxHistorySize: number;
  private listeners: Set<() => void> = new Set();

  constructor(config: UndoRedoManagerConfig = {}) {
    this.history = [];
    this.currentIndex = -1;
    this.maxHistorySize = config.maxHistorySize || 100;
  }

  /**
   * 执行命令并记录历史
   */
  executeCommand(command: Command): void {
    command.execute();

    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    this.history.push(command);
    this.currentIndex++;

    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.currentIndex--;
    }

    this.notifyListeners();
  }

  /**
   * 撤销操作
   */
  undo(): void {
    if (this.canUndo()) {
      const command = this.history[this.currentIndex];
      command.undo();
      this.currentIndex--;
      this.notifyListeners();
    }
  }

  /**
   * 重做操作
   */
  redo(): void {
    if (this.canRedo()) {
      this.currentIndex++;
      const command = this.history[this.currentIndex];
      command.execute();
      this.notifyListeners();
    }
  }

  /**
   * 检查是否可以撤销
   */
  canUndo(): boolean {
    return this.currentIndex >= 0;
  }

  /**
   * 检查是否可以重做
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * 获取当前撤销描述
   */
  getUndoDescription(): string | null {
    return this.canUndo()
      ? this.history[this.currentIndex].getDescription()
      : null;
  }

  /**
   * 获取当前重做描述
   */
  getRedoDescription(): string | null {
    return this.canRedo()
      ? this.history[this.currentIndex + 1].getDescription()
      : null;
  }

  /**
   * 清除历史记录
   */
  clearHistory(): void {
    this.history = [];
    this.currentIndex = -1;
    this.notifyListeners();
  }

  /**
   * 订阅状态变化
   */
  subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * 通知监听器
   */
  private notifyListeners(): void {
    this.listeners.forEach(callback => callback());
  }
}
