import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import en from "./locales/en.json";
import ar from "./locales/ar.json";

export type Language = "en" | "ar";
export type Direction = "ltr" | "rtl";

const resources: Record<Language, Record<string, unknown>> = { en, ar };

export const LANGUAGE_STORAGE_KEY = "gd-portfolio-language";
export const DEFAULT_LANGUAGE: Language = "en";

/** Resolve a dotted key such as `nav.home` inside a locale resource. */
function resolve(source: Record<string, unknown>, key: string): string {
  const value = key
    .split(".")
    .reduce<unknown>(
      (acc, part) =>
        acc && typeof acc === "object" ? (acc as Record<string, unknown>)[part] : undefined,
      source,
    );
  return typeof value === "string" ? value : key;
}

/**
 * Picks the localized value of a bilingual record field.
 * Mirrors the future database shape: `title_en` / `title_ar`.
 */
export function localized<T extends Record<string, unknown>>(
  row: T,
  field: string,
  language: Language,
): string {
  const value = row[`${field}_${language}`] ?? row[`${field}_${DEFAULT_LANGUAGE}`];
  return typeof value === "string" ? value : "";
}

/** Localized list field, e.g. `insights_en` / `insights_ar`. */
export function localizedList<T extends Record<string, unknown>>(
  row: T,
  field: string,
  language: Language,
): string[] {
  const value = row[`${field}_${language}`] ?? row[`${field}_${DEFAULT_LANGUAGE}`];
  return Array.isArray(value) ? (value as string[]) : [];
}

type I18nContextValue = {
  language: Language;
  direction: Direction;
  isRTL: boolean;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
  tr: <T extends Record<string, unknown>>(row: T, field: string) => string;
  trList: <T extends Record<string, unknown>>(row: T, field: string) => string[];
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);

  useEffect(() => {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === "en" || stored === "ar") {
      setLanguageState(stored);
      return;
    }
    if (window.navigator.language?.toLowerCase().startsWith("ar")) {
      setLanguageState("ar");
    }
  }, []);

  const direction: Direction = language === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    const root = document.documentElement;
    root.lang = language;
    root.dir = direction;
  }, [language, direction]);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
  }, []);

  const value = useMemo<I18nContextValue>(() => {
    const t = (key: string) => resolve(resources[language], key);
    return {
      language,
      direction,
      isRTL: direction === "rtl",
      setLanguage,
      toggleLanguage: () => setLanguage(language === "en" ? "ar" : "en"),
      t,
      tr: (row, field) => localized(row, field, language),
      trList: (row, field) => localizedList(row, field, language),
    };
  }, [language, direction, setLanguage]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within an I18nProvider");
  return ctx;
}