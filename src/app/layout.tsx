import type { Metadata, Viewport } from "next";
import { indexable, siteDescription, siteTitle, siteUrl } from "@/lib/site-config";
import "./globals.css";

export const metadata: Metadata = {
  title: siteTitle,
  description: siteDescription,
  applicationName: "Карамельная линия",
  category: "Пищевое оборудование",
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  alternates: siteUrl ? { canonical: "/" } : undefined,
  icons: {
    icon: [{ url: "/assets/site-icon.png", sizes: "64x64", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "Карамельная линия",
    title: siteTitle,
    description: siteDescription,
    url: siteUrl ? `${siteUrl}/` : undefined,
    images: siteUrl
      ? [{ url: `${siteUrl}/assets/og-caramel.jpg`, width: 1200, height: 630, alt: "Карамельная линия: общий вид установки" }]
      : undefined,
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: siteUrl ? [`${siteUrl}/assets/og-caramel.jpg`] : undefined,
  },
  robots: {
    index: indexable,
    follow: indexable,
  },
};

export const viewport: Viewport = {
  themeColor: "#f6f7f5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
