'use client';

import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { ScanText, Trash2, Copy, Send, Settings, Bomb, Ghost, RefreshCcw } from 'lucide-react'; // Using available icons


interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
}

export function ContextMenu({ x, y, onClose }: ContextMenuProps) {
  const { toast } = useToast();

  const handleAction = (action: string) => {
    let title = "Action Triggered";
    let description = `You clicked: ${action}`;
    let variant: "default" | "destructive" = "default";

    switch (action) {
      case "Hack this":
        title = "Hack Attempt";
        description = "Initiating quantum entanglement hack... Failed! Target is too mundane.";
        variant = "destructive";
        break;
      case "Send to Narnia":
        title = "Sending File...";
        description = "Error: Wardrobe not found. File remains stubbornly here.";
        break;
       case "Analyze with AI":
         title = "AI Analysis";
         description = "AI reports: 'It appears to be... data. Fascinating.'";
         break;
      case "Delete Permanently (Maybe)":
         title = "Deleting File";
         description = "File sent to the void. Or maybe just the recycle bin. Who knows?";
         variant = "destructive";
         break;
      case "Refresh Desktop":
        title = "Refreshing...";
        description = "Shuffling icons vigorously. Hope you like the new arrangement!";
        break;
      case "System Settings":
         title = "Settings";
         description = "Access Denied: Settings are scared of you.";
         break;
       case "Summon Glitch":
         title = "Glitch Summoned!";
         description = "Reality destabilization initiated. Enjoy the chaos!";
         // Trigger a visual glitch - maybe add a temporary class to body
         document.body.classList.add('glitch-effect');
         setTimeout(() => document.body.classList.remove('glitch-effect'), 1500);
         break;
    }

    toast({
      title: title,
      description: description,
      variant: variant,
    });
    onClose(); // Close the menu after action
  };

  // Note: DropdownMenuContent needs to be wrapped in DropdownMenu for context
  // But here we manually position it. This might need adjustments based on ShadCN updates.
  // A simpler approach might be to use a basic absolutely positioned div.
  // Using DropdownMenuContent for styling consistency.

  return (
    // Wrap with DropdownMenu to provide context, but trigger is manual
    <DropdownMenu open={true} onOpenChange={(open) => !open && onClose()}>
        <DropdownMenuContent
          style={{ position: 'fixed', top: `${y}px`, left: `${x}px` }}
          className="w-48 text-xs shadow-lg shadow-primary/30 border-primary/50"
          onInteractOutside={onClose} // Close when clicking outside
           data-no-context="true" // Prevent desktop context menu from opening on this
        >
            <DropdownMenuItem onClick={() => handleAction('Hack this')} className="cursor-pointer">
                <Bomb className="mr-2 h-4 w-4 text-destructive" />
                <span>Hack this...</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction('Analyze with AI')} className="cursor-pointer">
                <ScanText className="mr-2 h-4 w-4 text-accent" />
                <span>Analyze with AI</span>
            </DropdownMenuItem>
             <DropdownMenuItem onClick={() => handleAction('Copy Location')} className="cursor-pointer">
                <Copy className="mr-2 h-4 w-4" />
                <span>Copy Location</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
             <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                     <Send className="mr-2 h-4 w-4" />
                    <span>Send to...</span>
                </DropdownMenuSubTrigger>
                 <DropdownMenuSubContent className="text-xs">
                    <DropdownMenuItem onClick={() => handleAction('Send to Narnia')} className="cursor-pointer">The Void</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAction('Send to Recycle Bin')} className="cursor-pointer">Recycle Bin (Maybe)</DropdownMenuItem>
                     <DropdownMenuItem onClick={() => handleAction('Send to The Past')} className="cursor-pointer">The Past (Requires Flux Capacitor)</DropdownMenuItem>
                 </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleAction('Delete Permanently (Maybe)')} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete Permanently</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
             <DropdownMenuItem onClick={() => handleAction('Refresh Desktop')} className="cursor-pointer">
                 <RefreshCcw className="mr-2 h-4 w-4" />
                <span>Refresh Desktop</span>
             </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction('Summon Glitch')} className="cursor-pointer">
                <Ghost className="mr-2 h-4 w-4" />
                <span>Summon Glitch</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction('System Settings')} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>System Settings</span>
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
  );
}
