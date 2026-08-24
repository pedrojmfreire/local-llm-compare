function convertMarkdownToHtml() {
  const div = document.getElementById('main');
  if (!div || div.dataset.markdownConverted) return;

  let text = div.textContent;

  // Replace escaped Markdown characters with temporary markers
  text = text.replace(/\\([#*_\[-])/g, (match, char) => {
    const markers = { '#': '\x00', '*': '\x01', '_': '\x02', '[': '\x03', '-': '\x04' };
    return markers[char] || match;
  });

  // Process headings (e.g., # Heading -> <h1>Heading</h1>)
  text = text.replace(/^#{1,6}\s+(.*?)$/gm, (match, content) => {
    const level = match.match(/^#+/)[0].length;
    return `<h${level}>${content}</h${level}>`;
  });

  // Process unordered lists (e.g., - Item -> <li>Item</li>, grouped in <ul>)
  text = text.replace(/^[-*]\s+(.*?)$/gm, '<li>$1</li>');
  text = text.replace(/(<li>.*<\/li>(\s|$))+/g, (match) => `<ul>${match.trim()}</ul>`);

  // Process hyperlinks (e.g., [text](url) -> <a href="url">text</a>)
  text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');

  // Process bold (e.g., **text** -> <strong>text</strong>)
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Process underline (e.g., __text__ -> <u>text</u>)
  text = text.replace(/__(.*?)__/g, '<u>$1</u>');

  // Process italic (e.g., *text* or _text_ -> <em>text</em>)
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
  text = text.replace(/_(.*?)_/g, '<em>$1</em>');

  // Restore escaped characters
  text = text.replace(/\x00/g, '#');
  text = text.replace(/\x01/g, '*');
  text = text.replace(/\x02/g, '_');
  text = text.replace(/\x03/g, '[');
  text = text.replace(/\x04/g, '-');

  // Update the DIV's HTML content
  div.innerHTML = text;
  div.dataset.markdownConverted = 'true';
}

function run() {
  convertMarkdownToHtml();
}
