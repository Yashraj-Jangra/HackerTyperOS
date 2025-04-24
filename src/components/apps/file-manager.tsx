'use client';

import React, { useState } from 'react';
import { Folder, FileText, AlertTriangle, Lock } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from '@/components/ui/scroll-area';

interface FileSystemItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  children?: FileSystemItem[];
  content?: string; // Sarcastic content or error
}

const initialFileSystem: FileSystemItem[] = [
  { id: 'c', name: 'C:', type: 'folder', children: [
    { id: 'c-program', name: 'Program Files', type: 'folder', children: [
      { id: 'c-program-hack', name: 'TotallyLegalHacks', type: 'folder', children: [
        { id: 'hackexe', name: 'hack.exe', type: 'file', content: 'Error 418: I\'m a teapot. Cannot execute.' },
      ]},
      { id: 'c-program-common', name: 'Common Files', type: 'folder', children: [
         { id: 'nothing', name: 'nothing_to_see_here.dll', type: 'file', content: 'Access Denied: This file is shy.' },
      ] },
       { id: 'important', name: 'VeryImportantApp', type: 'folder', children: [
         { id: 'readme', name: 'README.txt', type: 'file', content: 'Instructions: 1. Panic. 2. ??? 3. Profit!' },
      ] },
    ]},
    { id: 'c-windows', name: 'Windows', type: 'folder', children: [
      { id: 'c-windows-system32', name: 'System32', type: 'folder', children: [
        { id: 'hal', name: 'hal.dll', type: 'file', content: 'Warning: Deleting this file might make your computer sentient. Or just break it. Probably break it.' },
        { id: 'cmd', name: 'cmd.exe', type: 'file', content: 'Executing this opens a portal to the 90s.' },
      ]},
      { id: 'temp', name: 'Temp', type: 'folder', children: [
         { id: 'log', name: 'error.log', type: 'file', content: 'Log file full of existential dread and coffee stains.' },
      ]},
    ]},
    { id: 'c-users', name: 'Users', type: 'folder', children: [
      { id: 'c-users-hacker', name: 'Hacker', type: 'folder', children: [
        { id: 'c-users-hacker-desktop', name: 'Desktop', type: 'folder', children: [
          { id: 'notes', name: 'Secret_Plans.txt', type: 'file', content: 'Plan: 1. Hack the Gibson. 2. Order pizza.' },
        ] },
        { id: 'c-users-hacker-docs', name: 'Documents', type: 'folder', children: [
           { id: 'manifesto', name: 'manifesto.docx', type: 'file', content: 'The quick brown fox jumps over the lazy dog. Revolution postponed.' },
        ]},
      ]},
    ]},
    { id: 'c-topsecret', name: 'Top_Secret_Stuff', type: 'folder', children: [
        { id: 'aliens', name: 'alien_autopsy.mp4', type: 'file', content: 'Video Corrupted: Looks like they used protection.' },
        { id: 'password', name: 'passwords.txt', type: 'file', content: 'password123\nadmin\n123456\nSeriously?' },
    ]},
  ]},
   { id: 'd', name: 'D: (USB Drive)', type: 'folder', children: [
      { id: 'memes', name: 'Memes', type: 'folder', children: [
         { id: 'cat', name: 'cat_on_keyboard.gif', type: 'file', content: 'Infinite loop of cuteness detected.' },
      ]},
      { id: 'homework', name: 'Definitely_Not_Homework', type: 'folder', children: [
          { id: 'calc', name: 'Calculator_Backup.exe', type: 'file', content: 'Just a normal calculator. Totally.' },
      ]},
   ]},
];

