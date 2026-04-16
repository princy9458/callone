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
  Search,
  Settings,
  ShoppingBag,
  ShoppingCart,
  X,
} from "lucide-react";
import {
  ADMIN_COMMAND_ITEMS,
  ADMIN_NAV_ITEMS,
  ADMIN_ROUTE_ITEMS,
} from "@/lib/admin/command-center";
import {getAdminPageMeta} from "@/lib/admin/page-chrome";
import {getAvailableViewRoles, VIEW_ROLE_LABELS} from "@/lib/auth/view-role";
import {MegaSearch} from "../ui/MegaSearch";
import {ThemeToggle} from "../ui/ThemeToggle";
import GetAllProducts from "../products/GetAllProducts";
import { buildHeroSlides, getInitials, getSectionItems, matchesPath } from "./util/UtilFunction";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

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

  const {items} = useSelector((state: RootState) => state.cart);
  const {currentOrder} = useSelector((state: RootState) => state.order);
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
  const contentLiftClass = isWideWorkspace ? "-mt-24" : "-mt-16";

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
      <GetAllProducts />
      <div className="relative min-h-screen overflow-x-hidden text-foreground">
        <MegaSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} role={viewRole} />

        <header className="header-shell sticky inset-x-0 top-0 z-[1000] border-b">
          <div className="mx-auto flex h-[var(--admin-header-height)] items-center justify-between gap-4 px-6 sm:px-10">
            {/* Logo Section */}
            <div className="flex items-center gap-6">
              <button
                className="header-control rounded-xl border p-2 md:hidden"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu size={20} />
              </button>
              <Link href="/admin" className="group">
                <div className="flex h-11 w-[104px] items-center justify-center rounded-xl border border-[color:var(--header-border)] bg-[color:var(--header-control-bg)] px-2 transition group-hover:bg-[color:var(--header-control-hover)]">
                  <Image
                    src="/images/brands/callaway-logo-white.png"
                    alt="Callaway"
                    width={80}
                    height={44}
                    className="h-auto w-full object-contain dark:brightness-100 dark:invert-0 brightness-0 invert transition-all"
                    priority
                  />
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Section */}
            <nav className="hidden items-center gap-1 xl:flex">
              {visibleNavItems.map((item) => {
                const submenuItems = getSectionItems(item.id, viewRole);
                const isActive = matchesPath(pathname, item.href);

                if (submenuItems.length) {
                  return (
                    <div
                      key={item.id}
                      className="relative"
                      onMouseEnter={() => setOpenNavMenu(item.id)}
                      onMouseLeave={() => setOpenNavMenu(null)}
                      ref={openNavMenu === item.id ? navMenuRef : undefined}
                    >
                      <button
                        className={clsx(
                          "group relative inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold tracking-wide transition-all duration-300",
                          isActive || openNavMenu === item.id
                            ? "text-[color:var(--header-fg)]"
                            : "text-[color:var(--header-muted)] hover:text-[color:var(--header-fg)]"
                        )}
                      >
                        <span className="relative z-10">{item.label}</span>
                        {(isActive || openNavMenu === item.id) && (
                          <motion.div
                            layoutId="nav-glow"
                            className="absolute inset-0 z-0 rounded-xl bg-[color:var(--header-pill-bg)] ring-1 ring-[color:var(--header-border)]"
                          />
                        )}
                        <ChevronDown
                          size={14}
                          className={clsx("relative z-10 transition-transform duration-300", openNavMenu === item.id && "rotate-180")}
                        />
                      </button>

                      <AnimatePresence>
                        {openNavMenu === item.id ? (
                          <motion.div
                            initial={{opacity: 0, y: 10}}
                            animate={{opacity: 1, y: 0}}
                            exit={{opacity: 0, y: 10}}
                            className="absolute left-0 top-full z-[100] mt-3 w-[360px] overflow-hidden rounded-[28px] border border-[color:var(--header-border)] bg-[color:var(--surface)] p-3 shadow-2xl"
                          >
                            <div className="border-b border-border/10 px-2 pb-3">
                              <p className="text-xs font-bold uppercase tracking-wider text-muted">{item.label}</p>
                            </div>
                            <div className="mt-3 space-y-2">
                              {submenuItems.map((sub) => (
                                <Link
                                  key={sub.id}
                                  href={sub.href}
                                  className="flex items-start gap-4 rounded-[20px] p-3 transition hover:bg-surface-muted"
                                >
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-border bg-surface-muted text-foreground">
                                    <sub.icon size={16} />
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-foreground">{sub.label}</p>
                                    <p className="mt-1 text-xs text-muted">{sub.description}</p>
                                  </div>
                                </Link>
                              ))}
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
                      "group relative rounded-xl px-4 py-2 text-sm font-semibold tracking-wide transition-all duration-300",
                      isActive
                        ? "text-[color:var(--header-fg)]"
                        : "text-[color:var(--header-muted)] hover:text-[color:var(--header-fg)]"
                    )}
                  >
                    <span className="relative z-10">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="nav-glow"
                        className="absolute inset-0 z-0 rounded-xl bg-[color:var(--header-pill-bg)] ring-1 ring-[color:var(--header-border)]"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSearchOpen(true)}
                className="header-control flex h-9 w-9 items-center justify-center rounded-lg border transition"
              >
                <Search size={16} />
              </button>
              
              <Link 
                href={`/admin/cart/${currentOrder?.orderNumber}`}
                className="header-control relative flex h-9 w-9 items-center justify-center rounded-lg border transition"
              >
                <ShoppingCart size={16} />
                {items.length > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[9px] font-bold text-background ring-2 ring-background">
                    {items.length}
                  </span>
                )}
              </Link>

              <ThemeToggle className="header-control h-9 w-9 rounded-lg border flex items-center justify-center" />

              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="header-control flex h-9 items-center gap-2 rounded-lg border pl-1 pr-2 transition"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[color:var(--header-pill-active-bg)] text-[10px] font-bold text-[color:var(--header-pill-active-fg)]">
                    {getInitials(user.name)}
                  </div>
                  <ChevronDown size={14} className={clsx("transition-transform", profileMenuOpen && "rotate-180")} />
                </button>

                <AnimatePresence>
                  {profileMenuOpen && (
                    <motion.div
                      initial={{opacity: 0, y: 10}}
                      animate={{opacity: 1, y: 0}}
                      exit={{opacity: 0, y: 10}}
                      className="absolute right-0 top-full mt-3 w-72 overflow-hidden rounded-[24px] border border-border bg-[color:var(--surface)] p-2 shadow-2xl"
                    >
                      <div className="p-3">
                         <p className="text-sm font-bold text-foreground">{user.name}</p>
                         <p className="text-xs text-muted">{user.email}</p>
                      </div>
                      <div className="mt-2 border-t border-border pt-2">
                        <button
                          onClick={() => signOut({callbackUrl: "/login"})}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold text-foreground transition hover:bg-surface-muted"
                        >
                          <LogOut size={16} />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        <div className="relative">
          <div className="relative h-[240px] overflow-hidden bg-black">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeHeroSlide.id}
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                exit={{opacity: 0}}
                transition={{duration: 0.8}}
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${activeHeroSlide.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center 25%",
                  filter: "brightness(0.95) contrast(1.05)",
                }}
              />
            </AnimatePresence>
            {/* Soft Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[color:var(--background)] via-[color:var(--background)]/40 to-transparent" />
          </div>

          <main className={clsx("relative z-10 px-6 pb-20 sm:px-10", contentLiftClass)}>
            <div className={clsx("mx-auto", shellWidthClass)}>
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
