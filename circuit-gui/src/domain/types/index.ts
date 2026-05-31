export type Point = { x: number; y: number };
export type Id = string;

export enum DeviceType {
  RESISTOR = 'resistor',
  INDUCTOR = 'inductor',
  CAPACITOR = 'capacitor'
}

export enum PinType {
  PASSIVE = 'passive'
}

export interface Pin {
  id: Id;
  deviceId: Id;
  name: string;
  type: PinType;
  position: Point;
  offset: Point;
}

export interface Device {
  id: Id;
  type: DeviceType;
  label: string;
  position: Point;
  rotation: number;
  size: { width: number; height: number };
  pins: Pin[];
  selected: boolean;
  properties?: Record<string, string | number>;
}

export interface Connection {
  id: Id;
  sourcePinId: Id;
  sourceDeviceId: Id;
  targetPinId: Id;
  targetDeviceId: Id;
  waypoints: Point[];
  pathData: string;
  selected: boolean;
}

export interface PinRef {
  deviceId: Id;
  pinId: Id;
}

export interface DeviceTemplate {
  type: DeviceType;
  labelPrefix: string;
  size: { width: number; height: number };
  svgPath: string;
  pins: Array<{
    name: string;
    position: Point;
    type: PinType;
  }>;
  defaultProperties: Record<string, string | number>;
}
