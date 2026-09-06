"use client";

import { isDemoMode } from "@/lib/demo";

export default function DemoBanner() {
  if (!isDemoMode) {
    return null;
  }

  return (
    <div className="bg-orange-500 text-white text-sm text-center px-4 py-2">
      Static GitHub Pages demo — voting, search, and AI calls run locally when you start the full stack.
    </div>
  );
}
