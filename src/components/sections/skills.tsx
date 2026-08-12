import {
  BarChart3,
  BriefcaseBusiness,
  Code2,
  Database,
  Layers3,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { useI18n } from "@/i18n";
import { supabase } from "@/lib/supabase";

type SkillRow = {
  id: string;
  name_en: string;
  name_ar: string;
  category: string;
  icon: string | null;
  display_order: number;
  is_active: boolean;
};

export function Skills() {
  const { t, language } = useI18n();
  const [skills, setSkills] = useState<SkillRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSkills = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("skills")
        .select(
          "id,name_en,name_ar,category,icon,display_order,is_active",
        )
        .eq("is_active", true)
        .order("display_order", { ascending: true })
        .order("name_en", { ascending: true });

      if (error) {
        console.error("Unable to load public skills:", error);
        setSkills([]);
        setLoading(false);
        return;
      }

      setSkills((data as SkillRow[]) ?? []);
      setLoading(false);
    };

    void loadSkills();
  }, []);

  const groups = useMemo(
    () => [
      {
        id: "data-analysis",
        title: language === "ar" ? "تحليل البيانات" : "Data Analysis",
        Icon: BarChart3,
      },
      {
        id: "business-intelligence",
        title: language === "ar" ? "ذكاء الأعمال" : "Business Intelligence",
        Icon: BriefcaseBusiness,
      },
      {
        id: "database",
        title: language === "ar" ? "قواعد البيانات" : "Databases",
        Icon: Database,
      },
      {
        id: "development",
        title: language === "ar" ? "التطوير" : "Development",
        Icon: Code2,
      },
      {
        id: "other",
        title: language === "ar" ? "مهارات أخرى" : "Other Skills",
        Icon: Layers3,
      },
    ],
    [language],
  );

  const visibleGroups = groups.filter((group) =>
    skills.some((skill) => skill.category === group.id),
  );

  return (
    <section
      id="skills"
      className="scroll-mt-24 bg-secondary/40 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t("skills.eyebrow")}
          title={t("skills.title")}
          subtitle={t("skills.subtitle")}
          align="center"
        />

        {loading ? (
          <div className="mt-14 text-center text-sm text-muted-foreground">
            {language === "ar"
              ? "جارٍ تحميل المهارات…"
              : "Loading skills…"}
          </div>
        ) : visibleGroups.length === 0 ? (
          <div className="mt-14 text-center text-sm text-muted-foreground">
            {language === "ar"
              ? "لا توجد مهارات متاحة حاليًا."
              : "No skills are available right now."}
          </div>
        ) : (
          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visibleGroups.map((group, gi) => (
              <Reveal key={group.id} delay={gi * 120}>
                <div className="h-full rounded-3xl border border-border bg-card p-7 shadow-soft">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="bg-gradient-brand grid size-11 shrink-0 place-items-center rounded-xl text-primary-foreground">
                      <group.Icon className="size-5" />
                    </span>
                    <h3 className="text-balance text-lg font-bold">
                      {group.title}
                    </h3>
                  </div>

                  <ul className="mt-6 flex flex-wrap gap-2.5">
                    {skills
                      .filter((skill) => skill.category === group.id)
                      .map((skill) => (
                        <li
                          key={skill.id}
                          className="rounded-xl border border-border bg-surface px-3.5 py-2 text-sm font-medium text-foreground/85 transition-all hover:-translate-y-0.5 hover:border-brand/60 hover:text-brand hover:shadow-soft"
                        >
                          {language === "ar"
                            ? skill.name_ar
                            : skill.name_en}
                        </li>
                      ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}