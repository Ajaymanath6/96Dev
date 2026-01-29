import Link from "next/link";
import { CategoryCard } from "@/components/CategoryCard";
import { CATEGORIES } from "@/lib/categories";

export const metadata = {
  title: "Components | Component Library",
  description: "Browse all component categories.",
};

export default function ComponentsIndexPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <nav className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="/" className="hover:text-zinc-700 dark:hover:text-zinc-300">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-zinc-900 dark:text-zinc-50">Components</span>
        </nav>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-3xl">
          Components
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Choose a category to browse components.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {CATEGORIES.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </div>
  );
}
