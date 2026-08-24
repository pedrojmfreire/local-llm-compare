
```javascript
/**
 * markdown-to-html.js
 *
 * Finds a <div id="main">, reads its plain text content (nested HTML tags
 * are ignored — only the text nodes are read), treats that text as
 * Markdown, and replaces the div's content with the equivalent HTML.
 * Runs once per call.
 *
 * Supported syntax:
 *   # .. ######   -> <h1> .. <h6>          (must be at start of line, "# text")
 *   **text**      -> <strong>text</strong>
 *   *text*        -> <em>text</em>
 *   _text_        -> <u>text</u>            (non-standard: this is our underline syntax)
 *   [text](url)   -> <a href="url">text</a>
 *   - text / * text (line start, "- " or "* ") -> <li> inside a <ul>
 *   \X            -> literal "X" (escapes any character, e.g. \*, \_, \[, \\)
 *
 * Bold/italic/underline/links may be nested inside one another, e.g.:
 *   **bold with *italic* and [a **bold** link](url)**
 *
 * No HTML sanitization is performed and no external libraries are used.
 */
function convertMarkdownInMain() {
  const container = document.getElementById('main');
  if (!container) return;

  // Read only the text content, ignoring any nested HTML tags.
  const rawText = container.textContent;

  container.innerHTML = markdownToHtml(rawText);

  // ---------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function escapeAttr(str) {
    return escapeHtml(str).replace(/"/g, '&quot;');
  }

  /**
   * A stop delimiter matches only when it isn't part of a longer run of
   * the same character. This is what lets a lone "*" (italic) coexist
   * with "**" (bold) without one accidentally closing the other, e.g.
   * in "*text **bold** more*".
   */
  function matchesStop(text, pos, stop) {
    if (!text.startsWith(stop, pos)) return false;
    if (stop.length === 1) {
      const c = stop;
      const prevSame = pos > 0 && text[pos - 1] === c;
      const nextSame = text[pos + 1] === c;
      if (prevSame || nextSame) return false;
    }
    return true;
  }

  /**
   * Recursive-descent inline parser.
   * Parses `text` starting at `pos` until either the end of the string,
   * or (if `stop` is given) an unescaped occurrence of the `stop`
   * delimiter, which is consumed.
   *
   * Returns { html, pos, closed } where `closed` indicates whether the
   * `stop` delimiter was actually found (relevant to the caller when
   * `stop` is non-null: if not closed, the caller should treat the
   * opening delimiter as a literal string instead of a tag).
   */
  function parseInline(text, pos, stop) {
    let out = '';

    while (pos < text.length) {
      if (stop && matchesStop(text, pos, stop)) {
        return { html: out, pos: pos + stop.length, closed: true };
      }

      const ch = text[pos];

      // Escaped character: backslash + any char is taken literally.
      if (ch === '\\' && pos + 1 < text.length) {
        out += escapeHtml(text[pos + 1]);
        pos += 2;
        continue;
      }

      // Link: [text](url)
      if (ch === '[') {
        const link = tryParseLink(text, pos);
        if (link) {
          out += link.html;
          pos = link.pos;
          continue;
        }
      }

      // Bold: **text**
      if (text.startsWith('**', pos)) {
        const inner = parseInline(text, pos + 2, '**');
        if (inner.closed) {
          out += `<strong>${inner.html}</strong>`;
          pos = inner.pos;
          continue;
        }
        // no closing "**" found -> fall through, "*" will be handled
        // below as (possibly) the start of an italic span instead.
      }

      // Italic: *text*  (a lone "*", not part of a "**" run)
      if (ch === '*') {
        const inner = parseInline(text, pos + 1, '*');
        if (inner.closed) {
          out += `<em>${inner.html}</em>`;
          pos = inner.pos;
          continue;
        }
      }

      // Underline: _text_
      if (ch === '_') {
        const inner = parseInline(text, pos + 1, '_');
        if (inner.closed) {
          out += `<u>${inner.html}</u>`;
          pos = inner.pos;
          continue;
        }
      }

      // Plain character.
      out += escapeHtml(ch);
      pos += 1;
    }

    return { html: out, pos, closed: false };
  }

  /** text[pos] is assumed to be '['. Tries to parse a [text](url) link. */
  function tryParseLink(text, pos) {
    const inner = parseInline(text, pos + 1, ']');
    if (!inner.closed) return null;

    let p = inner.pos;
    if (text[p] !== '(') return null;
    p += 1;

    const urlStart = p;
    while (p < text.length && text[p] !== ')') {
      if (text[p] === '\\' && p + 1 < text.length) {
        p += 2;
      } else {
        p += 1;
      }
    }
    if (text[p] !== ')') return null;

    const rawUrl = text.slice(urlStart, p).replace(/\\(.)/g, '$1');

    return {
      html: `<a href="${escapeAttr(rawUrl)}">${inner.html}</a>`,
      pos: p + 1
    };
  }

  // ---------------------------------------------------------------------
  // Block-level parsing (headings, bullet lists, paragraphs)
  // ---------------------------------------------------------------------

  function markdownToHtml(raw) {
    const lines = raw.replace(/\r\n?/g, '\n').split('\n');
    const blocks = [];
    let inList = false;

    for (const line of lines) {
      const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
      const bulletMatch = line.match(/^[*-]\s+(.*)$/);

      if (headingMatch) {
        if (inList) { blocks.push('</ul>'); inList = false; }
        const level = headingMatch[1].length;
        const content = parseInline(headingMatch[2], 0, null).html;
        blocks.push(`<h${level}>${content}</h${level}>`);
      } else if (bulletMatch) {
        if (!inList) { blocks.push('<ul>'); inList = true; }
        const content = parseInline(bulletMatch[1], 0, null).html;
        blocks.push(`<li>${content}</li>`);
      } else if (line.trim() === '') {
        if (inList) { blocks.push('</ul>'); inList = false; }
      } else {
        if (inList) { blocks.push('</ul>'); inList = false; }
        blocks.push(`<p>${parseInline(line, 0, null).html}</p>`);
      }
    }

    if (inList) blocks.push('</ul>');

    return blocks.join('\n');
  }
}

// Run once:
// convertMarkdownInMain();
```

A few notes on how it works:

- **Reading input**: it uses `container.textContent`, which collects only text nodes and ignores any nested tags, per your requirement.
- **Syntax it recognizes**: `# `…`###### ` for headings, `**bold**`, `*italic*`, `_underline_` (markdown has no native underline, so I picked single-underscore for it), `[text](url)`, and lines starting with `- ` or `* ` for bullets. Backslash escapes any character (`\*`, `\_`, `\[`, `\\`, etc.).
- **Nesting**: it's a small recursive-descent parser (not regex-based), so bold/italic/underline/links can nest inside each other in any combination, e.g. `**bold with *italic* and [a **bold** link](url)**` resolves correctly. The tricky part — distinguishing a lone `*` (italic) from `**` (bold) when they're mixed — is handled by only treating a `*` as a valid closing delimiter when it's not adjacent to another `*`.
- **No sanitization**: text is escaped for `&`, `<`, `>` (and `"` in the link `href`) just so the output renders as intended — it does not attempt to block `javascript:` URLs or similar, as requested.
- **Invocation**: call `convertMarkdownInMain()` once; it does a single one-time replacement of `#main`'s content.
- 