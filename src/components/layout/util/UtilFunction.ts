import { ADMIN_ACCOUNTS_MENU_ITEMS, ADMIN_PRODUCTS_MENU_ITEMS, HERO_BANNERS } from "@/lib/admin/command-center";
import { VIEW_ROLE_LABELS } from "@/lib/auth/view-role";
import { HeroSlide } from "../AdminShell";

export function matchesPath(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getSectionItems(id: string, role: string) {
  if (id === "products") {
    return ADMIN_PRODUCTS_MENU_ITEMS.filter((item) => !item.roles || item.roles.includes(role));
  }

  if (id === "accounts") {
    return ADMIN_ACCOUNTS_MENU_ITEMS.filter((item) => !item.roles || item.roles.includes(role));
  }

  return [];
}

export function getInitials(name?: string | null) {
  const parts = (name ?? "")
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) {
    return "CA";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export function getHeroImages(
  pathname: string,
  activeItem: {heroImage?: string} | undefined
) {
  if (pathname.startsWith("/admin/products")) {
    return [activeItem?.heroImage ?? HERO_BANNERS.iron, HERO_BANNERS.graphite, HERO_BANNERS.orange];
  }

  if (pathname.startsWith("/admin/orders") || pathname.startsWith("/admin/cart")) {
    return [activeItem?.heroImage ?? HERO_BANNERS.orange, HERO_BANNERS.iron, HERO_BANNERS.graphite];
  }

  if (pathname.startsWith("/admin/accounts") || pathname.startsWith("/admin/users")) {
    return [activeItem?.heroImage ?? HERO_BANNERS.graphite, HERO_BANNERS.iron, HERO_BANNERS.orange];
  }

  if (pathname.startsWith("/admin/analytics")) {
    return [activeItem?.heroImage ?? HERO_BANNERS.orange, HERO_BANNERS.graphite, HERO_BANNERS.iron];
  }

  return [activeItem?.heroImage ?? HERO_BANNERS.graphite, HERO_BANNERS.iron, HERO_BANNERS.orange];
}

export function buildHeroSlides(
  pathname: string,
  activeItem: {label?: string; heroImage?: string} | undefined,
  viewRole: string,
  pageMeta: {title: string; eyebrow: string; description: string}
): HeroSlide[] {
  const roleLabel = VIEW_ROLE_LABELS[viewRole as keyof typeof VIEW_ROLE_LABELS] ?? viewRole;
  const [primaryImage, secondaryImage, tertiaryImage] = getHeroImages(pathname, activeItem);
  const activeLabel = activeItem?.label ?? pageMeta.title;

  if (pathname.startsWith("/admin/products")) {
    return [
      {
        id: "products-1",
        image: primaryImage,
        eyebrow: pageMeta.eyebrow,
        title: pageMeta.title,
        description: pageMeta.description,
      },
      {
        id: "products-2",
        image: secondaryImage,
        eyebrow: "Shared image handling",
        title: "One gallery, many size variants",
        description: "Keep S, M, L, XL, and XXL inside one visual set unless the underlying product model actually changes.",
      },
      {
        id: "products-3",
        image: tertiaryImage,
        eyebrow: "Warehouse-aware listing",
        title: "Show availability the way each brand really works",
        description: "Use WH88 and WH90 only where the brand supports them, while keeping the table fast to filter and easy to trust.",
      },
    ];
  }

  if (pathname.startsWith("/admin/orders") || pathname.startsWith("/admin/cart")) {
    return [
      {
        id: "orders-1",
        image: primaryImage,
        eyebrow: pageMeta.eyebrow,
        title: pageMeta.title,
        description: pageMeta.description,
      },
      {
        id: "orders-2",
        image: secondaryImage,
        eyebrow: "Assisted ordering",
        title: "Start the basket on behalf of any account",
        description: "Super admins and ops teams can jump in with retailer context already selected and keep the approval path intact.",
      },
      {
        id: "orders-3",
        image: tertiaryImage,
        eyebrow: `View as ${roleLabel}`,
        title: "Review each workflow through the right lens",
        description: "Preview what managers, sales reps, and retailers see before you push the order into the next operational step.",
      },
    ];
  }

  if (pathname.startsWith("/admin/accounts") || pathname.startsWith("/admin/users") || pathname.startsWith("/admin/roles")) {
    return [
      {
        id: "accounts-1",
        image: primaryImage,
        eyebrow: pageMeta.eyebrow,
        title: pageMeta.title,
        description: pageMeta.description,
      },
      {
        id: "accounts-2",
        image: secondaryImage,
        eyebrow: "Super Admin controls",
        title: "Preview the workspace before you delegate it",
        description: "Switch perspective quickly, validate access, then jump into retailer-led ordering or assignment changes with confidence.",
      },
      {
        id: "accounts-3",
        image: tertiaryImage,
        eyebrow: "Assignment clarity",
        title: "Align brands, managers, warehouses, and people",
        description: "Keep the operational map clear so catalog, stock, and approval work stays accountable instead of fragmented.",
      },
    ];
  }

  if (pathname.startsWith("/admin/warehouses") || pathname.startsWith("/admin/imports")) {
    return [
      {
        id: "ops-1",
        image: primaryImage,
        eyebrow: pageMeta.eyebrow,
        title: pageMeta.title,
        description: pageMeta.description,
      },
      {
        id: "ops-2",
        image: secondaryImage,
        eyebrow: "Calibrated operations",
        title: "Keep every stock signal believable",
        description: "Treat imports, warehouse mapping, and product relation checks as one operational chain instead of separate admin tasks.",
      },
      {
        id: "ops-3",
        image: tertiaryImage,
        eyebrow: `View as ${roleLabel}`,
        title: "Make downstream teams trust the data",
        description: "Build stock and intake views that stay clear for the teams placing, approving, and checking availability each day.",
      },
    ];
  }

  if (pathname.startsWith("/admin/analytics")) {
    return [
      {
        id: "analytics-1",
        image: primaryImage,
        eyebrow: pageMeta.eyebrow,
        title: pageMeta.title,
        description: pageMeta.description,
      },
      {
        id: "analytics-2",
        image: secondaryImage,
        eyebrow: "Performance focus",
        title: "See the products and people driving momentum",
        description: "Compare weekly movement, accountable contributors, and the lines generating the most value across the workspace.",
      },
      {
        id: "analytics-3",
        image: tertiaryImage,
        eyebrow: activeLabel,
        title: "Turn signals into action faster",
        description: "Move from sales trends into orders, products, and accounts with the same visual context still intact.",
      },
    ];
  }

  return [
    {
      id: "default-1",
      image: primaryImage,
      eyebrow: pageMeta.eyebrow,
      title: pageMeta.title,
      description: pageMeta.description,
    },
    {
      id: "default-2",
      image: secondaryImage,
      eyebrow: "Connected admin workspace",
      title: "Keep the right work visible at the right time",
      description: "Use one consistent workspace across products, accounts, warehouse logic, and approvals without losing operational focus.",
    },
    {
      id: "default-3",
      image: tertiaryImage,
      eyebrow: `View as ${roleLabel}`,
      title: "Role-aware visibility without changing the core flow",
      description: "Preview the experience for each role while keeping real access control and admin responsibility separate.",
    },
  ];
}