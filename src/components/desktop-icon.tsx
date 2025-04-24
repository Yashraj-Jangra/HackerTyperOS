'use client';

import React, { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

// Define the structure for an application definition
export interface AppDefinition {
  id: string; // Unique identifier for the app type
  title: string;
  icon: ReactNode;
  component: ReactNode; // The actual component to render in the window
  initialSize?: { width: number; height: number };
}


interface DesktopIconProps {
  icon: ReactNode;
  title: string;
  onOpen: () => void; // Callback to open the application window
}

export function DesktopIcon({ icon, title, onOpen }: DesktopIconProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center w-20 h-24 p-2 rounded",
        "cursor-pointer select-none group",
        "hover:bg-accent/20 focus:bg-accent/30 focus:outline-none focus:ring-1 focus:ring-accent",
        "transition-colors duration-150"
      )}
      onClick={onOpen}
      onDoubleClick={onOpen} // Common UX: double click opens
      tabIndex={0} // Make it focusable
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpen(); }}
      title={title} // Tooltip for longer names
       data-no-context="true" // Prevent desktop context menu from opening on icons
    >
      <div className="mb-1 text-primary group-hover:scale-110 transition-transform duration-150">
        {/* Ensure icon container respects size */}
        <div className="w-8 h-8 flex items-center justify-center">{icon}</div>
      </div>
      <span className="text-xs text-foreground leading-tight break-words max-w-full line-clamp-2 group-hover:text-accent">
        {title}
      </span>
    </div>
  );
}
