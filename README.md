# 🌐 Postlain Ecosystem Portal Hub

> Cổng kết nối trung tâm (Ecosystem Gateway) cho toàn bộ hệ thống website, công cụ, phòng thu DAW trực tuyến và các dự án vệ tinh thuộc hệ sinh thái **Postlain** (`postlain.com`).

---

## ✨ Tính Năng Nổi Bật

### 🏠 1. Trang Chủ Portal (`postlain.com`)
- **Giao diện Cyber-Glassmorphism đỉnh cao**: Hiệu ứng ánh sáng neon, gradient động, typography hiện đại (`Space Grotesk` & `Outfit`).
- **Bộ tìm kiếm thông minh**: Gõ từ khóa tìm kiếm nhanh, hỗ trợ phím tắt `/` hoặc `Ctrl + K`.
- **Bộ lọc danh mục đa dạng**: Âm nhạc & Sáng tạo, Công cụ, AI & Công nghệ, Cộng đồng, Cửa hàng & Bản quyền, Tài liệu & API.
- **Thẻ kết nối dịch vụ (Portal Cards)**:
  - Hiển thị logo/icon tùy chỉnh, tiêu đề, mô tả, nhãn phân loại (Hot, Mới, AI 2.0).
  - Trạng thái trực tiếp: **Hoạt động (Live)**, **Beta**, **Sắp ra mắt**, **Bảo trì**.
  - Đếm lượt truy cập (Click counter).
  - Nút ghim yêu thích (Favorites) để truy cập nhanh các công cụ thường dùng.
- **Spotlight Showcase**: Khung nổi bật dành cho các ứng dụng chủ lực trong hệ thống.
- **Ecosystem Health Monitor**: Widget theo dõi số lượng cổng và trạng thái trực tuyến.

### ⚙️ 2. Trang Quản Trị Cổng (`postlain.com/admin`)
- **Bảo mật bằng mã PIN**: Màn hình khóa PIN bảo vệ (mã PIN mặc định: `1234`, có thể đổi trực tiếp trong cài đặt).
- **Quản lý Cổng (CRUD)**: Thêm mới, chỉnh sửa, xóa, và di chuyển sắp xếp thứ tự các cổng kết nối.
- **Quản lý Danh mục (Categories)**: Tạo mới, tùy biến màu sắc nhận diện và icon.
- **Cấu hình Tổng quan**: Đổi tên thương hiệu, khẩu hiệu, bật/tắt banner thông báo, link mạng xã hội (GitHub, Discord, YouTube, Telegram, Email).
- **Xuất / Nhập Dữ Liệu (Backup & Sync)**:
  - Tự động lưu tức thì vào `localStorage`.
  - **Tải file `portals.json`**: 1-click xuất file cấu hình để commit vào repo GitHub.
  - **Nhập JSON**: Khôi phục hoặc chuyển đổi dữ liệu nhanh chóng.

---

## 🚀 Cấu Trúc Dự Án

```
postlain/
├── index.html            # Trang chủ Portal Hub của postlain.com
├── admin.html            # Trang quản trị root fallback
├── admin/
│   └── index.html        # Trang quản trị /admin/
├── css/
│   ├── variables.css     # Design tokens, màu sắc, hiệu ứng glow
│   ├── style.css         # CSS giao diện trang chủ Portal
│   └── admin.css         # CSS giao diện trang quản trị Admin
├── js/
│   ├── store.js          # Tầng quản lý dữ liệu trung tâm & LocalStorage
│   ├── app.js            # Logic hiển thị trang chủ Portal
│   └── admin.js          # Logic quản trị, CRUD cổng, xác thực PIN
├── data/
│   └── portals.json      # File dữ liệu cấu hình mẫu ban đầu
├── _redirects            # Cấu hình định tuyến Cloudflare Pages (/admin)
├── _headers              # Cấu hình bảo mật và cache HTTP
└── README.md             # Tài liệu hướng dẫn
```

---

## 🛠️ Hướng Dẫn Sử Dụng & Triển Khai

### 1. Chạy Thử Trên Máy (Local Testing)
Bạn có thể mở trực tiếp file `index.html` trên trình duyệt hoặc sử dụng bất kỳ static server nào (ví dụ: Live Server trong VS Code, `npx serve`, hoặc Python `python -m http.server 3000`).

- Trang chủ: `http://localhost:3000/`
- Trang quản trị: `http://localhost:3000/admin/` (Mã PIN mặc định: `1234`)

---

### 2. Quy Trình Cập Nhật Cổng Mới & Triển Khai
1. Mở trang quản trị `/admin` và đăng nhập bằng mã PIN.
2. Thêm mới hoặc chỉnh sửa các cổng kết nối theo ý muốn.
3. Chuyển sang tab **Deploy & Backup** > Bấm **"Tải File portals.json"**.
4. Di chuyển file `portals.json` vừa tải vào thư mục `data/portals.json` của dự án.
5. Chạy lệnh commit và push lên GitHub:
   ```bash
   git add .
   git commit -m "Update postlain ecosystem portals"
   git push origin main
   ```

---

### 3. Hướng Dẫn Kết Nối & Deploy Qua Cloudflare Pages

1. **Đăng nhập vào Cloudflare Dashboard**: [dash.cloudflare.com](https://dash.cloudflare.com/)
2. Vào mục **Workers & Pages** > **Create application** > Chọn tab **Pages**.
3. Chọn **Connect to Git** và chọn repository `postlainmusic/postlain`.
4. Cấu hình cài đặt triển khai:
   - **Project name**: `postlain` (hoặc tên bạn muốn)
   - **Production branch**: `main`
   - **Framework preset**: `None`
   - **Build command**: *(Để trống)*
   - **Build output directory**: `.` (hoặc để trống thư mục gốc)
5. Bấm **Save and Deploy**. Cloudflare sẽ triển khai trang web trong vòng vài giây.

#### Gắn Tên Miền Tùy Chỉnh `postlain.com`:
1. Trong trang dự án Cloudflare Pages vừa tạo, chuyển sang tab **Custom domains**.
2. Bấm **Set up a custom domain** và nhập `postlain.com` (hoặc `www.postlain.com`).
3. Làm theo hướng dẫn của Cloudflare để kích hoạt DNS. Cloudflare sẽ tự động cấp chứng chỉ bảo mật SSL (HTTPS) miễn phí.

---

## 🔒 Bảo Mật Trang Admin
- Mã PIN mặc định ban đầu là: `1234`.
- Để đổi mã PIN, bấm vào nút **"Đổi Mã PIN"** ở thanh điều hướng bên trái trang quản trị.

---

## 📄 Bản Quyền
Phát triển cho hệ sinh thái **Postlain** © 2026. Tất cả quyền được bảo lưu.
