// What Are We Eatin'? — a dinner spinner stacked with Long Island
// Italian-American classics. Tap the wheel, let fate (and nonna) decide.

const MEALS = [
	{
		label: "Chicken Cutlet Parm",
		name: "Chicken Cutlet Parm",
		emoji: "🍗",
		line: "Thin cutlet, thick attitude. Extra mutz, obviously.",
	},
	{
		label: "Penne alla Vodka",
		name: "Penne alla Vodka",
		emoji: "🍝",
		line: "Pink sauce for the pink-drink girlies. Iconic.",
	},
	{
		label: "Sunday Gravy",
		name: "Sunday Gravy & Meatballs",
		emoji: "🍅",
		line: "It's gravy, not sauce. We are NOT having this conversation again.",
	},
	{
		label: "Baked Ziti",
		name: "Baked Ziti",
		emoji: "🧀",
		line: "The crispy corner piece is yours. Nobody fights the corner piece.",
	},
	{
		label: "Shrimp Scampi",
		name: "Shrimp Scampi",
		emoji: "🍤",
		line: "Garlic for days. Cancel your plans, not your bread.",
	},
	{
		label: "Chicken Francese",
		name: "Chicken Francese",
		emoji: "🍋",
		line: "Lemony, buttery, done. Nonna nods in approval.",
	},
	{
		label: "Grandma Slice",
		name: "Grandma Slices",
		emoji: "🍕",
		line: "Thin, square, perfect — like nonna's advice.",
	},
	{
		label: "Stuffed Shells",
		name: "Stuffed Shells",
		emoji: "🐚",
		line: "Little ricotta pillows. Soft, but they'd defend you with their life.",
	},
	{
		label: "Eggplant Rollatini",
		name: "Eggplant Rollatini",
		emoji: "🍆",
		line: "Rolled tight, like the family stays. Don't ask questions.",
	},
	{
		label: "Lobster Ravioli",
		name: "Lobster Ravioli",
		emoji: "🦞",
		line: "Fancy tonight? Good. You deserve it, sweethaht.",
	},
];

const SLICE_COLORS = [
	"#f7a6b9",
	"#fdebc8",
	"#9fd3a6",
	"#fbd0da",
	"#f8e3b0",
	"#c6e8cb",
	"#f48fa8",
	"#fff3d6",
	"#7fc48a",
	"#fcdce4",
];

const SPIN_HINTS = [
	"Madonn', here we go…",
	"The wheel never lies…",
	"Hold ya hoops…",
	"Stirring the gravy…",
];

const ACCEPT_LINES = [
	"Say hi to the ghels for me.",
	"Tell ya mutha I said hi.",
	"Mangia, bestie. Mangia.",
	"Fuggedaboutit — dinner's handled.",
];

const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spin-btn");
const hint = document.getElementById("hint");
const resultOverlay = document.getElementById("result-overlay");
const acceptOverlay = document.getElementById("accept-overlay");

let rotation = Math.random() * Math.PI * 2; // current wheel angle (radians)
let spinning = false;
let cssSize = 0;

const ARC = (Math.PI * 2) / MEALS.length;
const POINTER_ANGLE = -Math.PI / 2; // pointer sits at 12 o'clock

function sizeCanvas() {
	cssSize = Math.min(window.innerWidth - 70, 440);
	const dpr = window.devicePixelRatio || 1;
	canvas.style.width = cssSize + "px";
	canvas.style.height = cssSize + "px";
	canvas.width = cssSize * dpr;
	canvas.height = cssSize * dpr;
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	draw();
}

function draw() {
	const r = cssSize / 2;
	ctx.clearRect(0, 0, cssSize, cssSize);
	ctx.save();
	ctx.translate(r, r);
	ctx.rotate(rotation);

	MEALS.forEach((meal, i) => {
		const start = i * ARC;
		// slice
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.arc(0, 0, r, start, start + ARC);
		ctx.closePath();
		ctx.fillStyle = SLICE_COLORS[i % SLICE_COLORS.length];
		ctx.fill();
		ctx.strokeStyle = "#fffdf8";
		ctx.lineWidth = 2;
		ctx.stroke();

		// label along the slice's middle radius
		ctx.save();
		ctx.rotate(start + ARC / 2);
		ctx.textAlign = "right";
		ctx.textBaseline = "middle";
		ctx.fillStyle = "#5b3644";
		const fontSize = Math.max(10, Math.round(cssSize * 0.028));
		ctx.font = "700 " + fontSize + "px 'Avenir Next', 'Segoe UI', sans-serif";
		ctx.fillText(meal.label, r - 14, 0);
		ctx.font = Math.round(fontSize * 1.5) + "px sans-serif";
		ctx.textAlign = "left";
		ctx.restore();
	});

	ctx.restore();
}

function winnerIndex() {
	// which slice currently sits under the pointer
	let angle = (POINTER_ANGLE - rotation) % (Math.PI * 2);
	if (angle < 0) angle += Math.PI * 2;
	return Math.floor(angle / ARC) % MEALS.length;
}

function spin() {
	if (spinning) return;
	spinning = true;
	spinBtn.disabled = true;
	hint.textContent = SPIN_HINTS[Math.floor(Math.random() * SPIN_HINTS.length)];

	const startRotation = rotation;
	const extraTurns = 4 + Math.random() * 3; // 4–7 full spins
	const target = startRotation + extraTurns * Math.PI * 2 + Math.random() * Math.PI * 2;
	const duration = 4200 + Math.random() * 800;
	const startTime = performance.now();

	function frame(now) {
		const t = Math.min(1, (now - startTime) / duration);
		const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
		rotation = startRotation + (target - startRotation) * eased;
		draw();
		if (t < 1) {
			requestAnimationFrame(frame);
		} else {
			spinning = false;
			spinBtn.disabled = false;
			showResult(MEALS[winnerIndex()]);
		}
	}
	requestAnimationFrame(frame);
}

function showResult(meal) {
	document.getElementById("result-emoji").textContent = meal.emoji;
	document.getElementById("result-name").textContent = meal.name;
	document.getElementById("result-line").textContent = meal.line;
	resultOverlay.classList.remove("hidden");
	hint.textContent = "";
	rainConfetti([meal.emoji, "🇮🇹", "💅", "✨", "❤️"]);
}

function rainConfetti(emojis) {
	for (let i = 0; i < 18; i++) {
		const bit = document.createElement("span");
		bit.className = "ds-confetti";
		bit.textContent = emojis[Math.floor(Math.random() * emojis.length)];
		bit.style.left = Math.random() * 100 + "%";
		bit.style.animationDuration = 2.2 + Math.random() * 2.2 + "s";
		bit.style.animationDelay = Math.random() * 0.8 + "s";
		document.body.appendChild(bit);
		setTimeout(() => bit.remove(), 6000);
	}
}

spinBtn.addEventListener("click", spin);
canvas.addEventListener("click", spin);

document.getElementById("again-btn").addEventListener("click", () => {
	resultOverlay.classList.add("hidden");
	hint.textContent = "No shame. Spin it back.";
});

document.getElementById("accept-btn").addEventListener("click", () => {
	resultOverlay.classList.add("hidden");
	document.getElementById("accept-line").textContent =
		ACCEPT_LINES[Math.floor(Math.random() * ACCEPT_LINES.length)];
	acceptOverlay.classList.remove("hidden");
});

document.getElementById("restart-btn").addEventListener("click", () => {
	acceptOverlay.classList.add("hidden");
	hint.textContent = "Tap the wheel. The wheel knows.";
});

window.addEventListener("resize", sizeCanvas);
sizeCanvas();
