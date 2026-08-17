/**
 * Postlain Ecosystem - Central Data Store (Cyberpunk 3D Engine)
 * Manages Master Gate portals, Anonymous Architect manifesto, and Admin persistence.
 */

const STORAGE_KEY = 'postlain_ecosystem_cyber_v2';
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
    const localData = localStorage.getItem(STORAGE_KEY);
    if (localData) {
      try {
        this.data = JSON.parse(localData);
        this.isInitialized = true;
        return this.data;
      } catch (e) {
        console.warn('Local storage parse error, falling back to data/portals.json', e);
      }
    }

    // 2. Fetch from data/portals.json
    try {
      const res = await fetch('./data/portals.json');
      if (res.ok) {
        this.data = await res.json();
        this.saveToStorage();
        this.isInitialized = true;
        return this.data;
      }
    } catch (e) {
      console.warn('Fetch data/portals.json error, using built-in defaults', e);
    }

    // 3. Fallback defaults
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

  // --- MASTER GATE PORTALS ---
  getPortals() {
    return (this.data?.portals || []).sort((a, b) => (a.order || 999) - (b.order || 999));
  }

  getPortalById(id) {
    return this.data?.portals?.find(p => p.id === id) || null;
  }

  savePortal(portal) {
    if (!this.data) return false;
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

  // --- ABOUT SECTION (KẺ ẨN DANH) ---
  getAbout() {
    return this.data?.about || {
      title: "HỒ SƠ KẺ ẨN DANH // THE ARCHITECT",
      subtitle: "MỤC ĐÍCH KIẾN TẠO HỆ SINH THÁI",
      alias: "ANONYMOUS_ARCHITECT // 0xPOSTLAIN",
      quote: "Trong một thế giới đầy rẫy sự kiểm soát, chúng ta kiến tạo những không gian tự do.",
      content: "",
      specs: [
        { label: "CLEARANCE", value: "LEVEL 0 // ROOT" },
        { label: "STATUS", value: "ACTIVE" }
      ]
    };
  }

  saveAbout(aboutData) {
    if (!this.data) return false;
    this.data.about = { ...this.data.about, ...aboutData };
    this.saveToStorage();
    return true;
  }

  // --- CATEGORIES ---
  getCategories() {
    return this.data?.categories || [];
  }

  // --- SETTINGS ---
  getSettings() {
    return this.data?.settings || {
      siteName: "POSTLAIN",
      siteTitle: "POSTLAIN // MASTER SYSTEM GATEWAY",
      tagline: "HỆ THỐNG CỔNG KẾT NỐI TRUNG TÂM PHÂN TÁN"
    };
  }

  saveSettings(settings) {
    if (!this.data) return false;
    this.data.settings = { ...this.data.settings, ...settings };
    this.saveToStorage();
    return true;
  }

  // --- ADMIN AUTH & PIN ---
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

  // --- BACKUP & JSON ---
  exportJSON() {
    return JSON.stringify(this.data, null, 2);
  }

  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.portals || !Array.isArray(parsed.portals)) {
        throw new Error('Thiếu mảng portals');
      }
      this.data = parsed;
      this.saveToStorage();
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  async resetToDefaults() {
    try {
      const res = await fetch('./data/portals.json');
      if (res.ok) {
        this.data = await res.json();
      } else {
        this.data = this.getDefaultData();
      }
    } catch {
      this.data = this.getDefaultData();
    }
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
        siteTitle: "POSTLAIN // MASTER SYSTEM GATEWAY",
        tagline: "HỆ THỐNG CỔNG KẾT NỐI TRUNG TÂM PHÂN TÁN"
      },
      about: {
        title: "HỒ SƠ KẺ ẨN DANH // THE ARCHITECT",
        subtitle: "MỤC ĐÍCH KIẾN TẠO HỆ SINH THÁI",
        alias: "ANONYMOUS_ARCHITECT // 0xPOSTLAIN",
        quote: "Trong một thế giới đầy rẫy sự kiểm soát, chúng ta kiến tạo những không gian tự do.",
        content: "Tôi là một kẻ ẩn danh đứng sau những dòng mã và những tần số âm thanh của Postlain.\n\nHệ sinh thái này không được xây dựng vì danh vọng hay những con số thương mại. Mục đích duy nhất của tôi là thiết lập một mạng lưới độc lập – nơi bất kỳ ai cũng có thể sáng tạo âm nhạc chất lượng phòng thu, khai thác sức mạnh của trí tuệ nhân tạo, và kết nối với những người cùng tần số.\n\nHãy sử dụng những công cụ này để tạo nên những điều phi thường."
      },
      categories: [
        { id: "music", name: "ÂM NHẠC", icon: "disc-3", color: "#ff003c" },
        { id: "ai", name: "AI TECH", icon: "cpu", color: "#ff3366" },
        { id: "tools", name: "CÔNG CỤ", icon: "terminal", color: "#ffffff" }
      ],
      portals: [
        {
          id: "postlain-music",
          title: "POSTLAIN MUSIC",
          url: "https://music.postlain.com",
          tagline: "Nền tảng stream âm thanh Hi-Res Lossless chuẩn phòng thu.",
          description: "Trình phát nhạc cao cấp hỗ trợ FLAC 24-bit với bộ cân bằng 3D.",
          category: "music",
          icon: "disc-3",
          badge: "FLAGSHIP",
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
          category: "music",
          icon: "sliders",
          badge: "HOT",
          status: "ONLINE",
          order: 2,
          clicks: 980
        }
      ]
    };
  }
}

// Global Store Instance
window.portalStore = new PortalStore();
