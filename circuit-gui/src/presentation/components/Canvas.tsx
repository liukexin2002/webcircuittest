/**
 * Canvas 组件
 * 支持拖放放置器件和连线的画布
 */

import { useRef, type DragEvent, useEffect, useState } from 'react';
import { useEditorStore } from '../hooks/useEditorStore';
import { PlacedDevice, type PlacedDeviceData } from './PlacedDevice';
import { Connection } from './Connection';
import { TempWiringLine } from './TempWiringLine';
import { getDeviceSymbol } from '../lib/DeviceSymbols';
import { IdGenerator } from '../../infrastructure';
import { RoutingService } from '../../application/services/RoutingService';
import type { Point } from '../../domain';
import { GeometryUtils } from '../../infrastructure/geometry/GeometryUtils';

const routingService = new RoutingService();
const SNAP_DISTANCE = 20;

export function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [snapTarget, setSnapTarget] = useState<Point | null>(null);
  
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
    finishWiring,
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

  const findNearestPin = (mousePoint: Point) => {
    let nearestPin = null;
    let nearestDistance = SNAP_DISTANCE + 1;

    for (const device of placedDevices) {
      const symbol = getDeviceSymbol(device.deviceType);
      if (!symbol) continue;

      for (const pin of symbol.pins) {
        const pinPosition = {
          x: device.position.x + pin.position.x,
          y: device.position.y + pin.position.y
        };

        const distance = GeometryUtils.distance(mousePoint, pinPosition);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestPin = {
            deviceId: device.id,
            pinId: pin.id,
            position: pinPosition
          };
        }
      }
    }

    return nearestPin;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (wiring.active) {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      
      let x = (clientX - viewport.offset.x) / viewport.scale;
      let y = (clientY - viewport.offset.y) / viewport.scale;

      const mousePoint = { x, y };
      const nearestPin = findNearestPin(mousePoint);

      if (nearestPin) {
        setSnapTarget(nearestPin.position);
        
        if (wiring.source) {
          const isSamePin = 
            wiring.source.deviceId === nearestPin.deviceId && 
            wiring.source.pinId === nearestPin.pinId;
          
          if (!isSamePin) {
            setHighlightedPin({ deviceId: nearestPin.deviceId, pinId: nearestPin.pinId });
          }
        }
      } else {
        setSnapTarget(null);
        setHighlightedPin(null);
      }

      updateWiringPosition(nearestPin ? nearestPin.position : mousePoint);
    }
  };

  const handlePinMouseDown = (deviceId: string, pinId: string, position: Point) => {
    if (activeTool === 'wire') {
      if (wiring.active && wiring.source) {
        const isSamePin = 
          wiring.source.deviceId === deviceId && 
          wiring.source.pinId === pinId;
        
        if (!isSamePin) {
          const sourceDevice = placedDevices.find(d => d.id === wiring.source?.deviceId);
          const targetDevice = placedDevices.find(d => d.id === deviceId);
          
          if (sourceDevice && targetDevice) {
            const sourceSymbol = getDeviceSymbol(sourceDevice.deviceType);
            const targetSymbol = getDeviceSymbol(targetDevice.deviceType);
            
            if (sourceSymbol && targetSymbol) {
              const sourcePin = sourceSymbol.pins.find(p => p.id === wiring.source?.pinId);
              const targetPin = targetSymbol.pins.find(p => p.id === pinId);
              
              if (sourcePin && targetPin) {
                const sourcePosition = {
                  x: sourceDevice.position.x + sourcePin.position.x,
                  y: sourceDevice.position.y + sourcePin.position.y
                };
                
                const targetPosition = {
                  x: targetDevice.position.x + targetPin.position.x,
                  y: targetDevice.position.y + targetPin.position.y
                };
                
                const { connection, netId } = routingService.connectPins(
                  { deviceId: wiring.source.deviceId, pinId: wiring.source.pinId },
                  { deviceId, pinId },
                  sourcePosition,
                  targetPosition
                );
                
                addConnection(connection);
                finishWiring();
                setSnapTarget(null);
                setHighlightedPin(null);
              }
            }
          }
        }
      } else {
        startWiring(deviceId, pinId, position);
      }
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
    if (!snapTarget) {
      setHighlightedPin(null);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && wiring.active) {
        cancelWiring();
        setSnapTarget(null);
        setHighlightedPin(null);
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
              wiringActive={activeTool === 'wire' || wiring.active}
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

        {snapTarget && (
          <circle
            cx={snapTarget.x}
            cy={snapTarget.y}
            r={6}
            fill="none"
            stroke="#3b82f6"
            strokeWidth={2}
            strokeDasharray="3,3"
          />
        )}
      </svg>
    </div>
  );
}
