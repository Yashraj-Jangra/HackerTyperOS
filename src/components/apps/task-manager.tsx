'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Cpu, MemoryStick, HardDrive, AlertCircle, Wifi, ServerCrash } from 'lucide-react';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartArea, ChartAreaChart, ChartGrid } from "@/components/ui/chart"; // Import Area chart components and Grid
import { cn } from '@/lib/utils';

const initialProcesses = [
  { pid: 101, name: 'System Idle Process', cpu: 90, memory: '8 KB', disk: '0 MB/s', network: '0 Mbps', user: 'SYSTEM', status: 'Doing literally nothing, expertly' },
  { pid: 4, name: 'System', cpu: 2, memory: '120 KB', disk: '0.1 MB/s', network: '0.1 Mbps', user: 'SYSTEM' },
  { pid: 666, name: 'WindowsUpdate.exe', cpu: 99, memory: '4.2 GB', disk: '50 MB/s', network: '100 Mbps', user: 'SYSTEM', status: 'Not Responding (Planning world domination)' },
  { pid: 1337, name: 'TotallyNotMalware.exe', cpu: 15, memory: '1.5 GB', disk: '5 MB/s', network: '50 Mbps', user: 'Hacker', status: 'Definitely Not Stealing Your Memes' },
  { pid: 1024, name: 'explorer.exe', cpu: 1, memory: '150 MB', disk: '0.5 MB/s', network: '0.2 Mbps', user: 'Hacker', status: 'Lost in the file system' },
  { pid: 2048, name: 'chrome.exe (Quantum Edition)', cpu: 25, memory: '8.0 GB', disk: '2 MB/s', network: '30 Mbps', user: 'Hacker', status: 'Consuming RAM for the Motherland' },
  { pid: 2049, name: 'chrome.exe (Tab: Existential Crisis)', cpu: 10, memory: '2.1 GB', disk: '0.1 MB/s', network: '1 Mbps', user: 'Hacker' },
  { pid: 2050, name: 'chrome.exe (Tab: Is my PC on fire?)', cpu: 5, memory: '1.2 GB', disk: '0 MB/s', network: '0.5 Mbps', user: 'Hacker' },
  { pid: 3000, name: 'ImportantBackgroundProcess.exe', cpu: 0, memory: '24 MB', disk: '0 MB/s', network: '0 Mbps', user: 'SYSTEM', status: 'Pretending to Work Hard' },
  { pid: 4004, name: 'MemeRenderer.dll', cpu: 8, memory: '600 MB', disk: '1 MB/s', network: '5 Mbps', user: 'Hacker', status: 'Rendering Dankness' },
  { pid: 5000, name: 'svchost.exe (Generic Host for Stuff)', cpu: 1, memory: '60 MB', disk: '0.2 MB/s', network: '0.3 Mbps', user: 'SYSTEM' },
  { pid: 5001, name: 'svchost.exe (Another One)', cpu: 0, memory: '45 MB', disk: '0.1 MB/s', network: '0.1 Mbps', user: 'NETWORK SERVICE' },
  { pid: 7777, name: 'InfiniteLoop.exe', cpu: 50, memory: '500 MB', disk: '0 MB/s', network: '0 Mbps', user: 'SYSTEM', status: 'Running... forever?' },
  { pid: 8080, name: 'RealityDistortionField.sys', cpu: 3, memory: '64 PB', disk: '1 TB/s', network: '10 Gbps', user: 'SYSTEM', status: 'Unstable (Handle with care)' },
  { pid: 9001, name: 'BitcoinMiner_for_cats.exe', cpu: 30, memory: '2 GB', disk: '10 MB/s', network: '20 Mbps', user: 'Guest', status: 'Meow-ning for Coins' },
  { pid: 11235, name: 'Kernel_Daemon_of_Doom.service', cpu: 5, memory: '1 TB', disk: '100 MB/s', network: '1 Gbps', user: 'root', status: 'Judging your commands' },
  { pid: 21345, name: 'NetworkTrafficShaper_but_Sarcastic.service', cpu: 1, memory: '50 MB', disk: '0 MB/s', network: '?? Mbps', user: 'SYSTEM', status: 'Maybe shaping, maybe napping' },
];

const performanceHistoryLength = 30;

