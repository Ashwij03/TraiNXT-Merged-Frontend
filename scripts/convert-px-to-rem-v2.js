#!/usr/bin/env node
/**
 * Convert hardcoded px values in CSS files to rem (÷16).
 * V2: More robust approach using position-aware replacement.
 */

const fs = require("fs");
const path = require("path");

// Token mapping: px value → CSS custom property
const TOKEN_MAP = {
  2: "var(--tnxt-space-xs)",  // 2px is thin spacing/border - use xs token
  3: "var(--tnxt-space-xs)",  // 3px - thin border radius
  4: "var(--tnxt-space-xs)",
  6: "var(--tnxt-radius-sm)",
  8: "var(--tnxt-space-sm)",
  10: "0.625rem",             // No token for 10px
  12: "var(--tnxt-space-md)",
  14: "var(--tnxt-font-size-base)",
  15: "0.9375rem",            // No token for 15px
  16: "var(--tnxt-space-lg)",
  18: "var(--tnxt-font-size-xl)",
  20: "var(--tnxt-space-xl)",
  22: "1.375rem",             // No token
  24: "var(--tnxt-space-2xl)",
  28: "1.75rem",
  30: "1.875rem",
  32: "var(--tnxt-space-3xl)",
  36: "2.25rem",
  40: "2.5rem",
  48: "3rem",
  50: "3.125rem",
  56: "3.5rem",
  60: "3.75rem",
  72: "4.5rem",
  80: "5rem",
  100: "6.25rem",
};

function pxToRem(pxVal) {
  const rem = pxVal / 16;
  // Clean up trailing zeros
  const str = rem.toString();
  if (str.includes(".") && !str.endsWith("0")) {
    return str + "rem";
  }
  return str.replace(/\.?0+$/, "") + "rem";
}

// Viewport breakpoint values that should stay in px
const BREAKPOINT_PATTERNS = /^\s*(min|max)-width\s*:/;
const BREAKPOINT_VALUES = new Set([
  320, 360, 375, 384, 400, 412, 414, 420, 425, 428, 430,
  480, 576, 600, 640, 680, 720, 767, 768, 800, 820, 834,
  960, 991, 992, 1000, 1024, 1028, 1152, 1199, 1200, 1280,
  1300, 1366, 1400, 1440, 1536, 1600, 1920,
]);

function processCssFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  const original = content;
  let changes = 0;

  // First pass: identify all @media blocks and their line ranges
  const lines = content.split("\n");
  const mediaBlockLines = new Set();

  let inMediaBlock = 0;
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith("@media")) {
      inMediaBlock++;
    }
    if (inMediaBlock > 0) {
      mediaBlockLines.add(i);
      // Count braces to know when we exit the media block
      const openBraces = (lines[i].match(/{/g) || []).length;
      const closeBraces = (lines[i].match(/}/g) || []).length;
      inMediaBlock += openBraces - closeBraces;
      if (inMediaBlock <= 0) inMediaBlock = 0;
    }
  }

  // Process the entire content as a string, not line by line
  // This handles multi-value properties correctly
  const result = content.replace(
    /(\d+)px/g,
    (match, numStr, offset) => {
      const num = parseInt(numStr, 10);

      // Leave 0px, 1px, 999px as-is (justified exceptions)
      if (num === 0 || num === 1 || num === 999) return match;

      // Check if this px value is inside a @media query (viewport breakpoint)
      // Find which line this offset is on
      let lineStart = 0;
      let lineIndex = 0;
      for (let i = 0; i < lines.length; i++) {
        if (lineStart + lines[i].length + 1 > offset) {
          lineIndex = i;
          break;
        }
        lineStart += lines[i].length + 1; // +1 for \n
      }

      if (mediaBlockLines.has(lineIndex)) {
        // Inside a media block - check if it's a breakpoint value
        if (BREAKPOINT_VALUES.has(num)) {
          return match; // Keep breakpoint values in px
        }
      }

      // Check context: is this in a box-shadow or text-shadow?
      // Look at the content up to this offset for the property name
      const prefix = content.substring(Math.max(0, offset - 200), offset);
      const lastPropertyMatch = prefix.match(/([^;{}\n]*?)\s*:\s*[^;{}\n]*$/);
      const propertyContext = lastPropertyMatch ? lastPropertyMatch[1].trim() : "";

      if (/box-shadow|text-shadow/i.test(propertyContext)) {
        return match; // Keep shadow values in px
      }

      // Check if this is a border shorthand with 1px (already handled above)

      // Check token map
      if (TOKEN_MAP[num]) {
        changes++;
        return TOKEN_MAP[num];
      }

      // Convert to rem
      changes++;
      return pxToRem(num);
    }
  );

  if (result !== original) {
    fs.writeFileSync(filePath, result, "utf8");
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
