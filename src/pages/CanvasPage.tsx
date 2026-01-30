"use client";

import {
  checkComponentHelperHealth,
  COMPONENT_HELPER_BASE,
  createCatalogEntry,
  getCatalogAsJson,
  loadCatalogFromProject,
  loadCatalogFromStorage,
  registerComponent,
  saveCatalogToStorage,
  unregisterComponent,
  type CatalogEntry,
  type CatalogStore,
} from "@/lib/canvas-catalog";
import StackSidebar from "@/components/stack-sidebar";
import Link from "next/link";
import { ArrowLeft, Catalog, Add, Copy, Share, TrashCan } from "@carbon/icons-react";
import { useCallback, useEffect, useRef, useState } from "react";

const VIEWPORT_SIZE = 5000;
const ELEMENTS_STORAGE_KEY = "canvasElements";
const ZOOM_MIN = 0.1;
const ZOOM_MAX = 3;
const GRID_SIZE = 20;

export interface CanvasElement {
  id: string;
  type: string;
  x: number;
  y: number;
  label?: string;
  content?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  isSharedComponent?: boolean;
  collapsed?: boolean;
}

const DEFAULT_CARD: CanvasElement = {
  id: "card-1",
  type: "card",
  x: 100,
  y: 320,
  label: "Card",
  title: "Card title",
  subtitle: "Card subtitle",
  description: "Optional description text for the card body.",
};

const DEFAULT_CARD_2: CanvasElement = {
  id: "card-2",
  type: "card-2",
  x: 400,
  y: 320,
  label: "Secondary outline button",
  title: "Secondary outline button",
  subtitle: "Subtitle",
  description: "Outline button component for secondary actions.",
};

const DEFAULT_STACK_SIDEBAR: CanvasElement = {
  id: "stack-sidebar-1",
  type: "stack-sidebar",
  x: 100,
  y: 520,
  label: "96Dev",
  collapsed: false,
};

const DEFAULT_ELEMENTS: CanvasElement[] = [
  { id: "1", type: "element-1", x: 100, y: 100, label: "Element 1" },
  { id: "2", type: "element-2", x: 300, y: 200, label: "Element 2" },
  DEFAULT_CARD,
  DEFAULT_CARD_2,
  DEFAULT_STACK_SIDEBAR,
];

function loadElements(): CanvasElement[] {
  if (typeof window === "undefined") return DEFAULT_ELEMENTS;
  try {
    const raw = localStorage.getItem(ELEMENTS_STORAGE_KEY);
    if (!raw) return DEFAULT_ELEMENTS;
    const parsed = JSON.parse(raw) as CanvasElement[];
    let list = Array.isArray(parsed) ? parsed : DEFAULT_ELEMENTS;
    if (!list.some((el) => el.type === "card")) {
      list = [...list, { ...DEFAULT_CARD, id: `card-${Date.now()}` }];
    }
    if (!list.some((el) => el.type === "card-2")) {
      list = [...list, { ...DEFAULT_CARD_2, id: `card-2-${Date.now()}` }];
    }
    if (!list.some((el) => el.type === "stack-sidebar")) {
      list = [...list, { ...DEFAULT_STACK_SIDEBAR, id: `stack-sidebar-${Date.now()}` }];
    }
    return list;
  } catch {
    return DEFAULT_ELEMENTS;
  }
}

function saveElements(elements: CanvasElement[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ELEMENTS_STORAGE_KEY, JSON.stringify(elements));
  } catch {
    // ignore
  }
}

