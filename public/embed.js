(function() {
  const script = document.currentScript || document.querySelector('script[data-client]');
  const clientSlug = script && script.getAttribute('data-client');
  const container = document.getElementById('inframind-blog');

  if (!clientSlug || !container) return;

  const API = 'https://inframindhq.online/api/client-blogs/' + clientSlug;

  container.innerHTML = '<p style="color:#888;font-size:14px;">Loading blogs...</p>';

  fetch(API)
    .then(r => r.json())
    .then(data => {
      const blogs = data.blogs || [];
      if (blogs.length === 0) {
        container.innerHTML = '<p style="color:#888;font-size:14px;">No blogs published yet.</p>';
        return;
      }

      container.innerHTML = '';

      const grid = document.createElement('div');
      grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:24px;';

      blogs.forEach(blog => {
        const blogUrl = 'https://inframindhq.online/blogs/' + clientSlug + '/' + blog.slug;

        const card = document.createElement('a');
        card.href = blogUrl;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        card.style.cssText = 'display:block;border:1px solid #e5e7eb;border-radius:12px;padding:24px;background:#fff;cursor:pointer;transition:box-shadow 0.2s;text-decoration:none;';
        card.onmouseover = () => card.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
        card.onmouseout = () => card.style.boxShadow = 'none';

        const date = new Date(blog.created_at).toLocaleDateString('en-US', { day:'numeric', month:'short', year:'numeric' });

        card.innerHTML = `
          <p style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">${date}</p>
          <h3 style="font-size:18px;font-weight:700;color:#111827;margin:0 0 12px 0;line-height:1.4;">${blog.title}</h3>
          <p style="font-size:13px;color:#6b7280;margin:0 0 16px 0;">${(blog.content || '').replace(/<[^>]*>/g,'').slice(0,120)}...</p>
          <span style="font-size:12px;font-weight:600;color:#059669;">Read full article →</span>
        `;

        grid.appendChild(card);
      });

      container.appendChild(grid);
    })
    .catch(() => {
      container.innerHTML = '<p style="color:#888;font-size:14px;">Could not load blogs.</p>';
    });
})();
