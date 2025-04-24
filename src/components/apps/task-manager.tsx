'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Cpu, MemoryStick, HardDrive, AlertCircle } from 'lucide-react';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLine, ChartLineChart } from "@/components/ui/chart"


const initialProcesses = [
  { pid: 101, name: 'System Idle Process', cpu: 90, memory: '8 KB', user: 'SYSTEM' },
  { pid: 4, name: 'System', cpu: 2, memory: '120 KB', user: 'SYSTEM' },
  { pid: 666, name: 'WindowsUpdate.exe', cpu: 99, memory: '2.1 GB', user: 'SYSTEM', status: 'Not Responding (Obviously)' },
  { pid: 1337, name: 'TotallyNotMalware.exe', cpu: 5, memory: '512 MB', user: 'Hacker', status: 'Definitely Not Stealing Data' },
  { pid: 1024, name: 'explorer.exe', cpu: 1, memory: '150 MB', user: 'Hacker' },
  { pid: 2048, name: 'chrome.exe', cpu: 15, memory: '1.5 GB', user: 'Hacker' },
   { pid: 2049, name: 'chrome.exe (Tab: Cat Videos)', cpu: 10, memory: '800 MB', user: 'Hacker' },
   { pid: 2050, name: 'chrome.exe (Tab: Stack Overflow)', cpu: 5, memory: '400 MB', user: 'Hacker' },
  { pid: 3000, name: 'ImportantBackgroundProcess.exe', cpu: 0, memory: '24 MB', user: 'SYSTEM', status: 'Pretending to Work' },
  { pid: 4004, name: 'MemeRenderer.dll', cpu: 8, memory: '300 MB', user: 'Hacker' },
  { pid: 5000, name: 'svchost.exe', cpu: 1, memory: '60 MB', user: 'SYSTEM' },
  { pid: 5001, name: 'svchost.exe', cpu: 0, memory: '45 MB', user: 'NETWORK SERVICE' },
   { pid: 8080, name: 'RealityDistortionField.sys', cpu: 3, memory: '64 KB', user: 'SYSTEM', status: 'Unstable' },
];

const performanceHistoryLength = 20; // Number of data points for charts

const chartConfig = {
  cpu: { label: "CPU", color: "hsl(var(--chart-1))" },
  memory: { label: "Memory", color: "hsl(var(--chart-2))" },
  gpu: { label: "GPU", color: "hsl(var(--chart-3))" },
} satisfies ChartConfig

