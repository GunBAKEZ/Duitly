import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { SwRegister } from "@/components/layout/sw-register";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const font = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Duitly", template: "%s · Duitly" },
  description: "Tracker pengeluaran, utang, wishlist, dan tabungan.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Duitly", statusBarStyle: "default" },
  icons: { icon: "/icons/icon-192.png", apple: "/icons/icon-192.png" },
};

export const viewport: Viewport = { themeColor: "#a3e635", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale}>
      <body className={`${font.variable} font-sans antialiased`}>
        <NextIntlClientProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </NextIntlClientProvider>
        <SwRegister />
      </body>
    </html>
  );
}
