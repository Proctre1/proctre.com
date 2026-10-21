/* Proctre.com motion: transporter beam-in on the logo, and a radar sweep behind the hero.
   Both are skipped for visitors who ask their device for reduced motion. */
(function () {
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

	/* ---------- Beam-in logo (runs once per page load) ---------- */
	var brand = document.querySelector('.brand');
	if (brand) {
		var text = brand.textContent;
		brand.textContent = '';
		text.split('').forEach(function (c, i) {
			var s = document.createElement('span');
			s.className = 'ch';
			s.style.animationDelay = (0.35 + i * 0.07) + 's';
			s.textContent = c;
			brand.appendChild(s);
		});
		brand.classList.add('beam');
	}

	/* ---------- Radar sweep ---------- */
	var canvas = document.getElementById('radar');
	if (!canvas || !canvas.getContext) return;
	var ctx = canvas.getContext('2d');
	if (typeof ctx.createConicGradient !== 'function') return;   // older browsers: no radar, page is unchanged

	var TAU = Math.PI * 2, PERIOD = 4200;
	var blips = [
		{ a: 0.55, r: 0.42, c: '155,133,255', label: 'COMPOSITR' },
		{ a: 2.35, r: 0.68, c: '52,196,109', label: 'WORKING DOLLARS' },
		{ a: 4.20, r: 0.55, c: '255,143,61', label: 'SERMONAL' }
	];
	for (var i = 0; i < 9; i++) blips.push({ a: Math.random() * TAU, r: 0.2 + Math.random() * 0.75, c: '255,122,26' });

	var raf = null, start = performance.now(), visible = true;

	function size() {
		var r = canvas.getBoundingClientRect(), d = window.devicePixelRatio || 1;
		canvas.width = Math.round(r.width * d);
		canvas.height = Math.round(r.height * d);
		ctx.setTransform(d, 0, 0, d, 0, 0);
	}

	function draw(t) {
		var w = canvas.clientWidth, h = canvas.clientHeight;
		var wide = w > 760;
		var cx = wide ? w * 0.74 : w * 0.5, cy = h * 0.5;
		var R = wide ? Math.min(h * 0.46, w * 0.24) : Math.min(h * 0.44, w * 0.42);
		var ang = (((t - start) % PERIOD) / PERIOD) * TAU - Math.PI / 2;

		ctx.clearRect(0, 0, w, h);
		ctx.save();
		ctx.globalAlpha = wide ? 1 : 0.55;

		// Scope: rings, cross-hairs, tick marks
		ctx.strokeStyle = 'rgba(255,122,26,.22)';
		ctx.lineWidth = 1;
		for (var k = 1; k <= 4; k++) { ctx.beginPath(); ctx.arc(cx, cy, R * k / 4, 0, TAU); ctx.stroke(); }
		ctx.beginPath();
		ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy);
		ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy + R);
		ctx.stroke();
		for (var d = 0; d < 72; d++) {
			var ta = d / 72 * TAU, len = d % 6 === 0 ? 8 : 4;
			ctx.beginPath();
			ctx.moveTo(cx + Math.cos(ta) * R, cy + Math.sin(ta) * R);
			ctx.lineTo(cx + Math.cos(ta) * (R - len), cy + Math.sin(ta) * (R - len));
			ctx.stroke();
		}

		// Beam: a wedge trailing about 70 degrees behind the leading edge
		var g = ctx.createConicGradient(ang - 1.25, cx, cy);
		g.addColorStop(0, 'rgba(255,122,26,0)');
		g.addColorStop(1.2 / TAU, 'rgba(255,122,26,.28)');
		g.addColorStop(1.25 / TAU, 'rgba(255,170,90,.55)');
		g.addColorStop(1.26 / TAU, 'rgba(255,122,26,0)');
		g.addColorStop(1, 'rgba(255,122,26,0)');
		ctx.fillStyle = g;
		ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, ang - 1.25, ang + 0.01); ctx.closePath(); ctx.fill();
		ctx.strokeStyle = 'rgba(255,190,120,.9)';
		ctx.lineWidth = 1.5;
		ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ang) * R, cy + Math.sin(ang) * R); ctx.stroke();

		// Blips: brightest just after the beam passes, fading over most of a rotation
		ctx.font = '700 11px "Space Grotesk", monospace';
		ctx.textBaseline = 'middle';
		for (var i = 0; i < blips.length; i++) {
			var b = blips[i], ba = b.a - Math.PI / 2;
			var since = ((ang - ba) % TAU + TAU) % TAU;
			var glow = Math.max(0, 1 - since / (Math.PI * 1.6));
			if (glow <= 0) continue;
			var x = cx + Math.cos(ba) * R * b.r, y = cy + Math.sin(ba) * R * b.r;
			var sz = b.label ? 4.5 : 2.5;
			ctx.fillStyle = 'rgba(' + b.c + ',' + (glow * 0.25) + ')';
			ctx.beginPath(); ctx.arc(x, y, sz * 3.2, 0, TAU); ctx.fill();
			ctx.fillStyle = 'rgba(' + b.c + ',' + glow + ')';
			ctx.beginPath(); ctx.arc(x, y, sz, 0, TAU); ctx.fill();
			if (b.label && wide) {
				ctx.fillStyle = 'rgba(' + b.c + ',' + Math.min(1, glow * 1.4) + ')';
				ctx.fillText(b.label, x + 10, y);
			}
		}
		ctx.restore();
		raf = requestAnimationFrame(draw);
	}

	function run() { if (!raf && visible) raf = requestAnimationFrame(draw); }
	function halt() { if (raf) { cancelAnimationFrame(raf); raf = null; } }

	// Only animate while the hero is on screen, to save battery.
	if ('IntersectionObserver' in window) {
		new IntersectionObserver(function (es) {
			visible = es[0].isIntersecting;
			visible ? run() : halt();
		}).observe(canvas);
	}
	window.addEventListener('resize', size);
	size();
	run();
})();
