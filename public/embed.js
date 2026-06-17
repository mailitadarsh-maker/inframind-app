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
        const card = document.createElement('div');
        card.style.cssText = 'border:1px solid #e5e7eb;border-radius:12px;padding:24px;background:#fff;cursor:pointer;transition:box-shadow 0.2s;';
        card.onmouseover = () => card.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
        card.onmouseout = () => card.style.boxShadow = 'none';

        const date = new Date(blog.created_at).toLocaleDateString('en-US', { day:'numeric', month:'short', year:'numeric' });

        card.innerHTML = `
          <p style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">${date}</p>
          <h3 style="font-size:18px;font-weight:700;color:#111827;margin:0 0 12px 0;line-height:1.4;">${blog.title}</h3>
          <p style="font-size:13px;color:#6b7280;margin:0;">${(blog.content || '').replace(/<[^>]*>/g,'').slice(0,120)}...</p>
        `;

        card.onclick = () => {
          const modal = document.createElement('div');
          modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;';

          modal.innerHTML = `
            <div style="background:#fff;border-radius:16px;padding:40px;max-width:720px;width:100%;max-height:80vh;overflow-y:auto;position:relative;">
              <button onclick="this.closest('[style*=fixed]').remove()" style="position:absolute;top:16px;right:16px;background:none;border:none;font-size:20px;cursor:pointer;color:#6b7280;">&#x2715;</button>
              <p style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px;">${date}</p>
              <h2 style="font-size:24px;font-weight:800;color:#111827;margin:0 0 24px 0;">${blog.title}</h2>
              <div style="font-size:15px;color:#374151;line-height:1.8;">${blog.content}</div>
            </div>
          `;

          document.body.appendChild(modal);
          modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
        };

        grid.appendChild(card);
      });

      container.appendChild(grid);
    })
    .catch(() => {
      container.innerHTML = '<p style="color:#888;font-size:14px;">Could not load blogs.</p>';
    });
})();
