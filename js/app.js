/**
 * POSTLAIN // High-End Minimalist Engine
 */

const STORAGE_KEY = 'postlain_data_v14';

const DEFAULT_PORTALS = [
  {
    id: "project-1",
    title: "HIDDEN MUSIC",
    url: "https://hiddenmusic.postlain.com",
    image: "",
    desc: "Nền tảng âm nhạc độc lập dành riêng cho cộng đồng ngầm."
  },
  {
    id: "project-2",
    title: "POSTLAIN MUSIC",
    url: "",
    image: "",
    desc: "Dịch vụ stream âm thanh Hi-Res Lossless 24-bit chuẩn phòng thu."
  },
  {
    id: "project-3",
    title: "STUDIO DAW",
    url: "",
    image: "",
    desc: "Trạm thu âm & phối khí kỹ thuật số trực tuyến."
  },
  {
    id: "project-4",
    title: "AI SOUND LAB",
    url: "",
    image: "",
    desc: "Công cụ tách Stem giọng hát và xử lý phổ âm thanh AI."
  }
];

const DEFAULT_ABOUT = {
  title: "Giới Thiệu // The Architect",
  alias: "ANONYMOUS_CREATOR",
  quote: "Trong một thế giới đầy rẫy sự kiểm soát, chúng ta kiến tạo những không gian tự do.",
  content: "Tôi là một kẻ ẩn danh đứng sau những dòng mã và những tần số âm thanh của Postlain.\n\nMục đích duy nhất của tôi khi tạo ra chuỗi website và công cụ này là thiết lập một mạng lưới độc lập – nơi bất kỳ ai cũng có thể sáng tạo âm nhạc chất lượng phòng thu, khai thác sức mạnh của trí tuệ nhân tạo, và kết nối với những người cùng tần số mà không bị ràng buộc bởi bất kỳ nền tảng độc quyền nào.\n\nMỗi cổng kết nối là một công cụ độc lập được trau chuốt tỉ mỉ. Hãy sử dụng những công cụ này để tạo nên những điều phi thường."
};

const DEFAULT_LINKS = [
  { name: "Website Portal", tag: "GATEWAY", url: "https://postlain.com", icon: "globe" },
  { name: "Spotify", tag: "STREAMING", url: "https://open.spotify.com", icon: "spotify" },
  { name: "Apple Music", tag: "LOSSLESS", url: "https://music.apple.com", icon: "apple" },
  { name: "YouTube", tag: "OFFICIAL", url: "https://youtube.com/@postlain", icon: "youtube" },
  { name: "Instagram", tag: "SOCIAL", url: "https://instagram.com/postlainmusic", icon: "instagram" },
  { name: "Amazon Music", tag: "HI-RES", url: "https://music.amazon.com", icon: "amazon" }
];

function getData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.portals) && parsed.portals.length > 0) {
        if (!parsed.links) parsed.links = DEFAULT_LINKS;
        return parsed;
      }
    }
  } catch (e) {}
  const init = { portals: DEFAULT_PORTALS, about: DEFAULT_ABOUT, links: DEFAULT_LINKS };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(init));
  return init;
}

/* ==========================================================================
   SVG ICONS HELPER
   ========================================================================== */
function getIconSvg(type) {
  switch (type) {
    case 'globe':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`;
    case 'spotify':
      return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 5.524 4.477 10 10 10s10-4.476 10-10c0-5.523-4.477-10-10-10zm4.586 14.424c-.18.295-.563.387-.857.207-2.35-1.435-5.308-1.76-8.792-.963-.335.077-.67-.133-.746-.468-.077-.334.132-.67.467-.746 3.808-.87 7.076-.502 9.72 1.114.295.18.388.563.208.856zm1.225-2.724c-.226.367-.707.482-1.074.256-2.69-1.653-6.79-2.134-9.97-1.168-.413.125-.85-.107-.975-.52-.125-.414.108-.85.52-.976 3.633-1.103 8.147-.568 11.243 1.334.367.226.482.707.256 1.074zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71c-.494.15-1.018-.13-1.168-.624-.15-.494.13-1.018.624-1.168 3.532-1.072 9.404-.866 13.115 1.338.445.264.59.838.327 1.282-.264.444-.838.59-1.28.327z"/></svg>`;
    case 'apple':
      return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.85-.9.04-2.02.6-2.66 1.34-.56.65-1.06 1.7-0.93 2.72 1.01.08 2.05-.46 2.67-1.21z"/></svg>`;
    case 'youtube':
      return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`;
    case 'instagram':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`;
    case 'amazon':
      return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.95 10.37c-.12-.03-.28-.05-.48-.05-1.57 0-2.5.82-2.5 2.18 0 1.34.82 2.07 2.05 2.07.72 0 1.25-.23 1.58-.67v-3.53zm3.17 6.4c-.2.17-.48.18-.7.05-.98-.78-1.15-1.15-1.68-1.92-1.6 1.63-2.73 2.07-4.47 2.07-2.18 0-3.88-1.37-3.88-3.88 0-2.02 1.13-3.47 2.85-4.13 1.48-.57 3.57-.67 5.4-.67v-.23c0-.75-.48-1.33-1.63-1.33-.97 0-1.97.35-2.6.8-.2.15-.47.12-.63-.07l-.92-1.07c-.15-.18-.12-.45.07-.62C10.22 4.7 12.02 4.2 13.9 4.2c2.8 0 4.18 1.42 4.18 3.98v5.52c0 1.22.48 1.77.93 2.45.17.25.13.57-.1.75l-1.79 1.87zM2.38 18.8c.18-.15.43-.13.58.05 3.8 4.45 13.1 5.48 18.28 1.43.23-.18.57-.13.72.1.15.23.08.57-.15.75-5.75 4.5-16.1 3.35-20.01-1.57-.15-.2-.1-.53.13-.68l.45-.08z"/></svg>`;
    default:
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
  }
}

