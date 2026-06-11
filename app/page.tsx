import type { Metadata } from 'next';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProofBar from './components/ProofBar';
import HowItWorks from './components/HowItWorks';
import Features from './components/Features';
import Pricing from './components/Pricing';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';

export const metadata: Metadata = {
  title: "I'm using InfraMind to monitor my apps",
  description: 'Your apps, always running, without a full-time dev. Join me on InfraMind.',
  openGraph: {
    title: "I'm using InfraMind to monitor my apps",
    description: 'Your apps, always running, without a full-time dev. Join me on InfraMind.',
    url: 'https://inframind-app.vercel.app/',
    siteName: 'InfraMind',
    images: [
      {
        url: 'https://inframind-app.vercel.app/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    type: 'website',
  },
};

export default function Page() {
  return (
    <main className="bg-[#07090d]">
      <Navbar />
      <Hero />
      <ProofBar />
      <HowItWorks />
      <Features />
      <Pricing />
      <Testimonials />
      <Footer />
    </main>
  );
}
