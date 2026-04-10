// =========================================
// 5 Color Mini Palette Watch — OLED Edition
// =========================================

const watchDisplay = document.querySelector('.watch-display');
const bodyColorSelect = document.getElementById('body-color');
const bandColorSelect = document.getElementById('band-color');
const qtyMinus = document.getElementById('qty-minus');
const qtyPlus = document.getElementById('qty-plus');
const qtyInput = document.getElementById('qty-input');
const addToCartBtn = document.getElementById('add-to-cart');
const cartFeedback = document.getElementById('cart-feedback');
const thumbBtns = document.querySelectorAll('.thumb-btn');

// =========================================
// Color Maps
// =========================================
const woodColors = {
	Walnut: { base: '#5c4033', light: '#7a5a47', dark: '#3d2b1f' },
	Ebony:  { base: '#1a1008', light: '#2e1e10', dark: '#0d0804' },
	Maple:  { base: '#c8a96e', light: '#dfc28e', dark: '#a88a52' },
};

const bandColors = {
	Black: { base: '#1a1a1a', light: '#2e2e2e' },
	Brown: { base: '#6b3a2a', light: '#8c4f38' },
	Tan:   { base: '#c4a882', light: '#d9c4a6' },
};

// =========================================
// Body Color Selector
// =========================================
bodyColorSelect.addEventListener('change', function () {
	const colors = woodColors[this.value];
	if (!colors) return;
	watchDisplay.style.setProperty('--wood-color', colors.base);
	watchDisplay.style.setProperty('--wood-light', colors.light);
	watchDisplay.style.setProperty('--wood-dark',  colors.dark);

	// Update closed-view thumbnail background
	const closedThumb = document.querySelector('.thumb-watch--closed');
	if (closedThumb) {
		closedThumb.style.background = colors.base;
	}
});

// =========================================
// Band Color Selector
// =========================================
bandColorSelect.addEventListener('change', function () {
	const colors = bandColors[this.value];
	if (!colors) return;
	watchDisplay.style.setProperty('--band-color', colors.base);
	watchDisplay.style.setProperty('--band-light', colors.light);
});

// =========================================
// Quantity Stepper
// =========================================
qtyMinus.addEventListener('click', function () {
	const current = parseInt(qtyInput.value, 10);
	qtyInput.value = Math.max(1, current - 1);
});

qtyPlus.addEventListener('click', function () {
	const current = parseInt(qtyInput.value, 10);
	qtyInput.value = current + 1;
});

qtyInput.addEventListener('change', function () {
	const val = parseInt(this.value, 10);
	this.value = isNaN(val) || val < 1 ? 1 : val;
});

// =========================================
// Add to Cart Button
// =========================================
let cartResetTimer = null;

addToCartBtn.addEventListener('click', function () {
	if (this.classList.contains('added')) return;

	this.textContent = 'Added \u2713';
	this.classList.add('added');
	cartFeedback.textContent =
		qtyInput.value + ' item' + (qtyInput.value > 1 ? 's' : '') + ' added to your cart';

	clearTimeout(cartResetTimer);
	cartResetTimer = setTimeout(function () {
		addToCartBtn.textContent = 'Add to cart';
		addToCartBtn.classList.remove('added');
		cartFeedback.textContent = '';
	}, 2500);
});

// =========================================
// Gallery Thumbnails — View Switcher
// =========================================
thumbBtns.forEach(function (btn) {
	btn.addEventListener('click', function () {
		// Update active state
		thumbBtns.forEach(function (b) {
			b.classList.remove('thumb-btn--active');
		});
		this.classList.add('thumb-btn--active');

		// Update watch view
		const view = this.dataset.view;
		watchDisplay.dataset.view = view;
	});
});
