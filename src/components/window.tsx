'use client';

import React, { useState, useRef, useCallback, useEffect, type ReactNode, type MouseEvent } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import { ResizableBox, ResizeCallbackData } from 'react-resizable'; // Re-import ResizableBox
import 'react-resizable/css/styles.css'; // Import default resizable styles
import { Button } from '@/components/ui/button';
import { Maximize2, X, Square, Minus, Shrink, GripHorizontal } from 'lucide-react'; // GripHorizontal might work for resize handle
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
  updateSize: (id: number, newSize: { width: number; height: number }) => void;
}

const WIDGET_BAR_HEIGHT = 32; // Height of the WidgetBar
const TASKBAR_HEIGHT = 40; // Height of the Taskbar
const DESKTOP_PADDING = 8; // Padding around the desktop area
const MIN_WIDTH = 250;
const MIN_HEIGHT = 150;

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
  updateSize,
}: WindowProps) {
  const nodeRef = useRef(null);
  const [currentPosition, setCurrentPosition] = useState(position);
  const [currentSize, setCurrentSize] = useState(size);
  const [previousSize, setPreviousSize] = useState(size);
  const [previousPosition, setPreviousPosition] = useState(position);
  const dragHandleRef = useRef<HTMLDivElement>(null);

  // Ensure initial state matches props
  useEffect(() => {
    setCurrentPosition(position);
  }, [position]);

  useEffect(() => {
    setCurrentSize(size);
  }, [size]);

  // Store previous state before maximizing
   useEffect(() => {
        if (isMaximized) {
            // Check if we are transitioning *to* maximized state
            if (currentSize.width !== Infinity) { // Use a proxy check, actual size will be calculated
                setPreviousSize(currentSize);
                setPreviousPosition(currentPosition);
            }
            // Apply maximized dimensions
            const desktop = document.querySelector('.flex-grow.relative.overflow-hidden') as HTMLElement;
            if (desktop) {
                const { offsetWidth, offsetHeight } = desktop;
                const maximizedWidth = offsetWidth - (DESKTOP_PADDING / 2);
                const maximizedHeight = offsetHeight - (DESKTOP_PADDING / 2);
                const maximizedX = DESKTOP_PADDING / 4;
                const maximizedY = DESKTOP_PADDING / 4;
                setCurrentSize({ width: maximizedWidth, height: maximizedHeight });
                setCurrentPosition({ x: maximizedX, y: maximizedY });
            }
        } else {
            // If transitioning *from* maximized state back to normal
            if (previousSize && previousPosition) {
                // Restore only if previous state exists
                 setCurrentSize(previousSize);
                 setCurrentPosition(previousPosition);
                 // Optional: Reset previous state after restoring to avoid accidental restores later?
                 // setPreviousSize(null);
                 // setPreviousPosition(null);
            }
        }
    }, [isMaximized]); // Depend only on isMaximized


  const handleDragStart = (e: DraggableEvent, data: DraggableData) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('.react-resizable-handle')) {
      return false;
    }
    if (!isMaximized) {
      updateWindowDraggingState(id, true);
      bringToFront();
    }
    return undefined;
  };

  const handleDrag = (e: DraggableEvent, data: DraggableData) => {
    if (!isMaximized) {
      setCurrentPosition({ x: data.x, y: data.y });
    }
  };

  const handleDragStop = (e: DraggableEvent, data: DraggableData) => {
    updateWindowDraggingState(id, false);
    if (!isMaximized) {
      const newPosition = { x: data.x, y: data.y };
      // Clamp position - ensure window stays roughly within visible area
      const maxX = window.innerWidth - (DESKTOP_PADDING / 2);
      const maxY = window.innerHeight - WIDGET_BAR_HEIGHT - TASKBAR_HEIGHT - (DESKTOP_PADDING / 2);

      const clampedX = Math.max(DESKTOP_PADDING / 2, Math.min(newPosition.x, maxX - currentSize.width));
      const clampedY = Math.max(DESKTOP_PADDING / 2, Math.min(newPosition.y, maxY - currentSize.height));

      const finalPosition = { x: clampedX, y: clampedY };
      updatePosition(id, finalPosition);
      setCurrentPosition(finalPosition);
    }
  };

  const handleResize = (event: React.SyntheticEvent, { size: newSize }: ResizeCallbackData) => {
    if (!isMaximized) {
      // Prevent resizing beyond viewport boundaries (basic implementation)
       const maxX = window.innerWidth - currentPosition.x - (DESKTOP_PADDING / 2);
       const maxY = window.innerHeight - WIDGET_BAR_HEIGHT - TASKBAR_HEIGHT - currentPosition.y - (DESKTOP_PADDING / 2);

       const clampedWidth = Math.min(newSize.width, maxX);
       const clampedHeight = Math.min(newSize.height, maxY);

       const finalSize = { width: clampedWidth, height: clampedHeight };

      setCurrentSize(finalSize); // Update local state during resize for feedback
    }
  };

   const handleResizeStop = (event: React.SyntheticEvent, { size: finalSize }: ResizeCallbackData) => {
        if (!isMaximized) {
            // Ensure size doesn't go below min constraints after stopping
            const width = Math.max(MIN_WIDTH, finalSize.width);
            const height = Math.max(MIN_HEIGHT, finalSize.height);
             const clampedFinalSize = {width, height};
            setCurrentSize(clampedFinalSize); // Ensure local state is correct
            updateSize(id, clampedFinalSize); // Update parent state
        }
    };


  const handleMouseDown = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    // Also prevent bringToFront if clicking the resize handle area
    if (!target.closest('button') && !target.closest('.react-resizable-handle')) {
      bringToFront();
    }
  };

  const handleMaximizeToggle = () => {
        onMaximize(); // Call parent first to update the isMaximized prop
  };

  // Draggable component style
  const draggableStyle: React.CSSProperties = {
    position: 'absolute',
    zIndex,
    // Position is handled by Draggable's transform
  };

   // ResizableBox style - gets applied to the outer div of ResizableBox
   // We use transform from Draggable, so position is static here relative to Draggable
   const resizableStyle: React.CSSProperties = {
       width: `${isMaximized ? '100%' : currentSize.width}px`,
       height: `${isMaximized ? '100%' : currentSize.height}px`,
       // If maximized, position will be handled by parent logic setting x/y to top-left
       ...(isMaximized && { top: `${DESKTOP_PADDING / 4}px`, left: `${DESKTOP_PADDING / 4}px` }),
       transition: isDragging || isMaximized ? 'none' : 'width 0.1s ease-out, height 0.1s ease-out',
       overflow: 'hidden', // Prevent content spill during resize
   };


  return (
    <Draggable
      nodeRef={nodeRef} // Attach ref here
      handle="[data-window-drag-handle='true']"
      position={currentPosition}
      onStart={handleDragStart}
      onDrag={handleDrag}
      onStop={handleDragStop}
      disabled={isMaximized}
      cancel="button, .react-resizable-handle" // Prevent drag start on buttons and resize handle
    >
        {/* This div is the draggable element */}
      <div ref={nodeRef} style={draggableStyle} onMouseDown={handleMouseDown}>
            <ResizableBox
                width={currentSize.width}
                height={currentSize.height}
                minConstraints={[MIN_WIDTH, MIN_HEIGHT]}
                 // Max constraints based on viewport - adjust as needed
                maxConstraints={[window.innerWidth - (DESKTOP_PADDING), window.innerHeight - WIDGET_BAR_HEIGHT - TASKBAR_HEIGHT - (DESKTOP_PADDING)]}
                onResize={handleResize}
                onResizeStop={handleResizeStop}
                className={cn(
                    "border border-primary/50 bg-card shadow-lg shadow-primary/20 flex flex-col overflow-hidden group",
                    isMaximized ? 'rounded-none !transition-none !transform-none' : 'rounded-sm absolute', // Ensure ResizableBox itself is positioned correctly when not maximized
                    !isMaximized && '!absolute' // Force absolute positioning for ResizableBox when not maximized
                )}
                style={resizableStyle} // Apply size and transition styles here
                draggableOpts={{ enableUserSelectHack: false }}
                handle={<ResizeHandle />} // Custom handle component
                resizeHandles={isMaximized ? [] : ['se']} // Only allow SE resize when not maximized
            >
                {/* Content starts here, nested inside ResizableBox */}
                {/* Title Bar */}
                <div
                    ref={dragHandleRef}
                    className={cn(
                        "h-8 px-2 flex items-center justify-between bg-secondary/50 border-b border-primary/30 select-none shrink-0",
                        isMaximized ? 'cursor-default' : 'cursor-grab'
                    )}
                    data-window-drag-handle="true"
                    onDoubleClick={handleMaximizeToggle}
                    data-no-context="true"
                >
                    <div className="flex items-center gap-2 text-accent text-xs truncate pointer-events-none">
                        {React.isValidElement(icon) ? React.cloneElement(icon, { size: 14 } as any) : <Square size={14} className="opacity-50" />}
                        <span className="truncate">{title}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-foreground hover:bg-accent/30 focus:outline-none focus:ring-1 focus:ring-ring" onClick={(e) => { e.stopPropagation(); onMinimize(); }} data-no-context="true">
                            <Minus size={14} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-foreground hover:bg-accent/30 focus:outline-none focus:ring-1 focus:ring-ring" onClick={(e) => { e.stopPropagation(); handleMaximizeToggle(); }} data-no-context="true">
                            {isMaximized ? <Shrink size={14} /> : <Maximize2 size={14} />}
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
                >
                     {/* Use absolute positioning for content overflow - ensure it fills ResizableBox */}
                    <div className="absolute inset-0 overflow-auto p-1">
                        {children}
                    </div>
                </div>
                 {/* ResizableBox needs its children to be direct for layout,
                     so the handle might need careful positioning or to be passed via `handle` prop */}
                 {/* The visual handle is now provided by the `handle` prop of ResizableBox */}
            </ResizableBox>
      </div>
    </Draggable>
  );
}


// Custom resize handle component
const ResizeHandle = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
    (props, ref) => (
        <span
            ref={ref}
            {...props}
            className={cn(
                "react-resizable-handle react-resizable-handle-se", // Use default classes for functionality
                 // Custom styling for the visual indicator:
                "absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-10", // Ensure handle is on top
                "flex items-end justify-end p-0.5",
                "text-primary/50 hover:text-primary", // Color on hover
                // Add a small visual grip or triangle using SVG or pseudo-elements if desired
                // Example using SVG:
                 '[&>svg]:w-3 [&>svg]:h-3'
            )}
             data-no-context="true" // Prevent context menu on handle
        >
           {/* Simple visual indicator */}
           <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="20" y1="20" x2="14" y2="14"></line>
              <line x1="14" y1="20" x2="20" y2="14"></line>
            </svg>
        </span>
    )
);
ResizeHandle.displayName = 'ResizeHandle';

// Helper to get screen dimensions (consider memoization if needed)
const getScreenDimensions = () => {
    if (typeof window !== 'undefined') {
        return { width: window.innerWidth, height: window.innerHeight };
    }
    return { width: 1920, height: 1080 }; // Default fallback
};
