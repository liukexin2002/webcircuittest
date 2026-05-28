/**
 * 工具栏组件
 */

import { useEditor } from '../context/EditorContext';
import { useEditorStore } from '../hooks/useEditorStore';
import { Button } from '../../components/ui/button';
import { Undo, Redo, MousePointer2, Hand, ZoomIn, Grip } from 'lucide-react';

export function Toolbar() {
  const { editorService } = useEditor();
  const { canUndo, canRedo, activeTool, setActiveTool } = useEditorStore();

  const handleAddDemoDevice = () => {
    editorService.addDevice('resistor', 'resistor-symbol', { x: 0, y: 0 }, 'R1');
  };

  return (
    <div className="flex items-center gap-2 p-2 border-b bg-white">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editorService.undo()}
        disabled={!canUndo()}
      >
        <Undo className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editorService.redo()}
        disabled={!canRedo()}
      >
        <Redo className="w-4 h-4" />
      </Button>
      <div className="h-6 w-px bg-gray-300 mx-2" />
      <Button
        variant={activeTool === 'select' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setActiveTool('select')}
      >
        <MousePointer2 className="w-4 h-4" />
      </Button>
      <Button
        variant={activeTool === 'pan' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setActiveTool('pan')}
      >
        <Hand className="w-4 h-4" />
      </Button>
      <Button
        variant={activeTool === 'zoom' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setActiveTool('zoom')}
      >
        <ZoomIn className="w-4 h-4" />
      </Button>
      <div className="h-6 w-px bg-gray-300 mx-2" />
      <Button size="sm" onClick={handleAddDemoDevice}>
        Add Demo Device
      </Button>
    </div>
  );
}
