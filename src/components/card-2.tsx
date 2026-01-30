"use client";import { Catalog } from "@carbon/icons-react";export interface Card2Props {
  title?: string | boolean;
  label?: string | boolean;
  description?: string | boolean;
}

export default function Card2({ title, label, description }: Card2Props = {}) {
  return (
    <div
      className="group relative min-w-64 w-full max-w-full aspect-6/5  rounded-3xl border border-brandcolor-strokelightoverflow-hidden bg-brandcolor-white p-1 shadow-none hover:shadow-[0_48px_72px_-12px_rgba(0,0,0,0.02),0_32px_44px_-12px_rgba(0,0,0,0.03)] flex flex-col transition-shadow"
    > <div className="bg-brandcolor-fill px-4 py-3 rounded-2xl shrink-0"> <div className="flex items-center gap-2"> <Catalog size={20} className="text-brandcolor-strokestrong shrink-0" aria-hidden /> <h3 className="text-sm font-semibold text-brandcolor-textstrong"> {title ?? label ?? "Title"} </h3> </div> {description && ( <p className="mt-1.5 text-xs text-brandcolor-textweak truncate" title={String(description)}> {description} </p> )} </div> <div className="flex flex-col flex-1 min-h-0 items-center justify-center p-4"> <img src="/Button.svg" alt="" className="max-w-full h-auto shrink-0" width={107} height={40} /> </div>
    </div>
  );
}