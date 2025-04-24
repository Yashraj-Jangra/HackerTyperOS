'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Minimize2, Maximize2, X, Square, ChevronsRightLeft } from 'lucide-react'; // Use ChevronsRightLeft for minimize restore
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast'; // Import useToast

interface WindowInfo {
  id: number;
  title: string;
  icon?: React.ReactNode;
  minimized: boolean;
  zIndex: number;
  isMaximized: boolean; // Need this to show correct icon
}

interface TaskbarProps {
  windows: WindowInfo[];
  onTaskbarItemClick: (id: number) => void;
  activeWindowId: number | null;
  minimizeWindow: (id: number) => void;
  closeWindow: (id: number) => void;
  maximizeWindow: (id: number) => void;
   'data-no-context'?: boolean;
}

export function Taskbar({
  windows,
  onTaskbarItemClick,
  activeWindowId,
  minimizeWindow,
  closeWindow,
  maximizeWindow, // Maximize needed for restore functionality
  ...props
}: TaskbarProps) {
    const { toast } = useToast(); // Get toast function

  const handleItemClick = (id: number, isMinimized: boolean) => {
     // If clicking the active, non-minimized window, minimize it
     if (!isMinimized && id === activeWindowId) {
        minimizeWindow(id);
     } else {
         // Otherwise, bring to front (which also un-minimizes)
        onTaskbarItemClick(id);
     }
  }

    const handleStartClick = () => {
        toast({
            title: "Start Menu Clicked",
            description: "Nothing to see here... yet. System is still booting... since 1999.",
            variant: "default",
        });
    }

  return (
    <div
      className="h-10 bg-card border-t border-primary/50 text-foreground text-xs px-2 flex items-center space-x-1 overflow-x-auto shrink-0"
      {...props}
    >
      {/* Start Menu Button Placeholder */}
      <Button
        variant="ghost"
        className="h-8 px-2 bg-primary/10 hover:bg-primary/30 text-primary font-bold flex items-center gap-1 glitch-effect shrink-0" // Added shrink-0
         data-no-context="true"
         onClick={handleStartClick} // Added onClick handler
         title="Start (Does Nothing Yet)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
        <span>Start</span>
      </Button>

       {/* Separator */}
        <div className="h-6 w-px bg-border mx-1 shrink-0"></div>

      {/* Running Applications */}
      <div className="flex-grow flex items-center space-x-1 overflow-hidden"> {/* Allow buttons to take space */}
            {windows.map((win) => (
                <div key={win.id} className="relative group shrink-0 max-w-[150px]"> {/* Wrapper for hover effect */}
                <Button
                    variant="ghost"
                    className={cn(
                    "h-8 px-2 flex items-center gap-1.5 text-left truncate w-full justify-start", // Ensure button fills wrapper, justify start
                    win.id === activeWindowId ? 'bg-accent/30 text-accent-foreground' : 'hover:bg-secondary/50',
                    win.minimized ? 'opacity-70 border-b-2 border-primary/50' : 'border-b-2 border-transparent',
                    win.id === activeWindowId && !win.minimized ? 'border-b-primary' : ''
                    )}
                    onClick={() => handleItemClick(win.id, win.minimized)}
                    title={win.title}
                    data-no-context="true"
                >
                    {React.isValidElement(win.icon) ? React.cloneElement(win.icon, { size: 14 } as any) : <Square size={14} className="opacity-50" />}
                    <span className="truncate text-xs flex-grow">{win.title}</span> {/* Ensure text truncates */}

                </Button>
                 {/* Hover Close Button */}
                 <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1/2 right-1 transform -translate-y-1/2 h-5 w-5 text-destructive opacity-0 group-hover:opacity-100 hover:bg-destructive/30 focus:opacity-100 transition-opacity duration-150 z-10"
                    onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }}
                    title={`Close ${win.title}`}
                     data-no-context="true"
                >
                    <X size={12} />
                </Button>
                </div>
            ))}
        </div>

         {/* Clock or System Icons (Optional, could add later) */}
        <div className="flex items-center space-x-2 shrink-0 ml-auto">
             {/* Example: <Clock size={14}/> */}
        </div>
    </div>
  );
}