const canvas = document.getElementById("wheelcanvas");
const ctx = canvas.getContext("2d");

let names = JSON.parse(localStorage.getItem("names") || "[]");
let currentAngle = 0;

function drawWheel(angle = 0) {
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
    names.push(name);
    localStorage.setItem("names", JSON.stringify(names));
    input.value = "";
    drawWheel();
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

function spinWheel() {
    if (names.length === 0) {
        alert("No names to draw.");
        return;
    }
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

drawWheel();
