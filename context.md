Micro Benchmark Browser — Implementation Plan
Context

Portfolio project: micro-bench suite 100% dans le navigateur (offline-first) pour :

Bench JS (CPU micro tasks)

Canvas FPS (render loop)

Mémoire (simple/indicative)

Rapport export (JSON + Markdown/PDF optionnel)
Bonus :

Comparer 2 runs (baseline vs current)

“Score” global (pondéré)

Stack (cohérent avec tes projets) :

Next.js App Router + React + TypeScript

Tailwind + shadcn/ui

next-intl (EN/FR) + next-themes

State: Zustand

Charts: Recharts (timeseries + bar)

Heavy work: Web Workers (JS bench) + OffscreenCanvas (si support) pour FPS

Storage: IndexedDB (Dexie) ou localStorage (runs + config)

Export: file-saver (JSON/MD), option html-to-pdf plus tard

Project Structure

micro-benchmark-browser/
├── src/
│ ├── app/
│ │ ├── [locale]/
│ │ │ ├── layout.tsx # NextIntlClientProvider + ThemeProvider
│ │ │ ├── page.tsx # Dashboard: run suite + latest score
│ │ │ ├── suite/page.tsx # Suite runner (all tests)
│ │ │ ├── js/page.tsx # JS benchmarks
│ │ │ ├── fps/page.tsx # Canvas FPS
│ │ │ ├── memory/page.tsx # Memory (simple)
│ │ │ ├── compare/page.tsx # Compare two runs
│ │ │ └── reports/page.tsx # History + export
│ │ ├── layout.tsx
│ │ └── globals.css
│ ├── components/
│ │ ├── ui/ # shadcn
│ │ ├── layout/ # Header, AppShell, WorkspaceLayout
│ │ ├── runner/ # RunControls, ProgressBar, StatusBadges
│ │ ├── js/ # JsBenchList, BenchCard, ResultTable
│ │ ├── fps/ # FpsArena, FpsChart, SceneSelector
│ │ ├── memory/ # MemoryPanel, AllocationChart
│ │ ├── compare/ # RunPicker, DeltaTable, DeltaCharts
│ │ ├── report/ # ReportViewer, ExportDialog
│ │ └── shared/ # Toasts, LanguageToggle, ThemeToggle
│ ├── stores/
│ │ ├── run-store.ts # current run state, progress, cancellation
│ │ ├── bench-store.ts # test registry + selected suite
│ │ ├── results-store.ts # last results + derived metrics
│ │ └── history-store.ts # saved runs, baseline selection
│ ├── lib/
│ │ ├── engine/
│ │ │ ├── registry.ts # list of tests + metadata
│ │ │ ├── js-runner.ts # worker orchestration, warmup, stats
│ │ │ ├── fps-runner.ts # RAF/OffscreenCanvas loop + metrics
│ │ │ ├── memory-runner.ts # allocation probes + optional performance.memory
│ │ │ ├── stats.ts # mean/median/stddev/p95, outlier trim
│ │ │ ├── score.ts # normalize + weighted score
│ │ │ └── compare.ts # delta compute (runA vs runB)
│ │ ├── worker/
│ │ │ ├── js-worker.ts # executes JS microbenches
│ │ │ └── types.ts # messages, task payloads
│ │ ├── report/
│ │ │ ├── format-md.ts # markdown report
│ │ │ ├── format-json.ts # raw + summary
│ │ │ └── system-info.ts # UA, cores, memory hint, screen, etc.
│ │ └── utils/
│ │ ├── bytes.ts
│ │ ├── download.ts
│ │ ├── debounce.ts
│ │ └── storage.ts # Dexie/localStorage wrapper + migrations
│ ├── hooks/
│ │ ├── useWorkerTask.ts # run/cancel
│ │ ├── useRafLoop.ts
│ │ ├── usePersistedSettings.ts
│ │ └── useKeyboardShortcuts.ts
│ └── types/
│ ├── bench.ts # BenchDefinition, BenchResult
│ ├── run.ts # Run, SuiteResult, ScoreBreakdown
│ └── compare.ts
├── messages/
│ ├── en.json
│ └── fr.json
├── middleware.ts
└── next.config.ts

Key Architecture Decisions
1) Bench fiable = warmup + répétitions + stats robustes

Chaque test :

Warmup (ex: 300–800ms)

Mesure sur N itérations / fenêtre temps (ex: 1–2s)

Répète 5–10 fois

Calcule median + p95 + stddev (et éventuellement trim outliers)

➡️ Résultat plus stable qu’un “one shot”.

2) JS benches dans un Web Worker

Évite de bloquer l’UI

Réduit le bruit (moins d’interférences du rendering UI)

Permet cancel/timeout clean (ignore outdated)

3) FPS bench : RAF + scènes reproductibles

Une “scene” = un nombre d’objets + un type de draw (rects, sprites, particles)

Mesure sur 10–15s :

FPS moyen

1% low (approx via p99 frame time)

frame time distribution

Option “pro” : OffscreenCanvas dans worker si supporté, sinon main thread.

4) Mémoire (simple) = indicatif

Le navigateur limite l’observabilité :

performance.memory (Chrome-only, non standard) parfois dispo

Sinon : “allocation probe” (créer/relâcher de gros tableaux) + mesurer durée/GC “pauses” (approx)
👉 Dans le rapport, affiche clairement “Memory metrics are indicative”.

5) Score global

Score basé sur :

