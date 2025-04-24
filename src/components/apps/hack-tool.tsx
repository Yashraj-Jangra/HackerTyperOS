'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Terminal, CheckCircle, XCircle, AlertTriangle, Hourglass } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HackToolProps {
  title: string;
  messages: string[];
  initialDelay?: number;
  messageDelay?: number;
}

interface DisplayedMessage {
    id: number;
    text: string;
    status: 'pending' | 'success' | 'error' | 'warning' | 'done';
}

export function HackTool({
  title,
  messages,
  initialDelay = 500, // Delay before the first message appears
  messageDelay = 1000 // Delay between messages
}: HackToolProps) {
  const [displayedMessages, setDisplayedMessages] = useState<DisplayedMessage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

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
  }, [displayedMessages]);

  useEffect(() => {
    // Reset on mount or if messages change (though unlikely for this app)
    setDisplayedMessages([]);
    setCurrentIndex(0);

    // Start the message sequence after initial delay
    const initialTimeout = setTimeout(() => {
      if (messages.length > 0) {
         setCurrentIndex(1);
         const firstMessageText = messages[0];
         const status = getStatusFromMessage(firstMessageText);
         setDisplayedMessages([{ id: 0, text: firstMessageText, status: status === 'pending' ? 'success' : status }]); // Assume first usually succeeds unless error
      }
    }, initialDelay);

    return () => clearTimeout(initialTimeout);

  }, [messages, initialDelay]); // Rerun if messages prop changes


   useEffect(() => {
     if (currentIndex > 0 && currentIndex < messages.length) {
       const messageTimeout = setTimeout(() => {
         const newMessageText = messages[currentIndex];
         const status = getStatusFromMessage(newMessageText);
         setDisplayedMessages(prev => [...prev, { id: currentIndex, text: newMessageText, status }]);
         setCurrentIndex(prev => prev + 1);
       }, messageDelay * (Math.random() * 0.5 + 0.75)); // Add slight randomness to delay

       return () => clearTimeout(messageTimeout);
     } else if (currentIndex >= messages.length && messages.length > 0) {
        // Optionally mark the last message as 'done' or a specific status after a final delay
        const finalDelay = setTimeout(() => {
             setDisplayedMessages(prev => prev.map((msg, index) =>
                 index === prev.length - 1 ? { ...msg, status: getStatusFromMessage(msg.text, true) } : msg
             ));
        }, messageDelay);
         return () => clearTimeout(finalDelay);
     }
   }, [currentIndex, messages, messageDelay]);

   const getStatusFromMessage = (message: string, isFinal: boolean = false): DisplayedMessage['status'] => {
        const lowerCaseMessage = message.toLowerCase();
        if (lowerCaseMessage.includes('error') || lowerCaseMessage.includes('failed') || lowerCaseMessage.includes('denied') || lowerCaseMessage.includes('aborted')) {
            return 'error';
        } else if (lowerCaseMessage.includes('warning') || lowerCaseMessage.includes('unstable')) {
            return 'warning';
        } else if (lowerCaseMessage.includes('success') || lowerCaseMessage.includes('complete') || lowerCaseMessage.includes('finished') || lowerCaseMessage.includes('initiated') || lowerCaseMessage.includes('loaded')) {
            return 'success';
        } else if (isFinal || lowerCaseMessage.includes('annoyed') || lowerCaseMessage.includes('kidding') || lowerCaseMessage.includes('happened')) {
             return 'done'; // Special status for final funny messages
        }
        return 'pending'; // Default for intermediate steps
    }

    const getIconForStatus = (status: DisplayedMessage['status']) => {
        switch (status) {
            case 'success': return <CheckCircle size={14} className="text-primary shrink-0"/>;
            case 'error': return <XCircle size={14} className="text-destructive shrink-0"/>;
            case 'warning': return <AlertTriangle size={14} className="text-yellow-500 shrink-0"/>;
            case 'done': return <Terminal size={14} className="text-accent shrink-0"/>;
            case 'pending':
            default: return <Hourglass size={14} className="text-muted-foreground animate-spin shrink-0"/>;
        }
    }

  return (
    <div className="h-full flex flex-col bg-black text-foreground p-1 font-mono text-xs">
      <div className="text-accent border-b border-primary/20 pb-1 mb-1 select-none">{`> Running ${title}...`}</div>
      <ScrollArea ref={scrollAreaRef} className="flex-grow pr-2">
        {displayedMessages.map((msg) => (
          <div key={msg.id} className={cn("flex items-start gap-2 mb-0.5",
            msg.status === 'error' ? 'text-destructive' :
            msg.status === 'warning' ? 'text-yellow-500' :
            msg.status === 'success' ? 'text-primary' :
            msg.status === 'done' ? 'text-accent' :
             'text-muted-foreground'
          )}>
            {getIconForStatus(msg.status)}
            <span className="whitespace-pre-wrap break-words">{msg.text}</span>
          </div>
        ))}
        {currentIndex < messages.length && messages.length > 0 && (
           <div className="flex items-start gap-2 text-muted-foreground animate-pulse">
                <Hourglass size={14} className="animate-spin shrink-0"/>
                <span>Processing...</span>
           </div>
        )}
         {currentIndex >= messages.length && messages.length > 0 && (
           <div className="flex items-start gap-2 text-accent mt-2">
                <Terminal size={14} className="shrink-0"/>
                <span>Execution finished. Press any key to exit (not really).</span>
           </div>
        )}
      </ScrollArea>
    </div>
  );
}
