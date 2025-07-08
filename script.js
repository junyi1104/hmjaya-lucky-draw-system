const canvas = document.getElementById("wheelcanvas");
const ctx = canvas.getContext("2d");

let names = JSON.parse(localStorage.getItem("names") || "[]");
let currentAngle = 0;
let autoSpin = true;
let autoSpinId = null;

function updateUserList() {
    const userlist = document.getElementById("userlist");
    if (!userlist) return;
    let html = "";
    if (names.length === 0) {
        html += "<em>No users</em>";
    } else {
        html += "<b>User List:</b><ul>";
        for (let i = 0; i < names.length; i++) {
            html += `
                <li>
                    <span>${names[i]}</span>
                    <button onclick="removeUser(${i})">Remove</button>
                </li>`;
        }
        html += "</ul>";
        html += `<button onclick="removeAllUsers()" style="margin-top:16px;background:#dc3545;">Remove All</button>`;
    }
    html += getTitleEditHtml();
    userlist.innerHTML = html;
}

function getTitleEditHtml() {
    const currentTitle = document.querySelector(".main-header h1")?.textContent || "";
    return `
        <div style="margin-top:24px;">
            <label for="editTitleInput"><b>Edit Title:</b></label><br>
            <input id="editTitleInput" type="text" value="${currentTitle.replace(/"/g, '&quot;')}" style="width:80%;padding:6px;margin-top:6px;">
            <button onclick="applyTitleEdit()" style="margin-left:8px;">Apply</button>
        </div>`;
}

function applyTitleEdit() {
    const input = document.getElementById("editTitleInput");
    const title = document.querySelector(".main-header h1");
    if (input && title) {
        const newTitle = input.value.trim();
        if (newTitle) title.textContent = newTitle;
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
    const radius = Math.min(centerX, centerY) - 10; // 留一点边距

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

        // 文字
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

document.getElementById("username").addEventListener("keydown", function(e) {
    if (e.key === "Enter") insertName();
});

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
    reader.onload = function(e) {
        document.body.style.backgroundImage = `url('${e.target.result}')`;
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundRepeat = "no-repeat";
        document.body.style.backgroundPosition = "center";
    };
    reader.readAsDataURL(file);
}

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

function spinWheel() {
    if (names.length === 0) {
        alert("No names to draw.");
        return;
    }

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
                document.getElementById("winner-name").innerText = winnerName;
            }, 100);
        }
    }

    requestAnimationFrame(animateSpin);
}

function toggleAdmin() {
    const userlist = document.getElementById("userlist");
    const panel = document.getElementById("adminPanel");

    const isVisible = userlist.style.display !== "none" && userlist.style.display !== "";
    userlist.style.display = isVisible ? "none" : "block";
    if (panel) panel.style.display = isVisible ? "none" : "flex";
}

function uploadNameList(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        const lines = content.split(/\r?\n/).map(line => line.trim()).filter(line => line);
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

(function setupUploadButton() {
    const hiddenInput = document.createElement("input");
    hiddenInput.type = "file";
    hiddenInput.accept = ".txt";
    hiddenInput.style.display = "none";
    hiddenInput.addEventListener("change", uploadNameList);
    document.body.appendChild(hiddenInput);

    const uploadBtn = document.getElementById("nameListUploadBtn");
    if (uploadBtn) {
        uploadBtn.onclick = function () {
            hiddenInput.value = "";
            hiddenInput.click();
        };
    }
})();

(function initializeWheelApp() {
    drawWheel();
    updateUserList();
    startAutoSpin();
})();
