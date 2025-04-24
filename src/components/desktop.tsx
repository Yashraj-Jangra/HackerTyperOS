'use client';

import React, { useState, useCallback, useRef, MouseEvent, useMemo } from 'react';
import { Window, WindowProps } from '@/components/window';
import { DesktopIcon, AppDefinition } from '@/components/desktop-icon';
import { FileManager } from '@/components/apps/file-manager';
import { TaskManager } from '@/components/apps/task-manager';
import { CMD } from '@/components/apps/cmd';
import { SystemSettings } from '@/components/apps/system-settings';
import { HackTool } from '@/components/apps/hack-tool';
import { ContextMenu } from '@/components/context-menu';
import { WidgetBar } from '@/components/widget-bar';
import { Taskbar } from '@/components/taskbar';
import {
  Terminal,
  FolderOpen,
  Activity,
  Settings,
  Skull,
  Send,
  Square,
} from 'lucide-react';

type WindowState = Omit<WindowProps, 'onClose' | 'onMinimize' | 'onMaximize' | 'bringToFront' | 'updatePosition' | 'updateSize' | 'updateWindowDraggingState'> & {
  id: number;
  appId: string;
  zIndex: number;
  minimized: boolean;
  maximized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isDragging?: boolean;
};

const availableApps: AppDefinition[] = [
  { id: 'file-manager', title: 'File Explorer', icon: <FolderOpen size={32} />, component: <FileManager />, initialSize: { width: 700, height: 500 } },
  { id: 'task-manager', title: 'Task Manager', icon: <Activity size={32} />, component: <TaskManager />, initialSize: { width: 650, height: 500 } }, // Increased default size
  { id: 'cmd', title: 'cmd.exe', icon: <Terminal size={32} />, component: <CMD />, initialSize: { width: 700, height: 450 } },
  { id: 'system-settings', title: 'System Settings', icon: <Settings size={32} />, component: <SystemSettings />, initialSize: { width: 500, height: 420 } },
  { id: 'hack-tool', title: 'hack.exe', icon: <Skull size={32} />, component: <HackTool title="hack.exe" messages={["Initiating hack sequence...", "Bypassing firewall...", "Injecting payload...", "Target successfully annoyed! Access Denied: Just kidding!"]} />, initialSize: { width: 550, height: 380 } },
  { id: 'ddos-script', title: 'DDoS_Script.js', icon: <Send size={32} />, component: <HackTool title="DDoS_Script.js" messages={["Loading DDoS module...", "Pinging target server...", "Sending packets...", "Error: Target bandwidth increased. They seem to like it.", "Operation Aborted: Too much fun."]} />, initialSize: { width: 550, height: 380 } },
];

let windowIdCounter = 0;
let highestZIndex = 0;

