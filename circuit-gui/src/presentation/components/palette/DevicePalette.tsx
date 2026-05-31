import React from 'react';
import { useCircuitStore } from '../../../data/stores/circuitStore';
import { PaletteItem } from './PaletteItem';
import { DeviceType, type DeviceTypeValue } from '../../../domain/types';

const PALETTE_ITEMS: { type: DeviceTypeValue; label: string; icon: string }[] = [
  { type: DeviceType.RESISTOR, label: '电阻', icon: 'R' },
  { type: DeviceType.INDUCTOR, label: '电感', icon: 'L' },
  { type: DeviceType.CAPACITOR, label: '电容', icon: 'C' },
];

export const DevicePalette: React.FC = () => {
  const setActiveTool = useCircuitStore((s) => s.setActiveTool);

  const handleDragStart = (e: React.DragEvent, deviceType: DeviceTypeValue) => {
    e.dataTransfer.setData('application/x-device-type', String(deviceType));
    e.dataTransfer.effectAllowed = 'copy';
    setActiveTool('place');
  };

  return (
    <div className="w-52 bg-gray-900 border-r border-gray-800 flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-800">
        <h3 className="text-sm font-semibold text-gray-200">器件库</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {PALETTE_ITEMS.map((item) => (
          <PaletteItem
            key={item.type}
            type={item.type}
            label={item.label}
            icon={item.icon}
            onDragStart={(e) => handleDragStart(e, item.type)}
          />
        ))}
      </div>

      <div className="px-4 py-2 border-t border-gray-800 text-xs text-gray-500">
        拖拽器件到画布
      </div>
    </div>
  );
};
