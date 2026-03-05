<div align="center">

# Micro Benchmark Browser

**Benchmark your browser's JavaScript performance, FPS, and memory — right from the browser.**

*Mesurez les performances JavaScript, le FPS et la memoire de votre navigateur — directement depuis le navigateur.*

[English](#english) | [Francais](#francais)

</div>

---

## English

### What is Micro Benchmark Browser?

Micro Benchmark Browser is a client-side performance testing suite. Run JavaScript micro-benchmarks, measure rendering FPS, monitor memory usage, execute full benchmark suites, compare results across runs, and export detailed reports — all without installing anything.

### Features

- **JS Micro-Benchmarks** — Measure ops/sec for custom code snippets via Web Workers
- **FPS Monitor** — Real-time frame rate measurement with live charts
- **Memory Profiler** — Track heap usage and memory allocations
- **Benchmark Suites** — Run predefined or custom test suites
- **Cross-Run Comparison** — Compare results from different sessions
- **Report Generation** — Export reports as JSON or Markdown
- **System Info Detection** — Auto-detect browser, OS, and hardware specs
- **Statistical Analysis** — Mean, median, standard deviation, and confidence intervals
- **Score System** — Aggregate performance scoring
- **Dark / Light Mode** — Theme toggle
- **Bilingual UI** — Full English & French interface

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI | Tailwind CSS 4 + shadcn/ui + Radix UI |
| State | Zustand |
| Charts | Recharts |
| Workers | Web Workers for isolated benchmarks |
| Export | FileSaver |
| i18n | next-intl |

### Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Francais

### Qu'est-ce que Micro Benchmark Browser ?

Micro Benchmark Browser est une suite de tests de performance cote client. Lancez des micro-benchmarks JavaScript, mesurez le FPS de rendu, surveillez l'utilisation memoire, executez des suites de tests completes, comparez les resultats entre sessions, et exportez des rapports detailles — le tout sans rien installer.

### Fonctionnalites

- **Micro-Benchmarks JS** — Mesurez les ops/sec pour des snippets via Web Workers
- **Moniteur FPS** — Mesure du framerate en temps reel avec graphiques
- **Profileur Memoire** — Suivez l'utilisation du heap et les allocations memoire
- **Suites de Benchmarks** — Lancez des suites de tests predefinies ou personnalisees
- **Comparaison Multi-Sessions** — Comparez les resultats de differentes sessions
- **Generation de Rapports** — Exportez en JSON ou Markdown
- **Detection Systeme** — Detection auto du navigateur, OS et specs materiel
- **Analyse Statistique** — Moyenne, mediane, ecart-type et intervalles de confiance
- **Systeme de Score** — Score de performance agrege
- **Mode Sombre / Clair** — Bascule de theme
- **Interface Bilingue** — Anglais et francais complets

### Demarrage Rapide

```bash
npm install
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

---

<div align="center">

**Built with Next.js, TypeScript & Tailwind CSS**

</div>
