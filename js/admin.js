/**
 * Postlain Ecosystem Admin - Management Dashboard Logic
 */

document.addEventListener('DOMContentLoaded', async () => {
  const store = window.portalStore;
  await store.ready();

  // DOM Elements - Auth
  const authOverlay = document.getElementById('auth-overlay');
  const pinInput = document.getElementById('admin-pin-input');
  const pinSubmitBtn = document.getElementById('admin-pin-submit');
  const pinErrorMsg = document.getElementById('pin-error-msg');
  const logoutBtn = document.getElementById('admin-logout-btn');
  const changePinBtn = document.getElementById('change-pin-btn');

  // DOM Elements - Navigation & Tabs
  const navItems = document.querySelectorAll('.admin-nav-item');
  const tabPanels = document.querySelectorAll('.tab-panel');
  const pageTitleEl = document.getElementById('admin-page-title');

  // DOM Elements - Stats
  const statTotalPortals = document.getElementById('stat-total-portals');
  const statLivePortals = document.getElementById('stat-live-portals');
  const statBetaPortals = document.getElementById('stat-beta-portals');
  const statTotalClicks = document.getElementById('stat-total-clicks');

  // DOM Elements - Portals Tab
  const portalsTableBody = document.getElementById('portals-table-body');
  const adminSearchInput = document.getElementById('admin-portal-search');
  const adminCategoryFilter = document.getElementById('admin-category-filter');
  const openAddPortalBtn = document.getElementById('open-add-portal-btn');

  // DOM Elements - Modals
  const portalModal = document.getElementById('portal-modal');
  const portalModalTitle = document.getElementById('portal-modal-title');
  const portalForm = document.getElementById('portal-form');
  const modalCloseBtns = document.querySelectorAll('.modal-close, .modal-cancel');
  
  // Portal Form Inputs
  const formPortalId = document.getElementById('form-portal-id');
  const formPortalTitle = document.getElementById('form-portal-title');
  const formPortalUrl = document.getElementById('form-portal-url');
  const formPortalCategory = document.getElementById('form-portal-category');
  const formPortalDesc = document.getElementById('form-portal-desc');
  const formPortalIcon = document.getElementById('form-portal-icon');
  const formPortalAccent = document.getElementById('form-portal-accent');
  const formPortalStatus = document.getElementById('form-portal-status');
  const formPortalBadge = document.getElementById('form-portal-badge');
  const formPortalFeatured = document.getElementById('form-portal-featured');

  // Category Tab Elements
  const categoriesList = document.getElementById('categories-list');
  const openAddCategoryBtn = document.getElementById('open-add-category-btn');
  const categoryModal = document.getElementById('category-modal');
  const categoryForm = document.getElementById('category-form');
  const formCatId = document.getElementById('form-cat-id');
  const formCatName = document.getElementById('form-cat-name');
  const formCatIcon = document.getElementById('form-cat-icon');
  const formCatColor = document.getElementById('form-cat-color');
  const formCatDesc = document.getElementById('form-cat-desc');

  // Settings Tab Elements
  const settingsForm = document.getElementById('settings-form');
  const settingSiteName = document.getElementById('setting-site-name');
  const settingSiteTitle = document.getElementById('setting-site-title');
  const settingTagline = document.getElementById('setting-tagline');
  const settingAnnounceEnable = document.getElementById('setting-announce-enable');
  const settingAnnounceBadge = document.getElementById('setting-announce-badge');
  const settingAnnounceText = document.getElementById('setting-announce-text');
  const settingAnnounceLink = document.getElementById('setting-announce-link');
  const settingSocialGithub = document.getElementById('setting-social-github');
  const settingSocialDiscord = document.getElementById('setting-social-discord');
  const settingSocialYoutube = document.getElementById('setting-social-youtube');
  const settingSocialTelegram = document.getElementById('setting-social-telegram');
  const settingSocialEmail = document.getElementById('setting-social-email');

  // Backup & JSON Tab Elements
  const jsonViewer = document.getElementById('json-viewer');
  const copyJsonBtn = document.getElementById('copy-json-btn');
  const downloadJsonBtn = document.getElementById('download-json-btn');
  const importFileInput = document.getElementById('import-file-input');
  const importTextarea = document.getElementById('import-json-textarea');
  const processImportBtn = document.getElementById('process-import-btn');
  const resetDefaultsBtn = document.getElementById('reset-defaults-btn');

  // Change PIN Modal
  const pinModal = document.getElementById('pin-modal');
  const formCurrentPin = document.getElementById('form-current-pin');
  const formNewPin = document.getElementById('form-new-pin');
  const formConfirmPin = document.getElementById('form-confirm-pin');
  const savePinBtn = document.getElementById('save-pin-btn');

  // --- AUTH CHECK ---
  checkAuth();

  function checkAuth() {
    if (store.isAdminLoggedIn()) {
      authOverlay.classList.add('hidden');
      loadAllAdminData();
    } else {
      authOverlay.classList.remove('hidden');
      pinInput.value = '';
      pinInput.focus();
    }
  }

  function handleLogin() {
    const pin = pinInput.value.trim();
    if (store.verifyPin(pin)) {
      authOverlay.classList.add('hidden');
      pinErrorMsg.style.display = 'none';
      loadAllAdminData();
      showToast('Đăng nhập thành công!', 'success');
    } else {
      pinErrorMsg.style.display = 'block';
      pinErrorMsg.textContent = 'Mã PIN không chính xác! (Mặc định: 1234)';
      pinInput.classList.add('shake');
      setTimeout(() => pinInput.classList.remove('shake'), 400);
      pinInput.value = '';
      pinInput.focus();
    }
  }

  pinSubmitBtn.addEventListener('click', handleLogin);
  pinInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleLogin();
  });

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      store.logoutAdmin();
      checkAuth();
      showToast('Đã đăng xuất khỏi trang quản trị');
    });
  }

  // --- TAB SWITCHING ---
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = item.getAttribute('data-tab');
      
      navItems.forEach(n => n.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));
      
      item.classList.add('active');
      const activePanel = document.getElementById(`tab-${targetTab}`);
      if (activePanel) activePanel.classList.add('active');

      const titleMap = {
        'portals': 'Quản Lý Cổng Kết Nối',
        'categories': 'Quản Lý Danh Mục',
        'settings': 'Cấu Hình Hệ Sinh Thái',
        'deploy': 'Xuất Dữ Liệu & Triển Khai Cloudflare'
      };
      pageTitleEl.textContent = titleMap[targetTab] || 'Quản Trị Hệ Thống';

      if (targetTab === 'deploy') {
        renderJsonViewer();
      }
      initIcons();
    });
  });

  // --- DATA LOADING & RENDERING ---
  function loadAllAdminData() {
    renderStats();
    renderCategoryOptions();
    renderPortalsTable();
    renderCategoriesList();
    loadSettingsForm();
    renderJsonViewer();
    initIcons();
  }

  function renderStats() {
    const portals = store.getPortals();
    const total = portals.length;
    const live = portals.filter(p => p.status === 'live' || !p.status).length;
    const beta = portals.filter(p => p.status === 'beta' || p.status === 'coming_soon').length;
    const clicks = portals.reduce((sum, p) => sum + (p.clicks || 0), 0);

    if (statTotalPortals) statTotalPortals.textContent = total;
    if (statLivePortals) statLivePortals.textContent = live;
    if (statBetaPortals) statBetaPortals.textContent = beta;
    if (statTotalClicks) statTotalClicks.textContent = formatClicks(clicks);
  }

  function renderCategoryOptions() {
    const categories = store.getCategories();
    
    // Admin filter select
    if (adminCategoryFilter) {
      adminCategoryFilter.innerHTML = '<option value="all">Tất cả danh mục</option>' +
        categories.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
    }

    // Modal select
    if (formPortalCategory) {
      formPortalCategory.innerHTML = categories.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
    }
  }

  function renderPortalsTable() {
    let portals = store.getPortals();
    const filterCat = adminCategoryFilter?.value || 'all';
    const query = adminSearchInput?.value?.toLowerCase().trim() || '';

    if (filterCat !== 'all') {
      portals = portals.filter(p => p.category === filterCat);
    }

    if (query) {
      portals = portals.filter(p => 
        p.title?.toLowerCase().includes(query) ||
        p.url?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.badge?.toLowerCase().includes(query)
      );
    }

    if (portals.length === 0) {
      portalsTableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">
            <i data-lucide="inbox" style="width: 36px; height: 36px; margin: 0 auto 8px; display: block;"></i>
            Không tìm thấy cổng kết nối nào phù hợp.
          </td>
        </tr>
      `;
      initIcons();
      return;
    }

    portalsTableBody.innerHTML = portals.map((portal, idx) => {
      const cat = store.getCategoryById(portal.category);
      const statusClass = portal.status || 'live';
      const statusLabel = getStatusLabel(portal.status);

      return `
        <tr data-id="${portal.id}">
          <td style="width: 50px; text-align: center; font-weight: 700; color: var(--text-muted);">
            ${idx + 1}
          </td>
          <td>
            <div class="table-portal-cell">
              <div class="table-icon-mini" style="background: linear-gradient(135deg, ${portal.accent || '#6366f1'}, #1e293b);">
                <i data-lucide="${portal.icon || 'globe'}" style="width: 18px; height: 18px;"></i>
              </div>
              <div>
                <div class="table-portal-title">
                  ${escapeHtml(portal.title)}
                  ${portal.featured ? '<span style="color: var(--accent-pink); font-size: 0.75rem; margin-left: 4px;">★ Nổi bật</span>' : ''}
                </div>
                <a href="${escapeHtml(portal.url)}" target="_blank" class="table-portal-url">${escapeHtml(portal.url)}</a>
              </div>
            </div>
          </td>
          <td>
            <span style="display: inline-flex; align-items: center; gap: 6px; font-size: 0.85rem; font-weight: 600; color: ${cat?.color || 'var(--text-secondary)'};">
              <i data-lucide="${cat?.icon || 'folder'}" style="width: 14px; height: 14px;"></i>
              ${escapeHtml(cat?.name || 'Chung')}
            </span>
          </td>
          <td>
            <span class="status-badge ${statusClass}">
              <span class="dot"></span>
              ${statusLabel}
            </span>
          </td>
          <td>
            <span style="font-family: var(--font-mono); font-size: 0.88rem; color: var(--text-secondary);">
              ${formatClicks(portal.clicks || 0)}
            </span>
          </td>
          <td>
            <div style="display: flex; gap: 4px;">
              <button class="action-icon-btn move-up-btn" data-id="${portal.id}" title="Chuyển lên" ${idx === 0 ? 'disabled style="opacity: 0.3;"' : ''}>
                <i data-lucide="chevron-up" style="width: 14px; height: 14px;"></i>
              </button>
              <button class="action-icon-btn move-down-btn" data-id="${portal.id}" title="Chuyển xuống" ${idx === portals.length - 1 ? 'disabled style="opacity: 0.3;"' : ''}>
                <i data-lucide="chevron-down" style="width: 14px; height: 14px;"></i>
              </button>
            </div>
          </td>
          <td>
            <div class="table-actions">
              <button class="action-icon-btn edit-portal-btn" data-id="${portal.id}" title="Chỉnh sửa">
                <i data-lucide="pencil" style="width: 15px; height: 15px;"></i>
              </button>
              <button class="action-icon-btn danger delete-portal-btn" data-id="${portal.id}" title="Xóa">
                <i data-lucide="trash-2" style="width: 15px; height: 15px;"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    attachPortalTableEvents();
    initIcons();
  }

  function attachPortalTableEvents() {
    // Edit
    portalsTableBody.querySelectorAll('.edit-portal-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openEditPortalModal(id);
      });
    });

    // Delete
    portalsTableBody.querySelectorAll('.delete-portal-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const portal = store.getPortalById(id);
        if (confirm(`Bạn có chắc muốn xóa cổng "${portal?.title || id}" không?`)) {
          store.deletePortal(id);
          renderPortalsTable();
          renderStats();
          renderJsonViewer();
          showToast(`Đã xóa cổng "${portal?.title || id}"`, 'success');
        }
      });
    });

    // Move Up
    portalsTableBody.querySelectorAll('.move-up-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        movePortalOrder(id, -1);
      });
    });

    // Move Down
    portalsTableBody.querySelectorAll('.move-down-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        movePortalOrder(id, 1);
      });
    });
  }

  function movePortalOrder(id, direction) {
    const portals = store.getPortals();
    const index = portals.findIndex(p => p.id === id);
    if (index < 0) return;

    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= portals.length) return;

    // Swap order
    const temp = portals[index].order || (index + 1);
    portals[index].order = portals[targetIndex].order || (targetIndex + 1);
    portals[targetIndex].order = temp;

    // If orders were equal, enforce unique
    if (portals[index].order === portals[targetIndex].order) {
      portals.forEach((p, idx) => p.order = idx + 1);
      // Re-swap
      const temp2 = portals[index].order;
      portals[index].order = portals[targetIndex].order;
      portals[targetIndex].order = temp2;
    }

    store.saveToStorage();
    renderPortalsTable();
    renderJsonViewer();
  }

  // --- PORTAL MODAL ACTIONS ---
  openAddPortalBtn.addEventListener('click', () => {
    portalModalTitle.textContent = 'Thêm Cổng Kết Nối Mới';
    portalForm.reset();
    formPortalId.value = '';
    formPortalAccent.value = '#6366f1';
    formPortalStatus.value = 'live';
    formPortalIcon.value = 'globe';
    formPortalFeatured.checked = false;
    highlightColorSwatch(formPortalAccent.value);
    openModal(portalModal);
  });

  function openEditPortalModal(id) {
    const portal = store.getPortalById(id);
    if (!portal) return;

    portalModalTitle.textContent = 'Chỉnh Sửa Cổng Kết Nối';
    formPortalId.value = portal.id;
    formPortalTitle.value = portal.title || '';
    formPortalUrl.value = portal.url || '';
    formPortalCategory.value = portal.category || '';
    formPortalDesc.value = portal.description || '';
    formPortalIcon.value = portal.icon || 'globe';
    formPortalAccent.value = portal.accent || '#6366f1';
    formPortalStatus.value = portal.status || 'live';
    formPortalBadge.value = portal.badge || '';
    formPortalFeatured.checked = !!portal.featured;

    highlightColorSwatch(formPortalAccent.value);
    openModal(portalModal);
  }

  portalForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = formPortalId.value.trim();
    const title = formPortalTitle.value.trim();
    const url = formPortalUrl.value.trim();
    const category = formPortalCategory.value;
    const description = formPortalDesc.value.trim();
    const icon = formPortalIcon.value.trim() || 'globe';
    const accent = formPortalAccent.value || '#6366f1';
    const status = formPortalStatus.value || 'live';
    const badge = formPortalBadge.value.trim();
    const featured = formPortalFeatured.checked;

    if (!title || !url) {
      alert('Vui lòng điền tên cổng và đường dẫn URL.');
      return;
    }

    const portalData = {
      id: id || undefined,
      title,
      url,
      category,
      description,
      icon,
      accent,
      status,
      badge,
      featured
    };

    store.savePortal(portalData);
    closeAllModals();
    renderPortalsTable();
    renderStats();
    renderJsonViewer();
    showToast(id ? 'Đã cập nhật cổng thành công!' : 'Đã thêm cổng mới!', 'success');
  });

  // Swatch selection helper
  document.querySelectorAll('#portal-color-swatches .color-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
      const color = swatch.getAttribute('data-color');
      formPortalAccent.value = color;
      highlightColorSwatch(color);
    });
  });

  function highlightColorSwatch(color) {
    document.querySelectorAll('#portal-color-swatches .color-swatch').forEach(s => {
      if (s.getAttribute('data-color').toLowerCase() === color.toLowerCase()) {
        s.classList.add('active');
      } else {
        s.classList.remove('active');
      }
    });
  }

  // --- CATEGORY ACTIONS ---
  function renderCategoriesList() {
    const categories = store.getCategories();
    const portals = store.getPortals();

    categoriesList.innerHTML = categories.map(cat => {
      const count = portals.filter(p => p.category === cat.id).length;
      return `
        <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 20px; display: flex; align-items: center; justify-content: space-between; gap: 16px;">
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="width: 44px; height: 44px; border-radius: var(--radius-md); background: ${cat.color || '#6366f1'}22; border: 1px solid ${cat.color || '#6366f1'}55; color: ${cat.color || '#6366f1'}; display: flex; align-items: center; justify-content: center;">
              <i data-lucide="${cat.icon || 'folder'}" style="width: 22px; height: 22px;"></i>
            </div>
            <div>
              <div style="font-weight: 700; font-size: 1.05rem; color: #fff; display: flex; align-items: center; gap: 8px;">
                ${escapeHtml(cat.name)}
                <span style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono); font-weight: normal;">(${cat.id})</span>
              </div>
              <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 2px;">
                ${escapeHtml(cat.description || 'Không có mô tả')} • <strong style="color: #fff;">${count}</strong> cổng
              </div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <button class="action-icon-btn edit-cat-btn" data-id="${cat.id}" title="Sửa danh mục">
              <i data-lucide="pencil" style="width: 15px; height: 15px;"></i>
            </button>
            <button class="action-icon-btn danger delete-cat-btn" data-id="${cat.id}" title="Xóa danh mục" ${count > 0 ? 'title="Đang có cổng sử dụng danh mục này"' : ''}>
              <i data-lucide="trash-2" style="width: 15px; height: 15px;"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach Cat Events
    categoriesList.querySelectorAll('.edit-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const cat = store.getCategoryById(id);
        if (!cat) return;
        formCatId.value = cat.id;
        formCatId.readOnly = true;
        formCatName.value = cat.name || '';
        formCatIcon.value = cat.icon || 'folder';
        formCatColor.value = cat.color || '#6366f1';
        formCatDesc.value = cat.description || '';
        openModal(categoryModal);
      });
    });

    categoriesList.querySelectorAll('.delete-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const cat = store.getCategoryById(id);
        const count = portals.filter(p => p.category === id).length;

        if (count > 0) {
          alert(`Không thể xóa danh mục "${cat?.name}" vì đang có ${count} cổng kết nối thuộc danh mục này.`);
          return;
        }

        if (confirm(`Bạn có chắc muốn xóa danh mục "${cat?.name}" không?`)) {
          store.deleteCategory(id);
          renderCategoriesList();
          renderCategoryOptions();
          renderJsonViewer();
          showToast(`Đã xóa danh mục "${cat?.name}"`, 'success');
        }
      });
    });

    initIcons();
  }

  openAddCategoryBtn.addEventListener('click', () => {
    categoryForm.reset();
    formCatId.value = '';
    formCatId.readOnly = false;
    formCatColor.value = '#06b6d4';
    formCatIcon.value = 'folder';
    openModal(categoryModal);
  });

  categoryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = formCatId.value.trim();
    const name = formCatName.value.trim();
    const icon = formCatIcon.value.trim() || 'folder';
    const color = formCatColor.value || '#6366f1';
    const description = formCatDesc.value.trim();

    if (!name) {
      alert('Vui lòng nhập tên danh mục');
      return;
    }

    store.saveCategory({ id: id || undefined, name, icon, color, description });
    closeAllModals();
    renderCategoriesList();
    renderCategoryOptions();
    renderPortalsTable();
    renderJsonViewer();
    showToast('Đã lưu danh mục thành công!', 'success');
  });

  // --- SETTINGS FORM ---
  function loadSettingsForm() {
    const settings = store.getSettings();
    settingSiteName.value = settings.siteName || 'Postlain';
    settingSiteTitle.value = settings.siteTitle || 'Postlain Ecosystem';
    settingTagline.value = settings.tagline || '';
    
    settingAnnounceEnable.checked = !!settings.announcement?.enabled;
    settingAnnounceBadge.value = settings.announcement?.badge || 'MỚI';
    settingAnnounceText.value = settings.announcement?.text || '';
    settingAnnounceLink.value = settings.announcement?.link || '';

    settingSocialGithub.value = settings.socials?.github || '';
    settingSocialDiscord.value = settings.socials?.discord || '';
    settingSocialYoutube.value = settings.socials?.youtube || '';
    settingSocialTelegram.value = settings.socials?.telegram || '';
    settingSocialEmail.value = settings.socials?.email || '';
  }

  settingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newSettings = {
      siteName: settingSiteName.value.trim(),
      siteTitle: settingSiteTitle.value.trim(),
      tagline: settingTagline.value.trim(),
      announcement: {
        enabled: settingAnnounceEnable.checked,
        badge: settingAnnounceBadge.value.trim(),
        text: settingAnnounceText.value.trim(),
        link: settingAnnounceLink.value.trim()
      },
      socials: {
        github: settingSocialGithub.value.trim(),
        discord: settingSocialDiscord.value.trim(),
        youtube: settingSocialYoutube.value.trim(),
        telegram: settingSocialTelegram.value.trim(),
        email: settingSocialEmail.value.trim()
      }
    };

    store.saveSettings(newSettings);
    renderJsonViewer();
    showToast('Đã lưu cài đặt hệ sinh thái thành công!', 'success');
  });

  // --- BACKUP & JSON DEPLOY ---
  function renderJsonViewer() {
    if (jsonViewer) {
      jsonViewer.textContent = store.exportJSON();
    }
  }

  copyJsonBtn.addEventListener('click', () => {
    const json = store.exportJSON();
    navigator.clipboard.writeText(json).then(() => {
      showToast('Đã sao chép toàn bộ cấu hình JSON vào clipboard!', 'success');
    }).catch(() => {
      showToast('Không thể sao chép tự động, vui lòng bôi đen và copy thủ công', 'error');
    });
  });

  downloadJsonBtn.addEventListener('click', () => {
    const json = store.exportJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portals.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Đã tải xuống file portals.json thành công!', 'success');
  });

  // Import JSON File
  importFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const res = store.importJSON(content);
      if (res.success) {
        loadAllAdminData();
        showToast('Nhập dữ liệu JSON từ file thành công!', 'success');
      } else {
        alert('Lỗi khi đọc file JSON: ' + res.error);
      }
    };
    reader.readAsText(file);
  });

  // Import JSON Text
  processImportBtn.addEventListener('click', () => {
    const text = importTextarea.value.trim();
    if (!text) {
      alert('Vui lòng dán đoạn mã JSON vào ô trước khi nhấn Áp dụng.');
      return;
    }

    const res = store.importJSON(text);
    if (res.success) {
      importTextarea.value = '';
      loadAllAdminData();
      showToast('Áp dụng dữ liệu JSON thành công!', 'success');
    } else {
      alert('Lỗi cấu trúc JSON: ' + res.error);
    }
  });

  // Reset to default
  resetDefaultsBtn.addEventListener('click', async () => {
    if (confirm('CẢNH BÁO: Hành động này sẽ khôi phục lại dữ liệu mẫu gốc ban đầu và ghi đè các thay đổi hiện tại. Bạn có chắc không?')) {
      await store.resetToDefaults();
      loadAllAdminData();
      showToast('Đã khôi phục dữ liệu gốc thành công!', 'success');
    }
  });

  // --- CHANGE PIN ---
  if (changePinBtn) {
    changePinBtn.addEventListener('click', () => {
      formCurrentPin.value = '';
      formNewPin.value = '';
      formConfirmPin.value = '';
      openModal(pinModal);
    });
  }

  if (savePinBtn) {
    savePinBtn.addEventListener('click', () => {
      const current = formCurrentPin.value.trim();
      const newPin = formNewPin.value.trim();
      const confirmPin = formConfirmPin.value.trim();

      if (!store.verifyPin(current)) {
        alert('Mã PIN hiện tại không đúng.');
        return;
      }

      if (newPin.length < 4) {
        alert('Mã PIN mới phải có ít nhất 4 ký tự.');
        return;
      }

      if (newPin !== confirmPin) {
        alert('Mã PIN xác nhận không trùng khớp.');
        return;
      }

      store.setAdminPin(newPin);
      closeAllModals();
      showToast('Đã thay đổi mã PIN Admin thành công!', 'success');
    });
  }

  // --- SEARCH / FILTER LISTENERS ---
  if (adminSearchInput) {
    adminSearchInput.addEventListener('input', renderPortalsTable);
  }
  if (adminCategoryFilter) {
    adminCategoryFilter.addEventListener('change', renderPortalsTable);
  }

  // --- MODAL HELPERS ---
  function openModal(modalEl) {
    modalEl.classList.add('active');
    initIcons();
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('active'));
  }

  modalCloseBtns.forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllModals();
  });

  // --- HELPERS ---
  function getStatusLabel(status) {
    switch (status) {
      case 'live': return 'Hoạt động';
      case 'beta': return 'Beta';
      case 'coming_soon': return 'Sắp ra mắt';
      case 'maintenance': return 'Bảo trì';
      default: return 'Online';
    }
  }

  function formatClicks(num) {
    if (!num) return '0';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
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
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function showToast(message, type = 'normal') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <i data-lucide="check-circle-2" style="width: 18px; height: 18px; color: var(--accent-emerald);"></i>
      <span>${escapeHtml(message)}</span>
    `;
    container.appendChild(toast);
    initIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }
});
