# Caderno de Retoma de Contexto (MVP)

## Goal
Architect and scaffold a local-first, offline PWA that captures a user's mental state when interrupting a task and retrieves it seamlessly upon resumption, using Vite, React, TS, Dexie, and Tailwind CSS v4.

## Tasks
- [ ] Scaffold Vite project (`npx create-vite`), configure Tailwind CSS v4, and install dependencies (Dexie, React Router, i18next, PWA plugin). → Verify: `npm run dev` boots successfully with Tailwind styles applied.
- [ ] Define precise Data Models in `src/types/index.ts` (Task, Tag, Snapshot, Settings). → Verify: Types strictness passes `tsc --noEmit` without errors.
- [ ] Implement Dexie database initialization in `src/db/db.ts` mapping precisely to definitions. → Verify: Console confirms Dexie initializes the database schemas.
- [ ] Setup `src/i18n/config.ts` with browser language detection and purely text-based (PT | EN) language toggling semantics. → Verify: Falls back to `en-US` cleanly if localization fails.
- [ ] Implement React Router structure for core screens (`/`, `/task/new`, `/task/:id/pause`, `/task/:id/resume`, `/task/:id/history`, `/search`, `/settings`). → Verify: Navigating between these mocked routes works.

## Done When
- [ ] The base architectural foundation is scaffolded.
- [ ] All data types and database layers are fully strictly typed.
- [ ] The user clears the Socratic Gate on edge case behaviors regarding data persistence and language switching.
