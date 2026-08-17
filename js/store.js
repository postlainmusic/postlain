/**
 * Postlain Ecosystem - Central Data Store
 * Handles persistence, CRUD operations, configuration export/import, and auth.
 */

const STORAGE_KEY = 'postlain_ecosystem_data_v1';
const AUTH_KEY = 'postlain_admin_session';
const PIN_KEY = 'postlain_admin_pin';
const FAVORITES_KEY = 'postlain_favorites';
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
        console.warn('Failed to parse local storage data, fallback to json fetch', e);
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
      console.warn('Failed to fetch data/portals.json, using built-in defaults', e);
    }

    // 3. Built-in hardcoded fallback
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
    return (this.data?.portals || []).sort((a, b) => (a.order || 999) - (b.order || 999));
  }

  getPortalById(id) {
    return this.data?.portals?.find(p => p.id === id) || null;
  }

  savePortal(portal) {
    if (!this.data) return false;
    if (!this.data.portals) this.data.portals = [];

    // Check if updating existing or adding new
    const index = this.data.portals.findIndex(p => p.id === portal.id);
    if (index >= 0) {
      this.data.portals[index] = {
        ...this.data.portals[index],
        ...portal,
        updatedAt: new Date().toISOString()
      };
    } else {
      // New Portal
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

  // --- CATEGORY METHODS ---
  getCategories() {
    return this.data?.categories || [];
  }

  getCategoryById(id) {
    return this.data?.categories?.find(c => c.id === id) || null;
  }

  saveCategory(category) {
    if (!this.data) return false;
    if (!this.data.categories) this.data.categories = [];

    const index = this.data.categories.findIndex(c => c.id === category.id);
    if (index >= 0) {
      this.data.categories[index] = { ...this.data.categories[index], ...category };
    } else {
      const newCat = {
        ...category,
        id: category.id || this.generateSlug(category.name)
      };
      this.data.categories.push(newCat);
    }

    this.saveToStorage();
    return true;
  }

  deleteCategory(id) {
    if (!this.data?.categories) return false;
    this.data.categories = this.data.categories.filter(c => c.id !== id);
    this.saveToStorage();
    return true;
  }

  // --- SETTINGS METHODS ---
  getSettings() {
    return this.data?.settings || {
      siteTitle: "Postlain Ecosystem",
      siteName: "Postlain",
      tagline: "Cổng kết nối toàn diện đến các dịch vụ trong hệ sinh thái Postlain",
      announcement: { enabled: true, badge: "MỚI", text: "Chào mừng bạn đến với Postlain Hub!", link: "#portals" },
      socials: {},
      theme: { accentColor: "#6366f1", glowColor: "#a855f7" }
    };
  }

  saveSettings(settings) {
    if (!this.data) return false;
    this.data.settings = { ...this.data.settings, ...settings };
    this.saveToStorage();
    return true;
  }

  // --- FAVORITES ---
  getFavorites() {
    try {
      const favs = localStorage.getItem(FAVORITES_KEY);
      return favs ? JSON.parse(favs) : [];
    } catch {
      return [];
    }
  }

  toggleFavorite(id) {
    const favs = this.getFavorites();
    let updated;
    if (favs.includes(id)) {
      updated = favs.filter(item => item !== id);
    } else {
      updated = [...favs, id];
    }
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('postlain-favorites-updated', { detail: updated }));
    return updated.includes(id);
  }

  isFavorite(id) {
    return this.getFavorites().includes(id);
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

  // --- BACKUP & JSON EXPORT/IMPORT ---
  exportJSON() {
    return JSON.stringify(this.data, null, 2);
  }

  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.portals || !Array.isArray(parsed.portals)) {
        throw new Error('Dữ liệu JSON không đúng định dạng: thiếu mảng portals');
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
    if (!text) return 'item-' + Date.now();
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') || ('item-' + Date.now());
  }

  getDefaultData() {
    return {
      settings: {
        siteTitle: "Postlain Ecosystem",
        siteName: "Postlain",
        tagline: "Cổng kết nối toàn diện đến các dịch vụ trong hệ sinh thái Postlain",
        announcement: {
          enabled: true,
          badge: "MỚI",
          text: "Chào mừng bạn đến với Postlain Hub! Tất cả các dịch vụ vệ tinh đã sẵn sàng kết nối.",
          link: "#portals"
        },
        socials: {
          github: "https://github.com/postlainmusic",
          youtube: "https://youtube.com",
          discord: "https://discord.gg",
          telegram: "https://t.me",
          email: "contact@postlain.com"
        },
        theme: {
          accentColor: "#6366f1",
          glowColor: "#a855f7"
        }
      },
      categories: [
        { id: "music", name: "Âm Nhạc & Sáng Tạo", icon: "music", color: "#ec4899" },
        { id: "tools", name: "Công Cụ & Ứng Dụng", icon: "cpu", color: "#06b6d4" },
        { id: "ai", name: "AI & Công Nghệ Mới", icon: "sparkles", color: "#8b5cf6" },
        { id: "community", name: "Cộng Đồng & Diễn Đàn", icon: "users", color: "#10b981" },
        { id: "store", name: "Cửa Hàng & Dịch Vụ", icon: "shopping-bag", color: "#f59e0b" },
        { id: "docs", name: "Tài Liệu & API", icon: "book-open", color: "#64748b" }
      ],
      portals: [
        {
          id: "postlain-music",
          title: "Postlain Music Player",
          url: "https://music.postlain.com",
          category: "music",
          description: "Nền tảng stream nhạc chất lượng cao với giao diện hiện đại.",
          icon: "disc-3",
          badge: "Phổ biến",
          status: "live",
          featured: true,
          accent: "#ec4899",
          order: 1,
          clicks: 1420
        },
        {
          id: "postlain-studio",
          title: "Postlain Studio DAW",
          url: "https://studio.postlain.com",
          category: "music",
          description: "Trình tạo nhạc và phối âm trực tiếp trên trình duyệt.",
          icon: "sliders",
          badge: "Hot",
          status: "live",
          featured: true,
          accent: "#f43f5e",
          order: 2,
          clicks: 980
        },
        {
          id: "postlain-ai-lab",
          title: "Postlain AI Sound Lab",
          url: "https://ai.postlain.com",
          category: "ai",
          description: "Bộ công cụ AI tách giọng (Stem Separation) và phân tích hòa âm.",
          icon: "sparkles",
          badge: "AI 2.0",
          status: "live",
          featured: true,
          accent: "#8b5cf6",
          order: 3,
          clicks: 2150
        }
      ]
    };
  }
}

// Global Store Instance
window.portalStore = new PortalStore();
