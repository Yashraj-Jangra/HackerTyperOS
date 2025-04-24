
'use client';

import React, { useState, useRef, useEffect, KeyboardEvent, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';

const welcomeMessage = `
HackerTyper OS [Version 0.1.alpha-AF]
(c) 2024 Totally Legit Corp. All rights reserved.

WARNING: This system is for authorized personnel only.
Actually, just kidding. Type 'help' for fake commands.

`;

interface HistoryItem {
  input: string;
  output: React.ReactNode;
  timestamp: number;
}

// Component to simulate typewriter effect
const TypewriterOutput: React.FC<{ text: React.ReactNode }> = ({ text }) => {
  const [displayedText, setDisplayedText] = useState<string>('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const fullTextRef = useRef<string>('');

   // Convert ReactNode to string for typing effect
   useEffect(() => {
        if (typeof text === 'string') {
            fullTextRef.current = text;
        } else {
             // Basic conversion for simple ReactNode structures
             // This might need improvement for complex nodes
             const renderToString = (node: React.ReactNode): string => {
                 if (typeof node === 'string') return node;
                 if (typeof node === 'number') return String(node);
                 if (Array.isArray(node)) return node.map(renderToString).join('');
                 if (React.isValidElement(node) && node.props.children) {
                    return renderToString(node.props.children);
                 }
                 return '';
             };
             fullTextRef.current = renderToString(text).replace(/<br\s*\/?>/gi, '\n'); // Handle breaks
        }
        setCurrentIndex(0);
        setDisplayedText('');
   }, [text]);


  useEffect(() => {
    if (currentIndex < fullTextRef.current.length) {
      const timeoutId = setTimeout(() => {
        setDisplayedText((prev) => prev + fullTextRef.current[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 5); // Adjust speed as needed
      return () => clearTimeout(timeoutId);
    }
  }, [currentIndex, text]);

  // Render preserving whitespace and newlines
  return <pre className="whitespace-pre-wrap text-xs">{displayedText}</pre>;
};


const commandOutputs: { [key: string]: (args: string[]) => React.ReactNode } = {
  help: () => (
    <div>
      Available commands:<br />
      <span className="text-accent">help</span>     - Displays this message<br />
      <span className="text-accent">cls</span>      - Clears the screen (mostly)<br />
      <span className="text-accent">dir</span>      - Lists fake files<br />
      <span className="text-accent">ping</span> [target] - Pings a target (sends virtual good vibes)<br />
      <span className="text-accent">hack</span> [target] - Initiates elite hacking sequence<br />
      <span className="text-accent">matrix</span>   - Enter the Matrix (visually)<br />
      <span className="text-accent">sysinfo</span>  - Displays sarcastic system info<br />
      <span className="text-accent">ipconfig</span> - Shows fake network config<br />
      <span className="text-accent">netstat</span>  - Shows fake network connections<br />
      <span className="text-accent">echo</span> [text]   - Repeats what you say<br />
      <span className="text-accent">tree</span>     - Shows a directory tree (of nonsense)<br />
      <span className="text-accent">format</span> c:   - Definitely don't try this.<br />
      <span className="text-accent">exit</span>     - Closes this terminal (for real!)<br />
    </div>
  ),
  cls: () => '', // Special handling in addHistory
  dir: () => (
    <div>
      Volume in drive C has no label.<br />
      Volume Serial Number is DEAD-BEEF<br /><br />
      Directory of C:\\Users\\Hacker<br /><br />
      04/01/2024 13:37    &lt;DIR&gt;          .<br />
      04/01/2024 13:37    &lt;DIR&gt;          ..<br />
      03/15/2024 10:00         1,024 secrets.txt<br />
      03/20/2024 11:11         4,096 important_stuff.zip<br />
      04/01/2024 09:00           512 DefinitelyNotAKeylogger.exe<br />
      01/01/1999 00:01  10,485,760 BigFile.dat<br />
      10/28/2024 08:00         2,048 cat_pictures.rar<br />
      10/28/2024 08:01             0 credentials.txt.encrypted<br />
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 6 File(s)     10,493,440 bytes<br />
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 2 Dir(s)  999,999,999,999 bytes free (estimated)<br />
    </div>
  ),
  ping: (args) => {
    const target = args[0] || 'localhost';
    return (
      <div>
        Pinging {target} [1337::cafe:babe] with 32 bytes of data:<br />
        Reply from {target}: bytes=32 time&lt;1ms TTL=∞ (Good vibes received!)<br />
        Reply from {target}: bytes=32 time&lt;1ms TTL=∞ (Target acknowledges your existence)<br />
        Reply from {target}: bytes=32 time&lt;1ms TTL=∞ (Connection spiritually stable)<br />
        Request timed out. (Target got bored)<br />
        <br />
        Ping statistics for {target}:<br />
        Packets: Sent = 4, Received = 3, Lost = 1 (25% loss - lost in the void),<br />
        Approximate round trip times in milli-seconds:<br />
        Minimum = 0ms, Maximum = 0ms, Average = 0ms (It's all in your head)
      </div>
    );
  },
   hack: (args) => {
      const target = args[0] || 'the_mainframe';
      return (
        <div>
            Initiating advanced persistent annoyance on {target}...<br/>
            [+] Bypassing firewall with social engineering... SUCCESS (Asked nicely)<br/>
            [+] Exploiting vulnerability CVE-2024-1337 (Imaginary Zero-Day)... SUCCESS<br/>
            [+] Gaining root access via buffer overflow of kindness... SUCCESS<br/>
            [+] Planting backdoor: `alias shutdown='echo \\"Not today!\\"'`... SUCCESS<br/>
            [+] Downloading secrets... FAILED (Target has no secrets, only dad jokes)<br/>
            <span className="text-destructive">[-] Target security system detected fun. Deploying countermeasures...</span><br/>
            Hack finished. Target is now slightly more secure and confused.
        </div>
      );
    },
  matrix: () => {
      // Trigger a visual effect - could be a CSS class toggle on the body or window
      return (
        <div>
            <p className="text-accent font-bold text-lg mb-2">Wake up, Neo...</p>
            <p>The Matrix simulation is currently undergoing maintenance.</p>
            <p>Please imagine green characters falling down your screen while listening to techno.</p>
            <pre className="mt-2 text-xs text-primary/80 animate-pulse">
                01101110 01100101 01101111<br/>
                00100000 01101001 01110011<br/>
                00100000 01110100 01101000<br/>
                01100101 00100000 01101111<br/>
                01101110 01100101 00101110
            </pre>
        </div>
      );
  },
   sysinfo: () => (
    <div>
      <span className="text-accent font-bold">System Information:</span><br />
      OS Name:           HackerTyper OS (Definitely Not Windows 1337)<br />
      Version:           0.1 (Build 42, Caffeinated Edition)<br />
      Processor:         Quantum Potato Chip @ 5.0 GHz (Turbo Boost to 9001 GHz)<br />
      BIOS Version:      TotallyLegit BIOS v6.9, 4/20/1999<br />
      Installed RAM:     1.00 TB (Downloaded from The Pirate Bay)<br />
      Available RAM:     0.99 TB (Chrome ate the rest)<br />
      System Type:       64-bit Astral Projection Capable<br />
      Network Card(s):   1 Card(s) Installed.<br />
      &nbsp;&nbsp;&nbsp;[01]: Tin Foil Hat v2.0 Wireless Adapter (Status: Connected to the mothership)<br />
      Disk Space:        C: 10 PB Used, 9999 PB Free (Infinite Storage Glitch Enabled)<br />
      Security Status:   Firewall: ON (Made of hopes and dreams), Antivirus: Maybe?
    </div>
  ),
   ipconfig: () => (
     <div>
        <span className="text-accent font-bold">Network Configuration:</span><br /><br />
        Tin Foil Hat Wireless LAN adapter Wi-Fi:<br /><br />
        &nbsp;&nbsp;&nbsp;Connection-specific DNS Suffix . : home.local.matrix<br />
        &nbsp;&nbsp;&nbsp;Link-local IPv6 Address . . . . . : fe80::dead:beef:cafe:babe%13<br />
        &nbsp;&nbsp;&nbsp;IPv4 Address. . . . . . . . . . . : 192.168.1.137<br />
        &nbsp;&nbsp;&nbsp;Subnet Mask . . . . . . . . . . . : 255.255.255.0 (Probably)<br />
        &nbsp;&nbsp;&nbsp;Default Gateway . . . . . . . . . : 192.168.1.1 (The Router Overlord)<br /><br />
        Tunnel adapter Teredo Tunneling Pseudo-Interface:<br /><br />
        &nbsp;&nbsp;&nbsp;Connection-specific DNS Suffix . :<br />
        &nbsp;&nbsp;&nbsp;IPv6 Address. . . . . . . . . . . : 2001:0:xxxx:xxxx::xxxx:xxxx<br />
        &nbsp;&nbsp;&nbsp;Link-local IPv6 Address . . . . . : fe80::xxxx:xxxx:xxxx:xxxx%XX<br />
        &nbsp;&nbsp;&nbsp;Default Gateway . . . . . . . . . : :: (Lost in Hyperspace)<br />
     </div>
   ),
   netstat: () => (
        <div>
            <span className="text-accent font-bold">Active Connections:</span><br /><br />
            Proto&nbsp;&nbsp;Local Address&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Foreign Address&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;State<br />
            TCP&nbsp;&nbsp;&nbsp;&nbsp;192.168.1.137:49152&nbsp;&nbsp;&nbsp;&nbsp;the_mainframe:https&nbsp;&nbsp;&nbsp;&nbsp;ESTABLISHED (Definitely)<br />
            TCP&nbsp;&nbsp;&nbsp;&nbsp;192.168.1.137:49153&nbsp;&nbsp;&nbsp;&nbsp;cat-memes.com:http&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;CLOSE_WAIT (Waiting for more cats)<br />
            TCP&nbsp;&nbsp;&nbsp;&nbsp;192.168.1.137:49154&nbsp;&nbsp;&nbsp;&nbsp;fbi-surveillance-van:ftp&nbsp;&nbsp;LISTENING (Just kidding... unless?)<br />
            TCP&nbsp;&nbsp;&nbsp;&nbsp;192.168.1.137:50000&nbsp;&nbsp;&nbsp;&nbsp;localhost:50001&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ESTABLISHED (Talking to myself)<br />
            UDP&nbsp;&nbsp;&nbsp;&nbsp;0.0.0.0:666&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*.*&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(Broadcasting secrets)<br />
            UDP&nbsp;&nbsp;&nbsp;&nbsp;[::]:1337&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*.*&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(Elite P2P connection)<br />
        </div>
   ),
  echo: (args) => args.join(' ') || 'Echo... echo... echo... Is anyone out there?',
  tree: () => (
     <pre className="text-xs">
Folder PATH listing for Volume DEAD-BEEF
Volume serial number is 1337-4200
C:.
├───Program Files
│   └───TotallyLegalHacks
│       ├───Binaries
│       │   └───hack.exe
│       └───Scripts
│           └───annoy.js
├───Windows
│   ├───System32      (DO NOT DELETE - Contains the OS's fragile ego)
│   │   └───drivers
│   │       └───beep.sys (The sound of progress)
│   ├───Fonts         (Mostly Comic Sans)
│   └───Temp          (Where good intentions go to die)
└───Users
    └───Hacker
        ├───Desktop   (Icon graveyard)
        ├───Documents (Memes and manifestos)
        │   └───Top_Secret
        │       └───plan_b.txt (If plan A fails, panic)
        └───Downloads (Digital hoarding central)
            └───More_RAM.zip (Seems legit)
     </pre>
  ),
   format: (args) => {
        if (args[0]?.toLowerCase() === 'c:') {
             return (
                <div className="text-destructive">
                    <p>ERROR: Command 'format c:' requires administrator privileges and a sacrifice to the tech gods.</p>
                    <p>Just kidding! But seriously, formatting C: would be bad.</p>
                    <p>This simulation has safeguards against catastrophic user impulses.</p>
                    <p className="text-yellow-500">Consider this your final warning. Try 'help' instead.</p>
                </div>
            );
        }
        return "Invalid target for format. Syntax: format <drive_letter>:. Example: 'format c:'. Or better yet, don't.";
    },
     exit: () => 'exit', // Special handling in handleKeyDown
};

// Function to get the currently active window (assumed to be passed or accessible)
// Placeholder - replace with actual logic if needed
const getActiveWindow = () => ({ id: 'cmd-window' }); // Example ID

export function CMD() {
  const [history, setHistory] = useState<HistoryItem[]>([{ input: '', output: welcomeMessage, timestamp: Date.now() }]);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1); // -1 means new command
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
      if (viewportRef.current) {
          viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
      }
  }, []);

   useEffect(() => {
    scrollToBottom();
  }, [history, scrollToBottom]);

   useEffect(() => {
     // Focus input on initial load and when history changes (after a command)
     inputRef.current?.focus();
   }, []); // Only focus on initial mount

   const addHistory = (command: string, output: React.ReactNode) => {
        if (command.toLowerCase().trim() === 'cls') {
            setHistory([{ input: '', output: `HackerTyper OS [Version 0.1.alpha-AF]\n\n`, timestamp: Date.now() }]);
        } else {
            setHistory(prev => [...prev, { input: command, output, timestamp: Date.now() }]);
        }
         // Add command to command history only if it's not empty
         if (command.trim()) {
             // Avoid adding duplicate consecutive commands
             if (commandHistory[commandHistory.length - 1] !== command.trim()) {
                 setCommandHistory(prev => [...prev, command.trim()]);
             }
         }
         setHistoryIndex(-1); // Reset history index after executing command
   };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

   const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        const key = event.key;

        if (key === 'Enter') {
            event.preventDefault();
            const trimmedInput = input.trim();
            const [command, ...args] = trimmedInput.split(/\s+/);
             const commandFunc = commandOutputs[command.toLowerCase()];

            if (command.toLowerCase() === 'exit') {
                 // Simulate closing the window - need access to window management context/function
                 console.log("Attempting to close window..."); // Placeholder
                 // Find the window and call its close function if possible
                 // This requires lifting state up or using a context
                  const closeButton = document.querySelector(`[data-window-id="${getActiveWindow().id}"] [aria-label="Close"]`) as HTMLElement | null;
                  closeButton?.click(); // Simulate click on close button - might be brittle
                 return;
            }

            const output = commandFunc
                ? commandFunc(args)
                : trimmedInput // Only show error if input wasn't empty
                  ? `"${command}" is not recognized as an internal or external command, operable program or batch file. Maybe try 'help'?`
                  : ''; // No output for empty enter

            addHistory(trimmedInput, output);
            setInput('');

        } else if (key === 'ArrowUp') {
             event.preventDefault();
             if (commandHistory.length > 0) {
                const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
                setHistoryIndex(newIndex);
                setInput(commandHistory[newIndex]);
             }
        } else if (key === 'ArrowDown') {
             event.preventDefault();
             if (commandHistory.length > 0 && historyIndex !== -1) {
                const newIndex = Math.min(commandHistory.length - 1, historyIndex + 1);
                 if (newIndex >= historyIndex && newIndex < commandHistory.length -1) {
                    setHistoryIndex(newIndex);
                    setInput(commandHistory[newIndex]);
                 } else {
                     // If we are at the end or beyond, clear input and reset index
                    setHistoryIndex(-1);
                    setInput('');
                 }
             }
        } else if (key === 'Tab') {
             event.preventDefault();
             // Basic autocomplete simulation (very naive)
             const currentInput = input.toLowerCase();
             const matchingCommands = Object.keys(commandOutputs).filter(cmd => cmd.startsWith(currentInput));
             if (matchingCommands.length === 1) {
                 setInput(matchingCommands[0] + ' '); // Autocomplete with space
             } else if (matchingCommands.length > 1) {
                 // Show possible completions
                  addHistory(input, (
                      <div className="text-muted-foreground">
                         {matchingCommands.join('   ')}
                      </div>
                  ));
                 setInput(input); // Keep current input
             }
        }
   };

   // Focus input when clicking anywhere in the terminal window
   const focusInput = useCallback(() => {
     inputRef.current?.focus();
   }, []);

  return (
    <div
      className="h-full flex flex-col bg-black text-foreground p-1 font-mono text-xs cursor-text"
      onClick={focusInput}
      data-component="cmd-terminal" // Identifier for potential targeting
    >
      <ScrollArea ref={scrollAreaRef} className="flex-grow mb-1 pr-2" viewportRef={viewportRef}>
        {history.map((item, index) => (
          <div key={item.timestamp + '-' + index}>
            {item.input !== undefined && item.input !== null && index > 0 && ( // Don't show prompt for initial welcome message
              <div className="whitespace-pre-wrap">
                <span className="text-accent">C:\Users\Hacker&gt;</span>{item.input}
              </div>
            )}
             {item.output && (
                <div className="output-block">
                    {/* Conditionally apply typewriter effect */}
                     {typeof item.output === 'string' || typeof item.output === 'number' ? (
                        <TypewriterOutput text={item.output} />
                     ) : (
                        <div className="whitespace-pre-wrap">{item.output}</div>// Render complex ReactNode directly
                     )}
                 </div>
             )}
          </div>
        ))}
      </ScrollArea>
      <div className="flex items-center mt-1 shrink-0">
        <span className="text-accent mr-1 shrink-0">C:\Users\Hacker&gt;</span>
        <div className="relative flex-grow">
             <Input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className={cn(
                    "flex-grow bg-transparent border-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-5 text-xs caret-transparent", // Hide default caret
                    "font-mono" // Ensure monospace font
                )}
                spellCheck="false"
                autoComplete="off"
                />
             {/* Custom blinking cursor */}
             <span className="cmd-cursor absolute left-0 top-0 pointer-events-none h-full flex items-center" style={{ transform: `translateX(${input.length * 6.5}px)` }}></span> {/* Adjust multiplier based on font size/char width */}
        </div>
      </div>
    </div>
  );
}
