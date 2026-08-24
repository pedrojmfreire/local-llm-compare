<!-- TEST {"name":"h2 heading","selector":"h2","text":"Heading levels"} -->
## Heading levels

<!-- TEST {"name":"h3 heading with bold","selector":"h3","text":"Third-level heading with bold","contains":{"selector":"strong","text":"bold"}} -->
### Third-level heading with **bold**

<!-- TEST {"name":"h6 heading","selector":"h6","text":"Sixth-level heading"} -->
###### Sixth-level heading

<!-- TEST {"name":"malformed hash heading stays text","selector":"#main","containsText":"#No space after hash should stay plain text","notContains":{"selector":"h1","text":"No space after hash should stay plain text"}} -->
#No space after hash should stay plain text

<!-- TEST {"name":"seven-hash heading stays text","selector":"#main","containsText":"####### Seven hashes should not become an h7","notContains":{"selector":"h6","text":"Seven hashes should not become an h7"}} -->
####### Seven hashes should not become an h7

<!-- TEST {"name":"lists section heading","selector":"h2","text":"Lists"} -->
## Lists

<!-- TEST {"name":"first unordered list item","selector":"li","text":"First unordered item"} -->
- First unordered item
<!-- TEST {"name":"nested unordered list item","selector":"li li","text":"Nested unordered item"} -->
  - Nested unordered item
<!-- TEST {"name":"nested list link","selector":"li li","text":"Nested item with a link","contains":{"selector":"a","text":"a link","attr":{"href":"https://example.com/nested"}}} -->
  - Nested item with [a link](https://example.com/nested)
<!-- TEST {"name":"outer list resumes","selector":"li","text":"Back to the outer list"} -->
- Back to the outer list

<!-- TEST {"name":"asterisk bullet","selector":"li","text":"Asterisk bullet"} -->
* Asterisk bullet
<!-- TEST {"name":"plus bullet","selector":"li","text":"Plus bullet"} -->
+ Plus bullet
<!-- TEST {"name":"dash bullet after mixed markers","selector":"li","text":"Dash bullet after other markers"} -->
- Dash bullet after other markers

<!-- TEST {"name":"escapes section heading","selector":"h2","text":"Escapes"} -->
## Escapes

<!-- TEST {"name":"escaped link stays text","selector":"#main","containsText":"[This is not a link](https://example.com)","notContains":{"selector":"a","text":"This is not a link","attr":{"href":"https://example.com"}}} -->
\[This is not a link\](https://example.com)

<!-- TEST {"name":"single escaped bold markers produce italic text","selector":"#main","containsText":"*This is not bold*","contains":{"selector":"em","text":"This is not bold*"},"notContains":{"selector":"strong","text":"This is not bold"}} -->
\**This is not bold\**

<!-- TEST {"name":"escaped backslashes leave italic markers active","selector":"#main","containsText":"Italic between backslashes","contains":{"selector":"em","containsText":"Italic between backslashes"}} -->
\\*Italic between backslashes\\*

<!-- TEST {"name":"unclosed section heading","selector":"h2","text":"Unclosed and adjacent formatting"} -->
## Unclosed and adjacent formatting

<!-- TEST {"name":"unclosed bold remains unrendered","selector":"#main","containsText":"**unclosed bold","notContains":{"selector":"strong","text":"unclosed bold"}} -->
This has **unclosed bold.

<!-- TEST {"name":"unclosed italic remains unrendered","selector":"#main","containsText":"*unclosed italic","notContains":{"selector":"em","text":"unclosed italic"}} -->
This has *unclosed italic.

<!-- TEST {"name":"unclosed underline remains unrendered","selector":"#main","containsText":"++unclosed underline","notContains":{"selector":"u","text":"unclosed underline"}} -->
This has ++unclosed underline.

<!-- TEST {"name":"adjacent bold element","selector":"strong","text":"bold"} -->
<!-- TEST {"name":"adjacent italic element","selector":"em","text":"italic"} -->
Adjacent emphasis: **bold***italic*.

<!-- TEST {"name":"triple emphasis bold italic","selector":"strong","contains":{"selector":"em","text":"bold+italic"}} -->
Triple emphasis: ***bold+italic***.

<!-- TEST {"name":"bold containing italic","selector":"strong","containsText":"bold italic","contains":{"selector":"em","text":"italic"}} -->
Bold containing italic: **bold *italic***.

<!-- TEST {"name":"bold italic then bold text","selector":"strong","text":"bold+italic bold","contains":{"selector":"em","text":"bold+italic"}} -->
Bold italic then bold text: ***bold+italic* bold**.

<!-- TEST {"name":"italic containing bold then italic text","selector":"em","text":"bold+italic italic","contains":{"selector":"strong","text":"bold+italic"}} -->
Italic containing bold then italic text: ***bold+italic** italic*.

<!-- TEST {"name":"underscore bold","selector":"strong","text":"bold with underscores"} -->
<!-- TEST {"name":"underscore italic","selector":"em","text":"italic with underscores"} -->
Underscore emphasis: __bold with underscores__ and _italic with underscores_.

<!-- TEST {"name":"links section heading","selector":"h2","text":"Links and raw text"} -->
## Links and raw text

<!-- TEST {"name":"link with query punctuation","selector":"a","text":"example, with comma","attr":{"href":"https://example.com/path?x=1&y=two"}} -->
A link with punctuation: [example, with comma](https://example.com/path?x=1&y=two).

<!-- TEST {"name":"link with url parentheses","selector":"a","text":"parentheses","attr":{"href":"https://example.com/a_(b)"}} -->
A link with parentheses in the URL: [parentheses](https://example.com/a_(b)).

<!-- TEST {"name":"raw url remains text","selector":"#main","containsText":"https://example.com/raw-url","notContains":{"selector":"a","text":"https://example.com/raw-url"}} -->
Raw URL: https://example.com/raw-url
