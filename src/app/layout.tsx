import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import "./globals.css";

export const metadata: Metadata = {
  title: "Chalk – Prove your teaching impact",
  description: "Record lessons. AI tracks student growth. Your teaching becomes provable evidence for marketing.",
  keywords: ["tutoring", "teaching", "education", "student progress", "tutor marketing", "proof of results"],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