export default function CanvasPage() {
  const [elements, setElements] = useState<CanvasElement[]>(DEFAULT_ELEMENTS);
  const [catalog, setCatalog] = useState<CatalogStore>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setElements(loadElements());
    setCatalog(loadCatalogFromStorage());
    setMounted(true);
  }, []);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const panStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; elX: number; elY: number } | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    loadCatalogFromProject().then((project) => {
      if (Object.keys(project).length > 0) {
        setCatalog((prev) => {
          const merged = { ...prev, ...project };
          saveCatalogToStorage(merged);
          return merged;
        });
      }
    });
  }, [mounted]);

  const handleViewportMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.target !== viewportRef.current) return;
      e.preventDefault();
      setIsPanning(true);
      panStartRef.current = { x: e.clientX, y: e.clientY, panX, panY };
    },
    [panX, panY]
  );

  const handleElementMouseDown = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      e.preventDefault();
      const el = elements.find((x) => x.id === id);
      if (!el) return;
      setDraggingId(id);
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        elX: el.x,
        elY: el.y,
      };
    },
    [elements]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isPanning && panStartRef.current) {
        const dx = e.clientX - panStartRef.current.x;
        const dy = e.clientY - panStartRef.current.y;
        setPanX(panStartRef.current.panX + dx);
        setPanY(panStartRef.current.panY + dy);
        return;
      }
      if (draggingId && dragStartRef.current) {
        const start = dragStartRef.current;
        const dx = e.clientX - start.x;
        const dy = e.clientY - start.y;
        const startX = start.elX;
        const startY = start.elY;
        setElements((prev) =>
          prev.map((el) =>
            el.id === draggingId ? { ...el, x: startX + dx, y: startY + dy } : el
          )
        );
      }
    },
    [isPanning, draggingId]
  );

  const handleMouseUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
      panStartRef.current = null;
    }
    if (draggingId) {
      setElements((prev) => {
        saveElements(prev);
        return prev;
      });
      dragStartRef.current = null;
      setDraggingId(null);
    }
  }, [isPanning, draggingId]);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mouseleave", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mouseleave", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const viewportX = (mouseX - panX) / zoom;
      const viewportY = (mouseY - panY) / zoom;
      const newZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoom - e.deltaY * 0.001));
      const newPanX = mouseX - viewportX * newZoom;
      const newPanY = mouseY - viewportY * newZoom;
      setZoom(newZoom);
      setPanX(newPanX);
      setPanY(newPanY);
    },
    [zoom, panX, panY]
  );

  const zoomIn = useCallback(() => setZoom((z) => Math.min(ZOOM_MAX, z + 0.25)), []);
  const zoomOut = useCallback(() => setZoom((z) => Math.max(ZOOM_MIN, z - 0.25)), []);
  const resetView = useCallback(() => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  }, []);

  const addToCatalog = useCallback(
    (componentId: string) => {
      const entry = createCatalogEntry(componentId);
      setCatalog((prev) => registerComponent(prev, entry));
      showToast(`Added ${entry.displayName} to catalog`);
    },
    [showToast]
  );

  const removeFromCatalog = useCallback((componentId: string) => {
    setCatalog((prev) => unregisterComponent(prev, componentId));
    showToast("Removed from catalog");
  }, [showToast]);

  const makeSharedComponent = useCallback(
    async (element: CanvasElement) => {
      type GenerateResult = { success: boolean; componentPath?: string; componentTag?: string; error?: string };
      const payload = { componentId: element.type };
      let data: GenerateResult | null = null;

      try {
        const apiRes = await fetch("/api/generate-component", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (apiRes.ok) {
          data = (await apiRes.json()) as GenerateResult;
        }
      } catch {
        // API route failed (e.g. not available); try external helper
      }

      if (!data?.success) {
        const ok = await checkComponentHelperHealth();
        if (!ok) {
          showToast("Component helper not running. Run: npm run component-helper");
          return;
        }
        try {
          const res = await fetch(`${COMPONENT_HELPER_BASE}/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          data = (await res.json()) as GenerateResult;
        } catch (err) {
          showToast(String(err));
          return;
        }
      }

      if (!data?.success) {
        showToast(data?.error ?? "Generate failed");
        return;
      }
      const entry: CatalogEntry = {
        ...createCatalogEntry(element.type),
        isSharedComponent: true,
        componentPath: data.componentPath,
        componentTag: data.componentTag ?? `<${element.type} />`,
      };
      setCatalog((prev) => registerComponent(prev, entry));
      setElements((prev) =>
        prev.map((el) => (el.id === element.id ? { ...el, isSharedComponent: true } : el))
      );
      showToast(`Created ${data.componentPath}. Use: ${data.componentTag ?? ""}`);
    },
    [showToast]
  );

  const deleteSharedComponent = useCallback(
    async (componentType: string) => {
      let updatedCount = 0;
      try {
        const res = await fetch("/api/delete-component", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ componentId: componentType }),
        });
        if (res.ok) {
          const data = (await res.json()) as { updatedFiles?: string[] };
          updatedCount = data.updatedFiles?.length ?? 0;
        }
      } catch {
        // API may not be available (e.g. production); still remove from catalog and canvas
      }
      setCatalog((prev) => unregisterComponent(prev, componentType));
      setElements((prev) => {
        const next = prev.filter((el) => el.type !== componentType);
        saveElements(next);
        return next;
      });
      const usageMsg =
        updatedCount > 0
          ? ` Removed usages from ${updatedCount} file(s).`
          : "";
      showToast(
        `Deleted shared component: catalog, all canvas instances, component file.${usageMsg}`
      );
    },
    [showToast]
  );

  const deleteElementInstance = useCallback((elementId: string) => {
    setElements((prev) => {
      const next = prev.filter((el) => el.id !== elementId);
      saveElements(next);
      return next;
    });
    showToast("Removed this instance from the canvas");
  }, [showToast]);

  const setStackSidebarCollapsed = useCallback((elementId: string, collapsed: boolean) => {
    setElements((prev) => {
      const next = prev.map((el) =>
        el.id === elementId ? { ...el, collapsed } : el
      );
      saveElements(next);
      return next;
    });
  }, []);

  const copyToClipboard = useCallback(
    (text: string) => {
      navigator.clipboard.writeText(text).then(() => showToast("Copied to clipboard"));
    },
    [showToast]
  );

  const handleSyncFromProject = useCallback(async () => {
    const project = await loadCatalogFromProject();
    setCatalog((prev) => {
      const merged = { ...project, ...prev };
      saveCatalogToStorage(merged);
      setElements((els) =>
        els.map((el) => ({
          ...el,
          isSharedComponent: !!merged[el.type]?.isSharedComponent,
        }))
      );
      return merged;
    });
    showToast("Sync complete");
  }, [showToast]);

  const handleSaveToProject = useCallback(() => {
    const json = getCatalogAsJson(catalog);
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "component-catalog.json";
    a.click();
    URL.revokeObjectURL(a.href);
    showToast(`Saved ${Object.keys(catalog).length} components. Put file in project root.`);
  }, [catalog, showToast]);

  const isInCatalog = (id: string) => id in catalog;
  const getEntry = (id: string) => catalog[id];

  return (
    <div className="flex min-h-screen w-full bg-brandcolor-white">
      <main className="flex flex-1 flex-col min-h-screen bg-brandcolor-fill">
        {toast && (
          <div className="shrink-0 bg-brandcolor-textstrong text-brandcolor-white px-4 py-2 text-sm text-center">
            {toast}
          </div>
        )}
        <div
          ref={containerRef}
          className="relative flex-1 min-h-0 overflow-hidden rounded-large border border-brandcolor-strokeweak bg-brandcolor-white"
          style={{
            minHeight: "calc(100vh - 2rem)",
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)
            `,
            backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
            backgroundPosition: "0 0",
          }}
          onWheel={handleWheel}
        >
          <div className="absolute top-2 left-2 right-2 z-100 flex items-center justify-between gap-2 rounded-button border border-brandcolor-strokeweak bg-brandcolor-white/95 px-3 py-2 shadow-card">
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-button border border-brandcolor-strokeweak bg-brandcolor-white p-1.5 text-brandcolor-textstrong hover:bg-brandcolor-fill"
                aria-label="Back to home"
                title="Back to home"
              >
                <ArrowLeft size={20} />
              </Link>
              <button
                type="button"
                onClick={zoomOut}
                className="rounded-button border border-brandcolor-strokeweak bg-brandcolor-white px-2 py-1 text-brandcolor-textstrong hover:bg-brandcolor-fill"
              >
                −
              </button>
              <span className="min-w-[3rem] text-center text-sm text-brandcolor-textstrong">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={zoomIn}
                className="rounded-button border border-brandcolor-strokeweak bg-brandcolor-white px-2 py-1 text-brandcolor-textstrong hover:bg-brandcolor-fill"
              >
                +
              </button>
              <button
                type="button"
                onClick={resetView}
                className="rounded-button border border-brandcolor-strokeweak bg-brandcolor-white px-2 py-1 text-sm text-brandcolor-textstrong hover:bg-brandcolor-fill"
              >
                Reset
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSyncFromProject}
                className="rounded-button border border-brandcolor-strokeweak bg-brandcolor-white px-2 py-1 text-sm text-brandcolor-textstrong hover:bg-brandcolor-fill"
              >
                Sync from Project
              </button>
              <button
                type="button"
                onClick={handleSaveToProject}
                className="rounded-button border border-brandcolor-strokeweak bg-brandcolor-white px-2 py-1 text-sm text-brandcolor-textstrong hover:bg-brandcolor-fill"
              >
                Save to Project
              </button>
            </div>
          </div>

          <div
            ref={viewportRef}
            className="canvas-viewport absolute cursor-grab active:cursor-grabbing"
            style={{
              left: 0,
              top: 0,
              width: VIEWPORT_SIZE,
              height: VIEWPORT_SIZE,
              transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
              transformOrigin: "0 0",
            }}
            onMouseDown={handleViewportMouseDown}
          >
            {!mounted && (
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-sm text-brandcolor-textweak">
                Loading canvas…
              </div>
            )}
            {mounted && elements.map((el) => (
              <div
                key={el.id}
                data-component-id={el.type}
                className={`group component-wrapper relative inline-block select-none rounded-button ${
                  el.isSharedComponent ? "shared-component border-2 border-brandcolor-strokemild" : ""
                }`}
                style={{
                  position: "absolute",
                  left: el.x,
                  top: el.y,
                  zIndex: draggingId === el.id ? 10 : 1,
                }}
              >
                {el.isSharedComponent && (
                  <span className="absolute -top-1 -left-1 rounded bg-brandcolor-secondary px-1 text-[10px] font-medium text-brandcolor-white">
                    SHARED
                  </span>
                )}
                {el.type === "card" ? (
                  <div
                    role="button"
                    tabIndex={0}
                    onMouseDown={(e) => handleElementMouseDown(e, el.id)}
                    className="cursor-move w-64 rounded-large border border-brandcolor-strokeweak bg-brandcolor-white p-4 shadow-card hover:cursor-grab active:cursor-grabbing"
                  >
                    <h3 className="text-sm font-semibold text-brandcolor-textstrong">
                      {el.title ?? el.label ?? "Title"}
                    </h3>
                    {el.subtitle && (
                      <p className="mt-0.5 text-xs text-brandcolor-textweak">{el.subtitle}</p>
                    )}
                    {el.description && (
                      <p className="mt-2 text-xs leading-relaxed text-brandcolor-textstrong">
                        {el.description}
                      </p>
                    )}
                    <div className="my-3 h-px bg-brandcolor-strokeweak" aria-hidden />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={(e) => e.stopPropagation()}
                        className="rounded-button bg-brandcolor-primary px-3 py-1.5 text-xs font-medium text-brandcolor-white hover:bg-brandcolor-primaryhover"
                      >
                        Primary
                      </button>
                      <button
                        type="button"
                        onClick={(e) => e.stopPropagation()}
                        className="rounded-button bg-brandcolor-secondary px-3 py-1.5 text-xs font-medium text-brandcolor-white hover:bg-brandcolor-secondaryhover"
                      >
                        Secondary
                      </button>
                    </div>
                  </div>
                ) : el.type === "card-2" ? (
                  <div
                    role="button"
                    tabIndex={0}
                    onMouseDown={(e) => handleElementMouseDown(e, el.id)}
                    className="cursor-move min-w-64 w-full max-w-full h-[323px] rounded-large overflow-hidden bg-brandcolor-white shadow-card hover:cursor-grab active:cursor-grabbing flex flex-col"
                  >
                    <div className="bg-brandcolor-fill px-4 py-3 rounded-b-button shrink-0">
                      <div className="flex items-center gap-2">
                        <Catalog size={20} className="text-brandcolor-strokestrong shrink-0" aria-hidden />
                        <h3 className="text-sm font-semibold text-brandcolor-textstrong">
                          {el.title ?? el.label ?? "Title"}
                        </h3>
                      </div>
                      {el.description && (
                        <p className="mt-1.5 text-xs text-brandcolor-textweak">
                          {el.description}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col flex-1 min-h-0 items-center justify-center p-4">
                      <img src="/Button.svg" alt="" className="max-w-full h-auto shrink-0" width={107} height={40} />
                    </div>
                  </div>
                ) : el.type === "stack-sidebar" ? (
                  <div
                    role="button"
                    tabIndex={0}
                    onMouseDown={(e) => handleElementMouseDown(e, el.id)}
                    className="cursor-move hover:cursor-grab active:cursor-grabbing"
                  >
                    <StackSidebar
                      compact
                      collapsed={el.collapsed}
                      onCollapsedChange={(c) => setStackSidebarCollapsed(el.id, c)}
                      label={el.label ?? "96Dev"}
                    />
                  </div>
                ) : (
                  <div
                    role="button"
                    tabIndex={0}
                    onMouseDown={(e) => handleElementMouseDown(e, el.id)}
                    className="cursor-move rounded-button border border-brandcolor-strokeweak bg-brandcolor-white px-4 py-3 shadow-card hover:cursor-grab active:cursor-grabbing"
                  >
                    <span className="text-sm font-medium text-brandcolor-textstrong">
                      {el.label ?? el.type}
                    </span>
                  </div>
                )}
                <div
                  className="component-tooltip invisible absolute bottom-0 left-1/2 z-1000 w-max max-w-[90vw] -translate-x-1/2 translate-y-full rounded-large border border-brandcolor-strokeweak bg-brandcolor-white/98 p-2.5 shadow-card opacity-0 transition-opacity pointer-events-none group-hover:visible group-hover:opacity-100 group-hover:pointer-events-auto"
                  style={{ marginTop: "4px" }}
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-medium text-brandcolor-textstrong">{el.type}</div>
                      {el.label && el.label !== el.type && (
                        <div className="text-[11px] text-brandcolor-textweak mt-0.5">{el.label}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteElementInstance(el.id);
                        }}
                        className="inline-flex items-center gap-1 rounded-button border border-brandcolor-strokeweak bg-brandcolor-white px-2 py-1 text-xs text-brandcolor-destructive hover:bg-brandcolor-fill"
                        title="Remove this instance"
                      >
                        <TrashCan size={12} />
                        Delete
                      </button>
                      {el.isSharedComponent && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            void deleteSharedComponent(el.type);
                          }}
                          className="inline-flex items-center gap-1 rounded-button border border-brandcolor-strokeweak bg-brandcolor-white px-2 py-1 text-xs text-brandcolor-destructive hover:bg-brandcolor-fill"
                          title="Delete all instances + file"
                        >
                          <TrashCan size={12} />
                          All
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(el.type);
                      }}
                      className="inline-flex items-center gap-1 rounded-button border border-brandcolor-strokeweak bg-brandcolor-white px-2 py-1 text-xs text-brandcolor-textstrong hover:bg-brandcolor-fill"
                      title="Copy ID"
                    >
                      <Copy size={12} />
                      Copy ID
                    </button>
                    {el.isSharedComponent && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(getEntry(el.type)?.componentTag ?? `<${el.type} />`);
                        }}
                        className="inline-flex items-center gap-1 rounded-button border border-brandcolor-strokeweak bg-brandcolor-white px-2 py-1 text-xs text-brandcolor-textstrong hover:bg-brandcolor-fill"
                        title="Copy component tag"
                      >
                        <Copy size={12} />
                        Copy tag
                      </button>
                    )}
                    {!isInCatalog(el.type) ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCatalog(el.type);
                        }}
                        className="inline-flex items-center gap-1 rounded-button border border-brandcolor-strokeweak bg-brandcolor-white px-2 py-1 text-xs text-brandcolor-textstrong hover:bg-brandcolor-fill"
                      >
                        <Add size={12} />
                        Catalog
                      </button>
                    ) : (
                      <span className="text-[10px] text-brandcolor-badge-success-text">✓ Catalog</span>
                    )}
                    {!el.isSharedComponent ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          makeSharedComponent(el);
                        }}
                        className="inline-flex items-center gap-1 rounded-button border border-brandcolor-strokeweak bg-brandcolor-white px-2 py-1 text-xs text-brandcolor-textstrong hover:bg-brandcolor-fill"
                        title="Create in src/components/"
                      >
                        <Share size={12} />
                        Shared
                      </button>
                    ) : (
                      <span className="text-[10px] text-brandcolor-secondary">✓ Shared</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
