/**
 * 主编辑器组件
 * 简洁的左右分栏布局
 */

import { DevicePalette } from './DevicePalette';
import { Canvas } from './Canvas';

export function Editor() {
  return (
    <div className="flex h-screen w-full">
      <DevicePalette />
      <Canvas />
    </div>
  );
}
