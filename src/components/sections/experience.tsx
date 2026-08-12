import { Building2, CalendarDays } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { useI18n } from "@/i18n";
import { supabase } from "@/lib/supabase";

type ExperienceRow = {
  id: string;
  role_en: string | null;
  role_ar: string | null;
  organization_en: string | null;
  organization_ar: string | null;
  description_en: string | null;
  description_ar: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean | null;
  technologies: string[] | string | null;
  display_order: number | null;
  is_active: boolean | null;
};

function formatDate(value: string | null, language: string) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(language === "ar" ? "ar" : "en", {
    year: "numeric",
    month: "short",
  }).format(date);
}

function getTechnologies(value: ExperienceRow["technologies"]): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => item.trim()).filter(Boolean);
  }

  if (!value) return [];

  return value
    .trim()
    .replace(/^\{|\}$/g, "")
    .split(",")
    .map((item) => item.replace(/^["']|["']$/g, "").trim())
    .filter(Boolean);
}

export function Experience() {
  const { t, language } = useI18n();
  const [experiences, setExperiences] = useState<ExperienceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadExperiences = async () => {
      setLoading(true);
      setLoadError(false);

      const { data, error } = await supabase
        .from("experiences")
        .select(
          "id,role_en,role_ar,organization_en,organization_ar,description_en,description_ar,start_date,end_date,is_current,technologies,display_order,is_active",
        )
        .eq("is_active", true)
        .order("display_order", { ascending: true })
        .order("start_date", { ascending: false });

      if (!mounted) return;

      if (error) {
        console.error("Unable to load experiences:", error);
        setExperiences([]);
        setLoadError(true);
      } else {
        setExperiences((data as ExperienceRow[]) ?? []);
      }

      setLoading(false);
    };

    void loadExperiences();

    return () => {
      mounted = false;
    };
  }, []);

  const visibleExperiences = useMemo(
    () =>
      experiences.filter(
        (item) =>
          Boolean(item.role_ar?.trim() || item.role_en?.trim()) &&
          Boolean(item.organization_ar?.trim() || item.organization_en?.trim()),
      ),
    [experiences],
  );

  return (
    <section id="experience" className="scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t("experience.eyebrow")}
          title={t("experience.title")}
          subtitle={t("experience.subtitle")}
          align="center"
        />

        {loading ? (
          <p className="mt-14 text-center text-sm text-muted-foreground">
            {language === "ar" ? "جارٍ تحميل الخبرات…" : "Loading experiences…"}
          </p>
        ) : loadError ? (
          <p className="mt-14 text-center text-sm text-destructive">
            {language === "ar"
              ? "تعذر تحميل الخبرات. يرجى المحاولة مرة أخرى."
              : "Unable to load experiences. Please try again."}
          </p>
        ) : visibleExperiences.length === 0 ? (
          <p className="mt-14 text-center text-sm text-muted-foreground">
            {language === "ar"
              ? "لا توجد خبرات متاحة حاليًا."
              : "No experiences are available right now."}
          </p>
        ) : (
          <ol className="relative mt-14 space-y-6 border-s-2 border-border ps-6 sm:ps-10">
            {visibleExperiences.map((item, index) => {
              const role =
                language === "ar"
                  ? item.role_ar || item.role_en || ""
                  : item.role_en || item.role_ar || "";

              const organization =
                language === "ar"
                  ? item.organization_ar || item.organization_en || ""
                  : item.organization_en || item.organization_ar || "";

              const description =
                language === "ar"
                  ? item.description_ar || item.description_en || ""
                  : item.description_en || item.description_ar || "";

              const startDate = formatDate(item.start_date, language);
              const endDate = item.is_current
                ? language === "ar"
                  ? "حتى الآن"
                  : "Present"
                : formatDate(item.end_date, language);

              const dateText = [startDate, endDate].filter(Boolean).join(" — ");
              const technologies = getTechnologies(item.technologies);

              return (
                <Reveal key={item.id} delay={index * 110} as="li">
                  <span className="absolute start-0 size-3.5 -translate-x-1/2 rounded-full bg-gradient-brand ring-4 ring-background rtl:translate-x-1/2" />

                  <article className="card-hover rounded-3xl border border-border bg-card p-6 text-start shadow-soft sm:p-7">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h3 className="text-balance text-lg font-bold">{role}</h3>

                        <p className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-medium text-brand">
                          <Building2 className="size-4 shrink-0" />
                          <span>{organization}</span>
                        </p>
                      </div>

                      {dateText ? (
                        <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
                          <CalendarDays className="size-3.5" />
                          {dateText}
                        </span>
                      ) : null}
                    </div>

                    {description ? (
                      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                        {description}
                      </p>
                    ) : null}

                    {technologies.length > 0 ? (
                      <ul className="mt-4 flex flex-wrap gap-1.5">
                        {technologies.map((tech) => (
                          <li
                            key={`${item.id}-${tech}`}
                            className="rounded-lg border border-border bg-surface px-2 py-1 text-[11px] font-semibold text-foreground/75"
                          >
                            {tech}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </article>
                </Reveal>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}