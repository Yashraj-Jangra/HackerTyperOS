'use client';

import React, { useState, useCallback, useRef, MouseEvent, useMemo } from 'react';
import { Window, WindowProps } from '@/components/window';
import { DesktopIcon, AppDefinition } from '@/components/desktop-icon'; // Import DesktopIcon and AppDefinition
import { FileManager } from '@/components/apps/file-manager';
import { TaskManager } from '@/components/apps/task-manager';
import { CMD } from '@/components/apps/cmd';
import { SystemInfo } from '@/components/apps/system-info';
import { HackTool } from '@/components/apps/hack-tool';
import { ContextMenu } from '@/components/context-menu';
import { WidgetBar } from '@/components/widget-bar';
import { Taskbar } from '@/components/taskbar'; // Import Taskbar
import {
  Terminal,
  FolderOpen,
  Activity,
  Info as InfoIcon, // Rename Info to avoid conflict with component
  Skull,
  Send,
  Square, // Default icon
} from 'lucide-react';

type WindowState = Omit<WindowProps, 'onClose' | 'onMinimize' | 'onMaximize' | 'bringToFront'> & {
  id: number;
  appId: string; // Unique identifier for the app type (e.g., 'file-manager')
  zIndex: number;
  minimized: boolean;
  maximized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isDragging?: boolean; // Add isDragging state
};

// Define available applications instead of initially open windows
const availableApps: AppDefinition[] = [
  { id: 'file-manager', title: 'File Explorer', icon: <FolderOpen size={32} />, component: <FileManager />, initialSize: { width: 600, height: 400 } },
  { id: 'task-manager', title: 'Task Manager', icon: <Activity size={32} />, component: <TaskManager />, initialSize: { width: 550, height: 450 } },
  { id: 'cmd', title: 'cmd.exe', icon: <Terminal size={32} />, component: <CMD />, initialSize: { width: 700, height: 450 } },
  { id: 'system-info', title: 'System Info', icon: <InfoIcon size={32} />, component: <SystemInfo />, initialSize: { width: 450, height: 350 } },
  { id: 'hack-tool', title: 'hack.exe', icon: <Skull size={32} />, component: <HackTool title="hack.exe" messages={["Initiating hack sequence...", "Bypassing firewall...", "Injecting payload...", "Target successfully annoyed! Access Denied: Just kidding!"]} />, initialSize: { width: 550, height: 380 } },
  { id: 'ddos-script', title: 'DDoS_Script.js', icon: <Send size={32} />, component: <HackTool title="DDoS_Script.js" messages={["Loading DDoS module...", "Pinging target server...", "Sending packets...", "Error: Target bandwidth increased. They seem to like it.", "Operation Aborted: Too much fun."]} />, initialSize: { width: 550, height: 380 } },
];

let windowIdCounter = 0;
let highestZIndex = 0;

