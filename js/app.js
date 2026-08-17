const STORAGE_KEY = 'postlain_data_v7';

const DEFAULT_PORTALS = [
  {
    id: "project-1",
    title: "Hidden Music",
    url: "https://hiddenmusic.postlain.com",
    image: "",
    desc: "Nền tảng âm nhạc độc lập dành riêng cho cộng đồng ngầm."
  },
  {
    id: "project-2",
    title: "Postlain Music",
    url: "https://music.postlain.com",
    image: "",
    desc: "Dịch vụ stream âm thanh Hi-Res Lossless 24-bit chất lượng cao."
  },
  {
    id: "project-3",
    title: "Studio DAW",
    url: "https://studio.postlain.com",
    image: "",
    desc: "Trạm thu âm & phối khí trực tuyến trên trình duyệt."
  },
  {
    id: "project-4",
    title: "AI Sound Lab",
    url: "https://ai.postlain.com",
    image: "",
    desc: "Công cụ tách Stem giọng hát và xử lý phổ âm thanh bằng AI."
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
  } else {
    btnAbout.classList.add('active');
    btnPortals.classList.remove('active');
    viewAbout.classList.add('active');
    viewPortals.classList.remove('active');
  }
}

function renderGrid() {
  const data = getData();
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  // Lấy đúng 4 items cho Grid 2x2
  const portals = data.portals.slice(0, 4);

  // Điền đủ 4 items nếu thiếu
  while (portals.length < 4) {
    portals.push({
      id: `project-${portals.length + 1}`,
      title: `Dự án ${portals.length + 1}`,
      url: "https://postlain.com",
      image: "",
      desc: "Dự án mới trong hệ sinh thái."
    });
  }

  grid.innerHTML = portals.map(p => {
    const hasImage = p.image && p.image.trim() !== '';

    if (hasImage) {
      return `
        <a href="${p.url}" target="_blank" rel="noopener noreferrer" class="browser-card active-link">
          <div class="browser-bar">
            <div class="browser-dots">
              <span class="dot red"></span>
              <span class="dot yellow"></span>
              <span class="dot green"></span>
            </div>
            <div class="browser-url">${p.url}</div>
          </div>
          <div class="browser-body">
            <img src="${p.image}" alt="${p.title}" class="preview-img" loading="lazy">
          </div>
          <div class="browser-info">
            <div class="project-title">${p.title}</div>
            <div class="project-desc">${p.desc || ''}</div>
          </div>
        </a>
      `;
    } else {
      return `
        <div class="browser-card disabled">
          <div class="browser-bar">
            <div class="browser-dots">
              <span class="dot red"></span>
              <span class="dot yellow"></span>
              <span class="dot green"></span>
            </div>
            <div class="browser-url">${p.url}</div>
          </div>
          <div class="browser-body">
            <div class="dev-placeholder">Đang trong thời gian phát triển</div>
          </div>
          <div class="browser-info">
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
}

document.addEventListener('DOMContentLoaded', renderGrid);
window.addEventListener('load', renderGrid);
