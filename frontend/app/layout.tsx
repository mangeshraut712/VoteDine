import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "VoteDine - Group Dining Made Simple",
  description: "The smartest way to decide where to eat with friends. AI-powered recommendations, real-time voting, and seamless planning.",
  keywords: ["restaurant voting", "group dining", "AI recommendations", "real-time voting", "food decision"],
  authors: [{ name: "VoteDine" }],
  openGraph: {
    title: "VoteDine - Group Dining Made Simple",
    description: "The smartest way to decide where to eat with friends.",
    type: "website",
    siteName: "VoteDine",
  },
  twitter: {
    card: "summary_large_image",
    title: "VoteDine",
    description: "The smartest way to decide where to eat with friends.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a1a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-white text-gray-900 antialiased min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
