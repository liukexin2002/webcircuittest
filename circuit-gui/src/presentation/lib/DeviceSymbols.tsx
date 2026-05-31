/**
 * 器件符号 SVG 图标定义
 * 专业的电路符号设计
 */

export interface DeviceSymbol {
  id: string;
  name: string;
  nameCn: string;
  prefix: string;
  svg: string;
  width: number;
  height: number;
}

export const DEVICE_SYMBOLS: DeviceSymbol[] = [
  {
    id: 'resistor',
    name: 'Resistor',
    nameCn: '电阻',
    prefix: 'R',
    width: 90,
    height: 60,
    svg: `
      <svg viewBox="0 0 90 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="0" y1="30" x2="15" y2="30" stroke="currentColor" stroke-width="2"/>
        <path d="M15,30 L22,12 L33,48 L44,12 L55,48 L66,12 L77,30" 
              stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="77" y1="30" x2="90" y2="30" stroke="currentColor" stroke-width="2"/>
      </svg>
    `
  },
  {
    id: 'capacitor',
    name: 'Capacitor',
    nameCn: '电容',
    prefix: 'C',
    width: 90,
    height: 60,
    svg: `
      <svg viewBox="0 0 90 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="0" y1="30" x2="37" y2="30" stroke="currentColor" stroke-width="2"/>
        <line x1="37" y1="9" x2="37" y2="51" stroke="currentColor" stroke-width="3"/>
        <line x1="53" y1="9" x2="53" y2="51" stroke="currentColor" stroke-width="3"/>
        <line x1="53" y1="30" x2="90" y2="30" stroke="currentColor" stroke-width="2"/>
      </svg>
    `
  },
  {
    id: 'inductor',
    name: 'Inductor',
    nameCn: '电感',
    prefix: 'L',
    width: 90,
    height: 60,
    svg: `
      <svg viewBox="0 0 90 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="0" y1="30" x2="15" y2="30" stroke="currentColor" stroke-width="2"/>
        <path d="M15,30 Q22,12 30,30 Q37,48 45,30 Q52,12 60,30 Q67,48 75,30" 
              stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
        <line x1="75" y1="30" x2="90" y2="30" stroke="currentColor" stroke-width="2"/>
      </svg>
    `
  }
];

export const getDeviceSymbol = (id: string): DeviceSymbol | undefined => {
  return DEVICE_SYMBOLS.find(s => s.id === id);
};

export const getAllDeviceSymbols = (): DeviceSymbol[] => {
  return DEVICE_SYMBOLS;
};
