import React, { useMemo } from 'react';
import type { Connection, Point } from '../../../domain/types';

interface ConnectionWireProps {
  connection: Connection;
}

const generatePathData = (waypoints: Point[]): string => {
  if (!waypoints || waypoints.length === 0) return '';

  let d = `M ${waypoints[0].x},${waypoints[0].y}`;

  for (let i = 1; i < waypoints.length; i++) {
    d += ` L ${waypoints[i].x},${waypoints[i].y}`;
  }

  return d;
};

export const ConnectionWire: React.FC<ConnectionWireProps> = ({ connection }) => {
  const pathData = useMemo(() => {
    if (connection.pathData) return connection.pathData;
    return generatePathData(connection.waypoints);
  }, [connection.waypoints, connection.pathData]);

  if (!pathData) return null;

  return (
    <g className={`connection ${connection.selected ? 'selected' : ''}`}>
      <path
        d={pathData}
        fill="none"
        stroke={connection.selected ? '#ff9500' : '#4a90d9'}
        strokeWidth={connection.selected ? 3 : 2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="pointer-events-stroke"
        style={{ cursor: 'pointer' }}
      />

      {connection.selected &&
        connection.waypoints?.slice(1, -1).map((point, idx) => (
          <circle
            key={idx}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="#ff9500"
            stroke="#ffffff"
            strokeWidth="1"
            className="cursor-move"
          />
        ))}
    </g>
  );
};
