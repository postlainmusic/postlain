/**
 * Postlain Portal - Minimal App Engine
 */

const STORAGE_KEY = 'postlain_data_v6';

const DEFAULT_PORTALS = [
  {
    id: "hidden-music",
    title: "Hidden Music",
    url: "https://hiddenmusic.postlain.com",
    tagline: "Nền tảng phát nhạc độc lập dành riêng cho cộng đồng ngầm.",
    image: ""
  },
  {
    id: "postlain-music",
    title: "Postlain Music",
    url: "https://music.postlain.com",
    tagline: "Dịch vụ stream âm thanh Hi-Res Lossless 24-bit chất lượng cao.",
    image: ""
  },
  {
    id: "studio-daw",
    title: "Studio DAW",
    url: "https://studio.postlain.com",
    tagline: "Trạm thu âm & phối khí trực tuyến trên trình duyệt.",
    image: ""
  },
  {
    id: "ai-sound-lab",
    title: "AI Sound Lab",
    url: "https://ai.postlain.com",
    tagline: "Công cụ tách Stem giọng hát và xử lý phổ âm thanh bằng AI.",
    image: ""
  },
  {
    id: "sound-vault",
    title: "Sound Vault",
    url: "https://store.postlain.com",
    tagline: "Kho sample kit, preset synthesizer và thư viện âm thanh bản quyền.",
    image: ""
  },
  {
    id: "hub-community",
    title: "Hub Community",
    url: "https://hub.postlain.com",
    tagline: "Mạng lưới kết nối giữa các nhà sản xuất âm nhạc và lập trình viên.",
    image: ""
  },
  {
    id: "audio-suite",
    title: "Audio Suite",
    url: "https://tools.postlain.com",
    tagline: "Bộ công cụ cắt ghép, chuyển đổi định dạng và tối ưu metadata audio.",
    image: ""
  },
  {
    id: "lyric-sync",
    title: "Lyric Sync",
    url: "https://lyrics.postlain.com",
    tagline: "Trình đồng bộ lời bài hát (.lrc / .srt) thời gian thực.",
    image: ""
  }
];

const DEFAULT_ABOUT = {
  title: "Giới Thiệu // The Architect",
  alias: "ANONYMOUS_CREATOR",
  quote: "Trong một thế giới đầy rẫy sự kiểm soát, chúng ta kiến tạo những không gian tự do.",
  content: "Tôi là một kẻ ẩn danh đứng sau những dòng mã và những tần số âm thanh của Postlain.\n\nMục đích duy nhất của tôi khi tạo ra chuỗi website và công cụ này là thiết lập một mạng lưới độc lập – nơi bất kỳ ai cũng có thể sáng tạo âm nhạc chất lượng phòng thu, khai thác sức mạnh của trí tuệ nhân tạo, và kết nối với những người cùng tần số mà không bị ràng buộc bởi bất kỳ nền tảng độc quyền nào.\n\nMỗi cổng kết nối là một công cụ độc lập được trau chuốt tỉ mỉ. Hãy sử dụng những công cụ này để tạo nên những điều phi thường."
};

function getLocalData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.portals) && parsed.portals.length > 0) {
        return parsed;
      }
    }
  } catch (e) {}
  const initial = { portals: DEFAULT_PORTALS, about: DEFAULT_ABOUT };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

function setMainTab(tab) {
  const btnPortals = document.getElementById('nav-btn-portals');
  const btnAbout = document.getElementById('nav-btn-about');
  const secPortals = document.getElementById('view-portals');
  const secAbout = document.getElementById('view-about');

  if (tab === 'portals') {
    btnPortals.classList.add('active');
    btnAbout.classList.remove('active');
    secPortals.classList.add('active');
    secAbout.classList.remove('active');
  } else {
    btnAbout.classList.add('active');
    btnPortals.classList.remove('active');
    secAbout.classList.add('active');
    secPortals.classList.remove('active');
  }
}

function renderScreenContent(portal) {
  if (portal.image) {
    return `<img src="${portal.image}" alt="${portal.title}" class="window-snapshot" loading="lazy">`;
  }
  
  // Clean, realistic live viewport preview
  const domain = portal.url.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  return `
    <div class="mockup-ui-canvas">
      <div style="font-family: monospace; font-size: 0.82rem; color: #64748b; margin-bottom: 12px;">
        ${domain}
      </div>
      <div class="mockup-music-bars">
        <div class="mockup-bar"></div>
        <div class="mockup-bar"></div>
        <div class="mockup-bar"></div>
        <div class="mockup-bar"></div>
        <div class="mockup-bar"></div>
        <div class="mockup-bar"></div>
        <div class="mockup-bar"></div>
        <div class="mockup-bar"></div>
      </div>
      <div style="font-size: 0.75rem; color: #3b82f6; margin-top: 14px; font-weight: 600;">
        CLICK TO OPEN ↗
      </div>
    </div>
  `;
}

function renderGrid() {
  const data = getLocalData();
  const container = document.getElementById('windows-grid');
  if (!container) return;

  container.innerHTML = data.portals.map(p => `
    <a href="${p.url}" target="_blank" rel="noopener noreferrer" class="browser-window">
      <!-- Title Bar -->
      <div class="window-titlebar">
        <div class="window-controls">
          <span class="dot close"></span>
          <span class="dot min"></span>
          <span class="dot max"></span>
        </div>
        <div class="window-address-bar">
          <span class="lock-icon">🔒</span>
          <span>${p.url}</span>
        </div>
        <span class="open-external-btn">↗</span>
      </div>

      <!-- Viewport Screen -->
      <div class="window-viewport">
        ${renderScreenContent(p)}
        
        <!-- Bottom Info Bar -->
        <div class="window-footer-bar">
          <div class="window-site-name">${p.title}</div>
          <div class="window-tagline">${p.tagline || ''}</div>
        </div>
      </div>
    </a>
  `).join('');

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
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', renderGrid);
window.addEventListener('load', renderGrid);
