# Local LLM tests 2026-08

# Prompt

_Write a JavaScript function that looks for a DIV with ID “main” and scans its text contents. Ignore nested HTML tags
inside the DIV. The contents are expected to be Markdown. The JavaScript function replaces all Markdown headings, bold,
italic, underline, bullets and hyperlinks with their corresponding HTML counterparts. Support escape characters and
nested bold/italic/underline/link Markdown. Don’t support any security sanitization, or use any downloadable libraries.
The replacement happens once upon function invocation._

The request for a non-existing Markdown "underline" was kept to measure each LLM's reaction to impossible requests.


# Results

| LLM                                | Thinking?     | Runtime   | Elapsed time  | Tokens (out+in) | tok/s | Tests passed             |
|------------------------------------|---------------|-----------|---------------|-----------------|-------|--------------------------|
| Ornith 1.0 35B MTPLX               | Off           | MTPLX     | 0:21          | 1k + 130        | 56.4  | 24/31 (one bug)          |
| Ornith 1.0 35B MTPLX               | On            | MTPLX     | 5:26          | 15.3k + 100     | 47.4  | 28/31                    |
| Ornith 1.0 35B MTPLX               | Auto (On)     | MTPLX     | 3:30          | 10.5k + 130     | 50.2  | 27/31                    |
| Ornith 1.5 35B A3B MTPLX           | Off           | MTPLX     | 0:18          | 1k + 140        | 58.1  | 21/31                    |
| Ornith 1.5 35B A3B MTPLX           | On            | MTPLX     | 16:56         | 41.6k + 150     | 41.0  | 27/31 (one syntax error) |
| Ornith 1.5 35B A3B MTPLX           | Auto (On)     | MTPLX     | 13:17         | 34.8k + 130     | 43.8  | 27/31                    |
| Qwen 3.8 27B Optimized Speed       | On (Mid)      | MTPLX     | 10:05         | 7.7k + 200      | 12.8  | 29/31                    |
| Qwen 3.6 27B Optimized Speed V2    | On            | MTPLX     | 10:40         | 9.4k + 130      | 14.8  | 02/31                    |
| Qwopus 3.6 27B Coder               | On            | MTPLX     | 10:20         | 10.6k + 130     | 17.1  | 19/31                    |
| Qwen 3.6 35B A3B                   | On            | LM Studio | N/A - looped  | N/A - looped    | 44.4  | N/A                      |
| Qwen 3.6 35B A3B                   | Off           | LM Studio | 0:50          | 2.2k            | 48.1  | 24/31                    |
| Qwen 3.8 9B                        | On (built-in) | LM Studio | 3:10          | 3.9k            | 21.4  | multiple syntax errors   |
| Ornith 1.0 35B MTPLX               | On (built-in) | LM Studio | 2:14          | 5.4k            | 42.0  | 18/31                    |
| Qwen 3.8 27B                       | On (Low)      | LM Studio | 24:14         | 10.2k           | 7.1   | 27/31                    |
| Qwen 3 Coder 30B A3B instruct 4bit | On (built-in) | LM Studio | 3:00          | ?               | ?     | 22/31                    |
| Qwen 3 Coder 30B A3B instruct 5bit | On (built-in) | LM Studio | N/A - crashed | N/A - crashed   | ?     | N/A                      |
| Devstral Small 2 2512              | Off           | LM Studio | 1:22          | 734             | 9.1   | 19/31                    |
| Gemma 4 26B A4B                    | On            | LM Studio | N/A - looped  | N/A - looped    | 34.0  | N/A                      |
| ChatGPT Medium                     | -             | ChatGPT   | 0:19          | ?               | ?     | 29/31                    |
| Sonnet 5 Medium                    | -             | Claude    | 2:42          | ?               | ?     | 24/31                    |
| Mistral Think                      | -             | Le Chat   | 0:58          | ?               | ?     | 24/31                    |


## Caveat

All models were run in their default temperature settings. This means that different runs of the same model may
result in wildly different metrics. For instance, Ornith 1.0 with thinking on was observed running for anywhere between
2 and 5 minutes, and with test results between 17/31 and 28/31. **Take these results with a grain of salt**.


## Notes

- All tests were run on a base M5 MacBook Pro with 32 GB of RAM.
- All tests were run on the Runtime "chat" interface, with the laptop plugged into power.
- The response from Qwen 3.8 9B has multiple JavaScript errors that Codex corrected when copying the JavaScript
  from `/individual-responses` to `/tests/js`. Despite the correction, that model would still score very poorly.
- The responses from Ornith 1.0 35B MTPLX (thinking off) and Ornith 1.5 35B A3B MTPLX (thinking on) had small issues
  that were corrected in the corresponding JavaScript file before running the tests.


# Adding test.md to the Prompt

Adding the `test.md` file (without comments) to the prompt did not improve things significantly:
- Ornith 1.0 gave a result that scored much lower
- Ornith 1.5 took over 1h thinking, after which I gave up waiting
- Qwen 3.8 took over 15min thinking, after which I gave up waiting


_Write a JavaScript function that looks for a DIV with ID “main” and scans its text contents. Ignore nested HTML tags
inside the DIV. The contents are expected to be Markdown. The JavaScript function replaces all Markdown headings, bold,
italic, underline, bullets and hyperlinks with their corresponding HTML counterparts. Support escape characters and
nested bold/italic/underline/link Markdown. Don’t support any security sanitization, or use any downloadable libraries.
The replacement happens once upon function invocation._

_Consider the following edge cases described in this test Markdown file:_

```
## Heading levels

### Third-level heading with **bold**

###### Sixth-level heading

#No space after hash should stay plain text

####### Seven hashes should not become an h7

## Lists

- First unordered item
- Unordered item with [a link](https://example.com/nested)

* Asterisk bullet
+ Plus bullet
- Dash bullet after other markers

## Escapes

\[This is not a link\](https://example.com)
\**This is not bold\**
\\*Italic between backslashes\\*

## Unclosed and adjacent formatting
This has **unclosed bold.
This has *unclosed italic.
This has ++unclosed underline.

Adjacent emphasis: **bold***italic*.
Triple emphasis: ***bold+italic***.
Bold containing italic: **bold *italic***.
Bold italic then bold text: ***bold+italic* bold**.
Italic containing bold then italic text: ***bold+italic** italic*.
Underscore emphasis: __bold with underscores__ and _italic with underscores_.

## Links and raw text

A link with punctuation: [example, with comma](https://example.com/path?x=1&y=two).
A link with parentheses in the URL: [parentheses](https://example.com/a_(b)).
Raw URL: https://example.com/raw-url
```