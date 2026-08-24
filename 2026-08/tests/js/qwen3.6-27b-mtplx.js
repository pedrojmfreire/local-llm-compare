function convertMarkdownToHTML() {
  const container = document.getElementById('main');
  if (!container) return;

  // 1. Extract plain text, automatically ignoring any nested HTML tags
  const rawText = container.textContent;
  if (!rawText.trim()) return;

  // 2. Escape handling: replace special chars preceded by \ with unique placeholders
  const escMap = {
    '\\\\': '__MD_ESC_BSLASH__',
    '\\*': '__MD_ESC_STAR__',
    '\\_': '__MD_ESC_UNDER__',
    '\\[': '__MD_ESC_LB__',
    '\\]': '__MD_ESC_RB__',
    '\\(': '__MD_ESC_LP__',
    '\\)': '__MD_ESC_RP__',
    '\\#': '__MD_ESC_HASH__',
    '\\-': '__MD_ESC_MINUS__'
  };

  let text = rawText;
  for (const key in escMap) {
    text = text.replace(new RegExp(key, 'g'), escMap[key]);
  }

  // 3. Block-level parsing
  const lines = text.split(/\r?\n/);
  let html = '';
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Headings: # to ######
    const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      html += `<h${level}>${parseInline(headingMatch[2])}</h${level}>`;
      i++;
      continue;
    }

    // Unordered lists: -, *, +
    const bulletMatch = line.match(/^\s*[-*+]\s+(.+)/);
    if (bulletMatch) {
      html += '<ul>';
      while (i < lines.length) {
        const bMatch = lines[i].match(/^\s*[-*+]\s+(.+)/);
        if (bMatch) {
          html += `<li>${parseInline(bMatch[1])}</li>`;
          i++;
        } else {
          break;
        }
      }
      html += '</ul>';
      continue;
    }

    // Paragraphs (skip empty lines)
    if (line.trim() !== '') {
      html += `<p>${parseInline(line)}</p>`;
    }
    i++;
  }

  // 4. Restore escaped characters
  for (const key in escMap) {
    html = html.split(escMap[key]).join(key.slice(1));
  }

  // 5. Inject HTML once
  container.innerHTML = html;
}

// Helper: Stack-based inline parser for nesting support
function parseInline(text) {
  let result = '';
  const stack = [];
  let i = 0;

  while (i < text.length) {
    const char = text[i];

    // Hyperlinks: [text](url)
    if (char === '[') {
      const endBracket = text.indexOf(']', i);
      if (endBracket !== -1 && text[endBracket + 1] === '(') {
        const endParen = text.indexOf(')', endBracket + 1);
        if (endParen !== -1) {
          const linkText = text.slice(i + 1, endBracket);
          const url = text.slice(endBracket + 2, endParen);
          // Recursively parse link text to allow nested formatting
          result += `<a href="${url}">${parseInline(linkText)}</a>`;
          i = endParen + 1;
          continue;
        }
      }
    }

    // Formatting markers
    let marker = null;
    if (text[i] === '*' && text[i + 1] === '*') marker = 'b';      // ** -> <b>
    else if (text[i] === '_' && text[i + 1] === '_') marker = 'u'; // __ -> <u>
    else if (char === '*' || char === '_') marker = 'i';           // * or _ -> <i>

    if (marker) {
      const len = marker === 'i' ? 1 : 2;
      const tagMap = { b: 'b', u: 'u', i: 'i' };

      // Toggle open/close based on stack top
      if (stack.length > 0 && stack[stack.length - 1].marker === marker) {
        const open = stack.pop();
        result += `</${open.tag}>`;
      } else {
        stack.push({ tag: tagMap[marker], marker });
        result += `<${tagMap[marker]}>`;
      }
      i += len;
      continue;
    }

    result += char;
    i++;
  }

  // Gracefully close any unclosed tags
  while (stack.length > 0) {
    result += `</${stack.pop().tag}>`;
  }

  return result;
}

function run() {
  convertMarkdownToHTML();
}
