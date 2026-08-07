import { createFileRoute } from "@tanstack/react-router";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { About } from "@/components/sections/about";
import { Contact } from "@/components/sections/contact";
import { Experience } from "@/components/sections/experience";
import { Hero } from "@/components/sections/hero";
import { Process } from "@/components/sections/process";
import { Projects } from "@/components/sections/projects";
import { Services } from "@/components/sections/services";
import { Skills } from "@/components/sections/skills";

const TITLE_EN = "Ghadeer Dawwas — Data Analyst & Software Developer";
const DESC_EN =
  "Bilingual portfolio of Ghadeer Dawwas: interactive dashboards, business intelligence, data analysis and modern web development.";
const TITLE_AR = "غدير دواس — محللة بيانات ومطورة برمجيات";
const DESC_AR =
  "الموقع الشخصي لغدير دواس: لوحات معلومات تفاعلية وذكاء أعمال وتحليل بيانات وتطوير ويب حديث.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE_EN },
      { name: "description", content: DESC_EN },
      { property: "og:title", content: TITLE_EN },
      { property: "og:description", content: DESC_EN },
      { property: "og:url", content: "/" },
      { property: "og:locale", content: "en_US" },
      { property: "og:locale:alternate", content: "ar_AR" },
      { name: "twitter:title", content: TITLE_EN },
      { name: "twitter:description", content: DESC_EN },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          name: "Ghadeer Dawwas",
          alternateName: "غدير دواس",
          jobTitle: "Data Analyst & Software Developer",
          description: DESC_EN,
          knowsLanguage: ["en", "ar"],
          knowsAbout: [
            "Data Analysis",
            "Business Intelligence",
            "Power BI",
            "Tableau",
            "SQL",
            "Web Development",
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: TITLE_AR,
          description: DESC_AR,
          inLanguage: ["en", "ar"],
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Skills />
        <Services />
        <Projects />
        <Experience />
        <Process />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
