/**
 * POSTLAIN // Ultra-Modern Luxury Dark Engine
 */

const STORAGE_KEY = 'postlain_data_v12';

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

function getData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.portals) && parsed.portals.length > 0) {
        return parsed;
      }
    }
  } catch (e) {}
  const init = { portals: DEFAULT_PORTALS, about: DEFAULT_ABOUT };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(init));
  return init;
}

/* ==========================================================================
   FLOATING SEGMENTED CONTROL TAB SWITCHER
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
   DESKTOP LIVE IFRAME VIEWPORT AUTO SCALING (1280x720 PROPORTIONAL)
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
   3D PARALLAX TILT EFFECT & GLEAM OVERLAY
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

      const rotateX = ((y - centerY) / centerY) * -7;
      const rotateY = ((x - centerX) / centerX) * 7;

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
   GLOBAL MOUSE SPOTLIGHT (CON TRỎ SÁNG THEO CHUỘT)
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
   PRELOADER COUNTER (0% -> 100% WITH LUXURY SLIDE/FADE OUT)
   ========================================================================== */
function initPreloader() {
  const preloader = document.getElementById('site-preloader');
  const counterEl = document.getElementById('preloader-counter');
  const fillEl = document.getElementById('preloader-line-fill');
  if (!preloader || !counterEl || !fillEl) return;

  let current = 0;
  const target = 100;
  const startTime = performance.now();
  const duration = 1100; // 1.1s total counting duration

  function updateCounter(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out quart curve
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
      }, 180);
    }
  }

  requestAnimationFrame(updateCounter);
}

/* ==========================================================================
   RENDER 4 CARDS & ABOUT
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
      desc: "Đang trong thời gian phát triển."
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
          <div class="card-gleam-overlay"></div>
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
            <div class="dev-hologram-stage">
              <svg class="dev-holo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <span class="dev-pulse-text">Đang trong thời gian phát triển</span>
            </div>
          </div>
          <div class="project-info">
            <div class="project-text-group">
              <div class="project-title">${p.title}</div>
              <div class="project-desc">${p.desc || 'Hệ thống đang được xây dựng.'}</div>
            </div>
          </div>
        </div>
      `;
    }
  }).join('');

  // Render About
  const about = data.about || DEFAULT_ABOUT;
  const elTitle = document.getElementById('about-title');
  const elAlias = document.getElementById('about-alias');
  const elQuote = document.getElementById('about-quote');
  const elContent = document.getElementById('about-content');

  if (elTitle) elTitle.textContent = about.title || 'Giới Thiệu // The Architect';
  if (elAlias) elAlias.textContent = `[ ${about.alias || 'ANONYMOUS'} ]`;
  if (elQuote) elQuote.textContent = `"${about.quote || ''}"`;
  if (elContent) elContent.textContent = about.content || '';

  // Initial Segmented Indicator sizing
  const btnPortals = document.getElementById('tab-btn-portals');
  const indicator = document.getElementById('segmented-indicator');
  if (btnPortals && indicator) {
    indicator.style.width = `${btnPortals.offsetWidth}px`;
  }

  // Adjust Iframe and bind 3D tilt
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
