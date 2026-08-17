# Magical Kitty Mandarin — Product Overview

Last updated: 2026-08-16

This document is the durable product and implementation context for Magical Kitty Mandarin. Read it before changing the child experience, learning loop, progression, art, curriculum model, authoring tools, or architecture.

## Product purpose

Magical Kitty Mandarin helps a first-grade child finish real weekly Mandarin homework quickly and willingly. It is not intended to be a broad language course or an endless engagement product. The app should turn a parent- or teacher-supplied list of Traditional Chinese characters and words into short, effective practice missions.

The target experience is: **a tiny magical Mandarin adventure that completes real homework in a few focused minutes.**

## Primary users

- **Child:** approximately age 6–7, an early reader with a short attention span. Needs large, predictable interactions, spoken prompts, gentle correction, and rapid visible progress.
- **Parent/caregiver:** wants to add this week's homework in under 90 seconds, start practice without setup, and see what needs review.
- **Mandarin educator:** needs accurate Traditional Chinese glyphs, Taiwanese Mandarin pronunciation, appropriate stroke order, and dependable practice records.

## Product principles

1. **Homework first.** Opening the app should reveal one obvious next mission. Menus and metagame controls must not delay practice.
2. **Short missions, persistent progress.** The weekly assignment is a content container. Children experience it as 2–4 minute missions containing 2–3 focus items.
3. **Every session changes the world.** A completed mission must produce one visible, permanent change to the kitty's study garden. Weekly rewards are secondary.
4. **Teach, do not merely test.** Incorrect answers trigger progressively clearer scaffolds. They never remove progress, break a streak, or make the pet disappointed.
5. **Answer first.** Starting a mission must open directly on a prompt the child can hear or see and answer. Never force a Learn → Write sequence before questions begin.
6. **Mastery over taps.** Progress represents varied recognition, recall, delayed recall, optional guided writing, and review—not raw XP alone.
7. **One coherent world.** The child experience uses one hero kitty, a small cast of ink spirits, one art direction, and one progression system. Homework and Adventure are not separate products.
8. **A real stopping point.** Every mission ends clearly. Continuing is optional; the app does not use energy, lives, loot boxes, leaderboards, streak loss, ads, or manipulative notifications.
9. **Local-first and child-safe.** No account or network is required for core use. Any future sync, microphone, or analytics feature must be parent-controlled and privacy-reviewed first.

## Core loop

```text
Open today's mission
  → hear or see a question immediately
  → choose an answer
  → see and hear instant feedback
  → rotate to a different question style
  → briefly repeat missed items
  → choose or reveal a reward
  → garden visibly changes
  → stop, or play another short mission
```

### Progression cadence

- **Every answer (about 20–30 seconds):** specific feedback, sound, animation, and visible mission progress.
- **Every 2–3 answers:** a small scene reaction or discovery.
- **Every 2–4 minute mission:** a permanent garden stage, collectible, or customization change.
- **Across several missions:** one object develops through recognizable stages such as seed → sprout → flower → ink-spirit visitor.
- **Weekly completion:** a larger scene/story payoff that never gates the first satisfying reward.

The first implementation uses a deterministic garden stage based on completed missions. Future rewards may add child choice, but must stay predictable and non-random.

## Learning model

Each item should move through these states over multiple encounters, not through a mandatory sequence inside every mission:

1. New
2. Learned with audio and visual support
3. Successful recognition in varied prompt directions
4. Unassisted recall
5. Delayed recall
6. Optional guided writing or tracing
7. Secure, or needs review

The production goal is to use Taiwan-appropriate stroke data and native Taiwanese Mandarin recordings for built-in content. Browser speech synthesis remains a fallback for custom content.

The current pure TypeScript session engine builds one rapid mixed queue using three prompt types: listen and choose a character, see a character and choose its meaning, and see a meaning and choose its character. Every focus item appears in at least two directions; one-item assignments use all three. Incorrect answers reveal the full character, pinyin, and meaning immediately, then return in a short review queue. Writing remains optional and does not gate assignment completion.

## Child experience

### Home

- One primary mission card with 2–3 focus items, a 2–4 minute estimate, and the next garden change.
- Date-independent First Grade selection is grouped into **By week** and **By category** and remains visually secondary.
- Parent tools remain accessible outside the primary child path.

### Mission

- One instruction and one decision per screen.
- The first screen is already an answerable question—there are no prerequisite lesson steps.
- Rotate listening, character-to-meaning, and meaning-to-character prompts within one short mission.
- Spoken prompt, replay, and immediate corrective feedback are always available.
- Large touch targets and visible keyboard focus.
- Progress is expressed as a short question count, not an intimidating full assignment total.
- Handwriting and paper dictation are optional modes, never a mandatory gate before recall practice.

### Completion

- Celebrate the mission, not only the entire week.
- Show which characters were practiced.
- Advance the persistent garden immediately.
- Offer a clear Done action and a secondary optional next mission.

### Adventure

