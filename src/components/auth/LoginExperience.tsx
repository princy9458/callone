"use client";

import Image from "next/image";
import {motion} from "framer-motion";
import {Moon, ShieldCheck, Sparkles, Sun, UsersRound, Warehouse, Zap} from "lucide-react";
import {useTheme} from "@/components/ThemeProvider";
import {LoginForm} from "@/components/auth/LoginForm";

const LOGIN_HIGHLIGHTS = [
  {
    title: "Role-aware access",
    description: "Super admin, admin, manager, sales rep, and retailer stay aligned to Mongo RBAC.",
    icon: ShieldCheck,
  },
  {
    title: "Warehouse-first stock",
    description: "Orders reserve inventory against dynamic warehouses instead of static stock columns.",
    icon: Warehouse,
  },
  {
    title: "Fast admin flows",
    description: "Command search, dense tables, exports, and lightweight forms for internal ecommerce work.",
    icon: Zap,
  },
];

const NEXT_STEPS = [
  "Sign in with an admin user.",
  "Validate brands, warehouses, and user assignments.",
  "Create products with real variants, then place an internal order.",
];

export function LoginExperience({
  defaultEmail,
  defaultPasswordHint,
  presets,
}: {
  defaultEmail: string;
  defaultPasswordHint: string;
  presets: Array<{label: string; email: string; description: string}>;
}) {
  const {theme, toggleTheme} = useTheme();

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(36,73,111,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(200,153,99,0.14),transparent_24%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.48),transparent_42%)] dark:bg-[linear-gradient(180deg,rgba(9,18,29,0.58),transparent_42%)]" />

      <div className="relative mx-auto flex max-w-6xl justify-end">
        <button
          onClick={toggleTheme}
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border/60 bg-[color:var(--surface)] text-foreground/65 shadow-[0_12px_28px_rgba(15,23,42,0.08)] transition hover:text-foreground"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={18} className="text-[color:var(--accent)]" /> : <Moon size={18} />}
        </button>
      </div>

      <div className="relative mx-auto mt-4 grid max-w-6xl gap-4 lg:grid-cols-[1.06fr_0.94fr]">
        <motion.section
          initial={{opacity: 0, x: -16}}
          animate={{opacity: 1, x: 0}}
          transition={{duration: 0.45, ease: "easeOut"}}
          className="premium-card relative overflow-hidden rounded-[34px] p-6 md:p-8"
        >
          <div className="absolute right-[-4rem] top-[-5rem] h-48 w-48 rounded-full bg-primary/12 blur-[60px]" />
          <div className="absolute bottom-[-4rem] left-[-4rem] h-48 w-48 rounded-full bg-accent/12 blur-[70px]" />

          <div className="relative">
            <div className="flex h-14 w-[150px] items-center justify-center rounded-[26px] bg-[#111111] px-4">
              <Image
                src="/images/brands/callaway-logo-white.png"
                alt="Callaway"
                width={118}
                height={66}
                className="h-auto w-full object-contain"
                priority
              />
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-[color:var(--surface-muted)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/55">
              <Sparkles size={14} className="text-[color:var(--accent)]" />
              Premium Admin Rebuild
            </div>

            <h1 className="mt-6 max-w-2xl text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              Sleek internal commerce for brands, stock, and approval-driven orders.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-foreground/62 md:text-base">
              CallawayOne is now structured as a Next.js + MongoDB admin system with dynamic product variants,
              warehouse-aware inventory, export foundations, and a premium shell built for dense daily use.
            </p>

            <div className="mt-8 grid gap-3 md:grid-cols-3">
              {LOGIN_HIGHLIGHTS.map((item, index) => {
                const Icon = item.icon;
                return (
                <motion.div
                    key={item.title}
                    initial={{opacity: 0, y: 14}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.08 * index, duration: 0.35}}
                    className="rounded-[24px] border border-border/60 bg-[color:var(--surface)] p-4 shadow-[0_18px_48px_rgba(10,10,10,0.08)]"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#111111] text-white">
                      <Icon size={18} />
                    </div>
                    <h2 className="mt-4 text-sm font-semibold text-foreground">{item.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-foreground/58">{item.description}</p>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[26px] border border-border/60 bg-[color:var(--surface-muted)] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/45">
                  Suggested next steps
                </p>
                <ol className="mt-3 space-y-3 text-sm text-foreground/65">
                  {NEXT_STEPS.map((step, index) => (
                    <li key={step} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-white">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="grid gap-3">
                <div className="rounded-[26px] border border-border/60 bg-[color:var(--surface)] p-4 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/45">
                        Workflow
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-foreground">6-stage</p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#111111] text-white">
                      <Sparkles size={18} />
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-foreground/58">
                    Draft to completion with availability checks and manager approval.
                  </p>
                </div>

                <div className="rounded-[26px] border border-border/60 bg-[color:var(--surface)] p-4 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/45">
                        Access
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-foreground">5 roles</p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#111111] text-white">
                      <UsersRound size={18} />
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-foreground/58">
                    Seeded access for super admin, admin, manager, sales rep, and retailer.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{opacity: 0, x: 16}}
          animate={{opacity: 1, x: 0}}
          transition={{duration: 0.45, ease: "easeOut", delay: 0.06}}
          className="premium-card rounded-[34px] p-6 md:p-8"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/45">
                Welcome back
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                Sign in to Admin
              </h2>
              <p className="mt-2 text-sm leading-6 text-foreground/58">
                Use the command search, compact tables, and dynamic workflows after login.
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-[#111111] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">
              Secure Credentials
            </div>
          </div>

          <div className="mt-6">
            <LoginForm
              defaultEmail={defaultEmail}
              defaultPasswordHint={defaultPasswordHint}
              presets={presets}
            />
          </div>
        </motion.section>
      </div>
    </div>
  );
}
