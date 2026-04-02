import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'c0rdly – School Report Card Printing Platform',
  description:
    'Bulk report card generation and printing management for Indian schools. CBSE / State Board compatible.',
  keywords: ['report card', 'school', 'printing', 'CBSE', 'India', 'bulk PDF'],
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
