/* Proctre.com page behavior: footer year and optional footer email. */
(function () {
	var year = document.getElementById('year');
	if (year) year.textContent = new Date().getFullYear();

	/* The email address is assembled here so crawlers can't read it from the page source. */
	document.querySelectorAll('.foot-email').forEach(function (a) {
		var u = a.dataset.user, d = a.dataset.domain;
		if (!u || !d) return;
		a.href = 'mailto:' + u + '@' + d;
		a.textContent = u + '@' + d;
		a.hidden = false;
	});
})();
