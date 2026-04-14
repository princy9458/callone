import {LoginExperience} from "@/components/auth/LoginExperience";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const defaultEmail =
    process.env.CALLONE_BOOTSTRAP_ADMIN_EMAIL ?? "admin@callone.local";
  const defaultPasswordHint =
    process.env.NODE_ENV === "production"
      ? "Enter your password"
      : process.env.CALLONE_BOOTSTRAP_ADMIN_PASSWORD ?? "CalloneAdmin@123";
  const presets = [
    {
      label: "Super Admin",
      email: "superadmin@callawaygolf.com",
      description: "Full access to the workspace and operating controls.",
    },
    {
      label: "Admin",
      email: "rakesh.singh@callawaygolf.com",
      description: "Full access to the workspace and operating controls.",
    },
    {
      label: "Manager",
      email: "mohit.chopra@callawaygolf.com",
      description: "Approvals, team visibility, and follow-up.",
    },
    {
      label: "Sales Rep",
      email: "testsalesRep@gmail.com",
      description: "Order entry and daily sales activity.",
    },
    {
      label: "Retailer",
      email: "testretailer@gmail.com",
      description: "Partner Retailer access.",
    },
  ];

  return <LoginExperience defaultEmail={defaultEmail} defaultPasswordHint={defaultPasswordHint} presets={presets} />;
}
