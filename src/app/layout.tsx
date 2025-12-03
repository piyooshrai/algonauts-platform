import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
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
    default: "Algonauts - Where Talent Meets Opportunity",
    template: "%s | Algonauts",
  },
  description:
    "The premier platform for interns, students, and freshers. Take assessments, earn your LayersRank, and get discovered by top companies.",
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
    locale: "en_US",
    siteName: "Algonauts",
    title: "Algonauts - Where Talent Meets Opportunity",
    description:
      "The premier platform for interns, students, and freshers. Take assessments, earn your LayersRank, and get discovered by top companies.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Algonauts - Where Talent Meets Opportunity",
    description:
      "The premier platform for interns, students, and freshers. Take assessments, earn your LayersRank, and get discovered by top companies.",
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
        {children}
      </body>
    </html>
  );
}
