import type { CreateJobRequest, IllustrationType, SpreadLayout } from "../lib/types.js";
import { dimensionsForType } from "./storage.js";
import type { GeneratedImage } from "./types.js";

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

function mimeForExtension(extension: GeneratedImage["extension"]): string {
  if (extension === "jpg") return "image/jpeg";
  if (extension === "webp") return "image/webp";
  if (extension === "svg") return "image/svg+xml";
  return "image/png";
}

function imageHref(image: GeneratedImage): string {
  return `data:${mimeForExtension(image.extension)};base64,${image.bytes.toString("base64")}`;
}

function textLines(
  text: string,
  x: number,
  y: number,
  maxChars: number,
  maxLines: number,
  fontSize: number,
): string {
  return wrapText(text, maxChars, maxLines)
    .map(escapeXml)
    .map(
      (line, index) =>
        `<text x="${x}" y="${y + index * (fontSize + 10)}" fill="#241C14" font-family="Georgia, serif" font-size="${fontSize}">${line}</text>`,
    )
    .join("");
}

function layoutMarkup(
  layout: SpreadLayout,
  width: number,
  height: number,
  href: string,
  title: string,
  sceneText: string,
): string {
  const safeTitle = escapeXml(title);
  const mid = width / 2;

  switch (layout) {
    case "full_page_image":
      return `
  <image href="${href}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice"/>`;

    case "half_and_half":
      return `
  <image href="${href}" width="${mid}" height="${height}" preserveAspectRatio="xMidYMid slice"/>
  <rect x="${mid}" y="0" width="${mid}" height="${height}" fill="#FFF8EC"/>
  <text x="${mid + 36}" y="72" fill="#241C14" font-family="Georgia, serif" font-size="28" font-weight="600">${safeTitle}</text>
  ${textLines(sceneText, mid + 36, 130, Math.max(18, Math.floor(mid / 18)), 10, 22)}`;

    case "double_spread_scene":
      return `
  <image href="${href}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice"/>
  <rect x="${mid - 10}" y="0" width="20" height="${height}" fill="#E4D3B4"/>
  <rect x="${mid - 1.5}" y="24" width="3" height="${height - 48}" fill="#B89B72"/>`;

    case "text_over_image": {
      const maxChars = Math.max(24, Math.floor(width / 22));
      const lines = wrapText(sceneText, maxChars, 4);
      const boxHeight = 48 + lines.length * 34;
      const boxY = height - boxHeight - 40;
      return `
  <image href="${href}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice"/>
  <rect x="36" y="${boxY}" width="${width - 72}" height="${boxHeight}" rx="20" fill="#FFF8EC" fill-opacity="0.94"/>
  ${textLines(sceneText, 64, boxY + 40, maxChars, 4, 26)}`;
    }

    case "vignette_cluster": {
      const r = Math.min(width, height) * 0.18;
      const spots = [
        [width * 0.22, height * 0.38],
        [width * 0.5, height * 0.32],
        [width * 0.78, height * 0.4],
      ];
      return `
  <rect width="100%" height="100%" fill="#F6EFE3"/>
  <defs>
    ${spots
      .map(
        ([cx, cy], index) =>
          `<clipPath id="vignette-${index}"><ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r * 0.82}"/></clipPath>`,
      )
      .join("")}
  </defs>
  ${spots
    .map(
      ([cx, cy], index) => `
  <ellipse cx="${cx}" cy="${cy}" rx="${r + 8}" ry="${r * 0.82 + 8}" fill="#E8DCC8"/>
  <image href="${href}" width="${width}" height="${height}" clip-path="url(#vignette-${index})" preserveAspectRatio="xMidYMid slice"/>`,
    )
    .join("")}
  ${textLines(sceneText, 48, height - 110, Math.max(28, Math.floor(width / 20)), 3, 22)}`;
    }

    case "spot_illustrations": {
      const r = Math.min(width, height) * 0.11;
      const spots = [
        [width * 0.84, height * 0.22],
        [width * 0.16, height * 0.72],
        [width * 0.86, height * 0.78],
      ];
      return `
  <rect width="100%" height="100%" fill="#FFF8EC"/>
  <defs>
    ${spots
      .map(([cx, cy], index) => `<clipPath id="spot-${index}"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath>`)
      .join("")}
  </defs>
  <text x="56" y="80" fill="#241C14" font-family="Georgia, serif" font-size="30" font-weight="600">${safeTitle}</text>
  ${textLines(sceneText, 56, 140, Math.max(22, Math.floor((width * 0.55) / 12)), 8, 22)}
  ${spots
    .map(
      ([cx, cy], index) => `
  <circle cx="${cx}" cy="${cy}" r="${r + 6}" fill="#E8DCC8"/>
  <image href="${href}" width="${width}" height="${height}" clip-path="url(#spot-${index})" preserveAspectRatio="xMidYMid slice"/>`,
    )
    .join("")}`;
    }
  }
}

function ruledLines(x: number, y: number, width: number, count: number, gap: number): string {
  return Array.from({ length: count }, (_, index) => {
    const lineWidth = index % 4 === 3 ? width * 0.62 : width;
    return `<rect x="${x}" y="${y + index * gap}" width="${lineWidth}" height="4" rx="2" fill="#E4D3B4"/>`;
  }).join("");
}

function scaledLayout(
  layoutInner: string,
  pageWidth: number,
  pageHeight: number,
  x: number,
  y: number,
  w: number,
  h: number,
): string {
  return `<g transform="translate(${x},${y}) scale(${w / pageWidth},${h / pageHeight})">${layoutInner}</g>`;
}

function typeMarkup(
  type: IllustrationType,
  width: number,
  height: number,
  layoutInner: string,
): string {
  switch (type) {
    case "spot": {
      const cx = width / 2;
      const cy = height * 0.4;
      const r = Math.min(width, height) * 0.28;
      return `
  <rect width="100%" height="100%" fill="#FFF8EC"/>
  <defs>
    <clipPath id="type-spot"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath>
  </defs>
  <circle cx="${cx}" cy="${cy}" r="${r + 10}" fill="#E8DCC8"/>
  <g clip-path="url(#type-spot)">${scaledLayout(layoutInner, width, height, cx - r, cy - r, r * 2, r * 2)}</g>
  <circle cx="${cx}" cy="${cy}" r="${r + 2}" fill="none" stroke="#D4C4A8" stroke-width="4"/>
  ${ruledLines(width * 0.16, cy + r + 48, width * 0.68, 5, 28)}`;
    }

    case "vignette": {
      const cx = width / 2;
      const cy = height * 0.46;
      const rx = width * 0.38;
      const ry = height * 0.34;
      return `
  <rect width="100%" height="100%" fill="#F6EFE3"/>
  <defs>
    <filter id="type-vignette-blur"><feGaussianBlur stdDeviation="18"/></filter>
    <mask id="type-vignette-mask">
      <ellipse cx="${cx}" cy="${cy}" rx="${rx * 0.86}" ry="${ry * 0.86}" fill="white" filter="url(#type-vignette-blur)"/>
    </mask>
  </defs>
  <g mask="url(#type-vignette-mask)">${scaledLayout(layoutInner, width, height, cx - rx, cy - ry, rx * 2, ry * 2)}</g>`;
    }

    case "quarter_page": {
      const x = width * 0.5;
      const y = height * 0.07;
      const w = width * 0.43;
      const h = height * 0.36;
      return `
  <rect width="100%" height="100%" fill="#FFF8EC"/>
  ${ruledLines(width * 0.07, height * 0.1, width * 0.36, 9, 34)}
  <rect x="${x - 8}" y="${y - 8}" width="${w + 16}" height="${h + 16}" rx="10" fill="#E8DCC8"/>
  <defs>
    <clipPath id="type-quarter"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6"/></clipPath>
  </defs>
  <g clip-path="url(#type-quarter)">${scaledLayout(layoutInner, width, height, x, y, w, h)}</g>
  ${ruledLines(width * 0.07, height * 0.5, width * 0.86, 11, 42)}`;
    }

    case "half_page": {
      const artHeight = height * 0.5;
      return `
  <rect width="100%" height="100%" fill="#FFF8EC"/>
  <defs>
    <clipPath id="type-half"><rect x="0" y="0" width="${width}" height="${artHeight}"/></clipPath>
  </defs>
  <g clip-path="url(#type-half)">${scaledLayout(layoutInner, width, height, 0, 0, width, artHeight)}</g>
  <rect x="0" y="${artHeight}" width="${width}" height="8" fill="#E4D3B4"/>
  ${ruledLines(width * 0.08, artHeight + 48, width * 0.84, 9, 44)}`;
    }

    case "full_page":
      return `
  ${layoutInner}
  <rect x="10" y="10" width="${width - 20}" height="${height - 20}" fill="none" stroke="#E4D3B4" stroke-width="6"/>`;

    case "double_spread": {
      const padX = 48;
      const padY = 56;
      const bookW = width - padX * 2;
      const bookH = height - padY * 2;
      const gutter = 18;
      const pageW = (bookW - gutter) / 2;
      return `
  <rect width="100%" height="100%" fill="#C4A574"/>
  <rect x="${padX + 10}" y="${padY + 14}" width="${bookW}" height="${bookH}" rx="10" fill="#8A6A3E" opacity="0.28"/>
  <rect x="${padX}" y="${padY}" width="${pageW}" height="${bookH}" rx="8" fill="#FFF8EC"/>
  <rect x="${padX + pageW + gutter}" y="${padY}" width="${pageW}" height="${bookH}" rx="8" fill="#FFF8EC"/>
  <defs>
    <clipPath id="type-book">
      <rect x="${padX}" y="${padY}" width="${pageW}" height="${bookH}" rx="8"/>
      <rect x="${padX + pageW + gutter}" y="${padY}" width="${pageW}" height="${bookH}" rx="8"/>
    </clipPath>
  </defs>
  <g clip-path="url(#type-book)">${scaledLayout(layoutInner, width, height, padX, padY, bookW, bookH)}</g>
  <rect x="${padX + pageW}" y="${padY}" width="${gutter}" height="${bookH}" fill="#E4D3B4"/>
  <rect x="${padX + pageW + gutter / 2 - 1.5}" y="${padY + 24}" width="3" height="${bookH - 48}" fill="#B89B72"/>`;
    }
  }
}

export function applySpreadLayout(
  image: GeneratedImage,
  request: CreateJobRequest,
): GeneratedImage {
  const { width, height } = dimensionsForType(request.illustrationType);
  const inner = typeMarkup(
    request.illustrationType,
    width,
    height,
    layoutMarkup(
      request.spreadLayout,
      width,
      height,
      imageHref(image),
      request.bookTitle,
      request.sceneText,
    ),
  );

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  ${inner}
</svg>`;

  return { bytes: Buffer.from(svg, "utf8"), extension: "svg" };
}
