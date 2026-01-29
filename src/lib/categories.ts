/**
 * Component library categories and metadata.
 * Add new categories and components here to grow the showcase.
 */

export interface ComponentItem {
  id: string;
  name: string;
  description: string;
  count?: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  components: ComponentItem[];
}

export const CATEGORIES: Category[] = [
  {
    id: "marketing",
    name: "Marketing Blocks",
    description: "Heroes, features, CTAs, testimonials, pricing",
    components: [
      { id: "heroes", name: "Heroes", description: "Landing hero sections", count: 0 },
      { id: "features", name: "Features", description: "Feature grids and lists", count: 0 },
      { id: "ctas", name: "Calls to Action", description: "CTA blocks and banners", count: 0 },
      { id: "testimonials", name: "Testimonials", description: "Reviews and quotes", count: 0 },
      { id: "pricing", name: "Pricing Sections", description: "Pricing tables and cards", count: 0 },
    ],
  },
  {
    id: "ui",
    name: "UI Components",
    description: "Buttons, cards, inputs, modals, and more",
    components: [
      { id: "buttons", name: "Buttons", description: "Button variants and states", count: 0 },
      { id: "cards", name: "Cards", description: "Content and product cards", count: 0 },
      { id: "inputs", name: "Inputs", description: "Forms and form controls", count: 0 },
      { id: "modals", name: "Dialogs / Modals", description: "Overlays and dialogs", count: 0 },
      { id: "navigation", name: "Navigation", description: "Navbars, sidebars, menus", count: 0 },
    ],
  },
];

export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export function getComponentById(categoryId: string, componentId: string): ComponentItem | undefined {
  const category = getCategoryById(categoryId);
  return category?.components.find((c) => c.id === componentId);
}
