/**
 * 选择工具 - 基础工具实现
 */

import type { Tool, ToolContext } from '../types';
import { ToolType } from '../types';

export class SelectTool implements Tool {
  public type = ToolType.SELECT;
  public name = 'Select';
  public cursor = 'default';

  private isDragging = false;
  private startPosition: { x: number; y: number } | null = null;

  activate(): void {
    document.body.style.cursor = this.cursor;
  }

  deactivate(): void {
    this.isDragging = false;
    this.startPosition = null;
  }

  onPointerDown(e: PointerEvent, context: ToolContext): void {
    const worldPos = context.getPointAtPosition(e.clientX, e.clientY);
    this.startPosition = worldPos;
    this.isDragging = true;
  }

  onPointerMove(e: PointerEvent, context: ToolContext): void {
    if (this.isDragging && this.startPosition) {
      const currentPos = context.getPointAtPosition(e.clientX, e.clientY);
    }
  }

  onPointerUp(e: PointerEvent, context: ToolContext): void {
    if (this.isDragging) {
      this.isDragging = false;
      this.startPosition = null;
    }
  }
}
