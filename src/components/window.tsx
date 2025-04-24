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
        // Subtract a bit more to prevent scrollbars on maximize
        setMaxConstraints([window.innerWidth - 20, window.innerHeight - 60]);
    }
  }, []);


  // Update internal state if props change (e.g., maximization, prop updates)
  useEffect(() => {
    setCurrentPosition(position);
  }, [position]);

  useEffect(() => {
     // Update size only if the window is not maximized and the prop changes
     if (!isMaximized) {
        setCurrentSize(size);
     }
  }, [size, isMaximized]);


  const handleDragStart = (e: DraggableEvent, data: DraggableData) => {
     // Prevent drag start if the click originated on a button inside the handle
      const target = e.target as HTMLElement;
      if (target.closest('button')) {
        // Returning false cancels the drag start in react-draggable v4+
        // For older versions or different behavior, you might need to adjust
        return false;
      }
      updateWindowDraggingState(id, true);
      bringToFront();
  };

  const handleDrag = (e: DraggableEvent, data: DraggableData) => {
     if (!isMaximized) {
      const newPosition = { x: data.x, y: data.y };
      setCurrentPosition(newPosition);
     }
  };

  const handleDragStop = (e: DraggableEvent, data: DraggableData) => {
    updateWindowDraggingState(id, false);
     if (!isMaximized) {
        const newPosition = { x: data.x, y: data.y };
        updatePosition(id, newPosition);
     } else {
       // If dragged while maximized, restore to previous position/size
       handleMaximizeToggle();
       // After restoring, update the position based on where the drag ended
       // This prevents the window snapping back to the top-left corner
        const newPosition = { x: data.x, y: data.y };
        updatePosition(id, newPosition);
        setCurrentPosition(newPosition); // Also update local state immediately
     }
  };


  const handleResize = (event: React.SyntheticEvent, data: ResizeCallbackData) => {
      if (isDragging || isMaximized) return; // Don't resize if dragging or maximized

      const newSize = { width: data.size.width, height: data.size.height };
      setCurrentSize(newSize);
      // updateSize(id, newSize); // Debounce this if performance is an issue
  };

   const handleResizeStop = (event: React.SyntheticEvent, data: ResizeCallbackData) => {
     if (isDragging || isMaximized) return;
     const finalSize = { width: data.size.width, height: data.size.height };
     updateSize(id, finalSize); // Update parent state with the final size
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
     onMaximize(); // Notify parent to toggle maximized state

      // Apply state changes locally based on the *new* maximized state
     if (!wasMaximized) { // If it *was not* maximized, it *will be* now
       setPreviousSize(currentSize);
       setPreviousPosition(currentPosition);
       const desktop = document.querySelector('.relative.h-full.w-full') as HTMLElement;
       if (desktop) {
         const { offsetWidth, offsetHeight } = desktop;
         const padding = 8;
         const widgetBarHeight = 32; // Actual height of WidgetBar
         const maximizedWidth = offsetWidth - padding;
         const maximizedHeight = offsetHeight - padding - widgetBarHeight;
         const maximizedX = padding / 2;
         const maximizedY = widgetBarHeight + padding / 2;

         setCurrentSize({ width: maximizedWidth, height: maximizedHeight });
         setCurrentPosition({ x: maximizedX, y: maximizedY });
          // Directly update parent state for position too, as maximize changes it
         updatePosition(id, { x: maximizedX, y: maximizedY });
         updateSize(id, { width: maximizedWidth, height: maximizedHeight });
       }
     } else { // If it *was* maximized, it *will be* restored now
       setCurrentSize(previousSize);
       setCurrentPosition(previousPosition);
        // Update parent state back to previous values
       updatePosition(id, previousPosition);
       updateSize(id, previousSize);
     }
   };


  // Conditional styles and classes
   const windowDynamicStyle: React.CSSProperties = {
        zIndex,
        position: 'absolute',
        ...(isMaximized
        ? { // Styles when maximized
            top: '40px', // Below widget bar + padding
            left: '4px', // Account for padding
            width: 'calc(100% - 8px)',
            height: 'calc(100% - 48px)', // Account for padding + widget bar
            transform: 'none', // Override draggable transform
            transition: 'none', // Disable transition when maximized
        }
        : { // Styles when not maximized
            width: `${currentSize.width}px`,
            height: `${currentSize.height}px`,
            top: 0, // Let Draggable handle position via transform
            left: 0,
            transform: `translate(${currentPosition.x}px, ${currentPosition.y}px)`, // Use transform for Draggable
            transition: isDragging ? 'none' : 'width 0.1s ease-out, height 0.1s ease-out', // Transition size only
        }),
    };

  return (
      <Draggable
        nodeRef={nodeRef}
        handle="[data-window-drag-handle='true']"
        position={isMaximized ? {x:0, y:0} : currentPosition} // Draggable controls position ONLY when not maximized
        onStart={handleDragStart}
        onDrag={handleDrag}
        onStop={handleDragStop}
        bounds="parent"
        disabled={isMaximized}
        // Cancel drag if started on a button within the handle
        cancel="button"
      >
        {/* Wrap ResizableBox and its content in the draggable node */}
         <div ref={nodeRef} style={windowDynamicStyle} className="absolute" onMouseDown={handleMouseDown}>
            <ResizableBox
                width={currentSize.width} // Always use currentSize for ResizableBox internal calculations
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
                // Conditionally hide handles or disable resizing
                handle={(handleAxis) => <span className={cn(`react-resizable-handle react-resizable-handle-${handleAxis}`, isMaximized ? 'hidden' : '')} />}
                resizeHandles={isMaximized ? [] : ['se', 's', 'e', 'ne', 'n', 'nw', 'w', 'sw']}
                axis={isMaximized ? 'none' : 'both'} // Explicitly disable resizing axis when maximized
            >
                {/* Title Bar */}
                <div
                    ref={dragHandleRef}
                    className={cn(
                        "h-8 px-2 flex items-center justify-between bg-secondary/50 border-b border-primary/30 select-none",
                        isMaximized ? 'cursor-default' : 'cursor-grab' // Change cursor when maximized
                    )}
                    data-window-drag-handle="true"
                    onDoubleClick={handleMaximizeToggle}
                >
                    <div className="flex items-center gap-2 text-accent text-xs truncate pointer-events-none"> {/* Make text non-interactive for drag */}
                    {React.isValidElement(icon) ? React.cloneElement(icon, { size: 14 } as any) : <Square size={14} className="opacity-50" />}
                    <span className="truncate">{title}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-foreground hover:bg-accent/30 focus:outline-none focus:ring-1 focus:ring-ring" onClick={(e) => { e.stopPropagation(); onMinimize(); }}>
                        <Minimize2 size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-foreground hover:bg-accent/30 focus:outline-none focus:ring-1 focus:ring-ring" onClick={(e) => { e.stopPropagation(); handleMaximizeToggle(); }}>
                        {/* Toggle icon based on maximized state */}
                        {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/30 hover:text-destructive-foreground focus:outline-none focus:ring-1 focus:ring-destructive" onClick={(e) => { e.stopPropagation(); onClose(); }}>
                        <X size={14} />
                    </Button>
                    </div>
                </div>

                {/* Content Area */}
                <div
                    data-window-content="true"
                    className={cn(
                        "flex-grow overflow-auto bg-background text-sm relative", // Added relative positioning
                         isMinimized ? 'hidden' : ''
                    )}
                    // Use custom scrollbar styling defined in globals.css
                >
                    {/* Added an inner div to handle padding, allowing ResizableBox to manage the exact border box */}
                    <div className="p-2 h-full w-full">
                        {children}
                    </div>
                </div>
            </ResizableBox>
        </div>
      </Draggable>
  );
}
