/**
 * 领域层基础类型定义
 * 定义电路编辑系统的核心数据类型
 */

export type Id = string;

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export enum PinType {
  Input = 'input',
  Output = 'output',
  Bidirectional = 'bidirectional',
  Power = 'power',
  Passive = 'passive'
}

export enum DeviceRotation {
  Deg0 = 0,
  Deg90 = 90,
  Deg180 = 180,
  Deg270 = 270
}

export enum PinDirection {
  North = 'north',
  South = 'south',
  East = 'east',
  West = 'west'
}

export enum ConnectionStyle {
  Solid = 'solid',
  Dashed = 'dashed',
  Dotted = 'dotted'
}
