function convertMainDivMarkdown() {
  const mainDiv = document.getElementById('main');
  if (!mainDiv) return;

  // Extract text content, ignoring any nested HTML tags inside the DIV
  const rawText = mainDiv.textContent;

  // Convert Markdown to HTML (one-shot replacement)
  const html = markdownToHTML(rawText);

  // Replace the DIV's content with the converted HTML
  mainDiv.innerHTML = html;
}

function markdownToHTML(text) {
  const escapeMap = new Map();
  let counter = 0;

  // Step 1: Protect escaped characters by replacing them with unique placeholders
  text = text.replace(/\\([*_\-+=#><\[\](){}!.|\\])/g, (match, char) => {
    const key = `__ESC_${counter++}__`;
    escapeMap.set(key, char);
    return key;
  });

  // Step 2: Headings (line-level, supports # through ######)
  text = text.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>')
             .replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>')
             .replace(/^####\s+(.+)$/gm, '<h4>$1</h4>')
             .replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
             .replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
             .replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

  // Step 3: Hyperlinks with nested inline formatting support in the link text
  text = text.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (match, linkText, url) => {
    const innerHTML = inlineMarkdown(linkText);
    return `<a href="${url}">${innerHTML}</a>`;
  });

  // Step 4: Inline formatting (bold, italic, underline) with nested support
  text = inlineMarkdown(text);

  // Step 5: Bullet and numbered lists (processed after inline to preserve formatting)
  text = processLists(text);

  // Step 6: Restore escaped characters from placeholders
  escapeMap.forEach((char, key) => {
    text = text.split(key).join(char);
  });

  return text;
}

function inlineMarkdown(text) {
  // Triple markers: bold + italic (nested combination)
  text = text.replace(/\*{3}(.+?)\*{3}/g, '<b><i>$1</i></b>');
  text = text.replace(/_{3}(.+?)_{3}/g, '<b><i>$1</i></b>');

  // Double markers: bold
  text = text.replace(/\*{2}(.+?)\*{2}/g, '<b>$1</b>');
  text = text.replace(/_{2}(.+?)_{2}/g, '<b>$1</b>');

  // Single markers: italic
  text = text.replace(/\*(.+?)\*/g, '<i>$1</i>');
  // Underscore italic uses word-boundary guards to avoid matching inside words
  text = text.replace(/(?<!\w)_(.+?)_(?!\w)/g, '<i>$1</i>');

  // Underline using `==text==` syntax (non-standard Markdown extension)
  text = text.replace(/==(.+?)==/g, '<u>$1</u>');

  return text;
}

function processLists(text) {
  const lines = text.split('\n');
  let result = '';
  let inList = false;
  let listType = null; // 'bullet' or 'numbered'

  for (const line of lines) {
    const bulletMatch = line.match(/^(\s*)([-*+])\s+(.+)$/);
    const numberedMatch = line.match(/^(\s*)(\d+)\.\s+(.+)$/);

    if (bulletMatch) {
      if (!inList || listType !== 'bullet') {
        if (inList) result += '</ul>\n';
        result += '<ul>\n';
        inList = true;
        listType = 'bullet';
      }
      result += `<li>${bulletMatch[3]}</li>\n`;
    } else if (numberedMatch) {
      if (!inList || listType !== 'numbered') {
        if (inList) result += '</ul>\n';
        result += '<ol>\n';
        inList = true;
        listType = 'numbered';
      }
      result += `<li>${numberedMatch[3]}</li>\n`;
    } else {
      if (inList) {
        result += '</ul>\n';
        inList = false;
        listType = null;
      }
      result += line + '\n';
    }
  }

  if (inList) result += '</ul>\n';

  return result;
}

// Execute once on function invocation

function run() {
  convertMainDivMarkdown();
}
