import {redirect} from "next/navigation";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth/options";
import {ADMIN_ROLE_KEYS, isAdminRole} from "@/lib/auth/permissions";

export async function getCurrentSession() {
  return getServerSession(authOptions);
}

export async function requireAdminSession() {
  const session = await getCurrentSession();

  if (!session?.user || !isAdminRole(session.user.role)) {
    redirect("/login");
  }

  return session;
}

export async function requireRole(roles: string[]) {
  const session = await requireAdminSession();

  if (!roles.includes(session.user.role)) {
    redirect("/admin");
  }

  return session;
}

export {ADMIN_ROLE_KEYS};
