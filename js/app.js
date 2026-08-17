/**
 * Postlain Ecosystem Portal - Frontend Logic
 */

document.addEventListener('DOMContentLoaded', async () => {
  const store = window.portalStore;
  await store.ready();

  // State
  let currentCategory = 'all';
  let searchQuery = '';
  let onlyFavorites = false;

  // DOM Elements
  const announcementBanner = document.getElementById('announcement-banner');
  const announcementBadge = document.getElementById('announcement-badge');
  const announcementText = document.getElementById('announcement-text');
  const announcementClose = document.getElementById('announcement-close');
  
  const siteTitleEl = document.getElementById('site-title');
  const heroTitleEl = document.getElementById('hero-title');
  const heroSubtitleEl = document.getElementById('hero-subtitle');
  
  const searchInput = document.getElementById('portal-search');
  const searchClearBtn = document.getElementById('search-clear-btn');
  const categoryPillsContainer = document.getElementById('category-pills');
  
  const spotlightSection = document.getElementById('spotlight-section');
  const spotlightGrid = document.getElementById('spotlight-grid');
  
  const portalsGrid = document.getElementById('portals-grid');
  const portalsCountEl = document.getElementById('portals-count');
  const emptyState = document.getElementById('empty-state');
  const resetSearchBtn = document.getElementById('reset-search-btn');
  
  const totalPortalsMetric = document.getElementById('total-portals-metric');
  const livePortalsMetric = document.getElementById('live-portals-metric');
  const totalClicksMetric = document.getElementById('total-clicks-metric');

  // Initialize
  renderAll();

  // Listen for data updates
  window.addEventListener('postlain-data-updated', () => {
    renderAll();
  });

  window.addEventListener('postlain-favorites-updated', () => {
    renderPortals();
    renderCategories();
  });

  // --- RENDER FUNCTIONS ---
  function renderAll() {
    renderSettings();
    renderCategories();
    renderSpotlight();
    renderPortals();
    renderMetrics();
    initIcons();
  }

  function renderSettings() {
    const settings = store.getSettings();
    
    // Announcement
    if (settings.announcement?.enabled) {
      announcementBanner.classList.remove('hidden');
      announcementBadge.textContent = settings.announcement.badge || 'MỚI';
      announcementText.textContent = settings.announcement.text || '';
      announcementText.href = settings.announcement.link || '#';
    } else {
      announcementBanner.classList.add('hidden');
    }

    if (siteTitleEl && settings.siteName) {
      siteTitleEl.textContent = settings.siteName;
    }
    if (heroSubtitleEl && settings.tagline) {
      heroSubtitleEl.textContent = settings.tagline;
    }
  }

  function renderCategories() {
    const categories = store.getCategories();
    const portals = store.getPortals();
    const favs = store.getFavorites();

    let html = `
      <button class="category-pill ${currentCategory === 'all' && !onlyFavorites ? 'active' : ''}" data-cat="all">
        <span class="category-pill-icon"><i data-lucide="layout-grid"></i></span>
        <span>Tất cả</span>
        <span class="category-pill-count">${portals.length}</span>
      </button>
    `;

    if (favs.length > 0) {
      html += `
        <button class="category-pill ${onlyFavorites ? 'active' : ''}" data-cat="favorites">
          <span class="category-pill-icon" style="color: var(--accent-amber);"><i data-lucide="star"></i></span>
          <span>Yêu thích</span>
          <span class="category-pill-count">${favs.length}</span>
        </button>
      `;
    }

    categories.forEach(cat => {
      const count = portals.filter(p => p.category === cat.id).length;
      const isActive = currentCategory === cat.id && !onlyFavorites;
      html += `
        <button class="category-pill ${isActive ? 'active' : ''}" data-cat="${cat.id}">
          <span class="category-pill-icon" style="color: ${cat.color || 'var(--accent-primary)'};">
            <i data-lucide="${cat.icon || 'folder'}"></i>
          </span>
          <span>${escapeHtml(cat.name)}</span>
          <span class="category-pill-count">${count}</span>
        </button>
      `;
    });

    categoryPillsContainer.innerHTML = html;

    // Attach click events
    categoryPillsContainer.querySelectorAll('.category-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-cat');
        if (cat === 'favorites') {
          onlyFavorites = true;
          currentCategory = 'all';
        } else {
          onlyFavorites = false;
          currentCategory = cat;
        }
        renderCategories();
        renderPortals();
        initIcons();
      });
    });
  }

  function renderSpotlight() {
    const portals = store.getPortals();
    const featured = portals.filter(p => p.featured);

    if (featured.length === 0 || currentCategory !== 'all' || searchQuery || onlyFavorites) {
      spotlightSection.style.display = 'none';
      return;
    }

    spotlightSection.style.display = 'block';
    spotlightGrid.innerHTML = featured.slice(0, 3).map(portal => {
      const cat = store.getCategoryById(portal.category);
      const isFav = store.isFavorite(portal.id);
      return `
        <div class="spotlight-card" style="--card-accent: ${portal.accent || '#6366f1'};">
          <div>
            <div class="spotlight-header">
              <div class="spotlight-icon-wrap" style="background: linear-gradient(135deg, ${portal.accent || '#6366f1'}, #312e81);">
                <i data-lucide="${portal.icon || 'globe'}" style="width: 26px; height: 26px;"></i>
              </div>
              <div class="portal-actions-top">
                <span class="spotlight-badge">${escapeHtml(portal.badge || 'Nổi bật')}</span>
                <button class="fav-btn ${isFav ? 'active' : ''}" data-id="${portal.id}" title="Ghim yêu thích">
                  <i data-lucide="star" style="width: 18px; height: 18px; ${isFav ? 'fill: currentColor;' : ''}"></i>
                </button>
              </div>
            </div>
            <div class="portal-category-tag" style="color: ${cat?.color || 'var(--accent-primary)'};">
              <i data-lucide="${cat?.icon || 'tag'}" style="width: 14px; height: 14px;"></i>
              ${escapeHtml(cat?.name || 'Dịch vụ')}
            </div>
            <h3 class="spotlight-title">${escapeHtml(portal.title)}</h3>
            <p class="spotlight-desc">${escapeHtml(portal.description || '')}</p>
          </div>
          <div class="spotlight-footer">
            <span class="portal-clicks">
              <i data-lucide="eye" style="width: 14px; height: 14px;"></i>
              ${formatClicks(portal.clicks)} lượt xem
            </span>
            <a href="${escapeHtml(portal.url)}" target="_blank" rel="noopener noreferrer" class="launch-btn portal-link" data-id="${portal.id}">
              <span>Mở Cổng</span>
              <i data-lucide="arrow-up-right" class="arrow-icon" style="width: 16px; height: 16px;"></i>
            </a>
          </div>
        </div>
      `;
    }).join('');

    attachPortalCardEvents(spotlightGrid);
  }

  function renderPortals() {
    let portals = store.getPortals();
    const favs = store.getFavorites();

    // Filter by favorites
    if (onlyFavorites) {
      portals = portals.filter(p => favs.includes(p.id));
    } else if (currentCategory !== 'all') {
      portals = portals.filter(p => p.category === currentCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      portals = portals.filter(p => {
        const cat = store.getCategoryById(p.category);
        return (
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.url?.toLowerCase().includes(q) ||
          p.badge?.toLowerCase().includes(q) ||
          cat?.name?.toLowerCase().includes(q)
        );
      });
    }

    portalsCountEl.textContent = `${portals.length} Cổng kết nối`;

    if (portals.length === 0) {
      portalsGrid.innerHTML = '';
      emptyState.classList.add('active');
      return;
    }

    emptyState.classList.remove('active');

    portalsGrid.innerHTML = portals.map(portal => {
      const cat = store.getCategoryById(portal.category);
      const isFav = store.isFavorite(portal.id);
      const statusClass = portal.status || 'live';
      const statusLabel = getStatusLabel(portal.status);

      return `
        <div class="portal-card" style="--card-accent: ${portal.accent || '#6366f1'};">
          <div>
            <div class="portal-card-top">
              <div class="portal-icon-container" style="background: linear-gradient(135deg, ${portal.accent || '#6366f1'}, rgba(30, 41, 59, 0.9));">
                <i data-lucide="${portal.icon || 'globe'}" style="width: 22px; height: 22px;"></i>
              </div>
              <div class="portal-actions-top">
                <span class="status-badge ${statusClass}">
                  <span class="dot"></span>
                  ${statusLabel}
                </span>
                <button class="fav-btn ${isFav ? 'active' : ''}" data-id="${portal.id}" title="Ghim yêu thích">
                  <i data-lucide="star" style="width: 17px; height: 17px; ${isFav ? 'fill: currentColor;' : ''}"></i>
                </button>
              </div>
            </div>

            <div class="portal-body">
              <div class="portal-category-tag" style="color: ${cat?.color || 'var(--accent-primary)'};">
                <i data-lucide="${cat?.icon || 'tag'}" style="width: 13px; height: 13px;"></i>
                ${escapeHtml(cat?.name || 'Hệ thống')}
              </div>
              <h3 class="portal-title">
                <span>${escapeHtml(portal.title)}</span>
                ${portal.badge ? `<span style="font-size: 0.7rem; padding: 2px 7px; border-radius: 99px; background: rgba(255,255,255,0.08); color: var(--text-secondary); font-weight: 500;">${escapeHtml(portal.badge)}</span>` : ''}
              </h3>
              <p class="portal-desc">${escapeHtml(portal.description || 'Truy cập cổng dịch vụ trực tuyến.')}</p>
            </div>
          </div>

          <div class="portal-card-footer">
            <div class="portal-clicks">
              <i data-lucide="mouse-pointer" style="width: 13px; height: 13px;"></i>
              <span>${formatClicks(portal.clicks)} clicks</span>
            </div>
            <a href="${escapeHtml(portal.url)}" target="_blank" rel="noopener noreferrer" class="launch-btn portal-link" data-id="${portal.id}">
              <span>Truy Cập</span>
              <i data-lucide="arrow-up-right" class="arrow-icon" style="width: 15px; height: 15px;"></i>
            </a>
          </div>
        </div>
      `;
    }).join('');

    attachPortalCardEvents(portalsGrid);
  }

  function renderMetrics() {
    const portals = store.getPortals();
    const total = portals.length;
    const liveCount = portals.filter(p => p.status === 'live' || !p.status).length;
    const totalClicks = portals.reduce((acc, curr) => acc + (curr.clicks || 0), 0);

    if (totalPortalsMetric) totalPortalsMetric.textContent = total;
    if (livePortalsMetric) livePortalsMetric.textContent = `${liveCount}/${total}`;
    if (totalClicksMetric) totalClicksMetric.textContent = formatClicks(totalClicks);
  }

  function attachPortalCardEvents(container) {
    // Links click tracking
    container.querySelectorAll('.portal-link').forEach(link => {
      link.addEventListener('click', (e) => {
        const id = link.getAttribute('data-id');
        if (id) {
          store.incrementClick(id);
          renderMetrics();
        }
      });
    });

    // Favorite button
    container.querySelectorAll('.fav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const isNowFav = store.toggleFavorite(id);
        showToast(isNowFav ? 'Đã thêm vào mục yêu thích ⭐' : 'Đã bỏ khỏi mục yêu thích');
      });
    });
  }

  // --- SEARCH EVENTS ---
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    if (searchQuery.trim()) {
      searchClearBtn.classList.add('active');
    } else {
      searchClearBtn.classList.remove('active');
    }
    renderSpotlight();
    renderPortals();
    initIcons();
  });

  searchClearBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    searchClearBtn.classList.remove('active');
    renderSpotlight();
    renderPortals();
    initIcons();
    searchInput.focus();
  });

  if (resetSearchBtn) {
    resetSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      currentCategory = 'all';
      onlyFavorites = false;
      searchClearBtn.classList.remove('active');
      renderCategories();
      renderSpotlight();
      renderPortals();
      initIcons();
    });
  }

  // Keyboard shortcut '/' or 'Ctrl+K'
  window.addEventListener('keydown', (e) => {
    if ((e.key === '/' || (e.ctrlKey && e.key === 'k') || (e.metaKey && e.key === 'k')) && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput.focus();
    } else if (e.key === 'Escape' && document.activeElement === searchInput) {
      searchInput.blur();
    }
  });

  // Announcement close
  if (announcementClose) {
    announcementClose.addEventListener('click', () => {
      announcementBanner.classList.add('hidden');
    });
  }

  // --- HELPERS ---
  function getStatusLabel(status) {
    switch (status) {
      case 'live': return 'Hoạt động';
      case 'beta': return 'Beta';
      case 'coming_soon': return 'Sắp ra mắt';
      case 'maintenance': return 'Bảo trì';
      default: return 'Online';
    }
  }

  function formatClicks(num) {
    if (!num) return '0';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function showToast(message, type = 'normal') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <i data-lucide="info" style="width: 18px; height: 18px;"></i>
      <span>${escapeHtml(message)}</span>
    `;
    container.appendChild(toast);
    initIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }
});
