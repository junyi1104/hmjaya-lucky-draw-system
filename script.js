const canvas = document.getElementById("wheelcanvas");
const ctx = canvas.getContext("2d");

let names = [];
let angle = 0;

function drawWheel() {
    const count = names.length;
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

function spinWheel() {
    if (names.length === 0) {
        alert("No names to draw.");
        return;
    }
    let winnerIndex = Math.floor(Math.random() * names.length);
    alert("Winner is: " + names[winnerIndex]);
}

fetch("names.txt")
    .then(res => res.text())
    .then(text => {
        names = text.trim().split("\n").filter(Boolean);
        drawWheel();
    });