export function Desktop() {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const desktopRef = useRef<HTMLDivElement>(null);
  const lastWindowPosition = useRef<{ x: number; y: number }>({ x: 50, y: 50 });

  const bringToFront = useCallback((id: number) => {
    setWindows(prevWindows => {
      const newHighestZIndex = Math.max(0, ...prevWindows.map(w => w.zIndex)) + 1;
      return prevWindows.map(win =>
        win.id === id ? { ...win, zIndex: newHighestZIndex, minimized: false } : win
      );
    });
  }, []);


  const openApp = useCallback((appId: string) => {
      const appDef = availableApps.find(app => app.id === appId);
      if (!appDef) {
        console.error(`App definition not found for ID: ${appId}`);
        return;
      }

      const existingWindow = windows.find(win => win.appId === appDef.id);
      if (existingWindow) {
          bringToFront(existingWindow.id);
          return;
      }

      const initialX = lastWindowPosition.current.x + 20;
      const initialY = lastWindowPosition.current.y + 20;
      const initialWidth = appDef.initialSize?.width ?? 500;
      const initialHeight = appDef.initialSize?.height ?? 300;

      const boundedX = initialX > window.innerWidth - initialWidth ? 50 : initialX;
      const boundedY = initialY > window.innerHeight - initialHeight - 40 ? 50 : initialY;

      const newPosition = { x: boundedX, y: boundedY };
      lastWindowPosition.current = newPosition;

      setWindows(prev => {
         const newHighestZIndex = Math.max(0, ...prev.map(w => w.zIndex)) + 1;
         const newWindow: WindowState = {
          id: windowIdCounter++,
          appId: appDef.id,
          title: appDef.title,
          icon: appDef.icon ?? <Square size={14}/>,
          children: appDef.component,
          position: newPosition,
          size: { width: initialWidth, height: initialHeight },
          zIndex: newHighestZIndex,
          minimized: false,
          maximized: false,
        };
        return [...prev, newWindow];
      });

  }, [windows, bringToFront]);

  const closeWindow = useCallback((id: number) => {
    setWindows(prevWindows => prevWindows.filter(win => win.id !== id));
  }, []);

  const minimizeWindow = useCallback((id: number) => {
     setWindows(prevWindows => {
        const windowToMinimize = prevWindows.find(win => win.id === id);
        if (!windowToMinimize) return prevWindows;

        const otherWindows = prevWindows.filter(w => w.id !== id && !w.minimized);
        let nextActiveWindowId: number | null = null;
        if (otherWindows.length > 0) {
          otherWindows.sort((a, b) => b.zIndex - a.zIndex);
          nextActiveWindowId = otherWindows[0].id;
        }

        const newHighestZIndex = nextActiveWindowId ? Math.max(0, ...prevWindows.map(w => w.zIndex)) + 1 : windowToMinimize.zIndex;

        return prevWindows.map(win => {
            if (win.id === id) {
                return { ...win, minimized: true };
            }
            if (win.id === nextActiveWindowId) {
                return { ...win, zIndex: newHighestZIndex };
            }
            return win;
        });
     });
  }, []);


  const maximizeWindow = useCallback((id: number) => {
     setWindows(prevWindows =>
       prevWindows.map(win =>
         win.id === id ? { ...win, maximized: !win.maximized, minimized: false } : win
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

    const updateWindowSize = useCallback((id: number, newSize: { width: number; height: number }) => {
        setWindows(prevWindows =>
        prevWindows.map(win =>
            win.id === id ? { ...win, size: newSize } : win
        )
        );
    }, []);

  const activeWindowId = useMemo(() => {
      const nonMinimizedWindows = windows.filter(win => !win.minimized);
      if (nonMinimizedWindows.length === 0) return null;
      return nonMinimizedWindows.reduce((prev, current) => (prev.zIndex > current.zIndex ? prev : current)).id;
  }, [windows]);


  const handleContextMenu = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    const target = event.target as HTMLElement;
     if (target.closest('[data-window-drag-handle="true"]') ||
         target.closest('[data-window-content="true"]') ||
         target.closest('[data-no-context="true"]')) {
      setContextMenu(null);
      return;
    }
    setContextMenu({ x: event.clientX, y: event.clientY });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const handleClickOutsideContextMenu = (event: MouseEvent<HTMLDivElement>) => {
     if (contextMenu && event.target === desktopRef.current) {
       closeContextMenu();
     }
  };


  return (
    <div
      ref={desktopRef}
      className="relative h-full w-full bg-background overflow-hidden border border-primary/30 shadow-inner shadow-primary/20 flex flex-col"
      onContextMenu={handleContextMenu}
      onClick={handleClickOutsideContextMenu}
    >
      <WidgetBar />

       <div className="flex-grow relative overflow-hidden">
            <div className="absolute top-2 left-2 p-2 grid grid-cols-1 gap-4 z-0">
                {availableApps.map((app) => (
                <DesktopIcon
                    key={app.id}
                    title={app.title}
                    icon={app.icon}
                    onOpen={() => openApp(app.id)}
                />
                ))}
            </div>

            {windows.map((win) => (
                !win.minimized && (
                    <Window
                        key={win.id}
                        id={win.id}
                        title={win.title}
                        icon={win.icon}
                        position={win.position}
                        size={win.size}
                        zIndex={win.zIndex}
                        isMaximized={win.maximized}
                        isMinimized={win.minimized}
                        isDragging={win.isDragging}
                        updateWindowDraggingState={updateWindowDraggingState}
                        onClose={() => closeWindow(win.id)}
                        onMinimize={() => minimizeWindow(win.id)}
                        onMaximize={() => maximizeWindow(win.id)}
                        bringToFront={() => bringToFront(win.id)}
                        updatePosition={updateWindowPosition}
                        updateSize={updateWindowSize}
                    >
                        {win.children}
                    </Window>
                )
            ))}
            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={closeContextMenu}
                    onOpenApp={openApp}
                />
            )}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4' viewBox='0 0 4 4'%3E%3Cpath fill='%2300FF00' fill-opacity='0.4' d='M1 3h1v1H1V3zm2-2h1v1H3V1z'%3E%3C/path%3E%3C/svg%3E")`}}></div>
       </div>

        <Taskbar
             windows={windows.map(w => ({ // Map only necessary info
                id: w.id,
                title: w.title,
                icon: w.icon,
                minimized: w.minimized,
                zIndex: w.zIndex,
                isMaximized: w.maximized // Pass isMaximized state
             }))}
            onTaskbarItemClick={bringToFront}
            activeWindowId={activeWindowId}
            minimizeWindow={minimizeWindow}
            closeWindow={closeWindow}
            maximizeWindow={maximizeWindow} // Pass maximize function
            data-no-context="true"
        />
    </div>
  );
}