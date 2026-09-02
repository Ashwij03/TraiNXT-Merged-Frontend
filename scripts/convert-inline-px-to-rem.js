#!/usr/bin/env node
/**
 * Convert hardcoded px values in JS/JSX inline styles to rem (÷16).
 */

const fs = require("fs");
const path = require("path");

// Token mapping: px value → CSS custom property (for reference, but inline styles can't use var())
// For inline styles, we'll just convert to rem directly
function pxToRem(pxVal) {
  const rem = pxVal / 16;
  const str = rem.toString();
  if (str.includes(".") && !str.endsWith("0")) {
    return str + "rem";
  }
  return str.replace(/\.?0+$/, "") + "rem";
}

function processJsFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  const original = content;
  let changes = 0;

  // Match inline style patterns: style={{ ... }} or style={{ ... }}
  // Convert px values to rem
  const result = content.replace(
    /style=\{\{([^}]+)\}\}/g,
    (match, styleContent) => {
      let newStyle = styleContent;

      // Convert string px values: "20px" → "1.25rem"
      newStyle = newStyle.replace(
        /"(\d+)px"/g,
        (m, numStr) => {
          const num = parseInt(numStr, 10);
          if (num === 0 || num === 1 || num === 999) return m;
          changes++;
          return `"${pxToRem(num)}"`;
        }
      );

      // Convert single-quoted px values: '20px' → '1.25rem'
      newStyle = newStyle.replace(
        /'(\d+)px'/g,
        (m, numStr) => {
          const num = parseInt(numStr, 10);
          if (num === 0 || num === 1 || num === 999) return m;
          changes++;
          return `'${pxToRem(num)}'`;
        }
      );

      // Convert unquoted numeric px values in style objects: padding: 20 → padding: "1.25rem"
      // This is trickier - we need to handle cases like { padding: 20 } vs { padding: "20px" }
      // Only convert numeric values that are likely px (not percentages, not unitless)
      newStyle = newStyle.replace(
        /(\w+):\s*(\d+)(?=,|\s|\}|$)/g,
        (m, prop, numStr) => {
          const num = parseInt(numStr, 10);
          // Only convert if it's a dimensional property (not opacity, z-index, etc.)
          const dimensionalProps = [
            'padding', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight',
            'margin', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight',
            'width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight',
            'gap', 'rowGap', 'columnGap',
            'fontSize', 'lineHeight',
            'borderRadius', 'borderWidth',
            'top', 'left', 'right', 'bottom',
            'fontSize',
          ];
          if (!dimensionalProps.includes(prop)) return m;
          if (num === 0 || num === 1 || num === 999) return m;
          changes++;
          return `${prop}: "${pxToRem(num)}"`;
        }
      );

      return `style={{${newStyle}}}`;
    }
  );

  if (result !== original) {
    fs.writeFileSync(filePath, result, "utf8");
  }

  return changes;
}

// Collect all JS files under src/
function findJsFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== "node_modules" && entry.name !== "build") {
      files.push(...findJsFiles(fullPath));
    } else if (entry.isFile() && (entry.name.endsWith(".js") || entry.name.endsWith(".jsx"))) {
      files.push(fullPath);
    }
  }
  return files;
}

const srcDir = path.join(__dirname, "..", "src");
const jsFiles = findJsFiles(srcDir);

let totalChanges = 0;
let filesChanged = 0;

for (const file of jsFiles) {
  const relativePath = path.relative(path.join(__dirname, ".."), file);
  const changes = processJsFile(file);
  if (changes > 0) {
    filesChanged++;
    totalChanges += changes;
    console.log(`  ${relativePath}: ${changes} conversions`);
  }
}

console.log(`\nDone: ${totalChanges} inline px values converted across ${filesChanged} files`);
