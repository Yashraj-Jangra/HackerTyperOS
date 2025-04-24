'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, BatteryCharging, Volume2, Clock, AlertTriangle, ShieldAlert } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';

// Minimal CheckCircle component if lucide-react doesn't have it or for specific styling
const CheckCircle = ({ size = 14 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);


const notifications = [
    { title: "Security Alert!", description: "Unknown entity detected. Probably just dust.", variant: "destructive", icon: <ShieldAlert size={14}/> },
    { title: "Update Available", description: "Update to 'Reality 2.0' failed. Try again later (never).", variant: "default", icon: <AlertTriangle size={14}/> },
    { title: "Low Disk Space", description: "Consider deleting your browser history. Or don't.", variant: "warning", icon: <AlertTriangle size={14}/> },
    { title: "Achievement Unlocked!", description: "Survived another Monday!", variant: "success", icon: <CheckCircle size={14} /> },
    { title: "System Critical", description: "Coffee levels dangerously low.", variant: "destructive", icon: <ShieldAlert size={14}/> },
];

export function WidgetBar() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [batteryLevel, setBatteryLevel] = useState(99);
  const [signalStrength, setSignalStrength] = useState(4); // 0 to 4 bars
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());

      // Simulate battery drain/charge fluctuation
      setBatteryLevel(prev => {
        const change = Math.random() * 2 - 1; // Fluctuate slightly
        const newValue = Math.max(5, Math.min(100, prev + change));
        // Randomly jump to 100 (charging)
        if (Math.random() < 0.02) return 100;
        // Randomly drop significantly
        if (Math.random() < 0.01) return Math.max(5, prev - 20);
        return Math.round(newValue);
      });

      // Simulate signal strength fluctuation
      setSignalStrength(prev => {
         if (Math.random() < 0.1) { // 10% chance to change
            const change = Math.random() < 0.5 ? -1 : 1;
            return Math.max(0, Math.min(4, prev + change));
         }
         return prev;
      });

      // Trigger random notifications
      if (Math.random() < 0.015) { // ~1.5% chance per second
        const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
         toast({
            title: (
                <div className="flex items-center gap-2">
                    {randomNotification.icon}
                    <span>{randomNotification.title}</span>
                </div>
            ),
            description: randomNotification.description,
             variant: randomNotification.variant as "default" | "destructive" | undefined, // Cast variant type
             duration: 5000 + Math.random() * 5000 // Random duration 5-10s
         });
      }

    }, 1000); // Update time every second

    return () => clearInterval(timer);
  }, [toast]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

   const getSignalIcon = () => {
        // Simple representation of signal bars
        let bars = "";
        for(let i=0; i<4; i++){
            bars += i < signalStrength ? "|" : ".";
        }
        // Use Wifi icon with dynamic bars text
        return <div className="flex items-center gap-1" title={`Signal: ${signalStrength}/4`}><Wifi size={14} /><span className="text-[10px] font-mono tracking-tighter">{bars}</span></div>;
    };

  return (
    <div className="h-8 bg-card border-b border-primary/50 text-foreground text-xs px-2 flex items-center justify-between select-none sticky top-0 left-0 right-0 z-50" data-no-context="true">
        {/* Left Side - maybe app menu trigger later */}
        <div className="flex items-center gap-2">
            <span className="font-bold text-primary glitch-effect">[HT_OS]</span>
            {/* Placeholder for potential future menu button */}
             {/* <Button variant="ghost" size="sm" className="h-6 px-1 text-xs">File</Button> */}
        </div>

        {/* Right Side - System Tray Icons */}
        <div className="flex items-center gap-3">
             {/* Glitching Warning */}
            <span className="text-destructive text-[10px] animate-pulse flex items-center gap-1">
                <AlertTriangle size={12} /> Reality Unstable
            </span>

            {getSignalIcon()}

            <div className="flex items-center gap-1" title={`Battery: ${batteryLevel}% ${batteryLevel === 100 ? '(Charging)' : ''}`}>
                <BatteryCharging size={14} className={batteryLevel === 100 ? 'text-primary' : batteryLevel < 20 ? 'text-destructive' : ''} />
                <span className="text-[10px]">{batteryLevel}%</span>
            </div>

            <div className="flex items-center gap-1" title="Volume: Max (Always)">
                <Volume2 size={14} />
                 <Progress value={100} className="w-8 h-1 bg-primary/50 [&>div]:bg-primary" />
            </div>

            <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>{formatTime(currentTime)}</span>
            </div>
        </div>
    </div>
  );
}
