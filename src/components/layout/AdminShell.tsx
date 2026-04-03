'use client';

import React, {useEffect, useMemo, useRef, useState} from "react";
import Link from "next/link";
import Image from "next/image";
import {usePathname, useRouter} from "next/navigation";
import {signOut} from "next-auth/react";
import clsx from "clsx";
import {AnimatePresence, motion} from "framer-motion";
import {
  ChevronDown,
  Grid2x2,
  LogOut,
  Menu,
  Moon,
  Search,
  ShoppingBag,
  ShoppingCart,
  Sun,
  X,
} from "lucide-react";
import {

  ADMIN_COMMAND_ITEMS,
  ADMIN_NAV_ITEMS,

  ADMIN_ROUTE_ITEMS,

} from "@/lib/admin/command-center";
import {getAdminPageMeta} from "@/lib/admin/page-chrome";
import {getAvailableViewRoles, VIEW_ROLE_LABELS} from "@/lib/auth/view-role";
import {useTheme} from "../ThemeProvider";
import {MegaSearch} from "../ui/MegaSearch";
import GetAllProducts from "../products/GetAllProducts";
import { buildHeroSlides, getInitials, getSectionItems, matchesPath } from "./util/UtilFunction";

type AdminShellProps = {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
    role: string;
    viewRole: string;
  };
};

export type HeroSlide = {
  id: string;
  image: string;
  eyebrow: string;
  title: string;
  description: string;
};



