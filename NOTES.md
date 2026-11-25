# timetable-generator — notes

## Moved from CLAUDE.md (2026-11-26)

Verbatim copy of the CLAUDE.md section as it stood; newer than or equal to anything above.

### 2. timetable-generator/ — Next.js 16, React 19
Constraint-based academic timetable, AY 2026-27. `npm run dev / build / lint`.
> **Next.js 16 / React 19 APIs differ from older versions — read `node_modules/next/dist/docs/` + project `AGENTS.md` before writing Next-specific code.**
- `lib/`: `client-store.ts` (`localStorage tt_*`, auto-migrates on `tt_version`≠`SEED_VERSION`), `store.ts` (server JSON in `data/`), `generator.ts` (solver: mentor categories, `maxHoursPerWeek`, last-session-only subjects), `client-export.ts` (xlsx+CSV; `exportMentorMappingExcel` = AMET format).
- Routes `/timetable` (A4 print CSS), `/setup`, `/mentors` (summary tab incl. mentor×day **load heatmap**, 2026-07-19), `/absence`. `MentorCategory` `MTECH`/`APTITUDE` legacy — data compat only.
- GitHub Pages → syahmedu.github.io/timetable-generator/
