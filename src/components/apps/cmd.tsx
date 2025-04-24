
'use client';

import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Terminal, Skull, Network, UserCircle, CheckCircle, XCircle, AlertTriangle, FileScan, KeyRound } from 'lucide-react'; // Added more icons
import { Progress } from '@/components/ui/progress'; // For fake progress bars

const welcomeMessage = `
HackerTyper OS [Version 0.1.alpha-AF]
(c) 2024 Totally Legit Corp. All rights reserved.

WARNING: This system is for authorized personnel only.
Unauthorized access will result in... well, nothing really. Have fun!

Type 'help' for a list of mostly useless commands.

`;

interface CommandHistoryItem {
  id: number;
  input: string;
  output: React.ReactNode;
}

interface CommandDefinition {
    description: string;
    usage?: string;
    handler: (args: string[], updateOutput: (output: React.ReactNode) => void) => React.ReactNode | Promise<React.ReactNode>;
}

// Helper for async delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const commandDefinitions: { [key: string]: CommandDefinition } = {
  help: {
    description: 'Displays this highly informative help message.',
    handler: () => {
        const commands = Object.entries(commandDefinitions).map(([name, def]) => (
             <div key={name}>
                <span className="text-primary w-16 inline-block">{name}</span>
                <span className="text-muted-foreground">- {def.description}{def.usage && <span className='text-accent'> Usage: {def.usage}</span>}</span>
             </div>
         ));
        return (
            <div>
                Available commands:<br/>
                {commands}
            </div>
        );
    }
  },
  cls: {
    description: 'Clears the terminal screen (mostly).',
    handler: () => '' // Special handling in addHistory
  },
  dir: {
    description: 'Lists files and directories (all fake).',
     usage: '[path]',
    handler: (args) => (
        <div>
            Directory of C:\\Users\\Hacker\\{args[0] || ''}<br />
            <span className="text-xs text-muted-foreground">
            04/01/2024 13:37 &lt;DIR&gt; .<br />
            04/01/2024 13:37 &lt;DIR&gt; ..<br />
            03/15/2024 10:00 1,024 secrets.txt<br />
            03/20/2024 11:11 4,096 important_stuff.zip<br />
            04/01/2024 09:00 512 DefinitelyNotAKeylogger.exe<br />
            01/01/1999 00:01 10,485,760 BigFile.dat<br />
            10/26/1985 01:21 &lt;DIR&gt; FluxCapacitorPlans<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 4 File(s) 10,491,392 bytes<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 3 Dir(s) 888,888,888,888 bytes free (allegedly)
            </span>
        </div>
    )
  },
  ping: {
    description: 'Sends virtual good vibes to a target.',
    usage: '[target]',
    handler: (args) => {
        const target = args[0] || 'localhost';
        return (
        <div>
            Pinging {target} with 32 bytes of virtual good vibes:<br />
            <div className="text-xs text-muted-foreground pl-2">
            Reply from {target}: bytes=32 time&lt;1ms TTL=∞ (Vibes acknowledged!)<br />
            Reply from {target}: bytes=32 time&lt;1ms TTL=∞ (Target seems slightly less grumpy)<br />
            Reply from {target}: bytes=32 time&lt;1ms TTL=∞ (Connection spiritually stable)<br />
            Reply from {target}: bytes=32 time&lt;1ms TTL=∞ (Ping successful, target appreciates the thought)<br />
            </div>
            <br />
            Ping statistics for {target}:<br />
             <span className="text-xs text-muted-foreground">Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),<br />
            Approximate round trip times in milli-seconds:<br />
            Minimum = 0ms, Maximum = 0ms, Average = 0ms (It's all relative)</span>
        </div>
        );
    }
  },
   hack: {
    description: 'Initiates elite hacking sequence on a target.',
    usage: '[target]',
    handler: async (args, updateOutput) => {
        const target = args[0] || 'the_mainframe';
        const steps = [
            { text: `Initializing connection to ${target}...`, delay: 500, icon: <Terminal size={14} className="animate-pulse"/> },
            { text: `[+] Analyzing target defenses...`, delay: 800, icon: <FileScan size={14}/> },
            { text: `[+] Attempting firewall bypass (Method: Brute Hope)...`, delay: 1200, icon: <KeyRound size={14} className="animate-spin"/> },
            { text: `[+] Firewall bypassed! (It was probably off).`, delay: 300, icon: <CheckCircle size={14} className="text-primary"/> },
            { text: `[+] Searching for vulnerability CVE-2024-1337...`, delay: 1000, icon: <Skull size={14}/> },
            { text: `[+] Vulnerability found! Exploiting...`, delay: 1500, icon: <Skull size={14} className="text-destructive animate-ping"/> },
            { text: `[+] Gaining root access... SUCCESS!`, delay: 500, icon: <UserCircle size={14} className="text-primary"/> },
            { text: `[+] Downloading classified data...`, delay: 1000, icon: <Terminal size={14} className="animate-pulse"/> },
            { text: `[=----       ] 20%`, delay: 300, progress: 20 },
            { text: `[==---      ] 40%`, delay: 300, progress: 40 },
            { text: `[====-      ] 60%`, delay: 400, progress: 60 },
            { text: `[=====      ] 80%`, delay: 500, progress: 80 },
            { text: `[======     ] 100% Download complete.`, delay: 200, progress: 100, icon: <CheckCircle size={14} className="text-primary"/> },
            { text: `[!] Error: Downloaded file 'cat_pictures.zip' is corrupted.`, delay: 600, icon: <XCircle size={14} className="text-destructive"/> },
            { text: `<span class="text-destructive">[-] Intrusion detected! Covering tracks...</span>`, delay: 800, icon: <AlertTriangle size={14} className="text-yellow-500"/> },
            { text: `Hack finished. You successfully downloaded broken cat pictures. Well done?`, delay: 300, icon: <Terminal size={14} className="text-accent"/> },
        ];

        let currentOutput: React.ReactNode[] = [];
        for (const step of steps) {
            await delay(step.delay);
            const line = (
                <div key={currentOutput.length} className="flex items-center gap-1.5 text-xs">
                    {step.icon}
                    {step.progress !== undefined ? (
                        <div className="flex items-center gap-1 w-full">
                            <Progress value={step.progress} className="w-1/2 h-1.5 bg-secondary [&>div]:bg-primary" />
                            <span dangerouslySetInnerHTML={{ __html: step.text }} />
                        </div>
                    ) : (
                         <span dangerouslySetInnerHTML={{ __html: step.text }} />
                    )}
                </div>
            );
             currentOutput = [...currentOutput, line];
             updateOutput(<div>{currentOutput}</div>);
        }
        return ''; // Final output is handled by updateOutput
    }
   },
  matrix: {
      description: 'Enters the Matrix (visually simulated).',
      handler: () => (
        <div className='font-mono'>
            <p className="text-primary font-bold text-lg mb-2 animate-pulse">Wake up, Neo...</p>
            <p>The Matrix has you...</p>
            <p className="text-muted-foreground">Follow the white rabbit.</p>
             <pre className="mt-2 text-xs text-primary overflow-hidden h-16 relative">
                 {/* Simple falling characters effect */}
                {Array.from({ length: 10 }).map((_, i) => (
                    <span key={i} className="absolute animate-matrix-fall" style={{
                         left: `${Math.random() * 100}%`,
                         animationDuration: `${Math.random() * 3 + 2}s`,
                         animationDelay: `${Math.random() * 2}s`,
                         opacity: Math.random() * 0.5 + 0.3,
                         fontSize: `${Math.random() * 6 + 10}px`
                    }}>
                        {String.fromCharCode(0x30A0 + Math.random() * (0x30FF - 0x30A0 + 1))}
                    </span>
                ))}
                01101110 01100101 01101111<br/>
                00100000 01101001 01110011<br/>
                00100000 01110100 01101000<br/>
                01100101 00100000 01101111<br/>
                01101110 01100101 00101110
            </pre>
            <style>{`
                @keyframes matrix-fall {
                    from { transform: translateY(-100%); }
                    to { transform: translateY(100%); }
                }
                .animate-matrix-fall { animation: matrix-fall linear infinite; }
            `}</style>
        </div>
    )
  },
   sysinfo: {
    description: 'Displays sarcastic system information.',
    handler: () => (
        <div className="text-sm">
            <div className="flex items-center gap-2 mb-1"><Terminal size={14} className="text-accent"/> OS Name: <span className="text-muted-foreground">Definitely Not Windows 1337</span></div>
            <div className="flex items-center gap-2 mb-1"><Terminal size={14} className="text-accent"/> Version: <span className="text-muted-foreground">0.1 (Pre-Alpha, Caffeinated Edition)</span></div>
            <div className="flex items-center gap-2 mb-1"><Terminal size={14} className="text-accent"/> Processor: <span className="text-muted-foreground">Quantum Potato Chip @ 5 GHz (estimated)</span></div>
            <div className="flex items-center gap-2 mb-1"><Terminal size={14} className="text-accent"/> Installed Memory (RAM): <span className="text-muted-foreground">1 TB (Probably Downloaded)</span></div>
            <div className="flex items-center gap-2 mb-1"><Terminal size={14} className="text-accent"/> System Type: <span className="text-muted-foreground">64-bit Astral Projection Capable</span></div>
            <div className="flex items-center gap-2 mb-1"><Network size={14} className="text-accent"/> Network Card(s): <span className="text-muted-foreground">Tin Foil Hat v2.0</span></div>
            <div className="flex items-center gap-2 mb-1"><AlertTriangle size={14} className="text-yellow-500"/> Status: <span className="text-yellow-500 animate-pulse">Running low on sarcasm...</span></div>
        </div>
    )
   },
  echo: {
    description: 'Repeats whatever you type after it.',
    usage: '[text...]',
    handler: (args) => args.join(' ') || <span className="text-muted-foreground">Echo... echo... is anyone there?</span>
  },
  tree: {
    description: 'Shows a highly inaccurate directory tree.',
    handler: () => (
     <pre className="text-xs text-primary">
      C:.
      ├───<span className="text-accent">Program Files</span>
      │   └───<span className="text-accent">TotallyLegalHacks</span>
      │       └─── hack.exe <span className="text-destructive">(Use with caution... or not)</span>
      ├───<span className="text-accent">Windows</span>
      │   ├───<span className="text-accent">System32</span> <span className="text-yellow-500">(Warning: Do not delete!)</span>
      │   └───<span className="text-accent">Temp</span> <span className="text-muted-foreground">(Mostly regrets and cookie crumbs)</span>
      └───<span className="text-accent">Users</span>
          └───<span className="text-accent">Hacker</span>
              ├───<span className="text-accent">Desktop</span> <span className="text-muted-foreground">(Icon graveyard)</span>
              └───<span className="text-accent">Documents</span> <span className="text-muted-foreground">(Full of empty promises)</span>
     </pre>
    )
  },
   format: {
    description: "Formats a drive. Don't actually try this.",
    usage: 'c:',
    handler: (args) => {
        if (args[0]?.toLowerCase() === 'c:') {
             return (
                <div className="text-destructive">
                    <p className="flex items-center gap-1"><AlertTriangle size={14}/> Formatting C:...</p>
                    <p className="text-yellow-500">Just kidding! Do you really think I'd let you do that?</p>
                    <p className="text-muted-foreground">This is a simulation, remember? No actual drives were harmed.</p>
                    <p>Consider this a warning. Don't try sketchy commands.</p>
                </div>
            );
        }
        return <span className="text-red-500">Invalid target for format. Expected 'format c:'. Or better yet, don't.</span>;
    }
   },
    whoami: {
        description: 'Displays the current user (probably you).',
        handler: () => (
            <div className="flex items-center gap-1">
                <UserCircle size={14} className="text-accent"/> <span className="text-muted-foreground">nt authority\hacker (You, probably)</span>
            </div>
        )
    }
};

