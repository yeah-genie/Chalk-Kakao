import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import BottomNav from "@/components/layout/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#09090b',
};

export const metadata: Metadata = {
  title: {
    default: "Chalk - AI-Powered Tutoring Analytics",
    template: "%s | Chalk",
  },
  description: "You teach. AI scribes. Turn every tutoring session into proof of mastery with zero effort.",
  keywords: ["tutoring", "AI", "education", "learning analytics", "tutor portfolio", "mastery tracking"],
  authors: [{ name: "Chalk" }],
  creator: "Chalk",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://chalk-web-three.vercel.app",
    siteName: "Chalk",
    title: "Chalk - AI-Powered Tutoring Analytics",
    description: "You teach. AI scribes. Turn every tutoring session into proof of mastery with zero effort.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chalk - AI-Powered Tutoring Analytics",
    description: "You teach. AI scribes. Turn every tutoring session into proof of mastery with zero effort.",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#09090b] text-[#fafafa] min-h-screen pb-16 md:pb-0`}
      >
        <ToastProvider>
          {children}
          <BottomNav />
        </ToastProvider>
      </body>
    </html>
  );
}
