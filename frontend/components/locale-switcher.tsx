"use client";

import { Globe } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function LocaleSwitcher() {
  const { locale, setLocale, supportedLocales } = useI18n();

  return (
    <div className="flex items-center gap-2 rounded-full border border-white/50 bg-white/70 px-3 py-1 text-xs text-muted-foreground">
      <Globe className="h-3.5 w-3.5" />
      <select
        value={locale}
        onChange={(event) => setLocale(event.target.value as typeof locale)}
        className="bg-transparent text-xs font-medium text-foreground outline-none"
      >
        {supportedLocales.map((value) => (
          <option key={value} value={value}>
            {value.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
}
