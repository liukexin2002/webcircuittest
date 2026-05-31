/**
 * 主编辑器组件
 * 简洁的左右分栏布局
 */

import { DevicePalette } from './DevicePalette';
import { Canvas } from './Canvas';
import { Toolbar } from './Toolbar';

export function Editor() {
  return (
    <div className="flex h-screen w-full">
      <DevicePalette />
      <Canvas />
      <Toolbar />
    </div>
  );
}
