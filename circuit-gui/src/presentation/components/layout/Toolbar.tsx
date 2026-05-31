import React from 'react';
import { useCircuitStore } from '../../../data/stores/circuitStore';
import { Button } from '../../../components/ui/button';

export const Toolbar: React.FC = () => {
  const activeTool = useCircuitStore((s) => s.activeTool);
  const setActiveTool = useCircuitStore((s) => s.setActiveTool);
  const zoomIn = useCircuitStore((s) => s.zoomIn);
  const zoomOut = useCircuitStore((s) => s.zoomOut);
  const resetView = useCircuitStore((s) => s.resetView);
  const deleteSelected = useCircuitStore((s) => s.deleteSelected);
  const viewport = useCircuitStore((s) => s.viewport);

  return (
    <div className="h-12 bg-gray-900 border-b border-gray-700 flex items-center px-4 gap-2">
      <div className="flex items-center gap-1">
        <Button
          variant={activeTool === 'select' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTool('select')}
          className="text-xs"
        >
          选择
        </Button>
        <Button
          variant={activeTool === 'place' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTool('place')}
          className="text-xs"
        >
          放置
        </Button>
        <Button
          variant={activeTool === 'wire' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTool('wire')}
          className="text-xs"
        >
          连线
        </Button>
      </div>

      <div className="w-px h-6 bg-gray-700 mx-2" />

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={zoomOut} className="text-xs px-2">
          -
        </Button>
        <span className="text-xs text-gray-400 min-w-[60px] text-center">
          {Math.round(viewport.zoom * 100)}%
        </span>
        <Button variant="ghost" size="sm" onClick={zoomIn} className="text-xs px-2">
          +
        </Button>
        <Button variant="ghost" size="sm" onClick={resetView} className="text-xs ml-1">
          适应窗口
        </Button>
      </div>

      <div className="w-px h-6 bg-gray-700 mx-2" />

      <Button
        variant="ghost"
        size="sm"
        onClick={deleteSelected}
        className="text-xs text-red-400 hover:text-red-300"
      >
        删除 (Del)
      </Button>
    </div>
  );
};
