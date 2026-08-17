/**
 * Postlain Minimal Admin Logic
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

  // Navigation
  const navItems = document.querySelectorAll('.admin-nav-item');
  const tabPanels = document.querySelectorAll('.tab-panel');
  const pageTitleEl = document.getElementById('admin-page-title');

  // Tab 1: Portals
  const portalsTableBody = document.getElementById('portals-table-body');
  const openAddPortalBtn = document.getElementById('open-add-portal-btn');
  const portalModal = document.getElementById('portal-modal');
  const portalModalTitle = document.getElementById('portal-modal-title');
  const portalForm = document.getElementById('portal-form');
  const formPortalId = document.getElementById('form-portal-id');
  const formPortalTitle = document.getElementById('form-portal-title');
  const formPortalUrl = document.getElementById('form-portal-url');
  const formPortalTagline = document.getElementById('form-portal-tagline');
  const formPortalIcon = document.getElementById('form-portal-icon');
  const formPortalStatus = document.getElementById('form-portal-status');

  // Tab 2: About
  const aboutForm = document.getElementById('about-form');
  const formAboutTitle = document.getElementById('form-about-title');
  const formAboutAlias = document.getElementById('form-about-alias');
  const formAboutQuote = document.getElementById('form-about-quote');
  const formAboutContent = document.getElementById('form-about-content');

  // Tab 3: Deploy
  const jsonViewer = document.getElementById('json-viewer');
  const copyJsonBtn = document.getElementById('copy-json-btn');
  const downloadJsonBtn = document.getElementById('download-json-btn');
  const importFileInput = document.getElementById('import-file-input');

  // PIN Modal
  const pinModal = document.getElementById('pin-modal');
  const formCurrentPin = document.getElementById('form-current-pin');
  const formNewPin = document.getElementById('form-new-pin');
  const formConfirmPin = document.getElementById('form-confirm-pin');
  const savePinBtn = document.getElementById('save-pin-btn');

  // Modal Closers
  document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });

  // --- AUTH ---
  checkAuth();

  function checkAuth() {
    if (store.isAdminLoggedIn()) {
      if (authOverlay) authOverlay.classList.add('hidden');
      loadAllAdminData();
    } else {
      if (authOverlay) authOverlay.classList.remove('hidden');
      if (pinInput) {
        pinInput.value = '';
        pinInput.focus();
      }
    }
  }

  function handleLogin() {
    const pin = pinInput.value.trim();
    if (store.verifyPin(pin)) {
      if (authOverlay) authOverlay.classList.add('hidden');
      if (pinErrorMsg) pinErrorMsg.style.display = 'none';
      loadAllAdminData();
      showToast('Đăng nhập Admin thành công!');
    } else {
      if (pinErrorMsg) pinErrorMsg.style.display = 'block';
      if (pinInput) {
        pinInput.value = '';
        pinInput.focus();
      }
    }
  }

  if (pinSubmitBtn) pinSubmitBtn.addEventListener('click', handleLogin);
  if (pinInput) {
    pinInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleLogin();
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      store.logoutAdmin();
      checkAuth();
      showToast('Đã đăng xuất');
    });
  }

  // --- TABS ---
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
        'portals': 'Quản Lý Master Gate',
        'about': 'Soạn Thảo Hồ Sơ About',
        'deploy': 'Xuất & Tải JSON'
      };
      if (pageTitleEl) pageTitleEl.textContent = titleMap[targetTab] || 'Admin';

      if (targetTab === 'deploy') renderJsonViewer();
      initIcons();
    });
  });

  // --- LOAD ALL DATA ---
  function loadAllAdminData() {
    renderPortalsTable();
    loadAboutForm();
    renderJsonViewer();
    initIcons();
  }

  // --- TAB 1: PORTALS TABLE ---
  function renderPortalsTable() {
    const portals = store.getPortals();

    if (!portalsTableBody) return;

    if (portals.length === 0) {
      portalsTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 24px; color: #94a3b8;">
            Chưa có cổng kết nối nào. Hãy bấm "Thêm Cổng Mới".
          </td>
        </tr>
      `;
      return;
    }

    portalsTableBody.innerHTML = portals.map((portal, idx) => `
      <tr data-id="${portal.id}">
        <td style="font-weight: 700; color: #fb7185;">${idx + 1}</td>
        <td>
          <div style="font-weight: 700; color: #fff;">${escapeHtml(portal.title)}</div>
          <div style="font-size: 0.78rem; color: #94a3b8;">${escapeHtml(portal.url)}</div>
        </td>
        <td style="color: #cbd5e1; max-width: 320px;">${escapeHtml(portal.tagline || portal.description || '')}</td>
        <td>
          <span style="font-size: 0.75rem; padding: 2px 7px; border: 1px solid #2d3247; border-radius: 4px; color: #fff;">
            ${escapeHtml(portal.status || 'ONLINE')}
          </span>
        </td>
        <td style="color: #94a3b8;">${portal.clicks || 0}</td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button class="btn btn-secondary btn-sm edit-btn" data-id="${portal.id}">Sửa</button>
            <button class="btn btn-danger btn-sm del-btn" data-id="${portal.id}">Xóa</button>
          </div>
        </td>
      </tr>
    `).join('');

    // Attach Edit / Delete
    portalsTableBody.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openEditPortalModal(id);
      });
    });

    portalsTableBody.querySelectorAll('.del-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const portal = store.getPortalById(id);
        if (confirm(`Bạn có chắc muốn xóa cổng "${portal?.title || id}"?`)) {
          store.deletePortal(id);
          renderPortalsTable();
          renderJsonViewer();
          showToast('Đã xóa cổng thành công!');
        }
      });
    });

    initIcons();
  }

  if (openAddPortalBtn) {
    openAddPortalBtn.addEventListener('click', () => {
      if (portalModalTitle) portalModalTitle.textContent = 'Thêm Cổng Kết Nối Mới';
      if (portalForm) portalForm.reset();
      if (formPortalId) formPortalId.value = '';
      if (formPortalIcon) formPortalIcon.value = 'globe';
      if (formPortalStatus) formPortalStatus.value = 'ONLINE';
      openModal(portalModal);
    });
  }

  function openEditPortalModal(id) {
    const portal = store.getPortalById(id);
    if (!portal) return;

    if (portalModalTitle) portalModalTitle.textContent = 'Chỉnh Sửa Cổng Kết Nối';
    if (formPortalId) formPortalId.value = portal.id;
    if (formPortalTitle) formPortalTitle.value = portal.title || '';
    if (formPortalUrl) formPortalUrl.value = portal.url || '';
    if (formPortalTagline) formPortalTagline.value = portal.tagline || portal.description || '';
    if (formPortalIcon) formPortalIcon.value = portal.icon || 'globe';
    if (formPortalStatus) formPortalStatus.value = portal.status || 'ONLINE';

    openModal(portalModal);
  }

  if (portalForm) {
    portalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = formPortalId.value.trim();
      const title = formPortalTitle.value.trim();
      const url = formPortalUrl.value.trim();
      const tagline = formPortalTagline.value.trim();
      const icon = formPortalIcon.value.trim() || 'globe';
      const status = formPortalStatus.value;

      if (!title || !url) {
        alert('Vui lòng điền tên và URL');
        return;
      }

      store.savePortal({
        id: id || undefined,
        title,
        url,
        tagline,
        description: tagline,
        icon,
        status
      });

      closeAllModals();
      renderPortalsTable();
      renderJsonViewer();
      showToast('Đã lưu cổng kết nối thành công!');
    });
  }

  // --- TAB 2: ABOUT FORM ---
  function loadAboutForm() {
    const about = store.getAbout();
    if (formAboutTitle) formAboutTitle.value = about.title || '';
    if (formAboutAlias) formAboutAlias.value = about.alias || '';
    if (formAboutQuote) formAboutQuote.value = about.quote || '';
    if (formAboutContent) formAboutContent.value = about.content || '';
  }

  if (aboutForm) {
    aboutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      store.saveAbout({
        title: formAboutTitle.value.trim(),
        alias: formAboutAlias.value.trim(),
        quote: formAboutQuote.value.trim(),
        content: formAboutContent.value.trim()
      });
      renderJsonViewer();
      showToast('Đã lưu nội dung About thành công!');
    });
  }

  // --- TAB 3: JSON DEPLOY ---
  function renderJsonViewer() {
    if (jsonViewer) {
      jsonViewer.textContent = store.exportJSON();
    }
  }

  if (copyJsonBtn) {
    copyJsonBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(store.exportJSON()).then(() => {
        showToast('Đã sao chép JSON vào clipboard!');
      });
    });
  }

  if (downloadJsonBtn) {
    downloadJsonBtn.addEventListener('click', () => {
      const blob = new Blob([store.exportJSON()], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'portals.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Đã tải file portals.json!');
    });
  }

  if (importFileInput) {
    importFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const res = store.importJSON(event.target.result);
        if (res.success) {
          loadAllAdminData();
          showToast('Nhập JSON thành công!');
        } else {
          alert('Lỗi JSON: ' + res.error);
        }
      };
      reader.readAsText(file);
    });
  }

  // --- CHANGE PIN ---
  if (changePinBtn) {
    changePinBtn.addEventListener('click', () => {
      if (formCurrentPin) formCurrentPin.value = '';
      if (formNewPin) formNewPin.value = '';
      if (formConfirmPin) formConfirmPin.value = '';
      openModal(pinModal);
    });
  }

  if (savePinBtn) {
    savePinBtn.addEventListener('click', () => {
      const cur = formCurrentPin.value.trim();
      const nPin = formNewPin.value.trim();
      const cPin = formConfirmPin.value.trim();

      if (!store.verifyPin(cur)) {
        alert('Mã PIN cũ không đúng.');
        return;
      }
      if (nPin.length < 4) {
        alert('Mã PIN mới phải từ 4 số trở lên.');
        return;
      }
      if (nPin !== cPin) {
        alert('Mã PIN xác nhận không khớp.');
        return;
      }

      store.setAdminPin(nPin);
      closeAllModals();
      showToast('Đã đổi mã PIN Admin thành công!');
    });
  }

  // --- MODAL HELPERS ---
  function openModal(modalEl) {
    if (modalEl) modalEl.classList.add('active');
    initIcons();
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('active'));
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllModals();
  });

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function initIcons() {
    if (window.lucide) window.lucide.createIcons();
  }

  function showToast(msg) {
    let box = document.getElementById('toast-container');
    if (!box) {
      box = document.createElement('div');
      box.id = 'toast-container';
      box.className = 'toast-container';
      document.body.appendChild(box);
    }
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    box.appendChild(t);
    setTimeout(() => t.remove(), 2500);
  }
});
