/**
 * 放置器件组件
 * 在画布上显示已放置的器件
 */

import type { DeviceSymbol } from '../lib/DeviceSymbols';

export interface PlacedDeviceData {
  id: string;
  deviceType: string;
  position: { x: number; y: number };
  label: string;
}

interface PlacedDeviceProps {
  device: PlacedDeviceData;
  symbol: DeviceSymbol;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onMove: (id: string, position: { x: number; y: number }) => void;
}

export function PlacedDevice({
  device,
  symbol,
  isSelected,
  onSelect,
  onMove
}: PlacedDeviceProps) {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(device.id);

    const startX = e.clientX;
    const startY = e.clientY;
    const startPos = { ...device.position };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      onMove(device.id, {
        x: startPos.x + dx,
        y: startPos.y + dy
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <g
      transform={`translate(${device.position.x}, ${device.position.y})`}
      onMouseDown={handleMouseDown}
      className="cursor-move"
      style={{ cursor: 'move' }}
    >
      <rect
        x={-symbol.width / 2 - 6}
        y={-symbol.height / 2 - 6}
        width={symbol.width + 12}
        height={symbol.height + 12}
        fill={isSelected ? "rgba(59, 130, 246, 0.08)" : "transparent"}
        stroke={isSelected ? '#3b82f6' : 'transparent'}
        strokeWidth={1.5}
        rx={4}
        strokeDasharray={isSelected ? "3,2" : "none"}
      />

      <g dangerouslySetInnerHTML={{ __html: symbol.svg }} />

      <text
        y={symbol.height / 2 + 14}
        textAnchor="middle"
        fontSize={11}
        fontFamily="Arial, sans-serif"
        fill="#444444"
        fontWeight="500"
      >
        {device.label}
      </text>
    </g>
  );
}
