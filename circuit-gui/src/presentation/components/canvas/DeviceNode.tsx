import React, { memo, useCallback } from 'react';
import { useCircuitStore } from '../../../data/stores/circuitStore';
import type { Device } from '../../../domain/types';
import { PinHandle } from './PinHandle';
import { DEVICE_TEMPLATES } from '../../../domain/templates/deviceTemplates';

interface DeviceNodeProps {
  device: Device;
}

export const DeviceNode: React.FC<DeviceNodeProps> = memo(({ device }) => {
  const template = DEVICE_TEMPLATES[device.type];
  const selectDevice = useCircuitStore((s) => s.selectDevice);
  const moveDevice = useCircuitStore((s) => s.moveDevice);
  const activeTool = useCircuitStore((s) => s.activeTool);
  const viewport = useCircuitStore((s) => s.viewport);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      selectDevice(device.id, e.shiftKey);
    },
    [device.id, selectDevice]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (activeTool !== 'select') return;

      e.stopPropagation();
      e.preventDefault();

      const startX = e.clientX;
      const startY = e.clientY;
      const startPos = { ...device.position };

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const dx = (moveEvent.clientX - startX) / viewport.zoom;
        const dy = (moveEvent.clientY - startY) / viewport.zoom;

        moveDevice(device.id, {
          x: startPos.x + dx,
          y: startPos.y + dy,
        });
      };

      const handleMouseUp = () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [device.id, device.position, activeTool, moveDevice, viewport.zoom]
  );

  return (
    <g
      transform={`translate(${device.position.x}, ${device.position.y})`}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      style={{ cursor: activeTool === 'select' ? 'move' : 'default' }}
    >
      {device.selected && (
        <rect
          x="-4"
          y="-4"
          width={device.size.width + 8}
          height={device.size.height + 8}
          fill="none"
          stroke="#00d4ff"
          strokeWidth="2"
          strokeDasharray="6,4"
          opacity="0.8"
          pointerEvents="none"
        />
      )}

      <g className="device-symbol">
        <path
          d={template.svgPath}
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <text
          x={device.size.width / 2}
          y={device.size.height + 16}
          textAnchor="middle"
          fill="#e0e0e0"
          fontSize="12"
          fontFamily="'JetBrains Mono', monospace"
          pointerEvents="none"
        >
          {device.label}
        </text>
      </g>

      {device.pins.map((pin) => (
        <PinHandle key={pin.id} pin={pin} deviceId={device.id} />
      ))}
    </g>
  );
});

DeviceNode.displayName = 'DeviceNode';
