import React from 'react';
import { DevicePalette } from '../palette/DevicePalette';
import { Canvas } from '../canvas/Canvas';
import { Toolbar } from './Toolbar';
import { StatusBar } from './StatusBar';

export const AppLayout: React.FC = () => {
  return (
    <div className="h-screen w-screen flex flex-col bg-gray-950 text-gray-100 overflow-hidden">
      <Toolbar />
      <div className="flex-1 flex overflow-hidden">
        <DevicePalette />
        <Canvas />
      </div>
      <StatusBar />
    </div>
  );
};
