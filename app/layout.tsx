import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'C0rdly — GPRS Form Management Platform',
  description:
    'Production-grade multi-tenant form management for Indian printing presses. Dynamic forms, bulk data collection, and submission tracking.',
  keywords: ['printing press', 'form management', 'data collection', 'GPRS', 'C0rdly', 'India', 'bulk printing'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-cosmic-navy text-slate-white antialiased">
        {/* Noise texture overlay — star field grain */}
        <div className="noise-overlay" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
