# 💖 Mini Game Web "Nhặt Tim" – Quà Tặng Bạn Trai Ngày 19/11

Một mini game web ngọt ngào, dễ thương mang phong cách pastel hồng/kem dành tặng bạn trai nhân ngày Quốc tế Đàn ông **19/11**. Trò chơi được viết hoàn toàn bằng **HTML + CSS + JavaScript thuần (Canvas 2D)**, tối ưu cho cả **điện thoại (Mobile-first)** và **máy tính**, không cần backend và triển khai dễ dàng lên **GitHub Pages** hoặc **Netlify**.

---

## 📁 Cấu trúc thư mục

```text
nhat-tim-19-11/
├── index.html          # Giao diện chính và các màn hình của game
├── style.css           # Giao diện tông pastel hồng/kem, hiệu ứng thiệp & responsive
├── config.js           # NƠI CHỈNH SỬA NỘI DUNG (tên, mật khẩu, câu nói, đường dẫn ảnh/nhạc)
├── game.js             # Logic gameplay Canvas 2D, âm thanh, preload và lưu tiến độ
├── README.md           # Hướng dẫn sử dụng và đưa web lên mạng
└── assets/
    ├── images/         # Thư mục chứa 5 ảnh màn chơi (1.jpg -> 5.jpg), ảnh cuối (final.jpg)
    └── audio/          # Thư mục chứa nhạc nền (music.mp3)
```

---

## 🛠️ 1. Hướng dẫn thay Ảnh, Nhạc và Câu nói của hai bạn

Bạn **chỉ cần chỉnh sửa duy nhất file `config.js`** và copy ảnh/nhạc vào thư mục `assets/`.

### Bước 1: Thay câu nói, tên gọi và mật khẩu
Mở file `config.js` bằng bất kỳ trình soạn thảo nào (Notepad, VS Code, TextEdit...) và sửa các dòng sau:

```javascript
const CONFIG = {
  boyfriendName: "Anh yêu",                   // Đổi thành tên hoặc biệt danh của bạn trai
  password: "DDMMYYYY",                       // Đổi thành ngày kỷ niệm yêu nhau (VD: "15082022")
  passwordHint: "Ngày mình chính thức yêu nhau", // Gợi ý mật khẩu hiện trên màn hình
  heartsPerLevel: 10,                         // Số tim cần nhặt ở mỗi màn (mặc định: 10)
  levels: [
    { image: "assets/images/1.jpg", message: "Câu nói màn 1..." },
    { image: "assets/images/2.jpg", message: "Câu nói màn 2..." },
    { image: "assets/images/3.jpg", message: "Câu nói màn 3..." },
    { image: "assets/images/4.jpg", message: "Câu nói màn 4..." },
    { image: "assets/images/5.jpg", message: "Câu nói màn 5..." }
  ],
  finalImage: "assets/images/final.jpg",      // Ảnh hiện ở màn chúc mừng cuối cùng
  finalMessage: "Lời chúc 19/11...",          // Tâm thư hiện dần từng chữ ở màn cuối
  music: "assets/audio/music.mp3"             // File nhạc nền
};
```

### Bước 2: Thay ảnh kỷ niệm
1. Chuẩn bị **6 tấm ảnh** kỷ niệm đẹp nhất của hai bạn.
2. Đặt tên lần lượt là: `1.jpg`, `2.jpg`, `3.jpg`, `4.jpg`, `5.jpg` và `final.jpg` (nếu ảnh của bạn đuôi `.png`, hãy sửa lại đuôi trong `config.js` cho khớp).
3. Copy cả 6 ảnh vào thư mục `assets/images/`.
   - *Lưu ý:* Nếu bạn chưa kịp bỏ ảnh vào, game vẫn hoạt động bình thường và tự động hiện khung ảnh minh họa dễ thương thay thế!
   - *Tuỳ chọn nhân vật:* Mặc định nhân vật là **bé bông tròn màu hồng pastel** có tai nhỏ nhún nhảy. Nếu bạn muốn dùng hình PNG riêng, chỉ cần bỏ ảnh vào `assets/images/player.png`.

### Bước 3: Thay nhạc nền
1. Chọn một bản nhạc `.mp3` nhẹ nhàng, lãng mạn.
2. Đổi tên file thành `music.mp3` và bỏ vào thư mục `assets/audio/music.mp3`.
3. Ngoài nhạc nền, game đã tích hợp sẵn âm thanh "pop" khi nhặt tim và chuông mở quà bằng Web Audio API nên luôn có hiệu ứng âm thanh sinh động.

---

## 💻 2. Cách chạy thử trên máy tính

Bạn có thể mở trực tiếp file `index.html` bằng trình duyệt (Chrome, Safari, Edge...), hoặc dùng một local server nhỏ để trải nghiệm mượt nhất:

- **Cách 1 (Nhanh nhất):** Nháy đúp chuột vào file `index.html` để mở trên trình duyệt.
- **Cách 2 (Dùng VS Code):** Cài tiện ích **Live Server**, bấm chuột phải vào `index.html` -> chọn **Open with Live Server**.
- **Cách 3 (Dùng Python hoặc Node.js):**
  ```bash
  # Nếu máy có cài Python:
  python -m http.server 8080
  # Sau đó mở trình duyệt vào địa chỉ: http://localhost:8080
  ```

---

## 🚀 3. Cách đưa game lên mạng (Deploy) để gửi link cho bạn trai

### Cách A: Deploy bằng Netlify Drop (Nhanh nhất – Chỉ mất 30 giây, không cần biết code)
1. Truy cập trang **[app.netlify.com/drop](https://app.netlify.com/drop)** (đăng nhập miễn phí bằng Google hoặc GitHub).
2. Kéo nguyên thư mục `nhat-tim-19-11` (chứa `index.html`, `style.css`, `game.js`, `config.js`, `assets/`) thả vào khung **"Drag and drop your site output folder here"**.
3. Chờ vài giây, Netlify sẽ cấp ngay cho bạn một đường link dạng `https://ten-ngau-nhien.netlify.app`.
4. Bạn có thể vào **Site configuration** -> **Change site name** để đổi thành đường link đẹp hơn (ví dụ: `https://qua-19-11-tang-anh.netlify.app`) rồi gửi cho bạn trai!

### Cách B: Deploy lên GitHub Pages (Miễn phí vĩnh viễn)
1. Đăng nhập vào **[github.com](https://github.com)** và bấm nút **New** để tạo một Repository mới (ví dụ đặt tên là `qua-19-11`). Chọn chế độ **Public** -> bấm **Create repository**.
2. Bấm vào dòng **uploading an existing file** trên trang vừa tạo.
3. Kéo toàn bộ các file và thư mục bên trong `nhat-tim-19-11` (`index.html`, `style.css`, `game.js`, `config.js`, `README.md`, thư mục `assets`) thả vào cửa sổ upload.
4. Bấm nút xanh **Commit changes** ở dưới cùng.
5. Trên thanh menu của Repository, chọn mục **Settings** ⚙️ -> chọn **Pages** ở cột bên trái.
6. Ở phần **Build and deployment** -> mục **Branch**, đổi từ `None` sang `main` (hoặc `master`) rồi bấm **Save**.
7. Đợi khoảng 1–2 phút và tải lại trang, GitHub sẽ hiện đường link trang web của bạn ở trên cùng:
   `https://<ten-github-cua-ban>.github.io/qua-19-11/`
8. Copy link này hoặc tạo mã QR từ link để gửi tặng bạn trai ngày 19/11 nhé! 💌
