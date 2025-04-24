import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster"

// Keep Geist Sans for potential future use, but prioritize Mono
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'HackerTyper OS',
  description: 'Totally Secure OS Simulation',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark"> {/* Apply dark theme globally */}
      <body className={cn(
        `${geistSans.variable} ${geistMono.variable} antialiased font-mono bg-background text-foreground overflow-hidden h-screen`, // Set font-mono, ensure no body scroll
        )}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
