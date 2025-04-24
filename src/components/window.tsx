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
  icon?: ReactNode; // Make icon optional or provide a default
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  isMaximized: boolean;
  isMinimized: boolean;
  isDragging?: boolean;
  updateWindowDraggingState: (id: number, isDragging: boolean) => void;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  bringToFront: () => void;
  updatePosition: (id: number, newPosition: { x: number; y: number }) => void;
  updateSize: (id: number, newSize: { width: number; height: number }) => void; // Add updateSize prop
}

const WIDGET_BAR_HEIGHT = 32; // Height of the WidgetBar
const TASKBAR_HEIGHT = 40; // Height of the Taskbar
const DESKTOP_PADDING = 8; // Padding around the desktop area

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
  updateSize, // Destructure updateSize
}: WindowProps) {
  const nodeRef = useRef(null);
  const [currentPosition, setCurrentPosition] = useState(position);
  const [currentSize, setCurrentSize] = useState(size);
  const [previousSize, setPreviousSize] = useState(size);
  const [previousPosition, setPreviousPosition] = useState(position);
  const [maxConstraints, setMaxConstraints] = useState<[number, number] | undefined>(undefined);
  const dragHandleRef = useRef<HTMLDivElement>(null); // Ref for the drag handle

  // Calculate max constraints only on the client-side
  useEffect(() => {
    if (typeof window !== 'undefined') {
        const availableHeight = window.innerHeight - WIDGET_BAR_HEIGHT - TASKBAR_HEIGHT - (DESKTOP_PADDING * 2);
        const availableWidth = window.innerWidth - (DESKTOP_PADDING * 2);
        setMaxConstraints([availableWidth, availableHeight]);
    }
  }, []);


  // Update internal state if props change (e.g., external maximize/minimize)
  useEffect(() => {
    if (!isMaximized) {
      setCurrentPosition(position);
    }
  }, [position, isMaximized]);

  useEffect(() => {
    if (!isMaximized) {
       setCurrentSize(size);
    } else {
       // When maximized externally, set the size correctly
        const desktop = document.querySelector('.flex-grow.relative.overflow-hidden') as HTMLElement;
        if (desktop) {
            const { offsetWidth, offsetHeight } = desktop;
            const maximizedWidth = offsetWidth - (DESKTOP_PADDING / 2); // Adjust slightly for border/visuals
            const maximizedHeight = offsetHeight - (DESKTOP_PADDING / 2);
            setCurrentSize({ width: maximizedWidth, height: maximizedHeight });
        }
    }
  }, [size, isMaximized]);

  useEffect(() => {
     // Store previous state *before* maximizing
     if (isMaximized && !previousSize) { // Only store if maximizing and previous size isn't set
        setPreviousSize(size);
        setPreviousPosition(position);
     }
     // Reset previous state when un-maximizing *if needed*
     if (!isMaximized && previousSize) {
        setPreviousSize(size); // Reset previous size to current size when unmaximized
        setPreviousPosition(position); // Reset previous pos to current pos
     }

  }, [isMaximized, size, position, previousSize]);


  const handleDragStart = (e: DraggableEvent, data: DraggableData) => {
     // Prevent drag start if the click originated on a button inside the handle
      const target = e.target as HTMLElement;
      if (target.closest('button')) {
        return false;
      }
      if (!isMaximized) {
          updateWindowDraggingState(id, true);
          bringToFront();
      }
  };

  const handleDrag = (e: DraggableEvent, data: DraggableData) => {
     if (!isMaximized) {
        // Update local state while dragging for immediate feedback
        setCurrentPosition({ x: data.x, y: data.y });
     }
  };

  const handleDragStop = (e: DraggableEvent, data: DraggableData) => {
    updateWindowDraggingState(id, false);
     if (!isMaximized) {
        const newPosition = { x: data.x, y: data.y };
        // Clamp position to stay within desktop bounds (considering widget bar and taskbar)
        const clampedX = Math.max(DESKTOP_PADDING / 2, Math.min(newPosition.x, window.innerWidth - currentSize.width - DESKTOP_PADDING / 2));
        const clampedY = Math.max(DESKTOP_PADDING / 2, Math.min(newPosition.y, window.innerHeight - WIDGET_BAR_HEIGHT - TASKBAR_HEIGHT - currentSize.height - DESKTOP_PADDING / 2));
        updatePosition(id, { x: clampedX, y: clampedY });
        setCurrentPosition({ x: clampedX, y: clampedY }); // Update local state after clamping
     }
  };


  const handleResize = (event: React.SyntheticEvent, data: ResizeCallbackData) => {
      if (isDragging || isMaximized) return; // Don't resize if dragging or maximized

      const newSize = { width: data.size.width, height: data.size.height };
       // Clamp size based on max constraints
      const clampedWidth = maxConstraints ? Math.min(newSize.width, maxConstraints[0]) : newSize.width;
      const clampedHeight = maxConstraints ? Math.min(newSize.height, maxConstraints[1]) : newSize.height;

      setCurrentSize({width: clampedWidth, height: clampedHeight});
  };

   const handleResizeStop = (event: React.SyntheticEvent, data: ResizeCallbackData) => {
     if (isDragging || isMaximized) return;
      const finalSize = { width: data.size.width, height: data.size.height };
       // Clamp final size based on max constraints
      const clampedWidth = maxConstraints ? Math.min(finalSize.width, maxConstraints[0]) : finalSize.width;
      const clampedHeight = maxConstraints ? Math.min(finalSize.height, maxConstraints[1]) : finalSize.height;

     updateSize(id, {width: clampedWidth, height: clampedHeight}); // Update parent state with the final clamped size
      setCurrentSize({width: clampedWidth, height: clampedHeight}); // Ensure local state matches final size
   };


   const handleResizeStart = () => {
    bringToFront();
  };

   const handleMouseDown = (e: MouseEvent) => {
     const target = e.target as HTMLElement;
     // Only bring to front if clicking inside the window but not on buttons or the resize handle itself
     if (!target.closest('button') && !target.classList.contains('react-resizable-handle')) {
        bringToFront();
     }
   };

   const handleMaximizeToggle = () => {
     const wasMaximized = isMaximized; // Store current state before toggling

     if (!wasMaximized) { // If it *was not* maximized, store current state before maximizing
         setPreviousSize(currentSize); // Store current size
         setPreviousPosition(currentPosition); // Store current position
     }

     onMaximize(); // Notify parent to toggle maximized state

      // Apply state changes based on the *new* maximized state
     if (!wasMaximized) { // If it *will be* maximized now
         const desktop = document.querySelector('.flex-grow.relative.overflow-hidden') as HTMLElement;
         if (desktop) {
             const { offsetWidth, offsetHeight } = desktop;
             const maximizedWidth = offsetWidth - (DESKTOP_PADDING / 2); // Adjust slightly for border/visuals
             const maximizedHeight = offsetHeight - (DESKTOP_PADDING / 2);
             const maximizedX = DESKTOP_PADDING / 4;
             const maximizedY = DESKTOP_PADDING / 4;

             setCurrentSize({ width: maximizedWidth, height: maximizedHeight });
             setCurrentPosition({ x: maximizedX, y: maximizedY });
             updatePosition(id, { x: maximizedX, y: maximizedY }); // Update parent position
             updateSize(id, { width: maximizedWidth, height: maximizedHeight }); // Update parent size
         }
     } else { // If it *will be* restored now
         // Restore from stored previous state if available, otherwise use current props
         const restoreSize = previousSize || size;
         const restorePosition = previousPosition || position;
         setCurrentSize(restoreSize);
         setCurrentPosition(restorePosition);
         updatePosition(id, restorePosition); // Update parent position
         updateSize(id, restoreSize); // Update parent size
     }
   };


  // Conditional styles and classes
   const windowDynamicStyle: React.CSSProperties = {
        zIndex,
        position: 'absolute',
        // Let Draggable handle position via transform when not maximized
        top: 0,
        left: 0,
        width: `${currentSize.width}px`,
        height: `${currentSize.height}px`,
        transform: isMaximized ? `translate(${DESKTOP_PADDING / 4}px, ${DESKTOP_PADDING / 4}px)` : `translate(${currentPosition.x}px, ${currentPosition.y}px)`,
        transition: isDragging ? 'none' : 'width 0.1s ease-out, height 0.1s ease-out, transform 0.1s ease-out',
    };


  return (
      <Draggable
        nodeRef={nodeRef}
        handle="[data-window-drag-handle='true']"
        position={currentPosition} // Draggable uses this for internal state, but we control visually via transform
        onStart={handleDragStart}
        onDrag={handleDrag}
        onStop={handleDragStop}
        // Bounds need to account for the container being the main desktop area (.flex-grow.relative)
        // We'll manually clamp in handleDragStop as bounds prop conflicts with maximization/transform
        // bounds="parent"
        disabled={isMaximized}
        cancel="button"
      >
        {/* Wrap ResizableBox and its content in the draggable node */}
         <div ref={nodeRef} style={windowDynamicStyle} className="absolute" onMouseDown={handleMouseDown}>
            <ResizableBox
                width={currentSize.width}
                height={currentSize.height}
                minConstraints={isMaximized ? undefined : [250, 180]}
                maxConstraints={isMaximized || !maxConstraints ? undefined : maxConstraints}
                onResize={handleResize}
                onResizeStart={handleResizeStart}
                onResizeStop={handleResizeStop}
                draggableOpts={{ enableUserSelectHack: false }}
                className={cn(
                    "border border-primary/50 bg-card shadow-lg shadow-primary/20 flex flex-col overflow-hidden group", // Base styles
                    isMaximized ? 'rounded-none' : 'rounded-sm' // Conditional rounding
                )}
                handle={(handleAxis) => <span className={cn(`react-resizable-handle react-resizable-handle-${handleAxis}`, isMaximized ? 'hidden' : '')} data-no-context="true" />} // Prevent context menu on handle
                resizeHandles={isMaximized ? [] : ['se', 's', 'e', 'ne', 'n', 'nw', 'w', 'sw']}
                axis={isMaximized ? 'none' : 'both'} // Explicitly disable resizing axis when maximized
            >
                {/* Title Bar */}
                <div
                    ref={dragHandleRef}
                    className={cn(
                        "h-8 px-2 flex items-center justify-between bg-secondary/50 border-b border-primary/30 select-none shrink-0", // Ensure titlebar doesn't shrink
                        isMaximized ? 'cursor-default' : 'cursor-grab' // Change cursor when maximized
                    )}
                    data-window-drag-handle="true"
                    onDoubleClick={handleMaximizeToggle}
                    data-no-context="true" // Prevent context menu on title bar
                >
                    <div className="flex items-center gap-2 text-accent text-xs truncate pointer-events-none"> {/* Make text non-interactive for drag */}
                        {React.isValidElement(icon) ? React.cloneElement(icon, { size: 14 } as any) : <Square size={14} className="opacity-50" />}
                        <span className="truncate">{title}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-foreground hover:bg-accent/30 focus:outline-none focus:ring-1 focus:ring-ring" onClick={(e) => { e.stopPropagation(); onMinimize(); }} data-no-context="true">
                            <Minimize2 size={14} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-foreground hover:bg-accent/30 focus:outline-none focus:ring-1 focus:ring-ring" onClick={(e) => { e.stopPropagation(); handleMaximizeToggle(); }} data-no-context="true">
                            {/* Use different icons for maximize/restore */}
                            {isMaximized ? <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg> : <Maximize2 size={14} />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/30 hover:text-destructive-foreground focus:outline-none focus:ring-1 focus:ring-destructive" onClick={(e) => { e.stopPropagation(); onClose(); }} data-no-context="true">
                            <X size={14} />
                        </Button>
                    </div>
                </div>

                {/* Content Area */}
                <div
                    data-window-content="true"
                    className={cn(
                        "flex-grow overflow-auto bg-background text-sm relative", // Added relative positioning
                         isMinimized ? 'hidden' : '',
                         isMaximized ? 'rounded-none' : 'rounded-b-sm' // Match rounding
                    )}
                    // Use custom scrollbar styling defined in globals.css
                >
                    {/* Content takes remaining space */}
                    <div className="absolute inset-0 overflow-auto p-1"> {/* Use absolute positioning for content overflow */}
                         {children}
                    </div>
                </div>
            </ResizableBox>
        </div>
      </Draggable>
  );
}

    