export function AdminShell({children, user}: AdminShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const {theme, toggleTheme} = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [openNavMenu, setOpenNavMenu] = useState<string | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [viewRole, setViewRole] = useState(user.viewRole || user.role);
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);
  const megaMenuRef = useRef<HTMLDivElement | null>(null);
  const navMenuRef = useRef<HTMLDivElement | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const allowedViewRoles = useMemo(() => getAvailableViewRoles(user.role), [user.role]);

  const visibleNavItems = useMemo(
    () => ADMIN_NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(viewRole)),
    [viewRole]
  );
  const visibleRouteItems = useMemo(
    () => ADMIN_ROUTE_ITEMS.filter((item) => !item.roles || item.roles.includes(viewRole)),
    [viewRole]
  );
  const visibleCommandItems = useMemo(
    () => ADMIN_COMMAND_ITEMS.filter((item) => !item.roles || item.roles.includes(viewRole)),
    [viewRole]
  );

  const activeItem =
    visibleRouteItems.find((item) => matchesPath(pathname, item.href)) ??
    visibleNavItems.find((item) => matchesPath(pathname, item.href)) ??
    visibleNavItems[0];
  const pageMeta = useMemo(() => getAdminPageMeta(pathname), [pathname]);

  const heroSlides = useMemo(
    () => buildHeroSlides(pathname, activeItem, viewRole, pageMeta),
    [pathname, activeItem, viewRole, pageMeta]
  );
  const activeHeroSlide = heroSlides[heroSlideIndex] ?? heroSlides[0];

  const megaMenuGroups = [
    {
      title: "Navigate",
      items: visibleRouteItems.filter((item) => item.group === "Navigate"),
    },
    {
      title: "Create",
      items: visibleCommandItems.filter((item) => item.group === "Create"),
    },
    {
      title: "Operations",
      items: visibleCommandItems.filter((item) => item.group === "Operations"),
    },
  ];

  const isWideWorkspace =
    pathname.startsWith("/admin/products/brand") ||
    pathname === "/admin/orders" ||
    pathname.startsWith("/admin/orders/") ||
    pathname.startsWith("/admin/cart");

  const shellWidthClass = isWideWorkspace ? "max-w-[1600px]" : "max-w-[1280px]";
  const contentLiftClass = isWideWorkspace ? "-mt-10" : "-mt-5";

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setSearchOpen((current) => !current);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    setHeroSlideIndex(0);
    const interval = window.setInterval(() => {
      setHeroSlideIndex((current) => (current + 1) % heroSlides.length);
    }, 5200);

    return () => window.clearInterval(interval);
  }, [heroSlides]);

  useEffect(() => {
    setMegaMenuOpen(false);
    setMobileMenuOpen(false);
    setOpenNavMenu(null);
    setProfileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (megaMenuRef.current && !megaMenuRef.current.contains(target)) {
        setMegaMenuOpen(false);
      }

      if (navMenuRef.current && !navMenuRef.current.contains(target)) {
        setOpenNavMenu(null);
      }

      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setProfileMenuOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    setViewRole(user.viewRole || user.role);
  }, [user.role, user.viewRole]);

  const applyViewRole = (nextRole: string) => {
    setViewRole(nextRole);
    document.cookie = `callone-view-role=${encodeURIComponent(nextRole)}; path=/; max-age=2592000; samesite=lax`;
    setProfileMenuOpen(false);
    setOpenNavMenu(null);
    setMegaMenuOpen(false);
    router.refresh();
  };

  return (
    <>
    <GetAllProducts/>
    <div className="relative min-h-screen overflow-hidden text-foreground selection:bg-primary/15 selection:text-foreground">
      <MegaSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} role={viewRole} />

      <AnimatePresence>
        {mobileMenuOpen ? (
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        ) : null}
      </AnimatePresence>

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#111] text-white backdrop-blur-xl">
        <div className="mx-auto flex h-[74px] max-w-[1600px] items-center gap-3 px-4 sm:px-5">
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

          <div className="hidden min-w-0 flex-1 items-center gap-2 xl:flex">
            <div ref={megaMenuRef} className="relative shrink-0">
              <button
                onClick={() => setMegaMenuOpen((current) => !current)}
                className={clsx(
                  "inline-flex h-11 w-11 items-center justify-center rounded-2xl border transition",
                  megaMenuOpen
                    ? "border-white/18 bg-white/12 text-white"
                    : "border-white/10 bg-white/8 text-white/76 hover:text-white"
                )}
                aria-label="Open workspace menu"
              >
                <Grid2x2 size={16} />
              </button>

              <AnimatePresence>
                {megaMenuOpen ? (
                  <motion.div
                    initial={{opacity: 0, y: 10}}
                    animate={{opacity: 1, y: 0}}
                    exit={{opacity: 0, y: 10}}
                    className="absolute left-0 top-full z-50 mt-3 w-[min(980px,calc(100vw-48px))] overflow-hidden rounded-[28px] border border-white/10 bg-[#111111] p-4 shadow-[0_35px_100px_rgba(0,0,0,0.35)]"
                  >
                    <div className="mb-4 flex items-end justify-between gap-3 border-b border-white/10 pb-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/42">
                          Workspace
                        </p>
                        <p className="mt-2 text-lg font-semibold text-white">
                          Fast module access
                        </p>
                      </div>
                      <button
                        onClick={() => setSearchOpen(true)}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/62"
                      >
                        <Search size={14} />
                        Search
                      </button>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-3">
                      {megaMenuGroups.map((group) => (
                        <div
                          key={group.title}
                          className="rounded-[24px] border border-white/10 bg-white/4 p-3"
                        >
                          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/42">
                            {group.title}
                          </p>
                          <div className="space-y-2">
                            {group.items.map((item) => {
                              const isActive = matchesPath(pathname, item.href);
                              const Icon = item.icon;

                              return (
                                <Link
                                  key={item.id}
                                  href={item.href}
                                  className={clsx(
                                    "flex items-start gap-3 rounded-[20px] border px-3 py-3 transition",
                                    isActive
                                      ? "border-white/14 bg-white/10"
                                      : "border-transparent bg-white/3 hover:border-white/10 hover:bg-white/8"
                                  )}
                                >
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/8 text-white">
                                    <Icon size={17} />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold text-white">{item.label}</p>
                                    <p className="mt-1 text-xs leading-5 text-white/56">
                                      {item.description}
                                    </p>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-visible hide-scrollbar">
              {visibleNavItems.map((item) => {
                const submenuItems = getSectionItems(item.id, viewRole);
                const isActive = matchesPath(pathname, item.href);

                if (submenuItems.length) {
                  return (
                    <div
                      key={item.id}
                      ref={openNavMenu === item.id ? navMenuRef : undefined}
                      className="relative"
                      onMouseEnter={() => setOpenNavMenu(item.id)}
                      onMouseLeave={() => setOpenNavMenu((current) => (current === item.id ? null : current))}
                    >
                      <button
                        onClick={() =>
                          setOpenNavMenu((current) => (current === item.id ? null : item.id))
                        }
                        className={clsx(
                          "inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold tracking-[0.02em] transition",
                          isActive || openNavMenu === item.id
                            ? "bg-white/14 text-white"
                            : "text-white/72 hover:bg-white/8 hover:text-white"
                        )}
                      >
                        {item.label}
                        <ChevronDown
                          size={16}
                          className={openNavMenu === item.id ? "rotate-180 transition" : "transition"}
                        />
                      </button>

                      <AnimatePresence>
                        {openNavMenu === item.id ? (
                          <motion.div
                            initial={{opacity: 0, y: 10}}
                            animate={{opacity: 1, y: 0}}
                            exit={{opacity: 0, y: 10}}
                            className="absolute left-0 top-full z-50 mt-3 w-[360px] overflow-hidden rounded-[28px] border border-white/10 bg-[#111111] p-3 shadow-[0_30px_90px_rgba(0,0,0,0.34)]"
                          >
                            <div className="border-b border-white/10 px-2 pb-3">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/42">
                                {item.label}
                              </p>
                              <p className="mt-2 text-sm leading-6 text-white/62">
                                {item.description}
                              </p>
                            </div>

                            <div className="mt-3 space-y-2">
                              {submenuItems.map((submenuItem) => {
                                const Icon = submenuItem.icon;
                                const childActive = matchesPath(pathname, submenuItem.href);
                                return (
                                  <Link
                                    key={submenuItem.id}
                                    href={submenuItem.href}
                                    onClick={() => setOpenNavMenu(null)}
                                    className={clsx(
                                      "flex items-start gap-3 rounded-[20px] border px-3 py-3 transition",
                                      childActive
                                        ? "border-white/14 bg-white/10"
                                        : "border-transparent bg-white/4 hover:border-white/10 hover:bg-white/8"
                                    )}
                                  >
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/8 text-white">
                                      <Icon size={16} />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-sm font-semibold text-white">{submenuItem.label}</p>
                                      <p className="mt-1 text-xs leading-5 text-white/56">
                                        {submenuItem.description}
                                      </p>
                                    </div>
                                  </Link>
                                );
                              })}
                            </div>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </div>
                  );
                }

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
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-white/70 transition hover:border-white/20 hover:bg-white/12 hover:text-white"
              aria-label="Open search"
            >
              <Search size={17} />
            </button>

            <Link
              href="/admin/cart"
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-white/70 transition hover:border-white/20 hover:bg-white/12 hover:text-white"
              aria-label="Open cart"
            >
              <ShoppingCart size={17} />
            </Link>

            <motion.button
              whileTap={{scale: 0.94}}
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-white/70 transition hover:border-white/20 hover:bg-white/12 hover:text-white"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </motion.button>

            <div ref={profileMenuRef} className="relative">
              <button
                onClick={() => setProfileMenuOpen((current) => !current)}
                className="inline-flex h-10 items-center gap-2 rounded-2xl border border-white/10 bg-white/8 px-2.5 text-white/80 transition hover:border-white/20 hover:bg-white/12 hover:text-white"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-semibold uppercase">
                  {getInitials(user.name)}
                </div>
                <div className="hidden text-left lg:block">
                  <p className="text-sm font-semibold leading-none text-white">
                    {user.name ?? "Workspace User"}
                  </p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/46">
                    {VIEW_ROLE_LABELS[user.role as keyof typeof VIEW_ROLE_LABELS] ?? user.role}
                  </p>
                </div>
                <ChevronDown
                  size={15}
                  className={profileMenuOpen ? "rotate-180 transition" : "transition"}
                />
              </button>

              <AnimatePresence>
                {profileMenuOpen ? (
                  <motion.div
                    initial={{opacity: 0, y: 10}}
                    animate={{opacity: 1, y: 0}}
                    exit={{opacity: 0, y: 10}}
                    className="absolute right-0 top-full z-50 mt-3 w-[320px] overflow-hidden rounded-[24px] border border-white/10 bg-[#111111] p-3 shadow-[0_30px_90px_rgba(0,0,0,0.34)]"
                  >
                    <div className="rounded-[20px] border border-white/10 bg-white/4 p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-sm font-semibold uppercase text-white">
                          {getInitials(user.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">
                            {user.name ?? "Workspace User"}
                          </p>
                          <p className="truncate text-xs text-white/55">
                            {user.email ?? "No email available"}
                          </p>
                          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/42">
                            Logged in as {VIEW_ROLE_LABELS[user.role as keyof typeof VIEW_ROLE_LABELS] ?? user.role}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 rounded-[20px] border border-white/10 bg-white/4 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/42">
                        View As
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {allowedViewRoles.map((role) => {
                          const active = role === viewRole;
                          return (
                            <button
                              key={role}
                              onClick={() => applyViewRole(role)}
                              className={clsx(
                                "rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition",
                                active
                                  ? "border-white/18 bg-white/12 text-white"
                                  : "border-white/10 bg-white/6 text-white/62 hover:text-white"
                              )}
                            >
                              {VIEW_ROLE_LABELS[role]}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-3 space-y-2">
                      <Link
                        href="/admin/orders"
                        className="flex items-center gap-3 rounded-[18px] border border-white/10 bg-white/4 px-3 py-3 text-sm font-semibold text-white/76 transition hover:bg-white/8 hover:text-white"
                      >
                        <ShoppingBag size={16} />
                        My Orders
                      </Link>

                      <button
                        onClick={() => signOut({callbackUrl: "/login"})}
                        className="flex w-full items-center gap-3 rounded-[18px] border border-white/10 bg-white/4 px-3 py-3 text-sm font-semibold text-white/76 transition hover:bg-white/8 hover:text-white"
                      >
                        <LogOut size={16} />
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen ? (
          <motion.aside
            initial={{x: -24, opacity: 0}}
            animate={{x: 0, opacity: 1}}
            exit={{x: -24, opacity: 0}}
            className="fixed left-3 top-3 z-50 w-[320px] rounded-[28px] border border-white/10 bg-[#111111] p-4 text-white shadow-[0_30px_90px_rgba(0,0,0,0.3)] md:hidden"
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

            <div className="mb-4 grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  setSearchOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-white/72"
              >
                <Search size={17} />
              </button>
              <Link
                href="/admin/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-white/72"
              >
                <ShoppingCart size={17} />
              </Link>
              <button
                onClick={toggleTheme}
                className="flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-white/72"
              >
                {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
              </button>
            </div>

            <div className="mb-4 rounded-[20px] border border-white/10 bg-white/4 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xs font-semibold uppercase">
                  {getInitials(user.name)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {user.name ?? "Workspace User"}
                  </p>
                  <p className="truncate text-xs text-white/55">{user.email ?? ""}</p>
                </div>
              </div>

              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/42">
                View As
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {allowedViewRoles.map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      applyViewRole(role);
                      setMobileMenuOpen(false);
                    }}
                    className={clsx(
                      "rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition",
                      role === viewRole
                        ? "border-white/18 bg-white/12 text-white"
                        : "border-white/10 bg-white/6 text-white/62 hover:text-white"
                    )}
                  >
                    {VIEW_ROLE_LABELS[role]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              {visibleNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={clsx(
                    "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition",
                    matchesPath(pathname, item.href)
                      ? "bg-white/14 text-white"
                      : "text-white/72 hover:bg-white/8 hover:text-white"
                  )}
                >
                  <item.icon size={17} />
                  {item.label}
                </Link>
              ))}

              <Link
                href="/admin/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-white/72 transition hover:bg-white/8 hover:text-white"
              >
                <ShoppingBag size={17} />
                My Orders
              </Link>

              <button
                onClick={() => signOut({callbackUrl: "/login"})}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-white/72 transition hover:bg-white/8 hover:text-white"
              >
                <LogOut size={17} />
                Sign out
              </button>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>

      <div className="relative">
        <div className="relative h-[244px] overflow-hidden bg-[#111111] text-white">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeHeroSlide.id}
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              exit={{opacity: 0}}
              transition={{duration: 0.5, ease: "easeOut"}}
              className="absolute inset-0"
              style={{
                backgroundImage: `linear-gradient(180deg,rgba(10,10,10,0.18),rgba(10,10,10,0.72)),url(${activeHeroSlide.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(255,255,255,0.18),transparent_24%),linear-gradient(90deg,rgba(10,10,10,0.22),rgba(10,10,10,0.58)_52%,rgba(10,10,10,0.82))]" />

          <div
            className={clsx(
              "relative mx-auto flex h-full items-end justify-between gap-5 px-4 pb-6 sm:px-5",
              shellWidthClass
            )}
          >
          </div>
        </div>

        <main className={clsx("relative z-10 overflow-y-auto overflow-x-hidden px-3 pb-5 sm:px-4", contentLiftClass)}>
          <motion.div
            initial={{opacity: 0, y: 10}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.35, ease: "easeOut"}}
            className={clsx("mx-auto", shellWidthClass)}
          >

            {children}
          </motion.div>
        </main>
      </div>
    </div>
    </>
  );
}
