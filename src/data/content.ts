/**
 * Bilingual content layer.
 *
 * Every record mirrors the future Lovable Cloud table shape: one row per item
 * with `*_en` / `*_ar` columns (never separate tables per language).
 * Swapping these constants for a database query later requires no UI changes.
 */
import projectEcommerce from "@/assets/project-ecommerce.jpg";
import projectSales from "@/assets/project-sales.jpg";
import projectBank from "@/assets/project-bank.jpg";
import projectFlight from "@/assets/project-flight.jpg";
import projectWeb from "@/assets/project-web.jpg";

export type ProjectCategory = "powerbi" | "tableau" | "excel" | "sql" | "web";

export type ProjectRow = {
  id: string;
  slug: string;
  title_en: string;
  title_ar: string;
  short_description_en: string;
  short_description_ar: string;
  description_en: string;
  description_ar: string;
  problem_en: string;
  problem_ar: string;
  dataset_en: string;
  dataset_ar: string;
  process_en: string[];
  process_ar: string[];
  insights_en: string[];
  insights_ar: string[];
  results_en: string;
  results_ar: string;
  categories: ProjectCategory[];
  tools: string[];
  thumbnail: string;
  gallery: string[];
  featured: boolean;
  github_url?: string;
  live_url?: string;
};

export const projects: ProjectRow[] = [
  {
    id: "1",
    slug: "ecommerce-sales-dashboard",
    title_en: "E-commerce Sales Dashboard",
    title_ar: "لوحة تحليل مبيعات التجارة الإلكترونية",
    short_description_en:
      "Interactive dashboard analyzing sales performance, customers, products, profit, and geographic trends.",
    short_description_ar:
      "لوحة معلومات تفاعلية لتحليل أداء المبيعات والعملاء والمنتجات والأرباح والاتجاهات الجغرافية.",
    description_en:
      "A complete retail analytics workspace connecting orders, customers and products into one interactive view, allowing the team to explore performance by region, category and time period.",
    description_ar:
      "مساحة تحليلية متكاملة للتجزئة تربط الطلبات والعملاء والمنتجات في عرض تفاعلي واحد، ما يتيح للفريق استكشاف الأداء حسب المنطقة والفئة والفترة الزمنية.",
    problem_en:
      "Sales data was scattered across spreadsheets, making it impossible to see which products and regions actually drove profit.",
    problem_ar:
      "كانت بيانات المبيعات موزعة على جداول متفرقة، ما جعل من المستحيل معرفة المنتجات والمناطق التي تحقق الربح فعليًا.",
    dataset_en: "Retail orders dataset: ~10K transactions, customers, products, regions and returns.",
    dataset_ar: "مجموعة بيانات مبيعات التجزئة: نحو 10 آلاف عملية، مع العملاء والمنتجات والمناطق والمرتجعات.",
    process_en: [
      "Cleaned and standardized transaction and customer tables.",
      "Modeled relationships between orders, products and geography.",
      "Designed KPI cards and drill-down visuals for profit analysis.",
    ],
    process_ar: [
      "تنظيف وتوحيد جداول العمليات والعملاء.",
      "بناء العلاقات بين الطلبات والمنتجات والمناطق الجغرافية.",
      "تصميم بطاقات المؤشرات والرسوم التفصيلية لتحليل الأرباح.",
    ],
    insights_en: [
      "Three regions generated 62% of total profit.",
      "Discounts above 20% turned several categories unprofitable.",
      "Repeat customers delivered a materially higher average order value.",
    ],
    insights_ar: [
      "ثلاث مناطق حققت 62% من إجمالي الأرباح.",
      "الخصومات فوق 20% جعلت عدة فئات غير مربحة.",
      "العملاء المتكررون حققوا متوسط قيمة طلب أعلى بوضوح.",
    ],
    results_en:
      "The team replaced weekly manual reporting with a single dashboard and refocused promotions on profitable categories.",
    results_ar:
      "استبدل الفريق التقارير اليدوية الأسبوعية بلوحة واحدة، وأعاد توجيه العروض نحو الفئات المربحة.",
    categories: ["tableau", "excel"],
    tools: ["Tableau", "Excel"],
    thumbnail: projectEcommerce,
    gallery: [projectEcommerce, projectSales],
    featured: true,
  },
  {
    id: "2",
    slug: "sales-performance-dashboard",
    title_en: "Sales Performance Dashboard",
    title_ar: "لوحة تحليل أداء المبيعات",
    short_description_en:
      "Power BI dashboard tracking targets, growth and team performance with DAX measures.",
    short_description_ar:
      "لوحة Power BI لمتابعة الأهداف والنمو وأداء الفريق باستخدام مقاييس DAX.",
    description_en:
      "A performance monitoring model built on Power Query transformations and DAX measures, comparing actuals against targets across periods and sales representatives.",
    description_ar:
      "نموذج لمتابعة الأداء مبني على تحويلات Power Query ومقاييس DAX، يقارن النتائج الفعلية بالأهداف عبر الفترات ومندوبي المبيعات.",
    problem_en: "Management had no reliable view of target achievement per period and per representative.",
    problem_ar: "لم يكن لدى الإدارة رؤية موثوقة لتحقيق الأهداف لكل فترة ولكل مندوب.",
    dataset_en: "Monthly sales transactions, targets table and product hierarchy.",
    dataset_ar: "عمليات المبيعات الشهرية وجدول الأهداف والتسلسل الهرمي للمنتجات.",
    process_en: [
      "Shaped and merged sources in Power Query.",
      "Built a star schema with a dedicated date table.",
      "Wrote DAX measures for YoY growth and target attainment.",
    ],
    process_ar: [
      "تشكيل ودمج المصادر في Power Query.",
      "بناء نموذج نجمي مع جدول تاريخ مخصص.",
      "كتابة مقاييس DAX لنمو السنة مقابل السنة وتحقيق الأهداف.",
    ],
    insights_en: [
      "Q4 consistently outperformed targets by double digits.",
      "Two product lines accounted for most of the growth.",
    ],
    insights_ar: [
      "الربع الرابع تجاوز الأهداف باستمرار بنسب مضاعفة.",
      "خطّا منتجات اثنان شكّلا معظم النمو.",
    ],
    results_en: "Monthly reporting time dropped dramatically with an always-current refreshable model.",
    results_ar: "انخفض وقت إعداد التقارير الشهرية بشكل كبير بفضل نموذج قابل للتحديث دائمًا.",
    categories: ["powerbi", "excel"],
    tools: ["Power BI", "Power Query", "DAX"],
    thumbnail: projectSales,
    gallery: [projectSales],
    featured: true,
  },
  {
    id: "3",
    slug: "bank-marketing-analysis",
    title_en: "Bank Marketing Analysis",
    title_ar: "تحليل حملات التسويق البنكي",
    short_description_en:
      "SQL and Tableau analysis of campaign effectiveness and customer conversion drivers.",
    short_description_ar:
      "تحليل بلغة SQL وTableau لفعالية الحملات والعوامل المؤثرة في تحويل العملاء.",
    description_en:
      "Segmentation and conversion analysis of a bank marketing campaign, identifying which customer profiles and contact strategies produced subscriptions.",
    description_ar:
      "تحليل تقسيمي وتحويلي لحملة تسويق بنكية، لتحديد شرائح العملاء واستراتيجيات التواصل التي حققت اشتراكات.",
    problem_en: "Campaign spend was spread evenly across segments with very different response rates.",
    problem_ar: "كان إنفاق الحملة موزعًا بالتساوي على شرائح تختلف كثيرًا في معدلات الاستجابة.",
    dataset_en: "Bank marketing dataset with ~45K contacts, demographics and campaign outcomes.",
    dataset_ar: "مجموعة بيانات تسويق بنكي تضم نحو 45 ألف اتصال مع البيانات الديموغرافية ونتائج الحملة.",
    process_en: [
      "Wrote SQL queries for segmentation and conversion rates.",
      "Validated data quality and handled unknown categories.",
      "Visualized funnel and segment performance in Tableau.",
    ],
    process_ar: [
      "كتابة استعلامات SQL لتحليل الشرائح ومعدلات التحويل.",
      "التحقق من جودة البيانات ومعالجة الفئات غير المعروفة.",
      "تصوير القمع وأداء الشرائح في Tableau.",
    ],
    insights_en: [
      "Call duration was the strongest single predictor of subscription.",
      "A small set of segments produced most successful conversions.",
    ],
    insights_ar: [
      "مدة المكالمة كانت أقوى مؤشر منفرد على الاشتراك.",
      "عدد محدود من الشرائح حقق معظم التحويلات الناجحة.",
    ],
    results_en: "Recommended reallocating outreach toward high-response segments.",
    results_ar: "تمت التوصية بإعادة توجيه جهود التواصل نحو الشرائح عالية الاستجابة.",
    categories: ["sql", "tableau", "excel"],
    tools: ["SQL", "Tableau", "Excel"],
    thumbnail: projectBank,
    gallery: [projectBank],
    featured: true,
  },
  {
    id: "4",
    slug: "flight-performance-analysis",
    title_en: "Flight Performance Analysis",
    title_ar: "تحليل أداء الرحلات الجوية",
    short_description_en:
      "Power BI report exploring delays, routes and on-time performance across airlines.",
    short_description_ar:
      "تقرير Power BI لاستكشاف التأخيرات والمسارات والالتزام بالمواعيد بين شركات الطيران.",
    description_en:
      "An operational report highlighting delay causes by route, carrier and time of day, with drill-through detail per airport.",
    description_ar:
      "تقرير تشغيلي يبرز أسباب التأخير حسب المسار وشركة الطيران ووقت اليوم، مع تفاصيل تفصيلية لكل مطار.",
    problem_en: "Delay reporting was descriptive only and did not point to operational causes.",
    problem_ar: "كانت تقارير التأخير وصفية فقط ولا تشير إلى الأسباب التشغيلية.",
    dataset_en: "Flight operations dataset with schedules, delays and airport metadata.",
    dataset_ar: "مجموعة بيانات عمليات الطيران تشمل الجداول والتأخيرات وبيانات المطارات.",
    process_en: [
      "Cleaned schedule and delay-cause fields.",
      "Created time intelligence and route hierarchies.",
      "Built drill-through pages per airport.",
    ],
    process_ar: [
      "تنظيف حقول الجداول وأسباب التأخير.",
      "إنشاء ذكاء زمني وتسلسل هرمي للمسارات.",
      "بناء صفحات تفصيلية لكل مطار.",
    ],
    insights_en: [
      "Late-afternoon departures carried the highest delay risk.",
      "A handful of routes drove a disproportionate share of delays.",
    ],
    insights_ar: [
      "رحلات ما بعد الظهر المتأخرة كانت الأعلى خطرًا للتأخير.",
      "عدد قليل من المسارات تسبب في نسبة كبيرة من التأخيرات.",
    ],
    results_en: "Gave operations a focused watchlist of routes and time slots.",
    results_ar: "منح فريق العمليات قائمة مراقبة مركّزة للمسارات والفترات الزمنية.",
    categories: ["powerbi"],
    tools: ["Power BI"],
    thumbnail: projectFlight,
    gallery: [projectFlight],
    featured: false,
  },
  {
    id: "5",
    slug: "web-application-project",
    title_en: "Web Application Project",
    title_ar: "مشروع تطبيق ويب",
    short_description_en:
      "Laravel web application with an admin panel, authentication and relational data management.",
    short_description_ar:
      "تطبيق ويب بـ Laravel يتضمن لوحة تحكم ونظام مصادقة وإدارة بيانات علائقية.",
    description_en:
      "A full-stack business application covering CRUD workflows, roles and reporting screens, built with Laravel, PHP and a relational SQL database.",
    description_ar:
      "تطبيق أعمال متكامل يغطي عمليات الإدارة والصلاحيات وشاشات التقارير، مبني باستخدام Laravel وPHP وقاعدة بيانات SQL علائقية.",
    problem_en: "Manual paper-based processes slowed down day-to-day operations.",
    problem_ar: "كانت العمليات اليدوية الورقية تبطئ سير العمل اليومي.",
    dataset_en: "Relational schema covering users, records, roles and activity logs.",
    dataset_ar: "مخطط علائقي يشمل المستخدمين والسجلات والصلاحيات وسجلات النشاط.",
    process_en: [
      "Designed the database schema and relationships.",
      "Implemented authentication and role-based access.",
      "Built responsive interfaces and reporting views.",
    ],
    process_ar: [
      "تصميم مخطط قاعدة البيانات والعلاقات.",
      "تنفيذ المصادقة والصلاحيات حسب الأدوار.",
      "بناء واجهات متجاوبة وشاشات تقارير.",
    ],
    insights_en: [
      "Centralized records removed duplicate manual entry.",
      "Role-based access simplified day-to-day administration.",
    ],
    insights_ar: [
      "توحيد السجلات ألغى الإدخال اليدوي المكرر.",
      "الصلاحيات حسب الأدوار بسّطت الإدارة اليومية.",
    ],
    results_en: "Delivered a maintainable application ready for future feature growth.",
    results_ar: "تسليم تطبيق قابل للصيانة وجاهز لإضافة مزايا مستقبلية.",
    categories: ["web", "sql"],
    tools: ["Laravel", "PHP", "SQL"],
    thumbnail: projectWeb,
    gallery: [projectWeb],
    featured: true,
  },
];

