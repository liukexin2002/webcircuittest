export type Point = { x: number; y: number };
export type Id = string;

export const DeviceType = {
  RESISTOR: 'resistor',
  INDUCTOR: 'inductor',
  CAPACITOR: 'capacitor'
} as const;

export type DeviceTypeValue = (typeof DeviceType)[keyof typeof DeviceType];

export const PinType = {
  PASSIVE: 'passive'
} as const;

export type PinTypeValue = (typeof PinType)[keyof typeof PinType];

export interface Pin {
  id: Id;
  deviceId: Id;
  name: string;
  type: PinTypeValue;
  position: Point;
  offset: Point;
}

export interface Device {
  id: Id;
  type: DeviceTypeValue;
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
  type: DeviceTypeValue;
  labelPrefix: string;
  size: { width: number; height: number };
  svgPath: string;
  pins: Array<{
    name: string;
    position: Point;
    type: PinTypeValue;
  }>;
  defaultProperties: Record<string, string | number>;
}
