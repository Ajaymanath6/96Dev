#!/usr/bin/env node
/**
 * Extracts full component source from CanvasPage.tsx for a given element type.
 * Used by POST /api/generate-component and scripts/component-helper.mjs.
 * When user clicks "Make shared", we derive full code from the canvas—no manual templates.
 */

import fs from "fs";
import path from "path";

const BRANCH_START_RE = /el\.type\s*===\s*["']([^"']+)["']\s*\?\s*\(/;
const BRANCH_END_RE = /^\s*\)\s*:\s*(?:el\.type\s*===|\()/;

const CARBON_ICONS = [
  "Catalog",
  "ArrowLeft",
  "Add",
  "Copy",
  "Share",
  "TrashCan",
  "Document",
  "User",
  "Search",
  "Application",
  "Category",
];

function toPascalCase(componentId) {
  const safe = componentId.replace(/[^a-zA-Z0-9-_]/g, "");
  return safe
    .split(/[-_]/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join("");
}

/**
 * Find the JSX block for el.type === componentId in the canvas file.
 * Returns { startLine, endLine } (0-based) or null.
 */
function findBlock(content, componentId) {
  const lines = content.split("\n");
  let startLine = -1;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(BRANCH_START_RE);
    if (m && m[1] === componentId) {
      startLine = i;
      break;
    }
  }
  if (startLine === -1) return null;
  let endLine = -1;
  for (let i = startLine + 1; i < lines.length; i++) {
    if (BRANCH_END_RE.test(lines[i])) {
      endLine = i;
      break;
    }
  }
  if (endLine === -1) return null;
  return { startLine, endLine };
}

/**
 * Extract raw JSX lines (no branch delimiters).
 */
function extractBlockLines(lines, startLine, endLine) {
  return lines.slice(startLine + 1, endLine);
}

/**
 * Strip minimum indent so the block can be re-indented.
 */
function stripIndent(blockLines) {
  const nonEmpty = blockLines.filter((l) => l.trim().length > 0);
  if (nonEmpty.length === 0) return blockLines;
  let min = Infinity;
  for (const line of nonEmpty) {
    const m = line.match(/^(\s*)/);
    const len = m ? m[1].length : 0;
    if (len < min) min = len;
  }
  if (min === 0 || min === Infinity) return blockLines;
  return blockLines.map((l) => (l.length >= min ? l.slice(min) : l));
}

/**
 * Transform extracted JSX into standalone component source.
 */
function transform(blockStr, componentId) {
  let s = blockStr;

  // Strip canvas-only attributes (order matters: multi-line first)
  s = s.replace(/\s*onMouseDown=\{[^}]+\}/g, "");
  s = s.replace(/\s*role="button"/g, "");
  s = s.replace(/\s*tabIndex=\{0\}/g, "");

  // Strip from className: cursor-move, hover:cursor-grab, active:cursor-grabbing (preserve newlines)
  s = s.replace(/\bcursor-move\b/g, "");
  s = s.replace(/\bhover:cursor-grab\b/g, "");
  s = s.replace(/\bactive:cursor-grabbing\b/g, "");
  s = s.replace(/className="\s+/g, 'className="');
  s = s.replace(/  +/g, " ");

  // Replace el.xxx with props (same name)
  const elProps = new Set();
  const elRe = /\bel\.([a-zA-Z_][a-zA-Z0-9_]*)\b/g;
  let match;
  while ((match = elRe.exec(s)) !== null) elProps.add(match[1]);

  s = s.replace(/\bel\.([a-zA-Z_][a-zA-Z0-9_]*)\b/g, (_, name) => {
    return name;
  });

  // StackSidebar: onCollapsedChange with setStackSidebarCollapsed(el.id, c) -> no-op or optional
  s = s.replace(/onCollapsedChange=\{[^}]+\}/g, "onCollapsedChange={() => {}}");

  return { body: s, props: Array.from(elProps) };
}

/**
 * Infer imports from transformed body.
 */
function inferImports(body) {
  const carbonUsed = CARBON_ICONS.filter((name) => {
    const re = new RegExp(`<${name}[\\s/>]`, "g");
    return re.test(body);
  });
  const hasStackSidebar = /<StackSidebar[\s/>]/.test(body);
  return { carbon: carbonUsed, stackSidebar: hasStackSidebar };
}

/**
 * Build Props interface and destructuring. Exclude 'id' for standalone component.
 */
function buildPropsInterface(props, componentName) {
  const filtered = props.filter((p) => p !== "id");
  if (filtered.length === 0) return { interfaceStr: "", destructureStr: "" };
  const optional = filtered.map((p) => `  ${p}?: string | boolean;`).join("\n");
  const interfaceStr = `export interface ${componentName}Props {\n${optional}\n}\n\n`;
  const destructureStr = filtered.join(", ");
  return { interfaceStr, destructureStr };
}

/**
 * Extract and transform component from CanvasPage.tsx.
 * @param {string} componentId - e.g. "card-2", "card", "stack-sidebar"
 * @param {string} canvasPagePath - absolute path to CanvasPage.tsx
 * @returns {{ success: true, source: string } | { success: false, error: string }}
 */
export function extractComponentFromCanvas(componentId, canvasPagePath) {
  try {
    const fullPath = path.isAbsolute(canvasPagePath)
      ? canvasPagePath
      : path.join(process.cwd(), canvasPagePath);
    if (!fs.existsSync(fullPath)) {
      return { success: false, error: `CanvasPage not found: ${fullPath}` };
    }
    const content = fs.readFileSync(fullPath, "utf8");
    const lines = content.split("\n");
    const block = findBlock(content, componentId);
    if (!block) {
      return { success: false, error: `No branch el.type === "${componentId}" in CanvasPage` };
    }
    const rawLines = extractBlockLines(lines, block.startLine, block.endLine);
    const stripped = stripIndent(rawLines);
    const blockStr = stripped.join("\n");
    const { body, props } = transform(blockStr, componentId);
    const componentName = toPascalCase(componentId);
    const { carbon, stackSidebar } = inferImports(body);
    const { interfaceStr, destructureStr } = buildPropsInterface(props, componentName);

    const importLines = [];
    importLines.push('"use client";');
    importLines.push("");
    if (carbon.length > 0) {
      importLines.push(`import { ${carbon.join(", ")} } from "@carbon/icons-react";`);
      importLines.push("");
    }
    if (stackSidebar) {
      importLines.push('import StackSidebar from "@/components/stack-sidebar";');
      importLines.push("");
    }

    const params =
      destructureStr.length > 0 ? `{ ${destructureStr} }: ${componentName}Props = {}` : "";
    const componentOpen = `export default function ${componentName}(${params}) {\n  return (\n`;
    const componentClose = "\n  );\n}";

    const jsxIndent = "    ";
    const indentedBody = body
      .split("\n")
      .map((line) => jsxIndent + line)
      .join("\n");

    const source = [
      ...importLines,
      interfaceStr,
      componentOpen,
      indentedBody,
      componentClose,
    ].join("");

    return { success: true, source };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
