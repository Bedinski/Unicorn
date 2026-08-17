# Pre–First Grade curriculum archive

This archive preserves the application immediately before the First Grade
curriculum was introduced. It is historical reference only and is not imported
by, bundled into, or selectable from the current application.

## Canonical snapshot

- Commit: `4cdb3c44563ac11c6014b497b479bfa096389121`
- Tag: `archive/pre-first-grade-2026`
- Last active experience: the fast mixed-question homework flow before the
  First Grade source pack was added.

The snapshot contains the complete earlier built-in content, including:

- `src/data/words.ts` — the former recognition catalog
- `src/data/dictation.ts` — the former dated 52-word writing schedule
- `src/data/curriculum.ts` — the former dated assessment sequence
- `src/homework/builtin.ts` — the former built-in homework assignments

To inspect one archived file without changing the working tree:

```sh
git show archive/pre-first-grade-2026:src/data/words.ts
```

To restore the whole historical app in a separate worktree:

```sh
git worktree add ../Unicorn-pre-first-grade archive/pre-first-grade-2026
```

## Runtime boundary

Production vocabulary comes only from `src/data/firstGrade.ts`. The public
`WORDS`, dictation, curriculum scopes, built-in homework, game pools, and
stickers all derive from that file. Nothing under `archive/` is compiled or
served.

On the first load after this boundary was introduced, browser data from the old
curriculum is retained under `magical-kitty-mandarin:archive:pre-first-grade:*`
keys. Legacy vocabulary, categories, assignments, and sessions are excluded
from active practice. Parent-authored homework created after the migration
continues to use the current First Grade storage namespace.
