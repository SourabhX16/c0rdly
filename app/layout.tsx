import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GPRS – Grand Printing Reliable Solutions',
  description:
    'Professional printing and digital data collection for institutions. Marksheets, ID Cards, and bulk document processing.',
  keywords: ['printing press', 'marksheet', 'data collection', 'GPRS', 'India', 'bulk printing'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-surface-50 text-surface-900">
        {children}
      </body>
    </html>
  );
}
