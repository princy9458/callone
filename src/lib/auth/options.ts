import bcrypt from "bcryptjs";
import type {NextAuthOptions} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/db/connection";
import {ensureSystemBootstrap} from "@/lib/auth/bootstrap";
import {Role} from "@/lib/db/models/Role";
import {User} from "@/lib/db/models/User";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {strategy: "jwt"},
  providers: [
    CredentialsProvider({
      name: "CallawayOne Credentials",
      credentials: {
        email: {label: "Email", type: "email"},
        password: {label: "Password", type: "password"},
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        await dbConnect();
        await ensureSystemBootstrap();

        const user = await User.findOne({
          email: credentials.email.toLowerCase().trim(),
          status: "active",
        }).lean();

        if (!user) {
          return null;
        }

        const passwordMatches = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!passwordMatches) {
          return null;
        }

        const role = await Role.findById(user.roleId).lean();

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.roleKey,
          permissions: role?.permissions ?? [],
        };
      },
    }),
  ],
  callbacks: {
    async jwt({token, user}) {
      if (user) {
        token.role = user.role;
        token.permissions = user.permissions;
      }
      return token;
    },
    async session({session, token}) {
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
