import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const SRC_DIR = "src";
const COMPONENTS_DIR = path.join(SRC_DIR, "components");
const EXTENSIONS = [".tsx", ".ts", ".jsx", ".js"];

function listSourceFiles(dir: string, baseDir: string, out: string[]): void {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    const rel = path.relative(baseDir, full);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name.startsWith(".")) continue;
      listSourceFiles(full, baseDir, out);
    } else if (EXTENSIONS.some((ext) => e.name.endsWith(ext))) {
      out.push(full);
    }
  }
}

/**
 * Remove imports of the component and replace JSX usages with {null}.
 * Matches: import Name from '@/components/safeId' or similar path containing components/safeId.
 */
function removeComponentUsages(filePath: string, safeId: string, _cwd: string): { changed: boolean } {
  let content = fs.readFileSync(filePath, "utf8");
  const importRegex = new RegExp(
    `import\\s+(\\w+)\\s+from\\s+['\"][^'\"]*components[/\\\\]${escapeRegex(safeId)}[^'\"]*['\"];?\\s*`,
    "g"
  );
  const importNames: string[] = [];
  let match = importRegex.exec(content);
  while (match) {
    importNames.push(match[1]);
    match = importRegex.exec(content);
  }
  if (importNames.length === 0) return { changed: false };

  let changed = false;
  for (const name of importNames) {
    const importLineRegex = new RegExp(
      `import\\s+${escapeRegex(name)}\\s+from\\s+['\"][^'\"]*components[/\\\\]${escapeRegex(safeId)}[^'\"]*['\"];?\\s*\\n?`,
      "g"
    );
    if (importLineRegex.test(content)) {
      content = content.replace(importLineRegex, "");
      changed = true;
    }
    const selfClosingRegex = new RegExp(
      `<${escapeRegex(name)}\\s+[^/]*/>|<${escapeRegex(name)}\\s*/>`,
      "g"
    );
    const before = content;
    content = content.replace(selfClosingRegex, "{null}");
    if (content !== before) changed = true;
  }
  if (changed) fs.writeFileSync(filePath, content, "utf8");
  return { changed };
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * POST /api/delete-component
 * Body: { componentId: string }
 * Deletes src/components/<componentId>/ and removes all imports/usages of that component from the project.
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
    const srcDir = path.join(cwd, SRC_DIR);
    const componentFile = path.join(cwd, COMPONENTS_DIR, `${safeId}.tsx`);
    const componentDir = path.join(cwd, COMPONENTS_DIR, safeId);

    const filesToScan: string[] = [];
    listSourceFiles(srcDir, cwd, filesToScan);
    const componentDirPrefix = path.join(cwd, COMPONENTS_DIR, safeId);
    const filtered = filesToScan.filter(
      (f) => f !== componentFile && !f.startsWith(componentDirPrefix + path.sep)
    );

    const updatedFiles: string[] = [];
    for (const filePath of filtered) {
      const result = removeComponentUsages(filePath, safeId, cwd);
      if (result.changed) updatedFiles.push(path.relative(cwd, filePath));
    }

    let deleted = false;
    if (fs.existsSync(componentFile)) {
      fs.unlinkSync(componentFile);
      deleted = true;
    }
    if (fs.existsSync(componentDir)) {
      fs.rmSync(componentDir, { recursive: true });
      deleted = true;
    }

    return NextResponse.json({
      success: true,
      deleted,
      updatedFiles,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
