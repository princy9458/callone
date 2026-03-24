import type {LucideIcon} from "lucide-react";
import {
  BookCopy,
  FileUp,
  FolderTree,
  LayoutDashboard,
  Package,
  PlusCircle,
  Settings,
  Shield,
  ShoppingBag,
  UserPlus,
  Users,
  Warehouse,
} from "lucide-react";

export type AdminCommandGroup = "Navigate" | "Create" | "Operations";

export type AdminCommandItem = {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
  group: AdminCommandGroup;
  keywords: string[];
  roles?: string[];
};

export const ADMIN_NAV_ITEMS: AdminCommandItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    description: "Overview, activity, and execution priorities.",
    href: "/admin",
    icon: LayoutDashboard,
    group: "Navigate",
    keywords: ["overview", "home", "stats"],
  },
  {
    id: "orders",
    label: "Orders",
    description: "Pipeline, approvals, and internal checkout orders.",
    href: "/admin/orders",
    icon: ShoppingBag,
    group: "Navigate",
    keywords: ["checkout", "status", "approval"],
  },
  {
    id: "products",
    label: "Products",
    description: "Unified brand-aware product catalog and variants.",
    href: "/admin/products",
    icon: Package,
    group: "Navigate",
    keywords: ["catalog", "variants", "sku"],
  },
  {
    id: "brands",
    label: "Brands",
    description: "Brand details, media, and website references.",
    href: "/admin/brands",
    icon: FolderTree,
    group: "Navigate",
    keywords: ["logos", "brand", "media"],
  },
  {
    id: "warehouses",
    label: "Warehouses",
    description: "Inventory locations, availability, and stock routing.",
    href: "/admin/warehouses",
    icon: Warehouse,
    group: "Navigate",
    keywords: ["inventory", "stock", "availability"],
  },
  {
    id: "users",
    label: "Users",
    description: "Users, assignments, and reporting structure.",
    href: "/admin/users",
    icon: Users,
    group: "Navigate",
    keywords: ["staff", "accounts", "team"],
  },
  {
    id: "roles",
    label: "Roles",
    description: "Permission bundles and RBAC management.",
    href: "/admin/roles",
    icon: Shield,
    group: "Navigate",
    keywords: ["permissions", "rbac", "access"],
    roles: ["super_admin", "admin"],
  },
  {
    id: "imports",
    label: "Imports",
    description: "Import jobs for SQL, CSV, and XLSX data.",
    href: "/admin/imports",
    icon: FileUp,
    group: "Operations",
    keywords: ["migration", "upload", "seed"],
  },
  {
    id: "catalogs",
    label: "Catalogs",
    description: "PDF, PPT, and brand deck generation.",
    href: "/admin/catalogs",
    icon: BookCopy,
    group: "Operations",
    keywords: ["pdf", "ppt", "downloads"],
  },
  {
    id: "customizer",
    label: "Customizer",
    description: "Legacy customizer placeholder and future tooling.",
    href: "/admin/customizer",
    icon: Settings,
    group: "Operations",
    keywords: ["builder", "custom", "legacy"],
  },
];

export const ADMIN_COMMAND_ITEMS: AdminCommandItem[] = [
  ...ADMIN_NAV_ITEMS,
  {
    id: "new-order",
    label: "Create Order",
    description: "Open the admin checkout flow for a new order.",
    href: "/admin/orders/new",
    icon: PlusCircle,
    group: "Create",
    keywords: ["new order", "checkout", "sales order"],
  },
  {
    id: "new-product",
    label: "Create Product",
    description: "Add a new base product and generate variants.",
    href: "/admin/products/new",
    icon: PlusCircle,
    group: "Create",
    keywords: ["new product", "catalog", "sku"],
  },
  {
    id: "manage-users",
    label: "Invite User",
    description: "Go to users and create a new admin, manager, or sales rep.",
    href: "/admin/users",
    icon: UserPlus,
    group: "Create",
    keywords: ["new user", "invite", "staff"],
  },
];
