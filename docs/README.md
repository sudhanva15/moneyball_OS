# AI Wealth OS — Documentation Index

This `docs/` folder is versioned documentation, not a single living file. Every
release gets its own dated/versioned folder, and **old versions are never
deleted or overwritten** — the whole point is to be able to look back at what
v1.0 believed and did, compare it to v1.1, v2.0, etc., and see the reasoning
evolve alongside the code. If a rule, an architecture decision, or a UI
behavior changes, the new version's docs explain what changed and why in its
own `CHANGELOG` entry — they don't silently replace the old explanation.

## Structure

```
docs/
├── README.md                  ← you are here
├── CHANGELOG.md                ← one entry per version, append-only
├── v1.0/                        ← first shipped version (this release)
│   ├── 00-OVERVIEW.md
│   ├── 01-USER-FLOW.md
│   ├── 02-UI-GUIDE.md
│   ├── 03-ARCHITECTURE.md
│   ├── 04-ELIGIBILITY-LOGIC.md
│   ├── 05-DATA-SOURCES.md
│   ├── 06-CONTINUITY-SUITABILITY-RECOMMENDATIONS.md
│   └── screenshots/            ← placeholder, see note below
└── v2-research/                 ← research + proposal for the next version
    ├── RESEARCH.md
    └── PROPOSAL.md
```

When v1.1 or v2.0 ships, create `docs/v1.1/` or `docs/v2.0/` as a full copy
of the previous version's doc set, then edit in place for what changed. Don't
edit `v1.0/` after the fact except to fix factual errors about what v1.0
*actually was* — it's a historical record.

## Screenshots

Screenshots weren't captured for this v1.0 doc set — the Chrome browser tool
wasn't connected in this session. `v1.0/screenshots/` has a placeholder
explaining what's missing. To fill it in: install the Claude in Chrome
extension (https://chromewebstore.google.com/detail/fcoeoabgfenejglbffodgkkbkcdhcgfn),
sign in with the same account, then ask Claude to "capture screenshots for
the v1.0 docs" and it can navigate the live app and drop them in.

## Reading order

If you're new to the project, read the v1.0 docs in numeric order — each one
assumes you've read the last. `04` (eligibility logic) and `06` (continuity /
suitability / recommendations) are the two most likely to matter once you
start acting on anything the tool tells you.
