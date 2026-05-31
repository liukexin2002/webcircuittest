/**
 * Canvas 组件
 * 支持拖放放置器件和连线的画布
 */

import { useRef, type DragEvent, useEffect } from 'react';
import { useEditorStore } from '../hooks/useEditorStore';
import { PlacedDevice, type PlacedDeviceData } from './PlacedDevice';
import { Connection } from './Connection';
import { TempWiringLine } from './TempWiringLine';
import { getDeviceSymbol } from '../lib/DeviceSymbols';
import { IdGenerator } from '../../infrastructure';
import { RoutingService } from '../../application/services/RoutingService';
import type { Point } from '../../domain';

const routingService = new RoutingService();

export function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const {
    viewport,
    placedDevices,
    selectedDeviceId,
    addPlacedDevice,
    movePlacedDevice,
    selectDevice,
    clearSelection,
    connections,
    selectedConnectionId,
    addConnection,
    selectConnection,
    wiring,
    startWiring,
    updateWiringPosition,
    cancelWiring,
    highlightedPin,
    setHighlightedPin,
    activeTool
  } = useEditorStore();

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
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      
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
    if (wiring.active) {
      cancelWiring();
    } else {
      clearSelection();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (wiring.active) {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      
      const x = (clientX - viewport.offset.x) / viewport.scale;
      const y = (clientY - viewport.offset.y) / viewport.scale;

      updateWiringPosition({ x, y });
    }
  };

  const handlePinMouseDown = (deviceId: string, pinId: string, position: Point) => {
    if (activeTool === 'wire') {
      startWiring(deviceId, pinId, position);
    }
  };

  const handlePinMouseOver = (deviceId: string, pinId: string) => {
    if (wiring.active && wiring.source) {
      const isSamePin = wiring.source.deviceId === deviceId && wiring.source.pinId === pinId;
      if (!isSamePin) {
        setHighlightedPin({ deviceId, pinId });
      }
    }
  };

  const handlePinMouseOut = () => {
    setHighlightedPin(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && wiring.active) {
        cancelWiring();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [wiring.active, cancelWiring]);

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-white relative overflow-hidden"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleCanvasClick}
      onMouseMove={handleMouseMove}
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
        {connections.map((connection) => (
          <Connection
            key={connection.id}
            connection={connection}
            isSelected={selectedConnectionId === connection.id}
            onSelect={selectConnection}
          />
        ))}

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
              onPinMouseDown={handlePinMouseDown}
              onPinMouseOver={handlePinMouseOver}
              onPinMouseOut={handlePinMouseOut}
              highlightedPin={highlightedPin}
              wiringActive={wiring.active}
            />
          );
        })}

        {wiring.active && wiring.source && wiring.tempPosition && (
          <TempWiringLine
            source={wiring.tempWaypoints[0] || { x: 0, y: 0 }}
            target={wiring.tempPosition}
            tempWaypoints={wiring.tempWaypoints}
            isValidTarget={highlightedPin !== null}
          />
        )}
      </svg>
    </div>
  );
}