const chartConfig = {
  cpu: { label: "CPU", color: "hsl(var(--chart-1))" },
  memory: { label: "Memory", color: "hsl(var(--chart-2))" },
  gpu: { label: "GPU", color: "hsl(var(--chart-3))" },
  disk: { label: "Disk", color: "hsl(var(--chart-4))" },
  networkUp: { label: "Net Up", color: "hsl(var(--chart-5))" },
  networkDown: { label: "Net Down", color: "hsl(var(--accent))" },
} satisfies ChartConfig

const TOTAL_RAM = 1024; // Petabytes (PB)
const TOTAL_DISK = 5000; // Zettabytes (ZB) - completely absurd

export function TaskManager() {
  const [processes, setProcesses] = useState(initialProcesses);
  const [cpuUsage, setCpuUsage] = useState(75);
  const [memoryUsage, setMemoryUsage] = useState(60);
  const [gpuUsage, setGpuUsage] = useState(40);
  const [diskUsage, setDiskUsage] = useState(80);
  const [networkUp, setNetworkUp] = useState(150);
  const [networkDown, setNetworkDown] = useState(850);
  const [uptime, setUptime] = useState(Date.now() - (Math.random() * 1000 * 3600 * 24 * 365 * 5));

  const [cpuHistory, setCpuHistory] = useState<Array<{ time: number, cpu: number }>>(Array(performanceHistoryLength).fill({ time: 0, cpu: 0 }));
  const [memoryHistory, setMemoryHistory] = useState<Array<{ time: number, memory: number }>>(Array(performanceHistoryLength).fill({ time: 0, memory: 0 }));
  const [gpuHistory, setGpuHistory] = useState<Array<{ time: number, gpu: number }>>(Array(performanceHistoryLength).fill({ time: 0, gpu: 0 }));
  const [diskHistory, setDiskHistory] = useState<Array<{ time: number, disk: number }>>(Array(performanceHistoryLength).fill({ time: 0, disk: 0 }));
  const [networkHistory, setNetworkHistory] = useState<Array<{ time: number, up: number, down: number }>>(Array(performanceHistoryLength).fill({ time: 0, up: 0, down: 0 }));


  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();

      const newCpu = Math.min(100, Math.max(5, cpuUsage + Math.random() * 20 - 10));
      const newMemory = Math.min(100, Math.max(10, memoryUsage + Math.random() * 15 - 7.5));
      const newGpu = Math.min(100, Math.max(0, gpuUsage + Math.random() * 30 - 15));
      const newDisk = Math.min(100, Math.max(0, diskUsage + Math.random() * 40 - 20));
      const newNetworkUp = Math.max(0, networkUp + Math.random() * 100 - 50);
      const newNetworkDown = Math.max(0, networkDown + Math.random() * 300 - 150);

      setCpuUsage(Math.round(newCpu));
      setMemoryUsage(Math.round(newMemory));
      setGpuUsage(Math.round(newGpu));
      setDiskUsage(Math.round(newDisk));
      setNetworkUp(Math.round(newNetworkUp));
      setNetworkDown(Math.round(newNetworkDown));
      setUptime(prev => prev + 1500);

      // Add realistic timestamp or index for chart x-axis
      const timeLabel = now; // Use timestamp, or could use an index counter

      setCpuHistory(prev => [...prev.slice(1), { time: timeLabel, cpu: Math.round(newCpu) }]);
      setMemoryHistory(prev => [...prev.slice(1), { time: timeLabel, memory: Math.round(newMemory) }]);
      setGpuHistory(prev => [...prev.slice(1), { time: timeLabel, gpu: Math.round(newGpu) }]);
      setDiskHistory(prev => [...prev.slice(1), { time: timeLabel, disk: Math.round(newDisk) }]);
      setNetworkHistory(prev => [...prev.slice(1), { time: timeLabel, up: Math.round(newNetworkUp), down: Math.round(newNetworkDown) }]);


      setProcesses(prevProcesses =>
        prevProcesses.map(p => {
          let newCpuUsage = p.cpu;
          let newMemUsage = parseFloat(p.memory.split(' ')[0]);
          let newDiskUsage = parseFloat(p.disk.split(' ')[0]);
          let newNetworkUsage = parseFloat(p.network.split(' ')[0]);

          if (p.name !== 'System Idle Process' && p.name !== 'WindowsUpdate.exe' && !p.name.includes('InfiniteLoop')) {
            newCpuUsage = Math.max(0, Math.min(99, p.cpu + Math.random() * 6 - 3));
            newMemUsage = Math.max(0.01, newMemUsage + (Math.random() * (newMemUsage * 0.2) - (newMemUsage * 0.1)));
            newDiskUsage = Math.max(0, newDiskUsage + Math.random() * 2 - 1);
            newNetworkUsage = Math.max(0, newNetworkUsage + Math.random() * 5 - 2.5);
          } else if (p.name === 'System Idle Process') {
             newCpuUsage = Math.max(0, 100 - Math.round(newCpu));
             newMemUsage = 0.008;
          } else if (p.name.includes('InfiniteLoop')) {
              newCpuUsage = 50 + Math.random() * 10 - 5;
          } else if (p.name === 'WindowsUpdate.exe') {
             newCpuUsage = 99;
             newDiskUsage = 50 + Math.random() * 20 - 10;
             newNetworkUsage = 100 + Math.random() * 50 - 25;
          }

          let newStatus = p.status;
           if (Math.random() < 0.015 && p.name !== 'WindowsUpdate.exe') {
                const statuses = ['Responding', 'Not Responding', 'Thinking Deeply', 'On Coffee Break', 'Calculating Pi', 'Debugging Reality'];
                newStatus = statuses[Math.floor(Math.random() * statuses.length)];
           } else if(p.name === 'WindowsUpdate.exe' && Math.random() < 0.05) {
                 const updateStatuses = ['Not Responding (As Usual)', 'Applying Update 1 of 999...', 'Stuck at 99%', 'Rebooting Universe...', 'Downloading More Bugs'];
                 newStatus = updateStatuses[Math.floor(Math.random() * updateStatuses.length)];
           } else if (Math.random() > 0.05 && p.name !== 'WindowsUpdate.exe' && !p.status?.includes('expertly') && !p.status?.includes('Hard')) {
                 newStatus = undefined;
           }

          let memUnit = ' MB';
          if (newMemUsage > 1024) { newMemUsage /= 1024; memUnit = ' GB'; }
          if (newMemUsage > 1024) { newMemUsage /= 1024; memUnit = ' TB'; }
           if (newMemUsage > 1024) { newMemUsage /= 1024; memUnit = ' PB'; }

          return {
              ...p,
              cpu: Math.round(newCpuUsage),
              memory: `${newMemUsage.toFixed(1)}${memUnit}`,
              disk: `${newDiskUsage.toFixed(1)} MB/s`,
              network: `${newNetworkUsage.toFixed(1)} Mbps`,
              status: newStatus
          };
        }).sort((a, b) => b.cpu - a.cpu)
      );
    }, 1500);

    return () => clearInterval(interval);
  }, [cpuUsage, memoryUsage, gpuUsage, diskUsage, networkUp, networkDown]);

   const formatUptime = (ms: number) => {
       const totalSeconds = Math.floor(ms / 1000);
       const days = Math.floor(totalSeconds / (3600 * 24));
       const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
       const minutes = Math.floor((totalSeconds % 3600) / 60);
       const seconds = totalSeconds % 60;
       return `${days}d ${hours}h ${minutes}m ${seconds}s (approximately forever)`;
   };

   const formatNetworkSpeed = (bps: number) => {
       if (bps > 1000) return `${(bps / 1000).toFixed(1)} Gbps`;
       return `${bps.toFixed(0)} Mbps`;
   };


  return (
    <div className="h-full flex flex-col text-foreground text-xs">
       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-1 p-1 border-b border-primary/30">
        {/* CPU Card */}
        <Card className="bg-card/50 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-2 px-2">
             <CardTitle className="text-[10px] font-medium flex items-center gap-1"><Cpu size={12}/> CPU: Overclocked Potato</CardTitle>
            <span className="text-sm font-bold text-primary shrink-0">{cpuUsage}%</span>
          </CardHeader>
          <CardContent className="pb-1 px-1">
             <ChartContainer config={chartConfig} className="h-[40px] w-full"> {/* Increased height */}
                <ChartAreaChart accessibilityLayer data={cpuHistory} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="fillCpu" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-cpu)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--color-cpu)" stopOpacity={0.1}/>
                        </linearGradient>
                    </defs>
                    <ChartGrid vertical={false} strokeDasharray="2 2" className="stroke-border/50"/>
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel hideIndicator />} />
                    <ChartArea dataKey="cpu" type="monotone" fill="url(#fillCpu)" stroke="var(--color-cpu)" strokeWidth={1.5} dot={false} />
                </ChartAreaChart>
              </ChartContainer>
          </CardContent>
        </Card>
        {/* Memory Card */}
        <Card className="bg-card/50 border-primary/20">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-2 px-2">
             <CardTitle className="text-[10px] font-medium flex items-center gap-1"><MemoryStick size={12} /> RAM: {memoryUsage}% of {TOTAL_RAM} PB</CardTitle>
             <span className="text-sm font-bold text-accent shrink-0">{memoryUsage}%</span>
          </CardHeader>
          <CardContent className="pb-1 px-1">
              <ChartContainer config={chartConfig} className="h-[40px] w-full">
                <ChartAreaChart accessibilityLayer data={memoryHistory} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                     <defs>
                        <linearGradient id="fillMemory" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-memory)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--color-memory)" stopOpacity={0.1}/>
                        </linearGradient>
                    </defs>
                     <ChartGrid vertical={false} strokeDasharray="2 2" className="stroke-border/50"/>
                     <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel hideIndicator />} />
                     <ChartArea dataKey="memory" type="monotone" fill="url(#fillMemory)" stroke="var(--color-memory)" strokeWidth={1.5} dot={false} />
                </ChartAreaChart>
              </ChartContainer>
          </CardContent>
        </Card>
        {/* Disk Card */}
         <Card className="bg-card/50 border-primary/20">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-2 px-2">
             <CardTitle className="text-[10px] font-medium flex items-center gap-1"><HardDrive size={12} /> Disk: {diskUsage}% IO</CardTitle>
             <span className="text-sm font-bold text-chart-4 shrink-0">{diskUsage}%</span>
           </CardHeader>
           <CardContent className="pb-1 px-1">
               <ChartContainer config={chartConfig} className="h-[40px] w-full">
                <ChartAreaChart accessibilityLayer data={diskHistory} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="fillDisk" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-disk)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--color-disk)" stopOpacity={0.1}/>
                        </linearGradient>
                    </defs>
                    <ChartGrid vertical={false} strokeDasharray="2 2" className="stroke-border/50"/>
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel hideIndicator />} />
                    <ChartArea dataKey="disk" type="monotone" fill="url(#fillDisk)" stroke="var(--color-disk)" strokeWidth={1.5} dot={false} />
                </ChartAreaChart>
              </ChartContainer>
           </CardContent>
         </Card>
         {/* GPU Card */}
         <Card className="bg-card/50 border-primary/20">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-2 px-2">
             <CardTitle className="text-[10px] font-medium flex items-center gap-1"><ServerCrash size={12} /> GPU: Drawing Chaos</CardTitle>
             <span className="text-sm font-bold text-chart-3 shrink-0">{gpuUsage}%</span>
           </CardHeader>
           <CardContent className="pb-1 px-1">
               <ChartContainer config={chartConfig} className="h-[40px] w-full">
                <ChartAreaChart accessibilityLayer data={gpuHistory} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                     <defs>
                        <linearGradient id="fillGpu" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-gpu)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--color-gpu)" stopOpacity={0.1}/>
                        </linearGradient>
                    </defs>
                     <ChartGrid vertical={false} strokeDasharray="2 2" className="stroke-border/50"/>
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel hideIndicator />} />
                    <ChartArea dataKey="gpu" type="monotone" fill="url(#fillGpu)" stroke="var(--color-gpu)" strokeWidth={1.5} dot={false} />
                </ChartAreaChart>
              </ChartContainer>
           </CardContent>
         </Card>
          {/* Network Card */}
          <Card className="bg-card/50 border-primary/20">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-2 px-2 gap-1">
              <CardTitle className="text-[10px] font-medium flex items-center gap-1 min-w-0">
                 <Wifi size={12} className="shrink-0" />
                 <span className="truncate">Network</span>
               </CardTitle>
              <div className="text-[10px] flex flex-col items-end shrink-0">
                  <span className="text-chart-5">Up: {formatNetworkSpeed(networkUp)}</span>
                  <span className="text-accent">Dn: {formatNetworkSpeed(networkDown)}</span>
              </div>
           </CardHeader>
           <CardContent className="pb-1 px-1">
               <ChartContainer config={chartConfig} className="h-[40px] w-full">
                <ChartAreaChart accessibilityLayer data={networkHistory} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="fillNetUp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-networkUp)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--color-networkUp)" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="fillNetDown" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-networkDown)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--color-networkDown)" stopOpacity={0.1}/>
                        </linearGradient>
                    </defs>
                    <ChartGrid vertical={false} strokeDasharray="2 2" className="stroke-border/50"/>
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel hideIndicator />} />
                    <ChartArea dataKey="up" type="monotone" fill="url(#fillNetUp)" stroke="var(--color-networkUp)" strokeWidth={1.5} dot={false} />
                    <ChartArea dataKey="down" type="monotone" fill="url(#fillNetDown)" stroke="var(--color-networkDown)" strokeWidth={1.5} dot={false} />
                </ChartAreaChart>
              </ChartContainer>
           </CardContent>
         </Card>
      </div>

      {/* Process List */}
      <ScrollArea className="flex-grow">
        <Table className="w-full text-[11px]">
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow className="hover:bg-card border-b-primary/30">
              <TableHead className="w-[50px] p-1 h-6">PID</TableHead>
              <TableHead className="p-1 h-6">Name</TableHead>
              <TableHead className="w-[50px] text-right p-1 h-6">CPU</TableHead>
              <TableHead className="w-[70px] text-right p-1 h-6">Memory</TableHead>
              <TableHead className="w-[70px] text-right p-1 h-6">Disk</TableHead>
               <TableHead className="w-[70px] text-right p-1 h-6">Network</TableHead>
              <TableHead className="w-[100px] p-1 h-6">User</TableHead>
               <TableHead className="p-1 h-6">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processes.map((proc) => (
              <TableRow key={proc.pid} className="hover:bg-secondary/30 border-b-primary/10 h-6">
                <TableCell className="p-1">{proc.pid}</TableCell>
                <TableCell className="p-1 font-medium truncate max-w-[150px]" title={proc.name}>{proc.name}</TableCell> {/* Slightly reduced max-w */}
                <TableCell className="text-right p-1">{proc.cpu}%</TableCell>
                <TableCell className="text-right p-1">{proc.memory}</TableCell>
                <TableCell className="text-right p-1">{proc.disk}</TableCell>
                <TableCell className="text-right p-1">{proc.network}</TableCell>
                 <TableCell className="p-1 truncate">{proc.user}</TableCell>
                 <TableCell className="p-1 truncate max-w-[150px]"> {/* Added max-w */}
                    {proc.status && (
                        <span className={cn("flex items-center gap-1 text-[10px]",
                            proc.status.toLowerCase().includes('not responding') || proc.status.toLowerCase().includes('unstable') || proc.status.toLowerCase().includes('stuck') ? 'text-destructive animate-pulse' :
                            proc.status.toLowerCase().includes('warning') || proc.status.toLowerCase().includes('coffee') ? 'text-yellow-500' :
                            proc.status.toLowerCase().includes('forever') || proc.status.toLowerCase().includes('expertly') ? 'text-accent' :
                            'text-muted-foreground'
                        )} title={proc.status}>
                             {(proc.status.toLowerCase().includes('not responding') || proc.status.toLowerCase().includes('unstable')) && <AlertCircle size={10} />}
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
       <div className="p-1 border-t border-primary/30 text-muted-foreground text-[10px] flex justify-between items-center">
         <span>Processes: {processes.length}</span>
         <span>CPU Usage: {cpuUsage}%</span>
          <span>Memory: {(memoryUsage / 100 * TOTAL_RAM).toFixed(2)} PB / {TOTAL_RAM} PB</span>
          <span>Disk Activity: {diskUsage}%</span>
         <span className="truncate max-w-[200px]">Uptime: {formatUptime(uptime)}</span>
       </div>
    </div>
  );
}