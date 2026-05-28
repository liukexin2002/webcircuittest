/**
 * 工具管理器
 * 管理编辑器的各种工具状态
 */

import type { Tool, ToolType } from '../types/index';

export class ToolManager {
  private tools: Map<ToolType, Tool> = new Map();
  private activeTool: Tool | null = null;
  private listeners: Set<(tool: Tool | null) => void> = new Set();

  /**
   * 注册工具
   */
  registerTool(tool: Tool): void {
    this.tools.set(tool.type, tool);
  }

  /**
   * 激活工具
   */
  activateTool(type: ToolType): void {
    if (this.activeTool) {
      this.activeTool.deactivate();
    }

    const tool = this.tools.get(type);
    if (tool) {
      tool.activate();
      this.activeTool = tool;
      this.notifyListeners();
    }
  }

  /**
   * 获取当前激活的工具
   */
  getActiveTool(): Tool | null {
    return this.activeTool;
  }

  /**
   * 获取所有工具
   */
  getAllTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  /**
   * 获取工具
   */
  getTool(type: ToolType): Tool | undefined {
    return this.tools.get(type);
  }

  /**
   * 订阅工具变化
   */
  subscribe(callback: (tool: Tool | null) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * 通知监听器
   */
  private notifyListeners(): void {
    this.listeners.forEach(callback => callback(this.activeTool));
  }
}
