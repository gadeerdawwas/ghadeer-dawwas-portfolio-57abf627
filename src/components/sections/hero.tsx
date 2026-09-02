import { ArrowLeft, ArrowRight, Github, Linkedin, Sparkles, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { siteSettings } from "@/data/content";
import { useI18n } from "@/i18n";
import { supabase } from "@/lib/supabase";

const BARS = [42, 66, 54, 82, 71, 95, 88];
const PORTRAIT_CACHE_KEY = "hero_portrait_cache_v1";

type HeroPortrait = {
  imageUrl: string;
  altEn: string;
  altAr: string;
  isVisible: boolean;
};

const readCachedPortrait = (): HeroPortrait | null => {
  if (typeof window === "undefined") return null;

  try {
    const cached = window.localStorage.getItem(PORTRAIT_CACHE_KEY);
    return cached ? (JSON.parse(cached) as HeroPortrait) : null;
  } catch {
    return null;
  }
};

const preloadImage = (src: string) =>
  new Promise<void>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = reject;
    image.src = src;
  });

const readPortraitConfig = (value: unknown) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const config = value as {
    image_url?: unknown;
    is_visible?: unknown;
  };

  return {
    imageUrl: typeof config.image_url === "string" ? config.image_url : "",
    isVisible: config.is_visible === true,
  };
};

