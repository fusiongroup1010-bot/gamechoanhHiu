// ============================================================================
// MINI GAME "NHẶT TIM" - QUÀ TẶNG BẠN TRAI NGÀY 19/11
// Công nghệ: HTML5 Canvas 2D + Vanilla JavaScript (Delta-time, Mobile-first)
// ============================================================================

(() => {
  "use strict";

  // Khoá lưu tiến độ trên trình duyệt (localStorage)
  const STORAGE_KEY = "nhat_tim_19_11_progress_v2";
  const OLD_STORAGE_KEY = "nhat_tim_19_11_progress_v1";

  // Kiểm tra cấu hình từ config.js
  const cfg = typeof CONFIG !== "undefined" ? CONFIG : {};
  const TOTAL_LEVELS = Array.isArray(cfg.levels) && cfg.levels.length > 0 ? cfg.levels.length : 5;
  const HEARTS_PER_LEVEL = Number(cfg.heartsPerLevel) > 0 ? Number(cfg.heartsPerLevel) : 5;
  const PLAYER_IMAGE_PATH = cfg.playerImage || "assets/images/player.png";

  // ==========================================================================
  // TRUY CẬP PHẦN TỬ DOM
  // ==========================================================================
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  const hud = document.getElementById("hud");
  const hudText = document.getElementById("hudText");
  const hudBarFill = document.getElementById("hudBarFill");
  const btnResetProgress = document.getElementById("btnResetProgress");
  const btnMute = document.getElementById("btnMute");
  const btnPause = document.getElementById("btnPause");

  const screens = {
    loading: document.getElementById("screenLoading"),
    password: document.getElementById("screenPassword"),
    welcome: document.getElementById("screenWelcome"),
    pause: document.getElementById("screenPause"),
    levelClear: document.getElementById("screenLevelClear"),
    victory: document.getElementById("screenVictory"),
    album: document.getElementById("screenAlbum")
  };

  // Phần tử màn Loading
  const loadingStatus = document.getElementById("loadingStatus");
  const loadingBarFill = document.getElementById("loadingBarFill");

  // Phần tử màn Mật khẩu
  const passwordCard = document.getElementById("passwordCard");
  const passwordHintText = document.getElementById("passwordHintText");
  const passwordForm = document.getElementById("passwordForm");
  const passwordInput = document.getElementById("passwordInput");
  const passwordError = document.getElementById("passwordError");

  // Phần tử màn Chào
  const welcomeTitle = document.getElementById("welcomeTitle");
  const welcomeTargetHearts = document.getElementById("welcomeTargetHearts");
  const savedProgressNotice = document.getElementById("savedProgressNotice");
  const btnStartGame = document.getElementById("btnStartGame");

  // Phần tử màn Tạm dừng
  const btnResume = document.getElementById("btnResume");
  const btnOpenAlbumFromPause = document.getElementById("btnOpenAlbumFromPause");

  // Phần tử màn Mở khóa kỷ niệm (qua màn)
  const levelClearBadge = document.getElementById("levelClearBadge");
  const levelClearTitle = document.getElementById("levelClearTitle");
  const levelPhotoImg = document.getElementById("levelPhotoImg");
  const levelPhotoFallback = document.getElementById("levelPhotoFallback");
  const levelFallbackTitle = document.getElementById("levelFallbackTitle");
  const levelFallbackPath = document.getElementById("levelFallbackPath");
  const levelMessageText = document.getElementById("levelMessageText");
  const btnNextLevel = document.getElementById("btnNextLevel");

  // Phần tử màn Chiến thắng (sau màn 5)
  const victoryBoyfriendName = document.getElementById("victoryBoyfriendName");
  const finalPhotoImg = document.getElementById("finalPhotoImg");
  const finalPhotoFallback = document.getElementById("finalPhotoFallback");
  const finalFallbackPath = document.getElementById("finalFallbackPath");
  const finalMessageTypewriter = document.getElementById("finalMessageTypewriter");
  const btnOpenAlbum = document.getElementById("btnOpenAlbum");
  const btnPlayAgain = document.getElementById("btnPlayAgain");

  // Phần tử màn Album
  const albumGrid = document.getElementById("albumGrid");
  const btnCloseAlbum = document.getElementById("btnCloseAlbum");
  const btnBackFromAlbum = document.getElementById("btnBackFromAlbum");

  // ==========================================================================
  // TRẠNG THÁI GAME & TÀI NGUYÊN PRELOAD
  // ==========================================================================
  const preloadedImages = new Map(); // Lưu trạng thái ảnh: { img, loaded }
  let bgMusic = null;
  let audioCtx = null;

  // ==========================================================================
  // BẢNG BIỂU CẢM & CÂU ĐỘNG VIÊN RIÊNG BIỆT CHO TỪNG MÀN, TỪNG TRÁI TIM
  // (Đa dạng cảm xúc, không lặp lại giữa các vòng, câu nói ngọt ngào cổ vũ)
  // ==========================================================================
  const LEVEL_REACTIONS = {
    // MÀN 1: Khởi đầu ngọt ngào
    1: [
      { expr: "happy", text: "Khởi động nha! 💕", bg: "#ffe3ee", border: "#ff6b95", color: "#e61f5b" },
      { expr: "wink", text: "Giọi quá ta! ✨", bg: "#fff3d6", border: "#ffb703", color: "#c77700" },
      { expr: "grin", text: "Cố nhên anh iu! 🌸", bg: "#e8f8f5", border: "#2ec4b6", color: "#088c7d" },
      { expr: "heart_eyes", text: "Mê tít anh òi! 💖", bg: "#ffe0ec", border: "#ff3366", color: "#d90043" },
      { expr: "kiss", text: "Qua màn 1 gòi! 🎉", bg: "#ffe8f2", border: "#ff4d88", color: "#c41355" }
    ],
    // MÀN 2: Tiếp sức khích lệ
    2: [
      { expr: "cheer", text: "Màn 2 bắt đầu! 🌷", bg: "#fff0f5", border: "#ff85a2", color: "#d62262" },
      { expr: "star_eyes", text: "Chuẩn đét lun! ⭐", bg: "#fff8db", border: "#f4a261", color: "#b55d00" },
      { expr: "happy", text: "Quá giọi nè! 🥰", bg: "#ffe3ee", border: "#ff6b95", color: "#e61f5b" },
      { expr: "wink", text: "Sắp xong òi cố nhên! 🏃‍♂️", bg: "#fff3d6", border: "#ffb703", color: "#c77700" },
      { expr: "heart_eyes", text: "Mở quà màn 2 nè! 🎁", bg: "#ffe0ec", border: "#ff3366", color: "#d90043" }
    ],
    // MÀN 3: Nửa chặng đường đong đầy yêu thương
    3: [
      { expr: "blush_shy", text: "Nửa chặng rùi nà! 🍓", bg: "#ffe8f0", border: "#ff7096", color: "#c9184a" },
      { expr: "grin", text: "Khéo tay quá ta! 👏", bg: "#e8f8f5", border: "#2ec4b6", color: "#088c7d" },
      { expr: "heart_eyes", text: "Mê tít mê tít! 😍", bg: "#ffe0ec", border: "#ff3366", color: "#d90043" },
      { expr: "star_eyes", text: "Cố nhên sắp tới rùi! 🎈", bg: "#fff8db", border: "#f4a261", color: "#b55d00" },
      { expr: "kiss", text: "Màn 3 xuất sắc! 🥳", bg: "#ffe8f2", border: "#ff4d88", color: "#c41355" }
    ],
    // MÀN 4: Chặng áp chót bùng nổ
    4: [
      { expr: "cheer", text: "Chặng 4 nè anh! 🌻", bg: "#fff0f5", border: "#ff85a2", color: "#d62262" },
      { expr: "wink", text: "Đỉnh chóp quá nè! 🌟", bg: "#fff3d6", border: "#ffb703", color: "#c77700" },
      { expr: "kiss", text: "Thương anh nhất! 😘", bg: "#ffe8f2", border: "#ff4d88", color: "#c41355" },
      { expr: "grin", text: "Một xíu xiu nữa thôi! 💓", bg: "#e8f8f5", border: "#2ec4b6", color: "#088c7d" },
      { expr: "star_eyes", text: "Sắp tới quà to bự! 💌", bg: "#fff8db", border: "#f4a261", color: "#b55d00" }
    ],
    // MÀN 5: Về đích trọn vẹn
    5: [
      { expr: "determined", text: "Chặng cuối gòi đó! 🌈", bg: "#fff0f7", border: "#ff5c8a", color: "#ad1457" },
      { expr: "cheer", text: "Chăm chỉ quá nè! 😻", bg: "#fff0f5", border: "#ff85a2", color: "#d62262" },
      { expr: "heart_eyes", text: "Yêu anh nhất trần đời! 💖", bg: "#ffe0ec", border: "#ff3366", color: "#d90043" },
      { expr: "star_eyes", text: "Cố nhên sắp tới rùi! 🔥", bg: "#fff8db", border: "#f4a261", color: "#b55d00" },
      { expr: "kiss", text: "Đến đích gòi nèeee! 🏆", bg: "#ffe8f2", border: "#ff4d88", color: "#c41355" }
    ]
  };

  const HURT_REACTIONS = [
    { expr: "hurt", text: "Ui da đau em! 🥺", bg: "#f0edf0", border: "#998b96", color: "#5c5058" },
    { expr: "hurt", text: "Né tim xám ra nè 💔", bg: "#f0edf0", border: "#998b96", color: "#5c5058" },
    { expr: "hurt", text: "Huhu cẩn thận nha! 🥺", bg: "#f0edf0", border: "#998b96", color: "#5c5058" },
    { expr: "hurt", text: "Đừng để rơi tim nè 😢", bg: "#f0edf0", border: "#998b96", color: "#5c5058" }
  ];

  const state = {
    mode: "loading", // loading | password | welcome | playing | paused | levelClear | victory | album
    previousModeBeforeAlbum: "victory",
    width: window.innerWidth,
    height: window.innerHeight,
    dpr: Math.min(window.devicePixelRatio || 1, 2),

    // Tiến độ người chơi
    passwordVerified: false,
    hasStarted: false,
    currentLevel: 1, // 1..5
    heartsCollected: 0,
    unlockedLevels: [], // Mảng các chỉ số màn đã mở (1..5)
    gameCompleted: false,

    // Âm thanh
    isMuted: false,

    // Điều khiển nhân vật
    player: {
      x: window.innerWidth / 2,
      y: window.innerHeight - 75,
      targetX: null,
      radius: 34,
      speed: 520, // px/giây khi bấm phím
      walkPhase: 0,
      squish: 0, // Hiệu ứng nhún khi vừa hứng được tim
      facing: 1,
      expression: "normal", // normal | happy | wink | grin | heart_eyes | kiss | star_eyes | cheer | blush_shy | determined | hurt
      expressionTimer: 0,
      currentMood: null // Lưu thông tin bong bóng câu động viên
    },
    keys: {
      left: false,
      right: false
    },
    isPointerDragging: false,

    // Danh sách thực thể trên Canvas
    fallingItems: [],
    popEffects: [],
    floatingTexts: [],
    confetti: [],
    clouds: [],
    bgHearts: [],

    // Bộ đếm sinh tim & rung màn hình
    spawnTimer: 0,
    shakeTime: 0,
    shakeMagnitude: 0,

    // Hiệu ứng gõ chữ màn cuối
    typewriterTimer: null
  };

  // ==========================================================================
  // LƯU & ĐỌC TIẾN ĐỘ (LOCALSTORAGE BỌC TRY/CATCH AN TOÀN)
  // ==========================================================================
  function loadProgress() {
    try {
      let raw = window.localStorage.getItem(STORAGE_KEY);
      let isOldVersion = false;
      if (!raw) {
        raw = window.localStorage.getItem(OLD_STORAGE_KEY);
        isOldVersion = true;
      }
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data && typeof data === "object") {
        state.passwordVerified = Boolean(data.passwordVerified);
        state.hasStarted = Boolean(data.hasStarted);
        if (Number.isInteger(data.currentLevel) && data.currentLevel >= 1 && data.currentLevel <= TOTAL_LEVELS) {
          state.currentLevel = data.currentLevel;
        }
        if (
          !isOldVersion &&
          Number.isInteger(data.heartsCollected) &&
          data.heartsCollected >= 0 &&
          data.heartsCollected < HEARTS_PER_LEVEL
        ) {
          state.heartsCollected = data.heartsCollected;
        } else {
          // Luôn reset số tim nhặt về 0 khi bắt đầu phiên mới hoặc chuyển sang mốc 5 tim
          state.heartsCollected = 0;
        }
        if (Array.isArray(data.unlockedLevels)) {
          state.unlockedLevels = data.unlockedLevels.filter(
            (lvl) => Number.isInteger(lvl) && lvl >= 1 && lvl <= TOTAL_LEVELS
          );
        }
        state.gameCompleted = Boolean(data.gameCompleted);
        if (typeof data.isMuted === "boolean") {
          state.isMuted = data.isMuted;
        }
      }
      saveProgress();
    } catch (err) {
      // Nếu trình duyệt chặn localStorage (ẩn danh nghiêm ngặt), game vẫn chạy bình thường
      console.warn("Không thể đọc localStorage, tiếp tục chạy ở chế độ bộ nhớ tạm:", err);
    }
  }

  function saveProgress() {
    try {
      const payload = {
        passwordVerified: state.passwordVerified,
        hasStarted: state.hasStarted,
        currentLevel: state.currentLevel,
        heartsCollected: state.heartsCollected,
        unlockedLevels: state.unlockedLevels,
        gameCompleted: state.gameCompleted,
        isMuted: state.isMuted
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.warn("Không thể lưu tiến độ vào localStorage:", err);
    }
  }

  function resetAllProgress() {
    state.currentLevel = 1;
    state.heartsCollected = 0;
    state.unlockedLevels = [];
    state.gameCompleted = false;
    state.hasStarted = true;
    saveProgress();
  }

  // ==========================================================================
  // HỆ THỐNG ÂM THANH (NHẠC NỀN + HIỆU ỨNG ÂM THANH WEB AUDIO API)
  // ==========================================================================
  function initAudio() {
    if (cfg.music && !bgMusic) {
      try {
        bgMusic = new Audio(cfg.music);
        bgMusic.loop = true;
        bgMusic.volume = 0.55;
        bgMusic.muted = state.isMuted;
      } catch (e) {
        console.warn("Không tạo được đối tượng Audio:", e);
      }
    }
    updateMuteButtonUI();
  }

  function ensureAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        try {
          audioCtx = new AudioContextClass();
        } catch (e) {
          audioCtx = null;
        }
      }
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
  }

  function startBackgroundMusic() {
    ensureAudioContext();
    if (!bgMusic || state.isMuted) return;
    const playPromise = bgMusic.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        // Nếu file nhạc chưa có hoặc trình duyệt chặn, bỏ qua êm ái không báo lỗi
      });
    }
  }

  function toggleMute() {
    state.isMuted = !state.isMuted;
    if (bgMusic) {
      bgMusic.muted = state.isMuted;
      if (!state.isMuted && (state.mode === "playing" || state.mode === "levelClear" || state.mode === "victory")) {
        startBackgroundMusic();
      }
    }
    updateMuteButtonUI();
    saveProgress();
  }

  function updateMuteButtonUI() {
    if (!btnMute) return;
    btnMute.textContent = state.isMuted ? "🔇" : "🔊";
    btnMute.setAttribute("aria-label", state.isMuted ? "Bật nhạc" : "Tắt nhạc");
  }

  // Âm thanh nhỏ dễ thương khi nhặt tim / chạm tim vỡ / qua màn (không cần file rời)
  function playSoundEffect(type) {
    if (state.isMuted) return;
    ensureAudioContext();
    if (!audioCtx) return;

    try {
      const now = audioCtx.currentTime;

      if (type === "pop") {
        // Tiếng "pop" trong trẻo khi nhặt được tim đỏ
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.11);

        gain.gain.setValueAtTime(0.16, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === "hurt") {
        // Tiếng trầm nhẹ khi chạm phải tim vỡ
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.linearRampToValueAtTime(135, now + 0.18);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.19);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.19);
      } else if (type === "unlock") {
        // Hợp âm lấp lánh khi đủ 10 tim mở quà
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = "sine";
          const start = now + idx * 0.07;
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(0.12, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);

          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(start);
          osc.stop(start + 0.28);
        });
      }
    } catch (e) {
      // Bỏ qua nếu thiết bị không hỗ trợ Web Audio
    }
  }

  // ==========================================================================
  // TẢI TRƯỚC (PRELOAD) ẢNH & MÀN HÌNH LOADING
  // ==========================================================================
  function preloadAllAssets() {
    const urls = [];
    if (Array.isArray(cfg.levels)) {
      cfg.levels.forEach((item) => {
        if (item && item.image) urls.push(item.image);
      });
    }
    if (cfg.finalImage) urls.push(cfg.finalImage);
    if (PLAYER_IMAGE_PATH) urls.push(PLAYER_IMAGE_PATH);

    const uniqueUrls = Array.from(new Set(urls));
    if (uniqueUrls.length === 0) {
      finishLoading();
      return;
    }

    let completed = 0;
    const total = uniqueUrls.length;

    const updateLoadingUI = () => {
      const percent = Math.round((completed / total) * 100);
      if (loadingBarFill) loadingBarFill.style.width = `${percent}%`;
      if (loadingStatus) {
        loadingStatus.textContent = `Chuẩn bị kỷ niệm cho hai đứa mình (${percent}%)`;
      }
      if (completed >= total) {
        setTimeout(finishLoading, 250);
      }
    };

    uniqueUrls.forEach((url) => {
      const img = new Image();
      let settled = false;

      const markDone = (loadedSuccessfully) => {
        if (settled) return;
        settled = true;
        preloadedImages.set(url, {
          img,
          loaded: loadedSuccessfully && img.naturalWidth > 0
        });
        completed += 1;
        updateLoadingUI();
      };

      img.onload = () => markDone(true);
      img.onerror = () => markDone(false);
      img.src = url;
    });
  }

  function finishLoading() {
    // Khởi tạo nội dung hiển thị từ CONFIG
    applyConfigToDOM();

    // Khôi phục đúng màn hình theo tiến độ đã lưu
    if (state.passwordVerified) {
      if (state.gameCompleted) {
        showVictoryScreen();
      } else if (state.hasStarted) {
        startLevel(state.currentLevel, true);
      } else {
        showWelcomeScreen();
      }
    } else {
      showScreen("password");
    }
  }

  // ==========================================================================
  // ĐỒNG BỘ NỘI DUNG TỪ CONFIG.JS VÀO GIAO DIỆN
  // ==========================================================================
  function applyConfigToDOM() {
    const bfName = cfg.boyfriendName || "Anh yêu";
    const hint = cfg.passwordHint || "Ngày mình chính thức yêu nhau";

    if (passwordHintText) {
      passwordHintText.textContent = hint;
    }
    if (passwordInput && cfg.password) {
      passwordInput.placeholder = "DDMMYYYY";
    }
    if (welcomeTitle) {
      welcomeTitle.textContent = `Chào ${bfName}! Nhặt đủ tim để mở quà của em nhé`;
    }
    if (welcomeTargetHearts) {
      welcomeTargetHearts.textContent = String(HEARTS_PER_LEVEL);
    }
    if (victoryBoyfriendName) {
      victoryBoyfriendName.textContent = bfName;
    }
  }

  // Hiển thị ảnh vào khung hoặc hiện khung thay thế nếu thiếu file ảnh
  function renderPhotoWithFallback(imageUrl, imgEl, fallbackEl, fallbackTitleEl, fallbackPathEl, titleText) {
    const cached = preloadedImages.get(imageUrl);
    const isAvailable = cached && cached.loaded;

    if (isAvailable) {
      imgEl.src = imageUrl;
      imgEl.classList.remove("hidden");
      fallbackEl.classList.add("hidden");
    } else {
      imgEl.removeAttribute("src");
      imgEl.classList.add("hidden");
      fallbackEl.classList.remove("hidden");
      if (fallbackTitleEl && titleText) {
        fallbackTitleEl.textContent = titleText;
      }
      if (fallbackPathEl) {
        fallbackPathEl.textContent = imageUrl ? `Chờ thêm ảnh: ${imageUrl}` : "Chưa cấu hình đường dẫn ảnh";
      }
    }
  }

  // ==========================================================================
  // CHUYỂN ĐỔI CÁC MÀN HÌNH
  // ==========================================================================
  function showScreen(screenName) {
    Object.entries(screens).forEach(([key, el]) => {
      if (!el) return;
      if (key === screenName) {
        el.classList.remove("hidden");
      } else {
        el.classList.add("hidden");
      }
    });

    if (screenName === "playing") {
      hud.classList.remove("hidden");
    } else if (screenName === "pause" || screenName === "levelClear") {
      hud.classList.remove("hidden");
    } else {
      hud.classList.add("hidden");
    }

    state.mode = screenName;
  }

  function showWelcomeScreen() {
    showScreen("welcome");
    if (savedProgressNotice) {
      if (state.gameCompleted) {
        savedProgressNotice.textContent = `🎉 Đã mở hết cả ${TOTAL_LEVELS} kỷ niệm! Bấm Bắt đầu để xem lại lời chúc hoặc chơi lại nhé.`;
        savedProgressNotice.classList.remove("hidden");
      } else if (state.currentLevel > 1 || state.unlockedLevels.length > 0) {
        savedProgressNotice.textContent = `📌 Đã lưu tiến độ: Tiếp tục ở Màn ${state.currentLevel}/${TOTAL_LEVELS} (${state.unlockedLevels.length} ảnh đã mở).`;
        savedProgressNotice.classList.remove("hidden");
      } else {
        savedProgressNotice.classList.add("hidden");
      }
      btnStartGame.textContent = "Bắt đầu";
    }
  }

  // ==========================================================================
  // THIẾT LẬP MÀN CHƠI & ĐỘ KHÓ TĂNG DẦN (MỖI MÀN ~30-60 GIÂY)
  // ==========================================================================
  function getLevelDifficulty(levelIndex) {
    // levelIndex: 1 -> 5
    // Tốc độ rơi và tần suất tăng nhẹ nhàng để mỗi màn chơi khoảng 30-60 giây, luôn dễ thắng
    const lvl = Math.max(1, Math.min(TOTAL_LEVELS, levelIndex));
    return {
      spawnInterval: Math.max(0.55, 1.08 - (lvl - 1) * 0.11), // Giây giữa mỗi lượt rơi (1.08s -> 0.64s)
      minSpeed: 125 + (lvl - 1) * 24,                         // Tốc độ rơi tối thiểu (px/s)
      maxSpeed: 185 + (lvl - 1) * 34,                         // Tốc độ rơi tối đa (px/s)
      // Từ màn 2 trở đi mới có tim vỡ màu xám rơi xen kẽ
      brokenHeartChance: lvl === 1 ? 0 : Math.min(0.32, 0.16 + (lvl - 2) * 0.05)
    };
  }

  function startLevel(levelNumber, keepSavedHearts = false) {
    state.hasStarted = true;
    state.currentLevel = Math.max(1, Math.min(TOTAL_LEVELS, levelNumber));
    if (!keepSavedHearts) {
      state.heartsCollected = 0;
    }
    state.fallingItems = [];
    state.popEffects = [];
    state.floatingTexts = [];
    state.spawnTimer = 0.25;
    state.player.x = state.width / 2;
    state.player.targetX = null;

    updateHudUI();
    saveProgress();
    showScreen("playing");
  }

  function updateHudUI() {
    if (hudText) {
      hudText.textContent = `Màn ${state.currentLevel}/${TOTAL_LEVELS} · ❤ ${state.heartsCollected}/${HEARTS_PER_LEVEL}`;
    }
    if (hudBarFill) {
      const pct = Math.min(100, Math.round((state.heartsCollected / HEARTS_PER_LEVEL) * 100));
      hudBarFill.style.width = `${pct}%`;
    }
  }

  // Khi nhặt đủ 10 tim ở màn hiện tại
  function handleLevelCleared() {
    playSoundEffect("unlock");
    state.fallingItems = [];
    state.isPointerDragging = false;
    state.keys.left = false;
    state.keys.right = false;

    if (!state.unlockedLevels.includes(state.currentLevel)) {
      state.unlockedLevels.push(state.currentLevel);
      state.unlockedLevels.sort((a, b) => a - b);
    }

    const levelCfg = (cfg.levels && cfg.levels[state.currentLevel - 1]) || {
      image: `assets/images/${state.currentLevel}.jpg`,
      message: `Kỷ niệm đáng nhớ số ${state.currentLevel}`
    };

    if (levelClearBadge) {
      levelClearBadge.textContent = `🎉 Mở khóa kỷ niệm ${state.currentLevel}/${TOTAL_LEVELS}`;
    }
    if (levelClearTitle) {
      levelClearTitle.textContent =
        state.currentLevel < TOTAL_LEVELS
          ? `Hoàn thành Màn ${state.currentLevel}!`
          : `Mảnh ghép cuối cùng đã mở!`;
    }
    if (levelMessageText) {
      levelMessageText.textContent = levelCfg.message || "";
    }
    if (btnNextLevel) {
      btnNextLevel.textContent = "Chơi tiếp";
    }

    renderPhotoWithFallback(
      levelCfg.image,
      levelPhotoImg,
      levelPhotoFallback,
      levelFallbackTitle,
      levelFallbackPath,
      `Kỷ niệm ngọt ngào #${state.currentLevel}`
    );

    // Chuẩn bị tiến độ cho màn tiếp theo để nếu tải lại trang vẫn giữ đúng tiến độ
    state.heartsCollected = 0;
    if (state.currentLevel < TOTAL_LEVELS) {
      state.currentLevel += 1;
    } else {
      state.gameCompleted = true;
    }
    saveProgress();

    showScreen("levelClear");
  }

  // Màn Chiến thắng sau khi qua màn 5
  function showVictoryScreen() {
    state.gameCompleted = true;
    saveProgress();

    renderPhotoWithFallback(
      cfg.finalImage,
      finalPhotoImg,
      finalPhotoFallback,
      null,
      finalFallbackPath,
      "Khung ảnh kỷ niệm 19/11"
    );

    spawnVictoryConfetti();
    showScreen("victory");
    startTypewriterEffect(cfg.finalMessage || "Chúc mừng ngày 19/11!");
  }

  function startTypewriterEffect(fullText) {
    if (state.typewriterTimer) {
      clearInterval(state.typewriterTimer);
      state.typewriterTimer = null;
    }
    if (!finalMessageTypewriter) return;

    finalMessageTypewriter.textContent = "";
    const chars = Array.from(fullText);
    let idx = 0;

    state.typewriterTimer = setInterval(() => {
      if (idx < chars.length) {
        finalMessageTypewriter.textContent += chars[idx];
        idx += 1;
      } else {
        clearInterval(state.typewriterTimer);
        state.typewriterTimer = null;
      }
    }, 32);
  }

  // Mở Album kỷ niệm (5 ảnh đã mở khóa)
  function openAlbumScreen() {
    state.previousModeBeforeAlbum = state.mode;
    if (!albumGrid) return;

    albumGrid.innerHTML = "";
    const levelsList = Array.isArray(cfg.levels) ? cfg.levels : [];

    for (let i = 1; i <= TOTAL_LEVELS; i++) {
      const isUnlocked = state.gameCompleted || state.unlockedLevels.includes(i);
      const itemData = levelsList[i - 1] || {
        image: `assets/images/${i}.jpg`,
        message: `Câu nói ${i}`
      };

      const card = document.createElement("div");
      card.className = "album-item";

      const badge = document.createElement("div");
      badge.className = "album-item-badge";
      badge.textContent = isUnlocked ? `💖 Kỷ niệm #${i}` : `🔒 Kỷ niệm #${i} (Chưa mở)`;

      const frame = document.createElement("div");
      frame.className = "photo-frame";

      if (isUnlocked) {
        const cached = preloadedImages.get(itemData.image);
        if (cached && cached.loaded) {
          const img = document.createElement("img");
          img.src = itemData.image;
          img.alt = `Kỷ niệm ${i}`;
          frame.appendChild(img);
        } else {
          const fb = document.createElement("div");
          fb.className = "photo-fallback";
          fb.innerHTML = `
            <div class="fallback-icon">📸💖</div>
            <div class="fallback-title">Kỷ niệm #${i}</div>
            <div class="fallback-path">${itemData.image}</div>
          `;
          frame.appendChild(fb);
        }
      } else {
        const lockedFb = document.createElement("div");
        lockedFb.className = "photo-fallback";
        lockedFb.innerHTML = `
          <div class="fallback-icon">🔒</div>
          <div class="fallback-title">Chưa mở khóa</div>
          <div class="fallback-path">Hoàn thành Màn ${i} để xem</div>
        `;
        frame.appendChild(lockedFb);
      }

      const msg = document.createElement("p");
      msg.className = "album-item-msg";
      msg.textContent = isUnlocked ? itemData.message : "Hãy nhặt đủ tim ở màn này để mở khóa câu nói bí mật nhé!";

      card.appendChild(badge);
      card.appendChild(frame);
      card.appendChild(msg);
      albumGrid.appendChild(card);
    }

    showScreen("album");
  }

  // ==========================================================================
  // XỬ LÝ SỰ KIỆN NGƯỜI DÙNG (MẬT KHẨU, NÚT BẤM, CẢM ỨNG, BÀN PHÍM)
  // ==========================================================================
  function bindEvents() {
    // 1. Form mật khẩu
    if (passwordForm) {
      passwordForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const entered = (passwordInput.value || "").trim();
        const expected = String(cfg.password || "").trim();

        if (entered.toLowerCase() === expected.toLowerCase()) {
          passwordError.classList.add("hidden");
          state.passwordVerified = true;
          saveProgress();
          showWelcomeScreen();
        } else {
          // Sai mật khẩu: rung nhẹ và báo "Sai rồi, nghĩ lại nha"
          passwordError.textContent = "Sai rồi, nghĩ lại nha";
          passwordError.classList.remove("hidden");
          passwordCard.classList.remove("shake");
          // Kích hoạt reflow để chạy lại animation rung
          void passwordCard.offsetWidth;
          passwordCard.classList.add("shake");
          playSoundEffect("hurt");
        }
      });
    }

    // 2. Nút "Bắt đầu" ở màn chào -> phát nhạc + vào màn chơi
    if (btnStartGame) {
      btnStartGame.addEventListener("click", () => {
        startBackgroundMusic();
        if (state.gameCompleted) {
          showVictoryScreen();
        } else {
          startLevel(state.currentLevel);
        }
      });
    }

    // 3. Nút Bật/Tắt nhạc & Tạm dừng & Chơi lại từ đầu trên thanh HUD
    if (btnMute) {
      btnMute.addEventListener("click", () => {
        toggleMute();
      });
    }

    if (btnPause) {
      btnPause.addEventListener("click", () => {
        if (state.mode === "playing") {
          showScreen("pause");
        } else if (state.mode === "pause") {
          showScreen("playing");
        }
      });
    }

    if (btnResetProgress) {
      btnResetProgress.addEventListener("click", () => {
        resetAllProgress();
        startLevel(1);
      });
    }

    if (btnResume) {
      btnResume.addEventListener("click", () => {
        showScreen("playing");
      });
    }

    if (btnOpenAlbumFromPause) {
      btnOpenAlbumFromPause.addEventListener("click", () => {
        openAlbumScreen();
      });
    }

    // 4. Nút "Chơi tiếp" sau khi mở khóa ảnh mỗi màn
    if (btnNextLevel) {
      btnNextLevel.addEventListener("click", () => {
        if (state.gameCompleted) {
          showVictoryScreen();
        } else {
          startLevel(state.currentLevel);
        }
      });
    }

    // 5. Nút ở màn Chiến thắng & Album
    if (btnOpenAlbum) {
      btnOpenAlbum.addEventListener("click", () => {
        openAlbumScreen();
      });
    }

    if (btnPlayAgain) {
      btnPlayAgain.addEventListener("click", () => {
        resetAllProgress();
        startLevel(1);
      });
    }

    const closeAlbumHandler = () => {
      if (state.previousModeBeforeAlbum === "pause") {
        showScreen("pause");
      } else {
        showScreen("victory");
      }
    };

    if (btnCloseAlbum) btnCloseAlbum.addEventListener("click", closeAlbumHandler);
    if (btnBackFromAlbum) btnBackFromAlbum.addEventListener("click", closeAlbumHandler);

    // 6. Điều khiển bàn phím trên máy tính (Phím mũi tên hoặc A/D)
    window.addEventListener("keydown", (e) => {
      if (state.mode !== "playing") return;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        state.keys.left = true;
        state.player.targetX = null;
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        state.keys.right = true;
        state.player.targetX = null;
      } else if (e.key === "Escape") {
        showScreen("pause");
      }
    });

    window.addEventListener("keyup", (e) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        state.keys.left = false;
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        state.keys.right = false;
      }
    });

    // 7. Điều khiển kéo ngón tay / chuột trên màn hình
    const updatePointerPosition = (clientX) => {
      if (state.mode !== "playing") return;
      const r = state.player.radius;
      state.player.targetX = Math.max(r + 8, Math.min(state.width - r - 8, clientX));
    };

    canvas.addEventListener(
      "touchstart",
      (e) => {
        if (state.mode !== "playing") return;
        if (e.touches.length > 0) {
          state.isPointerDragging = true;
          updatePointerPosition(e.touches[0].clientX);
        }
      },
      { passive: true }
    );

    canvas.addEventListener(
      "touchmove",
      (e) => {
        if (state.mode !== "playing" || !state.isPointerDragging) return;
        if (e.touches.length > 0) {
          updatePointerPosition(e.touches[0].clientX);
        }
      },
      { passive: true }
    );

    canvas.addEventListener("touchend", () => {
      state.isPointerDragging = false;
    });

    canvas.addEventListener("mousedown", (e) => {
      if (state.mode !== "playing") return;
      state.isPointerDragging = true;
      updatePointerPosition(e.clientX);
    });

    window.addEventListener("mousemove", (e) => {
      if (state.mode !== "playing" || !state.isPointerDragging) return;
      updatePointerPosition(e.clientX);
    });

    window.addEventListener("mouseup", () => {
      state.isPointerDragging = false;
    });

    // 8. Co giãn Canvas khi xoay màn hình hoặc thay đổi kích thước cửa sổ
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", () => {
      setTimeout(handleResize, 120);
    });
  }

  // ==========================================================================
  // CO GIÃN CANVAS & KHỞI TẠO NỀN MÂY / TIM MỜ TRÔI CHẬM
  // ==========================================================================
  function handleResize() {
    state.width = window.innerWidth;
    state.height = window.innerHeight;
    state.dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(state.width * state.dpr);
    canvas.height = Math.floor(state.height * state.dpr);
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);

    // Kích thước nhân vật tự co giãn hợp lý theo màn hình
    const baseRadius = Math.max(28, Math.min(38, state.width * 0.08));
    state.player.radius = baseRadius;
    state.player.y = state.height - baseRadius - Math.max(24, state.height * 0.05);
    state.player.x = Math.max(
      baseRadius + 8,
      Math.min(state.width - baseRadius - 8, state.player.x)
    );
  }

  function initBackgroundDecor() {
    state.clouds = [];
    for (let i = 0; i < 6; i++) {
      state.clouds.push({
        x: Math.random() * state.width,
        y: 50 + Math.random() * (state.height * 0.55),
        scale: 0.65 + Math.random() * 0.65,
        speed: 10 + Math.random() * 14,
        alpha: 0.45 + Math.random() * 0.35
      });
    }

    state.bgHearts = [];
    for (let i = 0; i < 14; i++) {
      state.bgHearts.push({
        x: Math.random() * state.width,
        y: Math.random() * state.height,
        size: 10 + Math.random() * 14,
        speedY: 12 + Math.random() * 18,
        swayOffset: Math.random() * Math.PI * 2,
        alpha: 0.14 + Math.random() * 0.18
      });
    }
  }

  // ==========================================================================
  // LOGIC SINH TIM RƠI, HIỆU ỨNG POP & PHÁO GIẤY
  // ==========================================================================
  function spawnFallingHeart() {
    const diff = getLevelDifficulty(state.currentLevel);
    const isBroken = Math.random() < diff.brokenHeartChance;
    const radius = isBroken ? 21 : 23;
    const margin = radius + 16;
    const x = margin + Math.random() * Math.max(20, state.width - margin * 2);
    const speedY = diff.minSpeed + Math.random() * (diff.maxSpeed - diff.minSpeed);

    state.fallingItems.push({
      x,
      y: -radius - 10,
      radius,
      speedY,
      swayAmp: isBroken ? 10 : 18 + Math.random() * 14,
      swaySpeed: 2 + Math.random() * 2,
      swayPhase: Math.random() * Math.PI * 2,
      rotation: (Math.random() - 0.5) * 0.3,
      type: isBroken ? "broken" : "red"
    });
  }

  function createPopEffect(x, y, isRedHeart) {
    const count = isRedHeart ? 10 : 7;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
      const speed = 60 + Math.random() * 90;
      state.popEffects.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: isRedHeart ? 4 + Math.random() * 4 : 3 + Math.random() * 3,
        color: isRedHeart ? (i % 2 === 0 ? "#ff477e" : "#ff9ebb") : "#8b8589",
        alpha: 1,
        life: 0.42
      });
    }

    state.floatingTexts.push({
      x,
      y: y - 12,
      text: isRedHeart ? "+1 ❤" : "-1 💔",
      color: isRedHeart ? "#ff2e6d" : "#6c6469",
      alpha: 1,
      life: 0.75
    });
  }

  function spawnVictoryConfetti() {
    state.confetti = [];
    const colors = ["#ff477e", "#ff85a9", "#ffd166", "#ff9ebb", "#cdb4db", "#a2d2ff"];
    for (let i = 0; i < 65; i++) {
      state.confetti.push({
        x: Math.random() * state.width,
        y: Math.random() * -state.height,
        vx: (Math.random() - 0.5) * 45,
        vy: 75 + Math.random() * 110,
        size: 7 + Math.random() * 7,
        color: colors[i % colors.length],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 5,
        isHeart: i % 3 === 0
      });
    }
  }

  // ==========================================================================
  // CẬP NHẬT TRẠNG THÁI THEO DELTA TIME (CHẠY MƯỢT TRÊN 60HZ VÀ 120HZ)
  // ==========================================================================
  function updateBackground(dt, timeSec) {
    // Mây trôi ngang chậm
    for (const c of state.clouds) {
      c.x += c.speed * dt;
      if (c.x - 90 * c.scale > state.width) {
        c.x = -110 * c.scale;
        c.y = 45 + Math.random() * (state.height * 0.55);
      }
    }

    // Tim mờ bay lên chậm ở nền
    for (const h of state.bgHearts) {
      h.y -= h.speedY * dt;
      h.x += Math.sin(timeSec * 1.4 + h.swayOffset) * 10 * dt;
      if (h.y + h.size < 0) {
        h.y = state.height + h.size;
        h.x = Math.random() * state.width;
      }
    }

    // Nếu đang ở màn chiến thắng, cập nhật pháo giấy & tim bay
    if (state.mode === "victory" || state.mode === "album") {
      for (const p of state.confetti) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rotation += p.vRot * dt;
        if (p.y > state.height + 20) {
          p.y = -20;
          p.x = Math.random() * state.width;
        }
      }
    }
  }

  function updateGameplay(dt, timeSec) {
    const player = state.player;
    const prevX = player.x;

    // 1. Di chuyển nhân vật bằng phím hoặc kéo ngón tay
    if (state.keys.left) {
      player.x -= player.speed * dt;
      player.facing = -1;
    }
    if (state.keys.right) {
      player.x += player.speed * dt;
      player.facing = 1;
    }

    if (player.targetX !== null) {
      const diffX = player.targetX - player.x;
      if (Math.abs(diffX) > 1.5) {
        player.facing = diffX > 0 ? 1 : -1;
      }
      // Nội suy mượt theo vị trí ngón tay
      const followFactor = Math.min(1, dt * 18);
      player.x += diffX * followFactor;
    }

    // Giới hạn nhân vật trong khung màn hình
    const minX = player.radius + 8;
    const maxX = state.width - player.radius - 8;
    player.x = Math.max(minX, Math.min(maxX, player.x));

    // Animation nhún nhảy khi di chuyển
    const movedSpeed = Math.abs(player.x - prevX) / Math.max(dt, 0.0001);
    if (movedSpeed > 15) {
      player.walkPhase += dt * 14;
    } else {
      player.walkPhase += dt * 3.2;
    }

    if (player.squish > 0) {
      player.squish = Math.max(0, player.squish - dt * 4.5);
    }

    // Giảm thời gian biểu cảm đặc biệt (trở về normal sau khi hết giờ)
    if (player.expressionTimer > 0) {
      player.expressionTimer = Math.max(0, player.expressionTimer - dt);
      if (player.expressionTimer === 0) {
        player.expression = "normal";
        player.currentMood = null;
      }
    }

    // Giảm thời gian rung màn hình nếu có
    if (state.shakeTime > 0) {
      state.shakeTime = Math.max(0, state.shakeTime - dt);
    }

    // 2. Sinh tim rơi định kỳ
    const diff = getLevelDifficulty(state.currentLevel);
    state.spawnTimer -= dt;
    if (state.spawnTimer <= 0) {
      spawnFallingHeart();
      state.spawnTimer = diff.spawnInterval * (0.85 + Math.random() * 0.3);
    }

    // 3. Cập nhật vị trí tim rơi & kiểm tra va chạm hình tròn - hình tròn
    for (let i = state.fallingItems.length - 1; i >= 0; i--) {
      const item = state.fallingItems[i];
      item.y += item.speedY * dt;
      item.x += Math.sin(timeSec * item.swaySpeed + item.swayPhase) * item.swayAmp * dt;

      // Giữ tim trong biên ngang màn hình
      item.x = Math.max(item.radius + 6, Math.min(state.width - item.radius - 6, item.x));

      // Kiểm tra va chạm Hình tròn - Hình tròn (Circle - Circle Collision)
      const dx = item.x - player.x;
      const dy = item.y - player.y;
      const distanceSq = dx * dx + dy * dy;
      const sumRadius = item.radius + player.radius * 0.88;

      if (distanceSq <= sumRadius * sumRadius) {
        // Xử lý chạm
        state.fallingItems.splice(i, 1);
        player.squish = 1;

        if (item.type === "red") {
          state.heartsCollected = Math.min(HEARTS_PER_LEVEL, state.heartsCollected + 1);
          createPopEffect(item.x, item.y, true);
          playSoundEffect("pop");

          // Lấy câu động viên & biểu cảm phong phú riêng biệt theo màn và quả tim:
          const lvlReactions = LEVEL_REACTIONS[state.currentLevel] || LEVEL_REACTIONS[1];
          const rIdx = Math.max(0, Math.min(lvlReactions.length - 1, state.heartsCollected - 1));
          const reaction = lvlReactions[rIdx];

          player.expression = reaction.expr;
          player.currentMood = reaction;
          player.expressionTimer = 2.6;

          updateHudUI();
          saveProgress();

          if (state.heartsCollected >= HEARTS_PER_LEVEL) {
            handleLevelCleared();
            return;
          }
        } else {
          // Chạm phải tim vỡ màu xám: -1 tim (không xuống dưới 0), rung nhẹ, nũng nịu
          state.heartsCollected = Math.max(0, state.heartsCollected - 1);
          state.shakeTime = 0.28;
          state.shakeMagnitude = 7;
          const hurtReaction = HURT_REACTIONS[Math.floor(Math.random() * HURT_REACTIONS.length)];
          player.expression = "hurt";
          player.currentMood = hurtReaction;
          player.expressionTimer = 1.8;
          createPopEffect(item.x, item.y, false);
          playSoundEffect("hurt");
          updateHudUI();
          saveProgress();
        }
        continue;
      }

      // Xoá tim đã rơi khuất khỏi đáy màn hình
      if (item.y - item.radius > state.height + 20) {
        state.fallingItems.splice(i, 1);
      }
    }

    // 4. Cập nhật hạt hiệu ứng "pop"
    for (let i = state.popEffects.length - 1; i >= 0; i--) {
      const p = state.popEffects[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      p.alpha = Math.max(0, p.life / 0.42);
      if (p.life <= 0) {
        state.popEffects.splice(i, 1);
      }
    }

    // 5. Cập nhật chữ bay (+1 ❤ / -1 💔)
    for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
      const ft = state.floatingTexts[i];
      ft.y -= 42 * dt;
      ft.life -= dt;
      ft.alpha = Math.max(0, ft.life / 0.75);
      if (ft.life <= 0) {
        state.floatingTexts.splice(i, 1);
      }
    }
  }

  // ==========================================================================
  // VẼ ĐỒ HOẠ LÊN CANVAS 2D (NỀN, MÂY, TIM, NHÂN VẬT CỤC BÔNG HỒNG)
  // ==========================================================================
  function drawCloud(x, y, scale, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;

    ctx.beginPath();
    ctx.arc(0, 0, 28, 0, Math.PI * 2);
    ctx.arc(26, -8, 34, 0, Math.PI * 2);
    ctx.arc(58, 0, 26, 0, Math.PI * 2);
    ctx.arc(28, 12, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawHeartShape(x, y, size, fillStyle, strokeStyle) {
    ctx.save();
    ctx.translate(x, y);
    const s = size / 24;
    ctx.scale(s, s);

    ctx.beginPath();
    ctx.moveTo(0, 6);
    ctx.bezierCurveTo(0, 2, -6, -10, -14, -10);
    ctx.bezierCurveTo(-24, -10, -24, 4, -24, 4);
    ctx.bezierCurveTo(-24, 14, -12, 22, 0, 30);
    ctx.bezierCurveTo(12, 22, 24, 14, 24, 4);
    ctx.bezierCurveTo(24, 4, 24, -10, 14, -10);
    ctx.bezierCurveTo(6, -10, 0, 2, 0, 6);
    ctx.closePath();

    if (fillStyle) {
      ctx.fillStyle = fillStyle;
      ctx.fill();
    }
    if (strokeStyle) {
      ctx.lineWidth = 2.4;
      ctx.strokeStyle = strokeStyle;
      ctx.stroke();
    }

    // Điểm sáng nhỏ trên tim đỏ
    ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
    ctx.beginPath();
    ctx.ellipse(-11, -2, 4, 2.2, -0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawBrokenHeartShape(x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    const s = size / 24;
    ctx.scale(s, s);

    // Thân tim màu xám
    ctx.beginPath();
    ctx.moveTo(0, 6);
    ctx.bezierCurveTo(0, 2, -6, -10, -14, -10);
    ctx.bezierCurveTo(-24, -10, -24, 4, -24, 4);
    ctx.bezierCurveTo(-24, 14, -12, 22, 0, 30);
    ctx.bezierCurveTo(12, 22, 24, 14, 24, 4);
    ctx.bezierCurveTo(24, 4, 24, -10, 14, -10);
    ctx.bezierCurveTo(6, -10, 0, 2, 0, 6);
    ctx.closePath();

    ctx.fillStyle = "#9e969c";
    ctx.fill();
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = "#6e666c";
    ctx.stroke();

    // Vết nứt zíc zắc ở giữa
    ctx.beginPath();
    ctx.moveTo(0, -4);
    ctx.lineTo(-5, 5);
    ctx.lineTo(4, 12);
    ctx.lineTo(-3, 21);
    ctx.lineTo(0, 29);
    ctx.strokeStyle = "#484146";
    ctx.lineWidth = 2.8;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();

    ctx.restore();
  }

  // Vẽ mắt hình ngôi sao 4 cánh lấp lánh
  function drawStarEye(cx, cy, size, color) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2;
      ctx.lineTo(Math.cos(a) * size, Math.sin(a) * size);
      const na = a + Math.PI / 4;
      ctx.lineTo(Math.cos(na) * (size * 0.36), Math.sin(na) * (size * 0.36));
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Vẽ nhân vật cục bông tròn màu hồng pastel (hoặc ảnh PNG nếu tồn tại)
  function drawPlayerCharacter() {
    const p = state.player;
    const bounceY = Math.sin(p.walkPhase) * 4.5;
    const squashX = 1 + Math.sin(p.walkPhase) * 0.04 + p.squish * 0.14;
    const squashY = 1 - Math.sin(p.walkPhase) * 0.04 - p.squish * 0.12;

    ctx.save();
    ctx.translate(p.x, p.y + bounceY);

    // Bóng đổ dưới chân
    ctx.fillStyle = "rgba(214, 69, 117, 0.16)";
    ctx.beginPath();
    ctx.ellipse(0, p.radius * 0.92 - bounceY, p.radius * 0.78, p.radius * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.scale(squashX, squashY);

    // Kiểm tra tùy chọn ảnh PNG (assets/images/player.png) nếu người dùng có bỏ vào
    const customPlayerAsset = preloadedImages.get(PLAYER_IMAGE_PATH);
    if (customPlayerAsset && customPlayerAsset.loaded) {
      const size = p.radius * 2.25;
      ctx.drawImage(customPlayerAsset.img, -size / 2, -size / 2, size, size);
      ctx.restore();
      return;
    }

    const r = p.radius;

    // 1. Hai tai nhỏ tròn phía trên
    const earOffsetX = r * 0.58;
    const earOffsetY = -r * 0.72;
    const earRadius = r * 0.34;

    [-1, 1].forEach((side) => {
      ctx.save();
      ctx.translate(side * earOffsetX, earOffsetY);
      ctx.rotate(side * 0.28);

      // Tai ngoài
      ctx.fillStyle = "#ffb3c9";
      ctx.strokeStyle = "#ff7aa2";
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.ellipse(0, 0, earRadius * 0.85, earRadius * 1.05, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Lòng tai hồng đậm hơn
      ctx.fillStyle = "#ff8fab";
      ctx.beginPath();
      ctx.ellipse(0, 1, earRadius * 0.45, earRadius * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 2. Thân cục bông tròn màu hồng pastel
    const grad = ctx.createRadialGradient(-r * 0.28, -r * 0.3, r * 0.15, 0, 0, r * 1.05);
    grad.addColorStop(0, "#ffe5ee");
    grad.addColorStop(0.65, "#ffb3c9");
    grad.addColorStop(1, "#ff94b4");

    ctx.fillStyle = grad;
    ctx.strokeStyle = "#ff7aa2";
    ctx.lineWidth = 2.8;

    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Chỏm bông nhỏ trên đỉnh đầu
    ctx.fillStyle = "#ffd6e4";
    ctx.beginPath();
    ctx.arc(0, -r * 0.92, r * 0.18, 0, Math.PI * 2);
    ctx.fill();

    // 3. Hai má hồng bầu bĩnh
    const isJoyful = ["happy", "wink", "grin", "heart_eyes", "kiss", "star_eyes", "cheer", "blush_shy", "determined"].includes(p.expression);
    const isSuperBlush = p.expression === "blush_shy";
    const blushColor = p.expression === "hurt" ? "rgba(180, 160, 180, 0.3)" : (isSuperBlush ? "rgba(255, 30, 90, 0.72)" : (isJoyful ? "rgba(255, 45, 110, 0.62)" : "rgba(255, 71, 126, 0.42)"));
    const blushR = isSuperBlush ? r * 0.25 : (isJoyful ? r * 0.22 : r * 0.19);
    ctx.fillStyle = blushColor;
    ctx.beginPath();
    ctx.ellipse(-r * 0.48, r * 0.08, blushR, r * 0.12, 0, 0, Math.PI * 2);
    ctx.ellipse(r * 0.48, r * 0.08, blushR, r * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Vạch má hồng e thẹn cho blush_shy
    if (isSuperBlush) {
      ctx.strokeStyle = "#ff2a6d";
      ctx.lineWidth = 1.6;
      [-1, 1].forEach((side) => {
        for (let l = -1; l <= 1; l++) {
          ctx.beginPath();
          ctx.moveTo(side * r * 0.48 + l * 4 - 3, r * 0.04);
          ctx.lineTo(side * r * 0.48 + l * 4 + 1, r * 0.12);
          ctx.stroke();
        }
      });
    }

    // 4. Hai mắt theo từng biểu cảm (đa dạng theo từng vòng)
    const eyeX = r * 0.32;
    const eyeY = -r * 0.08;
    const eyeR = Math.max(3.5, r * 0.11);

    if (p.expression === "happy") {
      // Hạnh phúc: 2 mắt cười tít cong trăng khuyết ^ ^
      ctx.strokeStyle = "#4a2538";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      [-1, 1].forEach((side) => {
        ctx.beginPath();
        ctx.arc(side * eyeX, eyeY + 2, eyeR * 1.15, Math.PI + 0.2, -0.2);
        ctx.stroke();
      });
    } else if (p.expression === "wink") {
      // Nháy mắt tinh nghịch 😉
      ctx.fillStyle = "#4a2538";
      ctx.beginPath();
      ctx.arc(-eyeX, eyeY, eyeR * 1.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(-eyeX - eyeR * 0.3, eyeY - eyeR * 0.3, eyeR * 0.42, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#4a2538";
      ctx.lineWidth = 3.2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(eyeX, eyeY + 1, eyeR * 1.1, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();

      drawStarEye(eyeX + 8, eyeY - 3, eyeR * 1.2, "#ffd166");
    } else if (p.expression === "grin") {
      // Cười tươi rạng rỡ 😄
      ctx.strokeStyle = "#4a2538";
      ctx.lineWidth = 3.2;
      ctx.lineCap = "round";
      [-1, 1].forEach((side) => {
        ctx.beginPath();
        ctx.arc(side * eyeX, eyeY + 2, eyeR * 1.1, Math.PI + 0.3, -0.3);
        ctx.stroke();
      });
    } else if (p.expression === "heart_eyes") {
      // Mắt trái tim đắm đuối 😍
      const heartPulse = 1 + Math.sin(p.walkPhase * 3) * 0.12;
      [-1, 1].forEach((side) => {
        drawHeartShape(side * eyeX, eyeY - 1, eyeR * 2.5 * heartPulse, "#ff2a6d", "#c2185b");
      });
    } else if (p.expression === "kiss") {
      // Chu môi ngọt ngào 😘
      ctx.strokeStyle = "#4a2538";
      ctx.lineWidth = 2.8;
      ctx.lineCap = "round";
      [-1, 1].forEach((side) => {
        ctx.beginPath();
        ctx.arc(side * eyeX, eyeY + 2, eyeR, Math.PI + 0.25, -0.25);
        ctx.stroke();
      });
      const kissHeartY = -r * 0.45 + Math.sin(p.walkPhase * 2.5) * 4;
      drawHeartShape(r * 0.38, kissHeartY, eyeR * 1.7, "#ff3366", null);
    } else if (p.expression === "star_eyes") {
      // Mắt ngôi sao lấp lánh 🤩
      const starPulse = 1 + Math.sin(p.walkPhase * 3.5) * 0.14;
      [-1, 1].forEach((side) => {
        drawStarEye(side * eyeX, eyeY, eyeR * 2.2 * starPulse, "#ffb703");
      });
    } else if (p.expression === "cheer") {
      // Háo hức reo hò 😃
      [-1, 1].forEach((side) => {
        ctx.fillStyle = "#4a2538";
        ctx.beginPath();
        ctx.arc(side * eyeX, eyeY - 1, eyeR * 1.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(side * eyeX - eyeR * 0.35, eyeY - eyeR * 0.35, eyeR * 0.45, 0, Math.PI * 2);
        ctx.arc(side * eyeX + eyeR * 0.35, eyeY + eyeR * 0.25, eyeR * 0.25, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (p.expression === "blush_shy") {
      // E thẹn nhìn liếc ngang 🥰
      [-1, 1].forEach((side) => {
        ctx.fillStyle = "#4a2538";
        ctx.beginPath();
        ctx.arc(side * eyeX + 2, eyeY, eyeR * 1.05, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(side * eyeX + 1, eyeY - eyeR * 0.3, eyeR * 0.4, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (p.expression === "determined") {
      // Quyết tâm bừng sáng ٩(ˊᗜˋ*)و
      ctx.strokeStyle = "#4a2538";
      ctx.lineWidth = 3.2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-eyeX - eyeR, eyeY + 2);
      ctx.lineTo(-eyeX + eyeR, eyeY - 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(eyeX + eyeR, eyeY + 2);
      ctx.lineTo(eyeX - eyeR, eyeY - 2);
      ctx.stroke();
      drawStarEye(0, -r * 0.4, eyeR * 1.4, "#ff70a6");
    } else if (p.expression === "hurt") {
      // Mếu / đau khi chạm tim vỡ 🥺
      ctx.strokeStyle = "#5a4852";
      ctx.lineWidth = 2.8;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-eyeX - eyeR, eyeY - eyeR);
      ctx.lineTo(-eyeX + eyeR * 0.5, eyeY);
      ctx.lineTo(-eyeX - eyeR, eyeY + eyeR);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(eyeX + eyeR, eyeY - eyeR);
      ctx.lineTo(eyeX - eyeR * 0.5, eyeY);
      ctx.lineTo(eyeX + eyeR, eyeY + eyeR);
      ctx.stroke();
      ctx.fillStyle = "#80d4ff";
      ctx.beginPath();
      ctx.arc(eyeX + eyeR + 3, eyeY + eyeR + 4, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Normal
      [-1, 1].forEach((side) => {
        ctx.fillStyle = "#4a2538";
        ctx.beginPath();
        ctx.arc(side * eyeX, eyeY, eyeR, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(side * eyeX - eyeR * 0.28, eyeY - eyeR * 0.3, eyeR * 0.36, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // 5. Miệng theo từng biểu cảm
    if (p.expression === "happy" || p.expression === "cheer") {
      ctx.fillStyle = "#e63968";
      ctx.strokeStyle = "#4a2538";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, r * 0.03, r * 0.2, 0.1, Math.PI - 0.1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#ffb3c9";
      ctx.beginPath();
      ctx.arc(0, r * 0.15, r * 0.11, Math.PI, 0);
      ctx.fill();
    } else if (p.expression === "wink") {
      ctx.strokeStyle = "#4a2538";
      ctx.lineWidth = 2.4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(r * 0.03, r * 0.05, r * 0.14, 0.15, Math.PI - 0.15);
      ctx.stroke();
    } else if (p.expression === "grin" || p.expression === "star_eyes" || p.expression === "determined") {
      ctx.fillStyle = "#e63968";
      ctx.strokeStyle = "#4a2538";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, r * 0.03, r * 0.24, 0.08, Math.PI - 0.08);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(-r * 0.11, r * 0.03, r * 0.22, r * 0.06);
    } else if (p.expression === "heart_eyes") {
      ctx.fillStyle = "#e63968";
      ctx.strokeStyle = "#4a2538";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.ellipse(0, r * 0.09, r * 0.09, r * 0.12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (p.expression === "kiss") {
      ctx.strokeStyle = "#4a2538";
      ctx.lineWidth = 2.6;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(0, r * 0.07, r * 0.08, -Math.PI * 0.5, Math.PI * 0.5);
      ctx.stroke();
    } else if (p.expression === "blush_shy") {
      ctx.strokeStyle = "#4a2538";
      ctx.lineWidth = 2.2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(-r * 0.05, r * 0.06, r * 0.07, 0, Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(r * 0.05, r * 0.06, r * 0.07, 0, Math.PI);
      ctx.stroke();
    } else if (p.expression === "hurt") {
      ctx.strokeStyle = "#4a2538";
      ctx.lineWidth = 2.4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(0, r * 0.16, r * 0.13, Math.PI + 0.35, -0.35);
      ctx.stroke();
    } else {
      ctx.strokeStyle = "#4a2538";
      ctx.lineWidth = 2.2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(0, r * 0.04, r * 0.14, 0.2, Math.PI - 0.2);
      ctx.stroke();
    }

    // 6. Hai tay nhỏ vẫy nhẹ (khi vui giơ cao hơn ăn mừng)
    const handLift = isJoyful ? -r * 0.12 : 0;
    const handY = r * 0.22 + handLift + Math.sin(p.walkPhase * 1.2) * 2.5;
    ctx.fillStyle = "#ffb3c9";
    ctx.strokeStyle = "#ff7aa2";
    ctx.lineWidth = 2.2;
    [-1, 1].forEach((side) => {
      ctx.beginPath();
      ctx.ellipse(side * r * 0.92, handY, r * 0.18, r * 0.14, side * (isJoyful ? 0.7 : 0.4), 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    // 7. Bong bóng cổ vũ / biểu cảm lơ lửng trên đỉnh đầu bé bông
    if (p.currentMood && p.expression !== "normal") {
      const bubbleY = -r * 1.58 + Math.sin(p.walkPhase * 2) * 3;
      const mood = p.currentMood;

      ctx.save();
      ctx.font = 'bold 13px "Quicksand", sans-serif';
      const textWidth = typeof ctx.measureText === "function" ? ctx.measureText(mood.text).width : (mood.text.length * 8);
      const bWidth = Math.max(86, textWidth + 22);
      const bHeight = 26;

      const bx = -bWidth / 2;
      const by = bubbleY - bHeight / 2;
      const br = 12;

      // Bong bóng nền tròn bo góc
      ctx.fillStyle = mood.bg;
      ctx.strokeStyle = mood.border;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(bx + br, by);
      ctx.lineTo(bx + bWidth - br, by);
      ctx.quadraticCurveTo(bx + bWidth, by, bx + bWidth, by + br);
      ctx.lineTo(bx + bWidth, by + bHeight - br);
      ctx.quadraticCurveTo(bx + bWidth, by + bHeight, bx + bWidth - br, by + bHeight);
      ctx.lineTo(bx + br, by + bHeight);
      ctx.quadraticCurveTo(bx, by + bHeight, bx, by + bHeight - br);
      ctx.lineTo(bx, by + br);
      ctx.quadraticCurveTo(bx, by, bx + br, by);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Mũi nhọn nhỏ hướng xuống đỉnh đầu
      ctx.beginPath();
      ctx.moveTo(-4, by + bHeight);
      ctx.lineTo(0, by + bHeight + 5);
      ctx.lineTo(4, by + bHeight);
      ctx.closePath();
      ctx.fillStyle = mood.bg;
      ctx.fill();
      ctx.stroke();

      // Chữ câu động viên
      ctx.fillStyle = mood.color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(mood.text, 0, bubbleY);
      ctx.restore();
    }

    ctx.restore();
  }

  function renderScene() {
    ctx.clearRect(0, 0, state.width, state.height);

    // Nền chuyển sắc pastel hồng/kem dịu mắt
    const bgGrad = ctx.createLinearGradient(0, 0, 0, state.height);
    bgGrad.addColorStop(0, "#fff8f3");
    bgGrad.addColorStop(0.55, "#ffe8f0");
    bgGrad.addColorStop(1, "#ffd5e3");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, state.width, state.height);

    ctx.save();

    // Hiệu ứng rung nhẹ màn hình khi chạm phải tim vỡ
    if (state.shakeTime > 0) {
      const dx = (Math.random() - 0.5) * state.shakeMagnitude * 2;
      const dy = (Math.random() - 0.5) * state.shakeMagnitude * 2;
      ctx.translate(dx, dy);
    }

    // 1. Vẽ mây trôi chậm
    for (const c of state.clouds) {
      drawCloud(c.x, c.y, c.scale, c.alpha);
    }

    // 2. Vẽ tim mờ trôi ở nền
    for (const h of state.bgHearts) {
      drawHeartShape(h.x, h.y, h.size, `rgba(255, 117, 159, ${h.alpha})`, null);
    }

    // 3. Vẽ mặt đất cỏ hồng kem dưới đáy
    ctx.fillStyle = "rgba(255, 194, 212, 0.45)";
    ctx.beginPath();
    ctx.ellipse(
      state.width / 2,
      state.height + 15,
      state.width * 0.72,
      Math.max(48, state.height * 0.08),
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // 4. Vẽ các tim đang rơi & nhân vật khi đang ở màn chơi
    if (state.mode === "playing" || state.mode === "pause" || state.mode === "levelClear") {
      for (const item of state.fallingItems) {
        if (item.type === "red") {
          drawHeartShape(item.x, item.y, item.radius, "#ff3e79", "#d91b5c");
        } else {
          drawBrokenHeartShape(item.x, item.y, item.radius);
        }
      }

      drawPlayerCharacter();

      // Vẽ hiệu ứng "pop"
      for (const p of state.popEffects) {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Vẽ chữ nổi (+1 ❤ / -1 💔)
      for (const ft of state.floatingTexts) {
        ctx.save();
        ctx.globalAlpha = ft.alpha;
        ctx.font = '700 18px "Baloo 2", sans-serif';
        ctx.fillStyle = ft.color;
        ctx.textAlign = "center";
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }
    }

    // 5. Vẽ pháo giấy / tim bay ở màn Chiến thắng
    if (state.mode === "victory" || state.mode === "album") {
      for (const p of state.confetti) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        if (p.isHeart) {
          drawHeartShape(0, 0, p.size * 1.1, p.color, null);
        } else {
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.65);
        }
        ctx.restore();
      }
    }

    ctx.restore();
  }

  // ==========================================================================
  // VÒNG LẶP GAME CHÍNH (REQUESTANIMATIONFRAME + DELTA TIME)
  // ==========================================================================
  let lastTimestamp = performance.now();

  function gameLoop(timestamp) {
    // Giới hạn dt tối đa 0.05s để tránh nhảy bước lớn khi chuyển tab
    const rawDt = (timestamp - lastTimestamp) / 1000;
    const dt = Math.min(0.05, Math.max(0.0001, rawDt));
    lastTimestamp = timestamp;
    const timeSec = timestamp / 1000;

    updateBackground(dt, timeSec);
    if (state.mode === "playing") {
      updateGameplay(dt, timeSec);
    }
    renderScene();

    window.requestAnimationFrame(gameLoop);
  }

  // ==========================================================================
  // KHỞI ĐỘNG ỨNG DỤNG
  // ==========================================================================
  function init() {
    loadProgress();
    handleResize();
    initBackgroundDecor();
    initAudio();
    bindEvents();
    preloadAllAssets();
    window.requestAnimationFrame((ts) => {
      lastTimestamp = ts;
      window.requestAnimationFrame(gameLoop);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
