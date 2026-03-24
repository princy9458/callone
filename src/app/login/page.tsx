import {ensureSystemBootstrap} from "@/lib/auth/bootstrap";
import {LoginExperience} from "@/components/auth/LoginExperience";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  await ensureSystemBootstrap();
  const defaultEmail =
    process.env.CALLONE_BOOTSTRAP_ADMIN_EMAIL ?? "admin@callone.local";
  const defaultPasswordHint =
    process.env.NODE_ENV === "production"
      ? "Enter your password"
      : process.env.CALLONE_BOOTSTRAP_ADMIN_PASSWORD ?? "CalloneAdmin@123";
  const presets = [
    {
      label: "Super Admin",
      email: defaultEmail,
      description: "Full system access and bootstrap control.",
    },
    {
      label: "Manager",
      email: "manager@callone.local",
      description: "Approval and team oversight flow.",
    },
    {
      label: "Sales Rep",
      email: "sales@callone.local",
      description: "Order creation and daily sales operations.",
    },
  ];

  return <LoginExperience defaultEmail={defaultEmail} defaultPasswordHint={defaultPasswordHint} presets={presets} />;
}
