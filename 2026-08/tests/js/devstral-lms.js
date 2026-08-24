function convertMarkdownToHtml() {
	const mainDiv = document.getElementById('main');
	if (!mainDiv) return;

	// Get the text content, ignoring nested HTML tags
	const textContent = mainDiv.textContent;

	// Process escape characters first (handle \\ before processing other escapes)
	let processedText = textContent.replace(/\\(\\)/g, '&#92;'); // Handle \\ first
	processedText = processedText.replace(/\\([#*`[\]()!&])/g, '$1'); // Handle other escapes

	// Process headings (## text -> <h2>text</h2>)
	processedText = processedText.replace(/^([#]{1,6})\s+(.+?)\s*$/gm, (match, hashes, text) => {
		const level = hashes.length;
		return `<h${level}>${text}</h${level}>`;
	});

	// Process bold (**text** or __text__)
	processedText = processedText.replace(/\*\*([^\\*]+?)\*\*/g, '<strong>$1</strong>');
	processedText = processedText.replace(/__([^\\_]+?)__/g, '<strong>$1</strong>');

	// Process italic (*text* or _text_)
	processedText = processedText.replace(/\*([^\\*]+?)\*/g, '<em>$1</em>');
	processedText = processedText.replace(/_([^\\_]+?)_/g, '<em>$1</em>');

	// Process underline (text with double underscores)
	processedText = processedText.replace(/([^\\])__([^\\_]+?)__(?![^<]*>)/g, '$1<u>$2</u>');

	// Process hyperlinks ([text](url))
	processedText = processedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

	// Process bullets (- or * at start of line)
	processedText = processedText.replace(/^(\*|-)\s+(.+?)$/gm, '<li>$2</li>');

	// Replace newlines with <br> (but not in code blocks)
	processedText = processedText.replace(/(?<!\n)\n(?![\s*#])/g, '<br>');

	// Set the innerHTML of the div to the processed text
	mainDiv.innerHTML = processedText;
}

// Call the function when needed

function run() {
  convertMarkdownToHtml();
}
