'use client';

import React, {useDeferredValue, useEffect, useState} from "react";
import {usePathname, useRouter} from "next/navigation";
import {AnimatePresence, motion} from "framer-motion";
import {ArrowRight, Command, CornerDownLeft, Search, Sparkles, WandSparkles, X} from "lucide-react";
import {ADMIN_COMMAND_ITEMS, type AdminCommandGroup} from "@/lib/admin/command-center";

interface MegaSearchProps {
  isOpen: boolean;
  onClose: () => void;
  role: string;
}

const SCOPES: Array<"All" | AdminCommandGroup> = ["All", "Navigate", "Create", "Operations"];
const SEARCH_GUIDES = [
  "Try “sheet calibration” to jump into the CSV intake workspace.",
  "Search with a workflow phrase like “create order” or “warehouse stock”.",
  "Use scope chips to narrow the results before typing.",
];

export function MegaSearch({isOpen, onClose, role}: MegaSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<"All" | AdminCommandGroup>("All");
  const [activeIndex, setActiveIndex] = useState(0);
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  const availableItems = ADMIN_COMMAND_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(role)
  );

  const filteredItems = availableItems.filter((item) => {
    if (scope !== "All" && item.group !== scope) {
      return false;
    }

    if (!deferredQuery) {
      return true;
    }

    const haystack = [item.label, item.description, ...item.keywords]
      .join(" ")
      .toLowerCase();

    return haystack.includes(deferredQuery);
  });

  const visibleItems = (deferredQuery ? filteredItems : availableItems).slice(0, 10);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onClose();
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((current) =>
          visibleItems.length ? (current + 1) % visibleItems.length : 0
        );
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((current) =>
          visibleItems.length
            ? (current - 1 + visibleItems.length) % visibleItems.length
            : 0
        );
      }

      if (e.key === "Enter" && visibleItems[activeIndex]) {
        e.preventDefault();
        router.push(visibleItems[activeIndex].href);
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, isOpen, onClose, router, visibleItems]);

  useEffect(() => {
    if (isOpen) {
      setActiveIndex(0);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    setActiveIndex(0);
  }, [deferredQuery, scope]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[100] bg-background/70 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.98, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -16 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed inset-x-3 top-[7%] z-[101] mx-auto flex max-h-[82vh] w-[min(820px,calc(100vw-24px))] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#111111] text-white shadow-[0_28px_100px_rgba(0,0,0,0.35)]"
          >
            <div className="flex items-center gap-3 border-b border-border/60 px-4 py-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/8 text-white">
                <Search className="h-5 w-5" />
              </div>
              <input 
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search routes, actions, imports, products, or operations..." 
                className="flex-1 bg-transparent border-none px-1 text-base text-white outline-none placeholder:text-white/34 sm:text-lg"
              />
              <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55 md:flex">
                <Command className="h-3.5 w-3.5" />
                Command Center
              </div>
              <button onClick={onClose} className="rounded-2xl border border-white/10 bg-white/8 p-2.5 text-white/50 transition-colors hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="flex gap-2 overflow-x-auto border-b border-white/10 px-4 py-3 hide-scrollbar">
              {SCOPES.map((itemScope) => (
                <button 
                  key={itemScope} 
                  onClick={() => setScope(itemScope)}
                  className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] transition-colors ${
                    scope === itemScope
                      ? "bg-primary text-white shadow-[0_10px_24px_rgba(47,127,244,0.24)]"
                      : "bg-white/8 text-white/58 hover:text-white"
                  }`}
                >
                  {itemScope}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
              <span>{deferredQuery ? "Search results" : "Suggested actions"}</span>
              <span>{visibleItems.length} shown</span>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto p-3">
              {!deferredQuery ? (
                <div className="grid gap-2 rounded-[24px] border border-white/10 bg-white/4 p-3 md:grid-cols-3">
                  {SEARCH_GUIDES.map((guide) => (
                    <div
                      key={guide}
                      className="rounded-[20px] border border-white/10 bg-white/4 px-3 py-3"
                    >
                      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-2xl bg-white/8 text-white">
                        <WandSparkles size={16} />
                      </div>
                      <p className="text-sm leading-6 text-white/68">{guide}</p>
                    </div>
                  ))}
                </div>
              ) : null}

              {visibleItems.length ? (
                visibleItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = activeIndex === index;
                  const isCurrent = pathname === item.href;

                  return (
                    <motion.button
                      key={item.id}
                      whileHover={{x: 3}}
                      onClick={() => {
                        router.push(item.href);
                        onClose();
                      }}
                      className={`flex w-full items-center justify-between rounded-[22px] border px-3.5 py-3 text-left transition-all ${
                        isActive
                          ? "border-primary/30 bg-primary/14 shadow-[0_12px_30px_rgba(47,127,244,0.1)]"
                          : "border-transparent bg-white/4 hover:border-white/10"
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/8 text-white">
                          <Icon size={18} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-semibold text-white">
                              {item.label}
                            </p>
                            <span className="rounded-full bg-white/8 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
                              {item.group}
                            </span>
                            {isCurrent ? (
                              <span className="rounded-full bg-primary/16 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
                                Current
                              </span>
                            ) : null}
                          </div>
                          <p className="truncate text-xs text-white/56">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <ArrowRight
                        size={16}
                        className={`shrink-0 transition-colors ${
                          isActive ? "text-primary" : "text-white/24"
                        }`}
                      />
                    </motion.button>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-white/4 px-6 py-14 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/8 text-white">
                    <Sparkles size={18} />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-white">
                    No matches found
                  </h3>
                  <p className="mt-2 max-w-sm text-sm text-white/56">
                    Try a route name, action like “create order”, or a module like
                    “warehouse”.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-white/10 bg-white/4 px-4 py-3 text-xs font-medium text-white/45">
              <span className="flex items-center gap-2">
                <kbd className="rounded-md border border-white/10 bg-white/8 px-2 py-1">↑</kbd>
                <kbd className="rounded-md border border-white/10 bg-white/8 px-2 py-1">↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-2">
                <kbd className="rounded-md border border-white/10 bg-white/8 px-2 py-1">
                  <CornerDownLeft size={12} />
                </kbd>
                Open
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
