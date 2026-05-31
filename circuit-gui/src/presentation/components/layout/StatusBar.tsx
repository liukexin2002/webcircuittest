import React from 'react';
import { useCircuitStore } from '../../../data/stores/circuitStore';

export const StatusBar: React.FC = () => {
  const activeTool = useCircuitStore((s) => s.activeTool);
  const viewport = useCircuitStore((s) => s.viewport);
  const deviceCount = useCircuitStore((s) => Object.keys(s.devices).length);
  const connectionCount = useCircuitStore((s) => Object.keys(s.connections).length);

  const toolNames = {
    select: '选择',
    place: '放置',
    wire: '连线'
  };

  return (
    <div className="h-7 bg-gray-900 border-t border-gray-700 flex items-center px-4 text-xs text-gray-500 gap-4">
      <span>工具: {toolNames[activeTool]}</span>
      <span>缩放: {Math.round(viewport.zoom * 100)}%</span>
      <span>器件: {deviceCount}</span>
      <span>连线: {connectionCount}</span>
    </div>
  );
};
