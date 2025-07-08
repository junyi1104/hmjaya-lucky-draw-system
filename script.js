const canvas = document.getElementById("wheelcanvas");
const ctx = canvas.getContext("2d");

let names = JSON.parse(localStorage.getItem("names") || "[]");
let currentAngle = 0;
let autoSpin = true;
let autoSpinId = null;
let bgImage = null;

function updateUserList() {
    const userlist = document.getElementById("userlist");
    if (!userlist) return;
    if (names.length === 0) {
        userlist.innerHTML = "<em>No users</em>";
        // Add title edit UI even if no users
        userlist.innerHTML += getTitleEditHtml();
        return;
    }
    userlist.innerHTML = "<b>User List:</b><ul>";
    for (let i = 0; i < names.length; i++) {
        userlist.innerHTML +=
            `<li>
                <span>${names[i]}</span>
                <button onclick="removeUser(${i})">Remove</button>
            </li>`;
    }
    userlist.innerHTML += "</ul>";
    userlist.innerHTML += getTitleEditHtml();
}

function getTitleEditHtml() {
    const currentTitle = document.querySelector(".main-header h1")?.textContent || "";
    return `
        <div style="margin-top:24px;">
            <label for="editTitleInput"><b>Edit Title:</b></label><br>
            <input id="editTitleInput" type="text" value="${currentTitle.replace(/"/g, '&quot;')}" style="width:80%;padding:6px;margin-top:6px;">
            <button onclick="applyTitleEdit()" style="margin-left:8px;">Apply</button>
        </div>
    `;
}

function applyTitleEdit() {
    const input = document.getElementById("editTitleInput");
    const title = document.querySelector(".main-header h1");
    if (input && title) {
        const newTitle = input.value.trim();
        if (newTitle) {
            title.textContent = newTitle;
        }
    }
}

function removeUser(index) {
    names.splice(index, 1);
    localStorage.setItem("names", JSON.stringify(names));
    drawWheel();
    updateUserList();
}

function drawWheel(angle = 0) {
    // Make canvas transparent by not filling the background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const count = names.length;
    if (count === 0) return;
    const arcSize = (2 * Math.PI) / count;
    for (let i = 0; i < count; i++) {
        ctx.save();
        ctx.translate(250, 250);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.fillStyle = `hsl(${i * 360 / count}, 70%, 70%)`;
        ctx.arc(0, 0, 250, i * arcSize, (i + 1) * arcSize);
        ctx.lineTo(0, 0);
        ctx.fill();
        ctx.fillStyle = "black";
        ctx.textAlign = "right";
        ctx.font = "16px Arial";
        ctx.save();
        ctx.rotate(i * arcSize + arcSize / 2);
        ctx.fillText(names[i], 240, 10);
        ctx.restore();
        ctx.restore();
    }
    // Draw pointer
    ctx.save();
    ctx.translate(250, 250);
    ctx.beginPath();
    ctx.moveTo(0, -220);
    ctx.lineTo(-20, -260);
    ctx.lineTo(20, -260);
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

// Add this event listener to allow "Enter" key to insert name
document.getElementById("username").addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        insertName();
    }
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
        // Set website background instead of canvas background
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
        currentAngle += 0.01; // Slow rotation
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
    const winnerIndex = Math.floor(Math.random() * count);

    // Calculate final angle so the winner lands at the pointer (top)
    const randomTurns = 5 + Math.random() * 2; // 5-7 spins
    const finalAngle = (2 * Math.PI * randomTurns) - (winnerIndex * arcSize + arcSize / 2);

    let start = null;
    const duration = 4000; // ms
    let lastAngle = currentAngle;

    function animateSpin(timestamp) {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out
        const ease = 1 - Math.pow(1 - progress, 3);
        const angle = lastAngle + (finalAngle - lastAngle) * ease;
        drawWheel(angle);
        if (progress < 1) {
            requestAnimationFrame(animateSpin);
        } else {
            currentAngle = angle % (2 * Math.PI);
            setTimeout(() => {
                alert("🎉 Winner is: " + names[winnerIndex]);
            }, 100);
        }
    }
    requestAnimationFrame(animateSpin);
}

function toggleAdmin() {
    // Show/hide the user list box inside the main-flex, not a pop out box
    const userlist = document.getElementById("userlist");
    if (userlist.style.display === "none" || userlist.style.display === "") {
        userlist.style.display = "block";
    } else {
        userlist.style.display = "none";
    }
}

// Initial draw and start auto-spin on load
drawWheel();
updateUserList();
startAutoSpin();


// Initial draw and start auto-spin on load
drawWheel();
updateUserList();
startAutoSpin();
// Initial draw and start auto-spin on load
drawWheel();
updateUserList();
startAutoSpin();
