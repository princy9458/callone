'use client';

import React, {useEffect, useState} from "react";
import Link from "next/link";
import Image from "next/image";
import {usePathname} from "next/navigation";
import {signOut} from "next-auth/react";
import clsx from "clsx";
import {AnimatePresence, motion} from "framer-motion";
import {
  Command,
  Menu,
  Moon,
  Search,
  Sun,
  X,
} from "lucide-react";
import {ADMIN_NAV_ITEMS} from "@/lib/admin/command-center";
import {useTheme} from "../ThemeProvider";
import {MegaSearch} from "../ui/MegaSearch";

type AdminShellProps = {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
    role: string;
  };
};

export function AdminShell({ children, user }: AdminShellProps) {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const visibleNavItems = ADMIN_NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(user.role)
  );
  const activeItem =
    visibleNavItems.find((item) =>
      item.href === "/admin"
        ? pathname === "/admin"
        : pathname === item.href || pathname.startsWith(`${item.href}/`)
    ) ?? visibleNavItems[0];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden text-foreground selection:bg-primary/15 selection:text-foreground">
      <MegaSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} role={user.role} />

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#111111] text-white">
        <div className="mx-auto flex h-[74px] max-w-[1600px] items-center gap-4 px-4 sm:px-5">
          <div className="flex items-center gap-3">
            <button
              className="rounded-2xl border border-white/12 bg-white/6 p-2.5 text-white/72 transition hover:text-white md:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={18} />
            </button>
            <Link href="/admin" className="flex items-center gap-3">
              <div className="flex h-12 w-[112px] items-center justify-center rounded-2xl bg-white/4 px-3">
                <Image
                  src="/images/brands/callaway-logo-white.png"
                  alt="Callaway"
                  width={90}
                  height={50}
                  className="h-auto w-full object-contain"
                  priority
                />
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/42">
                  CallawayOne
                </p>
                <p className="text-sm font-semibold text-white/92">Admin Workspace</p>
              </div>
            </Link>
          </div>

          <nav className="hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto hide-scrollbar lg:flex">
            {visibleNavItems.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "rounded-2xl px-4 py-2.5 text-sm font-semibold tracking-[0.02em] transition",
                    isActive
                      ? "bg-white/14 text-white"
                      : "text-white/72 hover:bg-white/8 hover:text-white"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden flex-1 justify-center 2xl:flex">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex h-11 w-full max-w-[560px] items-center justify-between rounded-full border border-white/10 bg-white/8 px-4 text-left"
            >
              <span className="flex min-w-0 items-center gap-3 text-sm text-white/62">
                <Search size={16} className="shrink-0 text-white/55" />
                <span className="truncate">Search products, actions, routes, and commands</span>
              </span>
              <span className="flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60">
                <Command size={12} />
                K
              </span>
            </button>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/admin/orders"
              className="hidden rounded-2xl border border-white/10 bg-white/8 px-4 py-2.5 text-sm font-semibold text-white/80 transition hover:text-white md:inline-flex"
            >
              My Orders
            </Link>
            <motion.button
              whileTap={{scale: 0.94}}
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-white/70 transition hover:text-white"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </motion.button>
            <button
              onClick={() => signOut({callbackUrl: "/login"})}
              className="hidden rounded-2xl border border-white/10 bg-white/8 px-4 py-2.5 text-sm font-semibold text-white/80 transition hover:text-white md:inline-flex"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen ? (
          <motion.aside
            initial={{x: -24, opacity: 0}}
            animate={{x: 0, opacity: 1}}
            exit={{x: -24, opacity: 0}}
            className="fixed left-3 top-3 z-50 w-[300px] rounded-[28px] border border-white/10 bg-[#111111] p-4 text-white shadow-[0_30px_90px_rgba(0,0,0,0.3)] md:hidden"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="min-w-0">
                <div className="mb-3 flex h-11 w-[108px] items-center justify-center rounded-2xl bg-white/4 px-3">
                  <Image
                    src="/images/brands/callaway-logo-white.png"
                    alt="Callaway"
                    width={86}
                    height={48}
                    className="h-auto w-full object-contain"
                  />
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                  Navigation
                </p>
                <p className="text-lg font-semibold text-white">CallawayOne</p>
              </div>
              <button
                className="rounded-2xl border border-white/12 bg-white/6 p-2.5 text-white/70"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <button
              onClick={() => {
                setSearchOpen(true);
                setMobileMenuOpen(false);
              }}
              className="mb-4 flex h-11 w-full items-center justify-between rounded-full border border-white/10 bg-white/8 px-4 text-left text-sm text-white/62"
            >
              <span className="flex items-center gap-3">
                <Search size={16} />
                Search
              </span>
              <Command size={12} />
            </button>

            <div className="space-y-1.5">
              {visibleNavItems.map((item) => {
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={clsx(
                      "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition",
                      isActive
                        ? "bg-white/14 text-white"
                        : "text-white/72 hover:bg-white/8 hover:text-white"
                    )}
                  >
                    <item.icon size={17} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>

      <div className="relative">
        <div className="relative h-[210px] overflow-hidden bg-[#111111] text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.12),transparent_22%),linear-gradient(120deg,rgba(255,255,255,0.08),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent)]" />
          <div className="mx-auto flex h-full max-w-[1600px] items-end px-4 pb-10 sm:px-5">
            <div>
              <p className="text-sm font-medium text-white/72">{activeItem?.description ?? "Internal operations workspace"}</p>
              <h1 className="mt-3 text-[2rem] font-semibold tracking-tight text-white">
                {activeItem?.label ?? "Dashboard"}
              </h1>
              <p className="mt-2 text-sm text-white/55">
                Dense operational workspace with catalog, approvals, users, and warehouse controls.
              </p>
            </div>
          </div>
        </div>

        <main className="relative z-10 -mt-14 overflow-y-auto overflow-x-hidden px-3 pb-5 sm:px-4">
          <motion.div
            initial={{opacity: 0, y: 10}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.35, ease: "easeOut"}}
            className="mx-auto max-w-[1600px]"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
