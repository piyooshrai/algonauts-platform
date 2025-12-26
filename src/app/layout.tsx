import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Providers } from "@/components/providers";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-dm-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-instrument-serif",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "Algonauts | Your Rank Is Your Resume",
    template: "%s | Algonauts",
  },
  description:
    "The platform for students and freshers to prove their skills through verified assessments, earn a national ranking, and get discovered by top companies.",
  keywords: [
    "Algonauts",
    "LayersRank",
    "student assessment",
    "fresher jobs",
    "internship",
    "campus placement",
    "technical assessment",
    "behavioral assessment",
  ],
  authors: [{ name: "Algonauts" }],
  creator: "Algonauts",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://algonauts-platform.vercel.app",
    siteName: "Algonauts",
    title: "Algonauts | Your Rank Is Your Resume",
    description:
      "Prove your skills. Earn your rank. Get discovered by top companies.",
    images: [
      {
        url: "https://algonauts-platform.vercel.app/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Algonauts - Your Rank Is Your Resume",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Algonauts | Your Rank Is Your Resume",
    description:
      "Prove your skills. Earn your rank. Get discovered by top companies.",
    images: ["https://algonauts-platform.vercel.app/images/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
