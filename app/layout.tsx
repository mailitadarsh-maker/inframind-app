import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'InfraMind — Keep your apps running perfectly',
  description: 'Monitor websites, APIs, and SSL certificates. Get instant alerts, track incidents, and share public status pages from a single dashboard.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#07090d] text-[#eef1f6] font-sans text-sm leading-relaxed">
        {children}
      </body>
    </html>
  );
}
