/**
 * Toolbar 组件
 * 编辑器工具栏
 */

import { useEditorStore } from '../hooks/useEditorStore';

export function Toolbar() {
  const { activeTool, setActiveTool } = useEditorStore();

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 rounded-lg shadow-lg p-2 flex gap-2 z-10">
      <button
        onClick={() => setActiveTool('select')}
        className={`px-4 py-2 rounded-md font-medium transition-colors ${
          activeTool === 'select'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        选择
      </button>
      <button
        onClick={() => setActiveTool('wire')}
        className={`px-4 py-2 rounded-md font-medium transition-colors ${
          activeTool === 'wire'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        连线
      </button>
    </div>
  );
}
