import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ReduxProvider } from "@/components/providers/ReduxProvider";
import SessionSync from "@/components/auth/SessionSync";
import { Toaster } from "sonner";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CallawayOne | Admin",
  description: "B2B Enterprise Order Management System",
  icons: {
    icon: [
      { url: "/images/brands/callaway-favicon.png", type: "image/png" },
    ],
    shortcut: "/images/brands/callaway-favicon.png",
    apple: "/images/brands/callaway-favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var storageKey = 'theme';
                  var root = document.documentElement;
                  var savedTheme = localStorage.getItem(storageKey);
                  var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  var theme = savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : systemTheme;
                  root.classList.toggle('dark', theme === 'dark');
                  root.dataset.theme = theme;
                  root.style.colorScheme = theme;
                } catch (error) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${geistSans.className} bg-background text-foreground transition-colors duration-300`}>
        <ReduxProvider>
          <AuthProvider>
            <SessionSync />
            <ThemeProvider>
              {children}
              <Toaster position="top-right" richColors closeButton />
            </ThemeProvider>
          </AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
