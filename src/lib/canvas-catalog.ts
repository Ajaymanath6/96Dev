/**
 * Component catalog for the canvas: in-memory store, localStorage, and JSON export.
 * Used by CanvasPage for "Add to catalog", shared components, Sync/Save.
 */

const STORAGE_KEY = "component-catalog";
const CATALOG_JSON_PATH = "/component-catalog.json";

export interface CatalogEntry {
  id: string;
  displayName: string;
  category: string;
  description: string;
  htmlSelector: string;
  status: "active";
  registeredAt: string;
  isSharedComponent?: boolean;
  componentPath?: string;
  componentTag?: string;
  properties?: { inputs: Record<string, boolean>; outputs: Record<string, boolean> };
}

export interface CatalogStore {
  [id: string]: CatalogEntry;
}

export interface CatalogJson {
  catalogId: string;
  version: string;
  lastUpdated: string;
  registeredComponents: CatalogEntry[];
}

function humanize(id: string): string {
  return id
    .replace(/([A-Z])/g, " $1")
    .replace(/[-_]/g, " ")
    .replace(/^\s+/, "")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export function loadCatalogFromStorage(): CatalogStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as { registeredComponents?: CatalogEntry[] };
    const entries = parsed?.registeredComponents ?? [];
    const store: CatalogStore = {};
    for (const e of entries) store[e.id] = e;
    return store;
  } catch {
    return {};
  }
}

export function saveCatalogToStorage(store: CatalogStore): void {
  if (typeof window === "undefined") return;
  try {
    const json: CatalogJson = {
      catalogId: "96dev-canvas",
      version: "1",
      lastUpdated: new Date().toISOString(),
      registeredComponents: Object.values(store),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(json));
  } catch {
    // ignore
  }
}

export function registerComponent(store: CatalogStore, entry: CatalogEntry): CatalogStore {
  const next = { ...store, [entry.id]: entry };
  saveCatalogToStorage(next);
  return next;
}

export function unregisterComponent(store: CatalogStore, id: string): CatalogStore {
  const next = { ...store };
  delete next[id];
  saveCatalogToStorage(next);
  return next;
}

export function getComponent(store: CatalogStore, id: string): CatalogEntry | undefined {
  return store[id];
}

export function getAllComponents(store: CatalogStore): CatalogEntry[] {
  return Object.values(store);
}

export function isInCatalog(store: CatalogStore, id: string): boolean {
  return id in store;
}

export function getCatalogAsJson(store: CatalogStore): CatalogJson {
  return {
    catalogId: "96dev-canvas",
    version: "1",
    lastUpdated: new Date().toISOString(),
    registeredComponents: Object.values(store),
  };
}

export function createCatalogEntry(componentId: string): CatalogEntry {
  const displayName = humanize(componentId);
  return {
    id: componentId,
    displayName,
    category: "Canvas",
    description: `Component ${displayName}`,
    htmlSelector: `[data-component-id='${componentId}']`,
    status: "active",
    registeredAt: new Date().toISOString(),
  };
}

export async function loadCatalogFromProject(): Promise<CatalogStore> {
  try {
    const res = await fetch(CATALOG_JSON_PATH);
    if (!res.ok) return {};
    const json = (await res.json()) as CatalogJson;
    const store: CatalogStore = {};
    for (const e of json?.registeredComponents ?? []) store[e.id] = e;
    return store;
  } catch {
    return {};
  }
}

export const COMPONENT_HELPER_PORT = 4202;
export const COMPONENT_HELPER_BASE = `http://localhost:${COMPONENT_HELPER_PORT}`;

export async function checkComponentHelperHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${COMPONENT_HELPER_BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
