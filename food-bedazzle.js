// Food Bedazzle — a diamond-painting / color-by-number game where every
// canvas is a snack. Pick a numbered color, tap or drag over the matching
// numbered cells, and each one fills in as a shiny little gem.

const PUZZLES = [
	{
		id: "ramen",
		name: "Ramen Bowl",
		emoji: "🍜",
		winTitle: "Ramen, coming right up!",
		winMessage: "Steamy broth, jammy egg, chewy noodles… you can almost smell it. Maybe grab a warm bite?",
		palette: {
			w: { color: "#c9d8e4", name: "steam" },
			b: { color: "#e08a2e", name: "broth" },
			n: { color: "#f7d154", name: "noodles" },
			e: { color: "#fdf3da", name: "egg white" },
			y: { color: "#ffb300", name: "yolk" },
			g: { color: "#6fbf4a", name: "green onion" },
			p: { color: "#f48fb1", name: "naruto" },
			r: { color: "#d64545", name: "bowl" },
			d: { color: "#a02f2f", name: "bowl shadow" },
			s: { color: "#ffffff", name: "stripe" },
		},
		grid: [
			"....w....w......",
			"...w....w....w..",
			"....w....w....w.",
			"................",
			".bbbbgbbbbpbbbb.",
			".bgnnneyyennpnb.",
			".bnnneeyyeennnb.",
			".rrrrrrrrrrrrrr.",
			"..rrssssssssrr..",
			"..rrrrrrrrrrrr..",
			"...rrrrrrrrrr...",
			"....dddddddd....",
			"......rrrr......",
			".....dddddd.....",
		],
	},
	{
		id: "pancakes",
		name: "Pancake Stack",
		emoji: "🥞",
		winTitle: "Pancakes are served!",
		winMessage: "Butter melting, syrup dripping down every layer… breakfast-for-dinner sounds pretty good right now.",
		palette: {
			u: { color: "#ffe082", name: "butter" },
			s: { color: "#b5651d", name: "syrup" },
			r: { color: "#e53950", name: "strawberry" },
			p: { color: "#f2b04e", name: "pancake" },
			k: { color: "#d18f35", name: "toasty edge" },
			t: { color: "#eef4f8", name: "plate" },
			m: { color: "#b9cdd8", name: "plate shadow" },
		},
		grid: [
			"...rr..uu.......",
			"...rr.ssss......",
			"..ssssssssssss..",
			".ppsppsppsppspp.",
			".pppppppppppppp.",
			".kkkkkkkkkkkkkk.",
			".pppppppppppppp.",
			".kkkkkkkkkkkkkk.",
			".pppppppppppppp.",
			"tttttttttttttttt",
			".tttttttttttttt.",
			"....mmmmmmmm....",
		],
	},
	{
		id: "boba",
		name: "Boba Milk Tea",
		emoji: "🧋",
		winTitle: "Boba achieved!",
		winMessage: "Chewy pearls, creamy milk tea, big fat straw. This one you could literally go order.",
		palette: {
			p: { color: "#f06292", name: "straw" },
			u: { color: "#b3e5fc", name: "cup rim" },
			m: { color: "#e5b77e", name: "milk tea" },
			h: { color: "#fff4e0", name: "shine" },
			b: { color: "#4e342e", name: "pearls" },
		},
		grid: [
			"......pp....",
			"......pp....",
			".uuuuppuuuu.",
			".mmmmmmmmmm.",
			".mhmmmmmmmm.",
			".mhmmmmmmmm.",
			".mmmmmmmmmm.",
			".mmmmmmmmmm.",
			".mbmmbmmbmm.",
			".mmbmmbmmbm.",
			".bbmbbmbbmb.",
			"..bbbbbbbb..",
		],
	},
	{
		id: "strawberry",
		name: "Big Strawberry",
		emoji: "🍓",
		winTitle: "Berry nice!",
		winMessage: "Shiny, juicy, and covered in sparkles. Fruit counts as a snack — go steal a few from the fridge.",
		palette: {
			g: { color: "#57a846", name: "leaves" },
			r: { color: "#e53950", name: "berry" },
			d: { color: "#b71c3a", name: "shaded side" },
			s: { color: "#ffe082", name: "seeds" },
			w: { color: "#ff8fa3", name: "shine" },
		},
		grid: [
			"....g.gg.g....",
			".....gggg.....",
			"...gggggggg...",
			"..rrrrggrrrr..",
			".rrrrrrrrrrdd.",
			".rwrrsrrsrrdd.",
			".rwrrrrrrrrdd.",
			".rrsrrrsrrsdd.",
			".rrrrrrrrrrdd.",
			"..rrsrrrsrdd..",
			"..rrrrrrrrrd..",
			"...rrrsrrrd...",
			"....rrrrrr....",
			"......rr......",
		],
	},
	{
		id: "pizza",
		name: "Pizza Slice",
		emoji: "🍕",
		winTitle: "Pizza time!",
		winMessage: "Melty cheese, pepperoni, a little basil… somebody's ordering a slice tonight, right?",
		palette: {
			c: { color: "#d99a4e", name: "crust" },
			h: { color: "#f9c744", name: "cheese" },
			p: { color: "#d0393e", name: "pepperoni" },
			g: { color: "#4f9b45", name: "basil" },
		},
		grid: [
			"cccccccccccccccc",
			"hhhhhhhhhhhhhhhh",
			".hhpphhhhhpphhh.",
			".hhpphhghhpphhh.",
			"..hhhhhhhhhhhh..",
			"..hhhhpphhghhh..",
			"...hhhhpphhhh...",
			"....hhhhhhhh....",
			"....hghhhpph....",
			".....hhhhhh.....",
			"......hhhh......",
			".......hh.......",
		],
	},
	{
		id: "sushi",
		name: "Sushi Set",
		emoji: "🍣",
		winTitle: "Omakase complete!",
		winMessage: "One perfect nigiri, one perfect roll. Tiny food is the most tempting food — go find a bite.",
		palette: {
			s: { color: "#fa8072", name: "salmon" },
			w: { color: "#fff9f0", name: "rice" },
			n: { color: "#2e4034", name: "nori" },
			t: { color: "#9fd8cb", name: "plate" },
		},
		grid: [
			".sssssss........",
			".sssssss..nnnn..",
			".wwwwwww.nnnnnn.",
			".wwwwwww.nwwwwn.",
			"..wwwww..nwsswn.",
			".........nwwwwn.",
			"..........nnnn..",
			"tttttttttttttttt",
			"..tttttttttttt..",
		],
	},
];

