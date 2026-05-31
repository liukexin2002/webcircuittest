/**
 * Connection 组件
 * 渲染电路连线
 */

import type { Connection as ConnectionEntity } from '../../domain';
import type { Point } from '../../domain';
import type { Id } from '../../domain';

interface ConnectionProps {
  connection: ConnectionEntity;
  isSelected: boolean;
  onSelect: (id: Id) => void;
  onWaypointDrag?: (id: Id, waypointIndex: number, position: Point) => void;
}

export function Connection({
  connection,
  isSelected,
  onSelect,
  onWaypointDrag
}: ConnectionProps) {
  const { waypoints } = connection;
  
  if (waypoints.length < 2) {
    return null;
  }

  const points = waypoints.map(wp => `${wp.position.x},${wp.position.y}`).join(' ');

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(connection.id);
  };

  return (
    <g onClick={handleClick} style={{ cursor: 'pointer' }}>
      <polyline
        points={points}
        fill="none"
        stroke={isSelected ? '#2563eb' : connection.color}
        strokeWidth={connection.width + (isSelected ? 1 : 0)}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: connection.style === 'dashed' ? '8,4' : 
                          connection.style === 'dotted' ? '2,2' : 'none',
          transition: 'stroke 0.15s, stroke-width 0.15s'
        }}
      />
      
      {isSelected && waypoints.map((wp, index) => (
        index > 0 && index < waypoints.length - 1 && (
          <circle
            key={`waypoint-${index}`}
            cx={wp.position.x}
            cy={wp.position.y}
            r={4}
            fill="#2563eb"
            stroke="white"
            strokeWidth={1.5}
            style={{ cursor: 'move' }}
          />
        )
      ))}
    </g>
  );
}
