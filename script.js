const canvas = document.getElementById("wheelcanvas");
const ctx = canvas.getContext("2d");

let names = JSON.parse(localStorage.getItem("names") || "[]");
let winners = JSON.parse(localStorage.getItem("winners") || "[]");

let currentAngle = 0;
let autoSpin = true;
let autoSpinId = null;

// ============================
// 初始化页面
// ============================
(function initializeWheelApp() {
    drawWheel();
    updateUserList();
    startAutoSpin();
    updateWinnerList();

    // 标题设置
    const titleEl = document.querySelector(".main-header h1");
    const savedTitle = localStorage.getItem("pageTitle");
    if (savedTitle && titleEl) titleEl.textContent = savedTitle;

    // 标题颜色设置
    const colorPicker = document.getElementById("titleColorPicker");
    const savedColor = localStorage.getItem("titleColor");
    if (savedColor && titleEl) {
        titleEl.style.color = savedColor;
        if (colorPicker) colorPicker.value = savedColor;
    }

    if (colorPicker) {
        colorPicker.addEventListener("input", () => {
            const newColor = colorPicker.value;
            if (titleEl) titleEl.style.color = newColor;
            localStorage.setItem("titleColor", newColor);
        });
    }

    // Winner List 字体颜色设置（含 h3）
    const winnerList = document.getElementById("winner-list");
    const winnerColorPicker = document.getElementById("winnerFontColorPicker");
    const savedWinnerColor = localStorage.getItem("winnerFontColor");

    // 新增：抓取 h3 元素
    const winnerListHeader = winnerList?.querySelector("h3");

    if (savedWinnerColor && winnerList) {
        winnerList.style.color = savedWinnerColor;
        if (winnerListHeader) winnerListHeader.style.color = savedWinnerColor;
        if (winnerColorPicker) winnerColorPicker.value = savedWinnerColor;
    }

    if (winnerColorPicker) {
        winnerColorPicker.addEventListener("input", () => {
            const newColor = winnerColorPicker.value;
            if (winnerList) winnerList.style.color = newColor;
            if (winnerListHeader) winnerListHeader.style.color = newColor;
            localStorage.setItem("winnerFontColor", newColor);
        });
    }
})();


// ============================
// 画转盘
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
// 用户管理
// ============================
function updateUserList() {
    const userlist = document.getElementById("userlist");
    if (!userlist) return;

    let html = names.length === 0 ? "<em>No users</em>" : "<b>User List:</b><ul>";
    names.forEach((name, i) => {
        html += `
            <li>
                <span>${name}</span>
                <button onclick="removeUser(${i})">Remove</button>
            </li>`;
    });

    if (names.length > 0) {
        html += "</ul>";
        html += `<button onclick="removeAllUsers()" style="margin-top:16px;background:#dc3545;">Remove All</button>`;
    }

    html += getTitleEditHtml();
    userlist.innerHTML = html;
}

function getTitleEditHtml() {
    const savedTitle = localStorage.getItem("pageTitle") || document.querySelector(".main-header h1")?.textContent || "";
    return `
        <div style="margin-top:24px;">
            <label for="editTitleInput"><b>编辑标题：</b></label><br>
            <input 
                id="editTitleInput" 
                type="text" 
                value="${savedTitle.replace(/"/g, '&quot;')}" 
                style="width:80%;padding:6px;margin-top:6px;"
                oninput="updateLiveTitle(this.value)" />
        </div>`;
}

function updateLiveTitle(newTitle) {
    const title = document.querySelector(".main-header h1");
    if (title && newTitle.trim()) {
        title.textContent = newTitle.trim();
        localStorage.setItem("pageTitle", newTitle.trim());
    }
}

function removeUser(index) {
    names.splice(index, 1);
    localStorage.setItem("names", JSON.stringify(names));
    drawWheel();
    updateUserList();
}

function removeAllUsers() {
    if (confirm("Are you sure you want to remove all names?")) {
        names = [];
        localStorage.setItem("names", JSON.stringify(names));
        drawWheel();
        updateUserList();
    }
}

// ============================
// 抽奖逻辑
// ============================
function spinWheel() {
    if (names.length === 0) return alert("No names to draw.");

    stopAutoSpin();
    const count = names.length;
    const arcSize = (2 * Math.PI) / count;
    const spins = 5 + Math.random() * 2;
    const extraRotation = Math.random() * 2 * Math.PI;
    const finalAngle = currentAngle + spins * 2 * Math.PI + extraRotation;

    let start = null;
    const duration = 4000;
    const initialAngle = currentAngle;

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
            const pointerAngle = (1.5 * Math.PI - currentAngle + 2 * Math.PI) % (2 * Math.PI);
            const winnerIndex = Math.floor(pointerAngle / arcSize);
            const winnerName = names[winnerIndex];

            setTimeout(() => {
                alert("🎯 Winner is: " + winnerName);
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
// 工具函数
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
    if (autoSpinId) {
        cancelAnimationFrame(autoSpinId);
        autoSpinId = null;
    }
}

function exportNames() {
    const content = names.join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "names.txt";
    a.click();
    URL.revokeObjectURL(url);
}

function uploadBackground(event) {
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

function updateWinnerList() {
    const container = document.querySelector("#winner-list");
    if (!container) return;
    let ul = container.querySelector("ul");
    if (!ul) {
        ul = document.createElement("ul");
        container.appendChild(ul);
    }
    winners = JSON.parse(localStorage.getItem("winners") || "[]");
    ul.innerHTML = "";
    winners.forEach(name => {
        const li = document.createElement("li");
        li.textContent = name;
        ul.appendChild(li);
    });
}

function clearWinners() {
    if (confirm("Are you sure you want to clear the winner list?")) {
        winners = [];
        localStorage.setItem("winners", JSON.stringify(winners));
        updateWinnerList();
    }
}

function toggleMusic() {
    const audio = document.getElementById("bgMusic");
    if (!audio) return;
    if (audio.paused) {
        audio.play().catch(() => alert("Auto-play blocked. Click again to enable music."));
    } else {
        audio.pause();
    }
}

// ============================
// 上传名单
// ============================
(function setupUploadButton() {
    const hiddenInput = document.createElement("input");
    hiddenInput.type = "file";
    hiddenInput.accept = ".txt";
    hiddenInput.style.display = "none";
    hiddenInput.addEventListener("change", uploadNameList);
    document.body.appendChild(hiddenInput);

    const uploadBtn = document.getElementById("nameListUploadBtn");
    if (uploadBtn) {
        uploadBtn.onclick = () => {
            hiddenInput.value = "";
            hiddenInput.click();
        };
    }
})();

function uploadNameList(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        const lines = e.target.result.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
        let added = false;
        for (const line of lines) {
            if (!names.some(n => n.toLowerCase() === line.toLowerCase())) {
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
// Admin Panel 控制
// ============================
function showAdminPanel() {
    document.getElementById("adminPanel").classList.add("show");
    document.querySelector(".admin-toggle-btn").style.display = "none";
}

function closeAdminPanel() {
    document.getElementById("adminPanel").classList.remove("show");
    document.querySelector(".admin-toggle-btn").style.display = "block";
}

// ============================
// 快捷添加用户（回车）
// ============================
document.getElementById("username").addEventListener("keydown", function (e) {
    if (e.key === "Enter") insertName();
});

function insertName() {
    const input = document.getElementById("username");
    const name = input.value.trim();
    if (!name) return;
    const exists = names.some(n => n.toLowerCase() === name.toLowerCase());
    if (exists) {
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


