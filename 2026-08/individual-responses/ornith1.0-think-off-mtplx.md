Here's a JavaScript function that converts Markdown to HTML within a DIV with ID "main":

```javascript
function convertMarkdownToHtml() {
  const mainDiv = document.getElementById('main');
  if (!mainDiv) return;

  let text = mainDiv.textContent;

  // Process escape characters first (replace with placeholder)
  const escapeMap = {};
  let escapeIndex = 0;
  text = text.replace(/\\([*_~\[\]()#])/g, (match, char) => {
    const placeholder = `\x00ESCAPE${escapeIndex++}\x00`;
    escapeMap[placeholder] = char;
    return placeholder;
  });

  // Convert headings (must be at start of line)
  text = text.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
  text = text.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
  text = text.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
  text = text.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  text = text.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
  text = text.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

  // Convert bold and italic (nested)
  text = text.replace(/\*{3}(.+?)\*{3}/g, '<strong><em>$1</em></strong>');
  text = text.replace(/\*{2}(.+?)\*{2}/g, '<strong>$1</strong>');
  text = text.replace(/_{3}(.+?)_{3}/g, '<strong><u>$1</u></strong>');
  text = text.replace(/_{2}(.+?)_{2}/g, '<u>$1</u>');
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
  text = text.replace(/_(.+?)_/g, '<em>$1</em>');

  // Convert strikethrough
  text = text.replace(/~~(.+?)~~/g, '<del>$1</del>');

  // Convert hyperlinks (must be after other formatting)
  text = text.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');

  // Convert unordered list items
  text = text.replace(/^[*\-+]\s+(.+)$/gm, '<li>$1</li>');
  text = text.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

  // Convert ordered list items
  text = text.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
  text = text.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
    if (match.match(/<li>/g).length > 0) {
      return '<ol>' + match + '</ol>';
    }
    return match;
  });

  // Convert code blocks (triple backticks)
  text = text.replace(/```(\w*)\n([\s\S]+?)```/g, '<pre><code>$2</code></pre>');

  // Convert inline code (single backticks)
  text = text.replace(/`(.+?)`/g, '<code>$1</code>');

  // Convert blockquotes
  text = text.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');

  // Convert horizontal rules
  text = text.replace(/^---+$/gm, '<hr>');
  text = text.replace(/^\*\*\*+$/gm, '<hr>');

  // Restore escape characters
  Object.keys(escapeMap).forEach(placeholder => {
    text = text.replace(new RegExp(escapeMap[placeholder], 'g'), escapeMap[placeholder]);
  });

  mainDiv.innerHTML = text;
}

// Call the function once
convertMarkdownToHtml();
```

This function:

1. Gets the text content from the DIV with ID "main"
2. Handles escape characters by replacing them with placeholders
3. Converts Markdown headings to HTML heading tags
4. Handles nested bold/italic/underline combinations
5. Converts hyperlinks to HTML anchor tags
6. Processes unordered and ordered lists
7. Handles code blocks and inline code
8. Converts blockquotes and horizontal rules
9. Restores escape characters
10. Updates the DIV's innerHTML with the converted HTML

The function is designed to handle nested formatting and escape characters while converting Markdown to HTML. It processes the content once when invoked.
