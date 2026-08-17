# Magical Kitty Mandarin

A child-friendly First Grade Mandarin practice game built around short, answer-first missions and a persistent magical study garden.

## First Grade study experience

The built-in curriculum is date-independent and can be selected in two ways:

- **By week:** 12 study-guide packs alternating HFW topics with Meizhou chapters in ascending chapter order (1, 2, 3, 4, 8, 10).
- **By category:** High Frequency Words, the complete dictation list, and Meizhou Chapters 1–8 and 10.

Starting a mission opens directly on an answerable prompt. Questions rotate among listening, character-to-meaning, and meaning-to-character. Incorrect answers immediately reveal the character, pinyin, and meaning, then return in a short review. Every completed 2–4 minute mission permanently advances the garden.

Free Play uses the same curriculum choices and also offers **All First Grade**. Its listening, matching, meaning, and optional writing modes award XP, levels, daily stars, and category stickers.

## Adding a custom list

Open **Manage** and enter a title, dates, and one item per line:

```text
東 | dōng | east
南 | nán | south
西 | xī | west
```

Tabs and commas also work. Custom lists are validated, previewed, and stored locally in that browser. Built-in content is defined in `src/data/firstGrade.ts` and adapted to the same `HomeworkAssignment` model in `src/homework/builtin.ts`.

## Development

```bash
npm install
npm run dev
npm run test:all
npm run build
```

- `src/data/firstGrade.ts` — source-derived vocabulary, categories, and 12 week packs.
- `src/homework/` — assignment authoring, quick missions, progress, and UI.
- `src/game/` and `src/ui/` — Free Play, progression, stickers, and game components.
- `docs/PRODUCT_OVERVIEW.md` — durable product principles and roadmap.

The GitHub Pages workflow runs unit/DOM tests, Chromium UI tests, and the production build before deployment.
