/**
 * POSTLAIN // Core Engine
 */

const STORAGE_KEY = 'postlain_data_v11';

const DEFAULT_PORTALS = [
  {
    id: "project-1",
    title: "HIDDEN MUSIC",
    url: "https://hiddenmusic.postlain.com",
    image: "",
    desc: "Âm Nhạc Ẩn"
  },
  {
    id: "project-2",
    title: "POSTLAIN MUSIC",
    url: "",
    image: "",
    desc: "Dịch vụ stream âm thanh Hi-Res Lossless chuẩn phòng thu."
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

function switchTab(tabName) {
  const btnPortals = document.getElementById('btn-tab-portals');
  const btnAbout = document.getElementById('btn-tab-about');
  const viewPortals = document.getElementById('view-portals');
  const viewAbout = document.getElementById('view-about');

  if (tabName === 'portals') {
    btnPortals.classList.add('active');
    btnAbout.classList.remove('active');
    viewPortals.classList.add('active');
    viewAbout.classList.remove('active');
    adjustIframeScaling();
  } else {
    btnAbout.classList.add('active');
    btnPortals.classList.remove('active');
    viewAbout.classList.add('active');
    viewPortals.classList.remove('active');
  }
}

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
          <div class="preview-box">
            ${previewContent}
          </div>
          <div class="project-info">
            <div class="project-title">${p.title}</div>
            <div class="project-desc">${p.desc || ''}</div>
          </div>
        </a>
      `;
    } else {
      return `
        <div class="project-card disabled">
          <div class="preview-box">
            <div class="dev-placeholder-bg">
              <span class="dev-pulse-text">Đang trong thời gian phát triển</span>
            </div>
          </div>
          <div class="project-info">
            <div class="project-title">${p.title}</div>
            <div class="project-desc">${p.desc || ''}</div>
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

  if (elTitle) elTitle.textContent = about.title || 'Giới Thiệu';
  if (elAlias) elAlias.textContent = `[ ${about.alias || 'ANONYMOUS'} ]`;
  if (elQuote) elQuote.textContent = `"${about.quote || ''}"`;
  if (elContent) elContent.textContent = about.content || '';

  setTimeout(adjustIframeScaling, 50);
}

// Preloader Dismissal
function dismissPreloader() {
  const preloader = document.getElementById('site-preloader');
  if (preloader && !preloader.classList.contains('fade-out')) {
    preloader.classList.add('fade-out');
  }
}

window.addEventListener('resize', adjustIframeScaling);
document.addEventListener('DOMContentLoaded', () => {
  renderGrid();
  // Safe timeout for preloader
  setTimeout(dismissPreloader, 800);
});

window.addEventListener('load', () => {
  renderGrid();
  setTimeout(adjustIframeScaling, 150);
  setTimeout(dismissPreloader, 400);
});
