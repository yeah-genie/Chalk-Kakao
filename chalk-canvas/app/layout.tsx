import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Chalk | AI Math Problem Solver Analysis',
    description: 'Analyze your math problem-solving behavior with AI-powered insights',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <body className="bg-[#0a0a0a] text-white antialiased">
                {children}
                <Analytics />
            </body>
        </html>
    );
}
