/**
 * Postlain Central Data Store
 */

const STORAGE_KEY = 'postlain_portal_data_v3';
const AUTH_KEY = 'postlain_admin_session';
const PIN_KEY = 'postlain_admin_pin';
const DEFAULT_PIN = '1234';

class PortalStore {
  constructor() {
    this.data = null;
    this.isInitialized = false;
    this.initPromise = this.init();
  }

  async init() {
    // 1. Try to load from localStorage
    try {
      const localData = localStorage.getItem(STORAGE_KEY);
      if (localData) {
        const parsed = JSON.parse(localData);
        if (parsed && Array.isArray(parsed.portals) && parsed.portals.length > 0) {
          this.data = parsed;
          this.isInitialized = true;
          return this.data;
        }
      }
    } catch (e) {
      console.warn('localStorage parse error', e);
    }

    // 2. Fetch from /data/portals.json or ./data/portals.json
    try {
      let res = await fetch('/data/portals.json');
      if (!res.ok) res = await fetch('./data/portals.json');
      if (res.ok) {
        this.data = await res.json();
        this.saveToStorage();
        this.isInitialized = true;
        return this.data;
      }
    } catch (e) {
      console.warn('Fetch portals.json error, using built-in data', e);
    }

    // 3. Complete built-in fallback data
    this.data = this.getDefaultData();
    this.saveToStorage();
    this.isInitialized = true;
    return this.data;
  }

  async ready() {
    if (this.isInitialized && this.data) return this.data;
    return await this.initPromise;
  }

  saveToStorage() {
    if (this.data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      window.dispatchEvent(new CustomEvent('postlain-data-updated', { detail: this.data }));
    }
  }

  // --- PORTAL METHODS ---
  getPortals() {
    if (!this.data?.portals || this.data.portals.length === 0) {
      this.data = this.getDefaultData();
      this.saveToStorage();
    }
    return (this.data.portals || []).sort((a, b) => (a.order || 999) - (b.order || 999));
  }

  getPortalById(id) {
    return this.getPortals().find(p => p.id === id) || null;
  }

  savePortal(portal) {
    if (!this.data) this.data = this.getDefaultData();
    if (!this.data.portals) this.data.portals = [];

    const index = this.data.portals.findIndex(p => p.id === portal.id);
    if (index >= 0) {
      this.data.portals[index] = {
        ...this.data.portals[index],
        ...portal,
        updatedAt: new Date().toISOString()
      };
    } else {
      const newPortal = {
        ...portal,
        id: portal.id || this.generateSlug(portal.title),
        clicks: portal.clicks || 0,
        order: portal.order || (this.data.portals.length + 1),
        createdAt: new Date().toISOString()
      };
      this.data.portals.push(newPortal);
    }

    this.saveToStorage();
    return true;
  }

  deletePortal(id) {
    if (!this.data?.portals) return false;
    this.data.portals = this.data.portals.filter(p => p.id !== id);
    this.saveToStorage();
    return true;
  }

  incrementClick(id) {
    const portal = this.getPortalById(id);
    if (portal) {
      portal.clicks = (portal.clicks || 0) + 1;
      this.saveToStorage();
    }
  }

  // --- ABOUT METHODS ---
  getAbout() {
    return this.data?.about || {
      title: "HỒ SƠ KẺ ẨN DANH // THE ARCHITECT",
      subtitle: "MỤC ĐÍCH KIẾN TẠO HỆ SINH THÁI",
      alias: "ANONYMOUS_ARCHITECT",
      quote: "Trong một thế giới đầy rẫy sự kiểm soát, chúng ta kiến tạo những không gian tự do.",
      content: "Tôi là một kẻ ẩn danh đứng sau những dòng mã và những tần số âm thanh của Postlain.\n\nHệ sinh thái này được xây dựng như một mạng lưới độc lập để bất kỳ ai cũng có thể sáng tạo tự do."
    };
  }

  saveAbout(aboutData) {
    if (!this.data) this.data = this.getDefaultData();
    this.data.about = { ...this.data.about, ...aboutData };
    this.saveToStorage();
    return true;
  }

  // --- ADMIN PIN ---
  getStoredPin() {
    return localStorage.getItem(PIN_KEY) || DEFAULT_PIN;
  }

  setAdminPin(newPin) {
    if (!newPin || newPin.length < 4) return false;
    localStorage.setItem(PIN_KEY, newPin);
    return true;
  }

  verifyPin(inputPin) {
    const validPin = this.getStoredPin();
    if (inputPin === validPin) {
      sessionStorage.setItem(AUTH_KEY, 'true');
      return true;
    }
    return false;
  }

  isAdminLoggedIn() {
    return sessionStorage.getItem(AUTH_KEY) === 'true';
  }

  logoutAdmin() {
    sessionStorage.removeItem(AUTH_KEY);
  }

