/* Proctre.com console behavior: charge bar, signal scope, menu highlight, footer details. */
(function () {
	var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	/* Footer year and (optional) email, assembled here so crawlers can't read it from the source. */
	var year = document.getElementById('year');
	if (year) year.textContent = new Date().getFullYear();
	document.querySelectorAll('.foot-email').forEach(function (a) {
		var u = a.dataset.user, d = a.dataset.domain;
		if (!u || !d) return;
		a.href = 'mailto:' + u + '@' + d;
		a.textContent = u + '@' + d;
		a.hidden = false;
	});

	/* Charge bar: 20 segments that fill on load. */
	var bar = document.getElementById('charge'), SEGS = 20;
	if (bar) {
		for (var i = 0; i < SEGS; i++) bar.appendChild(document.createElement('i'));
		var segs = bar.children, lit = 0;
		if (reduce) { for (var j = 0; j < SEGS; j++) segs[j].className = 'on'; }
		else {
			var timer = setInterval(function () {
				segs[lit++].className = 'on';
				if (lit >= SEGS) clearInterval(timer);
			}, 110);
		}
	}

	/* Menu: highlight the section currently on screen. */
	var links = [].slice.call(document.querySelectorAll('.menu a'));
	var byId = {};
	links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
	function select(id) {
		if (!byId[id]) return;
		links.forEach(function (a) { a.classList.toggle('sel', a === byId[id]); });
	}
	links.forEach(function (a) { a.addEventListener('click', function () { select(a.getAttribute('href').slice(1)); }); });
	if ('IntersectionObserver' in window) {
		var spy = new IntersectionObserver(function (es) {
			es.forEach(function (e) { if (e.isIntersecting) select(e.target.id); });
		}, { rootMargin: '-35% 0px -55% 0px' });
		Object.keys(byId).forEach(function (id) { var el = document.getElementById(id); if (el) spy.observe(el); });
	}

	/* Signal scope: gold and cyan traces with a moving cursor. Paused when off screen. */
	var c = document.getElementById('wave');
	if (!c || !c.getContext) return;
	var x = c.getContext('2d'), t0 = performance.now(), raf = null, visible = true;

	function size() {
		var r = c.getBoundingClientRect(), d = window.devicePixelRatio || 1;
		c.width = Math.round(r.width * d);
		c.height = Math.round(r.height * d);
		x.setTransform(d, 0, 0, d, 0, 0);
	}
	function trace(w, h, t, color, phase, amp) {
		x.strokeStyle = color; x.lineWidth = 1.4; x.shadowColor = color; x.shadowBlur = 8;
		for (var layer = 0; layer < 3; layer++) {
			x.globalAlpha = layer ? 0.35 : 1;
			x.beginPath();
			for (var px = 0; px <= w; px += 3) {
				var u = px / w, env = Math.sin(u * Math.PI);
				var y = h / 2 + env * amp * (Math.sin(u * 22 + t * 2.1 + phase + layer * 0.6) * 0.6 + Math.sin(u * 51 - t * 3.3 + layer) * 0.3 + Math.sin(u * 7 + t * 0.7) * 0.4);
				if (px) x.lineTo(px, y); else x.moveTo(px, y);
			}
			x.stroke();
		}
		x.globalAlpha = 1; x.shadowBlur = 0;
	}
	function draw(now) {
		var w = c.clientWidth, h = c.clientHeight, t = (now - t0) / 1000;
		x.clearRect(0, 0, w, h);
		x.strokeStyle = 'rgba(63,143,178,.25)'; x.lineWidth = 1;
		for (var g = 0; g <= 8; g++) { x.beginPath(); x.moveTo(w * g / 8, 0); x.lineTo(w * g / 8, h); x.stroke(); }
		x.beginPath(); x.moveTo(0, h / 2); x.lineTo(w, h / 2); x.stroke();
		trace(w, h, t, '#e8b35a', 0, h * 0.32);
		trace(w, h, t * 1.15, '#62d6ff', 2.1, h * 0.26);
		if (!reduce) {
			var cx = ((t * 0.18) % 1) * w;
			x.strokeStyle = 'rgba(217,238,248,.8)';
			x.beginPath(); x.moveTo(cx, 4); x.lineTo(cx, h - 4); x.stroke();
			x.fillStyle = '#d9eef8'; x.font = '11px "Share Tech Mono", monospace';
			x.fillText('T+' + t.toFixed(1), Math.min(cx + 6, w - 48), 14);
			raf = visible ? requestAnimationFrame(draw) : null;
		} else {
			raf = null;
		}
	}
	function run() { if (!raf) raf = requestAnimationFrame(draw); }

	window.addEventListener('resize', function () { size(); if (reduce) run(); });
	if ('IntersectionObserver' in window && !reduce) {
		new IntersectionObserver(function (es) {
			visible = es[0].isIntersecting;
			if (visible) run();
		}).observe(c);
	}
	size();
	run();   // with reduced motion this draws a single still frame
})();
