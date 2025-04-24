'use client';

import React, { useState, useCallback, useRef, MouseEvent } from 'react';
import { Window, WindowProps } from '@/components/window';
import { FileManager } from '@/components/apps/file-manager';
import { TaskManager } from '@/components/apps/task-manager';
import { CMD } from '@/components/apps/cmd';
import { SystemInfo } from '@/components/apps/system-info';
import { HackTool } from '@/components/apps/hack-tool';
import { ContextMenu } from '@/components/context-menu';
import { WidgetBar } from '@/components/widget-bar';
import {
  Terminal,
  FolderOpen,
  Activity,
  Info,
  Skull,
  Send,
} from 'lucide-react';

type WindowState = Omit<WindowProps, 'onClose' | 'onMinimize' | 'onMaximize' | 'bringToFront'> & {
  id: number;
  zIndex: number;
  minimized: boolean;
  maximized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isDragging?: boolean; // Add isDragging state
};

const initialWindows: Omit<WindowState, 'id' | 'zIndex' | 'minimized' | 'maximized' | 'position' | 'size'>[] = [
  { title: 'File Explorer', icon: <FolderOpen size={16} />, children: <FileManager />, initialPosition: { x: 50, y: 50 }, initialSize: { width: 600, height: 400 } },
  { title: 'Task Manager', icon: <Activity size={16} />, children: <TaskManager />, initialPosition: { x: 100, y: 100 }, initialSize: { width: 500, height: 350 } },
  { title: 'cmd.exe', icon: <Terminal size={16} />, children: <CMD />, initialPosition: { x: 150, y: 150 }, initialSize: { width: 700, height: 450 } },
  { title: 'System Info', icon: <Info size={16} />, children: <SystemInfo />, initialPosition: { x: 200, y: 200 }, initialSize: { width: 450, height: 300 } },
  { title: 'hack.exe', icon: <Skull size={16} />, children: <HackTool title="hack.exe" messages={["Initiating hack sequence...", "Bypassing firewall...", "Injecting payload...", "Target successfully annoyed! Access Denied: Just kidding!"]} />, initialPosition: { x: 250, y: 250 }, initialSize: { width: 550, height: 380 } },
  { title: 'DDoS_Script.js', icon: <Send size={16} />, children: <HackTool title="DDoS_Script.js" messages={["Loading DDoS module...", "Pinging target server...", "Sending packets...", "Error: Target bandwidth increased. They seem to like it.", "Operation Aborted: Too much fun."]} />, initialPosition: { x: 300, y: 300 }, initialSize: { width: 550, height: 380 } },
];

let windowIdCounter = 0;
let highestZIndex = 0;

export function Desktop() {
  const [windows, setWindows] = useState<WindowState[]>(() =>
    initialWindows.map((win, index) => {
      const id = windowIdCounter++;
      const zIndex = ++highestZIndex;
      return {
        ...win,
        id,
        zIndex,
        minimized: false,
        maximized: false,
        position: { x: win.initialPosition?.x ?? 50 + index * 20, y: win.initialPosition?.y ?? 50 + index * 20 },
        size: { width: win.initialSize?.width ?? 500, height: win.initialSize?.height ?? 300 },
      };
    })
  );
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const desktopRef = useRef<HTMLDivElement>(null);


  const bringToFront = useCallback((id: number) => {
    setWindows(prevWindows => {
      const newHighestZIndex = ++highestZIndex;
      return prevWindows.map(win =>
        win.id === id ? { ...win, zIndex: newHighestZIndex } : win
      );
    });
  }, []);

  const closeWindow = useCallback((id: number) => {
    setWindows(prevWindows => prevWindows.filter(win => win.id !== id));
  }, []);

  const minimizeWindow = useCallback((id: number) => {
     // Minimizing doesn't really do anything in this layout yet, could hide the window body later
     console.log(`Minimize window ${id}`);
     setWindows(prevWindows =>
       prevWindows.map(win =>
         win.id === id ? { ...win, minimized: true } : win
       )
     );
      // For now, just bring to front to simulate interaction
     bringToFront(id);
  }, [bringToFront]);

  const maximizeWindow = useCallback((id: number) => {
     console.log(`Maximize window ${id}`);
     setWindows(prevWindows =>
       prevWindows.map(win =>
         win.id === id ? { ...win, maximized: !win.maximized } : win
       )
     );
     bringToFront(id);
  }, [bringToFront]);

  const updateWindowPosition = useCallback((id: number, newPosition: { x: number; y: number }) => {
    setWindows(prevWindows =>
      prevWindows.map(win =>
        win.id === id ? { ...win, position: newPosition } : win
      )
    );
  }, []);

   const updateWindowDraggingState = useCallback((id: number, isDragging: boolean) => {
    setWindows(prev => prev.map(win => win.id === id ? { ...win, isDragging } : win));
  }, []);

  const handleContextMenu = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    // Ensure context menu doesn't open on window drag handles or content
    const target = event.target as HTMLElement;
     if (target.closest('[data-window-drag-handle="true"]') || target.closest('[data-window-content="true"]') || target.closest('[data-no-context="true"]')) {
      setContextMenu(null); // Don't show context menu if clicking on window parts
      return;
    }

    setContextMenu({ x: event.clientX, y: event.clientY });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  // Close context menu when clicking anywhere else on the desktop
  const handleClickOutside = (event: MouseEvent<HTMLDivElement>) => {
     if (contextMenu && desktopRef.current && !desktopRef.current.contains(event.target as Node)) {
       closeContextMenu();
     }
  };


  return (
    <div
      ref={desktopRef}
      className="relative h-full w-full bg-background overflow-hidden border border-primary/30 shadow-inner shadow-primary/20"
      onContextMenu={handleContextMenu}
      onClick={handleClickOutside} // Changed to onClick for broader compatibility
    >
      <WidgetBar />
      {windows.map((win) => (
        <Window
          key={win.id}
          id={win.id}
          title={win.title}
          icon={win.icon}
          position={win.position}
          size={win.size}
          zIndex={win.zIndex}
          isDragging={win.isDragging}
          updateWindowDraggingState={updateWindowDraggingState}
          onClose={() => closeWindow(win.id)}
          onMinimize={() => minimizeWindow(win.id)}
          onMaximize={() => maximizeWindow(win.id)}
          bringToFront={() => bringToFront(win.id)}
          updatePosition={updateWindowPosition}
          isMaximized={win.maximized}
          isMinimized={win.minimized}
        >
          {win.children}
        </Window>
      ))}
      {contextMenu && (
        <ContextMenu x={contextMenu.x} y={contextMenu.y} onClose={closeContextMenu} />
      )}
      {/* Glitch Overlay - subtle visual noise */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4' viewBox='0 0 4 4'%3E%3Cpath fill='%2300FF00' fill-opacity='0.4' d='M1 3h1v1H1V3zm2-2h1v1H3V1z'%3E%3C/path%3E%3C/svg%3E")`}}></div>
    </div>
  );
}
