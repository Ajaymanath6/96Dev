import Link from "next/link";
import { notFound } from "next/navigation";
import { ComponentCard } from "@/components/ComponentCard";
import { getCategoryById } from "@/lib/categories";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { category: categoryId } = await params;
  const category = getCategoryById(categoryId);
  if (!category) return { title: "Not found" };
  return {
    title: `${category.name} | Component Library`,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: categoryId } = await params;
  const category = getCategoryById(categoryId);
  if (!category) notFound();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <nav className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="/" className="hover:text-zinc-700 dark:hover:text-zinc-300">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link
            href="/components"
            className="hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            Components
          </Link>
          <span className="mx-2">/</span>
          <span className="text-zinc-900 dark:text-zinc-50">{category.name}</span>
        </nav>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-3xl">
          {category.name}
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          {category.description}
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {category.components.map((component) => (
            <ComponentCard
              key={component.id}
              categoryId={category.id}
              component={component}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
