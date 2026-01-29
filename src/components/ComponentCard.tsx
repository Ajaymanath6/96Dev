import Link from "next/link";
import type { ComponentItem } from "@/lib/categories";

interface ComponentCardProps {
  categoryId: string;
  component: ComponentItem;
}

export function ComponentCard({ categoryId, component }: ComponentCardProps) {
  return (
    <Link
      href={`/components/${categoryId}/${component.id}`}
      className="group block rounded-lg border border-zinc-200 bg-white p-4 transition-all hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/50"
    >
      <h4 className="font-medium text-zinc-900 dark:text-zinc-50">
        {component.name}
      </h4>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        {component.description}
      </p>
      <span className="mt-2 inline-block text-xs text-zinc-400 transition-colors group-hover:text-zinc-600 dark:text-zinc-500 dark:group-hover:text-zinc-300">
        View demos →
      </span>
    </Link>
  );
}
