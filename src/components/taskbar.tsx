'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Minimize2, Maximize2, X, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WindowInfo {
  id: number;
  title: string;
  icon?: React.ReactNode;
  minimized: boolean;
  zIndex: number;
}

interface TaskbarProps {
  windows: WindowInfo[];
  onTaskbarItemClick: (id: number) => void;
  activeWindowId: number | null;
  minimizeWindow: (id: number) => void;
  closeWindow: (id: number) => void;
  maximizeWindow: (id: number) => void; // Pass maximize function
   'data-no-context'?: boolean; // Allow passing data attributes
}

export function Taskbar({
  windows,
  onTaskbarItemClick,
  activeWindowId,
  minimizeWindow,
  closeWindow,
  maximizeWindow,
  ...props
}: TaskbarProps) {

  const handleItemClick = (id: number, isMinimized: boolean) => {
     if (!isMinimized && id === activeWindowId) {
        minimizeWindow(id);
     } else {
        onTaskbarItemClick(id); // Bring to front (and unminimize if needed)
     }
  }

  return (
    <div
      className="h-10 bg-card border-t border-primary/50 text-foreground text-xs px-2 flex items-center space-x-1 overflow-x-auto shrink-0"
      {...props} // Spread any additional props like data-no-context
    >
      {/* Start Menu Button Placeholder */}
      <Button
        variant="ghost"
        className="h-8 px-2 bg-primary/10 hover:bg-primary/30 text-primary font-bold flex items-center gap-1 glitch-effect"
         data-no-context="true"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
        <span>Start</span>
      </Button>

       {/* Separator */}
        <div className="h-6 w-px bg-border mx-1"></div>

      {/* Running Applications */}
      {windows.map((win) => (
        <Button
          key={win.id}
          variant="ghost"
          className={cn(
            "h-8 px-2 flex items-center gap-1.5 text-left truncate max-w-xs relative group",
            win.id === activeWindowId ? 'bg-accent/30 text-accent-foreground' : 'hover:bg-secondary/50',
            win.minimized ? 'opacity-70 border-b-2 border-primary/50' : 'border-b-2 border-transparent',
            win.id === activeWindowId && !win.minimized ? 'border-b-primary' : ''
          )}
          onClick={() => handleItemClick(win.id, win.minimized)}
          title={win.title}
           data-no-context="true"
        >
           {React.isValidElement(win.icon) ? React.cloneElement(win.icon, { size: 14 } as any) : <Square size={14} className="opacity-50" />}
          <span className="truncate text-xs">{win.title}</span>

           {/* Hover buttons - Visible on group hover */}
          {/* <div className="absolute top-0 right-0 h-full flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-gradient-to-l from-card via-card/80 to-transparent pl-4 pr-1">
              <Button variant="ghost" size="icon" className="h-5 w-5 text-foreground hover:bg-accent/30" onClick={(e) => { e.stopPropagation(); minimizeWindow(win.id); }}> <Minimize2 size={12} /> </Button>
              <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive hover:bg-destructive/30" onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }}> <X size={12} /> </Button>
          </div> */}

        </Button>
      ))}
    </div>
  );
}

    