JS CPU (ex: ops/s normalisé)

FPS (moyenne + 1% low)

Mémoire (si dispo) ou GC pause score
Normalization :

par rapport à un baseline run (le premier run sauvegardé) ou un preset “reference device” (optionnel)

Score = 100 * Σ(weight_i * metric_i_normalized)

Benchmark Suite (exemples de tests JS)

CPU / JS

JSON parse/stringify (taille petite/moyenne)

Array operations (map/filter/reduce)

Object property access

String concat vs template

Regex simple match (attention à éviter catastrophic)

Crypto subtle digest (optionnel, dépend permissions)

Canvas

2D: drawRect stress

2D: particles (update + draw)

Text rendering (if you want)

Optional: WebGL mini scene (bonus, mais scope ++)

Memory

Allocation typed arrays (32MB/64MB) + release

Optional: track heapUsed (si performance.memory)

Implementation Phases
Phase 1 — Foundation

Scaffold Next.js + Tailwind + shadcn/ui + TS

Install deps: zustand, next-intl, next-themes, recharts, dexie (optional), file-saver, uuid, zod

Setup i18n + theme

AppShell + navigation (Suite / JS / FPS / Memory / Compare / Reports)

Bench registry (registry.ts) + types (BenchDefinition, Result)

Run-store + progress UI (start/cancel/status)

DoD

Lancer “dummy bench” -> progress + résultat s’affiche sans freeze.

Phase 2 — JS Bench Engine (Worker)

js-worker.ts:

reçoit test id + params + duration

exécute warmup puis measures

renvoie samples (array) + summary

js-runner.ts:

orchestre N repeats

timeout per test

calc stats via stats.ts

JS page UI:

liste benches, run selected, result table + bar chart

show stability (stddev)

DoD

5 benches JS -> résultats cohérents, UI fluide, cancel fonctionne.

Phase 3 — Canvas FPS Bench

fps-runner.ts:

RAF loop 10s

collect frame times (ms)

compute avg FPS + p95/p99 frame time + 1% low approx

FpsArena:

canvas + scene selector + “objects count”

chart live frame time (buffer 120 points)

Fallback OffscreenCanvas:

if supported, worker-run; sinon main thread

DoD

Pendant run, graph live s’update; résultat fps + 1% low affichés.

Phase 4 — Memory (Simple)

memory-runner.ts:

detect performance.memory availability

run allocation probes:

allocate typed arrays, touch memory, release

measure allocation time + “cooldown” delay

optionally measure long frames during GC (approx)

Memory UI:

“Supported / Not supported”

show probe results + disclaimers

DoD

Le panneau mémoire donne un signal sans casser l’app, même sans API.

Phase 5 — Suite Runner + Report Export

Suite runner:

run JS benches -> FPS -> memory

unified progress + per-stage status

Report:

system info (UA, cores via navigator.hardwareConcurrency, screen size, devicePixelRatio)

summary tables + charts snapshots (optional)

Export:

JSON (raw + summary)

Markdown report (clean, copiable)

“Copy to clipboard” report

DoD

Run suite -> save run -> export JSON + MD téléchargés.

Phase 6 — Bonus: Compare 2 Runs

History store:

save runs

pick baseline (star)

compare.ts:

align metrics by bench id

compute delta % + “better/worse” direction

Compare UI:

delta table (sortable)

charts: score breakdown, top regressions/improvements

DoD

Sélectionner Run A + Run B -> deltas visibles et compréhensibles.

Phase 7 — Bonus: Score

score.ts:

normalize metrics (relative to baseline):

higher-is-better: ops/s, fps

lower-is-better: frame time p95, alloc time

clamp to avoid crazy outliers

weighted sum + breakdown

UI score:

big score badge

breakdown per category

“confidence” indicator basé sur variance (stddev)

DoD

Score change entre runs + breakdown cohérent.

Verification Checklist

App démarre, EN/FR + theme ok

JS benches :

run all -> résultats + stats (median, p95)

cancel -> stop propre

FPS :

graph live s’update

avg fps + 1% low affichés

Memory :

affiche supported/unsupported

probes donnent des valeurs

Suite :

exécute les 3 catégories

run sauvegardé dans history

Export :

JSON et MD corrects

Compare :

deltas % corrects

Score :

score global + breakdown visible

Offline :

réseau coupé -> tout fonctionne

Risques techniques (et parades)
1) Variance énorme (bruit de fond)

Warmup + repeats + median

Afficher “stability” (stddev) et avertir si trop instable

Désactiver “auto-run” pendant typing

2) CPU throttling / battery saver / onglet inactif

Détecter document.visibilityState et bloquer run si tab hidden

Avertir si navigator.scheduling.isInputPending / jank (optionnel)

3) FPS bench pollué par UI

Mode “arena full screen” (masquer panels pendant run)

OffscreenCanvas si supporté

4) Mémoire pas fiable / pas dispo

Toujours afficher disclaimer

Proposer “memory probes” comme indicateur, pas vérité absolue

5) Comparaison trompeuse

Stocker config du run (durations, object counts, scene)

Empêcher comparer runs avec configs incompatibles (ou afficher warning)

“Portfolio narrative” (pitch)

Micro Benchmark Browser est une suite offline-first de micro-benchmarks (JS CPU, Canvas FPS, mémoire indicative) avec graphiques live, export de rapports, comparaison entre runs et score global pondéré. Architecture orientée performance : Web Workers, stats robustes, et UI fluide même pendant les mesures.