function renderMarkdown() {
    const mainDiv = document.getElementById('main');
    if (!mainDiv) return;

    // 1. Extract text content, ignoring any existing HTML tags
    let text = mainDiv.textContent;

    // 2. Handle escape characters
    const escapeMap = new Map();
    let escapeCounter = 0;

    function getPlaceholder(char) {
        // Use zero-width spaces to create a highly unique placeholder that won't interfere with regex
        const placeholder = `\u200B${escapeCounter++}\u200B`;
        escapeMap.set(placeholder, char);
        return placeholder;
    }

    // Replace escaped Markdown special characters with placeholders
    text = text.replace(/\\([*_\[\]()#])/g, (match, char) => getPlaceholder(char));

    // 3. Process Block Elements (Headings, Bullets)
    const lines = text.split('\n');
    const processedLines = [];
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        let html = '';

        // Handle empty lines (breaks lists, creates paragraph breaks)
        if (line.trim() === '') {
            if (inList) {
                processedLines.push('</ul>');
                inList = false;
            }
            processedLines.push('');
            continue;
        }

        // Headings (# H1 to ###### H6)
        const headingMatch = line.match(/^\s{0,3}(#{1,6})\s+(.*)$/);
        if (headingMatch) {
            if (inList) {
                processedLines.push('</ul>');
                inList = false;
            }
            const level = headingMatch[1].length;
            const content = headingMatch[2];
            html = `<h${level}>${content}</h${level}>`;
        }
        // Bullets (-, *, +)
        else if (line.match(/^\s{0,3}[-*+]\s+/)) {
            if (!inList) {
                processedLines.push('<ul>');
                inList = true;
            }
            const content = line.replace(/^\s{0,3}[-*+]\s+/, '');
            html = `<li>${content}</li>`;
        }
        // Paragraphs
        else {
            if (inList) {
                processedLines.push('</ul>');
                inList = false;
            }
            html = `<p>${line}</p>`;
        }

        processedLines.push(html);
    }

    // Close any remaining list at the end of the document
    if (inList) {
        processedLines.push('</ul>');
    }

    text = processedLines.join('\n');

    // 4. Process Inline Elements (Links, Bold, Underline, Italic)
    // Links are processed first so that URLs containing other markers are handled safely.
    // Non-greedy matching (.+?) allows for nested formatting to be caught by subsequent passes.
    
    // Hyperlinks: [text](url)
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    // Bold: **text**
    text = text.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');

    // Underline: __text__
    text = text.replace(/__(.+?)__/g, '<u>$1</u>');

    // Italic: *text*
    text = text.replace(/\*(.+?)\*/g, '<i>$1</i>');

    // 5. Restore Escaped Characters
    text = text.replace(/\u200B\d+\u200B/g, (match) => escapeMap.get(match));

    // 6. Inject the generated HTML into the DIV
    mainDiv.innerHTML = text;
}

function run() {
  renderMarkdown();
}
