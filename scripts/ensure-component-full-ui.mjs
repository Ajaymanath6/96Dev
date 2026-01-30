#!/usr/bin/env node
/**
 * Ensures a shared component file is not a stub (has full UI).
 * Run after "Make shared" or when adding a new component from the canvas.
 *
 * Usage: node scripts/ensure-component-full-ui.mjs [componentId]
 *   componentId: e.g. card-2, stack-sidebar (file is src/components/<id>.tsx)
 * If no arg, checks all .tsx files in src/components/ that have data-component-id.
 *
 * Exit 0 if component has substantial UI; exit 1 if stub with message.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const COMPONENTS_DIR = path.join(ROOT, "src", "components");

const STUB_PATTERNS = [
  /return\s*<div\s+data-component-id=["'][^"']+["'][^>]*>\s*[^<]*<\/div>\s*;?\s*$/m,
  /return\s*<div[^>]*>\s*[^<{]*<\/div>\s*;?\s*$/m,
];

const FULL_UI_INDICATORS = [
  /@carbon\/icons-react/,
  /border-brandcolor|bg-brandcolor|text-brandcolor/,
  /rounded-large|rounded-button|shadow-card/,
  /className=.*\s{2,}/,
  /<(button|nav|header|aside|main)\s/,
];

function isStub(content) {
  const trimmed = content.replace(/\s+/g, " ").trim();
  const looksLikeStub = STUB_PATTERNS.some((re) => re.test(content));
  if (!looksLikeStub) return false;
  const hasFullUI = FULL_UI_INDICATORS.some((re) => re.test(content));
  return !hasFullUI;
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const hasDataComponentId = /data-component-id/.test(content);
  if (!hasDataComponentId) return { filePath, stub: false, skip: true };
  const stub = isStub(content);
  return { filePath, stub, skip: false };
}

function main() {
  const arg = process.argv[2];
  let files = [];

  if (arg) {
    const base = arg.endsWith(".tsx") ? arg : `${arg}.tsx`;
    const full = path.isAbsolute(base) ? base : path.join(COMPONENTS_DIR, base);
    if (!fs.existsSync(full)) {
      console.error(`File not found: ${full}`);
      process.exit(2);
    }
    files = [full];
  } else {
    if (!fs.existsSync(COMPONENTS_DIR)) {
      console.log("No src/components directory.");
      process.exit(0);
    }
    files = fs
      .readdirSync(COMPONENTS_DIR)
      .filter((f) => f.endsWith(".tsx"))
      .map((f) => path.join(COMPONENTS_DIR, f));
  }

  const stubs = [];
  for (const filePath of files) {
    const result = checkFile(filePath);
    if (result.skip) continue;
    if (result.stub) stubs.push(path.relative(ROOT, filePath));
  }

  if (stubs.length > 0) {
    console.error("Shared component(s) are stubs. Add full UI from CanvasPage.tsx for each type.\n");
    stubs.forEach((f) => console.error("  - " + f));
    console.error("\nSee .cursor/rules/shared-component-full-ui.mdc for how to copy full UI from the canvas.");
    process.exit(1);
  }

  console.log("Component(s) have full UI.");
  process.exit(0);
}

main();
