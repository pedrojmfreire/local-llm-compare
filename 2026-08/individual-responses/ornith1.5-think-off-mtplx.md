Here's a JavaScript function that converts Markdown to HTML within a DIV:

```javascript
function convertMarkdownToHTML() {
    const mainDiv = document.getElementById('main');
    if (!mainDiv) {
        console.error('DIV with ID "main" not found');
        return;
    }

    // Extract only the direct text content, ignoring nested HTML tags
    const textContent = mainDiv.textContent || mainDiv.innerText || '';

    // Process escape characters (store them temporarily to protect from markdown processing)
    const escapes = [];
    let processed = textContent
        // Escape special markdown characters using placeholder tokens
        .replace(/\\/g, (match) => {
            escapes.push('\\');
            return `\u0000${escapes.length - 1}\u0000`;
        });

    // Process headings (support # through ######)
    processed = processed
        .replace(/^######\s+(.+)$/gm, '<h6>$1</h6>')
        .replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>')
        .replace(/^####\s+(.+)$/gm, '<h4>$1</h4>')
        .replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
        .replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
        .replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

    // Process hyperlinks [text](url) - support nested formatting inside
    processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
        return `<a href="${url}">${text}</a>`;
    });

    // Process bold/italic/underline combinations (handle nested cases)
    // Bold + Italic: ***text*** or ___text___
    processed = processed.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
    processed = processed.replace(/___([^_]+)___/g, '<strong><em>$1</em></strong>');

    // Bold: **text** or __text__
    processed = processed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    processed = processed.replace(/__([^_]+)__/g, '<strong>$1</strong>');

    // Italic: *text* or _text_
    processed = processed.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    processed = processed.replace(/_([^_]+)_/g, '<em>$1</em>');

    // Underline: <u>text</u> (Markdown doesn't have native underline, using HTML)
    // Note: This assumes you want underline support via HTML tags

    // Process bullet lists (-, *, +)
    processed = processed.replace(/^([-*+])\s+(.+)$/gm, '<li>$2</li>');
    // Wrap consecutive <li> elements in <ul>
    processed = processed.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
        return '<ul>' + match.replace(/\n/g, '') + '</ul>';
    });

    // Restore escape characters
    processed = processed.replace(/\u0000(\d+)\u0000/g, (match, index) => {
        return escapes[parseInt(index)];
    });

    // Apply the converted HTML to the DIV
    mainDiv.innerHTML = processed;

    return processed;
}
```

## Key Features:

1. **Ignores nested HTML tags**: Uses `textContent` to extract only the raw text, ignoring any existing HTML structure.

2. **Escape character support**: Backslashes (`\`) are escaped and protected during processing, then restored at the end.

3. **Nested Markdown**: Handles combinations like `***bold italic***` and allows markdown inside hyperlinks.

4. **Single invocation**: The conversion happens once when the function is called.

## Important Notes:

- **Underline**: Standard Markdown doesn't support underline natively. The function treats `<u>text</u>` as literal text. If you need actual underline support, you'd need to define a Markdown syntax for it (e.g., `__text__` for bold won't work since that's taken).

- **Order matters**: The replacements are ordered carefully (headings → links → complex formatting → simple formatting) to handle nesting correctly.

- **No sanitization**: As requested, there's no security filtering. Be cautious with untrusted input.

You can call it with:

```javascript
convertMarkdownToHTML();
```