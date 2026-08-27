/**
 * renderMarkdownMain()
 *   Finds <div id="main">, reads its plain-text content (nested HTML tags
 *   ignored), converts Markdown to HTML, and writes it back ONCE.
 *
 *   Supported:
 *       # .. ######   -> <h1>..<h6>      (headings)
 *       **b** / __b__ -> <strong>        (bold)
 *       *i*  / _i_    -> <em>            (italic)
 *       ==u==         -> <u>             (underline)
 *       - / * / +     -> <ul><li>        (bullets)
 *       [label](url)  -> <a>             (hyperlinks)
 *   Nesting of the above is supported; backslash escapes (\* \# \[ ...) render literally.
 *
 *   NOTE: No sanitization is performed. If `main` can hold untrusted Markdown,
 *   treat the output as unsafe (scripts can be embedded, e.g. via a
 *   javascript: URL in a link).
 */
(function () {
  'use strict';

  /* ---- single-character HTML escaping ------------------------------ */
  var ENT = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  function esc(ch) { return ENT[ch] != null ? ENT[ch] : ch; }

  /* ---- Markdown -> HTML -------------------------------------------- */
  function processMarkdown(raw) {
    var ESC = '\uE000';   // private-use placeholder marker
    var store = [];

    // Protect backslash escapes as <U+E000><n> tokens; the real character is
    // kept in store[n-1] and restored at the very end.
    var protectedText = raw.replace(/\\([\\*_=\[\]()#.!+-])/g, function (m, ch) {
      store.push(esc(ch));
      return ESC + store.length;
    });

    var html = buildBlocks(protectedText);

    return html.replace(new RegExp(ESC + '(\\d+)', 'g'), function (m, n) {
      return store[parseInt(n, 10) - 1] || '';
    });
  }

  /* ---- block-level: headings + lists ------------------------------- */
  function buildBlocks(text) {
    var lines = text.split(/\r?\n/);
    var out = '';
    var inList = false;
    var para = [];

    function flush() {
      if (para.length) {
        out += '<p>' + inline(para.join(' ')) + '</p>\n';
        para = [];
      }
    }

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];

      var h = line.match(/^(#{1,6})\s+(.+)$/);
      if (h) {
        flush();
        if (inList) { out += '</ul>\n'; inList = false; }
        out += '<h' + h[1].length + '>' + inline(h[2].trim()) + '</h' + h[1].length + '>\n';
        continue;
      }

      var li = line.match(/^[-*+]\s+(.+)$/);
      if (li) {
        flush();
        if (!inList) { out += '<ul>\n'; inList = true; }
        out += '<li>' + inline(li[1]) + '</li>\n';
        continue;
      }

      if (inList) { out += '</ul>\n'; inList = false; }
      if (line.trim() === '') { flush(); continue; }
      para.push(line);
    }

    flush();
    if (inList) out += '</ul>\n';
    return out;
  }

  /* ---- inline Markdown -> HTML (arbitrary nesting) ------------------ */
  function inline(text) {
    var out = '';
    var i = 0;
    var len = text.length;

    while (i < len) {
      var c = text[i];

      // Hyperlink: [label](url)
      if (c === '[') {
        var cb = text.indexOf(']', i + 1);
        if (cb > -1 && text[cb + 1] === '(') {
          var cp = text.indexOf(')', cb + 2);
          if (cp > -1) {
            out += '<a href="' + text.slice(cb + 2, cp) + '">'
                 + inline(text.slice(i + 1, cb)) + '</a>';
            i = cp + 1;
            continue;
          }
        }
        out += esc(c); i++; continue;
      }

      // Bold: ** or __
      if ((c === '*' && text[i + 1] === '*') ||
          (c === '_' && text[i + 1] === '_')) {
        var close = text.indexOf(c + c, i + 2);
        if (close > -1) {
          out += '<strong>' + inline(text.slice(i + 2, close)) + '</strong>';
          i = close + 2;
          continue;
        }
      }

      // Italic: * (lenient) or _ (boundary-checked to avoid _word_word_)
      if (c === '*') {
        var closeA = text.indexOf('*', i + 1);
        if (closeA > -1) {
          out += '<em>' + inline(text.slice(i + 1, closeA)) + '</em>';
          i = closeA + 1;
          continue;
        }
      } else if (c === '_') {
        var closeB = text.indexOf('_', i + 1);
        var beforeOK = i === 0 || !/[A-Za-z0-9]/.test(text[i - 1]);
        var afterOK  = closeB < 0 || closeB + 1 >= len
                       || !/[A-Za-z0-9]/.test(text[closeB + 1]);
        if (closeB > -1 && beforeOK && afterOK) {
          out += '<em>' + inline(text.slice(i + 1, closeB)) + '</em>';
          i = closeB + 1;
          continue;
        }
      }

      // Underline: ==
      if (c === '=' && text[i + 1] === '=') {
        var closeU = text.indexOf('==', i + 2);
        if (closeU > -1) {
          out += '<u>' + inline(text.slice(i + 2, closeU)) + '</u>';
          i = closeU + 2;
          continue;
        }
      }

      out += esc(c);
      i++;
    }

    return out;
  }

  /* ---- public API -------------------------------------------------- */
  function renderMarkdownMain() {
    var main = document.getElementById('main');
    if (!main) return;
    main.innerHTML = processMarkdown(main.textContent);
  }

  window.renderMarkdownMain = renderMarkdownMain;
  window.parseMarkdown = function (t) { return processMarkdown(t); };
})();

function run() {
	// Call once the #main element exists in the DOM:
	renderMarkdownMain();
}