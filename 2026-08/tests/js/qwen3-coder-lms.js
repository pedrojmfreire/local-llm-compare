function convertMarkdownToHTML() {
    // Find the DIV with ID "main"
    const mainDiv = document.getElementById("main");
    
    if (!mainDiv) {
        console.warn("DIV with ID 'main' not found");
        return "";
    }
    
    // Get the text content (ignoring nested HTML tags)
    const textContent = mainDiv.textContent || mainDiv.innerText;
    
    // Process the markdown content
    let html = textContent;
    
    // Handle escape characters - process them first to prevent unwanted conversions
    html = html.replace(/\\([*#_~\[\]\(\)`])/g, '$1');
    
    // Handle headings (h1 through h6) - support both # and ## patterns
    html = html.replace(/^#{6}\s*(.*?)$/gm, '<h6>$1</h6>');
    html = html.replace(/^#{5}\s*(.*?)$/gm, '<h5>$1</h5>');
    html = html.replace(/^#{4}\s*(.*?)$/gm, '<h4>$1</h4>');
    html = html.replace(/^#{3}\s*(.*?)$/gm, '<h3>$1</h3>');
    html = html.replace(/^#{2}\s*(.*?)$/gm, '<h2>$1</h2>');
    html = html.replace(/^#\s*(.*?)$/gm, '<h1>$1</h1>');
    
    // Handle bold text (support both ** and __ formats)
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
    
    // Handle italic text (support both * and _ formats) 
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.*?)(?<!\\)_(?!_)/g, '<em>$1</em>');
    
    // Handle underline (since Markdown doesn't have native underline, we'll use <u>)
    html = html.replace(/__(.*?)__/g, '<u>$1</u>');
    
    // Handle links [text](url) - support both with and without title
    html = html.replace(/\[([^\]]+)\]\(([^)]+?)(?:\s+"([^"]*)")?\)/g, '<a href="$2"$3>$1</a>');
    
    // Handle bullet lists
    html = html.replace(/^- (\s*)(.*?)(?=\n|$)/gm, '<li>$2</li>');
    
    // Handle ordered lists (numbered)
    html = html.replace(/^[0-9]+\.\s(.*?)(?=\n|$)/gm, '<li>$1</li>');
    
    // Wrap list items in <ul> or <ol> tags
    html = html.replace(/<li>(.*?)<\/li>/g, '<li>$1</li>');
    
    // Handle paragraphs (each new line becomes a paragraph)
    html = html.replace(/\n{2,}/g, '</p><p>');
    
    // Wrap content in paragraph tags and handle newlines
    html = '<p>' + html.replace(/\n/g, '<br>') + '</p>';
    
    // Wrap lists in appropriate tags
    html = html.replace(/<li>(.*?)<\/li>/g, '<li>$1</li>');
    
    // Wrap all content in proper list structure
    let finalHtml = "";
    const lines = html.split('\n');
    let inList = false;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        if (line.match(/^<li>/)) {
            // If we're not already in a list, open one
            if (!inList) {
                finalHtml += '<ul>';
                inList = true;
            }
            
            // Add the list item
            finalHtml += line + '\n';
        } else if (inList && !line.match(/^<li>/)) {
            // Close list and add new content
            finalHtml += '</ul>\n' + line + '\n';
            inList = false;
        } else {
            // Regular content
            finalHtml += line + '\n';
        }
    }
    
    if (inList) {
        finalHtml += '</ul>';
    }
    
    // Clean up any remaining paragraph tags
    finalHtml = finalHtml.replace(/<p><\/p>/g, '');
    
    return finalHtml.trim();
}

// Call the function to process the markdown content

function run() {
  const main = document.getElementById('main');
    if (!main) return;
    const html = convertMarkdownToHTML();
    if (typeof html === 'string') main.innerHTML = html;
}
