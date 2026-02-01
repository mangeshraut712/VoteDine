"use client";

import { Globe, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const languages = [
  { code: "en", name: "English", native: "English", supported: true },
  { code: "es", name: "Spanish", native: "Español", supported: true },
  { code: "fr", name: "French", native: "Français", supported: true },
  { code: "de", name: "German", native: "Deutsch", supported: true },
  { code: "hi", name: "Hindi", native: "हिन्दी", supported: true },
  { code: "zh", name: "Chinese", native: "中文", supported: true },
  { code: "ja", name: "Japanese", native: "日本語", supported: false },
  { code: "ko", name: "Korean", native: "한국어", supported: false },
];

export default function LanguagesPage() {
  const [currentLang, setCurrentLang] = useState("en");

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Language Settings</h1>
            <p className="text-gray-600">
              Choose your preferred language for VoteDine
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {languages.map((lang) => (
            <Card
              key={lang.code}
              className={`cursor-pointer transition-all ${lang.supported
                  ? "hover:border-orange-300"
                  : "opacity-60 grayscale"
                } ${currentLang === lang.code ? "border-orange-500 bg-orange-50" : ""}`}
              onClick={() => lang.supported && setCurrentLang(lang.code)}
            >
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <div className="font-bold text-lg">{lang.native}</div>
                  <div className="text-sm text-gray-500">{lang.name}</div>
                </div>
                {currentLang === lang.code && (
                  <Check className="w-6 h-6 text-orange-600" />
                )}
                {!lang.supported && (
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">
                    Coming Soon
                  </span>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 p-6 bg-blue-50 rounded-2xl border border-blue-100">
          <h3 className="font-bold text-blue-900 mb-2">
            Help translate VoteDine
          </h3>
          <p className="text-blue-700 text-sm mb-4">
            We're always looking for help to bring VoteDine to more languages.
            If you're a native speaker and want to contribute, we'd love to hear
            from you.
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Join Translation Team
          </Button>
        </div>
      </div>
    </div>
  );
}
