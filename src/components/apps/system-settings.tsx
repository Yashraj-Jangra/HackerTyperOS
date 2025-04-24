'use client';

import React, { useState, useEffect } from 'react'; // Import useEffect
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Settings, Cpu, Zap, Eye, ShieldOff, BellRing, Wand2 } from 'lucide-react'; // More relevant icons
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';

// Helper function for random sarcastic feedback
const getRandomFeedback = (options: string[]) => options[Math.floor(Math.random() * options.length)];

export function SystemSettings() {
    const { toast } = useToast();
    const [settings, setSettings] = useState({
        osFlavor: 'matrix-os',
        ramBooster: 'hamster-wheel',
        hackSpeed: 'hollywood',
        hackTarget: 'toaster',
        theme: 'matrix-green',
        glitchIntensity: 50, // Slider value 0-100
        firewall: 'tin-foil',
        antivirus: 'clippy',
        notifications: 'passive-aggressive',
        errorFrequency: false, // Switch state
    });

    // Move DOM manipulation into useEffect to ensure it runs client-side only
    useEffect(() => {
      // Add a temporary heavy glitch effect class if not already present
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


    const handleSelectChange = (key: keyof typeof settings, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        // Provide feedback based on the setting changed
        let feedbackOptions: string[] = [];
        switch (key) {
            case 'osFlavor': feedbackOptions = ["OS Flavor set. Don't blame us if it crashes.", "Choice recorded. Prepare for... consequences?", "Interesting OS choice. Very... vintage?"]; break;
            case 'ramBooster': feedbackOptions = ["RAM Booster engaged! Or maybe just placebo.", "Hamster wheel overclocked. Hope he had coffee.", "More RAM downloaded fromDefinitelyNotAVirus.com."]; break;
            case 'hackSpeed': feedbackOptions = ["Hack speed adjusted. Remember, patience is a virtue... or is it?", "Hollywood speed enabled. Expect lots of meaningless text.", "Quantum Potato speed? Bold move."]; break;
            case 'hackTarget': feedbackOptions = ["Target selected. Please hack responsibly (or don't).", "Area 51 selected. Say hi to the aliens for us.", "Hacking neighbor's Wi-Fi? We didn't see anything."]; break;
            case 'theme': feedbackOptions = ["Theme applied. Your eyes might disagree.", "Clippy Revival? You asked for it.", "Matrix Green is classic. Good choice... or is it?"]; break;
            case 'firewall': feedbackOptions = ["Firewall updated. May repel mild breezes.", "Tin Foil Hat deployed. 5G protection enabled.", "Brick wall firewall active. Very secure, slightly immobile."]; break;
            case 'antivirus': feedbackOptions = ["Antivirus status updated. Clippy is watching.", "Antivirus expired in 1999 activated. Good luck.", "No antivirus? Living dangerously, I see."]; break;
            case 'notifications': feedbackOptions = ["Notification settings saved. Prepare for annoyance.", "Existential Dread mode activated.", "Passive aggressive notifications enabled. You'll get the hint. Eventually."]; break;
            default: feedbackOptions = ["Setting updated. Probably.", "Configuration saved. Maybe.", "Did that do anything? Let's pretend it did."];
        }
        toast({
            title: "Setting Updated",
            description: getRandomFeedback(feedbackOptions),
            variant: Math.random() < 0.1 ? "destructive" : "default", // Occasionally make it a "destructive" toast for fun
        });
    };

    const handleSliderChange = (key: keyof typeof settings, value: number[]) => {
        setSettings(prev => ({ ...prev, [key]: value[0] }));
        // Debounced feedback could be better here, but for simplicity:
        if (key === 'glitchIntensity') {
            let intensityDesc = '';
            if (value[0] < 20) intensityDesc = "Barely noticeable. Boring!";
            else if (value[0] < 70) intensityDesc = "Nice level of visual chaos.";
            else intensityDesc = "Reality unstable! Maximum glitch!";
            toast({
                title: "Glitch Intensity Adjusted",
                description: intensityDesc,
            });
             // Apply a temporary visual effect based on intensity
             const glitchClass = value[0] > 70 ? 'glitch-effect-heavy' : value[0] > 30 ? 'glitch-effect' : '';
             const targetElement = document.querySelector('.window-content-for-settings'); // Target specific window if possible
             if (targetElement && glitchClass) {
                 targetElement.classList.add(glitchClass);
                 setTimeout(() => targetElement.classList.remove(glitchClass), 1500);
             } else if (glitchClass) {
                 document.body.classList.add(glitchClass);
                 setTimeout(() => document.body.classList.remove(glitchClass), 1500);
             }
        }
    };

     const handleSwitchChange = (key: keyof typeof settings, checked: boolean) => {
        setSettings(prev => ({ ...prev, [key]: checked }));
         let feedbackOptions: string[] = [];
         switch (key) {
             case 'errorFrequency':
                feedbackOptions = checked
                    ? ["Errors maximized! Good luck clicking anything.", "Ah, embracing chaos, are we?"]
                    : ["Errors minimized. How disappointingly stable.", "Reduced error frequency. Where's the fun in that?"];
                break;
            default: feedbackOptions = ["Toggled. Probably."];
         }
         toast({
             title: "Toggle Flipped",
             description: getRandomFeedback(feedbackOptions),
         });
     };

    const applySettings = () => {
         toast({
            title: "Applying Settings...",
            description: getRandomFeedback([
                "Settings applied! Your warranty is now void.",
                "Configuration locked in. System stability decreased by 42%.",
                "Rebooting to 1995... just kidding (mostly). Enjoy the 'improvements'!",
                "Changes saved. We take no responsibility for the consequences."
            ]),
            variant: "default",
            duration: 4000,
        });
        // Here you would normally apply the actual settings (if this were real)
        // For now, it just shows a toast.
    }

    const resetSettings = () => {
         setSettings({
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
        });
         toast({
            title: "Settings Reset",
            description: "Reverted to 'factory defaults' (whatever that means here).",
            variant: "destructive",
        });
    }

    return (
        // Added identifier class for potential targeted glitch effects
        <div className="h-full flex flex-col text-foreground text-xs p-1 window-content-for-settings">
            <Card className="h-full flex flex-col border-none shadow-inner shadow-primary/30 bg-card/80 backdrop-blur-sm">
                <CardHeader className="p-2 pb-0 border-b border-primary/30">
                    <CardTitle className="text-sm flex items-center gap-2"><Settings size={16} className="text-accent animate-spin [animation-duration:5s]" /> System Settings Panel</CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex-grow overflow-hidden">
                    <Tabs defaultValue="config" className="h-full flex flex-col">
                        <TabsList className="shrink-0 grid w-full grid-cols-5 gap-1 p-1 bg-secondary/30 rounded-none border-b border-primary/30 h-auto">
                            <TabsTrigger value="config" className="text-xs h-7 px-1"><Cpu size={14} className="mr-1"/>Config</TabsTrigger>
                            <TabsTrigger value="hacking" className="text-xs h-7 px-1"><Zap size={14} className="mr-1"/>Hacking</TabsTrigger>
                            <TabsTrigger value="visuals" className="text-xs h-7 px-1"><Eye size={14} className="mr-1"/>Visuals</TabsTrigger>
                            <TabsTrigger value="security" className="text-xs h-7 px-1"><ShieldOff size={14} className="mr-1"/>Security</TabsTrigger>
                            <TabsTrigger value="annoyance" className="text-xs h-7 px-1"><BellRing size={14} className="mr-1"/>Annoyance</TabsTrigger>
                        </TabsList>

                        <div className="flex-grow overflow-y-auto p-3 space-y-4 text-xs">
                            <TabsContent value="config" className="mt-0 space-y-3">
                                <div className="space-y-1">
                                    <Label htmlFor="os-flavor">OS Flavor</Label>
                                    <Select value={settings.osFlavor} onValueChange={(v) => handleSelectChange('osFlavor', v)}>
                                        <SelectTrigger id="os-flavor" className="h-8 text-xs">
                                            <SelectValue placeholder="Select OS" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="win98">Windows 98 Ultra Pro Max</SelectItem>
                                            <SelectItem value="linux-kernel">Linux Kernel 420.69</SelectItem>
                                            <SelectItem value="matrix-os">MatrixOS</SelectItem>
                                            <SelectItem value="not-macos">Definitely Not macOS</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="ram-booster">RAM Booster™</Label>
                                    <Select value={settings.ramBooster} onValueChange={(v) => handleSelectChange('ramBooster', v)}>
                                        <SelectTrigger id="ram-booster" className="h-8 text-xs">
                                            <SelectValue placeholder="Boost RAM?" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="download">Download More RAM (Recommended)</SelectItem>
                                            <SelectItem value="hamster-wheel">Overclock Hamster Wheel</SelectItem>
                                            <SelectItem value="sacrifice">Sacrifice CPU Performance</SelectItem>
                                            <SelectItem value="placebo">Placebo Button</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </TabsContent>

                            <TabsContent value="hacking" className="mt-0 space-y-3">
                                <div className="space-y-1">
                                    <Label htmlFor="hack-speed">Hack Speed</Label>
                                    <Select value={settings.hackSpeed} onValueChange={(v) => handleSelectChange('hackSpeed', v)}>
                                        <SelectTrigger id="hack-speed" className="h-8 text-xs">
                                            <SelectValue placeholder="Select Speed" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="snail">Snail's Pace</SelectItem>
                                            <SelectItem value="hollywood">Hollywood Hacker</SelectItem>
                                            <SelectItem value="quantum-potato">Quantum Potato</SelectItem>
                                            <SelectItem value="instant">Instant (Suspicious)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="hack-target">Target Selection</Label>
                                    <Select value={settings.hackTarget} onValueChange={(v) => handleSelectChange('hackTarget', v)}>
                                        <SelectTrigger id="hack-target" className="h-8 text-xs">
                                            <SelectValue placeholder="Select Target" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="library">Local Library Catalogue</SelectItem>
                                            <SelectItem value="area51">Area 51 Mainframe</SelectItem>
                                            <SelectItem value="neighbor-wifi">Neighbor's Wi-Fi (Hypothetically)</SelectItem>
                                            <SelectItem value="toaster">A Smart Toaster</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </TabsContent>

                            <TabsContent value="visuals" className="mt-0 space-y-3">
                                <div className="space-y-1">
                                    <Label htmlFor="theme">Theme</Label>
                                    <Select value={settings.theme} onValueChange={(v) => handleSelectChange('theme', v)}>
                                        <SelectTrigger id="theme" className="h-8 text-xs">
                                            <SelectValue placeholder="Select Theme" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="matrix-green">Matrix Green</SelectItem>
                                            <SelectItem value="neon-blue">Neon Blue</SelectItem>
                                            <SelectItem value="clippy-revival">Clippy Revival (Painful)</SelectItem>
                                            <SelectItem value="monochrome">Monochrome Despair</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="glitch-intensity">Glitch Intensity: {settings.glitchIntensity}%</Label>
                                    <Slider
                                        id="glitch-intensity"
                                        min={0} max={100} step={1}
                                        value={[settings.glitchIntensity]}
                                        onValueChange={(v) => handleSliderChange('glitchIntensity', v)}
                                        className="[&>span:first-child]:h-1 [&>span>span]:h-1 [&>span+button]:h-3 [&>span+button]:w-3"
                                    />
                                </div>
                            </TabsContent>

                             <TabsContent value="security" className="mt-0 space-y-3">
                                <div className="space-y-1">
                                    <Label htmlFor="firewall">Firewall Strength</Label>
                                    <Select value={settings.firewall} onValueChange={(v) => handleSelectChange('firewall', v)}>
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
                                     <Select value={settings.antivirus} onValueChange={(v) => handleSelectChange('antivirus', v)}>
                                        <SelectTrigger id="antivirus" className="h-8 text-xs">
                                            <SelectValue placeholder="Select Antivirus" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="expired">Expired Free Trial (1999)</SelectItem>
                                            <SelectItem value="clippy">Clippy Guard ("It looks like you're writing a virus...")</SelectItem>
                                            <SelectItem value="placebo-av">Placebo Antivirus Pro</SelectItem>
                                            <SelectItem value="none">None (Rawdogging the Internet)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                             </TabsContent>

                              <TabsContent value="annoyance" className="mt-0 space-y-3">
                                <div className="space-y-1">
                                    <Label htmlFor="notifications">Notification Mode</Label>
                                     <Select value={settings.notifications} onValueChange={(v) => handleSelectChange('notifications', v)}>
                                        <SelectTrigger id="notifications" className="h-8 text-xs">
                                            <SelectValue placeholder="Notification Style" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="spam">Constant Spam</SelectItem>
                                            <SelectItem value="passive-aggressive">Passive Aggressive Hints</SelectItem>
                                            <SelectItem value="existential-dread">Existential Dread Popups</SelectItem>
                                             <SelectItem value="silent">Silent Treatment</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                 <div className="flex items-center space-x-2 pt-2">
                                    <Switch
                                        id="error-frequency"
                                        checked={settings.errorFrequency}
                                        onCheckedChange={(c) => handleSwitchChange('errorFrequency', c)}
                                        className="data-[state=checked]:bg-destructive data-[state=unchecked]:bg-input"
                                    />
                                    <Label htmlFor="error-frequency">Maximize Error Frequency</Label>
                                </div>
                             </TabsContent>
                        </div>

                        <div className="p-2 border-t border-primary/30 flex justify-end space-x-2 shrink-0">
                            <Button variant="destructive" size="sm" className="text-xs h-7" onClick={resetSettings}>Reset Defaults</Button>
                            <Button variant="default" size="sm" className="text-xs h-7" onClick={applySettings}>Apply Settings</Button>
                        </div>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}

// Removed the DOM manipulation code from here as it's now in useEffect
// The styles are injected once when the component mounts.

    