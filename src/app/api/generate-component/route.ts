import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

/**
 * POST /api/generate-component
 * Body: { componentId: string }
 * Creates src/components/<componentId>.tsx with full UI derived from CanvasPage.tsx
 * when the type exists there; otherwise falls back to templates (stub or known type).
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { componentId?: string };
    const componentId = body?.componentId;
    if (!componentId || typeof componentId !== "string") {
      return NextResponse.json(
        { success: false, error: "componentId required" },
        { status: 400 }
      );
    }
    const safeId = componentId.replace(/[^a-zA-Z0-9-_]/g, "");
    if (!safeId) {
      return NextResponse.json(
        { success: false, error: "Invalid componentId" },
        { status: 400 }
      );
    }

    const cwd = process.cwd();
    const componentsDir = path.join(cwd, "src", "components");
    const filePath = path.join(componentsDir, `${safeId}.tsx`);
    const componentPath = `src/components/${safeId}.tsx`;
    const componentTag = `<${safeId} />`;

    const canvasPagePath = path.join(cwd, "src", "pages", "CanvasPage.tsx");
    const extractorPath = path.join(cwd, "scripts", "canvas-extract-component.mjs");
    const { extractComponentFromCanvas } = await import(
      pathToFileURL(extractorPath).href
    );
    const extracted = extractComponentFromCanvas(componentId, canvasPagePath);

    let content: string;
    if (extracted.success && extracted.source) {
      content = extracted.source;
    } else {
      const templatesPath = path.join(cwd, "scripts", "component-templates.mjs");
      const { getFullComponentSource } = await import(
        pathToFileURL(templatesPath).href
      );
      content = getFullComponentSource(componentId);
    }

    fs.mkdirSync(componentsDir, { recursive: true });
    fs.writeFileSync(filePath, content, "utf8");

    return NextResponse.json({
      success: true,
      files: [filePath],
      componentPath,
      componentTag,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
