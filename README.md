# Magical Kitty Mandarin

A child-friendly Mandarin homework app with a guided learning path, parent-authored weekly assignments, and a separate Free Play game.

## Homework flow

Each weekly assignment is automatically divided into connected missions of at most three focus items. Every 2–4 minute mission moves through four deterministic stages:

1. **Learn** — see, hear, and say each character.
2. **Write** — copy each character on paper while saying it aloud.
3. **Remember** — write from a pinyin/meaning clue, then reveal and self-check.
4. **Review** — missed items return before the session can finish.

Progress is stored per assignment and character, including learned status, writing practice, correct recall, and incorrect recall. In-progress sessions resume after a reload.

Completing any mission permanently advances the shared magical study garden. Mission planning introduces unpracticed items first, prioritizes items with more misses, and then revisits the least-recently-practiced material. The longer-term product principles and delivery sequence live in [`docs/PRODUCT_OVERVIEW.md`](docs/PRODUCT_OVERVIEW.md).

## Adding a weekly assignment

Open **Manage** in the app and enter a title, start date, due date, and one item per line:

```text
我 | wǒ | I
你 | nǐ | you
好 | hǎo | good
```

Tabs and commas also work as separators. Use **Preview & validate** before saving. Validation checks dates, required metadata, duplicates, and assignment size.

Custom assignments currently live in that browser's local storage. They can be edited or deleted from Manage. A future sync service can implement the same `HomeworkRepository` interface without changing the session engine or views.

Built-in class data is adapted into the same assignment model by `src/homework/builtin.ts`. New product features should depend on `HomeworkAssignment`, not directly on the legacy curriculum files.

## Development

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm test          # Vitest domain and DOM integration tests
npm run test:ui   # Playwright browser and responsive tests
npm run test:all  # Both suites
npm run build     # Type-check and production build
```

The Playwright suite starts its own Vite server and covers the default homework screen, Free Play navigation, parent authoring, a complete child session, missed-item review, and phone layout.

## Architecture

- `src/homework/model.ts` — assignment types, row parser, and validation.
- `src/homework/repository.ts` — built-in/custom assignment access.
- `src/homework/session.ts` — pure homework state machine.
- `src/homework/progress.ts` — versioned per-character progress persistence.
- `src/homework/ui.ts` — child and parent homework screens.
- `src/game/` and `src/ui/` — existing Free Play engine and components.

The GitHub Pages workflow runs unit tests, installs Chromium, runs UI tests, and builds the production bundle before deployment.
