
'use client';

import type { ReactNode } from 'react';
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
import { ScanText, Trash2, Copy, Send, Settings, Bomb, Ghost, RefreshCcw, FolderOpen, Terminal, Pencil, Info } from 'lucide-react';

// Define the structure for an application definition (copied for standalone use)
interface FileSystemItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  extension?: string;
  children?: FileSystemItem[];
  content?: string | (() => string);
  locked?: boolean;
}

interface FileManagerContextMenuProps {
  x: number;
  y: number;
  item: FileSystemItem | null; // The item clicked on, or null for background
  onClose: () => void;
}

export function FileManagerContextMenu({ x, y, item, onClose }: FileManagerContextMenuProps) {
  const { toast } = useToast();

  const handleAction = (action: string, targetItem: FileSystemItem | null) => {
    let title = "Context Action";
    let description = `Action '${action}' triggered`;
    let variant: "default" | "destructive" = "default";
    let showToast = true;

    const itemName = targetItem ? targetItem.name : "the background";
    const itemType = targetItem ? targetItem.type : "background";

    switch (action) {
      case "Open":
        if (itemType === 'folder') {
            title = "Opening Folder";
            description = `Attempting to open ${itemName}... Error: Requires more coffee.`;
            // Ideally, this would trigger navigation if implemented
        } else if (itemType === 'file') {
            title = "Executing File";
            description = `Running ${itemName}... Simulation successful. File is now slightly more confused.`;
            // Ideally, trigger file execution simulation
        } else {
             showToast = false; // No action for background
        }
        break;
      case "Open in Terminal":
         title = "Opening Terminal";
         description = `Navigating terminal to ${itemName}... Command prompt unresponsive. It's probably shy.`;
         // Ideally, open CMD app with path context
        break;
      case "Scan for Viruses":
        title = "Scanning...";
        description = `Scanning ${itemName} for viruses... Found 0 viruses, but 3 existential doubts.`;
        break;
       case "Rename":
         title = "Rename Blocked";
         description = `Cannot rename ${itemName}. File insists on keeping its identity.`;
         break;
       case "Delete":
         title = "Deletion Attempted";
         description = `Trying to delete ${itemName}... File resisted deletion with surprising strength.`;
         variant = "destructive";
         break;
       case "Properties":
         title = `${itemName} Properties`;
         description = `Type: ${itemType}\nSize: ${Math.floor(Math.random() * 1000)} KB (estimated)\nAttributes: Probably H (Hidden), S (Sarcastic)`;
         break;
        case "Create Shortcut":
            title = "Shortcut Creation Failed";
            description = `Cannot create shortcut for ${itemName}. It prefers to be mysterious.`;
            break;
        case "Send To -> Floppy Disk":
            title = "Sending Error";
            description = `Floppy disk drive not found (since 1999). Cannot send ${itemName}.`;
            variant = "destructive";
            break;
        case "Send To -> The Cloud":
            title = "Sending Error";
            description = `Cloud is currently experiencing heavy rainfall. Cannot send ${itemName}.`;
            break;
        case "View": // Background only
            title = "View Options";
            description = "Adjusting view... Icons are now slightly larger and more intimidating.";
            break;
        case "Sort By": // Background only
            title = "Sorting";
            description = "Sorting items by level of sarcasm...";
            break;
        case "Refresh": // Background only
            title = "Refreshing...";
            description = "Desktop refreshed. All pixels accounted for.";
            break;
         case "Paste": // Background only
            title = "Paste Error";
            description = "Clipboard is empty or contains forbidden knowledge. Cannot paste.";
            break;
        case "New Folder": // Background only
            title = "Folder Creation Failed";
            description = "Cannot create new folder. System quota for 'Untitled Folder (N)' exceeded.";
            break;
        case "Display Settings": // Background only
            title = "Display Settings";
            description = "Opening display settings... Resolution set to 'Potato'.";
            // Ideally, open System Settings app
            break;
        case "Personalize": // Background only
            title = "Personalization";
            description = "Applying personalization... Wallpaper set to default error message.";
            break;
        default:
             showToast = false; // Unknown action
    }

    if (showToast) {
        toast({
            title: title,
            description: (
                <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4 text-xs">
                    <code className="text-white whitespace-pre-wrap">{description}</code>
                </pre>
            ),
            variant: variant,
        });
    }
    onClose(); // Close the menu after action
  };

  const isFolder = item?.type === 'folder';
  const isFile = item?.type === 'file';
  const isLocked = item?.locked;

  return (
    <DropdownMenu open={true} onOpenChange={(open) => !open && onClose()}>
        <DropdownMenuContent
          style={{ position: 'absolute', top: `${y}px`, left: `${x}px` }} // Position relative to parent
          className="w-48 text-xs shadow-lg shadow-primary/30 border-primary/50 z-50" // Ensure high z-index
          onInteractOutside={onClose}
          data-context-menu="true" // Identifier to prevent self-closing
        >
            {/* Item-Specific Actions */}
            {item && (
                <>
                    <DropdownMenuItem onClick={() => handleAction('Open', item)} className="cursor-pointer font-bold">
                        <FolderOpen className="mr-2 h-4 w-4" />
                        <span>Open</span>
                    </DropdownMenuItem>
                    {isFolder && (
                        <DropdownMenuItem onClick={() => handleAction('Open in Terminal', item)} className="cursor-pointer">
                            <Terminal className="mr-2 h-4 w-4" />
                             <span>Open in Terminal</span>
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => handleAction('Scan for Viruses', item)} className="cursor-pointer">
                        <ScanText className="mr-2 h-4 w-4 text-accent" />
                        <span>Scan for Viruses...</span>
                    </DropdownMenuItem>
                     <DropdownMenuSeparator />
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <Send className="mr-2 h-4 w-4" />
                            <span>Send to</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="text-xs">
                            <DropdownMenuItem onClick={() => handleAction('Send To -> Floppy Disk', item)} className="cursor-pointer">Floppy Disk (A:)</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction('Send To -> The Cloud', item)} className="cursor-pointer">The Cloud (If it's not raining)</DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
                     <DropdownMenuSeparator />
                     <DropdownMenuItem onClick={() => handleAction('Rename', item)} className="cursor-pointer" disabled={isLocked}>
                        <Pencil className="mr-2 h-4 w-4" />
                        <span>Rename</span>
                     </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAction('Delete', item)} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10" disabled={isLocked}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                    </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => handleAction('Create Shortcut', item)} className="cursor-pointer">
                        <Ghost className="mr-2 h-4 w-4" />
                        <span>Create Shortcut (Good Luck)</span>
                    </DropdownMenuItem>
                     <DropdownMenuSeparator />
                     <DropdownMenuItem onClick={() => handleAction('Properties', item)} className="cursor-pointer">
                         <Info className="mr-2 h-4 w-4" />
                         <span>Properties</span>
                     </DropdownMenuItem>
                </>
            )}

             {/* Background Actions */}
            {!item && (
                <>
                     <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                             <FolderOpen className="mr-2 h-4 w-4" />
                             <span>View</span>
                         </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="text-xs">
                             <DropdownMenuItem onClick={() => handleAction('View', null)} className="cursor-pointer">Large Icons (Intimidating)</DropdownMenuItem>
                             <DropdownMenuItem onClick={() => handleAction('View', null)} className="cursor-pointer">Small Icons (Suspiciously Small)</DropdownMenuItem>
                             <DropdownMenuItem onClick={() => handleAction('View', null)} className="cursor-pointer">Details (Too Much Information)</DropdownMenuItem>
                         </DropdownMenuSubContent>
                     </DropdownMenuSub>
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                             <FolderOpen className="mr-2 h-4 w-4" />
                             <span>Sort by</span>
                         </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="text-xs">
                             <DropdownMenuItem onClick={() => handleAction('Sort By', null)} className="cursor-pointer">Name (Alphabetical Soup)</DropdownMenuItem>
                             <DropdownMenuItem onClick={() => handleAction('Sort By', null)} className="cursor-pointer">Date Modified (Ancient History)</DropdownMenuItem>
                             <DropdownMenuItem onClick={() => handleAction('Sort By', null)} className="cursor-pointer">Sarcasm Level (Descending)</DropdownMenuItem>
                         </DropdownMenuSubContent>
                     </DropdownMenuSub>
                     <DropdownMenuItem onClick={() => handleAction('Refresh', null)} className="cursor-pointer">
                         <RefreshCcw className="mr-2 h-4 w-4" />
                         <span>Refresh</span>
                     </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleAction('Paste', null)} className="cursor-pointer">
                        <Copy className="mr-2 h-4 w-4" />
                        <span>Paste</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAction('New Folder', null)} className="cursor-pointer">
                        <FolderOpen className="mr-2 h-4 w-4 text-accent" />
                        <span>New Folder</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleAction('Display Settings', null)} className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Display Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAction('Personalize', null)} className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Personalize</span>
                    </DropdownMenuItem>

                </>
            )}

        </DropdownMenuContent>
    </DropdownMenu>
  );
}
