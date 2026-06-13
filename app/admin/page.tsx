import Link from 'next/link';

export default function AdminHomePage() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: '#09090f', color: '#e2e6f0', minHeight: '100vh', padding: '32px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '24px' }}>Admin Dashboard</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px' }}>
        <Link
          href="/admin/blog"
          style={{
            background: '#0d0f16',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '10px',
            padding: '16px 20px',
            color: '#e2e6f0',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '15px',
          }}
        >
          Blog Posts
        </Link>

        <Link
          href="/admin/linkedin-rewards"
          style={{
            background: '#0d0f16',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '10px',
            padding: '16px 20px',
            color: '#e2e6f0',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '15px',
          }}
        >
          LinkedIn Rewards
        </Link>
      </div>
    </div>
  );
}
