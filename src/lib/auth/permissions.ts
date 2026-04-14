export const ALL_PERMISSIONS = [
  "catalog.view",
  "catalog.manage",
  "brands.manage",
  "warehouses.manage",
  "inventory.manage",
  "roles.manage",
  "users.manage",
  "orders.view",
  "orders.manage",
  "orders.approve",
  "imports.manage",
  "exports.manage",
  "reports.view",
  "settings.manage",
] as const;

export type Permission = (typeof ALL_PERMISSIONS)[number];

export type RoleKey =
  | "super_admin"
  | "admin"
  | "manager"
  | "sales_rep"
  | "retailer";

export const ROLE_PERMISSIONS: Record<RoleKey, Permission[]> = {
  super_admin: [...ALL_PERMISSIONS],
  admin: [
    "catalog.view",
    "catalog.manage",
    "brands.manage",
    "warehouses.manage",
    "inventory.manage",
    "users.manage",
    "orders.view",
    "orders.manage",
    "orders.approve",
    "imports.manage",
    "exports.manage",
    "reports.view",
  ],
  manager: [
    "catalog.view",
    "orders.view",
    "orders.manage",
    "orders.approve",
    "reports.view",
  ],
  sales_rep: ["catalog.view", "orders.view", "orders.manage"],
  retailer: ["catalog.view"],
};

export const ADMIN_ROLE_KEYS: RoleKey[] = [
  "super_admin",
  "admin",
  "manager",
  "sales_rep",
  "retailer",
];

export function normalizeRole(roleFromDb: string | null | undefined): RoleKey {
  if (!roleFromDb) return "retailer";
  const role = roleFromDb.toLowerCase().trim();
  
  if (role === "super_admin" || role === "super admin") return "super_admin";
  if (role === "admin") return "admin";
  if (role === "manager") return "manager";
  if (role === "sales representative" || role === "sales_rep" || role === "sales rep") return "sales_rep";
  if (role === "retailer") return "retailer";
  
  return "retailer";
}

export function isAdminRole(role?: string | null): role is RoleKey {
  return !!role && ADMIN_ROLE_KEYS.includes(role as RoleKey);
}

export function hasPermission(
  permissions: string[] | undefined,
  permission: Permission
) {
  return Boolean(permissions?.includes(permission));
}
