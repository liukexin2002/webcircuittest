import type { DeviceType, DeviceTemplate } from '../types';

export const DEVICE_TEMPLATES: Record<DeviceType, DeviceTemplate> = {
  [DeviceType.RESISTOR]: {
    type: DeviceType.RESISTOR,
    labelPrefix: 'R',
    size: { width: 80, height: 40 },
    svgPath: 'M10,20 L25,20 L30,10 L40,30 L50,10 L60,30 L65,20 L80,20',
    pins: [
      { name: '1', position: { x: 0, y: 20 }, type: 'passive' as const },
      { name: '2', position: { x: 80, y: 20 }, type: 'passive' as const }
    ],
    defaultProperties: { resistance: '1kΩ' }
  },

  [DeviceType.INDUCTOR]: {
    type: DeviceType.INDUCTOR,
    labelPrefix: 'L',
    size: { width: 80, height: 40 },
    svgPath: 'M10,20 Q15,10 20,20 T30,20 T40,20 T50,20 T60,20 L80,20',
    pins: [
      { name: '1', position: { x: 0, y: 20 }, type: 'passive' as const },
      { name: '2', position: { x: 80, y: 20 }, type: 'passive' as const }
    ],
    defaultProperties: { inductance: '1mH' }
  },

  [DeviceType.CAPACITOR]: {
    type: DeviceType.CAPACITOR,
    labelPrefix: 'C',
    size: { width: 60, height: 50 },
    svgPath: 'M10,25 L35,25 M35,10 L35,40 M45,10 L45,40 M45,25 L70,25',
    pins: [
      { name: '1', position: { x: 0, y: 25 }, type: 'passive' as const },
      { name: '2', position: { x: 60, y: 25 }, type: 'passive' as const }
    ],
    defaultProperties: { capacitance: '100nF' }
  }
};
