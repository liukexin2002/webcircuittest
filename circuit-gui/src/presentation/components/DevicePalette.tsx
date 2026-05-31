/**
 * 器件栏组件
 * 显示可拖放的器件列表
 */

import { DEVICE_SYMBOLS } from '../lib/DeviceSymbols';
import type { DeviceSymbol } from '../lib/DeviceSymbols';

interface DevicePaletteProps {
  onDragStart?: (device: DeviceSymbol) => void;
}

export function DevicePalette({ onDragStart }: DevicePaletteProps) {
  const handleDragStart = (e: React.DragEvent, device: DeviceSymbol) => {
    e.dataTransfer.setData('application/json', JSON.stringify(device));
    e.dataTransfer.effectAllowed = 'copy';
    onDragStart?.(device);
  };

  return (
    <div className="w-60 bg-gray-50 border-r border-gray-300 p-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">器件栏</h2>
      <div className="space-y-3">
        {DEVICE_SYMBOLS.map((device) => (
          <div
            key={device.id}
            draggable
            onDragStart={(e) => handleDragStart(e, device)}
            className="bg-white border-2 border-gray-200 rounded-lg p-3 cursor-grab hover:border-blue-400 hover:bg-blue-50 hover:shadow-md transition-all h-[100px] flex flex-col"
          >
            <div
              className="flex-1 flex items-center justify-center bg-gray-50 rounded"
              dangerouslySetInnerHTML={{ __html: device.svg }}
            />
            <div className="mt-2 text-center">
              <div className="font-medium text-gray-800 text-sm">{device.nameCn}</div>
              <div className="text-xs text-gray-500">{device.prefix}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