// ---------- state ----------

const state = {
	puzzle: null,
	filled: new Set(), // "col,row" keys
	selectedChar: null,
	cellSize: 0,
	dragging: false,
	particles: [],
	wrongFlashes: new Map(), // key -> timestamp
	animating: false,
};

const menuScreen = document.getElementById("menu-screen");
const gameScreen = document.getElementById("game-screen");
const menuGrid = document.getElementById("menu-grid");
const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const paletteEl = document.getElementById("palette");
const progressFill = document.getElementById("progress-fill");
const progressLabel = document.getElementById("progress-label");
const puzzleTitle = document.getElementById("puzzle-title");
const winOverlay = document.getElementById("win-overlay");
const emojiRain = document.getElementById("emoji-rain");

// ---------- helpers ----------

function cellKey(col, row) {
	return col + "," + row;
}

function puzzleCells(puzzle) {
	const cells = [];
	puzzle.grid.forEach((rowStr, row) => {
		for (let col = 0; col < rowStr.length; col++) {
			if (rowStr[col] !== ".") cells.push({ col, row, ch: rowStr[col] });
		}
	});
	return cells;
}

function paletteChars(puzzle) {
	// stable numbering: order palette keys as declared
	return Object.keys(puzzle.palette);
}

function storageKey(puzzle) {
	return "foodBedazzle." + puzzle.id;
}

