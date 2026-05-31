/**
 * 器件符号 SVG 图标定义
 * 专业的电路符号设计
 */

import { PinType, PinDirection } from '../../domain';

export interface PinDefinition {
  id: string;
  number: string;
  name: string;
  position: { x: number; y: number };
  direction: PinDirection;
  type: PinType;
  length?: number;
}

export interface DeviceSymbol {
  id: string;
  name: string;
  nameCn: string;
  prefix: string;
  svg: string;
  width: number;
  height: number;
  pins: PinDefinition[];
}

export const DEVICE_SYMBOLS: DeviceSymbol[] = [
  {
    id: 'resistor',
    name: 'Resistor',
    nameCn: '电阻',
    prefix: 'R',
    width: 60,
    height: 40,
    pins: [
      {
        id: '1',
        number: '1',
        name: 'T1',
        position: { x: 0, y: 20 },
        direction: PinDirection.West,
        type: PinType.Passive,
        length: 10
      },
      {
        id: '2',
        number: '2',
        name: 'T2',
        position: { x: 60, y: 20 },
        direction: PinDirection.East,
        type: PinType.Passive,
        length: 10
      }
    ],
    svg: `
        <line x1="0" y1="20" x2="10" y2="20" stroke="currentColor" stroke-width="2"/>
        <path d="M10,20 L15,8 L22,32 L29,8 L36,32 L43,8 L50,20" 
              stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="50" y1="20" x2="60" y2="20" stroke="currentColor" stroke-width="2"/>
    `
  },
  {
    id: 'capacitor',
    name: 'Capacitor',
    nameCn: '电容',
    prefix: 'C',
    width: 60,
    height: 40,
    pins: [
      {
        id: '1',
        number: '1',
        name: 'T1',
        position: { x: 0, y: 20 },
        direction: PinDirection.West,
        type: PinType.Passive,
        length: 10
      },
      {
        id: '2',
        number: '2',
        name: 'T2',
        position: { x: 60, y: 20 },
        direction: PinDirection.East,
        type: PinType.Passive,
        length: 10
      }
    ],
    svg: `
        <line x1="0" y1="20" x2="25" y2="20" stroke="currentColor" stroke-width="2"/>
        <line x1="25" y1="6" x2="25" y2="34" stroke="currentColor" stroke-width="3"/>
        <line x1="35" y1="6" x2="35" y2="34" stroke="currentColor" stroke-width="3"/>
        <line x1="35" y1="20" x2="60" y2="20" stroke="currentColor" stroke-width="2"/>
    `
  },
  {
    id: 'inductor',
    name: 'Inductor',
    nameCn: '电感',
    prefix: 'L',
    width: 60,
    height: 40,
    pins: [
      {
        id: '1',
        number: '1',
        name: 'T1',
        position: { x: 0, y: 20 },
        direction: PinDirection.West,
        type: PinType.Passive,
        length: 10
      },
      {
        id: '2',
        number: '2',
        name: 'T2',
        position: { x: 60, y: 20 },
        direction: PinDirection.East,
        type: PinType.Passive,
        length: 10
      }
    ],
    svg: `
        <line x1="0" y1="20" x2="10" y2="20" stroke="currentColor" stroke-width="2"/>
        <path d="M10,20 Q15,8 20,20 Q25,32 30,20 Q35,8 40,20 Q45,32 50,20" 
              stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
        <line x1="50" y1="20" x2="60" y2="20" stroke="currentColor" stroke-width="2"/>
    `
  }
];

export const getDeviceSymbol = (id: string): DeviceSymbol | undefined => {
  return DEVICE_SYMBOLS.find(s => s.id === id);
};

export const getAllDeviceSymbols = (): DeviceSymbol[] => {
  return DEVICE_SYMBOLS;
};

export const getPinDefinition = (
  symbolId: string,
  pinId: string
): PinDefinition | undefined => {
  const symbol = getDeviceSymbol(symbolId);
  return symbol?.pins.find(p => p.id === pinId);
};
