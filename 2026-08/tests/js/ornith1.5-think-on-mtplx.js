function convertMainMarkdown() {
	var root = (typeof document !== 'undefined') ? document : null;
	var div = root ? root.getElementById('main') : null;
	if (!div) { return; }

	// --- helpers -----------------------------------------------------------

	// Escape literal HTML special characters (so they *display* as text).
	function htmlEscape(s) {
		return String(s)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	}

	var source = div.textContent; // ignores nested HTML tags, keeps text only

	// 1) Protect backslash escapes:  "\x" -> literal "x"
	var escapes = [];
	var protectedText = source.replace(/\\(.)/g, function (_, ch) {
		escapes.push(ch);
		return '\uE000' + (escapes.length - 1) + '\uE001'; // private-use sentinel
	});

	// 2) HTML-escape literal text once (sentinels contain no special chars).
	var escapedText = htmlEscape(protectedText);

	// 3) Link processor — handles nested [ ] and ( ) in text/URL.
	function processLinks(text) {
		var out = '';
		var i = 0, n = text.length;
		while (i < n) {
			if (text[i] === '[') {
				var depth = 0, close = -1, j;
				for (j = i; j < n; j++) {
					if (text[j] === '[') { depth++; }
					else if (text[j] === ']') { depth--; if (depth === 0) { close = j; break; } }
				}
				if (close > -1 && (j + 1) < n && text[j + 1] === '(') {
					var pd = 0, closeP = -1, k;
					for (k = j + 2; k < n; k++) {
						if (text[k] === '(') { pd++; }
						else if (text[k] === ')') { pd--; if (pd === 0) { closeP = k; break; } }
					}
					if (closeP > -1) {
						var linkText = text.slice(i + 1, close);
						var urlPart = text.slice(j + 2, closeP);
						var title = '', url;
						var m = urlPart.match(/\s+"([^"]*)"\s*$/);
						if (m) { title = m[1]; url = urlPart.slice(0, m.index); }
						else   { url = urlPart; }
						url = url.replace(/^\s+|\s+$/g, '');
						var attrs = 'href="' + url + '"';
						if (title) { attrs += ' title="' + title + '"'; }
						out += '<a ' + attrs + '>' + processMarkers(linkText) + '</a>';
						i = closeP + 1;
						continue;
					}
				}
			}
			out += text[i];
			i++;
		}
		return out;
	}

	// 4) Inline formatter (underline, bold, italic). Text is already HTML-escaped,
	//    so recursion handles arbitrary nesting without double-escaping.
	function processMarkers(text) {
		text = processLinks(text);
		text = text.replace(/==(.+?)==/g, function (_, c) { return '<u>'  + processMarkers(c) + '</u>'; });   // underline: ==x==
		text = text.replace(/\*\*(.+?)\*\*/g, function (_, c) { return '<strong>' + processMarkers(c) + '</strong>'; }); // **x**
		text = text.replace(/__(.+?)__/g,   function (_, c) { return '<strong>' + processMarkers(c) + '</strong>'; }); // __x__
		text = text.replace(/\*(.+?)\*/g,   function (_, c) { return '<em>'   + processMarkers(c) + '</em>'; });     // *x*
		text = text.replace(/_(.+?)_/g,    function (_, c) { return '<em>'   + processMarkers(c) + '</em>'; });     // _x_
		return text;
	}

	// 5) Block-level: headings and bullets.
	var lines = escapedText.split(/\r\n|\r|\n/);
	var block = [], inList = false;
	for (var li = 0; li < lines.length; li++) {
		var line = lines[li];

		var h = line.match(/^(#{1,6})\s+(.+?)\s*$/);   // # .. ######
		if (h) {
			if (inList) { block.push('</ul>'); inList = false; }
			var lvl = h[1].length;
			block.push('<h' + lvl + '>' + processMarkers(h[2]) + '</h' + lvl + '>');
			continue;
		}

		var b = line.match(/^( *)[-*+]\s+(.+?)\s*$/);   // - / * / + bullets
		if (b) {
			if (!inList) { block.push('<ul>'); inList = true; }
			block.push('<li>' + processMarkers(b[2]) + '</li>');
			continue;
		}

		if (inList) { block.push('</ul>'); inList = false; }
		block.push(processMarkers(line));
	}
	if (inList) { block.push('</ul>'); }
	var blockHtml = block.join('\n');

	// 6) Wrap consecutive <li> runs in <ul>.
	blockHtml = blockHtml.replace(/((?:<li>[\s\S]*?<\/li>\s*)+)/g, function (group) {
		return '<ul>\n' + group + '</ul>';
	});

	// 7) Restore escaped characters as literal (HTML-escaped) text.
	var finalHtml = blockHtml.replace(/\uE000(\d+)\uE001/g, function (_, idx) {
		var ch = escapes[+idx];
		return ch == null ? '' : htmlEscape(ch);
	});

	// 8) Apply once.
	div.innerHTML = finalHtml;
	return finalHtml;
}

function run() {
	convertMainMarkdown();
}
