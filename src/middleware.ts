import {withAuth} from "next-auth/middleware";
import {ADMIN_ROLE_KEYS} from "@/lib/auth/permissions";

export default withAuth(
  function middleware() {},
  {
    callbacks: {
      authorized: ({token, req}) => {
        const {pathname} = req.nextUrl;
        if (!pathname.startsWith("/admin")) {
          return true;
        }

        return Boolean(token?.role && ADMIN_ROLE_KEYS.includes(String(token.role) as never));
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/admin/:path*"],
};
