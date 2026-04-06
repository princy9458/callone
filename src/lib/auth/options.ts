import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/db/connection";
import { ensureSystemBootstrap } from "@/lib/auth/bootstrap";
import { ROLE_PERMISSIONS, type RoleKey } from "@/lib/auth/permissions";
import { Role } from "@/lib/db/models/Role";
import { User } from "@/lib/db/models/User";

function normalizeSiteUrl(rawUrl: string | undefined) {
  const trimmedUrl = rawUrl?.trim();
  if (!trimmedUrl) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmedUrl)) {
    return trimmedUrl;
  }

  return `https://${trimmedUrl.replace(/^\/+/, "")}`;
}

const normalizedNextAuthUrl = normalizeSiteUrl(process.env.NEXTAUTH_URL);
if (normalizedNextAuthUrl) {
  process.env.NEXTAUTH_URL = normalizedNextAuthUrl;
}

const BOOTSTRAP_ROLE_LABELS: Record<RoleKey, string> = {
  super_admin: "CallawayOne Super Admin",
  admin: "CallawayOne Admin",
  manager: "Regional Manager",
  sales_rep: "Field Sales Rep",
  retailer: "Partner Retailer",
};

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "CallawayOne Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const normalizedEmail = credentials.email.toLowerCase().trim();
        const bootstrapEmail = (
          process.env.CALLONE_BOOTSTRAP_ADMIN_EMAIL ?? "admin@callone.local"
        )
          .toLowerCase()
          .trim();
        const bootstrapPassword =
          process.env.CALLONE_BOOTSTRAP_ADMIN_PASSWORD ?? "CalloneAdmin@123";
        const bootstrapManagerEmail = (
          process.env.CALLONE_BOOTSTRAP_MANAGER_EMAIL ?? "manager@callone.local"
        )
          .toLowerCase()
          .trim();
        const bootstrapSalesEmail = (
          process.env.CALLONE_BOOTSTRAP_SALES_EMAIL ?? "sales@callone.local"
        )
          .toLowerCase()
          .trim();
        const bootstrapRetailerEmail = (
          process.env.CALLONE_BOOTSTRAP_RETAILER_EMAIL ?? "retailer@callone.local"
        )
          .toLowerCase()
          .trim();

        const bootstrapEmails = new Set([
          bootstrapEmail,
          bootstrapManagerEmail,
          bootstrapSalesEmail,
          bootstrapRetailerEmail,
        ]);

        if (
          bootstrapEmails.has(normalizedEmail) &&
          credentials.password === bootstrapPassword
        ) {
          if (process.env.CALLONE_RUNTIME_BOOTSTRAP === "true") {
            void ensureSystemBootstrap().catch((error) => {
              console.warn(
                "BOOTSTRAP_WARN: Background bootstrap refresh failed:",
                error instanceof Error ? error.message : error
              );
            });
          }

          const bootstrapRole: RoleKey =
            normalizedEmail === bootstrapEmail
              ? "super_admin"
              : normalizedEmail === bootstrapManagerEmail
                ? "manager"
                : normalizedEmail === bootstrapSalesEmail
                  ? "sales_rep"
                  : "retailer";

          return {
            id: normalizedEmail,
            name: BOOTSTRAP_ROLE_LABELS[bootstrapRole],
            email: normalizedEmail,
            role: bootstrapRole,
            permissions: ROLE_PERMISSIONS[bootstrapRole],
          };
        }

        await dbConnect();

        if (bootstrapEmails.has(normalizedEmail)) {
          await ensureSystemBootstrap();
        }

        const user = await User.findOne({
          email: normalizedEmail,

        }).lean();

        if (!user) {
          return null;
        }
        console.log("user login ", user)
        const passwordMatches = user.password_hash
          ? credentials.password === user.password_hash
          : await bcrypt.compare(credentials.password, user.passwordHash);

        if (!passwordMatches) {
          return null;
        }
        console.log("passwordMatches ", passwordMatches)
        // const role = await Role.findById(user.roleId).lean();

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          permissions: user.permissions,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.permissions = user.permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = String(token.role ?? "");
        session.user.permissions = Array.isArray(token.permissions)
          ? token.permissions.map(String)
          : [];
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
