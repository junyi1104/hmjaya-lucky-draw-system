// ============================
// 🎯 Lucky Draw Main Script (With 中文注释)
// ============================

const canvas = document.getElementById("wheelcanvas");
const ctx = canvas.getContext("2d");

// 初始化数据：名单 & 中奖者
let names = JSON.parse(localStorage.getItem("names") || "[]");
let winners = JSON.parse(localStorage.getItem("winners") || "[]");

let currentAngle = 0;
let autoSpin = true;
let autoSpinId = null;
let spinSound = null;

// ============================
// 🚀 初始化页面
// ============================
(function initialize() {
  drawWheel();
  updateUserList();
  startAutoSpin();
  updateWinnerList();

  const titleEl = document.querySelector(".main-header h1");
  const savedTitle = localStorage.getItem("pageTitle");
  if (savedTitle) titleEl.textContent = savedTitle;

  // 🎨 标题颜色设置
  const colorPicker = document.getElementById("titleColorPicker");
  const savedColor = localStorage.getItem("titleColor");
  if (savedColor) {
    titleEl.style.color = savedColor;
    colorPicker.value = savedColor;
  }
  colorPicker?.addEventListener("input", () => {
    const newColor = colorPicker.value;
    titleEl.style.color = newColor;
    localStorage.setItem("titleColor", newColor);
  });

  // 🏆 中奖名单颜色
  const winnerList = document.getElementById("winner-list");
  const winnerColorPicker = document.getElementById("winnerFontColorPicker");
  const savedWinnerColor = localStorage.getItem("winnerFontColor");
  if (savedWinnerColor) {
    winnerList.style.color = savedWinnerColor;
    winnerList.querySelector("h3").style.color = savedWinnerColor;
    winnerColorPicker.value = savedWinnerColor;
  }
  winnerColorPicker?.addEventListener("input", () => {
    const newColor = winnerColorPicker.value;
    winnerList.style.color = newColor;
    winnerList.querySelector("h3").style.color = newColor;
    localStorage.setItem("winnerFontColor", newColor);
  });
})();

// ============================
// 🎨 绘制转盘
// ============================
function drawWheel(angle = 0) {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  canvas.width = width;
  canvas.height = height;
  ctx.clearRect(0, 0, width, height);

  const count = names.length;
  if (count === 0) return;

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(centerX, centerY) - 10;
  const arcSize = (2 * Math.PI) / count;

  for (let i = 0; i < count; i++) {
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.fillStyle = `hsl(${(i * 360) / count}, 70%, 70%)`;
    ctx.arc(0, 0, radius, i * arcSize, (i + 1) * arcSize);
    ctx.lineTo(0, 0);
    ctx.fill();

    ctx.fillStyle = "black";
    ctx.textAlign = "right";
    ctx.font = `${radius * 0.07}px Arial`;
    ctx.save();
    ctx.rotate(i * arcSize + arcSize / 2);
    ctx.fillText(names[i], radius - 10, 10);
    ctx.restore();
    ctx.restore();
  }

  // 指针
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.beginPath();
  ctx.moveTo(0, -radius * 0.88);
  ctx.lineTo(-20, -radius - 10);
  ctx.lineTo(20, -radius - 10);
  ctx.closePath();
  ctx.fillStyle = "red";
  ctx.fill();
  ctx.restore();
}

// ============================
// 👥 用户列表管理
// ============================
function updateUserList() {
  const userlist = document.getElementById("userlist");
  if (!userlist) return;

  let html = names.length === 0 ? "<em class='no-users'>No users</em>" : "<b>User List:</b><ul>";
  names.forEach((name, i) => {
    html += `<li><span>${name}</span><button onclick="removeUser(${i})">Remove</button></li>`;
  });
  html += names.length > 0 ? "</ul><button onclick='removeAllUsers()' style='margin-top:16px;background:#dc3545;'>Remove All</button>" : "";
  userlist.innerHTML = html;
}

function removeUser(index) {
  names.splice(index, 1);
  localStorage.setItem("names", JSON.stringify(names));
  drawWheel();
  updateUserList();
}

function removeAllUsers() {
    playClickSound(); // ✅ 添加点击音效
  if (confirm("Are you sure you want to remove all names?")) {
    names = [];
    localStorage.setItem("names", JSON.stringify(names));
    drawWheel();
    updateUserList();
  }
}

// ============================
// 🎰 抽奖逻辑
// ============================
function spinWheel() {
    playClickSound(); // ✅ 添加点击音效
    
  if (names.length === 0) return alert("No names to draw.");
  stopAutoSpin();
  playSpinSound();     // ✅ 播放转动音效

  const count = names.length;
  const arcSize = (2 * Math.PI) / count;
  const spins = 5 + Math.random() * 2;
  const extraRotation = Math.random() * 2 * Math.PI;
  const finalAngle = currentAngle + spins * 2 * Math.PI + extraRotation;

  const duration = 4000;
  const initialAngle = currentAngle;
  let start = null;

  function animateSpin(timestamp) {
    if (!start) start = timestamp;
    const elapsed = timestamp - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const angle = initialAngle + (finalAngle - initialAngle) * ease;
    drawWheel(angle);

    if (progress < 1) {
      requestAnimationFrame(animateSpin);
    } else {
      currentAngle = angle % (2 * Math.PI);
      stopSpinSound();  // ✅ 停止转动音效
      const pointerAngle = (1.5 * Math.PI - currentAngle + 2 * Math.PI) % (2 * Math.PI);
      const winnerIndex = Math.floor(pointerAngle / arcSize);
      const winnerName = names[winnerIndex];

      setTimeout(() => {
        showPopup(winnerName);
        names.splice(winnerIndex, 1);
        localStorage.setItem("names", JSON.stringify(names));
        winners.push(winnerName);
        localStorage.setItem("winners", JSON.stringify(winners));
        drawWheel();
        updateUserList();
        updateWinnerList();
      }, 100);
    }
  }
  requestAnimationFrame(animateSpin);
}

