import Link from 'next/link';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=IBM+Plex+Mono:wght@400;500&display=swap');

  .admin-shell { font-family: 'DM Sans', system-ui, sans-serif; background: #09090f; color: #e2e6f0; min-height: 100vh; display: flex; }

  .admin-sidebar { width: 220px; flex-shrink: 0; background: #0d0f16; border-right: 1px solid rgba(255,255,255,0.06); padding: 24px 16px; position: sticky; top: 0; height: 100vh; }

  .admin-logo { font-family: 'IBM Plex Mono', monospace; font-size: 13px; font-weight: 500; color: #34d399; letter-spacing: 0.04em; margin-bottom: 28px; padding: 0 8px; }

  .admin-nav-link { display: block; padding: 10px 12px; border-radius: 8px; color: #8a95a3; text-decoration: none; font-size: 13.5px; font-weight: 500; margin-bottom: 2px; transition: background 0.15s, color 0.15s; }

  .admin-nav-link:hover { background: rgba(255,255,255,0.04); color: #e2e6f0; }

  .admin-main { flex: 1; padding: 32px 40px; max-width: 1100px; }
`;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="admin-sidebar">
        <div className="admin-logo">INFRAMIND · ADMIN</div>
        <Link href="/ad-min" className="admin-nav-link">Overview</Link>
        <Link href="/ad-min/clients" className="admin-nav-link">Clients</Link>
        <Link href="/ad-min/blog" className="admin-nav-link">Blog Posts</Link>
        <Link href="/ad-min/linkedin-rewards" className="admin-nav-link">LinkedIn Rewards</Link>
        <Link href="/ad-min/social-proof" className="admin-nav-link">Social Proof</Link>
      </div>
      <div className="admin-main">{children}</div>
    </div>
  );
}
