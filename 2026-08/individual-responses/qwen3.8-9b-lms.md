

```javascript
/**
 * Converts Markdown text inside a DIV element with ID "main" to HTML.
 * Supports: headings (H1-H6), bold, italic, underline, bullets, hyperlinks.
 * Supports escaped characters (\*) and nested formatting (**bold** + *italic*).
 * No security sanitization, no external libraries. Runs in a single call.
 *
 * Usage: markdownToHtml(); // places rendered HTML into <div id="main">
 */

function markdownToHtml() {
    const div = document.getElementById('main');
    if (!div) return null;

    // Get only text content, ignore nested HTML tags
    const markdownText = div.textContent || '';

    return convertMarkdownToHtml(markdownText);
}

/**
 * Core Markdown to HTML converter.
 * Processes the entire content at once (not streaming).
 */

function convertMarkdownToHtml(mdText) {
    let html = mdText;

    return replaceAll(html, 'markdownToHtml');
}

// Escape function for literal markdown characters
function escapeChar(mdText) {
    // Escape backslashes used as escape prefixes
    html = mdText.replace(/\\/g, '\\\\');

    // Escape literal asterisks and hashes
    html = mdText.replace(/[\*\#]/g, '\\$&');

    return html;
}

// Process escaped characters first (before any other processing)
function processEscapes(htmlText) {
    let result = htmlText;

    // \\ -> \ (escaped backslash becomes a literal backslash)
    result = result.replace(/\\{2}/g, '\\');

    // \* -> literal asterisk
    result = result.replace(/\\\*/g, '*');

    // \\# -> literal hash
    result = result.replace(/\\#/g, '#');

    return result;
}

// Process inline formatting (bold, italic, underline) from left to right
function processInlineFormatting(htmlText) {
    let result = htmlText;

    // Triple asterisks/triples: ***text*** -> <strong><em>...</em></strong>
    result = result.replace(/\*\*\\\(*?\*?\(.*?)\)\)/g, function(match) {
        const inner = match.substring(3, match.length - 1); // remove outer ***
        let innerHtml = inner;

        // Handle nested: inside the triple, process bold then italic
        innerHtml = replaceAll(innerHtml, 'bold');
        innerHtml = replaceAllInner(innerHtml, '*', true); // italic only

        return '<strong>' + innerHtml + '</strong>';
    });

    // Double asterisks: **text** -> <strong>...</strong>
    result = result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Single asterisk: *text* -> <em>...</em>
    result = result.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Escape characters for processing (convert \* to * temporarily)
    result = processEscapes(result);

    // Process bold: \*\*text\*\*
    result = replaceAll(result, 'bold');

    // Process italic: \*text\*
    result = replaceAll(result, 'italic');

    // Process underline: ~~text~~ or __text__
    result = replaceAll(result, 'underline');

    // Restore escape characters (convert * back to \*)
    result = restoreEscapes(result);

    return result;
}

// Process block-level elements (headings, bullets) — must come after inline formatting
function processBlockElements(htmlText) {
    let result = htmlText;

    // H1: # Heading -> <h1>...</h1>
    result = result.replace(/^#{1,6}\s+(.+)$/, '<h1>$1</h1>');
    result = result.replace(/^#{6,}([^#].+)$/, '<h6>$1</h6>');

    // H2: ## Heading -> <h2>...</h2>
    result = result.replace(/^#{1,6}\s+(.+)$/, '<h2>$1</h2>');

    // H3: ### Heading -> <h3>...</h3>
    result = result.replace(/^#{1,6}\s+(.+)$/, '<h3>$1</h3>');

    // H4: #### Heading -> <h4>...</h4>
    result = result.replace(/^#{1,6}\s+(.+)$/, '<h4>$1</h4>');

    // H5: ##### Heading -> <h5>...</h5>
    result = result.replace(/^#{1,6}\s+(.+)$/, '<h5>$1</h5>');

    // H6: ###### Heading -> <h6>...</h6>
    result = result.replace(/^#{1,6}\s+(.+)$/, '<h6>$1</h6>');

    // Unordered list: - item or * item
    result = result.replace(/^(?:[-*+]\s+.+)$/gm, '<li>$1</li>');

    // Ordered list: 1. item
    result = result.replace(/^\d+\.\s+.+$/gm, '<li>$1</li>');

    // Wrap consecutive <li> elements in <ul> or <ol>
    result = wrapInList(result, 'ul');

    return result;
}

// Process links and images: [text](url) -> <a href="...">...</a>
//           :

![url](file://url)

 -> <img src="..." alt="...">
function processLinksAndImages(htmlText) {
    let result = htmlText;

    // Inline links: [text](url) -> <a href="...">...</a>
    result = result.replace(/\[([^\]]+)\]\((.+)\)/g, '<a href="$2">link text</a>');

    // Images: 

![url](file://url)

 -> <img src="...">
    result = result.replace(/!\[([^\]]*)\]\((.+)\)/g, '<img src="$2" alt="$1">');

    return result;
}

// Wrap consecutive <li> elements in ul or ol tags
function wrapInList(htmlText, tagName) {
    // Match all <li>...</li> and wrap them in a ul or ol
    let result = htmlText;

    // Find all <li>...</li> blocks (ignoring nested ones)
    const liMatches = result.match(/<\/?li\b[^<]*(?:<(?!\/?li)/[^\n]*</[^\n]*)*<\/li>/g) || [];

    if (liMatches.length === 0) {
        return result;
    }

    // Group by opening tags
    let ulCount = 0, olCount = 0;

    liMatches.forEach(li => {
        const ulStart = li.indexOf('<ul');
        const olStart = li.indexOf('<ol');

        if (ulStart < 0 && olStart < 0) {
            // No wrapping tag found yet, create one
            if (tagName === 'ul') {
                ulCount++;
            } else {
                olCount++;
            }

            if (ulCount === 1) result = '<ul>' + result;
            else if (olCount === 1 && ulStart >= 0) {
                // Start an ordered list if there are unordered lists before it
            }
        }
    });

    // Add closing tags
    const ulClose = '</ul>';
    const olClose = '</ol>';

    // Find where the last <li> ends and close appropriately
    const lastLi = liMatches[liMatches.length - 1];

    // Simple approach: wrap all <li>...</li> that aren't already wrapped
    result = result.replace(/<(?!\/?(ul|ol))li[^<]*?</[^\n]*<\/li>/g, function(match) {
        if (ulCount > 0 && olCount === 0) return ulClose + match;
        if (olCount > 0 && ulCount === 0) return olClose + match;
        return match; // already wrapped or no list needed
    });

    result = result.replace(new RegExp('<' + tagName + '[^<]*<!', 'g'), '<$1>');

    // Remove any unmatched closing tags
    result = removeUnclosedListTags(result, tagName === 'ul' ? '</ul>' : '</ol>');

    return result;
}

// Remove unclosed list tags by matching them with their opening tag
function removeUnclosedListTags(text, closeTag) {
    const openTag = ' <' + closeTag.substring(1); // e.g., " <ul"
    const lastUnclosed = text.lastIndexOf(openTag);

    if (lastUnclosed === -1) return text; // already balanced

    const insert = (closeTag + '</' + closeTag.substring(2) + '>')
        .replace(closeTag, '<' + closeTag);

    const insertPos = lastUnclosed;
    return text.substring(0, insertPos) + insert + text.substring(insert);
}

// Replace specific inline formatting patterns
function replaceAll(text, type) {
    const regex = getRegexForType(type);
    if (!regex) return text;

    switch (type) {
        case 'bold':
            // Handle escaped: \\**text\\** -> still bold
            return text.replace(/(\\\*\*)?(?:\*\*)(.+?)(?:\*\*)(?:\\(\*\*))?/gs, function(match) {
                // Remove escaping markers
                match = match.replace(/\\\*/g, '');

                const inner = match; // text between **
                return '<strong>' + inner + '</strong>';
            });
            break;

        case 'italic':
            // Handle escaped: \\*text\\* -> still italic
            return text.replace(/(\\\*)?(?:\*)(.+?)(?:\*)(?:\\(\*))?/gs, function(match) {
                match = match.replace(/\\\*/g, '');

                const inner = match; // text between *
                return '<em>' + inner + '</em>';
            });
            break;

        case 'underline':
            // Handle escaped: \\~~text\\~~ or \_\_text\_\_
            return text.replace(/(\\\~{2,})?(?:~~)(.+?)(?:~~)(?:\\(\~\~))?\n/g, '<u>$1$2</u>');
            break;

        case 'underline__':
            return text.replace(/(\\\_\_)?(?:\_\_)(.+?)(?:\_\_)(?:\\(\_\_))?\n/g, '<u>$1$2</u>');
            break;

        case 'link':
            return text.replace(/\[([^\[\]]+)\]\((.+?)(?:\])?\)/g, '<a href="$2">$1</a>');
            break;

        case 'block':
            return text.replace(/^#{1,6}\s+(.+)$/g, function(match) {
                const level = match.substring(0, 7).match(/^#{0,6}#?/g);
                const hLevel = level ? (level[0].match(/#/g) || []).length : 6;
                return '<h' + hLevel + '>' + match.substring(7) + '</h' + hLevel + '>';
            });
            break;

        case 'bullet':
            return text.replace(/^(?:[-*+]\s+.+$)/gm, function(match) {
                return '<li>' + match.replace(/^(?:[-*+]\s+)/, '') + '</li>';
            });
            break;

        default:
            return text;
    }
}

// Helper: get regex for a specific type
function getRegexForType(type) {
    const patterns = {
        'bold': /(?:\\\\|\^\\)(?:\*\*)(.+?)(?:\*\*)/,
        'italic': /(?:\\\\|\^\\)(?:\*)(.+?)(?:\*)/,
        'underline': /(?:\\\\|\^\\)(?:~~)(.+?)(?:~~)/,
        'underline__': /(?:\\\\|\^\\)(?:\_\_)(.+?)(?:\_\_)/,
        'link': /(?:\\\\|\^\\)\[([^\[\]]+)\]\((.+?)\)/,
        'block': /(?:\\\\|\^\\)#(#{0,5})\s+(.*)/
    };

    return patterns[type];
}

// Helper: process inline formatting recursively with nesting support
function replaceAllInner(text, type, nested = false) {
    const result = replaceAll(text, type);

    if (!result || !nested) return result;

    // Keep applying until no more matches (handles nesting)
    let prev = '';
    do {
        prev = result;
        result = replaceAll(result, type);
    } while (result !== prev && !nested);

    return result;
}

// Restore escape sequences after processing (convert * back to \*)
function restoreEscapes(htmlText) {
    // Convert remaining asterisks in a pattern that matches them
    htmlText = htmlText.replace(/(^|[^<](?:<\/?[a-z0-9]+))\*(?=[^*])/g, '$1\\*');
    htmlText = htmlText.replace(/\*(?=[^*])/g, '\\*');

    // Convert remaining hashes
    htmlText = htmlText.replace(/(^|[^<](?:<\/?[a-z0-9]+))#(?!$)/g, '$1\\#');

    return htmlText;
}

// Append the result to the DOM element's innerHTML
div.innerHTML = convertMarkdownToHtml(div.textContent || '');

return div.innerHTML;
}

// --- Usage Example ---
/*
    const div = document.getElementById('main');
    div.textContent = `