function saveProgress() {
	const data = { filled: [...state.filled] };
	try {
		localStorage.setItem(storageKey(state.puzzle), JSON.stringify(data));
	} catch (e) {
		/* private mode etc. — play without saving */
	}
}

function loadProgress(puzzle) {
	try {
		const raw = localStorage.getItem(storageKey(puzzle));
		if (!raw) return new Set();
		return new Set(JSON.parse(raw).filled || []);
	} catch (e) {
		return new Set();
	}
}

function shadeColor(hex, amt) {
	// amt in [-1, 1]: negative darkens, positive lightens toward white
	const num = parseInt(hex.slice(1), 16);
	let r = (num >> 16) & 255;
	let g = (num >> 8) & 255;
	let b = num & 255;
	if (amt >= 0) {
		r = Math.round(r + (255 - r) * amt);
		g = Math.round(g + (255 - g) * amt);
		b = Math.round(b + (255 - b) * amt);
	} else {
		r = Math.round(r * (1 + amt));
		g = Math.round(g * (1 + amt));
		b = Math.round(b * (1 + amt));
	}
	return "rgb(" + r + "," + g + "," + b + ")";
}

// ---------- menu ----------

function isComplete(puzzle, filledSet) {
	return filledSet.size >= puzzleCells(puzzle).length;
}

function buildMenu() {
	menuGrid.innerHTML = "";
	PUZZLES.forEach((puzzle) => {
		const filled = loadProgress(puzzle);
		const total = puzzleCells(puzzle).length;
		const pct = Math.round((filled.size / total) * 100);
		const done = filled.size >= total;

		const card = document.createElement("div");
		card.className = "fb-card" + (done ? " done" : "");
		card.innerHTML =
			'<div class="fb-card-emoji">' + puzzle.emoji + "</div>" +
			'<div class="fb-card-name">' + puzzle.name + "</div>" +
			'<div class="fb-card-status">' +
			(done ? "Bedazzled ✨" : pct > 0 ? pct + "% sparkly" : total + " gems") +
			"</div>";
		card.addEventListener("click", () => startPuzzle(puzzle));
		menuGrid.appendChild(card);
	});
}

// ---------- game setup ----------

function startPuzzle(puzzle) {
	state.puzzle = puzzle;
	state.filled = loadProgress(puzzle);
	state.particles = [];
	state.wrongFlashes.clear();

	menuScreen.classList.add("hidden");
	gameScreen.classList.remove("hidden");
	winOverlay.classList.add("hidden");

	puzzleTitle.textContent = puzzle.emoji + " " + puzzle.name;

	sizeCanvas();
	buildPalette();
	autoSelectColor();
	updateProgress();
	draw();
}