  // --- JSON EXPORT / IMPORT ---
  exportJSON() {
    return JSON.stringify(this.data || this.getDefaultData(), null, 2);
  }

  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.portals || !Array.isArray(parsed.portals)) {
        throw new Error('Dữ liệu JSON thiếu danh sách portals');
      }
      this.data = parsed;
      this.saveToStorage();
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  resetToDefaults() {
    this.data = this.getDefaultData();
    this.saveToStorage();
    return this.data;
  }

  generateSlug(text) {
    if (!text) return 'gate-' + Date.now();
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') || ('gate-' + Date.now());
  }

  getDefaultData() {
    return {
      settings: {
        siteName: "POSTLAIN",
        siteTitle: "POSTLAIN // MASTER SYSTEM GATEWAY"
      },
      about: {
        title: "HỒ SƠ KẺ ẨN DANH // THE ARCHITECT",
        subtitle: "MỤC ĐÍCH KIẾN TẠO HỆ SINH THÁI",
        alias: "ANONYMOUS_ARCHITECT",
        quote: "Trong một thế giới đầy rẫy sự kiểm soát, chúng ta kiến tạo những không gian tự do.",
        content: "Tôi là một kẻ ẩn danh đứng sau những dòng mã và những tần số âm thanh của Postlain.\n\nMục đích duy nhất của tôi khi tạo ra chuỗi website và công cụ này là thiết lập một mạng lưới độc lập – nơi bất kỳ ai cũng có thể sáng tạo âm nhạc chất lượng phòng thu, khai thác sức mạnh của trí tuệ nhân tạo, và kết nối với những người cùng tần số mà không bị ràng buộc bởi bất kỳ nền tảng độc quyền nào.\n\nMỗi cổng kết nối (Portal) là một vũ khí công nghệ được trau chuốt tỉ mỉ. Hãy sử dụng những công cụ này để tạo nên những điều phi thường."
      },
      portals: [
        {
          id: "postlain-music",
          title: "POSTLAIN MUSIC",
          url: "https://music.postlain.com",
          tagline: "Nền tảng stream âm thanh Hi-Res Lossless chuẩn phòng thu.",
          description: "Trình phát nhạc cao cấp hỗ trợ FLAC 24-bit với bộ cân bằng 3D.",
          icon: "disc-3",
          status: "ONLINE",
          order: 1,
          clicks: 1420
        },
        {
          id: "postlain-studio",
          title: "STUDIO DAW",
          url: "https://studio.postlain.com",
          tagline: "Phòng thu âm thanh & trạm phối khí kỹ thuật số trực tiếp trên trình duyệt.",
          description: "Sản xuất nhạc trực tuyến tích hợp Synth ảo và Sampler cơ khí.",
          icon: "sliders",
          status: "ONLINE",
          order: 2,
          clicks: 980
        },
        {
          id: "postlain-ai-lab",
          title: "AI SOUND LAB",
          url: "https://ai.postlain.com",
          tagline: "Trí tuệ nhân tạo tách Stem giọng hát, trích xuất beat và phân tích phổ tần số.",
          description: "Neural network xử lý tín hiệu âm thanh thế hệ mới.",
          icon: "sparkles",
          status: "ONLINE",
          order: 3,
          clicks: 2150
        },
        {
          id: "postlain-store",
          title: "SOUND VAULT",
          url: "https://store.postlain.com",
          tagline: "Kho sound kit, loop mẫu bản quyền và preset synthesizer chuyên sâu.",
          description: "Thư viện mẫu âm thanh chuẩn công nghiệp.",
          icon: "box",
          status: "ONLINE",
          order: 4,
          clicks: 640
        },
        {
          id: "postlain-community",
          title: "HUB COMMUNITY",
          url: "https://hub.postlain.com",
          tagline: "Mạng lưới kết nối kín giữa các nhà sáng tạo âm nhạc và lập trình viên.",
          description: "Diễn đàn chia sẻ project file và hợp tác sáng tạo.",
          icon: "users",
          status: "ONLINE",
          order: 5,
          clicks: 530
        },
        {
          id: "postlain-tools",
          title: "AUDIO SUITE",
          url: "https://tools.postlain.com",
          tagline: "Bộ công cụ chuyển đổi định dạng, cắt ghép và tối ưu metadata âm thanh.",
          description: "Tiện ích xử lý file âm thanh đa năng siêu tốc.",
          icon: "wand-2",
          status: "ONLINE",
          order: 6,
          clicks: 710
        },
        {
          id: "postlain-lyrics",
          title: "LYRIC SYNC",
          url: "https://lyrics.postlain.com",
          tagline: "Trình tạo lời bài hát đồng bộ thời gian thực (.lrc / .srt).",
          description: "Công cụ phân tách và gắn nhãn thời gian lời bài hát.",
          icon: "mic-2",
          status: "BETA",
          order: 7,
          clicks: 420
        },
        {
          id: "postlain-docs",
          title: "CORE API // SDK",
          url: "https://docs.postlain.com",
          tagline: "Tài liệu kỹ thuật và cổng API mở cho lập trình viên tích hợp.",
          description: "RESTful endpoints và SDK hỗ trợ mở rộng kết nối.",
          icon: "terminal",
          status: "ONLINE",
          order: 8,
          clicks: 310
        }
      ]
    };
  }
}

// Global Store
window.portalStore = new PortalStore();
