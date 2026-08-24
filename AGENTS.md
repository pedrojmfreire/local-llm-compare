# Local-LLM-Compare

This is a project where I keep track of, and share, my own local LLM benchmarks.

The metrics tracked are currently:
- Total elapsed time, from prompt submission until response end
- Consumed tokens
- Average tokens/second
- If the generated code passes "smoke tests" fully ("ok"), partially ("ok, fails...") or not at all.


## Folder Structure

```plaintext
/local-llm-compare
│
├── /<year-month>                   # General data when these tests were run; multiple such folders can exist
│   ├── /individual-responses       # One Markdown file per LLM, with the exact response from the LLM, based on the
│   │                               # README.md file in the parent.
│   ├── /tests                      # Smoke tests.
│   └── README.md                   # Human-readable prompt used and summary of results.
│
├── AGENTS.md                       # This file
├── CLAUDE.md                       # Context file for Claude Code - simply refers to AGENTS.md
├── GEMINI.md                       # Context file for Google Gemini - simply refers to AGENTS.md
└── LICENSE                         # License file -- Apache 2.0
```

### Naming conventions in folder .../individual-responses

```plaintext
<unique-model-and-version>-<optional-size>-<runtime>.md
```

- `<unique-model-and-version>` — e.g., `ornith`, `qwen3.6-coder`
- `<optional-size>` — e.g., `27b`, `9b`
- `<runtime>` — e.g., `online`, `mtplx`, `lms` (LM Studio)


## AI Involvement

Metrics are currently run manually.
AI may be involved in building and running tests and generating the `README.md` summary.
