"use client";

import {
  Application,
  Home,
  SidePanelClose,
  SidePanelOpen,
} from "@carbon/icons-react";
import Link from "next/link";
import { useState } from "react";

/**
 * Reusable sidebar. Uses only theme.css and theme-guide.json.
 * - Header: Carbon Application icon (logo) left, collapsible layout button right.
 * - On click of layout button, sidebar collapses/expands.
 */
export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`flex h-full min-h-screen flex-col border-r border-brandcolor-strokeweak bg-brandcolor-white transition-[width] duration-200 ${
        collapsed ? "w-16" : "w-56"
      }`}
      aria-label="Sidebar"
    >
      {/* Header: logo (click → Canvas), collapse button right — 16px padding both sides */}
      <header className="flex shrink-0 items-center justify-between border-b border-brandcolor-strokemild px-4 py-3">
        <Link
          href="/canvas"
          className="flex min-w-0 shrink-0 items-center gap-2 rounded transition-colors hover:bg-brandcolor-fill"
          aria-label="Go to Canvas"
        >
          <Application
            size={24}
            className="shrink-0 text-brandcolor-strokestrong"
            aria-hidden
          />
          {!collapsed && (
            <span className="truncate text-sm font-medium text-brandcolor-textstrong">
              96 Dev
            </span>
          )}
        </Link>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="flex shrink-0 items-center justify-center rounded-lg border border-transparent p-1.5 text-brandcolor-strokestrong transition-colors hover:bg-brandcolor-fill active:border-brandcolor-strokeweak"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <SidePanelOpen size={20} aria-hidden />
          ) : (
            <SidePanelClose size={20} aria-hidden />
          )}
        </button>
      </header>

      {/* Nav: Home only — Canvas is via header icon */}
      <div className="flex flex-1 flex-col gap-1 overflow-hidden p-2">
        <nav className="flex flex-col gap-0.5">
          <Link
            href="/"
            className="flex items-center gap-2 rounded px-2 py-2 text-sm text-brandcolor-textstrong transition-colors hover:bg-brandcolor-fill"
          >
            <Home size={20} className="shrink-0 text-brandcolor-strokestrong" aria-hidden />
            {!collapsed && <span className="truncate">Home</span>}
          </Link>
        </nav>
      </div>
    </aside>
  );
}
