/**
 * Postlain Cyberpunk 3D Admin Dashboard - Logic
 * Handles Master Gate CRUD, About Manifesto Editor, and JSON Sync.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const store = window.portalStore;
  await store.ready();

  // Auth Elements
  const authOverlay = document.getElementById('auth-overlay');
  const pinInput = document.getElementById('admin-pin-input');
  const pinSubmitBtn = document.getElementById('admin-pin-submit');
  const pinErrorMsg = document.getElementById('pin-error-msg');
  const logoutBtn = document.getElementById('admin-logout-btn');
  const changePinBtn = document.getElementById('change-pin-btn');

  // Navigation & Tabs
  const navItems = document.querySelectorAll('.admin-nav-item');
  const tabPanels = document.querySelectorAll('.tab-panel');
  const pageTitleEl = document.getElementById('admin-page-title');

  // Tab 1: Portals Elements
  const portalsTableBody = document.getElementById('portals-table-body');
  const openAddPortalBtn = document.getElementById('open-add-portal-btn');
  const portalModal = document.getElementById('portal-modal');
  const portalModalTitle = document.getElementById('portal-modal-title');
  const portalForm = document.getElementById('portal-form');
  const modalCloseBtns = document.querySelectorAll('.modal-close, .modal-cancel');

  // Portal Inputs
  const formPortalId = document.getElementById('form-portal-id');
  const formPortalTitle = document.getElementById('form-portal-title');
  const formPortalUrl = document.getElementById('form-portal-url');
  const formPortalTagline = document.getElementById('form-portal-tagline');
  const formPortalDesc = document.getElementById('form-portal-desc');
  const formPortalIcon = document.getElementById('form-portal-icon');
  const formPortalStatus = document.getElementById('form-portal-status');
  const formPortalCategory = document.getElementById('form-portal-category');

  // Tab 2: About Editor Elements
  const aboutForm = document.getElementById('about-form');
  const formAboutTitle = document.getElementById('form-about-title');
  const formAboutSubtitle = document.getElementById('form-about-subtitle');
  const formAboutAlias = document.getElementById('form-about-alias');
  const formAboutQuote = document.getElementById('form-about-quote');
  const formAboutContent = document.getElementById('form-about-content');

  // Tab 3: Backup & Deploy Elements
  const jsonViewer = document.getElementById('json-viewer');
  const copyJsonBtn = document.getElementById('copy-json-btn');
  const downloadJsonBtn = document.getElementById('download-json-btn');
  const importFileInput = document.getElementById('import-file-input');
  const importTextarea = document.getElementById('import-json-textarea');
  const processImportBtn = document.getElementById('process-import-btn');
  const resetDefaultsBtn = document.getElementById('reset-defaults-btn');

  // PIN Modal
  const pinModal = document.getElementById('pin-modal');
  const formCurrentPin = document.getElementById('form-current-pin');
  const formNewPin = document.getElementById('form-new-pin');
  const formConfirmPin = document.getElementById('form-confirm-pin');
  const savePinBtn = document.getElementById('save-pin-btn');

  // --- AUTH ---
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
      showToast('ĐĂNG NHẬP ADMIN THÀNH CÔNG // ROOT_ACCESS', 'success');
    } else {
      pinErrorMsg.style.display = 'block';
      pinErrorMsg.textContent = 'Mã PIN sai! (Mặc định: 1234)';
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
      showToast('ĐÃ ĐĂNG XUẤT HỆ THỐNG');
    });
  }

  // --- TAB NAVIGATION ---
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = item.getAttribute('data-tab');

      navItems.forEach(n => n.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));

      item.classList.add('active');
      const panel = document.getElementById(`tab-${targetTab}`);
      if (panel) panel.classList.add('active');

      const titleMap = {
        'portals': 'QUẢN LÝ MASTER GATE (CỔNG KẾT NỐI)',
        'about': 'SOẠN THẢO HỒ SƠ KẺ ẨN DANH (ABOUT)',
        'deploy': 'XUẤT DỮ LIỆU & CLOUDFLARE DEPLOY'
      };
      pageTitleEl.textContent = titleMap[targetTab] || 'ADMIN PANEL';

      if (targetTab === 'deploy') renderJsonViewer();
      initIcons();
    });
  });

  // --- LOAD DATA ---
  function loadAllAdminData() {
    renderPortalsTable();
    loadAboutForm();
    renderCategorySelect();
    renderJsonViewer();
    initIcons();
  }

  function renderCategorySelect() {
    const categories = store.getCategories();
    if (formPortalCategory) {
      formPortalCategory.innerHTML = categories.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
    }
  }

  // --- TAB 1: MASTER GATE CRUD ---
  function renderPortalsTable() {
    const portals = store.getPortals();

    if (portals.length === 0) {
      portalsTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 30px; color: var(--text-steel);">
            Chưa có cổng kết nối nào.
          </td>
        </tr>
      `;
      initIcons();
      return;
    }

    portalsTableBody.innerHTML = portals.map((portal, idx) => {
      const indexStr = (idx + 1).toString().padStart(2, '0');
      return `
        <tr data-id="${portal.id}">
          <td style="font-family: var(--font-mono); color: var(--red-neon); font-weight: 700; width: 60px;">
            ${indexStr}
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 12px;">
              <div class="table-icon-mini">
                <i data-lucide="${portal.icon || 'globe'}" style="width: 20px; height: 20px;"></i>
              </div>
              <div>
                <div style="font-weight: 800; font-family: var(--font-display); color: #fff;">
                  ${escapeHtml(portal.title)}
                </div>
                <div style="font-size: 0.8rem; color: var(--text-steel); font-family: var(--font-mono);">
                  ${escapeHtml(portal.url)}
                </div>
              </div>
            </div>
          </td>
          <td style="max-width: 320px; font-size: 0.85rem; color: #cbd5e1;">
            <strong style="color: var(--red-neon);">//</strong> ${escapeHtml(portal.tagline || portal.description || '')}
          </td>
          <td>
            <span style="font-family: var(--font-mono); font-size: 0.78rem; padding: 2px 8px; border: 1px solid var(--red-border); color: #fff; background: rgba(255,0,60,0.1);">
              ${escapeHtml(portal.status || 'ONLINE')}
            </span>
          </td>
          <td style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--text-steel);">
            ${portal.clicks || 0}
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 6px;">
              <button class="btn btn-secondary btn-sm edit-portal-btn" data-id="${portal.id}" title="Chỉnh sửa">
                <i data-lucide="pencil" style="width: 14px; height: 14px;"></i>
              </button>
              <button class="btn btn-danger btn-sm delete-portal-btn" data-id="${portal.id}" title="Xóa">
                <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
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
    portalsTableBody.querySelectorAll('.edit-portal-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openEditPortalModal(id);
      });
    });

    portalsTableBody.querySelectorAll('.delete-portal-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const portal = store.getPortalById(id);
        if (confirm(`Bạn có chắc muốn xóa cổng "${portal?.title || id}"?`)) {
          store.deletePortal(id);
          renderPortalsTable();
          renderJsonViewer();
          showToast(`ĐÃ XÓA CỔNG [ ${portal?.title || id} ]`, 'success');
        }
      });
    });
  }

  openAddPortalBtn.addEventListener('click', () => {
    portalModalTitle.textContent = 'THÊM CỔNG KẾT NỐI MỚI (NEW NODE)';
    portalForm.reset();
    formPortalId.value = '';
    formPortalIcon.value = 'globe';
    formPortalStatus.value = 'ONLINE';
    openModal(portalModal);
  });

  function openEditPortalModal(id) {
    const portal = store.getPortalById(id);
    if (!portal) return;

    portalModalTitle.textContent = 'CHỈNH SỬA CỔNG KẾT NỐI (EDIT NODE)';
    formPortalId.value = portal.id;
    formPortalTitle.value = portal.title || '';
    formPortalUrl.value = portal.url || '';
    formPortalTagline.value = portal.tagline || '';
    formPortalDesc.value = portal.description || '';
    formPortalIcon.value = portal.icon || 'globe';
    formPortalStatus.value = portal.status || 'ONLINE';
    formPortalCategory.value = portal.category || 'music';

    openModal(portalModal);
  }

  portalForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = formPortalId.value.trim();
    const title = formPortalTitle.value.trim();
    const url = formPortalUrl.value.trim();
    const tagline = formPortalTagline.value.trim();
    const description = formPortalDesc.value.trim();
    const icon = formPortalIcon.value.trim() || 'globe';
    const status = formPortalStatus.value;
    const category = formPortalCategory.value;

    if (!title || !url) {
      alert('Vui lòng nhập tên website và URL.');
      return;
    }

    const portalData = {
      id: id || undefined,
      title,
      url,
      tagline,
      description,
      icon,
      status,
      category
    };

    store.savePortal(portalData);
    closeAllModals();
    renderPortalsTable();
    renderJsonViewer();
    showToast(id ? 'ĐÃ CẬP NHẬT CỔNG THÀNH CÔNG' : 'ĐÃ TẠO CỔNG MỚI THÀNH CÔNG', 'success');
  });

  // --- TAB 2: ABOUT MANIFESTO EDITOR ---
  function loadAboutForm() {
    const about = store.getAbout();
    formAboutTitle.value = about.title || '';
    formAboutSubtitle.value = about.subtitle || '';
    formAboutAlias.value = about.alias || '';
    formAboutQuote.value = about.quote || '';
    formAboutContent.value = about.content || '';
  }

  aboutForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newAbout = {
      title: formAboutTitle.value.trim(),
      subtitle: formAboutSubtitle.value.trim(),
      alias: formAboutAlias.value.trim(),
      quote: formAboutQuote.value.trim(),
      content: formAboutContent.value.trim()
    };

    store.saveAbout(newAbout);
    renderJsonViewer();
    showToast('ĐÃ LƯU TUYÊN NGÔN KẺ ẨN DANH THÀNH CÔNG // ABOUT_UPDATED', 'success');
  });

  // --- TAB 3: BACKUP & JSON ---
  function renderJsonViewer() {
    if (jsonViewer) {
      jsonViewer.textContent = store.exportJSON();
    }
  }

  copyJsonBtn.addEventListener('click', () => {
    const json = store.exportJSON();
    navigator.clipboard.writeText(json).then(() => {
      showToast('ĐÃ SAO CHÉP MÃ NGUỒN JSON VÀO CLIPBOARD', 'success');
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
    showToast('ĐÃ TẢI XUỐNG FILE portals.json', 'success');
  });

  importFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const res = store.importJSON(event.target.result);
      if (res.success) {
        loadAllAdminData();
        showToast('NHẬP DỮ LIỆU JSON THÀNH CÔNG', 'success');
      } else {
        alert('Lỗi file JSON: ' + res.error);
      }
    };
    reader.readAsText(file);
  });

  processImportBtn.addEventListener('click', () => {
    const text = importTextarea.value.trim();
    if (!text) {
      alert('Vui lòng dán JSON trước khi bấm Áp dụng.');
      return;
    }
    const res = store.importJSON(text);
    if (res.success) {
      importTextarea.value = '';
      loadAllAdminData();
      showToast('ĐÃ ÁP DỤNG JSON THÀNH CÔNG', 'success');
    } else {
      alert('Lỗi cấu trúc JSON: ' + res.error);
    }
  });

  resetDefaultsBtn.addEventListener('click', async () => {
    if (confirm('CẢNH BÁO: Khôi phục lại toàn bộ dữ liệu mẫu mặc định?')) {
      await store.resetToDefaults();
      loadAllAdminData();
      showToast('ĐÃ KHÔI PHỤC DỮ LIỆU MẪU GỐC', 'success');
    }
  });

  // --- PIN CHANGE ---
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
        alert('Mã PIN mới phải từ 4 ký tự trở lên.');
        return;
      }
      if (newPin !== confirmPin) {
        alert('Mã PIN xác nhận không khớp.');
        return;
      }

      store.setAdminPin(newPin);
      closeAllModals();
      showToast('ĐÃ ĐỔI MÃ PIN ADMIN THÀNH CÔNG', 'success');
    });
  }

  // --- MODAL UTILS ---
  function openModal(modalEl) {
    modalEl.classList.add('active');
    initIcons();
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('active'));
  }

  modalCloseBtns.forEach(btn => btn.addEventListener('click', closeAllModals));
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllModals();
  });

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
      <i data-lucide="terminal" style="width: 16px; height: 16px; color: var(--red-neon);"></i>
      <span>${escapeHtml(message)}</span>
    `;
    container.appendChild(toast);
    initIcons();
    setTimeout(() => toast.remove(), 2600);
  }
});
