(() => {
	"use strict";

	const stage = document.getElementById("stage");
	const canvas = document.getElementById("drawCanvas");
	const ctx = canvas.getContext("2d", { willReadFrequently: true });
	const video = document.getElementById("cameraFeed");
	const cameraCanvas = document.getElementById("cameraAnalysis");
	const cameraCtx = cameraCanvas.getContext("2d", { willReadFrequently: true });

	const brushStyle = document.getElementById("brushStyle");
	const brushSize = document.getElementById("brushSize");
	const brushColor = document.getElementById("brushColor");
	const showGuides = document.getElementById("showGuides");
	const showReference = document.getElementById("showReference");
	const referenceOverlay = document.getElementById("referenceOverlay");
	const undoBtn = document.getElementById("undoBtn");
	const clearBtn = document.getElementById("clearBtn");
	const saveBtn = document.getElementById("saveBtn");

	const skillLevel = document.getElementById("skillLevel");
	const focusArea = document.getElementById("focusArea");

	const coachMood = document.getElementById("coachMood");
	const feedbackStream = document.getElementById("feedbackStream");
	const metricStrokes = document.getElementById("metricStrokes");
	const metricCoverage = document.getElementById("metricCoverage");
	const metricSpeed = document.getElementById("metricSpeed");
	const metricBalance = document.getElementById("metricBalance");

	const tipTitle = document.getElementById("tipTitle");
	const tipBody = document.getElementById("tipBody");
	const techniqueDemo = document.getElementById("techniqueDemo");
	const nextTip = document.getElementById("nextTip");

	const historyTitle = document.getElementById("historyTitle");
	const historyBody = document.getElementById("historyBody");
	const styleChips = document.getElementById("styleChips");

	const exerciseList = document.getElementById("exerciseList");
	const startDrill = document.getElementById("startDrill");
	const drillClock = document.getElementById("drillClock");

	// -------- Drawing state --------
	const state = {
		drawing: false,
		strokes: [],
		currentStroke: null,
		lastPoint: null,
		lastTime: 0,
		speeds: [],
		mode: "canvas",
		bbox: { minX: Infinity, minY: Infinity, maxX: 0, maxY: 0 },
	};

	function resizeCanvas() {
		const rect = stage.getBoundingClientRect();
		const dpr = window.devicePixelRatio || 1;
		[canvas, cameraCanvas].forEach((c) => {
			c.width = rect.width * dpr;
			c.height = rect.height * dpr;
			c.style.width = rect.width + "px";
			c.style.height = rect.height + "px";
		});
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		cameraCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
		redraw();
	}

	function redraw() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		if (showGuides.checked) drawGuides();
		for (const stroke of state.strokes) drawStroke(stroke);
	}

	function drawGuides() {
		const w = canvas.clientWidth;
		const h = canvas.clientHeight;
		ctx.save();
		ctx.strokeStyle = "rgba(180, 83, 9, 0.25)";
		ctx.setLineDash([6, 6]);
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(w / 2, 0);
		ctx.lineTo(w / 2, h);
		ctx.moveTo(0, h / 2);
		ctx.lineTo(w, h / 2);
		ctx.stroke();
		ctx.setLineDash([]);
		ctx.strokeStyle = "rgba(180, 83, 9, 0.12)";
		ctx.beginPath();
		ctx.moveTo(w / 3, 0);
		ctx.lineTo(w / 3, h);
		ctx.moveTo((2 * w) / 3, 0);
		ctx.lineTo((2 * w) / 3, h);
		ctx.moveTo(0, h / 3);
		ctx.lineTo(w, h / 3);
		ctx.moveTo(0, (2 * h) / 3);
		ctx.lineTo(w, (2 * h) / 3);
		ctx.stroke();
		ctx.restore();
	}

	function drawStroke(stroke) {
		if (stroke.points.length < 2) return;
		ctx.save();
		ctx.strokeStyle = stroke.color;
		ctx.lineWidth = stroke.size;
		ctx.lineCap = "round";
		ctx.lineJoin = "round";
		ctx.globalAlpha = stroke.alpha;
		if (stroke.brush === "charcoal") {
			ctx.shadowColor = stroke.color;
			ctx.shadowBlur = stroke.size * 0.8;
		}
		ctx.beginPath();
		ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
		for (let i = 1; i < stroke.points.length; i++) {
			const p = stroke.points[i];
			ctx.lineTo(p.x, p.y);
		}
		ctx.stroke();
		ctx.restore();
	}

	function brushProps() {
		const size = parseInt(brushSize.value, 10);
		const color = brushColor.value;
		const brush = brushStyle.value;
		const alpha =
			brush === "pencil" ? 0.55 : brush === "charcoal" ? 0.7 : brush === "marker" ? 0.85 : 1;
		return { size, color, brush, alpha };
	}

	function pointerPos(e) {
		const rect = canvas.getBoundingClientRect();
		const t = e.touches ? e.touches[0] : e;
		return { x: t.clientX - rect.left, y: t.clientY - rect.top };
	}

	function startStroke(e) {
		if (state.mode !== "canvas") return;
		e.preventDefault();
		state.drawing = true;
		const props = brushProps();
		const p = pointerPos(e);
		state.lastPoint = p;
		state.lastTime = performance.now();
		state.currentStroke = {
			...props,
			points: [p],
			startedAt: state.lastTime,
		};
		state.strokes.push(state.currentStroke);
		updateBbox(p);
	}

	function moveStroke(e) {
		if (!state.drawing) return;
		e.preventDefault();
		const p = pointerPos(e);
		const now = performance.now();
		const dt = Math.max(1, now - state.lastTime);
		const dx = p.x - state.lastPoint.x;
		const dy = p.y - state.lastPoint.y;
		const dist = Math.hypot(dx, dy);
		state.speeds.push(dist / dt);
		if (state.speeds.length > 300) state.speeds.shift();
		state.currentStroke.points.push(p);
		state.lastPoint = p;
		state.lastTime = now;
		updateBbox(p);
		drawStroke(state.currentStroke);
	}

	function endStroke() {
		if (!state.drawing) return;
		state.drawing = false;
		state.currentStroke = null;
		scheduleAnalysis();
	}

	function updateBbox(p) {
		state.bbox.minX = Math.min(state.bbox.minX, p.x);
		state.bbox.minY = Math.min(state.bbox.minY, p.y);
		state.bbox.maxX = Math.max(state.bbox.maxX, p.x);
		state.bbox.maxY = Math.max(state.bbox.maxY, p.y);
	}

	// -------- Analysis (heuristic "AI" coach) --------
	let analysisTimer = null;
	function scheduleAnalysis() {
		clearTimeout(analysisTimer);
		analysisTimer = setTimeout(runAnalysis, 450);
	}

	function runAnalysis() {
		const w = canvas.clientWidth;
		const h = canvas.clientHeight;
		const strokes = state.strokes.length;
		metricStrokes.textContent = strokes;

		if (strokes === 0) {
			coachMood.textContent = "Watching your lines…";
			return;
		}

		const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
		const { inkPixels, leftInk, rightInk, topInk, bottomInk } = analyseImage(img);
		const coverage = inkPixels / (canvas.width * canvas.height);
		metricCoverage.textContent = (coverage * 100).toFixed(1) + "%";

		const avgSpeed =
			state.speeds.reduce((a, b) => a + b, 0) / Math.max(1, state.speeds.length);
		metricSpeed.textContent = avgSpeed.toFixed(2) + " px/ms";

		const lrBalance = Math.abs(leftInk - rightInk) / Math.max(1, leftInk + rightInk);
		const tbBalance = Math.abs(topInk - bottomInk) / Math.max(1, topInk + bottomInk);
		const balance = 1 - (lrBalance + tbBalance) / 2;
		metricBalance.textContent = Math.round(balance * 100) + "%";

		offerFeedback({ strokes, coverage, avgSpeed, lrBalance, tbBalance, balance });
		updateCoachMood({ coverage, balance, avgSpeed });
	}

	function analyseImage(img) {
		const { data, width, height } = img;
		let inkPixels = 0;
		let leftInk = 0,
			rightInk = 0,
			topInk = 0,
			bottomInk = 0;
		const midX = width / 2;
		const midY = height / 2;
		for (let y = 0; y < height; y += 4) {
			for (let x = 0; x < width; x += 4) {
				const i = (y * width + x) * 4;
				const a = data[i + 3];
				if (a < 40) continue;
				const r = data[i], g = data[i + 1], b = data[i + 2];
				const brightness = (r + g + b) / 3;
				if (brightness < 220) {
					inkPixels++;
					if (x < midX) leftInk++; else rightInk++;
					if (y < midY) topInk++; else bottomInk++;
				}
			}
		}
		return { inkPixels, leftInk, rightInk, topInk, bottomInk };
	}

	// Avoid repeating the same note too often
	const recentFeedback = [];
	function addFeedback(text, kind = "info") {
		if (recentFeedback.includes(text)) return;
		recentFeedback.push(text);
		if (recentFeedback.length > 6) recentFeedback.shift();
		const el = document.createElement("div");
		el.className = "feedback-item " + kind;
		const time = new Date().toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		});
		el.innerHTML = `${text}<time>${time}</time>`;
		feedbackStream.prepend(el);
		while (feedbackStream.children.length > 12) feedbackStream.lastChild.remove();
	}

	function offerFeedback(m) {
		const skill = skillLevel.value;
		const focus = focusArea.value;

		if (m.strokes === 3) {
			addFeedback(
				encouragement(skill, "warmup"),
				"good"
			);
		}
		if (m.strokes === 10) {
			addFeedback("Nice flow — you've found a rhythm. Keep your shoulder loose.", "good");
		}
		if (m.strokes === 25) {
			addFeedback("Step back and squint at the whole piece. Shapes reading okay?", "info");
		}

		if (focus === "line" && m.avgSpeed < 0.04 && m.strokes > 4) {
			addFeedback(
				"Your strokes are quite slow — try a faster, committed line for cleaner edges.",
				"warn"
			);
		}
		if (focus === "line" && m.avgSpeed > 0.5) {
			addFeedback(
				"Lots of energy! For cleaner contours, slow down on the important outlines.",
				"info"
			);
		}
		if (focus === "proportion" && m.lrBalance > 0.4) {
			addFeedback(
				"One side of the page has much more ink — consider balancing the composition.",
				"warn"
			);
		}
		if (focus === "composition" && m.coverage > 0.4) {
			addFeedback(
				"Page feels dense. Negative space is part of the drawing — let some areas breathe.",
				"info"
			);
		}
		if (focus === "shading" && m.strokes > 15 && m.coverage < 0.05) {
			addFeedback(
				"Try building value with layered hatching — start light, deepen gradually.",
				"info"
			);
		}
		if (focus === "gesture" && m.strokes > 20 && m.avgSpeed < 0.1) {
			addFeedback(
				"Gesture drawings want speed and intent — aim for 30-second poses, not 5 minutes.",
				"info"
			);
		}

		if (m.balance > 0.85 && m.coverage > 0.08) {
			addFeedback(
				"Composition feels well balanced across the frame. Nicely done.",
				"good"
			);
		}
	}

	function encouragement(skill, context) {
		const pool = {
			beginner: [
				"Great start — every drawing begins with a brave first mark.",
				"Looking good! Remember, practice > perfection.",
				"Keep going, your hand is learning with every stroke.",
			],
			intermediate: [
				"Confident opening. Start thinking about the silhouette next.",
				"You're warming up nicely. Push contrast on the focal point.",
				"Solid rhythm — now squint and check the big shapes.",
			],
			advanced: [
				"Clean gesture. Consider where you want the eye to travel.",
				"Nice economy of line. Save detail for the focal area.",
				"Good structural thinking. Push your darkest darks next.",
			],
		};
		const list = pool[skill] || pool.intermediate;
		return list[Math.floor(Math.random() * list.length)];
	}

	function updateCoachMood(m) {
		if (m.coverage < 0.01) coachMood.textContent = "Watching your lines…";
		else if (m.balance > 0.85) coachMood.textContent = "Loving the balance here.";
		else if (m.avgSpeed > 0.4) coachMood.textContent = "Energetic marks — feeling it!";
		else coachMood.textContent = "Adjusting feedback to your pace…";
	}

	// -------- Controls --------
	undoBtn.addEventListener("click", () => {
		state.strokes.pop();
		redraw();
		scheduleAnalysis();
	});
	clearBtn.addEventListener("click", () => {
		state.strokes = [];
		state.speeds = [];
		state.bbox = { minX: Infinity, minY: Infinity, maxX: 0, maxY: 0 };
		redraw();
		feedbackStream.innerHTML = "";
		metricStrokes.textContent = "0";
		metricCoverage.textContent = "0%";
		metricSpeed.textContent = "—";
		metricBalance.textContent = "—";
		coachMood.textContent = "Fresh page — take your time.";
	});
	saveBtn.addEventListener("click", () => {
		const link = document.createElement("a");
		link.download = "drawing.png";
		link.href = canvas.toDataURL("image/png");
		link.click();
	});

	showGuides.addEventListener("change", redraw);
	showReference.addEventListener("change", () => {
		referenceOverlay.classList.toggle("active", showReference.checked);
		if (showReference.checked && !referenceOverlay.style.backgroundImage) {
			referenceOverlay.style.backgroundImage =
				"url('Squad Posing3.png')";
		}
	});

	canvas.addEventListener("mousedown", startStroke);
	canvas.addEventListener("mousemove", moveStroke);
	window.addEventListener("mouseup", endStroke);
	canvas.addEventListener("touchstart", startStroke, { passive: false });
	canvas.addEventListener("touchmove", moveStroke, { passive: false });
	canvas.addEventListener("touchend", endStroke);

	window.addEventListener("resize", resizeCanvas);

	// -------- Mode switching --------
	document.querySelectorAll(".mode-btn").forEach((btn) => {
		btn.addEventListener("click", async () => {
			document
				.querySelectorAll(".mode-btn")
				.forEach((b) => b.classList.remove("active"));
			btn.classList.add("active");
			state.mode = btn.dataset.mode;
			if (state.mode === "camera") {
				stage.classList.add("camera-mode");
				await startCamera();
			} else {
				stage.classList.remove("camera-mode");
				stopCamera();
			}
		});
	});

	let cameraStream = null;
	let cameraRAF = null;
	async function startCamera() {
		try {
			cameraStream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: "environment" },
				audio: false,
			});
			video.srcObject = cameraStream;
			addFeedback(
				"Camera on. Point it at your paper and I'll watch your drawing progress.",
				"good"
			);
			loopCameraAnalysis();
		} catch (err) {
			addFeedback(
				"Couldn't access the camera — staying in canvas mode. " + err.message,
				"warn"
			);
			state.mode = "canvas";
			stage.classList.remove("camera-mode");
			document
				.querySelector('.mode-btn[data-mode="canvas"]')
				.classList.add("active");
			document
				.querySelector('.mode-btn[data-mode="camera"]')
				.classList.remove("active");
		}
	}

	function stopCamera() {
		if (cameraStream) {
			cameraStream.getTracks().forEach((t) => t.stop());
			cameraStream = null;
		}
		if (cameraRAF) cancelAnimationFrame(cameraRAF);
	}

	let lastCameraSample = null;
	function loopCameraAnalysis() {
		if (!cameraStream) return;
		cameraRAF = requestAnimationFrame(loopCameraAnalysis);
		if (video.readyState < 2) return;
		cameraCtx.drawImage(video, 0, 0, cameraCanvas.clientWidth, cameraCanvas.clientHeight);
		const now = performance.now();
		if (!lastCameraSample || now - lastCameraSample > 2000) {
			lastCameraSample = now;
			const img = cameraCtx.getImageData(
				0,
				0,
				cameraCanvas.width,
				cameraCanvas.height
			);
			const { inkPixels, leftInk, rightInk } = analyseImage(img);
			const total = canvas.width * canvas.height;
			const coverage = inkPixels / total;
			const lr = Math.abs(leftInk - rightInk) / Math.max(1, leftInk + rightInk);
			metricCoverage.textContent = (coverage * 100).toFixed(1) + "%";
			metricBalance.textContent = Math.round((1 - lr) * 100) + "%";
			if (coverage > 0.02 && lr > 0.5) {
				addFeedback(
					"I can see your drawing is weighted to one side — try adding marks to balance it out.",
					"info"
				);
			}
			if (coverage > 0.35) {
				addFeedback(
					"Page is getting quite dense — consider where the viewer's eye should rest.",
					"info"
				);
			}
		}
	}

	// -------- Technique tips --------
	const tips = {
		line: [
			{
				title: "Loose warm-up strokes",
				body:
					"Start with light, repeated passes rather than single committed lines. Your hand learns the shape before your pencil does.",
				demo: "hatching",
			},
			{
				title: "Draw from the shoulder",
				body:
					"For long, confident lines, move your whole arm — not just the wrist. It's the difference between a wobble and a sweep.",
				demo: "long-line",
			},
			{
				title: "Use ghost strokes",
				body:
					"Hover over the line twice before you touch the paper. That rehearsal makes your real stroke far more confident.",
				demo: "ghost",
			},
		],
		proportion: [
			{
				title: "Measure with your pencil",
				body:
					"Close one eye, hold your pencil at arm's length, and use it as a ruler. One 'head' or one 'hand' becomes your unit.",
				demo: "measure",
			},
			{
				title: "Negative shapes first",
				body:
					"Draw the shapes between your subject before the subject itself. It forces you to see objectively.",
				demo: "negative",
			},
		],
		shading: [
			{
				title: "Build value in layers",
				body:
					"Lay in a mid-tone first, then darken what recedes or falls in shadow. Jumping straight to black flattens the form.",
				demo: "hatching",
			},
			{
				title: "Core shadow discipline",
				body:
					"Between the lit and shadow sides sits the core shadow — the darkest band. Respect it and your form becomes 3D.",
				demo: "sphere",
			},
		],
		composition: [
			{
				title: "Rule of thirds",
				body:
					"Divide the page into thirds both ways. Put your focal point near one of the intersections rather than dead centre.",
				demo: "thirds",
			},
			{
				title: "Leading lines",
				body:
					"Use implied lines — a gaze, a branch, a shadow — to guide the viewer's eye toward your focal point.",
				demo: "leading",
			},
		],
		gesture: [
			{
				title: "30-second poses",
				body:
					"Gesture is about energy, not accuracy. Draw only the line of action plus primary masses before the timer ends.",
				demo: "gesture",
			},
		],
	};

	function showTip(focus) {
		const list = tips[focus] || tips.line;
		const pick = list[Math.floor(Math.random() * list.length)];
		tipTitle.textContent = pick.title;
		tipBody.textContent = pick.body;
		renderTechniqueDemo(pick.demo);
	}

	function renderTechniqueDemo(kind) {
		techniqueDemo.innerHTML = "";
		const svgNS = "http://www.w3.org/2000/svg";
		const svg = document.createElementNS(svgNS, "svg");
		svg.setAttribute("viewBox", "0 0 300 120");
		svg.setAttribute("width", "100%");
		svg.setAttribute("height", "100%");

		const add = (tag, attrs) => {
			const el = document.createElementNS(svgNS, tag);
			for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
			svg.appendChild(el);
			return el;
		};

		if (kind === "hatching") {
			for (let i = 0; i < 20; i++) {
				add("line", {
					x1: 30 + i * 8,
					y1: 20,
					x2: 30 + i * 8 + 20,
					y2: 100,
					stroke: "#1f2937",
					"stroke-width": 1,
					opacity: 0.6,
				});
			}
		} else if (kind === "long-line") {
			add("path", {
				d: "M20 80 C 80 20, 220 110, 280 40",
				fill: "none",
				stroke: "#1f2937",
				"stroke-width": 2,
			});
		} else if (kind === "ghost") {
			for (let i = 0; i < 3; i++) {
				add("path", {
					d: "M30 60 Q 150 " + (20 + i * 5) + " 270 60",
					fill: "none",
					stroke: "#1f2937",
					"stroke-width": 1,
					opacity: 0.25 + i * 0.2,
				});
			}
		} else if (kind === "sphere") {
			const grad = add("radialGradient", { id: "sg", cx: "35%", cy: "35%" });
			const stop1 = document.createElementNS(svgNS, "stop");
			stop1.setAttribute("offset", "0%");
			stop1.setAttribute("stop-color", "#ffffff");
			const stop2 = document.createElementNS(svgNS, "stop");
			stop2.setAttribute("offset", "100%");
			stop2.setAttribute("stop-color", "#111");
			grad.append(stop1, stop2);
			add("circle", { cx: 150, cy: 60, r: 45, fill: "url(#sg)" });
		} else if (kind === "thirds") {
			add("rect", { x: 20, y: 10, width: 260, height: 100, fill: "none", stroke: "#1f2937" });
			[1, 2].forEach((i) => {
				add("line", { x1: 20 + (260 / 3) * i, y1: 10, x2: 20 + (260 / 3) * i, y2: 110, stroke: "#b45309", "stroke-dasharray": "4 4" });
				add("line", { x1: 20, y1: 10 + (100 / 3) * i, x2: 280, y2: 10 + (100 / 3) * i, stroke: "#b45309", "stroke-dasharray": "4 4" });
			});
			add("circle", { cx: 20 + (260 / 3) * 2, cy: 10 + (100 / 3), r: 6, fill: "#b45309" });
		} else if (kind === "leading") {
			add("path", { d: "M20 100 Q 150 100 280 30", fill: "none", stroke: "#b45309", "stroke-width": 2 });
			add("circle", { cx: 280, cy: 30, r: 8, fill: "#1f2937" });
		} else if (kind === "gesture") {
			add("path", { d: "M60 20 C 80 60, 160 80, 240 100", fill: "none", stroke: "#1f2937", "stroke-width": 3, "stroke-linecap": "round" });
		} else if (kind === "measure") {
			add("line", { x1: 40, y1: 60, x2: 260, y2: 60, stroke: "#1f2937", "stroke-width": 2 });
			[0, 1, 2, 3, 4].forEach((i) => {
				add("line", { x1: 40 + i * 55, y1: 50, x2: 40 + i * 55, y2: 70, stroke: "#1f2937" });
			});
		} else if (kind === "negative") {
			add("rect", { x: 40, y: 20, width: 220, height: 80, fill: "#fde68a" });
			add("circle", { cx: 150, cy: 60, r: 30, fill: "#fffdf7" });
		}

		techniqueDemo.appendChild(svg);
	}

	nextTip.addEventListener("click", () => showTip(focusArea.value));
	focusArea.addEventListener("change", () => showTip(focusArea.value));
	showTip("line");

	// -------- Art history --------
	const styles = [
		{
			id: "impressionism",
			name: "Impressionism",
			body:
				"Late-19th-century movement born in Paris (Monet, Renoir, Degas). Painters worked en plein air with broken colour and visible brushstrokes to capture fleeting light rather than fixed contour. Try: soft edges, warm/cool shifts instead of dark lines.",
		},
		{
			id: "ukiyoe",
			name: "Ukiyo-e",
			body:
				"Edo-period Japanese woodblock prints (Hokusai, Hiroshige, Utamaro). Flat colour fields, bold outlines, strong diagonals. Hugely influenced Western modernism. Try: crisp contours, cropped compositions, limited palette.",
		},
		{
			id: "renaissance",
			name: "Renaissance",
			body:
				"15th–16th century Italy. Da Vinci and Dürer codified linear perspective, anatomy, and sfumato (soft tonal transitions). Try: careful proportion, a vanishing point, and gradual value transitions.",
		},
		{
			id: "expressionism",
			name: "Expressionism",
			body:
				"Early 20th-century — Munch, Kirchner, Schiele. Distorted form and jarring colour serve emotion over likeness. Try: exaggerated gesture, unexpected colour choices, raw edges.",
		},
		{
			id: "bauhaus",
			name: "Bauhaus",
			body:
				"1919 German school bridging craft and industry. Kandinsky, Klee, Itten taught pure form and colour theory. Try: simple geometry, primary colours, rigorous grids.",
		},
		{
			id: "art-nouveau",
			name: "Art Nouveau",
			body:
				"Around 1890–1910. Mucha and Klimt used sinuous organic lines, pattern, and flattened decoration. Try: whiplash curves and ornamental borders around your subject.",
		},
	];

	styles.forEach((s) => {
		const chip = document.createElement("button");
		chip.className = "style-chip";
		chip.textContent = s.name;
		chip.dataset.id = s.id;
		chip.addEventListener("click", () => selectStyle(s));
		styleChips.appendChild(chip);
	});

	function selectStyle(s) {
		document
			.querySelectorAll(".style-chip")
			.forEach((c) => c.classList.toggle("active", c.dataset.id === s.id));
		historyTitle.textContent = s.name;
		historyBody.textContent = s.body;
	}

	// -------- Exercises --------
	const exercises = [
		{ title: "100 circles", duration: "3 min", desc: "Fill the page with smooth circles" },
		{ title: "Blind contour", duration: "2 min", desc: "Don't look at the paper" },
		{ title: "Upside-down copy", duration: "5 min", desc: "Flip a reference photo" },
		{ title: "Value scale", duration: "4 min", desc: "Shade a 10-step gradient" },
		{ title: "One-line drawing", duration: "3 min", desc: "No lifting the pencil" },
	];

	exercises.forEach((ex) => {
		const li = document.createElement("li");
		li.innerHTML = `<span><strong>${ex.title}</strong> — ${ex.desc}</span><span class="duration">${ex.duration}</span>`;
		exerciseList.appendChild(li);
	});

	let drillInterval = null;
	startDrill.addEventListener("click", () => {
		if (drillInterval) return;
		let remaining = 60;
		drillClock.textContent = "00:60";
		addFeedback("Drill started — loose, fast, don't overthink.", "info");
		drillInterval = setInterval(() => {
			remaining--;
			drillClock.textContent = "00:" + String(remaining).padStart(2, "0");
			if (remaining === 30) addFeedback("Halfway — keep going!", "info");
			if (remaining === 10) addFeedback("10 seconds. Bold marks!", "warn");
			if (remaining <= 0) {
				clearInterval(drillInterval);
				drillInterval = null;
				drillClock.textContent = "00:60";
				addFeedback("Done! Step back and look at your drawing with fresh eyes.", "good");
			}
		}, 1000);
	});

	// -------- Tabs --------
	document.querySelectorAll(".tab").forEach((tab) => {
		tab.addEventListener("click", () => {
			document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
			tab.classList.add("active");
			const target = tab.dataset.tab;
			document.querySelectorAll(".tab-panel").forEach((p) => {
				p.classList.toggle("active", p.dataset.panel === target);
			});
		});
	});

	// Greeting
	addFeedback(
		"Hi! I'm Iris. Draw anything — I'll share gentle suggestions as you go.",
		"good"
	);

	resizeCanvas();
})();