export function Desktop() {
  // Start with no windows open
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const desktopRef = useRef<HTMLDivElement>(null);
  const lastWindowPosition = useRef<{ x: number; y: number }>({ x: 50, y: 50 }); // Track position for new windows

  const bringToFront = useCallback((id: number) => {
    setWindows(prevWindows => {
      const newHighestZIndex = Math.max(...prevWindows.map(w => w.zIndex)) + 1;
      return prevWindows.map(win =>
        win.id === id ? { ...win, zIndex: newHighestZIndex, minimized: false } : win // Also unminimize when brought to front
      );
    });
  }, []);


  const openApp = useCallback((appDef: AppDefinition) => {
      // Check if a window for this app is already open and potentially minimized
      const existingWindow = windows.find(win => win.appId === appDef.id);
      if (existingWindow) {
          bringToFront(existingWindow.id); // This will unminimize and bring to front
          return;
      }

      // Calculate initial position, slightly offset from the last one
      const initialX = lastWindowPosition.current.x + 20;
      const initialY = lastWindowPosition.current.y + 20;
      // Basic bounds check (improve later if needed)
      const boundedX = initialX > window.innerWidth - (appDef.initialSize?.width ?? 500) ? 50 : initialX;
      const boundedY = initialY > window.innerHeight - (appDef.initialSize?.height ?? 300) - 40 ? 50 : initialY; // Subtract taskbar height

      const newPosition = { x: boundedX, y: boundedY };
      lastWindowPosition.current = newPosition; // Update for the next window

      setWindows(prev => {
         const newHighestZIndex = Math.max(0, ...prev.map(w => w.zIndex)) + 1;
         const newWindow: WindowState = {
          id: windowIdCounter++,
          appId: appDef.id,
          title: appDef.title,
          icon: appDef.icon ?? <Square size={14}/>, // Provide default icon
          children: appDef.component,
          position: newPosition,
          size: appDef.initialSize ?? { width: 500, height: 300 },
          zIndex: newHighestZIndex,
          minimized: false,
          maximized: false,
        };
        return [...prev, newWindow];
      });

  }, [windows, bringToFront]); // Add dependencies

  const closeWindow = useCallback((id: number) => {
    setWindows(prevWindows => prevWindows.filter(win => win.id !== id));
  }, []);

  const minimizeWindow = useCallback((id: number) => {
     setWindows(prevWindows => {
        const windowToMinimize = prevWindows.find(win => win.id === id);
        if (!windowToMinimize) return prevWindows;

        // Find the next highest z-index non-minimized window to bring to front
        const otherWindows = prevWindows.filter(w => w.id !== id && !w.minimized);
        let nextActiveWindowId: number | null = null;
        if (otherWindows.length > 0) {
          otherWindows.sort((a, b) => b.zIndex - a.zIndex);
          nextActiveWindowId = otherWindows[0].id;
        }

        const newHighestZIndex = nextActiveWindowId ? Math.max(...prevWindows.map(w => w.zIndex)) + 1 : windowToMinimize.zIndex;

        return prevWindows.map(win => {
            if (win.id === id) {
                return { ...win, minimized: true };
            }
            // Bring the next highest window to the front if it exists
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
         win.id === id ? { ...win, maximized: !win.maximized, minimized: false } : win // Unminimize on maximize/restore
       )
     );
     bringToFront(id); // Bring to front when maximizing or restoring
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

  // Find the active window ID (highest zIndex, not minimized)
  const activeWindowId = useMemo(() => {
      const nonMinimizedWindows = windows.filter(win => !win.minimized);
      if (nonMinimizedWindows.length === 0) return null;
      return nonMinimizedWindows.reduce((prev, current) => (prev.zIndex > current.zIndex ? prev : current)).id;
  }, [windows]);


  const handleContextMenu = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    // Ensure context menu doesn't open on window parts, icons, taskbar, or widget bar
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

  // Close context menu when clicking anywhere else on the desktop
  const handleClickOutsideContextMenu = (event: MouseEvent<HTMLDivElement>) => {
     // Close only if clicking directly on the desktop background, not on interactive elements
     if (contextMenu && event.target === desktopRef.current) {
       closeContextMenu();
     }
  };


  return (
    <div
      ref={desktopRef}
      className="relative h-full w-full bg-background overflow-hidden border border-primary/30 shadow-inner shadow-primary/20 flex flex-col" // Use flex-col
      onContextMenu={handleContextMenu}
      onClick={handleClickOutsideContextMenu}
    >
      <WidgetBar />

       {/* Main Desktop Area */}
       <div className="flex-grow relative overflow-hidden"> {/* This container holds icons and windows */}
            {/* Desktop Icons Area */}
            <div className="absolute top-2 left-2 p-2 grid grid-cols-1 gap-4 z-0">
                {availableApps.map((app) => (
                <DesktopIcon
                    key={app.id}
                    title={app.title}
                    icon={app.icon}
                    onOpen={() => openApp(app)}
                />
                ))}
            </div>

            {/* Render Open Windows */}
            {windows.map((win) => (
                !win.minimized && ( // Only render if not minimized
                    <Window
                    key={win.id}
                    id={win.id}
                    title={win.title}
                    icon={win.icon} // Pass icon here
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
                    updateSize={updateWindowSize} // Pass updateSize
                    isMaximized={win.maximized}
                    isMinimized={win.minimized} // Pass minimized state
                    >
                    {win.children}
                    </Window>
                )
            ))}
            {contextMenu && (
                <ContextMenu x={contextMenu.x} y={contextMenu.y} onClose={closeContextMenu} />
            )}
            {/* Glitch Overlay - subtle visual noise */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4' viewBox='0 0 4 4'%3E%3Cpath fill='%2300FF00' fill-opacity='0.4' d='M1 3h1v1H1V3zm2-2h1v1H3V1z'%3E%3C/path%3E%3C/svg%3E")`}}></div>
       </div>

        {/* Taskbar */}
        <Taskbar
            windows={windows}
            onTaskbarItemClick={bringToFront}
            activeWindowId={activeWindowId}
            minimizeWindow={minimizeWindow}
            closeWindow={closeWindow}
            maximizeWindow={maximizeWindow}
            data-no-context="true" // Prevent desktop context menu on taskbar
        />
    </div>
  );
}

    