export type ServiceRow = {
  id: string;
  icon: string;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
};

export const services: ServiceRow[] = [
  {
    id: "1",
    icon: "BarChart3",
    name_en: "Data Analysis",
    name_ar: "تحليل البيانات",
    description_en: "Analyze business data to discover trends, patterns, and actionable insights.",
    description_ar:
      "تحليل بيانات الأعمال لاكتشاف الاتجاهات والأنماط واستخراج رؤى تساعد في اتخاذ القرارات.",
  },
  {
    id: "2",
    icon: "LayoutDashboard",
    name_en: "Interactive Dashboards",
    name_ar: "لوحات معلومات تفاعلية",
    description_en: "Build professional dashboards using Power BI, Tableau, and Excel.",
    description_ar: "إنشاء لوحات معلومات احترافية وتفاعلية باستخدام Power BI وTableau وExcel.",
  },
  {
    id: "3",
    icon: "Sparkles",
    name_en: "Data Cleaning & Preparation",
    name_ar: "تنظيف وتجهيز البيانات",
    description_en:
      "Turn messy, inconsistent sources into reliable, analysis-ready datasets.",
    description_ar: "تحويل المصادر غير المنظمة وغير المتسقة إلى بيانات موثوقة وجاهزة للتحليل.",
  },
  {
    id: "4",
    icon: "Brain",
    name_en: "Business Intelligence",
    name_ar: "ذكاء الأعمال",
    description_en:
      "Define KPIs and reporting models that keep decision makers aligned on what matters.",
    description_ar:
      "تحديد مؤشرات الأداء ونماذج التقارير التي تُبقي صنّاع القرار متفقين على ما يهم فعلًا.",
  },
  {
    id: "5",
    icon: "Code2",
    name_en: "Web Development",
    name_ar: "تطوير مواقع الويب",
    description_en:
      "Design and build modern, responsive websites and web applications.",
    description_ar: "تصميم وبناء مواقع وتطبيقات ويب حديثة ومتجاوبة مع جميع الأجهزة.",
  },
  {
    id: "6",
    icon: "Puzzle",
    name_en: "Custom Business Solutions",
    name_ar: "حلول أعمال مخصصة",
    description_en:
      "Tailored tools that connect your data, your workflow, and your business goals.",
    description_ar: "أدوات مخصصة تربط بياناتك بسير عملك وأهداف مشروعك.",
  },
];

