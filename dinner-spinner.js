// What Are We Eatin'? — a dinner spinner with Long Island Italian-American
// classics, Trader Joe's freezer heroes, and a chaos mode that mixes both.
// Tap the wheel, let fate (and nonna, and Joe) decide.

const ITALIAN_MEALS = [
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

const TJS_MEALS = [
	{
		label: "Orange Chicken",
		name: "Mandarin Orange Chicken",
		emoji: "🍊",
		line: "The undefeated champ of the TJ's freezer. Respect the classic.",
	},
	{
		label: "Soup Dumplings",
		name: "Pork & Ginger Soup Dumplings",
		emoji: "🥟",
		line: "Six minutes to magic. Careful — they're basically lava.",
	},
	{
		label: "Tikka Masala",
		name: "Chicken Tikka Masala",
		emoji: "🍛",
		line: "The four-dollar masterpiece. Throw in the garlic naan, don't be a hero.",
	},
	{
		label: "Cauli Gnocchi",
		name: "Cauliflower Gnocchi",
		emoji: "🥦",
		line: "Pan-fry them crispy. The microwave route is a cry for help.",
	},
	{
		label: "Japchae",
		name: "Japchae Glass Noodles",
		emoji: "🍜",
		line: "Sweet, chewy, gone in four minutes flat.",
	},
	{
		label: "Kung Pao Chicken",
		name: "Kung Pao Chicken",
		emoji: "🌶️",
		line: "Spicy enough to feel alive, lazy enough to stay on the couch.",
	},
	{
		label: "Hatch Chile Mac",
		name: "Hatch Chile Mac & Cheese",
		emoji: "🧀",
		line: "Comfort food with a little attitude. Relatable.",
	},
	{
		label: "Butter Chicken",
		name: "Butter Chicken with Basmati",
		emoji: "🧈",
		line: "Rich, cozy, zero effort. The freezer provides.",
	},
	{
		label: "Fried Rice",
		name: "Vegetable Fried Rice",
		emoji: "🍚",
		line: "The loyal sidekick. Crack an egg on top and call it gourmet.",
	},
	{
		label: "Beef Birria",
		name: "Beef Birria",
		emoji: "🌮",
		line: "Dippable, droppable, unstoppable.",
	},
];

const CATEGORIES = {
	italian: { title: "Italian Night", meals: ITALIAN_MEALS },
	tjs: { title: "TJ's Freezer", meals: TJS_MEALS },
	all: { title: "Surprise Me", meals: ITALIAN_MEALS.concat(TJS_MEALS) },
};

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
	"Shaking the freezer aisle…",
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
const tabBar = document.getElementById("cat-tabs");

let activeCat = "italian";
try {
	if (CATEGORIES[localStorage.getItem("dinnerSpinner.cat")]) {
		activeCat = localStorage.getItem("dinnerSpinner.cat");
	}
} catch (e) {
	/* private mode etc. */
}

let rotation = Math.random() * Math.PI * 2; // current wheel angle (radians)
let spinning = false;
let cssSize = 0;

const TAU = Math.PI * 2;
const POINTER_ANGLE = -Math.PI / 2; // pointer sits at 12 o'clock

function activeMeals() {
	return CATEGORIES[activeCat].meals;
}

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
	const meals = activeMeals();
	const arc = TAU / meals.length;
	const r = cssSize / 2;
	ctx.clearRect(0, 0, cssSize, cssSize);
	ctx.save();
	ctx.translate(r, r);
	ctx.rotate(rotation);

	meals.forEach((meal, i) => {
		const start = i * arc;
		// slice
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.arc(0, 0, r, start, start + arc);
		ctx.closePath();
		ctx.fillStyle = SLICE_COLORS[i % SLICE_COLORS.length];
		ctx.fill();
		ctx.strokeStyle = "#fffdf8";
		ctx.lineWidth = 2;
		ctx.stroke();

		// label along the slice's middle radius
		ctx.save();
		ctx.rotate(start + arc / 2);
		ctx.textAlign = "right";
		ctx.textBaseline = "middle";
		ctx.fillStyle = "#5b3644";
		const scale = meals.length > 12 ? 0.023 : 0.028;
		const fontSize = Math.max(9, Math.round(cssSize * scale));
		ctx.font = "700 " + fontSize + "px 'Avenir Next', 'Segoe UI', sans-serif";
		ctx.fillText(meal.label, r - 14, 0);
		ctx.restore();
	});

	ctx.restore();
}

function winnerIndex() {
	// which slice currently sits under the pointer
	const arc = TAU / activeMeals().length;
	let angle = (POINTER_ANGLE - rotation) % TAU;
	if (angle < 0) angle += TAU;
	return Math.floor(angle / arc) % activeMeals().length;
}

function spin() {
	if (spinning) return;
	spinning = true;
	spinBtn.disabled = true;
	hint.textContent = SPIN_HINTS[Math.floor(Math.random() * SPIN_HINTS.length)];

	const startRotation = rotation;
	const extraTurns = 4 + Math.random() * 3; // 4–7 full spins
	const target = startRotation + extraTurns * TAU + Math.random() * TAU;
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
			showResult(activeMeals()[winnerIndex()]);
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

function setCategory(cat) {
	if (spinning || !CATEGORIES[cat]) return;
	activeCat = cat;
	try {
		localStorage.setItem("dinnerSpinner.cat", cat);
	} catch (e) {
		/* play without saving */
	}
	[...tabBar.children].forEach((btn) =>
		btn.classList.toggle("active", btn.dataset.cat === cat)
	);
	draw();
}

[...tabBar.children].forEach((btn) =>
	btn.addEventListener("click", () => setCategory(btn.dataset.cat))
);

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
setCategory(activeCat);
sizeCanvas();