/* ==========================================================================
   TAB SWITCHER
   ========================================================================== */
function switchTab(tabName) {
  const btnPortals = document.getElementById('tab-btn-portals');
  const btnAbout = document.getElementById('tab-btn-about');
  const indicator = document.getElementById('segmented-indicator');
  const viewPortals = document.getElementById('view-portals');
  const viewAbout = document.getElementById('view-about');

  if (tabName === 'portals') {
    btnPortals.classList.add('active');
    btnAbout.classList.remove('active');
    viewPortals.classList.add('active');
    viewAbout.classList.remove('active');

    if (indicator && btnPortals) {
      indicator.style.transform = `translateX(0px)`;
      indicator.style.width = `${btnPortals.offsetWidth}px`;
    }
    adjustIframeScaling();
  } else {
    btnAbout.classList.add('active');
    btnPortals.classList.remove('active');
    viewAbout.classList.add('active');
    viewPortals.classList.remove('active');

    if (indicator && btnPortals && btnAbout) {
      indicator.style.transform = `translateX(${btnPortals.offsetWidth}px)`;
      indicator.style.width = `${btnAbout.offsetWidth}px`;
    }
  }
}

/* ==========================================================================
   DESKTOP LIVE IFRAME 1280x720 PROPORTIONAL SCALING (FULL-COVERAGE, NO BLACK BARS)
   ========================================================================== */
function adjustIframeScaling() {
  const previewBoxes = document.querySelectorAll('.preview-box');
  previewBoxes.forEach(box => {
    const iframe = box.querySelector('.live-iframe');
    if (!iframe) return;

    const w = box.clientWidth;
    const h = box.clientHeight;
    if (w === 0 || h === 0) return;

    const VIRTUAL_W = 1280;
    const VIRTUAL_H = 720;

    const scale = Math.max(w / VIRTUAL_W, h / VIRTUAL_H);
    iframe.style.transform = `scale(${scale})`;
    iframe.style.left = `${(w - VIRTUAL_W * scale) / 2}px`;
    iframe.style.top = `${(h - VIRTUAL_H * scale) / 2}px`;
  });
}

/* ==========================================================================
   3D PARALLAX TILT & GLARE EFFECT
   ========================================================================== */
function bindParallaxTilt() {
  const cards = document.querySelectorAll('.project-card.active-portal');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
      card.style.setProperty('--mouse-card-x', `${x}px`);
      card.style.setProperty('--mouse-card-y', `${y}px`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    });
  });
}

/* ==========================================================================
   MOUSE SPOTLIGHT TRACKING
   ========================================================================== */
function initMouseSpotlight() {
  const spotlight = document.getElementById('mouse-spotlight');
  if (!spotlight) return;
  window.addEventListener('mousemove', (e) => {
    spotlight.style.left = `${e.clientX}px`;
    spotlight.style.top = `${e.clientY}px`;
  }, { passive: true });
}

/* ==========================================================================
   PRELOADER COUNTER (0% -> 100%)
   ========================================================================== */
function initPreloader() {
  const preloader = document.getElementById('site-preloader');
  const counterEl = document.getElementById('preloader-counter');
  const fillEl = document.getElementById('preloader-line-fill');
  if (!preloader || !counterEl || !fillEl) return;

  let current = 0;
  const target = 100;
  const startTime = performance.now();
  const duration = 1000;

  function updateCounter(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = 1 - Math.pow(1 - progress, 4);
    current = Math.floor(easeProgress * target);

    counterEl.textContent = `${current.toString().padStart(2, '0')}%`;
    fillEl.style.width = `${current}%`;

    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    } else {
      counterEl.textContent = `100%`;
      fillEl.style.width = `100%`;
      setTimeout(() => {
        preloader.classList.add('fade-out');
      }, 150);
    }
  }

  requestAnimationFrame(updateCounter);
}

