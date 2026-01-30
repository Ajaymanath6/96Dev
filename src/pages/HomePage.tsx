import Card2 from "@/components/card-2";
import StackSidebar from "@/components/stack-sidebar";

const CARD_ITEMS: { title: string; description: string }[] = [
  { title: "Secondary outline button", description: "Outline button for secondary actions with border." },
  { title: "Primary CTA", description: "Main call-to-action button with primary brand color." },
  { title: "Feature card", description: "Card highlighting a product or feature with title and copy." },
  { title: "Announcement", description: "Banner or block for announcements and alerts." },
  { title: "Call to action", description: "Section prompting the user to take an action." },
  { title: "Comparison", description: "Compare options or features in a table or list." },
  { title: "Client logo", description: "Logo strip or grid for client or partner logos." },
  { title: "Footer link", description: "Footer navigation link or sitemap item." },
  { title: "Header nav", description: "Navigation item in the main header or navbar." },
  { title: "Hero section", description: "Full-width hero with headline and optional CTA." },
  { title: "Testimonial", description: "Quote or testimonial from a customer or user." },
  { title: "Pricing tier", description: "Pricing plan card with features and price." },
  { title: "Contact form", description: "Form for contact or lead capture." },
  { title: "Image gallery", description: "Grid or carousel of images." },
  { title: "Stats block", description: "Statistic or metric with label and value." },
  { title: "Newsletter", description: "Sign-up block for email newsletter." },
  { title: "Modal trigger", description: "Button or link that opens a modal or dialog." },
  { title: "Tab panel", description: "Tabbed content panel with tab list." },
  { title: "Accordion item", description: "Expandable accordion section with header and body." },
  { title: "Breadcrumb", description: "Breadcrumb trail for navigation context." },
  { title: "Search result", description: "Single search result row or card." },
  { title: "Table row", description: "Row in a data table with cells." },
  { title: "List item", description: "Item in a list or list group." },
  { title: "Badge", description: "Small label or badge for status or count." },
];

/**
 * Home page: two-section layout.
 * Page does not scroll. Only the inner content container (right side) scrolls.
 */
export default function HomePage() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-brandcolor-white">
      <aside className="shrink-0">
        <StackSidebar />
      </aside>
      <main className="min-h-0 flex-1 flex flex-col overflow-hidden">
        <div className="main-content-scroll flex-1 min-h-0 overflow-auto rounded-t-[24px] bg-white/30 mt-9 ml-4 mr-4 border border-brandcolor-strokeweak pl-4 pt-6">
          <div className="p-4">
            <div className="grid grid-cols-3 gap-4">
              {CARD_ITEMS.map((item, i) => (
                <Card2 key={i} title={item.title} description={item.description} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
