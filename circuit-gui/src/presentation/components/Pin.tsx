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
  const hoverRadius = 8;

  const getPinColor = () => {
    if (isHighlighted) return '#3b82f6';
    if (isConnected) return '#22c55e';
    return '#6b7280';
  };

  const getPinLine = () => {
    const length = pin.length ?? 10;
    const { x, y } = absolutePosition;
    
    switch (pin.direction) {
      case PinDirection.West:
        return `M${x - length},${y} L${x},${y}`;
      case PinDirection.East:
        return `M${x},${y} L${x + length},${y}`;
      case PinDirection.North:
        return `M${x},${y - length} L${x},${y}`;
      case PinDirection.South:
        return `M${x},${y} L${x},${y + length}`;
      default:
        return '';
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMouseDown('device', pin.id, absolutePosition);
  };

  const handleMouseEnter = () => {
    onMouseOver('device', pin.id);
  };

  const handleMouseLeave = () => {
    onMouseOut();
  };

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
        r={hoverRadius}
        fill="transparent"
      />
      
      <line
        x1={absolutePosition.x}
        y1={absolutePosition.y}
        x2={
          pin.direction === PinDirection.West ? absolutePosition.x - (pin.length ?? 10) :
          pin.direction === PinDirection.East ? absolutePosition.x + (pin.length ?? 10) :
          absolutePosition.x
        }
        y2={
          pin.direction === PinDirection.North ? absolutePosition.y - (pin.length ?? 10) :
          pin.direction === PinDirection.South ? absolutePosition.y + (pin.length ?? 10) :
          absolutePosition.y
        }
        stroke={getPinColor()}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      
      <circle
        cx={absolutePosition.x}
        cy={absolutePosition.y}
        r={pinRadius}
        fill={getPinColor()}
        stroke="white"
        strokeWidth={isHighlighted ? 2 : 1}
        style={{
          transition: 'all 0.15s',
          transform: isHighlighted ? 'scale(1.3)' : 'scale(1)',
          transformOrigin: `${absolutePosition.x}px ${absolutePosition.y}px`
        }}
      />
    </g>
  );
}