export function Hero() {
  const { t, isRTL } = useI18n();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;
  const [portrait, setPortrait] = useState<HeroPortrait | null>(readCachedPortrait);
  const [portraitLoading, setPortraitLoading] = useState(() => !readCachedPortrait());

  useEffect(() => {
    let isMounted = true;

    const loadPortrait = async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value_en,value_ar,value_json")
        .eq("setting_key", "hero_portrait")
        .maybeSingle();

      if (!isMounted) return;
      if (error || !data) {
        setPortraitLoading(false);
        return;
      }

      const config = readPortraitConfig(data.value_json);
      if (!config) {
        setPortraitLoading(false);
        return;
      }

      const nextPortrait = {
        imageUrl: config.imageUrl,
        isVisible: config.isVisible,
        altEn: data.value_en || "Ghadeer Dawwas - Data Analyst",
        altAr: data.value_ar || "غدير دواس - محللة بيانات",
      };

      window.localStorage.setItem(PORTRAIT_CACHE_KEY, JSON.stringify(nextPortrait));

      if (nextPortrait.isVisible && nextPortrait.imageUrl) {
        try {
          await preloadImage(nextPortrait.imageUrl);
        } catch {
          nextPortrait.isVisible = false;
        }
      }

      if (!isMounted) return;
      setPortrait(nextPortrait);
      setPortraitLoading(false);
    };

    void loadPortrait();

    return () => {
      isMounted = false;
    };
  }, []);

  const showPortrait = Boolean(portrait?.isVisible && portrait.imageUrl);

  return (
    <section id="home" className="relative overflow-hidden pt-24 pb-20 sm:pt-28 sm:pb-28">
      <div className="bg-gradient-hero pointer-events-none absolute inset-0 -z-10" />
      <div className="grid-noise pointer-events-none absolute inset-0 -z-10 opacity-60" />

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div className="hero-copy-enter text-start">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-surface/70 px-3.5 py-1.5 text-xs font-semibold text-foreground shadow-soft backdrop-blur">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-70" />
              <span className="relative inline-flex size-2 rounded-full bg-brand" />
            </span>
            {t("hero.badge")}
          </span>

          <h1 className="hero-name-enter mt-6 text-4xl font-extrabold tracking-tight text-balance sm:text-6xl lg:text-[4.1rem] lg:leading-[1.05]">
            {t("hero.name")}
          </h1>
          <p className="text-gradient mt-3 text-xl font-bold sm:text-2xl">{t("hero.title")}</p>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t("hero.description")}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="bg-gradient-brand group shadow-elegant">
              <a href="#projects">
                {t("hero.cta1")}
                <Arrow className="size-4 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-border bg-surface/60">
              <a href="#contact">{t("hero.cta2")}</a>
            </Button>

            <div className="flex items-center gap-2 ms-1">
              {[
                { href: siteSettings.linkedin, Icon: Linkedin, label: "LinkedIn" },
                { href: siteSettings.github, Icon: Github, label: "GitHub" },
              ].map(({ href, Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                  className="grid size-11 place-items-center rounded-xl border border-border bg-surface/70 text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-brand hover:text-brand"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {portraitLoading ? (
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[470px] animate-pulse overflow-hidden rounded-[2.25rem] border border-border bg-surface/60 lg:mx-0">
            <div className="absolute inset-3 rounded-[1.75rem] bg-muted/70" />
          </div>
        ) : showPortrait ? (
          <div className="hero-visual-enter relative mx-auto w-full max-w-[470px] lg:mx-0">
            <div className="bg-gradient-brand absolute -inset-8 -z-10 rounded-[3rem] opacity-20 blur-3xl" />

            <div className="glass-panel relative rounded-[2.25rem] p-3 shadow-elegant sm:p-4">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] border border-white/10 bg-muted">
                <img
                  src={portrait?.imageUrl}
                  alt={isRTL ? portrait?.altAr : portrait?.altEn}
                  className="h-full w-full object-cover object-[center_32%]"
                  loading="eager"
                  fetchPriority="high"
                  onError={() =>
                    setPortrait((current) => (current ? { ...current, isVisible: false } : current))
                  }
                />

                <div className="absolute start-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-slate-950/65 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                  <span className="size-2 rounded-full bg-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.9)]" />
                  {t("hero.panelTitle")}
                </div>
              </div>
            </div>

            <div className="float-soft glass-panel absolute -bottom-5 start-2 flex items-center gap-3 rounded-2xl px-4 py-3 shadow-elegant sm:-start-7 sm:bottom-8">
              <span className="bg-gradient-brand grid size-10 place-items-center rounded-xl text-primary-foreground">
                <Sparkles className="size-4" />
              </span>
              <div className="text-start">
                <p className="text-sm font-bold">Power BI · SQL · Excel</p>
                <p className="text-xs text-muted-foreground">{t("hero.panelSubtitle")}</p>
              </div>
            </div>

            <div className="float-soft-delayed glass-panel absolute end-2 top-20 hidden items-center gap-2 rounded-2xl px-3.5 py-2.5 shadow-elegant sm:flex sm:-end-5">
              <TrendingUp className="size-4 text-brand" />
              <div>
                <p className="text-sm font-extrabold">40+</p>
                <p className="text-[10px] text-muted-foreground">{t("hero.metricReports")}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="bg-gradient-brand absolute -inset-6 -z-10 rounded-[2.5rem] opacity-15 blur-3xl" />
            <div className="glass-panel rounded-3xl p-5 shadow-elegant sm:p-7">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{t("hero.panelTitle")}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {t("hero.panelSubtitle")}
                  </p>
                </div>
                <span className="bg-gradient-brand grid size-9 shrink-0 place-items-center rounded-xl text-primary-foreground">
                  <Sparkles className="size-4" />
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  { label: t("hero.metricRevenue"), value: "+38%" },
                  { label: t("hero.metricAccuracy"), value: "99.2%" },
                  { label: t("hero.metricReports"), value: "40+" },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="rounded-2xl border border-border bg-surface/70 p-3.5 text-start"
                  >
                    <p className="text-xl font-extrabold tracking-tight">{m.value}</p>
                    <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                      {m.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-border bg-surface/70 p-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{t("hero.chartLabel")}</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-brand">
                    <TrendingUp className="size-3.5" /> +12.4%
                  </span>
                </div>
                <div className="mt-4 flex h-36 items-end gap-2">
                  {BARS.map((h, i) => (
                    <div
                      key={i}
                      className="bg-gradient-brand group relative flex-1 rounded-t-lg transition-all duration-500 hover:opacity-90"
                      style={{ height: `${h}%`, animationDelay: `${i * 60}ms` }}
                    >
                      <span className="absolute inset-x-0 -top-6 text-center text-[10px] font-semibold text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                        {h}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