function sizeCanvas() {
	const puzzle = state.puzzle;
	const cols = puzzle.grid[0].length;
	const rows = puzzle.grid.length;
	const maxW = Math.min(window.innerWidth - 48, 520);
	const maxH = window.innerHeight * 0.52;
	state.cellSize = Math.floor(Math.min(maxW / cols, maxH / rows));
	const cssW = state.cellSize * cols;
	const cssH = state.cellSize * rows;
	const dpr = window.devicePixelRatio || 1;
	canvas.style.width = cssW + "px";
	canvas.style.height = cssH + "px";
	canvas.width = cssW * dpr;
	canvas.height = cssH * dpr;
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function buildPalette() {
	const puzzle = state.puzzle;
	paletteEl.innerHTML = "";
	paletteChars(puzzle).forEach((ch, i) => {
		const entry = puzzle.palette[ch];
		const btn = document.createElement("button");
		btn.className = "fb-swatch";
		btn.dataset.ch = ch;
		btn.style.background = entry.color;
		btn.title = entry.name;
		const dark = isDarkColor(entry.color);
		btn.style.color = dark ? "#fff" : "#4a3626";
		btn.innerHTML = '<span class="num">' + (i + 1) + '</span><span class="left"></span>';
		btn.addEventListener("click", () => {
			if (remainingFor(ch) === 0) return;
			state.selectedChar = ch;
			refreshPalette();
			draw();
		});
		paletteEl.appendChild(btn);
	});
	refreshPalette();
}

function isDarkColor(hex) {
	const num = parseInt(hex.slice(1), 16);
	const r = (num >> 16) & 255;
	const g = (num >> 8) & 255;
	const b = num & 255;
	return r * 0.299 + g * 0.587 + b * 0.114 < 150;
}

function remainingFor(ch) {
	let remaining = 0;
	puzzleCells(state.puzzle).forEach((cell) => {
		if (cell.ch === ch && !state.filled.has(cellKey(cell.col, cell.row))) remaining++;
	});
	return remaining;
}

function refreshPalette() {
	[...paletteEl.children].forEach((btn) => {
		const ch = btn.dataset.ch;
		const remaining = remainingFor(ch);
		btn.querySelector(".left").textContent = remaining === 0 ? "done" : remaining + " left";
		btn.classList.toggle("complete", remaining === 0);
		btn.classList.toggle("selected", ch === state.selectedChar);
	});
}

function autoSelectColor() {
	const chars = paletteChars(state.puzzle);
	if (state.selectedChar && remainingFor(state.selectedChar) > 0 && chars.includes(state.selectedChar)) return;
	state.selectedChar = chars.find((ch) => remainingFor(ch) > 0) || null;
	refreshPalette();
}

// ---------- drawing ----------

function draw() {
	const puzzle = state.puzzle;
	if (!puzzle) return;
	const size = state.cellSize;
	const cols = puzzle.grid[0].length;
	const rows = puzzle.grid.length;
	const chars = paletteChars(puzzle);

	ctx.clearRect(0, 0, cols * size, rows * size);

	const now = performance.now();

	for (let row = 0; row < rows; row++) {
		for (let col = 0; col < cols; col++) {
			const ch = puzzle.grid[row][col];
			if (ch === ".") continue;
			const x = col * size;
			const y = row * size;
			const key = cellKey(col, row);
			const color = puzzle.palette[ch].color;

			if (state.filled.has(key)) {
				drawGem(x, y, size, color);
			} else {
				// pale hint of the color + its number
				ctx.fillStyle = "#fffdf8";
				ctx.fillRect(x, y, size, size);
				ctx.globalAlpha = 0.16;
				ctx.fillStyle = color;
				ctx.fillRect(x, y, size, size);
				ctx.globalAlpha = 1;

				const selected = ch === state.selectedChar;
				ctx.strokeStyle = selected ? "#c79a6b" : "#eadfce";
				ctx.lineWidth = selected ? 1.6 : 1;
				ctx.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);

				ctx.fillStyle = selected ? "#8a5a2e" : "#b6a68f";
				ctx.font = (selected ? "700 " : "500 ") + Math.floor(size * 0.45) + "px sans-serif";
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";
				ctx.fillText(chars.indexOf(ch) + 1, x + size / 2, y + size / 2 + 1);
			}

			const flashAt = state.wrongFlashes.get(key);
			if (flashAt !== undefined) {
				const age = now - flashAt;
				if (age < 450) {
					ctx.globalAlpha = 0.5 * (1 - age / 450);
					ctx.fillStyle = "#e53950";
					ctx.fillRect(x, y, size, size);
					ctx.globalAlpha = 1;
				} else {
					state.wrongFlashes.delete(key);
				}
			}
		}
	}

	drawParticles(now);
}