// --- Component Implementation ---

export function CMD() {
  const [history, setHistory] = useState<CommandHistoryItem[]>([]);
  const [input, setInput] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1); // For command history navigation
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastCommandIdRef = useRef(0);

   // Add welcome message on initial mount
    useEffect(() => {
        setHistory([{ id: lastCommandIdRef.current++, input: '', output: <pre className="whitespace-pre-wrap text-xs">{welcomeMessage}</pre> }]);
    }, []);


  const scrollToBottom = () => {
    // Needs slight delay to ensure DOM update completes
    setTimeout(() => {
        if (scrollAreaRef.current) {
          const scrollViewport = scrollAreaRef.current.querySelector('div[style*="overflow: scroll"]');
          if(scrollViewport) {
              scrollViewport.scrollTop = scrollViewport.scrollHeight;
          }
        }
    }, 50);
  };

   useEffect(() => {
    scrollToBottom();
  }, [history]); // Scroll whenever history changes

   useEffect(() => {
     inputRef.current?.focus();
   }, []); // Focus input on initial load

   // Function to update output for async commands (like 'hack')
    const updateCommandOutput = (commandId: number, output: React.ReactNode) => {
        setHistory(prev => prev.map(item =>
            item.id === commandId ? { ...item, output } : item
        ));
    };


  const addHistoryEntry = async (commandInput: string) => {
     const commandId = lastCommandIdRef.current++;
     const initialEntry: CommandHistoryItem = { id: commandId, input: commandInput, output: 'Processing...' };

     if (commandInput.toLowerCase().trim() === 'cls') {
        setHistory([{ id: lastCommandIdRef.current++, input: '', output: <pre className="whitespace-pre-wrap text-xs">HackerTyper OS [Version 0.1.alpha-AF]\n\n</pre> }]);
        setInput('');
        setHistoryIndex(-1); // Reset history index on clear
        return;
     }

     setHistory(prev => [...prev, initialEntry]);
     setInput('');
     setHistoryIndex(-1); // Reset history index after submitting

     const [commandName, ...args] = commandInput.trim().split(/\s+/);
     const commandDef = commandDefinitions[commandName.toLowerCase()];

     let outputResult: React.ReactNode;
     if (commandDef) {
         try {
            // Await the handler, passing the updater function
            const result = await commandDef.handler(args, (newOutput) => updateCommandOutput(commandId, newOutput));
            outputResult = result;
         } catch (error) {
             console.error("Command execution error:", error);
             outputResult = <span className="text-destructive">Error executing command: {(error as Error).message}</span>;
         }
     } else if (commandInput.trim()) {
         outputResult = `"${commandName}" is not recognized as an internal or external command, operable program or batch file. Try 'help'.`;
     } else {
         outputResult = ''; // Handle empty enter press - just a new line
     }

      // Final update for the command entry if handler didn't use updateCommandOutput
      updateCommandOutput(commandId, outputResult);

  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const commandHistory = history.filter(item => item.input).map(item => item.input); // Get only actual commands entered

    if (event.key === 'Enter') {
      addHistoryEntry(input);
    } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (commandHistory.length > 0) {
            const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
            setHistoryIndex(newIndex);
            setInput(commandHistory[newIndex]);
        }
    } else if (event.key === 'ArrowDown') {
        event.preventDefault();
         if (historyIndex !== -1) {
            const newIndex = Math.min(commandHistory.length, historyIndex + 1);
            if (newIndex === commandHistory.length) {
                 setHistoryIndex(-1); // Reached end, clear input
                 setInput('');
            } else {
                 setHistoryIndex(newIndex);
                 setInput(commandHistory[newIndex]);
            }
        }
    } else if (event.key === 'Tab') {
        // Basic autocomplete suggestion (could be expanded)
        event.preventDefault();
        const currentInputLower = input.toLowerCase();
        const possibleCommands = Object.keys(commandDefinitions).filter(cmd => cmd.startsWith(currentInputLower));
        if (possibleCommands.length === 1) {
            setInput(possibleCommands[0] + ' '); // Autocomplete with space
        } else if (possibleCommands.length > 1) {
            // Show possible completions if multiple match
             const completionsOutput = (
                 <div>
                     Possible completions:<br/>
                     <span className="text-accent">{possibleCommands.join('   ')}</span>
                 </div>
             );
            const commandId = lastCommandIdRef.current++;
             setHistory(prev => [...prev, { id: commandId, input: '', output: completionsOutput }]);
        }
    }
  };

   // Focus input when clicking anywhere in the terminal window
   const focusInput = () => {
     inputRef.current?.focus();
   };

  return (
    <div className="h-full flex flex-col bg-black text-foreground p-1 font-mono text-sm cursor-text border border-primary/30 rounded-sm" onClick={focusInput}>
      <ScrollArea ref={scrollAreaRef} className="flex-grow mb-1 pr-2 text-xs">
        {history.map((item) => (
          <div key={item.id} className="mb-1">
            {item.input && (
              <div className="flex items-center whitespace-pre-wrap">
                <span className="text-accent mr-1 shrink-0">C:\Users\Hacker&gt;</span>
                <span className="flex-grow break-words">{item.input}</span>
              </div>
            )}
             {item.output && (
                 <div className="output-area whitespace-pre-wrap pl-1 pt-0.5">
                    {typeof item.output === 'string' ? <span className="text-muted-foreground">{item.output}</span> : item.output}
                 </div>
             )}
          </div>
        ))}
      </ScrollArea>
      <div className="flex items-center pt-1 border-t border-primary/20" >
        <span className="text-accent mr-1 shrink-0 text-xs">C:\Users\Hacker&gt;</span>
        <Input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="flex-grow bg-transparent border-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-5 text-xs caret-primary font-mono"
          spellCheck="false"
          autoComplete="off"
          autoCapitalize="none"
        />
      </div>
    </div>
  );
}
