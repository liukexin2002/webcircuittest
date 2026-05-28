/**
 * Canvas 组件
 * 核心的 SVG 渲染组件
 */

import { useRef, type MouseEvent } from 'react';
import { useEditor } from '../context/EditorContext';
import { useEditorStore } from '../hooks/useEditorStore';
import type { Point } from '../../domain';
import { GeometryUtils } from '../../infrastructure';

export function Canvas() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { editorService } = useEditor();
  const { circuit, selectedIds, viewport } = useEditorStore();

  const screenToWorld = (clientX: number, clientY: number): Point => {
    const container = containerRef.current;
    if (!container) return { x: clientX, y: clientY };
    const rect = container.getBoundingClientRect();
    return {
      x: (clientX - rect.left - viewport.offset.x) / viewport.scale,
      y: (clientY - rect.top - viewport.offset.y) / viewport.scale
    };
  };

  const handlePointerDown = (e: MouseEvent) => {
    const worldPos = screenToWorld(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: MouseEvent) => {
    const worldPos = screenToWorld(e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
  };

  const renderDevices = () => {
    if (!circuit) return null;

    return Array.from(circuit.devices.values()).map((device) => {
      const isSelected = selectedIds.has(device.id);

      return (
        <g key={device.id} transform={`translate(${device.position.x}, ${device.position.y})`}>
          <rect
            x={-30}
            y={-20}
            width={60}
            height={40}
            fill={isSelected ? '#4ade80' : '#e0e0e0'}
            stroke={isSelected ? '#22c55e' : '#999'}
            strokeWidth={isSelected ? 3 : 1}
            rx={4}
          />
          <text
              y={5}
              textAnchor="middle"
              fontSize={12}
              fontFamily="Arial"
              fill="#333"
            >
              {device.label}
          </text>
          {device.pins.map((pin) => (
            <circle
              key={pin.id}
              cx={pin.position.x}
              cy={pin.position.y}
              r={4}
              fill="#333"
            />
          ))}
        </g>
      );
    });
  };

  const renderGrid = () => {
    if (!circuit || !circuit.settings.showGrid) return null;

    const gridSize = circuit.settings.gridSize;
    const width = circuit.settings.size.width;
    const height = circuit.settings.size.height;

    const lines = [];

    for (let x = -width / 2; x <= width / 2; x += gridSize) {
      lines.push(
        <line
          key={`v-${x}`}
          x1={x}
          y1={-height / 2}
          x2={x}
          y2={height / 2}
          stroke="#ddd"
          strokeWidth={0.5}
        />
      );
    }

    for (let y = -height / 2; y <= height / 2; y += gridSize) {
      lines.push(
        <line
          key={`h-${y}`}
          x1={-width / 2}
          y1={y}
          x2={width / 2}
          y2={y}
          stroke="#ddd"
          strokeWidth={0.5}
        />
      );
    }

    return <g>{lines}</g>;
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: '#f0f0f0'
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <svg
        ref={svgRef}
        style={{
          width: '100%',
          height: '100%'
        }}
      >
        <g
          transform={`translate(${viewport.offset.x}, ${viewport.offset.y}) scale(${viewport.scale})`}
        >
          {renderGrid()}
          {renderDevices()}
        </g>
      </svg>
    </div>
  );
}