export function TaskManager() {
  const [processes, setProcesses] = useState(initialProcesses);
  const [cpuUsage, setCpuUsage] = useState(75);
  const [memoryUsage, setMemoryUsage] = useState(60);
  const [gpuUsage, setGpuUsage] = useState(40);
  const [cpuHistory, setCpuHistory] = useState<Array<{ time: number, cpu: number }>>(Array(performanceHistoryLength).fill({ time: 0, cpu: 0 }));
  const [memoryHistory, setMemoryHistory] = useState<Array<{ time: number, memory: number }>>(Array(performanceHistoryLength).fill({ time: 0, memory: 0 }));
  const [gpuHistory, setGpuHistory] = useState<Array<{ time: number, gpu: number }>>(Array(performanceHistoryLength).fill({ time: 0, gpu: 0 }));


  useEffect(() => {
    const interval = setInterval(() => {
      // Update overall stats
      const newCpu = Math.min(100, Math.max(5, cpuUsage + Math.random() * 10 - 5));
      const newMemory = Math.min(100, Math.max(10, memoryUsage + Math.random() * 8 - 4));
       const newGpu = Math.min(100, Math.max(0, gpuUsage + Math.random() * 15 - 7)); // GPU more volatile

      setCpuUsage(Math.round(newCpu));
      setMemoryUsage(Math.round(newMemory));
      setGpuUsage(Math.round(newGpu));

      const now = Date.now();
      setCpuHistory(prev => [...prev.slice(1), { time: now, cpu: Math.round(newCpu) }]);
      setMemoryHistory(prev => [...prev.slice(1), { time: now, memory: Math.round(newMemory) }]);
       setGpuHistory(prev => [...prev.slice(1), { time: now, gpu: Math.round(newGpu) }]);

      // Update processes (make some fluctuate slightly)
      setProcesses(prevProcesses =>
        prevProcesses.map(p => {
          let newCpuUsage = p.cpu;
          if (p.name !== 'System Idle Process' && p.name !== 'WindowsUpdate.exe') {
            newCpuUsage = Math.max(0, Math.min(99, p.cpu + Math.random() * 4 - 2));
          } else if (p.name === 'System Idle Process') {
             newCpuUsage = Math.max(0, 100 - Math.round(newCpu)); // Idle is inverse of total CPU
          }
          // Randomly change status for fun
          let newStatus = p.status;
           if (Math.random() < 0.01 && p.name !== 'WindowsUpdate.exe') {
                newStatus = Math.random() < 0.5 ? 'Responding' : 'Not Responding';
            } else if(p.name === 'WindowsUpdate.exe' && Math.random() < 0.05) {
                 newStatus = 'Not Responding (Surprise!)';
            }
             else if (Math.random() > 0.05 && p.name !== 'WindowsUpdate.exe') {
                 newStatus = undefined; // Clear status sometimes
             }

          return { ...p, cpu: Math.round(newCpuUsage), status: newStatus };
        }).sort((a, b) => b.cpu - a.cpu) // Keep sorted by CPU usage
      );
    }, 1500); // Update every 1.5 seconds

    return () => clearInterval(interval);
  }, [cpuUsage, memoryUsage, gpuUsage]);

  return (
    <div className="h-full flex flex-col text-foreground text-xs">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-2 border-b border-primary/30">
        <Card className="bg-card/50 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-2 px-3">
            <CardTitle className="text-xs font-medium flex items-center gap-1"><Cpu size={14}/> CPU: Running Memes</CardTitle>
            <span className="text-lg font-bold text-primary">{cpuUsage}%</span>
          </CardHeader>
          <CardContent className="pb-2 px-3">
             <ChartContainer config={chartConfig} className="h-[50px] w-full">
                <ChartLineChart accessibilityLayer data={cpuHistory} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel hideIndicator />} />
                  <ChartLine dataKey="cpu" type="monotone" stroke="var(--color-cpu)" strokeWidth={2} dot={false} />
                </ChartLineChart>
              </ChartContainer>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-primary/20">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-2 px-3">
            <CardTitle className="text-xs font-medium flex items-center gap-1"><MemoryStick size={14} /> Memory: Storing Secrets</CardTitle>
             <span className="text-lg font-bold text-accent">{memoryUsage}%</span>
          </CardHeader>
          <CardContent className="pb-2 px-3">
              <ChartContainer config={chartConfig} className="h-[50px] w-full">
                <ChartLineChart accessibilityLayer data={memoryHistory} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel hideIndicator />} />
                  <ChartLine dataKey="memory" type="monotone" stroke="var(--color-memory)" strokeWidth={2} dot={false} />
                </ChartLineChart>
              </ChartContainer>
          </CardContent>
        </Card>
         <Card className="bg-card/50 border-primary/20">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-2 px-3">
             <CardTitle className="text-xs font-medium flex items-center gap-1"><HardDrive size={14} /> GPU: Rendering Pixels</CardTitle>
             <span className="text-lg font-bold text-chart-3">{gpuUsage}%</span>
           </CardHeader>
           <CardContent className="pb-2 px-3">
               <ChartContainer config={chartConfig} className="h-[50px] w-full">
                <ChartLineChart accessibilityLayer data={gpuHistory} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel hideIndicator />} />
                  <ChartLine dataKey="gpu" type="monotone" stroke="var(--color-gpu)" strokeWidth={2} dot={false} />
                </ChartLineChart>
              </ChartContainer>
           </CardContent>
         </Card>
      </div>

      {/* Process List */}
      <ScrollArea className="flex-grow">
        <Table className="w-full">
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow className="hover:bg-card border-b-primary/30">
              <TableHead className="w-[80px] p-1 h-7">PID</TableHead>
              <TableHead className="p-1 h-7">Name</TableHead>
              <TableHead className="w-[60px] text-right p-1 h-7">CPU %</TableHead>
              <TableHead className="w-[100px] text-right p-1 h-7">Memory</TableHead>
              <TableHead className="p-1 h-7">User</TableHead>
               <TableHead className="p-1 h-7">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processes.map((proc) => (
              <TableRow key={proc.pid} className="hover:bg-secondary/30 border-b-primary/10">
                <TableCell className="p-1">{proc.pid}</TableCell>
                <TableCell className="p-1 font-medium truncate">{proc.name}</TableCell>
                <TableCell className="text-right p-1">{proc.cpu}%</TableCell>
                <TableCell className="text-right p-1">{proc.memory}</TableCell>
                 <TableCell className="p-1 truncate">{proc.user}</TableCell>
                 <TableCell className="p-1 truncate">
                    {proc.status && (
                        <span className={`flex items-center gap-1 ${proc.status.includes('Not Responding') || proc.status.includes('Unstable') ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`}>
                             {proc.status.includes('Not Responding') || proc.status.includes('Unstable') && <AlertCircle size={12} />}
                            {proc.status}
                        </span>
                    )}
                 </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
        {/* Status Bar */}
      <div className="p-1 border-t border-primary/30 text-muted-foreground text-[10px] flex justify-between">
         <span>Processes: {processes.length}</span>
         <span>CPU Usage: {cpuUsage}%</span>
       </div>
    </div>
  );
}
