
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Keep tabs for structure within content area
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from '@/components/ui/button';
import { Settings, Cpu, Zap, Eye, ShieldOff, BellRing, Wand2, Activity, WifiOff, BrainCircuit, AlertTriangle, Thermometer } from 'lucide-react'; // More icons
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Helper function for random sarcastic feedback
const getRandomFeedback = (options: string[]) => options[Math.floor(Math.random() * options.length)];

// Type definition for settings
type SettingsKeys = 'osFlavor' | 'ramBooster' | 'hackSpeed' | 'hackTarget' | 'theme' | 'glitchIntensity' | 'firewall' | 'antivirus' | 'notifications' | 'errorFrequency';

interface SystemSettingsState {
    osFlavor: string;
    ramBooster: string;
    hackSpeed: string;
    hackTarget: string;
    theme: string;
    glitchIntensity: number;
    firewall: string;
    antivirus: string;
    notifications: string;
    errorFrequency: boolean;
}

const initialSettings: SystemSettingsState = {
    osFlavor: 'matrix-os',
    ramBooster: 'hamster-wheel',
    hackSpeed: 'hollywood',
    hackTarget: 'toaster',
    theme: 'matrix-green',
    glitchIntensity: 50,
    firewall: 'tin-foil',
    antivirus: 'clippy',
    notifications: 'passive-aggressive',
    errorFrequency: false,
};

type Category = 'overview' | 'config' | 'hacking' | 'visuals' | 'security' | 'annoyance';