function drawGem(x, y, size, color) {
	const pad = Math.max(1, size * 0.06);
	const gx = x + pad;
	const gy = y + pad;
	const gs = size - pad * 2;
	const r = gs * 0.25;

	// base
	ctx.beginPath();
	roundedRect(gx, gy, gs, gs, r);
	ctx.fillStyle = color;
	ctx.fill();

	// darker lower-right facet
	ctx.save();
	ctx.beginPath();
	roundedRect(gx, gy, gs, gs, r);
	ctx.clip();
	ctx.beginPath();
	ctx.moveTo(gx + gs, gy);
	ctx.lineTo(gx + gs, gy + gs);
	ctx.lineTo(gx, gy + gs);
	ctx.closePath();
	ctx.fillStyle = shadeColor(color, -0.18);
	ctx.fill();

	// lighter top-left facet
	ctx.beginPath();
	ctx.moveTo(gx, gy);
	ctx.lineTo(gx + gs * 0.62, gy);
	ctx.lineTo(gx, gy + gs * 0.62);
	ctx.closePath();
	ctx.fillStyle = shadeColor(color, 0.28);
	ctx.fill();

	// sparkle dot
	ctx.beginPath();
	ctx.arc(gx + gs * 0.3, gy + gs * 0.3, Math.max(1, gs * 0.09), 0, Math.PI * 2);
	ctx.fillStyle = "rgba(255,255,255,0.9)";
	ctx.fill();
	ctx.restore();
}

function roundedRect(x, y, w, h, r) {
	ctx.moveTo(x + r, y);
	ctx.arcTo(x + w, y, x + w, y + h, r);
	ctx.arcTo(x + w, y + h, x, y + h, r);
	ctx.arcTo(x, y + h, x, y, r);
	ctx.arcTo(x, y, x + w, y, r);
	ctx.closePath();
}

// ---------- sparkle particles ----------

function spawnSparkles(col, row, color) {
	const size = state.cellSize;
	const cx = col * size + size / 2;
	const cy = row * size + size / 2;
	for (let i = 0; i < 5; i++) {
		const angle = Math.random() * Math.PI * 2;
		const speed = size * (0.02 + Math.random() * 0.05);
		state.particles.push({
			x: cx,
			y: cy,
			vx: Math.cos(angle) * speed,
			vy: Math.sin(angle) * speed - size * 0.02,
			life: 1,
			color: Math.random() < 0.5 ? "#fff" : color,
			r: size * (0.05 + Math.random() * 0.08),
		});
	}
	requestAnimation();
}

function drawParticles(now) {
	state.particles = state.particles.filter((p) => p.life > 0);
	state.particles.forEach((p) => {
		p.x += p.vx;
		p.y += p.vy;
		p.vy += state.cellSize * 0.004;
		p.life -= 0.04;
		ctx.globalAlpha = Math.max(0, p.life);
		ctx.fillStyle = p.color;
		ctx.beginPath();
		ctx.arc(p.x, p.y, Math.max(0, p.r * p.life), 0, Math.PI * 2);
		ctx.fill();
	});
	ctx.globalAlpha = 1;
}

function requestAnimation() {
	if (state.animating) return;
	state.animating = true;
	function tick() {
		draw();
		if (state.particles.length > 0 || state.wrongFlashes.size > 0) {
			requestAnimationFrame(tick);
		} else {
			state.animating = false;
		}
	}
	requestAnimationFrame(tick);
}

// ---------- interaction ----------

function cellAt(evt) {
	const rect = canvas.getBoundingClientRect();
	const col = Math.floor((evt.clientX - rect.left) / state.cellSize);
	const row = Math.floor((evt.clientY - rect.top) / state.cellSize);
	const puzzle = state.puzzle;
	if (row < 0 || row >= puzzle.grid.length) return null;
	if (col < 0 || col >= puzzle.grid[0].length) return null;
	return { col, row, ch: puzzle.grid[row][col] };
}