export type ExperienceRow = {
  id: string;
  role_en: string;
  role_ar: string;
  organization_en: string;
  organization_ar: string;
  date_en: string;
  date_ar: string;
  description_en: string;
  description_ar: string;
  technologies: string[];
};

export const experiences: ExperienceRow[] = [
  {
    id: "1",
    role_en: "Data Analytics Training",
    role_ar: "تدريب تحليل البيانات",
    organization_en: "Professional Analytics Program",
    organization_ar: "برنامج تحليل بيانات احترافي",
    date_en: "2024 — 2025",
    date_ar: "2024 — 2025",
    description_en:
      "Intensive hands-on training in data cleaning, SQL querying, dashboard design and business intelligence storytelling.",
    description_ar:
      "تدريب مكثف عملي على تنظيف البيانات واستعلامات SQL وتصميم لوحات المعلومات وسرد رؤى ذكاء الأعمال.",
    technologies: ["Excel", "SQL", "Power BI", "Tableau"],
  },
  {
    id: "2",
    role_en: "Software Development",
    role_ar: "تطوير البرمجيات",
    organization_en: "Software Engineering Projects",
    organization_ar: "مشاريع هندسة البرمجيات",
    date_en: "2023 — 2025",
    date_ar: "2023 — 2025",
    description_en:
      "Built full-stack web applications with Laravel and modern front-end tooling, from database schema to responsive interfaces.",
    description_ar:
      "بناء تطبيقات ويب متكاملة باستخدام Laravel وأدوات واجهات حديثة، من مخطط قاعدة البيانات حتى الواجهات المتجاوبة.",
    technologies: ["PHP", "Laravel", "SQL", "React", "Tailwind CSS"],
  },
  {
    id: "3",
    role_en: "Freelance Projects",
    role_ar: "مشاريع العمل الحر",
    organization_en: "Independent Clients",
    organization_ar: "عملاء مستقلون",
    date_en: "2024 — Present",
    date_ar: "2024 — حتى الآن",
    description_en:
      "Delivering dashboards, analytical reports and web solutions for clients who need clarity from their data.",
    description_ar:
      "تسليم لوحات معلومات وتقارير تحليلية وحلول ويب لعملاء يبحثون عن وضوح حقيقي في بياناتهم.",
    technologies: ["Power BI", "Excel", "SQL", "Web"],
  },
];

