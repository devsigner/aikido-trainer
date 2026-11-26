---
name: git-workflow
description: Git rules of the Aikido Trainer project. Use before any commit, push, branch switch or publication.
---

# Git rules

- **Never push to `main` without the user's explicit approval** (GitHub Pages publishes automatically on push). Same for any other branch: push only when asked.
- Never commit without being asked or without approval; propose first ("Shall I commit and push?").
- Never add a `Co-authored-by` trailer to commit messages.
- Commit message: one line, in French, descriptive.
- Before committing: `yarn bump` if a served file changed, then `yarn lint` and `yarn test` (the pre-commit hook runs them again and blocks on failure). Never bypass the hook (`--no-verify`).
- Stage only the relevant project files (not `.gren/`, `gren_packages/`, `tests/gren/`, `node_modules/`).
- Branches: `main` = plain JS with the ELMer framework; `elm-gren` = Gren rewrite. Do not mix them; check `git branch --show-current` before acting.
- Commands: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack yarn --silent {bump|lint|test}`.