export function FileManager() {
  const [currentPath, setCurrentPath] = useState<string[]>(['c']);
  const [currentFiles, setCurrentFiles] = useState<FileSystemItem[]>(initialFileSystem);
  const { toast } = useToast();

  const navigateTo = (pathSegments: string[]) => {
    let currentLevel = initialFileSystem;
    try {
        for (let i = 0; i < pathSegments.length; i++) {
          const segmentId = pathSegments[i];
          const found = currentLevel.find(item => item.id === segmentId && item.type === 'folder');
          if (found && found.children) {
            currentLevel = found.children;
          } else if (i === pathSegments.length -1 && found ) { // Landed on the folder itself
             currentLevel = found.children || [];
          }
           else {
            throw new Error("Path not found or is not a directory.");
          }
        }
        setCurrentPath(pathSegments);
        setCurrentFiles(currentLevel);
    } catch (error: any) {
        toast({
            title: "Navigation Error",
            description: error.message || "Could not navigate to the specified path.",
            variant: "destructive",
        });
        // Optionally reset to root or previous valid path
         // setCurrentPath(['c']);
         // setCurrentFiles(initialFileSystem.find(i => i.id === 'c')?.children || []);
    }
  };

  const goUp = () => {
    if (currentPath.length > 1) {
      const newPath = currentPath.slice(0, -1);
      navigateTo(newPath);
    } else {
      // Already at root, maybe display root drives again
      setCurrentPath([]);
      setCurrentFiles(initialFileSystem);
    }
  };

   const handleItemClick = (item: FileSystemItem) => {
    if (item.type === 'folder') {
      navigateTo([...currentPath, item.id]);
    } else {
      // 'Execute' file
      toast({
        title: `Executing ${item.name}`,
        description: (
          <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
            <code className="text-white">{item.content || 'Error: File is emptier than my wallet.'}</code>
          </pre>
        ),
        variant: item.content?.toLowerCase().includes('error') || item.content?.toLowerCase().includes('warning') || item.content?.toLowerCase().includes('denied') ? "destructive" : "default",
      });
    }
  };

  const getCurrentFolderName = () => {
    if (currentPath.length === 0) return "My Computer";
     let currentLevel: FileSystemItem[] | undefined = initialFileSystem;
     let folderName = "My Computer";
     for (const segmentId of currentPath) {
        const found = currentLevel?.find(item => item.id === segmentId);
        if (found) {
            folderName = found.name;
            currentLevel = found.children;
        } else {
            return "Unknown Path"; // Should not happen if navigation is correct
        }
     }
     return folderName;
  }

  const getPathString = () => {
     if (currentPath.length === 0) return "> My Computer";
     let pathStr = "";
     let currentLevel: FileSystemItem[] | undefined = initialFileSystem;
      for (const segmentId of currentPath) {
        const found = currentLevel?.find(item => item.id === segmentId);
        if (found) {
            pathStr += `${found.name}\\`;
            currentLevel = found.children;
        } else {
            break;
        }
     }
     return `> ${pathStr}`;
  }

  return (
    <div className="h-full flex flex-col text-foreground text-xs">
      {/* Toolbar */}
      <div className="p-1 border-b border-primary/30 flex items-center space-x-2 select-none">
        <button onClick={goUp} disabled={currentPath.length <= 1 && currentFiles === initialFileSystem} className="hover:text-accent disabled:opacity-50 disabled:cursor-not-allowed">
          &uarr; Up
        </button>
        <span className="text-muted-foreground flex-grow truncate" title={getPathString()}>{getPathString()}</span>
      </div>

      {/* File Area */}
      <ScrollArea className="flex-grow p-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {currentFiles.map((item) => (
            <div
              key={item.id}
              className="p-2 flex flex-col items-center text-center rounded cursor-pointer hover:bg-secondary/50 border border-transparent hover:border-accent/50 transition-colors duration-150 select-none"
              onClick={() => handleItemClick(item)}
              title={item.name}
            >
              {item.type === 'folder' ? (
                 item.name.toLowerCase().includes('secret') || item.name.toLowerCase().includes('system32') ? <Lock size={24} className="mb-1 text-destructive" /> : <Folder size={24} className="mb-1 text-accent" />
              ) : (
                item.name.toLowerCase().includes('error') || item.name.toLowerCase().includes('.dll') ? <AlertTriangle size={24} className="mb-1 text-destructive" /> : <FileText size={24} className="mb-1" />
              )}
              <span className="text-[10px] leading-tight break-words w-full truncate">{item.name}</span>
            </div>
          ))}
           {currentFiles.length === 0 && (
             <div className="col-span-full text-center text-muted-foreground italic p-4">
                 This folder is emptier than a politician's promises.
             </div>
            )}
        </div>
      </ScrollArea>

       {/* Status Bar */}
      <div className="p-1 border-t border-primary/30 text-muted-foreground text-[10px] flex justify-between">
         <span>{currentFiles.length} object(s)</span>
         <span>{getCurrentFolderName()}</span>
       </div>
    </div>
  );
}
