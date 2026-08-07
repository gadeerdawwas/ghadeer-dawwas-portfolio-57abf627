import { ArrowLeft, ArrowRight, Github, Linkedin, Sparkles, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { siteSettings } from "@/data/content";
import { useI18n } from "@/i18n";

const BARS = [42, 66, 54, 82, 71, 95, 88];

export function Hero() {
  const { t, isRTL } = useI18n();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section id="home" className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div className="bg-gradient-hero pointer-events-none absolute inset-0 -z-10" />
      <div className="grid-noise pointer-events-none absolute inset-0 -z-10 opacity-60" />

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div className="text-start">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-surface/70 px-3.5 py-1.5 text-xs font-semibold text-foreground shadow-soft backdrop-blur">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-70" />
              <span className="relative inline-flex size-2 rounded-full bg-brand" />
            </span>
            {t("hero.badge")}
          </span>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-balance sm:text-6xl lg:text-[4.1rem] lg:leading-[1.05]">
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

        <div className="relative">
          <div className="bg-gradient-brand absolute -inset-6 -z-10 rounded-[2.5rem] opacity-15 blur-3xl" />
          <div className="glass-panel rounded-3xl p-5 shadow-elegant sm:p-7">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{t("hero.panelTitle")}</p>
                <p className="truncate text-xs text-muted-foreground">{t("hero.panelSubtitle")}</p>
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
      </div>
    </section>
  );
}