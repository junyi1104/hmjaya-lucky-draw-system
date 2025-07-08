const canvas = document.getElementById("wheelcanvas");
const ctx = canvas.getContext("2d");

let names = JSON.parse(localStorage.getItem("names") || "[]");

function drawWheel() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const count = names.length;
    if (count === 0) return;
    const arcSize = (2 * Math.PI) / count;
    for (let i = 0; i < count; i++) {
        ctx.beginPath();
        ctx.moveTo(250, 250);
        ctx.fillStyle = `hsl(${i * 360 / count}, 70%, 70%)`;
        ctx.arc(250, 250, 250, i * arcSize, (i + 1) * arcSize);
        ctx.fill();
        ctx.fillStyle = "black";
        ctx.textAlign = "right";
        ctx.font = "16px Arial";
        ctx.save();
        ctx.translate(250, 250);
        ctx.rotate(i * arcSize + arcSize / 2);
        ctx.fillText(names[i], 240, 10);
        ctx.restore();
    }
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
    const winnerIndex = Math.floor(Math.random() * names.length);
    alert("🎉 Winner is: " + names[winnerIndex]);
}

drawWheel();

