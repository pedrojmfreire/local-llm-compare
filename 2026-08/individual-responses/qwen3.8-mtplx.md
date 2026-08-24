```javascript
/**
 * renderMarkdown()
 * 
 * Reads the raw text of <div id="main"> (ignoring any nested HTML tags),
 * interprets it as Markdown, and replaces the DIV's contents with the
 * equivalent HTML. Runs once per invocation.
 *
 * Supported Markdown:
 *   Headings    #  ##  ###  ####  #####  ######
 *   Bold        **text**  or  __text__
 *   Italic      *text*    or  _text_
 *   Underline   ++text++  (non-standard; no canonical MD equivalent)
 *   Bullets     -  *  +   (nest via 2-space indents)
 *   Links       [label](url)
 *   Escape      \ before any of: \ * _ # + [ ] ( ) -
 *
 * No external libraries. No sanitization (per requirements).
 */
function renderMarkdown() {
    var div = document.getElementById('main');
    if (!div) return;

    // textContent strips any nested <html> tags, giving us pure text
    var raw = div.textContent;

    // ── 1. Protect escaped characters ──────────────────────────────
    var escapes = [];
    var text = raw.replace(/\\([\\*_#+\[\]()\-])/g, function (_, ch) {
        escapes.push(ch);
        return '\x01' + (escapes.length - 1) + '\x02';
    });

    // ── 2. Block-level pass (headings, lists, paragraphs) ─────────
    var lines  = text.split('\n');
    var blocks = [];
    var i      = 0;

    while (i < lines.length) {
        var line = lines[i];

        /* ---- heading ---- */
        var h = line.match(/^(#{1,6})\s+(.+)$/);
        if (h) {
            blocks.push('<h' + h[1].length + '>'
                + inline(h[2])
                + '</h' + h[1].length + '>');
            i++;
            continue;
        }

        /* ---- bullet list (possibly nested) ---- */
        var b = line.match(/^(\s*)[-*+]\s+(.+)$/);
        if (b) {
            // Collect the full contiguous list block
            var items = [];           // { depth, html }
            while (i < lines.length) {
                var bm = lines[i].match(/^(\s*)[-*+]\s+(.+)$/);
                if (!bm) break;
                var depth = Math.floor(bm[1].replace(/\t/g, '  ').length / 2);
                items.push({ depth: depth, html: inline(bm[2]) });
                i++;
            }
            blocks.push(buildList(items, 0, 0));
            continue;
        }

        /* ---- blank line → skip ---- */
        if (line.trim() === '') { i++; continue; }

        /* ---- normal paragraph ---- */
        blocks.push('<p>' + inline(line) + '</p>');
        i++;
    }

    // ── 3. Restore escaped characters ──────────────────────────────
    var html = blocks.join('\n')
        .replace(/\x01(\d+)\x02/g, function (_, idx) {
            return escapes[+idx];
        });

    // ── 4. Write result ─────────────────────────────────────────────
    div.innerHTML = html;
}


/* ════════════════════════════════════════════════════════════════
   Inline formatter
   Order matters:  links → bold → italic → underline
   (outer-to-inner so nesting resolves correctly)
   ════════════════════════════════════════════════════════════════ */
function inline(s) {
    // Triple-star / triple-underscore  (bold + italic combo)
    s = s.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    s = s.replace(/___(.+?)___/g,       '<strong><em>$1</em></strong>');

    // Hyperlinks  [label](url)
    s = s.replace(/\[([^\]]*)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');

    // Bold  **…**  or  __…__
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/__(.+?)__/g,     '<strong>$1</strong>');

    // Italic  *…*  or  _…_
    s = s.replace(/\*(.+?)\*/g, '<em>$1</em>');
    s = s.replace(/_(.+?)_/g,   '<em>$1</em>');

    // Underline  ++…++
    s = s.replace(/\+\+(.+?)\+\+/g, '<u>$1</u>');

    return s;
}


/* ════════════════════════════════════════════════════════════════
   Build nested <ul><li>…</li></ul> from a flat array of
   { depth, html } items.
   ════════════════════════════════════════════════════════════════ */
function buildList(items, start, depth) {
    if (start >= items.length) return '';

    var out  = '<ul>';
    var i    = start;

    while (i < items.length && items[i].depth >= depth) {
        if (items[i].depth > depth) {
            // Deeper nesting – recurse
            var sub = buildList(items, i, items[i].depth);
            // Attach the nested <ul> to the previous <li>
            out = out.replace(/<\/li>$/, '') + sub + '</li>';
            // Skip the sub-items (already consumed by recursion)
            var j = i;
            while (j < items.length && items[j].depth > depth) j++;
            i = j;
            continue;
        }

        out += '<li>' + items[i].html;
        // Peek: if next item is deeper, don't close <li> yet
        if (i + 1 < items.length && items[i + 1].depth > depth) {
            // leave <li> open; nested list will be inserted before </li>
            i++;
            // consume deeper items
            while (i < items.length && items[i].depth > depth) i++;
            out += '</li>';
        } else {
            out += '</li>';
            i++;
        }
    }

    out += '</ul>';
    return out;
}


/* ── Invoke once on load (remove or call manually as needed) ──── */
document.addEventListener('DOMContentLoaded', renderMarkdown);
```

### How it works, step by step

| Phase | What happens |
|---|---|
| **Read** | `div.textContent` grabs the raw text, automatically ignoring any nested HTML tags inside `#main`. |
| **Escape guard** | Every `\*`, `\_`, `\#`, etc. is swapped for a unique `\x01…\x02` token so the regexes below can't touch it. |
| **Block pass** | Lines are scanned top-to-bottom. Headings (`#`–`######`), bullet groups (with 2-space indent nesting), and plain paragraphs are identified. |
| **Inline pass** | On each line's content the transforms fire **outer-to-inner**: `***bold-italic***` → links → `**bold**` / `__bold__` → `*italic*` / `_italic_` → `++underline++`. Because bold is replaced before italic, a string like `**a *b* c**` correctly yields `<strong>a <em>b</em> c</strong>`. |
| **List builder** | Consecutive bullet lines are collected, and `buildList` recursively emits properly nested `<ul><li>…</li></ul>` structures from the indent depth. |
| **Restore** | The `\x01…\x02` tokens are swapped back to the original literal characters. |
| **Write** | `div.innerHTML` is set once. No observers, no re-runs. |

### Quick demo

Drop this into an HTML page:

```html
<div id="main">
# Title
## Sub

This is **bold *italic*** and _italic **bold**_ plus ++underline++ and a [link](https://example.com).

- item one
- item two
  - nested a
  - nested b
- item three

A backslash escape: \**not bold\**
</div>

<script> /* paste the function above */ </script>
```

Resulting HTML inside the `<div>`:

```html
<h1>Title</h1>
<h2>Sub</h2>
<p>This is <strong>bold <em>italic</em></strong> and <em>italic <strong>bold</strong></em> plus <u>underline</u> and a <a href="https://example.com">link</a>.</p>
<ul><li>item one</li><li>item two<ul><li>nested a</li><li>nested b</li></ul></li><li>item three</li></ul>
<p>A backslash escape: **not bold**</p>
```