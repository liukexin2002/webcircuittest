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
    width: 75,
    height: 50,
    svg: `
      <svg viewBox="0 0 75 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="0" y1="25" x2="12" y2="25" stroke="currentColor" stroke-width="2"/>
        <path d="M12,25 L18,10 L27,40 L36,10 L45,40 L54,10 L63,25" 
              stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="63" y1="25" x2="75" y2="25" stroke="currentColor" stroke-width="2"/>
      </svg>
    `
  },
  {
    id: 'capacitor',
    name: 'Capacitor',
    nameCn: '电容',
    prefix: 'C',
    width: 75,
    height: 50,
    svg: `
      <svg viewBox="0 0 75 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="0" y1="25" x2="31" y2="25" stroke="currentColor" stroke-width="2"/>
        <line x1="31" y1="7" x2="31" y2="43" stroke="currentColor" stroke-width="3"/>
        <line x1="44" y1="7" x2="44" y2="43" stroke="currentColor" stroke-width="3"/>
        <line x1="44" y1="25" x2="75" y2="25" stroke="currentColor" stroke-width="2"/>
      </svg>
    `
  },
  {
    id: 'inductor',
    name: 'Inductor',
    nameCn: '电感',
    prefix: 'L',
    width: 75,
    height: 50,
    svg: `
      <svg viewBox="0 0 75 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="0" y1="25" x2="12" y2="25" stroke="currentColor" stroke-width="2"/>
        <path d="M12,25 Q18,10 25,25 Q31,40 37,25 Q43,10 50,25 Q56,40 63,25" 
              stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
        <line x1="63" y1="25" x2="75" y2="25" stroke="currentColor" stroke-width="2"/>
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
