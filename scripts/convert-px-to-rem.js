#!/usr/bin/env node
/**
 * Convert hardcoded px values in CSS files to rem (÷16).
 *
 * Rules:
 *  - 0px, 1px, 999px stay as px (hairline borders, full-radius)
 *  - Media-query breakpoint values stay as px
 *  - Shadow blur/offset values stay as px
 *  - z-index, opacity, line-height (when unitless) stay as-is
 *  - Values matching a --tnxt-* token are replaced with var(--tnxt-*)
 *  - All other px values → rem (/16)
 */

const fs = require("fs");
const path = require("path");

// Token mapping: px value → CSS custom property
const TOKEN_MAP = {
  // Spacing
  4: "var(--tnxt-space-xs)",
  8: "var(--tnxt-space-sm)",
  12: "var(--tnxt-space-md)",
  16: "var(--tnxt-space-lg)",
  20: "var(--tnxt-space-xl)",
  24: "var(--tnxt-space-2xl)",
  32: "var(--tnxt-space-3xl)",
  // Font sizes
  11: "var(--tnxt-font-size-xs)",
  13: "var(--tnxt-font-size-sm)",
  14: "var(--tnxt-font-size-base)",
  // 16 is both space-lg and font-size-lg — use space-lg (more common in layout)
  18: "var(--tnxt-font-size-xl)",
  // Border radii
  6: "var(--tnxt-radius-sm)",
  // 8 is both space-sm and radius-md — already mapped to space-sm above
  // 12 is both space-md and radius-lg — already mapped to space-md above
  // 16 is both space-lg and radius-xl — already mapped to space-lg above
};

function pxToRem(pxVal) {
  return (pxVal / 16).toString().replace(/\.?0+$/, "") + "rem";
}

function convertPxInValue(value) {
  // Don't convert values that are already rem/em/% or use CSS vars
  if (/[a-zA-Z]/.test(value.replace(/px/g, "")) && !value.match(/^\d+px$/)) {
    return value;
  }

  const num = parseInt(value, 10);
  if (isNaN(num)) return value;

  // Leave these as px
  if (num === 0 || num === 1 || num === 999) return value;

  // Check if there's a token for this value
  if (TOKEN_MAP[num]) {
    return TOKEN_MAP[num];
  }

  return pxToRem(num);
}

function processCssFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  const original = content;
  let changes = 0;

  // Process line by line to handle context-aware conversions
  const lines = content.split("\n");
  const result = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const trimmed = line.trim();

    // Skip media queries (viewport breakpoints stay as px)
    if (trimmed.startsWith("@media")) {
      result.push(line);
      continue;
    }

    // Skip CSS comments
    if (trimmed.startsWith("/*") || trimmed.startsWith("*") || trimmed.startsWith("//")) {
      result.push(line);
      continue;
    }

    // Convert px values in this line
    const newLine = line.replace(
      /(\d+)px/g,
      (match, numStr) => {
        const num = parseInt(numStr, 10);

        // Leave 0px, 1px, 999px as-is
        if (num === 0 || num === 1 || num === 999) return match;

        // Check context: is this in a box-shadow property?
        // Look backwards to find the property name
        const linePrefix = line.substring(0, line.indexOf(match));
        const isShadow = /box-shadow/i.test(linePrefix) ||
          (linePrefix.trim() === "" && i > 0 && /box-shadow/i.test(result[result.length - 1]));

        if (isShadow) {
          return match; // Keep shadow values in px
        }

        // Check context: is this in a text-shadow?
        const isTextShadow = /text-shadow/i.test(linePrefix) ||
          (linePrefix.trim() === "" && i > 0 && /text-shadow/i.test(result[result.length - 1]));

        if (isTextShadow) {
          return match;
        }

        // Check context: is this in a border property? 1px borders stay
        if (num === 1 && /border/i.test(linePrefix)) {
          return match;
        }

        // Check token map
        if (TOKEN_MAP[num]) {
          changes++;
          return TOKEN_MAP[num];
        }

        changes++;
        return pxToRem(num);
      }
    );

    result.push(newLine);
  }

  const output = result.join("\n");

  if (output !== original) {
    fs.writeFileSync(filePath, output, "utf8");
  }

  return changes;
}

// Collect all CSS files under src/
function findCssFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== "node_modules" && entry.name !== "build") {
      files.push(...findCssFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".css")) {
      files.push(fullPath);
    }
  }
  return files;
}

const srcDir = path.join(__dirname, "..", "src");
const cssFiles = findCssFiles(srcDir);

let totalChanges = 0;
let filesChanged = 0;

for (const file of cssFiles) {
  const relativePath = path.relative(path.join(__dirname, ".."), file);
  const changes = processCssFile(file);
  if (changes > 0) {
    filesChanged++;
    totalChanges += changes;
    console.log(`  ${relativePath}: ${changes} conversions`);
  }
}

console.log(`\nDone: ${totalChanges} px values converted across ${filesChanged} files`);
