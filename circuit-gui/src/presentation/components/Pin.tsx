/**
 * Pin 组件
 * 渲染器件引脚和交互
 */

import type { PinDefinition } from '../lib/DeviceSymbols';
import type { Point } from '../../domain';
import { PinDirection } from '../../domain';

interface PinProps {
  pin: PinDefinition;
  devicePosition: Point;
  isHighlighted: boolean;
  isConnected: boolean;
  onMouseDown: (deviceId: string, pinId: string, position: Point) => void;
  onMouseOver: (deviceId: string, pinId: string) => void;
  onMouseOut: () => void;
}

export function Pin({
  pin,
  devicePosition,
  isHighlighted,
  isConnected,
  onMouseDown,
  onMouseOver,
  onMouseOut
}: PinProps) {
  const absolutePosition: Point = {
    x: devicePosition.x + pin.position.x,
    y: devicePosition.y + pin.position.y
  };

  const pinRadius = 4;
  const pinLength = pin.length ?? 10;

  const getPinColor = () => {
    if (isHighlighted) return '#3b82f6';
    if (isConnected) return '#22c55e';
    return '#6b7280';
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMouseDown('device', pin.id, absolutePosition);
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMouseOver('device', pin.id);
  };

  const handleMouseLeave = () => {
    onMouseOut();
  };

  const getLineEnd = () => {
    switch (pin.direction) {
      case PinDirection.West:
        return { x: absolutePosition.x - pinLength, y: absolutePosition.y };
      case PinDirection.East:
        return { x: absolutePosition.x + pinLength, y: absolutePosition.y };
      case PinDirection.North:
        return { x: absolutePosition.x, y: absolutePosition.y - pinLength };
      case PinDirection.South:
        return { x: absolutePosition.x, y: absolutePosition.y + pinLength };
      default:
        return absolutePosition;
    }
  };

  const lineEnd = getLineEnd();

  return (
    <g
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: 'crosshair' }}
    >
      <circle
        cx={absolutePosition.x}
        cy={absolutePosition.y}
        r={12}
        fill="transparent"
      />
      
      <line
        x1={absolutePosition.x}
        y1={absolutePosition.y}
        x2={lineEnd.x}
        y2={lineEnd.y}
        stroke={getPinColor()}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      
      <circle
        cx={absolutePosition.x}
        cy={absolutePosition.y}
        r={isHighlighted ? pinRadius * 1.3 : pinRadius}
        fill={getPinColor()}
        stroke="white"
        strokeWidth={isHighlighted ? 2 : 1}
        style={{
          transition: 'all 0.15s'
        }}
      />
    </g>
  );
}
