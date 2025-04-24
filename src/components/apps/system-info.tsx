'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HardDrive, Cpu, MemoryStick, Wifi, ShieldCheck, Bug, Info } from 'lucide-react'; // Added Info icon
import { cn } from '@/lib/utils';

interface SystemDetail {
    icon: React.ReactNode;
    label: string;
    value: string | React.ReactNode; // Allow ReactNode for dynamic values
    sarcasmLevel?: 'low' | 'medium' | 'high' | 'critical';
}

const initialSystemInfo: SystemDetail[] = [
    { icon: <HardDrive size={16}/>, label: "Operating System", value: "HackerTyper OS (Definitely Not Linux)" },
    { icon: <Cpu size={16}/>, label: "Processor", value: "1.21 Giga-Whats Potato Core" },
    { icon: <MemoryStick size={16}/>, label: "Installed RAM", value: "16 GB (8GB Real, 8GB Downloaded)" },
    { icon: <HardDrive size={16}/>, label: "System Drive C:", value: "Capacity: Unknown, Free Space: Running on Fumes" },
    { icon: <HardDrive size={16}/>, label: "Drive D: (CD-ROM)", value: "Mostly Coasters and Pizza Menus" },
    { icon: <Wifi size={16}/>, label: "Network Adapter", value: "Tin Foil Hat v3 - Signal Strength: Delusional" },
    { icon: <ShieldCheck size={16}/>, label: "Firewall Status", value: "ON (Powered by Wishful Thinking)" },
    { icon: <Bug size={16}/>, label: "Antivirus", value: "Placebo Antivirus Pro - Last Scan: Never" },
    { icon: <Cpu size={16}/>, label: "Current CPU Temp", value: "Too Hot to Handle", sarcasmLevel: 'medium' },
    { icon: <MemoryStick size={16}/>, label: "Virtual Memory", value: "Borrowed from the Future", sarcasmLevel: 'high' },
     { icon: <HardDrive size={16}/>, label: "Uptime", value: "Since the dawn of time (or last crash)", sarcasmLevel: 'medium' },
];


export function SystemInfo() {
  const [systemDetails, setSystemDetails] = useState<SystemDetail[]>(initialSystemInfo);

  useEffect(() => {
    const interval = setInterval(() => {
        // Update dynamic values like temperature and uptime
        setSystemDetails(prevDetails => prevDetails.map(detail => {
            if (detail.label === "Current CPU Temp") {
                const temp = 50 + Math.random() * 40; // Random temp between 50-90
                 let status = "Nominal";
                 if (temp > 85) status = "CRITICAL MELTDOWN IMMINENT!";
                 else if (temp > 75) status = "Spicy!";
                 else if (temp < 60) status = "Surprisingly Chill";
                return { ...detail, value: `${temp.toFixed(1)}°C (${status})` };
            }
            if (detail.label === "Uptime") {
                 // Simple increasing uptime simulation
                 const uptimeSeconds = Math.floor(Date.now() / 1000) % (24 * 60 * 60); // Seconds in a day cycle
                 const hours = Math.floor(uptimeSeconds / 3600);
                 const minutes = Math.floor((uptimeSeconds % 3600) / 60);
                 const seconds = uptimeSeconds % 60;
                return { ...detail, value: `${hours}h ${minutes}m ${seconds}s (Approximately)` };
            }
             if (detail.label === "Firewall Status") {
                 const status = Math.random() < 0.05 ? "OFF (Good Luck!)" : "ON (Probably)";
                 return { ...detail, value: status, sarcasmLevel: status.includes('OFF') ? 'critical' : 'low'};
             }
            return detail;
        }));
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, []);


  const getSarcasmColor = (level?: 'low' | 'medium' | 'high' | 'critical') => {
    switch (level) {
        case 'medium': return 'text-yellow-500'; // Using Tailwind direct colors for simplicity here
        case 'high': return 'text-orange-500';
        case 'critical': return 'text-destructive animate-pulse';
        default: return 'text-foreground';
    }
  }

  return (
    <div className="h-full flex flex-col text-foreground text-xs">
       <Card className="h-full flex flex-col border-none shadow-none bg-transparent">
          <CardHeader className="p-2 border-b border-primary/30">
            <CardTitle className="text-sm flex items-center gap-2"><Info size={16} /> System Properties</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-grow overflow-hidden">
            <ScrollArea className="h-full p-2">
              <ul className="space-y-1.5">
                {systemDetails.map((detail, index) => (
                  <li key={index} className="flex items-start gap-2 border-b border-primary/10 pb-1.5 last:border-b-0">
                    <span className="mt-0.5 text-accent shrink-0">{detail.icon}</span>
                    <div className="flex-grow">
                      <span className="font-medium text-muted-foreground">{detail.label}:</span>
                      <span className={cn("ml-1 break-words", getSarcasmColor(detail.sarcasmLevel))}>
                        {detail.value}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
               <div className="mt-4 p-2 border border-dashed border-destructive/50 rounded text-destructive bg-destructive/10 text-center text-[10px]">
                    Warning: System stability is inversely proportional to the number of cat videos watched. Reality may warp unexpectedly.
               </div>
            </ScrollArea>
          </CardContent>
        </Card>
    </div>
  );
}
