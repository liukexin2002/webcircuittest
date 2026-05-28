/**
 * 工具类型定义
 */

import type { Id, Point } from '../../domain';

export enum ToolType {
  SELECT = 'select',
  PAN = 'pan',
  ZOOM = 'zoom',
  PLACE_DEVICE = 'place_device',
  WIRE = 'wire',
  TEXT = 'text'
}

export interface ToolContext {
  canvas: {
    scale: number;
    offset: Point;
  };
  getPointAtPosition: (screenX: number, screenY: number) => Point;
  hitTest: (position: Point) => Id | null;
}

export interface Tool {
  type: ToolType;
  name: string;
  cursor: string;
  activate: () => void;
  deactivate: () => void;
  onPointerDown: (e: PointerEvent, context: ToolContext) => void;
  onPointerMove: (e: PointerEvent, context: ToolContext) => void;
  onPointerUp: (e: PointerEvent, context: ToolContext) => void;
  onKeyDown?: (e: KeyboardEvent) => void;
  onKeyUp?: (e: KeyboardEvent) => void;
}
