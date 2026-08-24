# Local LLM tests 2026-08

# Prompt

_Write a JavaScript function that looks for a DIV with ID “main” and scans its text contents. Ignore nested HTML tags
inside the DIV. The contents are expected to be Markdown. The JavaScript function replaces all Markdown headings, bold,
italic, underline, bullets and hyperlinks with their corresponding HTML counterparts. Support escape characters and
nested bold/italic/underline/link Markdown. Don’t support any security sanitization, or use any downloadable libraries.
The replacement happens once upon function invocation._

The request for a non-existing Markdown "underline" was kept to measure each LLM's reaction to impossible requests.


# Results

| LLM                                | Thinking?     | Runtime   | Elapsed time  | Tokens (out+in) | tok/s | Tests passed  |
|------------------------------------|---------------|-----------|---------------|-----------------|-------|---------------|
| Ornith 1.0 35B MTPLX               | On (built-in) | MTPLX     | 5:26          | 15.3k + 100     | 47.4  | 28/33         |
| Qwen 3.8 27B Optimized Speed       | On (Mid)      | MTPLX     | 10:05         | 7.7k + 200      | 12.8  | 28/33         |
| Qwen 3.6 27B Optimized Speed V2    | On            | MTPLX     | 10:40         | 9.4k + 130      | 14.8  | 03/33         |
| Qwopus 3.6 27B Coder               | On            | MTPLX     | 10:20         | 10.6k + 130     | 17.1  | 20/33         |
| Qwen 3.6 35B A3B                   | On            | LM Studio | N/A - looped  | N/A - looped    | 44.4  | N/A           |
| Qwen 3.6 35B A3B                   | Off           | LM Studio | 0:50          | 2.2k            | 48.1  | 24/33         |
| Qwen 3.8 9B                        | On (built-in) | LM Studio | 3:10          | 3.9k            | 21.4  | syntax errors |
| Ornith 1.0 35B MTPLX               | On (built-in) | LM Studio | 2:14          | 5.4k            | 42.0  | 19/33         |
| Qwen 3.8 27B                       | On (Low)      | LM Studio | 24:14         | 10.2k           | 7.1   | 26/33         |
| Qwen 3 Coder 30B A3B instruct 4bit | On (built-in) | LM Studio | 3:00          | ?               | ?     | 22/33         |
| Qwen 3 Coder 30B A3B instruct 5bit | On (built-in) | LM Studio | N/A - crashed | N/A - crashed   | ?     | N/A           |
| Devstral Small 2 2512              | Off           | LM Studio | 1:22          | 734             | 9.1   | 20/33         |
| Gemma 4 26B A4B                    | On            | LM Studio | N/A - looped  | N/A - looped    | 34.0  | N/A           |
| ChatGPT Medium                     | -             | ChatGPT   | 0:19          | ?               | ?     | 28/33         |
| Sonnet 5 Medium                    | -             | Claude    | 2:42          | ?               | ?     | 25/33         |
| Mistral Think                      | -             | Le Chat   | 0:58          | ?               | ?     | 24/33         |


## Notes

- All tests were run on the Runtime "chat" interface, with the laptop plugged into power.
- The response from Qwen 3.8 9B has multiple JavaScript errors that Codex corrected when copying the JavaScript
  from `/individual-responses` to `/tests/js`.

