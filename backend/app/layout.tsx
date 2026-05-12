import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Quran API Backend',
  description: 'Next.js backend proxy for Quran API integration'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
