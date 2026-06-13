import type { Metadata } from 'next';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata: Metadata = {
  title: 'Contact Us | InfraMind',
  description: 'Get in touch with the InfraMind team for support or inquiries.',
  alternates: { canonical: 'https://inframindhq.online/contact' },
};

export default function ContactPage() {
  return (
    <main className="bg-[#22252c] min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-2xl font-bold text-text mb-3">Contact Us</h1>
        <p className="text-text-2 text-sm mb-10 leading-relaxed">
          Have a question, found a bug, or need help setting up a monitor? We'd love to hear from you.
        </p>

        <div className="space-y-6">
          <div className="bg-[#1a1c22] border border-white/[0.05] rounded-xl p-5">
            <h3 className="text-text text-sm font-semibold mb-1">Email Support</h3>
            <p className="text-text-2 text-xs mb-2">For account help, billing, or technical issues.</p>
            <a href="mailto:support@inframindhq.online" className="text-green font-semibold text-sm hover:underline">
              support@inframindhq.online
            </a>
          </div>

          <div className="bg-[#1a1c22] border border-white/[0.05] rounded-xl p-5">
            <h3 className="text-text text-sm font-semibold mb-1">Phone</h3>
            <p className="text-text-2 text-xs mb-2">Available during business hours (IST).</p>
            <a href="tel:+919633474645" className="text-green font-semibold text-sm hover:underline">
              +91 96334 74645
            </a>
          </div>

          <div className="bg-[#1a1c22] border border-white/[0.05] rounded-xl p-5">
            <h3 className="text-text text-sm font-semibold mb-1">LinkedIn</h3>
            <p className="text-text-2 text-xs mb-2">Follow for product updates and announcements.</p>
            <a href="https://www.linkedin.com/company/inframind" target="_blank" rel="noopener noreferrer" className="text-green font-semibold text-sm hover:underline">
              linkedin.com/company/inframind
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
