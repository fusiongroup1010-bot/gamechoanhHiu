// ============================================================================
// FILE CẤU HÌNH NỘI DUNG (BẠN CHỈ CẦN SỬA NỘI DUNG Ở ĐÂY)
// ============================================================================
// Hướng dẫn nhanh:
// 1. Sửa tên bạn trai, mật khẩu (ngày yêu nhau), gợi ý mật khẩu.
// 2. Sửa 5 câu nói ở 5 màn chơi và lời chúc cuối ngày 19/11.
// 3. Bỏ 6 ảnh vào thư mục assets/images/ (1.jpg -> 5.jpg và final.jpg).
// 4. Bỏ nhạc nền vào thư mục assets/audio/music.mp3.
// (Tuỳ chọn: Nếu muốn thay nhân vật bằng ảnh riêng, bỏ file player.png vào assets/images/player.png)
// ============================================================================

const CONFIG = {
  boyfriendName: "Anh yêu",
  password: "16072026",          // ngày yêu nhau (16/07/2026)
  passwordHint: "Ngày mình chính thức yêu nhau",
  heartsPerLevel: 5,             // mỗi vòng chơi cần nhặt 5 quả tim
  levels: [
    { image: "assets/images/1.jpg", message: "Ảnh quá xuất sắc, em rất ưng :)))." },
    { image: "assets/images/2.jpg", message: "Hôm nào mình thử mặc như này đi date nhá." },
    { image: "assets/images/3.jpg", message: "Ước gì lúc nào em với anh cũng cười tươi được như này." },
    { image: "assets/images/4.jpg", message: "Hum nào đi Tà Xùa làm cái như này anh nhá." },
    { image: "assets/images/5.jpg", message: "Chúc anh iu cụa em ngày 19/11 zui zẻ nha, em làm hơi vội nên hơi đơn sơ. Lần sau em làm đẹp hơn nữa nhó" }
  ],
  finalImage: "assets/images/final.jpg",
  finalMessage: "Chúc anh iu cụa em ngày 19/11 zui zẻ nha, em làm hơi vội nên hơi đơn sơ. Lần sau em làm đẹp hơn nữa nhó ❤️",
  music: "assets/audio/music.mp3"
};
