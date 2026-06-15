import type { Metadata } from 'next';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProofBar from './components/ProofBar';
import HowItWorks from './components/HowItWorks';
import Features from './components/Features';
import Pricing from './components/Pricing';
import Footer from './components/Footer';
import BlogSection from '@/components/landing/BlogSection';
import ReviewsCarousel from '@/components/landing/ReviewsCarousel';
import FAQ from './components/FAQ';

export const metadata: Metadata = {
  title: 'InfraMind – AI-Powered Uptime, API & SSL Monitoring',
  description: 'Monitor your websites, APIs, and SSL certificates 24/7. Get plain-English AI incident reports — no full-time dev needed. Free beta.',
  alternates: {
    canonical: 'https://inframindhq.online/',
  },
  openGraph: {
    title: "I'm using InfraMind to monitor my apps",
    description: 'Your apps, always running, without a full-time dev. Join me on InfraMind.',
    url: 'https://inframindhq.online/',
    siteName: 'InfraMind',
    images: [
      {
        url: 'https://inframindhq.online/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "I'm using InfraMind to monitor my apps",
    description: 'Your apps, always running, without a full-time dev. Join me on InfraMind.',
    images: ['https://inframindhq.online/og-image.png'],
  },
};

export default function Page() {
  return (
    <main className="bg-[#22252c]">
      <Navbar />
      <Hero />
      <ProofBar />
      <HowItWorks />
      <Features />
      <ReviewsCarousel />
      <Pricing />
      <FAQ />
      <BlogSection />
      <Footer />
    </main>
  );
}
