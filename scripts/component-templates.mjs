#!/usr/bin/env node
/**
 * Full UI source for canvas types. Used by:
 * - POST /api/generate-component (Next.js API)
 * - scripts/component-helper.mjs (standalone server)
 *
 * When adding a new element type in CanvasPage.tsx, add a template here
 * so "Make shared" always generates full code, never a stub.
 */

const STUB = (safeId, componentName) => `"use client";

// TODO: Replace with full UI from src/pages/CanvasPage.tsx for element type "${safeId}".
// See .cursor/rules/shared-component-full-ui.mdc and run: npm run ensure-component-ui ${safeId}
export default function ${componentName}() {
  return <div data-component-id="${safeId}">${safeId}</div>;
}
`;

/**
 * Full component source for card-2 (Secondary outline button card).
 * Matches the canvas UI in CanvasPage.tsx (el.type === "card-2").
 */
function card2FullSource() {
  const componentName = "Card2";
  return `"use client";

import { Catalog } from "@carbon/icons-react";

export interface Card2Props {
  title?: string;
  label?: string;
  description?: string;
}

export default function ${componentName}({
  title,
  label,
  description = "Outline button component for secondary actions.",
}: Card2Props = {}) {
  const heading = title ?? label ?? "Title";
  return (
    <div className="min-w-64 w-full max-w-full h-[323px] rounded-large overflow-hidden bg-brandcolor-white shadow-card flex flex-col">
      <div className="bg-brandcolor-fill px-4 py-3 rounded-b-button shrink-0">
        <div className="flex items-center gap-2">
          <Catalog size={20} className="text-brandcolor-strokestrong shrink-0" aria-hidden />
          <h3 className="text-sm font-semibold text-brandcolor-textstrong">
            {heading}
          </h3>
        </div>
        {description && (
          <p className="mt-1.5 text-xs text-brandcolor-textweak">
            {description}
          </p>
        )}
      </div>
      <div className="flex flex-col flex-1 min-h-0 items-center justify-center p-4">
        <img src="/Button.svg" alt="" className="max-w-full h-auto shrink-0" width={107} height={40} />
      </div>
    </div>
  );
}
`;
}

/**
 * Returns full component source for a known canvas type, or stub for unknown.
 * @param {string} componentId - e.g. "card-2", "stack-sidebar", "card"
 * @returns {string} Full TSX source (full UI or stub with TODO)
 */
export function getFullComponentSource(componentId) {
  const safeId = componentId.replace(/[^a-zA-Z0-9-_]/g, "");
  const componentName = safeId
    .split(/[-_]/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join("");

  switch (safeId) {
    case "card-2":
      return card2FullSource();
    case "stack-sidebar":
    case "card":
    default:
      return STUB(safeId, componentName);
  }
}
