import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { config } from "./config.js";
import type { CreateJobRequest, IllustrationType } from "./types.js";

const generatedDir = path.resolve("generated");

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

export async function writeGeneratedImage(
  jobId: string,
  input: CreateJobRequest,
  prompt: string,
): Promise<string> {
  const { width, height } = dimensionsForType(input.illustrationType);
  const title = escapeXml(input.bookTitle);
  const typeLabel = escapeXml(input.illustrationType.replaceAll("_", " "));
  const sceneLines = wrapText(input.sceneText, 42, 3).map(escapeXml);
  const promptLine = escapeXml(wrapText(prompt, 54, 1)[0] ?? "");

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#F4E6C8"/>
  <ellipse cx="${width * 0.78}" cy="${height * 0.22}" rx="${width * 0.12}" ry="${height * 0.08}" fill="#FFF8EC"/>
  <ellipse cx="${width * 0.3}" cy="${height * 0.92}" rx="${width * 0.55}" ry="${height * 0.28}" fill="#5C7A5A" opacity="0.45"/>
  <circle cx="${width * 0.38}" cy="${height * 0.58}" r="${Math.min(width, height) * 0.08}" fill="#C45C3A"/>
  <text x="48" y="72" fill="#241C14" font-family="Georgia, serif" font-size="28" font-weight="600">${title}</text>
  <text x="48" y="104" fill="#241C14" fill-opacity="0.7" font-family="Georgia, serif" font-size="16">${typeLabel} · generated illustration</text>
  ${sceneLines
    .map(
      (line, index) =>
        `<text x="48" y="${height - 120 + index * 24}" fill="#241C14" font-family="Georgia, serif" font-size="18">${line}</text>`,
    )
    .join("")}
  <text x="48" y="${height - 36}" fill="#241C14" fill-opacity="0.55" font-family="Georgia, serif" font-size="13">${promptLine}</text>
</svg>`;

  await mkdir(generatedDir, { recursive: true });
  const fileName = `${jobId}.svg`;
  await writeFile(path.join(generatedDir, fileName), svg, "utf8");
  return `${config.publicBaseUrl}/generated/${fileName}`;
}

export { generatedDir };
