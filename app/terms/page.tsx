import type { Metadata } from 'next';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata: Metadata = {
  title: 'Terms of Service | InfraMind',
  description: 'Terms and conditions for using InfraMind monitoring services.',
  alternates: { canonical: 'https://inframindhq.online/terms' },
};

export default function TermsPage() {
  return (
    <main className="bg-[#22252c] min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-16 text-text-2 text-sm leading-relaxed">
        <h1 className="text-2xl font-bold text-text mb-2">Terms of Service</h1>
        <p className="mb-8 text-xs">Last updated: June 13, 2026</p>

        <p className="mb-6">
          These Terms of Service ("Terms") govern your access to and use of InfraMind (the
          "Service"). By creating an account or using the Service, you agree to be bound by these
          Terms.
        </p>

        <h2 className="text-lg font-semibold text-text mt-8 mb-3">1. Description of Service</h2>
        <p className="mb-4">
          InfraMind provides uptime, API, and SSL certificate monitoring tools, along with AI-generated
          plain-English incident reports and public status pages. The Service is currently offered in
          beta and features may change without notice.
        </p>

        <h2 className="text-lg font-semibold text-text mt-8 mb-3">2. Account Responsibilities</h2>
        <p className="mb-4">
          You are responsible for maintaining the confidentiality of your account credentials and for
          all activity that occurs under your account. You must provide accurate information when
          creating monitors and configuring alerts.
        </p>

        <h2 className="text-lg font-semibold text-text mt-8 mb-3">3. Acceptable Use</h2>
        <p className="mb-4">
          You agree not to use the Service to monitor websites, APIs, or systems you do not own or do
          not have authorization to monitor. You agree not to misuse the Service in any way that could
          disrupt, damage, or overburden InfraMind's infrastructure or that of third parties.
        </p>

        <h2 className="text-lg font-semibold text-text mt-8 mb-3">4. Beta Service Disclaimer</h2>
        <p className="mb-4">
          The Service is provided "as is" and "as available" during the beta period. While we strive
          for high accuracy and uptime in our monitoring, InfraMind does not guarantee uninterrupted
          service, error-free alerts, or guaranteed detection times. Monitoring results, AI-generated
          reports, and notifications should not be your sole means of tracking critical infrastructure.
        </p>

        <h2 className="text-lg font-semibold text-text mt-8 mb-3">5. Pricing and Plans</h2>
        <p className="mb-4">
          Free beta access is provided at InfraMind's discretion and may be modified or discontinued at
          any time. Paid plans, when launched, will be subject to additional terms communicated at the
          time of purchase.
        </p>

        <h2 className="text-lg font-semibold text-text mt-8 mb-3">6. Limitation of Liability</h2>
        <p className="mb-4">
          To the maximum extent permitted by law, InfraMind shall not be liable for any indirect,
          incidental, or consequential damages, including loss of revenue or data, arising from your
          use of or inability to use the Service.
        </p>

        <h2 className="text-lg font-semibold text-text mt-8 mb-3">7. Termination</h2>
        <p className="mb-4">
          We reserve the right to suspend or terminate accounts that violate these Terms or that engage
          in abusive, fraudulent, or unauthorized use of the Service.
        </p>

        <h2 className="text-lg font-semibold text-text mt-8 mb-3">8. Changes to These Terms</h2>
        <p className="mb-4">
          We may update these Terms from time to time. Continued use of the Service after changes
          constitutes acceptance of the revised Terms.
        </p>

        <h2 className="text-lg font-semibold text-text mt-8 mb-3">9. Contact Us</h2>
        <p>
          For questions about these Terms, contact us at{' '}
          <a href="mailto:support@inframindhq.online" className="text-green hover:underline">
            support@inframindhq.online
          </a>.
        </p>
      </div>
      <Footer />
    </main>
  );
}
