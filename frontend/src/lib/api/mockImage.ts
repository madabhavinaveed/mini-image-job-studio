import type { CreateJobRequest, IllustrationType } from "../types";

const palettes = [
  ["#F4E6C8", "#E7B07A", "#C45C3A", "#5C7A5A", "#3A2A1C"],
  ["#E8F0E4", "#A8C5A0", "#F2D48B", "#D98A6A", "#3D4A3A"],
  ["#F7EFE6", "#D7C4A3", "#8FA6C0", "#C97B63", "#2F2A26"],
  ["#F3E4D7", "#E0B8B8", "#7A9E8A", "#D4A017", "#402C24"],
];

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function wrapText(value: string, maxChars: number, maxLines: number): string[] {
  const words = value.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars) {
      if (current) lines.push(current);
      current = word;
      if (lines.length === maxLines - 1) break;
    } else {
      current = next;
    }
  }

  if (current && lines.length < maxLines) lines.push(current);
  if (words.join(" ").length > lines.join(" ").length) {
    const last = lines[lines.length - 1];
    if (last) lines[lines.length - 1] = `${last.replace(/[.,]?$/, "")}…`;
  }
  return lines;
}

function dimensionsForType(type: IllustrationType): { width: number; height: number } {
  switch (type) {
    case "spot":
    case "quarter_page":
      return { width: 800, height: 800 };
    case "vignette":
    case "half_page":
      return { width: 1200, height: 800 };
    case "full_page":
      return { width: 900, height: 1200 };
    case "double_spread":
      return { width: 1600, height: 900 };
  }
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return hash;
}

export function createMockImageUrl(input: CreateJobRequest, prompt: string): string {
  const { width, height } = dimensionsForType(input.illustrationType);
  const palette = palettes[Math.abs(hashString(input.bookTitle)) % palettes.length];
  const [paper, hill, clay, sage, ink] = palette;
  const title = escapeXml(input.bookTitle);
  const typeLabel = escapeXml(input.illustrationType.replaceAll("_", " "));
  const sceneLines = wrapText(input.sceneText, 42, 3).map(escapeXml);
  const promptLine = escapeXml(wrapText(prompt, 54, 1)[0] ?? "");

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${paper}"/>
      <stop offset="100%" stop-color="${hill}"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#sky)"/>
  <ellipse cx="${width * 0.78}" cy="${height * 0.22}" rx="${width * 0.12}" ry="${height * 0.08}" fill="${paper}" opacity="0.85"/>
  <ellipse cx="${width * 0.3}" cy="${height * 0.92}" rx="${width * 0.55}" ry="${height * 0.28}" fill="${sage}" opacity="0.55"/>
  <ellipse cx="${width * 0.72}" cy="${height * 0.96}" rx="${width * 0.48}" ry="${height * 0.24}" fill="${clay}" opacity="0.38"/>
  <circle cx="${width * 0.38}" cy="${height * 0.58}" r="${Math.min(width, height) * 0.08}" fill="${clay}"/>
  <circle cx="${width * 0.52}" cy="${height * 0.62}" r="${Math.min(width, height) * 0.055}" fill="${ink}" opacity="0.7"/>
  <rect x="24" y="24" width="${width - 48}" height="${height - 48}" fill="none" stroke="${ink}" stroke-opacity="0.18" stroke-width="2" rx="18"/>
  <text x="48" y="72" fill="${ink}" font-family="Georgia, serif" font-size="28" font-weight="600">${title}</text>
  <text x="48" y="104" fill="${ink}" fill-opacity="0.7" font-family="Georgia, serif" font-size="16">${typeLabel} · mock illustration</text>
  ${sceneLines
    .map(
      (line, index) =>
        `<text x="48" y="${height - 120 + index * 24}" fill="${ink}" font-family="Georgia, serif" font-size="18">${line}</text>`,
    )
    .join("")}
  <text x="48" y="${height - 36}" fill="${ink}" fill-opacity="0.55" font-family="Georgia, serif" font-size="13">${promptLine}</text>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