// ============================
// 🎵 音效 & 背景音乐控制
// ============================
function playClickSound() {
  const clickSound = new Audio("sound/click.mp3");
  clickSound.volume = 0.5;
  clickSound.play();
}

function toggleMusic() {
  const audio = document.getElementById("bgMusic");
  const btn = document.querySelector(".music-toggle-btn");
  if (!audio || !btn) return;

  if (audio.paused) {
    audio.play().then(() => btn.textContent = "🔊").catch(() => alert("Playback blocked"));
  } else {
    audio.pause();
    btn.textContent = "🔇";
  }
}

const volumeSlider = document.getElementById("volumeSlider");
const bgMusic = document.getElementById("bgMusic");
volumeSlider?.addEventListener("input", () => {
  if (bgMusic) bgMusic.volume = volumeSlider.value;
});

// ============================
// 🎉 弹窗 & 彩带
// ============================
function showPopup(winnerName) {
  const popup = document.getElementById("customPopup");
  const nameDisplay = document.getElementById("winnerNameDisplay");
  nameDisplay.textContent = winnerName;
  popup.classList.add("show");
  popup.classList.remove("hidden");
  const winSound = new Audio("sound/win.mp3");
  winSound.play();
  launchConfetti();
}

function closePopup() {
    playClickSound(); // ✅ 添加点击音效
  const popup = document.getElementById("customPopup");
  popup.classList.remove("show");
  setTimeout(() => popup.classList.add("hidden"), 300);
}

function launchConfetti() {
  const end = Date.now() + 2000;
  (function frame() {
    confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 } });
    confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 } });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

// ============================
// 📂 导入导出名单
// ============================
function exportNames() {
    playClickSound(); // ✅ 添加点击音效
  const blob = new Blob([names.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "names.txt";
  a.click();
  URL.revokeObjectURL(url);
}

function uploadNameList(event) {
    playClickSound(); // ✅ 添加点击音效
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const lines = e.target.result.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    let added = false;
    for (const line of lines) {
      if (!names.includes(line)) {
        names.push(line);
        added = true;
      }
    }
    if (added) {
      localStorage.setItem("names", JSON.stringify(names));
      drawWheel();
      updateUserList();
    }
  };
  reader.readAsText(file);
}

// ============================
// ✨ 其他功能
// ============================
function startAutoSpin() {
  autoSpin = true;
  function spin() {
    if (!autoSpin) return;
    currentAngle += 0.01;
    drawWheel(currentAngle);
    autoSpinId = requestAnimationFrame(spin);
  }
  spin();
}

function stopAutoSpin() {
  autoSpin = false;
  cancelAnimationFrame(autoSpinId);
}

function updateWinnerList() {
  const container = document.querySelector("#winner-list ul");
  if (!container) return;
  container.innerHTML = "";
  winners = JSON.parse(localStorage.getItem("winners") || "[]");
  winners.forEach((name, i) => {
    const li = document.createElement("li");
    li.textContent = `${i + 1}. ${name}`;
    container.appendChild(li);
  });
}

function clearWinners() {
  if (confirm("Are you sure you want to clear the winner list?")) {
    winners = [];
    localStorage.setItem("winners", JSON.stringify(winners));
    updateWinnerList();
  }
}

function insertName() {
  playClickSound();
  const input = document.getElementById("username");
  const name = input.value.trim();
  if (!name) return;
  if (names.includes(name)) {
    alert(`"${name}" is already added!`);
    input.value = "";
    return;
  }
  names.push(name);
  localStorage.setItem("names", JSON.stringify(names));
  input.value = "";
  drawWheel();
  updateUserList();
}

document.getElementById("username").addEventListener("keydown", function (e) {
  if (e.key === "Enter") insertName();
});

function updateLiveTitle(newTitle) {
  const title = document.querySelector(".main-header h1");
  if (title && newTitle.trim()) {
    title.textContent = newTitle.trim();
    localStorage.setItem("pageTitle", newTitle.trim());
  }
}

function uploadBackground(event) {
    playClickSound(); // ✅ 添加点击音效
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    document.body.style.backgroundImage = `url('${e.target.result}')`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundAttachment = "fixed";
  };
  reader.readAsDataURL(file);
}

function showAdminPanel() {
playClickSound(); // ✅ 添加点击音效
  document.getElementById("adminPanel").classList.add("show");
  document.querySelector(".admin-toggle-btn").style.display = "none";
}

function closeAdminPanel() {
    playClickSound(); // ✅ 添加点击音效
  document.getElementById("adminPanel").classList.remove("show");
  document.querySelector(".admin-toggle-btn").style.display = "block";
}

// 播放转盘音效
function playSpinSound() {
  spinSound = new Audio("sound/spin.mp3");
  spinSound.loop = true;  // 循环播放直到转盘停止
  spinSound.volume = 0.5;
  spinSound.play().catch(err => {
    console.warn("Spin sound autoplay blocked:", err);
  });
}

// 停止转盘音效
function stopSpinSound() {
  if (spinSound) {
    spinSound.pause();
    spinSound.currentTime = 0;
    spinSound = null;
  }
}
