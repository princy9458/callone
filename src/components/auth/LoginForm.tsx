"use client";

import { useEffect, useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Briefcase, Eye, EyeOff, Lock, LogIn, Mail, ShieldCheck, UserCog } from "lucide-react";

export function LoginForm({
  defaultEmail,
  defaultPasswordHint,
  presets = [],
}: {
  defaultEmail: string;
  defaultPasswordHint: string;
  presets?: Array<{label: string; email: string; description: string}>;
}) {
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    startTransition(async () => {
      const response = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      
      if (response?.error) {
        setError("Invalid email or password.");
        return;
      }

      window.location.href = callbackUrl;
    });
  };

  if (!mounted) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {presets.length ? (
        <div className="grid gap-2 sm:grid-cols-3">
          {presets.map((preset) => {
            const isActive = email === preset.email;
            
            // Map labels to icons
            let RoleIcon = ShieldCheck;
            const labelLower = (preset.label || "").toLowerCase();
            if (labelLower.includes('manager')) RoleIcon = UserCog;
            if (labelLower.includes('sales')) RoleIcon = Briefcase;

            return (
              <button
                key={preset.email}
                type="button"
                onClick={() => setEmail(preset.email)}
                className={`group relative flex flex-col items-center justify-center rounded-lg border p-3 transition-all active:scale-[0.98] ${
                  isActive 
                    ? "border-primary bg-primary/[0.03]" 
                    : "border-black/[0.08] dark:border-white/[0.16] bg-black/[0.02] dark:bg-white/[0.06] hover:border-black/20 dark:hover:border-white/20"
                }`}
              >
                <div className={`mb-2 ${isActive ? "text-primary" : "text-foreground/45 dark:text-foreground/60 group-hover:text-foreground/50"}`}>
                  <RoleIcon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                </div>

                <p className={`text-[10px] font-black uppercase tracking-[0.15em] italic text-center transition-colors ${
                  isActive ? "text-primary" : "text-foreground/50 dark:text-foreground/60 group-hover:text-foreground/60"
                }`}>
                  {preset.label}
                </p>
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/50 dark:text-foreground/70 italic ml-1 flex items-center gap-2">
             User Name
          </label>
          <div className="group relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/20 transition-colors group-focus-within:text-primary">
              <Mail size={16} />
            </div>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-black/[0.1] dark:border-white/[0.15] bg-transparent dark:bg-white/[0.03] py-3 pl-10 pr-4 text-sm font-bold text-foreground placeholder:text-foreground/10 transition-all outline-none focus:border-black/20 dark:focus:border-white/30 focus:bg-black/[0.02] dark:focus:bg-white/[0.05] tracking-wide"
              placeholder="admin@callone.local"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/50 dark:text-foreground/70 italic ml-1 flex items-center gap-2">
           Password
          </label>
          <div className="group relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/20 transition-colors group-focus-within:text-primary">
              <Lock size={16} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-black/[0.1] dark:border-white/[0.15] bg-transparent dark:bg-white/[0.03] py-3 pl-10 pr-12 text-sm font-bold text-foreground placeholder:text-foreground/10 transition-all outline-none focus:border-black/20 dark:focus:border-white/30 focus:bg-black/[0.02] dark:focus:bg-white/[0.05] tracking-wide"
              placeholder={defaultPasswordHint}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-foreground/30 dark:text-foreground/50 transition-all hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground/60"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/[0.02] px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-500/80 italic">
          <ShieldCheck size={14} className="shrink-0" />
          {error}
        </div>
      ) : null}

      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="group relative flex w-full items-center justify-center overflow-hidden rounded-lg bg-black dark:bg-white p-px transition-all active:scale-[0.99] disabled:opacity-60"
        >
          <div className="relative flex w-full items-center justify-center gap-3 py-4 text-[11px] font-black uppercase tracking-[0.3em] text-white dark:text-black italic">
            {isPending ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 dark:border-black/20 border-t-white dark:border-t-black" />
            ) : (
              // <LogIn size={16} />
              <></>
            )}
            {isPending ? "Authenticating" : "Login"}
            {!isPending && (
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            )}
          </div>
        </button>
      </div>
    </form>
  );
}
