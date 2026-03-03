import type { Metadata, Viewport } from "next";
import "./globals.css";
import { DataProvider } from "@/lib/DataContext";
import { AppShell } from "@/components/AppShell";
import { ServiceWorkerRegister } from "@/components/ServiceWorker";

export const metadata: Metadata = {
  title: "燃脂日记",
  description: "情侣健身减脂计划 - 饮食、运动、打卡",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "燃脂日记",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0a0f",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="antialiased">
        <DataProvider>
          <ServiceWorkerRegister />
          <AppShell>{children}</AppShell>
        </DataProvider>
      </body>
    </html>
  );
}