export type ProcessRow = {
  id: string;
  icon: string;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
};

export const processSteps: ProcessRow[] = [
  {
    id: "1",
    icon: "Search",
    name_en: "Understand",
    name_ar: "الفهم",
    description_en: "Understand the client's goals, business problem, and available data.",
    description_ar: "فهم أهداف العميل ومشكلة العمل والبيانات المتاحة.",
  },
  {
    id: "2",
    icon: "LineChart",
    name_en: "Analyze",
    name_ar: "التحليل",
    description_en: "Clean and explore data to identify trends and opportunities.",
    description_ar: "تنظيف البيانات واستكشافها لاكتشاف الاتجاهات والفرص.",
  },
  {
    id: "3",
    icon: "Hammer",
    name_en: "Build",
    name_ar: "التنفيذ",
    description_en: "Create dashboards, reports, or digital solutions.",
    description_ar: "إنشاء لوحات المعلومات والتقارير أو الحلول الرقمية.",
  },
  {
    id: "4",
    icon: "PackageCheck",
    name_en: "Deliver",
    name_ar: "التسليم",
    description_en: "Present clear insights and provide a polished final solution.",
    description_ar: "تقديم النتائج بصورة واضحة وتسليم حل احترافي جاهز للاستخدام.",
  },
];

export type SkillRow = {
  id: string;
  /** Fixed technology names stay identical in both languages. */
  name?: string;
  /** Descriptive skills resolve through the translation layer. */
  key?: string;
  category: "data" | "development";
};

