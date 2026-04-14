"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { LoginForm } from "@/components/auth/LoginForm";

export function LoginExperience({
  defaultEmail,
  defaultPasswordHint,
  presets = [],
}: {
  defaultEmail: string;
  defaultPasswordHint: string;
  presets?: Array<{label: string; email: string; description: string}>;
}) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by waiting for mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen w-full bg-white dark:bg-black" />;
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col lg:flex-row bg-white selection:bg-black selection:text-white dark:bg-black font-sans overflow-hidden">
      
      {/* Left Panorama: Immersive Visuals */}
      <section className="relative w-full lg:w-[60%] min-h-[30vh] lg:min-h-screen overflow-hidden group">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10s] group-hover:scale-105"
          style={{
            backgroundImage: "url('https://callawaytech.s3.ap-south-1.amazonaws.com/omsimages/uploads/18_b3b08ebc11.png')",
          }}
        />
        {/* Dynamic Lens Overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-tr from-black/90 via-black/20 to-transparent pointer-events-none" />
        <div className="absolute inset-0 z-11 backdrop-blur-[1px] mix-blend-overlay opacity-30 shadow-inner" />
        
        {/* Brand Narrative Section */}
        <div className="relative z-20 flex flex-col justify-between h-full p-8 md:p-12 lg:p-16 text-white">
          <div className="flex items-center gap-6">
            <div className="bg-white p-2.5 rounded-xl shadow-2xl">
              <Image
                src="/images/brands/callaway-logo-white.png"
                alt="Callaway"
                width={100}
                height={50}
                className="h-7 w-auto object-contain invert dark:invert-1"
                priority
              />
            </div>
            <div className="h-6 w-[1.5px] bg-white/20" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-70">Admin </span>
              <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/60">v4.2.0</span>
            </div>
          </div>

          <div className="max-w-2xl space-y-6 mb-8 lg:mb-0">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/80">System Live // Secure</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter uppercase leading-[0.9] text-white italic">
              Legacy of <br />
              Performance.
            </h1>

            <div className="flex flex-wrap gap-6 pt-2">
              {[
                { label: "Inventory", val: "Global" },
                { label: "Approvals", val: "Precise" },
                { label: "Insights", val: "Live" }
              ].map((stat) => (
                <div key={stat.label} className="space-y-0.5">
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">{stat.label}</p>
                  <p className="text-xs font-black uppercase text-white tracking-widest">{stat.val}</p>
                </div>
              ))}
            </div>
          </div>

          <footer className="hidden lg:block">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/80 __className_ef23df">
              &copy; 2026 Callaway Golf Workspace
            </p>
          </footer>
        </div>
      </section>

      {/* Right Panel: Precision Authentication */}
      <section className="relative flex-1 flex flex-col min-h-screen bg-transparent dark:bg-zinc-950/95 border-s">
        <div className="absolute inset-0 bg-gradient-to-b from-[#f8f9fa] to-white dark:from-[#111] dark:to-[#050505] z-0 pointer-events-none" />
        
        <header className="relative z-30 flex justify-end p-6 lg:p-4">
          <button
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-foreground/60 transition-all hover:bg-black/10 dark:hover:bg-white/10"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>

        <main className="relative z-20 flex-1 flex flex-col items-center justify-center px-8 lg:px-16 pb-12">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center lg:text-left">
              <h2 className="text-3xl lg:text-4xl font-black uppercase tracking-tighter text-foreground italic leading-none">
                Login
              </h2>
              <div className="h-1 w-12 bg-primary dark:bg-primary-strong mt-3 mb-4 rounded-full" />
              <p className="text-xs text-foreground/50 leading-relaxed font-medium capitalize">
                Secure access gateway for authorized personnel.
              </p>
            </div>

            <Suspense fallback={<div className="h-64 animate-pulse bg-black/5 dark:bg-white/5 rounded-xl" />}>
              <LoginForm
                defaultEmail={defaultEmail}
                defaultPasswordHint={defaultPasswordHint}
                presets={presets}
              />
            </Suspense>

            <div className="mt-8 text-center lg:text-left">
              <a href="#" className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 dark:text-foreground/50 hover:text-primary transition-colors cursor-pointer border-b border-transparent hover:border-primary/30 pb-1">
                TECHNICAL SUPPORT
              </a>
            </div>
          </div>
        </main>
      </section>
    </div>
  );
}
