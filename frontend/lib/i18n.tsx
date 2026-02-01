"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const translations = {
  en: {
    heroTitle: "VoteDine makes group dining effortless.",
    heroSubtitle:
      "AI recommendations, live voting, voice commands, and calendar-ready plans so your crew decides faster.",
    heroPrimaryCta: "Create room",
    heroSecondaryCta: "Join room",
    heroBadge: "New: AI picks + voice controls",
    sectionAiTitle: "AI restaurant recommendations",
    sectionAiSubtitle: "Set the vibe and let VoteDine surface the best match.",
    sectionVoiceTitle: "Hands-free voice commands",
    sectionVoiceSubtitle:
      "Start a room, ask for a cuisine, or open analytics without lifting a finger.",
    sectionCalendarTitle: "Calendar-ready dining plans",
    sectionCalendarSubtitle:
      "Drop the winning pick into Google, Apple, or Outlook in one click.",
    sectionAnalyticsTitle: "Voting insights dashboard",
    sectionAnalyticsSubtitle:
      "Track top cuisines, vote momentum, and group trends.",
    sectionShareTitle: "Social sharing built in",
    sectionShareSubtitle:
      "Send the room, invite friends, and keep the poll moving.",
    sectionOfflineTitle: "Offline-first PWA",
    sectionOfflineSubtitle: "Stay in the loop even with spotty service.",
    sectionMobileTitle: "Mobile app ready",
    sectionMobileSubtitle:
      "React Native structure ships with VoteDine branding.",
    footerNote: "VoteDine helps groups decide faster. Dinner debates optional.",
  },
  es: {
    heroTitle: "VoteDine hace que comer en grupo sea sencillo.",
    heroSubtitle:
      "Recomendaciones con IA, votación en vivo, comandos de voz y planes listos para tu calendario.",
    heroPrimaryCta: "Crear sala",
    heroSecondaryCta: "Unirse a sala",
    heroBadge: "Nuevo: IA + controles de voz",
    sectionAiTitle: "Recomendaciones con IA",
    sectionAiSubtitle: "Define el ambiente y VoteDine elige lo mejor.",
    sectionVoiceTitle: "Comandos de voz",
    sectionVoiceSubtitle:
      "Crea salas o pide un tipo de cocina sin usar las manos.",
    sectionCalendarTitle: "Planes en tu calendario",
    sectionCalendarSubtitle:
      "Agrega la opción ganadora a Google, Apple u Outlook.",
    sectionAnalyticsTitle: "Panel de insights",
    sectionAnalyticsSubtitle: "Sigue votos, tendencias y favoritos del grupo.",
    sectionShareTitle: "Compartir en segundos",
    sectionShareSubtitle: "Envía la sala y mantén a todos invitados.",
    sectionOfflineTitle: "PWA sin conexión",
    sectionOfflineSubtitle: "Funciona incluso con mala señal.",
    sectionMobileTitle: "App móvil lista",
    sectionMobileSubtitle: "Estructura React Native con marca VoteDine.",
    footerNote:
      "VoteDine ayuda a decidir más rápido. Las discusiones son opcionales.",
  },
  fr: {
    heroTitle: "VoteDine simplifie les repas en groupe.",
    heroSubtitle:
      "Recommandations IA, votes en temps réel, commandes vocales et plans prêts pour votre agenda.",
    heroPrimaryCta: "Créer un salon",
    heroSecondaryCta: "Rejoindre un salon",
    heroBadge: "Nouveau : IA + voix",
    sectionAiTitle: "Recommandations IA",
    sectionAiSubtitle: "Choisissez l'ambiance, VoteDine s'occupe du reste.",
    sectionVoiceTitle: "Commandes vocales",
    sectionVoiceSubtitle:
      "Lancez une salle ou demandez une cuisine à voix haute.",
    sectionCalendarTitle: "Plans dans l'agenda",
    sectionCalendarSubtitle:
      "Ajoutez la sélection gagnante à Google, Apple ou Outlook.",
    sectionAnalyticsTitle: "Tableau de bord",
    sectionAnalyticsSubtitle: "Suivez les tendances, les votes et les favoris.",
    sectionShareTitle: "Partage social",
    sectionShareSubtitle: "Invitez vos amis en un lien.",
    sectionOfflineTitle: "PWA hors ligne",
    sectionOfflineSubtitle: "Restez à jour même sans réseau.",
    sectionMobileTitle: "App mobile prête",
    sectionMobileSubtitle: "Structure React Native aux couleurs VoteDine.",
    footerNote: "VoteDine aide les groupes à décider plus vite.",
  },
} as const;

export type Locale = keyof typeof translations;

type TranslationKey = keyof typeof translations.en;

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
  supportedLocales: Locale[];
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const storageKey = "votedine-locale";

function resolveNavigatorLocale(): Locale {
  if (typeof navigator === "undefined") {
    return "en";
  }
  const language = navigator.language.split("-")[0] as Locale;
  return language in translations ? language : "en";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey) as Locale | null;
    setLocale(
      stored && stored in translations ? stored : resolveNavigatorLocale(),
    );
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale: (next) => {
        setLocale(next);
        window.localStorage.setItem(storageKey, next);
      },
      t: (key) => translations[locale][key],
      supportedLocales: Object.keys(translations) as Locale[],
    }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within LanguageProvider");
  }
  return context;
}
