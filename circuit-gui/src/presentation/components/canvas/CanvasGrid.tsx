import React from 'react';

interface CanvasGridProps {
  size: number;
}

export const CanvasGrid: React.FC<CanvasGridProps> = ({ size }) => {
  return (
    <pattern
      id={`grid-${size}`}
      width={size}
      height={size}
      patternUnits="userSpaceOnUse"
    >
      <path
        d={`M ${size} 0 L 0 0 0 ${size}`}
        fill="none"
        stroke="#374151"
        strokeWidth="0.5"
        opacity="0.3"
      />
    </pattern>
  );
};
