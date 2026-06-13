import type { Metadata } from 'next';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy | InfraMind',
  description: 'How InfraMind collects, uses, and protects your data.',
  alternates: { canonical: 'https://inframindhq.online/privacy' },
};

export default function PrivacyPage() {
  return (
    <main className="bg-[#22252c] min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-16 text-text-2 text-sm leading-relaxed">
        <h1 className="text-2xl font-bold text-text mb-2">Privacy Policy</h1>
        <p className="mb-8 text-xs">Last updated: June 13, 2026</p>

        <p className="mb-6">
          InfraMind ("we", "our", "us") respects your privacy. This Privacy Policy explains what
          information we collect, how we use it, and the choices you have regarding your data when
          you use our website and monitoring services (the "Service").
        </p>

        <h2 className="text-lg font-semibold text-text mt-8 mb-3">1. Information We Collect</h2>
        <p className="mb-4">
          We collect information you provide directly, such as your name, email address, and account
          credentials when you sign up. We also collect technical data about the websites, APIs, and
          SSL certificates you configure for monitoring, including URLs, response times, and uptime
          status.
        </p>

        <h2 className="text-lg font-semibold text-text mt-8 mb-3">2. How We Use Your Information</h2>
        <p className="mb-4">
          We use your information to provide and improve the Service, send monitoring alerts and
          notifications, generate AI-powered incident reports, and communicate with you about your
          account. We do not sell your personal data to third parties.
        </p>

        <h2 className="text-lg font-semibold text-text mt-8 mb-3">3. Data Storage and Security</h2>
        <p className="mb-4">
          Your data is stored securely using industry-standard practices. We use reputable third-party
          infrastructure providers (such as Supabase and Vercel) to host our application and database.
          While we take reasonable steps to protect your information, no method of transmission or
          storage is 100% secure.
        </p>

        <h2 className="text-lg font-semibold text-text mt-8 mb-3">4. Third-Party Services</h2>
        <p className="mb-4">
          We use third-party services for essential functions such as email delivery (Resend),
          authentication, and AI-based analysis. These providers may process limited data on our
          behalf in accordance with their own privacy policies.
        </p>

        <h2 className="text-lg font-semibold text-text mt-8 mb-3">5. Cookies</h2>
        <p className="mb-4">
          We use essential cookies to keep you logged in and to maintain your session. We do not use
          third-party advertising or tracking cookies.
        </p>

        <h2 className="text-lg font-semibold text-text mt-8 mb-3">6. Your Rights</h2>
        <p className="mb-4">
          You may access, update, or delete your account information at any time from your settings,
          or by contacting us at{' '}
          <a href="mailto:support@inframindhq.online" className="text-green hover:underline">
            support@inframindhq.online
          </a>.
        </p>

        <h2 className="text-lg font-semibold text-text mt-8 mb-3">7. Changes to This Policy</h2>
        <p className="mb-4">
          We may update this Privacy Policy from time to time. Material changes will be notified via
          email or through the Service.
        </p>

        <h2 className="text-lg font-semibold text-text mt-8 mb-3">8. Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy, please contact us at{' '}
          <a href="mailto:support@inframindhq.online" className="text-green hover:underline">
            support@inframindhq.online
          </a>.
        </p>
      </div>
      <Footer />
    </main>
  );
}
