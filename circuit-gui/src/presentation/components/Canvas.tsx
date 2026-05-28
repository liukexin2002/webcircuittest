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
      const x = (e.clientX - rect.left - viewport.offset.x) / viewport.scale;
      const y = (e.clientY - rect.top - viewport.offset.y) / viewport.scale;

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
          linear-gradient(to right, #f0f0f0 1px, transparent 1px),
          linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px'
      }}
    >
      <svg
        className="w-full h-full"
        style={{
          transform: `translate(${viewport.offset.x}px, ${viewport.offset.y}px) scale(${viewport.scale})`
        }}
      >
        <g transform="translate(400, 300)">
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
        </g>
      </svg>
    </div>
  );
}
