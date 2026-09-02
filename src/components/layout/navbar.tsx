import { useEffect, useState } from "react";
import { Languages, Menu, Moon, Sun, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { sectionIds, siteSettings, type SectionId } from "@/data/content";
import { useActiveSection } from "@/hooks/use-reveal";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

const SECTIONS = sectionIds as readonly SectionId[];

export function Navbar() {
  const { t, language, setLanguage } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const active = useActiveSection([...SECTIONS]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "glass-panel shadow-soft" : "border-b border-transparent bg-transparent",
      )}
    >
      <nav className="nav-enter mx-auto flex h-18 max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <a href="#home" className="flex shrink-0 items-center gap-2.5">
          <span className="bg-gradient-brand grid size-10 place-items-center rounded-xl text-sm font-extrabold tracking-tight text-primary-foreground shadow-soft">
            {siteSettings.initials}
          </span>
          <span className="hidden text-sm font-semibold leading-tight sm:block">
            {t("hero.name")}
            <span className="block text-xs font-normal text-muted-foreground">
              {t("hero.title")}
            </span>
          </span>
        </a>

        <ul className="mx-auto hidden items-center gap-1 lg:flex">
          {SECTIONS.map((id) => (
            <li key={id}>
              <a
                href={`#${id}`}
                className={cn(
                  "relative rounded-full px-3 py-2 text-sm font-medium transition-colors",
                  active === id ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t(`nav.${id}`)}
                {active === id && (
                  <span className="bg-gradient-brand absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full" />
                )}
              </a>
            </li>
          ))}
        </ul>

        <div className="ms-auto flex items-center gap-1.5 lg:ms-0">
          <div className="hidden items-center rounded-full border border-border bg-surface/70 p-0.5 sm:flex">
            <button
              type="button"
              onClick={() => setLanguage("en")}
              aria-pressed={language === "en"}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-semibold transition-colors",
                language === "en"
                  ? "bg-gradient-brand text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage("ar")}
              aria-pressed={language === "ar"}
              className={cn(
                "font-arabic rounded-full px-2.5 py-1 text-xs font-semibold transition-colors",
                language === "ar"
                  ? "bg-gradient-brand text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              العربية
            </button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            aria-label={t("nav.language")}
            onClick={() => setLanguage(language === "en" ? "ar" : "en")}
          >
            <Languages className="size-4" />
          </Button>

          <Button variant="ghost" size="icon" aria-label={t("nav.theme")} onClick={toggleTheme}>
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>

          <Button asChild className="bg-gradient-brand hidden shadow-soft md:inline-flex">
            <a href="#contact">{t("nav.cta")}</a>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={open ? t("nav.close") : t("nav.menu")}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </nav>

      {open && (
        <div className="glass-panel border-t border-border lg:hidden">
          <ul className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6">
            {SECTIONS.map((id) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block rounded-xl px-4 py-3 text-start text-base font-medium transition-colors",
                    active === id
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  {t(`nav.${id}`)}
                </a>
              </li>
            ))}
            <li className="pt-2">
              <Button asChild className="bg-gradient-brand w-full">
                <a href="#contact" onClick={() => setOpen(false)}>
                  {t("nav.cta")}
                </a>
              </Button>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
