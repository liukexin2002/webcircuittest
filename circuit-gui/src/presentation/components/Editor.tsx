/**
 * 主编辑器组件
 */

import { Canvas } from './Canvas';
import { Toolbar } from './Toolbar';

export function Editor() {
  return (
    <div className="flex flex-col h-screen w-full">
      <Toolbar />
      <div className="flex-1">
        <Canvas />
      </div>
    </div>
  );
}
