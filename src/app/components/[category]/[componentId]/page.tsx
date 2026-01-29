import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoryById, getComponentById } from "@/lib/categories";

interface ComponentDemoPageProps {
  params: Promise<{ category: string; componentId: string }>;
}

export async function generateMetadata({ params }: ComponentDemoPageProps) {
  const { category: categoryId, componentId } = await params;
  const category = getCategoryById(categoryId);
  const component = getComponentById(categoryId, componentId);
  if (!category || !component) return { title: "Not found" };
  return {
    title: `${component.name} | ${category.name} | Component Library`,
    description: component.description,
  };
}

export default async function ComponentDemoPage({ params }: ComponentDemoPageProps) {
  const { category: categoryId, componentId } = await params;
  const category = getCategoryById(categoryId);
  const component = getComponentById(categoryId, componentId);
  if (!category || !component) notFound();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
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
          <Link
            href={`/components/${category.id}`}
            className="hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            {category.name}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-zinc-900 dark:text-zinc-50">{component.name}</span>
        </nav>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-3xl">
          {component.name}
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          {component.description}
        </p>

        {/* Demo area: add your component demos here */}
        <div className="mt-10 rounded-xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Demo
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Add your component demos in this section. Example for Buttons:
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Primary
            </button>
            <button
              type="button"
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Secondary
            </button>
            <button
              type="button"
              className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              Ghost
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
