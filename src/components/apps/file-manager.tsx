
'use client';

import React, { useState } from 'react';
import { Folder, FileText, AlertTriangle, Lock, FileCode, FileImage, FileVideo, FileArchive, Binary, ArrowUpLeftFromCircle, Home } from 'lucide-react'; // Added more specific icons
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileSystemItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  extension?: string; // For file-specific icons/actions
  children?: FileSystemItem[];
  content?: string | (() => string); // Sarcastic content or error, can be a function for dynamic messages
  locked?: boolean; // For special folders like System32
}

const generateSarcasticContent = (itemName: string): string => {
  const messages = [
    `Error 404: Content not found. Probably borrowed by gnomes.`,
    `Access Denied. Reason: File is currently contemplating the meaning of its existence.`,
    `File corrupted. Seems like it caught a digital cold.`,
    `Executing ${itemName}... resulted in spontaneous unicorn manifestation. System confused.`,
    `This file contains the secret recipe for perpetual motion... or maybe just lorem ipsum.`,
    `Warning: Opening this may cause your screen to display only cat memes.`,
    `Content is classified. You need level 1337 clearance (or a bribe of cookies).`,
    `File is empty. Like, existentially empty.`,
    `Simulation Error: File decided to become a folder. Please wait while we sort this identity crisis.`
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

const initialFileSystem: FileSystemItem = {
    id: 'root', name: 'Computer', type: 'folder', children: [
        { id: 'c', name: 'Local Disk (C:)', type: 'folder', children: [
            { id: 'c-program', name: 'Program Files', type: 'folder', children: [
            { id: 'c-program-hack', name: 'TotallyLegalHacks', type: 'folder', children: [
                { id: 'hackexe', name: 'hack.exe', type: 'file', extension: 'exe', content: 'Executing hack.exe... Error 418: I\'m a teapot. Cannot execute.' },
                { id: 'keylogger', name: 'DefinitelyNotAKeylogger.exe', type: 'file', extension: 'exe', content: 'Keylogger active... Just kidding! Or am I? 👀' },
            ]},
            { id: 'c-program-common', name: 'Common Files', type: 'folder', children: [
                { id: 'nothing', name: 'nothing_to_see_here.dll', type: 'file', extension: 'dll', content: 'Access Denied: This .dll file is too dynamic link library-y for you.' },
            ] },
            { id: 'important', name: 'VeryImportantApp', type: 'folder', children: [
                { id: 'readme', name: 'README.txt', type: 'file', extension: 'txt', content: 'Instructions: 1. Panic. 2. ??? 3. Profit!' },
                { id: 'config', name: 'config.sys', type: 'file', extension: 'sys', content: 'System configuration: Engage ludicrous speed? (Y/N) ... Defaulting to N.' },
            ] },
            { id: 'game', name: 'RetroGame', type: 'folder', children: [
                { id: 'doom', name: 'DOOM.wad', type: 'file', extension: 'wad', content: 'Loading WAD... Cannot find BFG9000.wad. Aborting.'}
            ]}
            ]},
            { id: 'c-windows', name: 'Windows', type: 'folder', locked: true, children: [
            { id: 'c-windows-system32', name: 'System32', type: 'folder', locked: true, children: [
                { id: 'hal', name: 'hal.dll', type: 'file', extension: 'dll', content: 'Warning: Deleting this file might make your computer sentient. Or just break it. Probably break it.' },
                { id: 'cmd', name: 'cmd.exe', type: 'file', extension: 'exe', content: 'Executing this opens a portal to the command-line dimension.' },
                { id: 'drivers', name: 'drivers', type: 'folder', children: [
                     { id: 'beep', name: 'beep.sys', type: 'file', extension: 'sys', content: 'BEEP BEEP! Driver working as intended.'}
                ]},
            ]},
            { id: 'temp', name: 'Temp', type: 'folder', children: [
                { id: 'log', name: 'error.log', type: 'file', extension: 'log', content: () => `Log file full of existential dread, coffee stains, and ${Math.floor(Math.random() * 1000)} temporary regrets.` },
                { id: 'cookies', name: 'cookies.dat', type: 'file', extension: 'dat', content: 'Contains digital cookie crumbs. Not edible.' },
            ]},
            ]},
            { id: 'c-users', name: 'Users', type: 'folder', children: [
            { id: 'c-users-hacker', name: 'Hacker', type: 'folder', children: [
                { id: 'c-users-hacker-desktop', name: 'Desktop', type: 'folder', children: [
                { id: 'notes', name: 'Secret_Plans.txt', type: 'file', extension: 'txt', content: 'Plan: 1. Hack the Gibson. 2. Order pizza. 3. Nap.' },
                { id: 'screenshot', name: 'weird_glitch.png', type: 'file', extension: 'png', content: 'Displaying weird_glitch.png... Image is just a picture of a loading icon.'}
                ] },
                { id: 'c-users-hacker-docs', name: 'Documents', type: 'folder', children: [
                { id: 'manifesto', name: 'manifesto.docx', type: 'file', extension: 'docx', content: 'The quick brown fox jumps over the lazy dog. Revolution postponed due to snack break.' },
                 { id: 'shopping', name: 'shopping_list.txt', type: 'file', extension: 'txt', content: '- Infinite RAM\n- Coffee\n- Rubber chicken'}
                ]},
                { id: 'c-users-hacker-downloads', name: 'Downloads', type: 'folder', children: [
                     { id: 'installer', name: 'setup.exe', type: 'file', extension: 'exe', content: 'Running setup... Installing Clippy assistant... Installation failed successfully.' },
                     { id: 'important_zip', name: 'important_stuff.zip', type: 'file', extension: 'zip', content: 'Extracting important_stuff.zip... Contains only glitter bombs and a note saying "You\'ve been pranked!"' },
                     { id: 'video', name: 'cat_on_keyboard.mp4', type: 'file', extension: 'mp4', content: 'Playing cat_on_keyboard.mp4... Buffering... Buffering... Connection lost to reality.'}
                ]},
            ]},
             { id: 'public', name: 'Public', type: 'folder', children: [
                { id: 'shared', name: 'shared_document.txt', type: 'file', extension: 'txt', content: 'This document is shared. Please do not edit. (Last edited: yesterday)'}
            ]},
            ]},
            { id: 'c-topsecret', name: 'Top_Secret_Stuff', type: 'folder', locked: true, children: [
                { id: 'aliens', name: 'alien_autopsy.mp4', type: 'file', extension: 'mp4', content: 'Video Corrupted: Looks like they used protection. Or maybe the file is just shy.' },
                { id: 'password', name: 'passwords.txt', type: 'file', extension: 'txt', content: 'password123\nadmin\n123456\nhunter2\n<font color="red">SECURITY BREACH IMMINENT!</font>' },
                { id: 'conspiracy', name: 'the_truth.pdf', type: 'file', extension: 'pdf', content: 'Error: PDF reader not installed. The truth remains elusive.'}
            ]},
        ]},
        { id: 'd', name: 'USB Drive (D:)', type: 'folder', children: [
            { id: 'memes', name: 'Memes', type: 'folder', children: [
                { id: 'catgif', name: 'cat_riding_unicorn.gif', type: 'file', extension: 'gif', content: 'Displaying GIF... The majesty is overwhelming the rendering engine.' },
                { id: 'doge', name: 'doge.png', type: 'file', extension: 'png', content: 'Wow. Such image. Much pixels.' },
            ]},
            { id: 'homework', name: 'Definitely_Not_Homework', type: 'folder', children: [
                { id: 'calc', name: 'Calculator_Backup.exe', type: 'file', extension: 'exe', content: 'Just a normal calculator. Totally. Promise. Does advanced quantum physics calculations on the side.' },
                { id: 'essay', name: 'final_essay.docx', type: 'file', extension: 'docx', content: 'Document appears to be corrupted by procrastination.'}
            ]},
            { id: 'autorun', name: 'autorun.inf', type: 'file', extension: 'inf', content: '[Autorun]\nopen=launch_surprise.exe\nlabel=Mystery Drive\n; Don\'t worry, launch_surprise.exe doesn\'t actually exist.'}
        ]},
    ]
};


export function FileManager() {
  const [history, setHistory] = useState<string[][]>([['root']]); // Store history of paths (arrays of IDs)
  const [currentPathIndex, setCurrentPathIndex] = useState(0);
  const { toast } = useToast();

  const getCurrentItems = () => {
    const currentPath = history[currentPathIndex];
    let currentLevel: FileSystemItem | undefined = initialFileSystem;
    try {
      // Start from root, skip the 'root' ID itself if present
      const pathSegments = currentPath[0] === 'root' ? currentPath.slice(1) : currentPath;

      for (const segmentId of pathSegments) {
        if (!currentLevel || !currentLevel.children) {
           throw new Error("Invalid path segment encountered.");
        }
        const found = currentLevel.children.find(item => item.id === segmentId);
        if (found && found.type === 'folder') {
          currentLevel = found;
        } else {
           throw new Error(`Path segment '${segmentId}' not found or is not a directory.`);
        }
      }
      return currentLevel?.children || []; // Return children of the final folder in the path
    } catch (error: any) {
      console.error("Error getting current items:", error);
      toast({
        title: "Navigation Error",
        description: "Lost in the file system. Returning to root.",
        variant: "destructive",
      });
      // Reset to root if error occurs
      setHistory([['root']]);
      setCurrentPathIndex(0);
      return initialFileSystem.children || [];
    }
  };

  const currentFiles = getCurrentItems();

  const navigateTo = (folderId: string) => {
    const newPath = [...history[currentPathIndex], folderId];
    const newHistory = history.slice(0, currentPathIndex + 1); // Trim future history
    setHistory([...newHistory, newPath]);
    setCurrentPathIndex(newHistory.length); // Point to the new path
  };

  const goBack = () => {
    if (currentPathIndex > 0) {
      setCurrentPathIndex(prev => prev - 1);
    }
  };

  const goForward = () => {
     if (currentPathIndex < history.length - 1) {
      setCurrentPathIndex(prev => prev + 1);
    }
  };

    const goToRoot = () => {
        const rootPath = ['root'];
         if (JSON.stringify(history[currentPathIndex]) !== JSON.stringify(rootPath)) {
            const newHistory = history.slice(0, currentPathIndex + 1); // Trim future history
             setHistory([...newHistory, rootPath]);
             setCurrentPathIndex(newHistory.length); // Point to the new path
         }
    }


  const handleItemClick = (item: FileSystemItem) => {
    if (item.type === 'folder') {
      navigateTo(item.id);
    } else {
      // 'Execute' file
      let description = '';
      if (typeof item.content === 'function') {
        description = item.content();
      } else {
        description = item.content || generateSarcasticContent(item.name);
      }

      toast({
        title: item.locked ? `Accessing ${item.name} cautiously...` : `Interacting with ${item.name}`,
        description: (
          <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4 text-xs">
            <code className="text-white">{description}</code>
          </pre>
        ),
        variant: description.toLowerCase().includes('error') || description.toLowerCase().includes('warning') || description.toLowerCase().includes('denied') || description.toLowerCase().includes('failed') || description.toLowerCase().includes('breach') ? "destructive" : "default",
      });
    }
  };

    const getIconForItem = (item: FileSystemItem): React.ReactNode => {
        if (item.type === 'folder') {
            return item.locked ? <Lock size={24} className="mb-1 text-destructive" /> : <Folder size={24} className="mb-1 text-accent" />;
        }
        // File icons based on extension
        switch (item.extension) {
            case 'txt':
            case 'log':
            case 'inf':
            case 'md':
            case 'docx':
            case 'pdf':
                return <FileText size={24} className="mb-1" />;
            case 'exe':
            case 'bat':
                 return <Binary size={24} className="mb-1 text-green-400" />;
            case 'dll':
            case 'sys':
                return <FileCode size={24} className="mb-1 text-cyan-400" />;
            case 'png':
            case 'jpg':
            case 'jpeg':
            case 'gif':
                return <FileImage size={24} className="mb-1 text-purple-400" />;
             case 'mp4':
             case 'avi':
             case 'mov':
                return <FileVideo size={24} className="mb-1 text-orange-400" />;
             case 'zip':
             case 'rar':
             case '7z':
             case 'wad': // Treat WAD like an archive for fun
                 return <FileArchive size={24} className="mb-1 text-yellow-400" />;
            case 'dat':
                 return <AlertTriangle size={24} className="mb-1 text-yellow-500" />; // Data files can be suspicious
            default:
                return <FileText size={24} className="mb-1 text-muted-foreground" />; // Default file icon
        }
    }

    const getCurrentFolderName = () => {
        const currentPath = history[currentPathIndex];
        if (currentPath.length === 0 || (currentPath.length === 1 && currentPath[0] === 'root')) return "Computer";

        let currentLevel: FileSystemItem | undefined = initialFileSystem;
        let folderName = "Computer";
         // Start from root, skip the 'root' ID itself if present
        const pathSegments = currentPath[0] === 'root' ? currentPath.slice(1) : currentPath;

        for (const segmentId of pathSegments) {
             if (!currentLevel || !currentLevel.children) break;
             const found = currentLevel.children.find(item => item.id === segmentId);
             if (found) {
                 folderName = found.name;
                 currentLevel = found;
             } else {
                return "Unknown Path"; // Should not happen
             }
        }
        return folderName;
    }

    const getPathString = () => {
        const currentPath = history[currentPathIndex];
        if (currentPath.length === 0 || (currentPath.length === 1 && currentPath[0] === 'root')) return "Computer";

        let pathStr = "";
        let currentLevel: FileSystemItem | undefined = initialFileSystem;
        const pathSegments = currentPath[0] === 'root' ? currentPath.slice(1) : currentPath;

        for (const segmentId of pathSegments) {
             if (!currentLevel || !currentLevel.children) break;
            const found = currentLevel.children.find(item => item.id === segmentId);
            if (found) {
                pathStr += `${found.name}\\`;
                currentLevel = found;
            } else {
                break;
            }
        }
        return `Computer\\${pathStr}`;
    }

  return (
    <div className="h-full flex flex-col text-foreground text-xs">
      {/* Toolbar */}
      <div className="p-1 border-b border-primary/30 flex items-center space-x-1 select-none shrink-0">
        <Button variant="ghost" size="icon" onClick={goBack} disabled={currentPathIndex === 0} className="h-6 w-6 disabled:opacity-50 disabled:cursor-not-allowed hover:text-accent">
          <ArrowUpLeftFromCircle size={14} className="rotate-[-90deg]" />
           <span className="sr-only">Back</span>
        </Button>
         <Button variant="ghost" size="icon" onClick={goForward} disabled={currentPathIndex >= history.length - 1} className="h-6 w-6 disabled:opacity-50 disabled:cursor-not-allowed hover:text-accent">
            <ArrowUpLeftFromCircle size={14} className="rotate-[90deg]" />
             <span className="sr-only">Forward</span>
         </Button>
         <Button variant="ghost" size="icon" onClick={goToRoot} disabled={currentPathIndex === 0 && history[0]?.[0] === 'root'} className="h-6 w-6 disabled:opacity-50 disabled:cursor-not-allowed hover:text-accent">
             <Home size={14} />
              <span className="sr-only">Go to Root</span>
         </Button>
        <span className="text-muted-foreground flex-grow truncate px-2" title={getPathString()}>{getPathString()}</span>
      </div>

      {/* File Area */}
      <ScrollArea className="flex-grow p-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {currentFiles.map((item) => (
            <div
              key={item.id}
              className={cn(
                "p-2 flex flex-col items-center text-center rounded cursor-pointer hover:bg-secondary/50 border border-transparent hover:border-accent/50 transition-colors duration-150 select-none h-20 justify-between",
                 item.locked ? "border-destructive/30 hover:border-destructive" : ""
              )}
              onClick={() => handleItemClick(item)}
              title={item.name}
            >
             <div className="flex-shrink-0">{getIconForItem(item)}</div>
              <span className="text-[10px] leading-tight break-words w-full line-clamp-2">{item.name}</span>
            </div>
          ))}
           {currentFiles.length === 0 && (
             <div className="col-span-full text-center text-muted-foreground italic p-4">
                 This folder is suspiciously empty... What are you hiding?
             </div>
            )}
        </div>
      </ScrollArea>

       {/* Status Bar */}
      <div className="p-1 border-t border-primary/30 text-muted-foreground text-[10px] flex justify-between shrink-0">
         <span>{currentFiles.length} object(s)</span>
         <span>{getCurrentFolderName()}</span>
       </div>
    </div>
  );
}

    