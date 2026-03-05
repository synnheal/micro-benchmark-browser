import type { BenchDefinition } from "@/types/bench";

export const JS_BENCHES: BenchDefinition[] = [
  {
    id: "json-parse-small",
    name: "JSON Parse (small)",
    category: "js",
    description: "Parse a small JSON object (~500 bytes)",
    warmupMs: 500,
    durationMs: 2000,
    repeats: 5,
    higherIsBetter: true,
    unit: "ops/s",
    fn: `
      const data = JSON.stringify({ name: "test", values: [1,2,3,4,5], nested: { a: 1, b: 2 } });
      return () => { JSON.parse(data); };
    `,
  },
  {
    id: "json-stringify-medium",
    name: "JSON Stringify (medium)",
    category: "js",
    description: "Stringify a medium JSON object (~5KB)",
    warmupMs: 500,
    durationMs: 2000,
    repeats: 5,
    higherIsBetter: true,
    unit: "ops/s",
    fn: `
      const arr = Array.from({ length: 100 }, (_, i) => ({ id: i, value: "item-" + i, nested: { x: i * 2 } }));
      return () => { JSON.stringify(arr); };
    `,
  },
  {
    id: "array-map-filter",
    name: "Array Map + Filter",
    category: "js",
    description: "Map + filter on a 10,000 element array",
    warmupMs: 300,
    durationMs: 2000,
    repeats: 5,
    higherIsBetter: true,
    unit: "ops/s",
    fn: `
      const arr = Array.from({ length: 10000 }, (_, i) => i);
      return () => { arr.map(x => x * 2).filter(x => x % 3 === 0); };
    `,
  },
  {
    id: "array-reduce",
    name: "Array Reduce (sum)",
    category: "js",
    description: "Reduce to sum 10,000 numbers",
    warmupMs: 300,
    durationMs: 2000,
    repeats: 5,
    higherIsBetter: true,
    unit: "ops/s",
    fn: `
      const arr = Array.from({ length: 10000 }, (_, i) => i);
      return () => { arr.reduce((a, b) => a + b, 0); };
    `,
  },
  {
    id: "object-property-access",
    name: "Object Property Access",
    category: "js",
    description: "Access deeply nested object properties 10,000 times",
    warmupMs: 300,
    durationMs: 2000,
    repeats: 5,
    higherIsBetter: true,
    unit: "ops/s",
    fn: `
      const obj = { a: { b: { c: { d: { e: 42 } } } } };
      return () => {
        let sum = 0;
        for (let i = 0; i < 10000; i++) sum += obj.a.b.c.d.e;
        return sum;
      };
    `,
  },
  {
    id: "string-template",
    name: "String Template Literals",
    category: "js",
    description: "Template literal concatenation (1,000 iterations)",
    warmupMs: 300,
    durationMs: 2000,
    repeats: 5,
    higherIsBetter: true,
    unit: "ops/s",
    fn: `
      return () => {
        let result = "";
        for (let i = 0; i < 1000; i++) result = \\\`item-\\\${i}-value-\\\${i * 2}\\\`;
        return result;
      };
    `,
  },
  {
    id: "regex-match",
    name: "Regex Match",
    category: "js",
    description: "Simple regex match on 1,000 strings",
    warmupMs: 300,
    durationMs: 2000,
    repeats: 5,
    higherIsBetter: true,
    unit: "ops/s",
    fn: `
      const re = /^[a-z0-9]+@[a-z]+\\.[a-z]{2,}$/;
      const strings = Array.from({ length: 1000 }, (_, i) => i % 2 === 0 ? "test" + i + "@mail.com" : "invalid");
      return () => { strings.forEach(s => re.test(s)); };
    `,
  },
];

export const FPS_SCENES: BenchDefinition[] = [
  {
    id: "fps-rects-1000",
    name: "2D Rectangles (1,000)",
    category: "fps",
    description: "Draw 1,000 moving rectangles",
    warmupMs: 1000,
    durationMs: 10000,
    repeats: 1,
    higherIsBetter: true,
    unit: "fps",
    scene: { type: "rects", objectCount: 1000 },
  },
  {
    id: "fps-rects-5000",
    name: "2D Rectangles (5,000)",
    category: "fps",
    description: "Draw 5,000 moving rectangles",
    warmupMs: 1000,
    durationMs: 10000,
    repeats: 1,
    higherIsBetter: true,
    unit: "fps",
    scene: { type: "rects", objectCount: 5000 },
  },
  {
    id: "fps-particles-2000",
    name: "Particles (2,000)",
    category: "fps",
    description: "Update + draw 2,000 particles",
    warmupMs: 1000,
    durationMs: 10000,
    repeats: 1,
    higherIsBetter: true,
    unit: "fps",
    scene: { type: "particles", objectCount: 2000 },
  },
];

export const MEMORY_BENCHES: BenchDefinition[] = [
  {
    id: "mem-alloc-32mb",
    name: "Allocate 32MB TypedArray",
    category: "memory",
    description: "Allocate and touch a 32MB Float64Array",
    warmupMs: 500,
    durationMs: 3000,
    repeats: 3,
    higherIsBetter: false,
    unit: "ms",
  },
  {
    id: "mem-alloc-64mb",
    name: "Allocate 64MB TypedArray",
    category: "memory",
    description: "Allocate and touch a 64MB Float64Array",
    warmupMs: 500,
    durationMs: 3000,
    repeats: 3,
    higherIsBetter: false,
    unit: "ms",
  },
];

export const ALL_BENCHES: BenchDefinition[] = [
  ...JS_BENCHES,
  ...FPS_SCENES,
  ...MEMORY_BENCHES,
];

export function getBenchById(id: string): BenchDefinition | undefined {
  return ALL_BENCHES.find((b) => b.id === id);
}
