# AGENTS.md — JuriDAO Simulator Build Rules

> These rules apply to every AI agent or ThinkRoot account working on this project.
> Read HANDOFF.md and the last section of BUILD_LOG.md before doing anything.

## Non-negotiable rules

1. **Never edit** `src/lib/juridao-engine.js` or `src/lib/selftest.js`. These are given, tested modules. If the UI disagrees with the engine, the UI is wrong.
2. **One phase at a time.** Do not start Phase N+1 until the Phase N check passes and the LOG STEP is complete.
3. **Every phase ends with the LOG STEP** (SPEC.md PART E section E3):
   - Append a section to `BUILD_LOG.md`.
   - Overwrite `HANDOFF.md`.
   - Append any assumptions to `DECISIONS.md`.
   - Reply with exactly one line: "Phase N: PASS or FAIL. Flow tests x of 21. Next action: ..."
4. **PART C overrides PART B** wherever they differ.
5. **Use exactly** the function names, parameter orders, field names and storage keys written in SPEC.md. Never invent engine functions.
6. **Never hard-code fake data** except the landing stats (which must be labelled "demo data").
7. **Update HANDOFF.md** after every major step within a phase, not only at phase end.

## Key files

| File | Rule |
|---|---|
| `SPEC.md` | Master spec. Read PART A first, then PART C overrides, then PART B. |
| `BUILD_LOG.md` | Append one section per phase. Never delete. |
| `HANDOFF.md` | Overwrite on every update. Single source of truth for current state. |
| `DECISIONS.md` | Append every assumption or deviation, newest at the bottom. |
| `reference/` | Engine files. Copy to `src/lib/` in Phase 2. Never edit the copies. |

## Phase order (from SPEC.md PART C section C7)

0 Setup → 1 Shell → 2 Engine/store/flow tests → 3 Landing/Guide → 4 Courts/token →
5 Juror pages → 6 Deals → 7 Dispute/voting → 8 Appeals/notifications/admin →
9 Test Lab → 10 Polish/mobile → 11 Final verification

## Resuming on a new account

Paste the Resume prompt from SPEC.md PART E section E4 into the new chat.
