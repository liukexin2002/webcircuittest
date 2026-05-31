/**
 * Canvas 组件
 * 支持拖放放置器件的画布
 */

import { useRef, type DragEvent } from 'react';
import { useEditorStore } from '../hooks/useEditorStore';
import { PlacedDevice, type PlacedDeviceData } from './PlacedDevice';
import { getDeviceSymbol } from '../lib/DeviceSymbols';
import { IdGenerator } from '../../infrastructure';

export function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { viewport, placedDevices, selectedDeviceId, addPlacedDevice, movePlacedDevice, selectDevice, clearSelection } = useEditorStore();

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    try {
      const data = e.dataTransfer.getData('application/json');
      const deviceSymbol = JSON.parse(data);

      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      // 计算相对于画布容器左上角的位置，这是屏幕坐标
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      
      // 转换为画布坐标系（考虑 viewport 的平移和缩放）
      // 因为外层 SVG 已经应用了 transform: translate(viewport.offset) scale(viewport.scale)
      // 所以我们需要反向计算，把屏幕坐标转换为画布内部坐标
      const x = (clientX - viewport.offset.x) / viewport.scale;
      const y = (clientY - viewport.offset.y) / viewport.scale;

      const symbol = getDeviceSymbol(deviceSymbol.id);
      if (!symbol) return;

      const deviceCount = placedDevices.filter(d => d.deviceType === deviceSymbol.id).length + 1;
      const label = `${symbol.prefix}${deviceCount}`;

      const newDevice: PlacedDeviceData = {
        id: IdGenerator.generateDeviceId(),
        deviceType: deviceSymbol.id,
        position: { x, y },
        label
      };

      addPlacedDevice(newDevice);
      selectDevice(newDevice.id);
    } catch (error) {
      console.error('Failed to drop device:', error);
    }
  };

  const handleCanvasClick = () => {
    clearSelection();
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-white relative overflow-hidden"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleCanvasClick}
      style={{
        backgroundImage: `
          linear-gradient(to right, #e8e8e8 1px, transparent 1px),
          linear-gradient(to bottom, #e8e8e8 1px, transparent 1px)
        `,
        backgroundSize: '10px 10px',
        backgroundPosition: `${viewport.offset.x}px ${viewport.offset.y}px`
      }}
    >
      <svg
        className="w-full h-full"
        style={{
          transform: `translate(${viewport.offset.x}px, ${viewport.offset.y}px) scale(${viewport.scale})`
        }}
      >
        {/* 移除硬编码的 translate(400, 300)，让器件直接放置在鼠标松开的位置 */}
        {placedDevices.map((device) => {
          const symbol = getDeviceSymbol(device.deviceType);
          if (!symbol) return null;

          return (
            <PlacedDevice
              key={device.id}
              device={device}
              symbol={symbol}
              isSelected={selectedDeviceId === device.id}
              onSelect={selectDevice}
              onMove={movePlacedDevice}
            />
          );
        })}
      </svg>
    </div>
  );
}