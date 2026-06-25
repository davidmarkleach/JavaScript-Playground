/*
 * Mood vs Screen Time — a free, no-login, on-device experiment.
 *
 * Everything is stored in localStorage. Nothing is transmitted anywhere unless
 * the user explicitly chooses to contribute their (anonymous) data for research.
 */

(function () {
	"use strict";

	var STORAGE_KEY = "mstt.entries.v1";
	// Where anonymous research contributions are emailed. Change to your address.
	var RESEARCH_EMAIL = "davidmarkleach@gmail.com";

	var SOCIAL_APPS = [
		{ id: "instagram", name: "Instagram", emoji: "📸" },
		{ id: "tiktok", name: "TikTok", emoji: "🎵" },
		{ id: "youtube", name: "YouTube", emoji: "▶️" },
		{ id: "twitter", name: "X / Twitter", emoji: "🐦" },
		{ id: "facebook", name: "Facebook", emoji: "👥" },
		{ id: "snapchat", name: "Snapchat", emoji: "👻" },
		{ id: "reddit", name: "Reddit", emoji: "🤖" },
		{ id: "other", name: "Other social", emoji: "💬" }
	];

	var MOOD_WORDS = ["", "Awful", "Low", "Okay", "Good", "Great"];

	// ---------- Storage ----------
	function loadEntries() {
		try {
			return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
		} catch (e) {
			return {};
		}
	}
	function saveEntries(entries) {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
	}

	// ---------- Helpers ----------
	function $(sel, root) {
		return (root || document).querySelector(sel);
	}
	function todayISO() {
		var d = new Date();
		var off = d.getTimezoneOffset();
		return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
	}
	function fmtMinutes(mins) {
		mins = Math.round(mins || 0);
		var h = Math.floor(mins / 60);
		var m = mins % 60;
		if (h && m) return h + "h " + m + "m";
		if (h) return h + "h";
		return m + "m";
	}
	function fmtDate(iso) {
		var parts = iso.split("-");
		var d = new Date(parts[0], parts[1] - 1, parts[2]);
		return d.toLocaleDateString(undefined, {
			weekday: "short",
			month: "short",
			day: "numeric"
		});
	}
	function sortedEntries() {
		var entries = loadEntries();
		return Object.keys(entries)
			.sort()
			.map(function (k) {
				return entries[k];
			});
	}

	// ===================================================================
	// LOG TAB
	// ===================================================================
	var selectedMood = null;

	function buildSocialInputs() {
		var grid = $("#social-grid");
		grid.innerHTML = "";
		SOCIAL_APPS.forEach(function (app) {
			var row = document.createElement("div");
			row.className = "social-row";
			row.innerHTML =
				'<span class="emoji">' + app.emoji + "</span>" +
				'<label for="app-' + app.id + '">' + app.name + "</label>" +
				'<input type="number" min="0" max="1440" inputmode="numeric" ' +
				'id="app-' + app.id + '" data-app="' + app.id + '" placeholder="0" />';
			grid.appendChild(row);
		});
	}

	function setMood(mood) {
		selectedMood = mood;
		var btns = document.querySelectorAll(".mood");
		btns.forEach(function (b) {
			b.classList.toggle("is-selected", Number(b.dataset.mood) === mood);
		});
		$("#mood-label").textContent = mood ? MOOD_WORDS[mood] : "Tap a face";
	}

	function loadIntoForm(iso) {
		var entry = loadEntries()[iso];
		setMood(entry ? entry.mood : null);
		$("#screen-hours").value = entry ? Math.floor(entry.screenMins / 60) || "" : "";
		$("#screen-mins").value = entry ? entry.screenMins % 60 || "" : "";
		$("#note").value = entry ? entry.note || "" : "";
		SOCIAL_APPS.forEach(function (app) {
			var input = $("#app-" + app.id);
			input.value = entry && entry.apps && entry.apps[app.id] ? entry.apps[app.id] : "";
		});
		$("#save-status").textContent = entry ? "Loaded existing entry — edit and re-save." : "";
	}

	function handleSubmit(e) {
		e.preventDefault();
		if (!selectedMood) {
			$("#save-status").style.color = "var(--bad)";
			$("#save-status").textContent = "Pick a mood first 🙂";
			return;
		}
		var iso = $("#entry-date").value || todayISO();
		var hrs = parseInt($("#screen-hours").value, 10) || 0;
		var mins = parseInt($("#screen-mins").value, 10) || 0;
		var apps = {};
		SOCIAL_APPS.forEach(function (app) {
			var v = parseInt($("#app-" + app.id).value, 10);
			if (v > 0) apps[app.id] = v;
		});

		var entries = loadEntries();
		entries[iso] = {
			date: iso,
			mood: selectedMood,
			screenMins: hrs * 60 + mins,
			apps: apps,
			note: $("#note").value.trim()
		};
		saveEntries(entries);

		$("#save-status").style.color = "var(--good)";
		$("#save-status").textContent = "Saved! ✓";
		renderAll();
	}

	// ===================================================================
	// INSIGHTS TAB
	// ===================================================================
	function pearson(xs, ys) {
		var n = xs.length;
		if (n < 3) return null;
		var sx = 0, sy = 0, sxy = 0, sxx = 0, syy = 0;
		for (var i = 0; i < n; i++) {
			sx += xs[i];
			sy += ys[i];
			sxy += xs[i] * ys[i];
			sxx += xs[i] * xs[i];
			syy += ys[i] * ys[i];
		}
		var num = n * sxy - sx * sy;
		var den = Math.sqrt((n * sxx - sx * sx) * (n * syy - sy * sy));
		if (den === 0) return null;
		return num / den;
	}

	function renderHypothesis(data) {
		var banner = $("#hypothesis-banner");
		if (data.length < 3) {
			banner.innerHTML =
				"<p>Log at least <strong>3 days</strong> to start seeing patterns. " +
				"(" + data.length + " so far.)</p>";
			return;
		}
		var screen = data.map(function (d) { return d.screenMins; });
		var mood = data.map(function (d) { return d.mood; });
		var r = pearson(screen, mood);

		var verdict;
		if (r === null) {
			verdict = "Not enough variation yet — keep logging.";
		} else if (r <= -0.3) {
			verdict =
				"So far your data <strong>supports</strong> the hypothesis: more screen " +
				"time tends to go with a lower mood.";
		} else if (r >= 0.3) {
			verdict =
				"Interesting — your data so far runs <strong>against</strong> the " +
				"hypothesis: more screen time tracks with a better mood.";
		} else {
			verdict =
				"So far there's <strong>no clear link</strong> between your screen time " +
				"and mood.";
		}
		var avgMin = screen.reduce(function (a, b) { return a + b; }, 0) / data.length;
		banner.innerHTML =
			"<p>" + verdict + "</p>" +
			'<p style="margin-top:8px;font-size:.85rem;opacity:.9">' +
			data.length + " days logged · avg " + fmtMinutes(avgMin) +
			"/day" + (r !== null ? " · correlation r = " + r.toFixed(2) : "") +
			"</p>";
	}

	function renderScatter(data) {
		var host = $("#scatter");
		if (data.length < 2) {
			host.innerHTML = '<p class="empty">Need a couple of days first.</p>';
			return;
		}
		var W = 320, H = 200, pad = 34;
		var maxMin = Math.max.apply(null, data.map(function (d) { return d.screenMins; })) || 60;
		var x = function (m) { return pad + (m / maxMin) * (W - pad - 10); };
		var y = function (mood) { return H - pad - ((mood - 1) / 4) * (H - pad - 10); };

		var dots = data
			.map(function (d) {
				var hue = (d.mood - 1) / 4; // 0 bad -> 1 good
				var col = "hsl(" + Math.round(hue * 140) + ",70%,55%)";
				return (
					'<circle cx="' + x(d.screenMins).toFixed(1) + '" cy="' + y(d.mood).toFixed(1) +
					'" r="5" fill="' + col + '" opacity="0.85"><title>' +
					fmtDate(d.date) + ": mood " + d.mood + ", " + fmtMinutes(d.screenMins) +
					"</title></circle>"
				);
			})
			.join("");

		var yLabels = [1, 2, 3, 4, 5]
			.map(function (m) {
				return (
					'<text x="' + (pad - 8) + '" y="' + (y(m) + 4) + '" text-anchor="end" ' +
					'font-size="10" fill="#7a7790">' + m + "</text>"
				);
			})
			.join("");

		host.innerHTML =
			'<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Mood vs screen time scatter plot">' +
			'<line x1="' + pad + '" y1="' + (H - pad) + '" x2="' + (W - 6) + '" y2="' + (H - pad) +
			'" stroke="#e7e5f2"/>' +
			'<line x1="' + pad + '" y1="10" x2="' + pad + '" y2="' + (H - pad) + '" stroke="#e7e5f2"/>' +
			yLabels +
			'<text x="' + (W / 2) + '" y="' + (H - 6) + '" text-anchor="middle" font-size="10" fill="#7a7790">' +
			"screen time →</text>" +
			'<text x="12" y="14" font-size="10" fill="#7a7790">mood ↑</text>' +
			dots +
			"</svg>";
	}

	function renderAppBreakdown(data) {
		var host = $("#app-breakdown");
		if (data.length < 4) {
			host.innerHTML = '<p class="empty">Log ~4+ days with app minutes to compare.</p>';
			return;
		}
		var rows = [];
		SOCIAL_APPS.forEach(function (app) {
			// days where this app has a recorded value
			var withVal = data.filter(function (d) {
				return d.apps && typeof d.apps[app.id] === "number";
			});
			if (withVal.length < 4) return;
			var sorted = withVal
				.slice()
				.sort(function (a, b) { return a.apps[app.id] - b.apps[app.id]; });
			var half = Math.max(1, Math.floor(sorted.length / 2));
			var light = sorted.slice(0, half);
			var heavy = sorted.slice(sorted.length - half);
			var avg = function (arr) {
				return arr.reduce(function (s, d) { return s + d.mood; }, 0) / arr.length;
			};
			var lightMood = avg(light);
			var heavyMood = avg(heavy);
			rows.push({
				app: app,
				delta: heavyMood - lightMood, // negative => heavier use, worse mood
				lightMood: lightMood,
				heavyMood: heavyMood
			});
		});

		if (!rows.length) {
			host.innerHTML = '<p class="empty">Not enough per-app data yet.</p>';
			return;
		}
		rows.sort(function (a, b) { return a.delta - b.delta; });

		var maxAbs = Math.max.apply(
			null,
			rows.map(function (r) { return Math.abs(r.delta); })
		) || 1;

		host.innerHTML = rows
			.map(function (r) {
				var pct = (Math.abs(r.delta) / maxAbs) * 100;
				var worse = r.delta < 0;
				var col = worse ? "var(--bad)" : "var(--good)";
				var sign = r.delta <= 0 ? "" : "+";
				return (
					'<div class="bar-row">' +
					'<span class="bar-label">' + r.app.emoji + " " + r.app.name + "</span>" +
					'<span class="bar-track"><span class="bar-fill" style="width:' +
					pct.toFixed(0) + "%;background:" + col + '"></span></span>' +
					'<span class="bar-val">' + sign + r.delta.toFixed(1) + "</span>" +
					"</div>"
				);
			})
			.join("") +
			'<p class="hint">Mood change (–5…+5) on heavy-use vs. light-use days. ' +
			"Red = heavier use went with a worse mood.</p>";
	}

	function renderTrend(data) {
		var host = $("#trend");
		var last = data.slice(-14);
		if (last.length < 2) {
			host.innerHTML = '<p class="empty">Need a couple of days first.</p>';
			return;
		}
		var W = 320, H = 150, pad = 24;
		var maxMin = Math.max.apply(null, last.map(function (d) { return d.screenMins; })) || 60;
		var step = (W - pad - 10) / (last.length - 1);
		var yMood = function (m) { return pad + (1 - (m - 1) / 4) * (H - pad * 2); };
		var yMin = function (m) { return pad + (1 - m / maxMin) * (H - pad * 2); };

		var moodLine = last
			.map(function (d, i) {
				return (i ? "L" : "M") + (pad + i * step).toFixed(1) + " " + yMood(d.mood).toFixed(1);
			})
			.join(" ");
		var minLine = last
			.map(function (d, i) {
				return (i ? "L" : "M") + (pad + i * step).toFixed(1) + " " + yMin(d.screenMins).toFixed(1);
			})
			.join(" ");

		host.innerHTML =
			'<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="14 day trend">' +
			'<path d="' + minLine + '" fill="none" stroke="#e17055" stroke-width="2"/>' +
			'<path d="' + moodLine + '" fill="none" stroke="#6c5ce7" stroke-width="2"/>' +
			"</svg>" +
			'<div class="row" style="font-size:.78rem;color:var(--muted);justify-content:center">' +
			'<span style="color:#6c5ce7">●</span> mood &nbsp; ' +
			'<span style="color:#e17055">●</span> screen time</div>';
	}

	// ===================================================================
	// HISTORY TAB
	// ===================================================================
	function renderHistory(data) {
		var host = $("#history-list");
		if (!data.length) {
			host.innerHTML = '<p class="empty">No entries yet. Log your first day! 🌱</p>';
			return;
		}
		var faces = ["", "😢", "🙁", "😐", "🙂", "😄"];
		host.innerHTML = data
			.slice()
			.reverse()
			.map(function (d) {
				var appCount = d.apps ? Object.keys(d.apps).length : 0;
				var sub =
					fmtMinutes(d.screenMins) + " screen" +
					(appCount ? " · " + appCount + " app" + (appCount > 1 ? "s" : "") : "") +
					(d.note ? " · " + d.note : "");
				return (
					'<div class="entry">' +
					'<span class="e-mood">' + faces[d.mood] + "</span>" +
					'<span class="e-main"><span class="e-date">' + fmtDate(d.date) +
					'</span><br><span class="e-sub">' + escapeHtml(sub) + "</span></span>" +
					'<button class="e-del" data-date="' + d.date + '" title="Delete">🗑️</button>' +
					"</div>"
				);
			})
			.join("");
	}

	function escapeHtml(s) {
		return String(s).replace(/[&<>"']/g, function (c) {
			return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
		});
	}

	// ===================================================================
	// DATA & RESEARCH TAB
	// ===================================================================
	function buildResearchPayload() {
		var data = sortedEntries();
		return {
			experiment: "mood-vs-screen-time",
			hypothesis: "less screen time -> happier",
			schemaVersion: 1,
			contributedAt: new Date().toISOString(),
			dayCount: data.length,
			// Strictly anonymous: only dates, moods, minutes. No notes, no identity.
			days: data.map(function (d) {
				return {
					date: d.date,
					mood: d.mood,
					screenMins: d.screenMins,
					apps: d.apps || {}
				};
			})
		};
	}

	function showContribute() {
		var data = sortedEntries();
		if (!data.length) {
			alert("Log at least one day before contributing.");
			return;
		}
		var payload = buildResearchPayload();
		$("#contribute-preview").textContent = JSON.stringify(payload, null, 2);
		$("#contribute-preview").hidden = false;
		$("#contribute-actions").hidden = false;
	}

	function copyContribution() {
		var text = $("#contribute-preview").textContent;
		if (navigator.clipboard) {
			navigator.clipboard.writeText(text).then(function () {
				flashBtn("#copy-btn", "Copied ✓");
			});
		} else {
			alert("Copy not supported — use Download instead.");
		}
	}

	function emailContribution() {
		var payload = buildResearchPayload();
		var body =
			"Hi! Here's my anonymous data for the mood vs screen-time experiment.\n\n" +
			"Days logged: " + payload.dayCount + "\n\n" +
			JSON.stringify(payload, null, 2);
		var url =
			"mailto:" + encodeURIComponent(RESEARCH_EMAIL) +
			"?subject=" + encodeURIComponent("Mood vs Screen Time — data contribution") +
			"&body=" + encodeURIComponent(body);
		window.location.href = url;
	}

	function downloadResearch() {
		downloadJSON(buildResearchPayload(), "mood-screentime-contribution.json");
	}

	function flashBtn(sel, text) {
		var btn = $(sel);
		var orig = btn.textContent;
		btn.textContent = text;
		setTimeout(function () {
			btn.textContent = orig;
		}, 1500);
	}

	// ---------- Backup / restore ----------
	function downloadJSON(obj, filename) {
		var blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
		var a = document.createElement("a");
		a.href = URL.createObjectURL(blob);
		a.download = filename;
		a.click();
		URL.revokeObjectURL(a.href);
	}

	function exportBackup() {
		downloadJSON(loadEntries(), "mood-screentime-backup.json");
	}

	function importBackup(file) {
		var reader = new FileReader();
		reader.onload = function () {
			try {
				var incoming = JSON.parse(reader.result);
				var current = loadEntries();
				// Backups are keyed by date; merge (incoming wins on conflict).
				Object.keys(incoming).forEach(function (k) {
					if (incoming[k] && incoming[k].date && typeof incoming[k].mood === "number") {
						current[k] = incoming[k];
					}
				});
				saveEntries(current);
				renderAll();
				alert("Imported! Merged into your existing entries.");
			} catch (e) {
				alert("That file didn't look like a valid backup.");
			}
		};
		reader.readAsText(file);
	}

	function clearAll() {
		if (confirm("Delete ALL your entries from this device? This cannot be undone.")) {
			localStorage.removeItem(STORAGE_KEY);
			renderAll();
			loadIntoForm($("#entry-date").value);
		}
	}

	// ===================================================================
	// RENDER + WIRING
	// ===================================================================
	function renderAll() {
		var data = sortedEntries();
		renderHypothesis(data);
		renderScatter(data);
		renderAppBreakdown(data);
		renderTrend(data);
		renderHistory(data);
	}

	function switchTab(name) {
		document.querySelectorAll(".tab").forEach(function (t) {
			var active = t.dataset.tab === name;
			t.classList.toggle("is-active", active);
			t.setAttribute("aria-selected", active ? "true" : "false");
		});
		document.querySelectorAll(".panel").forEach(function (p) {
			p.classList.toggle("is-active", p.id === "tab-" + name);
		});
	}

	function init() {
		buildSocialInputs();
		$("#entry-date").value = todayISO();

		// Mood buttons
		document.querySelectorAll(".mood").forEach(function (b) {
			b.addEventListener("click", function () {
				setMood(Number(b.dataset.mood));
			});
		});

		// Date change -> load that day's entry
		$("#entry-date").addEventListener("change", function () {
			loadIntoForm(this.value);
		});

		$("#entry-form").addEventListener("submit", handleSubmit);

		// Tabs
		document.querySelectorAll(".tab").forEach(function (t) {
			t.addEventListener("click", function () {
				switchTab(t.dataset.tab);
			});
		});

		// History delete (event delegation)
		$("#history-list").addEventListener("click", function (e) {
			var btn = e.target.closest(".e-del");
			if (!btn) return;
			var date = btn.dataset.date;
			if (confirm("Delete entry for " + fmtDate(date) + "?")) {
				var entries = loadEntries();
				delete entries[date];
				saveEntries(entries);
				renderAll();
				if ($("#entry-date").value === date) loadIntoForm(date);
			}
		});

		// Data tab
		$("#contribute-btn").addEventListener("click", showContribute);
		$("#copy-btn").addEventListener("click", copyContribution);
		$("#email-btn").addEventListener("click", emailContribution);
		$("#download-research-btn").addEventListener("click", downloadResearch);
		$("#export-btn").addEventListener("click", exportBackup);
		$("#import-btn").addEventListener("click", function () {
			$("#import-file").click();
		});
		$("#import-file").addEventListener("change", function () {
			if (this.files[0]) importBackup(this.files[0]);
			this.value = "";
		});
		$("#clear-btn").addEventListener("click", clearAll);

		loadIntoForm(todayISO());
		renderAll();
	}

	document.addEventListener("DOMContentLoaded", init);
})();