The existing Free Play feature will become assignment-aware Adventure. It should reuse current weak/recent items and the same art/progression system. Planned modes include listening choice, picture matching, character-component puzzles, stroke rescue, and quick dictation.

## Parent experience

- Paste or import `Hanzi | pinyin | English` rows.
- Automatically validate dates, duplicates, item IDs, glyph metadata, and supported practice modes.
- Preview exactly what the child will see.
- Clone a week, edit rows in a structured table, export/import a backup, and eventually attach recorded audio.
- Report each item as new, learning, remembered, or needs review.

The parent workflow must remain usable without an account. Optional sync is a later service behind the existing repository boundary.

## Art and audio direction

The visual world is a warm, hand-painted Mandarin study garden at dusk. The hero is a friendly silver-lilac cat with a jade collar and small golden bell, accompanied by rounded magical ink spirits.

- Medium: tactile gouache/colored-pencil storybook illustration with polished mobile-game composition.
- Palette: midnight teal, warm cream, jade, coral, and soft gold. Avoid default neon-purple gradients.
- Mood: cozy, magical, optimistic, and calm rather than hyperstimulating.
- Cultural standard: contemporary Taiwanese details reviewed for accuracy; no generic “Asian” decoration or invented Chinese text.
- Asset use: raster WebP/AVIF/PNG for painted scenes, animation sprites or Rive-style assets for characters, and SVG only for UI icons and accurate stroke paths.
- Typography: replace Comic Sans-style presentation with a readable rounded UI face and a Taiwan-appropriate Traditional Chinese display face.
- Audio: human Taiwanese Mandarin for built-in content; TTS fallback; separate music, voice, and effects controls.

The first production-bound key art is `public/art/mission-garden-v1.webp`. It is an anchor for composition and mood, not a complete art bible.

## Architecture direction

Preserve:

- Pure assignment validation and parsing.
- Built-in/custom repository abstraction.
- Pure homework session transitions.
- Versioned progress persistence and defensive normalization.
- Existing test coverage and Free Play domain utilities until migrated.

Move toward:

```text
src/
  domain/       assignments, sessions, mastery, rewards
  content/      curriculum, characters, schemas, asset metadata
  features/     child home, mission, adventure, collection, parent
  design-system/
  services/     audio, handwriting, storage, optional sync
```

The string-rendered UI should eventually move to React or Preact components, but only after the short-mission behavior and visual direction are proven. Avoid a framework rewrite that freezes product iteration.

## Quality bar

- 90% of observed target-age children can start homework without adult help in under five seconds.
- A normal mission lasts 2–4 minutes; the weekly assignment can span several missions.
- Parents can add a week in under 90 seconds.
- Built-in content has reviewed glyph, pronunciation, meaning, and stroke data.
- WCAG 2.2 AA baseline, 48px preferred child touch targets, reduced-motion support, spoken prompts, and no color-only meaning.
- Unit tests for domain rules, DOM/component tests for interactions and focus, browser tests for critical child/parent flows and phone layout, visual regression for art/layout, and schema validation for all content.
- Mobile production performance score of at least 90 and offline operation after initial load.
- No ads, behavioral tracking, or manipulative engagement mechanics.

## Delivery order

1. **Fast mixed-practice vertical slice:** 2–3 focus items, immediate varied questions, corrective review, mission completion, persistent garden progression, new home/summary art, tests.
2. **Optional guided handwriting:** validated stroke animation, tracing, progressive hints, and paper/digital preference without blocking fast practice.
3. **Mastery scheduling:** distribute learn/write/recall across sessions and add delayed review.
4. **Production art/audio system:** art bible, mascot expression/animation set, native recordings, visual meaning cards, sound controls.
5. **Parent authoring/reporting:** enrichment, structured row editing, clone, backup, and mastery report.
6. **Adventure migration:** replace disconnected Free Play with assignment-aware optional modes.
7. **PWA, privacy, accessibility, and classroom usability quality pass.**

## Current decision log

- The weekly assignment remains the parent-facing organizational unit.
- The child-facing unit is a short mission of at most three focus items.
- Inter-session progression outranks weekly progression.
- Every mission advances a persistent garden stage.
- Mandatory Learn/Write/Remember phases were removed after product review: they slowed the child down and lost the original answer-first game loop.
- Missions now mix three immediate question styles and requeue misses for quick review; handwriting is optional.
- The legacy SVG kitty is not the target art direction. New production art begins with the painted mission garden and a single coherent mascot identity.
- The 2026–27 First Grade source pack is modeled without school-calendar dates. Twelve study guides become Week 1–12; the High Frequency Word master list, complete dictation list, and Meizhou vocabulary chapters become category packs.
- Mandarin Songs, the Meizhou textbook directory, and Kinder home-review resources are intentionally outside the current curriculum scope.
- Homework and Free Play must share one canonical vocabulary catalog so a week/category selection behaves consistently everywhere.
- Authentic source vocabulary can have duplicate English glosses. Choice identity therefore uses Hanzi, while English remains display content.
