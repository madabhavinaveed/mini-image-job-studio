import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { config } from "../config.js";
import type { IllustrationType } from "../lib/types.js";

export const generatedDir = path.resolve("generated");

export function dimensionsForType(type: IllustrationType): { width: number; height: number } {
  switch (type) {
    case "spot":
      return { width: 800, height: 800 };
    case "vignette":
      return { width: 1100, height: 800 };
    case "quarter_page":
    case "half_page":
    case "full_page":
      return { width: 900, height: 1200 };
    case "double_spread":
      return { width: 1600, height: 900 };
  }
}

export async function saveGeneratedImage(
  jobId: string,
  image: { bytes: Buffer; extension: string },
): Promise<string> {
  await mkdir(generatedDir, { recursive: true });
  const fileName = `${jobId}.${image.extension}`;
  await writeFile(path.join(generatedDir, fileName), image.bytes);
  return `${config.publicBaseUrl}/generated/${fileName}`;
}
