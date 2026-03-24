"use client";

import {useState, useTransition} from "react";
import {signIn} from "next-auth/react";
import {ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck, Sparkles} from "lucide-react";

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

      window.location.href = "/admin";
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {presets.length ? (
        <div className="grid gap-2 sm:grid-cols-3">
          {presets.map((preset) => (
            <button
              key={preset.email}
              type="button"
              onClick={() => setEmail(preset.email)}
              className="rounded-[20px] border border-border/60 bg-[color:var(--surface-muted)] px-3 py-3 text-left transition hover:border-primary/25 hover:bg-primary/6"
            >
              <p className="text-sm font-semibold text-foreground">{preset.label}</p>
              <p className="mt-1 text-xs text-foreground/55">{preset.description}</p>
            </button>
          ))}
        </div>
      ) : null}

      <div className="rounded-[28px] border border-border/70 bg-[color:var(--surface)] px-4 py-4 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">
              Email
            </span>
            <span className="flex items-center rounded-2xl border border-border/70 bg-background px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
              <Mail size={18} className="text-foreground/40" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full bg-transparent px-3 py-3 text-sm text-foreground outline-none"
                placeholder="admin@callone.local"
                required
              />
            </span>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">
              Password
            </span>
            <span className="flex items-center rounded-2xl border border-border/70 bg-background px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
              <Lock size={18} className="text-foreground/40" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full bg-transparent px-3 py-3 text-sm text-foreground outline-none"
                placeholder={defaultPasswordHint}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="rounded-xl p-1.5 text-foreground/45 transition hover:text-foreground"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </span>
          </label>
        </div>
      </div>

      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-950/30 dark:text-red-200">
          {error}
        </p>
      ) : null}

      <div className="flex items-center justify-between rounded-[22px] border border-border/60 bg-[color:var(--surface-muted)] px-4 py-3 text-sm text-foreground/58">
        <span className="inline-flex items-center gap-2">
          <Sparkles size={15} className="text-primary" />
          Premium admin shell with command search
        </span>
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/45">
          Next.js + MongoDB
        </span>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-[22px] bg-primary px-5 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(36,73,111,0.28)] transition hover:translate-y-[-1px] hover:bg-[color:var(--primary-strong)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <ShieldCheck size={18} />
        {isPending ? "Signing in..." : "Sign in to Admin"}
        {!isPending ? <ArrowRight size={16} /> : null}
      </button>
    </form>
  );
}