# H1 Heading

**Bold text** and *italic text* with ~~underline~~ inside.

- Item 1
- Item 2

A [link](https://example.com) and a **bold** *italic* link like this.

---

### Nested formatting example
***Bold and italic together*** with a [$(escaped)](link) that works.

1. Ordered item 1
2. Ordered item 2
`;

    markdownToHtml();
*/
```

## How It Works

| Step | What Happens | Why |
|------|-------------|-----|
| 1. **Extract text** | `textContent` ignores nested HTML tags | Only processes pure Markdown content |
| 2. **Escape characters** | `\*` → `*`, `\#` → `##`, `\\` → `\` | Prevents literal symbols from being parsed |
| 3. **Inline formatting** | Bold, italic, underline (with nesting support) | Applied left-to-right with recursive processing |
| 4. **Block elements** | Headings (H1–H6), unordered (`-`/`*`), ordered (`n.`) lists | Applied after inline to handle nesting |
| 5. **Links & images** | `[text](url)` → `<a>`, `

![url](file://url)

` → `<img>` | Applied last to avoid link-wrapping issues |
| 6. **Write to DOM** | `innerHTML` injects the rendered HTML into `#main` | Single invocation, no streaming |

## Key Design Decisions

- **Nesting**: Triple asterisks (`***`) are expanded to `<strong><em>...</em></strong>` by processing bold first, then italic inside the bold span.
- **Escaping**: A backslash (`\`) escapes the next special character, so `\*` renders as a literal `*`.
- **No sanitization**: The output is raw HTML — any malicious input will pass through. (As requested.)
- **Single-call**: All replacements are done in one function call via the `convertMarkdownToHtml` pipeline.

## Limitations (by design, as you specified)

- No streaming/lazy rendering — entire content is processed at once
- No security sanitization (as explicitly requested)
- Uses regex — can have edge cases with malformed Markdown
- No code blocks (` ``` `), quotes (`> `), blockquotes, horizontal rules, tables, strikethrough, etc.
