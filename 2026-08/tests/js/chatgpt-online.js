function renderMainMarkdown() {
    const main = document.getElementById("main");
    if (!main) return;

    // textContent deliberately ignores any existing HTML structure.
    const markdown = main.textContent;

    function parseInline(text) {
        let pos = 0;

        function parse(stop = null) {
            let html = "";

            while (pos < text.length) {
                // Closing delimiter
                if (stop && text.startsWith(stop, pos)) {
                    pos += stop.length;
                    return { html, closed: true };
                }

                // Escape: \* \_ \+ \[ etc.
                if (text[pos] === "\\") {
                    if (pos + 1 < text.length) {
                        html += text[pos + 1];
                        pos += 2;
                    } else {
                        html += "\\";
                        pos++;
                    }
                    continue;
                }

                // Link: [label](url)
                if (text[pos] === "[") {
                    const start = pos++;
                    const label = parse("]");

                    if (label.closed && text[pos] === "(") {
                        pos++;

                        let url = "";
                        let foundEnd = false;

                        while (pos < text.length) {
                            if (text[pos] === "\\") {
                                if (pos + 1 < text.length) {
                                    url += text[pos + 1];
                                    pos += 2;
                                } else {
                                    url += "\\";
                                    pos++;
                                }
                            } else if (text[pos] === ")") {
                                pos++;
                                foundEnd = true;
                                break;
                            } else {
                                url += text[pos++];
                            }
                        }

                        if (foundEnd) {
                            html += `<a href="${url}">${label.html}</a>`;
                            continue;
                        }
                    }

                    // Invalid/incomplete link: reproduce its parsed contents.
                    html += "[" + label.html;
                    pos = Math.max(pos, start + 1);
                    continue;
                }

                // Bold: **text** or __text__
                if (
                    text.startsWith("**", pos) ||
                    text.startsWith("__", pos)
                ) {
                    const delimiter = text.substr(pos, 2);
                    const start = pos;
                    pos += 2;

                    const inner = parse(delimiter);

                    if (inner.closed) {
                        html += `<strong>${inner.html}</strong>`;
                    } else {
                        html += delimiter + inner.html;
                        pos = text.length;
                    }
                    continue;
                }

                // Underline: ++text++
                if (text.startsWith("++", pos)) {
                    const start = pos;
                    pos += 2;

                    const inner = parse("++");

                    if (inner.closed) {
                        html += `<u>${inner.html}</u>`;
                    } else {
                        html += "++" + inner.html;
                        pos = text.length;
                    }
                    continue;
                }

                // Italic: *text* or _text_
                if (text[pos] === "*" || text[pos] === "_") {
                    const delimiter = text[pos++];
                    const inner = parse(delimiter);

                    if (inner.closed) {
                        html += `<em>${inner.html}</em>`;
                    } else {
                        html += delimiter + inner.html;
                        pos = text.length;
                    }
                    continue;
                }

                html += text[pos++];
            }

            return { html, closed: false };
        }

        return parse().html;
    }

    function parseBlocks(text) {
        const lines = text.replace(/\r\n?/g, "\n").split("\n");
        let html = "";
        let inList = false;

        function closeList() {
            if (inList) {
                html += "</ul>";
                inList = false;
            }
        }

        for (const line of lines) {
            // Heading: # through ######
            const heading = line.match(/^(#{1,6})[ \t]+(.*)$/);

            if (heading) {
                closeList();

                const level = heading[1].length;
                html += `<h${level}>${parseInline(heading[2])}</h${level}>`;
                continue;
            }

            // Bullet: -, *, or +
            const bullet = line.match(/^[ \t]*[-*+][ \t]+(.*)$/);

            if (bullet) {
                if (!inList) {
                    html += "<ul>";
                    inList = true;
                }

                html += `<li>${parseInline(bullet[1])}</li>`;
                continue;
            }

            closeList();

            // Empty line
            if (/^[ \t]*$/.test(line)) {
                html += "\n";
                continue;
            }

            html += `<div>${parseInline(line)}</div>`;
        }

        closeList();
        return html;
    }

    main.innerHTML = parseBlocks(markdown);
}

function run() {
  renderMainMarkdown();
}
