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
    <div className="w-60 bg-white border-r border-gray-300 p-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">器件栏</h2>
      <div className="space-y-1">
        {DEVICE_SYMBOLS.map((device) => (
          <div
            key={device.id}
            draggable
            onDragStart={(e) => handleDragStart(e, device)}
            className="bg-white border border-transparent rounded p-2 cursor-grab hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center gap-3"
          >
            <svg
              viewBox={`0 0 ${device.width} ${device.height}`}
              className="w-12 h-8 flex items-center justify-center"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              dangerouslySetInnerHTML={{ __html: device.svg }}
            />
            <div className="flex-1">
              <div className="font-medium text-gray-800 text-sm">{device.nameCn}</div>
              <div className="text-xs text-gray-500">{device.prefix}</div>
            </div>
          </div>
          ))}
      </div>
    </div>
  );
}