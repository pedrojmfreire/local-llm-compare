function convertMarkdownInMain() {
    const div = document.getElementById('main');
    if (!div) return;

    // Get raw text content — this ignores any nested HTML tags
    const markdown = div.textContent;

    // Convert and replace
    div.innerHTML = markdownToHtml(markdown);
}

/* ─── Block-level: headings, bullets, paragraphs ─── */

function markdownToHtml(markdown) {
    const lines = markdown.split('\n');
    let html = '';
    let inList = false;
    let paraLines = [];

    function flushPara() {
        if (paraLines.length) {
            html += '<p>' + paraLines.map(parseInline).join('<br>') + '</p>';
            paraLines = [];
        }
    }

    function closeList() {
        if (inList) { html += '</ul>'; inList = false; }
    }

    for (const line of lines) {
        // Heading: # to ######
        const h = line.match(/^(#{1,6})\s+(.*)/);
        if (h) {
            flushPara(); closeList();
            const lvl = h[1].length;
            html += `<h${lvl}>${parseInline(h[2])}</h${lvl}>`;
            continue;
        }

        // Bullet: - or * followed by a space
        const b = line.match(/^[-*]\s+(.*)/);
        if (b) {
            flushPara();
            if (!inList) { html += '<ul>'; inList = true; }
            html += `<li>${parseInline(b[1])}</li>`;
            continue;
        }

        // Blank line → paragraph / list separator
        if (line.trim() === '') {
            flushPara(); closeList();
            continue;
        }

        // Regular text line
        closeList();
        paraLines.push(line);
    }

    flushPara();
    closeList();
    return html;
}

/* ─── Inline: bold, italic, underline, links, escapes (recursive for nesting) ─── */

function parseInline(text) {
    let result = '';
    let i = 0;

    while (i < text.length) {
        // ── Escape character ──
        if (text[i] === '\\' && i + 1 < text.length) {
            const next = text[i + 1];
            if (next === '*' || next === '_' || next === '\\' ||
                next === '[' || next === ']' || next === '(' || next === ')') {
                result += next;
                i += 2;
                continue;
            }
            // Unrecognised escape: keep the backslash literally
            result += text[i];
            i++;
            continue;
        }

        // ── Bold: **text** ──
        if (text[i] === '*' && text[i + 1] === '*') {
            const close = findClose(text, i + 2, '*');
            if (close !== -1) {
                const inner = text.substring(i + 2, close);
                result += '<strong>' + parseInline(inner) + '</strong>';
                i = close + 2;
                continue;
            }
            // No valid close → treat as literal
            result += text[i]; i++;
            continue;
        }

        // ── Italic: *text* ──
        if (text[i] === '*') {
            const close = findCloseSingle(text, i + 1, '*');
            if (close !== -1) {
                const inner = text.substring(i + 1, close);
                result += '<em>' + parseInline(inner) + '</em>';
                i = close + 1;
                continue;
            }
            result += text[i]; i++;
            continue;
        }

        // ── Underline: __text__ ──
        if (text[i] === '_' && text[i + 1] === '_') {
            const close = findClose(text, i + 2, '_');
            if (close !== -1) {
                const inner = text.substring(i + 2, close);
                result += '<u>' + parseInline(inner) + '</u>';
                i = close + 2;
                continue;
            }
            result += text[i]; i++;
            continue;
        }

        // ── Italic: _text_ ──
        if (text[i] === '_') {
            const close = findCloseSingle(text, i + 1, '_');
            if (close !== -1) {
                const inner = text.substring(i + 1, close);
                result += '<em>' + parseInline(inner) + '</em>';
                i = close + 1;
                continue;
            }
            result += text[i]; i++;
            continue;
        }

        // ── Hyperlink: [text](url) ──
        if (text[i] === '[') {
            const bracket = findMatching(text, i, '[', ']');
            if (bracket !== -1 && bracket + 1 < text.length && text[bracket + 1] === '(') {
                const paren = findMatching(text, bracket + 2, '(', ')');
                if (paren !== -1) {
                    const linkText = text.substring(i + 1, bracket);
                    const url = text.substring(bracket + 2, paren);
                    result += `<a href="${url}">${parseInline(linkText)}</a>`;
                    i = paren + 1;
                    continue;
                }
            }
            result += text[i]; i++;
            continue;
        }

        // ── Default: copy character ──
        result += text[i];
        i++;
    }

    return result;
}

/* ─── Helper: find closing double marker (**) or (__) ───
   Scans for the next pair; a single character is skipped (it's inner nesting). */
function findClose(text, start, ch) {
    let i = start;
    while (i < text.length) {
        if (text[i] === '\\') { i += 2; continue; }
        if (text[i] === ch && text[i + 1] === ch) return i;
        i++;
    }
    return -1;
}

/* ─── Helper: find closing single marker (*) or (_) ───
   A pair (**) or (__) is skipped; only a lone character closes. */
function findCloseSingle(text, start, ch) {
    let i = start;
    while (i < text.length) {
        if (text[i] === '\\') { i += 2; continue; }
        if (text[i] === ch) {
            if (text[i + 1] === ch) { i += 2; continue; } // skip the pair
            return i;
        }
        i++;
    }
    return -1;
}

/* ─── Helper: find matching bracket/paren (handles nesting) ─── */
function findMatching(text, openIdx, openCh, closeCh) {
    let depth = 1;
    let i = openIdx + 1;
    while (i < text.length) {
        if (text[i] === '\\') { i += 2; continue; }
        if (text[i] === openCh) depth++;
        else if (text[i] === closeCh) {
            depth--;
            if (depth === 0) return i;
        }
        i++;
    }
    return -1;
}

function run() {
  convertMarkdownInMain();
}