function tryFill(cell, isTap) {
	if (!cell || cell.ch === "." || !state.selectedChar) return;
	const key = cellKey(cell.col, cell.row);
	if (state.filled.has(key)) return;

	if (cell.ch !== state.selectedChar) {
		// only complain on a deliberate tap, not while sweeping a drag
		if (isTap) {
			state.wrongFlashes.set(key, performance.now());
			requestAnimation();
		}
		return;
	}

	state.filled.add(key);
	spawnSparkles(cell.col, cell.row, state.puzzle.palette[cell.ch].color);
	saveProgress();
	refreshPalette();
	updateProgress();
	draw();

	if (remainingFor(state.selectedChar) === 0) autoSelectColor();
	if (isComplete(state.puzzle, state.filled)) setTimeout(showWin, 450);
}

canvas.addEventListener("pointerdown", (evt) => {
	evt.preventDefault();
	state.dragging = true;
	canvas.setPointerCapture(evt.pointerId);
	tryFill(cellAt(evt), true);
});

canvas.addEventListener("pointermove", (evt) => {
	if (!state.dragging) return;
	evt.preventDefault();
	tryFill(cellAt(evt), false);
});

["pointerup", "pointercancel"].forEach((type) =>
	canvas.addEventListener(type, () => {
		state.dragging = false;
	})
);

// ---------- progress + win ----------

function updateProgress() {
	const total = puzzleCells(state.puzzle).length;
	const pct = Math.round((state.filled.size / total) * 100);
	progressFill.style.width = pct + "%";
	progressLabel.textContent = pct + "%";
}

function showWin() {
	const puzzle = state.puzzle;
	document.getElementById("win-emoji").textContent = puzzle.emoji;
	document.getElementById("win-title").textContent = puzzle.winTitle;
	document.getElementById("win-message").textContent = puzzle.winMessage;
	winOverlay.classList.remove("hidden");

	emojiRain.innerHTML = "";
	const treats = ["🍜", "🥞", "🧋", "🍓", "🍕", "🍣", "✨", "💖", puzzle.emoji];
	for (let i = 0; i < 24; i++) {
		const drop = document.createElement("span");
		drop.className = "fb-rain-drop";
		drop.textContent = treats[Math.floor(Math.random() * treats.length)];
		drop.style.left = Math.random() * 100 + "%";
		drop.style.animationDuration = 3 + Math.random() * 4 + "s";
		drop.style.animationDelay = Math.random() * 3 + "s";
		emojiRain.appendChild(drop);
	}
}

function goToMenu() {
	winOverlay.classList.add("hidden");
	gameScreen.classList.add("hidden");
	menuScreen.classList.remove("hidden");
	state.puzzle = null;
	state.selectedChar = null;
	buildMenu();
}

document.getElementById("back-btn").addEventListener("click", goToMenu);
document.getElementById("win-menu-btn").addEventListener("click", goToMenu);

document.getElementById("reset-btn").addEventListener("click", () => {
	if (!state.puzzle) return;
	if (!confirm("Start this snack over from scratch?")) return;
	state.filled = new Set();
	saveProgress();
	state.selectedChar = null;
	autoSelectColor();
	refreshPalette();
	updateProgress();
	draw();
});

window.addEventListener("resize", () => {
	if (!state.puzzle) return;
	sizeCanvas();
	draw();
});

// ---------- sanity check + boot ----------

function validatePuzzles() {
	const problems = [];
	PUZZLES.forEach((puzzle) => {
		const width = puzzle.grid[0].length;
		puzzle.grid.forEach((rowStr, i) => {
			if (rowStr.length !== width) {
				problems.push(puzzle.id + " row " + i + " is " + rowStr.length + " wide, expected " + width);
			}
			for (const ch of rowStr) {
				if (ch !== "." && !puzzle.palette[ch]) {
					problems.push(puzzle.id + " row " + i + " uses unknown color '" + ch + "'");
				}
			}
		});
	});
	return problems;
}

const problems = validatePuzzles();
if (problems.length) console.error("Puzzle data problems:", problems);

buildMenu();
