'use client';

import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Terminal } from 'lucide-react';

const welcomeMessage = `
HackerTyper OS [Version 0.1.alpha-AF]
(c) 2024 Totally Legit Corp. All rights reserved.

WARNING: This system is for authorized personnel only.
Actually, just kidding. Type 'help' for fake commands.

`;

interface CommandHistory {
  input: string;
  output: React.ReactNode;
}

const commandOutputs: { [key: string]: (args: string[]) => React.ReactNode } = {
  help: () => (
    <div>
      Available commands:<br />
      <span className="text-accent">help</span> - Displays this message<br />
      <span className="text-accent">cls</span> - Clears the screen (mostly)<br />
      <span className="text-accent">dir</span> - Lists fake files<br />
      <span className="text-accent">ping</span> [target] - Pings a target (sends virtual good vibes)<br />
      <span className="text-accent">hack</span> [target] - Initiates elite hacking sequence<br />
      <span className="text-accent">matrix</span> - Enter the Matrix (visually)<br />
      <span className="text-accent">sysinfo</span> - Displays sarcastic system info<br />
      <span className="text-accent">echo</span> [text] - Repeats what you say<br />
      <span className="text-accent">tree</span> - Shows a directory tree (of nonsense)<br />
       <span className="text-accent">format</span> c: - Definitely don't try this.<br />
    </div>
  ),
  cls: () => '', // Special handling in addHistory
  dir: () => (
    <div>
      Directory of C:\\Users\\Hacker<br />
      04/01/2024 13:37 &lt;DIR&gt; .<br />
      04/01/2024 13:37 &lt;DIR&gt; ..<br />
      03/15/2024 10:00 1,024 secrets.txt<br />
      03/20/2024 11:11 4,096 important_stuff.zip<br />
      04/01/2024 09:00 512 DefinitelyNotAKeylogger.exe<br />
      01/01/1999 00:01 10,485,760 BigFile.dat<br />
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 4 File(s) 10,491,392 bytes<br />
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 2 Dir(s) 999,999,999,999 bytes free (estimated)
    </div>
  ),
  ping: (args) => {
    const target = args[0] || 'localhost';
    return (
      <div>
        Pinging {target} with 32 bytes of data:<br />
        Reply from {target}: bytes=32 time&lt;1ms TTL=∞ (Good vibes received!)<br />
        Reply from {target}: bytes=32 time&lt;1ms TTL=∞ (Target acknowledges your existence)<br />
        Reply from {target}: bytes=32 time&lt;1ms TTL=∞ (Connection spiritually stable)<br />
        Reply from {target}: bytes=32 time&lt;1ms TTL=∞ (Ping successful, target feels slightly better)<br />
        <br />
        Ping statistics for {target}:<br />
        Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),<br />
        Approximate round trip times in milli-seconds:<br />
        Minimum = 0ms, Maximum = 0ms, Average = 0ms (It's all in your head)
      </div>
    );
  },
   hack: (args) => {
      const target = args[0] || 'the_mainframe';
      // Simulate a hacking sequence with delays - requires useEffect for delayed output
      // For simplicity here, just return the final message. A more complex version would update state over time.
      return (
        <div>
            Initiating hack on {target}...<br/>
            [+] Bypassing firewall... SUCCESS<br/>
            [+] Exploiting vulnerability CVE-2024-1337... SUCCESS<br/>
            [+] Gaining root access... SUCCESS<br/>
            [+] Downloading secrets... FAILED (Target has no secrets, only cat pictures)<br/>
            <span className="text-destructive">[-] Hack attempt logged. Disconnecting...</span><br/>
            Hack finished. Nothing really happened.
        </div>
      );
    },
  matrix: () => {
      // Trigger a visual effect - could be a CSS class toggle on the body or window
      // For simplicity, return a message.
      return (
        <div>
            <p className="text-accent font-bold text-lg mb-2">Wake up, Neo...</p>
            <p>The Matrix effect is currently under maintenance.</p>
            <p>Please imagine green characters falling down your screen.</p>
            <pre className="mt-2 text-xs">
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
      OS Name: Definitely Not Windows 1337<br />
      Version: 0.1 (Pre-Alpha, Caffeinated Edition)<br />
      Processor: Quantum Potato Chip @ 5 GHz (estimated)<br />
      Installed Memory (RAM): 1 TB (Downloaded from PirateBay)<br />
      System Type: 64-bit Astral Projection Capable<br />
      Network Card(s): Tin Foil Hat v2.0<br />
      Available Disk Space: Running low on sarcasm...
    </div>
  ),
  echo: (args) => args.join(' ') || 'Echo... echo... echo...',
  tree: () => (
     <pre className="text-xs">
      C:.
      ├───Program Files
      │   └───TotallyLegalHacks
      │       └───hack.exe
      ├───Windows
      │   ├───System32 (Don't delete!)
      │   └───Temp (Mostly regrets)
      └───Users
          └───Hacker
              ├───Desktop
              └───Documents (Full of empty promises)
     </pre>
  ),
   format: (args) => {
        if (args[0]?.toLowerCase() === 'c:') {
             return (
                <div className="text-destructive">
                    <p>Formatting C:...</p>
                    <p>Just kidding! Do you really think I'd let you do that?</p>
                    <p>This is a simulation, remember? No real damage allowed.</p>
                    <p>Consider this a warning. Don't try sketchy commands.</p>
                </div>
            );
        }
        return "Invalid target for format. Try 'format c:'. Or better yet, don't.";
    },
};

export function CMD() {
  const [history, setHistory] = useState<CommandHistory[]>([{ input: '', output: welcomeMessage }]);
  const [input, setInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('div[style*="overflow: scroll"]');
      if(scrollViewport) {
          scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  };

   useEffect(() => {
    scrollToBottom();
  }, [history]);

   useEffect(() => {
     // Focus input on initial load and when history changes (after a command)
     inputRef.current?.focus();
   }, [history]);

  const addHistory = (command: string, output: React.ReactNode) => {
     if (command.toLowerCase().trim() === 'cls') {
       setHistory([{ input: '', output: `HackerTyper OS [Version 0.1.alpha-AF]\n\n` }]);
     } else {
       setHistory(prev => [...prev, { input: command, output }]);
     }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const trimmedInput = input.trim();
      if (trimmedInput) {
        const [command, ...args] = trimmedInput.split(/\s+/);
        const commandFunc = commandOutputs[command.toLowerCase()];
        const output = commandFunc ? commandFunc(args) : `"${command}" is not recognized as an internal or external command, operable program or batch file. Maybe try 'help'?`;
        addHistory(trimmedInput, output);
        setInput('');
      } else {
         // Add history for empty input to create a new line
         addHistory('', '');
      }
    }
     // Basic history navigation could be added here (Up/Down arrows)
  };

   // Focus input when clicking anywhere in the terminal window
   const focusInput = () => {
     inputRef.current?.focus();
   };

  return (
    <div className="h-full flex flex-col bg-black text-foreground p-1 font-mono text-xs cursor-text" onClick={focusInput}>
      <ScrollArea ref={scrollAreaRef} className="flex-grow mb-1 pr-2">
        {history.map((item, index) => (
          <div key={index}>
            {item.input && <div className="whitespace-pre-wrap"><span className="text-accent">C:\Users\Hacker&gt;</span>{item.input}</div>}
             {typeof item.output === 'string' ? (
               <div className="whitespace-pre-wrap">{item.output}</div>
             ) : (
               item.output // Render ReactNode directly
             )}
          </div>
        ))}
      </ScrollArea>
      <div className="flex items-center" >
        <span className="text-accent mr-1 shrink-0">C:\Users\Hacker&gt;</span>
        <Input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="flex-grow bg-transparent border-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-5 text-xs caret-primary"
          spellCheck="false"
          autoComplete="off"
        />
      </div>
    </div>
  );
}
