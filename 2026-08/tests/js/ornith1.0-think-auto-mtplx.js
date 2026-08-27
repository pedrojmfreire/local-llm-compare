function renderMarkdown() {
  const mainDiv = document.getElementById('main');
  if (!mainDiv) return;

  // 1. Extract raw text, completely ignoring any nested HTML tags
  let text = mainDiv.textContent;

  // 2. Temporarily replace escaped characters with unique placeholders
  //    This prevents them from triggering formatting rules
  text = text.replace(/\\\\/g, '%%BS%%');
  text = text.replace(/\\\*/g, '%%ST%%');
  text = text.replace(/\\_/g, '%%UN%%');
  text = text.replace(/\\\[/g, '%%OB%%');
  text = text.replace(/\\\]/g, '%%CB%%');
  text = text.replace(/\\\(/g, '%%OP%%');
  text = text.replace(/\\\)/g, '%%CP%%');
  text = text.replace(/\\#/g, '%%HA%%');
  text = text.replace(/\\\-/g, '%%DA%%');
  text = text.replace(/\\+/g, '%%PL%%');

  // 3. Inline formatting (order enables safe nesting)
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
  text = text.replace(/__(.+?)__/g, '<u>$1</u>');

  // 4. Hyperlinks (processed after inline to allow nested formatting inside links)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // 5. Block formatting: Headings (h1 - h6)
  text = text.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
  text = text.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
  text = text.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
  text = text.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  text = text.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
  text = text.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

  // 6. Block formatting: Unordered list items
  text = text.replace(/^[*\-+]\s+(.+)$/gm, '<li>$1</li>');

  // 7. Restore escaped characters from placeholders
  text = text.replace(/%%BS%%/g, '\\');
  text = text.replace(/%%ST%%/g, '*');
  text = text.replace(/%%UN%%/g, '_');
  text = text.replace(/%%OB%%/g, '[');
  text = text.replace(/%%CB%%/g, ']');
  text = text.replace(/%%OP%%/g, '(');
  text = text.replace(/%%CP%%/g, ')');
  text = text.replace(/%%HA%%/g, '#');
  text = text.replace(/%%DA%%/g, '-');
  text = text.replace(/%%PL%%/g, '+');

  // 8. Apply the converted HTML to the DOM (runs once on invocation)
  mainDiv.innerHTML = text;
}

// Example usage:
// renderMarkdown();

function run() {
  renderMarkdown();
}
