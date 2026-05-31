import React from 'react';
import type { DeviceType } from '../../domain/types';
import { DEVICE_TEMPLATES } from '../../domain/templates/deviceTemplates';

interface PaletteItemProps {
  type: DeviceType;
  label: string;
  icon: string;
  onDragStart: (e: React.DragEvent) => void;
}

export const PaletteItem: React.FC<PaletteItemProps> = ({
  type,
  label,
  onDragStart,
}) => {
  const template = DEVICE_TEMPLATES[type];

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-blue-500 rounded-lg p-3 cursor-grab transition-all duration-150 select-none"
    >
      <svg
        width={template.size.width * 0.7}
        height={template.size.height * 0.7}
        viewBox={`0 0 ${template.size.width} ${template.size.height}`}
        className="mx-auto mb-2"
      >
        <path
          d={template.svgPath}
          fill="none"
          stroke="#e0e0e0"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          transform={`scale(0.7)`}
        />
      </svg>

      <div className="text-center">
        <div className="text-sm font-medium text-gray-200">{label}</div>
        <div className="text-xs text-gray-500">{icon}</div>
      </div>
    </div>
  );
};