/* ==========================================================================
   RENDER 4 CARDS & PORTFOLIO ABOUT
   ========================================================================== */
function renderGrid() {
  const data = getData();
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  const portals = data.portals.slice(0, 4);

  while (portals.length < 4) {
    portals.push({
      id: `project-${portals.length + 1}`,
      title: `Dự án ${portals.length + 1}`,
      url: "",
      image: "",
      desc: "Hệ thống đang trong quá trình phát triển."
    });
  }

  grid.innerHTML = portals.map(p => {
    const hasImage = p.image && p.image.trim() !== '';
    const hasValidUrl = p.url && p.url.trim() !== '' && p.url.startsWith('http');
    const isActive = hasImage || hasValidUrl;

    if (isActive) {
      let previewContent = '';
      if (hasImage) {
        previewContent = `<img src="${p.image}" alt="${p.title}" class="preview-image" loading="lazy">`;
      } else {
        previewContent = `<iframe src="${p.url}" class="live-iframe" loading="lazy" sandbox="allow-scripts allow-same-origin allow-popups allow-forms"></iframe>`;
      }

      const linkTarget = hasValidUrl ? p.url : '#';

      return `
        <a href="${linkTarget}" target="_blank" rel="noopener noreferrer" class="project-card active-portal">
          <div class="card-glare-layer"></div>
          <div class="preview-box">
            ${previewContent}
          </div>
          <div class="project-info">
            <div class="project-text-group">
              <div class="project-title">${p.title}</div>
              <div class="project-desc">${p.desc || ''}</div>
            </div>
            <div class="card-arrow-indicator">↗</div>
          </div>
        </a>
      `;
    } else {
      return `
        <div class="project-card disabled">
          <div class="preview-box">
            <div class="dev-smoke-stage">
              <div class="dev-silver-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <span class="dev-pulse-text">ĐANG TRONG THỜI GIAN PHÁT TRIỂN</span>
            </div>
          </div>
          <div class="project-info">
            <div class="project-text-group">
              <div class="project-title">${p.title}</div>
              <div class="project-desc">${p.desc || 'Hệ thống đang trong quá trình phát triển.'}</div>
            </div>
          </div>
        </div>
      `;
    }
  }).join('');

  // Render 2-Column Portfolio About
  const about = data.about || DEFAULT_ABOUT;
  const links = data.links || DEFAULT_LINKS;

  const elAlias = document.getElementById('portfolio-alias');
  const elQuote = document.getElementById('portfolio-quote');
  const elBio = document.getElementById('portfolio-bio');
  const elLinksList = document.getElementById('official-links-list');

  if (elAlias) elAlias.textContent = `[ ${about.alias || 'THE ARCHITECT // ANONYMOUS CREATOR'} ]`;
  if (elQuote) elQuote.textContent = `"${about.quote || ''}"`;
  if (elBio) elBio.textContent = about.content || '';

  if (elLinksList) {
    elLinksList.innerHTML = links.map(lnk => `
      <a href="${lnk.url}" target="_blank" rel="noopener noreferrer" class="official-link-card">
        <div class="link-card-left">
          <div class="link-icon-wrap">${getIconSvg(lnk.icon)}</div>
          <div class="link-meta">
            <div class="link-name">${lnk.name}</div>
            <div class="link-tag">${lnk.tag}</div>
          </div>
        </div>
        <div class="link-arrow">↗</div>
      </a>
    `).join('');
  }

  // Segmented Indicator Init
  const btnPortals = document.getElementById('tab-btn-portals');
  const indicator = document.getElementById('segmented-indicator');
  if (btnPortals && indicator) {
    indicator.style.width = `${btnPortals.offsetWidth}px`;
  }

  setTimeout(() => {
    adjustIframeScaling();
    bindParallaxTilt();
  }, 60);
}

window.addEventListener('resize', () => {
  adjustIframeScaling();
  const btnPortals = document.getElementById('tab-btn-portals');
  const btnAbout = document.getElementById('tab-btn-about');
  const indicator = document.getElementById('segmented-indicator');
  if (btnPortals && indicator && btnPortals.classList.contains('active')) {
    indicator.style.width = `${btnPortals.offsetWidth}px`;
    indicator.style.transform = `translateX(0px)`;
  } else if (btnAbout && indicator && btnAbout.classList.contains('active')) {
    indicator.style.width = `${btnAbout.offsetWidth}px`;
    indicator.style.transform = `translateX(${btnPortals.offsetWidth}px)`;
  }
});

document.addEventListener('DOMContentLoaded', () => {
  initMouseSpotlight();
  renderGrid();
  initPreloader();
});

window.addEventListener('load', () => {
  renderGrid();
  setTimeout(adjustIframeScaling, 150);
});
