/**
 * Postlain Cyberpunk 3D Portal - Frontend Logic
 * Direct in-place switching & Big Square Cards with Center 50% Zoom Preview.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const store = window.portalStore;
  await store.ready();

  let activePortalId = null;
  let hoverTimeout = null;

  // DOM Elements - Switcher
  const modeGateBtn = document.getElementById('mode-gate-btn');
  const modeAboutBtn = document.getElementById('mode-about-btn');
  const sectionGate = document.getElementById('section-gate');
  const sectionAbout = document.getElementById('section-about');

  // DOM Elements - Big Square Grid
  const bigSquareGrid = document.getElementById('big-square-grid');

  // DOM Elements - Center 50% Zoom Modal
  const previewBackdrop = document.getElementById('center-preview-backdrop');
  const previewPanel = document.getElementById('center-preview-panel');
  const previewCloseBtn = document.getElementById('preview-close-btn');
  const previewFeedId = document.getElementById('preview-feed-id');
  const previewScreenContent = document.getElementById('preview-screen-content');
  const previewTaglineText = document.getElementById('preview-tagline-text');
  const previewUrlText = document.getElementById('preview-url-text');
  const previewLaunchBtn = document.getElementById('preview-launch-btn');

  // DOM Elements - About
  const aboutTitle = document.getElementById('about-title');
  const aboutAlias = document.getElementById('about-alias');
  const aboutQuote = document.getElementById('about-quote');
  const aboutContent = document.getElementById('about-content');

  // Initial Render
  renderAll();

  window.addEventListener('postlain-data-updated', () => {
    renderAll();
  });

  // --- TRỰC TIẾP CHUYỂN ĐỔI GIỮA MASTER GATE VÀ ABOUT (KHÔNG CẦN CHUYỂN TRANG) ---
  modeGateBtn.addEventListener('click', () => {
    modeGateBtn.classList.add('active');
    modeAboutBtn.classList.remove('active');
    sectionGate.classList.add('active');
    sectionAbout.classList.remove('active');
    initIcons();
  });

  modeAboutBtn.addEventListener('click', () => {
    modeAboutBtn.classList.add('active');
    modeGateBtn.classList.remove('active');
    sectionAbout.classList.add('active');
    sectionGate.classList.remove('active');
    initIcons();
  });

  function renderAll() {
    renderBigSquareCards();
    renderAboutData();
    initIcons();
  }

  // --- RENDER CÁC HÌNH VUÔNG THẬT TO (BIG SQUARE CARDS) ---
  function renderBigSquareCards() {
    const portals = store.getPortals();

    bigSquareGrid.innerHTML = portals.map((portal, idx) => {
      const indexStr = (idx + 1).toString().padStart(2, '0');
      return `
        <div class="big-square-card" data-id="${portal.id}">
          <div class="card-top-hud">
            <span class="card-index">[ GATE_${indexStr} ]</span>
            <span class="card-status-pill">
              <span class="dot"></span>
              <span>${portal.status || 'ONLINE'}</span>
            </span>
          </div>

          <div class="card-center-reactor">
            <div class="big-reactor-icon">
              <i data-lucide="${portal.icon || 'globe'}" style="width: 44px; height: 44px;"></i>
            </div>
            <div class="big-card-title">${escapeHtml(portal.title)}</div>
          </div>

          <div class="card-bottom-hud">
            <span>NODE // 0${idx + 1}</span>
            <span class="hover-open-hint">
              <span>XEM TRƯỚC</span>
              <i data-lucide="arrow-up-right" style="width: 16px; height: 16px;"></i>
            </span>
          </div>
        </div>
      `;
    }).join('');

    attachCardInteractions();
  }

  // --- HIỆU ỨNG ĐƯA CHUỘT PHÓNG TO 50% GIỮA MÀN HÌNH ---
  function attachCardInteractions() {
    const cards = bigSquareGrid.querySelectorAll('.big-square-card');

    cards.forEach(card => {
      const id = card.getAttribute('data-id');

      // 3D Tilt
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      });

      // Hover / Click opens Center 50% Zoom
      card.addEventListener('mouseenter', () => {
        clearTimeout(hoverTimeout);
        openCenterPreview(id);
      });

      card.addEventListener('click', () => {
        openCenterPreview(id);
      });
    });
  }

  function openCenterPreview(id) {
    const portal = store.getPortalById(id);
    if (!portal) return;

    activePortalId = id;
    previewFeedId.textContent = `[ DIRECT_FEED // GATE_${portal.id.toUpperCase()} ]`;
    previewTaglineText.textContent = portal.tagline || portal.description || 'Cổng dịch vụ trực tuyến.';
    previewUrlText.textContent = portal.url;
    previewLaunchBtn.href = portal.url;

    // Render Preview Screen
    previewScreenContent.innerHTML = `
      <div style="width: 60px; height: 60px; border-radius: 50%; background: #161622; border: 2px solid #ff003c; display: flex; align-items: center; justify-content: center; color: #ff003c; box-shadow: 0 0 25px rgba(255, 0, 60, 0.5);">
        <i data-lucide="${portal.icon || 'globe'}" style="width: 32px; height: 32px;"></i>
      </div>
      <div style="font-family: var(--font-display); font-size: 1.35rem; font-weight: 800; color: #fff; letter-spacing: 1px;">
        ${escapeHtml(portal.title)}
      </div>
      <div style="font-family: var(--font-mono); font-size: 0.82rem; color: #ff003c;">
        🔗 ${escapeHtml(portal.url)}
      </div>
    `;

    previewBackdrop.classList.add('active');
    initIcons();
  }

  function closeCenterPreview() {
    previewBackdrop.classList.remove('active');
    activePortalId = null;
  }

  previewCloseBtn.addEventListener('click', closeCenterPreview);
  previewBackdrop.addEventListener('click', (e) => {
    if (e.target === previewBackdrop) closeCenterPreview();
  });

  previewPanel.addEventListener('mouseleave', () => {
    hoverTimeout = setTimeout(closeCenterPreview, 400);
  });

  previewPanel.addEventListener('mouseenter', () => {
    clearTimeout(hoverTimeout);
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCenterPreview();
  });

  previewLaunchBtn.addEventListener('click', () => {
    if (activePortalId) store.incrementClick(activePortalId);
  });

  // --- RENDER ABOUT DATA ---
  function renderAboutData() {
    const about = store.getAbout();
    if (aboutTitle) aboutTitle.textContent = about.title || 'HỒ SƠ KẺ ẨN DANH // THE ARCHITECT';
    if (aboutAlias) aboutAlias.textContent = `[ BÍ DANH: ${about.alias || 'ANONYMOUS_ARCHITECT'} ]`;
    if (aboutQuote) aboutQuote.textContent = `"${about.quote || 'Trong một thế giới đầy rẫy sự kiểm soát, chúng ta kiến tạo những không gian tự do.'}"`;
    if (aboutContent) aboutContent.textContent = about.content || 'Nội dung đang được cập nhật từ Admin.';
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
    if (window.lucide) window.lucide.createIcons();
  }
});
