"use client";

import { Application, Category, Search, User } from "@carbon/icons-react";

const SIDEBAR_WIDTH_PX = 280;

const SIDEBAR_COMPONENTS: { label: string; count: number }[] = [
  { label: "Announcements", count: 8 },
  { label: "Backgrounds", count: 12 },
  { label: "Borders", count: 6 },
  { label: "Calls to Action", count: 10 },
  { label: "Clients", count: 5 },
  { label: "Comparisons", count: 4 },
  { label: "Features", count: 15 },
  { label: "Footers", count: 9 },
  { label: "Headers", count: 14 },
  { label: "Hooks", count: 7 },
  { label: "Images", count: 11 },
  { label: "Maps", count: 3 },
  { label: "Forms", count: 8 },
  { label: "Cards", count: 18 },
  { label: "Modals", count: 6 },
];

export interface StackSidebarProps {
  /** When true, use fixed height (e.g. on canvas). When false/undefined, use min-h-screen (page). */
  compact?: boolean;
  /** Header label (default "96Dev"). */
  label?: string;
}

export default function StackSidebar({
  compact = false,
  label = "96Dev",
}: StackSidebarProps = {}) {
  const heightClass = compact ? "h-80" : "h-full min-h-screen";
  const borderClass = compact
    ? "rounded-button border border-brandcolor-strokeweak"
    : "border-r border-brandcolor-strokeweak";

  return (
    <aside
      className={`flex flex-col bg-brandcolor-white overflow-hidden p-4 ${heightClass} ${borderClass}`}
      style={{ width: SIDEBAR_WIDTH_PX }}
      aria-label="Sidebar"
    >
      <header className="flex shrink-0 items-center gap-1.5 border-b border-brandcolor-strokeweak py-4 min-w-0">
        <Application size={24} className="text-brandcolor-strokestrong shrink-0" />
        <span className="text-base font-medium text-brandcolor-textstrong truncate whitespace-nowrap">
          {label}
        </span>
        <Search size={24} className="text-brandcolor-strokestrong shrink-0 ml-auto" aria-label="Search" />
      </header>
      <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
        <div className="flex items-center gap-1.5 py-4">
          <Category size={24} className="text-brandcolor-strokestrong shrink-0" />
          <span className="text-base font-medium text-brandcolor-textstrong whitespace-nowrap">Components</span>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">
          {SIDEBAR_COMPONENTS.map((item) => (
            <button
              key={item.label}
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              className="flex h-[42px] max-h-[42px] w-full items-center justify-between gap-1 px-5 text-left hover:bg-brandcolor-fill"
            >
              <span className="text-base text-brandcolor-textweak truncate">{item.label}</span>
              <span className="text-base text-brandcolor-textweak shrink-0">({item.count})</span>
            </button>
          ))}
        </div>
      </div>
      <div className="shrink-0 border-t border-brandcolor-strokeweak py-4">
        <button
          type="button"
          onMouseDown={(e) => e.stopPropagation()}
          className="flex w-full items-center gap-1.5 rounded hover:bg-brandcolor-fill py-4 text-base text-brandcolor-textstrong"
        >
          <User size={24} className="text-brandcolor-strokestrong shrink-0" />
          <span>Profile</span>
        </button>
      </div>
    </aside>
  );
}