export function SystemSettings() {
    const { toast } = useToast();
    const [settings, setSettings] = useState<SystemSettingsState>(initialSettings);
    const [activeCategory, setActiveCategory] = useState<Category>('overview');
    const [applying, setApplying] = useState(false);

    // Move DOM manipulation into useEffect to ensure it runs client-side only
    useEffect(() => {
      const styleExists = document.getElementById('extra-glitch-styles');
      if (!styleExists) {
          const styleSheet = document.createElement("style");
          styleSheet.id = 'extra-glitch-styles';
          styleSheet.innerText = `
              .glitch-effect-heavy { animation: glitch-heavy 0.8s infinite alternate; }
              @keyframes glitch-heavy {
                0%, 100% { transform: translate(0); text-shadow: .07em 0 0 rgba(255,0,0,.75), -.03em -.06em 0 rgba(0,255,0,.75), .03em .06em 0 rgba(0,0,255,.75); }
                25% { transform: translate(2px, -1px); text-shadow: -.07em 0 0 rgba(255,0,0,.75), .03em .06em 0 rgba(0,255,0,.75), -.03em -.06em 0 rgba(0,0,255,.75); }
                50% { transform: translate(-2px, 1px); text-shadow: .07em 0 0 rgba(255,0,0,.75), -.03em -.06em 0 rgba(0,255,0,.75), .03em .06em 0 rgba(0,0,255,.75); }
                75% { transform: translate(1px, -2px); text-shadow: -.07em 0 0 rgba(255,0,0,.75), .03em .06em 0 rgba(0,255,0,.75), -.03em -.06em 0 rgba(0,0,255,.75); }
              }
          `;
          document.head.appendChild(styleSheet);
      }
    }, []); // Empty dependency array ensures this runs only once on mount


    const handleSettingChange = <K extends SettingsKeys>(key: K, value: SystemSettingsState[K]) => {
         setSettings(prev => ({ ...prev, [key]: value }));

         // Debounced feedback could be better, but simple toast for now
         if (key === 'glitchIntensity') {
            return; // Avoid toast for slider changes during drag
         }

         // Sarcastic feedback toasts
         let feedbackOptions: string[] = [];
         switch (key) {
            case 'osFlavor': feedbackOptions = ["OS Flavor set. Don't blame us if it crashes.", "Choice recorded. Prepare for... consequences?", "Interesting OS choice. Very... vintage?"]; break;
            case 'ramBooster': feedbackOptions = ["RAM Booster engaged! Or maybe just placebo.", "Hamster wheel overclocked. Hope he had coffee.", "More RAM downloaded from DefinitelyNotAVirus.com."]; break;
            case 'hackSpeed': feedbackOptions = ["Hack speed adjusted. Remember, patience is a virtue... or is it?", "Hollywood speed enabled. Expect lots of meaningless text.", "Quantum Potato speed? Bold move."]; break;
            case 'hackTarget': feedbackOptions = ["Target selected. Please hack responsibly (or don't).", "Area 51 selected. Say hi to the aliens for us.", "Hacking neighbor's Wi-Fi? We didn't see anything."]; break;
            case 'theme': feedbackOptions = ["Theme applied. Your eyes might disagree.", "Clippy Revival? You asked for it.", "Matrix Green is classic. Good choice... or is it?"]; break;
            case 'firewall': feedbackOptions = ["Firewall updated. May repel mild breezes.", "Tin Foil Hat deployed. 5G protection enabled.", "Brick wall firewall active. Very secure, slightly immobile."]; break;
            case 'antivirus': feedbackOptions = ["Antivirus status updated. Clippy is watching.", "Antivirus expired in 1999 activated. Good luck.", "No antivirus? Living dangerously, I see."]; break;
            case 'notifications': feedbackOptions = ["Notification settings saved. Prepare for annoyance.", "Existential Dread mode activated.", "Passive aggressive notifications enabled. You'll get the hint. Eventually."]; break;
             case 'errorFrequency': feedbackOptions = value ? ["Errors maximized! Good luck clicking anything.", "Ah, embracing chaos, are we?"] : ["Errors minimized. How disappointingly stable.", "Reduced error frequency. Where's the fun in that?"]; break;
            default: feedbackOptions = ["Setting updated. Probably.", "Configuration saved. Maybe.", "Did that do anything? Let's pretend it did."];
         }

         toast({
             title: "Setting Changed",
             description: getRandomFeedback(feedbackOptions),
             variant: Math.random() < 0.1 ? "destructive" : "default",
         });
    };


    const handleSliderChangeCommit = (key: 'glitchIntensity', value: number[]) => {
        const intensity = value[0];
        setSettings(prev => ({ ...prev, [key]: intensity }));

        let intensityDesc = '';
        if (intensity < 20) intensityDesc = "Barely noticeable. Boring!";
        else if (intensity < 70) intensityDesc = "Nice level of visual chaos.";
        else intensityDesc = "Reality unstable! Maximum glitch!";
        toast({
            title: "Glitch Intensity Finalized",
            description: intensityDesc,
        });

        // Apply a temporary visual effect based on intensity
        const glitchClass = intensity > 70 ? 'glitch-effect-heavy' : intensity > 30 ? 'glitch-effect' : '';
        const targetElement = document.querySelector('.settings-content-area'); // Target specific window area
        if (targetElement && glitchClass) {
            targetElement.classList.add(glitchClass);
            setTimeout(() => targetElement.classList.remove(glitchClass), 1500);
        } else if (glitchClass) {
            document.body.classList.add(glitchClass);
            setTimeout(() => document.body.classList.remove(glitchClass), 1500);
        }
    };

    const applySettings = () => {
        setApplying(true);
         toast({
            title: "Applying Settings...",
            description: "System reconfiguration in progress... Please wait (or panic).",
            duration: 2000,
        });

         // Simulate applying settings with a delay
         setTimeout(() => {
            setApplying(false);
            toast({
                title: "Settings Applied!",
                description: getRandomFeedback([
                    "Configuration locked in. System stability decreased by 42%. Good luck!",
                    "Rebooting to 1995... just kidding (mostly). Enjoy the 'improvements'!",
                    "Changes saved. We take no responsibility for the consequences.",
                    "Settings etched into the quantum foam. Probably permanent.",
                    "Applied! If your screen goes black, that's... a feature."
                ]),
                variant: Math.random() > 0.5 ? "default" : "destructive",
                duration: 4000,
            });
            // Simulate system instability after applying
             const glitchClass = settings.glitchIntensity > 50 ? 'glitch-effect-heavy' : 'glitch-effect';
             const targetElement = document.querySelector('.settings-container');
             if(targetElement) {
                 targetElement.classList.add(glitchClass);
                 setTimeout(() => targetElement.classList.remove(glitchClass), 2000);
             }
         }, 1500);
    }

    const resetSettings = () => {
         setSettings(initialSettings);
         toast({
            title: "Settings Reset",
            description: "Reverted to 'factory defaults' (whatever that means here). The chaos was fun though, right?",
            variant: "destructive",
        });
    }

    const navigationItems: { id: Category; label: string; icon: React.ReactNode }[] = [
        { id: 'overview', label: 'Overview', icon: <Activity size={16} /> },
        { id: 'config', label: 'Configuration', icon: <Cpu size={16} /> },
        { id: 'hacking', label: 'Hacking', icon: <Zap size={16} /> },
        { id: 'visuals', label: 'Visuals', icon: <Eye size={16} /> },
        { id: 'security', label: 'Security Theater', icon: <ShieldOff size={16} /> },
        { id: 'annoyance', label: 'Annoyance Controls', icon: <BellRing size={16} /> },
    ];

    return (
        <TooltipProvider>
            <div className="h-full flex text-foreground text-xs p-0 settings-container bg-background">
                {/* Navigation Sidebar */}
                <div className="w-40 h-full bg-card/60 border-r border-primary/30 flex flex-col shrink-0 p-2">
                    <div className="flex items-center gap-2 p-2 border-b border-primary/20 mb-2">
                         <Settings size={18} className="text-accent animate-spin [animation-duration:5s]" />
                         <span className="font-semibold text-sm">Settings</span>
                    </div>
                    <ScrollArea className="flex-grow">
                        <nav className="flex flex-col gap-1">
                            {navigationItems.map(item => (
                                <Button
                                    key={item.id}
                                    variant="ghost"
                                    className={cn(
                                        "justify-start text-xs h-8 px-2 gap-2",
                                        activeCategory === item.id ? "bg-accent/80 text-accent-foreground" : "hover:bg-secondary/50"
                                    )}
                                    onClick={() => setActiveCategory(item.id)}
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </Button>
                            ))}
                        </nav>
                    </ScrollArea>
                     <div className="mt-auto p-2 border-t border-primary/20 space-y-2">
                         <Button variant="destructive" size="sm" className="w-full text-xs h-7" onClick={resetSettings} disabled={applying}>
                           Reset Defaults
                         </Button>
                         <Button variant="default" size="sm" className="w-full text-xs h-7" onClick={applySettings} disabled={applying}>
                            {applying ? "Applying..." : "Apply Settings"}
                         </Button>
                     </div>
                </div>

                {/* Content Area */}
                 <ScrollArea className="flex-grow settings-content-area">
                     <div className="p-4 space-y-6">
                         {/* Overview Section */}
                         {activeCategory === 'overview' && (
                             <Card className="border-primary/30 shadow-inner shadow-primary/10 bg-card/70 backdrop-blur-sm">
                                 <CardHeader>
                                     <CardTitle className="flex items-center gap-2 text-base"><Activity size={18} className="text-primary"/> System Overview</CardTitle>
                                     <CardDescription className="text-xs">A totally accurate snapshot of your elite setup.</CardDescription>
                                 </CardHeader>
                                 <CardContent className="space-y-3 text-xs">
                                    <div className="flex justify-between items-center">
                                        <span className="flex items-center gap-1"><Cpu size={14} /> Current OS Flavor:</span>
                                        <span className="text-accent font-mono p-1 bg-secondary/50 rounded text-[11px]">{settings.osFlavor}</span>
                                    </div>
                                     <div className="flex justify-between items-center">
                                        <span className="flex items-center gap-1"><BrainCircuit size={14} /> RAM Status:</span>
                                         <span className="text-accent font-mono p-1 bg-secondary/50 rounded text-[11px]">{settings.ramBooster === 'download' ? 'Downloading...' : 'Boosted'} ({settings.ramBooster})</span>
                                    </div>
                                    <Separator className="my-2 bg-border/50" />
                                     <div className="flex justify-between items-center">
                                         <span className="flex items-center gap-1"><Thermometer size={14} /> Core Temperature:</span>
                                         <span className="text-destructive font-mono animate-pulse p-1 bg-secondary/50 rounded text-[11px]">{Math.floor(Math.random() * 30 + 95)}°C (Probably Fine™)</span>
                                     </div>
                                      <div className="flex justify-between items-center">
                                         <span className="flex items-center gap-1"><WifiOff size={14} /> Firewall Status:</span>
                                         <span className={cn("font-mono p-1 rounded text-[11px]", settings.firewall === 'hope' ? 'text-yellow-400 bg-yellow-900/30' : 'text-accent bg-secondary/50')}>{settings.firewall}</span>
                                     </div>
                                     <Separator className="my-2 bg-border/50" />
                                     <div className="flex justify-between items-center">
                                         <span className="flex items-center gap-1"><AlertTriangle size={14} /> Current Annoyance Level:</span>
                                         <span className="font-mono p-1 bg-secondary/50 rounded text-[11px]">{settings.errorFrequency ? 'MAXIMUM' : settings.notifications === 'spam' ? 'High' : 'Passive-Aggressive'}</span>
                                     </div>
                                     <div className="text-muted-foreground italic text-[10px] pt-2 text-center">
                                         Warning: System stability is inversely proportional to coolness. Proceed with caution (or don't).
                                     </div>
                                 </CardContent>
                             </Card>
                         )}

                         {/* Configuration Section */}
                        {activeCategory === 'config' && (
                             <Card className="border-primary/30 shadow-inner shadow-primary/10 bg-card/70 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base"><Cpu size={18} className="text-primary"/> System Configuration</CardTitle>
                                    <CardDescription className="text-xs">Tweak the core components (at your own risk).</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="os-flavor">OS Flavor</Label>
                                        <Select value={settings.osFlavor} onValueChange={(v) => handleSettingChange('osFlavor', v)}>
                                            <SelectTrigger id="os-flavor" className="h-8 text-xs">
                                                <SelectValue placeholder="Select OS" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="win98">Windows 98 Ultra Pro Max</SelectItem>
                                                <SelectItem value="linux-kernel">Linux Kernel 420.69</SelectItem>
                                                <SelectItem value="matrix-os">MatrixOS (Recommended)</SelectItem>
                                                <SelectItem value="not-macos">Definitely Not macOS</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="ram-booster">RAM Booster™</Label>
                                        <Select value={settings.ramBooster} onValueChange={(v) => handleSettingChange('ramBooster', v)}>
                                            <SelectTrigger id="ram-booster" className="h-8 text-xs">
                                                <SelectValue placeholder="Boost RAM?" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="download">Download More RAM (Verified Safe™)</SelectItem>
                                                <SelectItem value="hamster-wheel">Overclock Hamster Wheel</SelectItem>
                                                <SelectItem value="sacrifice">Sacrifice CPU Performance</SelectItem>
                                                <SelectItem value="placebo">Placebo Button (Feels Faster!)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                         {/* Hacking Section */}
                        {activeCategory === 'hacking' && (
                            <Card className="border-primary/30 shadow-inner shadow-primary/10 bg-card/70 backdrop-blur-sm">
                                 <CardHeader>
                                     <CardTitle className="flex items-center gap-2 text-base"><Zap size={18} className="text-primary"/> Hacking Protocols</CardTitle>
                                     <CardDescription className="text-xs">Configure your... 'penetration testing' parameters.</CardDescription>
                                 </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="hack-speed">Hack Speed</Label>
                                        <Select value={settings.hackSpeed} onValueChange={(v) => handleSettingChange('hackSpeed', v)}>
                                            <SelectTrigger id="hack-speed" className="h-8 text-xs">
                                                <SelectValue placeholder="Select Speed" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="snail">Snail's Pace (Stealthy)</SelectItem>
                                                <SelectItem value="hollywood">Hollywood Hacker (Looks Cool)</SelectItem>
                                                <SelectItem value="quantum-potato">Quantum Potato (Unpredictable)</SelectItem>
                                                <SelectItem value="instant">Instant (Requires Coffee)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="hack-target">Default Target</Label>
                                        <Select value={settings.hackTarget} onValueChange={(v) => handleSettingChange('hackTarget', v)}>
                                            <SelectTrigger id="hack-target" className="h-8 text-xs">
                                                <SelectValue placeholder="Select Target" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="library">Local Library Catalogue</SelectItem>
                                                <SelectItem value="area51">Area 51 Mainframe (Maybe)</SelectItem>
                                                <SelectItem value="neighbor-wifi">Neighbor's Wi-Fi (Hypothetically)</SelectItem>
                                                <SelectItem value="toaster">A Smart Toaster (Why not?)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Visuals Section */}
                         {activeCategory === 'visuals' && (
                             <Card className="border-primary/30 shadow-inner shadow-primary/10 bg-card/70 backdrop-blur-sm">
                                 <CardHeader>
                                     <CardTitle className="flex items-center gap-2 text-base"><Eye size={18} className="text-primary"/> Visual Shenanigans</CardTitle>
                                     <CardDescription className="text-xs">Make it look cooler (or more broken).</CardDescription>
                                 </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="theme">Theme</Label>
                                        <Select value={settings.theme} onValueChange={(v) => handleSettingChange('theme', v)}>
                                            <SelectTrigger id="theme" className="h-8 text-xs">
                                                <SelectValue placeholder="Select Theme" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="matrix-green">Matrix Green (Classic)</SelectItem>
                                                <SelectItem value="neon-blue">Neon Blue Cyberspace</SelectItem>
                                                <SelectItem value="clippy-revival">Clippy Revival (Painful)</SelectItem>
                                                <SelectItem value="monochrome">Monochrome Despair</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="glitch-intensity" className="flex justify-between items-center">
                                             <span>Glitch Intensity</span>
                                              <span className="text-accent font-mono">{settings.glitchIntensity}%</span>
                                         </Label>
                                        <Slider
                                            id="glitch-intensity"
                                            min={0} max={100} step={1}
                                            value={[settings.glitchIntensity]}
                                            onValueChange={(v) => setSettings(prev => ({ ...prev, glitchIntensity: v[0] }))}
                                            onValueCommit={(v) => handleSliderChangeCommit('glitchIntensity', v)} // Use onValueCommit for final toast
                                            className="[&>span:first-child]:h-1 [&>span>span]:h-1 [&>span+button]:h-3 [&>span+button]:w-3"
                                        />
                                        <div className="flex justify-between text-[10px] text-muted-foreground">
                                            <span>Boring</span>
                                            <span>Reality Unstable</span>
                                        </div>
                                    </div>
                                </CardContent>
                             </Card>
                         )}

                         {/* Security Section */}
                         {activeCategory === 'security' && (
                             <Card className="border-primary/30 shadow-inner shadow-primary/10 bg-card/70 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base"><ShieldOff size={18} className="text-primary"/> Security Theater</CardTitle>
                                    <CardDescription className="text-xs">Configure your impenetrable defenses.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="firewall">Firewall Strength</Label>
                                        <Select value={settings.firewall} onValueChange={(v) => handleSettingChange('firewall', v)}>
                                            <SelectTrigger id="firewall" className="h-8 text-xs">
                                                <SelectValue placeholder="Select Firewall" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="paper">Paper Wall (Decorative)</SelectItem>
                                                <SelectItem value="tin-foil">Tin Foil Hat (Anti-Mind Control)</SelectItem>
                                                <SelectItem value="bricks">Actual Bricks (Impenetrable)</SelectItem>
                                                <SelectItem value="hope">Hope and Prayers</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="antivirus">Antivirus</Label>
                                         <Select value={settings.antivirus} onValueChange={(v) => handleSettingChange('antivirus', v)}>
                                            <SelectTrigger id="antivirus" className="h-8 text-xs">
                                                <SelectValue placeholder="Select Antivirus" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="expired">Expired Free Trial (1999)</SelectItem>
                                                <SelectItem value="clippy">Clippy Guard ("It looks like you're writing a virus...")</SelectItem>
                                                <SelectItem value="placebo-av">Placebo Antivirus Pro+</SelectItem>
                                                <SelectItem value="none">None (Rawdogging the Internet)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>
                         )}

                         {/* Annoyance Section */}
                          {activeCategory === 'annoyance' && (
                             <Card className="border-primary/30 shadow-inner shadow-primary/10 bg-card/70 backdrop-blur-sm">
                                 <CardHeader>
                                     <CardTitle className="flex items-center gap-2 text-base"><BellRing size={18} className="text-primary"/> Annoyance Controls</CardTitle>
                                     <CardDescription className="text-xs">Fine-tune user irritation levels.</CardDescription>
                                 </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="notifications">Notification Mode</Label>
                                         <Select value={settings.notifications} onValueChange={(v) => handleSettingChange('notifications', v)}>
                                            <SelectTrigger id="notifications" className="h-8 text-xs">
                                                <SelectValue placeholder="Notification Style" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="spam">Constant Spam</SelectItem>
                                                <SelectItem value="passive-aggressive">Passive Aggressive Hints</SelectItem>
                                                <SelectItem value="existential-dread">Existential Dread Popups</SelectItem>
                                                <SelectItem value="silent">Silent Treatment (Mysterious)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                     <div className="flex items-center space-x-2 pt-2">
                                        <Switch
                                            id="error-frequency"
                                            checked={settings.errorFrequency}
                                            onCheckedChange={(c) => handleSettingChange('errorFrequency', c)}
                                            className="data-[state=checked]:bg-destructive data-[state=unchecked]:bg-input"
                                        />
                                        <Label htmlFor="error-frequency">Maximize Error Frequency</Label>
                                         <Tooltip>
                                            <TooltipTrigger asChild>
                                                <AlertTriangle size={14} className="text-muted-foreground cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent side="right" className="text-xs max-w-xs">
                                                <p>Warning: Enabling this may cause unexpected behavior, spontaneous reboots, or summon Clippy.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </CardContent>
                             </Card>
                          )}

                    </div>
                </ScrollArea>
            </div>
        </TooltipProvider>
    );
}
    

    