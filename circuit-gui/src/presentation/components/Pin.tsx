/**
 * Pin 组件
 * 渲染器件引脚和交互
 */

import type { PinDefinition } from '../lib/DeviceSymbols';
import type { Point } from '../../domain';
import { PinDirection } from '../../domain';

interface PinProps {
  pin: PinDefinition;
  symbolWidth: number;
  symbolHeight: number;
  isHighlighted: boolean;
  isConnected: boolean;
  onMouseDown: () => void;
  onMouseOver: () => void;
  onMouseOut: () => void;
}

export function Pin({
  pin,
  symbolWidth,
  symbolHeight,
  isHighlighted,
  isConnected,
  onMouseDown,
  onMouseOver,
  onMouseOut
}: PinProps) {
  const pinRadius = 4;

  const getPinColor = () => {
    if (isHighlighted) return '#3b82f6';
    if (isConnected) return '#22c55e';
    return '#6b7280';
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMouseDown();
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMouseOver();
  };

  const handleMouseLeave = () => {
    onMouseOut();
  };

  const PIN_INDICATOR_LENGTH = 15;

  const getLineEnd = () => {
    switch (pin.direction) {
      case PinDirection.West:
        return { x: pin.position.x - PIN_INDICATOR_LENGTH, y: pin.position.y };
      case PinDirection.East:
        return { x: pin.position.x + PIN_INDICATOR_LENGTH, y: pin.position.y };
      case PinDirection.North:
        return { x: pin.position.x, y: pin.position.y - PIN_INDICATOR_LENGTH };
      case PinDirection.South:
        return { x: pin.position.x, y: pin.position.y + PIN_INDICATOR_LENGTH };
      default:
        return pin.position;
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
        cx={pin.position.x}
        cy={pin.position.y}
        r={12}
        fill="transparent"
      />
      
      <line
        x1={lineEnd.x}
        y1={lineEnd.y}
        x2={pin.position.x}
        y2={pin.position.y}
        stroke={getPinColor()}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      
      <circle
        cx={pin.position.x}
        cy={pin.position.y}
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
