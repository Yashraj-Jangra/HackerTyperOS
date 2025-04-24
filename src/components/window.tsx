'use client';

import React, { useState, useRef, useCallback, useEffect, type ReactNode, type MouseEvent } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import { ResizableBox, ResizeCallbackData } from 'react-resizable';
import 'react-resizable/css/styles.css'; // Import default resizable styles
import { Button } from '@/components/ui/button';
import { Minimize2, Maximize2, X, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WindowProps {
  id: number;
  title: string;
  children: ReactNode;
  icon?: ReactNode;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  isMaximized: boolean;
  isMinimized: boolean; // Though not fully implemented visually
  isDragging?: boolean;
  updateWindowDraggingState: (id: number, isDragging: boolean) => void;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  bringToFront: () => void;
  updatePosition: (id: number, newPosition: { x: number; y: number }) => void;
}

export function Window({
  id,
  title,
  children,
  icon,
  position,
  size,
  zIndex,
  isMaximized,
  isMinimized,
  isDragging,
  updateWindowDraggingState,
  onClose,
  onMinimize,
  onMaximize,
  bringToFront,
  updatePosition,
}: WindowProps) {
  const nodeRef = useRef(null);
  const [currentPosition, setCurrentPosition] = useState(position);
  const [currentSize, setCurrentSize] = useState(size);
  const [previousSize, setPreviousSize] = useState(size);
  const [previousPosition, setPreviousPosition] = useState(position);

  // Update internal state if props change (e.g., maximization)
  useEffect(() => {
    setCurrentPosition(position);
  }, [position]);

  useEffect(() => {
     if (!isMaximized) {
        setCurrentSize(size);
     }
  }, [size, isMaximized]);


  const handleDragStart = () => {
    updateWindowDraggingState(id, true);
    bringToFront();
  };

  const handleDrag = (e: DraggableEvent, data: DraggableData) => {
     // Only update position if not maximized
     if (!isMaximized) {
      const newPosition = { x: data.x, y: data.y };
      setCurrentPosition(newPosition); // Update visual immediately
     }
  };

  const handleDragStop = (e: DraggableEvent, data: DraggableData) => {
    updateWindowDraggingState(id, false);
    // Only update position if not maximized
     if (!isMaximized) {
        const newPosition = { x: data.x, y: data.y };
        updatePosition(id, newPosition); // Persist final position
     } else {
       // If dragged while maximized, restore to previous position/size
       handleMaximizeToggle();
     }
  };


  const handleResize = (event: React.SyntheticEvent, data: ResizeCallbackData) => {
      // Prevent resize during drag (optional, might feel better)
      if (isDragging) return;

      const newSize = { width: data.size.width, height: data.size.height };
      setCurrentSize(newSize);
      // Update size state in parent (optional, could debounce)
      // updateSize(id, newSize);
  };

   const handleResizeStart = () => {
    bringToFront();
  };

   const handleMouseDown = (e: MouseEvent) => {
     // Prevent drag start if clicking on resize handle
     const target = e.target as HTMLElement;
     if (target.classList.contains('react-resizable-handle')) {
       return;
     }
     bringToFront();
   };

   const handleMaximizeToggle = () => {
     if (!isMaximized) {
       // Store current size and position before maximizing
       setPreviousSize(currentSize);
       setPreviousPosition(currentPosition);
       // Calculate maximized size/position (e.g., fill parent minus padding)
       // For simplicity, using fixed large values or viewport dimensions
       const desktop = document.querySelector('.relative.h-full.w-full') as HTMLElement;
       if (desktop) {
         const { offsetWidth, offsetHeight } = desktop;
         const padding = 8; // Match desktop padding * 2
         setCurrentSize({ width: offsetWidth - padding, height: offsetHeight - padding - 40}); // Adjust for padding and widget bar
         setCurrentPosition({ x: 0, y: 40 }); // Position below widget bar
       }
     } else {
       // Restore previous size and position
       setCurrentSize(previousSize);
       setCurrentPosition(previousPosition);
     }
     onMaximize(); // Call parent handler to toggle state
   };

  const windowStyle: React.CSSProperties = {
    zIndex,
    width: isMaximized ? 'calc(100% - 8px)' : `${currentSize.width}px`, // Adjust width for padding
    height: isMaximized ? 'calc(100% - 48px)' : `${currentSize.height}px`, // Adjust height for padding and widget bar
    position: 'absolute',
    top: isMaximized ? '40px' : `${currentPosition.y}px`,
    left: isMaximized ? '4px' : `${currentPosition.x}px`,
    transition: isMaximized || isDragging ? 'none' : 'top 0.2s ease, left 0.2s ease, width 0.2s ease, height 0.2s ease', // Smooth transition only when not dragging/maximized
  };

  return (
      <Draggable
        nodeRef={nodeRef}
        handle="[data-window-drag-handle='true']"
        position={isMaximized ? {x: 0, y: 0} : currentPosition} // Control position via state
        onStart={handleDragStart}
        onDrag={handleDrag}
        onStop={handleDragStop}
        bounds="parent" // Keep window within the desktop bounds
        disabled={isMaximized} // Disable dragging when maximized
      >
        <ResizableBox
            width={isMaximized ? Infinity : currentSize.width} // Let CSS handle width when maximized
            height={isMaximized ? Infinity : currentSize.height} // Let CSS handle height when maximized
            style={windowStyle}
            minConstraints={isMaximized ? undefined : [200, 150]} // Min size only if not maximized
            maxConstraints={isMaximized ? undefined : [window.innerWidth - 10, window.innerHeight - 50]} // Max size only if not maximized
            onResize={handleResize}
            onResizeStart={handleResizeStart}
            draggableOpts={{ enableUserSelectHack: false }} // Prevent text selection issues
            className={cn(
                "border border-primary/50 bg-card shadow-lg shadow-primary/20 flex flex-col overflow-hidden group",
                isMaximized ? 'rounded-none' : 'rounded-sm' // Remove rounded corners when maximized
            )}
            handle={(handleAxis) => <span className={cn(`react-resizable-handle react-resizable-handle-${handleAxis}`, isMaximized ? 'hidden' : '')} />} // Hide handles when maximized
            resizeHandles={isMaximized ? [] : ['se', 's', 'e', 'ne', 'n', 'nw', 'w', 'sw']} // Disable resizing when maximized
            nodeRef={nodeRef} // Pass ref for Draggable
            onMouseDown={handleMouseDown} // Bring to front on any click inside
        >
          {/* Title Bar */}
          <div
            className="h-8 px-2 flex items-center justify-between bg-secondary/50 border-b border-primary/30 cursor-grab select-none"
            data-window-drag-handle="true" // Mark as draggable handle
            onDoubleClick={handleMaximizeToggle} // Double click to maximize/restore
          >
            <div className="flex items-center gap-2 text-accent text-xs truncate">
              {icon || <Square size={14} className="opacity-50" />}
              <span className="truncate">{title}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="icon" className="h-6 w-6 text-foreground hover:bg-accent/30" onClick={(e) => { e.stopPropagation(); onMinimize(); }}>
                <Minimize2 size={14} />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-foreground hover:bg-accent/30" onClick={(e) => { e.stopPropagation(); handleMaximizeToggle(); }}>
                <Maximize2 size={14} />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/30 hover:text-destructive-foreground" onClick={(e) => { e.stopPropagation(); onClose(); }}>
                <X size={14} />
              </Button>
            </div>
          </div>

          {/* Content Area */}
          <div
            data-window-content="true" // Mark content area
            className={cn(
            "flex-grow p-2 overflow-auto bg-background text-sm",
             isMinimized ? 'hidden' : '' // Hide content when minimized (simple approach)
            )}
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'hsl(var(--foreground)) hsl(var(--background))' }} // Custom scrollbar style
          >
            {children}
          </div>
        </ResizableBox>
      </Draggable>
  );
}