export const skills: SkillRow[] = [
  { id: "1", name: "Excel", category: "data" },
  { id: "2", name: "SQL", category: "data" },
  { id: "3", name: "Power BI", category: "data" },
  { id: "4", name: "Tableau", category: "data" },
  { id: "5", name: "Power Query", category: "data" },
  { id: "6", name: "DAX", category: "data" },
  { id: "7", key: "skills.items.dataCleaning", category: "data" },
  { id: "8", key: "skills.items.dataVisualization", category: "data" },
  { id: "9", key: "skills.items.kpiAnalysis", category: "data" },
  { id: "10", key: "skills.items.dashboardDesign", category: "data" },
  { id: "11", name: "PHP", category: "development" },
  { id: "12", name: "Laravel", category: "development" },
  { id: "13", name: "SQL", category: "development" },
  { id: "14", name: "HTML", category: "development" },
  { id: "15", name: "CSS", category: "development" },
  { id: "16", name: "JavaScript", category: "development" },
  { id: "17", name: "React", category: "development" },
  { id: "18", name: "Tailwind CSS", category: "development" },
];

export const siteSettings = {
  initials: "GD",
  email: "gadeerdawwas98@gmail.com",
  linkedin: "https://www.linkedin.com/in/ghadeer-dawwas-484262167/",
  github: "https://github.com/gadeerdawwas/ghadeer-dawwas-portfolio-57abf627",
  cvUrl: "#",
};

export const sectionIds = [
  "home",
  "about",
  "skills",
  "services",
  "projects",
  "experience",
  "process",
  "contact",
] as const;

export type SectionId = (typeof sectionIds)[number];