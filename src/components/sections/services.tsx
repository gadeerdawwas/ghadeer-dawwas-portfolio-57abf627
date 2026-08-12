import {
  BarChart3,
  Brain,
  Code2,
  LayoutDashboard,
  Puzzle,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { useI18n } from "@/i18n";
import { supabase } from "@/lib/supabase";

const ICONS: Record<string, LucideIcon> = {
  BarChart3,
  LayoutDashboard,
  Sparkles,
  Brain,
  Code2,
  Puzzle,
};

type ServiceRow = {
  id: string;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  icon: string | null;
  display_order: number;
  is_active: boolean;
};

export function Services() {
  const { t, language } = useI18n();
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadServices = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("services")
        .select(
          "id,title_en,title_ar,description_en,description_ar,icon,display_order,is_active",
        )
        .eq("is_active", true)
        .order("display_order", { ascending: true })
        .order("title_en", { ascending: true });

      if (error) {
        console.error("Unable to load services:", error);
        setServices([]);
        setLoading(false);
        return;
      }

      setServices((data as ServiceRow[]) ?? []);
      setLoading(false);
    };

    void loadServices();
  }, []);

  return (
    <section id="services" className="scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t("services.eyebrow")}
          title={t("services.title")}
          subtitle={t("services.subtitle")}
          align="center"
        />

        {loading ? (
          <div className="mt-14 text-center text-sm text-muted-foreground">
            {language === "ar"
              ? "جارٍ تحميل الخدمات…"
              : "Loading services…"}
          </div>
        ) : services.length === 0 ? (
          <div className="mt-14 text-center text-sm text-muted-foreground">
            {language === "ar"
              ? "لا توجد خدمات متاحة حاليًا."
              : "No services are available right now."}
          </div>
        ) : (
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => {
              const Icon = ICONS[service.icon ?? ""] ?? Sparkles;
              const title =
                language === "ar" ? service.title_ar : service.title_en;
              const description =
                language === "ar"
                  ? service.description_ar
                  : service.description_en;

              return (
                <Reveal key={service.id} delay={(i % 3) * 90}>
                  <article className="card-hover group relative h-full overflow-hidden rounded-3xl border border-border bg-card p-7 text-start shadow-soft">
                    <div className="bg-gradient-brand absolute inset-x-0 top-0 h-0.5 scale-x-0 transition-transform duration-500 group-hover:scale-x-100" />

                    <span className="grid size-12 place-items-center rounded-2xl border border-brand/25 bg-accent/60 text-brand">
                      <Icon className="size-5" />
                    </span>

                    <h3 className="mt-5 text-lg font-bold text-balance">
                      {title}
                    </h3>

                    <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                      {description}
                    </p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}