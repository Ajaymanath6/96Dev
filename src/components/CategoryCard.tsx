import Link from "next/link";
import type { Category } from "@/lib/categories";

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/components/${category.id}`}
      className="group block rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
    >
      <h3 className="font-semibold text-zinc-900 transition-colors group-hover:text-zinc-700 dark:text-zinc-50 dark:group-hover:text-zinc-200">
        {category.name}
      </h3>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        {category.description}
      </p>
      <span className="mt-3 inline-block text-xs font-medium text-zinc-400 dark:text-zinc-500">
        {category.components.length} component types →
      </span>
    </Link>
  );
}
