import './globals.css';
import type { Metadata, Viewport } from 'next';
import ChatWidget from './components/ChatWidget';

export const metadata: Metadata = {
  metadataBase: new URL('https://inframindhq.online'),
  title: 'InfraMind – AI-Powered Uptime, API & SSL Monitoring',
  description: 'Monitor your websites, APIs, and SSL certificates 24/7. Get plain-English AI incident reports — no full-time dev needed. Free beta.',
  alternates: {
    canonical: 'https://inframindhq.online/',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#07090d] text-[#eef1f6] antialiased h-full">
        {children}

        </body>
    </html>
  );
}