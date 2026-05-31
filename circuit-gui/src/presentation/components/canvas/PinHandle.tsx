import React, { useState, useCallback } from 'react';
import { useCircuitStore } from '../../../data/stores/circuitStore';
import type { Pin } from '../../../domain/types';

interface PinHandleProps {
  pin: Pin;
  deviceId: string;
}

export const PinHandle: React.FC<PinHandleProps> = ({ pin, deviceId }) => {
  const [isHovered, setIsHovered] = useState(false);
  const activeTool = useCircuitStore((s) => s.activeTool);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (activeTool !== 'wire') return;

      e.stopPropagation();
      e.preventDefault();
    },
    [pin.id, deviceId, activeTool]
  );

  const radius = isHovered ? 8 : 5;

  return (
    <circle
      cx={pin.position.x}
      cy={pin.position.y}
      r={radius}
      fill={isHovered ? '#00d4ff' : '#4a90d9'}
      stroke="#ffffff"
      strokeWidth={isHovered ? 2 : 1}
      className="transition-all duration-150 ease-out"
      style={{
        cursor: activeTool === 'wire' ? 'crosshair' : 'default',
        filter: isHovered ? 'url(#pin-glow)' : 'none',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      data-pin-id={pin.id}
      data-device-id={deviceId}
    />
  );
};
