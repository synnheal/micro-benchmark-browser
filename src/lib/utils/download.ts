import { saveAs } from "file-saver";

export function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  saveAs(blob, filename);
}

export function downloadMarkdown(content: string, filename: string) {
  const blob = new Blob([content], {
    type: "text/markdown;charset=utf-8",
  });
  saveAs(blob, filename);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
