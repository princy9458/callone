import { AdminShell } from "@/components/layout/AdminShell";
import {ensureSystemBootstrap} from "@/lib/auth/bootstrap";
import {requireAdminSession} from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await ensureSystemBootstrap();
  const session = await requireAdminSession();

  return (
    <AdminShell
      user={{
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      }}
    >
      {children}
    </AdminShell>
  );
}
