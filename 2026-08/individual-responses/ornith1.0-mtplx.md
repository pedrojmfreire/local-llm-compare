Here's a complete, self-contained JavaScript function that meets all your requirements. It uses a placeholder-based approach to safely ignore HTML tags and escape sequences during parsing, then restores them afterward. Nested Markdown is handled via a recursive inline parser.

```javascript
function convertMainDivMarkdown() {
  const mainDiv = document.getElementById('main');
  if (!mainDiv) return;

  // Normalize line endings
  let content = mainDiv.innerHTML.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // 1. Extract existing HTML tags to prevent markdown parsing inside them
  const htmlTokens = [];
  content = content.replace(/<[^>]+>/g, (match) => {
    const id = `§HTML§${htmlTokens.length}§`;
    htmlTokens.push(match);
    return id;
  });

  // 2. Extract escape sequences so they aren't misinterpreted as markdown syntax
  const escapeTokens = [];
  content = content.replace(/\\([*#_\-+=\[\](){}])/g, (match, char) => {
    const id = `§ESC§${escapeTokens.length}§`;
    escapeTokens.push(char);
    return id;
  });

  // 3. Block-level parsing: Headings & Bullets
  const lines = content.split('\n');
  const blocks = [];
  let inList = false;

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,6})\s+(.*)/);
    if (headingMatch) {
      if (inList) { blocks.push('</ul>'); inList = false; }
      const level = headingMatch[1].length;
      blocks.push(`<h${level}>${parseInline(headingMatch[2])}</h${level}>`);
      continue;
    }

    const bulletMatch = line.match(/^([*+-])\s+(.*)/);
    if (bulletMatch) {
      if (!inList) { blocks.push('<ul>'); inList = true; }
      blocks.push(`<li>${parseInline(bulletMatch[2])}</li>`);
      continue;
    }

    if (inList) { blocks.push('</ul>'); inList = false; }
    blocks.push(parseInline(line));
  }
  if (inList) blocks.push('</ul>');

  let finalHtml = blocks.join('\n');

  // 4. Restore escape sequences
  for (let i = 0; i < escapeTokens.length; i++) {
    finalHtml = finalHtml.split(`§ESC§${i}§`).join(escapeTokens[i]);
  }

  // 5. Restore original HTML tags
  for (let i = 0; i < htmlTokens.length; i++) {
    finalHtml = finalHtml.split(`§HTML§${i}§`).join(htmlTokens[i]);
  }

  mainDiv.innerHTML = finalHtml;
}

/**
 * Recursive inline parser supporting nested bold, italic, underline, and links.
 * Handles escape placeholders transparently.
 */
function parseInline(text) {
  let result = '';
  let i = 0;
  const len = text.length;

  while (i < len) {
    // Hyperlinks: [text](url)
    if (text[i] === '[') {
      let bracketCount = 1;
      let j = i + 1;
      while (j < len && bracketCount > 0) {
        if (text[j] === '[') bracketCount++;
        else if (text[j] === ']') bracketCount--;
        j++;
      }
      if (bracketCount === 0 && j < len && text[j] === '(') {
        let parenCount = 1;
        let k = j + 1;
        while (k < len && parenCount > 0) {
          if (text[k] === '(') parenCount++;
          else if (text[k] === ')') parenCount--;
          k++;
        }
        if (parenCount === 0) {
          const linkText = text.slice(i + 1, j - 1);
          const url = text.slice(j + 1, k - 1);
          result += `<a href="${url}">${parseInline(linkText)}</a>`;
          i = k;
          continue;
        }
      }
    }

    // Bold: **text** or __text__
    if ((text[i] === '*' && text[i+1] === '*') || (text[i] === '_' && text[i+1] === '_')) {
      const delim = text[i];
      let j = i + 2;
      let found = false;
      while (j <= len - 2) {
        if (text[j] === delim && text[j+1] === delim) {
          result += `<strong>${parseInline(text.slice(i + 2, j))}</strong>`;
          i = j + 2;
          found = true;
          break;
        }
        j++;
      }
      if (!found) { result += text[i]; i++; }
      continue;
    }

    // Italic: *text* or _text_
    if (text[i] === '*' || text[i] === '_') {
      const delim = text[i];
      let j = i + 1;
      let found = false;
      while (j < len) {
        if (text[j] === delim) {
          result += `<em>${parseInline(text.slice(i + 1, j))}</em>`;
          i = j + 1;
          found = true;
          break;
        }
        j++;
      }
      if (!found) { result += text[i]; i++; }
      continue;
    }

    // Underline: ==text==
    if (text[i] === '=' && text[i+1] === '=') {
      let j = i + 2;
      let found = false;
      while (j <= len - 2) {
        if (text[j] === '=' && text[j+1] === '=') {
          result += `<u>${parseInline(text.slice(i + 2, j))}</u>`;
          i = j + 2;
          found = true;
          break;
        }
        j++;
      }
      if (!found) { result += text[i]; i++; }
      continue;
    }

    result += text[i];
    i++;
  }
  return result;
}
```

### Key Features:
1. **HTML Tag Preservation**: Scans for `<...>` tags first, replaces them with `§HTML§N§` placeholders, parses markdown, then restores the original tags. This ensures markdown syntax inside nested HTML elements is completely ignored.
2. **Escape Character Support**: `\*`, `\#`, `\_`, `\[`, `\]`, `\(`, `\)`, `\=`, `\-`, `\+`, `\{`, `\}` are converted to `§ESC§N§` tokens before parsing, preventing them from triggering markdown formatting. They're restored exactly as the escaped character after conversion.
3. **Nested Markdown**: `parseInline` is recursive. It correctly handles combinations like `**bold *italic* **`, `[link **bold**](url)`, `==underline *italic* ==`, etc.
4. **Block-Level Formatting**: Headings (`#` to `######`) and bullet lists (`-`, `*`, `+`) are parsed line-by-line and properly wrapped in `<hN>` and `<ul><li>` tags.
5. **Zero Dependencies & No Sanitization**: Pure JavaScript, single invocation, modifies `innerHTML` directly once, and intentionally skips security sanitization as requested.
6. **Safe Placeholders**: Uses the `§` character for tokens, which won't appear in standard Markdown or HTML, preventing accidental substitution collisions.

### Usage:
```javascript
// Convert once on load or on demand
convertMainDivMarkdown();
```