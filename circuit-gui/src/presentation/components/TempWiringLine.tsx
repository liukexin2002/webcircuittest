/**
 * TempWiringLine 组件
 * 渲染连线过程中的临时线条
 */

import type { Point } from '../../domain';

interface TempWiringLineProps {
  source: Point;
  target: Point;
  tempWaypoints: Point[];
  isValidTarget: boolean;
}

export function TempWiringLine({
  source,
  target,
  tempWaypoints,
  isValidTarget
}: TempWiringLineProps) {
  if (!source || !target) {
    return null;
  }

  const lineColor = isValidTarget ? '#3b82f6' : '#ef4444';
  
  const allPoints = [...tempWaypoints, target];
  const pointsString = allPoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <g style={{ pointerEvents: 'none' }}>
      <polyline
        points={pointsString}
        fill="none"
        stroke={lineColor}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="6,4"
        opacity={0.8}
      />
      
      <circle
        cx={source.x}
        cy={source.y}
        r={5}
        fill="#3b82f6"
        stroke="white"
        strokeWidth={2}
      />
      
      <circle
        cx={target.x}
        cy={target.y}
        r={isValidTarget ? 6 : 4}
        fill={lineColor}
        stroke="white"
        strokeWidth={2}
      />
    </g>
  );
}
