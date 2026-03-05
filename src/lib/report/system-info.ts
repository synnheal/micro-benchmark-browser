import type { SystemInfo } from "@/types/run";

export function collectSystemInfo(): SystemInfo {
  return {
    userAgent: navigator.userAgent,
    cores: navigator.hardwareConcurrency || 0,
    memory: (navigator as unknown as { deviceMemory?: number }).deviceMemory,
    screenWidth: screen.width,
    screenHeight: screen.height,
    devicePixelRatio: window.devicePixelRatio || 1,
    language: navigator.language,
    platform: navigator.platform,
  };
}
