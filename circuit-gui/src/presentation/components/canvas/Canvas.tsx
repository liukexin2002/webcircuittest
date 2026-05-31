import React, { useRef, useCallback } from 'react';
import { useCircuitStore } from '../../data/stores/circuitStore';
import { CanvasGrid } from './CanvasGrid';
import { DeviceNode } from './DeviceNode';
import { ConnectionWire } from './ConnectionWire';

export const Canvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isPanningRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  const viewport = useCircuitStore((s) => s.viewport);
  const devices = useCircuitStore((s) => s.devices);
  const connections = useCircuitStore((s) => s.connections);
  const gridSize = useCircuitStore((s) => s.gridSize);
  const showGrid = useCircuitStore((s) => s.showGrid);
  const setViewport = useCircuitStore((s) => s.setViewport);
  const deselectAll = useCircuitStore((s) => s.deselectAll);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setViewport({
        zoom: Math.max(0.1, Math.min(5, viewport.zoom * delta)),
      });
    },
    [viewport.zoom, setViewport]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1 || (e.button === 0 && e.altKey)) {
        e.preventDefault();
        isPanningRef.current = true;
        lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      } else if (e.button === 0) {
        deselectAll();
      }
    },
    [deselectAll]
  );

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanningRef.current) {
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;

      setViewport({
        offset: {
          x: viewport.offset.x + dx,
          y: viewport.offset.y + dy,
        },
      });

      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    }
  }, [viewport.offset, setViewport]);

  const handleMouseUp = useCallback(() => {
    isPanningRef.current = false;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const deviceType = e.dataTransfer.getData('application/x-device-type') as string;

      if (!deviceType || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - viewport.offset.x) / viewport.zoom;
      const y = (e.clientY - rect.top - viewport.offset.y) / viewport.zoom;

      useCircuitStore.getState().addDevice(deviceType as any, { x, y });
    },
    [viewport]
  );

  return (
    <div
      ref={containerRef}
      className="flex-1 relative overflow-hidden bg-gray-950 cursor-crosshair"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <svg
        className="w-full h-full"
        style={{ display: 'block' }}
      >
        <defs>
          <filter id="pin-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.5" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g
          transform={`translate(${viewport.offset.x}, ${viewport.offset.y}) scale(${viewport.zoom})`}
        >
          {showGrid && <CanvasGrid size={gridSize} />}

          <g className="connections-layer">
            {Object.values(connections).map((conn) => (
              <ConnectionWire key={conn.id} connection={conn} />
            ))}
          </g>

          <g className="devices-layer">
            {Object.values(devices).map((device) => (
              <DeviceNode key={device.id} device={device} />
            ))}
          </g>
        </g>
      </svg>
    </div>
  );
};
