# JuriDAO Simulator — Decisions and Deviations

<!-- Append newest at the bottom. Format: date | Phase N | what was assumed or changed | why -->

- 2026-10-08 | Phase 0 | SPEC.md created as a copy of JuriDAO_ThinkRoot.md | The user's Phase 0 message said "The full spec follows:" but no spec text was pasted after that line. The spec document already existed in the project root as JuriDAO_ThinkRoot.md. SPEC.md was created as an exact copy of that file.
- 2026-10-08 | Phase 0 | reference/ folder created but is empty | The three Complete Pack files (juridao-engine.js, selftest.js, juridao-engine.test.js) were referenced in the user's Phase 0 message as "attached" but were not present in the workspace. Per SPEC.md PART B section 0 rule 2 and PART C section C2, the engine must never be written by the builder. Phase 0 is marked PARTIAL until all three files are supplied by the user.

- 2026-10-08 | Phase 0 | reference/ files dropped in project root, not in reference/ | The three Complete Pack files (juridao-engine.js, selftest.js, juridao-engine.test.js) were added by the user to the project root instead of reference/. Builder moved them to reference/. Files verified as genuine (28,495 / 4,853 / 15,003 bytes). Phase 0 is now DONE.
- 2026-10-08 | Phase 1 | Initialized React + Vite application with Tailwind CSS | Built the application shell, client-side routing for all required routes including `/testlab`, header with account selector, mode switcher, dummy balances, quick buy trigger, simulation banner, empty states, and responsive mobile drawer navigation adhering to SPEC.md section C6.
- 2026-10-08 | Phase 2 | Renamed `store.js` to `store.jsx` | File contains React JSX elements (`<StoreContext.Provider>`); Vite build requires `.jsx` extension for JSX parsing.


