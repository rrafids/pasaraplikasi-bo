import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "tukuaplikasi.com Admin",
  description: "Admin dashboard for tukuaplikasi.com",
  icons: { icon: "/tlog.png", apple: "/tlog.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
