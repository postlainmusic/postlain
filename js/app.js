/**
 * Postlain Cyberpunk 3D Portal - Frontend Logic
 * Controls Mode Switching, 3D Square Gate Grid, and Center 50% Expanded Preview Spotlight.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const store = window.portalStore;
  await store.ready();

  // State
  let currentMode = 'gate'; // 'gate' or 'about'
  let activeExpandedPortalId = null;
  let closeTimeout = null;

  // DOM Elements - Modes
  const modeGateBtn = document.getElementById('mode-gate-btn');
  const modeAboutBtn = document.getElementById('mode-about-btn');
  const sectionGate = document.getElementById('section-gate');
  const sectionAbout = document.getElementById('section-about');

  // DOM Elements - Gate Grid & Expanded Preview
  const gateSquareGrid = document.getElementById('gate-square-grid');
  const gateNodeCount = document.getElementById('gate-node-count');
  
  const previewBackdrop = document.getElementById('expanded-preview-backdrop');
  const previewCloseBtn = document.getElementById('preview-close-btn');
  const previewFeedId = document.getElementById('preview-feed-id');
  const previewScreenFrame = document.getElementById('preview-screen-frame');
  const previewTaglineText = document.getElementById('preview-tagline-text');
  const previewFullDesc = document.getElementById('preview-full-desc');
  const previewMetaProtocol = document.getElementById('preview-meta-protocol');
  const previewMetaCat = document.getElementById('preview-meta-cat');
  const previewMetaClicks = document.getElementById('preview-meta-clicks');
  const previewLaunchBtn = document.getElementById('preview-launch-btn');

  // DOM Elements - About
  const aboutMainTitle = document.getElementById('about-main-title');
  const aboutAlias = document.getElementById('about-alias');
  const aboutQuote = document.getElementById('about-quote');
  const aboutContentBody = document.getElementById('about-content-body');
  const aboutSpecsGrid = document.getElementById('about-specs-grid');

  // Initialize
  renderAll();

  // Listen for data updates
  window.addEventListener('postlain-data-updated', () => {
    renderAll();
  });

  // --- MODE SWITCHER ---
  function setMode(mode) {
    currentMode = mode;
    if (mode === 'gate') {
      modeGateBtn.classList.add('active');
      modeAboutBtn.classList.remove('active');
      sectionGate.classList.add('active');
      sectionAbout.classList.remove('active');
      window.location.hash = '#gate';
    } else {
      modeAboutBtn.classList.add('active');
      modeGateBtn.classList.remove('active');
      sectionAbout.classList.add('active');
      sectionGate.classList.remove('active');
      window.location.hash = '#about';
    }
    initIcons();
  }

  modeGateBtn.addEventListener('click', () => setMode('gate'));
  modeAboutBtn.addEventListener('click', () => setMode('about'));

  // Check URL hash on load
  if (window.location.hash === '#about') {
    setMode('about');
  }

  // --- RENDER ALL ---
  function renderAll() {
    renderGateGrid();
    renderAboutSection();
    initIcons();
  }

  // --- RENDER MASTER GATE SQUARE GRID ---
  function renderGateGrid() {
    const portals = store.getPortals();
    gateNodeCount.textContent = `[ ACTIVE_NODES: ${portals.length} ]`;

    gateSquareGrid.innerHTML = portals.map((portal, idx) => {
      const indexStr = (idx + 1).toString().padStart(2, '0');
      const statusClass = (portal.status || 'ONLINE').toLowerCase();
      const cat = store.getCategories().find(c => c.id === portal.category);

      return `
        <div class="cyber-square-card" data-id="${portal.id}">
          <div class="card-top-hud">
            <span class="card-index">[ GATE_${indexStr} ]</span>
            <span class="card-status-pill ${statusClass}">
              <span class="dot"></span>
              <span>${portal.status || 'ONLINE'}</span>
            </span>
          </div>

          <div class="card-center-reactor">
            <div class="reactor-icon-ring">
              <i data-lucide="${portal.icon || 'globe'}" style="width: 32px; height: 32px;"></i>
            </div>
            <div class="card-title-text">${escapeHtml(portal.title)}</div>
          </div>

          <div class="card-bottom-hud">
            <span>${escapeHtml(cat?.name || 'NODE')}</span>
            <span class="hover-expand-hint">
              <span>VIEW</span>
              <i data-lucide="arrow-up-right" style="width: 14px; height: 14px;"></i>
            </span>
          </div>
        </div>
      `;
    }).join('');

    attachSquareCardEvents();
  }

  // Attach 3D Tilt & Center Zoom Events
  function attachSquareCardEvents() {
    const cards = gateSquareGrid.querySelectorAll('.cyber-square-card');

    cards.forEach(card => {
      const id = card.getAttribute('data-id');

      // 3D Tilt on Mousemove
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -12;
        const rotateY = ((x - centerX) / centerX) * 12;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      });

      // Hover / Click to trigger Center 50% Spotlight Zoom
      card.addEventListener('mouseenter', () => {
        clearTimeout(closeTimeout);
        openExpandedPreview(id);
      });

      card.addEventListener('click', () => {
        openExpandedPreview(id);
      });
    });
  }

  // --- CENTER 50% EXPANDED PREVIEW LOGIC ---
  function openExpandedPreview(id) {
    const portal = store.getPortalById(id);
    if (!portal) return;

    activeExpandedPortalId = id;
    previewFeedId.textContent = `[ DIRECT_FEED // GATE_${portal.id.toUpperCase()} ]`;

    // 1 Dòng Giới Thiệu (Tagline)
    previewTaglineText.textContent = portal.tagline || portal.description || 'Cổng kết nối dịch vụ trực tuyến.';
    
    // Mô tả chi tiết nếu có
    if (previewFullDesc) {
      previewFullDesc.textContent = portal.description || '';
    }

    // Specs
    const cat = store.getCategories().find(c => c.id === portal.category);
    previewMetaCat.textContent = cat?.name || 'SYSTEM_NODE';
    previewMetaProtocol.textContent = portal.url.replace(/^https?:\/\//, '');
    previewMetaClicks.textContent = `${portal.clicks || 0} CLICKS`;

    // Launch Link
    previewLaunchBtn.href = portal.url;
    previewLaunchBtn.setAttribute('data-id', portal.id);

    // Live Preview Screen / Mockup
    renderPreviewScreen(portal);

    // Show Overlay
    previewBackdrop.classList.add('active');
    initIcons();
  }

  function renderPreviewScreen(portal) {
    // Cyberpunk Terminal Preview Screen
    previewScreenFrame.innerHTML = `
      <div class="preview-hud-scanbeam"></div>
      <div class="preview-fallback-display">
        <div style="width: 58px; height: 58px; border-radius: 50%; background: #13131c; border: 1px solid var(--red-neon); display: flex; align-items: center; justify-content: center; color: var(--red-neon); box-shadow: 0 0 20px rgba(255, 0, 60, 0.4);">
          <i data-lucide="${portal.icon || 'globe'}" style="width: 28px; height: 28px;"></i>
        </div>
        <div style="font-family: var(--font-display); font-size: 1.25rem; font-weight: 800; color: #fff; letter-spacing: 1px;">
          ${escapeHtml(portal.title)}
        </div>
        <div style="font-family: var(--font-mono); font-size: 0.82rem; color: var(--red-neon);">
          🔗 ${escapeHtml(portal.url)}
        </div>
      </div>
    `;
  }

  function closeExpandedPreview() {
    previewBackdrop.classList.remove('active');
    activeExpandedPortalId = null;
  }

  previewCloseBtn.addEventListener('click', closeExpandedPreview);

  // Close when clicking outside panel
  previewBackdrop.addEventListener('click', (e) => {
    if (e.target === previewBackdrop) {
      closeExpandedPreview();
    }
  });

  // Smooth hover out delay on panel
  const previewPanel = document.getElementById('expanded-preview-panel');
  previewPanel.addEventListener('mouseleave', () => {
    closeTimeout = setTimeout(() => {
      closeExpandedPreview();
    }, 450);
  });

  previewPanel.addEventListener('mouseenter', () => {
    clearTimeout(closeTimeout);
  });

  // Track click count
  previewLaunchBtn.addEventListener('click', () => {
    if (activeExpandedPortalId) {
      store.incrementClick(activeExpandedPortalId);
    }
  });

  // Escape key to close
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeExpandedPreview();
    }
  });

  // --- RENDER ABOUT SECTION (HỒ SƠ KẺ ẨN DANH) ---
  function renderAboutSection() {
    const about = store.getAbout();

    if (aboutMainTitle) aboutMainTitle.textContent = about.title || 'HỒ SƠ KẺ ẨN DANH // THE ARCHITECT';
    if (aboutAlias) aboutAlias.textContent = `[ BÍ DANH: ${about.alias || 'ANONYMOUS_ARCHITECT'} ]`;
    if (aboutQuote) aboutQuote.textContent = `"${about.quote || 'Trong một thế giới đầy rẫy sự kiểm soát, chúng ta kiến tạo những không gian tự do.'}"`;
    if (aboutContentBody) aboutContentBody.textContent = about.content || 'Nội dung tuyên ngôn đang được cập nhật từ Admin.';

    if (aboutSpecsGrid) {
      const defaultSpecs = [
        { label: "CLEARANCE", value: "LEVEL 0 // ROOT" },
        { label: "ENCRYPTION", value: "SHA-512 / AES-GCM" },
        { label: "NODE_STATUS", value: "UNTRACEABLE" },
        { label: "MISSION", value: "DIGITAL FREEDOM" }
      ];
      const specs = about.specs || defaultSpecs;
      aboutSpecsGrid.innerHTML = specs.map(s => `
        <div class="about-spec-item">
          <div class="about-spec-label">${escapeHtml(s.label)}</div>
          <div class="about-spec-val">${escapeHtml(s.value)}</div>
        </div>
      `).join('');
    }
  }

  // --- HELPERS ---
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
});
