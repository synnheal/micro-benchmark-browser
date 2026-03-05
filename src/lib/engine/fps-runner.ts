import type { BenchDefinition, BenchResult, FpsScene } from "@/types/bench";
import { computeStats, stabilityLabel } from "./stats";

export interface FpsRunnerCallbacks {
  onFrame: (frameTime: number, fps: number, elapsed: number) => void;
  onResult: (result: BenchResult) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

export async function runFpsBench(
  bench: BenchDefinition,
  canvas: HTMLCanvasElement,
  callbacks: FpsRunnerCallbacks,
  signal?: AbortSignal
): Promise<BenchResult> {
  const ctx = canvas.getContext("2d")!;
  const { width, height } = canvas;
  const scene = bench.scene!;
  const particles = createParticles(scene, width, height);

  const frameTimes: number[] = [];
  let lastTime = 0;
  let startTime = 0;
  let warmupDone = false;

  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }

    const abortHandler = () => {
      reject(new DOMException("Aborted", "AbortError"));
    };
    signal?.addEventListener("abort", abortHandler);

    function loop(now: number) {
      if (signal?.aborted) return;

      if (!startTime) {
        startTime = now;
        lastTime = now;
        requestAnimationFrame(loop);
        return;
      }

      const elapsed = now - startTime;
      const dt = now - lastTime;
      lastTime = now;

      // Warmup phase
      if (!warmupDone && elapsed < bench.warmupMs) {
        updateAndDraw(ctx, particles, scene, width, height, dt);
        requestAnimationFrame(loop);
        return;
      }

      if (!warmupDone) {
        warmupDone = true;
        startTime = now;
        lastTime = now;
        requestAnimationFrame(loop);
        return;
      }

      const measureElapsed = now - startTime;

      if (measureElapsed > bench.durationMs) {
        signal?.removeEventListener("abort", abortHandler);

        const fps = frameTimes.map((ft) => (ft > 0 ? 1000 / ft : 0));
        const stats = computeStats(fps);

        const result: BenchResult = {
          benchId: bench.id,
          stats,
          raw: fps,
          unit: bench.unit,
          higherIsBetter: bench.higherIsBetter,
          stability: stabilityLabel(stats.cv),
          timestamp: Date.now(),
        };

        callbacks.onResult(result);
        resolve(result);
        return;
      }

      frameTimes.push(dt);
      const instantFps = dt > 0 ? 1000 / dt : 0;
      callbacks.onFrame(dt, instantFps, measureElapsed);

      updateAndDraw(ctx, particles, scene, width, height, dt);
      requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
  });
}

function createParticles(scene: FpsScene, w: number, h: number): Particle[] {
  const colors = ["#ef4444", "#3b82f6", "#22c55e", "#eab308", "#a855f7", "#06b6d4"];
  return Array.from({ length: scene.objectCount }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 4,
    vy: (Math.random() - 0.5) * 4,
    size: scene.type === "particles" ? 2 + Math.random() * 4 : 4 + Math.random() * 12,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));
}

function updateAndDraw(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  scene: FpsScene,
  w: number,
  h: number,
  _dt: number
) {
  ctx.clearRect(0, 0, w, h);

  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > w) p.vx *= -1;
    if (p.y < 0 || p.y > h) p.vy *= -1;

    ctx.fillStyle = p.color;

    if (scene.type === "particles") {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
  }
}
